import api from './api';

export const walletAPI = {
  // Get wallet information
  getWallet: async () => {
    const response = await api.get('/wallet');
    return response.data;
  },

  getWalletInfo: async () => {
    const response = await api.get('/wallet/info');
    return response.data;
  },

  // Get wallet balance
  getBalance: async (currency = null) => {
    const params = currency ? { currency } : {};
    const response = await api.get('/wallet/balance', { params });
    return response.data;
  },

  // Get wallet transactions
  getWalletTransactions: async (params = {}) => {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  },

  // Transfer money
  transferMoney: async (transferData) => {
    const response = await api.post('/wallet/transfer', transferData);
    return response.data;
  },

  // Request money
  requestMoney: async (requestData) => {
    const response = await api.post('/wallet/request', requestData);
    return response.data;
  },

  // Cash in
  cashIn: async (cashInData) => {
    const response = await api.post('/wallet/cash-in', cashInData);
    return response.data;
  },

  // Cash out
  cashOut: async (cashOutData) => {
    const response = await api.post('/wallet/cash-out', cashOutData);
    return response.data;
  },

  // Get wallet limits
  getLimits: async () => {
    const response = await api.get('/wallet/limits');
    return response.data;
  },

  // Update wallet limits
  updateLimits: async (limits) => {
    const response = await api.put('/wallet/limits', limits);
    return response.data;
  },

  // Get wallet security settings
  getSecuritySettings: async () => {
    const response = await api.get('/wallet/security');
    return response.data;
  },

  // Update wallet security settings
  updateSecuritySettings: async (settings) => {
    const response = await api.put('/wallet/security', settings);
    return response.data;
  },

  // Generate wallet QR code
  generateQRCode: async () => {
    const response = await api.get('/wallet/qr-code');
    return response.data;
  },

  // Get supported currencies
  getSupportedCurrencies: async () => {
    const response = await api.get('/wallet/currencies');
    return response.data;
  },

  // Convert currency
  convertCurrency: async (from, to, amount) => {
    const response = await api.get('/wallet/convert', {
      params: { from, to, amount }
    });
    return response.data;
  },

  // Get exchange rates
  getExchangeRates: async (base = 'USD') => {
    const response = await api.get('/wallet/exchange-rates', {
      params: { base }
    });
    return response.data;
  },

  // Lock wallet
  lockWallet: async (reason) => {
    const response = await api.post('/wallet/lock', { reason });
    return response.data;
  },

  // Unlock wallet
  unlockWallet: async (password) => {
    const response = await api.post('/wallet/unlock', { password });
    return response.data;
  },

  // Get wallet history
  getWalletHistory: async (params = {}) => {
    const response = await api.get('/wallet/history', { params });
    return response.data;
  },

  // Get wallet analytics
  getWalletAnalytics: async (period = 'month') => {
    const response = await api.get('/wallet/analytics', {
      params: { period }
    });
    return response.data;
  },

  // Export wallet data
  exportWalletData: async (format = 'csv', params = {}) => {
    const response = await api.get('/wallet/export', {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  },

  // Additional methods used by walletSlice
  getRecentTransactions: async (limit = 10) => {
    const response = await api.get('/wallet/transactions/recent', {
      params: { limit }
    });
    return response.data;
  },

  freezeWallet: async () => {
    const response = await api.post('/wallet/freeze');
    return response.data;
  },

  unfreezeWallet: async () => {
    const response = await api.post('/wallet/unfreeze');
    return response.data;
  },

  requestBackup: async () => {
    const response = await api.post('/wallet/backup');
    return response.data;
  },

  getWalletStatistics: async (period = 'month') => {
    const response = await api.get('/wallet/statistics', {
      params: { period }
    });
    return response.data;
  },

  getTransferLimits: async () => {
    const response = await api.get('/wallet/transfer-limits');
    return response.data;
  },
};

export default walletAPI;
