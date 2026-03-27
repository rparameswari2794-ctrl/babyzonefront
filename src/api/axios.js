// api/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://eswari0207.pythonanywhere.com/api/',  // Relative URL - Vite proxy will handle it
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Vite uses import.meta.env instead of process.env
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    // Vite uses import.meta.env instead of process.env
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url}`, response.status);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            '/api/auth/token/refresh/',  // Relative URL
            { refresh: refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          );
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return instance(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Error handling logic...
    if (error.response) {
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data
      });
      
      switch (error.response.status) {
        case 400:
          error.userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          error.userMessage = 'Please login to continue.';
          break;
        case 403:
          error.userMessage = 'You don\'t have permission to perform this action.';
          break;
        case 404:
          error.userMessage = 'Resource not found.';
          break;
        case 500:
          error.userMessage = 'Server error. Please try again later.';
          break;
        default:
          error.userMessage = error.response.data?.error || error.response.data?.message || 'An error occurred.';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
      error.userMessage = 'Network error. Please check your connection.';
    } else {
      console.error('Error:', error.message);
      error.userMessage = 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export default instance;