import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/users/me/') ||
        originalRequest.url?.includes('/auth/logout/')
      ) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh/`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
