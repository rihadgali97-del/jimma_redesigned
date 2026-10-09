import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WoredaGisData, GisPoi } from '../../types/gis';
import { JimmaGisSvgMap, HeatmapMode } from '../../components/gis/JimmaGisSvgMap';
import { DistrictInspectionDrawer } from '../../components/gis/DistrictInspectionDrawer';
import { RouteCalculatorModal } from '../../components/gis/RouteCalculatorModal';
import { PrintableGisDossier } from '../../components/gis/PrintableGisDossier';
import {
  Compass,
  Search,
  Navigation,
  Printer,
  Building,
  BookOpen,
  Users,
  Wallet,
  Sun,
  Droplets,
  BarChart3,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Landmark,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Map as MapIcon,
  Table as TableIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { fetchWoredaGisRecords } from '../../services/directoryApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const GisMapPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [woredas, setWoredas] = useState<WoredaGisData[]>([]);
  const [gisSummary, setGisSummary] = useState({
    woredaCount: 0,
    mosqueCount: 0,
    jummahCount: 0,
    madrasaCount: 0,
    studentCount: 0,
    population: 0,
    annualZakatETB: 0,
  });
  const [woredaLoadError, setWoredaLoadError] = useState('');
  const [isLoadingWoredas, setIsLoadingWoredas] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'map' | 'districts' | 'analytics' | 'routes'>('map');

  // Map Filter State
  const [selectedWoreda, setSelectedWoreda] = useState<WoredaGisData | null>(null);
  const [selectedPoi, setSelectedPoi] = useState<GisPoi | null>(null);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('none');
  const [showLabels, setShowLabels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'mosques' | 'students' | 'zakat' | 'population'>('mosques');

  // Modals
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    fetchWoredaGisRecords()
      .then((records) => {
        const summary = records.reduce((totals, record) => ({
          woredaCount: totals.woredaCount + 1,
          mosqueCount: totals.mosqueCount + Number(record.totalMosques || 0),
          jummahCount: totals.jummahCount + Number(record.jummahMosques || 0),
          madrasaCount: totals.madrasaCount + Number(record.totalMadrasas || 0),
          studentCount: totals.studentCount + Number(record.tahfeezStudents || 0),
          population: totals.population + Number(record.population || 0),
          annualZakatETB: totals.annualZakatETB + Number(record.annualZakatETB || 0),
        }), {
          woredaCount: 0,
          mosqueCount: 0,
          jummahCount: 0,
          madrasaCount: 0,
          studentCount: 0,
          population: 0,
          annualZakatETB: 0,
        });
        console.info('[GIS] Loaded profile totals', summary);
        setGisSummary(summary);
        setWoredas(records.map((record) => ({
          id: record.gisId,
          name: record.name,
          oromoName: record.oromoName || '',
          arabicName: record.arabicName || '',
          zone: record.zone,
          centerCoordinates: {
            lat: record.centerCoordinates.lat,
            lng: record.centerCoordinates.lng,
          },
          svgPath: record.svgPath || null,
          labelPos: { x: record.labelPos.x, y: record.labelPos.y },
          areaKm2: record.areaKm2 ?? null,
          elevationMeters: record.elevationMeters ?? null,
          population: record.population ?? null,
          muslimPercentage: record.muslimPercentage ?? null,
          totalMosques: record.totalMosques,
          jummahMosques: record.jummahMosques,
          totalMadrasas: record.totalMadrasas,
          tahfeezStudents: record.tahfeezStudents,
          annualZakatETB: record.annualZakatETB,
          councilBranchHead: record.councilBranchHead || null,
          headContact: record.headContact || null,
          climateZone: record.climateZone || null,
          notableFeatures: record.notableFeatures || [],
        })));
      })
      .catch((error: unknown) => {
        setWoredaLoadError(error instanceof Error ? error.message : 'Could not load live GIS data.');
      })
      .finally(() => {
        setIsLoadingWoredas(false);
      });
  }, []);

  // Filtered & Sorted Woredas for District Matrix
  const sortedWoredas = useMemo(() => {
    return [...woredas]
      .filter((w) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          w.oromoName.toLowerCase().includes(q) ||
          w.arabicName.toLowerCase().includes(q) ||
          (w.councilBranchHead || '').toLowerCase().includes(q) ||
          (w.zone || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'mosques') return b.totalMosques - a.totalMosques;
        if (sortBy === 'students') return b.tahfeezStudents - a.tahfeezStudents;
        if (sortBy === 'zakat') return b.annualZakatETB - a.annualZakatETB;
        if (sortBy === 'population') return (b.population ?? 0) - (a.population ?? 0);
        return 0;
      });
  }, [searchQuery, sortBy, woredas]);

  // Chart Data
  const barChartData = useMemo(() => {
    return woredas.slice(0, 10).map((w) => ({
      name: w.name.split(' (')[0],
      mosques: w.totalMosques,
      madrasas: w.totalMadrasas,
      students: Math.round(w.tahfeezStudents / 10), // scaled
    }));
  }, [woredas]);

  const climateChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    woredas.forEach((w) => {
      if (w.climateZone) counts[w.climateZone] = (counts[w.climateZone] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [woredas]);

  const CLIMATE_COLORS = ['#059669', '#d97706', '#3b82f6'];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Banner & Header */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white p-8 sm:p-10 shadow-2xl border border-emerald-800/40 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Jimma City Spatial GIS Platform • Oromia Region</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Interactive Jimma City GIS Map
              </h1>
              <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mt-2 leading-relaxed font-sans">
                Kebele facts come from the official registry. Institution and Zakat metrics are calculated from linked records; geographic boundaries appear as administrators enter verified data.
              </p>
            </div>

            {/* Header Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsRouteModalOpen(true)}
                className="bg-stone-900/60 hover:bg-stone-800 text-stone-100 border-stone-700 text-xs font-semibold"
              >
                <Navigation className="w-4 h-4 mr-1.5 text-emerald-400" />
                Kebele Center Distance
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-lg"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Kebele Profile Report
              </Button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mt-8 pt-6 border-t border-emerald-800/60">
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-300 font-medium">Kebeles</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{gisSummary.woredaCount}</div>
              <div className="text-[10px] text-emerald-200/60">Registered Kebeles</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
              <div className="text-[11px] text-emerald-300 font-medium">Total Masajid</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{gisSummary.mosqueCount}</div>
              <div className="text-[10px] text-emerald-200/60">{gisSummary.jummahCount} Jumu’ah Centers</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
              <div className="text-[11px] text-amber-300 font-medium">Registered Madrasas</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-0.5">{gisSummary.madrasaCount}</div>
              <div className="text-[10px] text-amber-200/60">{gisSummary.studentCount.toLocaleString()} Students</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
              <div className="text-[11px] text-blue-300 font-medium">Zonal Population</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {gisSummary.population.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-200/60">Sum of recorded population figures</div>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10">
              <div className="text-[11px] text-teal-300 font-medium">Annual Zakat Tracked</div>
              <div className="text-xl sm:text-2xl font-bold text-teal-300 mt-0.5">
                {(gisSummary.annualZakatETB / 1000000).toFixed(0)}M
              </div>
              <div className="text-[10px] text-teal-200/60">ETB disbursed this year</div>
            </div>
          </div>
        </div>

        {woredaLoadError && (
          <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
            GIS data could not be loaded: {woredaLoadError}
          </div>
        )}
        {isLoadingWoredas && (
          <div className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">
            Loading live kebele profiles…
          </div>
        )}

        {/* View Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'map'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Interactive Spatial Map</span>
            </button>

            <button
              onClick={() => setActiveTab('districts')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'districts'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>{woredas.length}-Kebele Intelligence Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Infrastructure Analytics</span>
            </button>
          </div>

          {/* Quick Search on Top Toolbar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search kebele, mosque, Imam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* TAB 1: INTERACTIVE MAP VIEW */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Map Controls Filter Bar */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <p className="text-stone-500 dark:text-stone-400">
              Institution map markers and facility layers are hidden until verified coordinates and layer records are connected.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">
                Heatmap:
              </span>
              <select
                value={heatmapMode}
                onChange={(e) => setHeatmapMode(e.target.value as HeatmapMode)}
                className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="none">Climate Zone</option>
                <option value="mosques">Mosque Density</option>
                <option value="students">Student Enrollment</option>
                <option value="zakat">Annual Zakat Disbursement</option>
                <option value="muslim_ratio">Muslim Population Ratio</option>
              </select>
            </div>
            </div>

            {/* Interactive Map and Side Drawer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Canvas (8 cols or 12 cols if no selection) */}
              <div className={selectedWoreda || selectedPoi ? 'lg:col-span-8' : 'lg:col-span-12'}>
                <JimmaGisSvgMap
                  woredas={woredas}
                  pois={[]}
                  selectedWoredaId={selectedWoreda?.id || null}
                  selectedPoiId={selectedPoi?.id || null}
                  activePoiTypes={[]}
                  heatmapMode={heatmapMode}
                  onSelectWoreda={(w) => setSelectedWoreda(w)}
                  onSelectPoi={(p) => setSelectedPoi(p)}
                  showLabels={showLabels}
                  filterSolarOnly={false}
                  filterWaterWellOnly={false}
                  searchQuery={searchQuery}
                />
              </div>

              {/* Side Dossier Inspection Drawer (4 cols) */}
              {(selectedWoreda || selectedPoi) && (
                <div className="lg:col-span-4 sticky top-24 animate-in fade-in slide-in-from-right-4">
                  <DistrictInspectionDrawer
                    woreda={selectedWoreda}
                    poi={selectedPoi}
                    onClose={() => {
                      setSelectedWoreda(null);
                      setSelectedPoi(null);
                    }}
                    onSelectPoi={(p) => setSelectedPoi(p)}
                  />
                </div>
              )}
            </div>

            {/* Quick Woreda Chip Selector Ribbon */}
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
              <div className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                Quick Jump to Kebele ({woredas.length} Kebeles)
              </div>
              <div className="flex flex-wrap gap-2">
                {woredas.map((w) => {
                  const isSelected = selectedWoreda?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setSelectedWoreda(isSelected ? null : w);
                        setSelectedPoi(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
                          : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {w.name.split(' (')[0]} ({w.totalMosques})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEBELE INTELLIGENCE MATRIX */}
        {activeTab === 'districts' && (
          <div className="space-y-6">
            {/* Sorting and Search Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="mosques">Mosque Count (Highest First)</option>
                  <option value="students">Student Enrollment</option>
                  <option value="zakat">Annual Zakat Disbursement</option>
                  <option value="population">Kebele Population</option>
                  <option value="name">Alphabetical Order</option>
                </select>
              </div>

              <div className="text-stone-500 font-medium">
                Showing {sortedWoredas.length} of {woredas.length} Kebeles
              </div>
            </div>

            {/* Grid of Kebele Dossier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedWoredas.map((w) => (
                <div
                  key={w.id}
                  className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md hover:shadow-xl p-6 transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="emerald" className="text-[10px]">
                        {w.zone}
                      </Badge>
                      <span className="text-xs font-mono text-stone-400">
                        {w.elevationMeters ?? '—'}m Alt.
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {w.name}
                    </h3>
                    <p className="text-xs font-serif text-amber-700 dark:text-amber-400 mt-0.5">
                      {[w.arabicName, w.oromoName].filter(Boolean).join(' • ')}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-700/50 text-xs">
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Mosques:</span>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {w.totalMosques}{' '}
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({w.jummahMosques} Jumu’ah)
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Madrasas:</span>
                        <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {w.totalMadrasas}{' '}
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({w.tahfeezStudents})
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Muslim Pop:</span>
                        <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                          {w.muslimPercentage == null ? '—' : `${w.muslimPercentage}%`}{' '}
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({w.population == null ? 'population unavailable' : `${(w.population / 1000).toFixed(0)}k`})
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-stone-400 text-[10px] uppercase font-bold">Annual Zakat:</span>
                        <div className="font-bold text-teal-700 dark:text-teal-400 text-sm">
                          {(w.annualZakatETB / 1000000).toFixed(1)}M ETB
                        </div>
                      </div>
                    </div>

                    {/* Liaison Head */}
                    <div className="mt-4 text-xs text-stone-600 dark:text-stone-300">
                      <span className="text-stone-400 text-[11px] font-medium">Council Head:</span>{' '}
                      <strong className="text-stone-800 dark:text-stone-200">{w.councilBranchHead || 'Not recorded'}</strong>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-medium">
                      {w.climateZone || 'Climate not recorded'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWoreda(w);
                        setSelectedPoi(null);
                        setActiveTab('map');
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 cursor-pointer"
                    >
                      <span>Focus on Map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INFRASTRUCTURE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Chart 1: Mosques vs Madrasas in Top 10 Kebeles */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Mosque and Madrasa Distribution by Kebele
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live mosque, madrasa, and student records by kebele
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-3 h-3 rounded bg-emerald-600" /> Mosques
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <span className="w-3 h-3 rounded bg-amber-500" /> Madrasas
                  </span>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#f4f4f5',
                      }}
                    />
                    <Bar dataKey="mosques" fill="#059669" radius={[6, 6, 0, 0]} name="Mosques" />
                    <Bar dataKey="madrasas" fill="#d97706" radius={[6, 6, 0, 0]} name="Madrasas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row: Climate Zones & Spatial Waqf Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Climate Zones Pie Chart */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Kebele Climate & Topographical Stratification
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Affects solar suitability, rainy season accessibility, and seasonal agricultural Zakat cycles
                  </p>
                </div>

                <div className="h-64 w-full my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={climateChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {climateChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CLIMATE_COLORS[index % CLIMATE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">Midland (Weyna Dega)</div>
                    <div className="text-[10px] text-stone-500">11 Kebeles • 1,500-1,850m</div>
                  </div>
                  <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                    <div className="font-bold text-amber-800 dark:text-amber-300">Highland (Dega)</div>
                    <div className="text-[10px] text-stone-500">6 Kebeles • 1,850-2,400m</div>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                    <div className="font-bold text-blue-800 dark:text-blue-300">Lowland (Kolla)</div>
                    <div className="text-[10px] text-stone-500">1 Kebele • &lt; 1,500m</div>
                  </div>
                </div>
              </div>

              {/* Spatial Waqf & Renewable Infrastructure Audit */}
              <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                    Sustainable Infrastructure Audit
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Progress of renewable solar energy and clean water well coverage across rural institutions
                  </p>
                </div>

                <div className="space-y-4 my-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Sun className="w-4 h-4 text-amber-500" />
                        Solar Powered Mosques & Madrasas
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">540 of 920 (58.7%)</span>
                    </div>
                    <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '58.7%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        Borehole Ablution & Clean Drinking Water
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">680 of 920 (73.9%)</span>
                    </div>
                    <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '73.9%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Formal Waqf Land Deed Registered
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">810 of 920 (88.0%)</span>
                    </div>
                    <div className="h-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-emerald-900 dark:text-emerald-200">
                      Council 2027 Sustainability Target
                    </div>
                    <div className="text-[11px] text-stone-500">
                      100% solar lighting & clean deep-water borehole in every rural Jumu'ah mosque.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="text-xs shrink-0"
                  >
                    View Audit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Modals */}
        <RouteCalculatorModal
          woredas={woredas}
          isOpen={isRouteModalOpen}
          onClose={() => setIsRouteModalOpen(false)}
        />
        <PrintableGisDossier
          woredas={woredas}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      </div>
    </div>
  );
};
