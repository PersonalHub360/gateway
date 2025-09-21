import api from './api';

const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Suspend user
  suspendUser: async (userId, reason) => {
    try {
      const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Unsuspend user
  unsuspendUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/unsuspend`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/admin/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId, status, reason = '') => {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/status`, { status, reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update system settings
  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get audit logs
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get reports
  getReports: async (reportType, params = {}) => {
    try {
      const response = await api.get(`/admin/reports/${reportType}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate report
  generateReport: async (reportData) => {
    try {
      const response = await api.post('/admin/reports/generate', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment gateways
  getPaymentGateways: async () => {
    try {
      const response = await api.get('/admin/payment-gateways');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update payment gateway
  updatePaymentGateway: async (gatewayId, gatewayData) => {
    try {
      const response = await api.put(`/admin/payment-gateways/${gatewayId}`, gatewayData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system notifications
  getSystemNotifications: async (params = {}) => {
    try {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send system notification
  sendSystemNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user verification requests
  getVerificationRequests: async (params = {}) => {
    try {
      const response = await api.get('/admin/verification-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process verification request
  processVerificationRequest: async (requestId, action, reason = '') => {
    try {
      const response = await api.post(`/admin/verification-requests/${requestId}/process`, { action, reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get system logs
  getSystemLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/system/logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Backup system
  backupSystem: async () => {
    try {
      const response = await api.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get backup history
  getBackupHistory: async () => {
    try {
      const response = await api.get('/admin/system/backups');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default adminAPI;