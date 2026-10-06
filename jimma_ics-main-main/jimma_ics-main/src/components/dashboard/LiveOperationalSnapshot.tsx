import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, Building2, HeartHandshake, RefreshCw, School, ShieldCheck, Wallet } from 'lucide-react';
import { apiRequest } from '../../services/authApi';

type DashboardSummary = {
  applications: { zakat: Record<string, number>; janazah: Record<string, number> };
  directoryByWoreda: { mosques: { woreda: string | null; count: number }[]; madrasas: { woreda: string | null; count: number }[] };
  waqfAssetCount: number;
  publishedFinancialReportCount: number;
  generatedAt: string;
};

export const LiveOperationalSnapshot: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError('');
    try {
      setSummary(await apiRequest<DashboardSummary>(`/admin/dashboard/summary${refresh ? '?refresh=true' : ''}`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load the live dashboard summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading && !summary) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">Loading live council data…</div>;
  }

  if (!summary) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><span><strong>Live dashboard data unavailable.</strong> {error}</span></div>
        <button type="button" onClick={() => void load(true)} className="inline-flex items-center gap-2 self-start rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-800 dark:text-amber-200"><RefreshCw className="h-4 w-4" />Retry</button>
      </div>
    );
  }

  const total = (counts: Record<string, number>) => Object.values(counts).reduce((sum, count) => sum + count, 0);
  const stats = [
    { label: 'Mosques', value: summary.directoryByWoreda.mosques.reduce((sum, row) => sum + row.count, 0), icon: Building2 },
    { label: 'Madrasas', value: summary.directoryByWoreda.madrasas.reduce((sum, row) => sum + row.count, 0), icon: School },
    { label: 'Zakat cases', value: total(summary.applications.zakat), icon: HeartHandshake },
    { label: 'Janazah requests', value: total(summary.applications.janazah), icon: Activity },
    { label: 'Financial reports', value: summary.publishedFinancialReportCount, icon: ShieldCheck },
    { label: 'Waqf assets', value: summary.waqfAssetCount, icon: Wallet },
  ];

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-stone-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div><h3 className="font-bold text-stone-900 dark:text-stone-100">Live operational summary</h3><p className="text-xs text-stone-500">Counts from the council database</p></div>
        <div className="flex items-center gap-3"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />Connected</span><button type="button" disabled={loading} onClick={() => void load(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800"><div className="flex items-center justify-between text-xs text-stone-500"><span>{label}</span><Icon className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /></div><div className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">{value.toLocaleString()}</div></div>)}
      </div>
      <p className="mt-3 text-right text-[11px] text-stone-400">Updated {new Date(summary.generatedAt).toLocaleString()}</p>
    </section>
  );
};
