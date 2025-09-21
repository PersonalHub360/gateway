const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32 // 256 bits for key derivation
};

// Get encryption key from environment or generate one
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    console.warn('ENCRYPTION_KEY not found in environment variables. Using default key for development.');
    return crypto.scryptSync('default_password', 'default_salt', ENCRYPTION_CONFIG.keyLength);
  }
  
  // If key is provided as hex string
  if (key.length === ENCRYPTION_CONFIG.keyLength * 2) {
    return Buffer.from(key, 'hex');
  }
  
  // Derive key from password
  const salt = process.env.ENCRYPTION_SALT || 'default_salt';
  return crypto.scryptSync(key, salt, ENCRYPTION_CONFIG.keyLength);
};

// Generate a random key
const generateKey = () => {
  return crypto.randomBytes(ENCRYPTION_CONFIG.keyLength);
};

// Generate a random salt
const generateSalt = () => {
  return crypto.randomBytes(ENCRYPTION_CONFIG.saltLength);
};

// Derive key from password using PBKDF2
const deriveKeyFromPassword = (password, salt, iterations = 100000) => {
  return crypto.pbkdf2Sync(password, salt, iterations, ENCRYPTION_CONFIG.keyLength, 'sha256');
};

// Encrypt data
const encrypt = (text, customKey = null) => {
  try {
    const key = customKey || getEncryptionKey();
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv, tag, and encrypted data
    const result = {
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      encrypted: encrypted,
      algorithm: ENCRYPTION_CONFIG.algorithm
    };
    
    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

// Decrypt data
const decrypt = (encryptedData, customKey = null) => {
  try {
    const key = customKey || getEncryptionKey();
    
    // Parse the encrypted data
    const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    
    const iv = Buffer.from(data.iv, 'hex');
    const tag = Buffer.from(data.tag, 'hex');
    const encrypted = data.encrypted;
    
    const decipher = crypto.createDecipher(data.algorithm || ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Encrypt object (converts to JSON first)
const encryptObject = (obj, customKey = null) => {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString, customKey);
};

// Decrypt object (parses JSON after decryption)
const decryptObject = (encryptedData, customKey = null) => {
  const decryptedString = decrypt(encryptedData, customKey);
  return JSON.parse(decryptedString);
};

// Hash data using SHA-256
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Hash data with salt
const hashWithSalt = (data, salt = null) => {
  const actualSalt = salt || generateSalt();
  const hash = crypto.createHash('sha256').update(data + actualSalt.toString('hex')).digest('hex');
  
  return {
    hash,
    salt: actualSalt.toString('hex')
  };
};

// Verify hash with salt
const verifyHash = (data, hash, salt) => {
  const saltBuffer = Buffer.from(salt, 'hex');
  const computedHash = crypto.createHash('sha256').update(data + salt).digest('hex');
  return computedHash === hash;
};

// Generate HMAC
const generateHMAC = (data, secret = null) => {
  const key = secret || process.env.HMAC_SECRET || 'default_hmac_secret';
  return crypto.createHmac('sha256', key).update(data).digest('hex');
};

// Verify HMAC
const verifyHMAC = (data, hmac, secret = null) => {
  const key = secret || process.env.HMAC_SECRET || 'default_hmac_secret';
  const computedHmac = crypto.createHmac('sha256', key).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(computedHmac, 'hex'));
};

// Encrypt sensitive fields in an object
const encryptSensitiveFields = (obj, sensitiveFields = [], customKey = null) => {
  const result = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = encrypt(result[field].toString(), customKey);
    }
  });
  
  return result;
};

// Decrypt sensitive fields in an object
const decryptSensitiveFields = (obj, sensitiveFields = [], customKey = null) => {
  const result = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (result[field] !== undefined && result[field] !== null) {
      try {
        result[field] = decrypt(result[field], customKey);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Keep original value if decryption fails
      }
    }
  });
  
  return result;
};

