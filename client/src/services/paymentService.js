import api from './api';

class PaymentService {
  // Process payment
  async processPayment(paymentData) {
    try {
      const response = await api.post('/payment/process', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create cash-in transaction
  async createCashIn(cashInData) {
    try {
      const response = await api.post('/cashin/create', cashInData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get cash-in history
  async getCashInHistory(params = {}) {
    try {
      const response = await api.get('/cashin/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await api.get('/payment/methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Check transaction status
  async checkTransactionStatus(transactionId) {
    try {
      const response = await api.get(`/transaction/status/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction history
  async getTransactionHistory(params = {}) {
    try {
      const response = await api.get('/transaction/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cancel transaction
  async cancelTransaction(transactionId) {
    try {
      const response = await api.post(`/transaction/cancel/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get exchange rates
  async getExchangeRates(baseCurrency = 'USD') {
    try {
      const response = await api.get(`/payment/exchange-rates?base=${baseCurrency}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Validate payment details
  async validatePaymentDetails(paymentData) {
    try {
      const response = await api.post('/payment/validate', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get payment fees
  async getPaymentFees(amount, currency, paymentMethod) {
    try {
      const response = await api.get('/payment/fees', {
        params: { amount, currency, paymentMethod }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Process refund
  async processRefund(transactionId, refundData) {
    try {
      const response = await api.post(`/payment/refund/${transactionId}`, refundData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get supported currencies
  async getSupportedCurrencies() {
    try {
      const response = await api.get('/payment/currencies');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create payment intent (for Stripe)
  async createPaymentIntent(paymentData) {
    try {
      const response = await api.post('/payment/create-intent', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Confirm payment
  async confirmPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await api.post('/payment/confirm', {
        paymentIntentId,
        paymentMethodId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get payment statistics
  async getPaymentStatistics(params = {}) {
    try {
      const response = await api.get('/payment/statistics', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;