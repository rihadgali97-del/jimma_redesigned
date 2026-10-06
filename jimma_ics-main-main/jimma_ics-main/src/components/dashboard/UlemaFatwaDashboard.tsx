import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Award,
  Scale,
  Users,
  Calendar,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  FileText,
  BadgeCheck,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

interface MockFatwaItem {
  id: string;
  title: string;
  arabicTitle?: string;
  category: 'Zakat & Finance' | 'Family & Marriage' | 'Worship (Salah/Sawm)' | 'Community & Ethics';
  mufti: string;
  status: 'Issued & Published' | 'Under Shura Review' | 'Draft';
  date: string;
  summary: string;
}

export const UlemaFatwaDashboard: React.FC = () => {
  const { currentUser, addToast } = useApp();

  const [fatwaList, setFatwaList] = useState<MockFatwaItem[]>([
    {
      id: 'FTW-2026-104',
      title: 'Zakat Assessment on Agricultural Coffee Yields in Jimma Zone',
      arabicTitle: 'حكم زكاة محاصيل البن في منطقة جيما',
      category: 'Zakat & Finance',
      mufti: 'Sheikh Dr. Nuruddin Al-Azhari',
      status: 'Issued & Published',
      date: '2026-08-20',
      summary: 'Detailed Fiqh calculation establishing the 5% (irrigated) vs 10% (rain-fed) Nisab threshold for local coffee farmers in Gomma & Agaro.',
    },
    {
      id: 'FTW-2026-105',
      title: 'Validity of Telebirr Digital Escrow for Mahr and Waqf Endowments',
      category: 'Zakat & Finance',
      mufti: 'Council Shari’ah Board',
      status: 'Issued & Published',
      date: '2026-08-15',
      summary: 'Affirming that instant mobile wallet transfers satisfy immediate Qabd (possession) requirements in commercial and Nikah contracts.',
    },
    {
      id: 'FTW-2026-106',
      title: 'Inheritance Estate Division Protocols for Multi-Heir Coffee Farmland',
      category: 'Family & Marriage',
      mufti: 'Sheikh Abdullah Ahmed Al-Jimmawi',
      status: 'Under Shura Review',
      date: '2026-09-01',
      summary: 'Shari’ah inheritance (Mirath) shares calculated per Quranic quotas without dividing indivisible agricultural parcels.',
    },
  ]);

  const [isFatwaModalOpen, setIsFatwaModalOpen] = useState(false);
  const [isScholarModalOpen, setIsScholarModalOpen] = useState(false);
  const [isShuraModalOpen, setIsShuraModalOpen] = useState(false);

  // Form state for Fatwa
  const [fatwaTitle, setFatwaTitle] = useState('');
  const [fatwaArabic, setFatwaArabic] = useState('');
  const [fatwaCategory, setFatwaCategory] = useState<MockFatwaItem['category']>('Zakat & Finance');
  const [fatwaQuestion, setFatwaQuestion] = useState('');
  const [fatwaRuling, setFatwaRuling] = useState('');

  // Form state for Scholar
  const [scholarName, setScholarName] = useState('');
  const [scholarSpecialization, setScholarSpecialization] = useState('Fiqh & Usul Al-Fiqh');
  const [scholarDistrict, setScholarDistrict] = useState('Jimma Central');

  // Form state for Shura
  const [shuraDate, setShuraDate] = useState('2026-09-18');
  const [shuraAgenda, setShuraAgenda] = useState('Quarterly Halal Certification & Moonsighting Standardization Protocol');

  const handleIssueFatwa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fatwaTitle.trim() || !fatwaRuling.trim()) {
      addToast('Incomplete Form', 'Please provide a title and legal ruling text.', 'error');
      return;
    }

    const newFatwa: MockFatwaItem = {
      id: `FTW-2026-${Math.floor(107 + Math.random() * 900)}`,
      title: fatwaTitle,
      arabicTitle: fatwaArabic || undefined,
      category: fatwaCategory,
      mufti: currentUser.name || 'Council Senior Mufti',
      status: 'Issued & Published',
      date: new Date().toISOString().split('T')[0],
      summary: fatwaRuling,
    };

    setFatwaList([newFatwa, ...fatwaList]);
    addToast(
      'Official Fatwa Issued & Published',
      `Decree "${fatwaTitle}" has been sealed and published on the Council portal.`,
      'success'
    );
    setIsFatwaModalOpen(false);
    setFatwaTitle('');
    setFatwaArabic('');
    setFatwaQuestion('');
    setFatwaRuling('');
  };

  const handleLicenseScholar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarName.trim()) return;

    addToast(
      'Scholar License Granted',
      `${scholarName} has been certified as an accredited Khateeb & Mu'allim in ${scholarDistrict}.`,
      'success'
    );
    setIsScholarModalOpen(false);
    setScholarName('');
  };

  const handleScheduleShura = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Shura Assembly Convened',
      `Council assembly scheduled for ${shuraDate}: "${shuraAgenda}".`,
      'success'
    );
    setIsShuraModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold">Shari'ah & Fatwa Board</Badge>
            <span className="text-xs text-stone-400 font-mono">Supreme Ulema Council</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Islamic Jurisprudence & Scholar Directorate
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Preside over Islamic legal advisories, certify regional scholars, convene quarterly Shura assemblies, and arbitrate community matters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Calendar className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsShuraModalOpen(true)}
          >
            Convene Shura Assembly
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<BadgeCheck className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsScholarModalOpen(true)}
          >
            License Scholar / Khateeb
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<Scale className="w-4 h-4" />}
            onClick={() => setIsFatwaModalOpen(true)}
          >
            Issue Official Fatwa
          </Button>
        </div>
      </div>

      {/* 4 Core Ulema Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Issued Fatwas & Decrees
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {fatwaList.length + 18} <span className="text-sm font-sans font-normal text-stone-500">rulings</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Publicly Searchable</span>
            <Badge variant="gold">Indexed</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Accredited Ulema & Muftis
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            48 <span className="text-sm font-sans font-normal text-stone-500">scholars</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>18 Woredas Represented</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Active Legal Inquiries
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-700 dark:text-blue-400 font-mono">
            6 <span className="text-sm font-sans font-normal text-stone-500">in review</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Next Shura in 12 days</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Inheritance Cases Settled
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 font-mono">
            19 <span className="text-sm font-sans font-normal text-stone-500">estates</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>100% Shari’ah Mediation</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Fatwa Archive & Scholar Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Fatwa Decrees & Rulings */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  <span>Official Shari'ah Advisories & Decrees</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Authoritative Islamic legal rulings issued for the Jimma Zone Muslim community.
                </p>
              </div>
              <Button
                variant="gold"
                size="sm"
                className="text-xs"
                onClick={() => setIsFatwaModalOpen(true)}
              >
                Draft New Fatwa
              </Button>
            </div>

            <div className="space-y-3">
              {fatwaList.map((fatwa) => (
                <div
                  key={fatwa.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                        {fatwa.id} • {fatwa.category}
                      </span>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 mt-0.5">
                        {fatwa.title}
                      </h4>
                      {fatwa.arabicTitle && (
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-serif" dir="rtl">
                          {fatwa.arabicTitle}
                        </p>
                      )}
                    </div>
                    <Badge variant={fatwa.status === 'Issued & Published' ? 'emerald' : 'gold'}>
                      {fatwa.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-100 dark:border-stone-800 leading-relaxed">
                    "{fatwa.summary}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700">
                    <span>
                      Presiding Mufti: <span className="font-semibold text-stone-700 dark:text-stone-300">{fatwa.mufti}</span>
                    </span>
                    <span>Date: {fatwa.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 4 cols: Scholar Directory & Shura Council Desk */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Senior Ulema Board</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <div className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Sheikh Abdullah Ahmed Al-Jimmawi
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Chief Mufti & President of Shura
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Specialization: Comparative Fiqh & Hadith Sanad
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <div className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Sheikh Dr. Nuruddin Al-Azhari
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Head of Islamic Financial Jurisprudence
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Specialization: Waqf Economics & Zakat Law
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
                <div className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Sheikh Mohammed Siraj
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Director of Family Mediation
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Specialization: Mirath & Marital Dispute Resolution
                </div>
              </div>
            </div>

            <Link to="/ulema">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                View All 48 Scholars
              </Button>
            </Link>
          </Card>

          {/* Shura Assembly Quick Card */}
          <div className="p-5 rounded-3xl bg-amber-950 text-amber-100 border border-amber-800/80 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Upcoming Shura Session
            </span>
            <h4 className="font-serif font-bold text-base text-white">
              Q3 Jimma Zone Ulema Assembly
            </h4>
            <p className="text-xs text-amber-200/80">
              Agenda: {shuraAgenda}
            </p>
            <div className="text-xs font-mono text-amber-400">
              Date: {shuraDate} • Council Chambers
            </div>
          </div>
        </div>
      </div>

      {/* Issue Fatwa Modal */}
      {isFatwaModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Issue Official Council Fatwa
                </h3>
                <p className="text-stone-500">Draft and publish Islamic jurisprudential decree</p>
              </div>
              <button
                onClick={() => setIsFatwaModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueFatwa} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Fatwa Title / Legal Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ruling on Zakat Disbursement for Local Orphan Students"
                  value={fatwaTitle}
                  onChange={(e) => setFatwaTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Arabic Title (Optional)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="عنوان الفتوى بالعربية"
                    value={fatwaArabic}
                    onChange={(e) => setFatwaArabic(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Jurisprudence Category
                  </label>
                  <select
                    value={fatwaCategory}
                    onChange={(e) => setFatwaCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Zakat & Finance">Zakat & Islamic Finance</option>
                    <option value="Family & Marriage">Family, Nikah & Inheritance</option>
                    <option value="Worship (Salah/Sawm)">Worship, Fasting & Moonsighting</option>
                    <option value="Community & Ethics">Community Welfare & Halal Food</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Inquiry / Case Background
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. A question submitted regarding..."
                  value={fatwaQuestion}
                  onChange={(e) => setFatwaQuestion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Jurisprudential Ruling & Evidences (Fatwa Text)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the Shar’i verdict citing Quran, Sunnah, and consensus of the Jumhoor..."
                  value={fatwaRuling}
                  onChange={(e) => setFatwaRuling(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsFatwaModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Seal & Issue Decree
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scholar Modal */}
      {isScholarModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  License Scholar / Khateeb
                </h3>
                <p className="text-stone-500">Issue official credentials</p>
              </div>
              <button
                onClick={() => setIsScholarModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLicenseScholar} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Scholar Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sheikh Hamza Yusuf Al-Oromo"
                  value={scholarName}
                  onChange={(e) => setScholarName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Primary Specialization
                </label>
                <input
                  type="text"
                  required
                  value={scholarSpecialization}
                  onChange={(e) => setScholarSpecialization(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Assigned District / Jurisdiction
                </label>
                <select
                  value={scholarDistrict}
                  onChange={(e) => setScholarDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Jimma Central">Jimma Central</option>
                  <option value="Gomma">Gomma Woreda</option>
                  <option value="Agaro">Agaro City</option>
                  <option value="Manna">Manna Woreda</option>
                  <option value="Limmu Kosa">Limmu Kosa</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsScholarModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Authorize & Issue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shura Modal */}
      {isShuraModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Convene Shura Assembly
                </h3>
                <p className="text-stone-500">Schedule consultative council</p>
              </div>
              <button
                onClick={() => setIsShuraModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleShura} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Assembly Date
                </label>
                <input
                  type="date"
                  required
                  value={shuraDate}
                  onChange={(e) => setShuraDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Main Agenda & Key Inquiries
                </label>
                <textarea
                  rows={3}
                  required
                  value={shuraAgenda}
                  onChange={(e) => setShuraAgenda(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsShuraModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Dispatch Shura Notice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
