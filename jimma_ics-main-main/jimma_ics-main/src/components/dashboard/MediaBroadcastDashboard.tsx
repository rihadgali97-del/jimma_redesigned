import React, { useEffect, useState } from 'react';
import { CalendarDays, CircleAlert, Radio, RefreshCw, Send, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  fetchTelegramGatewayHistory,
  fetchTelegramGatewayStatus,
  type TelegramGatewayHistoryRecord,
  type TelegramGatewayStatus,
} from '../../services/notificationsApi';
import { fetchAllAdminEvents } from '../../services/eventsApi';
import type { CouncilEvent } from '../../types';

const dateLabel = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Date unavailable' : parsed.toLocaleString();
};

export const MediaBroadcastDashboard: React.FC = () => {
  const [telegramStatus, setTelegramStatus] = useState<TelegramGatewayStatus | null>(null);
  const [recentBroadcasts, setRecentBroadcasts] = useState<TelegramGatewayHistoryRecord[]>([]);
  const [broadcastCount, setBroadcastCount] = useState<number | null>(null);
  const [failedCount, setFailedCount] = useState<number | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<CouncilEvent[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controllers = new Set<AbortController>();
    const requestWithTimeout = <T,>(request: (signal: AbortSignal) => Promise<T>) => {
      const controller = new AbortController();
      controllers.add(controller);
      let timeoutId: number;
      const timeout = new Promise<never>((_resolve, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort();
          reject(new Error('Request timed out after 15 seconds.'));
        }, 15000);
      });

      return Promise.race([
        Promise.resolve().then(() => request(controller.signal)),
        timeout,
      ]).finally(() => {
        window.clearTimeout(timeoutId);
        controllers.delete(controller);
      });
    };
    setIsLoading(true);
    setErrors([]);
    setTelegramStatus(null);
    setRecentBroadcasts([]);
    setBroadcastCount(null);
    setFailedCount(null);
    setUpcomingEvents(null);

    const loadRequest = async <T,>(
      label: string,
      request: (signal: AbortSignal) => Promise<T>,
      onSuccess: (value: T) => void
    ) => {
      try {
        const value = await requestWithTimeout(request);
        if (!cancelled) onSuccess(value);
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unexpected request error.';
        setErrors((currentErrors) => [...currentErrors, `${label}: ${message}`]);
      }
    };

    const requests = [
      loadRequest('Telegram gateway status', fetchTelegramGatewayStatus, setTelegramStatus),
      loadRequest('Telegram broadcast history', (signal) => fetchTelegramGatewayHistory(1, 5, undefined, signal), (result) => {
        if (!Array.isArray(result.items)) throw new Error('The API returned an invalid response.');
        setRecentBroadcasts(result.items);
      }),
      loadRequest('Admin broadcast count', (signal) => fetchTelegramGatewayHistory(1, 1, undefined, signal), (result) => {
        if (!Number.isFinite(result.meta?.totalItems)) throw new Error('The API returned an invalid response.');
        setBroadcastCount(result.meta.totalItems);
      }),
      loadRequest('Failed broadcast count', (signal) => fetchTelegramGatewayHistory(1, 1, 'FAILED', signal), (result) => {
        if (!Number.isFinite(result.meta?.totalItems)) throw new Error('The API returned an invalid response.');
        setFailedCount(result.meta.totalItems);
      }),
      loadRequest('Council events', (signal) => fetchAllAdminEvents(signal), (events) => {
        if (!Array.isArray(events)) throw new Error('The API returned an invalid response.');
        const today = new Date().toISOString().slice(0, 10);
        setUpcomingEvents(
          events
            .filter((event) => event.status === 'Upcoming' && event.date >= today)
            .sort((left, right) => left.date.localeCompare(right.date))
        );
      }),
    ];
    void Promise.all(requests).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
      controllers.forEach((controller) => controller.abort());
    };
  }, [refreshVersion]);

  const metricValue = (value: number | null) => (value === null ? '—' : value.toLocaleString());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="blue">Dispatcher workspace</Badge>
            <Badge variant="amber">SMS disabled</Badge>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Communications overview
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Live Telegram broadcast records and scheduled council events. Counts come from the API; unavailable data is shown as unavailable, never estimated.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
            disabled={isLoading}
            onClick={() => setRefreshVersion((version) => version + 1)}
          >
            Refresh overview
          </Button>
          <Link to="/admin/gateway">
            <Button variant="primary" size="sm" icon={<Send className="h-4 w-4" />}>
              Open Telegram gateway
            </Button>
          </Link>
        </div>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            <CircleAlert className="h-4 w-4" /> Some live data could not be loaded
          </div>
          <ul className="list-inside list-disc space-y-1">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Telegram bot</span>
            <Radio className="h-5 w-5 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {telegramStatus
              ? telegramStatus.enabled ? 'Configured' : 'Not configured'
              : 'Unavailable'}
          </div>
          <div className="border-t border-stone-100 pt-2 text-xs text-stone-500 dark:border-stone-800">
            {telegramStatus?.channelId || 'Channel status unavailable'}
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Admin broadcasts recorded</span>
            <Send className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">{metricValue(broadcastCount)}</div>
          <div className="border-t border-stone-100 pt-2 text-xs text-stone-500 dark:border-stone-800">All recorded admin broadcasts</div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Failed posts</span>
            <CircleAlert className="h-5 w-5 text-rose-600" />
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">{metricValue(failedCount)}</div>
          <div className="border-t border-stone-100 pt-2 text-xs text-stone-500 dark:border-stone-800">Attempts needing review in gateway history</div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Upcoming council events</span>
            <CalendarDays className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-stone-900 dark:text-stone-100">{metricValue(upcomingEvents?.length ?? null)}</div>
          <div className="border-t border-stone-100 pt-2 text-xs text-stone-500 dark:border-stone-800">Scheduled events from the events API</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="space-y-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Recent Telegram broadcasts</h3>
              <p className="text-xs text-stone-500">Persistent records returned by the backend gateway.</p>
            </div>
            <Link to="/admin/gateway">
              <Button variant="outline" size="sm">View full history</Button>
            </Link>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-stone-500">Loading Telegram history…</p>
          ) : errors.some((error) => error.startsWith('Telegram broadcast history:')) ? (
            <p className="py-8 text-center text-sm text-stone-500">History is unavailable until the API request succeeds.</p>
          ) : recentBroadcasts.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-500">No Telegram broadcasts have been recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBroadcasts.map((broadcast) => (
                <article key={broadcast.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100">{broadcast.title}</h4>
                      <p className="mt-1 text-xs text-stone-500">
                        {broadcast.category.replace(/_/g, ' ')} · {broadcast.channelId} · {dateLabel(broadcast.sentAt || broadcast.createdAt)}
                      </p>
                    </div>
                    <Badge variant={broadcast.status === 'SENT' ? 'emerald' : broadcast.status === 'FAILED' ? 'rose' : 'amber'}>
                      {broadcast.status}
                    </Badge>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-stone-600 dark:text-stone-300">{broadcast.content}</p>
                  {broadcast.errorMessage && (
                    <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">Delivery error: {broadcast.errorMessage}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-stone-500" />
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">SMS gateway</h3>
            </div>
            <Badge variant="amber">Disabled — no provider credentials</Badge>
            <p className="text-sm text-stone-500">
              SMS and hybrid sends are not available. No balance, capacity, delivery rate, or SMS success is reported or simulated.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Scheduled events</h3>
              <Link to="/admin/events" className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
                Manage events
              </Link>
            </div>
            {isLoading ? (
              <p className="text-sm text-stone-500">Loading events…</p>
            ) : upcomingEvents === null ? (
              <p className="text-sm text-stone-500">Event data unavailable.</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-stone-500">There are no upcoming events in the system.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.slice(0, 4).map((event) => (
                  <li key={event.id} className="border-b border-stone-100 pb-3 last:border-0 last:pb-0 dark:border-stone-800">
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{event.title}</p>
                    <p className="mt-1 text-xs text-stone-500">{event.date} · {event.time} · {event.location}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
