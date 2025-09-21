const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const { auth, requireVerification } = require('../middleware/auth');
const { encryptUserData, decryptUserData } = require('../utils/encryption');
const { formatCurrency } = require('../utils/currency');
const { createOTP, verifyOTP } = require('../utils/otp');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const { validateEmail, validatePhone, validatePassword } = require('../utils/validation');

// Rate limiting
const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: { error: 'Too many requests, please try again later' }
});

const profileUpdateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 profile updates per hour
  message: { error: 'Profile update limit exceeded, please try again later' }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', [
  auth,
  userRateLimit
], async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -transactionPIN -twoFactorSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's wallets
    const wallets = await Wallet.find({ owner: req.user.id });

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      $or: [
        { 'sender.userId': req.user.id },
        { 'receiver.userId': req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('sender.userId receiver.userId', 'fullName');

    // Calculate total balance in USD
    const totalBalanceUSD = wallets.reduce((sum, wallet) => {
      return sum + (wallet.balances.USD || 0);
    }, 0);

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
        totalBalanceUSD: formatCurrency(totalBalanceUSD, 'USD'),
        recentTransactions: recentTransactions.map(tx => ({
          id: tx._id,
          transactionId: tx.transactionId,
          type: tx.type,
          amount: formatCurrency(tx.amount.value, tx.amount.currency),
          status: tx.status,
          direction: tx.sender.userId && tx.sender.userId._id.toString() === req.user.id ? 'outgoing' : 'incoming',
          counterparty: tx.sender.userId && tx.sender.userId._id.toString() === req.user.id ? 
            (tx.receiver.userId ? tx.receiver.userId.fullName : 'External') :
            (tx.sender.userId ? tx.sender.userId.fullName : 'External'),
          createdAt: tx.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.patch('/profile', [
  auth,
  profileUpdateRateLimit,
  body('fullName').optional().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2-100 characters'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('address.street').optional().isLength({ max: 200 }).withMessage('Street address too long'),
  body('address.city').optional().isLength({ max: 100 }).withMessage('City name too long'),
  body('address.state').optional().isLength({ max: 100 }).withMessage('State name too long'),
  body('address.country').optional().isLength({ max: 100 }).withMessage('Country name too long'),
  body('address.postalCode').optional().isLength({ max: 20 }).withMessage('Postal code too long'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const allowedUpdates = ['fullName', 'phone', 'dateOfBirth', 'address', 'preferences'];
    const updates = {};

    // Only include allowed fields that are present in the request
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate phone number if provided
    if (updates.phone && updates.phone !== user.phone) {
      const phoneValidation = validatePhone(updates.phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          error: phoneValidation.error
        });
      }

      // Check if phone is already in use
      const existingUser = await User.findOne({ 
        phone: updates.phone,
        _id: { $ne: req.user.id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is already in use'
        });
      }

      // If phone is being changed, mark as unverified
      updates['verification.phoneVerified'] = false;
    }

    // Update user
    Object.assign(user, updates);
    user.updatedAt = new Date();
    await user.save();

    // Send verification SMS if phone was changed
    if (updates.phone && updates.phone !== user.phone) {
      const otp = await createOTP(req.user.id, 'phone_verification');
      await sendSMS(updates.phone, 'phoneVerification', {
        userName: user.fullName,
        otp: otp
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        preferences: user.preferences,
        verification: user.verification,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Change password
router.patch('/change-password', [
  auth,
  profileUpdateRateLimit,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.error
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send notification email
    await sendEmail(user.email, 'passwordChanged', {
      userName: user.fullName,
      timestamp: new Date(),
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Change transaction PIN
router.patch('/change-pin', [
  auth,
  profileUpdateRateLimit,
  body('currentPIN').optional().isLength({ min: 4, max: 6 }).isNumeric().withMessage('Current PIN must be 4-6 digits'),
  body('newPIN').isLength({ min: 4, max: 6 }).isNumeric().withMessage('New PIN must be 4-6 digits'),
  body('confirmPIN').custom((value, { req }) => {
    if (value !== req.body.newPIN) {
      throw new Error('PIN confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPIN, newPIN } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // If user has existing PIN, verify it
    if (user.transactionPIN && currentPIN) {
      const isCurrentPINValid = await user.compareTransactionPIN(currentPIN);
      if (!isCurrentPINValid) {
        return res.status(400).json({
          success: false,
          error: 'Current PIN is incorrect'
        });
      }
    }

    // Update PIN
    user.transactionPIN = newPIN;
    user.pinChangedAt = new Date();
    await user.save();

    // Send notification
    await sendEmail(user.email, 'pinChanged', {
      userName: user.fullName,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Transaction PIN updated successfully'
    });
  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change PIN'
    });
  }
});

// Upload KYC documents
router.post('/kyc/upload', [
  auth,
  userRateLimit,
  upload.fields([
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 }
  ])
], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.verification.kycStatus === 'verified') {
      return res.status(400).json({
        success: false,
        error: 'KYC is already verified'
      });
    }

    // Update KYC documents
    const kycDocuments = {};
    if (req.files.idFront) {
      kycDocuments.idFront = req.files.idFront[0].path;
    }
    if (req.files.idBack) {
      kycDocuments.idBack = req.files.idBack[0].path;
    }
    if (req.files.selfie) {
      kycDocuments.selfie = req.files.selfie[0].path;
    }
    if (req.files.addressProof) {
      kycDocuments.addressProof = req.files.addressProof[0].path;
    }

    user.kycDocuments = { ...user.kycDocuments, ...kycDocuments };
    user.verification.kycStatus = 'pending';
    user.verification.kycSubmittedAt = new Date();
    await user.save();

    // Notify admin
    const adminUsers = await User.find({ userType: 'admin', status: 'active' });
    for (const admin of adminUsers) {
      await sendEmail(admin.email, 'kycSubmission', {
        adminName: admin.fullName,
        userName: user.fullName,
        userEmail: user.email,
        submissionDate: new Date()
      });
    }

    res.json({
      success: true,
      message: 'KYC documents uploaded successfully',
      kycStatus: 'pending'
    });
  } catch (error) {
    console.error('KYC upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload KYC documents'
    });
  }
});

// Get user statistics
router.get('/statistics', [
  auth,
  userRateLimit
], async (req, res) => {
  try {
    const userId = req.user.id;

    // Transaction statistics
    const totalTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ]
    });

    const completedTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ],
      status: 'completed'
    });

    const pendingTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': userId },
        { 'receiver.userId': userId }
      ],
      status: 'pending'
    });

    // Monthly transaction volume
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyVolume = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { 'sender.userId': userId },
            { 'receiver.userId': userId }
          ],
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$amount.currency',
          totalAmount: { $sum: '$amount.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Transaction types breakdown
    const transactionTypes = await Transaction.aggregate([
      {
        $match: {
          $or: [
            { 'sender.userId': userId },
            { 'receiver.userId': userId }
          ],
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Wallet statistics
    const wallets = await Wallet.find({ owner: userId });
    const totalWallets = wallets.length;
    const activeWallets = wallets.filter(w => w.status === 'active').length;

    res.json({
      success: true,
      statistics: {
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          successRate: totalTransactions > 0 ? ((completedTransactions / totalTransactions) * 100).toFixed(2) : 0
        },
        monthlyVolume: monthlyVolume.map(v => ({
          currency: v._id,
          amount: formatCurrency(v.totalAmount, v._id),
          count: v.count
        })),
        transactionTypes: transactionTypes,
        wallets: {
          total: totalWallets,
          active: activeWallets
        }
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Get user notifications
router.get('/notifications', [
  auth,
  userRateLimit,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('unreadOnly').optional().isBoolean().withMessage('UnreadOnly must be boolean')
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
    const unreadOnly = req.query.unreadOnly === 'true';

    // Mock notifications - in real implementation, this would come from a notifications collection
    const notifications = [
      {
        id: '1',
        type: 'transaction',
        title: 'Transaction Completed',
        message: 'Your payment of $50.00 has been completed successfully',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        type: 'security',
        title: 'Login from New Device',
        message: 'We detected a login from a new device. If this wasn\'t you, please secure your account.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: '3',
        type: 'system',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM UTC.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    const filteredNotifications = unreadOnly ? 
      notifications.filter(n => !n.read) : 
      notifications;

    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);

    res.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        pages: Math.ceil(filteredNotifications.length / limit)
      },
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.patch('/notifications/:notificationId/read', [
  auth,
  userRateLimit,
  param('notificationId').notEmpty().withMessage('Notification ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // In real implementation, this would update the notification in the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Delete account
router.delete('/account', [
  auth,
  profileUpdateRateLimit,
  body('password').notEmpty().withMessage('Password is required'),
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

    const { password, reason } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Check if user has any pending transactions or positive balance
    const pendingTransactions = await Transaction.countDocuments({
      $or: [
        { 'sender.userId': req.user.id },
        { 'receiver.userId': req.user.id }
      ],
      status: { $in: ['pending', 'processing'] }
    });

    if (pendingTransactions > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete account with pending transactions'
      });
    }

    const wallets = await Wallet.find({ owner: req.user.id });
    const hasBalance = wallets.some(wallet => {
      return Object.values(wallet.balances).some(balance => balance > 0);
    });

    if (hasBalance) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete account with remaining balance. Please withdraw all funds first.'
      });
    }

    // Soft delete - mark as deleted instead of actually deleting
    user.status = 'deleted';
    user.deletedAt = new Date();
    user.deletionReason = reason;
    await user.save();

    // Deactivate wallets
    await Wallet.updateMany(
      { owner: req.user.id },
      { status: 'deactivated' }
    );

    // Send confirmation email
    await sendEmail(user.email, 'accountDeleted', {
      userName: user.fullName,
      deletionDate: new Date(),
      reason: reason
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

module.exports = router;