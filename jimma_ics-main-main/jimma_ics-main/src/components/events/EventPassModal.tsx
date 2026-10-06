import React, { useEffect, useRef, useState } from 'react';
import { CouncilEvent, EventRegistration } from '../../types';
import {
  drawEventPassOnCanvas,
  downloadPassAsPdf,
  downloadPassAsPng,
} from '../../utils/passCanvasGenerator';
import { downloadEventIcs, getGoogleCalendarUrl } from '../../utils/calendarUtils';
import { useApp } from '../../context/AppContext';
import {
  X,
  Download,
  Calendar,
  CalendarPlus,
  Share2,
  CheckCircle2,
  Printer,
  Smartphone,
  ShieldCheck,
  MapPin,
  Clock,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface EventPassModalProps {
  event: CouncilEvent;
  registration: EventRegistration;
  isOpen: boolean;
  onClose: () => void;
}

export const EventPassModal: React.FC<EventPassModalProps> = ({
  event,
  registration,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast, dispatchMessage, currentUser } = useApp();

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawEventPassOnCanvas(canvasRef.current, event, registration);
    }
  }, [isOpen, event, registration]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);
    try {
      const safeName = registration.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      downloadPassAsPdf(canvasRef.current, `Pass_${safeName}_${registration.passNumber}.pdf`);
      addToast('Pass Downloaded', 'High-resolution PDF pass has been saved to your downloads.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Download Error', 'Could not generate PDF pass.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const safeName = registration.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    downloadPassAsPng(canvasRef.current, `Pass_${safeName}_${registration.passNumber}.png`);
    addToast('Image Downloaded', 'PNG pass asset saved.', 'success');
  };

  const handleDirectPrint = () => {
    if (!canvasRef.current) return;
    const imgUrl = canvasRef.current.toDataURL('image/png');
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Event Admission Pass - ${registration.passNumber}</title>
            <style>
              @page { size: landscape; margin: 0; }
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; }
              img { width: 100vw; height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${imgUrl}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWin.document.close();
    } else {
      window.print();
    }
  };

  const handleCopyPassCode = () => {
    navigator.clipboard.writeText(registration.passNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Pass Code Copied', `${registration.passNumber} copied to clipboard.`, 'info');
  };

  const handleSendSmsConfirmation = async () => {
    await dispatchMessage({
      title: `Event Admission Pass - ${event.title.substring(0, 30)}`,
      category: 'general_bulletin',
      channel: 'sms',
      senderId: currentUser.id,
      recipientTarget: registration.phone,
      recipientCount: 1,
      content: `Assalamu Alaykum ${registration.fullName}, your registration for "${event.title}" is confirmed! Pass #${registration.passNumber}. Date: ${event.date} at ${event.location}. - Jimma Islamic Council`,
      costETB: 0.35,
    });
    addToast('SMS Notification Dispatched', `Confirmation sent to ${registration.phone} via Ethio Telecom.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-stone-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Official Admission Pass
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {registration.status}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100">
                {registration.fullName} - {registration.passNumber}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Canvas Live Preview Container */}
          <div className="bg-stone-950 p-2 sm:p-4 rounded-2xl border border-stone-800 flex items-center justify-center overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              className="w-full max-w-full h-auto rounded-xl border border-amber-500/30 shadow-2xl object-contain aspect-16/9"
            />
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-stone-800/50 p-3.5 rounded-2xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Event Date & Hijri</span>
              </div>
              <p className="font-medium text-stone-200">{event.date}</p>
              <p className="text-[11px] text-amber-400/90">{event.hijriDate}</p>
            </div>

            <div className="bg-stone-800/50 p-3.5 rounded-2xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">Venue & Location</span>
              </div>
              <p className="font-medium text-stone-200 truncate">{event.location}</p>
              <p className="text-[11px] text-stone-400">{event.venueDetails || event.district}</p>
            </div>

            <div className="bg-stone-800/50 p-3.5 rounded-2xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-400">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold">Attendees Count</span>
              </div>
              <p className="font-medium text-stone-200">{registration.attendeesCount} Registered Seat(s)</p>
              <p className="text-[11px] text-stone-400">Affiliation: {registration.organizationOrMadrasa || 'Independent'}</p>
            </div>
          </div>

          {/* Pass Code Bar & Verification Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Present this digital pass or printed voucher at the entrance security gate. QR code validates real-time attendance.
              </span>
            </div>
            <button
              onClick={handleCopyPassCode}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 text-emerald-100 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{registration.passNumber}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-stone-800 bg-stone-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Google Calendar Link */}
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Calendar</span>
            </a>

            {/* iCal Download */}
            <button
              onClick={() => downloadEventIcs(event)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Apple / Outlook iCal</span>
            </button>

            {/* SMS Resend */}
            <button
              onClick={handleSendSmsConfirmation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>SMS Ticket</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectPrint}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
              title="Print Pass"
            >
              <Printer className="w-4 h-4" />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPng}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs border-stone-700 text-stone-200 hover:bg-stone-800"
            >
              PNG Image
            </Button>

            <Button
              variant="gold"
              size="sm"
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {isGenerating ? 'Rendering...' : 'Download PDF Pass'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
