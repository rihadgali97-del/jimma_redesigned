import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Student } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface StudentGrowthChartsProps {
  student: Student;
  className?: string;
  onOpenCertificate?: (presetId?: string) => void;
}

// Generate realistic monthly academic growth data for a student
const generateMonthlyGrowthData = (student: Student, timeframe: '6m' | '10m' | '24m') => {
  const currentJuz = student.quranJuzCompleted;
  const currentScore = student.examScoreAvg || 92;
  const currentAttendance = student.attendanceRate || 95;

  const months10 = [
    { month: 'Sep', monthFull: 'September' },
    { month: 'Oct', monthFull: 'October' },
    { month: 'Nov', monthFull: 'November' },
    { month: 'Dec', monthFull: 'December' },
    { month: 'Jan', monthFull: 'January' },
    { month: 'Feb', monthFull: 'February' },
    { month: 'Mar', monthFull: 'March (Ramadan)' },
    { month: 'Apr', monthFull: 'April (Eid)' },
    { month: 'May', monthFull: 'May' },
    { month: 'Jun', monthFull: 'June' },
  ];

  const count = timeframe === '6m' ? 6 : timeframe === '10m' ? 10 : 12;
  const selectedMonths = months10.slice(0, count);

  // Progressive curves leading up to current student state
  const step = Math.max(0.4, currentJuz / Math.max(1, count));

  return selectedMonths.map((m, idx) => {
    const progressFactor = (idx + 1) / count;
    // Cumulative Juz completed (gradual growth curve)
    const rawJuz = Math.min(30, Math.max(1, Math.round(currentJuz * progressFactor * 10) / 10));
    const targetJuz = Math.min(30, Math.round((idx + 1) * (30 / 12) * 10) / 10);
    const classAvgJuz = Math.min(30, Math.round(rawJuz * 0.85 * 10) / 10);

    // Monthly velocity in newly memorized Ayahs / Pages
    const monthlyAyahs = Math.round(140 + Math.sin(idx * 0.8) * 35 + (idx === 6 ? 60 : 0)); // Ramadan boost
    const monthlyPages = Math.round(monthlyAyahs / 15);

    // Exam score with slight natural fluctuation
    const examScore = Math.min(100, Math.max(70, Math.round(currentScore - 6 + idx * 0.9 + (idx % 2 === 0 ? 2 : -1))));
    const tajweedScore = Math.min(100, Math.max(65, Math.round(80 + idx * 1.8)));
    const attendance = Math.min(100, Math.max(80, Math.round(currentAttendance - 4 + (idx % 3))));
    const retentionRate = Math.min(100, Math.max(75, Math.round(84 + idx * 1.4)));

    return {
      month: m.month,
      monthFull: m.monthFull,
      completedJuz: rawJuz,
      targetJuz: Math.min(30, Number(targetJuz.toFixed(1))),
      classAvgJuz: Math.min(30, Number(classAvgJuz.toFixed(1))),
      monthlyAyahs,
      monthlyPages,
      examScore,
      tajweedScore,
      attendance,
      retentionRate,
    };
  });
};

