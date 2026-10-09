import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, Loader2, Search, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UlemaProfileCard } from '../../components/ulema/UlemaProfileCard';
import { Button } from '../../components/ui/Button';

export const UlemaPage: React.FC = () => {
  const { ulema, refreshUlema, ulemaLoading, ulemaError } = useApp();
  const navigate = useNavigate();
  const publishedUlema = useMemo(() => ulema.filter((profile) => profile.isPublished), [ulema]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const specializations = useMemo(() => [
    'All', ...Array.from(new Set(publishedUlema.flatMap((profile) => profile.specializations))).sort(),
  ], [publishedUlema]);
  const districts = useMemo(() => [
    'All', ...Array.from(new Set(publishedUlema.map((profile) => profile.district))).sort(),
  ], [publishedUlema]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return publishedUlema.filter((profile) => {
      const matchesSearch = !term || [
        profile.name, profile.arabicName || '', profile.title, profile.district, ...profile.specializations,
      ].some((value) => value.toLowerCase().includes(term));
      const matchesSpec = selectedSpec === 'All' || profile.specializations.includes(selectedSpec);
      const matchesDistrict = selectedDistrict === 'All' || profile.district === selectedDistrict;
      return matchesSearch && matchesSpec && matchesDistrict;
    });
  }, [publishedUlema, searchTerm, selectedSpec, selectedDistrict]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
        <div className="absolute -right-12 -top-20 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-12 h-60 w-60 rounded-full border border-white/10" />
        <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-100">
              <BookOpen className="h-4 w-4" /> Jimma Zone · Scholarly Authority
            </div>
            <h1 className="font-serif text-3xl font-bold leading-tight sm:text-5xl">Ulema & Fatwa Board</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/80 sm:text-base">
              Meet the published scholars serving the Jimma Islamic Supreme Council through Islamic scholarship, guidance and community service.
            </p>
          </div>
          <Button variant="gold" size="sm" icon={<HelpCircle className="h-4 w-4" />} onClick={() => navigate('/services')}>Submit Fatwa Inquiry</Button>
        </div>
        <div className="relative mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5 text-sm text-emerald-50/90">
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{publishedUlema.length} published scholars</span>
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4" />{specializations.length - 1} areas of expertise</span>
        </div>
      </header>

      <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900 md:grid-cols-[minmax(0,1fr)_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search scholars</span>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search scholar, title or expertise…" className="w-full rounded-xl bg-stone-50 py-3 pl-10 pr-3 text-sm text-stone-900 outline-none ring-1 ring-transparent focus:ring-emerald-500 dark:bg-stone-800 dark:text-stone-100" />
        </label>
        <select aria-label="Filter by expertise" value={selectedSpec} onChange={(event) => setSelectedSpec(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
          {specializations.map((specialization) => <option key={specialization} value={specialization}>{specialization === 'All' ? 'All disciplines' : specialization}</option>)}
        </select>
        <select aria-label="Filter by kebele" value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
          {districts.map((district) => <option key={district} value={district}>{district === 'All' ? 'All kebeles' : district}</option>)}
        </select>
      </section>

      {ulemaError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Could not load scholar profiles: {ulemaError}<button type="button" className="ml-3 font-semibold underline" onClick={() => void refreshUlema().catch(() => undefined)}>Retry</button></div>}
      {ulemaLoading && <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-stone-500"><Loader2 className="h-5 w-5 animate-spin" />Loading published scholars…</div>}

      {!ulemaLoading && !ulemaError && filtered.length > 0 && <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((profile) => <UlemaProfileCard key={profile.id} profile={profile} />)}</section>}
      {!ulemaLoading && !ulemaError && filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white py-16 text-center dark:border-stone-700 dark:bg-stone-900">
          <Users className="mx-auto h-10 w-10 text-stone-300" />
          <h2 className="mt-3 font-serif text-lg font-bold text-stone-800 dark:text-stone-200">{publishedUlema.length ? 'No scholars match your filters' : 'No scholars have been published yet'}</h2>
          <p className="mt-1 text-sm text-stone-500">{publishedUlema.length ? 'Try another search term or filter.' : 'Please check back as the council directory is updated.'}</p>
        </div>
      )}
    </div>
  );
};
