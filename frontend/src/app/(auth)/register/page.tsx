'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import Icon from '@/components/Icon';

const COUNTRIES = [
  { code: 'VE', name: 'Venezuela', prefix: '+58', flag: '🇻🇪', char: 'VE' },
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴', char: 'CO' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', flag: '🇪🇨', char: 'EC' },
  { code: 'PE', name: 'Perú', prefix: '+51', flag: '🇵🇪', char: 'PE' },
  { code: 'CL', name: 'Chile', prefix: '+56', flag: '🇨🇱', char: 'CL' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷', char: 'AR' },
  { code: 'BR', name: 'Brasil', prefix: '+55', flag: '🇧🇷', char: 'BR' },
  { code: 'MX', name: 'México', prefix: '+52', flag: '🇲🇽', char: 'MX' },
  { code: 'ES', name: 'España', prefix: '+34', flag: '🇪🇸', char: 'ES' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', flag: '🇺🇸', char: 'US' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('VE');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await auth.register({
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        country: selectedCountry,
        phone: formData.get('phone') as string,
      });
      router.push('/login');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, any> } };
      const errorData = apiErr?.response?.data;
      
      if (errorData) {
        // Extract first error message from API response
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          setError(firstError[0] as string);
        } else if (typeof firstError === 'string') {
          setError(firstError);
        } else {
          setError('Error al registrar. Intenta de nuevo.');
        }
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCountryObj = COUNTRIES.find(c => c.code === selectedCountry);

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
            Crear Cuenta
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                  Nombre
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                  Apellido
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>

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

            {/* Country + Phone */}
            <div className="space-y-2">
              <label className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                País y Teléfono
              </label>
              <div className="flex gap-2 items-stretch">
                <div className="relative w-16">
                  <select
                    id="country"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="block w-full px-2 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-white focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all cursor-pointer appearance-none h-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23666' d='M0 0l6 8 6-8z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 4px center',
                      paddingRight: '20px',
                      color: 'transparent',
                      textShadow: '0 0 0 18px #1a1a1a',
                    }}
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.char}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-2 top-1 pointer-events-none text-xl leading-8 font-body-sm">
                    {selectedCountryObj?.flag}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-stretch h-10">
                    <span className="px-2 border border-outline-variant border-r-0 rounded-l-lg bg-surface-container-lowest font-body-sm text-on-surface-variant text-xs whitespace-nowrap flex items-center">
                      {selectedCountryObj?.flag} {selectedCountryObj?.prefix}
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Número"
                      className="flex-1 px-3 py-2 border border-outline-variant rounded-r-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
                    />
                  </div>
                </div>
              </div>
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
                minLength={8}
                className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Confirmar Contrasena
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="block w-full px-3 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-container text-on-primary-container font-label-md py-3 rounded-lg shadow-sm hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </button>

          <p className="text-center font-body-sm text-on-surface-variant">
            Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
