'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import AdminTable from '@/components/AdminTable';
import StatusBadge from '@/components/StatusBadge';
import { api } from '@/lib/api';

interface Stats {
  pets_count: number;
  adoptions_count: number;
  pending_adoptions: number;
}

interface Adoption {
  id: number;
  pet_name: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
  center_name: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get<Stats>('/pets/stats/')
      .then((res) => setStats(res.data))
      .catch(() => {});

    api.get<{ results: Adoption[]; total_pages: number }>(`/adoptions/?page=${page}`)
      .then((res) => {
        setAdoptions(res.data.results || res.data);
        setTotalPages(res.data.total_pages || 1);
      })
      .catch(() => {});
  }, [page]);

  const columns = [
    {
      key: 'applicant_name',
      label: 'Applicant',
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-container flex items-center justify-center text-on-surface-variant font-label-md">
            {String(item.applicant_name ?? 'U')[0]}
          </div>
          <div>
            <p className="font-medium text-on-surface">{String(item.applicant_name ?? '')}</p>
            <p className="text-on-surface-variant text-[12px]">{String(item.applicant_email ?? '')}</p>
          </div>
        </div>
      ),
    },
    { key: 'pet_name', label: 'Pet' },
    { key: 'center_name', label: 'Center' },
    {
      key: 'status',
      label: 'Status',
      render: (item: Record<string, unknown>) => <StatusBadge status={String(item.status ?? '')} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (item: Record<string, unknown>) => (
        <span className="text-on-surface-variant">{new Date(String(item.created_at ?? '')).toLocaleDateString('es-VE')}</span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-stack-lg">
        <div className="mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Dashboard</h1>
          <p className="font-body-sm text-on-surface-variant mt-1">Bienvenido al panel de administracion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-stack-lg">
          <AdminMetricCard icon="pets" value={stats?.pets_count ?? '--'} label="Total Mascotas" trend="+12%" />
          <AdminMetricCard icon="volunteer_activism" value={stats?.adoptions_count ?? '--'} label="Adopciones Totales" />
          <AdminMetricCard icon="schedule" value={stats?.pending_adoptions ?? '--'} label="Solicitudes Pendientes" />
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
