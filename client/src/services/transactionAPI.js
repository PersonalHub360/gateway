import api from './api';

const transactionAPI = {
  // Get all transactions for current user
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update transaction
  updateTransaction: async (transactionId, updateData) => {
    try {
      const response = await api.put(`/transactions/${transactionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel transaction
  cancelTransaction: async (transactionId, reason = '') => {
    try {
      const response = await api.post(`/transactions/${transactionId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Confirm transaction
  confirmTransaction: async (transactionId, confirmationData = {}) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/confirm`, confirmationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction history with filters
  getTransactionHistory: async (filters = {}) => {
    try {
      const response = await api.get('/transactions/history', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction statistics
  getTransactionStats: async (period = '30d') => {
    try {
      const response = await api.get(`/transactions/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search transactions
  searchTransactions: async (searchQuery, filters = {}) => {
    try {
      const response = await api.get('/transactions/search', { 
        params: { q: searchQuery, ...filters } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending transactions
  getPendingTransactions: async () => {
    try {
      const response = await api.get('/transactions/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get failed transactions
  getFailedTransactions: async () => {
    try {
      const response = await api.get('/transactions/failed');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Retry failed transaction
  retryTransaction: async (transactionId) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/retry`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction receipt
  getTransactionReceipt: async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}/receipt`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download transaction receipt
  downloadReceipt: async (transactionId, format = 'pdf') => {
    try {
      const response = await api.get(`/transactions/${transactionId}/receipt/download`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction fees
  getTransactionFees: async (transactionType, amount, currency = 'USD') => {
    try {
      const response = await api.get('/transactions/fees', {
        params: { type: transactionType, amount, currency }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify transaction OTP
  verifyTransactionOTP: async (transactionId, otp) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/verify-otp`, { otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Resend transaction OTP
  resendTransactionOTP: async (transactionId) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/resend-otp`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction limits
  getTransactionLimits: async () => {
    try {
      const response = await api.get('/transactions/limits');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request transaction limit increase
  requestLimitIncrease: async (requestData) => {
    try {
      const response = await api.post('/transactions/limits/increase-request', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get recurring transactions
  getRecurringTransactions: async () => {
    try {
      const response = await api.get('/transactions/recurring');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create recurring transaction
  createRecurringTransaction: async (recurringData) => {
    try {
      const response = await api.post('/transactions/recurring', recurringData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update recurring transaction
  updateRecurringTransaction: async (recurringId, updateData) => {
    try {
      const response = await api.put(`/transactions/recurring/${recurringId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel recurring transaction
  cancelRecurringTransaction: async (recurringId) => {
    try {
      const response = await api.delete(`/transactions/recurring/${recurringId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export transactions
  exportTransactions: async (filters = {}, format = 'csv') => {
    try {
      const response = await api.get('/transactions/export', {
        params: { ...filters, format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default transactionAPI;