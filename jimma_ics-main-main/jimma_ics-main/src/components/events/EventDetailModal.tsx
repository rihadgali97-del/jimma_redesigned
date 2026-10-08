import React, { useState } from 'react';
import { CouncilEvent, EventRegistration } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  CalendarPlus,
  Download,
  Share2,
  Ticket,
  FileText,
  Video,
  Phone,
  Mail,
  Award,
  Sparkles,
  ChevronRight,
  Info,
  Bell,
  BellRing,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { downloadEventIcs, getGoogleCalendarUrl } from '../../utils/calendarUtils';

interface EventDetailModalProps {
  event: CouncilEvent;
  isOpen: boolean;
  onClose: () => void;
  onOpenPass: (registration: EventRegistration) => void;
  onOpenNotifications: (eventId: string) => void;
  initialTab?: 'overview' | 'agenda' | 'speakers' | 'register';
  isRetryingRejectedPayment?: boolean;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onOpenPass,
  onOpenNotifications,
  initialTab = 'overview',
  isRetryingRejectedPayment = false,
}) => {
  const {
    registerForEvent,
    eventRegistrations,
    eventSubscriptions,
    toggleEventReminder,
    isSubscribedToEvent,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'speakers' | 'register'>(initialTab);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState(event.district || 'Jimma Central');
  const [organization, setOrganization] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [hasSubmittedRetry, setHasSubmittedRetry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userExistingReg = eventRegistrations.find((r) => r.eventId === event.id && r.status !== 'Cancelled');

  const capacityPercent = Math.min(
    100,
    Math.round(((event.attendeesCount || 0) / (event.maxCapacity || 1)) * 100)
  );

  const isFull = (event.attendeesCount || 0) >= (event.maxCapacity || 1);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || (event.isPaid && !email.trim()) || (event.isPaid && !paymentReceipt)) {
      addToast('Missing Fields', event.isPaid
        ? 'Enter your name, phone, email, and attach your payment receipt.'
        : 'Please enter your full name and phone number.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newReg = await registerForEvent({
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        district,
        organizationOrMadrasa: organization.trim() || undefined,
        attendeesCount: Number(attendeesCount) || 1,
        notes: notes.trim() || undefined,
        paymentReceipt: event.isPaid ? paymentReceipt || undefined : undefined,
      });

      if (newReg.passNumber) {
        onClose();
        onOpenPass(newReg);
      } else {
        setPaymentReceipt(null);
        setHasSubmittedRetry(true);
      }
    } catch {
      // The app context displays the server's registration error.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92dvh] min-h-0 flex flex-col shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Image & Top Badges */}
        <div className="relative h-48 sm:h-64 w-full bg-stone-800 overflow-hidden shrink-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-stone-900/70 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-700/50 backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="gold">{event.category}</Badge>
                {event.format && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    {event.format}
                  </span>
                )}
                {event.status && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800/80 text-stone-300 border border-stone-700 backdrop-blur-md">
                    {event.status}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white leading-tight drop-shadow-md">
                {event.title}
              </h1>
              {event.arabicTitle && (
                <p className="text-sm sm:text-base font-serif text-amber-300/90 mt-0.5">
                  {event.arabicTitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/70 px-4 sm:px-6 flex items-center justify-between overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 py-2">
            {[
              { id: 'overview', label: 'Overview & Logistics' },
              { id: 'agenda', label: `Program Agenda (${event.schedule?.length || 0})` },
              { id: 'speakers', label: `Scholars & Speakers (${event.speakersList?.length || 1})` },
              { id: 'register', label: userExistingReg ? 'My Admission Pass' : 'RSVP & Register' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                if (eventSubscriptions.length === 0) {
                  onOpenNotifications(event.id);
                } else {
                  toggleEventReminder(event.id);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isSubscribedToEvent(event.id)
                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-500/50'
              }`}
              title={isSubscribedToEvent(event.id) ? 'Reminder is Active (Click to cancel)' : 'Set Notification Reminder'}
            >
              <Bell className={`w-3.5 h-3.5 ${isSubscribedToEvent(event.id) ? 'fill-current' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">{isSubscribedToEvent(event.id) ? 'Reminder Active' : 'Remind Me'}</span>
            </button>

            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              title="Add to Google Calendar"
            >
              <CalendarPlus className="w-4 h-4" />
            </a>
            <button
              onClick={() => downloadEventIcs(event)}
              className="p-2 text-stone-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              title="Download iCal"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Logistics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                    <Calendar className="w-4 h-4" />
                    <span>Date & Timing</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">{event.date}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{event.hijriDate}</p>
                  <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">{event.time}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>Venue Location</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 truncate">{event.location}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{event.venueDetails || `District: ${event.district}`}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    <Users className="w-4 h-4" />
                    <span>Attendance Quota</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200">
                    {event.attendeesCount?.toLocaleString()} / {event.maxCapacity?.toLocaleString()}
                  </p>
                  <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">{capacityPercent}% Capacity Booked</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Entry & Access</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    {event.isPaid ? `${event.feeAmount?.toLocaleString()} ETB per attendee` : event.entryFee || 'Free Admission'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {event.registrationOpen ? 'Registration Open' : 'Registration Closed'}
                  </p>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-3">
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  About This Gathering & Program Objectives
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Target Audience & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {event.targetAudience && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Target Audience</span>
                    <p className="text-xs text-stone-800 dark:text-stone-200 font-medium">{event.targetAudience}</p>
                  </div>
                )}
                {event.organizer && (
                  <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1">
                    <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Host Directorate</span>
                    <p className="text-xs text-stone-800 dark:text-stone-200 font-medium">{event.organizer}</p>
                  </div>
                )}
              </div>

              {/* Downloads & Program Resources */}
              {event.materials && event.materials.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Official Documents & Guidebooks</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.materials.map((mat, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {mat.fileType}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">{mat.title}</p>
                            <span className="text-[10px] text-stone-500">{mat.size}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => addToast('Resource Downloaded', `${mat.title} saved.`, 'success')}
                          className="text-xs shrink-0"
                        >
                          Get
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Notification & Reminder Card */}
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Automated Event Reminders (Email & Browser)
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {isSubscribedToEvent(event.id)
                        ? 'Reminder active for this event. You will receive an alert prior to commencement.'
                        : `Receive reminders 24–48 hours prior to the program at ${event.location}.`}
                    </p>
                  </div>
                </div>

                <Button
                  variant={isSubscribedToEvent(event.id) ? 'outline' : 'gold'}
                  size="sm"
                  onClick={() => toggleEventReminder(event.id)}
                  icon={<Bell className="w-3.5 h-3.5" />}
                  className="shrink-0 text-xs font-semibold"
                >
                  {isSubscribedToEvent(event.id) ? 'Cancel Reminder' : 'Set Event Reminder'}
                </Button>
              </div>

              {/* Action Banner to Register */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {userExistingReg ? 'You Are Registered For This Event!' : 'Reserve Your Admission Pass Online'}
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {userExistingReg?.paymentStatus === 'PENDING'
                        ? 'Your receipt is being reviewed. The pass will be available after approval.'
                        : userExistingReg
                          ? `Pass #${userExistingReg.passNumber} confirmed. Click below to view or print.`
                          : event.isPaid
                            ? `Pay ${event.feeAmount?.toLocaleString()} ETB per attendee and upload the receipt to reserve a seat.`
                            : 'Free entrance with digital barcode verification. Seats are limited.'}
                    </p>
                  </div>
                </div>

                {userExistingReg ? (
                  userExistingReg.passNumber ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenPass(userExistingReg);
                      }}
                      icon={<Ticket className="w-4 h-4" />}
                      className="shrink-0 text-xs"
                    >
                      View My Pass
                    </Button>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300">Payment under review</span>
                  )
                ) : (
                  <Button
                    variant="gold"
                    size="sm"
                    disabled={!event.registrationOpen || isFull}
                    onClick={() => setActiveTab('register')}
                    icon={<ChevronRight className="w-4 h-4" />}
                    className="shrink-0 text-xs"
                  >
                    {isFull ? 'Sold Out' : 'Register Now'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROGRAM AGENDA SCHEDULE */}
          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                    Chronological Program Timeline
                  </h3>
                  <p className="text-xs text-stone-500">
                    Official schedule ratified by the Council Secretariat.
                  </p>
                </div>
              </div>

              {event.schedule && event.schedule.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                  {event.schedule.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Node Bullet */}
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-stone-900 border-2 border-amber-500 flex items-center justify-center shadow-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      </div>

                      <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700/70 hover:border-amber-500/40 transition-colors space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                            {item.time}
                          </span>
                          {item.hall && (
                            <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <Building className="w-3 h-3 text-emerald-500" />
                              <span>{item.hall}</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {item.activity}
                        </h4>

                        {item.speaker && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 pt-0.5">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>Presenter / Chair: <strong className="text-stone-700 dark:text-stone-300">{item.speaker}</strong></span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/30 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 space-y-2">
                  <Clock className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Detailed Agenda Finalizing</p>
                  <p className="text-xs text-stone-500">The specific hourly breakdown will be published 48 hours prior to the session.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHOLARS & SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  Featured Scholars, Judges & Speakers
                </h3>
                <p className="text-xs text-stone-500">
                  Prominent academic figures and evaluators leading this session.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(event.speakersList && event.speakersList.length > 0
                  ? event.speakersList
                  : [{ name: event.speaker, title: 'Keynote Speaker', role: 'Main Presenter', organization: 'Jimma Islamic Affairs' }]
                ).map((spk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/70 flex items-start gap-3.5"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      {spk.name.charAt(0)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          {spk.role}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                        {spk.name}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">{spk.title}</p>
                      {spk.organization && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-500">{spk.organization}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REGISTER / RSVP FORM */}
          {activeTab === 'register' && (
            <div className="space-y-6">
              {isRetryingRejectedPayment && !hasSubmittedRetry && (
                <p role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-700 dark:text-rose-300">
                  Your previous receipt was rejected. Please check the payment details and upload a clear, valid receipt to try again.
                </p>
              )}
              {userExistingReg ? (
                <div className="p-6 rounded-3xl bg-emerald-950/30 border border-emerald-800/50 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-100">
                      {userExistingReg.paymentStatus === 'PENDING' ? 'Payment receipt submitted' : 'You are confirmed for this gathering!'}
                    </h3>
                    {userExistingReg.paymentStatus === 'PENDING' ? (
                      <p className="text-xs text-stone-400 mt-1">An administrator will review your receipt. Your admission pass will appear here after approval.</p>
                    ) : (
                      <p className="text-xs text-stone-400 mt-1">
                        Pass Number: <strong className="font-mono text-emerald-300">{userExistingReg.passNumber}</strong>
                      </p>
                    )}
                  </div>
                  {userExistingReg.passNumber && <Button
                    variant="gold"
                    onClick={() => {
                      onClose();
                      onOpenPass(userExistingReg);
                    }}
                    icon={<Ticket className="w-4 h-4" />}
                    className="mx-auto text-xs"
                  >
                    Open Digital Admission Pass
                  </Button>}
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-2xl mx-auto min-h-0">
                  <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                    <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                      Complete Public Registration
                    </h3>
                    <p className="text-xs text-stone-500">
                      {event.isPaid
                        ? `Admission is ${event.feeAmount?.toLocaleString()} ETB per attendee. A pass is issued after receipt approval.`
                        : 'Admission is free. Your digital pass will be issued immediately upon submission.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bilal Dawud Ahmed"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Phone Number (SMS Alert) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+251 91 234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Email Address {event.isPaid ? <span className="text-rose-500">*</span> : '(Optional)'}
                      </label>
                      <input
                        type="email"
                        required={Boolean(event.isPaid)}
                        placeholder="bilal@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Your District / Woreda
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                      >
                        {['Jimma Central', 'Bosa Kito', 'Hermata', 'Agaro Town', 'Seka Chekorsa', 'Mana', 'Gomma', 'Kersa', 'Other Zone'].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Madrasa / Organization Affiliation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Grand Anwar Madrasa / Independent"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Reserved Seats (1 - 5)
                      </label>
                      <select
                        value={attendeesCount}
                        onChange={(e) => setAttendeesCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? 'Person (Self)' : 'People (Family / Group)'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Special Requests / Accessibility Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Wheelchair access, translation headset, student competitor accompaniment, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {event.isPaid && (
                    <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">Payment Instructions</h4>
                        <p className="mt-1 whitespace-pre-wrap text-xs text-stone-600 dark:text-stone-300">{event.paymentInstructions}</p>
                        <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          Total: {(Number(event.feeAmount) * attendeesCount).toLocaleString()} ETB
                        </p>
                      </div>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        Payment receipt (JPG, PNG, or PDF) *
                        <input
                          type="file"
                          required
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                          className="block w-full rounded-xl border border-stone-200 bg-white p-2 text-xs dark:border-stone-700 dark:bg-stone-800"
                        />
                      </label>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="gold"
                      disabled={isSubmitting || !event.registrationOpen || isFull}
                      icon={<Ticket className="w-4 h-4" />}
                      className="w-full justify-center text-xs sm:text-sm py-3"
                    >
                      {isSubmitting ? 'Submitting…' : event.isPaid ? 'Submit Receipt for Approval' : 'Confirm Registration & Generate Admission Pass'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>Questions? Contact Council Helpdesk at <strong>{event.contactPhone || '+251 47 111 2345'}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
            {activeTab !== 'register' && !userExistingReg && event.registrationOpen && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => setActiveTab('register')}
                icon={<Ticket className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Register For Attendance
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
