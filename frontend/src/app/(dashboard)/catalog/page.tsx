'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PET_SPECIES, PET_SIZE, GENDER } from '@/lib/utils';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age_months: number;
  size: string;
  gender: string;
  status: string;
  description: string;
  primary_image_url: string | null;
  center_name: string;
}

export default function CatalogPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    species: '',
    size: '',
    gender: '',
    search: '',
  });

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.species) params.append('species', filters.species);
        if (filters.size) params.append('size', filters.size);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.search) params.append('search', filters.search);

        const response = await api.get(`/pets/?${params.toString()}`);
        setPets(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold text-primary-600">
                Huellitas Barinas
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Iniciar Sesión
              </a>
              <a href="/register" className="text-sm text-primary-600 hover:text-primary-500">
                Registrarse
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mascotas Disponibles
          </h2>

          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.species}
                onChange={(e) => setFilters({ ...filters, species: e.target.value })}
              >
                <option value="">Todas las especies</option>
                {Object.entries(PET_SPECIES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              >
                <option value="">Todos los tamaños</option>
                {Object.entries(PET_SIZE).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              >
                <option value="">Todos los géneros</option>
                {Object.entries(GENDER).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando mascotas...</p>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron mascotas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {pet.primary_image_url && (
                    <img
                      src={pet.primary_image_url}
                      alt={pet.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pet.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {PET_SPECIES[pet.species]} · {PET_SIZE[pet.size]} · {GENDER[pet.gender]}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pet.age_months} meses · {pet.center_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {pet.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
