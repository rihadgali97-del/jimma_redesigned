import React, { useState } from 'react';
import { WoredaGisData } from '../../types/gis';
import {
  X,
  Navigation,
  MapPin,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface RouteCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  woredas: WoredaGisData[];
}

export const RouteCalculatorModal: React.FC<RouteCalculatorModalProps> = ({
  isOpen,
  onClose,
  woredas,
}) => {
  const [originId, setOriginId] = useState<string>('jimma-city');
  const [destinationId, setDestinationId] = useState<string>('agaro');

  if (!isOpen) return null;

  const routeableWoredas = woredas.filter(
    (woreda) => woreda.centerCoordinates.lat != null && woreda.centerCoordinates.lng != null
  );
  if (routeableWoredas.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70">
        <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-stone-900">
          <h3 className="font-bold text-stone-900 dark:text-stone-100">Route planning unavailable</h3>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            At least two kebeles need verified map-center coordinates before distance estimates can be shown.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4 text-xs">Close</Button>
        </div>
      </div>
    );
  }

  const originWoreda = routeableWoredas.find((w) => w.id === originId) || routeableWoredas[0];
  const destWoreda = routeableWoredas.find((w) => w.id === destinationId && w.id !== originWoreda.id)
    || routeableWoredas.find((w) => w.id !== originWoreda.id)
    || routeableWoredas[1];

  const calculateStraightLineDistanceKm = () => {
    const latDiff = (destWoreda.centerCoordinates.lat - originWoreda.centerCoordinates.lat) * 111;
    const lngDiff = (destWoreda.centerCoordinates.lng - originWoreda.centerCoordinates.lng) * 111 * Math.cos(originWoreda.centerCoordinates.lat * (Math.PI / 180));
    const directKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    return Math.round(directKm * 10) / 10;
  };

  const distanceKm = calculateStraightLineDistanceKm();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-xl w-full p-6 relative overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                Jimma City Inter-Kebele Route Matrix
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Council logistics, scholar visits, and relief convoy travel planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Origin (Departure Point)
            </label>
            <select
              value={originWoreda.id}
              onChange={(event) => {
                setOriginId(event.target.value);
                if (destWoreda.id === event.target.value) {
                  const alternative = routeableWoredas.find((woreda) => woreda.id !== event.target.value);
                  if (alternative) setDestinationId(alternative.id);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {routeableWoredas.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.elevationMeters ?? '—'}m)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
              Destination Point
            </label>
            <select
              value={destWoreda.id}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {routeableWoredas.filter((w) => w.id !== originWoreda.id).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.elevationMeters ?? '—'}m)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Stats Summary Cards */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 mb-5">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              Direct geographic distance
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              Straight-line estimate, not road distance
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl shadow-xs">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Total Distance</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {distanceKm} km
              </div>
            </div>

            <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl shadow-xs">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Road travel time</div>
              <div className="text-sm font-bold text-stone-500 mt-1">Not available</div>
            </div>

            <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl shadow-xs">
              <div className="text-[10px] text-stone-400 uppercase font-bold">Altitude Delta</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {destWoreda.elevationMeters == null || originWoreda.elevationMeters == null
                  ? '—'
                  : `${Math.abs(destWoreda.elevationMeters - originWoreda.elevationMeters)} m`}
              </div>
            </div>
          </div>
        </div>

        {/* Route Details & Islamic Guidance */}
        <div className="space-y-3 mb-6 text-xs">
          <div className="flex items-start gap-2.5 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-stone-900 dark:text-stone-100">
                Road-network routing is not connected
              </div>
              <div className="text-stone-500 dark:text-stone-400 mt-0.5">
                Only the straight-line distance between administrator-entered center points is shown.
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/${originWoreda.centerCoordinates.lat},${originWoreda.centerCoordinates.lng}/${destWoreda.centerCoordinates.lat},${destWoreda.centerCoordinates.lng}`,
                '_blank'
              );
            }}
            className="text-xs"
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            Open in Navigation GPS
          </Button>
        </div>
      </div>
    </div>
  );
};
