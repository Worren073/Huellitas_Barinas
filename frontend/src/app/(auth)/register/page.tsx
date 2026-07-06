'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sileo } from 'sileo';
import { auth } from '@/lib/auth';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import TermsModal from '@/components/TermsModal';

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

const FIELD_MAP: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  password_confirm: 'confirmPassword',
  non_field_errors: '__all__',
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('VE');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const clearField = (field: string) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitted(true);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    try {
      await auth.register({
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password,
        password_confirm: confirmPassword,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        country: selectedCountry,
        phone: formData.get('phone') as string,
      });
      sileo.success({
        title: '¡Cuenta creada!',
        description: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
      });
      router.push('/login');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, any> } };
      const errorData = apiErr?.response?.data;

      if (errorData) {
        const mapped: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(errorData)) {
          const field = FIELD_MAP[key] || key;
          const msg = Array.isArray(msgs) ? msgs[0] : typeof msgs === 'string' ? msgs : null;
          if (msg && field === '__all__') setError(msg);
          else if (msg) mapped[field] = msg;
        }
        setFieldErrors(mapped);
      } else {
        setError('Error al registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCountryObj = COUNTRIES.find(c => c.code === selectedCountry);

  const inputClass = (field: string) =>
    `block w-full px-3 py-2 border rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${
      fieldErrors[field]
        ? 'border-red-400'
        : submitted
          ? 'invalid:border-red-400 border-outline-variant focus:border-primary-container'
          : 'border-outline-variant focus:border-primary-container'
    }`;

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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
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
                  maxLength={30}
                  pattern="[a-zA-ZáéíóúñÑ\s]+"
                  title="Solo letras"
                  className={inputClass('firstName')}
                  onChange={() => clearField('firstName')}
                />
                {fieldErrors.firstName && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.firstName}</p>}
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
                  maxLength={30}
                  pattern="[a-zA-ZáéíóúñÑ\s]+"
                  title="Solo letras"
                  className={inputClass('lastName')}
                  onChange={() => clearField('lastName')}
                />
                {fieldErrors.lastName && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.lastName}</p>}
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
                pattern="[a-zA-Z0-9_]+"
                title="Solo letras, números y guión bajo"
                className={inputClass('username')}
                onChange={() => clearField('username')}
              />
              {fieldErrors.username && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.username}</p>}
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
                maxLength={100}
                className={inputClass('email')}
                onChange={() => clearField('email')}
              />
              {fieldErrors.email && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.email}</p>}
            </div>

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
                      <option 
                        key={country.code} 
                        value={country.code}
                        style={{ color: '#1a1a1a', textShadow: 'none' }}
                      >
                        {country.flag} {country.name} ({country.prefix})
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
                      inputMode="numeric"
                      maxLength={11}
                      pattern="[0-9+\s()]+"
                      placeholder="Número"
                      className={`flex-1 px-3 py-2 border rounded-r-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20 transition-all ${
                        fieldErrors.phone ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'
                      }`}
                      onChange={() => clearField('phone')}
                    />
                  </div>
                  {fieldErrors.phone && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.phone}</p>}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={7}
                className={inputClass('password')}
                onChange={() => clearField('password')}
              />
              <p className="font-body-xs text-on-surface-variant/60 mt-1">
                Mínimo 8 caracteres
              </p>
              {fieldErrors.password && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-label-md text-on-surface-variant uppercase tracking-wider mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className={inputClass('confirmPassword')}
                onChange={() => clearField('confirmPassword')}
              />
              {fieldErrors.confirmPassword && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsModalOpen(true)}
              className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary-container/20 cursor-pointer"
            />
            <label htmlFor="terms" className="font-body-sm text-on-surface-variant cursor-pointer">
              Acepto los{' '}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setTermsModalOpen(true); }}
                className="text-primary hover:underline font-label-md"
              >
                términos y condiciones
              </button>
            </label>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            disabled={!termsAccepted}
            className="w-full"
            variant="primary"
          >
            Crear Cuenta
          </LoadingButton>

          <p className="text-center font-body-sm text-on-surface-variant">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>

      <TermsModal
        open={termsModalOpen}
        onAccept={() => setTermsAccepted(true)}
        onClose={() => setTermsModalOpen(false)}
      />
    </div>
  );
}