'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { auth } from '@/lib/auth';
import Icon from './Icon';
import ActiveLink from './ActiveLink';
import UserDropdown from './ui/UserDropdown';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileHint, setShowMobileHint] = useState(false);

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

    if (typeof window !== 'undefined' && !localStorage.getItem('seenMobileMenuHint')) {
      setShowMobileHint(true);
    }
  }, []);

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40">
      <div className="flex justify-between items-center px-4 md:px-8 max-w-container-max mx-auto h-20">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden flex items-start shrink-0">
            <Image
              src="/Huellitas png.png"
              alt="Huellitas de Venezuela"
              width={35}
              height={35}
              className="object-contain"
            />
          </div>
          <span className="font-montserrat text-headline-md font-bold text-primary hidden sm:block">
            Huellitas de Venezuela
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
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (showMobileHint) {
                    setShowMobileHint(false);
                    localStorage.setItem('seenMobileMenuHint', 'true');
                  }
                }}
                className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors relative"
                title="Menú de usuario"
              >
                <Icon name="user_circle" className="w-7 h-7" solid />
                {showMobileHint && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full animate-pulse md:hidden" />
                )}
              </button>
              {showMobileHint && createPortal(
                <div className="fixed top-[88px] right-4 z-[9999] md:hidden animate-fade-scale-in">
                  <div className="bg-primary-container text-on-primary-container font-label-sm px-3 py-2 rounded-xl shadow-lg whitespace-nowrap relative">
                    <div className="absolute -top-1.5 right-4 w-3 h-3 bg-primary-container rotate-45" />
                    Toca para ver el menú
                  </div>
                </div>,
                document.body
              )}
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
