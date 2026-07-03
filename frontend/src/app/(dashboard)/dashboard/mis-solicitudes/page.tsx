'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import ScrollAnimation from '@/components/ScrollAnimation';
import Pagination from '@/components/ui/Pagination';
import Icon from '@/components/Icon';
import type { Adoption, PaginatedResponse } from '@/lib/types';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';

export default function MisSolicitudesPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get<PaginatedResponse<Adoption>>(`/adoptions/?page=${page}&page_size=10`);
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
                  <div className="bg-surface-container-low rounded-2xl p-4 md:p-6 border border-outline-variant/20 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="w-20 h-20 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0">
                        {adoption.pet.images?.[0]?.image ? (
                          <img src={normalizeImageUrl(adoption.pet.images[0].image)} alt={adoption.pet.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="pets" className="w-8 h-8 text-on-surface-variant/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-headline-sm text-on-surface truncate">{adoption.pet.name}</h3>
                          <StatusBadge status={adoption.status} />
                        </div>
                        <p className="font-body-sm text-on-surface-variant mb-1">
                          {adoption.pet.species === 'dog' ? 'Perro' : 'Gato'}
                          {adoption.pet.breed && ` · ${adoption.pet.breed}`}
                        </p>
                        <p className="font-body-xs text-on-surface-variant/60">
                          Solicitado el {new Date(adoption.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/adoptions?id=${adoption.id}`}
                        className="font-label-sm text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                      >
                        Ver Detalle
                        <Icon name="arrow_forward" className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </ScrollAnimation>
              ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} variant="minimal" />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
