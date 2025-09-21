const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { PaymentGatewayService } = require('../utils/paymentGateways');
const logger = require('../config/logger');

// Cash-in Types
const CASHIN_TYPES = {
  MERCHANT: 'merchant',
  AGENT: 'agent',
  PERSONAL: 'personal',
  BANK: 'bank'
};

// Payment Methods
const PAYMENT_METHODS = {
  BKASH: 'bkash',
  NAGAD: 'nagad',
  ROCKET: 'rocket',
  UPAY: 'upay'
};

// Banks
const BANKS = {
  ISLAMI_BANK: 'islami_bank',
  CITY_BANK: 'city_bank',
  BRAC_BANK: 'brac_bank'
};

// Get available payment methods
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const paymentMethods = PaymentGatewayService.getAvailablePaymentMethods();
    
    res.json({
      success: true,
      data: {
        ...paymentMethods,
        cashinTypes: [
          { code: 'merchant', name: 'Merchant Payment', description: 'Automated payment through merchant system' },
          { code: 'agent', name: 'Agent Payment', description: 'Manual payment through authorized agents' },
          { code: 'personal', name: 'Personal Payment', description: 'Manual payment from personal account' },
          { code: 'bank', name: 'Bank Transfer', description: 'Bank to bank transfer' }
        ]
      }
    });
  } catch (error) {
    logger.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods'
    });
  }
});

// Merchant Payment System (Automated)
router.post('/merchant', [
  auth,
  body('amount').isFloat({ min: 10 }).withMessage('Minimum amount is 10 BDT'),
  body('paymentMethod').isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method'),
  body('customerPhone').isMobilePhone('bn-BD').withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, customerPhone, description } = req.body;
    const userId = req.user.id;

    // Check user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Generate unique order ID
    const orderId = `CASHIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'cashin',
      subType: CASHIN_TYPES.MERCHANT,
      amount: parseFloat(amount),
      currency: 'BDT',
      status: 'pending',
      paymentMethod: paymentMethod.toUpperCase(),
      orderId,
      description: description || `Cash-in via ${paymentMethod.toUpperCase()} merchant`,
      metadata: {
        customerPhone,
        paymentGateway: paymentMethod,
        cashinType: CASHIN_TYPES.MERCHANT
      }
    });

    await transaction.save();

    // Create payment with gateway
    const paymentResult = await PaymentGatewayService.createPayment(
      paymentMethod,
      amount,
      orderId,
      customerPhone,
      CASHIN_TYPES.MERCHANT
    );

    // Update transaction with payment details
    transaction.metadata.paymentId = paymentResult.paymentId || paymentResult.paymentReferenceId || paymentResult.transactionId;
    transaction.metadata.gatewayResponse = paymentResult;
    await transaction.save();

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        transactionId: transaction._id,
        orderId,
        paymentUrl: paymentResult.bkashURL || paymentResult.redirectUrl || paymentResult.paymentUrl,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        expiresIn: 900 // 15 minutes
      }
    });

  } catch (error) {
    logger.error('Merchant cashin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
});

// Manual Agent Payment
router.post('/agent', [
  auth,
  body('amount').isFloat({ min: 10 }).withMessage('Minimum amount is 10 BDT'),
  body('paymentMethod').isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method'),
  body('agentPhone').isMobilePhone('bn-BD').withMessage('Invalid agent phone number'),
  body('customerPhone').isMobilePhone('bn-BD').withMessage('Invalid customer phone number'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, agentPhone, customerPhone, transactionId, description } = req.body;
    const userId = req.user.id;

    // Check user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Generate unique order ID
    const orderId = `AGENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'cashin',
      subType: CASHIN_TYPES.AGENT,
      amount: parseFloat(amount),
      currency: 'BDT',
      status: 'pending_verification',
      paymentMethod: paymentMethod.toUpperCase(),
      orderId,
      description: description || `Cash-in via ${paymentMethod.toUpperCase()} agent`,
      metadata: {
        agentPhone,
        customerPhone,
        gatewayTransactionId: transactionId,
        paymentGateway: paymentMethod,
        cashinType: CASHIN_TYPES.AGENT,
        requiresManualVerification: true
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Agent payment request submitted for verification',
      data: {
        transactionId: transaction._id,
        orderId,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'pending_verification',
        estimatedProcessingTime: '5-30 minutes'
      }
    });

  } catch (error) {
    logger.error('Agent cashin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit agent payment request'
    });
  }
});

