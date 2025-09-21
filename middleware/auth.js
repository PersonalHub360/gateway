const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Add user to request
    req.user = {
      userId: decoded.userId,
      userType: user.userType,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    // First run basic auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in admin authentication'
    });
  }
};

// Agent authentication middleware
const agentAuth = async (req, res, next) => {
  try {
    // First run basic auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is agent or admin
    if (!['agent', 'admin'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agent privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Agent auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in agent authentication'
    });
  }
};

// Merchant authentication middleware
const merchantAuth = async (req, res, next) => {
  try {
    // First run basic auth
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is merchant or admin
    if (!['merchant', 'admin'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Merchant privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Merchant auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in merchant authentication'
    });
  }
};

// Verification status middleware
const requireEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in email verification check'
    });
  }
};

const requirePhoneVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'Phone verification required to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('Phone verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in phone verification check'
    });
  }
};

const requireKYCVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isKYCVerified) {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required to access this resource'
      });
    }

    next();
  } catch (error) {
    console.error('KYC verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in KYC verification check'
    });
  }
};

// Combined verification middleware
const requireFullVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user.isEmailVerified || !user.isPhoneVerified || !user.isKYCVerified) {
      return res.status(403).json({
        success: false,
        message: 'Full account verification (email, phone, and KYC) required to access this resource',
        verification: {
          email: user.isEmailVerified,
          phone: user.isPhoneVerified,
          kyc: user.isKYCVerified
        }
      });
    }

    next();
  } catch (error) {
    console.error('Full verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in verification check'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (user && user.status === 'active') {
      req.user = {
        userId: decoded.userId,
        userType: user.userType,
        email: user.email
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token is invalid, just set user to null and continue
    req.user = null;
    next();
  }
};

// Rate limiting by user
const userRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.userId;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }

    const userRequests = requests.get(userId) || [];

    if (userRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    userRequests.push(now);
    requests.set(userId, userRequests);

    next();
  };
};

module.exports = {
  auth,
  adminAuth,
  agentAuth,
  merchantAuth,
  requireEmailVerification,
  requirePhoneVerification,
  requireKYCVerification,
  requireFullVerification,
  optionalAuth,
  userRateLimit
};