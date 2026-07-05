'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import LoadingButton from '@/components/LoadingButton';
import Icon from '@/components/Icon';
import { useAuthStore } from '@/store/authStore';
import type { Adoption, PaginatedResponse } from '@/lib/types';
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

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Administrador',
  center_admin: 'Admin de Centro',
  voluntario: 'Voluntario',
  adoptante: 'Adoptante',
};

export default function MisSolicitudesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<PaginatedResponse<Adoption>>(`/adoptions/?mine=true&page=${page}&page_size=5`);
      setAdoptions(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 5));
    } catch {
      setError('No pudimos cargar tus solicitudes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAdoptions();
  }, [fetchAdoptions]);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.post('/auth/deactivate/');
      useAuthStore.getState().logout();
      router.push('/');
    } catch {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

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

        {/* Profile Card */}
        {user && (
          <div className="bg-surface rounded-2xl border border-outline-variant/20 p-6 mb-stack-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center font-headline-md text-on-primary-container shrink-0">
                {(user.first_name?.[0] || '').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-md text-on-surface truncate">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="font-body-sm text-on-surface-variant truncate">{user.email}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <span className="font-label-sm text-primary">{ROLE_LABELS[user.role] || user.role}</span>
                  {user.phone && <span className="font-label-sm text-on-surface-variant">{user.phone}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-surface-container-high rounded w-1/3 mb-3" />
                <div className="h-4 bg-surface-container-high rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <Icon name="search_off" className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-body-md text-red-600">{error}</p>
            <button onClick={fetchAdoptions} className="mt-3 font-label-md text-red-600 hover:underline">
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && adoptions.length === 0 && (
          <div className="text-center py-stack-lg">
            <Icon name="pets" className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
            <p className="font-body-lg text-on-surface-variant mb-2">No tienes solicitudes de adopción</p>
            <Link href="/mascotas" className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-block">
              Explorar Mascotas
            </Link>
          </div>
        )}

        {/* Adoptions Table */}
        {!loading && !error && adoptions.length > 0 && (
          <div className="bg-surface rounded-xl border border-outline-variant/20 overflow-hidden mb-stack-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-gray/30 border-b border-outline-variant/30">
                    <th className="p-4 pl-6 font-label-md text-on-surface-variant uppercase">Mascota</th>
                    <th className="p-4 font-label-md text-on-surface-variant uppercase">Centro</th>
                    <th className="p-4 font-label-md text-on-surface-variant uppercase">Estado</th>
                    <th className="p-4 font-label-md text-on-surface-variant uppercase">Fecha</th>
                    <th className="p-4 font-label-md text-on-surface-variant uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {adoptions.map((adoption) => (
                    <tr key={adoption.id} className="hover:bg-surface-container-low/50 group">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high overflow-hidden relative shrink-0">
                            {adoption.pet.images?.[0]?.image ? (
                              <Image src={normalizeImageUrl(adoption.pet.images[0].image)} alt={adoption.pet.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon name="pets" className="w-5 h-5 text-on-surface-variant/40" />
                              </div>
                            )}
                          </div>
                          <span className="font-label-md text-on-surface">{adoption.pet.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">
                        {adoption.center?.name || '—'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={adoption.status} />
                      </td>
                      <td className="p-4 font-body-sm text-on-surface-variant">
                        {new Date(adoption.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedAdoption(adoption)}
                          className="font-label-sm text-primary hover:underline"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="minimal" />
          </div>
        )}

        <hr className="border-outline-variant/20 my-stack-lg" />

        {/* Delete Account */}
        <div className="text-center">
          <p className="font-body-sm text-on-surface-variant mb-4">
            Puedes solicitar la eliminación de tus datos personales. Las adopciones completadas se conservarán en los registros de los centros para seguridad de los animales.
          </p>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-6 py-3 bg-red-600 text-white font-label-md rounded-xl hover:bg-red-700 transition-colors"
          >
            Eliminar Cuenta
          </button>
        </div>
      </main>
      <Footer />

      {/* Adoption Detail Modal */}
      <Modal open={!!selectedAdoption} onClose={() => setSelectedAdoption(null)} title="" maxWidth="md">
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
                <p className="font-body-xs text-on-surface-variant/60">{selectedAdoption.center.name}</p>
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
                  <p className="font-body-sm text-on-surface">{selectedAdoption.home_type === 'house' ? 'Casa' : selectedAdoption.home_type === 'apartment' ? 'Apartamento' : selectedAdoption.home_type || '—'}</p>
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
                <p className="font-body-sm text-on-surface-variant mt-2">{selectedAdoption.other_pets_details}</p>
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
                    <div key={entry.id} className="flex gap-3 py-2">
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

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Eliminar Cuenta"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="font-body-md text-red-800">
              ¿Estás seguro de que deseas eliminar tu cuenta?
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-body-sm text-on-surface-variant">
              <strong className="text-on-surface">¿Qué pasará?</strong>
            </p>
            <ul className="space-y-2 font-body-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
                Tu cuenta quedará <strong>desactivada inmediatamente</strong>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
                Tus datos personales se eliminarán por completo después de <strong>30 días</strong>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-status-approved mt-0.5 shrink-0" />
                Las <strong>adopciones completadas</strong> se conservarán en los registros de los centros para seguridad de los animales
              </li>
              <li className="flex items-start gap-2">
                <Icon name="close_simple" className="w-4 h-4 text-status-error mt-0.5 shrink-0" />
                Las solicitudes en curso serán <strong>canceladas</strong>
              </li>
            </ul>
          </div>

          <p className="font-body-xs text-on-surface-variant/60">
            Si cambias de opinión dentro de los 30 días, contacta a un administrador para restaurar tu cuenta.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 border border-outline-variant text-on-surface rounded-xl font-label-md transition-colors hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancelar
            </button>
            <LoadingButton
              onClick={handleDeleteAccount}
              loading={deleting}
              className="flex-1 py-2.5"
              variant="danger"
            >
              Eliminar mi cuenta
            </LoadingButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}