// Manual Personal Payment
router.post('/personal', [
  auth,
  body('amount').isFloat({ min: 10 }).withMessage('Minimum amount is 10 BDT'),
  body('paymentMethod').isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method'),
  body('senderPhone').isMobilePhone('bn-BD').withMessage('Invalid sender phone number'),
  body('transactionId').notEmpty().withMessage('Transaction ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, paymentMethod, senderPhone, transactionId, description } = req.body;
    const userId = req.user.id;

    // Check user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Generate unique order ID
    const orderId = `PERSONAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'cashin',
      subType: CASHIN_TYPES.PERSONAL,
      amount: parseFloat(amount),
      currency: 'BDT',
      status: 'pending_verification',
      paymentMethod: paymentMethod.toUpperCase(),
      orderId,
      description: description || `Cash-in via ${paymentMethod.toUpperCase()} personal`,
      metadata: {
        senderPhone,
        gatewayTransactionId: transactionId,
        paymentGateway: paymentMethod,
        cashinType: CASHIN_TYPES.PERSONAL,
        requiresManualVerification: true
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Personal payment request submitted for verification',
      data: {
        transactionId: transaction._id,
        orderId,
        amount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'pending_verification',
        estimatedProcessingTime: '5-30 minutes'
      }
    });

  } catch (error) {
    logger.error('Personal cashin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit personal payment request'
    });
  }
});

// Bank Transfer
router.post('/bank', [
  auth,
  body('amount').isFloat({ min: 100 }).withMessage('Minimum amount is 100 BDT for bank transfer'),
  body('bank').isIn(Object.values(BANKS)).withMessage('Invalid bank'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  body('transactionReference').notEmpty().withMessage('Transaction reference is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, bank, accountNumber, accountName, transactionReference, description } = req.body;
    const userId = req.user.id;

    // Check user wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Generate unique order ID
    const orderId = `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create transaction record
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      type: 'cashin',
      subType: CASHIN_TYPES.BANK,
      amount: parseFloat(amount),
      currency: 'BDT',
      status: 'pending_verification',
      paymentMethod: 'BANK_TRANSFER',
      orderId,
      description: description || `Bank transfer from ${bank.toUpperCase()}`,
      metadata: {
        bank: bank.toUpperCase(),
        accountNumber,
        accountName,
        transactionReference,
        cashinType: CASHIN_TYPES.BANK,
        requiresManualVerification: true
      }
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Bank transfer request submitted for verification',
      data: {
        transactionId: transaction._id,
        orderId,
        amount,
        bank: bank.toUpperCase(),
        status: 'pending_verification',
        estimatedProcessingTime: '1-24 hours'
      }
    });

  } catch (error) {
    logger.error('Bank cashin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit bank transfer request'
    });
  }
});

// Payment callback handler
router.post('/callback/:gateway', async (req, res) => {
  try {
    const { gateway } = req.params;
    const callbackData = req.body;

    logger.info(`Payment callback received - Gateway: ${gateway}`, callbackData);

    // Verify payment with gateway
    const verificationResult = await PaymentGatewayService.verifyPayment(gateway, callbackData);

    if (verificationResult.success) {
      // Find transaction by payment ID or order ID
      const transaction = await Transaction.findOne({
        $or: [
          { 'metadata.paymentId': verificationResult.transactionId },
          { orderId: callbackData.orderId || callbackData.merchantInvoiceNumber }
        ]
      });

      if (transaction) {
        // Update transaction status
        transaction.status = 'completed';
        transaction.metadata.gatewayTransactionId = verificationResult.transactionId;
        transaction.metadata.verificationResult = verificationResult;
        transaction.completedAt = new Date();
        await transaction.save();

        // Update wallet balance
        const wallet = await Wallet.findById(transaction.walletId);
        if (wallet) {
          wallet.balance += transaction.amount;
          wallet.totalCashIn += transaction.amount;
          await wallet.save();

          logger.info(`Cash-in completed - User: ${transaction.userId}, Amount: ${transaction.amount}`);
        }

        res.json({ success: true, message: 'Payment verified and processed' });
      } else {
        logger.error('Transaction not found for callback:', callbackData);
        res.status(404).json({ success: false, message: 'Transaction not found' });
      }
    } else {
      logger.error('Payment verification failed:', verificationResult);
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

  } catch (error) {
    logger.error('Payment callback error:', error);
    res.status(500).json({ success: false, message: 'Callback processing failed' });
  }
});

// Get cash-in history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentMethod, cashinType } = req.query;
    const userId = req.user.id;

    const query = {
      userId,
      type: 'cashin'
    };

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod.toUpperCase();
    if (cashinType) query.subType = cashinType;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('walletId', 'currency');

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    logger.error('Get cashin history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cash-in history'
    });
  }
});

// Get transaction status
router.get('/status/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      type: 'cashin'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transactionId: transaction._id,
        orderId: transaction.orderId,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        cashinType: transaction.subType,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
        description: transaction.description
      }
    });

  } catch (error) {
    logger.error('Get transaction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction status'
    });
  }
});

module.exports = router;