import React, { useMemo, useState } from 'react';
import { Award, BookOpen, Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../../components/ui/PaginationControls';

export const TeachersPage: React.FC = () => {
  const { teachers, refreshTeachers, teachersLoading, teachersError } = useApp();
  const [search, setSearch] = useState('');

  const visibleTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teachers
      .filter((teacher) => teacher.isPublished)
      .filter((teacher) => !query || [
        teacher.name,
        teacher.madrasaName,
        teacher.specialization,
        teacher.qualification,
        teacher.sanad || '',
      ].some((value) => value.toLowerCase().includes(query)))
      .sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || a.name.localeCompare(b.name));
  }, [teachers, search]);
  const pagination = usePagination(visibleTeachers, 12, search);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-800 p-7 text-white shadow-lg sm:p-10">
        <Badge variant="emerald">Education & Tahfeez Directorate</Badge>
        <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">Quran Teachers & Mu’allims</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-300">
          Meet the teachers and Quran instructors published by the Jimma City Islamic Affairs Supreme Council.
        </p>
      </header>

      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search teacher, madrasa, sanad, or specialization…"
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 dark:border-stone-700 dark:bg-stone-900"
        />
      </div>

      {teachersLoading && <div role="status" className="py-8 text-center text-sm text-stone-500">Loading the public faculty directory…</div>}
      {teachersError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          The public teacher directory could not be loaded. {teachersError}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => void refreshTeachers().catch(() => undefined)}>Retry</button>
        </div>
      )}
      {!teachersLoading && !teachersError && visibleTeachers.length === 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">
          No teachers have been published to the public directory yet.
        </div>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {pagination.paginatedItems.map((teacher) => (
          <Card key={teacher.id} className="relative space-y-4 p-5">
            {teacher.isFeatured && <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-800"><Award className="h-3 w-3" /> Featured</span>}
            <div className="flex items-center gap-4 pr-16">
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} className="h-16 w-16 rounded-2xl border border-stone-200 object-cover dark:border-stone-700" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{teacher.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>
              )}
              <div className="min-w-0">
                <Link to={`/teachers/${teacher.id}`} className="truncate font-serif text-lg font-bold text-stone-900 hover:text-emerald-700 dark:text-stone-100">{teacher.name}</Link>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-stone-500"><BookOpen className="h-3.5 w-3.5 shrink-0" />{teacher.madrasaName}</p>
              </div>
            </div>
            <Badge variant="blue">{teacher.specialization}</Badge>
            <p className="line-clamp-3 text-sm text-stone-600 dark:text-stone-300">{teacher.qualification}</p>
            {teacher.sanad && <p className="text-xs text-stone-500"><strong className="text-stone-700 dark:text-stone-300">Sanad:</strong> {teacher.sanad}</p>}
            <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500 dark:border-stone-800">
              <span>{teacher.experienceYears} years of experience</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{teacher.assignedStudentsCount ?? teacher.studentsCount} students</span>
            </div>
          </Card>
        ))}
      </section>
      {!teachersLoading && !teachersError && <PaginationControls {...pagination} itemLabel="teachers" onPageChange={pagination.setPage} />}
    </main>
  );
};
