const crypto = require('crypto');

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// OTP configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 10,
  maxAttempts: 3,
  cooldownMinutes: 1, // Cooldown between OTP requests
  charset: '0123456789' // Only digits for better user experience
};

// Generate OTP
const generateOTP = (length = OTP_CONFIG.length) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += OTP_CONFIG.charset.charAt(Math.floor(Math.random() * OTP_CONFIG.charset.length));
  }
  return otp;
};

// Generate secure OTP using crypto
const generateSecureOTP = (length = OTP_CONFIG.length) => {
  const buffer = crypto.randomBytes(length);
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += OTP_CONFIG.charset.charAt(buffer[i] % OTP_CONFIG.charset.length);
  }
  return otp;
};

// Store OTP with metadata
const storeOTP = (identifier, otp, purpose = 'verification') => {
  const key = `${identifier}:${purpose}`;
  const expiryTime = Date.now() + (OTP_CONFIG.expiryMinutes * 60 * 1000);
  
  otpStorage.set(key, {
    otp,
    expiryTime,
    attempts: 0,
    maxAttempts: OTP_CONFIG.maxAttempts,
    createdAt: Date.now(),
    purpose
  });

  // Auto cleanup after expiry
  setTimeout(() => {
    otpStorage.delete(key);
  }, OTP_CONFIG.expiryMinutes * 60 * 1000 + 60000); // Extra minute for cleanup

  return {
    otp,
    expiryTime,
    expiryMinutes: OTP_CONFIG.expiryMinutes
  };
};

// Verify OTP
const verifyOTP = (identifier, inputOTP, purpose = 'verification') => {
  const key = `${identifier}:${purpose}`;
  const otpData = otpStorage.get(key);

  if (!otpData) {
    return {
      success: false,
      error: 'OTP_NOT_FOUND',
      message: 'OTP not found or expired'
    };
  }

  // Check if OTP has expired
  if (Date.now() > otpData.expiryTime) {
    otpStorage.delete(key);
    return {
      success: false,
      error: 'OTP_EXPIRED',
      message: 'OTP has expired'
    };
  }

  // Check if max attempts exceeded
  if (otpData.attempts >= otpData.maxAttempts) {
    otpStorage.delete(key);
    return {
      success: false,
      error: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'Maximum verification attempts exceeded'
    };
  }

  // Increment attempt count
  otpData.attempts++;

  // Verify OTP
  if (otpData.otp === inputOTP) {
    otpStorage.delete(key); // Remove OTP after successful verification
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } else {
    // Update attempts in storage
    otpStorage.set(key, otpData);
    
    const remainingAttempts = otpData.maxAttempts - otpData.attempts;
    return {
      success: false,
      error: 'INVALID_OTP',
      message: `Invalid OTP. ${remainingAttempts} attempts remaining`,
      remainingAttempts
    };
  }
};

// Check if user can request new OTP (cooldown check)
const canRequestOTP = (identifier, purpose = 'verification') => {
  const key = `${identifier}:${purpose}`;
  const otpData = otpStorage.get(key);

  if (!otpData) {
    return { canRequest: true };
  }

  const cooldownTime = OTP_CONFIG.cooldownMinutes * 60 * 1000;
  const timeSinceCreation = Date.now() - otpData.createdAt;

  if (timeSinceCreation < cooldownTime) {
    const remainingCooldown = Math.ceil((cooldownTime - timeSinceCreation) / 1000);
    return {
      canRequest: false,
      error: 'COOLDOWN_ACTIVE',
      message: `Please wait ${remainingCooldown} seconds before requesting a new OTP`,
      remainingSeconds: remainingCooldown
    };
  }

  return { canRequest: true };
};

// Generate and store OTP
const createOTP = (identifier, purpose = 'verification', options = {}) => {
  // Check cooldown
  const cooldownCheck = canRequestOTP(identifier, purpose);
  if (!cooldownCheck.canRequest) {
    return cooldownCheck;
  }

  // Generate OTP
  const otp = options.secure ? generateSecureOTP(options.length) : generateOTP(options.length);
  
  // Store OTP
  const otpInfo = storeOTP(identifier, otp, purpose);

  return {
    success: true,
    otp: otpInfo.otp,
    expiryTime: otpInfo.expiryTime,
    expiryMinutes: otpInfo.expiryMinutes,
    message: `OTP generated successfully. Valid for ${otpInfo.expiryMinutes} minutes.`
  };
};

