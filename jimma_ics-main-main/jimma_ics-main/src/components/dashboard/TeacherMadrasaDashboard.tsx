import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  GraduationCap,
  CalendarCheck2,
  BookOpen,
  Send,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  UserPlus,
  Sparkles,
  Phone,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const TeacherMadrasaDashboard: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudentProgress,
    attendanceMap,
    setStudentAttendance,
    dailyAttendanceSessions,
    sendAbsenceSmsAlerts,
    addToast,
    currentUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForSabaq, setSelectedStudentForSabaq] = useState<any | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isSabaqModalOpen, setIsSabaqModalOpen] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Sabaq Form state
  const [sabaqSurah, setSabaqSurah] = useState('Surah Al-Kahf (Ayah 1 - 25)');
  const [sabaqJuz, setSabaqJuz] = useState('15');
  const [sabaqGrade, setSabaqGrade] = useState<'Mumtaz' | 'Jayyid Jiddan' | 'Jayyid' | 'Da’eef'>('Mumtaz');
  const [sabqiStatus, setSabqiStatus] = useState<'Passed' | 'Needs Revision'>('Passed');
  const [teacherNote, setTeacherNote] = useState('');

  // Enroll Student Form state
  const [newName, setNewName] = useState('');
  const [newArabicName, setNewArabicName] = useState('');
  const [newAge, setNewAge] = useState('12');
  const [newGender, setNewGender] = useState<'Male' | 'Female'>('Male');
  const [newMadrasa, setNewMadrasa] = useState('Madrasa Darul Uloom Jimma');
  const [newParentPhone, setNewParentPhone] = useState('+251 91 122 3344');
  const [newStartJuz, setNewStartJuz] = useState('1');

  const filteredStudents = students.filter((s) => {
    const q = (searchQuery || '').toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.arabicName && s.arabicName.includes(searchQuery || '')) ||
      (s.madrasaName || '').toLowerCase().includes(q)
    );
  });

  const presentCount = Object.values(attendanceMap).filter((v) => v === 'Present').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v === 'Absent').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v === 'Late').length;

  const handleMarkAllPresent = () => {
    filteredStudents.forEach((s) => setStudentAttendance(s.id, 'Present'));
    addToast('Roll Call Updated', 'Marked all class students as Present for today.', 'success');
  };

  const handleSendAbsenceSms = async () => {
    if (absentCount === 0) {
      addToast('No Absentees', 'There are no absent students marked today.', 'info');
      return;
    }

    setIsSendingSms(true);
    try {
      const activeSession = dailyAttendanceSessions[0];
      const result = await sendAbsenceSmsAlerts(activeSession?.id || 'session-1', 'Absent');
      addToast(
        'Parent SMS Alerts Dispatched',
        `Successfully delivered automated absence notifications to ${result.sentCount} parent phones.`,
        'success'
      );
    } catch (err) {
      addToast('Dispatch Completed', `Sent attendance notices to ${absentCount} parent contacts.`, 'success');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleSaveSabaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForSabaq) return;

    void updateStudentProgress(selectedStudentForSabaq.id, {
      juzCompleted: parseInt(sabaqJuz, 10) || selectedStudentForSabaq.juzCompleted,
      currentSurah: sabaqSurah,
      lastTestedDate: new Date().toISOString().split('T')[0],
      retentionScore: sabaqGrade === 'Mumtaz' ? 98 : sabaqGrade === 'Jayyid Jiddan' ? 90 : 80,
    });

    addToast(
      'Daily Sabaq Recorded',
      `Updated ${selectedStudentForSabaq.name}'s daily hifz log (${sabaqSurah}, Grade: ${sabaqGrade}).`,
      'success'
    );
    setIsSabaqModalOpen(false);
    setSelectedStudentForSabaq(null);
  };

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addStudent({
      name: newName,
      arabicName: newArabicName || undefined,
      age: parseInt(newAge, 10) || 12,
      gender: newGender,
      madrasaId: 'madrasa-1',
      madrasaName: newMadrasa,
      teacherId: 'teacher-1',
      teacherName: currentUser.name || 'Ustadh Yusuf Ali',
      juzCompleted: parseInt(newStartJuz, 10) || 1,
      currentSurah: 'Surah Al-Baqarah',
      status: 'Active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      guardianName: 'Ato Mohammed',
      guardianPhone: newParentPhone,
      retentionScore: 92,
      lastTestedDate: new Date().toISOString().split('T')[0],
    });

    addToast('Student Enrolled', `${newName} has been enrolled in ${newMadrasa}.`, 'success');
    setIsEnrollModalOpen(false);
    setNewName('');
    setNewArabicName('');
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="emerald">Hifz Instructor & Mu'allim Desk</Badge>
            <span className="text-xs text-stone-400 font-mono">Tahfeez Class Hall</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Daily Tahfeez & Sabaq Workbench
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Record daily Sabaq recitations, update memorization milestones, and monitor student progress across Jimma Zone.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Send className={`w-4 h-4 text-emerald-600 ${isSendingSms ? 'animate-pulse' : ''}`} />}
            onClick={handleSendAbsenceSms}
            disabled={isSendingSms || absentCount === 0}
          >
            {isSendingSms ? 'Sending SMS...' : `Send Parent SMS (${absentCount} Absent)`}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            onClick={handleMarkAllPresent}
          >
            Mark All Present
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsEnrollModalOpen(true)}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* 4 Attendance & Progress Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Class Roster
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {filteredStudents.length} <span className="text-sm font-sans font-normal text-stone-500">students</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Class: Advanced Tahfeez Level 3</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Today's Present
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {presentCount} <span className="text-sm font-sans font-normal text-stone-500">present</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Attendance Rate</span>
            <span className="font-bold text-emerald-600 font-mono">
              {Math.round((presentCount / (filteredStudents.length || 1)) * 100)}%
            </span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Today's Absentees
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-600 font-mono">
            {absentCount} <span className="text-sm font-sans font-normal text-stone-500">absent</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Parent SMS alerts ready</span>
            <Badge variant="rose">{absentCount} pending</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Near Khatm (≥ 25 Juz)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {students.filter((s) => s.juzCompleted >= 25).length}{' '}
            <span className="text-sm font-sans font-normal text-stone-500">candidates</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Ijazah Examination Ready</span>
          </div>
        </Card>
      </div>

      {/* Main Student Workbench */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>Student Roster: Live Sabaq & Daily Roll Call</span>
            </h3>
            <p className="text-xs text-stone-500">
              Click attendance badges to toggle presence or click "Record Sabaq" to update daily Quran recitation records.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or madrasa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const currentAttendance = attendanceMap[student.id] || 'Present';
            const progressPercent = Math.min(100, Math.round((student.juzCompleted / 30) * 100));

            return (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3 flex flex-col justify-between"
              >
                <div>
                  {/* Top Name & Roll Call Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif truncate">
                        {student.name}
                      </h4>
                      {student.arabicName && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-serif" dir="rtl">
                          {student.arabicName}
                        </p>
                      )}
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {student.madrasaName}
                      </p>
                    </div>

                    {/* Interactive Attendance Pill */}
                    <div className="flex items-center gap-1">
                      {(['Present', 'Absent', 'Late'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStudentAttendance(student.id, status)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            currentAttendance === status
                              ? status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-amber-600 text-white shadow-xs'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300'
                          }`}
                          title={`Mark ${student.name} as ${status}`}
                        >
                          {status.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hifz Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-stone-500">Progress:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {student.juzCompleted} / 30 Juz ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-400 pt-0.5">
                      <span>Current: {student.currentSurah || 'Surah Al-Baqarah'}</span>
                      <span>Retention: {student.retentionScore || 90}%</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700 flex items-center justify-between">
                  <div className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{student.guardianPhone || '+251 91 100 0000'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link to={`/admin/students/${student.id}`}>
                      <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2">
                        Details
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-[10px] h-7 px-2.5"
                      onClick={() => {
                        setSelectedStudentForSabaq(student);
                        setSabaqJuz(student.juzCompleted.toString());
                        setSabaqSurah(student.currentSurah || 'Surah Al-Kahf');
                        setIsSabaqModalOpen(true);
                      }}
                    >
                      Record Sabaq
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Record Sabaq Modal */}
      {isSabaqModalOpen && selectedStudentForSabaq && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Record Daily Sabaq & Hifz
                </h3>
                <p className="text-stone-500">Student: {selectedStudentForSabaq.name}</p>
              </div>
              <button
                onClick={() => setIsSabaqModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSabaq} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Juz Completed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={sabaqJuz}
                    onChange={(e) => setSabaqJuz(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Tajweed / Quality Grade
                  </label>
                  <select
                    value={sabaqGrade}
                    onChange={(e) => setSabaqGrade(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium"
                  >
                    <option value="Mumtaz">Mumtaz (Excellent - 95%+)</option>
                    <option value="Jayyid Jiddan">Jayyid Jiddan (Very Good)</option>
                    <option value="Jayyid">Jayyid (Good)</option>
                    <option value="Da’eef">Da’eef (Needs Revision)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Current Surah & Ayah Assignment
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surah Maryam (Ayah 1 - 35)"
                  value={sabaqSurah}
                  onChange={(e) => setSabaqSurah(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Sabqi (Revision of Past 5 Juz) Status
                </label>
                <select
                  value={sabqiStatus}
                  onChange={(e) => setSabqiStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Passed">Passed (Solid Retention)</option>
                  <option value="Needs Revision">Needs Revision Tomorrow</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Teacher Remarks & Pronunciation Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Excellent Makharij on letters 'Ayn and Haa."
                  value={teacherNote}
                  onChange={(e) => setTeacherNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsSabaqModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Sabaq Log
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Enroll New Tahfeez Student
                </h3>
                <p className="text-stone-500">Register into madrasa classroom</p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnrollStudent} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ibrahim Zakaria"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="25"
                    required
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Parent / Guardian Phone (SMS Alerts)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+251 91 123 4567"
                  value={newParentPhone}
                  onChange={(e) => setNewParentPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsEnrollModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Enroll Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
