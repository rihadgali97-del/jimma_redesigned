import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Scale,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface ZakatFiqhGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZakatFiqhGuideModal: React.FC<ZakatFiqhGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Islamic Guidelines & Shari'ah Standards for Zakat"
      subtitle="Approved by the Jimma Zone Islamic Affairs Supreme Council Board of Senior Ulema"
      size="xl"
    >
      <div className="space-y-6 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
        {/* Quranic Foundation */}
        <div className="p-4 rounded-2xl bg-emerald-950 text-white relative overflow-hidden space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Divine Mandate • Surah Al-Baqarah (2:43)</span>
          </div>
          <p className="font-serif text-base sm:text-lg text-emerald-100 italic">
            "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ"
          </p>
          <p className="text-stone-300 text-xs sm:text-sm">
            "And establish prayer and give Zakat and bow with those who bow [in worship and obedience]."
          </p>
        </div>

        {/* 1. Core Principles: Nisab & Hawl */}
        <div className="space-y-3">
          <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600" />
            1. Core Pillars of Zakat Obligation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 block">
                Al-Nisab (Minimum Wealth Threshold)
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                The minimum amount of net wealth a Muslim must possess before Zakat becomes obligatory:
              </p>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-stone-600 dark:text-stone-400">
                <li><strong>Gold Nisab:</strong> 85 grams of 24k pure gold (or equivalent value in 21k/18k).</li>
                <li><strong>Silver Nisab:</strong> 595 grams of pure silver (classical preference to maximize welfare for the poor).</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 block">
                Al-Hawl (One Full Lunar Year)
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Zakatable assets must remain above the Nisab threshold for one full lunar year (approx. 354 days).
              </p>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-stone-600 dark:text-stone-400">
                <li><strong>Hijri Calendar:</strong> Standard rate is <strong>2.5%</strong> (1/40th).</li>
                <li><strong>Solar/Gregorian:</strong> Adjusted rate is <strong>2.577%</strong> for 365 days.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Asset Categories Specific to Jimma & Ethiopia */}
        <div className="space-y-3">
          <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            2. Asset Classification Guidelines
          </h4>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block text-xs">
                Business Inventory & Merchandise (Urud al-Tijarah):
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Valued at the current <strong>wholesale/replacement market value</strong> on the date of calculation, not original historical purchase cost. Fixed assets (shop fittings, transport trucks, machinery) are completely <strong>exempt</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block text-xs">
                Jimma Agricultural Produce & Coffee Harvest (Zakat al-Zuru' / Ushr):
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Due on harvest day when yield reaches 5 Wasaq (~653 kg or 6.53 quintals). No Hawl waiting period required.
                Rate: <strong>10% (Ushr)</strong> for naturally rain-fed crops; <strong>5% (Half-Ushr)</strong> for artificially pumped or irrigated farms.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block text-xs">
                Gold & Jewelry Ruling:
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Gold bullion, bars, coins, and stored savings gold are unconditionally subject to Zakat. For personal jewelry worn by women within customary limits, scholars have differed; the cautious fatwa recommended by the Jimma Council is to pay Zakat on jewelry held as store of wealth or exceeding customary local norms.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block text-xs">
                Allowable Deductions:
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Only debts and living expenses due <strong>immediately or within the current lunar month/year</strong> may be deducted. Long-term debts deferred for future years cannot be deducted against current liquid wealth.
              </p>
            </div>
          </div>
        </div>

        {/* 3. The 8 Eligible Beneficiary Categories (Asnaf al-Zakat) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              3. The 8 Quranic Beneficiaries (Surah At-Tawbah 9:60)
            </h4>
            <Badge variant="emerald">Strict Shari'ah Compliance</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">1. Al-Fuqara (The Destitute)</span>
              <p className="text-stone-500 mt-0.5">Individuals with zero income or possessing less than half of essential living needs.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">2. Al-Masakin (The Impoverished)</span>
              <p className="text-stone-500 mt-0.5">Low-income earners whose basic earnings fall short of annual basic subsistence.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">3. Al-'Amilina 'Alayha (Administrators)</span>
              <p className="text-stone-500 mt-0.5">Authorized collectors and field audit officers appointed by the Islamic Council.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">4. Al-Mu'allafatu Qulubuhum (Reconciled)</span>
              <p className="text-stone-500 mt-0.5">New Muslims requiring social, economic, and community integration support in Jimma.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">5. Fir-Riqab (Freeing Captives)</span>
              <p className="text-stone-500 mt-0.5">Emancipation from bondage, modern human trafficking, or unjust servitude.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">6. Al-Gharimin (Overburdened Debtors)</span>
              <p className="text-stone-500 mt-0.5">People who incurred genuine debts for basic survival or peacemaking and cannot repay.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">7. Fi Sabilillah (In Allah's Cause)</span>
              <p className="text-stone-500 mt-0.5">Defending faith, Islamic scholarship, educational propagation, and welfare works.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">8. Ibnus-Sabil (Stranded Travelers)</span>
              <p className="text-stone-500 mt-0.5">Travelers cut off from financial means needing safe return passage through Jimma Zone.</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-500">
            For complex business structures or inheritance Zakat inquiries, consult the Council Fatwa Committee.
          </p>
          <Button variant="primary" onClick={onClose}>
            Understood, Return to Calculator
          </Button>
        </div>
      </div>
    </Modal>
  );
};
