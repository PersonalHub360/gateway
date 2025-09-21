const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');

// Generate comprehensive report
router.get('/generate', [
  auth,
  adminAuth,
  query('startDate').isISO8601().withMessage('Invalid start date'),
  query('endDate').isISO8601().withMessage('Invalid end date'),
  query('reportType').optional().isIn(['summary', 'detailed', 'cashin', 'cashout', 'withdrawals', 'commissions']).withMessage('Invalid report type'),
  query('format').optional().isIn(['json', 'csv']).withMessage('Invalid format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { startDate, endDate, reportType = 'summary', format = 'json' } = req.query;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate date range
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }

    // Maximum 1 year range
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end - start > maxRange) {
      return res.status(400).json({
        success: false,
        message: 'Date range cannot exceed 1 year'
      });
    }

    let reportData = {};

    switch (reportType) {
      case 'summary':
        reportData = await generateSummaryReport(start, end);
        break;
      case 'detailed':
        reportData = await generateDetailedReport(start, end);
        break;
      case 'cashin':
        reportData = await generateCashinReport(start, end);
        break;
      case 'cashout':
        reportData = await generateCashoutReport(start, end);
        break;
      case 'withdrawals':
        reportData = await generateWithdrawalReport(start, end);
        break;
      case 'commissions':
        reportData = await generateCommissionReport(start, end);
        break;
      default:
        reportData = await generateSummaryReport(start, end);
    }

    // Add metadata
    reportData.metadata = {
      reportType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.id,
      totalDays: Math.ceil((end - start) / (24 * 60 * 60 * 1000))
    };

    if (format === 'csv') {
      const csv = convertReportToCSV(reportData, reportType);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

// Generate summary report
async function generateSummaryReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  // Cash-in summary
  const cashinSummary = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'cashin', status: 'completed' } },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 },
      avgAmount: { $avg: '$amount' }
    }}
  ]);

  // Cash-in by method
  const cashinByMethod = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'cashin', status: 'completed' } },
    { $group: {
      _id: '$paymentMethod',
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 }
    }},
    { $sort: { totalAmount: -1 } }
  ]);

  // Cash-in by type
  const cashinByType = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'cashin', status: 'completed' } },
    { $group: {
      _id: '$subType',
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 }
    }},
    { $sort: { totalAmount: -1 } }
  ]);

  // Cash-out summary
  const cashoutSummary = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'cashout', status: 'completed' } },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 },
      avgAmount: { $avg: '$amount' }
    }}
  ]);

  // Withdrawal summary
  const withdrawalSummary = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'withdrawal', status: 'completed' } },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 },
      avgAmount: { $avg: '$amount' }
    }}
  ]);

  // Commission summary
  const commissionSummary = await Transaction.aggregate([
    { $match: { ...dateFilter, status: 'completed', 'metadata.commission': { $exists: true } } },
    { $group: {
      _id: null,
      totalCommission: { $sum: '$metadata.commission' },
      totalTransactions: { $sum: 1 }
    }}
  ]);

  // Daily breakdown
  const dailyBreakdown = await Transaction.aggregate([
    { $match: { ...dateFilter, status: 'completed' } },
    { $group: {
      _id: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        type: '$type'
      },
      totalAmount: { $sum: '$amount' },
      totalCount: { $sum: 1 }
    }},
    { $sort: { '_id.date': 1 } }
  ]);

  return {
    summary: {
      cashin: cashinSummary[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
      cashout: cashoutSummary[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
      withdrawals: withdrawalSummary[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 },
      commissions: commissionSummary[0] || { totalCommission: 0, totalTransactions: 0 }
    },
    breakdown: {
      cashinByMethod,
      cashinByType,
      dailyBreakdown
    }
  };
}

// Generate detailed report
async function generateDetailedReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  const transactions = await Transaction.find({
    ...dateFilter,
    status: 'completed'
  })
  .populate('userId', 'email phone userType')
  .populate('walletId', 'currency')
  .sort({ createdAt: -1 })
  .limit(10000); // Limit for performance

  const summary = await generateSummaryReport(startDate, endDate);

  return {
    ...summary,
    transactions: transactions.map(tx => ({
      id: tx._id,
      type: tx.type,
      subType: tx.subType,
      amount: tx.amount,
      currency: tx.walletId?.currency || 'BDT',
      status: tx.status,
      paymentMethod: tx.paymentMethod,
      user: {
        email: tx.userId?.email,
        phone: tx.userId?.phone,
        type: tx.userId?.userType
      },
      createdAt: tx.createdAt,
      completedAt: tx.completedAt,
      description: tx.description,
      commission: tx.metadata?.commission || 0
    }))
  };
}

// Generate cash-in specific report
async function generateCashinReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  const cashinTransactions = await Transaction.find({
    ...dateFilter,
    type: 'cashin'
  })
  .populate('userId', 'email phone userType')
  .sort({ createdAt: -1 });

  // Success rate by payment method
  const successRateByMethod = await Transaction.aggregate([
    { $match: { ...dateFilter, type: 'cashin' } },
    { $group: {
      _id: {
        method: '$paymentMethod',
        status: '$status'
      },
      count: { $sum: 1 }
    }},
    { $group: {
      _id: '$_id.method',
      statuses: {
        $push: {
          status: '$_id.status',
          count: '$count'
        }
      },
      totalCount: { $sum: '$count' }
    }}
  ]);

  // Processing time analysis
  const processingTimes = await Transaction.aggregate([
    { $match: { 
      ...dateFilter, 
      type: 'cashin', 
      status: 'completed',
      completedAt: { $exists: true }
    }},
    { $project: {
      paymentMethod: 1,
      subType: 1,
      processingTime: {
        $divide: [
          { $subtract: ['$completedAt', '$createdAt'] },
          1000 * 60 // Convert to minutes
        ]
      }
    }},
    { $group: {
      _id: {
        method: '$paymentMethod',
        type: '$subType'
      },
      avgProcessingTime: { $avg: '$processingTime' },
      minProcessingTime: { $min: '$processingTime' },
      maxProcessingTime: { $max: '$processingTime' }
    }}
  ]);

  return {
    transactions: cashinTransactions,
    analytics: {
      successRateByMethod,
      processingTimes
    }
  };
}

