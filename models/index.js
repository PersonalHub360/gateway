const database = require('../config/database');
const defineUser = require('./User');
const defineWallet = require('./Wallet');
const defineTransaction = require('./Transaction');

let User, Wallet, Transaction, sequelize;

const initializeModels = () => {
  if (sequelize) {
    return { User, Wallet, Transaction, sequelize };
  }

  sequelize = database.getSequelize();
  
  if (!sequelize) {
    throw new Error('Database not connected. Call database.connect() first.');
  }

  // Initialize models
  User = defineUser(sequelize);
  Wallet = defineWallet(sequelize);
  Transaction = defineTransaction(sequelize);

  // Define associations
  User.hasMany(Wallet, {
    foreignKey: 'userId',
    as: 'wallets'
  });

  Wallet.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasMany(Transaction, {
    foreignKey: 'sender.userId',
    as: 'sentTransactions',
    sourceKey: 'id'
  });

  User.hasMany(Transaction, {
    foreignKey: 'receiver.userId',
    as: 'receivedTransactions',
    sourceKey: 'id'
  });

  Transaction.belongsTo(User, {
    foreignKey: 'sender.userId',
    as: 'senderUser',
    targetKey: 'id'
  });

  Transaction.belongsTo(User, {
    foreignKey: 'receiver.userId',
    as: 'receiverUser',
    targetKey: 'id'
  });

  Wallet.hasMany(Transaction, {
    foreignKey: 'sender.walletId',
    as: 'sentTransactions',
    sourceKey: 'walletId'
  });

  Wallet.hasMany(Transaction, {
    foreignKey: 'receiver.walletId',
    as: 'receivedTransactions',
    sourceKey: 'walletId'
  });

  Transaction.belongsTo(Wallet, {
    foreignKey: 'sender.walletId',
    as: 'senderWallet',
    targetKey: 'walletId'
  });

  Transaction.belongsTo(Wallet, {
    foreignKey: 'receiver.walletId',
    as: 'receiverWallet',
    targetKey: 'walletId'
  });

  return { User, Wallet, Transaction, sequelize };
};

// Export models and database instance
module.exports = {
  database,
  initializeModels,
  get sequelize() {
    return sequelize;
  },
  get User() {
    if (!User) initializeModels();
    return User;
  },
  get Wallet() {
    if (!Wallet) initializeModels();
    return Wallet;
  },
  get Transaction() {
    if (!Transaction) initializeModels();
    return Transaction;
  }
};