'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';

interface ActionModalProps {
  adoption: { id: number; pet_name: string } | null;
  action: string;
  onConfirm: (_notes: string) => Promise<void>;
  onClose: () => void;
}

const ACTION_CONFIG: Record<string, { title: string }> = {
  start_review: { title: 'Iniciar Revision' },
  approve: { title: 'Aprobar Solicitud' },
  reject: { title: 'Rechazar Solicitud' },
  complete: { title: 'Completar Adopcion' },
};

export default function ActionModal({ adoption, action, onConfirm, onClose }: ActionModalProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!adoption) return null;

  const handleConfirm = async () => {
    setError('');
    setFieldErrors({});
    if (action === 'reject' && !notes.trim()) {
      setFieldErrors({ notes: 'Debe proporcionar un motivo de rechazo' });
      return;
    }
    setLoading(true);
    try {
      await onConfirm(notes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al realizar la accion';
      setFieldErrors({ notes: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={!!adoption}
      onClose={onClose}
      title={ACTION_CONFIG[action]?.title || action}
      subtitle={`Solicitud #${adoption.id} - ${adoption.pet_name}`}
    >
      {error && (
        <div className="mb-stack-sm bg-status-error/10 text-status-error font-body-sm p-3 rounded-lg">{error}</div>
      )}
      {action === 'reject' && (
        <div>
          <label className="font-label-md text-on-surface mb-1.5 block">Motivo de rechazo</label>
          <textarea
            rows={3}
            className={`w-full bg-surface-container-lowest border rounded-lg font-body-sm px-4 py-3 focus:outline-none resize-none ${
              fieldErrors.notes ? 'border-red-400' : 'border-outline-variant focus:border-primary-container'
            }`}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); if (fieldErrors.notes) setFieldErrors({}); }}
            placeholder="Indica el motivo del rechazo..."
          />
          {fieldErrors.notes && <p className="text-red-500 font-body-sm mt-1">{fieldErrors.notes}</p>}
        </div>
      )}
      {action === 'approve' && (
        <div>
          <label className="font-label-md text-on-surface mb-1.5 block">Notas (opcional)</label>
          <textarea
            rows={2}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm px-4 py-3 focus:outline-none focus:border-primary-container resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas adicionales..."
          />
        </div>
      )}
      <div className="flex gap-3 mt-stack-md">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 border border-outline-variant text-on-surface font-label-md py-3 rounded-lg hover:bg-surface-gray transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}
