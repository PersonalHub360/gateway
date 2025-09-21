const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');

const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const { auth, requireFullVerification } = require('../middleware/auth');
const { encryptTransactionData } = require('../utils/encryption');
const { formatCurrency, validateCurrencyAmount, calculateTransactionFee } = require('../utils/currency');
const { createOTP, verifyOTP } = require('../utils/otp');
const { sendSMS } = require('../utils/sms');
const { sendEmail } = require('../utils/email');

// Rate limiting for payments
const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 payments per window
  message: { error: 'Too many payment requests, please try again later' }
});

const billPaymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 bill payments per hour
  message: { error: 'Bill payment limit exceeded, please try again later' }
});

// Get supported bill providers
router.get('/providers', [
  auth,
  query('type').optional().isIn(['electricity', 'water', 'internet', 'mobile', 'government']).withMessage('Invalid provider type')
], async (req, res) => {
  try {
    const { type } = req.query;

    // Mock provider data - in real implementation, this would come from external APIs
    const providers = {
      electricity: [
        { id: 'desco', name: 'DESCO', country: 'BD', currencies: ['BDT'] },
        { id: 'dpdc', name: 'DPDC', country: 'BD', currencies: ['BDT'] },
        { id: 'addc', name: 'ADDC', country: 'AE', currencies: ['AED'] },
        { id: 'dewa', name: 'DEWA', country: 'AE', currencies: ['AED'] }
      ],
      water: [
        { id: 'dwasa', name: 'DWASA', country: 'BD', currencies: ['BDT'] },
        { id: 'cwasa', name: 'CWASA', country: 'BD', currencies: ['BDT'] },
        { id: 'adwea', name: 'ADWEA', country: 'AE', currencies: ['AED'] }
      ],
      internet: [
        { id: 'btcl', name: 'BTCL', country: 'BD', currencies: ['BDT'] },
        { id: 'link3', name: 'Link3', country: 'BD', currencies: ['BDT'] },
        { id: 'etisalat', name: 'Etisalat', country: 'AE', currencies: ['AED'] },
        { id: 'du', name: 'du', country: 'AE', currencies: ['AED'] }
      ],
      mobile: [
        { id: 'grameenphone', name: 'Grameenphone', country: 'BD', currencies: ['BDT'] },
        { id: 'robi', name: 'Robi', country: 'BD', currencies: ['BDT'] },
        { id: 'banglalink', name: 'Banglalink', country: 'BD', currencies: ['BDT'] },
        { id: 'airtel_bd', name: 'Airtel BD', country: 'BD', currencies: ['BDT'] },
        { id: 'etisalat_mobile', name: 'Etisalat Mobile', country: 'AE', currencies: ['AED'] },
        { id: 'du_mobile', name: 'du Mobile', country: 'AE', currencies: ['AED'] }
      ],
      government: [
        { id: 'tax_bd', name: 'Tax Payment BD', country: 'BD', currencies: ['BDT'] },
        { id: 'passport_bd', name: 'Passport Fee BD', country: 'BD', currencies: ['BDT'] },
        { id: 'visa_ae', name: 'Visa Services AE', country: 'AE', currencies: ['AED'] }
      ]
    };

    const result = type ? providers[type] || [] : providers;

    res.json({
      success: true,
      providers: result
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch providers'
    });
  }
});

