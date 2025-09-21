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
    
    logger.info('Generating report', {
      userId: req.user.id,
      reportType,
      startDate,
      endDate,
      format
    });

    let reportData;
    
    switch (reportType) {
      case 'summary':
        reportData = await generateSummaryReport(startDate, endDate);
        break;
      case 'detailed':
        reportData = await generateDetailedReport(startDate, endDate);
        break;
      case 'cashin':
        reportData = await generateCashinReport(startDate, endDate);
        break;
      case 'cashout':
        reportData = await generateCashoutReport(startDate, endDate);
        break;
      case 'withdrawals':
        reportData = await generateWithdrawalReport(startDate, endDate);
        break;
      case 'commissions':
        reportData = await generateCommissionReport(startDate, endDate);
        break;
      default:
        reportData = await generateSummaryReport(startDate, endDate);
    }

    if (format === 'csv') {
      const csvData = convertReportToCSV(reportData, reportType);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report_${startDate}_${endDate}.csv"`);
      return res.send(csvData);
    }

    res.json({
      success: true,
      data: {
        reportType,
        period: { startDate, endDate },
        generatedAt: new Date().toISOString(),
        ...reportData
      }
    });

  } catch (error) {
    logger.error('Report generation failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      query: req.query
    });

    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

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
        description: 'All cash-in transactions and deposits'
      },
      {
        code: 'cashout',
        name: 'Cash-out Report',
        description: 'All cash-out transactions and withdrawals'
      },
      {
        code: 'withdrawals',
        name: 'Withdrawal Report',
        description: 'User withdrawal requests and processing status'
      },
      {
        code: 'commissions',
        name: 'Commission Report',
        description: 'Commission earnings and fee breakdown'
      }
    ];

    res.json({
      success: true,
      data: reportTypes
    });

  } catch (error) {
    logger.error('Failed to get report types', {
      error: error.message,
      userId: req.user?.id
    });

    res.status(500).json({
      success: false,
      message: 'Failed to get report types'
    });
  }
});

module.exports = router;