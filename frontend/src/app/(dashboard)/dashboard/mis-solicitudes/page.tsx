'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import ScrollAnimation from '@/components/ScrollAnimation';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/Icon';
import type { Adoption, AdoptionTimelineEntry, PaginatedResponse } from '@/lib/types';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Solicitud Enviada',
  under_review: 'En Revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  completed: 'Adopción Completada',
  cancelled: 'Cancelada',
};

const HOME_TYPE_LABELS: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  other: 'Otro',
};

function TimelineEntry({ entry }: { entry: AdoptionTimelineEntry }) {
  return (
    <div className="flex gap-3 py-2">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-primary-container" />
        <div className="w-px flex-1 bg-outline-variant/30" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body-sm text-on-surface">
          {STATUS_LABELS[entry.old_status] || entry.old_status} → {STATUS_LABELS[entry.new_status] || entry.new_status}
        </p>
        {entry.notes && <p className="font-body-xs text-on-surface-variant mt-0.5">{entry.notes}</p>}
        <p className="font-body-xs text-on-surface-variant/60 mt-0.5">
          {new Date(entry.created_at).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

export default function MisSolicitudesPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<PaginatedResponse<Adoption>>(`/adoptions/?mine=true&page=${page}&page_size=10`);
      setAdoptions(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch {
      setError('No pudimos cargar tus solicitudes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const openDetail = (adoption: Adoption) => setSelectedAdoption(adoption);
  const closeDetail = () => setSelectedAdoption(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-container-max mx-auto px-4 md:px-8 py-stack-lg w-full">
        <div className="flex items-center gap-3 mb-stack-md">
          <Link href="/" className="p-2 rounded-lg hover:bg-surface-container-low transition-colors">
            <Icon name="chevron_left" className="w-5 h-5" />
          </Link>
          <h1 className="font-montserrat text-headline-xl text-on-surface">Mis Solicitudes</h1>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-surface-container-high rounded w-1/3 mb-3" />
                <div className="h-4 bg-surface-container-high rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <Icon name="search_off" className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-body-md text-red-600">{error}</p>
            <button onClick={fetchAdoptions} className="mt-3 font-label-md text-red-600 hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && adoptions.length === 0 && (
          <div className="text-center py-stack-lg">
            <Icon name="pets" className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
            <p className="font-body-lg text-on-surface-variant mb-2">No tienes solicitudes de adopción</p>
            <Link href="/mascotas" className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-block">
              Explorar Mascotas
            </Link>
          </div>
        )}

        {!loading && !error && adoptions.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4">
              {adoptions.map((adoption) => (
                <ScrollAnimation key={adoption.id} variant="slideUp">
                  <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex gap-4 p-4 md:p-5">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-surface-container-high overflow-hidden flex-shrink-0 relative">
                        {adoption.pet.images?.[0]?.image ? (
                          <Image src={normalizeImageUrl(adoption.pet.images[0].image)} alt={adoption.pet.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="pets" className="w-10 h-10 text-on-surface-variant/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-headline-md text-on-surface truncate">{adoption.pet.name}</h3>
                            <StatusBadge status={adoption.status} />
                          </div>
                          <p className="font-body-sm text-on-surface-variant mt-0.5">
                            {adoption.pet.species === 'dog' ? 'Perro' : 'Gato'}
                            {adoption.pet.breed && ` · ${adoption.pet.breed}`}
                            {adoption.center?.name && ` · ${adoption.center.name}`}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="font-body-xs text-on-surface-variant/60">
                            {new Date(adoption.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <button
                            onClick={() => openDetail(adoption)}
                            className="font-label-sm text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                          >
                            Ver Detalle
                            <Icon name="arrow_forward" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="minimal" />
          </>
        )}

        <Modal open={!!selectedAdoption} onClose={closeDetail} title="" maxWidth="md">
          {selectedAdoption && (
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0 relative">
                  {selectedAdoption.pet.images?.[0]?.image ? (
                    <Image src={normalizeImageUrl(selectedAdoption.pet.images[0].image)} alt={selectedAdoption.pet.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="pets" className="w-8 h-8 text-on-surface-variant/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-headline-sm text-on-surface">{selectedAdoption.pet.name}</h3>
                    <StatusBadge status={selectedAdoption.status} />
                  </div>
                  <p className="font-body-sm text-on-surface-variant">
                    {selectedAdoption.pet.species === 'dog' ? 'Perro' : 'Gato'}
                    {selectedAdoption.pet.breed && ` · ${selectedAdoption.pet.breed}`}
                  </p>
                  <p className="font-body-xs text-on-surface-variant/60">
                    {selectedAdoption.center.name}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-4">
                <h4 className="font-label-md text-on-surface mb-2">Motivación</h4>
                <p className="font-body-sm text-on-surface-variant whitespace-pre-wrap">{selectedAdoption.motivation || 'No especificada'}</p>
              </div>

              {selectedAdoption.experience && (
                <div className="bg-surface-container-low rounded-xl p-4">
                  <h4 className="font-label-md text-on-surface mb-2">Experiencia con mascotas</h4>
                  <p className="font-body-sm text-on-surface-variant whitespace-pre-wrap">{selectedAdoption.experience}</p>
                </div>
              )}

              <div className="bg-surface-container-low rounded-xl p-4">
                <h4 className="font-label-md text-on-surface mb-3">Tu Hogar</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="font-label-sm text-on-surface-variant/60">Tipo de vivienda</p>
                    <p className="font-body-sm text-on-surface">{HOME_TYPE_LABELS[selectedAdoption.home_type || ''] || selectedAdoption.home_type || '—'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant/60">Tiene patio</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.has_yard ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant/60">Otras mascotas</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.has_other_pets ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <p className="font-label-sm text-on-surface-variant/60">Miembros de familia</p>
                    <p className="font-body-sm text-on-surface">{selectedAdoption.family_members || 1}</p>
                  </div>
                </div>
                {selectedAdoption.has_other_pets && selectedAdoption.other_pets_details && (
                  <p className="font-body-sm text-on-surface-variant mt-2">
                    {selectedAdoption.other_pets_details}
                  </p>
                )}
              </div>

              {selectedAdoption.review_notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-label-md text-amber-800 mb-2">Notas de revisión</h4>
                  <p className="font-body-sm text-amber-700 whitespace-pre-wrap">{selectedAdoption.review_notes}</p>
                </div>
              )}

              {selectedAdoption.timeline && selectedAdoption.timeline.length > 0 && (
                <div className="bg-surface-container-low rounded-xl p-4">
                  <h4 className="font-label-md text-on-surface mb-3">Historial</h4>
                  <div className="space-y-0">
                    {selectedAdoption.timeline.map((entry) => (
                      <TimelineEntry key={entry.id} entry={entry} />
                    ))}
                  </div>
                </div>
              )}

              <p className="font-body-xs text-on-surface-variant/60 text-center">
                Solicitado el {new Date(selectedAdoption.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </Modal>
      </main>
      <Footer />
    </div>
  );
}
