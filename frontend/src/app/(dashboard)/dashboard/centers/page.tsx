'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
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

const STATUS_LABELS: Record<string, string> = {
  active: 'Activo', inactive: 'Inactivo', pending: 'Pendiente',
};

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalCenter, setModalCenter] = useState<Center | null>(null);
  const [newCenter, setNewCenter] = useState({ name: '', description: '', address: '', phone: '', email: '', max_capacity: 50 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchCenters = async () => {
    try { const r = await api.get<{ results: Center[] }>('/centers/'); setCenters(r.data.results || r.data || []) }
    catch { setCenters([]) }
    finally { setLoading(false) }
  };

  useEffect(() => { fetchCenters() }, []);

  const handleToggleStatus = async (c: Center) => {
    const action = c.status === 'active' ? 'deactivate' : 'activate';
    try { await api.post(`/centers/${c.id}/${action}/`); fetchCenters() } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      await api.post('/centers/', newCenter);
      setShowModal(false);
      setNewCenter({ name: '', description: '', address: '', phone: '', email: '', max_capacity: 50 });
      fetchCenters();
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: Record<string, string[]> } };
      setError(apiErr?.response?.data ? Object.values(apiErr.response.data).flat().join('. ') : 'Error al crear centro');
    } finally { setCreating(false) }
  };

  const inputClass = 'w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all';

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-stack-lg">
          <div>
            <h1 className="font-montserrat text-headline-lg text-on-surface">Centros</h1>
            <p className="font-body-md text-on-surface-variant">Gestion de centros de adopcion</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 transition-all flex items-center gap-2">
            <Icon name="add" className="w-5 h-5" /> Nuevo Centro
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
          <AdminMetricCard icon="location" value={centers.length} label="Total Centros" />
          <AdminMetricCard icon="check_circle" value={centers.filter(c => c.status === 'active').length} label="Activos" />
          <AdminMetricCard icon="cancel" value={centers.filter(c => c.status === 'inactive').length} label="Inactivos" />
          <AdminMetricCard icon="pets" value={centers.reduce((s, c) => s + c.pets_count, 0)} label="Total Mascotas" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-md">
            {centers.map(c => (
              <div key={c.id} className="bg-surface rounded-xl ambient-shadow border border-outline-variant p-stack-md hover:shadow-card-hover transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-headline-sm text-on-surface">{c.name}</h3>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-1">{c.description}</p>
                  </div>
                </div>
                <div className="space-y-1.5 mb-4">
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5"><Icon name="location" className="w-4 h-4 shrink-0" />{c.address}</p>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5"><Icon name="call" className="w-4 h-4 shrink-0" />{c.phone}</p>
                  <p className="font-body-sm text-on-surface-variant flex items-center gap-1.5"><Icon name="mail" className="w-4 h-4 shrink-0" />{c.email}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="font-label-sm text-on-surface-variant">{c.pets_count} mascotas</span>
                  </div>
                  <button onClick={() => handleToggleStatus(c)}
                    className={`px-3 py-1.5 rounded-lg font-label-sm transition-all ${c.status === 'active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {c.status === 'active' ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
              <h3 className="font-headline-sm text-on-surface">Nuevo Centro</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface"><Icon name="close" className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-stack-md space-y-stack-md">
              {error && <div className="bg-status-error/10 text-status-error font-body-sm p-3 rounded-lg">{error}</div>}
              <div><label className="font-label-md text-on-surface mb-1.5 block">Nombre</label><input className={inputClass} value={newCenter.name} onChange={e => setNewCenter(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="font-label-md text-on-surface mb-1.5 block">Descripcion</label><textarea rows={3} className={`${inputClass} resize-none`} value={newCenter.description} onChange={e => setNewCenter(f => ({ ...f, description: e.target.value }))} required /></div>
              <div><label className="font-label-md text-on-surface mb-1.5 block">Direccion</label><input className={inputClass} value={newCenter.address} onChange={e => setNewCenter(f => ({ ...f, address: e.target.value }))} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-label-md text-on-surface mb-1.5 block">Telefono</label><input className={inputClass} value={newCenter.phone} onChange={e => setNewCenter(f => ({ ...f, phone: e.target.value }))} required /></div>
                <div><label className="font-label-md text-on-surface mb-1.5 block">Email</label><input type="email" className={inputClass} value={newCenter.email} onChange={e => setNewCenter(f => ({ ...f, email: e.target.value }))} required /></div>
              </div>
              <div><label className="font-label-md text-on-surface mb-1.5 block">Capacidad Maxima</label><input type="number" min={1} className={inputClass} value={newCenter.max_capacity} onChange={e => setNewCenter(f => ({ ...f, max_capacity: Number(e.target.value) }))} /></div>
              <button type="submit" disabled={creating} className="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg hover:brightness-105 transition-all disabled:opacity-50">
                {creating ? 'Creando...' : 'Crear Centro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
