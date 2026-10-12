import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageChannel, MessageCategory, Student, Mosque } from '../../types';
import { gatewayTemplates, MessageTemplate } from '../../data/mockGatewayData';
import {
  Send,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Radio,
  Clock,
  Layers,
  FileText,
  User,
  Building,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PhoneSimulatorPreview } from './PhoneSimulatorPreview';
import {
  sendTelegramGatewayMessage,
  TelegramGatewayStatus,
} from '../../services/notificationsApi';

interface SmsTelegramComposerProps {
  initialCategory?: MessageCategory;
  initialStudentId?: string;
  initialMosqueId?: string;
  onSuccess?: () => void;
  telegramOnly: true;
  telegramStatus?: TelegramGatewayStatus | null;
  telegramStatusError?: string | null;
}

export const SmsTelegramComposer: React.FC<SmsTelegramComposerProps> = ({
  initialCategory = 'general_bulletin',
  initialStudentId,
  initialMosqueId,
  telegramOnly,
  telegramStatus = null,
  telegramStatusError = null,
  onSuccess,
}) => {
  const { students, mosques, addToast } = useApp();

  // State
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>(
    telegramOnly ? 'general_bulletin' : initialCategory
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    gatewayTemplates.find((template) => template.category === (telegramOnly ? 'general_bulletin' : initialCategory))?.id || ''
  );
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('telegram');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'om' | 'ar'>('om');
  const [senderId, setSenderId] = useState('JIMMA-ISLAM');

  // Dynamic Context Objects
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || 'student-1'
  );
  const [selectedMosqueId, setSelectedMosqueId] = useState<string>(
    initialMosqueId || mosques[0]?.id || 'mosque-1'
  );

  // Form Fields for different categories
  const [deceasedName, setDeceasedName] = useState('');
  const [deceasedAge, setDeceasedAge] = useState('');
  const [janazahTime, setJanazahTime] = useState('');
  const [cemeteryName, setCemeteryName] = useState('');

  const [khutbahTheme, setKhutbahTheme] = useState('');
  const [moonOccasion, setMoonOccasion] = useState('');
  const [eidLocation, setEidLocation] = useState('');

  // Recipient Target
  const [recipientTarget, setRecipientTarget] = useState('Configured Telegram channel');
  const [recipientCount, setRecipientCount] = useState<number>(1);

  // Message body
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  const [isDispatching, setIsDispatching] = useState(false);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const activeMosque = mosques.find((m) => m.id === selectedMosqueId) || mosques[0];

  // Load and populate template based on category & language
  const applyTemplate = (category: MessageCategory, lang: 'en' | 'om' | 'ar') => {
    const template = gatewayTemplates.find((t) => t.id === selectedTemplateId && t.category === category)
      || gatewayTemplates.find((t) => t.category === category);
    setSelectedChannel(telegramOnly ? 'telegram' : template?.defaultChannel || 'telegram');

    let raw = template?.languages[lang] || '';

    if (category === 'sabaq_alert') {
      raw = raw
        .replace(/{MadrasaName}/g, '[madrasa name]')
        .replace(/{ParentName}/g, '[guardian name]')
        .replace(/{StudentName}/g, '[student name]')
        .replace(/{SabaqLesson}/g, '[sabaq lesson]')
        .replace(/{SabqiJuz}/g, '[sabqi progress]')
        .replace(/{ManzilJuz}/g, '[manzil progress]')
        .replace(/{TajweedRating}/g, '[tajweed rating]')
        .replace(/{AttendanceStatus}/g, '[attendance status]')
        .replace(/{TeacherPhone}/g, '[teacher contact]')
        .replace(/{Date}/g, '[date]');

      setSenderId('HIFZ-ACADEMY');
      setMessageTitle('Student progress / attendance template');
      setRecipientTarget('Private guardian message — SMS unavailable');
      setRecipientCount(1);
    } else if (category === 'janazah_broadcast') {
      raw = raw
        .replace(/{DeceasedName}/g, deceasedName || '[deceased name]')
        .replace(/{Age}/g, deceasedAge || '[age]')
        .replace(/{Kebele}/g, activeMosque?.district || '[district]')
        .replace(/{Woreda}/g, activeMosque?.district || '[district]')
        .replace(/{JanazahTime}/g, janazahTime || '[prayer time]')
        .replace(/{MosqueName}/g, activeMosque?.name || '[mosque name]')
        .replace(/{Cemetery}/g, cemeteryName || '[burial location]')
        .replace(/{FamilyContact}/g, '');

      setSenderId('JIMMA-ISLAM');
      setMessageTitle(deceasedName ? `Emergency Janazah: ${deceasedName}` : 'Emergency Janazah Announcement');
      setRecipientTarget(telegramStatus?.channelId || 'Configured Telegram channel');
      setRecipientCount(1);
    } else if (category === 'moon_sighting') {
      raw = raw
        .replace(/{Occasion}/g, moonOccasion || '[occasion]')
        .replace(/{HijriDate}/g, '[Hijri date]')
        .replace(/{Location}/g, eidLocation || '[location]')
        .replace(/{PrayerTime}/g, '[prayer time]')
        .replace(/{ImamKhateeb}/g, '[imam / khateeb]')
        .replace(/{CouncilMessage}/g, '[council message]');

      setSenderId('JIMMA-ISLAM');
      setMessageTitle(moonOccasion ? `Moon Sighting Communique: ${moonOccasion}` : 'Moon Sighting / Eid Announcement');
      setRecipientTarget(telegramStatus?.channelId || 'Configured Telegram channel');
      setRecipientCount(1);
    } else if (category === 'khutbah_advisory') {
      raw = raw
        .replace(/{Date}/g, '[date]')
        .replace(/{KhutbahTheme}/g, khutbahTheme || '[khutbah theme]')
        .replace(/{KeyFocus}/g, '[key focus]')
        .replace(/{Directives}/g, '[community guidance]')
        .replace(/{CouncilMessage}/g, '[council message]');

      setSenderId('JIMMA-ISLAM');
      setMessageTitle(khutbahTheme ? `Unified Khutbah: ${khutbahTheme.slice(0, 30)}` : 'Unified Khutbah Advisory');
      setRecipientTarget(telegramStatus?.channelId || 'Configured Telegram channel');
      setRecipientCount(1);
    } else {
      setMessageTitle('Official Council Announcement');
      setRecipientTarget('Custom Recipient List');
      setRecipientCount(1);
    }

    if (telegramOnly && category !== 'sabaq_alert') {
      setRecipientTarget(telegramStatus?.channelId || 'Channel unavailable');
      setRecipientCount(1);
    }
    setMessageContent(raw);
  };

  // Keep the selected template populated from current form values.
  useEffect(() => {
    applyTemplate(selectedCategory, selectedLanguage);
  }, [
    selectedCategory,
    selectedTemplateId,
    selectedLanguage,
    selectedStudentId,
    selectedMosqueId,
    deceasedName,
    deceasedAge,
    janazahTime,
    cemeteryName,
    khutbahTheme,
    moonOccasion,
    eidLocation,
    telegramStatus?.channelId,
  ]);

  // Handle Dispatch Action with realistic stage simulation
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory === 'sabaq_alert') {
      addToast(
        'Private guardian messages unavailable',
        'Telegram sends to a public channel. SMS is disabled, so guardian-specific student reports cannot be sent.',
        'warning'
      );
      return;
    }
    if (!messageContent.trim()) {
      addToast('Cannot Send Empty Message', 'Please enter message content first.', 'warning');
      return;
    }

    if (telegramOnly) {
      if (!telegramStatus?.enabled) {
        addToast(
          'Telegram Gateway Unavailable',
          telegramStatusError || 'Configure the Telegram bot token in the backend environment before sending.',
          'warning'
        );
        return;
      }
      if (!window.confirm(`Post this message publicly to ${telegramStatus.channelId}?`)) return;

      setIsDispatching(true);
      try {
        const result = await sendTelegramGatewayMessage(
          messageTitle || 'Jimma ICS announcement',
          messageContent,
          selectedCategory
        );
        addToast(
          'Telegram post accepted',
          `Telegram accepted this post for ${result.channelId}. Message ID: ${result.messageId}.`,
          'success'
        );
        onSuccess?.();
      } catch (error) {
        addToast(
          'Telegram Message Failed',
          error instanceof Error ? error.message : 'The Telegram message could not be sent.',
          'error'
        );
      } finally {
        setIsDispatching(false);
      }
      return;
    }

    addToast('SMS dispatch unavailable', 'Only real Telegram channel posts are enabled.', 'warning');
  };

  return (
    <div className="space-y-6">
      {/* Category Preset Selector */}
      <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Automated Dispatch Protocol
            </span>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              {telegramOnly ? 'Compose a Telegram Channel Broadcast' : 'Select Communication Scenario & Audience'}
            </h3>
            {telegramOnly && (
              <p className="text-xs text-stone-500 mt-1">
                Messages post publicly to {telegramStatus?.channelId || 'the configured Telegram channel'}. SMS is disabled; student-specific guardian alerts are not sent here.
              </p>
            )}
          </div>

          {/* Language Switcher for templates */}
          <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <Globe2 className="w-3.5 h-3.5 text-stone-400 ml-1.5" />
            {(['om', 'en', 'ar'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLanguage === lang
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {lang === 'om' ? 'Afaan Oromoo' : lang === 'en' ? 'English' : 'العربية'}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Scenario Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            {
              id: 'sabaq_alert' as MessageCategory,
              label: 'Student Sabaq & Attendance',
              desc: 'Private guardian reports unavailable without SMS',
              icon: <User className="w-4 h-4 text-emerald-600" />,
            },
            {
              id: 'janazah_broadcast' as MessageCategory,
              label: 'Emergency Janazah',
              desc: 'Public Telegram post; verify details before sending',
              icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
            },
            {
              id: 'moon_sighting' as MessageCategory,
              label: 'Moon Sighting / Eid',
              desc: 'Compose manually and verify all facts before sending',
              icon: <Sparkles className="w-4 h-4 text-amber-600" />,
            },
            {
              id: 'khutbah_advisory' as MessageCategory,
              label: 'Friday Khutbah Guidance',
              desc: 'Compose manually and verify all facts before sending',
              icon: <FileText className="w-4 h-4 text-blue-600" />,
            },
            {
              id: 'general_bulletin' as MessageCategory,
              label: 'Custom Direct Dispatch',
              desc: 'Compose an announcement for the configured public channel',
              icon: <Zap className="w-4 h-4 text-purple-600" />,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedTemplateId(gatewayTemplates.find((template) => template.category === cat.id)?.id || '');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between disabled:opacity-40 disabled:cursor-not-allowed ${
                selectedCategory === cat.id
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs'
                  : 'border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  {cat.icon}
                </div>

                {selectedCategory === cat.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="mt-2">
                <div className="font-serif font-bold text-xs text-stone-900 dark:text-stone-100">
                  {cat.label}
                </div>
                <div className="text-[10px] text-stone-500 line-clamp-2 mt-0.5">
                  {telegramOnly
                    ? cat.id === 'sabaq_alert'
                      ? 'Template preview only; private guardian messages cannot be posted publicly'
                      : 'Public post to the configured Telegram channel'
                    : cat.desc}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="max-w-xl">
          <label htmlFor="gateway-message-template" className="mb-1 block text-xs font-semibold text-stone-700 dark:text-stone-300">
            Message template
          </label>
          <select
            id="gateway-message-template"
            value={selectedTemplateId}
            onChange={(event) => {
              const template = gatewayTemplates.find((item) => item.id === event.target.value);
              if (!template) return;
              setSelectedTemplateId(template.id);
              setSelectedCategory(template.category);
            }}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs dark:border-stone-700 dark:bg-stone-800"
          >
            <option value="">Choose a message template</option>
            {gatewayTemplates.map((template) => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Composer Layout: Form Editor on Left + Phone Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dispatch Controls & Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleDispatch} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
            {/* Channel Switcher */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
                Transmission Route & Gateway Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'telegram' as MessageChannel,
                    label: 'Telegram Bot API',
                    sub: `Channel: ${telegramStatus?.channelId || 'Unavailable'}`,
                    badge: telegramStatus?.enabled ? 'Ready' : 'Not configured',
                  },
                  {
                    id: 'sms' as MessageChannel,
                    label: 'SMS (disabled)',
                    sub: 'Gateway credentials unavailable',
                    badge: 'Unavailable',
                  },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    disabled={ch.id !== 'telegram'}
                    className={`p-3 rounded-xl border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedChannel === ch.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold block">{ch.label}</span>
                      {selectedChannel === ch.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] text-stone-500 block mt-0.5">{ch.sub}</span>
                    <span className="text-[10px] font-semibold text-stone-500">{ch.badge}</span>
                  </button>
                ))}
              </div>
            </div>
            {telegramStatusError && (
                <p role="alert" className="mt-2 text-xs text-rose-600">{telegramStatusError}</p>
            )}

            {/* Dynamic Scenario Form Inputs */}
            {telegramOnly && selectedCategory === 'sabaq_alert' && (
              <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                This private-message template is available to edit or copy, but cannot be sent through the public Telegram channel. SMS is disabled.
              </div>
            )}
            {selectedCategory === 'sabaq_alert' && !telegramOnly && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Target Student & Guardian Profile
                  </span>
                  <Badge variant="emerald">Auto-Synchronized</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Choose Student
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    >
                      {students.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.madrasaName.split(' ')[0]} - {st.quranJuzCompleted} Juz)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Guardian Phone (EthioTel)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={activeStudent?.parentPhone || activeStudent?.guardianPhone || '+251 91 190 2831'}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 font-mono text-stone-600 dark:text-stone-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-white/80 dark:bg-stone-900/80 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Sabaq</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                      {activeStudent?.hifzStatus?.sabaq || activeStudent?.sabaqSurah || 'Surah Maryam 1-40'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Tajweed</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">
                      {activeStudent?.tajweedRating || 'Excellent'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[9px] uppercase font-bold">Attendance</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                      {activeStudent?.dailyAttendance || 'Present'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'janazah_broadcast' && (
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Janazah Emergency Parameters
                  </span>
                  <Badge variant="amber">High Priority</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Deceased Full Name *
                    </label>
                    <input
                      type="text"
                      value={deceasedName}
                      onChange={(e) => {
                        setDeceasedName(e.target.value);
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Prayer Mosque / Venue *
                    </label>
                    <select
                      value={selectedMosqueId}
                      onChange={(e) => setSelectedMosqueId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    >
                      {mosques.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Janazah Prayer Timing *
                    </label>
                    <input
                      type="text"
                      value={janazahTime}
                      onChange={(e) => setJanazahTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Burial Ground (Qabroofata) *
                    </label>
                    <input
                      type="text"
                      value={cemeteryName}
                      onChange={(e) => setCemeteryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message Title & Sender ID */}
            <div className={`grid grid-cols-1 ${telegramOnly ? '' : 'sm:grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {telegramOnly ? 'Telegram Post Title' : 'Campaign Title / Internal Ref'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={180}
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>

              {!telegramOnly && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Alphanumeric Sender ID
                  </label>
                  <select
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                  >
                    <option value="JIMMA-ISLAM">JIMMA-ISLAM (Ethio Telecom Shortcode)</option>
                    <option value="HIFZ-ACADEMY">HIFZ-ACADEMY (Madrasa Direct)</option>
                    <option value="telegram">Configured Telegram bot</option>
                    <option value="ETH-MAJILIS">ETH-MAJILIS (National Integration)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Message Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Message Body (Live Payload)
                </label>
                <button
                  type="button"
                  onClick={() => applyTemplate(selectedCategory, selectedLanguage)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Template
                </button>
              </div>
              <textarea
                rows={6}
                required
                maxLength={3600}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono focus:outline-emerald-600 leading-relaxed"
                placeholder="Compose announcement..."
              />
            </div>

            {/* Recipient Audience Summary */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-stone-500 block text-[10px] uppercase font-bold">
                  {telegramOnly ? 'Public Channel' : 'Targeted Audience'}
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{recipientTarget}</span>
              </div>
              <Badge variant="blue">
                {telegramOnly ? 'One channel post' : `${recipientCount.toLocaleString()} Recipient${recipientCount === 1 ? '' : 's'}`}
              </Badge>
            </div>

            {/* Dispatch Action Button */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="primary"
                type="submit"
                size="md"
                disabled={isDispatching || (telegramOnly && (!telegramStatus?.enabled || selectedCategory === 'sabaq_alert'))}
                icon={isDispatching ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {isDispatching
                  ? 'Sending to Telegram...'
                  : telegramOnly
                    ? selectedCategory === 'sabaq_alert'
                      ? 'Private template cannot be sent'
                      : 'Send Telegram Broadcast'
                    : `Dispatch to ${recipientCount.toLocaleString()} Endpoint(s)`}
              </Button>
            </div>
          </form>

          {/* Show the real request's pending state; Telegram history records the final API result. */}
          {isDispatching && (
            <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl border border-emerald-700 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="flex items-center gap-2 text-xs font-bold text-amber-300" role="status">
                <Radio className="w-4 h-4 animate-pulse" />
                Sending to Telegram and waiting for the Bot API response...
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Phone Simulator (5 Cols) */}
        <div className="lg:col-span-5">
          <PhoneSimulatorPreview
            key={telegramOnly ? messageContent : undefined}
            channel={selectedChannel}
            title={messageTitle}
            senderId={senderId}
            recipientTarget={recipientTarget}
            content={messageContent}
            category={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
};
