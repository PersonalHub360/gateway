// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'trea_token',
  REFRESH_TOKEN_KEY: 'trea_refresh_token',
  USER_KEY: 'trea_user',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  OTP_LENGTH: 6,
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
};

// Transaction Types
export const TRANSACTION_TYPES = {
  TRANSFER: 'transfer',
  CASH_IN: 'cash_in',
  CASH_OUT: 'cash_out',
  PAYMENT: 'payment',
  REFUND: 'refund',
  FEE: 'fee',
  COMMISSION: 'commission',
  BONUS: 'bonus',
  PENALTY: 'penalty',
  ADJUSTMENT: 'adjustment',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  REFUNDED: 'refunded',
  DISPUTED: 'disputed',
};

// Wallet Status
export const WALLET_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  FROZEN: 'frozen',
  CLOSED: 'closed',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  MERCHANT: 'merchant',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// KYC Status
export const KYC_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
};

// Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  TRANSACTION: 'transaction',
  SECURITY: 'security',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
};

// Currency Codes
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  NGN: 'NGN',
  GHS: 'GHS',
  KES: 'KES',
  UGX: 'UGX',
  TZS: 'TZS',
  ZAR: 'ZAR',
  XOF: 'XOF',
  XAF: 'XAF',
};

// Currency Symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  GHS: '₵',
  KES: 'KSh',
  UGX: 'USh',
  TZS: 'TSh',
  ZAR: 'R',
  XOF: 'CFA',
  XAF: 'FCFA',
};

// Payment Methods
export const PAYMENT_METHODS = {
  WALLET: 'wallet',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
  MOBILE_MONEY: 'mobile_money',
  CASH: 'cash',
  CRYPTO: 'crypto',
};

// Document Types
export const DOCUMENT_TYPES = {
  NATIONAL_ID: 'national_id',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
  BUSINESS_REGISTRATION: 'business_registration',
  TAX_CERTIFICATE: 'tax_certificate',
  SELFIE: 'selfie',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'HH:mm',
  MONTH_YEAR: 'MMM yyyy',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PIN_REGEX: /^\d{4,6}$/,
  AMOUNT_REGEX: /^\d+(\.\d{1,2})?$/,
  ACCOUNT_NUMBER_REGEX: /^\d{10,20}$/,
  CARD_NUMBER_REGEX: /^\d{13,19}$/,
  CVV_REGEX: /^\d{3,4}$/,
};

// Transaction Limits
export const TRANSACTION_LIMITS = {
  MIN_TRANSFER: 1,
  MAX_TRANSFER: 1000000,
  MIN_CASH_IN: 10,
  MAX_CASH_IN: 500000,
  MIN_CASH_OUT: 10,
  MAX_CASH_OUT: 500000,
  DAILY_LIMIT: 2000000,
  MONTHLY_LIMIT: 10000000,
};

// Fee Structure
export const FEE_STRUCTURE = {
  TRANSFER_FEE_PERCENTAGE: 0.01, // 1%
  TRANSFER_MIN_FEE: 5,
  TRANSFER_MAX_FEE: 100,
  CASH_IN_FEE_PERCENTAGE: 0.005, // 0.5%
  CASH_OUT_FEE_PERCENTAGE: 0.015, // 1.5%
  INTERNATIONAL_FEE_PERCENTAGE: 0.025, // 2.5%
};

// System Settings
export const SYSTEM_SETTINGS = {
  MAINTENANCE_MODE: false,
  REGISTRATION_ENABLED: true,
  KYC_REQUIRED: true,
  TWO_FA_REQUIRED: false,
  EMAIL_VERIFICATION_REQUIRED: true,
  PHONE_VERIFICATION_REQUIRED: true,
  AUTO_LOGOUT_TIME: 30 * 60 * 1000, // 30 minutes
  SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before logout
};

// UI Constants
export const UI_CONSTANTS = {
  DRAWER_WIDTH: 280,
  MOBILE_DRAWER_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 60,
  SIDEBAR_COLLAPSED_WIDTH: 60,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200,
};

// Chart Colors
export const CHART_COLORS = [
  '#3f51b5',
  '#e91e63',
  '#4caf50',
  '#ff9800',
  '#f44336',
  '#9c27b0',
  '#00bcd4',
  '#8bc34a',
  '#ffc107',
  '#795548',
];

