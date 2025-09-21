const express = require('express');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for dashboard routes
const dashboardRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many dashboard requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', [auth, dashboardRateLimit], async (req, res) => {
  try {
    // Mock dashboard statistics - in real implementation, this would come from database aggregations
    const stats = {
      totalUsers: 1247,
      activeUsers: 1156,
      totalTransactions: 8943,
      totalVolume: 1256789.50,
      pendingTransactions: 23,
      completedTransactions: 8920,
      failedTransactions: 3,
      totalRevenue: 45678.90,
      monthlyRevenue: 12345.67,
      dailyTransactions: 156,
      averageTransactionValue: 140.75,
      systemUptime: '99.9%',
      lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      securityAlerts: 2,
      maintenanceMode: false
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/recent-transactions
// @desc    Get recent transactions for dashboard
// @access  Private
router.get('/recent-transactions', [auth, dashboardRateLimit], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Mock recent transactions - in real implementation, this would come from transactions collection
    const recentTransactions = [
      {
        id: 'txn_001',
        type: 'transfer',
        amount: 250.00,
        currency: 'USD',
        status: 'completed',
        from: 'John Doe',
        to: 'Jane Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        description: 'Payment for services'
      },
      {
        id: 'txn_002',
        type: 'deposit',
        amount: 1000.00,
        currency: 'USD',
        status: 'completed',
        from: 'Bank Transfer',
        to: 'Alice Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        description: 'Salary deposit'
      },
      {
        id: 'txn_003',
        type: 'withdrawal',
        amount: 500.00,
        currency: 'USD',
        status: 'pending',
        from: 'Bob Wilson',
        to: 'Bank Account',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        description: 'ATM withdrawal'
      },
      {
        id: 'txn_004',
        type: 'transfer',
        amount: 75.50,
        currency: 'USD',
        status: 'completed',
        from: 'Carol Davis',
        to: 'Mike Brown',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        description: 'Split bill payment'
      },
      {
        id: 'txn_005',
        type: 'payment',
        amount: 125.00,
        currency: 'USD',
        status: 'failed',
        from: 'Sarah Lee',
        to: 'Online Store',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        description: 'Online purchase'
      }
    ].slice(0, limit);

    res.json({
      success: true,
      transactions: recentTransactions
    });
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent transactions'
    });
  }
});

// @route   GET /api/dashboard/chart-data
// @desc    Get chart data for dashboard
// @access  Private
router.get('/chart-data', [auth, dashboardRateLimit], async (req, res) => {
  try {
    const type = req.query.type || 'transactions'; // transactions, revenue, users
    
    let chartData = {};
    
    if (type === 'transactions') {
      // Mock transaction volume data for the last 7 days
      chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Transactions',
            data: [120, 145, 98, 167, 203, 89, 156],
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            fill: true
          }
        ]
      };
    } else if (type === 'revenue') {
      // Mock revenue data for the last 7 days
      chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue ($)',
            data: [12500, 18750, 9800, 25600, 30450, 8900, 19500],
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            borderColor: 'rgba(118, 75, 162, 1)',
            borderWidth: 2,
            fill: true
          }
        ]
      };
    } else if (type === 'users') {
      // Mock user growth data for the last 7 days
      chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'New Users',
            data: [15, 23, 12, 31, 28, 8, 19],
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2,
            fill: true
          }
        ]
      };
    }

    res.json({
      success: true,
      chartData
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart data'
    });
  }
});

// @route   GET /api/dashboard/activity-feed
// @desc    Get activity feed for dashboard
// @access  Private
router.get('/activity-feed', [auth, dashboardRateLimit], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Mock activity feed - in real implementation, this would come from activity logs
    const activities = [
      {
        id: 'act_001',
        type: 'user_registration',
        message: 'New user registered: john.doe@example.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        severity: 'info',
        user: 'System'
      },
      {
        id: 'act_002',
        type: 'transaction_completed',
        message: 'Transaction completed: $250.00 transfer',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        severity: 'success',
        user: 'John Doe'
      },
      {
        id: 'act_003',
        type: 'security_alert',
        message: 'Failed login attempt detected from unknown IP',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        severity: 'warning',
        user: 'Security System'
      },
      {
        id: 'act_004',
        type: 'system_maintenance',
        message: 'Scheduled maintenance completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        severity: 'info',
        user: 'System Administrator'
      },
      {
        id: 'act_005',
        type: 'transaction_failed',
        message: 'Transaction failed: Insufficient funds',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        severity: 'error',
        user: 'Sarah Lee'
      }
    ].slice(0, limit);

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity feed'
    });
  }
});

module.exports = router;
