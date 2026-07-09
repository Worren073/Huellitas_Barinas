import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/status/') ||
        originalRequest.url?.includes('/auth/logout/')
      ) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        await axios.post('/api/v1/auth/refresh/', {});
        return api(originalRequest);
      } catch {
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