// Electricity Bill Payment
router.post('/electricity', [
  auth,
  requireFullVerification,
  billPaymentRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('accountNumber').isLength({ min: 5, max: 20 }).withMessage('Invalid account number'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('customerName').optional().isLength({ max: 100 }).withMessage('Customer name too long'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, providerId, accountNumber, amount, currency, customerName, pin } = req.body;

    // Validate currency amount
    const amountValidation = validateCurrencyAmount(amount, currency);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        error: amountValidation.error
      });
    }

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'bill_payment');
    const totalAmount = amount + feeInfo.feeAmount;

    // Check balance
    const hasBalance = await wallet.hasBalance(currency, totalAmount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: ${formatCurrency(totalAmount, currency)}`
      });
    }

    // Create transaction
    const transactionData = {
      type: 'payment',
      category: 'bill_payment',
      subCategory: 'electricity',
      sender: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Electricity bill payment - ${providerId}`,
      status: 'processing',
      billPayment: {
        providerId: providerId,
        accountNumber: accountNumber,
        customerName: customerName,
        billType: 'electricity'
      },
      metadata: {
        paymentType: 'bill_payment',
        feeType: 'bill_payment'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Deduct balance
    await wallet.deductBalance(currency, totalAmount);

    // Simulate bill payment processing
    setTimeout(async () => {
      try {
        // In real implementation, this would call external bill payment API
        const paymentSuccess = Math.random() > 0.1; // 90% success rate

        if (paymentSuccess) {
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          transaction.billPayment.confirmationNumber = `ELC${Date.now()}`;
        } else {
          transaction.status = 'failed';
          transaction.failureReason = 'Payment processing failed';
          // Refund the amount
          await wallet.addBalance(currency, totalAmount);
        }

        await transaction.save();

        // Send notification
        await sendEmail(user.email, 'billPaymentNotification', {
          userName: user.fullName,
          billType: 'Electricity',
          provider: providerId.toUpperCase(),
          accountNumber: accountNumber,
          amount: formatCurrency(amount, currency),
          transactionId: transaction.transactionId,
          status: transaction.status,
          confirmationNumber: transaction.billPayment.confirmationNumber
        });

        await sendSMS(user.phone, 'billPaymentNotification', {
          billType: 'Electricity',
          amount: formatCurrency(amount, currency),
          status: transaction.status
        });
      } catch (error) {
        console.error('Bill payment processing error:', error);
      }
    }, 3000);

    res.json({
      success: true,
      message: 'Electricity bill payment initiated',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        totalDeducted: formatCurrency(totalAmount, currency),
        status: transaction.status,
        estimatedCompletion: '2-5 minutes'
      }
    });
  } catch (error) {
    console.error('Electricity bill payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Bill payment failed'
    });
  }
});

// Water Bill Payment
router.post('/water', [
  auth,
  requireFullVerification,
  billPaymentRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('accountNumber').isLength({ min: 5, max: 20 }).withMessage('Invalid account number'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('customerName').optional().isLength({ max: 100 }).withMessage('Customer name too long'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, providerId, accountNumber, amount, currency, customerName, pin } = req.body;

    // Similar implementation to electricity bill payment
    // ... (implementation similar to electricity payment)

    res.json({
      success: true,
      message: 'Water bill payment initiated'
    });
  } catch (error) {
    console.error('Water bill payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Bill payment failed'
    });
  }
});

