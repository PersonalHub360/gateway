const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // Owner Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Wallet Type
  walletType: {
    type: String,
    enum: ['personal', 'agent', 'merchant', 'system'],
    required: [true, 'Wallet type is required'],
    index: true
  },
  
  // Wallet Identification
  walletId: {
    type: String,
    unique: true,
    required: [true, 'Wallet ID is required'],
    index: true
  },
  
  // Multi-currency balances
  balances: {
    USD: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    },
    USDT: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    },
    AED: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    },
    BDT: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    },
    INR: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    },
    PKR: {
      available: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative']
      },
      pending: {
        type: Number,
        default: 0,
        min: [0, 'Pending balance cannot be negative']
      },
      frozen: {
        type: Number,
        default: 0,
        min: [0, 'Frozen balance cannot be negative']
      }
    }
  },
  
  // Wallet Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'closed'],
    default: 'active',
    index: true
  },
  
  // Security Settings
  security: {
    isLocked: {
      type: Boolean,
      default: false
    },
    lockReason: String,
    lockedAt: Date,
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requiresPINForTransactions: {
      type: Boolean,
      default: true
    },
    dailyTransactionLimit: {
      USD: { type: Number, default: 10000 },
      USDT: { type: Number, default: 10000 },
      AED: { type: Number, default: 36730 },
      BDT: { type: Number, default: 1100000 },
      INR: { type: Number, default: 830000 },
      PKR: { type: Number, default: 2800000 }
    },
    monthlyTransactionLimit: {
      USD: { type: Number, default: 100000 },
      USDT: { type: Number, default: 100000 },
      AED: { type: Number, default: 367300 },
      BDT: { type: Number, default: 11000000 },
      INR: { type: Number, default: 8300000 },
      PKR: { type: Number, default: 28000000 }
    }
  },
  
  // Transaction Statistics
  statistics: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalCashIn: {
      USD: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      AED: { type: Number, default: 0 },
      BDT: { type: Number, default: 0 },
      INR: { type: Number, default: 0 },
      PKR: { type: Number, default: 0 }
    },
    totalCashOut: {
      USD: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      AED: { type: Number, default: 0 },
      BDT: { type: Number, default: 0 },
      INR: { type: Number, default: 0 },
      PKR: { type: Number, default: 0 }
    },
    lastTransactionDate: Date
  },
  
  // Agent specific settings
  agentSettings: {
    commissionWallet: {
      USD: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      AED: { type: Number, default: 0 },
      BDT: { type: Number, default: 0 },
      INR: { type: Number, default: 0 },
      PKR: { type: Number, default: 0 }
    },
    floatBalance: {
      USD: { type: Number, default: 0 },
      USDT: { type: Number, default: 0 },
      AED: { type: Number, default: 0 },
      BDT: { type: Number, default: 0 },
      INR: { type: Number, default: 0 },
      PKR: { type: Number, default: 0 }
    }
  },
  
  // Merchant specific settings
  merchantSettings: {
    settlementAccount: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      swiftCode: String
    },
    autoSettlement: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      minimumAmount: {
        type: Number,
        default: 100
      }
    }
  },
  
  // Backup and Recovery
  backupInfo: {
    seedPhrase: {
      type: String,
      select: false // Never include in queries by default
    },
    privateKey: {
      type: String,
      select: false // Never include in queries by default
    },
    publicKey: String,
    recoveryQuestions: [{
      question: String,
      answerHash: {
        type: String,
        select: false
      }
    }]
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
walletSchema.index({ userId: 1, walletType: 1 });
walletSchema.index({ walletId: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ createdAt: -1 });
walletSchema.index({ 'security.isLocked': 1 });

// Virtual for total balance in USD equivalent
walletSchema.virtual('totalBalanceUSD').get(function() {
  // This would need real-time exchange rates in a real implementation
  const exchangeRates = {
    USD: 1,
    USDT: 1,
    AED: 0.272,
    BDT: 0.0091,
    INR: 0.012,
    PKR: 0.0036
  };
  
  let total = 0;
  Object.keys(this.balances).forEach(currency => {
    const balance = this.balances[currency];
    total += (balance.available + balance.pending) * exchangeRates[currency];
  });
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
});

// Method to get available balance for a currency
walletSchema.methods.getAvailableBalance = function(currency) {
  return this.balances[currency]?.available || 0;
};

// Method to get total balance (available + pending) for a currency
walletSchema.methods.getTotalBalance = function(currency) {
  const balance = this.balances[currency];
  return (balance?.available || 0) + (balance?.pending || 0);
};

// Method to check if wallet has sufficient balance
walletSchema.methods.hasSufficientBalance = function(currency, amount) {
  return this.getAvailableBalance(currency) >= amount;
};

// Method to freeze amount
walletSchema.methods.freezeAmount = function(currency, amount) {
  if (!this.hasSufficientBalance(currency, amount)) {
    throw new Error('Insufficient balance to freeze');
  }
  
  this.balances[currency].available -= amount;
  this.balances[currency].frozen += amount;
  
  return this.save();
};

// Method to unfreeze amount
walletSchema.methods.unfreezeAmount = function(currency, amount) {
  if (this.balances[currency].frozen < amount) {
    throw new Error('Insufficient frozen balance to unfreeze');
  }
  
  this.balances[currency].frozen -= amount;
  this.balances[currency].available += amount;
  
  return this.save();
};

// Method to add pending amount
walletSchema.methods.addPendingAmount = function(currency, amount) {
  this.balances[currency].pending += amount;
  return this.save();
};

// Method to confirm pending amount (move from pending to available)
walletSchema.methods.confirmPendingAmount = function(currency, amount) {
  if (this.balances[currency].pending < amount) {
    throw new Error('Insufficient pending balance to confirm');
  }
  
  this.balances[currency].pending -= amount;
  this.balances[currency].available += amount;
  
  return this.save();
};

// Method to check daily transaction limit
walletSchema.methods.checkDailyLimit = function(currency, amount) {
  const limit = this.security.dailyTransactionLimit[currency];
  // In a real implementation, you'd check today's transactions from the database
  return amount <= limit;
};

// Method to check monthly transaction limit
walletSchema.methods.checkMonthlyLimit = function(currency, amount) {
  const limit = this.security.monthlyTransactionLimit[currency];
  // In a real implementation, you'd check this month's transactions from the database
  return amount <= limit;
};

// Pre-save middleware to update lastAccessedAt
walletSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

// Static method to generate wallet ID
walletSchema.statics.generateWalletId = function(userType) {
  const prefix = {
    personal: 'PW',
    agent: 'AW',
    merchant: 'MW',
    system: 'SW'
  };
  
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  
  return `${prefix[userType]}${timestamp}${random}`.toUpperCase();
};

module.exports = mongoose.model('Wallet', walletSchema);