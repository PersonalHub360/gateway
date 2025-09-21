const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const { generateOTP } = require('../utils/otp');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  authLimiter,
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('userType').isIn(['personal', 'agent', 'merchant']).withMessage('Invalid user type'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, phone, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType
    });

    await user.save();

    // Create wallet for the user
    const walletId = Wallet.generateWalletId(userType);
    const wallet = new Wallet({
      userId: user._id,
      walletType: userType,
      walletId
    });

    await wallet.save();

    // Generate email verification token
    const emailToken = jwt.sign(
      { userId: user._id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate phone verification OTP
    const phoneOTP = generateOTP();
    user.phoneVerificationToken = phoneOTP;
    user.emailVerificationToken = emailToken;
    await user.save();

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - Trea Payment Gateway',
      template: 'email-verification',
      data: {
        firstName,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`
      }
    });

    // Send verification SMS
    await sendSMS({
      to: phone,
      message: `Your Trea Payment Gateway verification code is: ${phoneOTP}. Valid for 10 minutes.`
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email and phone number.',
      data: {
        userId: user._id,
        walletId: wallet.walletId,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  loginLimiter,
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { identifier, password } = req.body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Check if 2FA is enabled
    if (user.twoFactorAuth.enabled) {
      // Generate temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user._id, type: '2fa_pending' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );

      return res.json({
        success: true,
        message: '2FA verification required',
        requiresTwoFactor: true,
        tempToken
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Get user's wallet
    const wallet = await Wallet.findOne({ userId: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKYCVerified: user.isKYCVerified,
        walletId: wallet?.walletId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/verify-2fa
// @desc    Verify 2FA token
// @access  Public (with temp token)
router.post('/verify-2fa', [
  body('tempToken').notEmpty().withMessage('Temporary token is required'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('2FA token must be 6 digits')
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

    const { tempToken, token } = req.body;

    // Verify temporary token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.type !== '2fa_pending') {
      return res.status(401).json({
        success: false,
        message: 'Invalid temporary token'
      });
    }

    const user = await User.findById(decoded.userId).select('+twoFactorAuth.secret');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Get user's wallet
    const wallet = await Wallet.findOne({ userId: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKYCVerified: user.isKYCVerified,
        walletId: wallet?.walletId
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA verification'
    });
  }
});

// @route   POST /api/auth/setup-2fa
// @desc    Setup 2FA for user
// @access  Private
router.post('/setup-2fa', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Trea Payment Gateway (${user.email})`,
      issuer: 'Trea Payment Gateway'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret (but don't enable 2FA yet)
    user.twoFactorAuth.secret = secret.base32;
    await user.save();

    res.json({
      success: true,
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      manualEntryKey: secret.base32
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA setup'
    });
  }
});

// @route   POST /api/auth/enable-2fa
// @desc    Enable 2FA after verification
// @access  Private
router.post('/enable-2fa', [
  auth,
  body('token').isLength({ min: 6, max: 6 }).withMessage('2FA token must be 6 digits')
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

    const { token } = req.body;
    const user = await User.findById(req.user.userId).select('+twoFactorAuth.secret');

    if (!user || !user.twoFactorAuth.secret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA enable'
    });
  }
});

// @route   POST /api/auth/disable-2fa
// @desc    Disable 2FA
// @access  Private
router.post('/disable-2fa', [
  auth,
  body('password').notEmpty().withMessage('Password is required'),
  body('token').isLength({ min: 6, max: 6 }).withMessage('2FA token must be 6 digits')
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

    const { password, token } = req.body;
    const user = await User.findById(req.user.userId).select('+password +twoFactorAuth.secret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA token'
      });
    }

    // Disable 2FA
    user.twoFactorAuth.enabled = false;
    user.twoFactorAuth.secret = undefined;
    user.twoFactorAuth.backupCodes = [];
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during 2FA disable'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const wallet = await Wallet.findOne({ userId: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isKYCVerified: user.isKYCVerified,
        twoFactorEnabled: user.twoFactorAuth.enabled,
        walletId: wallet?.walletId,
        profile: user.profile,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', [auth], (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;