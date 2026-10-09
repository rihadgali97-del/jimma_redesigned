import React, { FormEvent, useEffect, useState } from 'react';
import { Edit3, HandCoins, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { DirectoryWoreda, fetchAdminDirectoryWoredas } from '../../services/directoryApi';
import {
  createWaqfAssetRecord,
  deleteWaqfAssetRecord,
  fetchAdminWaqfAssets,
  updateWaqfAssetRecord,
  uploadWaqfAssetImage,
  WaqfAssetInput,
} from '../../services/waqfApi';
import { WaqfAsset, WaqfAssetStatus, WaqfAssetType } from '../../types';

const types: WaqfAssetType[] = ['LAND', 'COMMERCIAL_RENTAL', 'AGRICULTURAL', 'CEMETERY'];
const statuses: WaqfAssetStatus[] = ['ACTIVE', 'UNDER_MAINTENANCE', 'DISPUTED', 'INACTIVE'];
const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900';
type Draft = Omit<WaqfAssetInput, 'name' | 'description'> & { name: string; description: string };
const emptyDraft = (woredaId = 0): Draft => ({
  woredaId, type: 'LAND', status: 'ACTIVE', locationNote: '', monthlyIncome: undefined,
  tenantName: '', tenantContact: '', isPublished: true, name: '', description: '',
});

function assetPayload(draft: Draft): WaqfAssetInput {
  return {
    woredaId: Number(draft.woredaId),
    type: draft.type,
    status: draft.status,
    locationNote: draft.locationNote?.trim() || undefined,
    monthlyIncome: draft.monthlyIncome === undefined || Number.isNaN(Number(draft.monthlyIncome)) ? undefined : Number(draft.monthlyIncome),
    tenantName: draft.tenantName?.trim() || undefined,
    tenantContact: draft.tenantContact?.trim() || undefined,
    isPublished: draft.isPublished,
    name: { en: draft.name.trim() },
    description: { en: draft.description.trim() },
  };
}

export const AdminWaqfPage: React.FC = () => {
  const { addToast } = useApp();
  const [assets, setAssets] = useState<WaqfAsset[]>([]);
  const [woredas, setWoredas] = useState<DirectoryWoreda[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<WaqfAssetType | ''>('');
  const [statusFilter, setStatusFilter] = useState<WaqfAssetStatus | ''>('');

  const filteredAssets = assets.filter((asset) =>
    (!searchQuery.trim() || `${asset.name} ${asset.type} ${asset.status} ${asset.woreda.code} ${asset.locationNote || ''}`
      .toLowerCase().includes(searchQuery.trim().toLowerCase())) &&
    (!categoryFilter || asset.type === categoryFilter) &&
    (!statusFilter || asset.status === statusFilter)
  );

  const load = async () => {
    setIsLoading(true);
    try {
      const [rows, locations] = await Promise.all([fetchAdminWaqfAssets(), fetchAdminDirectoryWoredas()]);
      setAssets(rows);
      setWoredas(locations);
      const firstActiveWoreda = locations.find((location) => location.isActive);
      setDraft((previous) => previous.woredaId ? previous : { ...previous, woredaId: firstActiveWoreda?.id || 0 });
    } catch (error) {
      addToast('Waqf Registry Could Not Load', error instanceof Error ? error.message : 'Check your staff access and API connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const resetForm = () => {
    setDraft(emptyDraft(woredas.find((woreda) => woreda.isActive)?.id || 0));
    setEditingId(null);
    setIsFormOpen(false);
    setImageFile(null);
  };

  const openNewForm = () => {
    setDraft(emptyDraft(woredas.find((woreda) => woreda.isActive)?.id || 0));
    setEditingId(null);
    setIsFormOpen(true);
    setImageFile(null);
  };

  const editAsset = (asset: WaqfAsset) => {
    setDraft({
      ...emptyDraft(asset.woreda.id),
      type: asset.type,
      status: asset.status,
      locationNote: asset.locationNote || '',
      monthlyIncome: asset.monthlyIncome ?? undefined,
      tenantName: asset.tenantName || '',
      tenantContact: asset.tenantContact || '',
      isPublished: asset.isPublished ?? true,
      name: asset.name || '',
      description: asset.description || '',
    });
    setEditingId(asset.id);
    setImageFile(null);
    setIsFormOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = assetPayload(draft);
      const saved = editingId
        ? await updateWaqfAssetRecord(editingId, payload)
        : await createWaqfAssetRecord(payload);
      if (imageFile) await uploadWaqfAssetImage(saved.id, imageFile);
      const refreshed = imageFile ? await fetchAdminWaqfAssets() : null;
      setAssets((previous) => refreshed || (editingId
        ? previous.map((asset) => asset.id === saved.id ? saved : asset)
        : [saved, ...previous]));
      addToast(editingId ? 'Waqf Asset Updated' : 'Waqf Asset Registered', `${saved.name} has been saved.`, 'success');
      resetForm();
    } catch (error) {
      addToast('Waqf Asset Could Not Be Saved', error instanceof Error ? error.message : 'Please check the entered values.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const removeAsset = async (asset: WaqfAsset) => {
    if (!window.confirm(`Delete “${asset.name}” from the Waqf registry?`)) return;
    try {
      await deleteWaqfAssetRecord(asset.id);
      setAssets((previous) => previous.filter((item) => item.id !== asset.id));
      addToast('Waqf Asset Deleted', `${asset.name} has been removed.`, 'info');
    } catch (error) {
      addToast('Waqf Asset Could Not Be Deleted', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 border-b border-stone-200 pb-5 dark:border-stone-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"><HandCoins className="h-4 w-4" /> Waqf Directorate</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold">Waqf Asset Registry</h1>
          </div>
          <p className="mt-1 text-sm text-stone-500">Manage endowed land, buildings, agricultural assets, and cemeteries.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {searchOpen && <>
            <input autoFocus aria-label="Search Waqf assets" placeholder="Search assets…" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-40 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900" />
            <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as WaqfAssetType | '')} className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"><option value="">All categories</option>{types.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select>
            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as WaqfAssetStatus | '')} className="rounded-lg border border-stone-200 bg-white px-2 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select>
          </>}
          <button type="button" title={searchOpen ? 'Close search' : 'Search assets'} aria-label={searchOpen ? 'Close search' : 'Search assets'} onClick={() => { setSearchOpen((open) => !open); setSearchQuery(''); setCategoryFilter(''); setStatusFilter(''); }} className="rounded-lg border border-stone-200 p-2.5 text-stone-600 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-800">{searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}</button>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openNewForm}>New Waqf Asset</Button>
        </div>
      </header>

      {isFormOpen && <form onSubmit={(event) => void submit(event)} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-6">
        <div className="flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit asset' : 'Register an asset'}</h2><button type="button" onClick={resetForm} aria-label="Close editor" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input required className={`${inputClass} sm:col-span-2`} placeholder="Asset name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <select required className={inputClass} value={draft.woredaId || ''} onChange={(event) => setDraft({ ...draft, woredaId: Number(event.target.value) })}>
            <option value="" disabled>Select Kebele</option>{woredas
              .filter((woreda) => woreda.isActive || woreda.id === Number(draft.woredaId))
              .map((woreda) => (
                <option key={woreda.id} value={woreda.id} disabled={!woreda.isActive}>
                  {woreda.name}{woreda.isActive ? '' : ' (inactive; existing records only)'}
                </option>
              ))}
          </select>
          <select className={inputClass} value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as WaqfAssetType })}>{types.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select>
          <select className={inputClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as WaqfAssetStatus })}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select>
          <input className={inputClass} placeholder="Location details" value={draft.locationNote || ''} onChange={(event) => setDraft({ ...draft, locationNote: event.target.value })} />
          <input type="number" min="0" step="0.01" className={inputClass} placeholder="Monthly income (ETB)" value={draft.monthlyIncome ?? ''} onChange={(event) => setDraft({ ...draft, monthlyIncome: event.target.value === '' ? undefined : Number(event.target.value) })} />
          <input className={inputClass} placeholder="Tenant name (admin only)" value={draft.tenantName || ''} onChange={(event) => setDraft({ ...draft, tenantName: event.target.value })} />
          <input className={inputClass} placeholder="Tenant contact (admin only)" value={draft.tenantContact || ''} onChange={(event) => setDraft({ ...draft, tenantContact: event.target.value })} />
          <textarea className={`${inputClass} sm:col-span-2 lg:col-span-3`} rows={3} placeholder="Public summary / description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <label className="sm:col-span-2 lg:col-span-3 space-y-2 text-sm"><span className="block font-medium">Asset image <span className="font-normal text-stone-500">(optional)</span></span><input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><span className="block text-xs text-stone-500">JPG, PNG, or WebP. Leave empty to keep the current image.</span>{imageFile ? <img src={URL.createObjectURL(imageFile)} alt="Selected asset" className="h-32 w-48 rounded-xl object-cover" /> : editingId && assets.find((asset) => asset.id === editingId)?.documents?.filter((doc) => doc.mimeType?.startsWith('image/')).at(-1) ? <img src={assets.find((asset) => asset.id === editingId)?.documents?.filter((doc) => doc.mimeType?.startsWith('image/')).at(-1)?.url} alt="Current asset" className="h-32 w-48 rounded-xl object-cover" /> : null}</label>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPublished} onChange={(event) => setDraft({ ...draft, isPublished: event.target.checked })} /> Publish public summary</label>
          <Button type="submit" variant="primary" disabled={isSaving || !woredas.length}>{isSaving ? 'Saving…' : editingId ? 'Save Changes' : 'Register Asset'}</Button>
        </div>
      </form>}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-600 dark:text-stone-300">{searchQuery ? `${filteredAssets.length} of ${assets.length} registered assets` : `${assets.length} registered assets`}</h2>
        {isLoading ? <p className="rounded-2xl bg-white p-8 text-center text-sm text-stone-500 dark:bg-stone-900">Loading registry…</p> : assets.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">No waqf assets are registered yet.</p> : filteredAssets.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">No assets match “{searchQuery}”.</p> : filteredAssets.map((asset) => (
          <article key={asset.id} className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2"><Badge variant="emerald">{asset.type.replaceAll('_', ' ')}</Badge><Badge variant={asset.status === 'ACTIVE' ? 'emerald' : asset.status === 'DISPUTED' ? 'rose' : 'gold'}>{asset.status.replaceAll('_', ' ')}</Badge><span className="text-xs text-stone-400">{asset.isPublished ? 'Public summary published' : 'Private record'}</span></div>
              <h3 className="font-semibold">{asset.name}</h3>
              <p className="mt-1 text-sm text-stone-500">{asset.woreda.code.replaceAll('-', ' ')}{asset.locationNote ? ` · ${asset.locationNote}` : ''}{asset.monthlyIncome != null ? ` · ETB ${asset.monthlyIncome.toLocaleString()} / month` : ''}</p>
              {asset.tenantName && <p className="mt-1 text-xs text-stone-400">Tenant: {asset.tenantName}{asset.tenantContact ? ` · ${asset.tenantContact}` : ''}</p>}
            </div>
            <div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" icon={<Edit3 className="h-3.5 w-3.5" />} onClick={() => editAsset(asset)}>Edit</Button><Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => void removeAsset(asset)} aria-label={`Delete ${asset.name}`} /></div>
          </article>
        ))}
      </section>
    </div>
  );
};
