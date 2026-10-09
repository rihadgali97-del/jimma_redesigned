import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { BookOpen, Search, Filter, Users, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../../components/ui/PaginationControls';

export const MadrasasPage: React.FC = () => {
  const { madrasas = [] } = useApp();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const districts = ['All', ...Array.from(new Set((madrasas || []).map((m) => m.district).filter(Boolean)))];
  const levels = ['All', 'Level 1 (Foundation)', 'Level 2 (Tahfeez)', 'Level 3 (Alimiyyah)', 'Hifz Intensive'];

  const filtered = (madrasas || []).filter((m) => {
    const mLevels = m.levels || [];
    const matchSearch =
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.headTeacher || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
    const matchLevel = selectedLevel === 'All' || mLevels.some((l) => l.toLowerCase().includes(selectedLevel.toLowerCase()));
    return matchSearch && matchDistrict && matchLevel;
  });
  const pagination = usePagination(filtered, 12, `${searchTerm}|${selectedDistrict}|${selectedLevel}`);

  const totalEnrolled = (madrasas || []).reduce((acc, m) => acc + (m.totalStudents || 0), 0);
  const totalTeachers = (madrasas || []).reduce((acc, m) => acc + (m.totalTeachers || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Islamic Education Board</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Madrasas & Quranic Centers
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-1 max-w-2xl">
            Accredited Islamic education institutions, Tahfeez halaqat, and Arabic language academies across Jimma City.
          </p>
        </div>

        {/* Quick summary numbers */}
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-xs">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase">Total Enrolled</span>
            <span className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
              {totalEnrolled.toLocaleString()} Students
            </span>
          </div>
          <div className="h-6 w-px bg-amber-300 dark:bg-amber-800" />
          <div>
            <span className="text-stone-500 block text-[10px] uppercase">Certified Asatidhah</span>
            <span className="font-bold text-emerald-600 font-mono text-sm">
              {totalTeachers}+ Faculty
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search madrasa, head teacher, kebele..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Kebeles' : d}
              </option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Madrasa Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagination.paginatedItems.map((madrasa) => {
          const progs = madrasa.programs || [];
          const levs = madrasa.levels || [];
          const shiftsList = madrasa.shifts || [];
          return (
            <Card key={madrasa.id} hoverEffect className="flex flex-col justify-between">
              <div>
                {madrasa.image ? (
                  <img
                    src={madrasa.image}
                    alt={`${madrasa.name} photo`}
                    loading="lazy"
                    className="mb-4 h-48 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-48 w-full items-center justify-center rounded-xl bg-stone-100 text-stone-400 dark:bg-stone-800" aria-label="No photo uploaded">
                    <BookOpen className="h-10 w-10" />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="gold">{madrasa.accreditationStatus || 'Accredited'}</Badge>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {madrasa.district}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  {madrasa.name}
                </h3>
                {madrasa.arabicName && (
                  <p className="font-serif text-xs text-amber-700 dark:text-amber-400 mt-0.5" dir="rtl">
                    {madrasa.arabicName}
                  </p>
                )}
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {madrasa.description}
                </p>

                {/* Stats & Head Teacher */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Head Teacher:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[180px]">
                      {madrasa.headTeacher}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Students Enrolled:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {(madrasa.totalStudents || 0).toLocaleString()} Students ({madrasa.totalTeachers || 0} Teachers)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Operating Shifts:</span>
                    <span className="text-stone-800 dark:text-stone-200 font-medium">
                      {shiftsList.join(', ') || 'Morning, Afternoon'}
                    </span>
                  </div>
                </div>

                {/* Programs / Levels Pills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {(progs.length > 0 ? progs : levs).slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                <Link to={`/madrasas/${madrasa.id}`} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                    Inspect Madrasa
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <PaginationControls {...pagination} itemLabel="madrasas" onPageChange={pagination.setPage} />

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
            No madrasas found
          </h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search criteria or changing the selected kebele filter.
          </p>
        </div>
      )}
    </div>
  );
};
