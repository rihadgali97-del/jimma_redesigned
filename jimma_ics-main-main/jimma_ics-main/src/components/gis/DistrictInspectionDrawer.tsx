import React from 'react';
import { Link } from 'react-router-dom';
import { WoredaGisData, GisPoi, JIMMA_GIS_POIS } from '../../data/mockGisData';
import { useApp } from '../../context/AppContext';
import {
  X,
  Building,
  BookOpen,
  GraduationCap,
  Users,
  Wallet,
  Phone,
  Compass,
  MapPin,
  Sun,
  Droplets,
  ArrowUpRight,
  ExternalLink,
  Share2,
  Printer,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface DistrictInspectionDrawerProps {
  woreda: WoredaGisData | null;
  poi: GisPoi | null;
  onClose: () => void;
  onSelectPoi: (poi: GisPoi) => void;
}

export const DistrictInspectionDrawer: React.FC<DistrictInspectionDrawerProps> = ({
  woreda,
  poi,
  onClose,
  onSelectPoi,
}) => {
  const { addToast } = useApp();

  if (!woreda && !poi) return null;

  // If a POI is selected
  if (poi) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative overflow-hidden transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thumbnail Image */}
        <div className="relative h-44 rounded-2xl overflow-hidden mb-5">
          <img
            src={poi.image}
            alt={poi.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="emerald" className="shadow-md">
              {poi.type.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs text-white/90 font-medium px-2.5 py-1 bg-black/50 backdrop-blur-xs rounded-lg">
              Est. {poi.establishedYear}
            </span>
          </div>
        </div>

        {/* POI Title & Subtitle */}
        <div className="mb-4">
          <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
            {poi.name}
          </h3>
          {poi.arabicName && (
            <p className="text-sm font-serif text-amber-700 dark:text-amber-400 mt-0.5">
              {poi.arabicName}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{poi.address} ({poi.woredaName})</span>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {poi.hasSolarSystem && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-900/60">
              <Sun className="w-3.5 h-3.5" />
              Solar Powered
            </span>
          )}
          {poi.hasWaterWell && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900/60">
              <Droplets className="w-3.5 h-3.5" />
              Water Borehole
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-900/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            Council Certified
          </span>
        </div>

        {/* Lead Official */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 mb-5">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            Institutional Leadership
          </div>
          <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-1">
            {poi.leadPerson}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            {poi.leadRole}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-stone-600 dark:text-stone-300">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <a href={`tel:${poi.phone}`} className="hover:underline font-mono">
              {poi.phone}
            </a>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-6">
          {poi.description}
        </p>

        {/* Direct Action Link */}
        {poi.linkedEntityId ? (
          <Link
            to={poi.type === 'mosque' ? `/mosques/${poi.linkedEntityId}` : `/madrasas/${poi.linkedEntityId}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-colors shadow-md"
          >
            <span>Open Complete Institution Dossier</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        ) : (
          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={() => {
              navigator.clipboard.writeText(`${poi.coordinates.lat}, ${poi.coordinates.lng}`);
              addToast('Coordinates Copied', `GPS: ${poi.coordinates.lat}, ${poi.coordinates.lng}`, 'info');
            }}
          >
            <Compass className="w-3.5 h-3.5 mr-1" />
            Copy GPS Coordinates ({poi.coordinates.lat.toFixed(4)}, {poi.coordinates.lng.toFixed(4)})
          </Button>
        )}
      </div>
    );
  }

  // If a Woreda is selected
  const woredaPois = JIMMA_GIS_POIS.filter((p) => p.woredaId === woreda!.id);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 relative overflow-hidden transition-colors">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* District Header */}
      <div className="mb-5 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="emerald" className="text-[10px]">
            {woreda!.zone}
          </Badge>
          <span className="text-xs font-medium text-stone-400">
            {woreda!.climateZone}
          </span>
        </div>
        <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-stone-100">
          {woreda!.name}
        </h3>
        <p className="text-sm font-serif text-amber-700 dark:text-amber-400 mt-0.5">
          {woreda!.arabicName} • <span className="font-sans text-xs text-stone-500">{woreda!.oromoName}</span>
        </p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <Building className="w-3.5 h-3.5" />
            <span>Mosques</span>
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {woreda!.totalMosques}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {woreda!.jummahMosques} Jumu’ah centers
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Madrasas</span>
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {woreda!.totalMadrasas}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {woreda!.tahfeezStudents.toLocaleString()} students
          </div>
        </div>

        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-1.5 text-xs text-blue-800 dark:text-blue-300 font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Population</span>
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {(woreda!.population / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            {woreda!.muslimPercentage}% Muslim
          </div>
        </div>

        <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-100 dark:border-teal-900/40">
          <div className="flex items-center gap-1.5 text-xs text-teal-800 dark:text-teal-300 font-medium">
            <Wallet className="w-3.5 h-3.5" />
            <span>Annual Zakat</span>
          </div>
          <div className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            {(woreda!.annualZakatETB / 1000000).toFixed(1)}M
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">
            ETB Managed
          </div>
        </div>
      </div>

      {/* Council Branch Representation */}
      <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700/60 mb-5">
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
          District Council Secretariat
        </div>
        <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-1">
          {woreda!.councilBranchHead}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-stone-600 dark:text-stone-300">
          <span className="flex items-center gap-1 text-stone-500">
            <Phone className="w-3 h-3" />
            {woreda!.headContact}
          </span>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            {woreda!.elevationMeters}m Alt. • {woreda!.areaKm2} km²
          </span>
        </div>
      </div>

      {/* Notable Geographical & Islamic Landmarks */}
      <div className="mb-5">
        <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
          Notable Landmarks & Waqf Lands
        </div>
        <div className="space-y-1.5">
          {(woreda?.notableFeatures || []).map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registered Key Institutions in this Woreda */}
      {(woredaPois || []).length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Mapped Facilities ({(woredaPois || []).length})
          </div>
          <div className="space-y-2">
            {(woredaPois || []).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPoi(p)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50/70 dark:bg-stone-800/40 dark:hover:bg-stone-800 text-left transition-colors border border-stone-200 dark:border-stone-700/50 cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    {p.type.replace('_', ' ').toUpperCase()} • Cap. {p.capacityOrStudents}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
