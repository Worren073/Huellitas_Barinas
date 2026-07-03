'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function TokenCleanup() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && isTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    useAuthStore.getState().hydrate();
  }, []);

  return null;
}
