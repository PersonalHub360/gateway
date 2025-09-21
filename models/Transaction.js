const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Identification
  transactionId: {
    type: String,
    unique: true,
    required: [true, 'Transaction ID is required'],
    index: true
  },
  
  // Transaction Type and Category
  type: {
    type: String,
    enum: [
      'cash_in', 'cash_out', 'top_up', 'payment', 'transfer', 
      'commission', 'refund', 'fee', 'penalty', 'adjustment'
    ],
    required: [true, 'Transaction type is required'],
    index: true
  },
  
  category: {
    type: String,
    enum: [
      // Cash In Categories
      'auto_merchant_cash_in', 'manual_cash_in',
      
      // Cash Out Categories
      'auto_cash_out', 'manual_cash_out',
      
      // Top Up Categories
      'currency_top_up', 'crypto_top_up',
      
      // Payment Categories
      'electricity_bill', 'water_bill', 'internet_bill', 'mobile_top_up',
      'shop_payment', 'card_payment', 'government_bill',
      
      // Transfer Categories
      'wallet_to_wallet', 'bank_transfer', 'international_transfer',
      
      // System Categories
      'commission_earning', 'service_fee', 'transaction_fee',
      'refund_processing', 'chargeback', 'adjustment'
    ],
    required: [true, 'Transaction category is required'],
    index: true
  },
  
  // Parties Involved
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  fromWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    index: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  toWallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    index: true
  },
  
  // Amount and Currency
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    enum: ['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR'],
    required: [true, 'Currency is required'],
    index: true
  },
  
  // Exchange Rate Information (for currency conversions)
  exchangeRate: {
    fromCurrency: String,
    toCurrency: String,
    rate: Number,
    originalAmount: Number,
    convertedAmount: Number,
    rateProvider: String,
    rateTimestamp: Date
  },
  
  // Fees
  fees: {
    transactionFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    networkFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    },
    feesCurrency: {
      type: String,
      enum: ['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR'],
      default: 'USD'
    }
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: [
      'pending', 'processing', 'completed', 'failed', 
      'cancelled', 'refunded', 'disputed', 'on_hold'
    ],
    default: 'pending',
    required: true,
    index: true
  },
  
  // Status History
  statusHistory: [{
    status: {
      type: String,
      enum: [
        'pending', 'processing', 'completed', 'failed', 
        'cancelled', 'refunded', 'disputed', 'on_hold'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    reason: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Transaction Details
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reference: String, // External reference number
  notes: String, // Internal notes
  
  // Payment Method Information
  paymentMethod: {
    type: {
      type: String,
      enum: ['wallet', 'bank_transfer', 'card', 'mobile_money', 'crypto', 'cash']
    },
    details: {
      // For bank transfers
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      
      // For card payments
      cardType: String,
      cardLast4: String,
      cardBrand: String,
      
      // For mobile money
      mobileProvider: String,
      mobileNumber: String,
      
      // For crypto
      cryptoAddress: String,
      cryptoTxHash: String,
      blockchainNetwork: String
    }
  },
  
  // Bill Payment Specific Information
  billPayment: {
    serviceProvider: String,
    accountNumber: String,
    billAmount: Number,
    billCurrency: String,
    billDueDate: Date,
    billReference: String,
    meterNumber: String, // For utility bills
    connectionId: String // For telecom bills
  },
  
  // Agent/Merchant Information
  agentInfo: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    commission: {
      rate: Number,
      amount: Number,
      currency: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  
  // Security and Verification
  verification: {
    requiresApproval: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    otpVerified: {
      type: Boolean,
      default: false
    },
    pinVerified: {
      type: Boolean,
      default: false
    },
    biometricVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Risk Assessment
  riskAssessment: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    riskFactors: [String],
    flaggedForReview: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  
  // External System Integration
  externalReferences: {
    bankTransactionId: String,
    paymentGatewayId: String,
    blockchainTxId: String,
    merchantTransactionId: String,
    billerTransactionId: String
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceId: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    channel: {
      type: String,
      enum: ['web', 'mobile', 'api', 'agent', 'admin'],
      default: 'web'
    }
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Scheduled Transaction
  scheduledFor: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number, // Every X days/weeks/months/years
    endDate: Date,
    maxOccurrences: Number
  },
  
  // Parent transaction (for refunds, disputes, etc.)
  parentTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Child transactions (for splits, fees, etc.)
  childTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ fromUser: 1, createdAt: -1 });
transactionSchema.index({ toUser: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ category: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ currency: 1, createdAt: -1 });
transactionSchema.index({ 'verification.requiresApproval': 1, status: 1 });
transactionSchema.index({ 'riskAssessment.flaggedForReview': 1 });
transactionSchema.index({ scheduledFor: 1, status: 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2
  }).format(this.amount);
});

// Virtual for transaction duration
transactionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.initiatedAt) {
    return this.completedAt.getTime() - this.initiatedAt.getTime();
  }
  return null;
});

// Method to add status update
transactionSchema.methods.updateStatus = function(newStatus, reason, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    reason: reason,
    updatedBy: updatedBy
  });
  
  // Update relevant timestamps
  switch (newStatus) {
    case 'processing':
      this.processedAt = new Date();
      break;
    case 'completed':
      this.completedAt = new Date();
      break;
    case 'failed':
      this.failedAt = new Date();
      break;
  }
  
  return this.save();
};

// Method to calculate total amount including fees
transactionSchema.methods.getTotalAmount = function() {
  return this.amount + this.fees.totalFees;
};

// Method to check if transaction is pending approval
transactionSchema.methods.isPendingApproval = function() {
  return this.verification.requiresApproval && !this.verification.approvedBy;
};

// Method to approve transaction
transactionSchema.methods.approve = function(approvedBy) {
  this.verification.approvedBy = approvedBy;
  this.verification.approvedAt = new Date();
  return this.save();
};

// Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function(type) {
  const prefix = {
    cash_in: 'CI',
    cash_out: 'CO',
    top_up: 'TU',
    payment: 'PY',
    transfer: 'TR',
    commission: 'CM',
    refund: 'RF',
    fee: 'FE',
    penalty: 'PN',
    adjustment: 'AD'
  };
  
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  
  return `${prefix[type] || 'TX'}${timestamp}${random}`.toUpperCase();
};

// Static method to get transactions by user
transactionSchema.statics.getByUser = function(userId, options = {}) {
  const query = {
    $or: [
      { fromUser: userId },
      { toUser: userId }
    ]
  };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.dateFrom || options.dateTo) {
    query.createdAt = {};
    if (options.dateFrom) query.createdAt.$gte = new Date(options.dateFrom);
    if (options.dateTo) query.createdAt.$lte = new Date(options.dateTo);
  }
  
  return this.find(query)
    .populate('fromUser', 'firstName lastName email')
    .populate('toUser', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

module.exports = mongoose.model('Transaction', transactionSchema);