import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  HeartHandshake,
  CheckCircle2,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  Building,
  BookOpen,
  Sparkles,
  Lock,
  Scale,
  ArrowRight,
  Calculator,
  ChevronRight,
  Info,
  Smartphone,
  CreditCard,
  Coins,
  RefreshCw,
  History,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { ZakatCalculator } from '../../components/services/ZakatCalculator';
import { Donation } from '../../types';
import { apiRequest } from '../../services/authApi';

export const DonatePage: React.FC = () => {
  const { funds, addToast, currentUser, isLoggedIn, zakatCalculations } = useApp();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'donate', 'zakat-calculator', or 'zakat-history'
  const initialTab =
    searchParams.get('tab') === 'zakat-history' || searchParams.get('tab') === 'history'
      ? 'zakat-history'
      : searchParams.get('tab') === 'zakat-calculator' || searchParams.get('tab') === 'calculator'
      ? 'zakat-calculator'
      : 'donate';
  const [activeTab, setActiveTab] = useState<'donate' | 'zakat-calculator' | 'zakat-history'>(initialTab);

  const [selectedFundId, setSelectedFundId] = useState(funds[0]?.id || '');
  const [fundDesignation, setFundDesignation] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE Birr' | 'Awash Bank' | 'Bank Transfer'>('Telebirr');
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);
  const [importedFromZakat, setImportedFromZakat] = useState(false);

  // Quick inline 2.5% estimator states
  const [showQuickEstimator, setShowQuickEstimator] = useState(false);
  const [quickWealthETB, setQuickWealthETB] = useState<string>('');

  const paymentSectionRef = useRef<HTMLFormElement>(null);

  // User's recorded Zakat calculations count
  const userCalculationsCount = useMemo(() => {
    if (!isLoggedIn) return 0;
    return zakatCalculations.filter((calc) => {
      return (
        calc.userId === currentUser.id ||
        calc.userEmail.toLowerCase() === currentUser.email.toLowerCase()
      );
    }).length;
  }, [zakatCalculations, currentUser, isLoggedIn]);

  // Sync tab and deep-linked values with URL search parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'zakat-history' || tabParam === 'history') {
      setActiveTab('zakat-history');
    } else if (tabParam === 'zakat-calculator' || tabParam === 'calculator') {
      setActiveTab('zakat-calculator');
    }
    const amountParam = searchParams.get('amount');
    if (amountParam) {
      const num = parseFloat(amountParam);
      if (!isNaN(num) && num > 0) {
        setAmount(num);
        setCustomAmount(num.toString());
      }
    }
    const fundParam = searchParams.get('fund');
    if (fundParam) {
      const matched = funds.find((f) => f.id === fundParam || f.name.toLowerCase().includes(fundParam.toLowerCase()));
      if (matched) {
        setSelectedFundId(matched.id);
        if (matched.name.toLowerCase().includes('zakat')) {
          setImportedFromZakat(true);
        }
      } else {
        setFundDesignation(fundParam === 'fund-4' ? 'Zakat' : fundParam === 'fund-1' ? '' : fundParam);
      }
    }
  }, [searchParams, funds]);

  const handleTabChange = (tab: 'donate' | 'zakat-calculator' | 'zakat-history') => {
    setActiveTab(tab);
    if (tab === 'zakat-calculator') {
      setSearchParams({ tab: 'zakat-calculator' });
    } else if (tab === 'zakat-history') {
      setSearchParams({ tab: 'zakat-history' });
    } else {
      setSearchParams({});
    }
  };

  const presetAmounts = [500, 1000, 2500, 5000, 10000];
  const selectedFund = funds.find((f) => f.id === selectedFundId) || funds[0];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setImportedFromZakat(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
    setImportedFromZakat(false);
  };

  // Direct handoff from Zakat Calculator tool into Donation Payment Gateway
  const handleZakatGatewayTransfer = (calculatedAmount: number) => {
    const finalAmount = Math.max(100, Math.round(calculatedAmount));
    setAmount(finalAmount);
    setCustomAmount(finalAmount.toString());

    // Prefer a configured Zakat fund when one is available.
    const zakatFund = funds.find((f) => f.name.toLowerCase().includes('zakat')) || funds[0];
    if (zakatFund) {
      setSelectedFundId(zakatFund.id);
    }

    setImportedFromZakat(true);
    setActiveTab('donate');
    setSearchParams({});

    addToast(
      'Zakat Amount Added',
      `ETB ${finalAmount.toLocaleString()} was added to the donation form for ${zakatFund?.name || 'the selected designation'}. No payment was made.`,
      'info'
    );

    setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Inline Quick 2.5% Estimator apply
  const handleQuickEstimateApply = () => {
    const wealthNum = parseFloat(quickWealthETB);
    if (!isNaN(wealthNum) && wealthNum > 0) {
      const calculatedZakat = Math.round(wealthNum * 0.025);
      setAmount(calculatedZakat);
      setCustomAmount(calculatedZakat.toString());

      const zakatFund = funds.find((f) => f.name.toLowerCase().includes('zakat')) || funds[0];
      if (zakatFund) setSelectedFundId(zakatFund.id);

      setImportedFromZakat(true);
      setShowQuickEstimator(false);
      addToast(
        '2.5% Zakat Applied',
        `2.5% Zakat obligation of ETB ${calculatedZakat.toLocaleString()} applied from net wealth of ETB ${wealthNum.toLocaleString()}.`,
        'success'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !donorPhone.trim()) {
      addToast('Details required', 'Enter a valid phone number and donation amount to create a payment request.', 'error');
      return;
    }
    const fundName = selectedFund?.name || fundDesignation.trim();
    if (fundName.length < 2) {
      addToast('Donation designation required', 'Select a configured fund or enter the council-provided designation.', 'error');
      return;
    }
    const methodMap = { Telebirr: 'TELEBIRR', 'CBE Birr': 'CBE_BIRR', 'Awash Bank': 'AWASH_BANK', 'Bank Transfer': 'BANK_TRANSFER' } as const;
    try {
      const intent = await apiRequest<{ reference: string; status: string; amountETB: number; fundName: string; paymentMethod: string; createdAt: string }>('/donations/intents', {
        method: 'POST',
        body: JSON.stringify({ donorName: donorName.trim() || undefined, donorPhone: donorPhone.trim(), anonymous: isAnonymous, amountETB: amount, fundName, category: fundName.toLowerCase().includes('zakat') ? 'Zakat' : 'General Donation', paymentMethod: methodMap[paymentMethod] }),
      });
      setCompletedDonation({ id: intent.reference, receiptNo: intent.reference, donorName: isAnonymous ? 'Anonymous Donor' : (donorName.trim() || 'Donor'), isAnonymous, phone: donorPhone.trim(), amountETB: intent.amountETB, fundId: selectedFund?.id || '', fundName: intent.fundName, date: new Date(intent.createdAt).toLocaleDateString(), paymentMethod, status: 'Processing', certificateIssued: false, transactionRef: intent.reference });
      addToast('Donation request recorded', `Request ${intent.reference} was saved. Payment has not been processed yet.`, 'info');
    } catch (error) {
      addToast('Donation request failed', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Sadaqah Jariyah & Zakat ul-Mal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100">
          Jimma Islamic Council Donation Portal
        </h1>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">
          Support verified mosques, student Quranic memorization, orphan care, and social welfare programs
          with direct, accountable, and audited digital channels.
        </p>

        {/* Tab switcher: Direct Donation vs Zakat Calculator */}
        {!completedDonation && (
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 shadow-inner max-w-2xl w-full">
              <button
                type="button"
                onClick={() => handleTabChange('donate')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'donate'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-md border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Direct Donation</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('zakat-calculator')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'zakat-calculator'
                    ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 shadow-md border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">Zakat Calculator</span>
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Live Nisab
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('zakat-history')}
                className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'zakat-history'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-md border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <History className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Zakat History</span>
                {isLoggedIn && userCalculationsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-stone-950">
                    {userCalculationsCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        )}
      </div>

      {completedDonation ? (
        /* Payment request reference card */
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl relative overflow-hidden space-y-6">
            <IslamicPattern opacity={0.05} />

            {/* Receipt Top Header */}
            <div className="text-center border-b border-stone-200 dark:border-stone-800 pb-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto mb-3">
                <Info className="w-8 h-8 text-amber-600" />
              </div>
              <span className="font-serif text-sm text-amber-600 dark:text-amber-400 font-bold block mb-1">
                جزاكم الله خيراً • Jazakallahu Khayran
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Donation request recorded
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Jimma City Islamic Affairs Supreme Council • Financial Registry
              </p>
            </div>

            {completedDonation.fundName.toLowerCase().includes('zakat') && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1 relative z-10">
                <p className="font-serif text-sm text-emerald-900 dark:text-emerald-200 font-bold">
                  "آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ لَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُوراً"
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 italic">
                  "May Allah reward you for what you gave, bless what you retained, and make it a purification for you."
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center text-sm text-amber-900 dark:text-amber-200 relative z-10">
              Payment is pending verification. Complete the transfer using the selected method and keep this reference. This is not a payment receipt or Zakat discharge certificate.
            </div>

            {/* Receipt Summary Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs relative z-10 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  Payment Reference
                </span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {completedDonation.receiptNo}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  Request Date
                </span>
                <span className="font-mono text-stone-800 dark:text-stone-200">
                  {completedDonation.date}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  Donor
                </span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  {completedDonation.donorName}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold">
                  Payment Method
                </span>
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {completedDonation.paymentMethod} (Pending)
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Designated Fund
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {completedDonation.fundName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Amount to Pay
                  </span>
                  <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                    {completedDonation.amountETB.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>

            {/* Legal / Religious Note */}
            <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed text-center relative z-10 pt-2">
              "Those who spend their wealth in the cause of Allah and do not follow up their spending with reminders or hurtful words will have their reward with their Lord." — Surah Al-Baqarah 2:262
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 relative z-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCompletedDonation(null);
                  setImportedFromZakat(false);
                }}
              >
                Make Another Donation
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Print Receipt
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handlePrint}
                >
                  Save Certificate (PDF)
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'zakat-calculator' || activeTab === 'zakat-history' ? (
        /* ZAKAT CALCULATOR & HISTORY TOOL TAB WITH DIRECT PAYMENT GATEWAY LINK */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Quick Notice Linking Calculator directly to Gateway */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 border border-emerald-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-white">
                  Direct Zakat Obligation Gateway & History Archive
                </h3>
                <p className="text-xs text-stone-300">
                  Calculate your Nisab obligation across cash, gold, business stock, or coffee harvests, track your past calculations & donations, or transfer amounts to the payment gateway.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTabChange('donate')}
              className="text-xs text-stone-200 border-stone-700 hover:bg-stone-800 shrink-0"
            >
              Back to Donation Form
            </Button>
          </div>

          {/* Embedded Full Zakat Calculator with History */}
          <ZakatCalculator
            initialTab={activeTab === 'zakat-history' ? 'history' : 'calculator'}
            onProceedToPaymentGateway={handleZakatGatewayTransfer}
            gatewayButtonText="Proceed to Donation Gateway with Calculated Zakat →"
          />
        </div>
      ) : (
        /* Standard Donation Form (Tab 1) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 cols: Interactive Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Zakat Calculator Teaser Banner */}
            {importedFromZakat ? (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border-2 border-amber-500/60 dark:border-amber-600 text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 shadow-md animate-in fade-in">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        Zakat Obligation Imported from Calculator
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                        {amount.toLocaleString()} ETB
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                      This is a payment request for the selected designation. The application does not confirm a payment until the provider reports it as confirmed.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('zakat-calculator')}
                  className="text-xs shrink-0 border-amber-400 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Recalculate
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50/50 to-stone-50 dark:from-amber-950/30 dark:via-emerald-950/30 dark:to-stone-900 border border-amber-300/70 dark:border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                        Need to calculate your annual Zakat obligation?
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Live Nisab
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      Estimate your exact Zakat on Cash, Gold, Trade Inventory, or Jimma Coffee Ushr with 1-click gateway import.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => handleTabChange('zakat-calculator')}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    className="w-full sm:w-auto text-xs font-bold justify-center shadow-xs"
                  >
                    Open Zakat Tool
                  </Button>
                </div>
              </div>
            )}

            <Card className="space-y-6">
              <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                1. Select Designated Council Fund
              </h3>

              {funds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {funds.map((f) => {
                  const isSelected = selectedFundId === f.id;
                  const isZakat = f.name.toLowerCase().includes('zakat');
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFundId(f.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 hover:border-stone-300'
                      }`}
                    >
                      {isZakat && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          Zakat Eligible
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-1 pr-14">
                        <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {f.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                        {f.description}
                      </p>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold block mt-2">
                        Goal: {(f.targetETB / 1000000).toFixed(1)}M ETB
                      </span>
                    </button>
                  );
                })}
              </div>
              ) : (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    The council has not configured a fund catalogue. Enter the designation provided by the council.
                  </p>
                  <input
                    type="text"
                    value={fundDesignation}
                    onChange={(event) => setFundDesignation(event.target.value)}
                    placeholder="Council-provided fund designation"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
                  />
                </div>
              )}

              {/* Amount Selection */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                    2. Choose Donation Amount (ETB)
                  </h3>

                  {/* Inline Quick 2.5% Estimator toggle */}
                  <button
                    type="button"
                    onClick={() => setShowQuickEstimator(!showQuickEstimator)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>{showQuickEstimator ? 'Hide Quick Estimator' : 'Quick 2.5% Helper'}</span>
                  </button>
                </div>

                {/* Inline Quick Estimator Collapsible Card */}
                {showQuickEstimator && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        Quick 2.5% Liquid Wealth Zakat Helper
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('zakat-calculator')}
                        className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline font-medium"
                      >
                        Full Asset Calculator →
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-stone-400">
                          ETB
                        </span>
                        <input
                          type="number"
                          placeholder="Enter your total savings/cash..."
                          value={quickWealthETB}
                          onChange={(e) => setQuickWealthETB(e.target.value)}
                          className="w-full pl-11 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-mono outline-hidden"
                        />
                      </div>
                      <Button
                        variant="gold"
                        size="sm"
                        onClick={handleQuickEstimateApply}
                        className="text-xs shrink-0 font-bold"
                        disabled={!quickWealthETB || parseFloat(quickWealthETB) <= 0}
                      >
                        Apply 2.5% ({quickWealthETB ? Math.round(parseFloat(quickWealthETB) * 0.025).toLocaleString() : '0'} ETB)
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`py-3 rounded-xl font-mono text-sm font-bold border transition-all cursor-pointer ${
                        amount === preset && !customAmount
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {preset.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-stone-400">
                    ETB
                  </span>
                  <input
                    type="number"
                    min="50"
                    placeholder="Or enter custom amount in Ethiopian Birr..."
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Donor Details & Payment Options */}
              <form ref={paymentSectionRef} onSubmit={handleSubmit} className="space-y-4 pt-2">
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">
                  3. Donor Details & Payment Gateway
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      placeholder="e.g. Hajji Mohammed Amin"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number (for SMS Receipt & Verification)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +251 91 123 4567"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded-sm text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Give anonymously (Name will be hidden on public donor roll)</span>
                </label>

                {/* Payment Gateway selector */}
                <div className="pt-2 space-y-3">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Payment method preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Telebirr', 'CBE Birr', 'Awash Bank', 'Bank Transfer'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === method
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                      <Info className="w-4 h-4 text-emerald-600" />
                      <span>Payment is not processed on this page</span>
                    </div>
                    <p className="leading-relaxed">
                      This form records a request and reference only. Confirm payment instructions with the council before transferring funds.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="gold"
                    size="lg"
                    type="submit"
                    icon={<HeartHandshake className="w-5 h-5" />}
                    className="w-full justify-center text-base font-bold shadow-lg"
                    disabled={!selectedFund && fundDesignation.trim().length < 2}
                  >
                    Submit {amount.toLocaleString()} ETB Donation Request
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Donation request status */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-emerald-950 text-emerald-100 border-emerald-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Donation request</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                What happens next
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Submitting this form saves a payment request and reference. It does not transfer money or confirm a donation.
              </p>

              <div className="space-y-2 pt-2 text-xs border-t border-emerald-900">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>A request reference is provided for follow-up.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
