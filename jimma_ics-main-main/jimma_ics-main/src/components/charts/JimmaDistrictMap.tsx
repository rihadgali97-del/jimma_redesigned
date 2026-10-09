import React, { useEffect, useState } from 'react';
import { BookOpen, Building, Compass, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchDirectoryWoredas, DirectoryWoreda } from '../../services/directoryApi';

interface DistrictPoint extends DirectoryWoreda {
  x: number;
  y: number;
}

function getDistrictPoints(woredas: DirectoryWoreda[]): DistrictPoint[] {
  return woredas.map((woreda, index) => {
    const angle = (index / Math.max(woredas.length, 1)) * Math.PI * 2 - Math.PI / 2;
    return {
      ...woreda,
      x: 50 + 38 * Math.cos(angle),
      y: 50 + 36 * Math.sin(angle),
    };
  });
}

export const JimmaDistrictMap: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mosques, madrasas } = useApp();
  const [woredas, setWoredas] = useState<DirectoryWoreda[]>([]);
  const [selectedWoredaId, setSelectedWoredaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    fetchDirectoryWoredas()
      .then((rows) => {
        if (!active) return;
        setWoredas(rows);
        setSelectedWoredaId((current) => current ?? rows[0]?.id ?? null);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : 'Could not load registered kebeles.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const points = getDistrictPoints(woredas);
  const current = points.find((woreda) => woreda.id === selectedWoredaId) || points[0];
  const countForWoreda = (items: Array<{ woredaId?: number }>, woredaId: number) =>
    items.filter((item) => item.woredaId === woredaId).length;
  const activeWoredaIds = new Set(woredas.map((woreda) => woreda.id));
  const totalMosques = mosques.filter((mosque) => mosque.woredaId !== undefined && activeWoredaIds.has(mosque.woredaId)).length;

  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-12 ${className}`}>
      <section className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-100 shadow-xl sm:min-h-[440px] lg:col-span-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Compass className="h-4 w-4" />
              <span>Jimma Zone coverage</span>
            </div>
            <h3 className="mt-1 font-serif text-lg font-bold text-white sm:text-xl">
              {woredas.length} registered kebeles
            </h3>
          </div>
          <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 font-mono text-xs text-emerald-300">
            {totalMosques} registered mosques
          </span>
        </div>

        {isLoading ? (
          <div className="relative z-10 grid min-h-64 place-items-center text-sm text-stone-400">Loading registered kebeles…</div>
        ) : loadError ? (
          <div role="alert" className="relative z-10 my-8 rounded-xl border border-rose-800 bg-rose-950/60 p-4 text-sm text-rose-200">
            Kebele information is unavailable: {loadError}
          </div>
        ) : points.length === 0 ? (
          <div className="relative z-10 grid min-h-64 place-items-center text-sm text-stone-400">No kebeles have been registered yet.</div>
        ) : (
          <div className="relative z-10 my-auto h-64 w-full sm:h-72">
            <svg className="pointer-events-none absolute inset-0 h-full w-full stroke-emerald-800/50">
              {points.map((point) => (
                <line
                  key={point.id}
                  x1="50%"
                  y1="50%"
                  x2={`${point.x}%`}
                  y2={`${point.y}%`}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              ))}
            </svg>
            {points.map((woreda) => {
              const isSelected = current?.id === woreda.id;
              return (
                <button
                  key={woreda.id}
                  type="button"
                  onClick={() => setSelectedWoredaId(woreda.id)}
                  style={{ left: `${woreda.x}%`, top: `${woreda.y}%` }}
                  className={`group absolute -translate-x-1/2 -translate-y-1/2 transition-transform ${
                    isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110'
                  }`}
                  title={`${woreda.name}: ${countForWoreda(mosques, woreda.id)} mosques, ${countForWoreda(madrasas, woreda.id)} madrasas`}
                >
                  <span className="flex flex-col items-center">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg sm:h-8 sm:w-8 ${
                      isSelected
                        ? 'border-white bg-amber-500 text-stone-950 ring-4 ring-amber-400/30'
                        : woreda.code === 'jimma-town'
                          ? 'border-amber-400 bg-emerald-600 text-white'
                          : 'border-emerald-500/50 bg-stone-800 text-emerald-300 group-hover:bg-emerald-700 group-hover:text-white'
                    }`}>
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <span className={`mt-1 max-w-28 truncate rounded-md px-2 py-0.5 text-[10px] font-semibold shadow-sm sm:text-xs ${
                      isSelected ? 'bg-amber-400 font-bold text-stone-950' : 'bg-stone-900/90 text-stone-300 group-hover:text-white'
                    }`}>
                      {woreda.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <p className="relative z-10 border-t border-stone-800 pt-3 text-[11px] text-stone-400">
          Schematic kebele view — nodes show registered locations and are not geographic boundaries or to scale.
        </p>
      </section>

      <aside className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 lg:col-span-4">
        {current ? (
          <>
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Selected kebele</span>
                  <h4 className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">{current.name}</h4>
                  <span className="font-mono text-xs text-stone-500">{current.code}</span>
                </div>
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
                  <span className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300"><Building className="h-4 w-4 text-emerald-600" />Registered mosques</span>
                  <strong className="font-mono text-stone-900 dark:text-stone-100">{countForWoreda(mosques, current.id)}</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 dark:bg-stone-800/60">
                  <span className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300"><BookOpen className="h-4 w-4 text-amber-600" />Registered madrasas</span>
                  <strong className="font-mono text-stone-900 dark:text-stone-100">{countForWoreda(madrasas, current.id)}</strong>
                </div>
              </div>
            </div>
            <p className="mt-6 text-xs leading-5 text-stone-500">
              Counts are based on published directory records currently loaded from the council registry.
            </p>
          </>
        ) : (
          <p className="text-sm text-stone-500">{loadError || 'Select a registered kebele to inspect its directory records.'}</p>
        )}
      </aside>
    </div>
  );
};
