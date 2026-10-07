import React, { useState, useMemo, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Coins,
  Building,
  Package,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Coffee,
  ShieldCheck,
  RefreshCw,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Smartphone,
  ArrowRight,
  History,
  Save,
  BookmarkCheck,
  LogIn,
  Lock,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { IslamicPattern } from '../common/IslamicPattern';
import { ZakatFiqhGuideModal } from './ZakatFiqhGuideModal';
import { ZakatAssessmentModal } from './ZakatAssessmentModal';
import { ZakatHistory } from './ZakatHistory';
import { useApp } from '../../context/AppContext';
import { ZakatCalculationRecord } from '../../types';
import { fetchCurrentNisabRate, saveZakatAssessment } from '../../services/zakatApi';
import { calculateZakatFigures } from '../../utils/zakatCalculations';

export interface ZakatCalculatorProps {
  onProceedToPaymentGateway?: (amountETB: number) => void;
  gatewayButtonText?: string;
  initialTab?: 'calculator' | 'history';
}

export const ZakatCalculator: React.FC<ZakatCalculatorProps> = ({
  onProceedToPaymentGateway,
  gatewayButtonText,
  initialTab,
}) => {
  const { currentUser, isLoggedIn, addZakatCalculation, zakatCalculations } = useApp();
  const [nisabRateDate, setNisabRateDate] = useState<string | null>(null);
  const [rateLoadError, setRateLoadError] = useState('');

  useEffect(() => {
    let active = true;
    fetchCurrentNisabRate()
      .then((rate) => {
        if (!active || !rate) return;
        setGoldPricePerGram(rate.goldPricePerGram);
        setSilverPricePerGram(rate.silverPricePerGram);
        setNisabRateDate(rate.effectiveDate);
      })
      .catch((error: unknown) => {
        if (active) setRateLoadError(error instanceof Error ? error.message : 'Unable to load current Nisab rates.');
      });
    return () => { active = false; };
  }, []);

  // Primary Tab (Active Calculator vs Zakat History)
  const [mainTab, setMainTab] = useState<'calculator' | 'history'>(initialTab || 'calculator');

  // Save Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [assessmentTitleInput, setAssessmentTitleInput] = useState('');

  // Modal states
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  // Settings & Parameters
  const [nisabStandard, setNisabStandard] = useState<'gold' | 'silver'>('gold');
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(12500); // ETB per gram
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(160); // ETB per gram
  const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');
  const [hasHawlPassed, setHasHawlPassed] = useState<boolean>(true);
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const usdRate = 125; // 1 USD = 125 ETB approx

  // Category Tab in inputs
  const [activeCategory, setActiveCategory] = useState<
    'cash' | 'metals' | 'business' | 'investments' | 'agriculture' | 'livestock' | 'deductions'
  >('cash');

  // Input states
  // 1. Cash & Liquidity
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankDeposits, setBankDeposits] = useState<number>(0);
  const [digitalWallets, setDigitalWallets] = useState<number>(0); // Telebirr, CBE Birr
  const [foreignCurrencyETB, setForeignCurrencyETB] = useState<number>(0);
  const [goodDebtsReceivable, setGoodDebtsReceivable] = useState<number>(0); // Qard Hasan / Money owed to you

  // 2. Gold & Silver
  const [gold24kGrams, setGold24kGrams] = useState<number>(0);
  const [gold21kGrams, setGold21kGrams] = useState<number>(0);
  const [gold18kGrams, setGold18kGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [otherPreciousMetals, setOtherPreciousMetals] = useState<number>(0);

  // 3. Business & Trade (Urud al-Tijarah)
  const [stockInventoryValue, setStockInventoryValue] = useState<number>(0); // Wholesale value
  const [rawMaterialsValue, setRawMaterialsValue] = useState<number>(0);
  const [goodsInTransit, setGoodsInTransit] = useState<number>(0);
  const [tradeReceivables, setTradeReceivables] = useState<number>(0);

  // 4. Investments & Rental
  const [sharesLiquidValue, setSharesLiquidValue] = useState<number>(0);
  const [retainedRentalIncome, setRetainedRentalIncome] = useState<number>(0);
  const [accessiblePension, setAccessiblePension] = useState<number>(0);

  // 5. Agricultural Produce & Coffee (Ushr)
  const [cropType, setCropType] = useState<string>('Jimma Arabica Coffee');
  const [harvestQuintals, setHarvestQuintals] = useState<number>(0); // 1 Quintal = 100 kg
  const [cropPricePerQuintal, setCropPricePerQuintal] = useState<number>(14000); // ETB per quintal for coffee
  const [irrigationType, setIrrigationType] = useState<'rain' | 'irrigated' | 'mixed'>('rain');

  // 6. Livestock (An'am)
  const [cattleCount, setCattleCount] = useState<number>(0);
  const [sheepGoatCount, setSheepGoatCount] = useState<number>(0);

  // 7. Deductible Liabilities
  const [shortTermDebts, setShortTermDebts] = useState<number>(0);
  const [immediateLivingExpenses, setImmediateLivingExpenses] = useState<number>(0);
  const [overdueSupplierInvoices, setOverdueSupplierInvoices] = useState<number>(0);
  const [dueWagesAndTax, setDueWagesAndTax] = useState<number>(0);

  // Quick Preset Scenarios
  const handleLoadPreset = (preset: 'merchant' | 'farmer' | 'household' | 'clear') => {
    if (preset === 'clear') {
      setCashInHand(0);
      setBankDeposits(0);
      setDigitalWallets(0);
      setForeignCurrencyETB(0);
      setGoodDebtsReceivable(0);
      setGold24kGrams(0);
      setGold21kGrams(0);
      setGold18kGrams(0);
      setSilverGrams(0);
      setOtherPreciousMetals(0);
      setStockInventoryValue(0);
      setRawMaterialsValue(0);
      setGoodsInTransit(0);
      setTradeReceivables(0);
      setSharesLiquidValue(0);
      setRetainedRentalIncome(0);
      setAccessiblePension(0);
      setHarvestQuintals(0);
      setCattleCount(0);
      setSheepGoatCount(0);
      setShortTermDebts(0);
      setImmediateLivingExpenses(0);
      setOverdueSupplierInvoices(0);
      setDueWagesAndTax(0);
      return;
    }

    if (preset === 'merchant') {
      setCashInHand(45000);
      setBankDeposits(650000);
      setDigitalWallets(120000);
      setStockInventoryValue(1850000);
      setTradeReceivables(320000);
      setShortTermDebts(150000);
      setOverdueSupplierInvoices(220000);
      setDueWagesAndTax(45000);
      setGold21kGrams(35);
      setActiveCategory('business');
    } else if (preset === 'farmer') {
      setBankDeposits(380000);
      setDigitalWallets(65000);
      setCropType('Jimma Arabica Coffee (Limmu Grade 1)');
      setHarvestQuintals(45); // 45 quintals of coffee
      setCropPricePerQuintal(16500);
      setIrrigationType('rain');
      setCattleCount(12);
      setSheepGoatCount(25);
      setShortTermDebts(40000);
      setActiveCategory('agriculture');
    } else if (preset === 'household') {
      setCashInHand(18000);
      setBankDeposits(420000);
      setDigitalWallets(35000);
      setGold21kGrams(95); // 95 grams of 21k jewelry
      setImmediateLivingExpenses(40000);
      setShortTermDebts(25000);
      setActiveCategory('metals');
    }
  };

  // Keep the monetary, crop, and livestock calculations in one pure function
  // so the calculator and its boundary tests exercise the same implementation.
  const {
    cashTotal, goldValue, silverValue, metalsTotal, businessTotal, investmentsTotal,
    totalGrossMonetaryAssets, totalDeductions, netZakatableWealth, nisabThresholdETB,
    isNisabMet, zakatAlMalDue, cropNisabQuintals, isCropNisabMet, totalCropMarketValue,
    ushrRate, agricultureUshrDue, livestockSummary, grandTotalZakatETB,
    grandTotalZakatUSD, nisabPercentage,
  } = calculateZakatFigures({
    cashInHand, bankDeposits, digitalWallets, foreignCurrencyETB, goodDebtsReceivable,
    gold24kGrams, gold21kGrams, gold18kGrams, silverGrams, otherPreciousMetals,
    goldPricePerGram, silverPricePerGram, stockInventoryValue, rawMaterialsValue,
    goodsInTransit, tradeReceivables, sharesLiquidValue, retainedRentalIncome,
    accessiblePension, shortTermDebts, immediateLivingExpenses, overdueSupplierInvoices,
    dueWagesAndTax, nisabStandard, calendarType, hasHawlPassed, harvestQuintals,
    cropPricePerQuintal, irrigationType, cattleCount, sheepGoatCount, usdRate,
  });

  // User calculations count
  const userCalculationsCount = useMemo(() => {
    if (!isLoggedIn) return 0;
    return zakatCalculations.filter((calc) => {
      return (
        calc.userEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        calc.userName.toLowerCase() === currentUser.name.toLowerCase() ||
        (currentUser.role === 'Super Admin' && calc.userEmail.includes('admin@jimma'))
      );
    }).length;
  }, [zakatCalculations, currentUser, isLoggedIn]);

  const handleSaveCalculation = async () => {
    if (!isLoggedIn) {
      setMainTab('history');
      return;
    }
    const defaultTitle = `${calendarType === 'hijri' ? '1448 AH' : '2026'} Zakat Assessment (${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})`;
    const title = assessmentTitleInput.trim() || defaultTitle;

    const assessment = {
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      title,
      date: new Date().toISOString().split('T')[0],
      hijriYear: calendarType === 'hijri' ? '1448 AH' : '1447 AH',
      nisabStandard,
      nisabThresholdETB,
      totalAssetsETB: totalGrossMonetaryAssets + totalCropMarketValue,
      totalLiabilitiesETB: totalDeductions,
      netZakatableWealthETB: netZakatableWealth,
      isEligible: isNisabMet || isCropNisabMet,
      totalZakatObligationETB: grandTotalZakatETB,
      status: 'Obligation Pending',
      assetBreakdown: {
        cashAndLiquidityETB: cashTotal,
        goldAndSilverETB: metalsTotal,
        businessStockETB: businessTotal,
        investmentsETB: investmentsTotal,
        agricultureUshrETB: agricultureUshrDue,
        livestockETB: livestockSummary.totalLivestockCash,
      },
      inputSnapshot: {
        cashInHand,
        bankDeposits,
        digitalWallets,
        foreignCurrencyETB,
        goodDebtsReceivable,
        gold24kGrams,
        gold21kGrams,
        gold18kGrams,
        silverGrams,
        stockInventoryValue,
        rawMaterialsValue,
        goodsInTransit,
        tradeReceivables,
        sharesLiquidValue,
        retainedRentalIncome,
        accessiblePension,
        harvestQuintals,
        cropType,
        cropPricePerQuintal,
        irrigationType,
        cattleCount,
        sheepGoatCount,
        shortTermDebts,
        livingExpensesImmediate: immediateLivingExpenses,
      },
      notes: `Assessed on ${calendarType} calendar. Nisab: ${nisabThresholdETB.toLocaleString()} ETB. Gross: ${(totalGrossMonetaryAssets + totalCropMarketValue).toLocaleString()} ETB.`,
    };

    try {
      const saved = await saveZakatAssessment(title, assessment as unknown as Record<string, unknown>);
      addZakatCalculation({ ...assessment, id: saved.id });
    } catch (error) {
      window.alert(error instanceof Error ? `Could not save assessment: ${error.message}` : 'Could not save assessment.');
      return;
    }

    setIsSaveModalOpen(false);
    setAssessmentTitleInput('');
  };

  const handleLoadCalculation = (snapshot: NonNullable<ZakatCalculationRecord['inputSnapshot']>) => {
    setCashInHand(snapshot.cashInHand || 0);
    setBankDeposits(snapshot.bankDeposits || 0);
    setDigitalWallets(snapshot.digitalWallets || 0);
    setForeignCurrencyETB(snapshot.foreignCurrencyETB || 0);
    setGoodDebtsReceivable(snapshot.goodDebtsReceivable || 0);
    setGold24kGrams(snapshot.gold24kGrams || 0);
    setGold21kGrams(snapshot.gold21kGrams || 0);
    setGold18kGrams(snapshot.gold18kGrams || 0);
    setSilverGrams(snapshot.silverGrams || 0);
    setStockInventoryValue(snapshot.stockInventoryValue || 0);
    setRawMaterialsValue(snapshot.rawMaterialsValue || 0);
    setGoodsInTransit(snapshot.goodsInTransit || 0);
    setTradeReceivables(snapshot.tradeReceivables || 0);
    setSharesLiquidValue(snapshot.sharesLiquidValue || 0);
    setRetainedRentalIncome(snapshot.retainedRentalIncome || 0);
    setAccessiblePension(snapshot.accessiblePension || 0);
    setHarvestQuintals(snapshot.harvestQuintals || 0);
    if (snapshot.cropType) setCropType(snapshot.cropType);
    if (snapshot.cropPricePerQuintal) setCropPricePerQuintal(snapshot.cropPricePerQuintal);
    if (snapshot.irrigationType) setIrrigationType(snapshot.irrigationType);
    if (snapshot.cattleCount !== undefined) setCattleCount(snapshot.cattleCount);
    if (snapshot.sheepGoatCount !== undefined) setSheepGoatCount(snapshot.sheepGoatCount);
    setShortTermDebts(snapshot.shortTermDebts || 0);
    setImmediateLivingExpenses(snapshot.livingExpensesImmediate || 0);
    setMainTab('calculator');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Primary Sub-Navigation Bar: Active Calculator vs Zakat History */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-stone-100 dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainTab('calculator')}
            className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'calculator'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Active Zakat Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('history')}
            className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === 'history'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Zakat History & Tracking</span>
            {isLoggedIn && userCalculationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-stone-950">
                {userCalculationsCount}
              </span>
            )}
          </button>
        </div>

        {mainTab === 'calculator' && (
          <div className="flex items-center justify-end gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              icon={<Save className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => {
                if (!isLoggedIn) {
                  setMainTab('history');
                } else {
                  setIsSaveModalOpen(true);
                }
              }}
              className="text-xs"
            >
              Save Assessment to History
            </Button>
          </div>
        )}
      </div>

      {mainTab === 'history' ? (
        <ZakatHistory
          onLoadCalculation={handleLoadCalculation}
          onProceedToPaymentGateway={onProceedToPaymentGateway}
          onOpenCalculatorTab={() => setMainTab('calculator')}
        />
      ) : (
        <>
          {/* Top Banner / Introduction */}
          <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-8 border border-emerald-800/70 shadow-2xl text-stone-100 relative overflow-hidden">
            <IslamicPattern opacity={0.06} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-600 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    Jimma Majlis Shari'ah Compliance
                  </span>
                  <Badge variant="gold" className="text-xs">
                    Updated for 1447 / 1448 AH
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  Jimma Zone Digital Zakat & Ushr Calculator
                </h2>

                <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                  Calculate your exact Zakat obligations across cash holdings, bank deposits, gold & silver,
                  commercial business stock, investments, and Jimma coffee agricultural harvests (Ushr) under classical Islamic jurisprudence.
                </p>

                {/* Quick action buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    variant="gold"
                    size="sm"
                    icon={<BookOpen className="w-4 h-4" />}
                    onClick={() => setIsGuideOpen(true)}
                    className="text-xs font-bold"
                  >
                    Read Shari'ah Guidelines & 8 Asnaf
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Receipt className="w-4 h-4 text-emerald-400" />}
                    onClick={() => setIsAssessmentOpen(true)}
                    className="text-xs text-stone-200 border-stone-700 hover:bg-stone-800"
                  >
                    Official Assessment Statement
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<History className="w-4 h-4 text-amber-400" />}
                    onClick={() => setMainTab('history')}
                    className="text-xs text-stone-200 border-stone-700 hover:bg-stone-800"
                  >
                    View Zakat History ({userCalculationsCount})
                  </Button>
                </div>
              </div>

          {/* Quick Scenario Preset Selector */}
          <div className="lg:col-span-4 bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-stone-700/60 space-y-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400 block">
              Load Sample Profiles (1-Click)
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleLoadPreset('merchant')}
                className="px-3 py-2 text-left rounded-xl bg-stone-800 hover:bg-emerald-950/70 border border-stone-700 hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">Jimma Merkato Merchant</span>
                </div>
                <span className="text-[10px] text-stone-400">Stock & Cash</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('farmer')}
                className="px-3 py-2 text-left rounded-xl bg-stone-800 hover:bg-emerald-950/70 border border-stone-700 hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">Coffee Farmer & Grower</span>
                </div>
                <span className="text-[10px] text-stone-400">Ushr Harvest</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('household')}
                className="px-3 py-2 text-left rounded-xl bg-stone-800 hover:bg-emerald-950/70 border border-stone-700 hover:border-emerald-500 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-white">Salaried Household & Gold</span>
                </div>
                <span className="text-[10px] text-stone-400">Jewelry & Bank</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadPreset('clear')}
                className="px-3 py-1.5 text-center rounded-xl bg-stone-800/40 hover:bg-rose-950/50 text-stone-400 hover:text-rose-300 border border-stone-700/50 transition-all text-[11px] flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All Fields to 0</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs (Col 8) + Summary Panel (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Input Controls & Categories (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Nisab & Currency Benchmark Settings */}
          <Card className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                    Nisab Standard & Price Parameters
                  </h3>
                  <span className="text-xs text-stone-500">Benchmark for minimum wealth eligibility</span>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrency('ETB')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'ETB'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-stone-500'
                  }`}
                >
                  ETB (Ethiopian Birr)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-stone-500'
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Nisab Choice */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nisab Benchmark Standard
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNisabStandard('gold')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      nisabStandard === 'gold'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Gold (85g)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNisabStandard('silver')}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      nisabStandard === 'silver'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Silver (595g)
                  </button>
                </div>
              </div>

              {/* Gold Price per gram */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>24k Gold (ETB / gram)</span>
                  <span className="text-[10px] text-amber-600 font-mono">Market Ref</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={100}
                    value={goldPricePerGram}
                    onChange={(e) => setGoldPricePerGram(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-stone-400 text-[10px]">ETB/g</span>
                </div>
              </div>

              {/* Silver Price per gram */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                  <span>Silver (ETB / gram)</span>
                  <span className="text-[10px] text-stone-400 font-mono">Market Ref</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={silverPricePerGram}
                    onChange={(e) => setSilverPricePerGram(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 text-xs font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-stone-400 text-[10px]">ETB/g</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              {nisabRateDate
                ? `Gold and silver reference rates supplied by Jimma Council, effective ${new Date(nisabRateDate).toLocaleDateString()}. You can adjust them for your valuation.`
                : 'No current Council rate is published. The displayed gold and silver prices are estimates; update them to your local market prices.'}
            </p>
            {rateLoadError && <p role="status" className="text-xs text-rose-600 dark:text-rose-400">Could not load council Nisab rates: {rateLoadError}</p>}

            {/* Nisab result info bar */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                    Calculated Nisab Threshold: {nisabThresholdETB.toLocaleString()} ETB
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Based on {nisabStandard === 'gold' ? '85g of pure Gold' : '595g of Silver'} @ current market pricing.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={calendarType}
                  onChange={(e) => setCalendarType(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                >
                  <option value="hijri">Hijri Lunar Year (2.50%)</option>
                  <option value="gregorian">Solar Year (2.577%)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Section 2: Interactive Category Inputs */}
          <Card className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                    Asset Details & Deductions
                  </h3>
                  <span className="text-xs text-stone-500">Input all assets owned for 1 lunar year (Hawl)</span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                <span key={totalGrossMonetaryAssets}>
                  Gross: {totalGrossMonetaryAssets.toLocaleString()} ETB
                </span>
              </span>
            </div>

            {/* Category Navigation Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'cash', label: 'Cash & Bank', icon: <Coins className="w-3.5 h-3.5" />, count: cashTotal },
                { id: 'metals', label: 'Gold & Silver', icon: <Sparkles className="w-3.5 h-3.5" />, count: metalsTotal },
                { id: 'business', label: 'Business & Stock', icon: <Package className="w-3.5 h-3.5" />, count: businessTotal },
                { id: 'investments', label: 'Investments', icon: <TrendingUp className="w-3.5 h-3.5" />, count: investmentsTotal },
                { id: 'agriculture', label: 'Coffee & Crops (Ushr)', icon: <Coffee className="w-3.5 h-3.5" />, count: agricultureUshrDue },
                { id: 'livestock', label: 'Livestock (An\'am)', icon: <Scale className="w-3.5 h-3.5" />, count: livestockSummary.totalLivestockCash },
                { id: 'deductions', label: 'Deductible Debts', icon: <Receipt className="w-3.5 h-3.5 text-rose-500" />, count: totalDeductions, isNegative: true },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium transition-all ${
                    activeCategory === cat.id
                      ? cat.isNegative
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 shadow-xs font-bold'
                        : 'bg-emerald-800 text-white shadow-xs font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  {cat.count > 0 && (
                    <span key={cat.count} className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {cat.isNegative ? '-' : ''}{cat.count > 1000000 ? `${(cat.count/1000000).toFixed(1)}M` : `${Math.round(cat.count/1000)}k`}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB 1: Cash & Liquid Funds */}
            {activeCategory === 'cash' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Include all liquid cash, savings in checking or Islamic interest-free accounts (CBE, ZamZam, Hijra, Awash, Siinqee), and digital mobile money.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Cash at Home / Safe (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cashInHand || ''}
                      onChange={(e) => setCashInHand(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Bank Deposits & Accounts (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bankDeposits || ''}
                      onChange={(e) => setBankDeposits(Number(e.target.value))}
                      placeholder="e.g. 250,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Digital Wallets (Telebirr / CBE Birr / Chapa)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={digitalWallets || ''}
                      onChange={(e) => setDigitalWallets(Number(e.target.value))}
                      placeholder="e.g. 45,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Foreign Currency Held (Converted to ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={foreignCurrencyETB || ''}
                      onChange={(e) => setForeignCurrencyETB(Number(e.target.value))}
                      placeholder="e.g. USD, SAR, AED converted"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Good Loans / Money Owed to You (Qard Hasan / Receivables expected to be returned)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={goodDebtsReceivable || ''}
                      onChange={(e) => setGoodDebtsReceivable(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Gold & Silver */}
            {activeCategory === 'metals' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gold Jewelry & Bullion Ruling in Jimma Zone:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    All pure gold bullion, coins, and investment gold are strictly subject to Zakat. For personal jewelry, the Jimma Fatwa Board recommends including gold held as wealth reserve or exceeding customary local standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      24k Pure Gold / Bullion (Grams)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={gold24kGrams || ''}
                      onChange={(e) => setGold24kGrams(Number(e.target.value))}
                      placeholder="0 g"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Valued at: {(gold24kGrams * goldPricePerGram).toLocaleString()} ETB
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      21k Gold Jewelry / Ornaments (Grams)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={gold21kGrams || ''}
                      onChange={(e) => setGold21kGrams(Number(e.target.value))}
                      placeholder="0 g"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Valued at: {Math.round(gold21kGrams * (goldPricePerGram * (21/24))).toLocaleString()} ETB
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      18k Gold Jewelry (Grams)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={gold18kGrams || ''}
                      onChange={(e) => setGold18kGrams(Number(e.target.value))}
                      placeholder="0 g"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Valued at: {Math.round(gold18kGrams * (goldPricePerGram * (18/24))).toLocaleString()} ETB
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Silver Bars, Coins or Jewelry (Grams)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={silverGrams || ''}
                      onChange={(e) => setSilverGrams(Number(e.target.value))}
                      placeholder="0 g"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Valued at: {(silverGrams * silverPricePerGram).toLocaleString()} ETB
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Other Precious Stored Metals / Trade Bullion (ETB Value)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={otherPreciousMetals || ''}
                      onChange={(e) => setOtherPreciousMetals(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Business & Trade */}
            {activeCategory === 'business' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Shari'ah Valuation of Commercial Merchandise:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Finished goods for sale must be assessed at <strong>current wholesale replacement value</strong> (not retail profit markup). Business equipment, delivery vehicles, store fixtures, and warehouse buildings are <strong>exempt</strong> from Zakat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Wholesale Value of Finished Goods / Inventory (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={stockInventoryValue || ''}
                      onChange={(e) => setStockInventoryValue(Number(e.target.value))}
                      placeholder="e.g. 1,500,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Raw Materials for Manufacturing (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={rawMaterialsValue || ''}
                      onChange={(e) => setRawMaterialsValue(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Goods in Transit (Already Paid for) (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={goodsInTransit || ''}
                      onChange={(e) => setGoodsInTransit(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Trade Receivables (Customer invoices expected to be paid)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={tradeReceivables || ''}
                      onChange={(e) => setTradeReceivables(Number(e.target.value))}
                      placeholder="e.g. 180,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Investments & Rental Income */}
            {activeCategory === 'investments' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    For rented commercial properties, Zakat is due on the <strong>retained rental cash income</strong> after 1 year, not on the physical building value itself.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Tradable Shares / Islamic Sukuk (Liquid Portion) (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sharesLiquidValue || ''}
                      onChange={(e) => setSharesLiquidValue(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Retained Rental Income / Property Cash (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={retainedRentalIncome || ''}
                      onChange={(e) => setRetainedRentalIncome(Number(e.target.value))}
                      placeholder="e.g. 150,000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Accessible Pension / Provident Fund (Portion withdrawable today)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={accessiblePension || ''}
                      onChange={(e) => setAccessiblePension(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Agricultural Harvest (Ushr) - Jimma Specialty */}
            {activeCategory === 'agriculture' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <Coffee className="w-4 h-4" />
                      <span>Jimma Agricultural Produce & Coffee Harvest (Ushr)</span>
                    </div>
                    <Badge variant="gold">No Hawl Required (Due at Harvest)</Badge>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Agricultural Zakat is due on the day of harvest (Surah Al-An'am 6:141) if the crop yield reaches 5 Wasaq (~653 kg or ~6.53 quintals).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Crop / Produce Type
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold"
                    >
                      <option value="Jimma Arabica Coffee (Limmu / Agaro / Gomma)">Jimma Arabica Coffee (Limmu / Agaro)</option>
                      <option value="Teff (White / Magna)">Teff (Magna / Serdo)</option>
                      <option value="Maize / Corn">Maize / Corn</option>
                      <option value="Wheat & Barley">Wheat & Barley</option>
                      <option value="Sorghum / Legumes">Sorghum / Legumes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                      <span>Total Harvest (Quintals)</span>
                      <span className="text-[10px] text-stone-400">1 Qtl = 100 kg</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={harvestQuintals || ''}
                      onChange={(e) => setHarvestQuintals(Number(e.target.value))}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-stone-100"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Nisab: 6.53 Qtl ({isCropNisabMet ? '✅ Reached' : '❌ Below Nisab'})
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Market Price per Quintal (ETB)
                    </label>
                    <input
                      type="number"
                      min={100}
                      value={cropPricePerQuintal || ''}
                      onChange={(e) => setCropPricePerQuintal(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                {/* Irrigation Method (Crucial for Fiqh rate 10% vs 5%) */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-2 text-xs">
                    Irrigation & Watering Method (Determines Shari'ah Rate)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setIrrigationType('rain')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        irrigationType === 'rain'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Rain-Fed / Natural</span>
                        <Badge variant="emerald">10% (Ushr)</Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 font-normal">
                        Watered naturally by rain, rivers, or streams without mechanical pump costs.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIrrigationType('irrigated')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        irrigationType === 'irrigated'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Artificially Irrigated</span>
                        <Badge variant="teal">5% (Half Ushr)</Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 font-normal">
                        Watered with fuel pumps, purchased canal irrigation, or motorized wells.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIrrigationType('mixed')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        irrigationType === 'mixed'
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Mixed Water Source</span>
                        <Badge variant="gold">7.5%</Badge>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1 font-normal">
                        Partially rain-fed and partially artificial motorized irrigation.
                      </p>
                    </button>
                  </div>
                </div>

                {isCropNisabMet && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-amber-950 dark:text-amber-200 block">
                        Harvest Ushr Obligation: {agricultureUshrDue.toLocaleString()} ETB
                      </span>
                      <span className="text-[11px] text-amber-800 dark:text-amber-400">
                        {harvestQuintals} Quintals of {cropType} • Total value: {totalCropMarketValue.toLocaleString()} ETB @ {ushrRate * 100}% rate.
                      </span>
                    </div>
                    <Badge variant="gold">Harvest Day Due</Badge>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: Livestock (Zakat al-An'am) */}
            {activeCategory === 'livestock' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Applies to free-grazing animals (*Sa'imah*) kept for breeding or milk, not commercial fattening stock (which is valued as business merchandise).
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40 space-y-2">
                    <label className="block font-bold text-stone-800 dark:text-stone-200">
                      Cows & Cattle (Baqar)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cattleCount || ''}
                      onChange={(e) => setCattleCount(Number(e.target.value))}
                      placeholder="e.g. 35"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-stone-100"
                    />
                    <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                      <div>Nisab: 30 cows</div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Obligation: {livestockSummary.cattleObligation}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40 space-y-2">
                    <label className="block font-bold text-stone-800 dark:text-stone-200">
                      Sheep & Goats (Ghanam)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sheepGoatCount || ''}
                      onChange={(e) => setSheepGoatCount(Number(e.target.value))}
                      placeholder="e.g. 60"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 font-mono font-bold text-stone-900 dark:text-stone-100"
                    />
                    <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                      <div>Nisab: 40 sheep/goats</div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Obligation: {livestockSummary.sheepObligation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Deductible Liabilities & Debts */}
            {activeCategory === 'deductions' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3 bg-rose-50/80 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    Allowable Shari'ah Deductions:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Only debts, overdue supplier invoices, and essential living expenses due <strong>immediately or within the current month/year</strong> may be subtracted. Long-term multi-year loans cannot be deducted in their entirety.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Short-Term Personal Debts Due Immediately (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={shortTermDebts || ''}
                      onChange={(e) => setShortTermDebts(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-rose-200 dark:border-rose-800 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Immediate Essential Living Expenses / House Bills Due (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={immediateLivingExpenses || ''}
                      onChange={(e) => setImmediateLivingExpenses(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-rose-200 dark:border-rose-800 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Overdue Commercial Supplier Invoices (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={overdueSupplierInvoices || ''}
                      onChange={(e) => setOverdueSupplierInvoices(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-rose-200 dark:border-rose-800 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Unpaid Employee Wages & Commercial Taxes Due Now (ETB)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={dueWagesAndTax || ''}
                      onChange={(e) => setDueWagesAndTax(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-rose-200 dark:border-rose-800 font-mono text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Sticky Live Calculation & Assessment Summary (4 Columns) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <Card
            key={`${totalGrossMonetaryAssets}:${totalDeductions}:${netZakatableWealth}:${nisabThresholdETB}:${zakatAlMalDue}:${agricultureUshrDue}:${livestockSummary.totalLivestockCash}`}
            className="border-2 border-emerald-600/60 shadow-xl overflow-hidden relative space-y-5"
          >
            <IslamicPattern opacity={0.03} />

            {/* Header */}
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Assessment Summary
                </span>
                <h4 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Zakat Obligation
                </h4>
              </div>

              <Badge variant={isNisabMet ? 'emerald' : 'amber'} size="md">
                {isNisabMet ? 'Nisab Reached (Wajib)' : 'Below Nisab'}
              </Badge>
            </div>

            {/* Progress to Nisab */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Net Wealth vs Nisab</span>
                <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{nisabPercentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isNisabMet ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${nisabPercentage}%` }}
                />
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 text-xs border-y border-stone-100 dark:border-stone-800 py-3">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Gross Zakatable Assets:</span>
                <span className="font-mono font-semibold">{totalGrossMonetaryAssets.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Allowable Deductions:</span>
                <span className="font-mono font-semibold">-{totalDeductions.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-stone-100 dark:border-stone-800 text-stone-900 dark:text-stone-100">
                <span>Net Zakatable Wealth:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {netZakatableWealth.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>Nisab Benchmark:</span>
                <span className="font-mono">{nisabThresholdETB.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Zakat Components */}
            <div className="space-y-2 text-xs bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-300">Zakat al-Mal (2.5%):</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                  {zakatAlMalDue.toLocaleString()} ETB
                </span>
              </div>
              {agricultureUshrDue > 0 && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400">
                  <span>Agricultural Ushr (Harvest):</span>
                  <span className="font-mono font-bold">{agricultureUshrDue.toLocaleString()} ETB</span>
                </div>
              )}
              {livestockSummary.totalLivestockCash > 0 && (
                <div className="flex justify-between text-blue-700 dark:text-blue-400">
                  <span>Livestock Zakat Equivalent:</span>
                  <span className="font-mono font-bold">{livestockSummary.totalLivestockCash.toLocaleString()} ETB</span>
                </div>
              )}
            </div>

            {/* Grand Total Obligation Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 text-white border border-emerald-800 text-center space-y-1 shadow-inner">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                Total Zakat Obligation Due
              </span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {grandTotalZakatETB.toLocaleString()} ETB
              </div>
              <span className="text-xs text-stone-300 font-mono block">
                (~${grandTotalZakatUSD.toLocaleString()} USD)
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {onProceedToPaymentGateway ? (
                <>
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full text-xs sm:text-sm font-bold shadow-md justify-center py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-stone-950 cursor-pointer"
                    icon={<ArrowRight className="w-4 h-4" />}
                    onClick={() => {
                        if (grandTotalZakatETB > 0) onProceedToPaymentGateway(grandTotalZakatETB);
                      }}
                      disabled={grandTotalZakatETB <= 0}
                  >
                      {gatewayButtonText || `Pay via Donation Gateway (${grandTotalZakatETB.toLocaleString()} ETB) →`}
                  </Button>

                </>
              ) : (
                <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Open this calculator from the Donate page to create a payment request. Payment is not confirmed until the selected provider verifies it.
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                icon={<Receipt className="w-4 h-4" />}
                onClick={() => setIsAssessmentOpen(true)}
              >
                View & Print Official Assessment
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!isLoggedIn) {
                    setMainTab('history');
                  } else {
                    setIsSaveModalOpen(true);
                  }
                }}
              >
                Save Assessment to History
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400"
                icon={<History className="w-3.5 h-3.5" />}
                onClick={() => setMainTab('history')}
              >
                View Zakat History ({userCalculationsCount})
              </Button>
            </div>

            <p className="text-[10px] text-center text-stone-400">
              Audited by the Jimma Zone Islamic Affairs Supreme Council Shari'ah Committee.
            </p>
          </Card>
        </div>
      </div>
        </>
      )}

      {/* Modals */}
      <ZakatFiqhGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <ZakatAssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        assessmentData={{
          referenceNo: `ZAKAT-JIMMA-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          hijriDate: '1448 AH',
          nisabStandard,
          nisabThresholdETB,
          goldRatePerGram: goldPricePerGram,
          silverRatePerGram: silverPricePerGram,
          calendarType,
          currency,
          usdExchangeRate: usdRate,
          grossAssets: {
            cash: cashTotal,
            goldSilver: metalsTotal,
            business: businessTotal,
            investments: investmentsTotal,
            receivables: goodDebtsReceivable,
            total: totalGrossMonetaryAssets,
          },
          deductions: {
            debts: shortTermDebts + overdueSupplierInvoices,
            expenses: immediateLivingExpenses + dueWagesAndTax,
            total: totalDeductions,
          },
          netZakatableWealth,
          isNisabMet,
          zakatAlMalDue,
          agricultureUshrDue,
          livestockZakatDue: livestockSummary.totalLivestockCash,
          grandTotalZakatETB,
          grandTotalZakatUSD,
        }}
      />

      {/* Save Assessment to History Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Save Zakat Assessment to Your Account"
        size="md"
      >
        <div className="space-y-5">
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Record this calculation under your profile (<span className="font-semibold text-emerald-700 dark:text-emerald-400">{currentUser.name}</span>). You will be able to review past assessments, restore them to this calculator, print official statements, and track discharge status.
          </p>

          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500">Gross Zakatable Assets:</span>
              <span className="font-bold font-mono">{(totalGrossMonetaryAssets + totalCropMarketValue).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Net Zakatable Pool:</span>
              <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">{netZakatableWealth.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Nisab Threshold ({nisabStandard}):</span>
              <span className="font-bold font-mono">{nisabThresholdETB.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-200 dark:border-stone-700">
              <span className="font-bold text-stone-900 dark:text-stone-100">Calculated Obligation:</span>
              <span className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm">{grandTotalZakatETB.toLocaleString()} ETB</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Assessment Title / Year Label
            </label>
            <input
              type="text"
              value={assessmentTitleInput}
              onChange={(e) => setAssessmentTitleInput(e.target.value)}
              placeholder={`${calendarType === 'hijri' ? '1448 AH' : '2026'} Annual Zakat Assessment`}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-emerald-500 outline-none text-stone-900 dark:text-stone-100"
            />
            <span className="text-[10px] text-stone-400">
              Optional custom label (e.g. "Ramadan Assessment", "Coffee Harvest Ushr Jimma").
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              icon={<BookmarkCheck className="w-4 h-4" />}
              onClick={handleSaveCalculation}
            >
              Save to My History
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
