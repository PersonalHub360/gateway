const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { auth, requireFullVerification } = require('../middleware/auth');
const { encryptWalletData, decryptWalletData } = require('../utils/encryption');
const { convertCurrency, formatCurrency, validateCurrencyAmount } = require('../utils/currency');
const { createOTP, verifyOTP } = require('../utils/otp');
const { sendSMS } = require('../utils/sms');
const { sendEmail } = require('../utils/email');

// Rate limiting for wallet operations
const walletRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: { error: 'Too many wallet requests, please try again later' }
});

const transferRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 transfers per hour
  message: { error: 'Transfer limit exceeded, please try again later' }
});

// Get user wallets
router.get('/', auth, walletRateLimit, async (req, res) => {
  try {
    const wallets = await Wallet.find({ owner: req.user.id })
      .select('-__v')
      .sort({ createdAt: -1 });

    // Decrypt sensitive data
    const decryptedWallets = wallets.map(wallet => {
      const walletObj = wallet.toObject();
      return decryptWalletData(walletObj);
    });

    res.json({
      success: true,
      wallets: decryptedWallets
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallets'
    });
  }
});

// Get specific wallet
router.get('/:walletId', [
  auth,
  walletRateLimit,
  param('walletId').isMongoId().withMessage('Invalid wallet ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Decrypt sensitive data
    const decryptedWallet = decryptWalletData(wallet.toObject());

    res.json({
      success: true,
      wallet: decryptedWallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch wallet'
    });
  }
});

// Create new wallet
router.post('/create', [
  auth,
  requireFullVerification,
  walletRateLimit,
  body('type').isIn(['personal', 'agent', 'merchant']).withMessage('Invalid wallet type'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
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

    const { type, currency, pin } = req.body;

    // Check if user already has a wallet of this type and currency
    const existingWallet = await Wallet.findOne({
      owner: req.user.id,
      type,
      'balances.currency': currency
    });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        error: `You already have a ${type} wallet for ${currency}`
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

    // Create wallet
    const walletData = {
      owner: req.user.id,
      type,
      walletId: await Wallet.generateWalletId(),
      balances: [{
        currency,
        available: 0,
        pending: 0,
        frozen: 0
      }],
      status: 'active',
      security: {
        requirePinForTransactions: true,
        require2FAForLargeTransactions: true,
        largeTransactionThreshold: currency === 'USD' ? 1000 : (currency === 'USDT' ? 1000 : 50000)
      }
    };

    // Encrypt sensitive data
    const encryptedWalletData = encryptWalletData(walletData);
    const wallet = new Wallet(encryptedWalletData);
    await wallet.save();

    // Send notification
    await sendEmail(user.email, 'walletCreated', {
      userName: user.fullName,
      walletType: type,
      currency: currency,
      walletId: wallet.walletId
    });

    res.status(201).json({
      success: true,
      message: 'Wallet created successfully',
      wallet: {
        id: wallet._id,
        walletId: wallet.walletId,
        type: wallet.type,
        currency: currency,
        status: wallet.status
      }
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create wallet'
    });
  }
});

// Get wallet balance
router.get('/:walletId/balance', [
  auth,
  walletRateLimit,
  param('walletId').isMongoId().withMessage('Invalid wallet ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const wallet = await Wallet.findOne({
      _id: req.params.walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Decrypt and format balances
    const decryptedWallet = decryptWalletData(wallet.toObject());
    const formattedBalances = decryptedWallet.balances.map(balance => ({
      currency: balance.currency,
      available: formatCurrency(balance.available, balance.currency),
      pending: formatCurrency(balance.pending, balance.currency),
      frozen: formatCurrency(balance.frozen, balance.currency),
      total: formatCurrency(balance.available + balance.pending, balance.currency)
    }));

    res.json({
      success: true,
      walletId: wallet.walletId,
      balances: formattedBalances,
      totalBalanceUSD: await wallet.getTotalBalanceUSD()
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance'
    });
  }
});

