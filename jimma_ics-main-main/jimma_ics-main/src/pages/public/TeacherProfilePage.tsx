import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, GraduationCap } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Teacher } from '../../types';
import { fetchPublicTeacher } from '../../services/teachersApi';

export const TeacherProfilePage: React.FC = () => {
  const { id = '' } = useParams();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setTeacher(null);
    setError('');
    fetchPublicTeacher(id)
      .then((record) => { if (active) setTeacher(record); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'This teacher profile is unavailable.');
      });
    return () => { active = false; };
  }, [id]);

  if (error) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center"><p role="alert" className="text-rose-700">{error}</p><Link to="/teachers" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to teachers</Link></main>;
  }
  if (!teacher) return <main role="status" className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-stone-500">Loading teacher profile…</main>;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <Link to="/teachers" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />All teachers</Link>
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-950 to-stone-800 p-7 text-white sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {teacher.avatar ? <img src={teacher.avatar} alt={teacher.name} className="h-24 w-24 rounded-2xl border-2 border-amber-400 object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-800 text-2xl font-bold text-amber-300">{teacher.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div>}
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge variant="emerald">Council Faculty</Badge>{teacher.isFeatured && <Badge variant="gold"><Award className="mr-1 inline h-3 w-3" />Featured Teacher</Badge>}</div>
              <h1 className="mt-3 font-serif text-3xl font-bold">{teacher.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-stone-300"><BookOpen className="h-4 w-4" />{teacher.madrasaName}</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Specialization</h2>
            <p className="mt-2 font-semibold text-stone-900 dark:text-stone-100">{teacher.specialization}</p>
          </section>
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Teaching experience</h2>
            <p className="mt-2 inline-flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100"><GraduationCap className="h-4 w-4 text-emerald-700" />{teacher.experienceYears} years</p>
          </section>
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Qualification</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{teacher.qualification}</p>
          </section>
          {teacher.sanad && <section><h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">Sanad / Ijazah</h2><p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">{teacher.sanad}</p></section>}
        </div>
      </Card>
    </main>
  );
};
