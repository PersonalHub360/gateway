const mongoose = require('mongoose');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoURI = process.env.NODE_ENV === 'test' 
        ? process.env.MONGODB_TEST_URI 
        : process.env.MONGODB_URI;

      if (!mongoURI) {
        throw new Error('MongoDB URI is not defined in environment variables');
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoURI, options);
      this.isConnected = true;

      logger.info('MongoDB connected successfully', {
        host: this.connection.connection.host,
        port: this.connection.connection.port,
        database: this.connection.connection.name
      });

      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
        this.isConnected = true;
      });

      mongoose.connection.on('error', (err) => {
        logger.error('Mongoose connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('MongoDB connection closed');
      }
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          message: 'Database is not connected'
        };
      }

      // Ping the database
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'connected',
        message: 'Database is healthy',
        details: {
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          database: mongoose.connection.name,
          readyState: mongoose.connection.readyState,
          collections: Object.keys(mongoose.connection.collections).length
        }
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        message: 'Database health check failed',
        error: error.message
      };
    }
  }

  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      status: states[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    };
  }

  async createIndexes() {
    try {
      logger.info('Creating database indexes...');

      // User indexes
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.collection('users').createIndex({ phone: 1 }, { unique: true, sparse: true });
      await mongoose.connection.collection('users').createIndex({ userType: 1 });
      await mongoose.connection.collection('users').createIndex({ status: 1 });
      await mongoose.connection.collection('users').createIndex({ 'verification.emailVerified': 1 });
      await mongoose.connection.collection('users').createIndex({ 'verification.phoneVerified': 1 });
      await mongoose.connection.collection('users').createIndex({ 'verification.kycStatus': 1 });
      await mongoose.connection.collection('users').createIndex({ createdAt: 1 });

      // Wallet indexes
      await mongoose.connection.collection('wallets').createIndex({ walletId: 1 }, { unique: true });
      await mongoose.connection.collection('wallets').createIndex({ owner: 1 });
      await mongoose.connection.collection('wallets').createIndex({ type: 1 });
      await mongoose.connection.collection('wallets').createIndex({ status: 1 });
      await mongoose.connection.collection('wallets').createIndex({ owner: 1, type: 1 });

      // Transaction indexes
      await mongoose.connection.collection('transactions').createIndex({ transactionId: 1 }, { unique: true });
      await mongoose.connection.collection('transactions').createIndex({ 'sender.userId': 1 });
      await mongoose.connection.collection('transactions').createIndex({ 'receiver.userId': 1 });
      await mongoose.connection.collection('transactions').createIndex({ status: 1 });
      await mongoose.connection.collection('transactions').createIndex({ type: 1 });
      await mongoose.connection.collection('transactions').createIndex({ category: 1 });
      await mongoose.connection.collection('transactions').createIndex({ createdAt: -1 });
      await mongoose.connection.collection('transactions').createIndex({ 'amount.currency': 1 });
      await mongoose.connection.collection('transactions').createIndex({ 
        'sender.userId': 1, 
        'receiver.userId': 1, 
        createdAt: -1 
      });

      // Compound indexes for common queries
      await mongoose.connection.collection('transactions').createIndex({
        status: 1,
        createdAt: -1
      });

      await mongoose.connection.collection('transactions').createIndex({
        type: 1,
        status: 1,
        createdAt: -1
      });

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Error creating database indexes:', error);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Database can only be dropped in test environment');
      }

      await mongoose.connection.dropDatabase();
      logger.info('Test database dropped successfully');
    } catch (error) {
      logger.error('Error dropping database:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      const collectionStats = {};
      for (const collection of collections) {
        const collStats = await mongoose.connection.db.collection(collection.name).stats();
        collectionStats[collection.name] = {
          documents: collStats.count,
          size: collStats.size,
          avgObjSize: collStats.avgObjSize,
          indexes: collStats.nindexes
        };
      }

      return {
        database: stats.db,
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        collectionDetails: collectionStats
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;