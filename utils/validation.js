const validator = require('validator');

// Common validation patterns
const VALIDATION_PATTERNS = {
  // Phone number patterns for different countries
  phone: {
    BD: /^(\+88)?01[3-9]\d{8}$/, // Bangladesh
    IN: /^(\+91)?[6-9]\d{9}$/, // India
    PK: /^(\+92)?3\d{9}$/, // Pakistan
    AE: /^(\+971)?[5][0-9]\d{7}$/, // UAE
    US: /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // USA
    international: /^(\+\d{1,3}[- ]?)?\d{10}$/
  },
  
  // Currency patterns
  currency: {
    USD: /^\d+(\.\d{1,2})?$/,
    USDT: /^\d+(\.\d{1,6})?$/,
    AED: /^\d+(\.\d{1,2})?$/,
    BDT: /^\d+(\.\d{1,2})?$/,
    INR: /^\d+(\.\d{1,2})?$/,
    PKR: /^\d+(\.\d{1,2})?$/
  },
  
  // Account numbers
  accountNumber: /^[A-Z0-9]{8,20}$/,
  
  // Transaction PIN
  pin: /^\d{4,6}$/,
  
  // OTP
  otp: /^\d{4,8}$/,
  
  // Wallet address patterns
  walletAddress: {
    bitcoin: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    ethereum: /^0x[a-fA-F0-9]{40}$/,
    usdt: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^0x[a-fA-F0-9]{40}$/
  }
};

// Validation rules
const VALIDATION_RULES = {
  user: {
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 8, maxLength: 128 },
    fullName: { required: true, minLength: 2, maxLength: 100 },
    phone: { required: true, type: 'phone' },
    dateOfBirth: { required: false, type: 'date' },
    userType: { required: true, enum: ['personal', 'agent', 'merchant'] }
  },
  
  transaction: {
    amount: { required: true, type: 'currency', min: 0.01 },
    currency: { required: true, enum: ['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR'] },
    type: { required: true, enum: ['cash_in', 'cash_out', 'transfer', 'payment', 'top_up'] },
    description: { required: false, maxLength: 500 }
  },
  
  wallet: {
    type: { required: true, enum: ['personal', 'agent', 'merchant'] },
    currency: { required: true, enum: ['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR'] }
  }
};

// Validate email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true };
};

// Validate password
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (strength < 3) {
    return {
      valid: false,
      error: 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters',
      strength: strength,
      requirements: {
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        numbers: hasNumbers,
        specialChars: hasSpecialChars
      }
    };
  }
  
  return { valid: true, strength: strength };
};

// Validate phone number
const validatePhone = (phone, country = 'international') => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  const pattern = VALIDATION_PATTERNS.phone[country] || VALIDATION_PATTERNS.phone.international;
  
  if (!pattern.test(cleanPhone)) {
    return { valid: false, error: `Invalid phone number format for ${country}` };
  }
  
  return { valid: true, formatted: cleanPhone };
};

// Validate currency amount
const validateCurrencyAmount = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) {
    return { valid: false, error: 'Amount is required' };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (numAmount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }
  
  if (numAmount === 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }
  
  // Check decimal places based on currency
  const decimalPlaces = currency === 'USDT' ? 6 : 2;
  const factor = Math.pow(10, decimalPlaces);
  
  if (Math.round(numAmount * factor) !== numAmount * factor) {
    return { valid: false, error: `Amount can have maximum ${decimalPlaces} decimal places for ${currency}` };
  }
  
  // Check maximum amounts
  const maxAmounts = {
    USD: 1000000,
    USDT: 1000000,
    AED: 3670000, // ~1M USD
    BDT: 110000000, // ~1M USD
    INR: 83000000, // ~1M USD
    PKR: 280000000 // ~1M USD
  };
  
  if (numAmount > (maxAmounts[currency] || 1000000)) {
    return { valid: false, error: `Amount exceeds maximum limit for ${currency}` };
  }
  
  return { valid: true, amount: numAmount };
};

// Validate transaction PIN
const validatePIN = (pin) => {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, error: 'PIN is required' };
  }
  
  if (!VALIDATION_PATTERNS.pin.test(pin)) {
    return { valid: false, error: 'PIN must be 4-6 digits' };
  }
  
  // Check for sequential numbers
  const isSequential = /^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(pin);
  if (isSequential) {
    return { valid: false, error: 'PIN cannot be sequential numbers' };
  }
  
  // Check for repeated digits
  const isRepeated = /^(\d)\1+$/.test(pin);
  if (isRepeated) {
    return { valid: false, error: 'PIN cannot be all same digits' };
  }
  
  return { valid: true };
};

// Validate OTP
const validateOTP = (otp) => {
  if (!otp || typeof otp !== 'string') {
    return { valid: false, error: 'OTP is required' };
  }
  
  if (!VALIDATION_PATTERNS.otp.test(otp)) {
    return { valid: false, error: 'OTP must be 4-8 digits' };
  }
  
  return { valid: true };
};

