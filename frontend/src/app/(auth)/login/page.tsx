'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import Icon from '@/components/Icon';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { access, refresh } = await auth.login(email, password);
      auth.setTokens(access, refresh);
      router.push(redirectTo);
    } catch (err: unknown) {
      const apiErr = err as { response?: { status?: number; data?: { detail?: string } } };
      if (apiErr?.response?.status === 429) {
        setError('Demasiados intentos. Espera un momento e intenta de nuevo.');
      } else {
        setError('Credenciales invalidas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-off-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name="pets" className="w-7 h-7" solid />
            </div>
          </div>
          <h2 className="font-montserrat text-headline-lg text-on-surface">
            Iniciar Sesion
          </h2>
          <p className="mt-2 font-body-sm text-on-surface-variant">
            Huellitas Barinas
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg font-body-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container font-label-md py-3 rounded-lg shadow-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>

          <p className="text-center font-body-sm text-on-surface-variant">
            No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Registrate aqui
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
