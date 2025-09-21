import api from './api';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Resend email verification
  resendEmailVerification: async () => {
    const response = await api.post('/auth/resend-email-verification');
    return response.data;
  },

  // Verify phone
  verifyPhone: async (code) => {
    const response = await api.post('/auth/verify-phone', { code });
    return response.data;
  },

  // Resend phone verification
  resendPhoneVerification: async () => {
    const response = await api.post('/auth/resend-phone-verification');
    return response.data;
  },

  // Setup 2FA
  setup2FA: async () => {
    const response = await api.post('/auth/setup-2fa');
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (code) => {
    const response = await api.post('/auth/verify-2fa', { code });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (code) => {
    const response = await api.post('/auth/disable-2fa', { code });
    return response.data;
  }
};

export default authAPI;
