'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import { auth } from '@/lib/auth';
import Icon from './Icon';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  email: string;
  first_name: string;
  role?: string;
}

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['superadmin', 'center_admin'] },
  { href: '/dashboard/pets', label: 'Mascotas', icon: 'pets', roles: ['superadmin', 'center_admin'] },
  { href: '/dashboard/adoptions', label: 'Postulantes', icon: 'volunteer_activism', roles: ['superadmin', 'center_admin'] },
  { href: '/dashboard/centers', label: 'Centros', icon: 'location', roles: ['superadmin'] },
  { href: '/dashboard/users', label: 'Usuarios', icon: 'group', roles: ['superadmin'] },
];

function SidebarContent({ visibleLinks, pathname, user, onClose }: { visibleLinks: typeof adminLinks; pathname: string; user: User; onClose?: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    sileo.success({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente.' });
    router.push('/');
  };

  return (
    <>
      <Link href="/" className="flex items-center gap-3 px-3 mb-8" onClick={onClose}>
        <Image
          src="/Huellitas png.png"
          alt="Huellitas Barinas"
          width={28}
          height={28}
          className="object-contain"
        />
        <div>
          <h2 className="font-headline-sm text-primary tracking-tight">Admin Panel</h2>
          <p className="font-label-sm text-on-surface-variant">Huellitas Barinas</p>
        </div>
      </Link>

      <div className="flex flex-col gap-1 flex-1">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
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

      <div className="mt-auto flex flex-col gap-2">
        <Link
          href="/"
          onClick={onClose}
          className="w-full border border-outline-variant text-on-surface-variant font-label-md py-2.5 rounded-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
        >
          <Icon name="logout_door" className="w-[18px] h-[18px]" />
          Ver sitio público
        </Link>
        {visibleLinks.some(l => l.href === '/dashboard/pets') && (
          <Link
            href="/dashboard/pets/new"
            onClick={onClose}
            className="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-surface-tint transition-all flex items-center justify-center gap-2 group"
          >
            <Icon name="add" className="w-[18px] h-[18px] group-hover:rotate-90 transition-transform" />
            Nueva Mascota
          </Link>
        )}
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
    </>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [visibleLinks, setVisibleLinks] = useState(adminLinks);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    auth.getProfile()
      .then((profile) => {
        if (profile.role !== 'superadmin' && profile.role !== 'center_admin') {
          router.push('/');
          return;
        }
        setUser(profile);
        setVisibleLinks(adminLinks.filter(link => link.roles.includes(profile.role)));
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <nav className="hidden md:flex flex-col h-full py-stack-lg px-stack-md bg-surface-container-low border-r border-outline-variant shadow-sm w-64 shrink-0">
        <SidebarContent visibleLinks={visibleLinks} pathname={pathname} user={user} />
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-xl animate-fade-scale-in flex flex-col py-stack-lg px-stack-md overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors">
                <Icon name="close_simple" className="w-6 h-6" />
              </button>
            </div>
            <SidebarContent visibleLinks={visibleLinks} pathname={pathname} user={user} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-surface-off-white">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="w-6 h-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Huellitas png.png" alt="Huellitas Barinas" width={24} height={24} className="object-contain" />
            <span className="font-montserrat font-headline-sm text-primary">Admin</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant font-label-md">
            {user?.first_name?.[0] || 'A'}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
