import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface AvatarProps {
  src?: string;
  image?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  online?: boolean;
  verified?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  image,
  name,
  size = 'md',
  online,
  verified,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarSrc = image || src;

  let sizeClass = 'w-11 h-11 text-sm';
  let indicatorClass = 'w-3.5 h-3.5 border-2';

  if (typeof size === 'number') {
    if (size <= 32) { sizeClass = 'w-8 h-8 text-xs'; indicatorClass = 'w-2.5 h-2.5 border-2'; }
    else if (size <= 48) { sizeClass = 'w-11 h-11 text-sm'; indicatorClass = 'w-3.5 h-3.5 border-2'; }
    else if (size <= 64) { sizeClass = 'w-14 h-14 text-base'; indicatorClass = 'w-4 h-4 border-2'; }
    else { sizeClass = 'w-20 h-20 text-xl'; indicatorClass = 'w-5 h-5 border-2'; }
  } else {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-11 h-11 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-xl',
    };
    const indicatorSizes = {
      sm: 'w-2.5 h-2.5 border-2',
      md: 'w-3.5 h-3.5 border-2',
      lg: 'w-4 h-4 border-2',
      xl: 'w-5 h-5 border-2',
    };
    sizeClass = sizeClasses[size] || sizeClasses.md;
    indicatorClass = indicatorSizes[size] || indicatorSizes.md;
  }

  const getFirstLetterCapital = (n: string) => {
    if (!n) return '?';
    const trimmed = n.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
  };

  const showImage = avatarSrc && !imageError;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={avatarSrc}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClass} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700/60 shadow-xs`}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs uppercase select-none`}
        >
          {getFirstLetterCapital(name)}
        </div>
      )}

      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${indicatorClass} rounded-full border-white dark:border-slate-900 ${
            online ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}

      {verified && (
        <span className="absolute -top-1 -right-1 bg-sky-500 text-white rounded-full p-0.5 shadow-xs">
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </span>
      )}
    </div>
  );
};
