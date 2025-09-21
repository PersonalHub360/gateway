const { DataTypes } = require('sequelize');

const defineWallet = (sequelize) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    walletType: {
      type: DataTypes.ENUM('personal', 'agent', 'merchant', 'system'),
      allowNull: false
    },
    walletId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    balances: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        USD: { available: 0, pending: 0, frozen: 0 },
        USDT: { available: 0, pending: 0, frozen: 0 },
        AED: { available: 0, pending: 0, frozen: 0 },
        BDT: { available: 0, pending: 0, frozen: 0 },
        INR: { available: 0, pending: 0, frozen: 0 },
        PKR: { available: 0, pending: 0, frozen: 0 }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'frozen', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    },
    limits: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        daily: {
          USD: 10000,
          USDT: 10000,
          AED: 36700,
          BDT: 1100000,
          INR: 830000,
          PKR: 2800000
        },
        monthly: {
          USD: 100000,
          USDT: 100000,
          AED: 367000,
          BDT: 11000000,
          INR: 8300000,
          PKR: 28000000
        },
        transaction: {
          min: 1,
          max: 10000
        }
      }
    },
    security: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        pin: null,
        twoFactorRequired: false,
        withdrawalConfirmationRequired: true,
        maxDailyWithdrawals: 5
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'wallets',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['walletId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['walletType']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  Wallet.prototype.getBalance = function(currency = 'USD') {
    return this.balances[currency]?.available || 0;
  };

  Wallet.prototype.getTotalBalance = function(currency = 'USD') {
    const balance = this.balances[currency] || { available: 0, pending: 0, frozen: 0 };
    return balance.available + balance.pending + balance.frozen;
  };

  Wallet.prototype.canWithdraw = function(amount, currency = 'USD') {
    const balance = this.balances[currency];
    if (!balance) return false;
    
    return balance.available >= amount && this.status === 'active';
  };

  Wallet.prototype.addBalance = async function(amount, currency = 'USD', type = 'available') {
    const balance = this.balances[currency] || { available: 0, pending: 0, frozen: 0 };
    balance[type] = (balance[type] || 0) + amount;
    
    this.balances = {
      ...this.balances,
      [currency]: balance
    };
    
    return this.save();
  };

  Wallet.prototype.subtractBalance = async function(amount, currency = 'USD', type = 'available') {
    const balance = this.balances[currency] || { available: 0, pending: 0, frozen: 0 };
    
    if (balance[type] < amount) {
      throw new Error('Insufficient balance');
    }
    
    balance[type] -= amount;
    
    this.balances = {
      ...this.balances,
      [currency]: balance
    };
    
    return this.save();
  };

  Wallet.prototype.moveBalance = async function(fromType, toType, amount, currency = 'USD') {
    const balance = this.balances[currency] || { available: 0, pending: 0, frozen: 0 };
    
    if (balance[fromType] < amount) {
      throw new Error(`Insufficient ${fromType} balance`);
    }
    
    balance[fromType] -= amount;
    balance[toType] = (balance[toType] || 0) + amount;
    
    this.balances = {
      ...this.balances,
      [currency]: balance
    };
    
    return this.save();
  };

  Wallet.prototype.freezeBalance = async function(amount, currency = 'USD') {
    return this.moveBalance('available', 'frozen', amount, currency);
  };

  Wallet.prototype.unfreezeBalance = async function(amount, currency = 'USD') {
    return this.moveBalance('frozen', 'available', amount, currency);
  };

  Wallet.prototype.pendingBalance = async function(amount, currency = 'USD') {
    return this.moveBalance('available', 'pending', amount, currency);
  };

  Wallet.prototype.confirmBalance = async function(amount, currency = 'USD') {
    return this.moveBalance('pending', 'available', amount, currency);
  };

  Wallet.prototype.rejectBalance = async function(amount, currency = 'USD') {
    return this.moveBalance('pending', 'available', amount, currency);
  };

  // Class methods
  Wallet.findByWalletId = function(walletId) {
    return this.findOne({
      where: { walletId }
    });
  };

  Wallet.findByUserId = function(userId) {
    return this.findAll({
      where: { userId }
    });
  };

  Wallet.findByUserAndType = function(userId, walletType) {
    return this.findOne({
      where: { 
        userId,
        walletType 
      }
    });
  };

  Wallet.generateWalletId = function(userType) {
    const prefix = {
      personal: 'PER',
      agent: 'AGT',
      merchant: 'MER',
      system: 'SYS'
    };
    
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix[userType] || 'PER'}${randomNum}`;
  };

  Wallet.getTotalBalances = async function(userId) {
    const wallets = await this.findAll({
      where: { userId }
    });
    
    const totals = {
      USD: { available: 0, pending: 0, frozen: 0 },
      USDT: { available: 0, pending: 0, frozen: 0 },
      AED: { available: 0, pending: 0, frozen: 0 },
      BDT: { available: 0, pending: 0, frozen: 0 },
      INR: { available: 0, pending: 0, frozen: 0 },
      PKR: { available: 0, pending: 0, frozen: 0 }
    };
    
    wallets.forEach(wallet => {
      Object.keys(totals).forEach(currency => {
        const balance = wallet.balances[currency] || { available: 0, pending: 0, frozen: 0 };
        totals[currency].available += balance.available || 0;
        totals[currency].pending += balance.pending || 0;
        totals[currency].frozen += balance.frozen || 0;
      });
    });
    
    return totals;
  };

  // Hooks
  Wallet.beforeCreate(async (wallet) => {
    if (!wallet.walletId) {
      wallet.walletId = Wallet.generateWalletId(wallet.walletType);
    }
  });

  return Wallet;
};

module.exports = defineWallet;