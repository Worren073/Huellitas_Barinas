'use client';

import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import Icon from '@/components/Icon';
import TimelineModal from '@/components/adoptions/TimelineModal';
import DetailModal from '@/components/adoptions/DetailModal';
import ActionModal from '@/components/adoptions/ActionModal';
import api from '@/lib/api';

interface Adoption {
  id: number;
  pet: number;
  pet_name: string;
  applicant: number;
  applicant_name: string;
  center: number;
  center_name: string;
  status: string;
  motivation: string;
  experience: string;
  home_type: string;
  has_yard: boolean;
  has_other_pets: boolean;
  other_pets_details: string;
  family_members: number;
  review_notes: string;
  created_at: string;
  timeline: { id: number; old_status: string; new_status: string; changed_by_name: string; notes: string; created_at: string }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Solicitud Enviada', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_review: { label: 'En Revision', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-800 border-green-300' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-300' },
  completed: { label: 'Completada', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500 border-gray-300' },
};

const ACTIONS: Record<string, { action: string; label: string; color: string; icon: string }[]> = {
  pending: [{ action: 'start_review', label: 'Iniciar Revision', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200', icon: 'visibility' }],
  under_review: [
    { action: 'approve', label: 'Aprobar', color: 'bg-green-100 text-green-700 hover:bg-green-200', icon: 'check_circle' },
    { action: 'reject', label: 'Rechazar', color: 'bg-red-100 text-red-700 hover:bg-red-200', icon: 'cancel' },
  ],
  approved: [{ action: 'complete', label: 'Completar', color: 'bg-teal-100 text-teal-700 hover:bg-teal-200', icon: 'check_circle_solid' }],
  rejected: [],
  completed: [],
  cancelled: [],
};

export default function AdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ adoption: Adoption; action: string } | null>(null);
  const [metrics, setMetrics] = useState({ pending: 0, total: 0, completed: 0, approved: 0 });

  const fetchAdoptions = useCallback(async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get<any>(`/adoptions/${params}`);
      const results = data.results || data || [];
      setAdoptions(results);

      const all = await api.get<any>('/adoptions/').then(r => r.data.results || r.data || []);
      setMetrics({
        pending: all.filter((a: Adoption) => a.status === 'pending').length,
        total: all.length,
        completed: all.filter((a: Adoption) => a.status === 'completed').length,
        approved: all.filter((a: Adoption) => a.status === 'approved' || a.status === 'under_review').length,
      });
    } catch {
      setAdoptions([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchAdoptions(); }, [fetchAdoptions]);

  const handleActionConfirm = async (notes: string) => {
    if (!showActionModal) return;
    const { adoption, action } = showActionModal;
    const body: Record<string, string> = {};
    if (action === 'reject') body.reason = notes;
    if (action === 'approve' && notes.trim()) body.notes = notes;

    await api.post(`/adoptions/${adoption.id}/${action}/`, body);
    setShowActionModal(null);
    fetchAdoptions();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Solicitudes de Adopcion</h1>
          <p className="font-body-md text-on-surface-variant">Gestiona las solicitudes recibidas</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm mb-stack-lg">
          <AdminMetricCard label="Pendientes" value={metrics.pending} icon="pending_actions" />
          <AdminMetricCard label="En Progreso" value={metrics.approved} icon="trending_up" />
          <AdminMetricCard label="Completadas" value={metrics.completed} icon="check_circle_solid" />
          <AdminMetricCard label="Total" value={metrics.total} icon="volunteer_activism" />
        </div>

        <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/30 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {['', 'pending', 'under_review', 'approved', 'rejected', 'completed', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${
                    filter === s
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'
                  }`}
                >
                  {s ? STATUS_CONFIG[s]?.label || s : 'Todas'}
                </button>
              ))}
            </div>
          </div>

          {adoptions.length === 0 ? (
            <div className="p-stack-lg text-center">
              <Icon name="pets" className="w-12 h-12 text-outline mx-auto mb-3" />
              <p className="font-body-md text-on-surface-variant">No hay solicitudes{filter ? ' con este filtro' : ''}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-gray/30 border-b border-outline-variant/30">
                    <th className="p-stack-sm pl-stack-md font-label-md text-on-surface-variant uppercase">ID</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Solicitante</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Mascota</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Centro</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Estado</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Fecha</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {adoptions.map((adoption) => (
                    <tr key={adoption.id} className="hover:bg-surface-container-low/50 group">
                      <td className="p-stack-sm pl-stack-md font-label-md text-on-surface">#{adoption.id}</td>
                      <td className="p-stack-sm">
                        <p className="font-label-md text-on-surface">{adoption.applicant_name || `Usuario #${adoption.applicant}`}</p>
                      </td>
                      <td className="p-stack-sm">
                        <button
                          onClick={() => { setSelectedAdoption(adoption); setShowDetail(true); }}
                          className="font-label-md text-primary hover:underline text-left"
                        >
                          {adoption.pet_name || `Mascota #${adoption.pet}`}
                        </button>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{adoption.center_name}</td>
                      <td className="p-stack-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium border ${STATUS_CONFIG[adoption.status]?.color || ''}`}>
                          {STATUS_CONFIG[adoption.status]?.label || adoption.status}
                        </span>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">
                        {new Date(adoption.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-stack-sm">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => { setSelectedAdoption(adoption); setShowTimeline(true); }}
                            className="px-2.5 py-1.5 rounded-lg bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray transition-all font-label-sm"
                            title="Ver historial"
                          >
                            <Icon name="history" className="w-4 h-4" />
                          </button>
                          {(ACTIONS[adoption.status] || []).map(act => (
                            <button
                              key={act.action}
                              onClick={() => setShowActionModal({ adoption, action: act.action })}
                              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-label-sm transition-all ${act.color}`}
                            >
                              <Icon name={act.icon} className="w-4 h-4" />
                              {act.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TimelineModal adoption={showTimeline ? selectedAdoption : null} onClose={() => setShowTimeline(false)} />
      <DetailModal adoption={showDetail ? selectedAdoption : null} onClose={() => setShowDetail(false)} />
      {showActionModal && (
        <ActionModal
          adoption={showActionModal.adoption}
          action={showActionModal.action}
          onConfirm={handleActionConfirm}
          onClose={() => setShowActionModal(null)}
        />
      )}
    </AdminLayout>
  );
}
