import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  LoaderCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SettingsStatusCard } from '../../components/system-settings/SettingsStatusCard';
import { fetchSystemSettingsStatus, SystemSettingsStatus } from '../../services/systemSettingsApi';

const quickLinks = [
  { title: 'Mosque registry', description: 'Update mosque details and linked madrasas.', to: '/admin/mosques', icon: Building2 },
  { title: 'Madrasa registry', description: 'Manage schools, head teachers, and student records.', to: '/admin/madrasas', icon: BookOpen },
  { title: 'Staff and access', description: 'Manage staff accounts, roles, and permissions.', to: '/admin/users', icon: Users },
  { title: 'Events and announcements', description: 'Manage public notices and council programs.', to: '/admin/events', icon: FileText },
  { title: 'Audit and activity', description: 'Review administrative activity and compliance.', to: '/admin/audit', icon: ShieldCheck },
];

export const AdminSystemSettingsPage: React.FC = () => {
  const [status, setStatus] = useState<SystemSettingsStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkSystem = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      setStatus(await fetchSystemSettingsStatus());
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Could not check system status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkSystem();
  }, [checkSystem]);

  const services = status
    ? [
        { title: 'Telegram announcements', configured: status.integrations.telegram, description: 'Publishes approved public announcements to the council channel.', setupHint: 'Ask your system administrator to connect the council Telegram account. You do not need to enter a password here.' },
        { title: 'Email notifications', configured: status.integrations.email, description: 'Sends email verification and event notification messages.', setupHint: 'Ask your system administrator to connect the official council email account.' },
        { title: 'Photo and document storage', configured: status.integrations.cloudinary, description: 'Stores uploaded mosque and madrasa photos, and council documents.', setupHint: 'Ask your system administrator to connect the council photo and document storage.' },
        { title: 'Browser notifications', configured: status.integrations.browserNotifications, description: 'Allows subscribers to receive browser notifications about council updates.', setupHint: 'Ask your system administrator to enable browser notifications for the council website.' },
      ]
    : [];

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              <Settings className="h-4 w-4" />
              System control center
            </div>
            <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
              System settings
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">
              Check whether the council system is ready, see what needs attention, and open common settings in one place.
              Secret connection details stay protected on the server.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void checkSystem()}
            disabled={isChecking}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isChecking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isChecking ? 'Checking…' : 'Check everything'}
          </button>
        </div>
      </header>

      <section aria-labelledby="system-status-heading" className="space-y-4">
        <div>
          <h2 id="system-status-heading" className="text-lg font-bold text-stone-900 dark:text-stone-100">System status</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {status
              ? `Last checked ${new Date(status.checkedAt).toLocaleString()}.`
              : 'Checking the main system connection.'}
          </p>
        </div>
        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <p className="font-semibold">We could not check the system.</p>
            <p className="mt-1">{error}</p>
            <button type="button" onClick={() => void checkSystem()} className="mt-3 font-semibold underline">Try again</button>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsStatusCard
            title="Council database"
            description="Stores the registered records and settings used by the system."
            configured={status ? status.database === 'connected' : null}
            setupHint="The database could not be reached. Please contact the system administrator."
          />
          {services.map((service) => (
            <SettingsStatusCard key={service.title} {...service} />
          ))}
        </div>
        {status && (
          <p className="flex items-start gap-2 text-xs leading-5 text-stone-500">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            This check confirms required connection details are present. It does not send test messages or expose passwords.
          </p>
        )}
      </section>

      <section aria-labelledby="quick-settings-heading" className="space-y-4">
        <div>
          <h2 id="quick-settings-heading" className="text-lg font-bold text-stone-900 dark:text-stone-100">Common settings</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Choose what you want to manage. You can return here at any time.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {quickLinks.map(({ title, description, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-emerald-600 hover:shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-stone-900 dark:text-stone-100">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-stone-600 dark:text-stone-400">{description}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
            </Link>
          ))}
          <Link
            to="/admin/gateway"
            className="group flex min-h-24 items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-emerald-600 hover:shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-700"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Settings className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-stone-900 dark:text-stone-100">Messaging gateway</span>
              <span className="mt-1 block text-sm leading-5 text-stone-600 dark:text-stone-400">View Telegram status, send approved announcements, and review delivery history.</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-700" />
          </Link>
        </div>
      </section>
    </div>
  );
};
