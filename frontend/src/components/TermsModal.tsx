'use client';

import { useState, useRef, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface TermsModalProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

const TERMS_SECTIONS = [
  {
    title: '1. Aceptación de los Términos',
    content: 'Al acceder y utilizar la plataforma Huellitas Barinas, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no debes usar este sitio.',
  },
  {
    title: '2. Propósito de la Plataforma',
    content: 'Huellitas Barinas es una plataforma que conecta centros de adopción con personas interesadas en adoptar mascotas en Venezuela. Facilitamos el proceso de adopción pero no somos responsables directos de las adopciones realizadas.',
  },
  {
    title: '3. Responsabilidades del Usuario',
    content: 'Los usuarios se comprometen a proporcionar información veraz y actualizada. Los centros de adopción son responsables de verificar la idoneidad de los adoptantes y del bienestar de los animales.',
  },
  {
    title: '4. Privacidad de Datos',
    content: 'Protegemos tus datos personales según nuestra política de privacidad. No compartimos tu información con terceros sin tu consentimiento explícito.',
  },
  {
    title: '5. Modificaciones',
    content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán comunicados a través de la plataforma.',
  },
  {
    title: '6. Uso de la Plataforma',
    content: 'El usuario se compromete a usar la plataforma únicamente para fines legales y de acuerdo con estos términos. No está permitido publicar información falsa, realizar actividades fraudulentas, o utilizar la plataforma para cualquier propósito ilegal.',
  },
  {
    title: '7. Registro de Cuenta',
    content: 'Al registrarte, eres responsable de mantener la confidencialidad de tus credenciales. Debes notificar inmediatamente cualquier uso no autorizado de tu cuenta.',
  },
  {
    title: '8. Proceso de Adopción',
    content: 'Huellitas Barinas actúa como intermediario entre centros de adopción y adoptantes. Cada centro de adopción establece sus propios requisitos y procesos de adopción. No garantizamos la aprobación de ninguna solicitud de adopción.',
  },
  {
    title: '9. Limitación de Responsabilidad',
    content: 'Huellitas Barinas no se hace responsable por daños directos o indirectos derivados del uso de la plataforma, incluyendo pero no limitado a adopciones fallidas, información incorrecta proporcionada por centros o usuarios, o disputas entre centros y adoptantes.',
  },
  {
    title: '10. Contacto',
    content: 'Para cualquier consulta sobre estos términos, puedes contactarnos a través de nuestro formulario de contacto en la plataforma o mediante correo electrónico.',
  },
];

export default function TermsModal({ open, onAccept, onClose }: TermsModalProps) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      setReachedEnd(true);
    }
  };

  useEffect(() => {
    if (open) {
      setReachedEnd(false);
    }
  }, [open]);

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Términos y Condiciones" maxWidth="lg">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-[50vh] overflow-y-auto space-y-6 pr-2"
      >
        {TERMS_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="font-headline-sm text-on-surface mb-2">{section.title}</h3>
            <p className="font-body-md text-on-surface-variant">{section.content}</p>
          </div>
        ))}
        {!reachedEnd && (
          <div className="sticky bottom-0 text-center font-body-sm text-primary py-2 bg-surface/80 backdrop-blur-sm">
            ↓ Desplázate hasta abajo para aceptar
          </div>
        )}
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t border-outline-variant/30">
        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-low transition-colors"
        >
          Cerrar
        </button>
        <button
          onClick={handleAccept}
          disabled={!reachedEnd}
          className="flex-1 bg-primary text-on-primary font-label-md py-2.5 rounded-lg hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
}
