import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { apiRequest } from '../../../services/authApi';

type Account = { id: number; fullName: string; email: string; isActive: boolean; emailVerified: boolean; role: { id: number; name: string } };
type Role = { id: number; name: string; description?: string | null; permissions: string[] };

export const AccountAccessPanel: React.FC = () => {
  const { addToast, refreshStaffAndRoles } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [users, roleList] = await Promise.all([
        apiRequest<Account[]>('/admin/users?page=1&pageSize=100'),
        apiRequest<Role[]>('/admin/roles'),
      ]);
      setAccounts(users);
      setRoles(roleList.filter((role) => role.name !== 'pending_staff' && role.name !== 'super_admin'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load account access data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pending = accounts.filter((account) => account.isActive && account.role.name === 'pending_staff');
  const assignRole = async (account: Account) => {
    const roleId = selected[account.id];
    if (!roleId) return;
    setSavingId(account.id);
    try {
      await apiRequest(`/admin/users/${account.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ roleId, isActive: true }),
      });
      addToast('Account access assigned', `${account.fullName} can sign in with the assigned role. Ask them to sign out and back in.`, 'success');
      await load();
      try {
        await refreshStaffAndRoles();
      } catch (refreshError) {
        addToast('Role assigned, but roster refresh failed', refreshError instanceof Error ? refreshError.message : 'Reload staff data to see the changes.', 'warning');
      }
    } catch (err) {
      addToast('Could not assign role', err instanceof Error ? err.message : 'Please try again.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const rejectAccount = async (account: Account) => {
    setSavingId(account.id);
    try {
      await apiRequest(`/admin/users/${account.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false, metadata: { approvalStatus: 'rejected' } }),
      });
      addToast('Account request rejected', `${account.fullName} will not be able to sign in.`, 'success');
      await load();
    } catch (err) {
      addToast('Could not reject account', err instanceof Error ? err.message : 'Please try again.', 'error');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-900 dark:bg-stone-900">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" /></div>
        <div>
          <h2 className="font-bold text-stone-900 dark:text-stone-100">Staff account requests</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Verify the email before assigning a role, or reject an account request.</p>
        </div>
      </div>
      {loading ? <div className="flex items-center gap-2 py-4 text-sm text-stone-500"><Loader2 className="h-4 w-4 animate-spin" />Loading accounts…</div> : error ? (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</div>
      ) : pending.length === 0 ? (
        <div className="rounded-lg bg-stone-50 p-4 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">No accounts are waiting for a role assignment.</div>
      ) : (
        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {pending.map((account) => (
            <div key={account.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">{account.fullName}</div>
                <div className="text-sm text-stone-500">{account.email}</div>
                <div className={`mt-1 text-xs font-medium ${account.emailVerified ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {account.emailVerified ? 'Email verified' : 'Email not verified'}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select aria-label={`Role for ${account.fullName}`} disabled={!account.emailVerified || savingId === account.id} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800" value={selected[account.id] || ''} onChange={(event) => setSelected((prev) => ({ ...prev, [account.id]: Number(event.target.value) }))}>
                  <option value="">Choose a role</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name.replaceAll('_', ' ')}</option>)}
                </select>
                <button type="button" disabled={!account.emailVerified || !selected[account.id] || savingId === account.id} onClick={() => void assignRole(account)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {savingId === account.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Assign access
                </button>
                <button type="button" disabled={savingId === account.id} onClick={() => void rejectAccount(account)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:text-rose-300">
                  <XCircle className="h-4 w-4" />Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
