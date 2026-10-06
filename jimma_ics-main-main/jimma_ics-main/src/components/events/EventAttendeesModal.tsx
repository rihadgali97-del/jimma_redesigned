import React, { useEffect, useState } from 'react';
import { CouncilEvent, EventRegistration } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Download,
  MessageSquare,
  QrCode,
  UserPlus,
  Filter,
  Phone,
  Building,
  ShieldCheck,
  Send,
  Printer,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EventAttendeesModalProps {
  event: CouncilEvent;
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: (registration: EventRegistration) => void;
}

export const EventAttendeesModal: React.FC<EventAttendeesModalProps> = ({
  event,
  isOpen,
  onClose,
  onOpenPass,
}) => {
  const {
    eventRegistrations,
    refreshEventRegistrations,
    checkInAttendee,
    registerForEvent,
    dispatchMessage,
    currentUser,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Checked-In' | 'Cancelled'>('All');
  const [showAddWalkIn, setShowAddWalkIn] = useState(false);
  const [showBroadcastSms, setShowBroadcastSms] = useState(false);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInDistrict, setWalkInDistrict] = useState(event.district || 'Jimma Central');
  const [walkInOrg, setWalkInOrg] = useState('');
  const [walkInCount, setWalkInCount] = useState(1);

  // SMS Broadcast state
  const [smsContent, setSmsContent] = useState(
    `Important update regarding "${event.title}": Gathering starts at ${event.time} at ${event.location}. Please have your Pass ready for gate scan.`
  );
  const [isSendingSms, setIsSendingSms] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingAttendees(true);
    void refreshEventRegistrations(event.id).finally(() => setIsLoadingAttendees(false));
  }, [isOpen, event.id]);

  if (!isOpen) return null;

  const eventAttendees = eventRegistrations.filter((r) => r.eventId === event.id);

  const filteredAttendees = eventAttendees.filter((r) => {
    const s = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (r.fullName || '').toLowerCase().includes(s) ||
      (r.phone || '').includes(searchTerm || '') ||
      (r.passNumber || '').toLowerCase().includes(s) ||
      ((r.organizationOrMadrasa || '').toLowerCase().includes(s));
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const checkedInCount = eventAttendees.filter((r) => r.status === 'Checked-In').length;
  const totalSeats = eventAttendees.reduce((acc, r) => acc + (r.attendeesCount || 1), 0);

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || !walkInPhone.trim()) {
      addToast('Validation', 'Please provide attendee name and phone.', 'warning');
      return;
    }

    try {
    const reg = await registerForEvent({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      fullName: walkInName.trim(),
      phone: walkInPhone.trim(),
      district: walkInDistrict,
      organizationOrMadrasa: walkInOrg.trim() || undefined,
      attendeesCount: Number(walkInCount) || 1,
      notes: 'Walk-in gate registration recorded by council staff',
    });

    // Automatically mark checked-in
    await checkInAttendee(reg.id);

    setWalkInName('');
    setWalkInPhone('');
    setWalkInOrg('');
    setShowAddWalkIn(false);
    addToast('Walk-in Added & Checked In', `${reg.fullName} admitted with pass #${reg.passNumber}.`, 'success');
    } catch {
      // The app context reports API errors and leaves the walk-in form open.
    }
  };

  const handleExportCsv = () => {
    const headers = ['Pass Number', 'Full Name', 'Phone', 'Email', 'District', 'Organization / Madrasa', 'Seats', 'Status', 'Date Registered', 'Notes'];
    const rows = eventAttendees.map((r) => [
      r.passNumber,
      `"${r.fullName}"`,
      r.phone,
      r.email || '',
      r.district,
      `"${r.organizationOrMadrasa || ''}"`,
      r.attendeesCount,
      r.status,
      r.createdAt,
      `"${r.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendees_${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('CSV Exported', `Downloaded list of ${eventAttendees.length} attendees.`, 'success');
  };

  const handleSendBroadcastSms = async () => {
    if (!smsContent.trim()) return;
    setIsSendingSms(true);
    try {
      await dispatchMessage({
        title: `Attendee Broadcast - ${event.title.substring(0, 25)}`,
        category: 'general_bulletin',
        channel: 'sms',
        senderId: currentUser.id,
        recipientTarget: `${eventAttendees.length} Confirmed Attendees for ${event.title}`,
        recipientCount: eventAttendees.length,
        content: smsContent,
        costETB: eventAttendees.length * 0.35,
      });

      setIsSendingSms(false);
      setShowBroadcastSms(false);
      addToast(
        'Broadcast Message Dispatched',
        `SMS sent to ${eventAttendees.length} registered attendees via Ethio Telecom shortcode.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      setIsSendingSms(false);
      addToast('Dispatch Failed', 'Could not send broadcast.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Registration & Gate Check-In Desk
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {checkedInCount} / {eventAttendees.length} Checked In
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                {event.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex text-xs"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBroadcastSms(!showBroadcastSms)}
              icon={<Send className="w-3.5 h-3.5 text-emerald-500" />}
              className="text-xs"
            >
              Broadcast SMS
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => setShowAddWalkIn(!showAddWalkIn)}
              icon={<UserPlus className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Add Walk-In
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Walk-In Form Drawer (Conditional) */}
        {showAddWalkIn && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/40 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                <span>On-Site Walk-In Admission & Automatic Gate Pass</span>
              </h4>
              <button
                onClick={() => setShowAddWalkIn(false)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleWalkInSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Full Name *"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number *"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
              <input
                type="text"
                placeholder="Madrasa / Organization"
                value={walkInOrg}
                onChange={(e) => setWalkInOrg(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
              <select
                value={walkInCount}
                onChange={(e) => setWalkInCount(Number(e.target.value))}
                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} Seat(s)</option>
                ))}
              </select>
              <Button type="submit" variant="gold" size="sm" className="justify-center">
                Admit & Check In
              </Button>
            </form>
          </div>
        )}

        {/* SMS Broadcast Drawer (Conditional) */}
        {showBroadcastSms && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/40 animate-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                <span>Send SMS Broadcast to all {eventAttendees.length} Attendees</span>
              </h4>
              <button
                onClick={() => setShowBroadcastSms(false)}
                className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300"
              >
                Close
              </button>
            </div>
            <textarea
              rows={2}
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs sm:text-sm"
            />
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Estimated Cost: {(eventAttendees.length * 0.35).toFixed(2)} ETB via Ethio Telecom Shortcode</span>
              <Button
                variant="primary"
                size="sm"
                disabled={isSendingSms}
                onClick={handleSendBroadcastSms}
                icon={<Send className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                {isSendingSms ? 'Transmitting...' : 'Dispatch Broadcast Now'}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attendee, pass #, phone, madrasa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {(['All', 'Confirmed', 'Checked-In', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Attendees List Table */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredAttendees.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="p-3">Pass No</th>
                    <th className="p-3">Attendee Name</th>
                    <th className="p-3">Contact Phone</th>
                    <th className="p-3">Madrasa / Affiliation</th>
                    <th className="p-3 text-center">Seats</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {!isLoadingAttendees && filteredAttendees.map((att) => (
                    <tr
                      key={att.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {att.passNumber}
                      </td>
                      <td className="p-3 font-medium text-stone-900 dark:text-stone-100">
                        {att.fullName}
                        {att.notes && (
                          <p className="text-[10px] text-stone-500 font-normal italic line-clamp-1">{att.notes}</p>
                        )}
                      </td>
                      <td className="p-3 text-stone-600 dark:text-stone-400 font-mono">
                        {att.phone}
                      </td>
                      <td className="p-3 text-stone-600 dark:text-stone-400">
                        {att.organizationOrMadrasa || `District of ${att.district}`}
                      </td>
                      <td className="p-3 text-center font-bold text-stone-800 dark:text-stone-200">
                        {att.attendeesCount}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            att.status === 'Checked-In'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : att.status === 'Confirmed'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {att.status === 'Checked-In' && <CheckCircle2 className="w-3 h-3" />}
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {att.status !== 'Checked-In' && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<CheckCircle2 className="w-3 h-3" />}
                              onClick={() => void checkInAttendee(att.id).catch(() => {})}
                              className="text-[11px] py-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              Check In
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<QrCode className="w-3.5 h-3.5" />}
                            onClick={() => onOpenPass(att)}
                            className="text-[11px] py-1"
                            title="View Digital Pass"
                          >
                            Pass
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : isLoadingAttendees ? (
            <div className="p-12 text-center text-stone-500">Loading registrations…</div>
          ) : (
            <div className="p-12 text-center text-stone-500 space-y-2">
              <Users className="w-8 h-8 mx-auto text-stone-400" />
              <p className="font-semibold text-sm">No attendees match your search or filter</p>
              <p className="text-xs">Try clearing the search box or adding an on-site walk-in attendee.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 flex items-center justify-between text-xs text-stone-500">
          <div>
            Total Registrations: <strong>{eventAttendees.length}</strong> | Admitted Seats: <strong>{totalSeats}</strong>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>

      </div>
    </div>
  );
};
