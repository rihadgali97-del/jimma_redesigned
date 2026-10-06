import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CouncilEvent, EventRegistration } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  CheckCircle2,
  CalendarCheck,
  Building,
  Filter,
  Sparkles,
  Ticket,
  ChevronRight,
  Download,
  CalendarPlus,
  LayoutGrid,
  ListFilter,
  CalendarDays,
  ShieldCheck,
  Share2,
  ExternalLink,
  Award,
  Bell,
  BellRing,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EventDetailModal } from '../../components/events/EventDetailModal';
import { EventPassModal } from '../../components/events/EventPassModal';
import { EventNotificationModal } from '../../components/events/EventNotificationModal';
import { EventNotificationBanner } from '../../components/events/EventNotificationBanner';
import { getGoogleCalendarUrl, downloadEventIcs } from '../../utils/calendarUtils';

export const EventsPage: React.FC = () => {
  const {
    events,
    eventRegistrations,
    eventSubscriptions,
    toggleEventReminder,
    isSubscribedToEvent,
    addToast,
  } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [statusTab, setStatusTab] = useState<'All' | 'Upcoming' | 'Open' | 'MyPasses'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar'>('grid');

  // Modals state
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CouncilEvent | null>(null);
  const [selectedPassData, setSelectedPassData] = useState<{
    event: CouncilEvent;
    registration: EventRegistration;
  } | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [selectedEventForNotification, setSelectedEventForNotification] = useState<string | undefined>(undefined);

  const categories = [
    'All',
    'Quran Competition',
    'Ulema Conference',
    'Youth Workshop',
    'Lecture',
    'Ramadan Program',
    'Community Gathering',
  ];

  const districts = [
    'All',
    'Jimma Central',
    'Bosa Kito',
    'Hermata',
    'Agaro Town',
    'Seka Chekorsa',
    'Mana',
    'Gomma',
    'Kersa',
  ];

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.arabicTitle && e.arabicTitle.includes(searchTerm)) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesDist = selectedDistrict === 'All' || e.district === selectedDistrict;

    let matchesTab = true;
    if (statusTab === 'Upcoming') {
      matchesTab = e.status === 'Upcoming';
    } else if (statusTab === 'Open') {
      matchesTab = e.registrationOpen === true;
    }

    return matchesSearch && matchesCat && matchesDist && matchesTab;
  });

  // Calculate Metrics
  const totalOpenGatherings = events.filter((e) => e.registrationOpen).length;
  const totalCapacity = events.reduce((acc, e) => acc + (e.maxCapacity || 0), 0);
  const totalRegisteredSeats = events.reduce((acc, e) => acc + (e.attendeesCount || 0), 0);
  const quranCompsCount = events.filter((e) => e.category === 'Quran Competition').length;

  const handleOpenRegistrationModal = (event: CouncilEvent) => {
    setSelectedEventForDetail(event);
  };

  const handleOpenExistingPass = (reg: EventRegistration) => {
    const matchedEvent = events.find((e) => e.id === reg.eventId) || {
      id: reg.eventId,
      title: reg.eventTitle,
      category: 'Community Gathering',
      date: reg.eventDate,
      hijriDate: '1448 AH',
      time: '09:00 AM',
      location: 'Grand Anwar Mosque',
      district: reg.district,
      speaker: 'Council Representative',
      description: '',
      attendeesCount: reg.attendeesCount,
      maxCapacity: 100,
      registrationOpen: true,
      image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
    };
    setSelectedPassData({ event: matchedEvent, registration: reg });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-stone-900 to-amber-950 text-white p-6 sm:p-10 border border-amber-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Community Calendar & Tahfeez Programs</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Council Events, Symposia & Quranic Competitions
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Explore public gatherings, annual Tahfeez championships, youth workshops, and scholar conferences hosted across Jimma Zone. Admission is open and free to the public with verified digital admission passes.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedEventForNotification(undefined);
                setIsNotificationModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>Subscribe to Alerts</span>
              {eventSubscriptions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setStatusTab(statusTab === 'MyPasses' ? 'All' : 'MyPasses')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md ${
                statusTab === 'MyPasses'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>My Registered Passes ({eventRegistrations.length})</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="space-y-0.5">
            <p className="text-stone-400 font-medium">Scheduled Gatherings</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-white">{events.length}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-stone-400 font-medium">Open for Registration</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-400">{totalOpenGatherings}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-stone-400 font-medium">Confirmed RSVPs</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-amber-400">
              {totalRegisteredSeats.toLocaleString()} <span className="text-xs font-normal text-stone-400">/ {totalCapacity.toLocaleString()}</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-stone-400 font-medium">Quranic Competitions</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-blue-400">{quranCompsCount} Active</p>
          </div>
        </div>
      </div>

      {/* Event Notification Subscription Banner */}
      <EventNotificationBanner
        onOpenPreferences={() => {
          setSelectedEventForNotification(undefined);
          setIsNotificationModalOpen(true);
        }}
      />

      {/* MY PASSES SECTION (WHEN TOGGLED) */}
      {statusTab === 'MyPasses' && (
        <div className="bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  Your Digital Admission Passes & Sanads
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Present these barcode credentials at venue entrances or print for physical verification.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStatusTab('All')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Back to All Events
            </button>
          </div>

          {eventRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between hover:border-amber-500/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        {reg.passNumber}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {reg.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {reg.eventTitle}
                    </h4>

                    <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{reg.eventDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Attendee: <strong>{reg.fullName}</strong> ({reg.attendeesCount} seat(s))</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400">Issued: {reg.createdAt}</span>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleOpenExistingPass(reg)}
                      icon={<Ticket className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Open Pass
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
              <Ticket className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No Registrations Yet</p>
              <p className="text-xs text-stone-500">Pick any upcoming gathering below and register online for free admission!</p>
            </div>
          )}
        </div>
      )}

      {/* Filter & View Controls */}
      <div className="space-y-4">
        
        {/* Search Bar & District & View Switcher */}
        <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event, speaker, location, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            
            {/* District Dropdown */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 outline-hidden"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts / Woredas' : d}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="Grid Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
                title="Timeline Agenda"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedCategory === c
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-white dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-amber-500/40'
              }`}
            >
              {c === 'All' ? 'All Gatherings' : c}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const userReg = eventRegistrations.find((r) => r.eventId === event.id);
            const capacityPercent = Math.min(
              100,
              Math.round(((event.attendeesCount || 0) / (event.maxCapacity || 1)) * 100)
            );

            return (
              <Card
                key={event.id}
                hoverEffect
                className="flex flex-col justify-between overflow-hidden group border-stone-200 dark:border-stone-800"
              >
                <div>
                  {/* Event Thumbnail */}
                  <div className="relative h-44 -mx-6 -mt-6 mb-4 overflow-hidden bg-stone-900">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/30" />
                    
                    {/* Category & Format Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge variant="gold">{event.category}</Badge>
                      {event.format && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-emerald-300 backdrop-blur-xs border border-white/10">
                          {event.format}
                        </span>
                      )}
                    </div>

                    {/* Date Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-stone-900/80 px-2.5 py-1 rounded-xl backdrop-blur-xs border border-white/10">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{event.date}</span>
                      </div>
                      <span className="text-[11px] font-serif text-amber-300/90 drop-shadow-xs">
                        {event.hijriDate}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    {event.arabicTitle && (
                      <p className="text-xs font-serif text-amber-600 dark:text-amber-400 font-medium">
                        {event.arabicTitle}
                      </p>
                    )}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Key Info Details */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
                      <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">Speaker: <strong>{event.speaker}</strong></span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                      <span>Capacity ({capacityPercent}%)</span>
                      <span>{event.attendeesCount?.toLocaleString()} / {event.maxCapacity?.toLocaleString()} Seats</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleOpenRegistrationModal(event)}
                  >
                    View Agenda
                  </Button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (eventSubscriptions.length === 0) {
                        setSelectedEventForNotification(event.id);
                        setIsNotificationModalOpen(true);
                      } else {
                        toggleEventReminder(event.id);
                      }
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      isSubscribedToEvent(event.id)
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-amber-500 border-stone-200 dark:border-stone-700'
                    }`}
                    title={isSubscribedToEvent(event.id) ? 'Reminder Active (Click to remove)' : 'Notify Me for this event'}
                    aria-label="Toggle Event Reminder"
                  >
                    <Bell className={`w-3.5 h-3.5 ${isSubscribedToEvent(event.id) ? 'fill-current' : ''}`} />
                  </button>

                  {userReg ? (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Ticket className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenExistingPass(userReg)}
                    >
                      My Pass
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      disabled={!event.registrationOpen}
                      icon={<CalendarCheck className="w-3.5 h-3.5" />}
                      className="flex-1 text-xs"
                      onClick={() => handleOpenRegistrationModal(event)}
                    >
                      {event.registrationOpen ? 'RSVP / Register' : 'Closed'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TIMELINE / AGENDA VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {filteredEvents.map((event) => {
            const userReg = eventRegistrations.find((r) => r.eventId === event.id);

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:border-amber-500/40 transition-colors"
              >
                {/* Date Col */}
                <div className="md:w-48 shrink-0 flex md:flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100 dark:border-stone-800 pb-3 md:pb-0 md:pr-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {event.date}
                    </span>
                    <h4 className="text-sm font-serif font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                      {event.hijriDate}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">{event.time}</p>
                  </div>
                  <Badge variant="gold" className="self-start mt-2">
                    {event.category}
                  </Badge>
                </div>

                {/* Details Col */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                      {event.title}
                    </h3>
                    {event.arabicTitle && (
                      <p className="text-xs font-serif text-amber-600 dark:text-amber-400">
                        {event.arabicTitle}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Schedule Pills if available */}
                  {event.schedule && event.schedule.length > 0 && (
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/60 space-y-1.5 text-xs">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                        Program Schedule Highlights:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {event.schedule.slice(0, 4).map((s, i) => (
                          <div key={i} className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{s.time}:</span>
                            <span className="truncate">{s.activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{event.location}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-500" />
                      <span>Keynote: {event.speaker}</span>
                    </span>
                  </div>
                </div>

                {/* Action Col */}
                <div className="md:w-48 shrink-0 flex md:flex-col justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleOpenRegistrationModal(event)}
                    >
                      View Details
                    </Button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (eventSubscriptions.length === 0) {
                          setSelectedEventForNotification(event.id);
                          setIsNotificationModalOpen(true);
                        } else {
                          toggleEventReminder(event.id);
                        }
                      }}
                      className={`p-2 rounded-xl border transition-colors ${
                        isSubscribedToEvent(event.id)
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-amber-500 border-stone-200 dark:border-stone-700'
                      }`}
                      title={isSubscribedToEvent(event.id) ? 'Reminder Active (Click to remove)' : 'Notify Me for this event'}
                      aria-label="Toggle Event Reminder"
                    >
                      <Bell className={`w-3.5 h-3.5 ${isSubscribedToEvent(event.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {userReg ? (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Ticket className="w-3.5 h-3.5" />}
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenExistingPass(userReg)}
                    >
                      View Pass
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="sm"
                      disabled={!event.registrationOpen}
                      icon={<Ticket className="w-3.5 h-3.5" />}
                      className="w-full text-xs"
                      onClick={() => handleOpenRegistrationModal(event)}
                    >
                      {event.registrationOpen ? 'RSVP' : 'Closed'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedEventForDetail && (
        <EventDetailModal
          event={selectedEventForDetail}
          isOpen={!!selectedEventForDetail}
          onClose={() => setSelectedEventForDetail(null)}
          onOpenNotifications={(eventId) => {
            setSelectedEventForNotification(eventId);
            setIsNotificationModalOpen(true);
          }}
          onOpenPass={(reg) => {
            setSelectedPassData({ event: selectedEventForDetail, registration: reg });
          }}
        />
      )}

      {selectedPassData && (
        <EventPassModal
          event={selectedPassData.event}
          registration={selectedPassData.registration}
          isOpen={!!selectedPassData}
          onClose={() => setSelectedPassData(null)}
        />
      )}

      {/* Event Notification & Reminder Modal */}
      <EventNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        preselectedEventId={selectedEventForNotification}
      />

    </div>
  );
};
