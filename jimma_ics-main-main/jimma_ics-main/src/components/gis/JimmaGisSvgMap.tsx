import React, { useState, useRef } from 'react';
import { WoredaGisData, GisPoi, JIMMA_ZONE_WOREDAS, JIMMA_GIS_POIS } from '../../data/mockGisData';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Compass,
  Building,
  BookOpen,
  Landmark,
  HandHeart,
  History,
  ShieldAlert,
  Sun,
  Droplets,
  Eye,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export type HeatmapMode = 'none' | 'mosques' | 'students' | 'zakat' | 'muslim_ratio';

interface JimmaGisSvgMapProps {
  selectedWoredaId: string | null;
  selectedPoiId: string | null;
  activePoiTypes: string[];
  heatmapMode: HeatmapMode;
  onSelectWoreda: (woreda: WoredaGisData | null) => void;
  onSelectPoi: (poi: GisPoi | null) => void;
  showLabels: boolean;
  filterSolarOnly: boolean;
  filterWaterWellOnly: boolean;
  searchQuery: string;
}

export const JimmaGisSvgMap: React.FC<JimmaGisSvgMapProps> = ({
  selectedWoredaId,
  selectedPoiId,
  activePoiTypes,
  heatmapMode,
  onSelectWoreda,
  onSelectPoi,
  showLabels,
  filterSolarOnly,
  filterWaterWellOnly,
  searchQuery,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredWoreda, setHoveredWoreda] = useState<WoredaGisData | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<GisPoi | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.35, 0.8));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectWoreda(null);
    onSelectPoi(null);
  };

  // Mouse and Touch pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Heatmap Color Calculation
  const getWoredaFill = (woreda: WoredaGisData, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#10b981'; // Emerald highlight
    if (isHovered) return '#34d399';

    if (heatmapMode === 'mosques') {
      // 30 to 85 range
      const ratio = (woreda.totalMosques - 30) / (85 - 30);
      if (ratio > 0.75) return '#047857'; // Deep emerald
      if (ratio > 0.5) return '#059669';
      if (ratio > 0.25) return '#10b981';
      return '#6ee7b7';
    }

    if (heatmapMode === 'students') {
      // 1000 to 4000
      const ratio = (woreda.tahfeezStudents - 1000) / 3000;
      if (ratio > 0.75) return '#b45309'; // Deep amber
      if (ratio > 0.5) return '#d97706';
      if (ratio > 0.25) return '#f59e0b';
      return '#fde68a';
    }

    if (heatmapMode === 'zakat') {
      // 4M to 19M
      const ratio = (woreda.annualZakatETB - 4000000) / 15000000;
      if (ratio > 0.75) return '#0f766e'; // Deep teal
      if (ratio > 0.5) return '#0d9488';
      if (ratio > 0.25) return '#14b8a6';
      return '#99f6e4';
    }

    if (heatmapMode === 'muslim_ratio') {
      // 75% to 88%
      const ratio = (woreda.muslimPercentage - 75) / 13;
      if (ratio > 0.75) return '#1d4ed8'; // Blue
      if (ratio > 0.5) return '#2563eb';
      if (ratio > 0.25) return '#3b82f6';
      return '#93c5fd';
    }

    // Default Topographical Scheme based on elevation & climate
    if (woreda.climateZone === 'Highland (Dega)') {
      return '#e2e8f0'; // Cool slate highland
    } else if (woreda.climateZone === 'Lowland (Kolla)') {
      return '#fef3c7'; // Warm sand lowland
    }
    // Weyna Dega (Midland)
    return '#ecfdf5'; // Soft green valley
  };

  const getWoredaStroke = (woreda: WoredaGisData, isSelected: boolean) => {
    if (isSelected) return '#064e3b';
    if (heatmapMode !== 'none') return '#ffffff';
    return '#059669';
  };

  // Filtered POIs
  const filteredPois = JIMMA_GIS_POIS.filter((poi) => {
    if (activePoiTypes.length > 0 && !activePoiTypes.includes(poi.type)) {
      return false;
    }
    if (filterSolarOnly && !poi.hasSolarSystem) return false;
    if (filterWaterWellOnly && !poi.hasWaterWell) return false;
    if (selectedWoredaId && poi.woredaId !== selectedWoredaId) return false;
    if (searchQuery.trim()) {
      const q = (searchQuery || '').toLowerCase();
      const match =
        (poi.name || '').toLowerCase().includes(q) ||
        (poi.woredaName || '').toLowerCase().includes(q) ||
        (poi.leadPerson || '').toLowerCase().includes(q) ||
        (poi.address || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getPoiColor = (type: GisPoi['type']) => {
    switch (type) {
      case 'mosque':
        return '#059669'; // Emerald
      case 'madrasa':
        return '#d97706'; // Amber
      case 'council_office':
        return '#4f46e5'; // Indigo
      case 'zakat_center':
        return '#0d9488'; // Teal
      case 'historic_site':
        return '#e11d48'; // Rose
      case 'janazah_center':
        return '#475569'; // Slate
      default:
        return '#10b981';
    }
  };

  const renderPoiIcon = (type: GisPoi['type']) => {
    switch (type) {
      case 'mosque':
        return <Building className="w-3 h-3 text-white" />;
      case 'madrasa':
        return <BookOpen className="w-3 h-3 text-white" />;
      case 'council_office':
        return <Landmark className="w-3 h-3 text-white" />;
      case 'zakat_center':
        return <HandHeart className="w-3 h-3 text-white" />;
      case 'historic_site':
        return <History className="w-3 h-3 text-white" />;
      case 'janazah_center':
        return <ShieldAlert className="w-3 h-3 text-white" />;
      default:
        return <MapPin className="w-3 h-3 text-white" />;
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full overflow-hidden bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl transition-all ${
        isFullscreen ? 'h-screen rounded-none' : 'h-[440px] sm:h-[540px] lg:h-[620px]'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Status & Zone Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-stone-700/60 shadow-lg text-[11px] sm:text-xs text-stone-200">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-semibold text-emerald-400 truncate">Jimma Zone Spatial GIS</span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-stone-300">18 Woredas</span>
          {heatmapMode !== 'none' && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] uppercase font-bold truncate">
              {heatmapMode.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Right Map Canvas Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 bg-stone-950/85 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-stone-700/60 shadow-lg">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 sm:p-2 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 sm:p-2 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Map View"
            className="p-1.5 sm:p-2 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-1.5 sm:p-2 hover:bg-stone-800 text-stone-200 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Map SVG Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Subtle Topographical Grid & Basin Backdrop */}
          <defs>
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f2937" strokeWidth="0.5" opacity="0.4" />
            </pattern>
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
            </linearGradient>
            <filter id="poiGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          <rect width="1000" height="650" fill="url(#gisGrid)" />

          {/* Major Rivers & Waterways (Gilgel Gibe / Gojeb River Basin) */}
          <path
            d="M 120 480 Q 240 510 350 490 T 520 490 T 700 450 T 880 430"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <text x="730" y="475" fill="#38bdf8" fontSize="10" fontStyle="italic" opacity="0.8" letterSpacing="1">
            ~ Gilgel Gibe Basin ~
          </text>

          {/* Woredas / District Boundaries (Polygons) */}
          <g id="woredas-layer">
            {JIMMA_ZONE_WOREDAS.map((woreda) => {
              const isSelected = selectedWoredaId === woreda.id;
              const isHovered = hoveredWoreda?.id === woreda.id;
              const fillColor = getWoredaFill(woreda, isSelected, isHovered);
              const strokeColor = getWoredaStroke(woreda, isSelected);

              return (
                <g
                  key={woreda.id}
                  className="cursor-pointer transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWoreda(isSelected ? null : woreda);
                    onSelectPoi(null);
                  }}
                  onMouseEnter={() => setHoveredWoreda(woreda)}
                  onMouseLeave={() => setHoveredWoreda(null)}
                >
                  <path
                    d={woreda.svgPath}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    style={{
                      fillOpacity: isSelected ? 0.95 : isHovered ? 0.9 : heatmapMode !== 'none' ? 0.85 : 0.65,
                      filter: isSelected ? 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' : 'none',
                    }}
                  />

                  {/* District Label */}
                  {showLabels && (
                    <g pointerEvents="none">
                      <text
                        x={woreda.labelPos.x}
                        y={woreda.labelPos.y}
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#f1f5f9'}
                        fontSize={isSelected ? '12' : '10'}
                        fontWeight={isSelected ? 'bold' : '600'}
                        className="font-sans drop-shadow-sm select-none"
                      >
                        {woreda.name.split(' (')[0]}
                      </text>
                      <text
                        x={woreda.labelPos.x}
                        y={woreda.labelPos.y + 11}
                        textAnchor="middle"
                        fill={isSelected ? '#a7f3d0' : '#94a3b8'}
                        fontSize="8"
                        className="font-sans select-none"
                      >
                        {woreda.totalMosques} Masjids • {woreda.elevationMeters}m
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* POI Markers Layer */}
          <g id="pois-layer">
            {filteredPois.map((poi) => {
              const isSelected = selectedPoiId === poi.id;
              const isHovered = hoveredPoi?.id === poi.id;
              const pinColor = getPoiColor(poi.type);

              return (
                <g
                  key={poi.id}
                  transform={`translate(${poi.mapPos.x}, ${poi.mapPos.y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPoi(isSelected ? null : poi);
                  }}
                  onMouseEnter={() => setHoveredPoi(poi)}
                  onMouseLeave={() => setHoveredPoi(null)}
                >
                  {/* Pulsing ring for selected POI */}
                  {(isSelected || isHovered) && (
                    <circle
                      r="18"
                      fill="none"
                      stroke={pinColor}
                      strokeWidth="2"
                      className="animate-ping"
                      opacity="0.75"
                    />
                  )}

                  {/* Pin outer circle */}
                  <circle
                    r={isSelected ? 14 : isHovered ? 12 : 9}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#poiGlow)"
                    className="transition-all duration-200"
                  />

                  {/* Icon or Inner Indicator */}
                  <circle
                    r={isSelected ? 5 : 3.5}
                    fill="#ffffff"
                    className="transition-all"
                  />

                  {/* Pin Title on hover */}
                  {(isHovered || isSelected) && (
                    <g transform="translate(0, -22)" pointerEvents="none">
                      <rect
                        x="-70"
                        y="-16"
                        width="140"
                        height="20"
                        rx="6"
                        fill="#09090b"
                        stroke="#27272a"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="600"
                        className="truncate"
                      >
                        {poi.name.length > 20 ? poi.name.substring(0, 18) + '...' : poi.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Map Compass Rose in Lower Right */}
          <g transform="translate(930, 580)" pointerEvents="none" opacity="0.65">
            <circle r="24" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
            <path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="#27272a" />
            <path d="M 0 -20 L 4 -5 L 0 0 L -4 -5 Z" fill="#ef4444" />
            <text x="0" y="-24" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">
              N
            </text>
            <text x="26" y="3" textAnchor="start" fill="#a1a1aa" fontSize="7">
              E
            </text>
            <text x="0" y="32" textAnchor="middle" fill="#a1a1aa" fontSize="7">
              S
            </text>
            <text x="-26" y="3" textAnchor="end" fill="#a1a1aa" fontSize="7">
              W
            </text>
          </g>

          {/* Scale Bar in Lower Left */}
          <g transform="translate(40, 600)" pointerEvents="none" opacity="0.7">
            <rect x="0" y="0" width="100" height="4" fill="#52525b" />
            <rect x="0" y="0" width="50" height="4" fill="#e4e4e7" />
            <text x="0" y="14" fill="#a1a1aa" fontSize="8">
              0
            </text>
            <text x="50" y="14" textAnchor="middle" fill="#a1a1aa" fontSize="8">
              25 km
            </text>
            <text x="100" y="14" textAnchor="end" fill="#a1a1aa" fontSize="8">
              50 km
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Floating Legend / Tooltip */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Hovered Woreda or POI Quick Summary Card */}
        {hoveredWoreda ? (
          <div className="pointer-events-auto bg-stone-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-700/80 shadow-xl max-w-sm text-xs animate-in fade-in">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-stone-100 text-sm">{hoveredWoreda.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 text-emerald-300 font-medium text-[10px]">
                {hoveredWoreda.elevationMeters}m Alt.
              </span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">{hoveredWoreda.arabicName}</div>
            <div className="flex items-center gap-4 mt-2 text-stone-300">
              <div>
                <span className="text-stone-400">Masjids:</span>{' '}
                <strong className="text-emerald-400">{hoveredWoreda.totalMosques}</strong>
              </div>
              <div>
                <span className="text-stone-400">Students:</span>{' '}
                <strong className="text-amber-400">{hoveredWoreda.tahfeezStudents}</strong>
              </div>
              <div>
                <span className="text-stone-400">Muslim %:</span>{' '}
                <strong className="text-blue-400">{hoveredWoreda.muslimPercentage}%</strong>
              </div>
            </div>
          </div>
        ) : hoveredPoi ? (
          <div className="pointer-events-auto bg-stone-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-700/80 shadow-xl max-w-sm text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getPoiColor(hoveredPoi.type) }}
              />
              <span className="font-bold text-stone-100 text-sm truncate">{hoveredPoi.name}</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">{hoveredPoi.woredaName}</div>
            <div className="mt-1.5 text-stone-300 text-[11px]">
              <span className="text-stone-400">Lead:</span> {hoveredPoi.leadPerson} ({hoveredPoi.leadRole})
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto bg-stone-950/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-800 shadow-md text-stone-400 text-xs flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Click any woreda boundary or institution pin to inspect detailed Islamic infrastructure dossier.</span>
          </div>
        )}

        {/* POI Legend Pill Strip */}
        <div className="pointer-events-auto flex items-center gap-2 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-stone-700/60 shadow-lg text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-stone-300">Mosques</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-stone-300">Madrasas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-stone-300">Council</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span className="text-stone-300">Zakat</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-stone-300">Heritage</span>
          </div>
        </div>
      </div>
    </div>
  );
};
