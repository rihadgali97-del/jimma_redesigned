import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Building, MapPin, Search, Filter, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../../components/ui/PaginationControls';

export const MosquesPage: React.FC = () => {
  const { mosques = [] } = useApp();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Extract unique districts
  const districts = ['All', ...Array.from(new Set((mosques || []).map((m) => m.district).filter(Boolean)))];

  const filteredMosques = (mosques || []).filter((m) => {
    const matchSearch =
      (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.imam || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = selectedDistrict === 'All' || m.district === selectedDistrict;
    const matchStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchSearch && matchDistrict && matchStatus;
  });
  const pagination = usePagination(filteredMosques, 12, `${searchTerm}|${selectedDistrict}|${selectedStatus}`);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
          <Building className="w-4 h-4" />
          <span>Council Registry</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Mosques Directory of Jimma City
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base mt-1 max-w-3xl">
          Comprehensive directory of 128+ registered Jumu'ah mosques, prayer centers, and linked madrasas
          across the 18 administrative kebeles of Jimma City.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by mosque name, imam, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:border-emerald-500 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Kebele & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Kebele:</span>
          </div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Kebeles' : d}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="renovation">Under Renovation</option>
            <option value="planned">Planned</option>
          </select>
        </div>
      </div>

      {/* Mosques Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagination.paginatedItems.map((mosque) => {
          const facilitiesList = mosque.facilities || [];
          const imageSrc =
            mosque.image ||
            mosque.imageUrl ||
            'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80';

          return (
            <Card key={mosque.id} hoverEffect className="flex flex-col justify-between">
              <div>
                {/* Image & Status Tag */}
                <div className="h-44 rounded-xl overflow-hidden mb-4 relative bg-stone-800">
                  <img
                    src={imageSrc}
                    alt={mosque.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={mosque.status?.toLowerCase() === 'active' ? 'emerald' : 'gold'}>
                      {mosque.status === 'active' ? 'Active' : mosque.status === 'renovation' ? 'Under renovation' : mosque.status === 'planned' ? 'Planned' : mosque.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{mosque.district}</span>
                  </div>
                </div>

                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  {mosque.name}
                </h3>
                {mosque.arabicName && (
                  <p className="font-serif text-xs text-amber-700 dark:text-amber-400 mt-0.5" dir="rtl">
                    {mosque.arabicName}
                  </p>
                )}
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {mosque.description}
                </p>

                {/* Key metadata */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Imam Khatib:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {mosque.imam}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Capacity:</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {(mosque.capacity || 0).toLocaleString()} worshippers
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">Linked Madrasa:</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium truncate max-w-[180px]">
                      {mosque.madrasaName || 'Not listed'}
                    </span>
                  </div>
                </div>

                {/* Facilities tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {facilitiesList.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    >
                      {f}
                    </span>
                  ))}
                  {facilitiesList.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-stone-400">
                      +{facilitiesList.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 dark:border-stone-800">
                <Link to={`/mosques/${mosque.id}`}>
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                    View Full Details & Prayer Schedule
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <PaginationControls {...pagination} itemLabel="mosques" onPageChange={pagination.setPage} />

      {filteredMosques.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
          <Building className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
            No mosques found
          </h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search criteria or changing the selected kebele filter.
          </p>
        </div>
      )}
    </div>
  );
};
