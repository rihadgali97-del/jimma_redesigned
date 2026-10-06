import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
        }[toast.type];

        const borderClass = {
          success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/95 dark:bg-emerald-950/90',
          info: 'border-blue-200 dark:border-blue-800 bg-blue-50/95 dark:bg-blue-950/90',
          warning: 'border-amber-200 dark:border-amber-800 bg-amber-50/95 dark:bg-amber-950/90',
          error: 'border-rose-200 dark:border-rose-800 bg-rose-50/95 dark:bg-rose-950/90',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-xs flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {toast.title}
                </h4>
                <span className="text-[10px] text-stone-400">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
