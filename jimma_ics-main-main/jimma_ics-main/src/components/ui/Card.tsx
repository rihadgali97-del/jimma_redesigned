import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'bordered' | 'highlight';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    default:
      'bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs shadow-stone-950/5',
    subtle:
      'bg-stone-50/70 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/80',
    bordered:
      'bg-transparent border-2 border-emerald-900/10 dark:border-emerald-500/20',
    highlight:
      'bg-gradient-to-br from-emerald-900/5 to-amber-900/5 dark:from-emerald-950/30 dark:to-amber-950/30 border border-emerald-500/20 dark:border-emerald-500/30',
  };

  const hoverClasses = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/40'
    : '';

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 relative overflow-hidden ${variantClasses[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
