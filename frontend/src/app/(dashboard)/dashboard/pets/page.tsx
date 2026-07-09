'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import PetFormModal from '@/components/PetFormModal';
import CenterFormModal from '@/components/CenterFormModal';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';
import { auth } from '@/lib/auth';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  status: string;
  gender: string;
  age_months: number;
  center: number;
  center_name: string;
  size: string;
  weight_kg: number;
  description: string;
  health_notes: string;
  is_sterilized: boolean;
  is_vaccinated: boolean;
  is_dewormed: boolean;
  images: { id: number; image: string; is_primary: boolean; order: number }[];
}

interface CenterInfo {
  id: number;
  name: string;
  description: string;
  address: string;
  state: string;
  phone: string;
  email: string;
  status: string;
  max_capacity: number;
  current_capacity: number;
  pets_count: number;
  is_full: boolean;
  logo?: string | null;
  cover_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

function downloadExport() {
  api.get('/pets/export/', { responseType: 'blob' }).then(res => {
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mascotas.docx';
    a.click();
    URL.revokeObjectURL(url);
  });
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [erroredImages, setErroredImages] = useState<Set<number>>(new Set());
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCenter, setUserCenter] = useState<{ id: number; name: string } | null>(null);
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);

  const fetchPets = async () => {
    try {
      let params = filter ? `?status=${filter}` : '';
      const profile = await auth.getProfile();
      if (profile.role === 'center_admin' && profile.center) {
        params += (params ? '&' : '?') + `center=${profile.center.id}`;
      }
      const { data } = await api.get<any>(`/pets/${params}`);
      setPets(data.results || data || []);
    } catch (err) { console.error('Error fetching pets:', err); setPets([]) }
    finally { setLoading(false) }
  };

  useEffect(() => {
    auth.getProfile().then(profile => {
      setUserRole(profile.role);
      if (profile.role === 'center_admin' && profile.center) {
        setUserCenter(profile.center);
        api.get<any>(`/centers/${profile.center.id}/`).then(r => {
          setCenterInfo(r.data);
        }).catch(() => {});
      }
    });
  }, []);

  useEffect(() => { fetchPets() }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta mascota?')) return;
    try {
      await api.delete(`/pets/${id}/`);
      fetchPets();
    } catch (err) { console.error('Error deleting pet:', err) }
  };

  const handleStatusChange = async (id: number, action: string) => {
    try {
      await api.post(`/pets/${id}/${action}/`);
      fetchPets();
    } catch (err) { console.error('Error changing pet status:', err) }
  };

  const openPetEdit = async (pet: Pet) => {
    try {
      const { data } = await api.get<any>(`/pets/${pet.id}/`);
      setEditingPet(data);
      setShowPetModal(true);
    } catch {
      setEditingPet(pet as any);
      setShowPetModal(true);
    }
  };

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        {/* Center info card for center_admin */}
        {userRole === 'center_admin' && centerInfo && (
          <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant p-stack-md mb-stack-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {centerInfo.logo ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 border border-outline-variant">
                      <Image src={normalizeImageUrl(centerInfo.logo)} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center shrink-0">
                      <Icon name="location" className="w-6 h-6 text-primary-container" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-headline-sm text-on-surface">{centerInfo.name}</h2>
                    <p className="font-body-sm text-on-surface-variant">{centerInfo.address}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 font-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><Icon name="call" className="w-4 h-4" />{centerInfo.phone}</span>
                  <span className="flex items-center gap-1"><Icon name="mail" className="w-4 h-4" />{centerInfo.email}</span>
                  <StatusBadge status={centerInfo.status} />
                </div>
                {centerInfo.max_capacity > 0 && (
                  <div className="mt-3 max-w-xs">
                    <p className="font-label-sm text-on-surface-variant mb-1">
                      Capacidad: {centerInfo.current_capacity} / {centerInfo.max_capacity}
                    </p>
                    <div className="w-full bg-surface-container-high rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${(centerInfo.current_capacity / centerInfo.max_capacity) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setShowCenterModal(true)}
                className="bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md py-2 px-4 rounded-lg hover:bg-surface-gray transition-all flex items-center gap-2 shrink-0">
                <Icon name="edit" className="w-4 h-4" /> Editar Centro
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Mascotas</h1>
          <div className="flex gap-2 self-start mt-3 md:mt-0">
            <button onClick={downloadExport} className="bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray font-label-md py-2.5 px-5 rounded-lg transition-all flex items-center gap-2">
              <Icon name="download" className="w-5 h-5" /> Exportar
            </button>
            <Link href="/dashboard/pets/new" className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 transition-all flex items-center gap-2">
              <Icon name="add" className="w-5 h-5" /> Nueva Mascota
            </Link>
          </div>
        </div>

        <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/30 flex gap-2 flex-wrap">
            {['', 'available', 'in_process', 'adopted', 'not_available'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${filter === s ? 'bg-primary-container text-on-primary-container' : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'}`}>
                {s ? { available: 'En Adopción', in_process: 'En Proceso', adopted: 'Adoptados', not_available: 'No Disponibles' }[s] || s : 'Todas'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-stack-lg text-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : pets.length === 0 ? (
            <div className="p-stack-lg text-center"><Icon name="pets" className="w-12 h-12 text-outline mx-auto mb-3" /><p className="font-body-md text-on-surface-variant">No hay mascotas</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-gray/30 border-b border-outline-variant/30">
                    <th className="p-stack-sm pl-stack-md font-label-md text-on-surface-variant uppercase">Mascota</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Especie</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Raza</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Centro</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Estado</th>
                    <th className="p-stack-sm font-label-md text-on-surface-variant uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pets.map(pet => (
                    <tr key={pet.id} className="hover:bg-surface-container-low/50 group">
                      <td className="p-stack-sm pl-stack-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center overflow-hidden relative">
                            {pet.images?.[0]?.image && !erroredImages.has(pet.id) ? (
                              <Image src={normalizeImageUrl(pet.images[0].image)} alt="" fill className="object-cover" onError={() => setErroredImages(prev => new Set(prev).add(pet.id))} />
                            ) : (
                              <Icon name="pets" className="w-5 h-5 text-primary-container" />
                            )}
                          </div>
                          <span className="font-label-md text-on-surface">{pet.name}</span>
                        </div>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface capitalize">{{ dog: 'Perro', cat: 'Gato', other: 'Otro' }[pet.species] || pet.species}</td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{pet.breed || '—'}</td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{pet.center_name || '—'}</td>
                      <td className="p-stack-sm"><StatusBadge status={pet.status} /></td>
                      <td className="p-stack-sm">
                        <div className="flex gap-1.5">
                          <button onClick={() => openPetEdit(pet)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 font-label-sm transition-all">
                            <Icon name="edit" className="w-4 h-4" />
                          </button>
                          {pet.status === 'available' && (
                            <button onClick={() => handleStatusChange(pet.id, 'mark_in_process')}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-label-sm transition-all">
                              Marcar en Proceso
                            </button>
                          )}
                          {pet.status === 'in_process' && (
                            <button onClick={() => handleStatusChange(pet.id, 'mark_adopted')}
                              className="px-2.5 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-label-sm transition-all">
                              Marcar Adoptado
                            </button>
                          )}
                          <button onClick={() => handleDelete(pet.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-label-sm transition-all">
                            <Icon name="delete" className="w-4 h-4" />
                          </button>
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

      <PetFormModal
        open={showPetModal}
        onClose={() => { setShowPetModal(false); setEditingPet(null); }}
        onSaved={() => { fetchPets(); setShowPetModal(false); setEditingPet(null); }}
        pet={editingPet || undefined}
      />

      {userRole === 'center_admin' && centerInfo && (
        <CenterFormModal
          open={showCenterModal}
          onClose={() => setShowCenterModal(false)}
          onSaved={() => {
            api.get<any>(`/centers/${centerInfo.id}/`).then(r => setCenterInfo(r.data)).catch(() => {});
            setShowCenterModal(false);
          }}
          center={centerInfo}
          userRole={userRole}
        />
      )}
    </AdminLayout>
  );
}
