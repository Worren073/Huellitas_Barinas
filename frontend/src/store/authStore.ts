import { create } from 'zustand';
import api from '@/lib/api';

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
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const { data } = await api.get('/users/me/');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/login/', { email, password });
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

  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } catch {
      // Always clear local state even if API call fails
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/users/me/');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
