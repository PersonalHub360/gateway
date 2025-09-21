import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Calculate request duration
    if (originalRequest.metadata) {
      const endTime = new Date();
      const duration = endTime - originalRequest.metadata.startTime;
      console.error(`❌ ${originalRequest.method?.toUpperCase()} ${originalRequest.url} (${duration}ms)`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle different error status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              // Try to refresh token
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await axios.post(
                  `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
                  { refreshToken }
                );

                const { token } = response.data;
                localStorage.setItem('token', token);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }

            // If refresh fails, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            toast.error('Session expired. Please login again.');
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          toast.error('The requested resource was not found.');
          break;

        case 422:
          // Validation error
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message || err));
          } else {
            toast.error(data.message || 'Validation error occurred.');
          }
          break;

        case 429:
          // Rate limit exceeded
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Internal server error
          toast.error('Internal server error. Please try again later.');
          break;

        case 502:
        case 503:
        case 504:
          // Server unavailable
          toast.error('Service temporarily unavailable. Please try again later.');
          break;

        default:
          // Generic error
          toast.error(data.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Other error
      console.error('Error:', error.message);
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // GET request
  get: (url, config = {}) => api.get(url, config),

  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),

  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),

  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),

  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),

  // Upload file
  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  // Download file
  download: (url, filename = null) => {
    return api.get(url, {
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
  },

  // Get current auth token
  getAuthToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Set base URL
  setBaseURL: (baseURL) => {
    api.defaults.baseURL = baseURL;
  },

  // Get base URL
  getBaseURL: () => {
    return api.defaults.baseURL;
  },

  // Set timeout
  setTimeout: (timeout) => {
    api.defaults.timeout = timeout;
  },

  // Add request interceptor
  addRequestInterceptor: (onFulfilled, onRejected) => {
    return api.interceptors.request.use(onFulfilled, onRejected);
  },

  // Add response interceptor
  addResponseInterceptor: (onFulfilled, onRejected) => {
    return api.interceptors.response.use(onFulfilled, onRejected);
  },

  // Remove interceptor
  removeInterceptor: (interceptorId, type = 'request') => {
    if (type === 'request') {
      api.interceptors.request.eject(interceptorId);
    } else {
      api.interceptors.response.eject(interceptorId);
    }
  },
};

// Export default api instance
export default api;