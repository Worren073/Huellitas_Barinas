'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import AdminTable from '@/components/AdminTable';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import api from '@/lib/api';

interface PetStats {
  pets_count: number;
  available_pets: number;
  in_process_pets: number;
  adopted_pets: number;
}

interface Adoption {
  id: number;
  pet_name: string;
  applicant_name: string;
  center_name: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [petStats, setPetStats] = useState<PetStats | null>(null);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [adoptionsTotal, setAdoptionsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<PetStats>('/pets/stats/'),
      api.get<{ results: Adoption[] }>('/adoptions/'),
    ])
      .then(([statsRes, adoptionsRes]) => {
        setPetStats(statsRes.data);
        const results = adoptionsRes.data.results || [];
        setAdoptions(results.slice(0, 10));
        setAdoptionsTotal(results.length);
        setPendingCount(results.filter((a: Adoption) => a.status === 'pending').length);
        setTotalPages(Math.ceil(results.length / 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'applicant_name',
      label: 'Solicitante',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-on-surface-variant font-label-md">
            {String(item.applicant_name || 'U')[0]}
          </div>
          <p className="font-label-md text-on-surface">{String(item.applicant_name || '')}</p>
        </div>
      ),
    },
    { key: 'pet_name', label: 'Mascota' },
    { key: 'center_name', label: 'Centro' },
    {
      key: 'status',
      label: 'Estado',
      render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status || '')} />,
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (item: Record<string, unknown>) => (
        <span className="text-on-surface-variant">
          {new Date(String(item.created_at || '')).toLocaleDateString('es-VE')}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-stack-lg">
          <div>
            <h1 className="font-montserrat text-headline-lg text-on-surface">Dashboard</h1>
            <p className="font-body-md text-on-surface-variant">Panel principal de administracion</p>
          </div>
          <Link
            href="/dashboard/pets/new"
            className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon name="add" className="w-5 h-5" />
            Nueva Mascota
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
          <AdminMetricCard
            icon="pets"
            value={loading ? '...' : (petStats?.pets_count ?? 0)}
            label="Total Mascotas"
          />
          <AdminMetricCard
            icon="check_circle"
            value={loading ? '...' : (petStats?.available_pets ?? 0)}
            label="Disponibles"
          />
          <AdminMetricCard
            icon="schedule"
            value={loading ? '...' : pendingCount}
            label="Solicitudes Pendientes"
          />
          <AdminMetricCard
            icon="volunteer_activism"
            value={loading ? '...' : (petStats?.adopted_pets ?? 0)}
            label="Adoptados"
          />
        </div>

        <AdminTable
          columns={columns}
          data={adoptions as unknown as Record<string, unknown>[]}
          title="Solicitudes Recientes"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
}
