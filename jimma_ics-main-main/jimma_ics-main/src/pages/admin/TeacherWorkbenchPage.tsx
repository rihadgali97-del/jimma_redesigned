import React from 'react';
import { TeacherMadrasaDashboard } from '../../components/dashboard/TeacherMadrasaDashboard';
import { useApp } from '../../context/AppContext';
import { BookOpen, Sparkles, GraduationCap } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const TeacherWorkbenchPage: React.FC = () => {
  const { currentUser } = useApp();

  return (
    <div className="space-y-6">
      {/* Workbench Header Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-amber-300 flex items-center justify-center font-bold text-lg shadow-md shrink-0 border border-emerald-600">
            <GraduationCap className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Tahfeez & Sabaq Classroom Workbench
              </h1>
              <Badge variant="emerald">Teacher / Mu’allim Authorized</Badge>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Welcome, <strong>{currentUser.name}</strong> • Madrasa Classroom & Daily Attendance Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden md:block">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Assigned School
            </div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {currentUser.department || 'Education Directorate'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Teacher Dashboard Component */}
      <TeacherMadrasaDashboard />
    </div>
  );
};
