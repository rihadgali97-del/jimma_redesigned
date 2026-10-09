import React, { FormEvent, useEffect, useState } from 'react';
import { BellRing, Edit3, Megaphone, Pin, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Announcement } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { uploadAnnouncementBanner } from '../../services/announcementsApi';

const categories: Announcement['category'][] = [
  'Official Communique', 'Moon Sighting', 'Zakat Nisab', 'Academic Calendar', 'Council Advisory',
];
const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900';

type Draft = Omit<Announcement, 'id'>;
const emptyDraft = (): Draft => ({
  title: '', category: 'Official Communique', publishDate: new Date().toISOString().slice(0, 10),
  hijriDate: '', author: 'Jimma Islamic Council', summary: '', content: '', isPinned: false,
  isUrgent: false, priority: 'Normal', district: 'All Kebeles', targetAudience: 'Community',
  readTime: '1 min read', isPublished: true,
});

export const AdminAnnouncementsPage: React.FC = () => {
  const { announcements, refreshAnnouncements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useApp();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const filteredAnnouncements = announcements.filter((item) =>
    (!searchQuery.trim() || `${item.title} ${item.category} ${item.summary} ${item.author} ${item.district || ''}`
      .toLowerCase().includes(searchQuery.trim().toLowerCase())) &&
    (!dateFilter || (item.publishDate || item.date || '').slice(0, 10) === dateFilter)
  );

  useEffect(() => { void refreshAnnouncements(true); }, []);

  const startEdit = (item: Announcement) => {
    const { id: _id, ...rest } = item;
    setDraft({ ...emptyDraft(), ...rest, publishDate: item.publishDate || item.date || '' });
    setEditingId(item.id);
    setBannerFile(null);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setBannerFile(null);
    setIsFormOpen(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const normalized = { ...draft, priority: draft.isUrgent ? 'High' as const : 'Normal' as const };
      const saved = editingId ? (await updateAnnouncement(editingId, normalized), { id: editingId }) : await addAnnouncement(normalized);
      if (bannerFile) await uploadAnnouncementBanner(saved.id, bannerFile);
      resetForm();
      await refreshAnnouncements(true);
    } catch {
      // Context shows the API error and preserves the draft for correction.
    } finally {
      setIsSaving(false);
    }
  };

  const togglePinned = async (item: Announcement) => {
    try { await updateAnnouncement(item.id, { isPinned: !item.isPinned }); } catch { /* toast shown by context */ }
  };

  const remove = async (item: Announcement) => {
    if (!window.confirm(`Remove “${item.title}” from announcements?`)) return;
    try { await deleteAnnouncement(item.id); } catch { /* toast shown by context */ }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Megaphone className="h-4 w-4" /> Council Communications
          </div>
          <h1 className="font-serif text-3xl font-bold">Announcements</h1>
          <p className="mt-1 text-sm text-stone-500">Publish, edit, pin, and manage public council notices.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSearchOpen && <><input autoFocus aria-label="Search announcements" placeholder="Search announcements…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-44 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900" /><input type="date" aria-label="Filter announcements by date" title="Filter by publish date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm outline-none focus:border-amber-500 dark:border-stone-700 dark:bg-stone-900" /></>}
          <button type="button" aria-label={isSearchOpen ? 'Close search' : 'Search announcements'} title={isSearchOpen ? 'Close search' : 'Search announcements'} onClick={() => { setIsSearchOpen((open) => !open); setSearchQuery(''); setDateFilter(''); }} className="rounded-lg border border-stone-200 p-2.5 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800">{isSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}</button>
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => { resetForm(); setIsFormOpen(true); }}>New Announcement</Button>
        </div>
      </header>

      {isFormOpen && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{editingId ? 'Edit Announcement' : 'Compose Announcement'}</h2>
          <button type="button" onClick={resetForm} aria-label="Close editor" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input required className={`${inputClass} sm:col-span-2 lg:col-span-3`} placeholder="Announcement title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <select className={inputClass} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Announcement['category'] })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <input required type="date" className={inputClass} value={draft.publishDate} onChange={(e) => setDraft({ ...draft, publishDate: e.target.value })} />
          <input className={inputClass} placeholder="Hijri date" value={draft.hijriDate} onChange={(e) => setDraft({ ...draft, hijriDate: e.target.value })} />
          <input required className={inputClass} placeholder="Author / Directorate" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          <input className={inputClass} placeholder="Kebele" value={draft.district} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
          <input className={inputClass} placeholder="Audience" value={draft.targetAudience} onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value })} />
          <textarea required className={`${inputClass} sm:col-span-2 lg:col-span-3`} rows={2} placeholder="Short summary" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
          <textarea required className={`${inputClass} sm:col-span-2 lg:col-span-3`} rows={5} placeholder="Announcement details" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
          <label className="sm:col-span-2 lg:col-span-3 space-y-2 text-sm"><span className="block font-medium">Banner image <span className="font-normal text-stone-500">(optional)</span></span><input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(e) => setBannerFile(e.target.files?.[0] || null)} /><span className="block text-xs text-stone-500">JPG, PNG, or WebP. Leave empty to keep the current banner.</span>{bannerFile ? <img src={URL.createObjectURL(bannerFile)} alt="Selected banner preview" className="h-32 max-w-full rounded-xl object-cover" /> : editingId && announcements.find((item) => item.id === editingId)?.imageUrl ? <img src={announcements.find((item) => item.id === editingId)?.imageUrl || ''} alt="Current announcement banner" className="h-32 max-w-full rounded-xl object-cover" /> : null}</label>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isUrgent} onChange={(e) => setDraft({ ...draft, isUrgent: e.target.checked })} /> Urgent notice</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPinned} onChange={(e) => setDraft({ ...draft, isPinned: e.target.checked })} /> Pin to top</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} /> Publish publicly</label>
          <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Publish Announcement'}</Button>
        </div>
      </form>}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 dark:text-stone-300"><BellRing className="h-4 w-4" /> {searchQuery ? `${filteredAnnouncements.length} of ${announcements.length} announcements` : `${announcements.length} announcements`}</div>
        {filteredAnnouncements.map((item) => (
          <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2"><Badge variant={item.isUrgent ? 'rose' : 'slate'}>{item.isUrgent ? 'Urgent' : item.category}</Badge>{item.isPinned && <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Pin className="h-3 w-3" /> Pinned</span>}<span className="text-xs text-stone-400">{item.publishDate}</span><span className="text-xs text-stone-400">{item.isPublished ? 'Published' : 'Draft'}</span></div>
              <h3 className="font-semibold">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm text-stone-500">{item.summary}</p>
              {item.imageUrl && <img src={item.imageUrl} alt="" className="mt-3 h-24 w-40 rounded-lg object-cover" />}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" icon={<Pin className="h-3.5 w-3.5" />} onClick={() => void togglePinned(item)}>{item.isPinned ? 'Unpin' : 'Pin'}</Button>
              <Button variant="outline" size="sm" icon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => startEdit(item)}>Edit</Button>
              <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => void remove(item)} aria-label={`Delete ${item.title}`} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
