import React from 'react';
import { useApp } from '../../../context/AppContext';
import { User } from '../../../types';
import {
  X,
  Shield,
  UserCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  IdCard,
  Edit,
  Key,
  Clock,
  History,
  Calendar,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { StaffAvatar } from './StaffAvatar';

interface StaffDetailDrawerProps {
  staff: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (staff: User) => void;
  onOpenBadge: (staff: User) => void;
}

export const StaffDetailDrawer: React.FC<StaffDetailDrawerProps> = ({
  staff,
  isOpen,
  onClose,
  onEdit,
  onOpenBadge,
}) => {
  const {
    rolesList,
    permissionCategories,
    securityLogs,
    setCurrentUser,
    toggleStaffStatus,
    addToast,
  } = useApp();

  if (!isOpen || !staff) return null;

  const roleDef = rolesList.find((r) => r.name === staff.role);
  const userLogs = securityLogs.filter(
    (l) => l.actorEmail === staff.email || l.target.includes(staff.name)
  );

  const handleSimulateLogin = () => {
    setCurrentUser(staff);
    addToast(
      'Session Switched (Demo)',
      `Now logged in as ${staff.name} (${staff.role}).`,
      'info'
    );
    onClose();
  };

  const handleSendResetLink = () => {
    addToast(
      'Security Credential Dispatched',
      `Secure password reset SMS/Email link dispatched to ${staff.phone}.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-stone-900 h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <StaffAvatar
              src={staff.avatar}
              name={staff.name}
              className="w-16 h-16 rounded-2xl border-2 border-amber-400/60 shadow-md shrink-0"
            />
            <div className="min-w-0 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={
                    staff.status === 'Active'
                      ? 'emerald'
                      : staff.status === 'Suspended'
                      ? 'rose'
                      : 'amber'
                  }
                >
                  {staff.status || 'Active'}
                </Badge>
                {staff.twoFactorEnabled && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Lock className="w-2.5 h-2.5" /> 2FA Active
                  </span>
                )}
              </div>

              <h2 className="font-serif font-bold text-xl text-white mt-1 leading-snug truncate">
                {staff.name}
              </h2>
              {staff.arabicName && (
                <p className="text-xs font-serif text-amber-400">{staff.arabicName}</p>
              )}
              <p className="text-xs text-stone-300 mt-0.5">{staff.title || staff.role}</p>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-stone-700/60">
            <Button
              variant="gold"
              size="sm"
              icon={<LogIn className="w-3.5 h-3.5" />}
              onClick={handleSimulateLogin}
              className="text-xs py-1.5"
            >
              Impersonate / Act As
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<IdCard className="w-3.5 h-3.5 text-amber-400" />}
              onClick={() => onOpenBadge(staff)}
              className="text-xs py-1.5 bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700"
            >
              Staff ID Card
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                onEdit(staff);
              }}
              className="text-xs py-1.5 bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700"
            >
              Edit Details
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity & Department Dossier */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
              Departmental & Contact Records
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Building className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Directorate</span>
                  <span className="font-semibold truncate">{staff.department || 'Executive Secretariat'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Primary Role</span>
                  <span className="font-semibold truncate">{staff.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Email</span>
                  <span className="font-mono truncate">{staff.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Phone</span>
                  <span className="font-mono truncate">{staff.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Kebele</span>
                  <span className="font-semibold">{staff.district || 'Jimma Central'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">Joined Date</span>
                  <span className="font-semibold">{staff.joinedDate || '2024-01-01'}</span>
                </div>
              </div>
            </div>

            {staff.notes && (
              <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-400 block font-semibold">Special Mandate Notes</span>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">{staff.notes}</p>
              </div>
            )}
          </div>

          {/* Security & Access Tier */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                Security & Session Status
              </h4>
              <button
                onClick={() => toggleStaffStatus(staff.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl transition-colors ${
                  staff.status === 'Active'
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {staff.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500">Security Clearance</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {staff.accessLevel || 'Level 3 (Departmental Officer)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-200 dark:border-stone-700">
                <span className="text-stone-500">Last System Login</span>
                <span className="font-mono text-stone-900 dark:text-stone-100">
                  {staff.lastLogin || 'Today at 08:45 AM'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500">Password Reset Dispatch</span>
                <button
                  onClick={handleSendResetLink}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  Send OTP Reset Link
                </button>
              </div>
            </div>
          </div>

          {/* Granular Active Permissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
                Effective Operational Permissions ({(staff.permissions || []).length})
              </h4>
              <Badge variant="gold" className="text-[10px]">
                Base: {staff.role}
              </Badge>
            </div>

            <div className="space-y-3">
              {permissionCategories.map((cat) => {
                const userPermsInCat = cat.permissions.filter((p) =>
                  (staff.permissions || []).includes(p.id)
                );
                if (userPermsInCat.length === 0) return null;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {userPermsInCat.length} granted
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {userPermsInCat.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-700/60 text-[10px] text-stone-700 dark:text-stone-300 font-medium"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span>{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Log Activity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
              <History className="w-4 h-4" />
              <span>Recent Activity & Audit Trail</span>
            </div>

            {userLogs.length === 0 ? (
              <p className="text-xs text-stone-400 italic p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                No recent security incidents or audited actions recorded for this personnel profile.
              </p>
            ) : (
              <div className="space-y-2">
                {userLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-stone-500">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
};
