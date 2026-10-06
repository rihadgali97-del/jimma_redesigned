import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl z-10 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 font-serif">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
