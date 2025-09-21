const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const database = require('./config/database');
require('dotenv').config();

const app = express();

// Import models
const { initializeModels } = require('./models');

// Routes will be loaded after database connection

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection and route loading
database.connect()
  .then(() => {
    console.log('MySQL connected successfully');
    // Initialize models after database connection
    const models = initializeModels();
    console.log('Models initialized successfully');
    
    // Load routes after models are initialized
    const authRoutes = require('./routes/auth');
    const walletRoutes = require('./routes/wallet');
    const transactionRoutes = require('./routes/transaction');
    const paymentRoutes = require('./routes/payment');
    const cashinRoutes = require('./routes/cashin');
    const reportsRoutes = require('./routes/reports');
    const adminRoutes = require('./routes/admin');
    const userRoutes = require('./routes/user');
    
    // Register routes
    app.use('/api/auth', authRoutes);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/transaction', transactionRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/cashin', cashinRoutes);
    app.use('/api/reports', reportsRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/user', userRoutes);
    
    console.log('Routes loaded successfully');
    
    // Sync database models
    return database.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Trea Payment Gateway API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
    console.error('You can set a different port using: PORT=5001 yarn dev');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});