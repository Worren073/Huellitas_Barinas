'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import Icon from './Icon';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/pets', label: 'Mascotas', icon: 'pets' },
  { href: '/dashboard/centers', label: 'Centros', icon: 'location' },
  { href: '/dashboard/adoptions', label: 'Solicitudes', icon: 'volunteer_activism' },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'group' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; first_name: string } | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    auth.getProfile().then(setUser).catch(() => router.push('/login'));
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="hidden md:flex flex-col h-full py-stack-lg px-stack-md bg-surface-container-low border-r border-outline-variant shadow-sm w-64 shrink-0">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
            <Icon name="pets" className="w-5 h-5" solid />
          </div>
          <div>
            <h2 className="font-headline-sm text-primary tracking-tight">Admin Panel</h2>
            <p className="font-label-sm text-on-surface-variant">Huellitas Barinas</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold group transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container translate-x-1 hover:brightness-105'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon name={link.icon} className="w-5 h-5" solid={isActive} />
                <span className="font-label-md tracking-wide">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <Link
            href="/dashboard/pets/new"
            className="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-surface-tint transition-all flex items-center justify-center gap-2 group"
          >
            <Icon name="add" className="w-[18px] h-[18px] group-hover:rotate-90 transition-transform" />
            Nueva Mascota
          </Link>
          <div className="flex items-center gap-3 px-2 pt-4 border-t border-outline-variant/50">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-label-md">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-on-surface truncate">{user?.first_name || 'Administrador'}</p>
              <p className="font-label-sm text-on-surface-variant truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="text-on-surface-variant hover:text-primary transition-colors">
              <Icon name="logout" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto bg-surface-off-white">
        {children}
      </main>
    </div>
  );
}
