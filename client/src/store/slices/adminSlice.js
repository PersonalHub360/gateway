import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminAPI from '../../services/adminAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  dashboard: {
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalTransactions: 0,
      totalVolume: 0,
      pendingKYC: 0,
      flaggedTransactions: 0,
      systemHealth: 'good',
      uptime: '99.9%',
    },
    charts: {
      userGrowth: [],
      transactionVolume: [],
      revenueData: [],
      geographicData: [],
    },
    recentActivity: [],
  },
  users: {
    list: [],
    currentUser: null,
    filters: {
      status: 'all',
      userType: 'all',
      kycStatus: 'all',
      dateRange: 'all',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  transactions: {
    list: [],
    currentTransaction: null,
    pendingApprovals: [],
    flaggedTransactions: [],
    filters: {
      status: 'all',
      type: 'all',
      priority: 'all',
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
  },
  kyc: {
    pendingDocuments: [],
    currentDocument: null,
    filters: {
      documentType: 'all',
      status: 'all',
      priority: 'all',
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  system: {
    settings: {
      maintenanceMode: false,
      registrationEnabled: true,
      kycRequired: true,
      maxTransactionAmount: 10000,
      dailyTransactionLimit: 50000,
      feePercentage: 2.5,
      minimumBalance: 10,
      sessionTimeout: 900000,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    logs: [],
    backups: [],
    integrations: {
      paymentGateways: [],
      bankingAPIs: [],
      smsProviders: [],
      emailProviders: [],
    },
  },
  reports: {
    availableReports: [],
    generatedReports: [],
    currentReport: null,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getUserById = createAsyncThunk(
  'admin/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUserById(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, status);
      return { userId, status, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const getTransactions = createAsyncThunk(
  'admin/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const getPendingApprovals = createAsyncThunk(
  'admin/getPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingApprovals();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }
);

export const approveTransaction = createAsyncThunk(
  'admin/approveTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveTransaction(transactionId);
      return { transactionId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve transaction');
    }
  }
);

export const rejectTransaction = createAsyncThunk(
  'admin/rejectTransaction',
  async ({ transactionId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.rejectTransaction(transactionId, reason);
      return { transactionId, reason, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject transaction');
    }
  }
);

export const getPendingKYC = createAsyncThunk(
  'admin/getPendingKYC',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingKYC(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending KYC documents');
    }
  }
);

export const approveKYC = createAsyncThunk(
  'admin/approveKYC',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveKYC(documentId);
      return { documentId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve KYC document');
    }
  }
);

export const rejectKYC = createAsyncThunk(
  'admin/rejectKYC',
  async ({ documentId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.rejectKYC(documentId, reason);
      return { documentId, reason, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject KYC document');
    }
  }
);

export const getSystemSettings = createAsyncThunk(
  'admin/getSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSystemSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system settings');
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'admin/updateSystemSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateSystemSettings(settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update system settings');
    }
  }
);

export const generateReport = createAsyncThunk(
  'admin/generateReport',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await adminAPI.generateReport(reportConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate report');
    }
  }
);

export const exportData = createAsyncThunk(
  'admin/exportData',
  async (exportConfig, { rejectWithValue }) => {
    try {
      const response = await adminAPI.exportData(exportConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export data');
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUserFilters: (state, action) => {
      state.users.filters = { ...state.users.filters, ...action.payload };
    },
    clearUserFilters: (state) => {
      state.users.filters = {
        status: 'all',
        userType: 'all',
        kycStatus: 'all',
        dateRange: 'all',
      };
    },
    setTransactionFilters: (state, action) => {
      state.transactions.filters = { ...state.transactions.filters, ...action.payload };
    },
    clearTransactionFilters: (state) => {
      state.transactions.filters = {
        status: 'all',
        type: 'all',
        priority: 'all',
        dateRange: 'all',
        minAmount: '',
        maxAmount: '',
      };
    },
    setKYCFilters: (state, action) => {
      state.kyc.filters = { ...state.kyc.filters, ...action.payload };
    },
    clearKYCFilters: (state) => {
      state.kyc.filters = {
        documentType: 'all',
        status: 'all',
        priority: 'all',
      };
    },
    setCurrentUser: (state, action) => {
      state.users.currentUser = action.payload;
    },
    setCurrentTransaction: (state, action) => {
      state.transactions.currentTransaction = action.payload;
    },
    setCurrentDocument: (state, action) => {
      state.kyc.currentDocument = action.payload;
    },
    updateUserInList: (state, action) => {
      const index = state.users.list.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users.list[index] = { ...state.users.list[index], ...action.payload };
      }
    },
    updateTransactionInList: (state, action) => {
      const index = state.transactions.list.findIndex(tx => tx._id === action.payload._id);
      if (index !== -1) {
        state.transactions.list[index] = { ...state.transactions.list[index], ...action.payload };
      }
    },
    removeFromPendingApprovals: (state, action) => {
      state.transactions.pendingApprovals = state.transactions.pendingApprovals.filter(
        tx => tx._id !== action.payload
      );
    },
    removeFromPendingKYC: (state, action) => {
      state.kyc.pendingDocuments = state.kyc.pendingDocuments.filter(
        doc => doc._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard.stats = action.payload.stats;
        state.dashboard.charts = action.payload.charts;
        state.dashboard.recentActivity = action.payload.recentActivity;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.list = action.payload.users;
        state.users.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get User By ID
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.currentUser = action.payload.user;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { userId, status } = action.payload;
        const userIndex = state.users.list.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          state.users.list[userIndex].status = status;
        }
        if (state.users.currentUser && state.users.currentUser._id === userId) {
          state.users.currentUser.status = status;
        }
        toast.success('User status updated successfully!');
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Transactions
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.list = action.payload.transactions;
        state.transactions.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Pending Approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.pendingApprovals = action.payload.transactions;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Approve Transaction
      .addCase(approveTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const { transactionId } = action.payload;
        state.transactions.pendingApprovals = state.transactions.pendingApprovals.filter(
          tx => tx._id !== transactionId
        );
        toast.success('Transaction approved successfully!');
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Reject Transaction
      .addCase(rejectTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const { transactionId } = action.payload;
        state.transactions.pendingApprovals = state.transactions.pendingApprovals.filter(
          tx => tx._id !== transactionId
        );
        toast.success('Transaction rejected successfully!');
      })
      .addCase(rejectTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Pending KYC
      .addCase(getPendingKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kyc.pendingDocuments = action.payload.documents;
        state.kyc.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(getPendingKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Approve KYC
      .addCase(approveKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        const { documentId } = action.payload;
        state.kyc.pendingDocuments = state.kyc.pendingDocuments.filter(
          doc => doc._id !== documentId
        );
        toast.success('KYC document approved successfully!');
      })
      .addCase(approveKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Reject KYC
      .addCase(rejectKYC.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectKYC.fulfilled, (state, action) => {
        state.isLoading = false;
        const { documentId } = action.payload;
        state.kyc.pendingDocuments = state.kyc.pendingDocuments.filter(
          doc => doc._id !== documentId
        );
        toast.success('KYC document rejected successfully!');
      })
      .addCase(rejectKYC.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get System Settings
      .addCase(getSystemSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSystemSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.system.settings = action.payload.settings;
      })
      .addCase(getSystemSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update System Settings
      .addCase(updateSystemSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.system.settings = action.payload.settings;
        toast.success('System settings updated successfully!');
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Generate Report
      .addCase(generateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.generatedReports.unshift(action.payload.report);
        toast.success('Report generated successfully!');
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Export Data
      .addCase(exportData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportData.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Data export completed successfully!');
      })
      .addCase(exportData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  setLoading,
  setUserFilters,
  clearUserFilters,
  setTransactionFilters,
  clearTransactionFilters,
  setKYCFilters,
  clearKYCFilters,
  setCurrentUser,
  setCurrentTransaction,
  setCurrentDocument,
  updateUserInList,
  updateTransactionInList,
  removeFromPendingApprovals,
  removeFromPendingKYC,
} = adminSlice.actions;

export default adminSlice.reducer;