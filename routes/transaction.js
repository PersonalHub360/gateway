const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');

const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { auth, requireVerification, requireAdmin } = require('../middleware/auth');
const { encryptTransactionData, decryptTransactionData } = require('../utils/encryption');
const { convertCurrency, formatCurrency, validateCurrencyAmount, calculateTransactionFee } = require('../utils/currency');
const { createOTP, verifyOTP } = require('../utils/otp');
const { sendSMS } = require('../utils/sms');
const { sendEmail } = require('../utils/email');

// Rate limiting for transactions
const transactionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 transactions per window
  message: { error: 'Too many transaction requests, please try again later' }
});

const cashInRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 cash-in requests per hour
  message: { error: 'Cash-in limit exceeded, please try again later' }
});

const cashOutRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 cash-out requests per hour
  message: { error: 'Cash-out limit exceeded, please try again later' }
});

// Get user transactions
router.get('/', [
  auth,
  transactionRateLimit,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['cash_in', 'cash_out', 'transfer', 'payment', 'top_up']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  query('currency').optional().isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
      $or: [
        { 'sender.userId': req.user.id },
        { 'receiver.userId': req.user.id }
      ]
    };

    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.currency) query['amount.currency'] = req.query.currency;

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender.userId', 'fullName email')
      .populate('receiver.userId', 'fullName email');

    const total = await Transaction.countDocuments(query);

    // Format transactions
    const formattedTransactions = transactions.map(tx => {
      const decryptedTx = decryptTransactionData(tx.toObject());
      return {
        id: tx._id,
        transactionId: tx.transactionId,
        type: tx.type,
        category: tx.category,
        amount: formatCurrency(decryptedTx.amount.value, decryptedTx.amount.currency),
        currency: decryptedTx.amount.currency,
        fee: tx.fee ? formatCurrency(tx.fee.value, tx.fee.currency) : null,
        description: decryptedTx.description,
        status: tx.status,
        direction: tx.sender.userId && tx.sender.userId._id.toString() === req.user.id ? 'outgoing' : 'incoming',
        counterparty: tx.sender.userId && tx.sender.userId._id.toString() === req.user.id ? 
          (tx.receiver.userId ? tx.receiver.userId.fullName : 'External') :
          (tx.sender.userId ? tx.sender.userId.fullName : 'External'),
        timestamp: tx.createdAt,
        completedAt: tx.completedAt
      };
    });

    res.json({
      success: true,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// Get specific transaction
router.get('/:transactionId', [
  auth,
  transactionRateLimit,
  param('transactionId').isMongoId().withMessage('Invalid transaction ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      $or: [
        { 'sender.userId': req.user.id },
        { 'receiver.userId': req.user.id }
      ]
    }).populate('sender.userId receiver.userId', 'fullName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Decrypt sensitive data
    const decryptedTransaction = decryptTransactionData(transaction.toObject());

    res.json({
      success: true,
      transaction: {
        ...decryptedTransaction,
        amount: formatCurrency(decryptedTransaction.amount.value, decryptedTransaction.amount.currency),
        fee: transaction.fee ? formatCurrency(transaction.fee.value, transaction.fee.currency) : null
      }
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
});

// Cash In - Auto Merchant
router.post('/cash-in/auto', [
  auth,
  requireVerification,
  cashInRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('merchantCode').notEmpty().withMessage('Merchant code is required'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, amount, currency, merchantCode, pin } = req.body;

    // Validate currency amount
    const amountValidation = validateCurrencyAmount(amount, currency);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        error: amountValidation.error
      });
    }

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Find merchant by code
    const merchant = await User.findOne({
      userType: 'merchant',
      'merchantInfo.merchantCode': merchantCode,
      status: 'active'
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found or inactive'
      });
    }

    // Get merchant wallet
    const merchantWallet = await Wallet.findOne({
      owner: merchant._id,
      type: 'merchant'
    });

    if (!merchantWallet) {
      return res.status(404).json({
        success: false,
        error: 'Merchant wallet not found'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'standard');

    // Create transaction
    const transactionData = {
      type: 'cash_in',
      category: 'auto_merchant',
      sender: {
        userId: merchant._id,
        walletId: merchantWallet._id,
        walletAddress: merchantWallet.walletId
      },
      receiver: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Auto cash-in from merchant ${merchantCode}`,
      status: 'processing',
      merchant: {
        merchantId: merchant._id,
        merchantCode: merchantCode,
        merchantName: merchant.fullName
      },
      metadata: {
        cashInType: 'auto_merchant',
        feeType: 'standard'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Process auto cash-in (simulate merchant approval)
    setTimeout(async () => {
      try {
        // Add balance to user wallet
        await wallet.addBalance(currency, amount);
        
        // Update transaction status
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Send notifications
        await sendEmail(user.email, 'transactionNotification', {
          userName: user.fullName,
          transactionType: 'Cash In',
          amount: formatCurrency(amount, currency),
          merchant: merchant.fullName,
          transactionId: transaction.transactionId,
          status: 'completed'
        });

        await sendSMS(user.phone, 'transactionNotification', {
          userName: user.fullName,
          type: 'Cash In',
          amount: formatCurrency(amount, currency),
          status: 'completed'
        });
      } catch (error) {
        console.error('Auto cash-in processing error:', error);
        transaction.status = 'failed';
        transaction.failureReason = 'Processing error';
        await transaction.save();
      }
    }, 2000); // 2 second delay to simulate processing

    res.json({
      success: true,
      message: 'Cash-in request submitted successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        status: transaction.status,
        estimatedCompletion: '2-3 minutes'
      }
    });
  } catch (error) {
    console.error('Auto cash-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Cash-in request failed'
    });
  }
});

// Cash In - Manual
router.post('/cash-in/manual', [
  auth,
  requireVerification,
  cashInRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('agentCode').optional().notEmpty().withMessage('Agent code cannot be empty'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, amount, currency, agentCode, description, pin } = req.body;

    // Validate currency amount
    const amountValidation = validateCurrencyAmount(amount, currency);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        error: amountValidation.error
      });
    }

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    let agent = null;
    let agentWallet = null;

    // If agent code provided, find agent
    if (agentCode) {
      agent = await User.findOne({
        userType: 'agent',
        'agentInfo.agentCode': agentCode,
        status: 'active'
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found or inactive'
        });
      }

      agentWallet = await Wallet.findOne({
        owner: agent._id,
        type: 'agent'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'standard');

    // Create transaction
    const transactionData = {
      type: 'cash_in',
      category: 'manual',
      receiver: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: description || 'Manual cash-in request',
      status: 'pending',
      verification: {
        required: true,
        adminApprovalRequired: true
      },
      metadata: {
        cashInType: 'manual',
        feeType: 'standard'
      }
    };

    // Add agent info if provided
    if (agent && agentWallet) {
      transactionData.agent = {
        agentId: agent._id,
        agentCode: agentCode,
        agentName: agent.fullName,
        walletId: agentWallet._id
      };
      transactionData.sender = {
        userId: agent._id,
        walletId: agentWallet._id,
        walletAddress: agentWallet.walletId
      };
    }

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Send notification to user
    await sendEmail(user.email, 'transactionNotification', {
      userName: user.fullName,
      transactionType: 'Manual Cash In Request',
      amount: formatCurrency(amount, currency),
      transactionId: transaction.transactionId,
      status: 'pending approval'
    });

    // Notify admin for approval
    const adminUsers = await User.find({ userType: 'admin', status: 'active' });
    for (const admin of adminUsers) {
      await sendEmail(admin.email, 'adminNotification', {
        adminName: admin.fullName,
        notificationType: 'Manual Cash-In Approval Required',
        userName: user.fullName,
        amount: formatCurrency(amount, currency),
        transactionId: transaction.transactionId
      });
    }

    res.json({
      success: true,
      message: 'Manual cash-in request submitted for approval',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        status: transaction.status,
        estimatedApproval: '24-48 hours'
      }
    });
  } catch (error) {
    console.error('Manual cash-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Cash-in request failed'
    });
  }
});

// Cash Out - Auto
router.post('/cash-out/auto', [
  auth,
  requireVerification,
  cashOutRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('withdrawalMethod').isIn(['bank_transfer', 'mobile_wallet', 'cash_pickup']).withMessage('Invalid withdrawal method'),
  body('accountDetails').isObject().withMessage('Account details are required'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, amount, currency, withdrawalMethod, accountDetails, pin } = req.body;

    // Validate currency amount
    const amountValidation = validateCurrencyAmount(amount, currency);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        error: amountValidation.error
      });
    }

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Check if user has sufficient balance
    const hasBalance = await wallet.hasBalance(currency, amount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'express');
    const totalDeduction = amount + feeInfo.feeAmount;

    // Check if user has balance including fees
    const hasBalanceWithFees = await wallet.hasBalance(currency, totalDeduction);
    if (!hasBalanceWithFees) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: ${formatCurrency(totalDeduction, currency)} (including fees)`
      });
    }

    // Create transaction
    const transactionData = {
      type: 'cash_out',
      category: 'auto_withdrawal',
      sender: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Auto cash-out via ${withdrawalMethod}`,
      status: 'processing',
      withdrawal: {
        method: withdrawalMethod,
        accountDetails: accountDetails,
        processingTime: '1-3 business days'
      },
      metadata: {
        cashOutType: 'auto',
        feeType: 'express'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Deduct balance immediately
    await wallet.deductBalance(currency, totalDeduction);

    // Simulate processing
    setTimeout(async () => {
      try {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        await transaction.save();

        // Send completion notification
        await sendEmail(user.email, 'transactionNotification', {
          userName: user.fullName,
          transactionType: 'Cash Out',
          amount: formatCurrency(amount, currency),
          method: withdrawalMethod,
          transactionId: transaction.transactionId,
          status: 'completed'
        });
      } catch (error) {
        console.error('Auto cash-out processing error:', error);
      }
    }, 5000); // 5 second delay

    res.json({
      success: true,
      message: 'Cash-out request submitted successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        totalDeducted: formatCurrency(totalDeduction, currency),
        status: transaction.status,
        estimatedCompletion: '1-3 business days'
      }
    });
  } catch (error) {
    console.error('Auto cash-out error:', error);
    res.status(500).json({
      success: false,
      error: 'Cash-out request failed'
    });
  }
});

// Approve/Reject Manual Transaction (Admin only)
router.patch('/:transactionId/approve', [
  auth,
  requireAdmin,
  transactionRateLimit,
  param('transactionId').isMongoId().withMessage('Invalid transaction ID'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { transactionId } = req.params;
    const { action, reason } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('sender.userId receiver.userId', 'fullName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Transaction is not pending approval'
      });
    }

    if (action === 'approve') {
      // Process the transaction
      if (transaction.type === 'cash_in') {
        const receiverWallet = await Wallet.findById(transaction.receiver.walletId);
        if (receiverWallet) {
          await receiverWallet.addBalance(transaction.amount.currency, transaction.amount.value);
        }
      }

      transaction.status = 'completed';
      transaction.completedAt = new Date();
    } else {
      transaction.status = 'rejected';
      transaction.failureReason = reason || 'Rejected by admin';
    }

    transaction.approval = {
      approvedBy: req.user.id,
      approvedAt: new Date(),
      action: action,
      reason: reason
    };

    await transaction.save();

    // Send notification to user
    const user = transaction.receiver.userId || transaction.sender.userId;
    if (user) {
      await sendEmail(user.email, 'transactionNotification', {
        userName: user.fullName,
        transactionType: transaction.type,
        amount: formatCurrency(transaction.amount.value, transaction.amount.currency),
        transactionId: transaction.transactionId,
        status: action === 'approve' ? 'approved' : 'rejected',
        reason: reason
      });
    }

    res.json({
      success: true,
      message: `Transaction ${action}d successfully`,
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        status: transaction.status,
        action: action
      }
    });
  } catch (error) {
    console.error('Transaction approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process transaction approval'
    });
  }
});

module.exports = router;