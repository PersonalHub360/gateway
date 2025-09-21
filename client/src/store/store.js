import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import walletSlice from './slices/walletSlice';
import transactionSlice from './slices/transactionSlice';
import adminSlice from './slices/adminSlice';
import paymentSlice from './slices/paymentSlice';
import notificationSlice from './slices/notificationSlice';
import uiSlice from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    wallet: walletSlice,
    transaction: transactionSlice,
    admin: adminSlice,
    payment: paymentSlice,
    notifications: notificationSlice, // Changed from 'notification' to 'notifications' to match Layout usage
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;