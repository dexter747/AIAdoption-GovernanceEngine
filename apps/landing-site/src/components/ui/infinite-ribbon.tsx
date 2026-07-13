'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InfiniteRibbonProps {
  repeat?: number;
  duration?: number;
  reverse?: boolean;
  rotation?: number;
  children: React.ReactNode;
  className?: string;
}

export function InfiniteRibbon({
  repeat = 5,
  duration = 20,
  reverse = false,
  rotation = 0,
  children,
  className,
}: InfiniteRibbonProps) {
  const animationClass = reverse ? 'animate-infinite-ribbon-reverse' : 'animate-infinite-ribbon';

  return (
    <div
      className={cn(
        'max-w-full overflow-hidden bg-zinc-900/60 border border-zinc-800 py-2 text-sm text-zinc-400',
        className
      )}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div
        className={cn('flex whitespace-nowrap', animationClass)}
        style={{ '--ribbon-duration': `${duration}s` } as React.CSSProperties}
      >
        {Array.from({ length: repeat }, (_, index) => (
          <span key={index} className="mr-8 inline-block select-none">
            {children}
          </span>
        ))}
      </div>
    </div>
  );
}
