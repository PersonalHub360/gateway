const express = require('express');
const { auth } = require('../middleware/auth');
const { query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for notification routes
const notificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many notification requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get user notifications
router.get('/', [
  auth,
  notificationRateLimit,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('unreadOnly').optional().isBoolean().withMessage('UnreadOnly must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Mock notifications - in real implementation, this would come from a notifications collection
    const notifications = [
      {
        id: '1',
        type: 'transaction',
        title: 'Transaction Completed',
        message: 'Your payment of $50.00 has been completed successfully',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        type: 'security',
        title: 'Login from New Device',
        message: 'We detected a login from a new device. If this wasn\'t you, please secure your account.',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        id: '3',
        type: 'system',
        title: 'Maintenance Notice',
        message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM UTC.',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      }
    ];

    // Filter notifications based on unreadOnly parameter
    const filteredNotifications = unreadOnly ? 
      notifications.filter(n => !n.read) : 
      notifications;

    // Paginate notifications
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);

    res.json({
      success: true,
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: filteredNotifications.length,
        totalPages: Math.ceil(filteredNotifications.length / limit)
      },
      unreadCount: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }
});

module.exports = router;
