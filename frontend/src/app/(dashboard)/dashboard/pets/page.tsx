'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import api from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  status: string;
  gender: string;
  age_months: number;
  center_name: string;
  images: { image: string }[];
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPets = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await api.get<any>(`/pets/${params}`);
      setPets(data.results || data || []);
    } catch { setPets([]) }
    finally { setLoading(false) }
  };

  useEffect(() => { fetchPets() }, [filter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar esta mascota?')) return;
    try {
      await api.delete(`/pets/${id}/`);
      fetchPets();
    } catch {}
  };

  const handleStatusChange = async (id: number, action: string) => {
    try {
      await api.post(`/pets/${id}/${action}/`);
      fetchPets();
    } catch {}
  };

  const speciesIcon = (s: string) => s === 'dog' ? 'pets' : 'pets';

  return (
    <AdminLayout>
      <div className="p-stack-lg max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-stack-lg">
          <h1 className="font-montserrat text-headline-lg text-on-surface">Mascotas</h1>
          <Link href="/dashboard/pets/new" className="bg-primary text-on-primary font-label-md py-2.5 px-5 rounded-lg hover:brightness-105 transition-all flex items-center gap-2">
            <Icon name="add" className="w-5 h-5" /> Nueva Mascota
          </Link>
        </div>

        <div className="bg-surface rounded-xl ambient-shadow border border-outline-variant overflow-hidden">
          <div className="p-stack-md border-b border-outline-variant/30 flex gap-2 flex-wrap">
            {['', 'available', 'in_process', 'adopted', 'not_available'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg font-label-sm transition-all ${filter === s ? 'bg-primary-container text-on-primary-container' : 'bg-surface-gray/50 text-on-surface-variant hover:bg-surface-gray'}`}>
                {s ? { available: 'Disponibles', in_process: 'En Proceso', adopted: 'Adoptados', not_available: 'No Disponibles' }[s] || s : 'Todas'}
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
                          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center overflow-hidden">
                            {pet.images?.[0]?.image ? (
                              <img src={pet.images[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Icon name="pets" className="w-5 h-5 text-primary-container" />
                            )}
                          </div>
                          <span className="font-label-md text-on-surface">{pet.name}</span>
                        </div>
                      </td>
                      <td className="p-stack-sm font-body-sm text-on-surface capitalize">{pet.species === 'dog' ? 'Perro' : 'Gato'}</td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{pet.breed || '—'}</td>
                      <td className="p-stack-sm font-body-sm text-on-surface-variant">{pet.center_name || '—'}</td>
                      <td className="p-stack-sm"><StatusBadge status={pet.status} /></td>
                      <td className="p-stack-sm">
                        <div className="flex gap-1.5">
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
    </AdminLayout>
  );
}
