'use client';

import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function SearchControls({ search }: { search: string }) {
  const router = useRouter();

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    const qs = params.toString();
    router.push(qs ? `/mascotas?${qs}` : '/mascotas');
  };

  return (
    <div className="flex items-center gap-3">
      <SearchBar value={search} onChange={handleSearchChange} />
      <span className="font-label-md text-on-surface-variant hidden md:block">Ordenar por:</span>
      <select className="bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm py-1.5 pl-3 pr-8 focus:ring-primary-container focus:border-primary-container">
        <option value="newest">Mas recientes</option>
        <option value="urgent">Urgentes</option>
        <option value="age_asc">Edad (Menor a Mayor)</option>
      </select>
    </div>
  );
}
