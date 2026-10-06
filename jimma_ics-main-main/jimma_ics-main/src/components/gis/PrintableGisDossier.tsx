import React from 'react';
import { JIMMA_ZONE_WOREDAS, JIMMA_GIS_POIS } from '../../data/mockGisData';
import { X, Printer, Landmark, ShieldCheck, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface PrintableGisDossierProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableGisDossier: React.FC<PrintableGisDossierProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalMosques = JIMMA_ZONE_WOREDAS.reduce((acc, w) => acc + w.totalMosques, 0);
  const totalJummah = JIMMA_ZONE_WOREDAS.reduce((acc, w) => acc + w.jummahMosques, 0);
  const totalMadrasas = JIMMA_ZONE_WOREDAS.reduce((acc, w) => acc + w.totalMadrasas, 0);
  const totalStudents = JIMMA_ZONE_WOREDAS.reduce((acc, w) => acc + w.tahfeezStudents, 0);
  const totalZakat = JIMMA_ZONE_WOREDAS.reduce((acc, w) => acc + w.annualZakatETB, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white text-stone-900 rounded-3xl border border-stone-200 shadow-2xl max-w-4xl w-full p-8 relative my-8 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6 print:hidden">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Official Jimma Zone GIS Spatial Planning Dossier
            </h3>
            <p className="text-xs text-stone-500">
              Ready for council distribution, governmental liaison, and endowment archiving
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={handlePrint} className="text-xs">
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save as PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="space-y-6 print:space-y-4">
          {/* Institutional Letterhead */}
          <div className="text-center border-b-2 border-stone-900 pb-4">
            <div className="font-serif text-amber-700 font-bold text-sm tracking-wider">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center">
                <Landmark className="w-6 h-6 text-amber-300" />
              </div>
              <div className="text-left">
                <h1 className="font-serif font-bold text-xl text-stone-900 leading-tight">
                  JIMMA ZONE ISLAMIC AFFAIRS SUPREME COUNCIL
                </h1>
                <div className="text-xs text-stone-600 font-serif">
                  المجلس الأعلى للشؤون الإسلامية لمنطقة جيما • Majiilisa Islaamummaa Godina Jimmaa
                </div>
              </div>
            </div>
            <div className="text-xs font-semibold text-stone-700 mt-3 uppercase tracking-wider">
              Department of Spatial GIS, Waqf Lands & Mosque Infrastructure
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Comprehensive 18-Woreda Geospatial Infrastructure Audit • Reference: JZC-GIS/2026/08
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-5 gap-3 text-center p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-bold">Woredas</div>
              <div className="text-lg font-bold text-stone-900">18</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-bold">Total Mosques</div>
              <div className="text-lg font-bold text-emerald-800">{totalMosques}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-bold">Jumu'ah Hubs</div>
              <div className="text-lg font-bold text-stone-900">{totalJummah}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-bold">Tahfeez Students</div>
              <div className="text-lg font-bold text-amber-700">{totalStudents.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-bold">Annual Zakat</div>
              <div className="text-lg font-bold text-teal-800">{(totalZakat / 1000000).toFixed(1)}M ETB</div>
            </div>
          </div>

          {/* Table of all 18 Woredas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-stone-200">
              <thead>
                <tr className="bg-stone-100 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-2 border border-stone-200">#</th>
                  <th className="p-2 border border-stone-200">District (Aanaa)</th>
                  <th className="p-2 border border-stone-200">Zone Position</th>
                  <th className="p-2 border border-stone-200">Altitude</th>
                  <th className="p-2 border border-stone-200">Mosques (Jumu'ah)</th>
                  <th className="p-2 border border-stone-200">Madrasas</th>
                  <th className="p-2 border border-stone-200">Students</th>
                  <th className="p-2 border border-stone-200">Council Liaison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {JIMMA_ZONE_WOREDAS.map((w, idx) => (
                  <tr key={w.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/60'}>
                    <td className="p-2 border border-stone-200 font-mono text-stone-500">{idx + 1}</td>
                    <td className="p-2 border border-stone-200 font-semibold text-stone-900">
                      {w.name}
                      <div className="text-[10px] text-stone-500 font-normal">{w.oromoName}</div>
                    </td>
                    <td className="p-2 border border-stone-200 text-stone-600">{w.zone}</td>
                    <td className="p-2 border border-stone-200 font-mono text-stone-600">{w.elevationMeters}m</td>
                    <td className="p-2 border border-stone-200">
                      <strong className="text-emerald-800">{w.totalMosques}</strong>{' '}
                      <span className="text-stone-500">({w.jummahMosques})</span>
                    </td>
                    <td className="p-2 border border-stone-200 font-semibold text-stone-700">{w.totalMadrasas}</td>
                    <td className="p-2 border border-stone-200 font-mono text-amber-800">{w.tahfeezStudents.toLocaleString()}</td>
                    <td className="p-2 border border-stone-200 text-stone-700">{w.councilBranchHead}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Verification Sign-off */}
          <div className="pt-6 border-t-2 border-stone-900 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="font-bold text-stone-900">Verified & Certified by:</div>
              <div className="text-stone-600 mt-1 font-serif">Sheikh Abdullah Ahmed Al-Jimmawi</div>
              <div className="text-stone-500 text-[11px]">Directorate of Mosque Affairs & GIS Mapping</div>
              <div className="mt-4 border-b border-stone-400 w-48" />
              <div className="text-[10px] text-stone-400 mt-0.5">Signature & Official Council Seal</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-stone-900">Executive Approval:</div>
              <div className="text-stone-600 mt-1 font-serif">Dr. Sheikh Jamaluddin Al-Azhari</div>
              <div className="text-stone-500 text-[11px]">President, Jimma Supreme Islamic Council</div>
              <div className="mt-4 border-b border-stone-400 w-48 ml-auto" />
              <div className="text-[10px] text-stone-400 mt-0.5">Official Stamp of Verification</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
