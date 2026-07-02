'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, api } from '@/lib/api';
import { User } from '@/lib/api';

interface Stats {
  pets_count: number;
  adoptions_count: number;
  pending_adoptions: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          auth.getProfile(),
          api.get('/pets/stats/'),
        ]);
        setUser(userRes);
        setStats(statsRes.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    auth.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Huellitas Barinas
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Hola, {user?.first_name || user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Panel de Control
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Mascotas
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.pets_count || 0}
              </dd>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Adopciones Totales
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.adoptions_count || 0}
              </dd>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Solicitudes Pendientes
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats?.pending_adoptions || 0}
              </dd>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
