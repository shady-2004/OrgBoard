import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/OrgBoard/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 API Request:', config.method.toUpperCase(), config.url);
    console.log('📦 Request Data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    console.error('Error details:', error.response?.data);
    
    // Only redirect to login if:
    // 1. Status is 401
    // 2. We're not already on the login or register page
    // 3. The error is not from the login endpoint itself
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginPage && !isLoginRequest) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
