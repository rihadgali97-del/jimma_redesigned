import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'gold' | 'amber' | 'blue' | 'rose' | 'slate' | 'teal' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-medium';

  const variantClasses = {
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    gold: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    amber: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    outline: 'bg-transparent text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full tracking-wide whitespace-nowrap transition-colors ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
