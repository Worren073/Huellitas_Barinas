'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
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

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin',
  center_admin: 'Admin Centro',
  voluntario: 'Voluntario',
  adoptante: 'Adoptante',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const params = filter ? `?role=${filter}` : '';
      const { data } = await api.get<any>(`/users/${params}`);
      setUsers(data.results || data || []);
    } catch { setUsers([]) }
    finally { setLoading(false) }
  };

  useEffect(() => { fetchUsers() }, [filter]);

  const toggleActive = async (user: User) => {
    // No dedicated active toggle endpoint, skip for now
  };

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Usuarios</h1>
          <p className="font-body-md text-on-surface-variant">Gestion de usuarios del sistema</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
          <AdminMetricCard icon="group" value={users.length} label="Total Usuarios" />
          <AdminMetricCard icon="admin" value={users.filter(u => u.role === 'superadmin' || u.role === 'center_admin').length} label="Administradores" />
          <AdminMetricCard icon="volunteer_activism" value={users.filter(u => u.role === 'voluntario').length} label="Voluntarios" />
          <AdminMetricCard icon="person" value={users.filter(u => u.role === 'adoptante').length} label="Adoptantes" />
        </div>

        <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/30 flex gap-2 flex-wrap">
            {['', 'superadmin', 'center_admin', 'voluntario', 'adoptante'].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${filter === r ? 'bg-primary-container text-on-primary-container' : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'}`}>
                {r ? ROLE_LABELS[r] || r : 'Todos'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-stack-lg text-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : users.length === 0 ? (
            <div className="p-stack-lg text-center"><Icon name="group" className="w-12 h-12 text-outline mx-auto mb-3" /><p className="font-body-md text-on-surface-variant">No hay usuarios</p></div>
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
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Registro</th>
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
                        <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium border ${
                          u.role === 'superadmin' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                          u.role === 'center_admin' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          u.role === 'voluntario' ? 'bg-green-100 text-green-800 border-green-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>{ROLE_LABELS[u.role] || u.role}</span>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{u.center_name || '—'}</td>
                      <td className="p-stack-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-status-approved' : 'bg-status-error'}`} />
                          <span className="font-body-sm">{u.is_active ? 'Activo' : 'Inactivo'}</span>
                        </div>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">
                        {new Date(u.date_joined).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