// Course curriculum completion modules
const getCourseCurriculumData = (student: Student) => {
  const hifzCompletion = Math.min(100, Math.round((student.quranJuzCompleted / 30) * 100));
  const examAvg = student.examScoreAvg || 90;

  return [
    {
      subject: 'Quran Hifz (Tahfeez)',
      arabicName: 'حفظ القرآن الكريم',
      completion: hifzCompletion,
      score: Math.min(100, Math.round(examAvg + 2)),
      benchmark: 85,
      creditHours: 120,
      status: hifzCompletion >= 100 ? 'Completed' : 'In Progress',
      instructor: student.teacherName || 'Ustadh Yusuf Ali',
      grade: student.tajweedRating,
      milestone: `${student.quranJuzCompleted} / 30 Juz`,
    },
    {
      subject: 'Applied Tajweed & Makharij',
      arabicName: 'التجويد ومخارج الحروف',
      completion: Math.min(100, Math.round(40 + (student.quranJuzCompleted / 30) * 60)),
      score: student.tajweedRating === 'Excellent' ? 96 : student.tajweedRating === 'Very Good' ? 88 : 80,
      benchmark: 85,
      creditHours: 45,
      status: 'In Progress',
      instructor: 'Ustadha Maryam Kedir',
      grade: student.tajweedRating,
      milestone: 'Tuhfat al-Atfal & Al-Jazariyyah',
    },
    {
      subject: 'Fiqh al-Ibadat (Jurisprudence)',
      arabicName: 'فقه العبادات',
      completion: Math.min(100, Math.round(30 + (student.quranJuzCompleted / 30) * 55)),
      score: Math.min(100, Math.round(examAvg - 3)),
      benchmark: 80,
      creditHours: 35,
      status: 'In Progress',
      instructor: 'Ustadh Fuad Jamal',
      grade: 'Very Good',
      milestone: 'Taharah, Salah & Sawm Rules',
    },
    {
      subject: 'Hadith Studies (Arba\'in Nawawi)',
      arabicName: 'الأربعين النووية',
      completion: Math.min(100, Math.round(25 + (student.quranJuzCompleted / 30) * 65)),
      score: Math.min(100, Math.round(examAvg - 1)),
      benchmark: 80,
      creditHours: 30,
      status: 'In Progress',
      instructor: 'Ustadh Ridwan Kedir',
      grade: 'Excellent',
      milestone: '32 of 40 Hadiths Memorized',
    },
    {
      subject: 'Arabic Morphology & Grammar (Sarf/Nahw)',
      arabicName: 'قواعد اللغة العربية',
      completion: Math.min(100, Math.round(20 + (student.quranJuzCompleted / 30) * 60)),
      score: Math.min(100, Math.round(examAvg - 6)),
      benchmark: 75,
      creditHours: 50,
      status: 'In Progress',
      instructor: 'Ustadh Shafi Kemal',
      grade: 'Good',
      milestone: 'Al-Ajrumiyyah Foundation',
    },
    {
      subject: 'Islamic Ethics, Adab & Seerah',
      arabicName: 'الآداب الإسلامية والسيرة',
      completion: Math.min(100, Math.round(50 + (student.quranJuzCompleted / 30) * 50)),
      score: 95,
      benchmark: 85,
      creditHours: 25,
      status: 'Completed',
      instructor: student.teacherName,
      grade: 'Excellent',
      milestone: 'Makkan & Madinan Period',
    },
  ];
};

