import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { usePagination } from '../../hooks/usePagination';
import {
  fetchOfficialInquiries,
  OfficialInquiry,
  OfficialInquiryStatus,
  updateOfficialInquiryStatus,
} from '../../services/officialInquiriesApi';
import { useApp } from '../../context/AppContext';

const statuses: OfficialInquiryStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'COMPLETED', 'CANCELLED'];

function labelStatus(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export const AdminOfficialInquiriesPage: React.FC = () => {
  const { addToast } = useApp();
  const [inquiries, setInquiries] = useState<OfficialInquiry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfficialInquiryStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadInquiries = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const records: OfficialInquiry[] = [];
      const pageSize = 100;
      let page = 1;
      while (true) {
        const batch = await fetchOfficialInquiries({
          page,
          pageSize,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        });
        records.push(...batch);
        if (batch.length < pageSize) break;
        page += 1;
      }
      setInquiries(records);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load official inquiries.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const pagination = usePagination(inquiries, 10, `${search}|${statusFilter}`);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadInquiries(); }, 200);
    return () => window.clearTimeout(timer);
  }, [loadInquiries]);

  const saveStatus = async (inquiry: OfficialInquiry, status: OfficialInquiryStatus) => {
    setSavingId(inquiry.id);
    try {
      const updated = await updateOfficialInquiryStatus(inquiry.id, status);
      setInquiries((current) => current.map((item) => item.id === updated.id ? updated : item));
      addToast('Inquiry updated', `${inquiry.referenceNumber} is now ${labelStatus(updated.status)}.`, 'success');
    } catch (error) {
      addToast('Could not update inquiry', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Official Inquiries</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Review public inquiries sent to council desks and keep their handling status up to date.
        </p>
      </header>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-stone-900 dark:text-stone-100">Inquiry inbox</h2>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, name, phone, message"
                className="w-72 rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-stone-700 dark:bg-stone-800"
              />
            </label>
            <select
              aria-label="Filter official inquiries by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as OfficialInquiryStatus | '')}
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={() => void loadInquiries()} disabled={loading} icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        </div>

        {loadError ? (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">Could not load inquiries: {loadError}</p>
        ) : loading ? (
          <p className="text-sm text-stone-500">Loading inquiries…</p>
        ) : inquiries.length === 0 ? (
          <p className="text-sm text-stone-500">No matching official inquiries.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-stone-700">
                <tr>
                  <th className="p-3">Reference / received</th>
                  <th className="p-3">Sender</th>
                  <th className="p-3">Desk / category</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {pagination.paginatedItems.map((inquiry) => (
                  <tr key={inquiry.id} className="align-top">
                    <td className="p-3 font-mono text-xs">
                      {inquiry.referenceNumber}
                      <span className="mt-1 block font-sans text-stone-500">{new Date(inquiry.createdAt).toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{inquiry.fullName}</span>
                      <a className="mt-1 block font-mono text-xs text-emerald-700 underline dark:text-emerald-300" href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                      {inquiry.email && <a className="mt-1 block text-xs text-emerald-700 underline dark:text-emerald-300" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>}
                    </td>
                    <td className="p-3">
                      {inquiry.department}
                      <span className="mt-1 block text-xs text-stone-500">{inquiry.inquiryType}</span>
                    </td>
                    <td className="max-w-md whitespace-pre-wrap p-3 text-xs leading-5 text-stone-600 dark:text-stone-300">{inquiry.message}</td>
                    <td className="p-3">
                      <Badge variant={inquiry.status === 'COMPLETED' ? 'emerald' : inquiry.status === 'CANCELLED' ? 'rose' : 'gold'}>
                        {labelStatus(inquiry.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <select
                        aria-label={`Update ${inquiry.referenceNumber} status`}
                        value={inquiry.status}
                        disabled={savingId === inquiry.id}
                        onChange={(event) => void saveStatus(inquiry, event.target.value as OfficialInquiryStatus)}
                        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs dark:border-stone-700 dark:bg-stone-800"
                      >
                        {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !loadError && inquiries.length > 0 && (
          <PaginationControls {...pagination} itemLabel="inquiries" onPageChange={pagination.setPage} />
        )}
      </Card>
    </div>
  );
};
