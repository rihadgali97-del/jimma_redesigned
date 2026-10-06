import React, { useState } from 'react';
import { Student } from '../../types';
import { CheckCircle, Clock, BookOpen, Award, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface QuranProgressGridProps {
  student: Student;
  className?: string;
  onUpdateJuz?: (juzNumber: number, progress: number) => void;
}

export const QuranProgressGrid: React.FC<QuranProgressGridProps> = ({
  student,
  className = '',
}) => {
  const [activeJuz, setActiveJuz] = useState<number>(student.currentJuz || 1);

  // Juz names / starting Surahs
  const juzNames: Record<number, { name: string; arabic: string; surah: string }> = {
    1: { name: 'Alif Lam Meem', arabic: 'الم', surah: 'Al-Fatiha 1 - Al-Baqarah 141' },
    2: { name: 'Sayaqool', arabic: 'سيقول', surah: 'Al-Baqarah 142 - 252' },
    3: { name: 'Tilka Ar-Rusul', arabic: 'تلك الرسل', surah: 'Al-Baqarah 253 - Ali ‘Imran 92' },
    4: { name: 'Lan Tanaloo', arabic: 'لن تنالوا', surah: 'Ali ‘Imran 93 - An-Nisa 23' },
    5: { name: 'Wal Muhsanat', arabic: 'والمحصنات', surah: 'An-Nisa 24 - 147' },
    6: { name: 'La Yuhibbullah', arabic: 'لا يحب الله', surah: 'An-Nisa 148 - Al-Ma’idah 81' },
    7: { name: 'Wa Iza Sami’oo', arabic: 'وإذا سمعوا', surah: 'Al-Ma’idah 82 - Al-An’am 110' },
    8: { name: 'Wa Law Annana', arabic: 'ولو أننا', surah: 'Al-An’am 111 - Al-A’raf 87' },
    9: { name: 'Qalal Mala’u', arabic: 'قال الملأ', surah: 'Al-A’raf 88 - Al-Anfal 40' },
    10: { name: 'Wa A’lamoo', arabic: 'واعلموا', surah: 'Al-Anfal 41 - At-Tawbah 92' },
    11: { name: 'Ya’taziroona', arabic: 'يعتذرون', surah: 'At-Tawbah 93 - Hud 5' },
    12: { name: 'Wa Ma Min Dabbah', arabic: 'وما من دابة', surah: 'Hud 6 - Yusuf 52' },
    13: { name: 'Wa Ma Ubri’u', arabic: 'وما أبرئ', surah: 'Yusuf 53 - Ibrahim 52' },
    14: { name: 'Rubama', arabic: 'ربما', surah: 'Al-Hijr 1 - An-Nahl 128' },
    15: { name: 'Subhanallazi', arabic: 'سبحان الذي', surah: 'Al-Isra 1 - Al-Kahf 74' },
    16: { name: 'Qala Alam', arabic: 'قال ألم', surah: 'Al-Kahf 75 - Ta-Ha 135' },
    17: { name: 'Iqtaraba', arabic: 'اقترب', surah: 'Al-Anbiya 1 - Al-Hajj 78' },
    18: { name: 'Qad Aflaha', arabic: 'قد أفلح', surah: 'Al-Mu’minun 1 - Al-Furqan 20' },
    19: { name: 'Wa Qalal Lazina', arabic: 'وقال الذين', surah: 'Al-Furqan 21 - An-Naml 55' },
    20: { name: 'Amman Khalaqa', arabic: 'أمن خلق', surah: 'An-Naml 56 - Al-Ankabut 45' },
    21: { name: 'Utlu Ma Oohiya', arabic: 'اتل ما أوحي', surah: 'Al-Ankabut 46 - Al-Ahzab 30' },
    22: { name: 'Wa Man Yaqnut', arabic: 'ومن يقنت', surah: 'Al-Ahzab 31 - Ya-Sin 27' },
    23: { name: 'Wa Maliya', arabic: 'وما لي', surah: 'Ya-Sin 28 - Az-Zumar 31' },
    24: { name: 'Fa Man Azlamu', arabic: 'فمن أظلم', surah: 'Az-Zumar 32 - Fussilat 46' },
    25: { name: 'Ilayhi Yuraddu', arabic: 'إليه يرد', surah: 'Fussilat 47 - Al-Jathiyah 37' },
    26: { name: 'Ha-Meem', arabic: 'حم', surah: 'Al-Ahqaf 1 - Adh-Dhariyat 30' },
    27: { name: 'Qala Fama Khatbukum', arabic: 'قال فما خطبكم', surah: 'Adh-Dhariyat 31 - Al-Hadid 29' },
    28: { name: 'Qad Sami’allah', arabic: 'قد سمع الله', surah: 'Al-Mujadila 1 - At-Tahrim 12' },
    29: { name: 'Tabarakallazi', arabic: 'تبارك الذي', surah: 'Al-Mulk 1 - Al-Mursalat 50' },
    30: { name: 'Amma Yatasa’aloon', arabic: 'عم يتساءلون', surah: 'An-Naba 1 - An-Nas 6' },
  };

  const getJuzStatus = (juzNum: number) => {
    if (juzNum <= student.quranJuzCompleted) {
      return { status: 'completed', percent: 100, label: 'Completed' };
    }
    if (juzNum === student.currentJuz) {
      return { status: 'in-progress', percent: student.currentJuzProgress, label: `${student.currentJuzProgress}% In Progress` };
    }
    return { status: 'not-started', percent: 0, label: 'Not Started' };
  };

  const selectedInfo = juzNames[activeJuz] || juzNames[1];
  const selectedStatus = getJuzStatus(activeJuz);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase">
            <CheckCircle className="w-4 h-4" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-1">
            {student.quranJuzCompleted} / 30
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            {Math.round((student.quranJuzCompleted / 30) * 100)}% of Holy Quran
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase">
            <Clock className="w-4 h-4" />
            <span>Current Focus</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-950 dark:text-amber-100 mt-1">
            Juz {student.currentJuz}
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            {student.currentJuzProgress}% Mastered
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Tajweed Level</span>
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {student.tajweedRating}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            Makharij & Ahkam Rules
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
          <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 text-xs font-semibold uppercase">
            <Award className="w-4 h-4" />
            <span>Exam Average</span>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-950 dark:text-blue-100 mt-1">
            {student.examScoreAvg}%
          </div>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
            Council Madrasa Board
          </p>
        </div>
      </div>

      {/* 30 Juz Visual Grid */}
      <div className="p-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
              Quran Memorization Map (30 Ajza')
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click any Juz box below to review lesson breakdown, revision retention, and surahs.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-400" /> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
              <span className="w-3 h-3 rounded-sm bg-stone-200 dark:bg-stone-700" /> Pending
            </span>
          </div>
        </div>

        {/* 30 Interactive Grid Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-2.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const { status, percent } = getJuzStatus(juzNum);
            const isSelected = activeJuz === juzNum;

            let bgClass = 'bg-stone-100 dark:bg-stone-800 text-stone-500 border-stone-200 dark:border-stone-700';
            if (status === 'completed') {
              bgClass = 'bg-emerald-600 dark:bg-emerald-600 text-white border-emerald-700 shadow-xs';
            } else if (status === 'in-progress') {
              bgClass = 'bg-amber-500 dark:bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-xs animate-pulse';
            }

            return (
              <button
                key={juzNum}
                onClick={() => setActiveJuz(juzNum)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-150 cursor-pointer ${bgClass} ${
                  isSelected ? 'ring-3 ring-emerald-500 ring-offset-2 scale-105 z-10' : 'hover:scale-102'
                }`}
              >
                <span className="text-xs font-bold font-mono">Juz {juzNum}</span>
                <span className="text-[10px] opacity-90 truncate max-w-full font-serif">
                  {juzNames[juzNum]?.arabic}
                </span>
                {status === 'completed' && (
                  <Check className="w-3 h-3 absolute top-1 right-1 opacity-80" />
                )}
                {status === 'in-progress' && (
                  <span className="text-[9px] font-mono mt-0.5">{percent}%</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Juz Inspector Banner */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Juz {activeJuz}: {selectedInfo.name} ({selectedInfo.arabic})
              </span>
              <Badge
                variant={
                  selectedStatus.status === 'completed'
                    ? 'emerald'
                    : selectedStatus.status === 'in-progress'
                    ? 'gold'
                    : 'slate'
                }
              >
                {selectedStatus.label}
              </Badge>
            </div>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Surah Coverage: {selectedInfo.surah}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Teacher Note:</span>
            <span className="font-medium text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
              {activeJuz <= student.quranJuzCompleted
                ? 'Mastered with verified Tajweed Sanad'
                : activeJuz === student.currentJuz
                ? `Active lesson: ${student.hifzStatus.sabaq}`
                : 'Pending upcoming semester cycle'}
            </span>
          </div>
        </div>
      </div>

      {/* Classical Hifz Triad Card: Sabaq, Sabqi, Manzil */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Sabaq (New Lesson)
            </span>
            <span className="text-xs text-stone-400">Daily Recitation</span>
          </div>
          <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            {student.hifzStatus.sabaq}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            New memorization assigned for today's morning Halaqah session.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Sabqi (Recent Review)
            </span>
            <span className="text-xs text-stone-400">Weekly Cycle</span>
          </div>
          <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            {student.hifzStatus.sabqi}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Consolidating recent chapters to prevent slippage and reinforce waqf rules.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Manzil (Long-Term Retention)
            </span>
            <span className="text-xs text-stone-400">Khatm Cycle</span>
          </div>
          <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
            {student.hifzStatus.manzil}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            Continuous revolving revision of previously mastered Ajza'.
          </p>
        </div>
      </div>
    </div>
  );
};
