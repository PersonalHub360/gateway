import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  theme: 'light', // 'light' | 'dark' | 'auto'
  sidebarOpen: true,
  sidebarCollapsed: false,
  language: 'en',
  currency: 'USD',
  notifications: {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    newestOnTop: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  },
  modals: {
    confirmDialog: {
      open: false,
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      severity: 'warning',
    },
    transactionDetails: {
      open: false,
      transactionId: null,
    },
    sendMoney: {
      open: false,
      recipient: null,
    },
    requestMoney: {
      open: false,
      sender: null,
    },
    qrScanner: {
      open: false,
      onScan: null,
    },
    profilePicture: {
      open: false,
    },
    kycUpload: {
      open: false,
      documentType: null,
    },
  },
  loading: {
    global: false,
    dashboard: false,
    transactions: false,
    wallet: false,
    profile: false,
  },
  alerts: [],
  breadcrumbs: [],
  pageTitle: '',
  searchQuery: '',
  filters: {
    dateRange: {
      start: null,
      end: null,
    },
    amount: {
      min: null,
      max: null,
    },
    status: 'all',
    type: 'all',
  },
  preferences: {
    compactMode: false,
    showBalance: true,
    showRecentTransactions: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    soundEnabled: true,
    vibrationEnabled: true,
    biometricEnabled: false,
    sessionTimeout: 900000, // 15 minutes
  },
  layout: {
    containerMaxWidth: 'xl',
    spacing: 3,
    borderRadius: 12,
    elevation: 2,
  },
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out',
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar actions
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Language and currency
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      const { modalName, data } = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...state.modals[modalName], open: true, ...data };
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals[modalName]) {
        state.modals[modalName] = { ...initialState.modals[modalName] };
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modalName => {
        state.modals[modalName] = { ...initialState.modals[modalName] };
      });
    },

    // Confirm dialog
    showConfirmDialog: (state, action) => {
      state.modals.confirmDialog = {
        open: true,
        ...action.payload,
      };
    },
    hideConfirmDialog: (state) => {
      state.modals.confirmDialog = { ...initialState.modals.confirmDialog };
    },

    // Loading states
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      if (state.loading.hasOwnProperty(key)) {
        state.loading[key] = value;
      }
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },

    // Alerts
    addAlert: (state, action) => {
      const alert = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.alerts.push(alert);
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },

    // Navigation
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },

    // Search
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },

    // Filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: { start: null, end: null },
        amount: { min: null, max: null },
        status: 'all',
        type: 'all',
      };
    },
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
    },
    setAmountRange: (state, action) => {
      state.filters.amount = action.payload;
    },

    // Preferences
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    togglePreference: (state, action) => {
      const key = action.payload;
      if (state.preferences.hasOwnProperty(key) && typeof state.preferences[key] === 'boolean') {
        state.preferences[key] = !state.preferences[key];
      }
    },

    // Layout
    setLayout: (state, action) => {
      state.layout = { ...state.layout, ...action.payload };
    },

    // Animations
    setAnimations: (state, action) => {
      state.animations = { ...state.animations, ...action.payload };
    },
    toggleAnimations: (state) => {
      state.animations.enabled = !state.animations.enabled;
    },

    // Notification settings
    setNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    // Reset UI state
    resetUIState: (state) => {
      return { ...initialState, theme: state.theme, language: state.language, currency: state.currency };
    },
  },
});

export const {
  // Theme
  setTheme,
  toggleTheme,
  
  // Sidebar
  setSidebarOpen,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  
  // Language and currency
  setLanguage,
  setCurrency,
  
  // Modals
  openModal,
  closeModal,
  closeAllModals,
  showConfirmDialog,
  hideConfirmDialog,
  
  // Loading
  setLoading,
  setGlobalLoading,
  
  // Alerts
  addAlert,
  removeAlert,
  clearAlerts,
  
  // Navigation
  setBreadcrumbs,
  setPageTitle,
  
  // Search
  setSearchQuery,
  clearSearchQuery,
  
  // Filters
  setFilters,
  clearFilters,
  setDateRange,
  setAmountRange,
  
  // Preferences
  setPreferences,
  togglePreference,
  
  // Layout
  setLayout,
  
  // Animations
  setAnimations,
  toggleAnimations,
  
  // Notifications
  setNotificationSettings,
  
  // Reset
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;