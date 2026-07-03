'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import Icon from './Icon';
import ActiveLink from './ActiveLink';
import UserDropdown from './ui/UserDropdown';

interface NavbarProps {
  variant?: 'public' | 'catalog' | 'detail';
}

// eslint-disable-next-line no-unused-vars
export default function Navbar({ variant: _variant }: NavbarProps = {}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 md:px-8 max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-11 h-11 overflow-hidden flex items-start shrink-0">
            <Image
              src="/Huellitas png.png"
              alt="Huellitas Barinas"
              width={44}
              height={44}
              className="object-contain object-top"
              style={{ marginTop: '-4px' }}
            />
          </div>
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
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                title="Menú de usuario"
              >
                <Icon name="user_circle" className="w-7 h-7" solid />
              </button>
              <UserDropdown
                show={showDropdown}
                onClose={() => setShowDropdown(false)}
                userRole={userRole}
              />
            </div>
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
