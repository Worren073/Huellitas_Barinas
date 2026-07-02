'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import { auth } from '@/lib/auth';
import api from '@/lib/api';

interface Center {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  max_capacity: number;
  current_capacity: number;
  pets_count: number;
  is_full: boolean;
}

interface User {
  email: string;
  first_name: string;
  role?: string;
  center?: number;
}

interface CenterAdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  center: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
};

export default function CentersPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerAdmins, setCenterAdmins] = useState<CenterAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    max_capacity: 50,
  });
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCenter, setUserCenter] = useState<number | null>(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

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

  const fetchCenterAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const r = await api.get<{ results: CenterAdminUser[] }>('/users/?role=center_admin');
      // Filter to show only center_admins without a center assigned, or with the center we're creating
      const availableAdmins = (r.data.results || r.data || []).filter(u => !u.center);
      setCenterAdmins(availableAdmins);
    } catch {
      setCenterAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    auth.getProfile().then((profile: User) => {
      if (profile.role !== 'superadmin' && profile.role !== 'center_admin') {
        router.push('/dashboard');
        return;
      }
      setUserRole(profile.role);
      if (profile.role === 'center_admin' && profile.center) {
        setUserCenter(profile.center);
      }
    }).catch(() => router.push('/login'));

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    if (userRole === 'superadmin' && !selectedAdmin) {
      setError('Debe seleccionar un administrador para el centro');
      setCreating(false);
      return;
    }

    try {
      // Create center
      const { data: createdCenter } = await api.post('/centers/', newCenter);

      // If an admin is selected, assign them to this center
      if (selectedAdmin && userRole === 'superadmin') {
        await api.patch(`/users/${selectedAdmin}/change_role/`, {
          role: 'center_admin',
          center: createdCenter.id,
        });
      }

      sileo.success({
        title: 'Centro creado',
        description: `${newCenter.name} ha sido creado correctamente${selectedAdmin ? ' y asignado a un administrador' : ''}.`,
      });
      setShowModal(false);
      setNewCenter({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        max_capacity: 50,
      });
      setSelectedAdmin(null);
      fetchCenters();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, string[]> } };
      setError(
        apiErr?.response?.data
          ? Object.values(apiErr.response.data).flat().join('. ')
          : 'Error al crear centro'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    if (userRole === 'superadmin') {
      await fetchCenterAdmins();
    }
  };

  const inputClass =
    'w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all';

  // Filter centers based on user role
  const displayedCenters =
    userRole === 'superadmin'
      ? centers
      : centers.filter(c => c.id === userCenter);

  if (!userRole) return null;

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-stack-lg">
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
              onClick={handleOpenModal}
              className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 transition-all flex items-center gap-2"
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
              icon="cancel"
              value={centers.filter(c => c.status === 'inactive').length}
              label="Inactivos"
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
                className="bg-surface rounded-xl ambient-shadow border border-outline-variant p-stack-md hover:shadow-card-hover transition-all"
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
                    {c.address}
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

                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="font-label-sm text-on-surface-variant">
                      {c.pets_count} mascotas
                    </span>
                  </div>
                  {userRole === 'superadmin' && (
                    <button
                      onClick={() => handleToggleStatus(c)}
                      className={`px-3 py-1.5 rounded-lg font-label-sm transition-all ${
                        c.status === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {c.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userRole === 'superadmin' && showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
              <h3 className="font-headline-sm text-on-surface">Nuevo Centro</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAdmin(null);
                  setError('');
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-stack-md space-y-stack-md">
              {error && (
                <div className="bg-status-error/10 text-status-error font-body-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="font-label-md text-on-surface mb-1.5 block">Nombre</label>
                <input
                  className={inputClass}
                  value={newCenter.name}
                  onChange={e => setNewCenter(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface mb-1.5 block">Descripción</label>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={newCenter.description}
                  onChange={e => setNewCenter(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="font-label-md text-on-surface mb-1.5 block">Dirección</label>
                <input
                  className={inputClass}
                  value={newCenter.address}
                  onChange={e => setNewCenter(f => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-on-surface mb-1.5 block">Teléfono</label>
                  <input
                    className={inputClass}
                    value={newCenter.phone}
                    onChange={e => setNewCenter(f => ({ ...f, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="font-label-md text-on-surface mb-1.5 block">Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={newCenter.email}
                    onChange={e => setNewCenter(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-on-surface mb-1.5 block">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={newCenter.max_capacity}
                  onChange={e =>
                    setNewCenter(f => ({ ...f, max_capacity: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface mb-1.5 block">
                  Administrador del Centro
                </label>
                {loadingAdmins ? (
                  <div className="flex items-center justify-center py-3">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : centerAdmins.length === 0 ? (
                  <div className="p-3 bg-surface-container-low rounded-lg text-center">
                    <p className="font-body-sm text-on-surface-variant">
                      No hay administradores de centro disponibles
                    </p>
                  </div>
                ) : (
                  <select
                    className={inputClass}
                    value={selectedAdmin || ''}
                    onChange={e => setSelectedAdmin(e.target.value ? parseInt(e.target.value) : null)}
                  >
                    <option value="">Selecciona un administrador</option>
                    {centerAdmins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.first_name} {admin.last_name} ({admin.email})
                      </option>
                    ))}
                  </select>
                )}
                <p className="font-label-sm text-on-surface-variant mt-1.5">
                  Solo se muestran usuarios sin centro asignado
                </p>
              </div>

              <LoadingButton
                type="submit"
                loading={creating}
                className="w-full py-3"
                variant="primary"
              >
                Crear Centro
              </LoadingButton>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
