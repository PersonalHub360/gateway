import { format, parseISO, isValid, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { CURRENCIES, CURRENCY_SYMBOLS, DATE_FORMATS, VALIDATION } from './constants';

// Currency formatting
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || '$'}0.00`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch (error) {
    // Fallback formatting
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    return `${symbol}${Number(amount).toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (number, decimals = 0, locale = 'en-US') => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(number));
  } catch (error) {
    return Number(number).toFixed(decimals);
  }
};

// Percentage formatting
export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  return `${Number(value).toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date, formatString = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatString);
  } catch (error) {
    return '';
  }
};

// Relative time formatting
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const now = new Date();
    const minutes = differenceInMinutes(now, dateObj);
    const hours = differenceInHours(now, dateObj);
    const days = differenceInDays(now, dateObj);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return formatDate(dateObj, DATE_FORMATS.DISPLAY);
  } catch (error) {
    return '';
  }
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return phoneNumber;
};

// Mask sensitive data
export const maskString = (str, visibleChars = 4, maskChar = '*') => {
  if (!str || str.length <= visibleChars) return str;
  
  const visible = str.slice(-visibleChars);
  const masked = maskChar.repeat(str.length - visibleChars);
  return masked + visible;
};

// Mask email
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username.slice(-1);
  return `${maskedUsername}@${domain}`;
};

// Mask phone number
export const maskPhoneNumber = (phone) => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return masked + visible;
};

// Validation functions
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const isValidPhone = (phone) => {
  return VALIDATION.PHONE_REGEX.test(phone);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8 && VALIDATION.PASSWORD_REGEX.test(password);
};

export const isValidAmount = (amount) => {
  return VALIDATION.AMOUNT_REGEX.test(amount) && parseFloat(amount) > 0;
};

export const isValidPIN = (pin) => {
  return VALIDATION.PIN_REGEX.test(pin);
};

// String utilities
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.split(' ').map(capitalize).join(' ');
};

export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Array utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  });
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      
      const itemValue = item[key];
      if (typeof value === 'string') {
        return itemValue?.toString().toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    });
  });
};

export const paginate = (array, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: page > 1,
    },
  };
};

// Object utilities
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// URL utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Color utilities
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const getContrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error setting localStorage:', error);
    return false;
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing localStorage:', error);
    return false;
  }
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Random utilities
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return result;
};

// Device detection
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = () => {
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
};

export const isDesktop = () => {
  return !isMobile() && !isTablet();
};

// Browser detection
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
  }

  return { browser, version };
};

// Error handling
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  // You can extend this to send errors to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service (e.g., Sentry)
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    context,
  };
};

// Export all utilities
export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  maskString,
  maskEmail,
  maskPhoneNumber,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidAmount,
  isValidPIN,
  capitalize,
  capitalizeWords,
  truncateText,
  slugify,
  groupBy,
  sortBy,
  filterBy,
  paginate,
  deepClone,
  omit,
  pick,
  isEmpty,
  buildQueryString,
  parseQueryString,
  formatFileSize,
  getFileExtension,
  isImageFile,
  hexToRgb,
  rgbToHex,
  getContrastColor,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  debounce,
  throttle,
  generateId,
  generateOTP,
  isMobile,
  isTablet,
  isDesktop,
  getBrowserInfo,
  handleError,
};