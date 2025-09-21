const axios = require('axios');
const crypto = require('crypto');
const logger = require('../config/logger');

// Payment Gateway Configuration
const PAYMENT_GATEWAYS = {
  BKASH: {
    name: 'bKash',
    baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.pay.bka.sh/v1.2.0-beta',
    appKey: process.env.BKASH_APP_KEY,
    appSecret: process.env.BKASH_APP_SECRET,
    username: process.env.BKASH_USERNAME,
    password: process.env.BKASH_PASSWORD,
    callbackUrl: process.env.BKASH_CALLBACK_URL
  },
  NAGAD: {
    name: 'Nagad',
    baseUrl: process.env.NAGAD_BASE_URL || 'https://api.mynagad.com',
    merchantId: process.env.NAGAD_MERCHANT_ID,
    merchantKey: process.env.NAGAD_MERCHANT_KEY,
    callbackUrl: process.env.NAGAD_CALLBACK_URL
  },
  ROCKET: {
    name: 'Rocket',
    baseUrl: process.env.ROCKET_BASE_URL || 'https://api.rocket.com.bd',
    merchantId: process.env.ROCKET_MERCHANT_ID,
    merchantKey: process.env.ROCKET_MERCHANT_KEY,
    callbackUrl: process.env.ROCKET_CALLBACK_URL
  },
  UPAY: {
    name: 'Upay',
    baseUrl: process.env.UPAY_BASE_URL || 'https://api.upay.com.bd',
    merchantId: process.env.UPAY_MERCHANT_ID,
    merchantKey: process.env.UPAY_MERCHANT_KEY,
    callbackUrl: process.env.UPAY_CALLBACK_URL
  }
};

// Bank Configuration
const BANKS = {
  ISLAMI_BANK: {
    name: 'Islami Bank Bangladesh Limited',
    code: 'IBBL',
    swiftCode: 'IBBLBDDH',
    routingNumber: '125260101'
  },
  CITY_BANK: {
    name: 'City Bank Limited',
    code: 'CBL',
    swiftCode: 'CIBLBDDH',
    routingNumber: '225260103'
  },
  BRAC_BANK: {
    name: 'BRAC Bank Limited',
    code: 'BBL',
    swiftCode: 'BRACBDDH',
    routingNumber: '060260101'
  }
};

class PaymentGatewayService {
  constructor() {
    this.tokens = {};
  }

  // Generate signature for secure API calls
  generateSignature(data, secret) {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
  }

