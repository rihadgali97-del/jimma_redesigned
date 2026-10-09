import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Save, Search, Scale } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import {
  fetchCurrentNisabRate,
  fetchZakatApplications,
  assignZakatOfficer,
  setNisabRate,
  updateZakatApplicationStatus,
  ZakatApplication,
  ZakatApplicationStatus,
} from '../../services/zakatApi';

const statuses: ZakatApplicationStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

function labelStatus(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const AdminZakatApplicationsPage: React.FC = () => {
  const { addToast, currentUser } = useApp();
  const [applications, setApplications] = useState<ZakatApplication[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ZakatApplicationStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [goldPrice, setGoldPrice] = useState('');
  const [silverPrice, setSilverPrice] = useState('');
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [savingRate, setSavingRate] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const records = await fetchZakatApplications({ page: 1, pageSize: 100, search: search.trim() || undefined, status: statusFilter || undefined });
      setApplications(records);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load Zakat applications.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadApplications(); }, 200);
    return () => window.clearTimeout(timer);
  }, [loadApplications]);

  useEffect(() => {
    let active = true;
    fetchCurrentNisabRate()
      .then((rate) => {
        if (!active || !rate) return;
        setGoldPrice(String(rate.goldPricePerGram));
        setSilverPrice(String(rate.silverPricePerGram));
        setRateDate(rate.effectiveDate);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const saveStatus = async (application: ZakatApplication, status: ZakatApplicationStatus) => {
    setSavingId(application.id);
    try {
      const updated = await updateZakatApplicationStatus(application.id, { status });
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      addToast('Application updated', `${application.referenceNumber} is now ${labelStatus(updated.status)}.`, 'success');
    } catch (error) {
      addToast('Could not update application', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const assignToMe = async (application: ZakatApplication) => {
    const officerId = Number(currentUser.id);
    if (!Number.isInteger(officerId) || officerId <= 0) {
      addToast('Cannot assign application', 'Your account does not have a valid backend user ID.', 'error');
      return;
    }
    setSavingId(application.id);
    try {
      const updated = await assignZakatOfficer(application.id, officerId);
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      addToast('Application assigned', `${application.referenceNumber} is assigned to you.`, 'success');
    } catch (error) {
      addToast('Could not assign application', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const saveRates = async (event: React.FormEvent) => {
    event.preventDefault();
    const gold = Number(goldPrice);
    const silver = Number(silverPrice);
    if (!(gold > 0) || !(silver > 0)) {
      addToast('Invalid Nisab rate', 'Enter positive gold and silver prices per gram.', 'warning');
      return;
    }
    setSavingRate(true);
    try {
      const rate = await setNisabRate({ goldPricePerGram: gold, silverPricePerGram: silver });
      setRateDate(rate.effectiveDate);
      addToast('Nisab rates updated', 'The calculator will use these council reference rates.', 'success');
    } catch (error) {
      addToast('Could not save Nisab rates', error instanceof Error ? error.message : 'Check your permissions and try again.', 'error');
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Zakat Applications & Nisab Rates</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Review applications stored in the council database and publish current gold and silver reference prices.</p>
      </header>

      <Card className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Scale className="h-4 w-4" />
          <h2 className="font-semibold">Council Nisab Reference Rates</h2>
        </div>
        <form onSubmit={saveRates} className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
            <span>Gold price per gram (ETB)</span>
            <input type="number" min="0.01" step="0.01" required value={goldPrice} onChange={(event) => setGoldPrice(event.target.value)} className="block w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono dark:border-stone-700 dark:bg-stone-800" />
          </label>
          <label className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
            <span>Silver price per gram (ETB)</span>
            <input type="number" min="0.01" step="0.01" required value={silverPrice} onChange={(event) => setSilverPrice(event.target.value)} className="block w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono dark:border-stone-700 dark:bg-stone-800" />
          </label>
          <Button type="submit" variant="primary" disabled={savingRate} icon={<Save className="h-4 w-4" />}>{savingRate ? 'Saving…' : 'Publish rates'}</Button>
          {rateDate && <span className="text-xs text-stone-500">Effective {new Date(rateDate).toLocaleString()}</span>}
        </form>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Application Queue</h2>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, phone, reference" className="w-64 rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ZakatApplicationStatus | '')} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800">
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => void loadApplications()} disabled={loading} icon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
          </div>
        </div>

        {loadError ? <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">Could not load applications: {loadError}</p> : loading ? <p className="text-sm text-stone-500">Loading applications…</p> : applications.length === 0 ? <p className="text-sm text-stone-500">No matching Zakat applications.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-stone-700"><tr><th className="p-3">Reference</th><th className="p-3">Applicant</th><th className="p-3">Phone</th><th className="p-3">Kebele</th><th className="p-3">Received</th><th className="p-3">Assigned officer</th><th className="p-3">Status</th><th className="p-3">Update</th></tr></thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="p-3 font-mono text-xs">{application.referenceNumber}</td>
                    <td className="p-3 font-medium">{application.applicantFullName}<span className="block text-xs text-stone-500">Household: {application.householdSize ?? 'Not provided'}</span></td>
                    <td className="p-3 font-mono text-xs">{application.applicantPhone}</td>
                    <td className="p-3">{application.woreda.code}</td>
                    <td className="p-3 text-xs">{new Date(application.createdAt).toLocaleString()}</td>
                    <td className="p-3 text-xs">{application.assignedOfficer?.fullName || <Button size="sm" variant="outline" disabled={savingId === application.id} onClick={() => void assignToMe(application)}>Assign to me</Button>}</td>
                    <td className="p-3"><Badge variant={application.status === 'APPROVED' || application.status === 'COMPLETED' ? 'emerald' : application.status === 'REJECTED' || application.status === 'CANCELLED' ? 'rose' : 'gold'}>{labelStatus(application.status)}</Badge></td>
                    <td className="p-3"><select aria-label={`Update ${application.referenceNumber} status`} value={application.status} disabled={savingId === application.id} onChange={(event) => void saveStatus(application, event.target.value as ZakatApplicationStatus)} className="rounded border border-stone-300 bg-white px-2 py-1 text-xs dark:border-stone-700 dark:bg-stone-800">{statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
