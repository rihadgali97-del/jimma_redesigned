import React, { useEffect, useState } from 'react';

interface StaffAvatarProps {
  name: string;
  src?: string;
  className: string;
}

export const StaffAvatar: React.FC<StaffAvatarProps> = ({ name, src, className }) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden bg-stone-200 text-sm font-bold text-stone-600 dark:bg-stone-700 dark:text-stone-200`}>
      {src && !imageFailed ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
      ) : (
        <span aria-label={`${name} profile photo unavailable`}>{initials || '?'}</span>
      )}
    </div>
  );
};
