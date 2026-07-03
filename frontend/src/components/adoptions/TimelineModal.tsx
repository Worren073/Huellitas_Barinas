'use client';

import Icon from '@/components/Icon';
import Modal from '@/components/ui/Modal';

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
    <Modal open={!!adoption} onClose={onClose} title={`Historial de #${adoption.id}`}>
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
    </Modal>
  );
}
