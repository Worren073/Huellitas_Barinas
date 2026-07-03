'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import { auth } from '@/lib/auth';
import Icon from '@/components/Icon';

interface UserDropdownProps {
  show: boolean;
  onClose: () => void;
  userRole: string | null;
}

const ADMIN_ROLES = ['superadmin', 'center_admin'];

export default function UserDropdown({ show, onClose, userRole }: UserDropdownProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [show, onClose]);

  const handleLogout = () => {
    auth.logout();
    sileo.success({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente.' });
    router.push('/');
    onClose();
  };

  if (!show) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-64 bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl overflow-hidden z-50"
      style={{ animation: 'fadeScaleIn 0.15s ease-out' }}
    >
      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {ADMIN_ROLES.includes(userRole || '') && (
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <Icon name="dashboard" className="w-5 h-5 text-primary" />
          <span className="font-label-md">Ir al Dashboard</span>
        </Link>
      )}

      {userRole === 'adopter' && (
        <Link
          href="/dashboard/mis-solicitudes"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <Icon name="description" className="w-5 h-5 text-primary" />
          <span className="font-label-md">Mis Solicitudes</span>
        </Link>
      )}

      <div className="border-t border-outline-variant/30" />

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
      >
        <Icon name="logout_door" className="w-5 h-5" />
        <span className="font-label-md">Cerrar Sesión</span>
      </button>
    </div>
  );
}
