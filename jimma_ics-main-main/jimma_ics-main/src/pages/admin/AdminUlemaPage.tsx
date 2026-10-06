import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Eye, EyeOff, Loader2, Plus, Search, ShieldCheck, Star, Trash2, UserRoundPen, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Ulema } from '../../types';
import { UlemaInput } from '../../services/ulemaApi';
import { UlemaAvatar } from '../../components/ulema/UlemaAvatar';
import { UlemaFormModal } from '../../components/ulema/UlemaFormModal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminUlemaPage: React.FC = () => {
  const {
    ulema, refreshUlema, ulemaLoading, ulemaError, addUlema, updateUlema, deleteUlema, addToast,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'published' | 'private'>('all');
  const [editing, setEditing] = useState<Ulema>();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    void refreshUlema(true).catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ulema.filter((profile) => {
      const matchesSearch = !term || [
        profile.name, profile.title, profile.district, ...profile.specializations,
      ].some((value) => value.toLowerCase().includes(term));
      const matchesVisibility = visibility === 'all'
        || (visibility === 'published' ? profile.isPublished : !profile.isPublished);
      return matchesSearch && matchesVisibility;
    });
  }, [ulema, searchTerm, visibility]);

  const saveProfile = (profile: UlemaInput, photo?: File) => {
    return editing
      ? updateUlema(editing.id, profile, photo)
      : addUlema(profile, photo).then(Boolean);
  };

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (profile: Ulema) => {
    setEditing(profile);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(undefined);
  };

  const togglePublished = async (profile: Ulema) => {
    const next = !profile.isPublished;
    const saved = await updateUlema(profile.id, {
      isPublished: next,
      ...(next ? {} : { isFeatured: false }),
    });
    if (saved) addToast(next ? 'Profile published' : 'Profile unpublished', `${profile.name} is ${next ? 'visible' : 'hidden'} in the public directory.`, 'success');
  };

  const removeProfile = async (profile: Ulema) => {
    if (window.confirm(`Remove ${profile.name} from the scholar registry?`)) await deleteUlema(profile.id);
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white shadow-lg sm:p-8">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-8 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              <ShieldCheck className="h-4 w-4" /> Council directory management
            </div>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">Ulema & Fatwa Board</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-100/80">
              Maintain scholar dossiers, profile photos and public visibility from one place.
            </p>
          </div>
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Register scholar</Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Registered scholars', value: ulema.length, icon: Users, color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300' },
          { label: 'Public profiles', value: ulema.filter((profile) => profile.isPublished).length, icon: Eye, color: 'text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300' },
          { label: 'Featured scholars', value: ulema.filter((profile) => profile.isFeatured && profile.isPublished).length, icon: Star, color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className={`rounded-xl p-3 ${color}`}><Icon className="h-5 w-5" /></div>
            <div><div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</div><div className="text-xs font-medium text-stone-500">{label}</div></div>
          </div>
        ))}
      </section>

      {ulemaLoading && <div role="status" className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"><Loader2 className="h-4 w-4 animate-spin" />Loading scholar records…</div>}
      {ulemaError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Could not load scholar records: {ulemaError}<button type="button" className="ml-3 font-semibold underline" onClick={() => void refreshUlema(true).catch(() => undefined)}>Retry</button></div>}

      <section className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input aria-label="Search scholars" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by scholar, role, discipline or district" className="w-full rounded-xl bg-stone-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-1 ring-transparent focus:ring-emerald-500 dark:bg-stone-800" />
        </div>
        <select aria-label="Filter by directory visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-800">
          <option value="all">All profiles</option><option value="published">Published</option><option value="private">Private</option>
        </select>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filtered.map((profile) => (
          <article key={profile.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-emerald-900">
            <div className="flex items-start gap-4">
              <UlemaAvatar name={profile.name} src={profile.avatar} className="h-16 w-16 shrink-0 rounded-2xl text-lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">{profile.name}</h2>
                  {profile.isFeatured && profile.isPublished && <Badge variant="gold">Featured</Badge>}
                </div>
                {profile.arabicName && <div dir="rtl" className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">{profile.arabicName}</div>}
                <div className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{profile.title}</div>
                <div className="mt-1 text-xs text-stone-500">{profile.district} · {profile.status}</div>
              </div>
              <Badge variant={profile.isPublished ? 'emerald' : 'slate'}>{profile.isPublished ? 'Public' : 'Private'}</Badge>
            </div>
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{profile.biography}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {profile.specializations.slice(0, 3).map((specialization) => <span key={specialization} className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">{specialization}</span>)}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
              <div className="flex items-center gap-1.5 text-xs text-stone-500"><BookOpen className="h-3.5 w-3.5" />{profile.yearsOfDawah} years of service</div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void togglePublished(profile)} title={profile.isPublished ? 'Hide from directory' : 'Publish to directory'} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:border-emerald-400 hover:text-emerald-700 dark:border-stone-700 dark:text-stone-300">
                  {profile.isPublished ? <><EyeOff className="h-3.5 w-3.5" />Unpublish</> : <><Check className="h-3.5 w-3.5" />Publish</>}
                </button>
                <button type="button" onClick={() => openEdit(profile)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:border-blue-400 hover:text-blue-700 dark:border-stone-700 dark:text-stone-300"><UserRoundPen className="h-3.5 w-3.5" />Edit</button>
                <button type="button" onClick={() => void removeProfile(profile)} aria-label={`Remove ${profile.name}`} className="inline-flex items-center rounded-lg border border-rose-100 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!ulemaLoading && !ulemaError && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 py-14 text-center dark:border-stone-700">
          <Users className="mx-auto h-10 w-10 text-stone-300" />
          <h2 className="mt-3 font-semibold text-stone-800 dark:text-stone-200">{ulema.length ? 'No scholars match these filters' : 'The scholar registry is ready'}</h2>
          <p className="mt-1 text-sm text-stone-500">{ulema.length ? 'Try another search or visibility filter.' : 'Register a scholar to begin building the council directory.'}</p>
        </div>
      )}

      <UlemaFormModal isOpen={formOpen} profile={editing} onClose={closeForm} onSave={saveProfile} />
    </div>
  );
};
