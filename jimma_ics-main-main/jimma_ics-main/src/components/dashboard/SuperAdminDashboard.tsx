import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';
import { LiveOperationalSnapshot } from './LiveOperationalSnapshot';

export const SuperAdminDashboard: React.FC = () => {
  const {
    securityLogs,
    securityLogsLoaded,
  } = useApp();

  return (
    <div className="space-y-8">
      {/* Executive Command Header */}
      <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                Administration Overview
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Jimma City Islamic Affairs Council Command Matrix
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Live oversight of mosque and madrasa directories, education, welfare, and council services.
            </p>
          </div>


        </div>
      </div>

      <LiveOperationalSnapshot />

      {/* Live security audit feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live security event stream */}
        <div className="lg:col-span-12 space-y-6">
          {/* Live Security Log Feed */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Security & Audit Feed
              </h3>
              <Link to="/admin/staff">
                <Button variant="ghost" size="sm" className="text-xs">
                  Staff & Roles →
                </Button>
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {!securityLogsLoaded ? (
                <p className="py-3 text-center text-stone-400">Loading server audit records…</p>
              ) : securityLogs.length === 0 ? (
                <p className="py-3 text-center text-stone-400">No server audit activity recorded.</p>
              ) : securityLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {log.action}
                    </span>
                    <Badge variant={log.status === 'Success' ? 'emerald' : 'gold'}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    Actor: {log.actorName} ({log.actorRole}) • {log.timestamp.split('T')[0]}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
