import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CouncilEvent, EventRegistration } from '../../types';
import {
  Calendar,
  Plus,
  Users,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Download,
  Edit,
  Trash2,
  Ticket,
  Send,
  CalendarCheck2,
  Sparkles,
  QrCode,
  ShieldCheck,
  Building,
  Radio,
  Share2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { usePagination } from '../../hooks/usePagination';
import { PaginationControls } from '../../components/ui/PaginationControls';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { CreateEventModal } from '../../components/events/CreateEventModal';
import { EventAttendeesModal } from '../../components/events/EventAttendeesModal';
import { EventPassModal } from '../../components/events/EventPassModal';

function formatEventDate(value: string) {
  const dateOnly = (value || '').slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, day));
}

export const AdminEventsPage: React.FC = () => {
  const {
    events,
    deleteEvent,
    updateEvent,
    refreshEvents,
    refreshEventRegistrations,
    eventRegistrations,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CouncilEvent | undefined>(undefined);
  const [attendeesEvent, setAttendeesEvent] = useState<CouncilEvent | null>(null);
  const [passData, setPassData] = useState<{
    event: CouncilEvent;
    registration: EventRegistration;
  } | null>(null);

  useEffect(() => {
    void refreshEvents(true);
    void refreshEventRegistrations();
  }, []);

  const categories = [
    'All',
    'Quran Competition',
    'Ulema Conference',
    'Youth Workshop',
    'Lecture',
    'Ramadan Program',
    'Community Gathering',
  ];

  const filteredEvents = events.filter((e) => {
    const s = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (e.title || '').toLowerCase().includes(s) ||
      (e.arabicTitle && e.arabicTitle.includes(searchTerm)) ||
      (e.location || '').toLowerCase().includes(s) ||
      (e.speaker || '').toLowerCase().includes(s);

    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || e.status === selectedStatus;
    const matchesDate = !selectedDate || (e.date || '').slice(0, 10) === selectedDate;

    return matchesSearch && matchesCat && matchesStatus && matchesDate;
  });
  const pagination = usePagination(filteredEvents, 10, `${searchTerm}|${selectedCategory}|${selectedStatus}`);

  // Global KPIs
  const totalCapacity = events.reduce((sum, e) => sum + (e.maxCapacity || 0), 0);
  const totalSeatsBooked = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);
  const totalCheckedIn = eventRegistrations.filter((r) => r.status === 'Checked-In').length;
  const activeRegistrationsOpen = events.filter((e) => e.registrationOpen).length;

  const handleToggleRegistration = async (event: CouncilEvent) => {
    try {
    await updateEvent(event.id, { registrationOpen: !event.registrationOpen });
    addToast(
      'Registration Status Updated',
      `Public registration for "${event.title}" is now ${!event.registrationOpen ? 'OPEN' : 'PAUSED'}.`,
      'info'
    );
    } catch {
      // The app context reports API errors.
    }
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the council schedule?`)) {
      void deleteEvent(id).catch(() => {});
    }
  };

  const handleExportAllRegistrations = () => {
    const headers = ['Event ID', 'Event Title', 'Pass Number', 'Attendee Full Name', 'Phone', 'Kebele', 'Madrasa / Org', 'Seats', 'Status', 'Registered Date'];
    const rows = eventRegistrations.map((r) => [
      r.eventId,
      `"${r.eventTitle}"`,
      r.passNumber,
      `"${r.fullName}"`,
      r.phone,
      r.district,
      `"${r.organizationOrMadrasa || ''}"`,
      r.attendeesCount,
      r.status,
      r.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `All_Council_Event_Registrations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('All Registrations Exported', `Downloaded CSV for ${eventRegistrations.length} registrations.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Scheduling Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Council Directorate for Community Gatherings & Tahfeez</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Events & Programs Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Administer community conferences, manage gate attendance rosters, issue digital passes, and publish hourly program agendas.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllRegistrations}
            icon={<Download className="w-4 h-4" />}
            className="text-xs flex-1 sm:flex-none"
          >
            Export All Registrations
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              setEditingEvent(undefined);
              setIsCreateOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
            className="text-xs flex-1 sm:flex-none"
          >
            Schedule New Program
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Scheduled Gatherings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">{events.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {activeRegistrationsOpen} Gatherings RSVP Open
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Confirmed Attendees</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {totalSeatsBooked.toLocaleString()}
          </p>
          <p className="text-[11px] text-stone-500">
            Total Capacity: {totalCapacity.toLocaleString()} seats
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Verified Gate Check-Ins</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
            {totalCheckedIn}
          </p>
          <p className="text-[11px] text-stone-500">
            Pass verification active
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total Issued Passes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            {eventRegistrations.length}
          </p>
          <p className="text-[11px] text-stone-500">
            Across all council programs
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search event by name, speaker, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
          <input
            type="date"
            aria-label="Filter events and programs by date"
            title="Filter by event date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="All">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Compact cards on narrow screens */}
      <div className="space-y-3 md:hidden">
        {pagination.paginatedItems.map((event) => {
          const count = eventRegistrations.filter((registration) => registration.eventId === event.id).length;
          return <article key={event.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            {event.image && <img src={event.image} alt="" className="h-36 w-full object-cover" />}
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2"><Badge variant="gold">{event.category}</Badge><Badge variant={event.status === 'Upcoming' ? 'emerald' : event.status === 'Cancelled' ? 'rose' : 'slate'}>{event.status}</Badge></div>
              <div><h3 className="font-semibold text-stone-900 dark:text-stone-100">{event.title}</h3>{event.arabicTitle && <p className="mt-1 text-sm text-amber-600">{event.arabicTitle}</p>}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-500">
                <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 shrink-0" />{formatEventDate(event.date)} · {event.time}</p>
                <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0" />{event.location}</p>
                <p className="col-span-2">Lead: {event.speaker || 'Not specified'}</p>
                <p>{event.attendeesCount || 0} / {event.maxCapacity || '—'} attendees</p>
                <p>RSVP {event.registrationOpen ? 'Open' : 'Paused'}</p>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
                <Button variant="primary" size="sm" icon={<Users className="h-3.5 w-3.5" />} onClick={() => setAttendeesEvent(event)}>Attendees ({count})</Button>
                <Button variant="outline" size="sm" onClick={() => void handleToggleRegistration(event)}>{event.registrationOpen ? 'Pause RSVP' : 'Open RSVP'}</Button>
                <Button variant="outline" size="sm" icon={<Edit className="h-3.5 w-3.5" />} onClick={() => { setEditingEvent(event); setIsCreateOpen(true); }}>Edit</Button>
                <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => handleDeleteEvent(event.id, event.title)} aria-label={`Delete ${event.title}`} />
              </div>
            </div>
          </article>;
        })}
        {filteredEvents.length === 0 && <p className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">No events or programs match those filters.</p>}
      </div>

      {/* Full event table on wider screens */}
      <div className="hidden md:block bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] table-fixed text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="w-[24%] p-4">Program & Logistics</th>
                <th className="w-[14%] p-4">Category & Format</th>
                <th className="w-[16%] p-4">Date & Hijri</th>
                <th className="w-[16%] p-4">Keynote / Lead Scholar</th>
                <th className="w-[13%] p-4">RSVP / Capacity</th>
                <th className="w-[9%] p-4">Registration</th>
                <th className="w-[8%] p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {pagination.paginatedItems.map((event) => {
                const eventRegs = eventRegistrations.filter((r) => r.eventId === event.id);
                const capacityPercent = Math.min(
                  100,
                  Math.round(((event.attendeesCount || 0) / (event.maxCapacity || 1)) * 100)
                );

                return (
                  <tr
                    key={event.id}
                    className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    {/* Program info */}
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start gap-3">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm line-clamp-1">
                            {event.title}
                          </h4>
                          {event.arabicTitle && (
                            <p className="text-[11px] font-serif text-amber-600 dark:text-amber-400 truncate">
                              {event.arabicTitle}
                            </p>
                          )}
                          <p className="text-[11px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{event.location}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Format */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <Badge variant="gold">{event.category}</Badge>
                        <div>
                          <span className="text-[10px] font-medium text-stone-500">
                            {event.format || 'In-Person'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4">
                      <div className="min-w-[150px] space-y-1">
                        <p className="whitespace-nowrap font-semibold text-stone-800 dark:text-stone-200">{formatEventDate(event.date)}</p>
                        <p className="whitespace-nowrap text-[11px] text-amber-600 dark:text-amber-400 font-serif">{event.hijriDate}</p>
                        <p className="text-[10px] text-stone-500">{event.time}</p>
                      </div>
                    </td>

                    {/* Keynote */}
                    <td className="p-4 max-w-[180px]">
                      <div className="space-y-0.5">
                        <p className="font-medium text-stone-900 dark:text-stone-100 truncate">{event.speaker}</p>
                        <p className="text-[10px] text-stone-500 truncate">{event.organizer}</p>
                      </div>
                    </td>

                    {/* Capacity */}
                    <td className="p-4 min-w-[140px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {event.attendeesCount} / {event.maxCapacity}
                          </span>
                          <span className="text-stone-500">{capacityPercent}%</span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-stone-500">
                          {eventRegs.length} Registered Passes
                        </p>
                      </div>
                    </td>

                    {/* Registration Status Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleRegistration(event)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-colors ${
                          event.registrationOpen
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-500 border border-stone-300 dark:border-stone-700 hover:bg-stone-300'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${event.registrationOpen ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                        <span>{event.registrationOpen ? 'Open (Live)' : 'Paused'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Users className="w-3.5 h-3.5" />}
                          onClick={() => setAttendeesEvent(event)}
                          className="text-[11px] py-1 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Check-In ({eventRegs.length})
                        </Button>

                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            setIsCreateOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          title="Edit Event Logistics"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Gathering"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls {...pagination} itemLabel="events" onPageChange={pagination.setPage} />

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingEvent(undefined);
        }}
        initialEvent={editingEvent}
      />

      {attendeesEvent && (
        <EventAttendeesModal
          event={attendeesEvent}
          isOpen={!!attendeesEvent}
          onClose={() => setAttendeesEvent(null)}
          onOpenPass={(reg) => {
            setPassData({ event: attendeesEvent, registration: reg });
          }}
        />
      )}

      {passData && (
        <EventPassModal
          event={passData.event}
          registration={passData.registration}
          isOpen={!!passData}
          onClose={() => setPassData(null)}
        />
      )}

    </div>
  );
};