// Get OTP status
const getOTPStatus = (identifier, purpose = 'verification') => {
  const key = `${identifier}:${purpose}`;
  const otpData = otpStorage.get(key);

  if (!otpData) {
    return {
      exists: false,
      message: 'No active OTP found'
    };
  }

  const isExpired = Date.now() > otpData.expiryTime;
  const remainingTime = Math.max(0, Math.ceil((otpData.expiryTime - Date.now()) / 1000));
  const remainingAttempts = otpData.maxAttempts - otpData.attempts;

  return {
    exists: true,
    isExpired,
    remainingTime,
    remainingAttempts,
    attempts: otpData.attempts,
    maxAttempts: otpData.maxAttempts,
    createdAt: new Date(otpData.createdAt),
    expiryTime: new Date(otpData.expiryTime),
    purpose: otpData.purpose
  };
};

// Invalidate OTP
const invalidateOTP = (identifier, purpose = 'verification') => {
  const key = `${identifier}:${purpose}`;
  const deleted = otpStorage.delete(key);
  
  return {
    success: deleted,
    message: deleted ? 'OTP invalidated successfully' : 'No OTP found to invalidate'
  };
};

// Clean expired OTPs (maintenance function)
const cleanExpiredOTPs = () => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, otpData] of otpStorage.entries()) {
    if (now > otpData.expiryTime) {
      otpStorage.delete(key);
      cleanedCount++;
    }
  }

  console.log(`Cleaned ${cleanedCount} expired OTPs`);
  return cleanedCount;
};

// Get OTP statistics
const getOTPStats = () => {
  const now = Date.now();
  let activeCount = 0;
  let expiredCount = 0;
  const purposeStats = {};

  for (const [key, otpData] of otpStorage.entries()) {
    if (now > otpData.expiryTime) {
      expiredCount++;
    } else {
      activeCount++;
    }

    purposeStats[otpData.purpose] = (purposeStats[otpData.purpose] || 0) + 1;
  }

  return {
    total: otpStorage.size,
    active: activeCount,
    expired: expiredCount,
    byPurpose: purposeStats
  };
};

// Validate OTP format
const validateOTPFormat = (otp) => {
  if (!otp || typeof otp !== 'string') {
    return {
      valid: false,
      error: 'OTP must be a string'
    };
  }

  if (otp.length !== OTP_CONFIG.length) {
    return {
      valid: false,
      error: `OTP must be ${OTP_CONFIG.length} digits long`
    };
  }

  if (!/^\d+$/.test(otp)) {
    return {
      valid: false,
      error: 'OTP must contain only digits'
    };
  }

  return { valid: true };
};

// Hash OTP for secure storage (if storing in database)
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp + process.env.OTP_SALT || 'default_salt').digest('hex');
};

// Verify hashed OTP
const verifyHashedOTP = (inputOTP, hashedOTP) => {
  const inputHash = hashOTP(inputOTP);
  return inputHash === hashedOTP;
};

// Generate backup codes (for 2FA recovery)
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateSecureOTP(8));
  }
  return codes;
};

// Start cleanup interval (call this when server starts)
const startCleanupInterval = (intervalMinutes = 30) => {
  setInterval(() => {
    cleanExpiredOTPs();
  }, intervalMinutes * 60 * 1000);
  
  console.log(`OTP cleanup interval started: every ${intervalMinutes} minutes`);
};

module.exports = {
  generateOTP,
  generateSecureOTP,
  createOTP,
  verifyOTP,
  canRequestOTP,
  getOTPStatus,
  invalidateOTP,
  cleanExpiredOTPs,
  getOTPStats,
  validateOTPFormat,
  hashOTP,
  verifyHashedOTP,
  generateBackupCodes,
  startCleanupInterval,
  OTP_CONFIG
};