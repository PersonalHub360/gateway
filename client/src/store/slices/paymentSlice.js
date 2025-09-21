import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  transactions: [],
  currentTransaction: null,
  paymentMethods: [],
  loading: false,
  error: null,
  cashInHistory: [],
  totalPages: 0,
  currentPage: 1
};

// Async thunks
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payment/process', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed');
    }
  }
);

export const createCashInTransaction = createAsyncThunk(
  'payment/createCashInTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/cashin/create', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Cash-in failed');
    }
  }
);

export const getCashInHistory = createAsyncThunk(
  'payment/getCashInHistory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/cashin/history', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  'payment/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cashin/methods');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);

export const checkTransactionStatus = createAsyncThunk(
  'payment/checkTransactionStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cashin/status/${transactionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check status');
    }
  }
);

// Payment slice
const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    updateTransactionStatus: (state, action) => {
      const { transactionId, status } = action.payload;
      const transaction = state.transactions.find(t => t._id === transactionId);
      if (transaction) {
        transaction.status = status;
      }
      if (state.currentTransaction && state.currentTransaction._id === transactionId) {
        state.currentTransaction.status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Process Payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.transaction;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Cash-In Transaction
      .addCase(createCashInTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCashInTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload.transaction;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(createCashInTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Cash-In History
      .addCase(getCashInHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCashInHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.cashInHistory = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(getCashInHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Payment Methods
      .addCase(getPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload.methods;
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check Transaction Status
      .addCase(checkTransactionStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(checkTransactionStatus.fulfilled, (state, action) => {
        const transaction = action.payload.transaction;
        const existingIndex = state.transactions.findIndex(t => t._id === transaction._id);
        if (existingIndex !== -1) {
          state.transactions[existingIndex] = transaction;
        }
        if (state.currentTransaction && state.currentTransaction._id === transaction._id) {
          state.currentTransaction = transaction;
        }
      })
      .addCase(checkTransactionStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  clearError, 
  clearCurrentTransaction, 
  setCurrentPage, 
  updateTransactionStatus 
} = paymentSlice.actions;

export default paymentSlice.reducer;