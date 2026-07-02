import api from './api';
import { removeCookie, setCookie } from './cookies';

export const auth = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login/', { email, password });
    return data as { access: string; refresh: string };
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    country?: string;
    phone?: string;
  }) {
    const { data } = await api.post('/auth/register/', {
      ...userData,
      country: userData.country || 'VE', // Default to Venezuela
    });
    return data as { id: number; username: string; email: string };
  },

  setTokens(access: string, refresh: string) {
    // Save to localStorage for client-side access
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    // Also save to cookies so middleware can read them
    setCookie('access_token', access, 7);
    setCookie('refresh_token', refresh, 7);
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeCookie('access_token');
    removeCookie('refresh_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  async getProfile() {
    const { data } = await api.get('/users/me/');
    return data as { 
      email: string; 
      first_name: string;
      last_name: string;
      id: number;
      role: string;
      phone?: string;
      country?: string;
      country_display?: string;
    };
  },
};
