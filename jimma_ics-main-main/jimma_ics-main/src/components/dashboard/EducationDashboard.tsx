import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  GraduationCap,
  Users2,
  Award,
  Plus,
  Radio,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const EducationDashboard: React.FC = () => {
  const {
    madrasas,
    students,
    teachers,
    dailyAttendanceSessions,
    dispatchMessage,
    addToast,
    currentUser,
  } = useApp();

  const [isAccreditModalOpen, setIsAccreditModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isCircularModalOpen, setIsCircularModalOpen] = useState(false);

  // Form states
  const [selectedMadrasaId, setSelectedMadrasaId] = useState(madrasas[0]?.id || '');
  const [accreditationLevel, setAccreditationLevel] = useState<'Accredited' | 'Provisional' | 'Excellence'>('Accredited');
  const [inspectorNotes, setInspectorNotes] = useState('');

  const [examName, setExamName] = useState('Zone-Wide Complete Quran (30 Juz) Certification Exam');
  const [examDate, setExamDate] = useState('2026-09-25');
  const [examVenue, setExamVenue] = useState('Grand Anwar Tahfeez Hall, Jimma Central');
  const [examCandidatesCount, setExamCandidatesCount] = useState('45');

  const [circularSubject, setCircularSubject] = useState('Updated Semester 2 Tajweed & Sabaq Guidelines');
  const [circularMessage, setCircularMessage] = useState(
    'Assalamu Alaikum. The Education Directorate reminds all accredited madrasas to submit monthly hifz progress rosters by the 25th of this month.'
  );

  const totalHuffaz = students.filter((s) => s.juzCompleted >= 30).length;
  const advancedHifzStudents = students.filter((s) => s.juzCompleted >= 15).length;
  const certifiedTeachers = teachers.filter((t) => t.isCertified).length;

  const handleAccreditMadrasa = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMad = madrasas.find((m) => m.id === selectedMadrasaId);
    if (!targetMad) return;

    addToast(
      'Madrasa Accredited',
      `${targetMad.name} has been granted "${accreditationLevel}" accreditation status.`,
      'success'
    );
    setIsAccreditModalOpen(false);
    setInspectorNotes('');
  };

  const handleScheduleExam = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      'Hifz Assessment Scheduled',
      `"${examName}" scheduled for ${examDate} at ${examVenue} with ${examCandidatesCount} candidates.`,
      'success'
    );
    setIsExamModalOpen(false);
  };

  const handleBroadcastCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularMessage.trim()) return;

    try {
      await dispatchMessage({
        type: 'Madrasa_Circular',
        recipientGroup: 'All Madrasa Administrators & Head Teachers (42 recipients)',
        channel: 'SMS_AND_TELEGRAM',
        messageContent: `[JIMMA ISLAMIC COUNCIL - EDUCATION] ${circularSubject}: ${circularMessage}`,
        authorName: currentUser.name,
      });

      addToast(
        'Circular Dispatched',
        `Broadcast sent to all 42 registered madrasa administrators.`,
        'success'
      );
      setIsCircularModalOpen(false);
    } catch (err) {
      addToast('Dispatch Error', 'Failed to dispatch circular message.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Education Directorate</Badge>
            <span className="text-xs text-stone-400 font-mono">Curriculum & Hifz Board</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Islamic Education & Tahfeez Directorate
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Zone-wide management of Quranic madrasas, student Hifz milestone testing, mu'allim certifications, and daily roll calls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Radio className="w-4 h-4 text-purple-600" />}
            onClick={() => setIsCircularModalOpen(true)}
          >
            Dispatch Circular
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Award className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsExamModalOpen(true)}
          >
            Schedule Assessment
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<BadgeCheck className="w-4 h-4" />}
            onClick={() => setIsAccreditModalOpen(true)}
          >
            Accredit Madrasa
          </Button>
        </div>
      </div>

      {/* 4 Core Education Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Registered Madrasas
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {madrasas.length} <span className="text-sm font-sans font-normal text-stone-500">centers</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Standardized Curriculum</span>
            <Badge variant="emerald">100% Active</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Tahfeez Students
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {students.length} <span className="text-sm font-sans font-normal text-stone-500">enrolled</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>{advancedHifzStudents} students ≥ 15 Juz</span>
            <span className="text-blue-600 font-semibold font-mono">88% retention</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Graduated Huffaz
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {totalHuffaz + 24} <span className="text-sm font-sans font-normal text-stone-500">certified</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Sanad & Ijazah holders</span>
            <Badge variant="gold">Zone-Wide</Badge>
          </div>
        </Card>

        <Link to="/admin/teachers" className="block transition-transform hover:-translate-y-0.5">
          <Card className="space-y-2 h-full hover:border-emerald-500/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Faculty & Mu'allims
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
                <Users2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
              {teachers.length} <span className="text-sm font-sans font-normal text-stone-500">teachers</span>
            </div>
            <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
              <span>{certifiedTeachers} Council-Certified</span>
              <span className="text-emerald-600 font-semibold">100% licensed →</span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Main Grid: Madrasa Inspection & Hifz Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Madrasa Directory & Inspection Status */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <span>Madrasa Accreditation & Inspection Matrix</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Real-time status of Islamic institutions, student capacity, and teacher ratios.
                </p>
              </div>
              <Link to="/admin/madrasas">
                <Button variant="ghost" size="sm" className="text-xs">
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {madrasas.map((mad) => (
                <div
                  key={mad.id}
                  className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase block">
                        ID: {mad.id} • {mad.district}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                        {mad.name}
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Head: <span className="font-semibold">{mad.headTeacher}</span>
                      </p>
                    </div>
                    <Badge variant="gold">{mad.accreditationStatus || 'Accredited'}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 uppercase block">Students</span>
                      <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                        {mad.totalStudents}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 uppercase block">Faculty</span>
                      <span className="font-bold font-mono text-emerald-600">
                        {mad.totalTeachers} Mu'allims
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-center">
                      <span className="text-[10px] text-stone-400 uppercase block">Shift</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
                        {(mad.shifts || []).join(', ') || 'Morning'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200/60 dark:border-stone-700">
                    <span className="text-stone-400 text-[11px]">
                      Curriculum: {mad.curriculumLevel || 'Standardized Council Tier 1'}
                    </span>
                    <Link to={`/madrasas/${mad.id}`}>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                        Inspect Dossier <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 5 cols: Hifz Assessment Board & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Centralized Hifz Board */}
          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span>Upcoming Tahfeez Certifications</span>
            </h3>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-stone-100 font-serif">
                  Annual 30-Juz Khatm Assessment
                </span>
                <Badge variant="gold">In 23 Days</Badge>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Centralized evaluation board presided by Sheikh Abdullah Al-Jimmawi and senior Huffaz committee.
              </p>
              <div className="space-y-1.5 text-stone-500 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                <div className="flex justify-between">
                  <span>Candidates Registered:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100">45 Huffaz</span>
                </div>
                <div className="flex justify-between">
                  <span>Examination Venue:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">Grand Anwar Mosque</span>
                </div>
              </div>
            </div>

            <Link to="/admin/students">
              <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                Inspect All Student Hifz Progress Cards
              </Button>
            </Link>
          </Card>

          {/* Teacher Credentials Desk */}
          <Card className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Teacher Licensing Status
            </h3>
            <div className="space-y-2 text-xs">
              {teachers.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                      {t.name}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {t.madrasaName} • {t.specialization}
                    </div>
                  </div>
                  <Badge variant={t.isCertified ? 'emerald' : 'gold'}>
                    {t.isCertified ? 'Licensed' : 'Provisional'}
                  </Badge>
                </div>
              ))}
            </div>

            <Link to="/admin/teachers" className="block pt-1">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                Manage All {teachers.length} Teachers
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Accredit Madrasa Modal */}
      {isAccreditModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Accredit Quranic Madrasa
                </h3>
                <p className="text-stone-500">Issue official council license</p>
              </div>
              <button
                onClick={() => setIsAccreditModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAccreditMadrasa} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Select Madrasa
                </label>
                <select
                  value={selectedMadrasaId}
                  onChange={(e) => setSelectedMadrasaId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  {madrasas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Accreditation Tier
                </label>
                <select
                  value={accreditationLevel}
                  onChange={(e) => setAccreditationLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Accredited">Standard Accreditation (Tier 1)</option>
                  <option value="Excellence">Center of Excellence (Tier 2 Advanced)</option>
                  <option value="Provisional">Provisional License (1-Year Review)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Inspection Board Comments
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified 12 classrooms, wudhu facilities, and approved 6 certified mu'allims."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsAccreditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Sign & Issue License
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Assessment Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Schedule Centralized Hifz Exam
                </h3>
                <p className="text-stone-500">Convene examiners and register candidate cohort</p>
              </div>
              <button
                onClick={() => setIsExamModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleExam} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Exam / Certification Title
                </label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Expected Candidates
                  </label>
                  <input
                    type="number"
                    required
                    value={examCandidatesCount}
                    onChange={(e) => setExamCandidatesCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  required
                  value={examVenue}
                  onChange={(e) => setExamVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsExamModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Confirm Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Circular Modal */}
      {isCircularModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Broadcast Circular to Madrasa Heads
                </h3>
                <p className="text-stone-500">Dispatch SMS & Telegram bulletin to 42 administrators</p>
              </div>
              <button
                onClick={() => setIsCircularModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBroadcastCircular} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Circular Subject / Directive
                </label>
                <input
                  type="text"
                  required
                  value={circularSubject}
                  onChange={(e) => setCircularSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  value={circularMessage}
                  onChange={(e) => setCircularMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsCircularModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Dispatch Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
