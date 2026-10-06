import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogIn, Lock, CheckCircle2, ChevronRight, Clock3 } from 'lucide-react';
import { User } from '../../types';
import {
  getUserRoleCategory,
  getAuthorizedDashboard,
  RouteAccessResult,
} from '../../middleware/authMiddleware';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

interface AccessDeniedViewProps {
  user: User;
  accessResult: RouteAccessResult;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ user, accessResult }) => {
  const navigate = useNavigate();
  const { logout } = useApp();
  const category = getUserRoleCategory(user);
  const authConfig = getAuthorizedDashboard(user);

  if (user.authRole === 'pending_staff') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-3xl border border-amber-200 bg-white p-7 sm:p-10 text-center shadow-lg dark:border-amber-900 dark:bg-stone-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock3 className="h-7 w-7" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Account created</p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Waiting for role assignment</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Your account is active, but has no staff permissions yet. A council administrator must assign your role before you can use the staff workspace.
          </p>
          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-left dark:bg-stone-800/70">
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{user.name}</p>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{user.email}</p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={() => void logout().then(() => navigate('/'))}>Sign out</Button>
            <Button onClick={() => navigate('/')}>Return to public site</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-14 px-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        {/* Background accent ring */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />

        {/* Top Warning Icon & Title */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-900 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Authorization Guard Active
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                {accessResult.attemptedPath}
              </span>
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 dark:text-stone-100 mt-1">
              Restricted Directorate Access
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed">
              {accessResult.denialReason ||
                'Your current council role does not have authorization to view or execute operations within this module.'}
            </p>
          </div>
        </div>

        {/* Active Account Identity Card */}
        <div className="mt-8 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-800 to-stone-900 text-amber-300 font-bold flex items-center justify-center text-base shrink-0 border border-amber-400/30">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {user.name}
                </span>
                <Badge variant={authConfig.badgeVariant as any}>
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {user.email} • Tier: <strong className="text-stone-700 dark:text-stone-300">{category}</strong>
              </p>
            </div>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200 dark:border-stone-700">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">
              Assigned Directorate
            </div>
            <div className="font-medium text-stone-800 dark:text-stone-200">
              {user.department || 'Council Directorate'}
            </div>
          </div>
        </div>

        {/* Authorized Modules Scope Box */}
        <div className="mt-6 p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Your Authorized Dashboard & Scope:</span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
            <strong>{authConfig.dashboardTitle}</strong> — {authConfig.dashboardSubtitle}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {authConfig.allowedRoutePrefixes.map((prefix) => (
              <Link
                key={prefix}
                to={prefix}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400 transition-colors"
              >
                <span>{prefix}</span>
                <ChevronRight className="w-3 h-3 text-stone-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            onClick={() => navigate(authConfig.dashboardPath)}
            variant="primary"
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold"
          >
            Go to Your Authorized Dashboard ({authConfig.category})
          </Button>

          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              icon={<LogIn className="w-4 h-4" />}
              className="w-full text-xs font-semibold"
            >
              Sign In as Different Role (Admin / Staff)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
