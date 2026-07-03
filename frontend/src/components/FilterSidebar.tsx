'use client';

import Icon from './Icon';

interface Filters {
  species: string;
  size: string;
  gender: string;
  search: string;
}

interface FilterSidebarProps {
  filters: Filters;
  onFilterChange: (_filters: Filters) => void;
}

const speciesOptions = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'rabbit', label: 'Conejo' },
];

const sizeOptions = [
  { value: 'small', label: 'Pequeno' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

const genderOptions = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Hembra' },
];

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: filters[key] === value ? '' : value });
  };

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-card">
        <div className="flex items-center gap-2 mb-4 border-b border-surface-gray pb-3">
          <Icon name="filter_list" className="w-5 h-5 text-primary" />
          <h2 className="font-headline-sm text-on-surface">Filtros</h2>
        </div>

        <div className="mb-6">
          <h3 className="font-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Especie</h3>
          <div className="flex flex-col gap-3">
            {speciesOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 group cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.species === opt.value}
                  onChange={() => handleChange('species', opt.value)}
                  className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span className="font-body-sm text-on-surface group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Tamano</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange('size', opt.value)}
                className={`px-3 py-1 rounded-full font-label-sm border transition-colors ${
                  filters.size === opt.value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-gray text-on-surface-variant border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-label-md text-on-surface-variant mb-3 uppercase tracking-wider">Sexo</h3>
          <div className="flex flex-col gap-3">
            {genderOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 group cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  checked={filters.gender === opt.value}
                  onChange={() => handleChange('gender', opt.value)}
                  className="text-primary-container focus:ring-primary-container"
                />
                <span className="font-body-sm text-on-surface group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
