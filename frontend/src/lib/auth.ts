import { useAuthStore } from '@/store/authStore';

export const auth = {
  async login(email: string, password: string) {
    const store = useAuthStore.getState();
    await store.login(email, password);
    const { accessToken, refreshToken } = useAuthStore.getState();
    return { access: accessToken!, refresh: refreshToken! };
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
    const store = useAuthStore.getState();
    await store.register(userData);
    return { id: 0, username: userData.username, email: userData.email };
  },

  setTokens(access: string, refresh: string) {
    useAuthStore.getState().setTokens(access, refresh);
  },

  logout() {
    useAuthStore.getState().logout();
  },

  getAccessToken(): string | null {
    return useAuthStore.getState().accessToken;
  },

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated;
  },

  async getProfile() {
    const store = useAuthStore.getState();
    if (!store.user) {
      await store.fetchProfile();
    }
    const { user } = useAuthStore.getState();
    return user as {
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
