import React from 'react';
import {
  Printer,
  Download,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IslamicPattern } from '../common/IslamicPattern';

interface ZakatAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentData: {
    referenceNo: string;
    date: string;
    hijriDate: string;
    nisabStandard: 'gold' | 'silver';
    nisabThresholdETB: number;
    goldRatePerGram: number;
    silverRatePerGram: number;
    calendarType: 'hijri' | 'gregorian';
    currency: 'ETB' | 'USD';
    usdExchangeRate: number;
    grossAssets: {
      cash: number;
      goldSilver: number;
      business: number;
      investments: number;
      receivables: number;
      total: number;
    };
    deductions: {
      debts: number;
      expenses: number;
      total: number;
    };
    netZakatableWealth: number;
    isNisabMet: boolean;
    zakatAlMalDue: number;
    agricultureUshrDue: number;
    livestockZakatDue: number;
    grandTotalZakatETB: number;
    grandTotalZakatUSD: number;
    customNote?: string;
  };
}

export const ZakatAssessmentModal: React.FC<ZakatAssessmentModalProps> = ({
  isOpen,
  onClose,
  assessmentData,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `
JIMMA ZONE ISLAMIC AFFAIRS SUPREME COUNCIL
OFFICIAL ZAKAT ASSESSMENT REPORT
Ref: ${assessmentData.referenceNo}
Date: ${assessmentData.date} (${assessmentData.hijriDate})
--------------------------------------------------
Nisab Standard: ${assessmentData.nisabStandard.toUpperCase()} (${assessmentData.nisabThresholdETB.toLocaleString()} ETB)
Calculation Rate: ${assessmentData.calendarType === 'hijri' ? '2.5% (Hijri Lunar)' : '2.577% (Gregorian Solar)'}

GROSS ASSETS:
- Cash & Liquid Bank Funds: ${assessmentData.grossAssets.cash.toLocaleString()} ETB
- Gold, Silver & Precious: ${assessmentData.grossAssets.goldSilver.toLocaleString()} ETB
- Business Merchandise & Stock: ${assessmentData.grossAssets.business.toLocaleString()} ETB
- Investments & Rental Cash: ${assessmentData.grossAssets.investments.toLocaleString()} ETB
- Recoverable Receivables: ${assessmentData.grossAssets.receivables.toLocaleString()} ETB
TOTAL GROSS ASSETS: ${assessmentData.grossAssets.total.toLocaleString()} ETB

DEDUCTIBLE LIABILITIES:
- Short-term Debts & Payables: ${assessmentData.deductions.debts.toLocaleString()} ETB
- Immediate Essential Expenses: ${assessmentData.deductions.expenses.toLocaleString()} ETB
TOTAL DEDUCTIONS: ${assessmentData.deductions.total.toLocaleString()} ETB

NET ZAKATABLE WEALTH: ${assessmentData.netZakatableWealth.toLocaleString()} ETB
NISAB STATUS: ${assessmentData.isNisabMet ? 'ELIGIBLE (WAJIB)' : 'BELOW NISAB (EXEMPT)'}

FINAL ZAKAT OBLIGATION:
- Zakat al-Mal (2.5%): ${assessmentData.zakatAlMalDue.toLocaleString()} ETB
${assessmentData.agricultureUshrDue > 0 ? `- Agricultural Ushr Harvest: ${assessmentData.agricultureUshrDue.toLocaleString()} ETB\n` : ''}
${assessmentData.livestockZakatDue > 0 ? `- Livestock Zakat: ${assessmentData.livestockZakatDue.toLocaleString()} ETB\n` : ''}
TOTAL DUE: ${assessmentData.grandTotalZakatETB.toLocaleString()} ETB (~$${assessmentData.grandTotalZakatUSD.toLocaleString()} USD)
--------------------------------------------------
Certified under the Fatwa Committee of Jimma Supreme Islamic Council
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Zakat Assessment Statement"
      subtitle={`Assessment Ref: ${assessmentData.referenceNo} • Jimma Islamic Supreme Council Shari'ah Compliance`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Printable Document Container */}
        <div id="zakat-assessment-print-area" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-600/60 shadow-xl relative overflow-hidden text-stone-900 dark:text-stone-100 space-y-6">
          <IslamicPattern opacity={0.04} />

          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-700/40 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-inner">
                <Building className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 block">
                  Majlis Supreme Council • Jimma Zone
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Official Zakat Obligation Assessment
                </h3>
                <span className="text-xs font-serif text-amber-700 dark:text-amber-400">
                  كشف حساب وتقييم فريضة الزكاة الشرعية
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right flex flex-col items-center sm:items-end">
              <Badge variant="emerald" size="md" className="font-mono text-xs">
                Ref: {assessmentData.referenceNo}
              </Badge>
              <span className="text-xs text-stone-500 mt-1 font-mono">
                {assessmentData.date} • {assessmentData.hijriDate}
              </span>
            </div>
          </div>

          {/* Parameters strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div>
              <span className="text-stone-400 uppercase text-[10px] block font-bold">Nisab Benchmark</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {assessmentData.nisabStandard === 'gold' ? 'Gold Standard (85g)' : 'Silver Standard (595g)'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] block font-bold">Nisab Threshold</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {assessmentData.nisabThresholdETB.toLocaleString()} ETB
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] block font-bold">Calculation Basis</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {assessmentData.calendarType === 'hijri' ? 'Hijri Lunar (2.50%)' : 'Solar Gregorian (2.577%)'}
              </span>
            </div>
            <div>
              <span className="text-stone-400 uppercase text-[10px] block font-bold">Nisab Status</span>
              <Badge variant={assessmentData.isNisabMet ? 'emerald' : 'amber'} className="mt-0.5">
                {assessmentData.isNisabMet ? 'Nisab Reached (Wajib)' : 'Below Nisab (Exempt)'}
              </Badge>
            </div>
          </div>

          {/* Ledger Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Column 1: Gross Assets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1.5 font-serif font-bold text-sm text-emerald-800 dark:text-emerald-300">
                <span>1. Zakatable Gross Assets (Mal al-Zakat)</span>
                <span>Amount (ETB)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Cash, Bank Accounts & Telebirr</span>
                  <span className="font-mono font-medium">{assessmentData.grossAssets.cash.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Gold, Silver & Stored Metals</span>
                  <span className="font-mono font-medium">{assessmentData.grossAssets.goldSilver.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Business Inventory & Merchandise</span>
                  <span className="font-mono font-medium">{assessmentData.grossAssets.business.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Investments, Shares & Rental Incomes</span>
                  <span className="font-mono font-medium">{assessmentData.grossAssets.investments.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Debts & Receivables Owed to You</span>
                  <span className="font-mono font-medium">{assessmentData.grossAssets.receivables.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800/40 px-2 py-1.5 rounded-lg">
                  <span>Total Gross Assets:</span>
                  <span className="font-mono">{assessmentData.grossAssets.total.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Column 2: Deductions & Net Pool */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-1.5 font-serif font-bold text-sm text-rose-800 dark:text-rose-400">
                <span>2. Allowable Deductible Liabilities</span>
                <span>Amount (ETB)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Short-Term Personal Debts Due Now</span>
                  <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                    -{assessmentData.deductions.debts.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Immediate Essential Living/Bills</span>
                  <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                    -{assessmentData.deductions.expenses.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1.5 rounded-lg">
                  <span>Total Allowable Deductions:</span>
                  <span className="font-mono">-{assessmentData.deductions.total.toLocaleString()} ETB</span>
                </div>

                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Net Zakatable Wealth:
                    </span>
                    <span className="font-mono font-bold text-base text-emerald-800 dark:text-emerald-300">
                      {assessmentData.netZakatableWealth.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Obligation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white border border-emerald-700/60 shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                Total Certified Zakat Obligation Due
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {assessmentData.grandTotalZakatETB.toLocaleString()} ETB
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  (~${assessmentData.grandTotalZakatUSD.toLocaleString()} USD)
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                Disbursable directly to the Jimma Zone Asnaf Social Welfare Fund or certified regional poor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/80 flex flex-col items-center justify-center text-center text-[8px] uppercase font-bold text-amber-300 p-1">
                <ShieldCheck className="w-4 h-4 mb-0.5" />
                <span>Majlis Fatwa Verified</span>
              </div>
            </div>
          </div>

          {/* Shariah Footnote */}
          <div className="text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-3 flex items-center justify-between">
            <span>
              Calculated in accordance with Islamic jurisprudence and resolutions of the Jimma Zone Islamic Supreme Council.
            </span>
            <span className="font-mono text-[10px]">jimma-islamic-council.org</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            icon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopySummary}
          >
            {copied ? 'Summary Copied!' : 'Copy Assessment Text'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
            >
              Print Assessment
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