  // bKash Integration
  async getBkashToken() {
    try {
      if (this.tokens.bkash && this.tokens.bkash.expires > Date.now()) {
        return this.tokens.bkash.token;
      }

      const config = PAYMENT_GATEWAYS.BKASH;
      const response = await axios.post(`${config.baseUrl}/tokenized/checkout/token/grant`, {
        app_key: config.appKey,
        app_secret: config.appSecret
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': config.username,
          'password': config.password
        }
      });

      if (response.data.statusCode === '0000') {
        this.tokens.bkash = {
          token: response.data.id_token,
          expires: Date.now() + (3600 * 1000) // 1 hour
        };
        return response.data.id_token;
      }

      throw new Error('Failed to get bKash token');
    } catch (error) {
      logger.error('bKash token error:', error);
      throw error;
    }
  }

  async createBkashPayment(amount, orderId, userId) {
    try {
      const token = await this.getBkashToken();
      const config = PAYMENT_GATEWAYS.BKASH;

      const response = await axios.post(`${config.baseUrl}/tokenized/checkout/create`, {
        mode: '0011',
        payerReference: userId,
        callbackURL: config.callbackUrl,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: orderId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': config.appKey
        }
      });

      return {
        success: true,
        paymentId: response.data.paymentID,
        bkashURL: response.data.bkashURL,
        callbackURL: response.data.callbackURL,
        successCallbackURL: response.data.successCallbackURL,
        failureCallbackURL: response.data.failureCallbackURL,
        cancelledCallbackURL: response.data.cancelledCallbackURL
      };
    } catch (error) {
      logger.error('bKash payment creation error:', error);
      throw error;
    }
  }

  async executeBkashPayment(paymentId) {
    try {
      const token = await this.getBkashToken();
      const config = PAYMENT_GATEWAYS.BKASH;

      const response = await axios.post(`${config.baseUrl}/tokenized/checkout/execute`, {
        paymentID: paymentId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': token,
          'x-app-key': config.appKey
        }
      });

      return {
        success: response.data.statusCode === '0000',
        transactionId: response.data.trxID,
        paymentId: response.data.paymentID,
        amount: response.data.amount,
        currency: response.data.currency,
        intent: response.data.intent,
        paymentExecuteTime: response.data.paymentExecuteTime
      };
    } catch (error) {
      logger.error('bKash payment execution error:', error);
      throw error;
    }
  }

  // Nagad Integration
  async createNagadPayment(amount, orderId, userId) {
    try {
      const config = PAYMENT_GATEWAYS.NAGAD;
      const timestamp = Date.now();
      
      const paymentData = {
        merchantId: config.merchantId,
        orderId: orderId,
        amount: amount,
        currency: 'BDT',
        challenge: crypto.randomBytes(16).toString('hex')
      };

      const signature = this.generateSignature(paymentData, config.merchantKey);

      const response = await axios.post(`${config.baseUrl}/remote-payment-gateway-1.0/api/dfs/check-out/initialize/${config.merchantId}/${orderId}`, {
        ...paymentData,
        signature: signature,
        callbackUrl: config.callbackUrl
      });

      return {
        success: true,
        paymentReferenceId: response.data.paymentReferenceId,
        challenge: response.data.challenge,
        redirectUrl: response.data.callBackUrl
      };
    } catch (error) {
      logger.error('Nagad payment creation error:', error);
      throw error;
    }
  }

  // Rocket Integration
  async createRocketPayment(amount, orderId, userId) {
    try {
      const config = PAYMENT_GATEWAYS.ROCKET;
      
      const paymentData = {
        merchant_id: config.merchantId,
        order_id: orderId,
        amount: amount,
        currency: 'BDT',
        customer_id: userId,
        callback_url: config.callbackUrl
      };

      const signature = this.generateSignature(paymentData, config.merchantKey);

      const response = await axios.post(`${config.baseUrl}/payment/create`, {
        ...paymentData,
        signature: signature
      });

      return {
        success: true,
        paymentId: response.data.payment_id,
        redirectUrl: response.data.redirect_url
      };
    } catch (error) {
      logger.error('Rocket payment creation error:', error);
      throw error;
    }
  }

  // Upay Integration
  async createUpayPayment(amount, orderId, userId) {
    try {
      const config = PAYMENT_GATEWAYS.UPAY;
      
      const paymentData = {
        merchant_id: config.merchantId,
        invoice_id: orderId,
        amount: amount,
        currency: 'BDT',
        customer_mobile: userId,
        callback_url: config.callbackUrl
      };

      const signature = this.generateSignature(paymentData, config.merchantKey);

      const response = await axios.post(`${config.baseUrl}/api/payment/create`, {
        ...paymentData,
        signature: signature
      });

      return {
        success: true,
        transactionId: response.data.transaction_id,
        paymentUrl: response.data.payment_url
      };
    } catch (error) {
      logger.error('Upay payment creation error:', error);
      throw error;
    }
  }

  // Generic payment method
  async createPayment(gateway, amount, orderId, userId, paymentType = 'auto') {
    try {
      let result;
      
      switch (gateway.toLowerCase()) {
        case 'bkash':
          result = await this.createBkashPayment(amount, orderId, userId);
          break;
        case 'nagad':
          result = await this.createNagadPayment(amount, orderId, userId);
          break;
        case 'rocket':
          result = await this.createRocketPayment(amount, orderId, userId);
          break;
        case 'upay':
          result = await this.createUpayPayment(amount, orderId, userId);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }

      // Log payment creation
      logger.info(`Payment created - Gateway: ${gateway}, Type: ${paymentType}, Amount: ${amount}, Order: ${orderId}`);
      
      return {
        ...result,
        gateway: gateway,
        paymentType: paymentType,
        orderId: orderId,
        amount: amount,
        currency: 'BDT'
      };
    } catch (error) {
      logger.error(`Payment creation failed - Gateway: ${gateway}`, error);
      throw error;
    }
  }

  // Verify payment callback
  async verifyPayment(gateway, paymentData) {
    try {
      switch (gateway.toLowerCase()) {
        case 'bkash':
          return await this.executeBkashPayment(paymentData.paymentID);
        case 'nagad':
          // Verify Nagad payment signature
          return this.verifyNagadPayment(paymentData);
        case 'rocket':
          return this.verifyRocketPayment(paymentData);
        case 'upay':
          return this.verifyUpayPayment(paymentData);
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error) {
      logger.error(`Payment verification failed - Gateway: ${gateway}`, error);
      throw error;
    }
  }

  verifyNagadPayment(paymentData) {
    const config = PAYMENT_GATEWAYS.NAGAD;
    const expectedSignature = this.generateSignature(paymentData, config.merchantKey);
    
    return {
      success: paymentData.signature === expectedSignature && paymentData.status === 'Success',
      transactionId: paymentData.payment_ref_id,
      amount: paymentData.amount,
      status: paymentData.status
    };
  }

  verifyRocketPayment(paymentData) {
    const config = PAYMENT_GATEWAYS.ROCKET;
    const expectedSignature = this.generateSignature(paymentData, config.merchantKey);
    
    return {
      success: paymentData.signature === expectedSignature && paymentData.status === 'completed',
      transactionId: paymentData.transaction_id,
      amount: paymentData.amount,
      status: paymentData.status
    };
  }

  verifyUpayPayment(paymentData) {
    const config = PAYMENT_GATEWAYS.UPAY;
    const expectedSignature = this.generateSignature(paymentData, config.merchantKey);
    
    return {
      success: paymentData.signature === expectedSignature && paymentData.status === 'success',
      transactionId: paymentData.transaction_id,
      amount: paymentData.amount,
      status: paymentData.status
    };
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return {
      mobileWallets: Object.keys(PAYMENT_GATEWAYS).map(key => ({
        code: key.toLowerCase(),
        name: PAYMENT_GATEWAYS[key].name,
        type: 'mobile_wallet'
      })),
      banks: Object.keys(BANKS).map(key => ({
        code: key.toLowerCase(),
        name: BANKS[key].name,
        bankCode: BANKS[key].code,
        swiftCode: BANKS[key].swiftCode,
        routingNumber: BANKS[key].routingNumber,
        type: 'bank'
      }))
    };
  }
}

module.exports = {
  PaymentGatewayService: new PaymentGatewayService(),
  PAYMENT_GATEWAYS,
  BANKS
};