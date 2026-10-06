import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  BellRing,
  Mail,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Sliders,
  ShieldCheck,
  Smartphone,
  Globe,
  Trash2,
  Info,
  Calendar,
  Send,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EventNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEventId?: string;
}

export const EventNotificationModal: React.FC<EventNotificationModalProps> = ({
  isOpen,
  onClose,
  preselectedEventId,
}) => {
  const {
    events,
    eventSubscriptions,
    saveEventSubscription,
    removeEventSubscription,
    addToast,
  } = useApp();

  const primarySub = eventSubscriptions[0];

  const [email, setEmail] = useState(primarySub?.email || '');
  const [name, setName] = useState(primarySub?.name || '');
  const [enableEmail, setEnableEmail] = useState(primarySub ? primarySub.enableEmail : true);
  const [enableBrowser, setEnableBrowser] = useState(primarySub ? primarySub.enableBrowser : false);
  const [enableAnnouncements, setEnableAnnouncements] = useState(primarySub?.enableAnnouncements || false);
  const [selectedTiming, setSelectedTiming] = useState<'instant' | '24h_before' | '48h_before' | 'weekly_digest'>(
    primarySub?.reminderTiming || '24h_before'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    primarySub?.categories || ['All']
  );
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(
    primarySub?.districts || ['All']
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Available options
  const categoryOptions = [
    'All',
    'Quran Competition',
    'Ulema Conference',
    'Youth Workshop',
    'Lecture',
    'Ramadan Program',
    'Community Gathering',
  ];

  const districtOptions = [
    'All',
    'Jimma Central',
    'Bosa Kito',
    'Hermata',
    'Agaro Town',
    'Seka Chekorsa',
    'Mana',
    'Gomma',
    'Kersa',
  ];

  // Check browser notification permission on mount
  useEffect(() => {
    if (isOpen && primarySub) {
      setEmail(primarySub.email || '');
      setName(primarySub.name || '');
      setEnableEmail(primarySub.enableEmail);
      setEnableBrowser(primarySub.enableBrowser);
      setEnableAnnouncements(primarySub.enableAnnouncements || false);
      setSelectedTiming(primarySub.reminderTiming);
      setSelectedCategories(primarySub.categories);
      setSelectedDistricts(primarySub.districts);
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setEnableBrowser(true);
      }
    } else {
      setBrowserPermission('unsupported');
    }
  }, [isOpen, primarySub]);

  if (!isOpen) return null;

  const targetEvent = preselectedEventId ? events.find((e) => e.id === preselectedEventId) : null;

  const handleToggleCategory = (cat: string) => {
    if (cat === 'All') {
      setSelectedCategories(['All']);
      return;
    }
    const withoutAll = selectedCategories.filter((c) => c !== 'All');
    if (withoutAll.includes(cat)) {
      const remaining = withoutAll.filter((c) => c !== cat);
      setSelectedCategories(remaining.length === 0 ? ['All'] : remaining);
    } else {
      setSelectedCategories([...withoutAll, cat]);
    }
  };

  const handleToggleDistrict = (dist: string) => {
    if (dist === 'All') {
      setSelectedDistricts(['All']);
      return;
    }
    const withoutAll = selectedDistricts.filter((d) => d !== 'All');
    if (withoutAll.includes(dist)) {
      const remaining = withoutAll.filter((d) => d !== dist);
      setSelectedDistricts(remaining.length === 0 ? ['All'] : remaining);
    } else {
      setSelectedDistricts([...withoutAll, dist]);
    }
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Not Supported', 'Browser notifications are not supported in this environment.', 'error');
      return;
    }

    setIsRequestingPermission(true);
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        setEnableBrowser(true);
        addToast(
          'Browser Notifications Enabled! 🔔',
          'You will now receive native desktop/device notifications for upcoming events.',
          'success'
        );
        // Dispatch instant preview notification
        try {
          new Notification('Jimma Islamic Council • Notifications Active', {
            body: 'Barakallahu Feekum! You will receive timely reminders for upcoming community events and conferences.',
            icon: '/favicon.ico',
          });
        } catch {
          // ignore fallback
        }
      } else if (perm === 'denied') {
        setEnableBrowser(false);
        addToast(
          'Permission Denied',
          'Browser alerts were blocked. You can re-enable them in your browser site permissions.',
          'info'
        );
      }
    } catch {
      // In restricted iframe environments, requestPermission might reject
      addToast(
        'Alert Permission Note',
        'If running in an embedded preview, click in a standalone tab to grant native permissions.',
        'info'
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleSendTestAlert = () => {
    const title = '📢 Test Event Alert • Jimma Islamic Council';
    const body = 'Annual Jimma Tahfeez Quran Championship begins in 48 hours at Grand Anwar Mosque! Gates open at 8:00 AM.';

    if (browserPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // fallback
      }
    }

    addToast(
      'Test preview shown',
      browserPermission === 'granted'
        ? 'A local browser preview was triggered. This does not test email, remote push, or Telegram delivery.'
        : 'No external notification was sent. This does not test email, remote push, or Telegram delivery.',
      'info'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enableEmail && !email.trim()) {
      addToast('Email Required', 'Please provide a valid email address to receive email alerts.', 'error');
      return;
    }

    if (!enableEmail && !enableBrowser && !enableAnnouncements) {
      addToast('Select at least one preference', 'Please enable at least one event or announcement notification preference.', 'error');
      return;
    }
    if (enableAnnouncements && !enableEmail) {
      addToast('Email is required', 'Enable Email Alerts to receive urgent announcement messages.', 'error');
      return;
    }

    setIsSaving(true);
    const specificEventIds = [...(primarySub?.specificEventIds || [])];
    if (preselectedEventId && !specificEventIds.includes(preselectedEventId)) {
      specificEventIds.push(preselectedEventId);
    }

    try {
      await saveEventSubscription({
        email: email.trim(),
        name: name.trim() || 'Community Member',
        enableEmail,
        enableBrowser,
        enableAnnouncements,
        categories: selectedCategories,
        districts: selectedDistricts,
        reminderTiming: selectedTiming,
        specificEventIds,
      });
      onClose();
    } catch (error) {
      addToast('Could not save notification preferences', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white p-6 sm:p-7 border-b border-amber-500/20">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Civic Awareness Service
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Preference Center
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">
                Event & Tahfeez Notification Center
              </h2>
            </div>
          </div>

          <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Receive automated notifications for upcoming scholar symposia, annual Quran Tahfeez championships, youth workshops, and Ramadan community gatherings across Jimma Zone.
          </p>

          {targetEvent && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] text-amber-300 font-semibold block truncate">
                  Specific Reminder For:
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {targetEvent.title} ({targetEvent.date})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Notification Channels Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              1. Choose Notification Channels
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Channel 1: Email */}
              <div
                onClick={() => setEnableEmail(!enableEmail)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  enableEmail
                    ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Email Alerts
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Email delivery requires a verified address and configured server credentials
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEmail}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-1 cursor-pointer"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px] text-stone-500">
                  <span>Delivery status</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Provider pending</span>
                </div>
              </div>

              {/* Channel 2: Browser Web Push */}
              <div
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  enableBrowser
                    ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Browser Push Alerts
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Remote delivery requires browser support and configured server VAPID keys
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableBrowser}
                    onChange={(e) => {
                      if (e.target.checked && browserPermission !== 'granted') {
                        handleRequestBrowserPermission();
                      } else {
                        setEnableBrowser(e.target.checked);
                      }
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Device status:</span>
                  {browserPermission === 'granted' ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Permission Granted
                    </span>
                  ) : browserPermission === 'denied' ? (
                    <span className="text-rose-500 font-semibold">Blocked in Browser</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestBrowserPermission}
                      disabled={isRequestingPermission}
                      className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                    >
                      {isRequestingPermission ? 'Requesting...' : 'Click to Enable'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Email Input Fields if Email is Enabled */}
          {enableEmail && (
            <div className="space-y-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Your Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ustaz Abdulkarim"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required={enableEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 text-xs">
            <input
              type="checkbox"
              checked={enableAnnouncements}
              disabled={!enableEmail}
              onChange={(e) => setEnableAnnouncements(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span>
              <span className="block font-semibold text-stone-800 dark:text-stone-200">Urgent council announcements</span>
              <span className="mt-1 block text-stone-500 dark:text-stone-400">
                Receive urgent published announcements by email. Enable Email Alerts to choose this preference.
              </span>
            </span>
          </label>

          {/* Timing / Frequency Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              2. Notification Timing & Schedule
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '24h_before' as const, label: '24 Hours Prior', sub: 'Standard Reminder' },
                { id: '48h_before' as const, label: '48 Hours Prior', sub: 'Early Notice' },
                { id: 'instant' as const, label: 'Instant Notice', sub: 'On Publication' },
                { id: 'weekly_digest' as const, label: 'Weekly Digest', sub: 'Friday Mornings' },
              ].map((timing) => (
                <button
                  type="button"
                  key={timing.id}
                  onClick={() => setSelectedTiming(timing.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedTiming === timing.id
                      ? 'bg-amber-500 text-stone-950 border-amber-600 font-semibold shadow-xs'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500/40'
                  }`}
                >
                  <p className="text-xs font-bold">{timing.label}</p>
                  <p className={`text-[10px] ${selectedTiming === timing.id ? 'text-stone-900' : 'text-stone-500'}`}>
                    {timing.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                3. Event Categories of Interest
              </label>
              <button
                type="button"
                onClick={() => setSelectedCategories(['All'])}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categoryOptions.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline-block mr-1 -mt-0.5" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                4. Preferred Districts / Woredas
              </label>
              <button
                type="button"
                onClick={() => setSelectedDistricts(['All'])}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                All 18 Woredas
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {districtOptions.map((dist) => {
                const isSelected = selectedDistricts.includes(dist);
                return (
                  <button
                    type="button"
                    key={dist}
                    onClick={() => handleToggleDistrict(dist)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {dist === 'All' ? 'All Districts' : dist}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Subscription Status & Unsubscribe Option */}
          {primarySub && (
            <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Active subscription registered on <strong>{primarySub.subscribedAt}</strong>
                  {primarySub.email ? ` for ${primarySub.email}` : ''}
                  {primarySub.enableEmail && !primarySub.emailVerified ? ' • email verification pending' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeEventSubscription(primarySub.id)}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 font-semibold text-xs shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Unsubscribe
              </button>
            </div>
          )}

          {/* Council Integrity / Anti-Spam Guarantee */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/30 text-[11px] text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Zero-Spam Civic Commitment:</strong> Your email and device endpoints are strictly used for verified Jimma Zone Islamic Affairs Supreme Council programs and community announcements. You may change or withdraw preferences anytime.
            </span>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendTestAlert}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-amber-500" />
              Send Test Notification
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                size="sm"
                disabled={isSaving}
                icon={<Bell className="w-4 h-4" />}
                className="text-xs font-bold"
              >
                {isSaving ? 'Saving...' : 'Save Subscription Preferences'}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
