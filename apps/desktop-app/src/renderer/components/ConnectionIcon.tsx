import { useState } from 'react';
import { cn } from '../lib/utils';

interface ConnectionIconProps {
  /** Logo image path (e.g. /legacy/mysql.svg) */
  logo?: string;
  /** Emoji fallback */
  icon: string;
  /** Tailwind gradient classes for the container, e.g. from-blue-500 to-blue-600 */
  color: string;
  /** Tailwind bg-color class applied to the container, e.g. bg-blue-500/10 */
  bgColor: string;
  /** Size class for the container. Defaults to 'md' (14×14 / text-2xl). */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm:  { container: 'w-10 h-10', img: 'w-6 h-6',  emoji: 'text-xl' },
  md:  { container: 'w-12 h-12', img: 'w-7 h-7',  emoji: 'text-2xl' },
  lg:  { container: 'w-14 h-14', img: 'w-9 h-9',  emoji: 'text-3xl' },
};

/**
 * Renders a brand logo image inside the coloured container.
 * Falls back gracefully to the emoji icon if the image fails to load or isn't provided.
 */
export default function ConnectionIcon({
  logo,
  icon,
  color,
  bgColor,
  size = 'md',
  className,
}: ConnectionIconProps) {
  const [imgError, setImgError] = useState(false);
  const s = SIZE_MAP[size];
  const showImg = logo && !imgError;

  return (
    <div
      className={cn(
        s.container,
        'rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
        showImg ? bgColor : `bg-gradient-to-br ${color}`,
        className,
      )}
    >
      {showImg ? (
        <img
          src={logo}
          alt=""
          className={cn(s.img, 'object-contain')}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={s.emoji}>{icon}</span>
      )}
    </div>
  );
}