// Generate secure random token
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate UUID v4
const generateUUID = () => {
  return crypto.randomUUID();
};

// Encrypt wallet data
const encryptWalletData = (walletData) => {
  const sensitiveFields = ['balance', 'privateKey', 'seed', 'mnemonic'];
  return encryptSensitiveFields(walletData, sensitiveFields);
};

// Decrypt wallet data
const decryptWalletData = (encryptedWalletData) => {
  const sensitiveFields = ['balance', 'privateKey', 'seed', 'mnemonic'];
  return decryptSensitiveFields(encryptedWalletData, sensitiveFields);
};

// Encrypt transaction data
const encryptTransactionData = (transactionData) => {
  const sensitiveFields = ['amount', 'fee', 'senderAccount', 'receiverAccount', 'notes'];
  return encryptSensitiveFields(transactionData, sensitiveFields);
};

// Decrypt transaction data
const decryptTransactionData = (encryptedTransactionData) => {
  const sensitiveFields = ['amount', 'fee', 'senderAccount', 'receiverAccount', 'notes'];
  return decryptSensitiveFields(encryptedTransactionData, sensitiveFields);
};

// Encrypt user PII (Personally Identifiable Information)
const encryptUserPII = (userData) => {
  const piiFields = [
    'email', 'phone', 'fullName', 'address', 'dateOfBirth', 
    'nationalId', 'passportNumber', 'bankAccount', 'taxId'
  ];
  return encryptSensitiveFields(userData, piiFields);
};

// Decrypt user PII
const decryptUserPII = (encryptedUserData) => {
  const piiFields = [
    'email', 'phone', 'fullName', 'address', 'dateOfBirth', 
    'nationalId', 'passportNumber', 'bankAccount', 'taxId'
  ];
  return decryptSensitiveFields(encryptedUserData, piiFields);
};

// Create encrypted backup
const createEncryptedBackup = (data, password) => {
  const salt = generateSalt();
  const key = deriveKeyFromPassword(password, salt);
  const encrypted = encrypt(JSON.stringify(data), key);
  
  return {
    backup: encrypted,
    salt: salt.toString('hex'),
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
};

// Restore from encrypted backup
const restoreFromEncryptedBackup = (backupData, password) => {
  const salt = Buffer.from(backupData.salt, 'hex');
  const key = deriveKeyFromPassword(password, salt);
  const decrypted = decrypt(backupData.backup, key);
  
  return JSON.parse(decrypted);
};

// Validate encryption key strength
const validateKeyStrength = (key) => {
  if (!key || key.length < 32) {
    return {
      valid: false,
      error: 'Key must be at least 32 characters long'
    };
  }
  
  const hasUpperCase = /[A-Z]/.test(key);
  const hasLowerCase = /[a-z]/.test(key);
  const hasNumbers = /\d/.test(key);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(key);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  return {
    valid: strength >= 3,
    strength: strength,
    recommendations: {
      upperCase: !hasUpperCase,
      lowerCase: !hasLowerCase,
      numbers: !hasNumbers,
      specialChars: !hasSpecialChars
    }
  };
};

// Test encryption/decryption
const testEncryption = () => {
  try {
    const testData = 'Hello, World! This is a test message.';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);
    
    return {
      success: testData === decrypted,
      original: testData,
      encrypted: encrypted.substring(0, 50) + '...',
      decrypted: decrypted
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  hash,
  hashWithSalt,
  verifyHash,
  generateHMAC,
  verifyHMAC,
  encryptSensitiveFields,
  decryptSensitiveFields,
  generateSecureToken,
  generateUUID,
  generateKey,
  generateSalt,
  deriveKeyFromPassword,
  encryptWalletData,
  decryptWalletData,
  encryptTransactionData,
  decryptTransactionData,
  encryptUserPII,
  decryptUserPII,
  createEncryptedBackup,
  restoreFromEncryptedBackup,
  validateKeyStrength,
  testEncryption,
  ENCRYPTION_CONFIG
};