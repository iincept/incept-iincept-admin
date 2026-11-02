import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Request interceptor to automatically add admin authorization header
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      if (adminToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } catch (err) {
      // Ignore localStorage read errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle invalid or expired admin tokens
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      if (error.response && error.response.status === 401) {
        // Remove strictly only admin authentication data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login' && window.location.pathname !== '/login') {
          window.location.href = '/admin/login';
        }
      }
    } catch (err) {
      // Ignore storage errors
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
