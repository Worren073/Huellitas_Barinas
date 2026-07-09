'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import CenterInfoModal from '@/components/CenterInfoModal';
import CenterFormModal from '@/components/CenterFormModal';
import { auth } from '@/lib/auth';
import api from '@/lib/api';

interface Center {
  id: number;
  name: string;
  description: string;
  address: string;
  state: string;
  phone: string;
  email: string;
  status: string;
  max_capacity: number;
  current_capacity: number;
  pets_count: number;
  is_full: boolean;
  logo?: string | null;
  cover_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface User {
  email: string;
  first_name: string;
  role?: string;
  center?: { id: number; name: string };
}

export default function CentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCenter, setUserCenter] = useState<number | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCenters = async () => {
    try {
      const r = await api.get<{ results: Center[] }>('/centers/');
      setCenters(r.data.results || r.data || []);
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login/');
      return;
    }
    auth.getProfile().then((profile: User) => {
      if (profile.role !== 'superadmin' && profile.role !== 'center_admin') {
        router.push('/dashboard/');
        return;
      }
      setUserRole(profile.role);
      if (profile.role === 'center_admin' && profile.center) {
        setUserCenter(profile.center.id);
      }
    }).catch(() => router.push('/login/'));

    fetchCenters();
  }, [router]);

  const handleToggleStatus = async (c: Center) => {
    const action = c.status === 'active' ? 'deactivate' : 'activate';
    try {
      await api.post(`/centers/${c.id}/${action}/`);
      sileo.success({
        title: 'Centro actualizado',
        description: `Centro ${action === 'activate' ? 'activado' : 'desactivado'} correctamente.`,
      });
      fetchCenters();
    } catch (err: any) {
      sileo.error({ title: 'Error', description: 'Error al actualizar centro' });
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.delete(`/centers/${id}/`);
      sileo.success({ title: 'Centro eliminado', description: 'El centro ha sido eliminado correctamente.' });
      setShowDeleteConfirm(null);
      fetchCenters();
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudo eliminar el centro.' });
    } finally {
      setDeleting(false);
    }
  };

  // Filter centers based on user role
  const displayedCenters =
    userRole === 'superadmin'
      ? centers
      : centers.filter(c => c.id === userCenter);

  if (!userRole) return null;

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-stack-lg">
          <div>
            <h1 className="font-montserrat text-headline-lg text-on-surface">
              {userRole === 'superadmin' ? 'Centros' : 'Mi Centro'}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {userRole === 'superadmin'
                ? 'Gestión de centros de adopción'
                : 'Información de tu centro de adopción'}
            </p>
          </div>
          {userRole === 'superadmin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 transition-all flex items-center gap-2 self-start mt-3 md:mt-0"
            >
              <Icon name="add" className="w-5 h-5" /> Nuevo Centro
            </button>
          )}
        </div>

          {userRole === 'superadmin' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
            <AdminMetricCard icon="location" value={centers.length} label="Total Centros" />
            <AdminMetricCard
              icon="check_circle"
              value={centers.filter(c => c.status === 'active').length}
              label="Activos"
            />
            <AdminMetricCard
              icon="pending_actions"
              value={centers.filter(c => c.status === 'pending').length}
              label="Pendientes"
            />
            <AdminMetricCard
              icon="pets"
              value={centers.reduce((s, c) => s + c.pets_count, 0)}
              label="Total Mascotas"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : displayedCenters.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Icon name="location" className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="font-body-md text-on-surface-variant">
                {userRole === 'superadmin'
                  ? 'No hay centros disponibles'
                  : 'No tienes un centro asignado'}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-stack-md ${
              userRole === 'superadmin'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {displayedCenters.map(c => (
              <div
                key={c.id}
                className="bg-surface rounded-xl ambient-shadow border border-outline-variant p-stack-md hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => setSelectedCenter(c)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-headline-sm text-on-surface">{c.name}</h3>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-1">
                      {c.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="location" className="w-4 h-4 shrink-0" />
                    {c.address || c.state}
                  </p>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="call" className="w-4 h-4 shrink-0" />
                    {c.phone}
                  </p>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5">
                    <Icon name="mail" className="w-4 h-4 shrink-0" />
                    {c.email}
                  </p>
                </div>

                {userRole === 'superadmin' && (
                  <div className="mb-4 p-3 bg-surface-container-low rounded-lg">
                    <p className="font-label-sm text-on-surface-variant">
                      Capacidad: {c.current_capacity} / {c.max_capacity}
                    </p>
                    <div className="w-full bg-surface-container-high rounded-full h-2 mt-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${(c.current_capacity / c.max_capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="font-label-sm text-on-surface-variant">
                      {c.pets_count} mascotas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCenter(c); }}
                      className="px-3 py-1.5 rounded-lg font-label-sm bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    {userRole === 'superadmin' && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(c); }}
                          className={`px-3 py-1.5 rounded-lg font-label-sm transition-all ${
                            c.status === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : c.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {c.status === 'active' ? 'Desactivar' : c.status === 'pending' ? 'Aprobar' : 'Activar'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(c.id); }}
                          className="px-3 py-1.5 rounded-lg font-label-sm bg-surface-container-high text-status-error hover:bg-red-100 transition-all"
                        >
                          <Icon name="delete" className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CenterFormModal
        open={showCreateModal || !!editingCenter}
        onClose={() => { setShowCreateModal(false); setEditingCenter(null); }}
        onSaved={() => { fetchCenters(); setShowCreateModal(false); setEditingCenter(null); }}
        center={editingCenter || undefined}
        userRole={userRole || ''}
      />

      {selectedCenter && (
        <CenterInfoModal center={selectedCenter} onClose={() => setSelectedCenter(null)} />
      )}

      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-surface rounded-2xl max-w-sm w-full shadow-xl p-stack-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-headline-sm text-on-surface mb-2">Eliminar Centro</h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              ¿Estás seguro de eliminar este centro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
              >
                Cancelar
              </button>
              <LoadingButton
                onClick={() => handleDelete(showDeleteConfirm)}
                loading={deleting}
                variant="secondary"
                className="flex-1 py-2.5 bg-status-error text-white hover:brightness-110"
              >
                Eliminar
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
