'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-blue-500', sizeClasses[size])} />
      {text && <span className="text-gray-500 text-sm">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50 rounded-lg">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('p-4 border border-gray-200 dark:border-gray-800 rounded-lg', className)}>
      <LoadingSkeleton variant="text" className="w-3/4 mb-3" />
      <LoadingSkeleton variant="text" className="w-1/2 mb-2" />
      <LoadingSkeleton variant="text" className="w-full mb-2" />
      <LoadingSkeleton variant="text" className="w-2/3" />
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" 
           style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} variant="text" className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex}
          className="grid gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface FullPageLoadingProps {
  text?: string;
}

export function FullPageLoading({ text = 'Loading...' }: FullPageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}
