import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        // Update tokens
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        
        // Update auth header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Authentication failed' 
      };
    }
  },
  
  register: async (name, email, password) => {
    try {
      const response = await axiosInstance.post('/register', { 
        analyst_name: name, 
        email, 
        password 
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  },
  
  getUserInfo: async () => {
    try {
      const response = await axiosInstance.get('/secure-endpoint');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get user information' 
      };
    }
  },
  
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(`${API_URL}/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to refresh token' 
      };
    }
  }
};

// File API calls
export const fileAPI = {
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to upload file' 
      };
    }
  },
  
  getUploadedFiles: async () => {
    try {
      const response = await axiosInstance.get('/files');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get uploaded files' 
      };
    }
  }
};

// Report API calls
export const reportAPI = {
  generateReport: async (reportType, dateRange, format) => {
    try {
      const response = await axiosInstance.post('/reports/generate', {
        report_type: reportType,
        date_range: dateRange,
        format
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to generate report' 
      };
    }
  },
  
  getReports: async () => {
    try {
      const response = await axiosInstance.get('/reports');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get reports' 
      };
    }
  }
};

// Settings API calls
export const settingsAPI = {
  updateSettings: async (settings) => {
    try {
      const response = await axiosInstance.post('/settings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update settings' 
      };
    }
  },
  
  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/settings');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get settings' 
      };
    }
  }
};

export default axiosInstance;