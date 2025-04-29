import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

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

export const fileAPI = {
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axiosInstance.post('/analysis/upload-data', formData, {
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
      const response = await axiosInstance.get('/analysis/data-files');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get uploaded files' 
      };
    }
  },
  
  deleteDataFile: async (fileId) => {
    try {
      const response = await axiosInstance.delete(`/analysis/data-files/${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete data file' 
      };
    }
  }
};

export const analysisAPI = {
  getReportExports: async () => {
    try {
      const response = await axiosInstance.get('/analysis/exports');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get report exports' 
      };
    }
  },

  generateReport: async (fileId, reportName) => {
    try {
      const response = await axiosInstance.post(`/analysis/analyze?file_id=${fileId}`, {
        report_name: reportName
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
      const response = await axiosInstance.get('/analysis/reports');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get reports' 
      };
    }
  },

  getReportById: async (reportId) => {
    try {
      const response = await axiosInstance.get(`/analysis/reports/${reportId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get report details' 
      };
    }
  },
  
  deleteReport: async (reportId) => {
    try {
      const response = await axiosInstance.delete(`/analysis/reports/${reportId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete report' 
      };
    }
  },

  getUsagePatterns: async (fileId) => {
    try {
      const response = await axiosInstance.get(`/analysis/analysis/usage-patterns?file_id=${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get usage patterns' 
      };
    }
  },

  getContentPerformance: async (fileId) => {
    try {
      const response = await axiosInstance.get(`/analysis/analysis/content-performance?file_id=${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get content performance' 
      };
    }
  },

  getUserSegments: async (fileId) => {
    try {
      const response = await axiosInstance.get(`/analysis/analysis/user-segments?file_id=${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get user segments' 
      };
    }
  },

  getSearchPatterns: async (fileId) => {
    try {
      const response = await axiosInstance.get(`/analysis/analysis/search-patterns?file_id=${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get search patterns' 
      };
    }
  },

  getRetentionMetrics: async (fileId) => {
    try {
      const response = await axiosInstance.get(`/analysis/analysis/retention?file_id=${fileId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get retention metrics' 
      };
    }
  },

  exportReport: async (reportId, format) => {
    try {
      const response = await axiosInstance.get(`/analysis/export-report/${reportId}?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let extension = format;
      const filename = `library_report_${reportId}.${extension}`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to export report' 
      };
    }
  },

  deleteExport: async (exportId) => {
    try {
      const response = await axiosInstance.delete(`/analysis/exports/${exportId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete export' 
      };
    }
  }
};

export default axiosInstance;