import React, { useRef } from 'react';
import { User } from '../../../types';
import {
  X,
  Printer,
  Download,
  Shield,
  Landmark,
  QrCode,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { StaffAvatar } from './StaffAvatar';

interface StaffBadgeModalProps {
  staff: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffBadgeModal: React.FC<StaffBadgeModalProps> = ({
  staff,
  isOpen,
  onClose,
}) => {
  const badgeRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !staff) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-sm text-white">
              Official Council Staff Credential
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable ID Badge Canvas */}
        <div className="p-6 flex flex-col items-center bg-stone-100 dark:bg-stone-950/60">
          <div
            ref={badgeRef}
            className="w-full max-w-[340px] bg-white rounded-3xl border-2 border-amber-500/80 shadow-xl overflow-hidden text-stone-900 relative"
          >
            {/* Top ID Lanyard Hole visual */}
            <div className="w-full h-3 bg-emerald-900 flex items-center justify-center">
              <div className="w-12 h-1 bg-stone-400 rounded-full" />
            </div>

            {/* Badge Header with Council Seal */}
            <div className="p-4 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-800 text-white text-center border-b border-amber-400/40 relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/50">
                  <Landmark className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="font-serif font-bold text-xs tracking-tight leading-none text-white">
                    JIMMA ZONE ISLAMIC AFFAIRS
                  </h4>
                  <p className="text-[8px] text-amber-300 uppercase tracking-widest font-mono mt-0.5">
                    Supreme Council • Majlis
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-emerald-200 font-serif" dir="rtl">
                المجلس الأعلى للشؤون الإسلامية لمنطقة جيما
              </p>
            </div>

            {/* Photo & Identity */}
            <div className="p-5 flex flex-col items-center text-center space-y-2">
              <div className="relative">
                <StaffAvatar
                  src={staff.avatar}
                  name={staff.name}
                  className="w-24 h-24 rounded-2xl border-4 border-amber-400/80 shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                  {staff.name}
                </h3>
                {staff.arabicName && (
                  <p className="text-xs font-serif text-amber-700 font-semibold mt-0.5">
                    {staff.arabicName}
                  </p>
                )}
                <span className="inline-block mt-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300">
                  {staff.role}
                </span>
                <p className="text-[10px] text-stone-500 font-medium mt-1">
                  {staff.department || 'Council Directorate'}
                </p>
              </div>

              {/* ID Data Table */}
              <div className="w-full bg-stone-50 rounded-xl p-2.5 border border-stone-200 text-left text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-semibold">Staff ID No:</span>
                  <span className="font-mono font-bold text-stone-800">
                    JIC-STF-{staff.id.replace('user-', '').toUpperCase().slice(0, 6)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-semibold">Jurisdiction:</span>
                  <span className="font-semibold text-stone-800">{staff.district || 'Jimma Central'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-semibold">Access Clearance:</span>
                  <span className="font-semibold text-emerald-700">
                    {staff.accessLevel ? staff.accessLevel.split(' ')[0] : 'Level 3'}
                  </span>
                </div>
              </div>

              {/* Security Barcode & QR code */}
              <div className="w-full pt-2 flex items-center justify-between border-t border-stone-200">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-mono tracking-widest text-stone-400 uppercase">
                    AUTHENTICATED CREDENTIAL
                  </span>
                  <div className="h-6 flex items-center gap-0.5 mt-0.5">
                    {[16, 24, 12, 20, 8, 28, 14, 22, 10, 26, 18, 12, 24, 16, 20].map((h, i) => (
                      <div
                        key={i}
                        className="bg-stone-800 w-[2px] rounded-xs"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-12 h-12 bg-white p-1 rounded-lg border border-stone-300 flex items-center justify-center">
                  <QrCode className="w-10 h-10 text-stone-900" />
                </div>
              </div>
            </div>

            {/* Bottom Footer Ribbon */}
            <div className="px-3 py-1.5 bg-stone-900 text-[8px] text-amber-300 font-mono text-center tracking-wider uppercase">
              Official Property of Jimma Islamic Affairs Council
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
            className="text-xs"
          >
            Print ID Card
          </Button>
        </div>
      </div>
    </div>
  );
};