// Generate cash-out specific report
async function generateCashoutReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  const cashoutTransactions = await Transaction.find({
    ...dateFilter,
    type: 'cashout'
  })
  .populate('userId', 'email phone userType')
  .sort({ createdAt: -1 });

  return {
    transactions: cashoutTransactions
  };
}

// Generate withdrawal specific report
async function generateWithdrawalReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  const withdrawalTransactions = await Transaction.find({
    ...dateFilter,
    type: 'withdrawal'
  })
  .populate('userId', 'email phone userType')
  .sort({ createdAt: -1 });

  return {
    transactions: withdrawalTransactions
  };
}

// Generate commission specific report
async function generateCommissionReport(startDate, endDate) {
  const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

  const commissionTransactions = await Transaction.find({
    ...dateFilter,
    status: 'completed',
    'metadata.commission': { $exists: true, $gt: 0 }
  })
  .populate('userId', 'email phone userType')
  .sort({ createdAt: -1 });

  // Commission by user type
  const commissionByUserType = await Transaction.aggregate([
    { $match: { ...dateFilter, status: 'completed', 'metadata.commission': { $exists: true } } },
    { $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
    }},
    { $unwind: '$user' },
    { $group: {
      _id: '$user.userType',
      totalCommission: { $sum: '$metadata.commission' },
      transactionCount: { $sum: 1 }
    }}
  ]);

  return {
    transactions: commissionTransactions,
    analytics: {
      commissionByUserType
    }
  };
}

// Convert report to CSV format
function convertReportToCSV(reportData, reportType) {
  let csvContent = '';
  
  // Add metadata header
  csvContent += `Report Type,${reportType}\n`;
  csvContent += `Generated At,${reportData.metadata.generatedAt}\n`;
  csvContent += `Date Range,${reportData.metadata.startDate} to ${reportData.metadata.endDate}\n`;
  csvContent += `Total Days,${reportData.metadata.totalDays}\n\n`;

  if (reportType === 'summary') {
    // Summary data
    csvContent += 'Summary\n';
    csvContent += 'Type,Total Amount,Total Count,Average Amount\n';
    csvContent += `Cash In,${reportData.summary.cashin.totalAmount},${reportData.summary.cashin.totalCount},${reportData.summary.cashin.avgAmount}\n`;
    csvContent += `Cash Out,${reportData.summary.cashout.totalAmount},${reportData.summary.cashout.totalCount},${reportData.summary.cashout.avgAmount}\n`;
    csvContent += `Withdrawals,${reportData.summary.withdrawals.totalAmount},${reportData.summary.withdrawals.totalCount},${reportData.summary.withdrawals.avgAmount}\n`;
    csvContent += `Commissions,${reportData.summary.commissions.totalCommission},${reportData.summary.commissions.totalTransactions},\n\n`;

    // Cash-in by method
    csvContent += 'Cash-in by Payment Method\n';
    csvContent += 'Payment Method,Total Amount,Total Count\n';
    reportData.breakdown.cashinByMethod.forEach(item => {
      csvContent += `${item._id},${item.totalAmount},${item.totalCount}\n`;
    });
  } else if (reportData.transactions) {
    // Transaction details
    csvContent += 'Transaction Details\n';
    csvContent += 'ID,Type,Sub Type,Amount,Currency,Status,Payment Method,User Email,User Type,Created At,Completed At,Description,Commission\n';
    
    reportData.transactions.forEach(tx => {
      const row = [
        tx.id || tx._id,
        tx.type,
        tx.subType || '',
        tx.amount,
        tx.currency || tx.walletId?.currency || 'BDT',
        tx.status,
        tx.paymentMethod || '',
        tx.user?.email || tx.userId?.email || '',
        tx.user?.type || tx.userId?.userType || '',
        tx.createdAt,
        tx.completedAt || '',
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        tx.commission || tx.metadata?.commission || 0
      ];
      csvContent += row.join(',') + '\n';
    });
  }

  return csvContent;
}

// Get available report types
router.get('/types', [auth, adminAuth], async (req, res) => {
  try {
    const reportTypes = [
      {
        code: 'summary',
        name: 'Summary Report',
        description: 'Overview of all transactions with key metrics'
      },
      {
        code: 'detailed',
        name: 'Detailed Report',
        description: 'Complete transaction details with user information'
      },
      {
        code: 'cashin',
        name: 'Cash-in Report',
        description: 'Detailed cash-in transactions and analytics'
      },
      {
        code: 'cashout',
        name: 'Cash-out Report',
        description: 'Detailed cash-out transactions'
      },
      {
        code: 'withdrawals',
        name: 'Withdrawal Report',
        description: 'Detailed withdrawal transactions'
      },
      {
        code: 'commissions',
        name: 'Commission Report',
        description: 'Commission earnings and breakdown'
      }
    ];

    res.json({
      success: true,
      data: reportTypes
    });
  } catch (error) {
    logger.error('Get report types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report types'
    });
  }
});

module.exports = router;