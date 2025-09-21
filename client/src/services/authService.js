import api from './api';

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set auth token in api
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Resend email verification
  async resendEmailVerification(email) {
    try {
      const response = await api.post('/auth/resend-email-verification', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify phone
  async verifyPhone(phoneNumber, code) {
    try {
      const response = await api.post('/auth/verify-phone', { phoneNumber, code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Resend phone verification
  async resendPhoneVerification(phoneNumber) {
    try {
      const response = await api.post('/auth/resend-phone-verification', { phoneNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Setup 2FA
  async setup2FA() {
    try {
      const response = await api.post('/auth/setup-2fa');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify 2FA setup
  async verify2FASetup(token) {
    try {
      const response = await api.post('/auth/verify-2fa-setup', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Verify 2FA login
  async verify2FA(token) {
    try {
      const response = await api.post('/auth/verify-2fa', { token });
      const { token: authToken, refreshToken, user } = response.data;

      // Store tokens
      localStorage.setItem('token', authToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set auth token in api
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Disable 2FA
  async disable2FA(password) {
    try {
      const response = await api.post('/auth/disable-2fa', { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response.data;

      // Update tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      // Set auth token in api
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return response.data;
    } catch (error) {
      // If refresh fails, logout user
      this.logout();
      throw error.response?.data || error;
    }
  }

  // Logout
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('token');
  }

  // Get stored refresh token
  getStoredRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  // Check if token is expired
  isTokenExpired() {
    const token = this.getStoredToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Get user role
  getUserRole() {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  // Check if user has role
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is verified
  isVerified() {
    const user = this.getStoredUser();
    return user?.isEmailVerified && user?.isPhoneVerified;
  }

  // Check if email is verified
  isEmailVerified() {
    const user = this.getStoredUser();
    return user?.isEmailVerified || false;
  }

  // Check if phone is verified
  isPhoneVerified() {
    const user = this.getStoredUser();
    return user?.isPhoneVerified || false;
  }

  // Check if 2FA is enabled
  is2FAEnabled() {
    const user = this.getStoredUser();
    return user?.twoFactorEnabled || false;
  }

  // Get user permissions
  getUserPermissions() {
    const user = this.getStoredUser();
    return user?.permissions || [];
  }

  // Check if user has permission
  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }

  // Initialize auth state
  initializeAuth() {
    const token = this.getStoredToken();
    if (token && !this.isTokenExpired()) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } else {
      this.logout();
      return false;
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;