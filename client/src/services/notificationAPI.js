import api from './api';

const notificationAPI = {
  // Get all notifications for current user
  getNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await api.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Subscribe to push notifications
  subscribeToPush: async (subscription) => {
    try {
      const response = await api.post('/notifications/push/subscribe', subscription);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async () => {
    try {
      const response = await api.post('/notifications/push/unsubscribe');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    try {
      const response = await api.get(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notifications by type
  getNotificationsByType: async (type, params = {}) => {
    try {
      const response = await api.get(`/notifications/type/${type}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recent notifications
  getRecentNotifications: async (limit = 10) => {
    try {
      const response = await api.get(`/notifications/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Archive notification
  archiveNotification: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/archive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unarchive notification
  unarchiveNotification: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/unarchive`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get archived notifications
  getArchivedNotifications: async (params = {}) => {
    try {
      const response = await api.get('/notifications/archived', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Snooze notification
  snoozeNotification: async (notificationId, snoozeUntil) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/snooze`, { snoozeUntil });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get snoozed notifications
  getSnoozedNotifications: async () => {
    try {
      const response = await api.get('/notifications/snoozed');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Test notification
  testNotification: async (notificationType) => {
    try {
      const response = await api.post('/notifications/test', { type: notificationType });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notification templates
  getTemplates: async () => {
    try {
      const response = await api.get('/notifications/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create custom notification
  createCustomNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications/custom', notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notification history
  getNotificationHistory: async (params = {}) => {
    try {
      const response = await api.get('/notifications/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export notifications
  exportNotifications: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/notifications/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get notification statistics
  getNotificationStats: async (period = '30d') => {
    try {
      const response = await api.get(`/notifications/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update notification status
  updateNotificationStatus: async (notificationId, status) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk update notifications
  bulkUpdateNotifications: async (notificationIds, updateData) => {
    try {
      const response = await api.put('/notifications/bulk-update', {
        notificationIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default notificationAPI;