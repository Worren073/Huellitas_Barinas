'use client';

import Icon from './Icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'pill';
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...', variant = 'default' }: SearchBarProps) {
  if (variant === 'pill') {
    return (
      <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant">
        <Icon name="search" className="w-4 h-4 text-on-surface-variant mr-2" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none text-sm font-body-sm text-on-surface w-32 focus:ring-0 p-0"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all w-48 lg:w-64"
      />
    </div>
  );
}
