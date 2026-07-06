import { create } from 'zustand';
import api from '@/lib/api';
import { setCookie, removeCookie } from '@/lib/cookies';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  country?: string;
  center?: { id: number; name: string };
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (_email: string, _password: string) => Promise<void>;
  register: (_data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    country?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  setTokens: (_access: string, _refresh: string) => void;
  fetchProfile: () => Promise<void>;
  hydrate: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setCookie('access_token', access, 7);
    setCookie('refresh_token', refresh, 7);
    set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  hydrate: () => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    if (access && refresh) {
      set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login/', { email, password });
      get().setTokens(data.access, data.refresh);
      await get().fetchProfile();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al iniciar sesión';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register/', {
        ...userData,
        country: userData.country || 'VE',
      });
      set({ isLoading: false });
    } catch (err: any) {
      const detail = err.response?.data;
      const msg = typeof detail === 'string' ? detail : detail?.email?.[0] || 'Error al registrarse';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    removeCookie('access_token');
    removeCookie('refresh_token');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/users/me/');
      set({ user: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
