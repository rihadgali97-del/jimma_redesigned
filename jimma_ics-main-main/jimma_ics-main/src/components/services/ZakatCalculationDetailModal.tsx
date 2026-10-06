import React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Building,
  Calendar,
  FileText,
  Scale,
  Coins,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IslamicPattern } from '../common/IslamicPattern';
import { ZakatCalculationRecord } from '../../types';

interface ZakatCalculationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ZakatCalculationRecord | null;
  onLoadIntoCalculator?: (record: ZakatCalculationRecord) => void;
  onProceedToPayment?: (amountETB: number) => void;
}

export const ZakatCalculationDetailModal: React.FC<ZakatCalculationDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onLoadIntoCalculator,
  onProceedToPayment,
}) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6 print:space-y-4">
        {/* Certificate Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 text-white p-6 border border-emerald-800/80 shadow-md">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <IslamicPattern className="w-56 h-56 text-amber-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 font-mono block">
                  Archived Assessment • {record.id}
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                  {record.title}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Assessed by {record.userName} ({record.userEmail})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={record.status === 'Fulfilled / Discharged' ? 'success' : 'warning'}
                className="text-xs py-1 px-3"
              >
                {record.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Shari'ah & Timing Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Assessment Date</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200">{record.date}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Hijri Year</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 font-serif">{record.hijriYear}</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Nisab Standard</span>
            <span className="font-semibold text-stone-800 dark:text-stone-200 capitalize">
              {record.nisabStandard} (85g benchmark)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Nisab Threshold</span>
            <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
              {record.nisabThresholdETB.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Itemized Asset Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Itemized Asset & Deduction Evaluation</span>
          </h4>

          <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="py-2.5 px-4">Wealth Category</th>
                  <th className="py-2.5 px-4">Description / Fiqh Rule</th>
                  <th className="py-2.5 px-4 text-right">Evaluated Value (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-900">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    Cash & Liquid Balances
                  </td>
                  <td className="py-2.5 px-4 text-stone-500">
                    Cash on hand, bank balances, Telebirr & CBE Birr
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    {record.assetBreakdown.cashAndLiquidityETB.toLocaleString()} ETB
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    Gold & Silver Bullion
                  </td>
                  <td className="py-2.5 px-4 text-stone-500">
                    Jewelry exceeding personal customary wear & bullion
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    {record.assetBreakdown.goldAndSilverETB.toLocaleString()} ETB
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                    Business Merchandise ('Urud)
                  </td>
                  <td className="py-2.5 px-4 text-stone-500">
                    Wholesale trade inventory at current market replacement value
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    {record.assetBreakdown.businessStockETB.toLocaleString()} ETB
                  </td>
                </tr>
                {record.assetBreakdown.investmentsETB > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                      Investments & Rental Returns
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      Liquid dividends & accrued net rental yields
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">
                      {record.assetBreakdown.investmentsETB.toLocaleString()} ETB
                    </td>
                  </tr>
                )}
                {record.assetBreakdown.agricultureUshrETB > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-amber-700 dark:text-amber-400">
                      Jimma Coffee & Harvest (Ushr)
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      Agricultural produce assessed at 5% (irrigated) or 10% (rain-fed)
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-amber-700 dark:text-amber-400">
                      {record.assetBreakdown.agricultureUshrETB.toLocaleString()} ETB
                    </td>
                  </tr>
                )}
                {record.assetBreakdown.livestockETB > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-stone-800 dark:text-stone-200">
                      Livestock (An'am)
                    </td>
                    <td className="py-2.5 px-4 text-stone-500">
                      Pastured cattle, sheep, and goats evaluated
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold">
                      {record.assetBreakdown.livestockETB.toLocaleString()} ETB
                    </td>
                  </tr>
                )}
                <tr className="bg-stone-50/70 dark:bg-stone-800/40 font-semibold">
                  <td colSpan={2} className="py-2 px-4 text-stone-700 dark:text-stone-300">
                    Gross Zakatable Assets
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-700 dark:text-emerald-400">
                    {record.totalAssetsETB.toLocaleString()} ETB
                  </td>
                </tr>
                <tr className="text-rose-700 dark:text-rose-400">
                  <td className="py-2.5 px-4 font-semibold">Deductible Liabilities</td>
                  <td className="py-2.5 px-4 text-stone-500">
                    Short-term debts, supplier invoices, immediate family living costs
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold">
                    - {record.totalLiabilitiesETB.toLocaleString()} ETB
                  </td>
                </tr>
                <tr className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold border-t-2 border-emerald-300 dark:border-emerald-700">
                  <td colSpan={2} className="py-3 px-4 text-sm">
                    Net Zakatable Wealth Balance
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm">
                    {record.netZakatableWealthETB.toLocaleString()} ETB
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Final Obligation Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-transparent border-2 border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-amber-800 dark:text-amber-400 tracking-wider">
              Total Shari'ah Obligation Due
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono mt-0.5">
              {record.totalZakatObligationETB.toLocaleString()} ETB
            </div>
            {record.linkedDonationReceiptNo && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Linked to Official Receipt #{record.linkedDonationReceiptNo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onLoadIntoCalculator && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onLoadIntoCalculator(record);
                  onClose();
                }}
                className="text-xs"
              >
                Restore to Calculator
              </Button>
            )}

            {record.status === 'Obligation Pending' && onProceedToPayment && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => {
                  onProceedToPayment(record.totalZakatObligationETB);
                  onClose();
                }}
                className="text-xs font-bold"
              >
                Pay via Gateway →
              </Button>
            )}
          </div>
        </div>

        {record.notes && (
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400">
            <span className="font-bold text-stone-800 dark:text-stone-200">Notes: </span>
            {record.notes}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Print Statement
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
