import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationAPI from '../../services/notificationAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  settings: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    transactionAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
  },
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getNotifications(params);
      return response; // Return the entire response object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getUnreadCount();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      return { notificationId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.deleteNotification(notificationId);
      return { notificationId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.deleteAllNotifications();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete all notifications');
    }
  }
);

export const getNotificationSettings = createAsyncThunk(
  'notification/getNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getNotificationSettings();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'notification/updateNotificationSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.updateNotificationSettings(settings);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

export const sendTestNotification = createAsyncThunk(
  'notification/sendTestNotification',
  async (type, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.sendTestNotification(type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send test notification');
    }
  }
);

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n._id === action.payload._id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        const isNowRead = action.payload.isRead;
        
        state.notifications[index] = { ...state.notifications[index], ...action.payload };
        
        if (wasUnread && isNowRead) {
          state.unreadCount -= 1;
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'all',
        status: 'all',
        priority: 'all',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload?.notifications || [];
        state.pagination = {
          page: action.payload?.pagination?.page || 1,
          limit: action.payload?.pagination?.limit || 20,
          total: action.payload?.pagination?.total || 0,
          totalPages: action.payload?.pagination?.totalPages || 0,
        };
        state.unreadCount = action.payload?.unreadCount || 0;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        state.error = null;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.count;
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark As Read
      .addCase(markAsRead.pending, (state) => {
        state.error = null;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload.notificationId;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount -= 1;
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Mark All As Read
      .addCase(markAllAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications.forEach(notification => {
          if (!notification.isRead) {
            notification.isRead = true;
            notification.readAt = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
        toast.success('All notifications marked as read!');
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload.notificationId;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          state.unreadCount -= 1;
        }
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
        toast.success('Notification deleted!');
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Delete All Notifications
      .addCase(deleteAllNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = [];
        state.unreadCount = 0;
        toast.success('All notifications deleted!');
      })
      .addCase(deleteAllNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Get Notification Settings
      .addCase(getNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload.settings;
      })
      .addCase(getNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Notification Settings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload.settings;
        toast.success('Notification settings updated!');
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Send Test Notification
      .addCase(sendTestNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendTestNotification.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Test notification sent!');
      })
      .addCase(sendTestNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  setLoading,
  addNotification,
  removeNotification,
  updateNotification,
  setFilters,
  clearFilters,
  setPagination,
  decrementUnreadCount,
  resetUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;