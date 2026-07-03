'use client';

import Modal from '@/components/ui/Modal';

interface AdoptionDetail {
  id: number;
  pet_name: string;
  applicant: number;
  applicant_name: string;
  center_name: string;
  status: string;
  motivation: string;
  experience: string;
  home_type: string;
  has_yard: boolean;
  has_other_pets: boolean;
  other_pets_details: string;
  family_members: number;
  review_notes: string;
}

interface DetailModalProps {
  adoption: AdoptionDetail | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Solicitud Enviada', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  under_review: { label: 'En Revision', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-800 border-green-300' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-300' },
  completed: { label: 'Completada', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500 border-gray-300' },
};

const HOME_TYPE: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  other: 'Otro',
};

export default function DetailModal({ adoption, onClose }: DetailModalProps) {
  if (!adoption) return null;

  return (
    <Modal open={!!adoption} onClose={onClose} title={`Detalle de Solicitud #${adoption.id}`} maxWidth="lg">
      <div className="space-y-stack-md">
        <div className="grid grid-cols-2 gap-stack-md">
          <div>
            <p className="font-label-sm text-on-surface-variant mb-1">Solicitante</p>
            <p className="font-body-md text-on-surface">{adoption.applicant_name || `Usuario #${adoption.applicant}`}</p>
          </div>
          <div>
            <p className="font-label-sm text-on-surface-variant mb-1">Mascota</p>
            <p className="font-body-md text-on-surface">{adoption.pet_name}</p>
          </div>
          <div>
            <p className="font-label-sm text-on-surface-variant mb-1">Centro</p>
            <p className="font-body-md text-on-surface">{adoption.center_name}</p>
          </div>
          <div>
            <p className="font-label-sm text-on-surface-variant mb-1">Estado</p>
            <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-medium border ${STATUS_CONFIG[adoption.status]?.color || ''}`}>
              {STATUS_CONFIG[adoption.status]?.label || adoption.status}
            </span>
          </div>
        </div>

        <div className="border-t border-outline-variant/30 pt-stack-md">
          <h4 className="font-label-md text-on-surface mb-3">Informacion de la Solicitud</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Motivacion</p>
              <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{adoption.motivation || '\u2014'}</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Experiencia</p>
              <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{adoption.experience || '\u2014'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Tipo de Vivienda</p>
              <p className="font-body-sm text-on-surface">{HOME_TYPE[adoption.home_type] || adoption.home_type}</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Miembros de la Familia</p>
              <p className="font-body-sm text-on-surface">{adoption.family_members}</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Tiene Patio</p>
              <p className="font-body-sm text-on-surface">{adoption.has_yard ? 'Si' : 'No'}</p>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant mb-1">Tiene Otras Mascotas</p>
              <p className="font-body-sm text-on-surface">{adoption.has_other_pets ? 'Si' : 'No'}</p>
            </div>
          </div>
          {adoption.has_other_pets && adoption.other_pets_details && (
            <div className="mt-4">
              <p className="font-label-sm text-on-surface-variant mb-1">Detalles de Otras Mascotas</p>
              <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{adoption.other_pets_details}</p>
            </div>
          )}
        </div>

        {adoption.review_notes && (
          <div className="border-t border-outline-variant/30 pt-stack-md">
            <p className="font-label-sm text-on-surface-variant mb-1">Notas de Revision</p>
            <p className="font-body-sm text-on-surface bg-surface-gray/30 rounded-lg p-3">{adoption.review_notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
