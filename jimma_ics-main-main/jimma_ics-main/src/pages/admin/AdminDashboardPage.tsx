import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { SuperAdminDashboard } from '../../components/dashboard/SuperAdminDashboard';
import { FinanceDashboard } from '../../components/dashboard/FinanceDashboard';
import { MediaBroadcastDashboard } from '../../components/dashboard/MediaBroadcastDashboard';
import { ZakatWelfareDashboard } from '../../components/dashboard/ZakatWelfareDashboard';
import { AdminEventsPage } from './AdminEventsPage';
import { AdminMosquesPage } from './AdminMosquesPage';
import { AdminServicesPage } from './AdminServicesPage';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useApp();
  const authRole = currentUser.authRole;
  const role = (authRole || currentUser.role || '').toLowerCase();

  let workspace: React.ReactNode;
  if (authRole === 'finance_officer') workspace = <FinanceDashboard />;
  else if (authRole === 'case_officer') workspace = <AdminServicesPage />;
  else if (authRole === 'content_editor') workspace = <AdminMosquesPage />;
  else if (authRole === 'dispatcher') workspace = <MediaBroadcastDashboard />;
  else if (authRole === 'secretariat_admin') workspace = <AdminEventsPage />;
  else if (authRole === 'super_admin') workspace = <SuperAdminDashboard />;
  else if (role.includes('finance')) workspace = <FinanceDashboard />;
  else if (role.includes('case') || role.includes('zakat') || role.includes('welfare')) workspace = <ZakatWelfareDashboard />;
  else if (role.includes('dispatcher') || role.includes('media') || role.includes('broadcast')) workspace = <MediaBroadcastDashboard />;
  else if (role.includes('content') || role.includes('mosque')) workspace = <AdminMosquesPage />;
  else workspace = <SuperAdminDashboard />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 font-serif text-lg font-bold text-amber-300 shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400">Signed in as</span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">{currentUser.name}</span>
              <Badge variant={authRole === 'super_admin' ? 'gold' : 'emerald'}>{currentUser.role}</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">{currentUser.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>{currentUser.permissions.length} server-assigned permissions</span>
        </div>
      </div>
      <div className="animate-in fade-in duration-300">{workspace}</div>
    </div>
  );
};
