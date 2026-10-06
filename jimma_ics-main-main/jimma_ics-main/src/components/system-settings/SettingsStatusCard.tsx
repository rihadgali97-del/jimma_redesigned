import React from 'react';
import { CheckCircle2, CircleAlert, CircleHelp } from 'lucide-react';

export interface SettingsStatusCardProps {
  title: string;
  description: string;
  configured: boolean | null;
  setupHint: string;
}

export const SettingsStatusCard: React.FC<SettingsStatusCardProps> = ({
  title,
  description,
  configured,
  setupHint,
}) => (
  <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-400">{description}</p>
      </div>
      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
          configured === true
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            : configured === false
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
        }`}
      >
        {configured === true ? <CheckCircle2 className="h-3.5 w-3.5" /> : configured === false ? <CircleAlert className="h-3.5 w-3.5" /> : <CircleHelp className="h-3.5 w-3.5" />}
        {configured === true ? 'Ready' : configured === false ? 'Setup needed' : 'Not checked'}
      </span>
    </div>
    {configured !== true && (
      <p className="mt-4 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600 dark:bg-stone-950 dark:text-stone-400">
        {setupHint}
      </p>
    )}
  </article>
);