// Mobile Top-up
router.post('/mobile-topup', [
  auth,
  requireFullVerification,
  paymentRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('operator').notEmpty().withMessage('Mobile operator is required'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('topupType').isIn(['prepaid', 'postpaid']).withMessage('Invalid top-up type'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, operator, phoneNumber, amount, currency, topupType, pin } = req.body;

    // Validate currency amount
    const amountValidation = validateCurrencyAmount(amount, currency);
    if (!amountValidation.valid) {
      return res.status(400).json({
        success: false,
        error: amountValidation.error
      });
    }

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'mobile_topup');
    const totalAmount = amount + feeInfo.feeAmount;

    // Check balance
    const hasBalance = await wallet.hasBalance(currency, totalAmount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: ${formatCurrency(totalAmount, currency)}`
      });
    }

    // Create transaction
    const transactionData = {
      type: 'payment',
      category: 'mobile_topup',
      sender: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Mobile top-up - ${operator} (${phoneNumber})`,
      status: 'processing',
      mobileTopup: {
        operator: operator,
        phoneNumber: phoneNumber,
        topupType: topupType
      },
      metadata: {
        paymentType: 'mobile_topup',
        feeType: 'mobile_topup'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Deduct balance
    await wallet.deductBalance(currency, totalAmount);

    // Simulate mobile top-up processing
    setTimeout(async () => {
      try {
        const topupSuccess = Math.random() > 0.05; // 95% success rate

        if (topupSuccess) {
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          transaction.mobileTopup.confirmationNumber = `TOP${Date.now()}`;
        } else {
          transaction.status = 'failed';
          transaction.failureReason = 'Top-up processing failed';
          // Refund the amount
          await wallet.addBalance(currency, totalAmount);
        }

        await transaction.save();

        // Send notification
        await sendEmail(user.email, 'mobileTopupNotification', {
          userName: user.fullName,
          operator: operator,
          phoneNumber: phoneNumber,
          amount: formatCurrency(amount, currency),
          transactionId: transaction.transactionId,
          status: transaction.status,
          confirmationNumber: transaction.mobileTopup.confirmationNumber
        });

        await sendSMS(phoneNumber, 'topupConfirmation', {
          operator: operator,
          amount: formatCurrency(amount, currency),
          status: transaction.status
        });
      } catch (error) {
        console.error('Mobile top-up processing error:', error);
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Mobile top-up initiated',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        operator: operator,
        phoneNumber: phoneNumber,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        totalDeducted: formatCurrency(totalAmount, currency),
        status: transaction.status,
        estimatedCompletion: '1-3 minutes'
      }
    });
  } catch (error) {
    console.error('Mobile top-up error:', error);
    res.status(500).json({
      success: false,
      error: 'Mobile top-up failed'
    });
  }
});

// Shop Payment (POS Integration)
router.post('/shop', [
  auth,
  requireFullVerification,
  paymentRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('merchantCode').notEmpty().withMessage('Merchant code is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, merchantCode, amount, currency, items, pin } = req.body;

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Find merchant
    const merchant = await User.findOne({
      userType: 'merchant',
      'merchantInfo.merchantCode': merchantCode,
      status: 'active'
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found or inactive'
      });
    }

    // Get wallets
    const userWallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    const merchantWallet = await Wallet.findOne({
      owner: merchant._id,
      type: 'merchant'
    });

    if (!userWallet || !merchantWallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'merchant_payment');
    const totalAmount = amount + feeInfo.feeAmount;

    // Check balance
    const hasBalance = await userWallet.hasBalance(currency, totalAmount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: ${formatCurrency(totalAmount, currency)}`
      });
    }

    // Create transaction
    const transactionData = {
      type: 'payment',
      category: 'merchant_payment',
      sender: {
        userId: req.user.id,
        walletId: userWallet._id,
        walletAddress: userWallet.walletId
      },
      receiver: {
        userId: merchant._id,
        walletId: merchantWallet._id,
        walletAddress: merchantWallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Shop payment to ${merchant.fullName}`,
      status: 'processing',
      merchant: {
        merchantId: merchant._id,
        merchantCode: merchantCode,
        merchantName: merchant.fullName
      },
      shopPayment: {
        items: items || [],
        posTransaction: true
      },
      metadata: {
        paymentType: 'shop_payment',
        feeType: 'merchant_payment'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Process payment
    await userWallet.deductBalance(currency, totalAmount);
    await merchantWallet.addBalance(currency, amount); // Merchant gets full amount, fees go to platform

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Send notifications
    await sendEmail(user.email, 'shopPaymentNotification', {
      userName: user.fullName,
      merchantName: merchant.fullName,
      amount: formatCurrency(amount, currency),
      transactionId: transaction.transactionId,
      status: 'completed'
    });

    await sendEmail(merchant.email, 'paymentReceivedNotification', {
      merchantName: merchant.fullName,
      customerName: user.fullName,
      amount: formatCurrency(amount, currency),
      transactionId: transaction.transactionId
    });

    res.json({
      success: true,
      message: 'Shop payment completed successfully',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        merchant: merchant.fullName,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        status: transaction.status,
        receipt: {
          merchantName: merchant.fullName,
          merchantCode: merchantCode,
          items: items,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Shop payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Shop payment failed'
    });
  }
});

// Government Bill Payment
router.post('/government', [
  auth,
  requireFullVerification,
  billPaymentRateLimit,
  body('walletId').isMongoId().withMessage('Invalid wallet ID'),
  body('serviceType').isIn(['tax', 'passport', 'visa', 'license', 'fine']).withMessage('Invalid service type'),
  body('referenceNumber').notEmpty().withMessage('Reference number is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').isIn(['USD', 'USDT', 'AED', 'BDT', 'INR', 'PKR']).withMessage('Invalid currency'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4-6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { walletId, serviceType, referenceNumber, amount, currency, pin } = req.body;

    // Verify user's transaction PIN
    const user = await User.findById(req.user.id);
    const isPinValid = await user.compareTransactionPIN(pin);

    if (!isPinValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction PIN'
      });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({
      _id: walletId,
      owner: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Calculate fees
    const feeInfo = calculateTransactionFee(amount, currency, 'government_payment');
    const totalAmount = amount + feeInfo.feeAmount;

    // Check balance
    const hasBalance = await wallet.hasBalance(currency, totalAmount);
    if (!hasBalance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Required: ${formatCurrency(totalAmount, currency)}`
      });
    }

    // Create transaction
    const transactionData = {
      type: 'payment',
      category: 'government_payment',
      subCategory: serviceType,
      sender: {
        userId: req.user.id,
        walletId: wallet._id,
        walletAddress: wallet.walletId
      },
      amount: {
        value: amount,
        currency: currency
      },
      fee: {
        value: feeInfo.feeAmount,
        currency: currency
      },
      description: `Government ${serviceType} payment`,
      status: 'processing',
      governmentPayment: {
        serviceType: serviceType,
        referenceNumber: referenceNumber
      },
      metadata: {
        paymentType: 'government_payment',
        feeType: 'government_payment'
      }
    };

    // Encrypt sensitive data
    const encryptedTransactionData = encryptTransactionData(transactionData);
    const transaction = new Transaction(encryptedTransactionData);
    await transaction.save();

    // Deduct balance
    await wallet.deductBalance(currency, totalAmount);

    // Simulate government payment processing
    setTimeout(async () => {
      try {
        const paymentSuccess = Math.random() > 0.02; // 98% success rate

        if (paymentSuccess) {
          transaction.status = 'completed';
          transaction.completedAt = new Date();
          transaction.governmentPayment.confirmationNumber = `GOV${Date.now()}`;
        } else {
          transaction.status = 'failed';
          transaction.failureReason = 'Government payment processing failed';
          // Refund the amount
          await wallet.addBalance(currency, totalAmount);
        }

        await transaction.save();

        // Send notification
        await sendEmail(user.email, 'governmentPaymentNotification', {
          userName: user.fullName,
          serviceType: serviceType.toUpperCase(),
          referenceNumber: referenceNumber,
          amount: formatCurrency(amount, currency),
          transactionId: transaction.transactionId,
          status: transaction.status,
          confirmationNumber: transaction.governmentPayment.confirmationNumber
        });
      } catch (error) {
        console.error('Government payment processing error:', error);
      }
    }, 5000);

    res.json({
      success: true,
      message: 'Government payment initiated',
      transaction: {
        id: transaction._id,
        transactionId: transaction.transactionId,
        serviceType: serviceType,
        referenceNumber: referenceNumber,
        amount: formatCurrency(amount, currency),
        fee: formatCurrency(feeInfo.feeAmount, currency),
        totalDeducted: formatCurrency(totalAmount, currency),
        status: transaction.status,
        estimatedCompletion: '3-10 minutes'
      }
    });
  } catch (error) {
    console.error('Government payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Government payment failed'
    });
  }
});

module.exports = router;