'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorDisplay error={this.state.error} onRetry={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorDisplayProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-zinc-900/40">
        <AlertTriangle className="w-8 h-8 text-zinc-400" />
      </div>
      <h2 className="font-medium mb-2 text-white">{title}</h2>
      <p className="max-w-md mb-4 text-muted-foreground">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface ErrorCardProps {
  error: string;
  className?: string;
}

export function ErrorCard({ error, className = '' }: ErrorCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className} bg-zinc-900/30 border-zinc-800`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-zinc-500">Error</p>
          <p className="mt-1 text-zinc-400">{error}</p>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-zinc-900">
          {icon}
        </div>
      )}
      <h3 className="font-medium mb-1 text-white">{title}</h3>
      {description && <p className="max-w-sm mb-4 text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
