import React, { useState } from 'react';
import { CouncilEvent, EventScheduleItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Building,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: CouncilEvent;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  initialEvent,
}) => {
  const { addEvent, updateEvent, addToast } = useApp();
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState(initialEvent?.title || '');
  const [arabicTitle, setArabicTitle] = useState(initialEvent?.arabicTitle || '');
  const [category, setCategory] = useState<CouncilEvent['category']>(
    initialEvent?.category || 'Quran Competition'
  );
  const [date, setDate] = useState(initialEvent?.date || '2026-09-15');
  const [hijriDate, setHijriDate] = useState(initialEvent?.hijriDate || '4 Rabi’ al-Awwal 1448 AH');
  const [time, setTime] = useState(initialEvent?.time || '08:30 AM - 04:30 PM');
  const [location, setLocation] = useState(initialEvent?.location || 'Grand Anwar Mosque Auditorium');
  const [venueDetails, setVenueDetails] = useState(initialEvent?.venueDetails || 'Main Auditorium & Conference Hall');
  const [district, setDistrict] = useState(initialEvent?.district || 'Jimma Central');
  const [organizer, setOrganizer] = useState(initialEvent?.organizer || 'Jimma Islamic Council Education Directorate');
  const [speaker, setSpeaker] = useState(initialEvent?.speaker || 'Sheikh Abdullah Ahmed Al-Jimmawi');
  const [description, setDescription] = useState(
    initialEvent?.description ||
      'Grand community gathering dedicated to advancing Quranic sciences, community ethics, and scholastic excellence across Jimma Zone.'
  );
  const [maxCapacity, setMaxCapacity] = useState(initialEvent?.maxCapacity || 500);
  const [format, setFormat] = useState<CouncilEvent['format']>(initialEvent?.format || 'In-Person');
  const [isPaid, setIsPaid] = useState(Boolean(initialEvent?.isPaid));
  const [feeAmount, setFeeAmount] = useState(initialEvent?.feeAmount || 0);
  const [paymentInstructions, setPaymentInstructions] = useState(initialEvent?.paymentInstructions || '');
  const [targetAudience, setTargetAudience] = useState(initialEvent?.targetAudience || 'General Public & Madrasa Students');
  const [livestreamUrl, setLivestreamUrl] = useState(initialEvent?.livestreamUrl || '');
  const [image, setImage] = useState(
    initialEvent?.image ||
      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80'
  );
  const [isFeatured, setIsFeatured] = useState(initialEvent?.isFeatured || false);
  const [registrationOpen, setRegistrationOpen] = useState(
    initialEvent ? initialEvent.registrationOpen : true
  );

  // Agenda Timeline Builder
  const [schedule, setSchedule] = useState<EventScheduleItem[]>(
    initialEvent?.schedule || [
      { time: '08:30 AM - 09:00 AM', activity: 'Arrival, Registration & Welcoming Du’a', hall: 'Main Foyer' },
      { time: '09:00 AM - 12:30 PM', activity: 'Morning Keynote & Competitions Session', speaker: 'Chief Judge', hall: 'Auditorium' },
      { time: '12:30 PM - 02:00 PM', activity: 'Dhuhr Prayer & Communal Lunch', hall: 'Dining Courtyard' },
      { time: '02:00 PM - 04:30 PM', activity: 'Afternoon Panel, Awards & Closing Supplication', hall: 'Main Stage' },
    ]
  );

  if (!isOpen) return null;

  const handleAddScheduleItem = () => {
    setSchedule([
      ...schedule,
      { time: '02:00 PM - 03:00 PM', activity: 'New Program Session', hall: 'Main Hall' },
    ]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleUpdateScheduleItem = (index: number, field: keyof EventScheduleItem, val: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: val };
    setSchedule(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim() || !location.trim()) {
      addToast('Validation Error', 'Please complete title, date, and location.', 'warning');
      return;
    }

    if (isPaid && (!(Number(feeAmount) > 0) || !paymentInstructions.trim())) {
      addToast('Payment Details Required', 'Enter a positive ETB amount and payment instructions for charged events.', 'warning');
      return;
    }

    const payload = {
      title: title.trim(),
      arabicTitle: arabicTitle.trim() || undefined,
      category,
      date,
      hijriDate,
      time,
      location: location.trim(),
      venueDetails: venueDetails.trim() || undefined,
      district,
      organizer: organizer.trim(),
      speaker: speaker.trim(),
      description: description.trim(),
      attendeesCount: initialEvent?.attendeesCount || 0,
      maxCapacity: Number(maxCapacity) || 100,
      isFeatured,
      image,
      registrationOpen,
      format,
      entryFee: isPaid ? `${Number(feeAmount)} ETB` : 'Free',
      isPaid,
      feeAmount: isPaid ? Number(feeAmount) : 0,
      paymentInstructions: isPaid ? paymentInstructions.trim() : undefined,
      targetAudience,
      livestreamUrl: livestreamUrl.trim() || undefined,
      schedule,
    };

    setIsSaving(true);
    try {
      if (initialEvent) {
        await updateEvent(initialEvent.id, payload);
      } else {
        await addEvent(payload);
      }
      onClose();
    } catch {
      // The app context displays the API error and keeps this form available for correction.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                {initialEvent ? 'Edit Program Logistics' : 'Schedule Council Gathering'}
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                {initialEvent ? initialEvent.title : 'Publish New Event & Program Schedule'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Event Title & Category</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold">Event Title (English / Afaan Oromoo) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jimma Zone Grand Quran Memorization Competition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Arabic Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. المسابقة السنوية لحفظ القرآن الكريم"
                  value={arabicTitle}
                  onChange={(e) => setArabicTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500 font-serif"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Quran Competition">Quran Competition (Tahfeez)</option>
                  <option value="Ulema Conference">Ulema Conference & Symposium</option>
                  <option value="Youth Workshop">Youth Workshop & Leadership</option>
                  <option value="Lecture">Lecture Series & Friday Khutbah</option>
                  <option value="Ramadan Program">Ramadan & Taraweeh Program</option>
                  <option value="Community Gathering">Community Gathering & Waqf Consultation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Date, Time & Location */}
          <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>Date, Timing & Venue Logistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Gregorian Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Hijri Date Representation</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Rabi’ al-Awwal 1448 AH"
                  value={hijriDate}
                  onChange={(e) => setHijriDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Daily Time Window *</label>
                <input
                  type="text"
                  placeholder="08:30 AM - 05:00 PM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold">Venue / Mosque Complex *</label>
                <input
                  type="text"
                  required
                  placeholder="Grand Anwar Mosque Auditorium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">District / Woreda</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {['Jimma Central', 'Bosa Kito', 'Hermata', 'Agaro Town', 'Seka Chekorsa', 'Mana', 'Gomma', 'Kersa'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-xs font-semibold">Venue Specifics (Halls, Entrance, Parking)</label>
                <input
                  type="text"
                  placeholder="Main Auditorium (Men), South Conference Hall (Women), Courtyard Exhibition"
                  value={venueDetails}
                  onChange={(e) => setVenueDetails(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Event Payment */}
          <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Admission Payment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Admission Type *</label>
                <select
                  value={isPaid ? 'paid' : 'free'}
                  onChange={(e) => setIsPaid(e.target.value === 'paid')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="free">Free</option>
                  <option value="paid">Charged</option>
                </select>
              </div>
              {isPaid && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Fee per attendee (ETB) *</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold">Payment Instructions *</label>
                    <textarea
                      rows={3}
                      required
                      maxLength={2000}
                      placeholder="Bank/mobile-money account, account holder, and payment reference instructions"
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </>
              )}
            </div>
            {isPaid && (
              <p className="text-xs text-stone-500">
                Attendees must pay, upload a receipt, and wait for an administrator to approve it before a pass is issued.
              </p>
            )}
          </div>

          {/* Section 3: Key People & Description */}
          <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Speakers, Quota & Description</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold">Chief Speaker / Keynote / Lead Judge *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Judge: Sheikh Abdullah Ahmed Al-Jimmawi"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Maximum Attendee Quota *</label>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  required
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="text-xs font-semibold">Detailed Description & Objectives</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold">Banner Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Event Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="In-Person">In-Person at Venue</option>
                  <option value="Hybrid">Hybrid (In-Person + Live Stream)</option>
                  <option value="Live Stream">Online Live Stream Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Hourly Agenda Builder */}
          <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>Program Agenda Timeline Builder ({schedule.length} Slots)</span>
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddScheduleItem}
                icon={<Plus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Add Timeline Item
              </Button>
            </div>

            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700/60 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="09:00 AM - 10:30 AM"
                      value={item.time}
                      onChange={(e) => handleUpdateScheduleItem(idx, 'time', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-mono text-[11px]"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Activity Description"
                      value={item.activity}
                      onChange={(e) => handleUpdateScheduleItem(idx, 'activity', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Presenter / Hall"
                      value={item.hall || item.speaker || ''}
                      onChange={(e) => handleUpdateScheduleItem(idx, 'hall', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveScheduleItem(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Status Toggles */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-md border-stone-300 dark:border-stone-700"
              />
              <span>Registration Open (Public RSVP Enabled)</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded-md border-stone-300 dark:border-stone-700"
              />
              <span>Feature on Public Homepage Banner</span>
            </label>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving…' : initialEvent ? 'Save Changes' : 'Publish Gathering & Open Registration'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
