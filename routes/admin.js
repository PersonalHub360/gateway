const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { auth, requireAdmin } = require('../middleware/auth');
const { encryptUserData, decryptUserData } = require('../utils/encryption');
const { formatCurrency } = require('../utils/currency');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

// Rate limiting for admin operations
const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for admin
  message: { error: 'Too many admin requests, please try again later' }
});

// Dashboard Statistics
router.get('/dashboard', [
  auth,
  requireAdmin,
  adminRateLimit
], async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const newUsersToday = await User.countDocuments({ 
      createdAt: { $gte: startOfDay } 
    });
    const newUsersThisMonth = await User.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // User type breakdown
    const userTypes = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    // Transaction statistics
    const totalTransactions = await Transaction.countDocuments();

    // Cash In Statistics
    const totalCashIn = await Transaction.aggregate([
      { $match: { type: 'cashin', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const dailyCashIn = await Transaction.aggregate([
      { $match: { type: 'cashin', status: 'completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Cash Out Statistics
    const totalCashOut = await Transaction.aggregate([
      { $match: { type: 'cashout', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const dailyCashOut = await Transaction.aggregate([
      { $match: { type: 'cashout', status: 'completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Withdrawal Statistics
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const dailyWithdrawals = await Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed', createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Commission Statistics
    const totalCommission = await Transaction.aggregate([
      { $match: { status: 'completed', 'metadata.commission': { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$metadata.commission' } } }
    ]);

    const dailyCommission = await Transaction.aggregate([
      { $match: { 
        status: 'completed', 
        'metadata.commission': { $exists: true },
        createdAt: { $gte: startOfDay }
      }},
      { $group: { _id: null, total: { $sum: '$metadata.commission' } } }
    ]);

    // Loss Statistics (failed transactions, chargebacks, etc.)
    const totalLosses = await Transaction.aggregate([
      { $match: { 
        $or: [
          { status: 'failed', 'metadata.loss': { $exists: true } },
          { status: 'chargeback' },
          { status: 'disputed' }
        ]
      }},
      { $group: { _id: null, total: { $sum: { $ifNull: ['$metadata.loss', '$amount'] } } } }
    ]);

    // Payment Method Breakdown for Cash-in
    const cashinByMethod = await Transaction.aggregate([
      { $match: { type: 'cashin', status: 'completed' } },
      { $group: { 
        _id: '$paymentMethod', 
        total: { $sum: '$amount' }, 
        count: { $sum: 1 } 
      }},
      { $sort: { total: -1 } }
    ]);

    // Cash-in by Type (merchant, agent, personal, bank)
    const cashinByType = await Transaction.aggregate([
      { $match: { type: 'cashin', status: 'completed' } },
      { $group: { 
        _id: '$subType', 
        total: { $sum: '$amount' }, 
        count: { $sum: 1 } 
      }},
      { $sort: { total: -1 } }
    ]);

    // Monthly trends for the last 12 months
    const monthlyTrends = await Transaction.aggregate([
      { $match: { 
        status: 'completed',
        createdAt: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), 1) }
      }},
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Pending transactions requiring attention
    const pendingTransactions = await Transaction.countDocuments({
      status: { $in: ['pending_verification', 'pending_approval'] }
    });

    // System health metrics
    const systemHealth = {
      totalWallets: await Wallet.countDocuments(),
      activeWallets: await Wallet.countDocuments({ status: 'active' }),
      frozenWallets: await Wallet.countDocuments({ status: 'frozen' }),
      totalBalance: await Wallet.aggregate([
        { $group: { _id: null, total: { $sum: '$balance' } } }
      ])
    };

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
          breakdown: userTypes
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions
        },
        cashIn: {
          total: {
            amount: totalCashIn[0]?.total || 0,
            count: totalCashIn[0]?.count || 0
          },
          daily: {
            amount: dailyCashIn[0]?.total || 0,
            count: dailyCashIn[0]?.count || 0
          },
          byMethod: cashinByMethod,
          byType: cashinByType
        },
        cashOut: {
          total: {
            amount: totalCashOut[0]?.total || 0,
            count: totalCashOut[0]?.count || 0
          },
          daily: {
            amount: dailyCashOut[0]?.total || 0,
            count: dailyCashOut[0]?.count || 0
          }
        },
        withdrawals: {
          total: {
            amount: totalWithdrawals[0]?.total || 0,
            count: totalWithdrawals[0]?.count || 0
          },
          daily: {
            amount: dailyWithdrawals[0]?.total || 0,
            count: dailyWithdrawals[0]?.count || 0
          }
        },
        commission: {
          total: totalCommission[0]?.total || 0,
          daily: dailyCommission[0]?.total || 0
        },
        losses: {
          total: totalLosses[0]?.total || 0
        },
        trends: {
          monthly: monthlyTrends
        },
        systemHealth
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get all users with pagination and filters
router.get('/users', [
  auth,
  requireAdmin,
  adminRateLimit,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('userType').optional().isIn(['personal', 'agent', 'merchant', 'admin']).withMessage('Invalid user type'),
  query('status').optional().isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Invalid status'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term too long')
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
    const query = {};
    if (req.query.userType) query.userType = req.query.userType;
    if (req.query.status) query.status = req.query.status;
    
    if (req.query.search) {
      query.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -transactionPIN -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Get wallet info for each user
    const usersWithWallets = await Promise.all(users.map(async (user) => {
      const wallets = await Wallet.find({ owner: user._id });
      return {
        ...user.toObject(),
        walletsCount: wallets.length,
        totalBalance: wallets.reduce((sum, wallet) => {
          return sum + (wallet.balances.USD || 0);
        }, 0)
      };
    }));

    res.json({
      success: true,
      users: usersWithWallets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Get specific user details
router.get('/users/:userId', [
  auth,
  requireAdmin,
  adminRateLimit,
  param('userId').isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.params.userId)
      .select('-password -transactionPIN -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's wallets
    const wallets = await Wallet.find({ owner: user._id });

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [
        { 'sender.userId': user._id },
        { 'receiver.userId': user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('sender.userId receiver.userId', 'fullName email');

    // Calculate statistics
    const totalTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': user._id },
        { 'receiver.userId': user._id }
      ]
    });

    const completedTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': user._id },
        { 'receiver.userId': user._id }
      ],
      status: 'completed'
    });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        wallets: wallets.map(wallet => ({
          id: wallet._id,
          walletId: wallet.walletId,
          type: wallet.type,
          status: wallet.status,
          balances: Object.entries(wallet.balances).map(([currency, amount]) => ({
            currency,
            amount: formatCurrency(amount, currency)
          })),
          createdAt: wallet.createdAt
        })),
        statistics: {
          totalTransactions,
          completedTransactions,
          successRate: totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(2) : 0
        },
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          transactionId: tx.transactionId,
          type: tx.type,
          amount: formatCurrency(tx.amount.value, tx.amount.currency),
          status: tx.status,
          direction: tx.sender.userId && tx.sender.userId._id.toString() === user._id.toString() ? 'outgoing' : 'incoming',
          counterparty: tx.sender.userId && tx.sender.userId._id.toString() === user._id.toString() ? 
            (tx.receiver.userId ? tx.receiver.userId.fullName : 'External') :
            (tx.sender.userId ? tx.sender.userId.fullName : 'External'),
          createdAt: tx.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user details'
    });
  }
});

// Update user status
router.patch('/users/:userId/status', [
  auth,
  requireAdmin,
  adminRateLimit,
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
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

    const { userId } = req.params;
    const { status, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const oldStatus = user.status;
    user.status = status;
    user.statusHistory = user.statusHistory || [];
    user.statusHistory.push({
      status: status,
      changedBy: req.user.id,
      changedAt: new Date(),
      reason: reason
    });

    await user.save();

    // Update user's wallets status
    if (status === 'suspended') {
      await Wallet.updateMany(
        { owner: userId },
        { status: 'frozen' }
      );
    } else if (status === 'active' && oldStatus === 'suspended') {
      await Wallet.updateMany(
        { owner: userId },
        { status: 'active' }
      );
    }

    // Send notification to user
    await sendEmail(user.email, 'accountStatusUpdate', {
      userName: user.fullName,
      oldStatus: oldStatus,
      newStatus: status,
      reason: reason,
      adminName: req.user.fullName
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        status: user.status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// Approve/Reject KYC
router.patch('/users/:userId/kyc', [
  auth,
  requireAdmin,
  adminRateLimit,
  param('userId').isMongoId().withMessage('Invalid user ID'),
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

    const { userId } = req.params;
    const { action, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.verification.kycStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'KYC is not pending approval'
      });
    }

    user.verification.kycStatus = action === 'approve' ? 'verified' : 'rejected';
    user.verification.kycVerifiedAt = action === 'approve' ? new Date() : null;
    user.verification.kycRejectionReason = action === 'reject' ? reason : null;

    await user.save();

    // Send notification
    await sendEmail(user.email, 'kycStatusUpdate', {
      userName: user.fullName,
      status: action === 'approve' ? 'approved' : 'rejected',
      reason: reason
    });

    res.json({
      success: true,
      message: `KYC ${action}d successfully`,
      user: {
        id: user._id,
        fullName: user.fullName,
        kycStatus: user.verification.kycStatus
      }
    });
  } catch (error) {
    console.error('KYC approval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process KYC approval'
    });
  }
});

// Get all transactions with advanced filtering
router.get('/transactions', [
  auth,
  requireAdmin,
  adminRateLimit,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['cash_in', 'cash_out', 'transfer', 'payment', 'top_up']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Invalid status'),
  query('currency').optional().isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  query('minAmount').optional().isFloat({ min: 0 }).withMessage('Invalid minimum amount'),
  query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Invalid maximum amount'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
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
    const query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.currency) query['amount.currency'] = req.query.currency;
    
    if (req.query.minAmount || req.query.maxAmount) {
      query['amount.value'] = {};
      if (req.query.minAmount) query['amount.value'].$gte = parseFloat(req.query.minAmount);
      if (req.query.maxAmount) query['amount.value'].$lte = parseFloat(req.query.maxAmount);
    }

    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) query.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.createdAt.$lte = new Date(req.query.endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender.userId receiver.userId', 'fullName email');

    const total = await Transaction.countDocuments(query);

    // Calculate summary statistics
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount.value' },
          totalFees: { $sum: '$fee.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        id: tx._id,
        transactionId: tx.transactionId,
        type: tx.type,
        category: tx.category,
        amount: formatCurrency(tx.amount.value, tx.amount.currency),
        fee: tx.fee ? formatCurrency(tx.fee.value, tx.fee.currency) : null,
        sender: tx.sender.userId ? {
          id: tx.sender.userId._id,
          name: tx.sender.userId.fullName,
          email: tx.sender.userId.email
        } : null,
        receiver: tx.receiver.userId ? {
          id: tx.receiver.userId._id,
          name: tx.receiver.userId.fullName,
          email: tx.receiver.userId.email
        } : null,
        status: tx.status,
        createdAt: tx.createdAt,
        completedAt: tx.completedAt
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: summary.length > 0 ? {
        totalTransactions: summary[0].count,
        totalAmount: summary[0].totalAmount,
        totalFees: summary[0].totalFees
      } : {
        totalTransactions: 0,
        totalAmount: 0,
        totalFees: 0
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

// System settings
router.get('/settings', [
  auth,
  requireAdmin,
  adminRateLimit
], async (req, res) => {
  try {
    // Mock system settings - in real implementation, this would come from a settings collection
    const settings = {
      transactionLimits: {
        daily: {
          personal: { USD: 1000, AED: 3673, BDT: 85000, INR: 75000, PKR: 175000 },
          agent: { USD: 10000, AED: 36730, BDT: 850000, INR: 750000, PKR: 1750000 },
          merchant: { USD: 50000, AED: 183650, BDT: 4250000, INR: 3750000, PKR: 8750000 }
        },
        monthly: {
          personal: { USD: 10000, AED: 36730, BDT: 850000, INR: 750000, PKR: 1750000 },
          agent: { USD: 100000, AED: 367300, BDT: 8500000, INR: 7500000, PKR: 17500000 },
          merchant: { USD: 500000, AED: 1836500, BDT: 42500000, INR: 37500000, PKR: 87500000 }
        }
      },
      fees: {
        standard: { percentage: 1.5, minimum: 1, maximum: 50 },
        express: { percentage: 2.5, minimum: 2, maximum: 100 },
        bill_payment: { percentage: 1.0, minimum: 0.5, maximum: 25 },
        mobile_topup: { percentage: 0.5, minimum: 0.25, maximum: 10 },
        merchant_payment: { percentage: 1.2, minimum: 0.5, maximum: 30 },
        government_payment: { percentage: 2.0, minimum: 1, maximum: 75 }
      },
      security: {
        maxLoginAttempts: 5,
        lockoutDuration: 30, // minutes
        otpExpiry: 5, // minutes
        sessionTimeout: 60, // minutes
        requireTwoFactor: false,
        requireKYC: true
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: true,
        pushEnabled: false
      }
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Export data
router.get('/export/:type', [
  auth,
  requireAdmin,
  adminRateLimit,
  param('type').isIn(['users', 'transactions', 'wallets']).withMessage('Invalid export type'),
  query('format').optional().isIn(['csv', 'json']).withMessage('Invalid format'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const format = req.query.format || 'json';
    
    // Build date filter
    const dateFilter = {};
    if (req.query.startDate) dateFilter.$gte = new Date(req.query.startDate);
    if (req.query.endDate) dateFilter.$lte = new Date(req.query.endDate);

    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        const query = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
        data = await User.find(query)
          .select('-password -transactionPIN -twoFactorSecret')
          .lean();
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'transactions':
        const txQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
        data = await Transaction.find(txQuery)
          .populate('sender.userId receiver.userId', 'fullName email')
          .lean();
        filename = `transactions_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'wallets':
        const walletQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
        data = await Wallet.find(walletQuery)
          .populate('owner', 'fullName email')
          .lean();
        filename = `wallets_export_${new Date().toISOString().split('T')[0]}`;
        break;
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        exportType: type,
        exportDate: new Date(),
        recordCount: data.length,
        data: data
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data'
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;