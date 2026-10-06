import React, { useState } from 'react';
import { MapPin, Building, BookOpen, Users, Compass } from 'lucide-react';

interface DistrictInfo {
  id: string;
  name: string;
  afaanOromoo: string;
  mosques: number;
  madrasas: number;
  students: number;
  ulema: number;
  x: number; // grid position percentage
  y: number;
  isHub?: boolean;
}

export const JimmaDistrictMap: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);

  const districts: DistrictInfo[] = [
    { id: 'd1', name: 'Jimma Central / City', afaanOromoo: 'Magaalaa Jimmaa', mosques: 32, madrasas: 18, students: 1450, ulema: 14, x: 50, y: 50, isHub: true },
    { id: 'd2', name: 'Agaro Town', afaanOromoo: 'Magaalaa Aggaaroo', mosques: 16, madrasas: 9, students: 680, ulema: 5, x: 30, y: 35, isHub: true },
    { id: 'd3', name: 'Kersa District', afaanOromoo: 'Aanaa Qarsaa', mosques: 12, madrasas: 6, students: 410, ulema: 3, x: 62, y: 38 },
    { id: 'd4', name: 'Mana District (Yebu)', afaanOromoo: 'Aanaa Maannaa', mosques: 10, madrasas: 5, students: 340, ulema: 2, x: 42, y: 40 },
    { id: 'd5', name: 'Gomma District', afaanOromoo: 'Aanaa Gommaa', mosques: 14, madrasas: 8, students: 560, ulema: 4, x: 26, y: 48 },
    { id: 'd6', name: 'Limmu Kosa (Genji)', afaanOromoo: 'Aanaa Limmuu Saqqaa/Kosaa', mosques: 11, madrasas: 6, students: 390, ulema: 3, x: 40, y: 22 },
    { id: 'd7', name: 'Seka Chekorsa', afaanOromoo: 'Aanaa Saqqaa Coqorsaa', mosques: 9, madrasas: 4, students: 280, ulema: 2, x: 48, y: 65 },
    { id: 'd8', name: 'Dedo District', afaanOromoo: 'Aanaa Deedo', mosques: 8, madrasas: 4, students: 240, ulema: 2, x: 60, y: 68 },
    { id: 'd9', name: 'Sigmo District', afaanOromoo: 'Aanaa Sigmoo', mosques: 7, madrasas: 3, students: 180, ulema: 1, x: 18, y: 38 },
    { id: 'd10', name: 'Gera District', afaanOromoo: 'Aanaa Geeraa', mosques: 8, madrasas: 4, students: 220, ulema: 2, x: 16, y: 62 },
    { id: 'd11', name: 'Shebe Senbo', afaanOromoo: 'Aanaa Shabee Somboo', mosques: 6, madrasas: 3, students: 160, ulema: 1, x: 34, y: 75 },
    { id: 'd12', name: 'Omo Nada', afaanOromoo: 'Aanaa Oomoo Naaddaa', mosques: 10, madrasas: 5, students: 310, ulema: 2, x: 74, y: 55 },
    { id: 'd13', name: 'Tiro Afeta', afaanOromoo: 'Aanaa Xiroo Affaata', mosques: 7, madrasas: 3, students: 190, ulema: 1, x: 68, y: 26 },
    { id: 'd14', name: 'Chora Botor', afaanOromoo: 'Aanaa Cooraa Botor', mosques: 6, madrasas: 2, students: 150, ulema: 1, x: 78, y: 18 },
    { id: 'd15', name: 'Limmu Seka', afaanOromoo: 'Aanaa Limmuu Saqqaa', mosques: 7, madrasas: 3, students: 170, ulema: 1, x: 30, y: 15 },
    { id: 'd16', name: 'Setema District', afaanOromoo: 'Aanaa Seexamaa', mosques: 5, madrasas: 2, students: 130, ulema: 1, x: 15, y: 22 },
    { id: 'd17', name: 'Sokoru District', afaanOromoo: 'Aanaa Soqorruu', mosques: 8, madrasas: 4, students: 210, ulema: 2, x: 80, y: 40 },
    { id: 'd18', name: 'Nonno Benja', afaanOromoo: 'Aanaa Noonnoo Beenjaa', mosques: 5, madrasas: 2, students: 120, ulema: 1, x: 22, y: 10 },
  ];

  const current = selectedDistrict || districts[0];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Visual Interactive Map Area */}
      <div className="lg:col-span-8 bg-stone-900 text-stone-100 rounded-2xl p-6 relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden border border-stone-800 shadow-xl">
        {/* Stylized Topographic / Geometric Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Map Header */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Jimma Zone Geographic Coverage</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-serif mt-1">
              18 Administrative Districts Representation
            </h3>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-mono">
            128+ Mosques Connected
          </span>
        </div>

        {/* Interactive District Nodes on Map Canvas */}
        <div className="relative w-full h-64 sm:h-72 my-auto z-10">
          {/* Subtle connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none text-emerald-800/40 stroke-current">
            <line x1="50%" y1="50%" x2="30%" y2="35%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="62%" y2="38%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="42%" y2="40%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="26%" y2="48%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="48%" y2="65%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="60%" y2="68%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="74%" y2="55%" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="50%" y1="50%" x2="40%" y2="22%" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>

          {districts.map((d) => {
            const isSelected = current.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d)}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 cursor-pointer ${
                  isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-115'
                }`}
                title={`${d.name} (${d.mosques} Mosques)`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-white text-stone-950 ring-4 ring-amber-400/30'
                        : d.isHub
                        ? 'bg-emerald-600 border-amber-400 text-white'
                        : 'bg-stone-800 border-emerald-500/50 text-emerald-300 hover:bg-emerald-700 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`mt-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm transition-colors ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 font-bold'
                        : 'bg-stone-900/90 text-stone-300 group-hover:text-white'
                    }`}
                  >
                    {d.name.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Footer Tip */}
        <div className="relative z-10 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-800 pt-3">
          <span>* Interactive Prototype Node Model — Click any district marker to inspect details</span>
          <span className="text-amber-400">Jimma Zone, Oromia, Ethiopia</span>
        </div>
      </div>

      {/* Selected District Details Card */}
      <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                District Profile
              </span>
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                {current.name}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {current.afaanOromoo}
              </p>
            </div>
            {current.isHub && (
              <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 rounded-full border border-amber-300">
                Regional Hub
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
                <Building className="w-3.5 h-3.5" />
                <span>Mosques</span>
              </div>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                {current.mosques}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-medium mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Madrasas</span>
              </div>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                {current.madrasas}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Students</span>
              </div>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                {current.students.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40">
              <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Ulema Scholars</span>
              </div>
              <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                {current.ulema}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Zakat Disbursal Rate:</span>
              <span className="font-semibold text-emerald-600">Active (Quarterly)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
              <span className="text-stone-500">Curriculum Standardization:</span>
              <span className="font-semibold">100% Accredited</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">Emergency Janazah Unit:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">On Call 24/7</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
          <p className="text-[11px] text-stone-400 leading-relaxed italic">
            Coordinated via Jimma Central Secretariat & District Shari'ah Desks.
          </p>
        </div>
      </div>
    </div>
  );
};
