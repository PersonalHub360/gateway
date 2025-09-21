import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// Redux actions
import { checkAuthStatus } from './store/slices/authSlice';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyPhone from './pages/auth/VerifyPhone';
import Setup2FA from './pages/auth/Setup2FA';

import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import SendMoney from './pages/SendMoney';
import RequestMoney from './pages/RequestMoney';
import CashIn from './pages/CashIn';
import CashOut from './pages/CashOut';
import BillPayments from './pages/BillPayments';
import MobileTopup from './pages/MobileTopup';
import ShopPayments from './pages/ShopPayments';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Security from './pages/Security';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import TransactionManagement from './pages/admin/TransactionManagement';
import SystemSettings from './pages/admin/SystemSettings';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <LoadingSpinner size={60} color="white" />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Login />
                </motion.div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Register />
                </motion.div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              !isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ForgotPassword />
                </motion.div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              !isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResetPassword />
                </motion.div>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Verification Routes */}
          <Route
            path="/verify-email"
            element={
              <ProtectedRoute>
                <VerifyEmail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-phone"
            element={
              <ProtectedRoute>
                <VerifyPhone />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setup-2fa"
            element={
              <ProtectedRoute>
                <Setup2FA />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Main Dashboard Routes */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="transactions" element={<Transactions />} />
            
            {/* Money Transfer Routes */}
            <Route path="send-money" element={<SendMoney />} />
            <Route path="request-money" element={<RequestMoney />} />
            <Route path="cash-in" element={<CashIn />} />
            <Route path="cash-out" element={<CashOut />} />
            
            {/* Payment Routes */}
            <Route path="bill-payments" element={<BillPayments />} />
            <Route path="mobile-topup" element={<MobileTopup />} />
            <Route path="shop-payments" element={<ShopPayments />} />
            
            {/* Account Routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="support" element={<Support />} />

            {/* Admin Routes */}
            {user?.userType === 'admin' && (
              <>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/transactions" element={<TransactionManagement />} />
                <Route path="admin/settings" element={<SystemSettings />} />
              </>
            )}
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Box>
  );
}

export default App;