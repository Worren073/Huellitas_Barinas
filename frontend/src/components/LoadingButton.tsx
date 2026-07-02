'use client';

import { ReactNode } from 'react';
import Icon from './Icon';

interface LoadingButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: string;
}

export default function LoadingButton({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  children,
  className = '',
  variant = 'primary',
  icon,
}: LoadingButtonProps) {
  const variantStyles = {
    primary: 'bg-primary-container text-on-primary-container hover:brightness-105',
    secondary: 'bg-secondary-container text-on-secondary-container hover:brightness-105',
    tertiary: 'border border-outline-variant text-on-surface hover:bg-surface-container-low',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`font-label-md py-3 rounded-lg shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <>
          <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
          Procesando...
        </>
      ) : (
        <>
          {icon && <Icon name={icon} className="w-5 h-5" solid />}
          {children}
        </>
      )}
    </button>
  );
}
