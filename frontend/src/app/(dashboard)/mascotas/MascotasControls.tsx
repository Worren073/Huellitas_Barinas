'use client';

import { useRouter } from 'next/navigation';
import FilterSidebar from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';

interface Filters {
  species: string;
  size: string;
  gender: string;
  search: string;
}

export default function MascotasControls({ filters }: { filters: Filters }) {
  const router = useRouter();

  const handleFilterChange = (newFilters: Filters) => {
    const params = new URLSearchParams();
    if (newFilters.species) params.append('species', newFilters.species);
    if (newFilters.size) params.append('size', newFilters.size);
    if (newFilters.gender) params.append('gender', newFilters.gender);
    if (newFilters.search) params.append('q', newFilters.search);
    const qs = params.toString();
    router.push(qs ? `/mascotas?${qs}` : '/mascotas');
  };

  const handleSearchChange = (value: string) => {
    handleFilterChange({ ...filters, search: value });
  };

  return (
    <div className="w-full md:w-64 shrink-0">
      <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
      <div className="mt-4 md:hidden">
        <SearchBar
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Buscar mascotas..."
        />
      </div>
    </div>
  );
}
