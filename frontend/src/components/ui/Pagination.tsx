'use client';

import Icon from '@/components/Icon';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'default' | 'minimal';
}

export default function Pagination({ page, totalPages, onPageChange, variant = 'default' }: PaginationProps) {
  if (totalPages <= 1) return null;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center gap-4 pt-6">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_left" className="w-5 h-5" />
        </button>
        <span className="font-label-md text-on-surface-variant">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_right" className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="chevron_left" className="w-5 h-5" />
      </button>
      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-on-surface-variant">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg font-label-md transition-colors ${
              p === page
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Icon name="chevron_right" className="w-5 h-5" />
      </button>
    </div>
  );
}
