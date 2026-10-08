import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Edit3, MapPin, Plus, RefreshCw, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createWoredaRecord,
  DirectoryWoreda,
  fetchAdminDirectoryWoredas,
  updateWoredaRecord,
  WoredaGisProfile,
} from '../../services/directoryApi';

const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900';
type GisProfileForm = {
  oromoName: string;
  arabicName: string;
  zone: string;
  climateZone: NonNullable<WoredaGisProfile['climateZone']> | '';
  centerLatitude: string;
  centerLongitude: string;
  svgPath: string;
  labelX: string;
  labelY: string;
  areaKm2: string;
  elevationMeters: string;
  population: string;
  muslimPercentage: string;
  councilBranchHead: string;
  headContact: string;
  notableFeatures: string;
};

const emptyGisProfile: GisProfileForm = {
  oromoName: '',
  arabicName: '',
  zone: '',
  climateZone: '',
  centerLatitude: '',
  centerLongitude: '',
  svgPath: '',
  labelX: '',
  labelY: '',
  areaKm2: '',
  elevationMeters: '',
  population: '',
  muslimPercentage: '',
  councilBranchHead: '',
  headContact: '',
  notableFeatures: '',
};

function toGisProfilePayload(form: GisProfileForm): WoredaGisProfile {
  const optionalNumber = (value: string) => value.trim() === '' ? null : Number(value);
  return {
    oromoName: form.oromoName.trim() || null,
    arabicName: form.arabicName.trim() || null,
    zone: form.zone.trim() || null,
    climateZone: form.climateZone || null,
    centerLatitude: optionalNumber(form.centerLatitude),
    centerLongitude: optionalNumber(form.centerLongitude),
    svgPath: form.svgPath.trim() || null,
    labelX: optionalNumber(form.labelX),
    labelY: optionalNumber(form.labelY),
    areaKm2: optionalNumber(form.areaKm2),
    elevationMeters: optionalNumber(form.elevationMeters),
    population: optionalNumber(form.population),
    muslimPercentage: optionalNumber(form.muslimPercentage),
    councilBranchHead: form.councilBranchHead.trim() || null,
    headContact: form.headContact.trim() || null,
    notableFeatures: form.notableFeatures
      .split(/\r?\n/)
      .map((feature) => feature.trim())
      .filter(Boolean),
  };
}

