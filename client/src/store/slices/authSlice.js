import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authAPI from '../../services/authAPI';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  isEmailVerified: false,
  isPhoneVerified: false,
  is2FAEnabled: false,
  loginAttempts: 0,
  lockoutTime: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Transform the credentials to match backend API format
      const transformedCredentials = {
        identifier: credentials.email, // Use email as identifier
        password: credentials.password,
        rememberMe: credentials.rememberMe
      };
      
      const response = await authAPI.login(transformedCredentials);
      
      // The response should already be the data object from authAPI.login
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        return response;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyEmail(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const verifyPhone = createAsyncThunk(
  'auth/verifyPhone',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyPhone(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Phone verification failed');
    }
  }
);

export const setup2FA = createAsyncThunk(
  'auth/setup2FA',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.setup2FA();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '2FA setup failed');
    }
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verify2FA(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '2FA verification failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await authAPI.getProfile();
      return response; // Return the entire response object
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Authentication check failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      return {};
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken();
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const sendPhoneVerification = createAsyncThunk(
  'auth/sendPhoneVerification',
  async (phoneNumber, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendPhoneVerification(phoneNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send phone verification');
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  'auth/resendEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.resendEmailVerification();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend verification email');
    }
  }
);

export const disable2FA = createAsyncThunk(
  'auth/disable2FA',
  async (password, { rejectWithValue }) => {
    try {
      const response = await authAPI.disable2FA(password);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disable 2FA');
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      if (state.loginAttempts >= 5) {
        state.lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lockoutTime = null;
    },
    checkLockout: (state) => {
      if (state.lockoutTime && Date.now() > state.lockoutTime) {
        state.loginAttempts = 0;
        state.lockoutTime = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload.user?.isEmailVerified || false;
        state.isPhoneVerified = action.payload.user?.isPhoneVerified || false;
        state.is2FAEnabled = action.payload.user?.is2FAEnabled || false;
        state.loginAttempts = 0;
        state.lockoutTime = null;
        state.error = null;
        toast.success('Login successful!');
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
        if (state.loginAttempts >= 5) {
          state.lockoutTime = Date.now() + 15 * 60 * 1000;
        }
        toast.error(action.payload);
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        toast.success('Registration successful! Please verify your email.');
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Email Verification
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isEmailVerified = true;
        if (state.user) {
          state.user.isEmailVerified = true;
        }
        toast.success('Email verified successfully!');
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Phone Verification
      .addCase(verifyPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPhone.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isPhoneVerified = true;
        if (state.user) {
          state.user.isPhoneVerified = true;
        }
        toast.success('Phone verified successfully!');
      })
      .addCase(verifyPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // 2FA Setup
      .addCase(setup2FA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setup2FA.fulfilled, (state, action) => {
        state.isLoading = false;
        toast.success('2FA setup initiated. Please scan the QR code.');
      })
      .addCase(setup2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // 2FA Verification
      .addCase(verify2FA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.isLoading = false;
        state.is2FAEnabled = true;
        if (state.user) {
          state.user.is2FAEnabled = true;
        }
        toast.success('2FA enabled successfully!');
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Password reset email sent!');
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Password reset successful!');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Check Auth Status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload?.user || null;
        state.isAuthenticated = true;
        state.isEmailVerified = action.payload?.user?.isEmailVerified || false;
        state.isPhoneVerified = action.payload?.user?.isPhoneVerified || false;
        state.is2FAEnabled = action.payload?.user?.twoFactorEnabled || false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isPhoneVerified = false;
        state.is2FAEnabled = false;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isPhoneVerified = false;
        state.is2FAEnabled = false;
        state.error = null;
        toast.success('Logged out successfully!');
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isPhoneVerified = false;
        state.is2FAEnabled = false;
      })

      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token || null;
        state.user = action.payload.user || null;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.isPhoneVerified = false;
        state.is2FAEnabled = false;
      })

      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isEmailVerified = action.payload.isEmailVerified;
        state.isPhoneVerified = action.payload.isPhoneVerified;
        state.is2FAEnabled = action.payload.is2FAEnabled;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Disable 2FA
      .addCase(disable2FA.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disable2FA.fulfilled, (state) => {
        state.isLoading = false;
        state.is2FAEnabled = false;
        if (state.user) {
          state.user.is2FAEnabled = false;
        }
        toast.success('2FA disabled successfully');
      })
      .addCase(disable2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Resend Email Verification
      .addCase(resendEmailVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Verification email sent successfully');
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      // Send Phone Verification
      .addCase(sendPhoneVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendPhoneVerification.fulfilled, (state) => {
        state.isLoading = false;
        toast.success('Phone verification code sent successfully');
      })
      .addCase(sendPhoneVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const {
  clearError,
  setLoading,
  incrementLoginAttempts,
  resetLoginAttempts,
  checkLockout,
} = authSlice.actions;

export default authSlice.reducer;