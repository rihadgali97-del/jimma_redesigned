import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-lg min-h-[36px]',
    md: 'px-4 py-2 text-sm font-medium gap-2 rounded-xl min-h-[42px]',
    lg: 'px-6 py-3 text-base font-semibold gap-2.5 rounded-xl min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-900/10 active:scale-[0.98] focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500',
    secondary:
      'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-amber-300 dark:border-stone-700 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-emerald-50/50 text-emerald-800 border border-emerald-300 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-emerald-950/40 active:scale-[0.98]',
    gold:
      'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-900/15 active:scale-[0.98] focus:ring-2 focus:ring-amber-400',
    ghost:
      'bg-transparent hover:bg-stone-100 text-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
