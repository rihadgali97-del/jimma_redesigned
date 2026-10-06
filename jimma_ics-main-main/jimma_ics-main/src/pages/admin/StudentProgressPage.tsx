import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  AlertCircle,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Edit,
  Save,
  Download,
  Printer,
  ShieldCheck,
  User,
  Phone,
  Send,
  Radio,
  Smartphone,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { QuranProgressGrid } from '../../components/charts/QuranProgressGrid';
import { StudentGrowthCharts } from '../../components/charts/StudentGrowthCharts';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { QuickSabaqModal } from '../../components/gateway/QuickSabaqModal';
import { CourseCertificateModal } from '../../components/certificates/CourseCertificateModal';
import { StudentGraduationModal } from '../../components/admin/students/StudentGraduationModal';

export const StudentProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    students,
    studentsLoading,
    studentsError,
    authReady,
    isLoggedIn,
    updateStudent,
    updateStudentProgress,
    dispatchMessage,
    addToast,
  } = useApp();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === id);

  // Modal states
  const [isLogSabaqModalOpen, setIsLogSabaqModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);

  // Form states for logging Sabaq
  const [sabaqSurah, setSabaqSurah] = useState('Surah Al-Baqarah');
  const [ayahStart, setAyahStart] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(25);
  const [sabaqiJuz, setSabaqiJuz] = useState(1);
  const [manzilJuz, setManzilJuz] = useState('Juz 1');
  const [tajweedRating, setTajweedRating] = useState<'Excellent' | 'Good' | 'Needs Practice' | 'Very Good' | 'Needs Revision'>('Very Good');
  const [attendance, setAttendance] = useState<'Present' | 'Absent' | 'Late' | 'Excused'>('Present');
  const [completedJuz, setCompletedJuz] = useState(0);
  const [sendSmsNotification, setSendSmsNotification] = useState(true);

  // Sync state if active student changes
  useEffect(() => {
    if (student) {
      setSabaqSurah(student.sabaqSurah || 'Surah Al-Baqarah');
      setAyahStart(student.sabaqAyahStart || 1);
      setAyahEnd(student.sabaqAyahEnd || 25);
      setSabaqiJuz(student.sabaqiJuz || 1);
      setManzilJuz(student.manzilJuz || 'Juz 1');
      setTajweedRating(student.tajweedRating || 'Very Good');
      setAttendance(student.dailyAttendance || 'Present');
      setCompletedJuz(student.quranJuzCompleted || 0);
    }
  }, [student]);

  const percentage = student ? Math.round((student.quranJuzCompleted / 30) * 100) : 0;

  const handleSaveSabaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const saved = await updateStudentProgress(student.id, {
      sabaqSurah,
      sabaqAyahStart: Number(ayahStart),
      sabaqAyahEnd: Number(ayahEnd),
      sabaqiJuz: Number(sabaqiJuz),
      manzilJuz,
      tajweedRating,
      dailyAttendance: attendance,
      quranJuzCompleted: Number(completedJuz),
    });
    if (!saved) return;

    if (sendSmsNotification) {
      const parent = student.parentName || student.guardianName || 'Guardian';
      const phone = student.parentPhone || student.guardianPhone || '+251 91 190 2831';
      await dispatchMessage({
        title: `Daily Sabaq Alert: ${student.name}`,
        category: 'sabaq_alert',
        channel: 'sms',
        senderId: 'HIFZ-ACADEMY',
        recipientTarget: `${parent} (${phone})`,
        recipientCount: 1,
        content: `Jimma Islamic Supreme Council - ${student.madrasaName}\n\nAssalamu Alaykum ${parent},\nDaily Hifz Report for ${student.name}:\n📖 Sabaq: ${sabaqSurah} (${ayahStart}-${ayahEnd})\n🔄 Sabqi: Juz ${sabaqiJuz}\n✨ Tajweed: ${tajweedRating}\n📍 Attendance: ${attendance}\n\nJazakallahu Khayran.`,
        costETB: 0.25,
        metadata: {
          studentId: student.id,
          studentName: student.name,
          parentPhone: phone,
          madrasaName: student.madrasaName,
        },
      });
    }

    setIsLogSabaqModalOpen(false);
    addToast('Daily Sabaq Recorded', `Updated Quran recitation records for ${student.name}.`, 'success');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!student) {
    const isLoading = studentsLoading || !authReady || (isLoggedIn && !studentsError);
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            {isLoading ? (
              <GraduationCap className="w-6 h-6 text-emerald-700 dark:text-emerald-400 animate-pulse" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {isLoading ? 'Loading student record' : 'Student record not found'}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {isLoading
                ? 'Please wait while the saved student registry is loaded.'
                : studentsError || 'This student may have been removed or the link may be invalid.'}
            </p>
          </div>
          <Link to="/admin/students">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Student Registry
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registry</span>
          </Link>

          {/* Quick Student Switcher */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-stone-200 dark:border-stone-800">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={student.id}
              onChange={(e) => navigate(`/admin/students/${e.target.value}`)}
              className="text-xs font-semibold bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1 text-stone-800 dark:text-stone-200 outline-hidden cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.quranJuzCompleted}/30 Juz)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Smartphone className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsSmsModalOpen(true)}
          >
            Dispatch Sabaq SMS
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => setIsGraduationModalOpen(true)}
          >
            {student.status === 'Graduated' ? 'Edit Graduation' : 'Record Graduation'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => setIsCertificateModalOpen(true)}
          >
            Certificate Studio (PDF)
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => setIsLogSabaqModalOpen(true)}
          >
            Log Daily Sabaq
          </Button>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold border border-emerald-700 shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={student.status === 'Active' ? 'emerald' : 'gold'}>
                  {student.status}
                </Badge>
                {student.graduationYear && (
                  <Badge variant="gold">Graduated {student.graduationYear}</Badge>
                )}
                <span className="text-xs text-stone-400 font-mono">ID: {student.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
                {student.name}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {student.madrasaName} • Enrolled {student.enrollmentDate}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                Completed
              </span>
              <span className="text-xl font-bold font-mono text-emerald-950 dark:text-emerald-100">
                {student.quranJuzCompleted} / 30
              </span>
              <span className="text-[10px] text-stone-400 block">{percentage}% of Quran</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                Tajweed Quality
              </span>
              <span className="text-sm font-bold text-amber-950 dark:text-amber-100 block mt-1">
                {student.tajweedRating}
              </span>
              <span className="text-[10px] text-stone-400 block">Verified by Mu'allim</span>
            </div>
          </div>
        </div>

        {/* 3-Pillar Daily Quran Tracking: Sabaq, Sabaqi, Manzil */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sabaq (New Lesson) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                1. Sabaq (New Lesson)
              </span>
              <Badge variant="emerald">Daily</Badge>
            </div>
            <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {student.sabaqSurah}
            </div>
            <div className="text-xs text-stone-500 font-mono">
              Ayah {student.sabaqAyahStart} to {student.sabaqAyahEnd}
            </div>
          </div>

          {/* Sabaqi (Recent Revision) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                2. Sabaqi (Recent Quarter)
              </span>
              <Badge variant="gold">Weekly</Badge>
            </div>
            <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Juz {student.sabaqiJuz}
            </div>
            <div className="text-xs text-stone-500">
              Recent 5–10 pages memorized
            </div>
          </div>

          {/* Manzil (Cumulative Revision) */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">
                3. Manzil (Full Revision)
              </span>
              <Badge variant="blue">Cycle</Badge>
            </div>
            <div className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {student.manzilJuz}
            </div>
            <div className="text-xs text-stone-500">
              Rotational daily review
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Data Visualization: Academic Growth & Course Completion Trends */}
      <Card className="space-y-4 p-6 sm:p-8">
        <StudentGrowthCharts
          student={student}
          onOpenCertificate={() => setIsCertificateModalOpen(true)}
        />
      </Card>

      {/* Full 30-Juz Visual Completion Grid */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Full 30-Juz Quran Memorization Ledger
            </h3>
            <p className="text-xs text-stone-500">
              Visual status for each individual Juz of the Holy Quran for {student.name}.
            </p>
          </div>
        </div>

        <QuranProgressGrid student={student} />
      </Card>

      {/* Guardian & Attendance Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="space-y-3">
          <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Guardian & Emergency Contact</span>
          </h4>
          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">Guardian Name:</span>
              <span className="font-semibold">{student.guardianName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Guardian Phone:</span>
              <span className="font-mono">{student.guardianPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">SMS Daily Reports:</span>
              <Badge variant="emerald">Active</Badge>
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Daily Attendance & Discipline Record</span>
          </h4>
          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex justify-between">
              <span className="text-stone-500">Today's Status:</span>
              <Badge variant="emerald">{student.dailyAttendance}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Monthly Attendance Rate:</span>
              <span className="font-mono font-bold text-emerald-700">98.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Academic Standing:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">Honor Roll</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal 1: Log Daily Sabaq Form */}
      <Modal
        isOpen={isLogSabaqModalOpen}
        onClose={() => setIsLogSabaqModalOpen(false)}
        title={`Log Daily Sabaq: ${student.name}`}
        subtitle="Record today's recitation progress, surah, ayah boundaries, and evaluation."
      >
        <form onSubmit={handleSaveSabaq} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Sabaq Surah *
            </label>
            <input
              type="text"
              required
              value={sabaqSurah}
              onChange={(e) => setSabaqSurah(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Start Ayah
              </label>
              <input
                type="number"
                min="1"
                value={ayahStart}
                onChange={(e) => setAyahStart(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                End Ayah
              </label>
              <input
                type="number"
                min="1"
                value={ayahEnd}
                onChange={(e) => setAyahEnd(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Sabaqi Juz
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={sabaqiJuz}
                onChange={(e) => setSabaqiJuz(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Manzil Range
              </label>
              <input
                type="text"
                value={manzilJuz}
                onChange={(e) => setManzilJuz(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Tajweed Assessment
              </label>
              <select
                value={tajweedRating}
                onChange={(e) => setTajweedRating(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Needs Revision">Needs Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Completed Juz (0 - 30)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={completedJuz}
                onChange={(e) => setCompletedJuz(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendSmsNotification"
                checked={sendSmsNotification}
                onChange={(e) => setSendSmsNotification(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm"
              />
              <label htmlFor="sendSmsNotification" className="font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer">
                Automatically dispatch instant SMS alert to guardian ({student.parentPhone || student.guardianPhone || '+251 91 190 2831'})
              </label>
            </div>
            <Badge variant="emerald">EthioTel Shortcode 8345</Badge>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={() => setIsLogSabaqModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<Save className="w-4 h-4" />}>
              Save Daily Evaluation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Sabaq SMS Dispatch Modal */}
      <QuickSabaqModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        student={student}
      />

      {/* Modal 2: Official Course Completion & Sanad Certificate Generator (Canvas/PDF) */}
      <CourseCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        student={student}
      />

      <StudentGraduationModal
        isOpen={isGraduationModalOpen}
        student={student}
        onClose={() => setIsGraduationModalOpen(false)}
        onSave={(updates) => updateStudent(student.id, updates)}
      />
    </div>
  );
};
