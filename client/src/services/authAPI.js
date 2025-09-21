import api from './api';

const authAPI = {
  // Authentication endpoints
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Password management
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  },

  // Email verification
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  resendEmailVerification: async () => {
    const response = await api.post('/auth/resend-email-verification');
    return response.data;
  },

  // Phone verification
  verifyPhone: async (code) => {
    const response = await api.post('/auth/verify-phone', { code });
    return response.data;
  },

  sendPhoneVerification: async (phoneNumber) => {
    const response = await api.post('/auth/send-phone-verification', { phoneNumber });
    return response.data;
  },

  // Two-factor authentication
  setup2FA: async () => {
    const response = await api.post('/auth/setup-2fa');
    return response.data;
  },

  verify2FA: async (code) => {
    const response = await api.post('/auth/verify-2fa', { code });
    return response.data;
  },

  disable2FA: async (password) => {
    const response = await api.post('/auth/disable-2fa', { password });
    return response.data;
  },

  // Profile management
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Session management
  checkAuthStatus: async () => {
    const response = await api.get('/auth/status');
    return response.data;
  },

  // Security
  getSecuritySettings: async () => {
    const response = await api.get('/auth/security');
    return response.data;
  },

  updateSecuritySettings: async (settings) => {
    const response = await api.put('/auth/security', settings);
    return response.data;
  }
};

export default authAPI;