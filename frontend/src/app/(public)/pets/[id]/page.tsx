'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StatusBadge from '@/components/StatusBadge';
import Icon from '@/components/Icon';
import api from '@/lib/api';
import { normalizeImageUrl } from '@/lib/utils';

interface PetImage {
  id: number;
  image: string;
  is_primary: boolean;
}

interface PetCenter {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  logo?: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  gender?: string;
  size?: string;
  status: string;
  description?: string;
  images?: PetImage[];
  center?: PetCenter;
  center_name?: string;
  is_vaccinated?: boolean;
  is_sterilized?: boolean;
  health_status?: string;
}

function formatAge(months?: number): string {
  if (!months) return '';
  if (months < 12) return `${months} Meses`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'Año' : 'Años'}`;
}

function getSpeciesLabel(species: string): string {
  const labels: Record<string, string> = { dog: 'Perro', cat: 'Gato', rabbit: 'Conejo', other: 'Otro' };
  return labels[species] || species;
}

function getGenderLabel(gender?: string): string {
  return gender === 'M' || gender === 'male' ? 'Macho' : 'Hembra';
}

export default function PetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const petId = params.id;

  useEffect(() => {
    if (!petId) return;

    const fetchPet = async () => {
      try {
        const response = await api.get<Pet>(`/pets/${petId}/`);
        setPet(response.data);
      } catch {
        setPet(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="detail" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar variant="detail" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Icon name="search_off" className="w-16 h-16 text-outline" />
          <p className="font-headline-sm text-on-surface">Mascota no encontrada</p>
          <Link href="/mascotas" className="text-primary hover:underline font-label-md">
            Volver a mascotas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = (pet.images || []).map(img => ({ ...img, image: normalizeImageUrl(img.image) }));
  const mainImage = images[0]?.image || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar variant="detail" />

      <main className="flex-1 max-w-container-max mx-auto w-full px-4 md:px-8 py-stack-lg">
        <div className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-montserrat text-headline-xl text-on-surface mb-2">{pet.name}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface font-label-md px-3 py-1 rounded-full">
                <Icon name="pets" className="w-4 h-4" /> {getSpeciesLabel(pet.species)} {pet.breed || ''}
              </span>
              {pet.age_months && (
                <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface font-label-md px-3 py-1 rounded-full">
                  <Icon name="cake" className="w-4 h-4" /> {formatAge(pet.age_months)}
                </span>
              )}
              {pet.gender && (
                <span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface font-label-md px-3 py-1 rounded-full">
                  <Icon name={(pet.gender === 'M' || pet.gender === 'male') ? 'male' : 'female'} className="w-4 h-4" /> {getGenderLabel(pet.gender)}
                </span>
              )}
              <StatusBadge status={pet.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <Icon name="share" className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-secondary-container hover:text-on-secondary-container hover:border-secondary-container transition-colors">
              <Icon name="favorite" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[500px] rounded-2xl overflow-hidden bg-surface">
              <div className="col-span-4 row-span-2 md:col-span-3 md:row-span-2 relative group cursor-pointer">
                {mainImage ? (
                  <img src={mainImage} alt={pet.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                    <Icon name="pets" className="w-16 h-16 text-outline" />
                  </div>
                )}
              </div>
              {images[1] && (
                <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-bl-lg">
                  <img src={images[1].image} alt="" className="w-full h-full object-cover group-hover:scale-110" />
                </div>
              )}
              {images[2] && (
                <div className="hidden md:block col-span-1 row-span-1 relative group cursor-pointer overflow-hidden rounded-tl-lg">
                  <img src={images[2].image} alt="" className="w-full h-full object-cover group-hover:scale-110" />
                  {images.length > 3 && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/10">
                      <span className="text-white font-label-md flex items-center gap-1">
                        <Icon name="photo_library" className="w-5 h-5" /> +{images.length - 3} Fotos
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {pet.description && (
              <section className="bg-surface p-stack-lg rounded-2xl ambient-shadow">
                <h3 className="font-headline-sm text-on-surface mb-stack-md flex items-center gap-2">
                  <Icon name="description" className="w-5 h-5 text-primary" />
                  Sobre {pet.name}
                </h3>
                <p className="font-body-md text-on-surface-variant leading-relaxed">{pet.description}</p>
              </section>
            )}

            <section className="bg-surface p-stack-lg rounded-2xl ambient-shadow">
              <h3 className="font-headline-sm text-on-surface mb-stack-md flex items-center gap-2">
                <Icon name="health_and_safety" className="w-5 h-5 text-primary" />
                Estado de Salud
              </h3>
              <ul className="flex flex-col gap-3 font-body-md text-on-surface-variant">
                <li className="flex items-center gap-3">
                  <Icon
                    name={pet.is_vaccinated ? 'check_circle_solid' : 'radio_button_unchecked'}
                    className={`w-5 h-5 ${pet.is_vaccinated ? 'text-primary-container' : 'text-outline'}`}
                  />
                  Vacunación al día {pet.is_vaccinated ? '' : '(Pendiente)'}
                </li>
                <li className="flex items-center gap-3">
                  <Icon
                    name={pet.is_sterilized ? 'check_circle_solid' : 'radio_button_unchecked'}
                    className={`w-5 h-5 ${pet.is_sterilized ? 'text-primary-container' : 'text-outline'}`}
                  />
                  Esterilización {pet.is_sterilized ? 'completada' : '(Pendiente)'}
                </li>
                {pet.health_status && (
                  <li className="flex items-center gap-3">
                    <Icon name="check_circle_solid" className="w-5 h-5 text-primary-container" />
                    {pet.health_status}
                  </li>
                )}
              </ul>
            </section>
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 flex flex-col gap-stack-md">
              <div className="bg-surface rounded-2xl p-stack-lg ambient-shadow border border-outline-variant">
                <h3 className="font-headline-md text-on-surface mb-2">Adopta a {pet.name}</h3>
                <p className="font-body-sm text-on-surface-variant mb-stack-md">
                  Completa el formulario de solicitud y nos pondremos en contacto contigo.
                </p>
                <Link
                  href={pet.status === 'available' ? `/adoptar/${pet.id}` : '#'}
                  className={`w-full font-label-md py-4 rounded-lg flex items-center justify-center gap-2 mb-3 shadow-sm transition-all ${
                    pet.status === 'available'
                      ? 'bg-primary-container text-on-primary-container hover:brightness-105 active:scale-95'
                      : 'bg-surface-gray text-on-surface-variant cursor-not-allowed'
                  }`}
                >
                  <Icon name="favorite" className="w-5 h-5" solid />
                  {pet.status === 'available' ? 'Iniciar Solicitud de Adopción' : 'No disponible para adopción'}
                </Link>
                <button className="w-full bg-transparent border-2 border-primary-container text-on-primary-container font-label-md py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
                  <Icon name="help" className="w-5 h-5" /> Hacer una pregunta
                </button>
              </div>

              {pet.center && (
                <div className="bg-surface rounded-2xl overflow-hidden ambient-shadow border border-outline-variant">
                  <div className="h-32 w-full bg-surface-container relative">
                    <div className="w-full h-full bg-surface-gray flex items-center justify-center">
                      <Icon name="map" className="w-12 h-12 text-outline" />
                    </div>
                  </div>
                  <div className="p-stack-md flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                        <Icon name="location" className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-label-md text-on-surface">{pet.center.name}</h4>
                        <p className="font-body-sm text-on-surface-variant mt-1">{pet.center.address || 'Barinas, Venezuela'}</p>
                      </div>
                    </div>
                    {pet.center.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                          <Icon name="call" className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-body-sm text-on-surface-variant">{pet.center.phone}</p>
                      </div>
                    )}
                    <Link href={`/centers/${pet.center.id}`} className="font-label-md text-primary hover:underline">
                      Ver perfil del centro
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
