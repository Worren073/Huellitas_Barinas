'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminMetricCard from '@/components/AdminMetricCard';
import Icon from '@/components/Icon';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

interface TimelineEntry {
  id: number;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  notes: string;
  created_at: string;
}

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
  timeline: TimelineEntry[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Solicitud Enviada', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_review: { label: 'En Revision', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-800 border-green-300' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-300' },
  completed: { label: 'Completada', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500 border-gray-300' },
};

const HOME_TYPE: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  other: 'Otro',
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
  const [actionNotes, setActionNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [metrics, setMetrics] = useState({ pending: 0, total: 0, completed: 0, approved: 0 });

  const fetchAdoptions = async () => {
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
  };

  useEffect(() => { fetchAdoptions(); }, [filter]);

  const handleAction = async () => {
    if (!showActionModal) return;
    const { adoption, action } = showActionModal;
    setActionError('');
    try {
      const body: Record<string, string> = {};
      if (action === 'reject') {
        if (!actionNotes.trim()) { setActionError('Debe proporcionar un motivo de rechazo'); return; }
        body.reason = actionNotes;
      }
      if (action === 'approve' && actionNotes.trim()) body.notes = actionNotes;

      await api.post(`/adoptions/${adoption.id}/${action}/`, body);
      setShowActionModal(null);
      setActionNotes('');
      fetchAdoptions();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } | string } };
      const msg = typeof apiError?.response?.data === 'object' ? apiError?.response?.data?.error || 'Error' : 'Error al realizar la accion';
      setActionError(msg);
    }
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
                        <div>
                          <p className="font-label-md text-on-surface">{adoption.applicant_name || `Usuario #${adoption.applicant}`}</p>
                        </div>
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
                              onClick={() => { setShowActionModal({ adoption, action: act.action }); setActionNotes(''); setActionError(''); }}
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

      {showTimeline && selectedAdoption && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowTimeline(false)}>
          <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
              <h3 className="font-headline-sm text-on-surface">Historial de #{selectedAdoption.id}</h3>
              <button onClick={() => setShowTimeline(false)} className="text-on-surface-variant hover:text-on-surface">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-stack-md">
              {selectedAdoption.timeline && selectedAdoption.timeline.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-outline-variant/40" />
                  {selectedAdoption.timeline.map((entry, idx) => (
                    <div key={entry.id || idx} className="flex gap-4 pb-stack-md relative">
                      <div className="shrink-0 w-[18px] h-[18px] rounded-full border-2 border-primary bg-surface mt-0.5 z-10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label-sm text-on-surface-variant capitalize">
                            {entry.old_status} → {entry.new_status}
                          </span>
                          <span className="text-label-sm text-outline">
                            {new Date(entry.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        {entry.notes && <p className="font-body-sm text-on-surface-variant">{entry.notes}</p>}
                        {entry.changed_by_name && (
                          <p className="font-label-sm text-outline mt-0.5">por {entry.changed_by_name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body-md text-on-surface-variant text-center py-stack-md">Sin historial disponible</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedAdoption && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(false)}>
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
              <h3 className="font-headline-sm text-on-surface">Detalle de Solicitud #{selectedAdoption.id}</h3>
              <button onClick={() => setShowDetail(false)} className="text-on-surface-variant hover:text-on-surface">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="p-stack-md space-y-stack-md">
              <div className="grid grid-cols-2 gap-stack-md">
                <div>
                  <p className="font-label-sm text-on-surface-variant mb-1">Solicitante</p>
                  <p className="font-body-md text-on-surface">{selectedAdoption.applicant_name || `Usuario #${selectedAdoption.applicant}`}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant mb-1">Mascota</p>
                  <p className="font-body-md text-on-surface">{selectedAdoption.pet_name || `Mascota #${selectedAdoption.pet}`}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant mb-1">Centro</p>
                  <p className="font-body-md text-on-surface">{selectedAdoption.center_name}</p>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant mb-1">Estado</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium border ${STATUS_CONFIG[selectedAdoption.status]?.color || ''}`}>
                    {STATUS_CONFIG[selectedAdoption.status]?.label || selectedAdoption.status}
                  </span>
                </div>
              </div>

              <div className="border-t border-outline-variant/30 pt-stack-md">
                <h4 className="font-label-md text-on-surface mb-3">Informacion de la Solicitud</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Motivacion</p>
                    <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{selectedAdoption.motivation || '—'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Experiencia</p>
                    <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{selectedAdoption.experience || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Tipo de Vivienda</p>
                    <p className="font-body-sm text-on-surface">{HOME_TYPE[selectedAdoption.home_type] || selectedAdoption.home_type}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Miembros de la Familia</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.family_members}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Tiene Patio</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.has_yard ? 'Si' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant mb-1">Tiene Otras Mascotas</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.has_other_pets ? 'Si' : 'No'}</p>
                  </div>
                </div>
                {selectedAdoption.has_other_pets && selectedAdoption.other_pets_details && (
                  <div className="mt-4">
                    <p className="font-label-sm text-on-surface-variant mb-1">Detalles de Otras Mascotas</p>
                    <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{selectedAdoption.other_pets_details}</p>
                  </div>
                )}
              </div>

              {selectedAdoption.review_notes && (
                <div className="border-t border-outline-variant/30 pt-stack-md">
                  <p className="font-label-sm text-on-surface-variant mb-1">Notas de Revision</p>
                  <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{selectedAdoption.review_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showActionModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowActionModal(null)}>
          <div className="bg-surface rounded-2xl max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-stack-md border-b border-outline-variant/30">
              <h3 className="font-headline-sm text-on-surface">
                {showActionModal.action === 'start_review' && 'Iniciar Revision'}
                {showActionModal.action === 'approve' && 'Aprobar Solicitud'}
                {showActionModal.action === 'reject' && 'Rechazar Solicitud'}
                {showActionModal.action === 'complete' && 'Completar Adopcion'}
              </h3>
              <p className="font-body-sm text-on-surface-variant">
                Solicitud #{showActionModal.adoption.id} - {showActionModal.adoption.pet_name}
              </p>
            </div>
            <div className="p-stack-md">
              {actionError && (
                <div className="mb-stack-sm bg-status-error/10 text-status-error font-body-sm p-3 rounded-lg">{actionError}</div>
              )}
              {showActionModal.action === 'reject' && (
                <div>
                  <label className="font-label-md text-on-surface mb-1.5 block">Motivo de rechazo</label>
                  <textarea
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container resize-none"
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    placeholder="Indica el motivo del rechazo..."
                  />
                </div>
              )}
              {showActionModal.action === 'approve' && (
                <div>
                  <label className="font-label-md text-on-surface mb-1.5 block">Notas (opcional)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container resize-none"
                    value={actionNotes}
                    onChange={e => setActionNotes(e.target.value)}
                    placeholder="Notas adicionales..."
                  />
                </div>
              )}
              <div className="flex gap-3 mt-stack-md">
                <button
                  onClick={() => setShowActionModal(null)}
                  className="flex-1 border border-outline-variant text-on-surface font-label-md py-3 rounded-lg hover:bg-surface-gray transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAction}
                  className="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
