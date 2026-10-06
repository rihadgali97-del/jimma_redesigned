import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Student } from '../../../types';

interface StudentRegistryTableProps {
  students: Student[];
  onOpenCertificate: (student: Student) => void;
}

export const StudentRegistryTable: React.FC<StudentRegistryTableProps> = ({
  students,
  onOpenCertificate,
}) => (
  <Card className="p-0 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
          <tr>
            <th className="p-3.5">Student Profile</th>
            <th className="p-3.5">Madrasa & Level</th>
            <th className="p-3.5">Hifz Progress (30 Juz)</th>
            <th className="p-3.5">Current Sabaq</th>
            <th className="p-3.5">Tajweed Rating</th>
            <th className="p-3.5">Today's Attendance</th>
            <th className="p-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {students.map((student) => {
            const percentage = Math.round((student.quranJuzCompleted / 30) * 100);

            return (
              <tr key={student.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/50">
                <td className="p-3.5">
                  <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                    {student.name}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Age: {student.age} • {student.gender} • ID: {student.id}
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[170px]">
                    {student.madrasaName}
                  </div>
                  <Badge variant="slate" size="sm">
                    {student.level || student.className}
                  </Badge>
                </td>
                <td className="p-3.5 min-w-[180px]">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {student.quranJuzCompleted} / 30 Juz
                    </span>
                    <span className="text-stone-400">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    Current: Juz {student.currentJuz} ({student.currentJuzProgress}%)
                  </span>
                </td>
                <td className="p-3.5">
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    {student.sabaqSurah || student.hifzStatus.sabaq}
                  </div>
                  {student.sabaqAyahStart && student.sabaqAyahEnd ? (
                    <span className="text-[10px] text-stone-400 font-mono">
                      Ayah {student.sabaqAyahStart}–{student.sabaqAyahEnd}
                    </span>
                  ) : null}
                </td>
                <td className="p-3.5">
                  <Badge
                    variant={
                      student.tajweedRating === 'Excellent'
                        ? 'gold'
                        : student.tajweedRating === 'Very Good'
                          ? 'emerald'
                          : 'slate'
                    }
                  >
                    {student.tajweedRating}
                  </Badge>
                </td>
                <td className="p-3.5">
                  <Badge
                    variant={
                      student.dailyAttendance === 'Present'
                        ? 'emerald'
                        : student.dailyAttendance === 'Excused'
                          ? 'gold'
                          : 'rose'
                    }
                  >
                    {student.dailyAttendance || 'Not recorded'}
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Award className="w-3.5 h-3.5 text-amber-600" />}
                      onClick={() => onOpenCertificate(student)}
                      className="text-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60"
                    >
                      Certificate (PDF)
                    </Button>
                    <Link to={`/admin/students/${student.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Progress Dossier
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan={7} className="p-10 text-center text-sm text-stone-500 dark:text-stone-400">
                No students match these filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </Card>
);
