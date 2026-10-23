import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const isAuthCheck = error.config?.url?.includes('/auth/me');
      const isAlreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';

      if (!isAuthCheck && !isAlreadyOnLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const serverBase = import.meta.env.VITE_SERVER_URL || API_URL.replace('/api', '');
  const baseUrl = serverBase.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export default api;
