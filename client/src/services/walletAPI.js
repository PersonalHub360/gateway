import api from './api';

const walletAPI = {
  // Get wallet information
  getWalletInfo: async () => {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get wallet balance
  getBalance: async () => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get wallet transactions
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Transfer money
  transferMoney: async (transferData) => {
    try {
      const response = await api.post('/wallet/transfer', transferData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Request money
  requestMoney: async (requestData) => {
    try {
      const response = await api.post('/wallet/request', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cash in
  cashIn: async (cashInData) => {
    try {
      const response = await api.post('/wallet/cash-in', cashInData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cash out
  cashOut: async (cashOutData) => {
    try {
      const response = await api.post('/wallet/cash-out', cashOutData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await api.get('/wallet/payment-methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add payment method
  addPaymentMethod: async (methodData) => {
    try {
      const response = await api.post('/wallet/payment-methods', methodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove payment method
  removePaymentMethod: async (methodId) => {
    try {
      const response = await api.delete(`/wallet/payment-methods/${methodId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get transaction history
  getTransactionHistory: async (filters = {}) => {
    try {
      const response = await api.get('/wallet/history', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get wallet statistics
  getWalletStats: async (period = '30d') => {
    try {
      const response = await api.get(`/wallet/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify transaction
  verifyTransaction: async (transactionId, verificationData) => {
    try {
      const response = await api.post(`/wallet/transactions/${transactionId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cancel transaction
  cancelTransaction: async (transactionId) => {
    try {
      const response = await api.post(`/wallet/transactions/${transactionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get exchange rates
  getExchangeRates: async () => {
    try {
      const response = await api.get('/wallet/exchange-rates');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Set wallet PIN
  setWalletPIN: async (pinData) => {
    try {
      const response = await api.post('/wallet/set-pin', pinData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify wallet PIN
  verifyWalletPIN: async (pin) => {
    try {
      const response = await api.post('/wallet/verify-pin', { pin });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default walletAPI;