import React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Building,
  Calendar,
  FileText,
  ShieldCheck,
  CreditCard,
  QrCode,
  Download,
  Award,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IslamicPattern } from '../common/IslamicPattern';
import { Donation } from '../../types';

interface ZakatReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
}

export const ZakatReceiptModal: React.FC<ZakatReceiptModalProps> = ({
  isOpen,
  onClose,
  donation,
}) => {
  if (!donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const isZakat =
    donation.categoryType?.includes('Zakat') ||
    donation.fundName.toLowerCase().includes('zakat') ||
    donation.categoryType === 'Coffee Harvest Ushr';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6 print:space-y-4">
        {/* Certificate Outer Frame */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border-4 border-double border-emerald-700/60 p-6 sm:p-8 shadow-xl print:border-emerald-800 print:shadow-none">
          {/* Subtle Islamic Geometry Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
            <IslamicPattern className="w-[500px] h-[500px] text-emerald-900 dark:text-emerald-100" />
          </div>

          {/* Certificate Header */}
          <div className="relative z-10 text-center pb-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex justify-center items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border-2 border-emerald-600/30">
                <Building className="w-6 h-6" />
              </div>
            </div>
            <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-amber-600 dark:text-amber-400">
              Majlis Al-Fatwa wa'l-Irshad • Jimma Zone Islamic Affairs Supreme Council
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-1">
              {isZakat
                ? 'Official Zakat Discharge & Purification Certificate'
                : 'Official Community Contribution Receipt'}
            </h3>
            <p className="text-xs font-serif text-emerald-700 dark:text-emerald-400 mt-1">
              شهادة إبراء ذمة الزكاة والتبرع المبارك
            </p>
          </div>

          {/* Core Certificate Content */}
          <div className="relative z-10 py-6 space-y-6 text-center">
            <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-mono">
              This is to certify that the contribution of
            </p>

            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {donation.donorName || 'Respected Benefactor'}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 text-xs text-stone-600 dark:text-stone-300">
              {donation.email && (
                <span className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                  {donation.email}
                </span>
              )}
              {donation.phone && (
                <span className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full">
                  {donation.phone}
                </span>
              )}
              <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Receipt #{donation.receiptNo}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto leading-relaxed">
              Has been duly received and recorded in the verified treasury of the Jimma Zone Islamic Affairs
              Council. Designated strictly according to the noble Quranic Asnaf (Surah At-Tawbah 9:60) and
              audited under Council Fatwa & Shari'ah directives.
            </p>

            {/* Amount Callout */}
            <div className="inline-block bg-gradient-to-r from-emerald-50 via-amber-50 to-emerald-50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-emerald-950/40 border-2 border-emerald-600/40 dark:border-emerald-500/40 px-8 py-4 rounded-2xl">
              <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider block">
                Discharged Amount
              </span>
              <span className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
                {donation.amountETB.toLocaleString()} ETB
              </span>
              <span className="block text-xs font-serif text-stone-500 dark:text-stone-400 mt-0.5">
                Fund: {donation.fundName} • Category: {donation.categoryType || 'Zakat ul-Mal'}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Transaction Date</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">{donation.date}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Hijri Year</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 font-serif">
                {donation.hijriDate || '1447 AH / 1448 AH'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Channel</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {donation.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Audited & Complete
              </span>
            </div>
          </div>

          {/* Dual Authorization Seals */}
          <div className="relative z-10 pt-6 mt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500/60 flex items-center justify-center text-amber-600 dark:text-amber-400 bg-amber-500/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">
                  Sheikh Dr. Faisal Abdurahman
                </div>
                <div className="text-[10px] text-stone-500">
                  Head of Fatwa, Zakat & Endowments Division
                </div>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 font-mono text-center sm:text-right">
              <div>Verification Hash: SHA256-JIC-{(donation.id || '2026').toUpperCase()}</div>
              <div>Tax-Exempt Reference: {donation.taxExemptCode || 'ET-REV-JIC-2026-903'}</div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Print Certificate
          </Button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
