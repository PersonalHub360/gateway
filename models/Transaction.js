const { DataTypes } = require('sequelize');

const defineTransaction = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(
        'cash_in', 'cash_out', 'top_up', 'payment', 'transfer', 
        'commission', 'refund', 'fee', 'penalty', 'adjustment'
      ),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'auto_merchant_cash_in', 'manual_cash_in',
        'auto_cash_out', 'manual_cash_out',
        'currency_top_up', 'crypto_top_up',
        'electricity_bill', 'water_bill', 'internet_bill', 'mobile_top_up',
        'shop_payment', 'card_payment', 'government_bill',
        'wallet_to_wallet', 'bank_transfer', 'international_transfer',
        'commission_earning', 'service_fee', 'transaction_fee',
        'refund_processing', 'chargeback', 'adjustment'
      ),
      allowNull: false
    },
    sender: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        userId: null,
        walletId: null,
        name: null,
        email: null,
        phone: null
      }
    },
    receiver: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        userId: null,
        walletId: null,
        name: null,
        email: null,
        phone: null,
        bankAccount: null
      }
    },
    amount: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        value: 0,
        currency: 'USD',
        exchangeRate: 1
      }
    },
    fee: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        value: 0,
        currency: 'USD',
        type: 'percentage',
        rate: 0
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending', 'processing', 'completed', 'failed', 'cancelled',
        'pending_verification', 'pending_approval', 'chargeback', 'disputed'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        'wallet', 'bank_transfer', 'credit_card', 'debit_card', 
        'crypto', 'cash', 'mobile_money', 'other'
      ),
      allowNull: true
    },
    subType: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    externalReference: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['transactionId']
      },
      {
        fields: ['type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['status']
      },
      {
        fields: ['paymentMethod']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  // Instance methods
  Transaction.prototype.generateTransactionId = function() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  Transaction.prototype.calculateFee = function(feeRate = 0.025) {
    const amount = this.amount.value;
    const fee = amount * feeRate;
    
    this.fee = {
      value: fee,
      currency: this.amount.currency,
      type: 'percentage',
      rate: feeRate
    };
    
    return fee;
  };

  Transaction.prototype.getNetAmount = function() {
    return this.amount.value - (this.fee?.value || 0);
  };

  Transaction.prototype.canBeCancelled = function() {
    return ['pending', 'processing', 'pending_verification'].includes(this.status);
  };

  Transaction.prototype.canBeRefunded = function() {
    return this.status === 'completed' && this.type !== 'refund';
  };

  Transaction.prototype.markAsProcessing = async function() {
    this.status = 'processing';
    this.processedAt = new Date();
    return this.save();
  };

  Transaction.prototype.markAsCompleted = async function() {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
  };

  Transaction.prototype.markAsFailed = async function(reason = 'Transaction failed') {
    this.status = 'failed';
    this.metadata = {
      ...this.metadata,
      failureReason: reason
    };
    return this.save();
  };

  Transaction.prototype.markAsCancelled = async function(reason = 'Transaction cancelled') {
    this.status = 'cancelled';
    this.metadata = {
      ...this.metadata,
      cancellationReason: reason
    };
    return this.save();
  };

  // Class methods
  Transaction.findByTransactionId = function(transactionId) {
    return this.findOne({
      where: { transactionId }
    });
  };

  Transaction.findByReference = function(reference) {
    return this.findOne({
      where: { reference }
    });
  };

  Transaction.findByExternalReference = function(externalReference) {
    return this.findOne({
      where: { externalReference }
    });
  };

  Transaction.findByUserId = function(userId, options = {}) {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { 'sender.userId': userId },
          { 'receiver.userId': userId }
        ]
      },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  Transaction.findByWalletId = function(walletId, options = {}) {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { 'sender.walletId': walletId },
          { 'receiver.walletId': walletId }
        ]
      },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  Transaction.findByStatus = function(status, options = {}) {
    return this.findAll({
      where: { status },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  Transaction.findByType = function(type, options = {}) {
    return this.findAll({
      where: { type },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  Transaction.findByDateRange = function(startDate, endDate, options = {}) {
    return this.findAll({
      where: {
        createdAt: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      order: [['createdAt', 'DESC']],
      ...options
    });
  };

  Transaction.getStatsByPeriod = async function(startDate, endDate) {
    const stats = await this.findAll({
      where: {
        createdAt: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'type',
        'status',
        'amount',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('JSON_EXTRACT(amount, "$.value")')), 'totalAmount']
      ],
      group: ['type', 'status', 'amount'],
      raw: true
    });
    
    return stats;
  };

  Transaction.generateTransactionId = function() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  };

  // Hooks
  Transaction.beforeCreate(async (transaction) => {
    if (!transaction.transactionId) {
      transaction.transactionId = Transaction.generateTransactionId();
    }
    
    // Auto-calculate fee if not provided
    if (!transaction.fee && transaction.type !== 'commission') {
      transaction.calculateFee();
    }
  });

  Transaction.beforeUpdate(async (transaction) => {
    // Update timestamps based on status changes
    if (transaction.changed('status')) {
      switch (transaction.status) {
        case 'processing':
          transaction.processedAt = new Date();
          break;
        case 'completed':
          transaction.completedAt = new Date();
          break;
      }
    }
  });

  return Transaction;
};

module.exports = defineTransaction;