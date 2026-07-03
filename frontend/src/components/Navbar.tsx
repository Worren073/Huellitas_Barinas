'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import { auth } from '@/lib/auth';
import Icon from './Icon';
import ActiveLink from './ActiveLink';

interface NavbarProps {
  variant?: 'public' | 'catalog' | 'detail';
}

const ADMIN_ROLES = ['superadmin', 'center_admin'];

export default function Navbar({ variant = 'public' }: NavbarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const navLinks = [
    { href: '/mascotas', label: 'Mascotas' },
    { href: '/centros', label: 'Centros' },
    { href: '/#sobre-nosotros', label: 'Sobre Nosotros' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.isAuthenticated()) {
        setIsLoggedIn(false);
        setUserRole(null);
        return;
      }
      try {
        const profile = await auth.getProfile();
        setIsLoggedIn(true);
        setUserRole(profile.role || null);
      } catch {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    auth.logout();
    setIsLoggedIn(false);
    setUserRole(null);
    sileo.success({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente.' });
    router.push('/');
  };

  const dashboardHref = ADMIN_ROLES.includes(userRole || '') ? '/dashboard' : '/';

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 md:px-8 max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-3">
          <Icon name="pets" className="w-7 h-7 text-primary" solid />
          <span className="font-montserrat text-headline-md font-bold text-primary hidden sm:block">
            Huellitas Barinas
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <ActiveLink key={link.href} href={link.href}>
              {link.label}
            </ActiveLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                title={ADMIN_ROLES.includes(userRole || '') ? 'Panel de administración' : 'Mi perfil'}
              >
                <Icon name="user_circle" className="w-7 h-7" solid />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                title="Cerrar sesión"
              >
                <Icon name="logout_door" className="w-7 h-7" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-label-md text-primary px-4 py-2 rounded-lg hover:bg-surface-container-low transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-primary-container text-on-primary-container font-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Registro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
