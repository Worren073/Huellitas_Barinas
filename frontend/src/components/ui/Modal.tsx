'use client';

import { useEffect, useCallback, ReactNode } from 'react';
import Icon from '@/components/Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, subtitle, children, maxWidth = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-surface rounded-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[85vh] overflow-y-auto shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-stack-md border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface rounded-t-2xl">
          <div>
            <h3 className="font-headline-sm text-on-surface">{title}</h3>
            {subtitle && <p className="font-body-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-stack-md">{children}</div>
      </div>
    </div>
  );
}
