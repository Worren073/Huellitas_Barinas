import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PetCard from '@/components/PetCard';
import MascotasControls from './MascotasControls';
import SearchControls from './SearchControls';
import { serverApi } from '@/lib/server';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  gender?: string;
  size?: string;
  status: string;
  images?: { id: number; image: string; is_primary: boolean }[];
  center_name?: string;
}

export default async function MascotasPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; size?: string; gender?: string; q?: string }>;
}) {
  const params = await searchParams;

  const query = new URLSearchParams();
  if (params.species) query.append('species', params.species);
  if (params.size) query.append('size', params.size);
  if (params.gender) {
    const genderMap: Record<string, string> = { male: 'M', female: 'F' };
    query.append('gender', genderMap[params.gender] || params.gender);
  }
  if (params.q) query.append('search', params.q);

  let pets: Pet[] = [];
  try {
    const res = await serverApi<{ results: Pet[] } | Pet[]>(`/pets/?${query.toString()}`);
    pets = Array.isArray(res) ? res : res.results;
  } catch {}

  const currentFilters = {
    species: params.species || '',
    size: params.size || '',
    gender: params.gender || '',
    search: params.q || '',
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="catalog" />

      <main className="flex-1 max-w-container-max mx-auto w-full px-4 md:px-8 py-stack-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <MascotasControls filters={currentFilters} />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-stack-md">
              <div className="flex items-center gap-4">
                <h1 className="font-montserrat text-headline-md text-on-surface">
                  Mascotas en Adopción
                </h1>
                <span className="bg-surface-container-high text-on-surface-variant font-label-sm px-2 py-1 rounded-full">
                  {pets.length}
                </span>
              </div>
              <SearchControls search={params.q || ''} />
            </div>

            {pets.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-headline-sm text-on-surface mt-4">No se encontraron mascotas</p>
                <p className="font-body-sm text-on-surface-variant mt-2">Intenta ajustar los filtros de busqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} variant="full" />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
