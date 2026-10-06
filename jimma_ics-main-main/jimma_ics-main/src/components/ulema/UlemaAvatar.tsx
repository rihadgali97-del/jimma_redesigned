import React, { useEffect, useState } from 'react';

interface UlemaAvatarProps {
  name: string;
  src?: string;
  className: string;
}

export const UlemaAvatar: React.FC<UlemaAvatarProps> = ({ name, src, className }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  const initials = name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part.charAt(0)).join('').toUpperCase();

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden bg-emerald-100 font-serif font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200`}>
      {src && !imageFailed
        ? <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
        : <span aria-label={`${name} profile photo unavailable`}>{initials || '?'}</span>}
    </div>
  );
};
