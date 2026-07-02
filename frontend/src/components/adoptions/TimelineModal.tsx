'use client';

import Icon from '@/components/Icon';

interface TimelineEntry {
  id: number;
  old_status: string;
  new_status: string;
  changed_by_name: string;
  notes: string;
  created_at: string;
}

interface TimelineModalProps {
  adoption: { id: number; timeline: TimelineEntry[] } | null;
  onClose: () => void;
}

export default function TimelineModal({ adoption, onClose }: TimelineModalProps) {
  if (!adoption) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
          <h3 className="font-headline-sm text-on-surface">Historial de #{adoption.id}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-stack-md">
          {adoption.timeline && adoption.timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-outline-variant/40" />
              {adoption.timeline.map((entry, idx) => (
                <div key={entry.id || idx} className="flex gap-4 pb-stack-md relative">
                  <div className="shrink-0 w-[18px] h-[18px] rounded-full border-2 border-primary bg-surface mt-0.5 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-label-sm text-on-surface-variant capitalize">
                        {entry.old_status} &rarr; {entry.new_status}
                      </span>
                      <span className="text-label-sm text-outline">
                        {new Date(entry.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    {entry.notes && <p className="font-body-sm text-on-surface-variant">{entry.notes}</p>}
                    {entry.changed_by_name && (
                      <p className="font-label-sm text-outline mt-0.5">por {entry.changed_by_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-on-surface-variant text-center py-stack-md">Sin historial disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}
