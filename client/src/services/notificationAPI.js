import api from './api';

export const notificationAPI = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  },

  // Delete all notifications (alias for clearAllNotifications)
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  // Get notification settings (alias for getPreferences)
  getNotificationSettings: async () => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings (alias for updatePreferences)
  updateNotificationSettings: async (settings) => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },

  // Send test notification
  sendTestNotification: async (type) => {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  },

  // Subscribe to push notifications
  subscribeToPush: async (subscription) => {
    const response = await api.post('/notifications/push/subscribe', subscription);
    return response.data;
  },

  // Unsubscribe from push notifications
  unsubscribeFromPush: async () => {
    const response = await api.delete('/notifications/push/unsubscribe');
    return response.data;
  },
};

export default notificationAPI;
