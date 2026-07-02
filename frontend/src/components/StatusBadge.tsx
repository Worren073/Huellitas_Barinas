import Icon from './Icon';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; border?: string; icon: string }> = {
  available: { bg: 'bg-status-approved', text: 'text-on-primary-container', icon: 'check_circle_solid', border: 'border border-[#9ae6b4]' },
  in_process: { bg: 'bg-status-pending', text: 'text-on-tertiary-container', icon: 'schedule' },
  adopted: { bg: 'bg-status-completed', text: 'text-on-surface', icon: 'favorite' },
  removed: { bg: 'bg-status-cancelled', text: 'text-on-surface-variant', icon: 'cancel' },
  pending: { bg: 'bg-status-pending', text: 'text-on-tertiary-container', icon: 'schedule', border: 'border border-[#E2D973]/30' },
  under_review: { bg: 'bg-status-review', text: 'text-primary', icon: 'visibility', border: 'border border-primary/10' },
  approved: { bg: 'bg-status-approved', text: 'text-[#1C4532]', icon: 'check_circle_solid', border: 'border border-[#9AE6B4]/50' },
  rejected: { bg: 'bg-status-rejected', text: 'text-on-error-container', icon: 'cancel', border: 'border border-[#FEB2B2]/50' },
  completed: { bg: 'bg-status-completed', text: 'text-on-surface', icon: 'celebration' },
  cancelled: { bg: 'bg-status-cancelled', text: 'text-on-surface-variant', icon: 'cancel' },
};

const statusLabels: Record<string, string> = {
  available: 'En Adopción',
  in_process: 'En Proceso',
  adopted: 'Adoptada',
  removed: 'Removida',
  pending: 'Pendiente',
  under_review: 'En Revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const label = statusLabels[status] || status;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} font-label-${size} px-3 py-1 rounded-full shadow-sm backdrop-blur-sm bg-opacity-90 ${config.border || ''}`}
    >
      <Icon name={config.icon} className={iconSize} />
      {label}
    </span>
  );
}