// Status Colors
export const STATUS_COLORS = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  pending: '#ff9800',
  processing: '#2196f3',
  completed: '#4caf50',
  failed: '#f44336',
  cancelled: '#9e9e9e',
  active: '#4caf50',
  inactive: '#9e9e9e',
  suspended: '#ff9800',
  frozen: '#f44336',
};

// Social Login Providers
export const SOCIAL_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  APPLE: 'apple',
};

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  TRANSFER_SUCCESS: 'Transfer completed successfully',
  CASH_IN_SUCCESS: 'Cash in completed successfully',
  CASH_OUT_SUCCESS: 'Cash out completed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PHONE_VERIFIED: 'Phone verified successfully',
  TWO_FA_ENABLED: '2FA enabled successfully',
  TWO_FA_DISABLED: '2FA disabled successfully',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds in your wallet.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EXPIRED_TOKEN: 'Your session has expired. Please login again.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'trea_theme',
  LANGUAGE: 'trea_language',
  CURRENCY: 'trea_currency',
  SIDEBAR_COLLAPSED: 'trea_sidebar_collapsed',
  RECENT_RECIPIENTS: 'trea_recent_recipients',
  TRANSACTION_FILTERS: 'trea_transaction_filters',
  DASHBOARD_PREFERENCES: 'trea_dashboard_preferences',
  NOTIFICATION_PREFERENCES: 'trea_notification_preferences',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_PHONE: '/verify-phone',
  SETUP_2FA: '/setup-2fa',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  WALLET: '/wallet',
  TRANSACTIONS: '/transactions',
  TRANSFER: '/transfer',
  CASH_IN: '/cash-in',
  CASH_OUT: '/cash-out',
  PAYMENTS: '/payments',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  HELP: '/help',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_TRANSACTIONS: '/admin/transactions',
  ADMIN_KYC: '/admin/kyc',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REPORTS: '/admin/reports',
};

// Menu Items
export const MENU_ITEMS = {
  DASHBOARD: {
    title: 'Dashboard',
    icon: 'dashboard',
    path: ROUTES.DASHBOARD,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  WALLET: {
    title: 'Wallet',
    icon: 'account_balance_wallet',
    path: ROUTES.WALLET,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT],
  },
  TRANSACTIONS: {
    title: 'Transactions',
    icon: 'receipt_long',
    path: ROUTES.TRANSACTIONS,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  TRANSFER: {
    title: 'Transfer Money',
    icon: 'send',
    path: ROUTES.TRANSFER,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT],
  },
  CASH_IN: {
    title: 'Cash In',
    icon: 'add_circle',
    path: ROUTES.CASH_IN,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT],
  },
  CASH_OUT: {
    title: 'Cash Out',
    icon: 'remove_circle',
    path: ROUTES.CASH_OUT,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT],
  },
  PAYMENTS: {
    title: 'Payments',
    icon: 'payment',
    path: ROUTES.PAYMENTS,
    roles: [USER_ROLES.USER, USER_ROLES.MERCHANT],
  },
  NOTIFICATIONS: {
    title: 'Notifications',
    icon: 'notifications',
    path: ROUTES.NOTIFICATIONS,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  PROFILE: {
    title: 'Profile',
    icon: 'person',
    path: ROUTES.PROFILE,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  SETTINGS: {
    title: 'Settings',
    icon: 'settings',
    path: ROUTES.SETTINGS,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  HELP: {
    title: 'Help & Support',
    icon: 'help',
    path: ROUTES.HELP,
    roles: [USER_ROLES.USER, USER_ROLES.AGENT, USER_ROLES.MERCHANT, USER_ROLES.ADMIN],
  },
  ADMIN: {
    title: 'Admin Panel',
    icon: 'admin_panel_settings',
    path: ROUTES.ADMIN,
    roles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
  },
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  WALLET_STATUS,
  USER_ROLES,
  KYC_STATUS,
  ACCOUNT_STATUS,
  NOTIFICATION_TYPES,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  PAYMENT_METHODS,
  DOCUMENT_TYPES,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  VALIDATION,
  TRANSACTION_LIMITS,
  FEE_STRUCTURE,
  SYSTEM_SETTINGS,
  UI_CONSTANTS,
  CHART_COLORS,
  STATUS_COLORS,
  SOCIAL_PROVIDERS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  ROUTES,
  MENU_ITEMS,
};