import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import walletAPI from '../../services/walletAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  balance: 0,
  currency: 'USD',
  walletId: null,
  isActive: false,
  isFrozen: false,
  transactions: [],
  recentTransactions: [],
  isLoading: false,
  error: null,
  transferLimits: {
    daily: 0,
    monthly: 0,
    dailyUsed: 0,
    monthlyUsed: 0,
  },
  statistics: {
    totalSent: 0,
    totalReceived: 0,
    totalTransactions: 0,
    monthlySpending: 0,
  },
};

// Async thunks
export const getWalletInfo = createAsyncThunk(
  'wallet/getWalletInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getWalletInfo();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet info');
    }
  }
);

export const getBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getBalance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

export const transferMoney = createAsyncThunk(
  'wallet/transferMoney',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await walletAPI.transferMoney(transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

export const requestMoney = createAsyncThunk(
  'wallet/requestMoney',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await walletAPI.requestMoney(requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Money request failed');
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'wallet/getTransactionHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getTransactionHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction history');
    }
  }
);

export const getRecentTransactions = createAsyncThunk(
  'wallet/getRecentTransactions',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getRecentTransactions(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent transactions');
    }
  }
);

export const freezeWallet = createAsyncThunk(
  'wallet/freezeWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.freezeWallet();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to freeze wallet');
    }
  }
);

export const unfreezeWallet = createAsyncThunk(
  'wallet/unfreezeWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.unfreezeWallet();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfreeze wallet');
    }
  }
);

export const requestBackup = createAsyncThunk(
  'wallet/requestBackup',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.requestBackup();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Backup request failed');
    }
  }
);

export const getWalletStatistics = createAsyncThunk(
  'wallet/getWalletStatistics',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await walletAPI.getWalletStatistics(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet statistics');
    }
  }
);

export const getTransferLimits = createAsyncThunk(
  'wallet/getTransferLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await walletAPI.getTransferLimits();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transfer limits');
    }
  }
);

// Wallet slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action) => {
      state.recentTransactions.unshift(action.payload);
      if (state.recentTransactions.length > 10) {
        state.recentTransactions.pop();
      }
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.recentTransactions = [];
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Wallet Info
      .addCase(getWalletInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWalletInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.currency = action.payload.currency;
        state.walletId = action.payload.walletId;
        state.isActive = action.payload.isActive;
        state.isFrozen = action.payload.isFrozen;
      })
      .addCase(getWalletInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Balance
      .addCase(getBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.balance;
        state.currency = action.payload.currency;
      })
      .addCase(getBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Transfer Money
      .addCase(transferMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(transferMoney.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balance = action.payload.newBalance;
        state.recentTransactions.unshift(action.payload.transaction);
        if (state.recentTransactions.length > 10) {
          state.recentTransactions.pop();
        }
        toast.success('Transfer completed successfully!');
      })
      .addCase(transferMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Request Money
      .addCase(requestMoney.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestMoney.fulfilled, (state, action) => {
        state.isLoading = false;
        toast.success('Money request sent successfully!');
      })
      .addCase(requestMoney.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Transaction History
      .addCase(getTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Recent Transactions
      .addCase(getRecentTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecentTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentTransactions = action.payload.transactions;
      })
      .addCase(getRecentTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Freeze Wallet
      .addCase(freezeWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(freezeWallet.fulfilled, (state) => {
        state.isLoading = false;
        state.isFrozen = true;
        toast.success('Wallet frozen successfully!');
      })
      .addCase(freezeWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Unfreeze Wallet
      .addCase(unfreezeWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfreezeWallet.fulfilled, (state) => {
        state.isLoading = false;
        state.isFrozen = false;
        toast.success('Wallet unfrozen successfully!');
      })
      .addCase(unfreezeWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Request Backup
      .addCase(requestBackup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestBackup.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Backup request submitted successfully!');
      })
      .addCase(requestBackup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Wallet Statistics
      .addCase(getWalletStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWalletStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
      })
      .addCase(getWalletStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Transfer Limits
      .addCase(getTransferLimits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransferLimits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transferLimits = action.payload.limits;
      })
      .addCase(getTransferLimits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setLoading,
  updateBalance,
  addTransaction,
  clearTransactions,
  setCurrency,
} = walletSlice.actions;

export default walletSlice.reducer;