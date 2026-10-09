import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WoredaGisRecord, fetchWoredaGisRecords } from '../../services/directoryApi';
import { Compass, ArrowRight, Building, BookOpen } from 'lucide-react';

export const JimmaGisMiniWidget: React.FC = () => {
  const [woredas, setWoredas] = useState<WoredaGisRecord[]>([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchWoredaGisRecords()
      .then((records) => {
        if (isMounted) setWoredas(records);
      })
      .catch((error: unknown) => {
        if (isMounted) setLoadError(error instanceof Error ? error.message : 'Could not load GIS summary.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalMosques = woredas.reduce((sum, woreda) => sum + woreda.totalMosques, 0);
  const totalMadrasas = woredas.reduce((sum, woreda) => sum + woreda.totalMadrasas, 0);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md p-6 relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Jimma City Spatial GIS Overview
            </h3>
            <p className="text-xs text-stone-500">
              Live profiles for {woredas.length} registered kebeles
            </p>
          </div>
        </div>

        <Link
          to="/map"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <span>Open Full GIS Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Mini SVG Preview */}
      <div className="relative h-48 rounded-2xl bg-stone-900 overflow-hidden border border-stone-800 flex items-center justify-center group">
        <svg viewBox="0 0 1000 650" className="w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500">
          {woredas.filter((w) => Boolean(w.svgPath)).map((w) => (
            <path
              key={w.id}
              d={w.svgPath || ''}
              fill="#065f46"
              stroke="#10b981"
              strokeWidth="2"
              opacity="0.8"
              className="hover:fill-emerald-400 hover:opacity-100 transition-all cursor-pointer"
            />
          ))}
          {!loadError && !isLoading && woredas.every((w) => !w.svgPath) && (
            <text x="500" y="330" textAnchor="middle" fill="#cbd5e1" fontSize="22">
              Verified kebele boundaries not added
            </text>
          )}
        </svg>

        {/* Floating badge overlay */}
        <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-xs text-stone-200 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${loadError ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          <span>{loadError || `${woredas.length} Kebeles • ${totalMosques} Registered Mosques`}</span>
        </div>

        <Link
          to="/map"
          className="absolute inset-0 flex items-center justify-center bg-stone-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-2xs transition-opacity text-white text-xs font-bold gap-2"
        >
          <span>Open live GIS kebele profiles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mini Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Kebeles</div>
          <div className="text-base font-bold text-stone-900 dark:text-stone-100">{woredas.length}</div>
        </div>
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Mosques</div>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-emerald-700 dark:text-emerald-400"><Building className="w-4 h-4" />{totalMosques}</div>
        </div>
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Madrasas</div>
          <div className="flex items-center justify-center gap-1 text-base font-bold text-amber-700 dark:text-amber-400"><BookOpen className="w-4 h-4" />{totalMadrasas}</div>
        </div>
      </div>
    </div>
  );
};
