import api from './api';

export const transactionAPI = {
  // Get user transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Cash in operations
  cashIn: async (cashInData) => {
    const response = await api.post('/transactions/cash-in', cashInData);
    return response.data;
  },

  cashInManual: async (cashInData) => {
    const response = await api.post('/transactions/cash-in/manual', cashInData);
    return response.data;
  },

  // Cash out operations
  cashOut: async (cashOutData) => {
    const response = await api.post('/transactions/cash-out', cashOutData);
    return response.data;
  },

  cashOutManual: async (cashOutData) => {
    const response = await api.post('/transactions/cash-out/manual', cashOutData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (transactionId, transactionData) => {
    const response = await api.put(`/transactions/${transactionId}`, transactionData);
    return response.data;
  },

  // Cancel transaction
  cancelTransaction: async (transactionId, reason) => {
    const response = await api.post(`/transactions/${transactionId}/cancel`, { reason });
    return response.data;
  },

  // Get transaction history
  getTransactionHistory: async (params = {}) => {
    const response = await api.get('/transactions/history', { params });
    return response.data;
  },

  // Get transaction statistics
  getTransactionStats: async (period = 'month') => {
    const response = await api.get('/transactions/stats', { params: { period } });
    return response.data;
  },

  // Export transactions
  exportTransactions: async (format = 'csv', params = {}) => {
    const response = await api.get('/transactions/export', {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  },

  // Get pending transactions
  getPendingTransactions: async () => {
    const response = await api.get('/transactions/pending');
    return response.data;
  },

  // Retry failed transaction
  retryTransaction: async (transactionId) => {
    const response = await api.post(`/transactions/${transactionId}/retry`);
    return response.data;
  },

  // Get transaction fees
  getTransactionFees: async (amount, type, currency = 'USD') => {
    const response = await api.get('/transactions/fees', {
      params: { amount, type, currency }
    });
    return response.data;
  },

  // Validate transaction
  validateTransaction: async (transactionData) => {
    const response = await api.post('/transactions/validate', transactionData);
    return response.data;
  },

  // Get transaction categories
  getTransactionCategories: async () => {
    const response = await api.get('/transactions/categories');
    return response.data;
  },

  // Get transaction types
  getTransactionTypes: async () => {
    const response = await api.get('/transactions/types');
    return response.data;
  },

  // Search transactions
  searchTransactions: async (query, params = {}) => {
    const response = await api.get('/transactions/search', {
      params: { q: query, ...params }
    });
    return response.data;
  },

  // Additional methods used by transactionSlice
  getTransactionStatistics: async (period = 'month') => {
    const response = await api.get('/transactions/statistics', {
      params: { period }
    });
    return response.data;
  },
};

export default transactionAPI;