export const AdminWoredasPage: React.FC = () => {
  const { addToast } = useApp();
  const addToastRef = useRef(addToast);
  addToastRef.current = addToast;
  const [woredas, setWoredas] = useState<DirectoryWoreda[]>([]);
  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gisProfile, setGisProfile] = useState<GisProfileForm>(emptyGisProfile);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  const loadWoredas = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setWoredas(await fetchAdminDirectoryWoredas());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load the woreda registry.';
      setLoadError(message);
      addToastRef.current('Woreda Registry Could Not Load', message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWoredas();
  }, [loadWoredas]);

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setGisProfile(emptyGisProfile);
  };

  const beginEdit = (woreda: DirectoryWoreda) => {
    setEditingId(woreda.id);
    setCode(woreda.code);
    setName(woreda.name);
    setGisProfile({
      oromoName: woreda.oromoName || '',
      arabicName: woreda.arabicName || '',
      zone: woreda.zone || '',
      climateZone: woreda.climateZone || '',
      centerLatitude: woreda.centerLatitude?.toString() || '',
      centerLongitude: woreda.centerLongitude?.toString() || '',
      svgPath: woreda.svgPath || '',
      labelX: woreda.labelX?.toString() || '',
      labelY: woreda.labelY?.toString() || '',
      areaKm2: woreda.areaKm2?.toString() || '',
      elevationMeters: woreda.elevationMeters?.toString() || '',
      population: woreda.population?.toString() || '',
      muslimPercentage: woreda.muslimPercentage?.toString() || '',
      councilBranchHead: woreda.councilBranchHead || '',
      headContact: woreda.headContact || '',
      notableFeatures: woreda.notableFeatures?.join('\n') || '',
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || (!editingId && !code.trim())) {
      addToast('Missing Required Fields', 'Enter both the woreda code and display name.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const profile = toGisProfilePayload(gisProfile);
      const saved = editingId
        ? await updateWoredaRecord(editingId, { name, ...profile })
        : await createWoredaRecord({ code, name, ...profile });
      setWoredas((previous) => {
        const next = editingId
          ? previous.map((woreda) => woreda.id === saved.id ? saved : woreda)
          : [...previous, saved];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      addToast(editingId ? 'Woreda Updated' : 'Woreda Registered', `${saved.name} was saved to the location registry.`, 'success');
      resetForm();
    } catch (error) {
      addToast(
        editingId ? 'Could Not Update Woreda' : 'Could Not Register Woreda',
        error instanceof Error ? error.message : 'Please check the details and try again.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAvailability = async (woreda: DirectoryWoreda) => {
    setIsSaving(true);
    try {
      const saved = await updateWoredaRecord(woreda.id, { isActive: !woreda.isActive });
      setWoredas((previous) => previous.map((item) => item.id === saved.id ? saved : item));
      addToast(
        saved.isActive ? 'Woreda Activated' : 'Woreda Deactivated',
        saved.isActive
          ? `${saved.name} is available for new records and public district selection.`
          : `${saved.name} is hidden from public district selection. Existing linked records are retained.`,
        'success'
      );
    } catch (error) {
      addToast('Could Not Change Woreda Availability', error instanceof Error ? error.message : 'Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredWoredas = woredas.filter((woreda) =>
    `${woreda.name} ${woreda.code}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              <MapPin className="h-4 w-4" />
              Location registry
            </div>
            <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">Woredas & districts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">
              Maintain the official locations used by mosque, madrasa, Waqf, and public-service records. Existing records keep their woreda links when a display name changes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadWoredas()}
            disabled={isLoading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-stone-900 dark:text-stone-100">Registered locations</h2>
              <p className="mt-1 text-xs text-stone-500">
                {woredas.filter((woreda) => woreda.isActive).length} active · {woredas.length} total woredas
              </p>
            </div>
            <label className="relative block sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or code"
                className={`${inputClass} pl-9`}
              />
            </label>
          </div>

          {loadError && (
            <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <p className="py-10 text-center text-sm text-stone-500">Loading registered locations…</p>
          ) : filteredWoredas.length === 0 ? (
            <p className="py-10 text-center text-sm text-stone-500">
              {woredas.length ? 'No locations match this search.' : 'No woredas are registered yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Display name</th>
                    <th className="px-3 py-3 font-semibold">Stable code</th>
                    <th className="px-3 py-3 font-semibold">Availability</th>
                    <th className="px-3 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredWoredas.map((woreda) => (
                    <tr key={woreda.id} className="text-stone-700 dark:text-stone-300">
                      <td className="px-3 py-3 font-semibold text-stone-900 dark:text-stone-100">{woreda.name}</td>
                      <td className="px-3 py-3 font-mono text-xs">{woreda.code}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          woreda.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}>
                          {woreda.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => beginEdit(woreda)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Rename
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void toggleAvailability(woreda)}
                          className="ml-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 disabled:opacity-50 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                          {woreda.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="h-fit rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-stone-900 dark:text-stone-100">{editingId ? 'Edit woreda profile' : 'Add a woreda'}</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                Add verified district facts here. Institution and Zakat totals are calculated from their linked records.
              </p>
            </div>
            {editingId !== null && (
              <button type="button" onClick={resetForm} aria-label="Cancel editing" className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            {!editingId && (
              <label className="block space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
                <span>Stable code</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  pattern="[a-z0-9-]+"
                  maxLength={80}
                  required
                  placeholder="e.g. limmu-kosa"
                  className={inputClass}
                />
                <span className="block text-xs font-normal text-stone-500">Lowercase letters, numbers, and hyphens only.</span>
              </label>
            )}
            {editingId !== null && (
              <div className="space-y-1.5 text-sm">
                <span className="block font-medium text-stone-700 dark:text-stone-300">Stable code</span>
                <code className="block rounded-xl bg-stone-100 px-3 py-2.5 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-200">{code}</code>
              </div>
            )}
            <label className="block space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>English display name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                required
                placeholder="e.g. Limmu Kosa"
                className={inputClass}
              />
            </label>
            <details className="rounded-xl border border-stone-200 p-3 dark:border-stone-700">
              <summary className="cursor-pointer text-sm font-semibold text-stone-800 dark:text-stone-200">
                GIS and official district facts
              </summary>
              <div className="mt-4 space-y-4">
                <p className="text-xs leading-5 text-stone-500">
                  These facts appear in the public GIS district card. Use official sources. Mosque, madrasa, student, Waqf, and Zakat figures are not editable here.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Oromo name
                    <input className={inputClass} value={gisProfile.oromoName} onChange={(event) => setGisProfile((previous) => ({ ...previous, oromoName: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Arabic name
                    <input dir="rtl" className={inputClass} value={gisProfile.arabicName} onChange={(event) => setGisProfile((previous) => ({ ...previous, arabicName: event.target.value }))} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Zone / area
                    <input className={inputClass} value={gisProfile.zone} onChange={(event) => setGisProfile((previous) => ({ ...previous, zone: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Climate zone
                    <select className={inputClass} value={gisProfile.climateZone} onChange={(event) => setGisProfile((previous) => ({ ...previous, climateZone: event.target.value as GisProfileForm['climateZone'] }))}>
                      <option value="">Not provided</option>
                      <option value="Highland (Dega)">Highland (Dega)</option>
                      <option value="Midland (Weyna Dega)">Midland (Weyna Dega)</option>
                      <option value="Lowland (Kolla)">Lowland (Kolla)</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Population
                    <input type="number" min="0" step="1" className={inputClass} value={gisProfile.population} onChange={(event) => setGisProfile((previous) => ({ ...previous, population: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Muslim population (%)
                    <input type="number" min="0" max="100" step="0.1" className={inputClass} value={gisProfile.muslimPercentage} onChange={(event) => setGisProfile((previous) => ({ ...previous, muslimPercentage: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Area (km²)
                    <input type="number" min="0" step="0.1" className={inputClass} value={gisProfile.areaKm2} onChange={(event) => setGisProfile((previous) => ({ ...previous, areaKm2: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Elevation (m)
                    <input type="number" step="1" className={inputClass} value={gisProfile.elevationMeters} onChange={(event) => setGisProfile((previous) => ({ ...previous, elevationMeters: event.target.value }))} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Council secretary / branch head
                    <input className={inputClass} value={gisProfile.councilBranchHead} onChange={(event) => setGisProfile((previous) => ({ ...previous, councilBranchHead: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Contact phone
                    <input type="tel" className={inputClass} value={gisProfile.headContact} onChange={(event) => setGisProfile((previous) => ({ ...previous, headContact: event.target.value }))} />
                  </label>
                </div>
                <label className="block space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                  Landmarks (one per line)
                  <textarea rows={3} className={inputClass} value={gisProfile.notableFeatures} onChange={(event) => setGisProfile((previous) => ({ ...previous, notableFeatures: event.target.value }))} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Map center latitude
                    <input type="number" min="-90" max="90" step="any" className={inputClass} value={gisProfile.centerLatitude} onChange={(event) => setGisProfile((previous) => ({ ...previous, centerLatitude: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Map center longitude
                    <input type="number" min="-180" max="180" step="any" className={inputClass} value={gisProfile.centerLongitude} onChange={(event) => setGisProfile((previous) => ({ ...previous, centerLongitude: event.target.value }))} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Map label X (0–1000)
                    <input type="number" min="0" max="1000" step="any" className={inputClass} value={gisProfile.labelX} onChange={(event) => setGisProfile((previous) => ({ ...previous, labelX: event.target.value }))} />
                  </label>
                  <label className="space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                    Map label Y (0–650)
                    <input type="number" min="0" max="650" step="any" className={inputClass} value={gisProfile.labelY} onChange={(event) => setGisProfile((previous) => ({ ...previous, labelY: event.target.value }))} />
                  </label>
                </div>
                <label className="block space-y-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                  Official SVG boundary path
                  <textarea rows={5} className={`${inputClass} font-mono text-xs`} value={gisProfile.svgPath} onChange={(event) => setGisProfile((previous) => ({ ...previous, svgPath: event.target.value }))} placeholder="Paste the verified boundary path for the map canvas" />
                </label>
              </div>
            </details>
            <button
              type="submit"
              disabled={isSaving || isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {isSaving ? 'Saving…' : editingId ? 'Save woreda profile' : 'Register woreda'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
