'use client';

import { Component, ReactNode } from 'react';
import Icon from '@/components/Icon';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <Icon name="error" className="w-16 h-16 text-status-error mx-auto mb-4" />
            <h2 className="font-headline-md text-on-surface mb-2">Algo salió mal</h2>
            <p className="font-body-md text-on-surface-variant mb-6">
              Ocurrió un error inesperado. Por favor intenta de nuevo.
            </p>
            {this.state.error && (
              <p className="font-body-sm text-on-surface-variant/60 mb-6 bg-surface-gray/50 rounded-lg p-3 text-left break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-lg hover:brightness-105 active:scale-95 transition-all"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
