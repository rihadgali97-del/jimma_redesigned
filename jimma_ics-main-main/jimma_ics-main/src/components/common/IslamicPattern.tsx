import React from 'react';

interface IslamicPatternProps {
  className?: string;
  opacity?: number;
}

export const IslamicPattern: React.FC<IslamicPatternProps> = ({
  className = '',
  opacity = 0.04,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-emerald-950 dark:text-emerald-300 fill-current"
      >
        <defs>
          <pattern
            id="islamic-star-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-pointed star & interlocking polygons */}
            <path
              d="M30 0 L36 12 L48 6 L42 18 L54 24 L42 30 L54 36 L42 42 L48 54 L36 48 L30 60 L24 48 L12 54 L18 42 L6 36 L18 30 L6 24 L18 18 L12 6 L24 12 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path
              d="M0 30 L10 20 L20 30 L10 40 Z M60 30 L50 20 L40 30 L50 40 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star-pattern)" />
      </svg>
    </div>
  );
};
