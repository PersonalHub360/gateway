import api from './api';

class AdminService {
  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get all users
  async getUsers(params = {}) {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Block/Unblock user
  async toggleUserStatus(userId, action) {
    try {
      const response = await api.post(`/admin/users/${userId}/${action}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get all transactions
  async getTransactions(params = {}) {
    try {
      const response = await api.get('/admin/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    try {
      const response = await api.get(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(transactionId, status, notes = '') {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await api.get('/admin/payment-methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update payment method
  async updatePaymentMethod(methodId, methodData) {
    try {
      const response = await api.put(`/admin/payment-methods/${methodId}`, methodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Toggle payment method status
  async togglePaymentMethodStatus(methodId) {
    try {
      const response = await api.post(`/admin/payment-methods/${methodId}/toggle`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get system settings
  async getSystemSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update system settings
  async updateSystemSettings(settings) {
    try {
      const response = await api.put('/admin/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get audit logs
  async getAuditLogs(params = {}) {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get financial reports
  async getFinancialReports(params = {}) {
    try {
      const response = await api.get('/admin/reports/financial', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get user activity reports
  async getUserActivityReports(params = {}) {
    try {
      const response = await api.get('/admin/reports/user-activity', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction reports
  async getTransactionReports(params = {}) {
    try {
      const response = await api.get('/admin/reports/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Export data
  async exportData(type, params = {}) {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get notifications
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/admin/notifications', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Send notification
  async sendNotification(notificationData) {
    try {
      const response = await api.post('/admin/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Backup database
  async backupDatabase() {
    try {
      const response = await api.post('/admin/system/backup');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get backup history
  async getBackupHistory() {
    try {
      const response = await api.get('/admin/system/backups');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

const adminService = new AdminService();
export default adminService;