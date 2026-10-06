import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DispatchLogItem, MessageCategory, MessageChannel } from '../../types';
import {
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Send,
  Smartphone,
  Info,
  Clock,
  Layers,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  fetchTelegramGatewayHistory,
  TelegramGatewayHistoryRecord,
} from '../../services/notificationsApi';

function toDispatchLogItem(record: TelegramGatewayHistoryRecord): DispatchLogItem {
  const status = {
    QUEUED: 'queued',
    SENDING: 'transmitting',
    SENT: 'delivered',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  }[record.status] as DispatchLogItem['status'];
  const time = record.sentAt || record.createdAt;

  return {
    id: record.id,
    timestamp: new Date(time).toLocaleString(),
    title: record.title,
    category: record.category,
    channel: 'telegram',
    senderId: 'Telegram Bot',
    recipientTarget: record.channelId,
    recipientCount: 1,
    content: record.content,
    status,
    gatewayResponseCode: record.status === 'SENT'
      ? 'Accepted by Telegram'
      : record.errorMessage || record.status,
    costETB: 0,
    deliveryRate: record.status === 'SENT' ? 100 : 0,
    metadata: {
      telegramMessageId: record.messageId || undefined,
      telegramErrorMessage: record.errorMessage || undefined,
    },
  };
}

