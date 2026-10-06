import React, { useState } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Building,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Receipt,
  Download,
  Printer,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import { IslamicPattern } from '../common/IslamicPattern';

interface ZakatDisburseModalProps {
  isOpen: boolean;
  onClose: () => void;
  zakatAmountETB: number;
}

export const ZakatDisburseModal: React.FC<ZakatDisburseModalProps> = ({
  isOpen,
  onClose,
  zakatAmountETB,
}) => {
  const { addDonation, addToast } = useApp();

  const [amount, setAmount] = useState<number>(zakatAmountETB > 0 ? zakatAmountETB : 2500);
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetProgram, setTargetProgram] = useState('General Zakat ul-Mal Social Welfare Pool');
  const [paymentChannel, setPaymentChannel] = useState<'Telebirr' | 'CBE Birr' | 'Hijra Bank' | 'ZamZam Bank' | 'Commercial Bank of Ethiopia'>('Telebirr');
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  React.useEffect(() => {
    if (zakatAmountETB > 0) {
      setAmount(zakatAmountETB);
    }
  }, [zakatAmountETB]);

  const handleDisburseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      addToast('Invalid Amount', 'Please specify a valid Zakat payment amount.', 'warning');
      return;
    }

    const donationResult = addDonation({
      donorName: isAnonymous ? 'Anonymous Zakat Payer' : payerName || 'Generous Muslim',
      donorPhone: payerPhone || '+251 91 190 2831',
      amountETB: amount,
      fundId: 'fund-zakat',
      fundName: `Zakat ul-Mal: ${targetProgram}`,
      paymentMethod: paymentChannel as any,
      isAnonymous,
    });

    setCompletedPayment(donationResult);
    addToast('Zakat Disbursed Successfully', `May Allah accept your Zakat purification of ${amount.toLocaleString()} ETB!`, 'success');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setCompletedPayment(null);
        onClose();
      }}
      title="Disburse Zakat to Jimma Islamic Council Welfare Fund"
      subtitle="100% Shari'ah Audited • Direct 8 Asnaf Distribution Across 18 Woredas"
      size="lg"
    >
      {completedPayment ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-500 shadow-xl relative overflow-hidden space-y-6">
            <IslamicPattern opacity={0.05} />

            <div className="text-center relative z-10 border-b border-stone-200 dark:border-stone-800 pb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <Badge variant="emerald" size="md">
                Official Zakat Receipt & Discharge
              </Badge>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
                Zakat Disbursed Successfully
              </h3>
              <p className="text-xs text-stone-500 mt-1 font-mono">
                Receipt #{completedPayment.id} • {completedPayment.date}
              </p>
            </div>

            {/* Arabic Du'a */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
              <p className="font-serif text-base text-emerald-900 dark:text-emerald-200 font-bold">
                "آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوراً"
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 italic">
                "May Allah reward you for what you have given, bless you in what you retain, and make it a purification for you."
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Zakat Amount</span>
                <span className="font-serif font-bold text-lg text-emerald-700 dark:text-emerald-400">
                  {completedPayment.amountETB.toLocaleString()} ETB
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Payment Method</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">{completedPayment.paymentMethod}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Payer Reference</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{completedPayment.donorName}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Designated Asnaf Program</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{completedPayment.fundName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              <Button variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setCompletedPayment(null);
                  onClose();
                }}
              >
                Close & Return
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDisburseSubmit} className="space-y-4">
          {/* Amount banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-stone-900 text-white border border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                Calculated Zakat to Fulfill
              </span>
              <span className="text-2xl font-serif font-bold text-white">
                {amount.toLocaleString()} ETB
              </span>
            </div>
            <Badge variant="gold">Official Council Merchant</Badge>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Custom Amount to Disburse (ETB)
            </label>
            <input
              type="number"
              min={100}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-stone-100 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Designated Asnaf Welfare Category
            </label>
            <select
              value={targetProgram}
              onChange={(e) => setTargetProgram(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            >
              <option value="General Zakat ul-Mal Social Welfare Pool">General Zakat ul-Mal Social Welfare Pool (18 Woredas)</option>
              <option value="Impoverished Families & Destitute Widows (Fuqara & Masakin)">Impoverished Families & Destitute Widows (Fuqara & Masakin)</option>
              <option value="Quranic Madrasa Student Stipends & Orphan Care (Fi Sabilillah)">Quranic Madrasa Student Stipends & Orphan Care (Fi Sabilillah)</option>
              <option value="Overburdened Small Farmers & Debtors Relief (Gharimeen)">Overburdened Small Farmers & Debtors Relief (Gharimeen)</option>
              <option value="Emergency Medical Hardship Fund">Emergency Medical Hardship Fund</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Full Name (Optional for receipt)
              </label>
              <input
                type="text"
                disabled={isAnonymous}
                placeholder="e.g. Hajji Dawud Aman"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 disabled:opacity-50 text-stone-900 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Phone Number (For SMS Confirmation)
              </label>
              <input
                type="tel"
                placeholder="e.g. +251 91 190 2831"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="disburseAnon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm"
            />
            <label htmlFor="disburseAnon" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
              Disburse anonymously (Sadaqah Sirr / Hidden Charity for Allah's sake)
            </label>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Select Payment Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Telebirr', desc: 'Shortcode 834500' },
                { name: 'CBE Birr', desc: 'Acc: 10001928391' },
                { name: 'Hijra Bank', desc: 'Interest-free banking' },
                { name: 'ZamZam Bank', desc: 'Shariah certified' },
                { name: 'Commercial Bank of Ethiopia', desc: 'Branch / Direct Transfer' },
              ].map((channel) => (
                <button
                  type="button"
                  key={channel.name}
                  onClick={() => setPaymentChannel(channel.name as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentChannel === channel.name
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  <span className="font-bold text-xs block">{channel.name}</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">{channel.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              100% of your Zakat goes directly to verified eligible Asnaf beneficiaries with 0% administrative deductions.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<HeartHandshake className="w-4 h-4" />}>
              Confirm & Fulfill Zakat ({amount.toLocaleString()} ETB)
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
