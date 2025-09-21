const { Sequelize } = require('sequelize');
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
    this.sequelize = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'trea_payment_gateway',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: true
        },
        dialectOptions: {
          charset: 'utf8mb4'
        }
      };

      // Create Sequelize instance
      this.sequelize = new Sequelize(
        dbConfig.database,
        dbConfig.username,
        dbConfig.password,
        dbConfig
      );

      // Test the connection
      await this.sequelize.authenticate();
      this.isConnected = true;

      logger.info('MySQL connected successfully', {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database
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

      return this.sequelize;
    } catch (error) {
      logger.error('MySQL connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.isConnected = false;
        logger.info('MySQL connection closed');
      }
    } catch (error) {
      logger.error('Error closing MySQL connection:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected || !this.sequelize) {
        return {
          status: 'disconnected',
          message: 'Database is not connected'
        };
      }

      // Test the connection
      await this.sequelize.authenticate();
      
      return {
        status: 'connected',
        message: 'Database is healthy',
        details: {
          host: this.sequelize.config.host,
          port: this.sequelize.config.port,
          database: this.sequelize.config.database,
          dialect: this.sequelize.config.dialect
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
    return {
      isConnected: this.isConnected,
      host: this.sequelize?.config?.host || 'unknown',
      port: this.sequelize?.config?.port || 'unknown',
      database: this.sequelize?.config?.database || 'unknown',
      dialect: this.sequelize?.config?.dialect || 'unknown'
    };
  }

  async sync(options = {}) {
    try {
      logger.info('Syncing database models...');
      await this.sequelize.sync(options);
      logger.info('Database models synced successfully');
    } catch (error) {
      logger.error('Error syncing database models:', error);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Database can only be dropped in test environment');
      }

      await this.sequelize.drop();
      logger.info('Test database dropped successfully');
    } catch (error) {
      logger.error('Error dropping database:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const [results] = await this.sequelize.query(`
        SELECT 
          table_name,
          table_rows,
          data_length,
          index_length,
          (data_length + index_length) as total_size
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);

      const tables = {};
      let totalRows = 0;
      let totalSize = 0;

      for (const table of results) {
        tables[table.table_name] = {
          rows: table.table_rows,
          dataSize: table.data_length,
          indexSize: table.index_length,
          totalSize: table.total_size
        };
        totalRows += table.table_rows;
        totalSize += table.total_size;
      }

      return {
        tables,
        totalRows,
        totalSize,
        database: this.sequelize.config.database
      };
    } catch (error) {
      logger.error('Error getting database stats:', error);
      throw error;
    }
  }

  getSequelize() {
    return this.sequelize;
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;