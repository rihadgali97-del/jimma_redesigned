import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  Send,
  MessageSquare,
  QrCode,
  CheckCircle2,
  Users,
  Smartphone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  DollarSign,
  Globe,
  Bell,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const MediaBroadcastDashboard: React.FC = () => {
  const {
    messages,
    dispatchMessage,
    events,
    checkInAttendee,
    currentUser,
    addToast,
  } = useApp();

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Form states
  const [targetGroup, setTargetGroup] = useState('All Registered Jimma Residents (18,450)');
  const [msgChannel, setMsgChannel] = useState<'SMS_AND_TELEGRAM' | 'SMS_ONLY' | 'TELEGRAM_ONLY'>('SMS_AND_TELEGRAM');
  const [msgContent, setMsgContent] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  // Check in pass code
  const [scanPassCode, setScanPassCode] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('2500');

  const [telecomBalance, setTelecomBalance] = useState(14500);

  const totalDispatches = messages.length;
  const activeEvent = events[0] || {
    id: 'evt-1',
    title: 'Annual Jimma Islamic Heritage & Hifz Graduation Ceremony',
    registeredCount: 420,
    checkedInCount: 185,
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) {
      addToast('Empty Message', 'Please enter announcement content.', 'error');
      return;
    }

    setIsDispatching(true);
    try {
      await dispatchMessage({
        type: 'Public_Announcement',
        recipientGroup: targetGroup,
        channel: msgChannel,
        messageContent: msgContent,
        authorName: currentUser.name,
      });

      addToast(
        'Mass Broadcast Dispatched',
        `Transmitted to ${targetGroup} via ${msgChannel}. Delivery rate 99.8%.`,
        'success'
      );
      setTelecomBalance((prev) => Math.max(0, prev - 180));
      setIsBroadcastModalOpen(false);
      setMsgContent('');
    } catch (err) {
      addToast('Dispatch Error', 'Failed to dispatch broadcast.', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleManualCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanPassCode.trim()) return;

    addToast(
      'Gate Pass Verified & Checked In',
      `Attendee with Pass #${scanPassCode.toUpperCase()} admitted to ${activeEvent.title}.`,
      'success'
    );
    setIsCheckInModalOpen(false);
    setScanPassCode('');
  };

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount) || 0;
    setTelecomBalance((prev) => prev + amt);
    addToast(
      'SMS Pool Topped Up',
      `Added ${amt.toLocaleString()} ETB via Telebirr Merchant Gateway.`,
      'success'
    );
    setIsTopUpModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue">IT & Communications Directorate</Badge>
            <span className="text-xs text-stone-400 font-mono">Telecom & Media Hub</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            SMS Gateway, Telegram & Media Communications
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Manage Ethio Telecom mass SMS dispatch, live Telegram channel feeds, QR gate admissions, and public media releases.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsTopUpModalOpen(true)}
          >
            Top-up SMS (ETB {telecomBalance.toLocaleString()})
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<QrCode className="w-4 h-4 text-purple-600" />}
            onClick={() => setIsCheckInModalOpen(true)}
          >
            Gate Pass Check-in
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Radio className="w-4 h-4" />}
            onClick={() => setIsBroadcastModalOpen(true)}
          >
            Compose Mass Broadcast
          </Button>
        </div>
      </div>

      {/* 4 Core Telecom & Media Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Ethio Telecom Credit
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            ETB {telecomBalance.toLocaleString()}
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>~41,500 SMS capacity</span>
            <Badge variant="emerald">Active</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Dispatches Sent (MTD)
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {totalDispatches + 64} <span className="text-sm font-sans font-normal text-stone-500">campaigns</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Delivery Rate: 99.4%</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Telegram Subscribers
            </span>
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-700">
              <Radio className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-sky-700 dark:text-sky-400 font-mono">
            16,240 <span className="text-sm font-sans font-normal text-stone-500">users</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>@JimmaIslamicCouncil</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Active Event Admittance
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 font-mono">
            {activeEvent.checkedInCount || 185} / {activeEvent.registeredCount || 420}
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Live Gate Check-in</span>
            <Badge variant="purple">Open</Badge>
          </div>
        </Card>
      </div>

      {/* Main Row: Gateway Queue & Event QR Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Gateway Live Dispatch Log */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Recent Gateway Broadcast Logs</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Full multi-channel SMS & Telegram delivery telemetry.
                </p>
              </div>
              <Link to="/admin/gateway">
                <Button variant="ghost" size="sm" className="text-xs">
                  Full Gateway Terminal
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 uppercase">
                        {msg.type} • {msg.channel}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                        {msg.recipientGroup}
                      </h4>
                    </div>
                    <Badge variant={msg.status === 'Delivered' ? 'emerald' : 'gold'}>
                      {msg.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 font-mono text-[11px] leading-relaxed">
                    "{msg.messageContent}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700">
                    <span>Sender: {msg.authorName || 'Media Directorate'}</span>
                    <span>{new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 5 cols: Event Gate Admission & Quick Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Gate QR Scanner Simulation */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <span>Live Event Gate Admission</span>
              </h3>
              <Badge variant="emerald">Gate 1 & 2</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3 text-xs">
              <div className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                {activeEvent.title}
              </div>
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Admitted Guests:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400">
                  {activeEvent.checkedInCount} / {activeEvent.registeredCount} (44%)
                </span>
              </div>
              <div className="w-full h-2 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${Math.round(((activeEvent.checkedInCount || 185) / (activeEvent.registeredCount || 420)) * 100)}%` }}
                />
              </div>

              <Button
                variant="purple"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => setIsCheckInModalOpen(true)}
              >
                Scan / Enter Attendee Pass
              </Button>
            </div>

            <Link to="/events" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                Manage All Public Events
              </Button>
            </Link>
          </Card>

          {/* Social Channels Monitor */}
          <div className="p-5 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Media Channels & Web Portal
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-800">
                <span>Official Web Portal</span>
                <Badge variant="emerald">Online 99.9%</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-800">
                <span>Telegram Bot (@JimmaCouncilBot)</span>
                <Badge variant="emerald">Connected</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Ethio Telecom SMPP Bind</span>
                <Badge variant="emerald">SMPP Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Compose Mass Broadcast
                </h3>
                <p className="text-stone-500">Dispatch SMS & Telegram bulletin</p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Target Audience
                </label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="All Registered Jimma Residents (18,450)">All Registered Jimma Residents (18,450)</option>
                  <option value="All Imams & Khateebs (180)">All Imams & Khateebs (180)</option>
                  <option value="Tahfeez Parents Roster (1,240)">Tahfeez Parents Roster (1,240)</option>
                  <option value="Madrasa Administrators (42)">Madrasa Administrators (42)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Delivery Channel
                </label>
                <select
                  value={msgChannel}
                  onChange={(e) => setMsgChannel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="SMS_AND_TELEGRAM">SMS + Telegram (Dual Channel)</option>
                  <option value="SMS_ONLY">SMS Only (Ethio Telecom)</option>
                  <option value="TELEGRAM_ONLY">Telegram Channel Only</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Announcement Text ({msgContent.length}/160 chars)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. [JIMMA ISLAMIC COUNCIL] The Moonsighting Committee announces that Eid prayers will be held tomorrow at 07:30 AM at Jimma Stadium..."
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsBroadcastModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isDispatching}>
                  {isDispatching ? 'Transmitting...' : 'Dispatch Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check In Modal */}
      {isCheckInModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Gate QR / Code Check-in
                </h3>
                <p className="text-stone-500">Verify attendee registration badge</p>
              </div>
              <button
                onClick={() => setIsCheckInModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Registration Pass Code / Badge #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REG-2026-042"
                  value={scanPassCode}
                  onChange={(e) => setScanPassCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono uppercase font-bold text-purple-700 text-center text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCheckInModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="purple" size="sm" type="submit">
                  Verify & Admit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Top-up SMS Credit Balance
                </h3>
                <p className="text-stone-500">Ethio Telecom Bulk SMS API</p>
              </div>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUp} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Top-up Amount (ETB)
                </label>
                <input
                  type="number"
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Payment Source
                </label>
                <select className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800">
                  <option>Telebirr Merchant Pool #88490</option>
                  <option>Commercial Bank of Ethiopia (CBE)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsTopUpModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm Top-up
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
