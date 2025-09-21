import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import walletSlice from './slices/walletSlice';
import transactionSlice from './slices/transactionSlice';
import notificationSlice from './slices/notificationSlice';
import uiSlice from './slices/uiSlice';
import adminSlice from './slices/adminSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
  blacklist: ['wallet', 'transaction', 'notification', 'admin'], // Don't persist sensitive data
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  wallet: walletSlice,
  transaction: transactionSlice,
  notification: notificationSlice,
  ui: uiSlice,
  admin: adminSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (if needed)
// For JavaScript, we can export the store's state type if needed
export const getRootState = () => store.getState();
// AppDispatch type is only available when using TypeScript
// For JavaScript, we can export the store.dispatch directly if needed
export const dispatch = store.dispatch;

export default store;