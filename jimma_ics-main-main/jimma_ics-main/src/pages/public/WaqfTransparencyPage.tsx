import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Filter, HandCoins, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { WaqfAsset, WaqfAssetType } from '../../types';
import { fetchPublicWaqfAssets } from '../../services/waqfApi';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../../components/ui/PaginationControls';

const typeLabels: Record<WaqfAssetType, string> = {
  LAND: 'Endowed land',
  COMMERCIAL_RENTAL: 'Commercial property',
  AGRICULTURAL: 'Agricultural waqf',
  CEMETERY: 'Cemetery',
};
const districtLabel = (code: string) => code.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const WaqfTransparencyPage: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [assets, setAssets] = useState<WaqfAsset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    void fetchPublicWaqfAssets()
      .then((rows) => { if (active) setAssets(rows); })
      .catch(() => { if (active) setLoadError('Could not load the public waqf registry. Please try again.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => assets.filter((asset) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [asset.name, asset.description || '', asset.locationNote || '', asset.woreda.code]
      .some((value) => value.toLowerCase().includes(term));
    return matchesSearch && (selectedType === 'All' || asset.type === selectedType);
  }), [assets, search, selectedType]);
  const pagination = usePagination(filtered, 12, `${search}|${selectedType}`);

  return (
    <div className={embedded ? 'space-y-8' : 'mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8'}>
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-950 p-7 text-white shadow-xl sm:p-10">
        <div className="absolute -right-12 -top-16 h-60 w-60 rounded-full border border-amber-300/10" />
        <div className="absolute -right-2 -top-6 h-40 w-40 rounded-full border border-amber-300/10" />
        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
            <ShieldCheck className="h-4 w-4" /> Public accountability
          </div>
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Waqf & Endowment Registry</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-50/80 sm:text-base">
            Explore published community endowments managed by the Jimma Islamic Council. This public view shows asset summaries while protecting private tenant and income details.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm">
            <HandCoins className="h-4 w-4 text-amber-300" />
            <span>{assets.length} published {assets.length === 1 ? 'asset' : 'assets'}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search asset, location, or kebele" className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-800" />
        </label>
        <label className="flex items-center gap-2 text-xs text-stone-500">
          <Filter className="h-4 w-4" />
          <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <option value="All">All asset types</option>
            {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-900">Loading the published registry…</div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{loadError}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center dark:border-stone-700">
          <Building2 className="mx-auto h-9 w-9 text-stone-400" />
          <p className="mt-3 font-semibold">{assets.length ? 'No waqf assets match your search.' : 'No public waqf assets have been published yet.'}</p>
          <p className="mt-1 text-sm text-stone-500">Try a different search or check back when the council publishes an asset.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pagination.paginatedItems.map((asset) => (
            <Card key={asset.id} hoverEffect className="flex min-h-64 flex-col justify-between">
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"><Building2 className="h-5 w-5" /></div>
                  <Badge variant={asset.status === 'ACTIVE' ? 'emerald' : asset.status === 'DISPUTED' ? 'rose' : 'gold'}>{asset.status.replaceAll('_', ' ')}</Badge>
                </div>
                <h2 className="font-serif text-xl font-bold">{asset.name || typeLabels[asset.type]}</h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">{typeLabels[asset.type]}</p>
                {asset.description && <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{asset.description}</p>}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4 text-sm text-stone-500 dark:border-stone-800">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span>{asset.locationNote ? `${asset.locationNote}, ` : ''}{districtLabel(asset.woreda.code)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {!isLoading && !loadError && <PaginationControls {...pagination} itemLabel="assets" onPageChange={pagination.setPage} />}
    </div>
  );
};