export const StudentGrowthCharts: React.FC<StudentGrowthChartsProps> = ({
  student,
  className = '',
  onOpenCertificate,
}) => {
  const [timeframe, setTimeframe] = useState<'6m' | '10m' | '24m'>('10m');
  const [activeTab, setActiveTab] = useState<'growth' | 'courses' | 'performance' | 'radar'>('growth');

  const monthlyData = useMemo(
    () => generateMonthlyGrowthData(student, timeframe),
    [student, timeframe]
  );

  const curriculumCourses = useMemo(
    () => getCourseCurriculumData(student),
    [student]
  );

  // Radar data format for multi-disciplinary competence
  const radarData = useMemo(() => {
    return curriculumCourses.map((c) => ({
      subject: c.subject.split(' ')[0], // short label
      fullName: c.subject,
      studentScore: c.score,
      completion: c.completion,
      benchmark: c.benchmark,
    }));
  }, [curriculumCourses]);

  // Projected Khatm Velocity calculations
  const velocityMetrics = useMemo(() => {
    const juzCompleted = student.quranJuzCompleted;
    const remainingJuz = Math.max(0, 30 - juzCompleted);
    const avgMonthlyRate = 0.85; // Juz per month
    const monthsToComplete = Math.ceil(remainingJuz / avgMonthlyRate);

    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete);
    const projectedDateString = projectedDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    return {
      juzCompleted,
      remainingJuz,
      avgMonthlyRate,
      monthsToComplete,
      projectedDateString,
      retentionScore: 94,
      totalAyahsEstimated: Math.round((juzCompleted / 30) * 6236),
    };
  }, [student]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header with Tab Controls & Timeframe Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Academic Growth & Course Completion Analytics
              </h3>
              <p className="text-xs text-stone-500">
                Continuous performance trends, memorization velocity, and curriculum mastery over time for {student.name}.
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Timeframe */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Main Chart Type Tabs */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveTab('growth')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'growth'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Hifz Trajectory
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('courses')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'courses'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Course Completion
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'performance'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Evaluation Trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'radar'
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Subject Radar
            </button>
          </div>

          {/* Timeframe selector (for time-series tabs) */}
          {(activeTab === 'growth' || activeTab === 'performance') && (
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setTimeframe('6m')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframe === '6m'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('10m')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeframe === '10m'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                10M (Full Term)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">
            Memorization Pace
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              +{velocityMetrics.avgMonthlyRate}
            </span>
            <span className="text-xs text-stone-500">Juz / Month</span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
            <Sparkles className="w-3 h-3" /> +18% above cohort avg
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">
            Estimated Khatm Date
          </span>
          <div className="text-lg font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">
            {student.quranJuzCompleted >= 30 ? 'Completed' : velocityMetrics.projectedDateString}
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">
            {student.quranJuzCompleted >= 30
              ? 'Sanad Ijazah Awarded'
              : `~${velocityMetrics.monthsToComplete} months remaining`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">
            Verses Memorized
          </span>
          <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
            {velocityMetrics.totalAyahsEstimated.toLocaleString()}
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            of 6,236 Quranic Ayahs
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">
            Revision Retention Index
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {velocityMetrics.retentionScore}%
            </span>
            <Badge variant="emerald" size="sm">
              Grade A
            </Badge>
          </div>
          <span className="text-[10px] text-stone-400 block mt-0.5">
            Sabqi & Manzil cycle verified
          </span>
        </div>
      </div>

      {/* CHART VIEW 1: Hifz Trajectory & Juz Growth Over Time */}
      {activeTab === 'growth' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600" />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  Student Cumulative Juz ({student.quranJuzCompleted} Juz)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500" />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  Target Curriculum Pace
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-stone-400" />
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  Classroom Cohort Average
                </span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">Y-Axis: Total Juz (0 to 30)</span>
          </div>

          {/* Recharts Area / Composed Chart */}
          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  domain={[0, 30]}
                  ticks={[0, 5, 10, 15, 20, 25, 30]}
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs w-52 space-y-1.5">
                          <div className="font-bold text-amber-400 border-b border-stone-800 pb-1 flex justify-between">
                            <span>{data.monthFull}</span>
                            <span className="text-stone-400 font-mono">Academic Track</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Completed Juz:</span>
                            <span className="font-mono font-bold text-white">{data.completedJuz} / 30 Juz</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400">Target Pace:</span>
                            <span className="font-mono text-stone-300">{data.targetJuz} Juz</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Class Average:</span>
                            <span className="font-mono text-stone-300">{data.classAvgJuz} Juz</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-stone-800 text-[11px] text-emerald-300 font-medium">
                            <span>New Pages Memorized:</span>
                            <span className="font-mono">+{data.monthlyPages} pgs ({data.monthlyAyahs} ayahs)</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={15} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Half Quran (15 Juz)', position: 'insideTopRight', fill: '#d97706', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Khatm Sanad (30 Juz)', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />

                <Area
                  type="monotone"
                  dataKey="completedJuz"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                  name="Student Progress"
                />
                <Line
                  type="monotone"
                  dataKey="targetJuz"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Curriculum Target"
                />
                <Line
                  type="monotone"
                  dataKey="classAvgJuz"
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  dot={false}
                  name="Class Average"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Velocity Histogram Strip */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                Monthly Recitation & Memorization Volume (New Ayahs Mastered)
              </span>
              <span className="text-[11px] text-stone-400 font-mono">Average: 145 Ayahs / Month</span>
            </div>
            <div className="w-full h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-stone-900 text-stone-100 p-2 rounded-lg text-xs font-mono">
                            <span className="text-emerald-400 font-bold">{d.month}:</span> {d.monthlyAyahs} Ayahs (~{d.monthlyPages} pages)
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="monthlyAyahs" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* CHART VIEW 2: Course & Subject Curriculum Completion */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Course Syllabus Completion (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Examination Score (%)</span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">Benchmark Threshold: 85%</span>
          </div>

          {/* Grouped Bar Chart for Course Completion vs Scores */}
          <div className="w-full h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={curriculumCourses}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} stroke="#888888" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="subject"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  width={140}
                  tickFormatter={(val) => val.split('(')[0].trim()}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs w-60 space-y-1.5">
                          <div className="font-bold text-amber-400 border-b border-stone-800 pb-1">
                            {data.subject}
                          </div>
                          <div className="text-[11px] text-stone-400 font-serif">
                            {data.arabicName}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Completion:</span>
                            <span className="font-mono font-bold text-white">{data.completion}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400">Exam Grade:</span>
                            <span className="font-mono font-bold text-white">{data.score}% ({data.grade})</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-stone-400">
                            <span>Milestone:</span>
                            <span className="font-semibold text-stone-200">{data.milestone}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-stone-400">
                            <span>Instructor:</span>
                            <span className="text-stone-300">{data.instructor}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={85} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Pass Benchmark (85%)', position: 'top', fill: '#d97706', fontSize: 10 }} />
                <Bar dataKey="completion" fill="#059669" name="Completion %" radius={[0, 4, 4, 0]} />
                <Bar dataKey="score" fill="#d97706" name="Exam Grade %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Modules Detail List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {curriculumCourses.map((c) => (
              <div
                key={c.subject}
                className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        {c.subject}
                      </h4>
                      <span className="text-[11px] text-stone-500 font-serif">
                        {c.arabicName}
                      </span>
                    </div>
                    <Badge variant={c.completion >= 100 ? 'emerald' : 'blue'} size="sm">
                      {c.completion >= 100 ? 'Completed' : `${c.completion}% Done`}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-emerald-600" />
                    <span>Current Unit: <strong>{c.milestone}</strong></span>
                  </p>
                </div>

                {/* Progress bar and Certificate Trigger */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                      <span>Progress</span>
                      <span>Exam: {c.score}% ({c.grade})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${c.completion}%` }}
                      />
                    </div>
                  </div>

                  {onOpenCertificate && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const presetId = c.subject.includes('Quran')
                            ? 'khatm_quran'
                            : c.subject.includes('Tajweed')
                            ? 'tajweed_mastery'
                            : c.subject.includes('Fiqh')
                            ? 'fiqh_ibadat'
                            : c.subject.includes('Hadith')
                            ? 'hadith_studies'
                            : c.subject.includes('Arabic')
                            ? 'arabic_grammar'
                            : 'ethics_seerah';
                          onOpenCertificate(presetId);
                        }}
                        className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-200/80 dark:border-amber-800/80 transition-colors"
                      >
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Generate PDF Certificate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHART VIEW 3: Performance, Examination & Evaluation Trends */}
      {activeTab === 'performance' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-600" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Exam Assessment Average (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-amber-500" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Tajweed Accuracy Index (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500" />
                <span className="font-medium text-stone-700 dark:text-stone-300">Attendance & Punctuality (%)</span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">Passing Grade: 75%</span>
          </div>

          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-stone-800" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-3 rounded-xl shadow-xl border border-stone-700 text-xs w-52 space-y-1.5">
                          <div className="font-bold text-amber-400 border-b border-stone-800 pb-1">
                            {data.monthFull} Evaluation
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Exam Average:</span>
                            <span className="font-mono font-bold text-white">{data.examScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400">Tajweed Index:</span>
                            <span className="font-mono text-white">{data.tajweedScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-400">Attendance:</span>
                            <span className="font-mono text-white">{data.attendance}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-400">Manzil Retention:</span>
                            <span className="font-mono text-white">{data.retentionRate}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Passing Cutoff (75%)', position: 'insideBottomRight', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={90} stroke="#059669" strokeDasharray="3 3" label={{ value: 'Honor Roll (90%)', position: 'insideTopRight', fill: '#059669', fontSize: 10 }} />
                <Line type="monotone" dataKey="examScore" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} name="Exam Score" />
                <Line type="monotone" dataKey="tajweedScore" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="Tajweed" />
                <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="3 3" name="Attendance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CHART VIEW 4: Multi-Disciplinary Competency Radar */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center animate-in fade-in duration-200">
          <div className="lg:col-span-7 w-full h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" className="dark:stroke-stone-800" />
                <PolarAngleAxis dataKey="subject" stroke="#888888" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#888888" fontSize={9} />
                <Radar
                  name="Student Score"
                  dataKey="studentScore"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Course Completion"
                  dataKey="completion"
                  stroke="#d97706"
                  fill="#d97706"
                  fillOpacity={0.2}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-2.5 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-amber-400 block">{d.fullName}</span>
                          <div className="flex justify-between gap-3 text-stone-300">
                            <span>Score:</span> <span className="font-mono font-bold text-emerald-400">{d.studentScore}%</span>
                          </div>
                          <div className="flex justify-between gap-3 text-stone-300">
                            <span>Completion:</span> <span className="font-mono font-bold text-amber-400">{d.completion}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-5 space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
              <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Curriculum Competence Balance
              </span>
              <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                The multi-axial radar demonstrates comprehensive balance across Quran memorization, applied tajweed rules,
                and core Islamic legal fundamentals. The student maintains above benchmark standards across all key subjects.
              </p>
            </div>

            <div className="space-y-2">
              {curriculumCourses.map((c) => (
                <div
                  key={c.subject}
                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 text-[11px]"
                >
                  <span className="font-medium text-stone-800 dark:text-stone-200 truncate max-w-[180px]">
                    {c.subject}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{c.score}%</span>
                    <span className="text-stone-400">|</span>
                    <span className="text-amber-600 dark:text-amber-400">{c.completion}% Done</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
