const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { 
    service: 'trea-payment-gateway',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      tailable: true
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      tailable: true
    }),

    // Separate file for transaction logs
    new winston.transports.File({
      filename: path.join(logsDir, 'transactions.log'),
      level: 'info',
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log transaction-related entries
          return info.type === 'transaction' ? info : false;
        })()
      )
    }),

    // Security events log
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760, // 10MB
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          // Only log security-related entries
          return info.type === 'security' ? info : false;
        })()
      )
    })
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760,
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: parseInt(process.env.LOG_MAX_SIZE) || 10485760,
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'debug'
  }));
}

// Custom logging methods for specific use cases
logger.transaction = (message, data = {}) => {
  logger.info(message, {
    type: 'transaction',
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.security = (message, data = {}) => {
  logger.warn(message, {
    type: 'security',
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.audit = (action, userId, data = {}) => {
  logger.info(`Audit: ${action}`, {
    type: 'audit',
    action,
    userId,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.performance = (operation, duration, data = {}) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    type: 'performance',
    operation,
    duration,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.api = (method, url, statusCode, duration, userId = null, data = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger[level](`API: ${method} ${url} - ${statusCode} (${duration}ms)`, {
    type: 'api',
    method,
    url,
    statusCode,
    duration,
    userId,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.database = (operation, collection, duration, data = {}) => {
  logger.info(`Database: ${operation} on ${collection} took ${duration}ms`, {
    type: 'database',
    operation,
    collection,
    duration,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.payment = (gateway, operation, amount, currency, status, data = {}) => {
  logger.info(`Payment: ${gateway} ${operation} ${amount} ${currency} - ${status}`, {
    type: 'payment',
    gateway,
    operation,
    amount,
    currency,
    status,
    ...data,
    timestamp: new Date().toISOString()
  });
};

logger.notification = (type, recipient, status, data = {}) => {
  logger.info(`Notification: ${type} to ${recipient} - ${status}`, {
    type: 'notification',
    notificationType: type,
    recipient,
    status,
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Middleware for Express request logging
logger.requestMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.api(
    req.method,
    req.originalUrl,
    'REQUEST',
    0,
    req.user?.id,
    {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined
    }
  );

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    
    logger.api(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.user?.id,
      {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    originalEnd.apply(this, args);
  };

  next();
};

// Sanitize request body for logging (remove sensitive data)
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'pin',
    'currentPIN',
    'newPIN',
    'transactionPIN',
    'otp',
    'token',
    'secret',
    'key',
    'apiKey',
    'authorization'
  ];

  const sanitized = { ...body };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

// Error handler for logger
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Application shutting down...');
});

process.on('SIGTERM', () => {
  console.log('Application terminated...');
});

module.exports = logger;