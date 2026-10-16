import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  MapPin,
  Users,
  Building,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const MadrasaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { madrasas = [], students = [], teachers = [], mosques = [] } = useApp();
  const navigate = useNavigate();

  const madrasa = madrasas.find((record) => record.id === id);

  if (!madrasa) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-stone-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Madrasa record unavailable</h1>
        <p className="mt-2 text-sm text-stone-500">This institution is not listed in the currently loaded public directory.</p>
        <Link to="/madrasas" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          <ArrowLeft className="h-4 w-4" /> Back to Madrasas Directory
        </Link>
      </div>
    );
  }

  const linkedMosque = (mosques || []).find(
    (mos) => mos.id === madrasa.mosqueId || mos.name === madrasa.mosqueName
  );
  const enrolledStudents = (students || []).filter(
    (s) => s.madrasaId === madrasa.id || s.madrasaName === madrasa.name
  );
  const facultyTeachers = (teachers || []).filter(
    (t) => t.isPublished === true && (t.madrasaId === madrasa.id || t.madrasaName === madrasa.name)
  );

  const programsList = madrasa.programs || [];
  const levelsList = madrasa.levels || [];
  const curriculumItems = programsList.length > 0 ? programsList : levelsList;
  const shiftsList = madrasa.shifts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & Action Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/madrasas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Madrasas Directory</span>
        </Link>
      </div>

      {/* Madrasa Main Hero Box */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        {madrasa.image && (
          <img
            src={madrasa.image}
            alt={`${madrasa.name} photo`}
            className="max-h-[28rem] w-full rounded-2xl object-cover"
          />
        )}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold">{madrasa.accreditationStatus || 'Accreditation not recorded'}</Badge>
              <span className="text-xs text-stone-400 font-mono">ID: {madrasa.id}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {madrasa.name}
            </h1>
            {madrasa.arabicName && (
              <p className="font-serif text-amber-700 dark:text-amber-400 text-lg sm:text-xl font-medium" dir="rtl">
                {madrasa.arabicName}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {[linkedMosque?.name || madrasa.mosqueName, madrasa.district].filter(Boolean).join(', ') || 'Location not listed'}
              </span>
              {madrasa.establishedYear > 0 && (
                <>
                  <span>•</span>
                  <span>Established {madrasa.establishedYear} CE</span>
                </>
              )}
            </div>
            <p className="text-stone-600 dark:text-stone-300 text-sm max-w-3xl leading-relaxed pt-2">
              {madrasa.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant="gold"
              size="sm"
              icon={<HeartHandshake className="w-4 h-4" />}
              onClick={() => navigate('/donate')}
            >
              Sponsor a Student
            </Button>
            {linkedMosque && (
              <Link to={`/mosques/${linkedMosque.id}`}>
                <Button variant="secondary" size="sm" icon={<Building className="w-4 h-4" />} className="w-full text-xs">
                  Parent Mosque
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
              Total Students
            </span>
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {enrolledStudents.length ? enrolledStudents.length.toLocaleString() : '—'}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              {enrolledStudents.length ? 'Student records available' : 'Enrollment data not listed'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
              Reported Hifz Graduates
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-100">
              {madrasa.hifzGraduatesCount == null ? '—' : madrasa.hifzGraduatesCount.toLocaleString()}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Reported by the directory
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 block">
              Faculty Size
            </span>
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
              {facultyTeachers.length ? facultyTeachers.length.toLocaleString() : '—'}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5 truncate">
              Head: {madrasa.headTeacher || 'Not listed'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-stone-600 dark:text-stone-400 block">
              Session Shifts
            </span>
            <span className="text-sm font-bold text-stone-900 dark:text-stone-100 block mt-1">
              {shiftsList.join(', ') || 'Not recorded'}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">Schedule information, if available</span>
          </div>
        </div>
      </div>

      {/* Curriculum & Faculty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Curriculum & enrolled students */}
        <div className="lg:col-span-8 space-y-8">
          {/* Standardized Subjects */}
          <Card className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>Standardized Curriculum & Programs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {curriculumItems.map((item) => (
                <div
                  key={item}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60 text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              {curriculumItems.length === 0 && (
                <p className="text-sm text-stone-500">Program and curriculum information is not listed.</p>
              )}
            </div>
          </Card>

          {/* Enrolled students listed for this madrasa */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Enrolled Student Records ({enrolledStudents.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {enrolledStudents.slice(0, 4).map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        {student.name}
                      </h4>
                      <div className="text-xs text-stone-500 dark:text-stone-400">
                        Age: {student.age} • Class: {student.className} • {student.tajweedRating} Tajweed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {student.quranJuzCompleted} / 30 Juz Completed
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Focus: Juz {student.currentJuz} ({student.currentJuzProgress}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {enrolledStudents.length === 0 && (
                <div className="p-6 text-center text-xs text-stone-400">
                  No student records are available for this institution.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Faculty Roster */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4">
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Assigned Teachers & Mu'allims</span>
            </h4>

            <div className="space-y-3">
              {facultyTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {teacher.name}
                    </span>
                    <Badge variant="blue">{teacher.specialization}</Badge>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Qualification: {teacher.qualification}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                    <span>Exp: {teacher.experienceYears} Years</span>
                    <span>Students: {teacher.studentsCount}</span>
                  </div>
                </div>
              ))}

              {facultyTeachers.length === 0 && (
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-500">
                  No public teacher records are listed for this institution.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
