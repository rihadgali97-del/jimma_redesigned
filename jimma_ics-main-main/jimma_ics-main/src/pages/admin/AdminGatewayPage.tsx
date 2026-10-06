import React, { useEffect, useState } from 'react';
import {
  Send,
  Radio,
  Smartphone,
  Settings,
  History,
  GraduationCap,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SmsTelegramComposer } from '../../components/gateway/SmsTelegramComposer';
import { GatewayAuditLogs } from '../../components/gateway/GatewayAuditLogs';
import { fetchTelegramGatewayStatus, TelegramGatewayStatus } from '../../services/notificationsApi';

export const AdminGatewayPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'composer' | 'logs' | 'batch' | 'settings'>('composer');
  const [telegramStatus, setTelegramStatus] = useState<TelegramGatewayStatus | null>(null);
  const [telegramStatusError, setTelegramStatusError] = useState<string | null>(null);

  useEffect(() => {
    fetchTelegramGatewayStatus()
      .then(setTelegramStatus)
      .catch((error: unknown) => {
        setTelegramStatusError(error instanceof Error ? error.message : 'Could not read Telegram gateway status.');
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Automated Communications Hub
            </span>
            <Badge variant={telegramStatus?.enabled ? 'emerald' : 'amber'}>
              <Radio className="w-3 h-3 mr-1" />
              {telegramStatus?.enabled ? 'Telegram Token Configured' : telegramStatusError ? 'Status Unavailable' : 'Telegram Not Configured'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Telegram Broadcast Gateway
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm max-w-2xl">
            Send public announcements to the configured Telegram channel. SMS delivery is disabled, and private
            student or guardian messages cannot be sent to a public channel.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<History className="w-4 h-4 text-stone-400" />}
            onClick={() => setActiveTab('logs')}
          >
            Audit Trail
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Send className="w-4 h-4" />}
            onClick={() => setActiveTab('composer')}
          >
            Compose Alert
          </Button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
        {[
          { id: 'composer' as const, label: 'Telegram Message Composer', icon: <Send className="w-4 h-4" /> },
          { id: 'logs' as const, label: 'Dispatch History', icon: <History className="w-4 h-4" /> },
          { id: 'batch' as const, label: 'SMS Batch (Disabled)', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'settings' as const, label: 'Gateway Status', icon: <Settings className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-900 text-amber-300 shadow-sm border border-emerald-700'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Composer */}
      {activeTab === 'composer' && (
        <SmsTelegramComposer
          telegramOnly
          telegramStatus={telegramStatus}
          telegramStatusError={telegramStatusError}
        />
      )}

      {/* Tab 2: Logs */}
      {activeTab === 'logs' && <GatewayAuditLogs liveGatewayOnly />}

      {/* SMS is unavailable until a provider is configured. */}
      {activeTab === 'batch' && (
        <Card className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            SMS and guardian-specific batch delivery are disabled
          </h3>
          <p className="text-sm text-stone-500">
            The SMS gateway has no provider credentials. Telegram only posts to the public channel, so private
            student progress and guardian phone numbers are not sent through it.
          </p>
          <Button variant="outline" size="sm" icon={<Send className="w-4 h-4" />} onClick={() => setActiveTab('composer')}>
            Compose a Telegram Channel Announcement
          </Button>
        </Card>
      )}

      {/* Tab 4: Gateway status */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>SMS Gateway</span>
            </h3>
            <Badge variant="amber">Disabled — provider credentials unavailable</Badge>
            <p className="text-xs text-stone-500">
              No SMS messages are sent or simulated from this admin gateway.
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Telegram Bot API</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Connection:</span>
                <Badge variant={telegramStatus?.enabled ? 'emerald' : 'amber'}>
                  {telegramStatus?.enabled ? 'Token configured' : telegramStatusError ? 'Status unavailable' : 'Token not configured'}
                </Badge>
              </div>
              <div>
                <span className="text-stone-500 block mb-1">Broadcast target</span>
                <a
                  href={`https://t.me/${(telegramStatus?.channelId || '@riho_information').replace(/^@/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-700 dark:text-blue-400 underline"
                >
                  {telegramStatus?.channelId || '@riho_information'}
                </a>
              </div>
              <p className="text-stone-500">
                The bot token remains on the backend and is never returned to the browser. The bot must have permission
                to post in the configured channel.
              </p>
              {telegramStatusError && <p role="alert" className="text-rose-600">{telegramStatusError}</p>}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
