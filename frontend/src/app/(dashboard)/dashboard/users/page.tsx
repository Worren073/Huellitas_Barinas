'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import Icon from '@/components/Icon';
import LoadingButton from '@/components/LoadingButton';
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
  is_active: boolean;
  is_verified: boolean;
  center_name: string;
  center: number;
  date_joined: string;
}

interface Center {
  id: number;
  name: string;
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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    auth.getProfile().then(profile => {
      if (profile.role !== 'superadmin') {
        router.push('/dashboard');
        return;
      }
      setUserRole(profile.role);
    }).catch(() => router.push('/login'));
  }, [router]);

  const fetchUsers = async () => {
    try {
      const params = filter ? `?role=${filter}` : '';
      const { data } = await api.get<any>(`/users/${params}`);
      setUsers(data.results || data || []);
    } catch {
      sileo.error({ title: 'Error', description: 'No se pudieron cargar los usuarios' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const { data } = await api.get<any>('/centers/');
      setCenters(data.results || data || []);
    } catch {
      setCenters([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCenters();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeRole = async () => {
    if (!editingUser || !newRole) return;

    setUpdating(true);
    try {
      const payload: any = { role: newRole };
      if (newRole === 'center_admin' && selectedCenter) {
        payload.center = selectedCenter;
      }

      await api.patch(`/users/${editingUser.id}/`,payload);
      
      sileo.success({
        title: 'Rol actualizado',
        description: `El rol de ${editingUser.first_name} ha sido actualizado a ${ROLE_LABELS[newRole]}.`,
      });

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, role: newRole, center: selectedCenter || u.center } : u));
      setEditingUser(null);
      setNewRole('');
      setSelectedCenter(null);
    } catch (err: any) {
      const message = err.response?.data?.center?.[0] || err.response?.data?.detail || 'Error al cambiar el rol';
      sileo.error({ title: 'Error', description: message });
    } finally {
      setUpdating(false);
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
                onClick={() => setFilter(r)}
                className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${
                  filter === r
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'
                }`}
              >
                {r ? ROLE_LABELS[r] || r : 'Todos'}
              </button>
            ))}
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
                  {users.map(u => (
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
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-status-approved' : 'bg-status-error'}`} />
                          <span className="font-body-sm">{u.is_active ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </td>
                      <td className="p-stack-sm">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                            setSelectedCenter(u.center);
                          }}
                          className="text-primary hover:text-primary-container font-label-sm transition-colors"
                        >
                          Cambiar rol
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl p-stack-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-stack-md">
              <h3 className="font-headline-md text-on-surface">Cambiar Rol</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-stack-md">
              <p className="font-body-sm text-on-surface-variant">
                Cambiar rol de <strong>{editingUser.first_name} {editingUser.last_name}</strong>
              </p>
            </div>

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

              {newRole === 'center_admin' && (
                <div>
                  <label className="block font-label-md text-on-surface mb-2">Centro</label>
                  <select
                    value={selectedCenter || ''}
                    onChange={e => setSelectedCenter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg font-body-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary-container"
                  >
                    <option value="">Selecciona un centro</option>
                    {centers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2">
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
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
