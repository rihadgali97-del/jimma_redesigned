import React from 'react';
import { Link } from 'react-router-dom';
import { JIMMA_ZONE_WOREDAS } from '../../data/mockGisData';
import { MapPin, Compass, ArrowRight, Building, BookOpen, Layers } from 'lucide-react';

export const JimmaGisMiniWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md p-6 relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              Jimma Zone Spatial GIS Overview
            </h3>
            <p className="text-xs text-stone-500">
              Interactive 18-Woredas institutional mapping & geospatial registry
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
          <path
            d="M 120 480 Q 240 510 350 490 T 520 490 T 700 450 T 880 430"
            fill="none"
            stroke="#0284c7"
            strokeWidth="6"
            opacity="0.5"
          />
          {JIMMA_ZONE_WOREDAS.map((w) => (
            <path
              key={w.id}
              d={w.svgPath}
              fill="#065f46"
              stroke="#10b981"
              strokeWidth="2"
              opacity="0.8"
              className="hover:fill-emerald-400 hover:opacity-100 transition-all cursor-pointer"
            />
          ))}
          {/* Highlight Jimma City */}
          <circle cx="505" cy="415" r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" className="animate-pulse" />
          <circle cx="390" cy="285" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="275" cy="300" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="470" cy="150" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="605" cy="385" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <circle cx="490" cy="515" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
        </svg>

        {/* Floating badge overlay */}
        <div className="absolute bottom-3 left-3 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-xs text-stone-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>18 Districts • 920+ Certified Mosques</span>
        </div>

        <Link
          to="/map"
          className="absolute inset-0 flex items-center justify-center bg-stone-950/40 opacity-0 group-hover:opacity-100 backdrop-blur-2xs transition-opacity text-white text-xs font-bold gap-2"
        >
          <span>Explore Live GIS Layers & Distance Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mini Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Woredas</div>
          <div className="text-base font-bold text-stone-900 dark:text-stone-100">18</div>
        </div>
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Solar Systems</div>
          <div className="text-base font-bold text-amber-600 dark:text-amber-400">540 Units</div>
        </div>
        <div className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/50">
          <div className="text-[10px] text-stone-500 font-bold uppercase">Water Wells</div>
          <div className="text-base font-bold text-blue-600 dark:text-blue-400">680 Boreholes</div>
        </div>
      </div>
    </div>
  );
};
