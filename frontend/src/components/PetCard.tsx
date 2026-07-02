'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from './StatusBadge';
import Icon from './Icon';
import PetSilhouette from './PetSilhouette';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  gender?: string;
  status: string;
  images?: { id: number; image: string; is_primary: boolean }[];
  center_name?: string;
}

interface PetCardProps {
  pet: Pet;
  variant?: 'compact' | 'full';
}

function formatAge(months?: number): string {
  if (!months) return '';
  if (months < 12) return `${months} Meses`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'Ano' : 'Anos'}`;
}

function getSpeciesLabel(species: string): string {
  const labels: Record<string, string> = { dog: 'Perro', cat: 'Gato', rabbit: 'Conejo', other: 'Otro' };
  return labels[species] || species;
}

function getGenderLabel(gender?: string): string {
  if (!gender) return '';
  return gender === 'M' || gender === 'male' ? 'Macho' : 'Hembra';
}

function getAgeBadge(months?: number): string {
  if (!months) return '';
  if (months < 12) return 'Cachorro';
  if (months < 84) return 'Joven';
  return 'Adulto';
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Disponible',
    in_process: 'En Proceso',
    adopted: 'Adoptada',
  };
  return labels[status] || status;
}

export default function PetCard({ pet, variant = 'full' }: PetCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = pet.images?.[0]?.image || '';

  if (variant === 'compact') {
    return (
      <article className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden group hover:shadow-card-hover transition-all duration-300 border border-surface-container-high">
        <div className="relative h-48 overflow-hidden bg-surface-container-high">
          {imageUrl && !imgError ? (
            <Image src={imageUrl} alt={pet.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 25vw" onError={() => setImgError(true)} />
          ) : (
            <PetSilhouette species={pet.species} />
          )}
          <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-approved"></span>
            <span className="font-label-sm text-on-surface">{getStatusLabel(pet.status)}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-headline-sm text-on-surface mb-1">{pet.name}</h3>
          <p className="font-body-sm text-on-surface-variant mb-4">
            {getSpeciesLabel(pet.species)}{pet.breed ? ` - ${pet.breed}` : ''} - {formatAge(pet.age_months)} - {getGenderLabel(pet.gender)}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-label-sm bg-surface-container-low px-2 py-1 rounded">
              {pet.center_name || 'Centro'}
            </span>
            <button className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary-container hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center justify-center">
              <Icon name="favorite" className="w-4 h-4" solid />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-card hover:shadow-card-hover overflow-hidden flex flex-col group transition-all duration-300">
      <div className="relative h-56 overflow-hidden">
        {imageUrl && !imgError ? (
          <Image src={imageUrl} alt={pet.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" sizes="(max-width: 768px) 100vw, 33vw" onError={() => setImgError(true)} />
        ) : (
          <PetSilhouette species={pet.species} />
        )}
        <div className="absolute top-3 right-3 bg-status-approved text-on-primary-container font-label-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-sm bg-opacity-90">
          <Icon name="check_circle" className="w-3.5 h-3.5" />
          {getStatusLabel(pet.status)}
        </div>
        <button className="absolute top-3 left-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 backdrop-blur text-outline hover:text-secondary-container hover:bg-surface-container-lowest flex items-center justify-center transition-colors shadow-sm">
          <Icon name="favorite" className="w-[18px] h-[18px]" />
        </button>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-headline-sm text-on-surface line-clamp-1">{pet.name}</h3>
          {pet.age_months && (
            <span className="font-label-md text-primary bg-primary-container/20 px-2 py-0.5 rounded-lg">
              {getAgeBadge(pet.age_months)}
            </span>
          )}
        </div>
        <p className="font-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
          <Icon name="location" className="w-4 h-4" />
          {pet.center_name || 'Centro'}
        </p>
        <div className="flex flex-wrap gap-2 mb-5 mt-auto">
          <span className="bg-surface-gray text-on-surface-variant rounded-md px-2.5 py-1 font-label-sm flex items-center gap-1">
            <Icon name="pets" className="w-3.5 h-3.5" />
            {getSpeciesLabel(pet.species)} {pet.breed ? pet.breed : ''}
          </span>
          {pet.gender && (
            <span className="bg-surface-gray text-on-surface-variant rounded-md px-2.5 py-1 font-label-sm flex items-center gap-1">
              <Icon name={(pet.gender === 'M' || pet.gender === 'male') ? 'male' : 'female'} className="w-3.5 h-3.5" />
              {getGenderLabel(pet.gender)}
            </span>
          )}
        </div>
        <Link
          href={`/pets/${pet.id}`}
          className="flex-1 bg-primary-container text-on-primary-container font-label-md py-2.5 rounded-lg hover:brightness-105 active:scale-95 transition-all text-center"
        >
          Conocer a {pet.name}
        </Link>
      </div>
    </article>
  );
}