export const GatewayAuditLogs: React.FC<{ liveGatewayOnly?: boolean }> = ({ liveGatewayOnly = false }) => {
  const { dispatchHistory, clearDispatchHistory, addToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [selectedLog, setSelectedLog] = useState<DispatchLogItem | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyStatus, setHistoryStatus] = useState<'All' | TelegramGatewayHistoryRecord['status']>('All');
  const [historyItems, setHistoryItems] = useState<DispatchLogItem[]>([]);
  const [historyMeta, setHistoryMeta] = useState({ totalItems: 0, totalPages: 1 });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveGatewayOnly) return;

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    fetchTelegramGatewayHistory(
      historyPage,
      25,
      historyStatus === 'All' ? undefined : historyStatus
    )
      .then((result) => {
        if (cancelled) return;
        setHistoryItems(result.items.map(toDispatchLogItem));
        setHistoryMeta({
          totalItems: result.meta.totalItems,
          totalPages: result.meta.totalPages,
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setHistoryError(error instanceof Error ? error.message : 'Failed to load Telegram dispatch history.');
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [liveGatewayOnly, historyPage, historyStatus]);

  const refreshHistory = () => {
    setHistoryLoading(true);
    setHistoryError(null);
    fetchTelegramGatewayHistory(
      historyPage,
      25,
      historyStatus === 'All' ? undefined : historyStatus
    )
      .then((result) => {
        setHistoryItems(result.items.map(toDispatchLogItem));
        setHistoryMeta({ totalItems: result.meta.totalItems, totalPages: result.meta.totalPages });
      })
      .catch((error: unknown) => {
        setHistoryError(error instanceof Error ? error.message : 'Failed to load Telegram dispatch history.');
      })
      .finally(() => setHistoryLoading(false));
  };

  const visibleLogs = liveGatewayOnly ? historyItems : dispatchHistory;

  const filteredLogs = visibleLogs.filter((log) => {
    const s = (searchTerm || '').toLowerCase();
    const matchSearch =
      (log.title || '').toLowerCase().includes(s) ||
      (log.recipientTarget || '').toLowerCase().includes(s) ||
      (log.content || '').toLowerCase().includes(s);
    const matchCategory = categoryFilter === 'All' || log.category === categoryFilter;
    const matchChannel = channelFilter === 'All' || log.channel === channelFilter;
    return matchSearch && matchCategory && matchChannel;
  });

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Title', 'Category', 'Channel', 'Recipients', 'Status', 'Gateway Code', 'Cost ETB'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      l.category,
      l.channel,
      l.recipientCount,
      l.status,
      `"${l.gatewayResponseCode}"`,
      l.costETB,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jimma_gateway_dispatch_audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Activity Exported', 'The current filtered gateway activity was exported to CSV.', 'success');
  };

  return (
    <Card className="space-y-4">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            {liveGatewayOnly ? 'Telegram Send Activity' : 'Gateway Dispatch History'}
          </span>
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            {liveGatewayOnly ? 'Telegram Dispatch History' : 'SMS & Telegram Dispatch History'}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {liveGatewayOnly
              ? 'Persistent Telegram send history from the server, including failed attempts.'
              : 'Gateway dispatch history.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {liveGatewayOnly && (
            <>
              <span className="text-xs text-stone-500">{historyMeta.totalItems} records</span>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />}
                disabled={historyLoading}
                onClick={refreshHistory}
              >
                Refresh
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          {!liveGatewayOnly && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4 text-stone-400" />}
              onClick={clearDispatchHistory}
            >
              Clear History
            </Button>
          )}
        </div>
      </div>
      {liveGatewayOnly && historyError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          Could not load Telegram history: {historyError}
        </p>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={liveGatewayOnly ? 'Search sent Telegram posts...' : 'Search by title or recipient...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
        >
          <option value="All">All Categories ({liveGatewayOnly ? historyMeta.totalItems : dispatchHistory.length})</option>
          <option value="sabaq_alert">Sabaq & Attendance Alerts</option>
          <option value="janazah_broadcast">Emergency Janazah Broadcasts</option>
          <option value="moon_sighting">Moon Sighting & Eid Alerts</option>
          <option value="khutbah_advisory">Friday Khutbah Guidance</option>
          <option value="general_bulletin">General Bulletins</option>
        </select>

        {liveGatewayOnly ? (
          <select
            value={historyStatus}
            onChange={(e) => {
              setHistoryStatus(e.target.value as typeof historyStatus);
              setHistoryPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          >
            <option value="All">All delivery statuses</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="QUEUED">Queued</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        ) : (
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
          >
            <option value="All">All Channels</option>
            <option value="sms">Ethio Telecom SMS Gateway</option>
            <option value="telegram">Telegram Bot / Channel</option>
            <option value="hybrid">Dual Hybrid Broadcast</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 font-semibold border-b border-stone-200 dark:border-stone-800">
            <tr>
              <th className="p-3.5">Time / Channel</th>
              <th className="p-3.5">Campaign & Category</th>
              <th className="p-3.5">Target Audience</th>
              <th className="p-3.5">Recipients</th>
              <th className="p-3.5">{liveGatewayOnly ? 'Telegram Response' : 'Carrier Response'}</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-sans">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500">
                  {historyLoading
                    ? 'Loading Telegram history...'
                    : historyError || 'No dispatch logs found matching the filter criteria.'}
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {log.channel === 'sms' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[9px] uppercase">
                          SMS
                        </span>
                      )}
                      {log.channel === 'telegram' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[9px] uppercase">
                          Telegram
                        </span>
                      )}
                      {log.channel === 'hybrid' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[9px] uppercase">
                          Hybrid
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-stone-400">{log.timestamp}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">From: {log.senderId}</div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900 dark:text-stone-100">{log.title}</div>
                    <div className="text-[10px] text-stone-400 capitalize">{log.category.replace(/_/g, ' ')}</div>
                  </td>

                  <td className="p-3.5 max-w-[240px]">
                    <div className="truncate text-stone-700 dark:text-stone-300">{log.recipientTarget}</div>
                    {log.metadata?.studentName && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        Student: {log.metadata.studentName}
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      {log.recipientCount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-stone-400 block">{log.costETB > 0 ? `${log.costETB} ETB` : 'Free'}</span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        log.status === 'delivered' ? 'bg-emerald-500' :
                          log.status === 'failed' ? 'bg-rose-500' :
                            log.status === 'cancelled' ? 'bg-stone-400' : 'bg-amber-500'
                      }`} />
                      <span className={`font-mono text-[10px] font-bold ${
                        log.status === 'delivered' ? 'text-emerald-700 dark:text-emerald-400' :
                          log.status === 'failed' ? 'text-rose-700 dark:text-rose-400' :
                            'text-amber-700 dark:text-amber-400'
                      }`}>
                        {liveGatewayOnly
                          ? log.status === 'delivered'
                            ? 'Accepted by Telegram'
                            : log.status === 'failed'
                              ? 'Telegram send failed'
                              : log.status === 'transmitting'
                                ? 'Sending to Telegram'
                                : log.status === 'cancelled'
                                  ? 'Cancelled'
                                  : 'Telegram send queued'
                          : log.gatewayResponseCode}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {liveGatewayOnly
                        ? log.metadata?.telegramMessageId
                          ? `Message ID: ${log.metadata.telegramMessageId}`
                          : log.metadata?.telegramErrorMessage || log.status
                        : `${log.deliveryRate}% delivered`}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <Button variant="outline" size="xs" onClick={() => setSelectedLog(log)}>
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {liveGatewayOnly && (
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Page {historyPage} of {historyMeta.totalPages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={historyLoading || historyPage <= 1}
              onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={historyLoading || historyPage >= historyMeta.totalPages}
              onClick={() => setHistoryPage((page) => Math.min(historyMeta.totalPages, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`${liveGatewayOnly ? 'Telegram Post' : 'Dispatch Dossier'}: ${selectedLog.title}`}
          subtitle={`Transmission ID: ${selectedLog.id} • ${selectedLog.timestamp}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 dark:bg-stone-800/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Channel</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 uppercase">{selectedLog.channel}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Sender ID</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{selectedLog.senderId}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Recipients</span>
                <span className="font-bold font-mono text-stone-800 dark:text-stone-200">{selectedLog.recipientCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Total Tariff</span>
                <span className="font-bold font-mono text-amber-700 dark:text-amber-400">{selectedLog.costETB} ETB</span>
              </div>
            </div>

            <div>
              <label className="block text-stone-500 font-semibold mb-1">
                {liveGatewayOnly ? 'Posted Message Text:' : 'Delivered Payload Text:'}
              </label>
              <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-100 font-sans whitespace-pre-line leading-relaxed border border-stone-700 text-xs">
                {selectedLog.content}
              </div>
            </div>

            {selectedLog.status === 'failed' && selectedLog.metadata?.telegramErrorMessage ? (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/80">
                <span className="font-bold text-rose-900 dark:text-rose-200 block">Telegram delivery failed</span>
                <span className="text-xs text-rose-700 dark:text-rose-300">{selectedLog.metadata.telegramErrorMessage}</span>
              </div>
            ) : liveGatewayOnly && selectedLog.status !== 'delivered' ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80">
                <span className="font-bold text-amber-900 dark:text-amber-200 block">
                  {selectedLog.status === 'transmitting' ? 'Sending to Telegram' : selectedLog.status}
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300">No Telegram acceptance has been recorded yet.</span>
              </div>
            ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                  {liveGatewayOnly ? 'Telegram acceptance' : 'Carrier Delivery Signature'}
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  {liveGatewayOnly
                    ? `Message ID: ${selectedLog.metadata?.telegramMessageId}`
                    : `${selectedLog.gatewayResponseCode} • 100% Handset Acknowledgment`}
                </span>
              </div>
              <Badge variant="emerald">
                {liveGatewayOnly
                  ? selectedLog.status === 'delivered'
                    ? 'Accepted by Telegram'
                    : selectedLog.status === 'queued'
                      ? 'Queued'
                      : selectedLog.status
                  : 'Delivered (SLA Verified)'}
              </Badge>
            </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedLog(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};
