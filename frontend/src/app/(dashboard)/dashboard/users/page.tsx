'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
import Modal from '@/components/ui/Modal';
import { auth } from '@/lib/auth';
import api from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  country: string;
  address: string;
  is_active: boolean;
  is_verified: boolean;
  center_name: string;
  center: number;
  date_joined: string;
  deletion_requested_at: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Súper Admin',
  center_admin: 'Admin Centro',
  adoptante: 'Adoptante',
};

const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Súper Admin' },
  { value: 'center_admin', label: 'Admin Centro' },
  { value: 'adoptante', label: 'Adoptante' },
];

const COUNTRY_OPTIONS = [
  { value: 'VE', label: 'Venezuela (+58)' },
  { value: 'CO', label: 'Colombia (+57)' },
  { value: 'EC', label: 'Ecuador (+593)' },
  { value: 'PE', label: 'Perú (+51)' },
  { value: 'CL', label: 'Chile (+56)' },
  { value: 'AR', label: 'Argentina (+54)' },
  { value: 'BR', label: 'Brasil (+55)' },
  { value: 'MX', label: 'México (+52)' },
  { value: 'ES', label: 'España (+34)' },
  { value: 'US', label: 'Estados Unidos (+1)' },
];

function daysUntilDeletion(dateStr: string): number {
  const diff = new Date(dateStr).getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [deletedFilter, setDeletedFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingUserInfo, setSavingUserInfo] = useState(false);
  const [actionModal, setActionModal] = useState<{ type: 'deactivate' | 'restore'; user: User } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login/');
      return;
    }
    auth.getProfile().then(profile => {
      if (profile.role !== 'superadmin') {
        router.push('/dashboard/');
        return;
      }
      setUserRole(profile.role);
    }).catch(() => router.push('/login/'));
  }, [router]);

  const fetchUsers = async () => {
    try {
      let params = '';
      if (filter) params = `?role=${filter}`;
      if (deletedFilter) params = `${params ? '&' : '?'}deleted=true`;
      const { data } = await api.get<any>(`/users/${params}`);
      setUsers(data.results || data || []);
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudieron cargar los usuarios' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, deletedFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeRole = async () => {
    if (!editingUser || !newRole) return;

    setUpdating(true);
    try {
      await api.patch(`/users/${editingUser.id}/`, { role: newRole });

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole } : u));
      setEditingUser(null);
      setNewRole('');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Error al cambiar el rol';
      sileo.error({ title: 'Error', description: message });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!actionModal || actionModal.type !== 'deactivate') return;
    setActionLoading(true);
    try {
      await api.post(`/users/${actionModal.user.id}/deactivate/`);
      sileo.success({ title: 'Cuenta desactivada', description: `La cuenta de ${actionModal.user.first_name} será eliminada en 30 días.` });
      setActionModal(null);
      fetchUsers();
    } catch (err: any) {
      sileo.error({ title: 'Error', description: err.response?.data?.error || 'Error al desactivar cuenta' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!actionModal || actionModal.type !== 'restore') return;
    setActionLoading(true);
    try {
      await api.post(`/users/${actionModal.user.id}/restore/`);
      sileo.success({ title: 'Cuenta restaurada', description: `La cuenta de ${actionModal.user.first_name} ha sido restaurada.` });
      setActionModal(null);
      fetchUsers();
    } catch {
      sileo.error({ title: 'Error', description: 'Error al restaurar cuenta' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveUserInfo = async () => {
    if (!editingUser) return;
    setSavingUserInfo(true);
    try {
      await api.patch(`/users/${editingUser.id}/`, {
        phone: editPhone,
        country: editCountry,
        address: editAddress,
      });
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, phone: editPhone, country: editCountry, address: editAddress } : u));
      sileo.success({ title: 'Usuario actualizado', description: 'Información del usuario actualizada correctamente.' });
    } catch (err: any) {
      sileo.error({ title: 'Error', description: err.response?.data?.detail || 'Error al actualizar usuario' });
    } finally {
      setSavingUserInfo(false);
    }
  };

  if (!userRole) return null;

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Usuarios</h1>
          <p className="font-body-md text-on-surface-variant">Gestión de usuarios del sistema</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
          <AdminMetricCard icon="group" value={users.length} label="Total Usuarios" />
          <AdminMetricCard icon="admin" value={users.filter(u => u.role === 'superadmin' || u.role === 'center_admin').length} label="Administradores" />
          <AdminMetricCard icon="volunteer_activism" value={users.filter(u => u.role === 'adoptante').length} label="Adoptantes" />
        </div>

        <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/30 flex gap-2 flex-wrap">
            {['', 'superadmin', 'center_admin', 'adoptante'].map(r => (
              <button
                key={r}
                onClick={() => { setFilter(r); setDeletedFilter(false); }}
                className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${
                  filter === r && !deletedFilter
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'
                }`}
              >
                {r ? ROLE_LABELS[r] || r : 'Todos'}
              </button>
            ))}
            <button
              onClick={() => { setDeletedFilter(true); setFilter(''); }}
              className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${
                deletedFilter
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'
              }`}
            >
              Eliminados
            </button>
          </div>

          {loading ? (
            <div className="p-stack-lg text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-stack-lg text-center">
              <Icon name="group" className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="font-body-md text-on-surface-variant">No hay usuarios</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-gray/30 border-b border-outline-variant/30">
                    <th className="p-stack-sm pl-stack-md font-label-md text-on-surface-variant uppercase">Usuario</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Email</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Rol</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Centro</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Estado</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {users.map(u => {
                    const daysLeft = u.deletion_requested_at ? daysUntilDeletion(u.deletion_requested_at) : 0;
                    return (
                      <tr key={u.id} className="hover:bg-surface-container-low/50 group">
                        <td className="p-stack-sm pl-stack-md">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-label-md text-on-surface-variant">
                              {(u.first_name?.[0] || u.username[0]).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-label-md text-on-surface">{u.first_name} {u.last_name}</p>
                              <p className="font-label-sm text-on-surface-variant">@{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-stack-sm font-body-sm text-on-surface-variant">{u.email}</td>
                        <td className="p-stack-sm">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium border ${
                              u.role === 'superadmin'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : u.role === 'center_admin'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-gray-100 text-gray-800 border-gray-300'
                            }`}
                          >
                            {ROLE_LABELS[u.role] || u.role}
                          </span>
                        </td>
                        <td className="p-stack-sm font-body-sm text-on-surface-variant">{u.center_name || '—'}</td>
                        <td className="p-stack-sm">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-status-approved' : 'bg-status-error'}`} />
                              <span className="font-body-sm">{u.is_active ? 'Activo' : 'Inactivo'}</span>
                            </div>
                            {u.deletion_requested_at && (
                              <span className="font-label-xs text-status-error">
                                Elim. en {daysLeft} días
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-stack-sm">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setNewRole(u.role);
                              setEditPhone(u.phone || '');
                              setEditCountry(u.country || 'VE');
                              setEditAddress(u.address || '');
                            }}
                            className="text-primary hover:text-primary-container font-label-sm transition-colors"
                          >
                            Detalles
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-stack-lg max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-stack-md">
              <h3 className="font-headline-md text-on-surface">Detalles del Usuario</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-stack-md">
              <p className="font-body-sm text-on-surface-variant">
                <strong className="text-on-surface">{editingUser.first_name} {editingUser.last_name}</strong>
                {editingUser.deletion_requested_at && (
                  <span className="block mt-1 text-status-error">
                    Eliminación programada en {daysUntilDeletion(editingUser.deletion_requested_at)} días
                  </span>
                )}
              </p>
            </div>

            <hr className="border-outline-variant/20 mb-stack-md" />

            <div className="space-y-stack-sm mb-stack-md">
              <label className="block font-label-md text-on-surface mb-2">Teléfono</label>
              <input
                type="tel"
                inputMode="numeric"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="space-y-stack-sm mb-stack-md">
              <label className="block font-label-md text-on-surface mb-2">País</label>
              <select
                value={editCountry}
                onChange={e => setEditCountry(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container"
              >
                {COUNTRY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-stack-sm mb-stack-md">
              <label className="block font-label-md text-on-surface mb-2">Dirección</label>
              <textarea
                rows={2}
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container resize-none"
              />
            </div>

            <LoadingButton
              onClick={handleSaveUserInfo}
              loading={savingUserInfo}
              className="w-full py-2 mb-stack-md"
              variant="primary"
            >
              Guardar Información
            </LoadingButton>

            <hr className="border-outline-variant/20 mb-stack-md" />

            {/* Role Change */}
            <div className="space-y-stack-sm mb-stack-md">
              <label className="block font-label-md text-on-surface mb-2">Nuevo Rol</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container"
              >
                <option value="">Selecciona un rol</option>
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-stack-lg">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 border border-outline-variant text-on-surface rounded-lg font-label-md transition-colors hover:bg-surface-container-low"
              >
                Cancelar
              </button>
              <LoadingButton
                onClick={handleChangeRole}
                loading={updating}
                className="flex-1 py-2"
                variant="primary"
              >
                Cambiar Rol
              </LoadingButton>
            </div>

            <hr className="border-outline-variant/20 mb-stack-md" />

            {/* Deactivate / Restore Section */}
            {!editingUser.is_active ? (
              <div>
                <p className="font-body-sm text-on-surface-variant mb-3">
                  Este usuario está desactivado. Puedes reactivar su cuenta para que pueda acceder nuevamente al sistema.
                </p>
                <LoadingButton
                  onClick={() => setActionModal({ type: 'restore', user: editingUser })}
                  loading={false}
                  className="w-full py-2"
                  variant="primary"
                >
                  Reactivar Cuenta
                </LoadingButton>
              </div>
            ) : (
              <div>
                <p className="font-body-sm text-on-surface-variant mb-3">
                  Desactivar la cuenta del usuario. Las adopciones completadas se conservarán en los registros.
                </p>
                <LoadingButton
                  onClick={() => setActionModal({ type: 'deactivate', user: editingUser })}
                  loading={false}
                  className="w-full py-2 !bg-red-600"
                >
                  Desactivar / Eliminar Cuenta
                </LoadingButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Deactivate Modal */}
      <Modal
        open={actionModal?.type === 'deactivate'}
        onClose={() => !actionLoading && setActionModal(null)}
        title="Desactivar Cuenta"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="font-body-md text-on-surface-variant">
            ¿Estás seguro de que deseas desactivar la cuenta de <strong>{actionModal?.user.first_name} {actionModal?.user.last_name}</strong>?
          </p>
          <ul className="space-y-2 font-body-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
              La cuenta quedará <strong>desactivada inmediatamente</strong>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
              Los datos se eliminarán después de <strong>30 días</strong>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
              Las adopciones completadas se <strong>conservarán</strong>
            </li>
          </ul>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActionModal(null)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl font-label-md transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <LoadingButton
              onClick={handleDeactivateUser}
              loading={actionLoading}
              className="flex-1 py-2.5 !bg-red-600"
            >
              Desactivar
            </LoadingButton>
          </div>
        </div>
      </Modal>

      {/* Confirm Restore Modal */}
      <Modal
        open={actionModal?.type === 'restore'}
        onClose={() => !actionLoading && setActionModal(null)}
        title="Reactivar Cuenta"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="font-body-md text-on-surface-variant">
            ¿Reactivar la cuenta de <strong>{actionModal?.user.first_name} {actionModal?.user.last_name}</strong>?
          </p>
          <p className="font-body-sm text-on-surface-variant">
            El usuario podrá acceder nuevamente a su cuenta y la desactivación programada será cancelada.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setActionModal(null)}
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl font-label-md transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <LoadingButton
              onClick={handleRestoreUser}
              loading={actionLoading}
              className="flex-1 py-2.5"
              variant="primary"
            >
              Reactivar
            </LoadingButton>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}