// Validate wallet address
const validateWalletAddress = (address, type = 'bitcoin') => {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Wallet address is required' };
  }
  
  const pattern = VALIDATION_PATTERNS.walletAddress[type.toLowerCase()];
  if (!pattern) {
    return { valid: false, error: 'Unsupported wallet type' };
  }
  
  if (!pattern.test(address)) {
    return { valid: false, error: `Invalid ${type} wallet address format` };
  }
  
  return { valid: true };
};

// Validate date
const validateDate = (date, options = {}) => {
  if (!date) {
    return { valid: false, error: 'Date is required' };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  const now = new Date();
  
  if (options.minAge) {
    const minDate = new Date();
    minDate.setFullYear(now.getFullYear() - options.minAge);
    
    if (dateObj > minDate) {
      return { valid: false, error: `Must be at least ${options.minAge} years old` };
    }
  }
  
  if (options.maxAge) {
    const maxDate = new Date();
    maxDate.setFullYear(now.getFullYear() - options.maxAge);
    
    if (dateObj < maxDate) {
      return { valid: false, error: `Cannot be more than ${options.maxAge} years old` };
    }
  }
  
  if (options.future === false && dateObj > now) {
    return { valid: false, error: 'Date cannot be in the future' };
  }
  
  if (options.past === false && dateObj < now) {
    return { valid: false, error: 'Date cannot be in the past' };
  }
  
  return { valid: true, date: dateObj };
};

// Sanitize input
const sanitizeInput = (input, options = {}) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  let sanitized = input;
  
  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }
  
  // Escape HTML
  if (options.escapeHtml !== false) {
    sanitized = validator.escape(sanitized);
  }
  
  // Remove special characters
  if (options.alphanumericOnly) {
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
  }
  
  // Normalize whitespace
  if (options.normalizeWhitespace) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }
  
  return sanitized;
};

// Validate object against schema
const validateObject = (obj, schema) => {
  const errors = {};
  const sanitized = {};
  
  // Check required fields
  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    
    // Check if required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }
    
    // Type validation
    if (rules.type) {
      let validation;
      
      switch (rules.type) {
        case 'email':
          validation = validateEmail(value);
          break;
        case 'phone':
          validation = validatePhone(value);
          break;
        case 'currency':
          validation = validateCurrencyAmount(value);
          break;
        case 'pin':
          validation = validatePIN(value);
          break;
        case 'otp':
          validation = validateOTP(value);
          break;
        case 'date':
          validation = validateDate(value, rules.dateOptions || {});
          break;
        default:
          validation = { valid: true };
      }
      
      if (!validation.valid) {
        errors[field] = validation.error;
        continue;
      }
    }
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} must be at least ${rules.minLength} characters long`;
      continue;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} cannot be longer than ${rules.maxLength} characters`;
      continue;
    }
    
    // Numeric validation
    if (rules.min !== undefined) {
      const numValue = parseFloat(value);
      if (numValue < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        continue;
      }
    }
    
    if (rules.max !== undefined) {
      const numValue = parseFloat(value);
      if (numValue > rules.max) {
        errors[field] = `${field} cannot be greater than ${rules.max}`;
        continue;
      }
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(value)) {
      errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
      continue;
    }
    
    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customValidation = rules.custom(value);
      if (!customValidation.valid) {
        errors[field] = customValidation.error;
        continue;
      }
    }
    
    // Sanitize and add to result
    sanitized[field] = sanitizeInput(value, rules.sanitize || {});
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

// Validate user registration data
const validateUserRegistration = (userData) => {
  return validateObject(userData, VALIDATION_RULES.user);
};

// Validate transaction data
const validateTransactionData = (transactionData) => {
  return validateObject(transactionData, VALIDATION_RULES.transaction);
};

// Validate wallet data
const validateWalletData = (walletData) => {
  return validateObject(walletData, VALIDATION_RULES.wallet);
};

// Check for SQL injection patterns
const checkSQLInjection = (input) => {
  if (typeof input !== 'string') {
    return { safe: true };
  }
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|")/,
    /(\bOR\b|\bAND\b).*?[=<>]/i,
    /\b(WAITFOR|DELAY)\b/i
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return {
        safe: false,
        error: 'Potential SQL injection detected',
        pattern: pattern.toString()
      };
    }
  }
  
  return { safe: true };
};

// Check for XSS patterns
const checkXSS = (input) => {
  if (typeof input !== 'string') {
    return { safe: true };
  }
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(input)) {
      return {
        safe: false,
        error: 'Potential XSS attack detected',
        pattern: pattern.toString()
      };
    }
  }
  
  return { safe: true };
};

// Comprehensive security check
const securityCheck = (input) => {
  const sqlCheck = checkSQLInjection(input);
  const xssCheck = checkXSS(input);
  
  return {
    safe: sqlCheck.safe && xssCheck.safe,
    sql: sqlCheck,
    xss: xssCheck
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateCurrencyAmount,
  validatePIN,
  validateOTP,
  validateWalletAddress,
  validateDate,
  sanitizeInput,
  validateObject,
  validateUserRegistration,
  validateTransactionData,
  validateWalletData,
  checkSQLInjection,
  checkXSS,
  securityCheck,
  VALIDATION_PATTERNS,
  VALIDATION_RULES
};