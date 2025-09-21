import api from './api';

export const adminAPI = {
  // Get admin dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId, reason) => {
    const response = await api.post(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },

  // Transaction Management
  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  getTransactionById: async (transactionId) => {
    const response = await api.get(`/admin/transactions/${transactionId}`);
    return response.data;
  },

  updateTransaction: async (transactionId, transactionData) => {
    const response = await api.put(`/admin/transactions/${transactionId}`, transactionData);
    return response.data;
  },

  refundTransaction: async (transactionId, reason) => {
    const response = await api.post(`/admin/transactions/${transactionId}/refund`, { reason });
    return response.data;
  },

  // System Settings
  getSystemSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Reports
  getReports: async (type, params = {}) => {
    const response = await api.get(`/admin/reports/${type}`, { params });
    return response.data;
  },

  // System Health
  getSystemHealth: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Additional methods used by adminSlice
  getPendingApprovals: async () => {
    const response = await api.get('/admin/transactions/pending-approvals');
    return response.data;
  },

  approveTransaction: async (transactionId) => {
    const response = await api.post(`/admin/transactions/${transactionId}/approve`);
    return response.data;
  },

  rejectTransaction: async (transactionId, reason) => {
    const response = await api.post(`/admin/transactions/${transactionId}/reject`, { reason });
    return response.data;
  },

  getPendingKYC: async (params = {}) => {
    const response = await api.get('/admin/kyc/pending', { params });
    return response.data;
  },

  approveKYC: async (documentId) => {
    const response = await api.post(`/admin/kyc/${documentId}/approve`);
    return response.data;
  },

  rejectKYC: async (documentId, reason) => {
    const response = await api.post(`/admin/kyc/${documentId}/reject`, { reason });
    return response.data;
  },

  generateReport: async (reportConfig) => {
    const response = await api.post('/admin/reports/generate', reportConfig);
    return response.data;
  },

  exportData: async (exportConfig) => {
    const response = await api.post('/admin/export', exportConfig, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default adminAPI;
