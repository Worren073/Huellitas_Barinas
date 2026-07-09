'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function TokenCleanup() {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return null;
}