// Transfer funds between wallets
router.post('/transfer', [
  auth,
  requireFullVerification,
  transferRateLimit,
  body('fromWalletId').isMongoId().withMessage('Invalid from wallet ID'),
  body('toWalletId').notEmpty().withMessage('To wallet ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { fromWalletId, toWalletId, amount, currency, pin, description } = req.body;

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

    // Get sender wallet
    const fromWallet = await Wallet.findOne({
      _id: fromWalletId,
      owner: req.user.id
    });

    if (!fromWallet) {
      return res.status(404).json({
        success: false,
        error: 'Sender wallet not found'
      });
    }

    // Get receiver wallet
    const toWallet = await Wallet.findOne({
      $or: [
        { _id: toWalletId },
        { walletId: toWalletId }
      ]
    });

    if (!toWallet) {
      return res.status(404).json({
        success: false,
        error: 'Receiver wallet not found'
      });
    }

    // Check if sender has sufficient balance
    const hasBalance = await fromWallet.hasBalance(currency, amount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Check transfer limits
    const withinLimits = await fromWallet.checkTransferLimits(currency, amount);
    if (!withinLimits.allowed) {
      return res.status(400).json({
        success: false,
        error: withinLimits.reason
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      type: 'transfer',
      category: 'wallet_transfer',
      sender: {
        userId: req.user.id,
        walletId: fromWallet._id,
        walletAddress: fromWallet.walletId
      },
      receiver: {
        userId: toWallet.owner,
        walletId: toWallet._id,
        walletAddress: toWallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      description: description || 'Wallet transfer',
      status: 'pending',
      metadata: {
        transferType: 'internal',
        initiatedBy: req.user.id
      }
    });

    await transaction.save();

    // Process transfer (deduct from sender, add to receiver)
    await fromWallet.deductBalance(currency, amount);
    await toWallet.addBalance(currency, amount);

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Send notifications
    const senderUser = await User.findById(req.user.id);
    const receiverUser = await User.findById(toWallet.owner);

    // Notify sender
    await sendEmail(senderUser.email, 'transactionNotification', {
      userName: senderUser.fullName,
      transactionType: 'Transfer Sent',
      amount: formatCurrency(amount, currency),
      recipient: receiverUser.fullName,
      transactionId: transaction.transactionId,
      status: 'completed'
    });

    // Notify receiver
    await sendEmail(receiverUser.email, 'transactionNotification', {
      userName: receiverUser.fullName,
      transactionType: 'Transfer Received',
      amount: formatCurrency(amount, currency),
      sender: senderUser.fullName,
      transactionId: transaction.transactionId,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Transfer completed successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: formatCurrency(amount, currency),
        status: transaction.status,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({
      success: false,
      error: 'Transfer failed'
    });
  }
});

// Get wallet transaction history
router.get('/:walletId/transactions', [
  auth,
  walletRateLimit,
  param('walletId').isMongoId().withMessage('Invalid wallet ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['cash_in', 'cash_out', 'transfer', 'payment', 'top_up']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify wallet ownership
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

    // Build query
    const query = {
      $or: [
        { 'sender.walletId': walletId },
        { 'receiver.walletId': walletId }
      ]
    };

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender.userId', 'fullName email')
      .populate('receiver.userId', 'fullName email');

    const total = await Transaction.countDocuments(query);

    // Format transactions
    const formattedTransactions = transactions.map(tx => ({
      id: tx._id,
      transactionId: tx.transactionId,
      type: tx.type,
      category: tx.category,
      amount: formatCurrency(tx.amount.value, tx.amount.currency),
      currency: tx.amount.currency,
      description: tx.description,
      status: tx.status,
      direction: tx.sender.walletId.toString() === walletId ? 'outgoing' : 'incoming',
      counterparty: tx.sender.walletId.toString() === walletId ? 
        (tx.receiver.userId ? tx.receiver.userId.fullName : 'External') :
        (tx.sender.userId ? tx.sender.userId.fullName : 'External'),
      timestamp: tx.createdAt,
      completedAt: tx.completedAt
    }));

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

// Freeze/unfreeze wallet
router.patch('/:walletId/freeze', [
  auth,
  requireFullVerification,
  walletRateLimit,
  param('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('action').isIn(['freeze', 'unfreeze']).withMessage('Action must be freeze or unfreeze'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits'),
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId } = req.params;
    const { action, pin, reason } = req.body;

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get wallet
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

    // Update wallet status
    wallet.status = action === 'freeze' ? 'frozen' : 'active';
    wallet.statusHistory.push({
      status: wallet.status,
      reason: reason || `Wallet ${action}d by user`,
      changedBy: req.user.id,
      timestamp: new Date()
    });

    await wallet.save();

    // Send notification
    await sendEmail(user.email, 'walletStatusChanged', {
      userName: user.fullName,
      walletId: wallet.walletId,
      status: wallet.status,
      reason: reason || `Wallet ${action}d by user`
    });

    res.json({
      success: true,
      message: `Wallet ${action}d successfully`,
      wallet: {
        id: wallet._id,
        walletId: wallet.walletId,
        status: wallet.status
      }
    });
  } catch (error) {
    console.error('Freeze wallet error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to ${req.body.action} wallet`
    });
  }
});

// Request wallet backup
router.post('/:walletId/backup', [
  auth,
  requireFullVerification,
  walletRateLimit,
  param('walletId').isMongoId().withMessage('Invalid wallet ID'),
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

    const { walletId } = req.params;
    const { pin } = req.body;

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get wallet
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

    // Generate OTP for backup verification
    const otpResult = createOTP(user.email, 'wallet_backup');
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        error: otpResult.message
      });
    }

    // Send OTP via email
    await sendEmail(user.email, 'otpVerification', {
      userName: user.fullName,
      otp: otpResult.otp,
      purpose: 'wallet backup',
      expiryMinutes: otpResult.expiryMinutes
    });

    res.json({
      success: true,
      message: 'Backup verification OTP sent to your email',
      expiryMinutes: otpResult.expiryMinutes
    });
  } catch (error) {
    console.error('Wallet backup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate wallet backup'
    });
  }
});

module.exports = router;