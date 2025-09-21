const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trea-gateway', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@treagateway.com' },
        { userType: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@treagateway.com',
      phone: '+1234567890',
      password: 'Admin123!@#', // This will be hashed automatically by the pre-save middleware
      userType: 'admin',
      status: 'active',
      isEmailVerified: true,
      isPhoneVerified: true,
      isKYCVerified: true,
      transactionPIN: '123456', // This will be hashed automatically
      profile: {
        gender: 'other',
        address: {
          street: '123 Admin Street',
          city: 'Admin City',
          state: 'Admin State',
          country: 'Admin Country',
          zipCode: '12345'
        },
        nationality: 'Admin',
        occupation: 'System Administrator'
      },
      twoFactorAuth: {
        enabled: false
      }
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@treagateway.com');
    console.log('🔑 Password: Admin123!@#');
    console.log('📱 Phone: +1234567890');
    console.log('🔢 Transaction PIN: 123456');
    console.log('👤 User Type: admin');
    console.log('✅ Status: active');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    if (error.code === 11000) {
      console.error('Duplicate key error - user with this email or phone already exists');
    }
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeding function
seedAdmin();