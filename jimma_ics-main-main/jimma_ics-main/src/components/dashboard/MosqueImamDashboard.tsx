import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Radio,
  FileCheck2,
  Calendar,
  HeartHandshake,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Plus,
  Send,
  Sparkles,
  Phone,
  FileText,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QuickJanazahModal } from '../gateway/QuickJanazahModal';
import { Link } from 'react-router-dom';

export const MosqueImamDashboard: React.FC = () => {
  const {
    mosques,
    updateMosque,
    currentUser,
    addToast,
  } = useApp();

  const [isJanazahModalOpen, setIsJanazahModalOpen] = useState(false);
  const [isNikahModalOpen, setIsNikahModalOpen] = useState(false);
  const [isKhutbahModalOpen, setIsKhutbahModalOpen] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  // Form states for Nikah
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [waliName, setWaliName] = useState('');
  const [mahrAmount, setMahrAmount] = useState('25,000 ETB (Prompt Mahr)');
  const [witness1, setWitness1] = useState('Ustadh Bilal Seid');
  const [witness2, setWitness2] = useState('Ato Mohammed Jamal');

  // Form states for Khutbah
  const [khutbahTopic, setKhutbahTopic] = useState('The Spiritual & Social Virtues of Waqf in Oromia');
  const [khutbahSpeaker, setKhutbahSpeaker] = useState(currentUser.name || 'Sheikh Ibrahim Qasim');
  const [khutbahLanguage, setKhutbahLanguage] = useState('Afaan Oromoo & Arabic');

  // Form states for Grant
  const [grantCategory, setGrantCategory] = useState('Solar Power & Battery Inverters');
  const [grantAmount, setGrantAmount] = useState('65,000');
  const [grantJustification, setGrantJustification] = useState('Continuous power for 5-time prayer public adhan and evening Tahfeez classes.');

  const myMosque = mosques[0] || {
    id: 'mosque-1',
    name: 'Grand Anwar Mosque of Jimma',
    district: 'Jimma Central',
    capacity: 5500,
    imam: currentUser.name || 'Sheikh Abdullah Ahmed Al-Jimmawi',
  };

  const handleRegisterNikah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) {
      addToast('Missing Details', 'Please complete groom and bride details.', 'error');
      return;
    }

    addToast(
      'Nikah Registered & Certified',
      `Official Islamic Council Marriage Deed issued for ${groomName} & ${brideName} (Deed #NKH-2026-${Math.floor(1000 + Math.random() * 9000)}).`,
      'success'
    );
    setIsNikahModalOpen(false);
    setGroomName('');
    setBrideName('');
    setWaliName('');
  };

  const handleSaveKhutbah = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Khutbah Schedule Logged',
      `Upcoming Friday sermon: "${khutbahTopic}" by ${khutbahSpeaker} recorded in council records.`,
      'success'
    );
    setIsKhutbahModalOpen(false);
  };

  const handleRequestGrant = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Grant Request Submitted',
      `Application for ETB ${parseInt(grantAmount).toLocaleString()} (${grantCategory}) forwarded to Council Waqf Board.`,
      'success'
    );
    setIsGrantModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Imam & Khateeb Ministry</Badge>
            <span className="text-xs text-stone-400 font-mono">Mosque & Waqf Directorate</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Mosque Leadership & Community Ministry
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Oversee congregational prayer halls, broadcast urgent funeral notices, register Nikah deeds, and submit waqf renovation requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Radio className="w-4 h-4 text-rose-600" />}
            onClick={() => setIsJanazahModalOpen(true)}
          >
            Emergency Janazah Alert
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Calendar className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsKhutbahModalOpen(true)}
          >
            Log Friday Khutbah
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Sun className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsGrantModalOpen(true)}
          >
            Waqf Solar Grant
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FileCheck2 className="w-4 h-4" />}
            onClick={() => setIsNikahModalOpen(true)}
          >
            Register Nikah Deed
          </Button>
        </div>
      </div>

      {/* 4 Mosque Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Assigned Mosque
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 truncate">
            {myMosque.name}
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>{myMosque.district}</span>
            <Badge variant="emerald">Active</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Prayer Capacity
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {(myMosque.capacity || 5000).toLocaleString()} <span className="text-sm font-sans font-normal text-stone-500">musallis</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Friday Attendance: ~95%</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Nikah Solemnized (YTD)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            38 <span className="text-sm font-sans font-normal text-stone-500">certificates</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Official Council Registry</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Solar & Waqf Facility
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 font-mono">
            10 kW <span className="text-sm font-sans font-normal text-stone-500">Solar Grid</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Wudhu Taps: 120 Operational</span>
          </div>
        </Card>
      </div>

      {/* Main Row: Friday Khutbah Planner & Nikah Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Khutbah Schedule & Prayer Hall Readiness */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Upcoming Friday Jumu'ah Schedule</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Coordinated themes aligned with Jimma Council Ulema Board guidelines.
                </p>
              </div>
              <Badge variant="gold">This Friday</Badge>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    Khutbah Theme (Khutbah Al-Jumu'ah)
                  </span>
                  <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mt-0.5">
                    {khutbahTopic}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Khateeb: <span className="font-semibold text-stone-800 dark:text-stone-200">{khutbahSpeaker}</span> • Language: <span className="font-semibold text-amber-700 dark:text-amber-400">{khutbahLanguage}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 block">
                    12:30 PM (Adhan)
                  </span>
                  <span className="text-xs font-mono text-emerald-600 block">
                    01:00 PM (Salah)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-stone-200/80 dark:border-stone-700">
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase block">Women Gallery</span>
                  <span className="font-bold text-emerald-600">Open (750 capacity)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase block">Acoustic System</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Calibrated</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase block">Emergency Gate</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">Cleared</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Mosque Directory Quick Access */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Zone-Wide Mosque Network Status
              </h3>
              <Link to="/mosques">
                <Button variant="ghost" size="sm" className="text-xs">
                  Public Directory
                </Button>
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              {mosques.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-900 dark:text-stone-100 truncate font-serif">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      Imam: {m.imam} • {m.district}
                    </div>
                  </div>
                  <Badge variant="emerald">{(m.capacity || 1000).toLocaleString()} Musallis</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 5 cols: Emergency Janazah Desk & Quick Nikah Certs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Janazah Broadcaster Card */}
          <div className="p-5 rounded-3xl bg-rose-950 text-rose-100 border border-rose-800/80 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                Urgent Janazah Broadcast System
              </span>
              <Badge variant="rose">Priority 1</Badge>
            </div>
            <h4 className="font-serif font-bold text-base text-white">
              Instant Funeral & Janazah Community Notice
            </h4>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Dispatch high-priority SMS and Telegram alerts to 12,000+ registered community phones with prayer time and cemetery location.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center text-xs bg-rose-900/60 text-white border-rose-700 hover:bg-rose-800"
              icon={<Radio className="w-4 h-4 text-white" />}
              onClick={() => setIsJanazahModalOpen(true)}
            >
              Compose Janazah Broadcast Alert
            </Button>
          </div>

          {/* Nikah Deeds Recent Activity */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Recent Nikah Registrations
              </h3>
              <Badge variant="emerald">Authenticated</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="flex justify-between font-semibold text-stone-900 dark:text-stone-100">
                  <span>Ahmed Mukhtar & Aisha Oumer</span>
                  <span className="font-mono text-[10px] text-stone-400">#NKH-2026-8812</span>
                </div>
                <div className="text-[10px] text-stone-500">
                  Solemnized by {currentUser.name} • Mahr: 30,000 ETB
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 space-y-1">
                <div className="flex justify-between font-semibold text-stone-900 dark:text-stone-100">
                  <span>Mustafa Dawud & Rahma Jamal</span>
                  <span className="font-mono text-[10px] text-stone-400">#NKH-2026-8809</span>
                </div>
                <div className="text-[10px] text-stone-500">
                  Solemnized by {currentUser.name} • Mahr: 25,000 ETB
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center text-xs"
              onClick={() => setIsNikahModalOpen(true)}
            >
              Register New Islamic Nikah
            </Button>
          </Card>
        </div>
      </div>

      {/* Register Nikah Modal */}
      {isNikahModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Register Islamic Nikah Deed
                </h3>
                <p className="text-stone-500">Official Jimma Islamic Council Marriage Registry</p>
              </div>
              <button
                onClick={() => setIsNikahModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterNikah} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Groom Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Khalid Ababor"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Bride Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maryam Nur"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Bride's Legal Wali
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sheikh Nur Mohammed (Father)"
                    value={waliName}
                    onChange={(e) => setWaliName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Stipulated Mahr
                  </label>
                  <input
                    type="text"
                    required
                    value={mahrAmount}
                    onChange={(e) => setMahrAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Witness 1
                  </label>
                  <input
                    type="text"
                    required
                    value={witness1}
                    onChange={(e) => setWitness1(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Witness 2
                  </label>
                  <input
                    type="text"
                    required
                    value={witness2}
                    onChange={(e) => setWitness2(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsNikahModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Issue Marriage Deed
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Khutbah Modal */}
      {isKhutbahModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Log Friday Khutbah Sermon
                </h3>
                <p className="text-stone-500">Record weekly theme and khateeb schedule</p>
              </div>
              <button
                onClick={() => setIsKhutbahModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveKhutbah} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Khutbah Subject / Title
                </label>
                <input
                  type="text"
                  required
                  value={khutbahTopic}
                  onChange={(e) => setKhutbahTopic(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Designated Khateeb
                  </label>
                  <input
                    type="text"
                    required
                    value={khutbahSpeaker}
                    onChange={(e) => setKhutbahSpeaker(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Delivery Language
                  </label>
                  <select
                    value={khutbahLanguage}
                    onChange={(e) => setKhutbahLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Afaan Oromoo & Arabic">Afaan Oromoo & Arabic</option>
                    <option value="Amharic & Arabic">Amharic & Arabic</option>
                    <option value="Arabic Only">Arabic Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsKhutbahModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Sermon Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Solar Waqf Grant Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Request Mosque Facility Grant
                </h3>
                <p className="text-stone-500">Apply for Council Waqf Fund allocation</p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestGrant} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Improvement Category
                </label>
                <select
                  value={grantCategory}
                  onChange={(e) => setGrantCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Solar Power & Battery Inverters">Solar Power & Battery Inverters</option>
                  <option value="Wudhu Stations & Water Tank Well">Wudhu Stations & Water Tank Well</option>
                  <option value="Sound Acoustic System & Minaret Horns">Sound Acoustic System & Minaret Horns</option>
                  <option value="Roof Waterproofing & Carpet Renovation">Roof Waterproofing & Carpet Renovation</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Requested Budget (ETB)
                </label>
                <input
                  type="number"
                  required
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Justification & Community Impact
                </label>
                <textarea
                  rows={3}
                  required
                  value={grantJustification}
                  onChange={(e) => setGrantJustification(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsGrantModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Submit to Waqf Board
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Janazah Modal */}
      <QuickJanazahModal
        isOpen={isJanazahModalOpen}
        onClose={() => setIsJanazahModalOpen(false)}
        defaultMosqueName={myMosque.name}
        defaultDistrict={myMosque.district}
      />
    </div>
  );
};
