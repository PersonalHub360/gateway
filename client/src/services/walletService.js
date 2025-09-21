import api from './api';

class WalletService {
  // Get wallet information
  async getWalletInfo() {
    try {
      const response = await api.get('/wallet/info');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get wallet balance
  async getBalance() {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get wallet transactions
  async getTransactions(params = {}) {
    try {
      const response = await api.get('/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction by ID
  async getTransaction(transactionId) {
    try {
      const response = await api.get(`/wallet/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Transfer money
  async transferMoney(transferData) {
    try {
      const response = await api.post('/wallet/transfer', transferData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cash in (deposit)
  async cashIn(cashInData) {
    try {
      const response = await api.post('/wallet/cash-in', cashInData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cash out (withdrawal)
  async cashOut(cashOutData) {
    try {
      const response = await api.post('/wallet/cash-out', cashOutData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Top up wallet
  async topUp(topUpData) {
    try {
      const response = await api.post('/wallet/top-up', topUpData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Pay bill
  async payBill(billData) {
    try {
      const response = await api.post('/wallet/pay-bill', billData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Buy airtime
  async buyAirtime(airtimeData) {
    try {
      const response = await api.post('/wallet/buy-airtime', airtimeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get pending transactions
  async getPendingTransactions() {
    try {
      const response = await api.get('/wallet/transactions/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Cancel transaction
  async cancelTransaction(transactionId) {
    try {
      const response = await api.post(`/wallet/transactions/${transactionId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Retry transaction
  async retryTransaction(transactionId) {
    try {
      const response = await api.post(`/wallet/transactions/${transactionId}/retry`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(transactionId) {
    try {
      const response = await api.get(`/wallet/transactions/${transactionId}/receipt`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Download transaction receipt
  async downloadTransactionReceipt(transactionId) {
    try {
      const response = await api.get(`/wallet/transactions/${transactionId}/receipt/download`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get wallet statistics
  async getWalletStats(period = '30d') {
    try {
      const response = await api.get('/wallet/stats', { params: { period } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get spending analytics
  async getSpendingAnalytics(params = {}) {
    try {
      const response = await api.get('/wallet/analytics/spending', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get income analytics
  async getIncomeAnalytics(params = {}) {
    try {
      const response = await api.get('/wallet/analytics/income', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Set transaction PIN
  async setTransactionPIN(pin) {
    try {
      const response = await api.post('/wallet/set-pin', { pin });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Change transaction PIN
  async changeTransactionPIN(currentPin, newPin) {
    try {
      const response = await api.post('/wallet/change-pin', { currentPin, newPin });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify transaction PIN
  async verifyTransactionPIN(pin) {
    try {
      const response = await api.post('/wallet/verify-pin', { pin });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Reset transaction PIN
  async resetTransactionPIN() {
    try {
      const response = await api.post('/wallet/reset-pin');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Freeze wallet
  async freezeWallet(reason) {
    try {
      const response = await api.post('/wallet/freeze', { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Unfreeze wallet
  async unfreezeWallet() {
    try {
      const response = await api.post('/wallet/unfreeze');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Set spending limit
  async setSpendingLimit(limit) {
    try {
      const response = await api.post('/wallet/spending-limit', { limit });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get spending limit
  async getSpendingLimit() {
    try {
      const response = await api.get('/wallet/spending-limit');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Remove spending limit
  async removeSpendingLimit() {
    try {
      const response = await api.delete('/wallet/spending-limit');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get wallet settings
  async getWalletSettings() {
    try {
      const response = await api.get('/wallet/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update wallet settings
  async updateWalletSettings(settings) {
    try {
      const response = await api.put('/wallet/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get supported banks
  async getSupportedBanks() {
    try {
      const response = await api.get('/wallet/banks');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get supported payment methods
  async getSupportedPaymentMethods() {
    try {
      const response = await api.get('/wallet/payment-methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify bank account
  async verifyBankAccount(accountData) {
    try {
      const response = await api.post('/wallet/verify-bank-account', accountData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Add bank account
  async addBankAccount(accountData) {
    try {
      const response = await api.post('/wallet/bank-accounts', accountData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get bank accounts
  async getBankAccounts() {
    try {
      const response = await api.get('/wallet/bank-accounts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Remove bank account
  async removeBankAccount(accountId) {
    try {
      const response = await api.delete(`/wallet/bank-accounts/${accountId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Set default bank account
  async setDefaultBankAccount(accountId) {
    try {
      const response = await api.post(`/wallet/bank-accounts/${accountId}/set-default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Export transactions
  async exportTransactions(params = {}) {
    try {
      const response = await api.get('/wallet/transactions/export', {
        params,
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get exchange rates
  async getExchangeRates() {
    try {
      const response = await api.get('/wallet/exchange-rates');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Convert currency
  async convertCurrency(fromCurrency, toCurrency, amount) {
    try {
      const response = await api.post('/wallet/convert-currency', {
        fromCurrency,
        toCurrency,
        amount,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get transaction fees
  async getTransactionFees(transactionType, amount) {
    try {
      const response = await api.get('/wallet/transaction-fees', {
        params: { transactionType, amount },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Calculate transaction fees
  calculateTransactionFees(amount, feeStructure) {
    if (!feeStructure) return 0;

    let fee = 0;

    // Fixed fee
    if (feeStructure.fixed) {
      fee += feeStructure.fixed;
    }

    // Percentage fee
    if (feeStructure.percentage) {
      fee += (amount * feeStructure.percentage) / 100;
    }

    // Minimum fee
    if (feeStructure.minimum && fee < feeStructure.minimum) {
      fee = feeStructure.minimum;
    }

    // Maximum fee
    if (feeStructure.maximum && fee > feeStructure.maximum) {
      fee = feeStructure.maximum;
    }

    return fee;
  }

  // Format currency
  formatCurrency(amount, currency = 'NGN', locale = 'en-NG') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Format transaction status
  formatTransactionStatus(status) {
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      reversed: 'Reversed',
    };

    return statusMap[status] || status;
  }

  // Get transaction status color
  getTransactionStatusColor(status) {
    const colorMap = {
      pending: '#ff9800',
      processing: '#2196f3',
      completed: '#4caf50',
      failed: '#f44336',
      cancelled: '#9e9e9e',
      reversed: '#ff5722',
    };

    return colorMap[status] || '#9e9e9e';
  }
}

// Create and export singleton instance
const walletService = new WalletService();
export default walletService;