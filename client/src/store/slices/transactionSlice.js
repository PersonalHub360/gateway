import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionAPI from '../../services/transactionAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  transactions: [],
  currentTransaction: null,
  pendingTransactions: [],
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  statistics: {
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
  },
};

// Async thunks
export const getTransactions = createAsyncThunk(
  'transaction/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const getTransactionById = createAsyncThunk(
  'transaction/getTransactionById',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactionById(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction details');
    }
  }
);

export const cashIn = createAsyncThunk(
  'transaction/cashIn',
  async (cashInData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.cashIn(cashInData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cash in failed');
    }
  }
);

export const cashInManual = createAsyncThunk(
  'transaction/cashInManual',
  async (cashInData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.cashInManual(cashInData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Manual cash in failed');
    }
  }
);

export const cashOut = createAsyncThunk(
  'transaction/cashOut',
  async (cashOutData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.cashOut(cashOutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cash out failed');
    }
  }
);

export const cashOutManual = createAsyncThunk(
  'transaction/cashOutManual',
  async (cashOutData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.cashOutManual(cashOutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Manual cash out failed');
    }
  }
);

export const getPendingTransactions = createAsyncThunk(
  'transaction/getPendingTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getPendingTransactions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending transactions');
    }
  }
);

export const cancelTransaction = createAsyncThunk(
  'transaction/cancelTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.cancelTransaction(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel transaction');
    }
  }
);

export const retryTransaction = createAsyncThunk(
  'transaction/retryTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.retryTransaction(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retry transaction');
    }
  }
);

export const getTransactionStatistics = createAsyncThunk(
  'transaction/getTransactionStatistics',
  async (period = '30d', { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactionStatistics(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction statistics');
    }
  }
);

export const exportTransactions = createAsyncThunk(
  'transaction/exportTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.exportTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export transactions');
    }
  }
);

// Transaction slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        status: 'all',
        dateRange: 'all',
        minAmount: '',
        maxAmount: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      state.statistics.totalTransactions += 1;
    },
    updateTransaction: (state, action) => {
      const index = state.transactions.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    removeTransaction: (state, action) => {
      state.transactions = state.transactions.filter(t => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Transactions
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Transaction By ID
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload.transaction;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Cash In
      .addCase(cashIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload.transaction);
        toast.success('Cash in successful!');
      })
      .addCase(cashIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Cash In Manual
      .addCase(cashInManual.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashInManual.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingTransactions.unshift(action.payload.transaction);
        toast.success('Manual cash in request submitted for approval!');
      })
      .addCase(cashInManual.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Cash Out
      .addCase(cashOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload.transaction);
        toast.success('Cash out successful!');
      })
      .addCase(cashOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Cash Out Manual
      .addCase(cashOutManual.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cashOutManual.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingTransactions.unshift(action.payload.transaction);
        toast.success('Manual cash out request submitted for approval!');
      })
      .addCase(cashOutManual.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Pending Transactions
      .addCase(getPendingTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingTransactions = action.payload.transactions;
      })
      .addCase(getPendingTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Cancel Transaction
      .addCase(cancelTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const transactionId = action.payload.transactionId;
        
        // Update in transactions array
        const transactionIndex = state.transactions.findIndex(t => t._id === transactionId);
        if (transactionIndex !== -1) {
          state.transactions[transactionIndex].status = 'cancelled';
        }
        
        // Remove from pending transactions
        state.pendingTransactions = state.pendingTransactions.filter(t => t._id !== transactionId);
        
        toast.success('Transaction cancelled successfully!');
      })
      .addCase(cancelTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Retry Transaction
      .addCase(retryTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(retryTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTransaction = action.payload.transaction;
        
        // Update in transactions array
        const transactionIndex = state.transactions.findIndex(t => t._id === updatedTransaction._id);
        if (transactionIndex !== -1) {
          state.transactions[transactionIndex] = updatedTransaction;
        }
        
        toast.success('Transaction retry initiated!');
      })
      .addCase(retryTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Transaction Statistics
      .addCase(getTransactionStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload.statistics;
      })
      .addCase(getTransactionStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Export Transactions
      .addCase(exportTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        toast.success('Transaction export completed!');
      })
      .addCase(exportTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  setLoading,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentTransaction,
  clearCurrentTransaction,
  addTransaction,
  updateTransaction,
  removeTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;