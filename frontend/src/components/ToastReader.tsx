'use client';

import { useEffect } from 'react';
import { sileo } from 'sileo';

export default function ToastReader() {
  useEffect(() => {
    const raw = sessionStorage.getItem('pendingToast');
    if (!raw) return;
    sessionStorage.removeItem('pendingToast');
    try {
      const toast = JSON.parse(raw);
      if (toast.title) {
        sileo.success({ title: toast.title, description: toast.description });
      }
    } catch {
      // ignore malformed toast data
    }
  }, []);

  return null;
}
