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
  telegramOnly?: boolean;
  telegramStatus?: TelegramGatewayStatus | null;
  telegramStatusError?: string | null;
}

export const SmsTelegramComposer: React.FC<SmsTelegramComposerProps> = ({
  initialCategory = 'sabaq_alert',
  initialStudentId,
  initialMosqueId,
  telegramOnly = false,
  telegramStatus = null,
  telegramStatusError = null,
  onSuccess,
}) => {
  const { students, mosques, dispatchMessage, addToast, gatewayStats } = useApp();

  // State
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>(
    telegramOnly ? 'general_bulletin' : initialCategory
  );
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>(
    telegramOnly ? 'telegram' : 'hybrid'
  );
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
  const [deceasedName, setDeceasedName] = useState('Haji Oumer Kedir Ababor');
  const [deceasedAge, setDeceasedAge] = useState('84');
  const [janazahTime, setJanazahTime] = useState('Today after Salatul Asr (4:15 PM)');
  const [cemeteryName, setCemeteryName] = useState('Hermata Muslim Public Cemetery');
  const [familyContact, setFamilyContact] = useState('+251 91 190 4421');

  const [khutbahTheme, setKhutbahTheme] = useState(
    'Preserving Waqf Endowments & Supporting Rural Quranic Madrasas'
  );
  const [moonOccasion, setMoonOccasion] = useState('Shawwal 1447 AH (Eid-ul-Fitr)');
  const [eidLocation, setEidLocation] = useState('Jimma City Central Stadium & Eid Gah Grounds');

  // Recipient Target
  const [recipientTarget, setRecipientTarget] = useState('Parent: Haji Mohammed Abafita (+251 91 190 2831)');
  const [recipientCount, setRecipientCount] = useState<number>(1);

  // Message body
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Dispatch Animation Simulation
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStage, setDispatchStage] = useState<number>(0);

  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const activeMosque = mosques.find((m) => m.id === selectedMosqueId) || mosques[0];

  // Load and populate template based on category & language
  const applyTemplate = (category: MessageCategory, lang: 'en' | 'om' | 'ar') => {
    let template = gatewayTemplates.find((t) => t.category === category);
    if (!template) template = gatewayTemplates[0];

    setSelectedChannel(telegramOnly ? 'telegram' : template.defaultChannel);

    let raw = template.languages[lang];

    if (category === 'sabaq_alert' && activeStudent) {
      const sabaqText = activeStudent.hifzStatus?.sabaq || activeStudent.sabaqSurah || 'Surah Maryam: 1-40';
      const sabqiText = activeStudent.hifzStatus?.sabqi || (activeStudent.sabaqiJuz ? `Juz ${activeStudent.sabaqiJuz}` : 'Juz 18');
      const manzilText = activeStudent.hifzStatus?.manzil || activeStudent.manzilJuz || 'Juz 1 to 10';
      const parent = activeStudent.parentName || activeStudent.guardianName || 'Guardian';
      const parentPhone = activeStudent.parentPhone || activeStudent.guardianPhone || '+251 91 190 2831';

      raw = raw
        .replace(/{MadrasaName}/g, activeStudent.madrasaName)
        .replace(/{ParentName}/g, parent)
        .replace(/{StudentName}/g, activeStudent.name)
        .replace(/{SabaqLesson}/g, sabaqText)
        .replace(/{SabqiJuz}/g, sabqiText)
        .replace(/{ManzilJuz}/g, manzilText)
        .replace(/{TajweedRating}/g, activeStudent.tajweedRating)
        .replace(/{AttendanceStatus}/g, activeStudent.dailyAttendance || 'Present (On Time)')
        .replace(/{TeacherPhone}/g, '+251 91 123 4567')
        .replace(/{Date}/g, new Date().toLocaleDateString());

      setSenderId('HIFZ-ACADEMY');
      setMessageTitle(`Sabaq Progress: ${activeStudent.name}`);
      setRecipientTarget(`${parent} (${parentPhone})`);
      setRecipientCount(1);
    } else if (category === 'janazah_broadcast') {
      raw = raw
        .replace(/{DeceasedName}/g, deceasedName)
        .replace(/{Age}/g, deceasedAge)
        .replace(/{Kebele}/g, activeMosque ? activeMosque.district : 'Jimma City')
        .replace(/{Woreda}/g, activeMosque ? activeMosque.district : 'Jimma City')
        .replace(/{JanazahTime}/g, janazahTime)
        .replace(/{MosqueName}/g, activeMosque ? activeMosque.name : 'Grand Anwar Mosque')
        .replace(/{Cemetery}/g, cemeteryName)
        .replace(/{FamilyContact}/g, familyContact);

      setSenderId('JIMMA-ISLAM');
      setMessageTitle(`Emergency Janazah: ${deceasedName}`);
      setRecipientTarget(`Zonal Emergency Janazah Broadcast List & Channel (${gatewayStats.telegramSubscribers.toLocaleString()} subscribers)`);
      setRecipientCount(gatewayStats.telegramSubscribers + 5400);
    } else if (category === 'moon_sighting') {
      raw = raw
        .replace(/{Occasion}/g, moonOccasion)
        .replace(/{HijriDate}/g, '1 Shawwal 1447 AH')
        .replace(/{Location}/g, eidLocation)
        .replace(/{ImamKhateeb}/g, 'Sheikh Dr. Nuruddin Kedir (Zonal Mufti)');

      setSenderId('JIMMA-ISLAM');
      setMessageTitle(`Moon Sighting Communique: ${moonOccasion}`);
      setRecipientTarget(`All 18 Kebeles Broadcast (${gatewayStats.telegramSubscribers.toLocaleString()} Subscribers + 142 Imams)`);
      setRecipientCount(gatewayStats.telegramSubscribers + 142);
    } else if (category === 'khutbah_advisory') {
      raw = raw
        .replace(/{Date}/g, 'This Friday')
        .replace(/{KhutbahTheme}/g, khutbahTheme)
        .replace(/{KeyFocus}/g, 'Islamic charity, moral tarbiyah of youth, and safeguarding mosque waqf property.')
        .replace(/{Directives}/g, 'Encourage parents to enroll youth in certified evening Hifz halaqas.');

      setSenderId('@JimmaIslamicCouncilBot');
      setMessageTitle(`Unified Khutbah: ${khutbahTheme.slice(0, 30)}...`);
      setRecipientTarget('Jimma Zone Imams & Ulema League (142 Imams across 18 Kebeles)');
      setRecipientCount(142);
    } else {
      setMessageTitle('Official Council Announcement');
      setRecipientTarget('Custom Recipient List');
      setRecipientCount(1);
    }

    if (telegramOnly) {
      setRecipientTarget(telegramStatus?.channelId || '@riho_information');
      setRecipientCount(1);
    }
    setMessageContent(raw);
  };

  // Trigger when category, language, or active student/mosque changes
  useEffect(() => {
    applyTemplate(selectedCategory, selectedLanguage);
  }, [selectedCategory, selectedLanguage, selectedStudentId, selectedMosqueId, telegramStatus?.channelId]);

  // Update message content when form fields change (for live preview)
  useEffect(() => {
    if (selectedCategory === 'janazah_broadcast') {
      // Get current template
      const template = gatewayTemplates.find((t) => t.category === 'janazah_broadcast');
      if (template) {
        let raw = template.languages[selectedLanguage];

        // Replace placeholders with current form values
        raw = raw
          .replace(/{DeceasedName}/g, deceasedName)
          .replace(/{Age}/g, deceasedAge)
          .replace(/{Kebele}/g, activeMosque ? activeMosque.district : 'Jimma City')
          .replace(/{Woreda}/g, activeMosque ? activeMosque.district : 'Jimma City')
          .replace(/{JanazahTime}/g, janazahTime)
          .replace(/{MosqueName}/g, activeMosque ? activeMosque.name : 'Grand Anwar Mosque')
          .replace(/{Cemetery}/g, cemeteryName)
          .replace(/{FamilyContact}/g, familyContact);

        setMessageContent(raw);
        setMessageTitle(`Emergency Janazah: ${deceasedName}`);
        setRecipientTarget(`Zonal Emergency Janazah Broadcast List & Channel (${gatewayStats.telegramSubscribers.toLocaleString()} subscribers)`);
      }
    } else if (selectedCategory === 'sabaq_alert' && activeStudent) {
      const template = gatewayTemplates.find((t) => t.category === 'sabaq_alert');
      if (template) {
        let raw = template.languages[selectedLanguage];

        const sabaqText = activeStudent.hifzStatus?.sabaq || activeStudent.sabaqSurah || 'Surah Maryam: 1-40';
        const sabqiText = activeStudent.hifzStatus?.sabqi || (activeStudent.sabaqiJuz ? `Juz ${activeStudent.sabaqiJuz}` : 'Juz 18');
        const manzilText = activeStudent.hifzStatus?.manzil || activeStudent.manzilJuz || 'Juz 1 to 10';
        const parent = activeStudent.parentName || activeStudent.guardianName || 'Guardian';
        const parentPhone = activeStudent.parentPhone || activeStudent.guardianPhone || '+251 91 190 2831';

        raw = raw
          .replace(/{MadrasaName}/g, activeStudent.madrasaName)
          .replace(/{ParentName}/g, parent)
          .replace(/{StudentName}/g, activeStudent.name)
          .replace(/{SabaqLesson}/g, sabaqText)
          .replace(/{SabqiJuz}/g, sabqiText)
          .replace(/{ManzilJuz}/g, manzilText)
          .replace(/{TajweedRating}/g, activeStudent.tajweedRating)
          .replace(/{AttendanceStatus}/g, activeStudent.dailyAttendance || 'Present (On Time)')
          .replace(/{TeacherPhone}/g, '+251 91 123 4567')
          .replace(/{Date}/g, new Date().toLocaleDateString());

        setMessageContent(raw);
        setMessageTitle(`Sabaq Progress: ${activeStudent.name}`);
        setRecipientTarget(`${parent} (${parentPhone})`);
      }
    } else if (selectedCategory === 'moon_sighting') {
      const template = gatewayTemplates.find((t) => t.category === 'moon_sighting');
      if (template) {
        let raw = template.languages[selectedLanguage];

        raw = raw
          .replace(/{Occasion}/g, moonOccasion)
          .replace(/{HijriDate}/g, '1 Shawwal 1447 AH')
          .replace(/{Location}/g, eidLocation)
          .replace(/{ImamKhateeb}/g, 'Sheikh Dr. Nuruddin Kedir (Zonal Mufti)');

        setMessageContent(raw);
        setMessageTitle(`Moon Sighting Communique: ${moonOccasion}`);
        setRecipientTarget(`All 18 Kebeles Broadcast (${gatewayStats.telegramSubscribers.toLocaleString()} Subscribers + 142 Imams)`);
      }
    } else if (selectedCategory === 'khutbah_advisory') {
      const template = gatewayTemplates.find((t) => t.category === 'khutbah_advisory');
      if (template) {
        let raw = template.languages[selectedLanguage];

        raw = raw
          .replace(/{Date}/g, 'This Friday')
          .replace(/{KhutbahTheme}/g, khutbahTheme)
          .replace(/{KeyFocus}/g, 'Islamic charity, moral tarbiyah of youth, and safeguarding mosque waqf property.')
          .replace(/{Directives}/g, 'Encourage parents to enroll youth in certified evening Hifz halaqas.');

        setMessageContent(raw);
        setMessageTitle(`Unified Khutbah: ${khutbahTheme.slice(0, 30)}...`);
        setRecipientTarget('Jimma Zone Imams & Ulema League (142 Imams across 18 Kebeles)');
      }
    }
  }, [deceasedName, deceasedAge, janazahTime, cemeteryName, familyContact, selectedMosqueId, selectedCategory, selectedLanguage, activeStudent, khutbahTheme, moonOccasion, eidLocation, gatewayStats.telegramSubscribers]);

  // Handle Dispatch Action with realistic stage simulation
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      addToast('Cannot Send Empty Message', 'Please enter message content first.', 'warning');
      return;
    }

    if (telegramOnly) {
      if (selectedCategory === 'sabaq_alert') {
        addToast(
          'Private Sabaq Alerts Unavailable',
          'Telegram sends to a public channel. SMS is disabled, so guardian-specific student reports cannot be sent.',
          'warning'
        );
        return;
      }
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
        await dispatchMessage({
          title: messageTitle || 'Jimma ICS announcement',
          category: selectedCategory,
          channel: 'telegram',
          senderId,
          recipientTarget: result.channelId,
          recipientCount: 1,
          content: messageContent,
          costETB: 0,
          confirmation: {
            title: 'Telegram Post Accepted',
            message: `Telegram accepted this post for ${result.channelId}. Message ID: ${result.messageId}.`,
          },
          metadata: {
            deceasedName: selectedCategory === 'janazah_broadcast' ? deceasedName : undefined,
            janazahTime: selectedCategory === 'janazah_broadcast' ? janazahTime : undefined,
            cemetery: selectedCategory === 'janazah_broadcast' ? cemeteryName : undefined,
            mosqueName: activeMosque?.name,
            telegramMessageId: result.messageId,
          },
        });
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

    // Cost estimate
    const isUnicode = /[^\u0000-\u00ff]/.test(messageContent);
    const limitPerSegment = isUnicode ? 70 : 160;
    const segmentCount = Math.max(1, Math.ceil(messageContent.length / limitPerSegment));
    const cost = selectedChannel === 'telegram' ? 0 : segmentCount * recipientCount * 0.25;

    // Check balance if SMS
    if ((selectedChannel === 'sms' || selectedChannel === 'hybrid') && cost > gatewayStats.smsBalanceETB && recipientCount <= 50) {
      addToast('Insufficient SMS Balance', `Please refill your Ethio Telecom credit balance to send this dispatch.`, 'warning');
      return;
    }

    setIsDispatching(true);
    setDispatchStage(1); // Connecting

    setTimeout(() => {
      setDispatchStage(2); // Handshaking SMPP / Bot API
      setTimeout(() => {
        setDispatchStage(3); // Delivering
        setTimeout(async () => {
          setDispatchStage(4); // Delivered
          await dispatchMessage({
            title: messageTitle || 'Gateway Broadcast',
            category: selectedCategory,
            channel: selectedChannel,
            senderId,
            recipientTarget,
            recipientCount,
            content: messageContent,
            costETB: cost,
            metadata: {
              studentId: selectedCategory === 'sabaq_alert' ? activeStudent?.id : undefined,
              studentName: selectedCategory === 'sabaq_alert' ? activeStudent?.name : undefined,
              parentPhone: selectedCategory === 'sabaq_alert' ? activeStudent?.parentPhone : undefined,
              madrasaName: activeStudent?.madrasaName,
              deceasedName: selectedCategory === 'janazah_broadcast' ? deceasedName : undefined,
              janazahTime: selectedCategory === 'janazah_broadcast' ? janazahTime : undefined,
              cemetery: selectedCategory === 'janazah_broadcast' ? cemeteryName : undefined,
              mosqueName: activeMosque?.name,
            },
          });
          setIsDispatching(false);
          setDispatchStage(0);
          if (onSuccess) onSuccess();
        }, 600);
      }, 700);
    }, 700);
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
                Messages post publicly to {telegramStatus?.channelId || '@riho_information'}. SMS is disabled; student-specific guardian alerts are not sent here.
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
              desc: 'SMS alert to parent with daily Juz progress',
              icon: <User className="w-4 h-4 text-emerald-600" />,
            },
            {
              id: 'janazah_broadcast' as MessageCategory,
              label: 'Emergency Janazah',
              desc: 'Urgent funeral prayer time & cemetery blast',
              icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
            },
            {
              id: 'moon_sighting' as MessageCategory,
              label: 'Moon Sighting / Eid',
              desc: 'Ramadan/Shawwal Hilal declaration & grounds',
              icon: <Sparkles className="w-4 h-4 text-amber-600" />,
            },
            {
              id: 'khutbah_advisory' as MessageCategory,
              label: 'Friday Khutbah Guidance',
              desc: 'Unified theme advisory to 18 Kebeles',
              icon: <FileText className="w-4 h-4 text-blue-600" />,
            },
            {
              id: 'general_bulletin' as MessageCategory,
              label: 'Custom Direct Dispatch',
              desc: 'Custom payload to custom recipients',
              icon: <Zap className="w-4 h-4 text-purple-600" />,
            },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              disabled={telegramOnly && cat.id === 'sabaq_alert'}
              onClick={() => {
                setSelectedCategory(cat.id);
                applyTemplate(cat.id, selectedLanguage);
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
                      ? 'Unavailable: private guardian messages cannot be posted publicly'
                      : 'Public post to the configured Telegram channel'
                    : cat.desc}
                </div>
              </div>
            </button>
          ))}
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
              <div className={`grid ${telegramOnly ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                {(telegramOnly ? [
                  {
                    id: 'telegram' as MessageChannel,
                    label: 'Telegram Bot API',
                    sub: `Channel: ${telegramStatus?.channelId || '@riho_information'}`,
                    badge: telegramStatus?.enabled ? 'Ready' : 'Not configured',
                  },
                  {
                    id: 'sms' as MessageChannel,
                    label: 'SMS (disabled)',
                    sub: 'Gateway credentials unavailable',
                    badge: 'Unavailable',
                  },
                ] : [
                    {
                      id: 'hybrid' as MessageChannel,
                      label: 'Dual Hybrid Broadcast',
                      sub: 'SMS + Telegram Channel',
                      badge: 'Recommended',
                    },
                    {
                      id: 'sms' as MessageChannel,
                      label: 'Ethio Telecom SMS',
                      sub: 'Shortcode: JIMMA-ISLAM',
                      badge: 'Direct to Parent',
                    },
                    {
                      id: 'telegram' as MessageChannel,
                      label: 'Telegram Bot API',
                      sub: 'Channel: @JimmaMuslimsOfficial',
                      badge: '24.8k Reach',
                    },
                  ]).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChannel(ch.id)}
                    disabled={telegramOnly && ch.id !== 'telegram'}
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
                  </button>
                ))}
              </div>
            </div>
            {telegramOnly && telegramStatusError && (
                <p role="alert" className="mt-2 text-xs text-rose-600">{telegramStatusError}</p>
            )}

            {/* Dynamic Scenario Form Inputs */}
            {selectedCategory === 'sabaq_alert' && (
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
                    <option value="@JimmaIslamicCouncilBot">@JimmaIslamicCouncilBot (Telegram)</option>
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
              {!telegramOnly && (
                <div className="text-[11px] text-stone-400">
                  EthioTel Balance: <strong className="text-emerald-600">{gatewayStats.smsBalanceETB} ETB</strong>
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                size="md"
                disabled={isDispatching || (telegramOnly && !telegramStatus?.enabled)}
                icon={isDispatching ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {isDispatching
                  ? 'Sending to Telegram...'
                  : telegramOnly
                    ? 'Send Telegram Broadcast'
                    : `Dispatch to ${recipientCount.toLocaleString()} Endpoint(s)`}
              </Button>
            </div>
          </form>

          {/* Animated Transmission Progress Drawer when sending */}
          {isDispatching && (
            <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl border border-emerald-700 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
              {telegramOnly ? (
                <p className="flex items-center gap-2 text-xs font-bold text-amber-300" role="status">
                  <Radio className="w-4 h-4 animate-pulse" />
                  Sending to Telegram and waiting for the Bot API response...
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-2">
                      <Radio className="w-4 h-4 animate-pulse" />
                      Ethio Telecom SMPP & Telegram Bot Gateway Pipeline
                    </span>
                    <span>Stage {dispatchStage} of 4</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${dispatchStage >= 1 ? 'text-emerald-300' : 'text-stone-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>1. Establishing SSL Tunnel to Telecom SMS Gateway / Telegram API</span>
                    </div>
                    <div className={`flex items-center gap-2 ${dispatchStage >= 2 ? 'text-emerald-300' : 'text-stone-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>2. Validating MSISDN Routing & GSM-7 Segment Serialization</span>
                    </div>
                    <div className={`flex items-center gap-2 ${dispatchStage >= 3 ? 'text-emerald-300' : 'text-stone-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>3. Transmitting to Jimma BTS Mobile Towers & Subscribers</span>
                    </div>
                    <div className={`flex items-center gap-2 ${dispatchStage >= 4 ? 'text-amber-300 font-bold' : 'text-stone-500'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>4. Carrier Delivery Receipt & Status 200 Acknowledged</span>
                    </div>
                  </div>
                </>
              )}
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
