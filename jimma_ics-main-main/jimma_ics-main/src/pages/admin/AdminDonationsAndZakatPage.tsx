import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Phone,
  Building,
  Scale,
  Calculator,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
  Award,
  Users,
  Coins,
  Send,
  Trash2,
  Edit,
  ExternalLink,
  ChevronRight,
  Receipt,
  Eye,
  Info,
  Check,
  FileText,
  BarChart3,
  TrendingUp,
  Save,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { IslamicPattern } from '../../components/common/IslamicPattern';
import { Donation, ZakatBeneficiaryDistribution } from '../../types';
import { DonationInflowTrendsChart } from '../../components/charts/DonationInflowTrendsChart';
import { DonationIntentRecord, fetchDonationIntents } from '../../services/donationsApi';
import { fetchCurrentNisabRate, NisabRate, setNisabRate } from '../../services/zakatApi';

type DonationLog = Donation & {
  source: 'backend' | 'manual';
  paymentStatus?: DonationIntentRecord['status'];
};

function toDonationLog(record: DonationIntentRecord, funds: { id: string; name: string }[]): DonationLog {
  const paymentMethods: Record<DonationIntentRecord['paymentMethod'], Donation['paymentMethod']> = {
    TELEBIRR: 'Telebirr',
    CBE_BIRR: 'CBE Birr',
    AWASH_BANK: 'Awash Bank',
    BANK_TRANSFER: 'Bank Transfer',
  };
  const categoryType = /zakat|ushr/i.test(`${record.category} ${record.fundName}`)
    ? 'Zakat ul-Mal'
    : /general donation/i.test(record.category)
      ? 'General Sadaqah'
      : undefined;

  return {
    id: `intent-${record.id}`,
    receiptNo: record.reference,
    donorName: record.anonymous ? 'Anonymous Donor' : record.donorName || 'Donor',
    isAnonymous: record.anonymous,
    phone: record.donorPhone,
    email: record.donorEmail || undefined,
    amountETB: record.amountETB,
    fundId: funds.find((fund) => fund.name === record.fundName)?.id || '',
    fundName: record.fundName,
    date: new Date(record.createdAt).toLocaleDateString(),
    paymentMethod: paymentMethods[record.paymentMethod],
    status: record.status === 'CONFIRMED' ? 'Completed' : 'Processing',
    notes: `Category: ${record.category}`,
    certificateIssued: record.status === 'CONFIRMED',
    categoryType,
    transactionRef: record.reference,
    source: 'backend',
    paymentStatus: record.status,
  };
}

export const AdminDonationsAndZakatPage: React.FC = () => {
  const {
    funds,
    addDonation,
    deleteDonation,
    zakatDistributions,
    addZakatDistribution,
    addToast,
    currentUser,
  } = useApp();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'all' | 'zakat' | 'distributions' | 'calculator'>('all');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedFund, setSelectedFund] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedDonationForCert, setSelectedDonationForCert] = useState<Donation | null>(null);
  const [isAddDistModalOpen, setIsAddDistModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [showTrendsChart, setShowTrendsChart] = useState(false);
  const [trendsViewMode, setTrendsViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [serverDonationLogs, setServerDonationLogs] = useState<DonationLog[]>([]);
  const [manualDonationLogs, setManualDonationLogs] = useState<DonationLog[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [donationsLoadError, setDonationsLoadError] = useState('');
  const [donationsReloadKey, setDonationsReloadKey] = useState(0);
  const [nisabRate, setNisabRateState] = useState<NisabRate>({
    goldPricePerGram: 7000,
    silverPricePerGram: 78000 / 595,
    effectiveDate: '',
  });
  const [nisabRateError, setNisabRateError] = useState('');
  const [isEditingNisabRates, setIsEditingNisabRates] = useState(false);
  const [goldPriceDraft, setGoldPriceDraft] = useState('7000');
  const [silverPriceDraft, setSilverPriceDraft] = useState(String(78000 / 595));
  const [savingNisabRate, setSavingNisabRate] = useState(false);
  const canManageNisabRates = currentUser?.authRole === 'super_admin'
    || currentUser?.permissions?.includes('zakat.rates.write') === true;

  useEffect(() => {
    let mounted = true;
    setDonationsLoading(true);
    setDonationsLoadError('');
    fetchDonationIntents()
      .then((records) => {
        if (mounted) setServerDonationLogs(records.map((record) => toDonationLog(record, funds)));
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Could not load donation records.';
        setDonationsLoadError(message);
      })
      .finally(() => {
        if (mounted) setDonationsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [funds, donationsReloadKey]);

  useEffect(() => {
    let mounted = true;
    fetchCurrentNisabRate()
      .then((rate) => {
        if (!mounted || !rate) return;
        setNisabRateState(rate);
        setGoldPriceDraft(String(rate.goldPricePerGram));
        setSilverPriceDraft(String(rate.silverPricePerGram));
      })
      .catch((error: unknown) => {
        if (mounted) setNisabRateError(error instanceof Error ? error.message : 'Could not load council Nisab rates.');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const donationLogs = useMemo(
    () => [...manualDonationLogs, ...serverDonationLogs],
    [manualDonationLogs, serverDonationLogs],
  );

  // New Donation Form State
  const [formData, setFormData] = useState({
    donorName: '',
    isAnonymous: false,
    phone: '',
    email: '',
    amountETB: 10000,
    fundId: funds[3]?.id || 'fund-4', // Default to Zakat & Social Welfare
    categoryType: 'Zakat ul-Mal' as Donation['categoryType'],
    district: 'Jimma City (Central)',
    asnafCategory: 'Al-Fuqara (The Destitute)',
    paymentMethod: 'Telebirr' as Donation['paymentMethod'],
    transactionRef: '',
    notes: '',
    collectorName: 'Zakat Officer Sheikh Hussen',
  });

  // Zakat Calculator State
  const [calcType, setCalcType] = useState<'wealth' | 'agriculture'>('wealth');
  const [calcCash, setCalcCash] = useState<number>(150000);
  const [calcBank, setCalcBank] = useState<number>(300000);
  const [calcGoldValue, setCalcGoldValue] = useState<number>(200000);
  const [calcInventory, setCalcInventory] = useState<number>(450000);
  const [calcDebts, setCalcDebts] = useState<number>(80000);

  // Agricultural Calculator State
  const [calcHarvestYieldETB, setCalcHarvestYieldETB] = useState<number>(500000);
  const [calcIrrigationType, setCalcIrrigationType] = useState<'rain' | 'irrigated'>('rain'); // 10% vs 5%

  // New Distribution Form State
  const [distFormData, setDistFormData] = useState<Omit<ZakatBeneficiaryDistribution, 'id'>>({
    asnafCategory: 'Al-Fuqara (The Destitute)',
    arabicName: 'الْفُقَرَاءُ',
    woredaDistrict: 'Gomma District',
    beneficiaryCount: 150,
    totalDisbursedETB: 600000,
    lastDisbursalDate: new Date().toISOString().split('T')[0],
    distributionChannel: 'Direct CBE Birr / Biometric Voucher',
    leadOfficer: currentUser?.name || 'Zakat Officer Sheikh Hussen',
    notes: 'Emergency welfare disbursals to verified low-income households.',
  });

  // Unique Districts and Categories
  const districtList = useMemo(() => {
    const set = new Set<string>();
    donationLogs.forEach((d) => {
      if (d.district) set.add(d.district);
    });
    return ['All', ...Array.from(set)];
  }, [donationLogs]);
  const fundNames = useMemo(
    () => Array.from(new Set([...funds.map((fund) => fund.name), ...donationLogs.map((donation) => donation.fundName)])),
    [funds, donationLogs],
  );
  const activeAdvancedFilterCount = [selectedCategory, selectedDistrict, selectedMethod, selectedFund]
    .filter((filter) => filter !== 'All').length;

  const clearAdvancedFilters = () => {
    setSelectedCategory('All');
    setSelectedDistrict('All');
    setSelectedMethod('All');
    setSelectedFund('All');
  };

  const categoryList = [
    'All',
    'Zakat ul-Mal',
    'Coffee Harvest Ushr',
    'Zakat ul-Fitr',
    'Sadaqah Jariyah',
    'General Sadaqah',
    'Orphan Sponsorship',
    'Madrasa Scholarship',
    'Waqf Endowment',
    'Emergency Relief',
    'Kaffarah / Fidyah',
  ];

  // Calculations
  const totalCollectedETB = useMemo(() => {
    return donationLogs.filter((d) => d.status === 'Completed').reduce((sum, d) => sum + (d.amountETB || 0), 0);
  }, [donationLogs]);

  const zakatOnlyTotalETB = useMemo(() => {
    return donationLogs
      .filter((d) => d.status === 'Completed')
      .filter((d) => d.categoryType?.includes('Zakat') || d.categoryType?.includes('Ushr') || d.fundName.includes('Zakat'))
      .reduce((sum, d) => sum + (d.amountETB || 0), 0);
  }, [donationLogs]);

  const sadaqahJariyahTotalETB = useMemo(() => {
    return donationLogs
      .filter((d) => d.status === 'Completed')
      .filter((d) => d.categoryType === 'Sadaqah Jariyah' || d.categoryType === 'Waqf Endowment' || d.categoryType === 'General Sadaqah')
      .reduce((sum, d) => sum + (d.amountETB || 0), 0);
  }, [donationLogs]);

  const totalAsnafDisbursedETB = useMemo(() => {
    return zakatDistributions.reduce((sum, z) => sum + (z.totalDisbursedETB || 0), 0);
  }, [zakatDistributions]);

  const totalBeneficiariesCount = useMemo(() => {
    return zakatDistributions.reduce((sum, z) => sum + (z.beneficiaryCount || 0), 0);
  }, [zakatDistributions]);

  const saveNisabRates = async (event: React.FormEvent) => {
    event.preventDefault();
    const gold = Number(goldPriceDraft);
    const silver = Number(silverPriceDraft);
    if (!(gold > 0) || !(silver > 0) || !Number.isFinite(gold) || !Number.isFinite(silver)) {
      addToast('Invalid Nisab rates', 'Enter positive gold and silver market prices per gram.', 'warning');
      return;
    }

    setSavingNisabRate(true);
    try {
      const updatedRate = await setNisabRate({ goldPricePerGram: gold, silverPricePerGram: silver });
      setNisabRateState(updatedRate);
      setNisabRateError('');
      setIsEditingNisabRates(false);
      addToast('Nisab rates updated', 'The guide and Zakat calculator now use these published council rates.', 'success');
    } catch (error) {
      addToast('Could not update Nisab rates', error instanceof Error ? error.message : 'Check your permissions and try again.', 'error');
    } finally {
      setSavingNisabRate(false);
    }
  };

  // Filtered Donations
  const filteredDonations = useMemo(() => {
    return donationLogs.filter((d) => {
      // Tab specific filter
      if (activeTab === 'zakat') {
        const isZakatRelated =
          d.categoryType === 'Zakat ul-Mal' ||
          d.categoryType === 'Coffee Harvest Ushr' ||
          d.categoryType === 'Zakat ul-Fitr' ||
          d.categoryType === 'Kaffarah / Fidyah' ||
          d.fundName.includes('Zakat');
        if (!isZakatRelated) return false;
      }

      const matchSearch =
        d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.phone && d.phone.includes(searchTerm)) ||
        (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.district && d.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.transactionRef && d.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat = selectedCategory === 'All' || d.categoryType === selectedCategory;
      const matchDist = selectedDistrict === 'All' || d.district === selectedDistrict;
      const matchMethod = selectedMethod === 'All' || d.paymentMethod === selectedMethod;
      const matchFund = selectedFund === 'All' || d.fundName === selectedFund;

      return matchSearch && matchCat && matchDist && matchMethod && matchFund;
    });
  }, [donationLogs, activeTab, searchTerm, selectedCategory, selectedDistrict, selectedMethod, selectedFund]);

  // Handle Add Submit
  const handleAddDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amountETB <= 0) {
      addToast('Invalid Amount', 'Please enter a valid donation or Zakat amount in ETB.', 'warning');
      return;
    }

    const selectedFundObj = funds.find((f) => f.id === formData.fundId) || funds[0];

    const todayDate = new Date().toISOString().split('T')[0];
    const hijriSample = '12 Safar 1448 AH';

    const newDonation = addDonation({
      donorName: formData.isAnonymous ? 'Anonymous Donor (Fisabilillah)' : formData.donorName || 'Generous Donor',
      isAnonymous: formData.isAnonymous,
      phone: formData.phone || '+251 91 000 0000',
      email: formData.email,
      amountETB: Number(formData.amountETB),
      fundId: selectedFundObj.id,
      fundName: selectedFundObj.name,
      paymentMethod: formData.paymentMethod,
      categoryType: formData.categoryType,
      district: formData.district,
      asnafCategory: formData.asnafCategory,
      hijriDate: hijriSample,
      transactionRef: formData.transactionRef || `TX-${Date.now().toString().slice(-6)}`,
      collectorName: formData.collectorName,
      taxExemptCode: `JIC-TAX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: formData.notes,
    });

    setManualDonationLogs((previous) => [{ ...newDonation, source: 'manual' }, ...previous]);
    setIsAddModalOpen(false);
    setSelectedDonationForCert(newDonation);
    setIsCertificateModalOpen(true);
  };

  // Handle Add Distribution Submit
  const handleAddDistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (distFormData.totalDisbursedETB <= 0 || distFormData.beneficiaryCount <= 0) {
      addToast('Invalid Input', 'Please provide valid beneficiary count and disbursed amount.', 'warning');
      return;
    }

    const arabicMap: Record<string, string> = {
      'Al-Fuqara (The Destitute)': 'الْفُقَرَاءُ',
      'Al-Masakeen (The Needy)': 'الْمَسَاكِينُ',
      'Amilina Alayha (Zakat Collectors)': 'الْعَامِلِينَ عَلَيْهَا',
      'Al-Mu’allafatu Qulubuhum': 'الْمُؤَلَّفَةِ قُلُوبُهُمْ',
      'Fir-Riqab (Emergency Freedom)': 'فِي الرِّقَابِ',
      'Al-Gharimeen (Insolvent Debtors)': 'الْغَارِمِينَ',
      'Fi Sabilillah (In Allah’s Cause / Dawah)': 'فِي سَبِيلِ اللَّهِ',
      'Ibnus-Sabeel (Stranded Travellers)': 'ابْنِ السَّبِيلِ',
    };

    const saved = await addZakatDistribution({
      ...distFormData,
      arabicName: arabicMap[distFormData.asnafCategory] || 'الزَّكَاةُ',
    });
    if (!saved) return;

    setIsAddDistModalOpen(false);
    addToast('Disbursement saved', 'The record is now stored in the Zakat ledger.', 'success');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Receipt No', 'Date', 'Hijri Date', 'Donor Name', 'Anonymous', 'Amount ETB', 'Category', 'Fund', 'District', 'Payment Channel', 'Transaction Ref', 'Tax Code', 'Notes'];
    const rows = filteredDonations.map((d) => [
      d.receiptNo,
      d.date,
      d.hijriDate || '',
      d.isAnonymous ? 'Anonymous' : d.donorName,
      d.isAnonymous ? 'Yes' : 'No',
      d.amountETB,
      d.categoryType || 'General Donation',
      d.fundName,
      d.district || 'Jimma Zone',
      d.paymentMethod,
      d.transactionRef || '',
      d.taxExemptCode || '',
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jimma_Council_Donations_Zakat_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Exported', `Exported ${filteredDonations.length} records to CSV for auditing.`, 'success');
  };

  // Calculated Zakat Wealth
  const netWealthAssets = calcCash + calcBank + calcGoldValue + calcInventory - calcDebts;
  const zakatPayableETB = Math.max(0, netWealthAssets * 0.025);

  // Calculated Agricultural Ushr
  const ushrRate = calcIrrigationType === 'rain' ? 0.10 : 0.05;
  const ushrPayableETB = calcHarvestYieldETB * ushrRate;

  // Apply Calculated Zakat to Add Modal
  const applyCalculatedZakat = (amount: number, category: Donation['categoryType'], note: string) => {
    setFormData((prev) => ({
      ...prev,
      amountETB: Math.round(amount),
      categoryType: category,
      notes: note,
    }));
    setIsCalculatorModalOpen(false);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Islamic Council Treasury & Zakat Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Donations & Zakat Ledger
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm max-w-3xl mt-1">
            Jimma Zone Shari'ah Audited Contributions, Nisab Calculator, Official Certificate Generator & Asnaf Welfare Distributions across 18 Woredas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="inline-flex items-center gap-1.5">
            {showTrendsChart && (
              <div className="inline-flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setTrendsViewMode('monthly')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    trendsViewMode === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Monthly</span>
                </button>
                <button
                  onClick={() => setTrendsViewMode('annual')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    trendsViewMode === 'annual'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Annual</span>
                </button>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
              onClick={() => setShowTrendsChart((visible) => !visible)}
            >
              {showTrendsChart ? 'Hide trends' : 'Show trends'}
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Calculator className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsCalculatorModalOpen(true)}
          >
            Nisab & Calculator
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-stone-600 dark:text-stone-300" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Record Contribution
          </Button>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="space-y-1.5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Total Collections</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            ETB {(totalCollectedETB / 1000000).toFixed(2)}M
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{donationLogs.length} Donation Records</span>
            <Badge variant="blue">Live Ledger</Badge>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="space-y-1.5 border-l-4 border-l-teal-600">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Zakat & Coffee Ushr</span>
            <Scale className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-teal-700 dark:text-teal-400 font-mono">
            ETB {(zakatOnlyTotalETB / 1000000).toFixed(2)}M
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>8 Quranic Asnaf Pool</span>
            <span className="font-semibold text-teal-600">100% Shari'ah</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="space-y-1.5 border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Sadaqah & Waqf Pool</span>
            <Building className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            ETB {(sadaqahJariyahTotalETB / 1000000).toFixed(2)}M
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Mosques, Water & Madaris</span>
            <Badge variant="amber">Perpetual</Badge>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="space-y-1.5 border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Asnaf Beneficiaries</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-indigo-700 dark:text-indigo-400 font-mono">
            {totalBeneficiariesCount.toLocaleString()} Families
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Disbursed: ETB {(totalAsnafDisbursedETB / 1000000).toFixed(2)}M</span>
            <Badge variant="blue">18 Woredas</Badge>
          </div>
        </Card>
      </div>

      {/* Recharts Monthly & Annual Inflow Trends Bar Chart */}
      {showTrendsChart && (
        <DonationInflowTrendsChart
          donations={donationLogs.filter((donation) => donation.status === 'Completed')}
          viewMode={trendsViewMode}
          onViewModeChange={setTrendsViewMode}
        />
      )}

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>All Contributions ({donationLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('zakat')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'zakat'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Zakat & Ushr Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('distributions')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'distributions'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Asnaf Beneficiary Disbursals ({zakatDistributions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Nisab & Shari'ah Guide</span>
          </button>
        </div>

      </div>

      {/* Tab Content 1 & 2: Contributions / Zakat Log */}
      {(activeTab === 'all' || activeTab === 'zakat') && (
        <div className="space-y-5">
          {/* Search and Filters Bar */}
          <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search donor name, receipt #, phone, district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant={advancedFiltersOpen ? 'secondary' : 'outline'}
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                aria-expanded={advancedFiltersOpen}
                onClick={() => setAdvancedFiltersOpen((open) => !open)}
              >
                Filters{activeAdvancedFilterCount ? ` (${activeAdvancedFilterCount})` : ''}
              </Button>
              <div className="inline-flex items-center rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg p-1.5 ${viewMode === 'table' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                  aria-label="Table view"
                  title="Table view"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`rounded-lg p-1.5 ${viewMode === 'cards' ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100' : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'}`}
                  aria-label="Card view"
                  title="Card view"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
            </div>

            {advancedFiltersOpen && (
            <div className="flex flex-col gap-2 border-t border-stone-100 pt-3 dark:border-stone-800 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Advanced filters</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
              >
                {districtList.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === 'All' ? 'All Districts' : dist}
                  </option>
                ))}
              </select>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
              >
                <option value="All">All Channels</option>
                <option value="Telebirr">Telebirr</option>
                <option value="CBE Birr">CBE Birr</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Awash Bank">Awash Bank</option>
                <option value="Cash">Cash Treasury Voucher</option>
                <option value="International Remittance">International Remittance</option>
              </select>

              <select
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
              >
                <option value="All">All Funds</option>
                {fundNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              {activeAdvancedFilterCount > 0 && (
                <button type="button" onClick={clearAdvancedFilters} className="px-2 py-2 text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300">
                  Clear filters
                </button>
              )}
            </div>
            )}
          </div>

          {donationsLoading && (
            <div className="rounded-xl border border-stone-200 dark:border-stone-700 px-4 py-3 text-sm text-stone-500">
              Loading donation records…
            </div>
          )}
          {donationsLoadError && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              <span>Could not load donation logs: {donationsLoadError}</span>
              <Button variant="secondary" size="xs" onClick={() => setDonationsReloadKey((key) => key + 1)}>
                Retry
              </Button>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>
              Showing <strong className="text-stone-800 dark:text-stone-200">{filteredDonations.length}</strong> of{' '}
              {donationLogs.length} recorded contributions
            </span>
            <span>
              Filtered Total:{' '}
              <strong className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                ETB {filteredDonations.reduce((acc, d) => acc + d.amountETB, 0).toLocaleString()}
              </strong>
            </span>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' ? (
            <Card className="p-0 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] font-bold border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-3.5">Receipt #</th>
                      <th className="p-3.5">Date & Hijri</th>
                      <th className="p-3.5">Donor / Benefactor</th>
                      <th className="p-3.5">Classification & Fund</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Payment Channel</th>
                      <th className="p-3.5 text-right">Amount (ETB)</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                    {filteredDonations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-stone-400">
                          {donationsLoading
                            ? 'Loading donation and Zakat records…'
                            : donationsLoadError
                              ? 'Donation logs could not be loaded.'
                              : 'No matching donation or Zakat records found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDonations.map((d) => (
                        <tr key={d.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/50 transition-colors">
                          {/* Receipt # */}
                          <td className="p-3.5 font-mono">
                            <span className="font-bold text-stone-700 dark:text-stone-300">{d.receiptNo}</span>
                            {d.taxExemptCode && (
                              <div className="text-[10px] text-emerald-600 font-mono mt-0.5">Tax Exempt</div>
                            )}
                          </td>

                          {/* Date */}
                          <td className="p-3.5 text-stone-600 dark:text-stone-400">
                            <div>{d.date}</div>
                            {d.hijriDate && (
                              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-serif">
                                {d.hijriDate}
                              </div>
                            )}
                          </td>

                          {/* Donor */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {d.isAnonymous ? (
                                <Badge variant="stone">Anonymous Fisabilillah</Badge>
                              ) : (
                                <div>
                                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                                    {d.donorName}
                                  </div>
                                  {d.phone && (
                                    <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3 text-stone-400" />
                                      <span>{d.phone}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Classification & Fund */}
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <Badge
                                variant={
                                  d.categoryType?.includes('Zakat') || d.categoryType?.includes('Ushr')
                                    ? 'emerald'
                                    : d.categoryType?.includes('Sadaqah') || d.categoryType?.includes('Waqf')
                                    ? 'amber'
                                    : 'blue'
                                }
                              >
                                {d.categoryType || 'General Contribution'}
                              </Badge>
                              <span className="text-[11px] text-stone-500 truncate max-w-[200px]" title={d.fundName}>
                                {d.fundName}
                              </span>
                            </div>
                          </td>

                          {/* District */}
                          <td className="p-3.5 text-stone-600 dark:text-stone-300">
                            {d.district || 'Jimma Zone'}
                          </td>

                          {/* Payment Method */}
                          <td className="p-3.5">
                            <div className="font-mono text-[11px] text-stone-700 dark:text-stone-300">
                              {d.paymentMethod}
                            </div>
                            {d.paymentStatus && (
                              <Badge
                                variant={d.paymentStatus === 'CONFIRMED' ? 'emerald' : d.paymentStatus === 'CANCELLED' ? 'rose' : 'amber'}
                                className="mt-1"
                              >
                                {d.paymentStatus.replaceAll('_', ' ')}
                              </Badge>
                            )}
                            {d.transactionRef && (
                              <div className="text-[10px] text-stone-400 font-mono truncate max-w-[120px]">
                                {d.transactionRef}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="p-3.5 text-right font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400">
                            ETB {d.amountETB.toLocaleString()}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedDonationForCert(d);
                                  setIsCertificateModalOpen(true);
                                }}
                                disabled={d.status !== 'Completed'}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                title={d.status === 'Completed' ? 'View & Print Official Certificate' : 'Certificate available after payment confirmation'}
                              >
                                <Award className="w-4 h-4" />
                              </button>

                              {d.source === 'manual' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Remove donation record ${d.receiptNo}?`)) {
                                      setManualDonationLogs((records) => records.filter((record) => record.id !== d.id));
                                      deleteDonation(d.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            /* CARDS VIEW */
            filteredDonations.length === 0 ? (
              <Card className="p-8 text-center text-sm text-stone-500">
                {donationsLoading
                  ? 'Loading donation and Zakat records…'
                  : donationsLoadError
                    ? 'Donation logs could not be loaded.'
                    : 'No matching donation or Zakat records found.'}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonations.map((d) => (
                  <Card key={d.id} className="p-5 space-y-4 hover:border-emerald-500 transition-colors flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={
                          d.categoryType?.includes('Zakat') || d.categoryType?.includes('Ushr')
                            ? 'emerald'
                            : 'amber'
                        }
                      >
                        {d.categoryType || 'General Contribution'}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-stone-500">{d.receiptNo}</span>
                    </div>

                    <div className="pt-1">
                      <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ETB {d.amountETB.toLocaleString()}
                      </div>
                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1">
                        {d.isAnonymous ? 'Anonymous Fisabilillah' : d.donorName}
                      </div>
                      {d.phone && <div className="text-[11px] text-stone-500 font-mono">{d.phone}</div>}
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                      {d.notes || `Allocated to ${d.fundName}.`}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 pt-1">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-stone-400">Channel</span>
                        <span className="font-mono text-stone-700 dark:text-stone-300">{d.paymentMethod}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-stone-400">District</span>
                        <span>{d.district || 'Jimma Zone'}</span>
                      </div>
                    </div>
                    {d.paymentStatus && (
                      <Badge
                        variant={d.paymentStatus === 'CONFIRMED' ? 'emerald' : d.paymentStatus === 'CANCELLED' ? 'rose' : 'amber'}
                      >
                        {d.paymentStatus.replaceAll('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-mono">{d.date}</span>
                    <div className="flex gap-1.5">
                      <Button
                        variant="secondary"
                        size="xs"
                        icon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
                        disabled={d.status !== 'Completed'}
                        onClick={() => {
                          setSelectedDonationForCert(d);
                          setIsCertificateModalOpen(true);
                        }}
                      >
                        Certificate
                      </Button>
                    </div>
                  </div>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Tab Content 3: Asnaf Beneficiary Disbursals */}
      {activeTab === 'distributions' && (
        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <IslamicPattern opacity={0.12} />
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold uppercase">
                <Scale className="w-3.5 h-3.5" />
                <span>Surah At-Tawbah 9:60 Asnaf Tracking</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold">
                Quranic 8 Asnaf Zakat Distribution Ledger
              </h2>
              <p className="text-emerald-200 text-xs sm:text-sm leading-relaxed">
                Audited allocation from Jimma Council central Zakat treasury directly to eligible verified beneficiaries across 18 districts.
              </p>
            </div>

            <Button
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddDistModalOpen(true)}
              className="relative z-10 shrink-0"
            >
              Record Disbursal
            </Button>
          </div>

          {/* Asnaf Distribution Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {zakatDistributions.map((z) => (
              <Card key={z.id} className="p-6 space-y-4 hover:border-emerald-500 transition-colors flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-serif text-lg font-bold text-emerald-800 dark:text-emerald-400">
                        {z.arabicName}
                      </span>
                      <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                        {z.asnafCategory}
                      </h3>
                    </div>
                    <Badge variant="emerald">{z.beneficiaryCount} Beneficiaries</Badge>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400">Total Disbursed</span>
                    <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
                      ETB {z.totalDisbursedETB.toLocaleString()}
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {z.notes}
                  </p>

                  <div className="space-y-1 text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex justify-between">
                      <span>Woreda Coverage:</span>
                      <span className="font-medium text-stone-700 dark:text-stone-300">{z.woredaDistrict}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Channel:</span>
                      <span className="font-mono text-stone-700 dark:text-stone-300">{z.distributionChannel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Auditor:</span>
                      <span>{z.leadOfficer}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 text-[11px] text-stone-400 font-mono flex items-center justify-between border-t border-stone-100 dark:border-stone-800">
                  <span>Last Cycle: {z.lastDisbursalDate}</span>
                  <Badge variant="blue">Audited Disbursal</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 4: Nisab & Shari'ah Guide */}
      {activeTab === 'calculator' && (
        <div className="space-y-8">
          {/* Top Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 space-y-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <Scale className="w-4 h-4" />
                  <span>Current Nisab Standards in Ethiopia (1448 AH)</span>
                </div>
                {canManageNisabRates && !isEditingNisabRates && (
                  <Button variant="secondary" size="xs" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => setIsEditingNisabRates(true)}>
                    Edit market rates
                  </Button>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Official Jimma Fatwa Board Nisab Thresholds
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Under the guidance of the Jimma Zone Ulema & Fatwa Board, the following Nisab thresholds are pegged to prevailing market rates of precious metals and coffee cherry harvests in southwestern Ethiopia:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Gold Nisab (85 Grams)</span>
                  <div className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
                    ETB {(nisabRate.goldPricePerGram * 85).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-stone-500">Benchmark for liquid cash, bank savings, and trade inventory.</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Silver Nisab (595 Grams)</span>
                  <div className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
                    ETB {(nisabRate.silverPricePerGram * 595).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-stone-500">Recommended for conservative assessments to benefit the poor.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Coffee Ushr (5 Wasqs)</span>
                  <div className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100">
                    653 kg Yield
                  </div>
                  <p className="text-[11px] text-stone-500">10% for natural rain-fed farms; 5% for irrigated plantations.</p>
                </div>
              </div>

              {nisabRate.effectiveDate && (
                <p className="text-[11px] text-stone-500">
                  Market rates effective {new Date(nisabRate.effectiveDate).toLocaleDateString()}.
                </p>
              )}
              {nisabRateError && (
                <p role="status" className="text-xs text-amber-700 dark:text-amber-400">
                  Could not load published rates; showing the guide’s previous reference values. {nisabRateError}
                </p>
              )}
              {isEditingNisabRates && canManageNisabRates && (
                <form onSubmit={saveNisabRates} className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Update the market price per gram. Nisab quantities (85g gold, 595g silver) and the coffee Ushr ruling remain fixed.
                  </p>
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                      <span>Gold price / gram (ETB)</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={goldPriceDraft}
                        onChange={(event) => setGoldPriceDraft(event.target.value)}
                        className="block w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono dark:border-stone-700 dark:bg-stone-800"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                      <span>Silver price / gram (ETB)</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={silverPriceDraft}
                        onChange={(event) => setSilverPriceDraft(event.target.value)}
                        className="block w-48 rounded-lg border border-stone-300 bg-white px-3 py-2 font-mono dark:border-stone-700 dark:bg-stone-800"
                      />
                    </label>
                    <Button type="submit" variant="primary" disabled={savingNisabRate} icon={<Save className="w-4 h-4" />}>
                      {savingNisabRate ? 'Publishing…' : 'Publish rates'}
                    </Button>
                    <Button type="button" variant="secondary" disabled={savingNisabRate} onClick={() => setIsEditingNisabRates(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Card>

            <Card className="p-6 space-y-4 bg-gradient-to-br from-stone-900 to-emerald-950 text-stone-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Quick Zakat Calculator</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-white">Instant Assessment</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Evaluate commercial business Zakat or coffee seasonal harvest Ushr instantly using our embedded tools.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                icon={<Calculator className="w-4 h-4" />}
                onClick={() => setIsCalculatorModalOpen(true)}
              >
                Open Full Calculator
              </Button>
            </Card>
          </div>

          {/* 8 Asnaf Reference Table */}
          <Card className="space-y-4 p-6">
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
              The 8 Quranic Categories of Zakat Distribution (Surah At-Tawbah, 9:60)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">1. Al-Fuqara (الْفُقَرَاءُ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">The ultra-destitute who possess virtually no steady income or savings below Nisab.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">2. Al-Masakeen (الْمَسَاكِينُ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">The needy who have basic shelter or job but whose earnings fall short of minimum household costs.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">3. Amilina Alayha (الْعَامِلِينَ عَلَيْهَا)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">Zakat administrators, rural harvest enumerators, and certified council treasury collectors.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">4. Al-Mu’allafatu Qulubuhum</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">Those whose hearts are to be reconciled and welcomed into the Muslim community.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">5. Fir-Riqab (فِي الرِّقَابِ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">Liberation of bonded laborers, human trafficking victims, and acute humanitarian emancipation.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">6. Al-Gharimeen (الْغَارِمِينَ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">Insolvent debtors burdened by essential debts incurred for medical emergency or family survival.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">7. Fi Sabilillah (فِي سَبِيلِ اللَّهِ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">In the cause of Allah: Quranic education, Hifz students, rural Da’wah workers, and Islamic scholarships.</p>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 bg-stone-50 dark:bg-stone-800/40">
                <span className="font-serif font-bold text-emerald-700 dark:text-emerald-400">8. Ibnus-Sabeel (ابْنِ السَّبِيلِ)</span>
                <p className="text-xs text-stone-600 dark:text-stone-300">Stranded travellers and refugees traversing Jimma Zone without access to their funds.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* RECORD DONATION / ZAKAT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Donation or Zakat Receipt"
        subtitle="Issue Shari'ah certified electronic receipt and update council general ledger."
      >
        <form onSubmit={handleAddDonationSubmit} className="space-y-4">
          {/* Anonymous checkbox */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-stone-800 dark:text-stone-200 block">
                Anonymous Donor (Fisabilillah)
              </span>
              <span className="text-[11px] text-stone-500">
                Mask donor name on public registry and reports.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
          </div>

          {!formData.isAnonymous && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Donor Full Name *
                </label>
                <input
                  type="text"
                  required={!formData.isAnonymous}
                  placeholder="e.g. Haji Mukhtar Ababor"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+251 91 234 5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Contribution Type *
              </label>
              <select
                value={formData.categoryType}
                onChange={(e) => setFormData({ ...formData, categoryType: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <option value="Zakat ul-Mal">Zakat ul-Mal (Commercial & Wealth)</option>
                <option value="Coffee Harvest Ushr">Coffee Harvest Ushr (Agricultural)</option>
                <option value="Zakat ul-Fitr">Zakat ul-Fitr</option>
                <option value="Sadaqah Jariyah">Sadaqah Jariyah (Perpetual Charity)</option>
                <option value="General Sadaqah">General Sadaqah</option>
                <option value="Orphan Sponsorship">Orphan Sponsorship</option>
                <option value="Madrasa Scholarship">Madrasa & Quran Student Scholarship</option>
                <option value="Waqf Endowment">Waqf Cash Endowment</option>
                <option value="Kaffarah / Fidyah">Kaffarah / Fidyah Expiation</option>
                <option value="Emergency Relief">Emergency Humanitarian Relief</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Amount (ETB) *
              </label>
              <input
                type="number"
                min="10"
                required
                value={formData.amountETB}
                onChange={(e) => setFormData({ ...formData, amountETB: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Designated Council Fund *
              </label>
              <select
                value={formData.fundId}
                onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                District / Origin Woreda
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <option value="Jimma City (Central)">Jimma City (Central)</option>
                <option value="Jimma City (Hirmata)">Jimma City (Hirmata / Merkato)</option>
                <option value="Gomma District">Gomma District</option>
                <option value="Mana District">Mana District</option>
                <option value="Limmu Kosa">Limmu Kosa</option>
                <option value="Kersa District">Kersa District</option>
                <option value="Seka Chekorsa">Seka Chekorsa</option>
                <option value="Agaro Town">Agaro Town</option>
                <option value="Dedo District">Dedo District</option>
                <option value="Omo Nada">Omo Nada</option>
                <option value="Diaspora (North America)">Diaspora (North America)</option>
                <option value="Diaspora (Middle East)">Diaspora (Middle East / Europe)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Payment Channel
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              >
                <option value="Telebirr">Telebirr Digital</option>
                <option value="CBE Birr">CBE Birr</option>
                <option value="Bank Transfer">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Awash Bank">Awash Bank Transfer</option>
                <option value="Cash">Cash Treasury Voucher</option>
                <option value="International Remittance">International Remittance (Swift/WU)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Transaction / Voucher Ref #
              </label>
              <input
                type="text"
                placeholder="e.g. TB-99824101 or CBE-FT-1092"
                value={formData.transactionRef}
                onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Purpose & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dedicated for rural mosque solar panels or Hifz Quran students..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={<Check className="w-4 h-4" />}>
              Issue Official Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* RECORD ASNAF DISBURSAL MODAL */}
      <Modal
        isOpen={isAddDistModalOpen}
        onClose={() => setIsAddDistModalOpen(false)}
        title="Record Asnaf Zakat Disbursal"
        subtitle="Log verified welfare disbursement to eligible recipient categories."
      >
        <form onSubmit={handleAddDistSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Quranic Asnaf Category *
            </label>
            <select
              value={distFormData.asnafCategory}
              onChange={(e) => setDistFormData({ ...distFormData, asnafCategory: e.target.value as any })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            >
              <option value="Al-Fuqara (The Destitute)">Al-Fuqara (The Destitute / Extreme Poverty)</option>
              <option value="Al-Masakeen (The Needy)">Al-Masakeen (The Low-Income Needy)</option>
              <option value="Amilina Alayha (Zakat Collectors)">Amilina Alayha (Field Collectors & Enumerators)</option>
              <option value="Al-Mu’allafatu Qulubuhum">Al-Mu’allafatu Qulubuhum (New Muslims Welfare)</option>
              <option value="Fir-Riqab (Emergency Freedom)">Fir-Riqab (Humanitarian Relief)</option>
              <option value="Al-Gharimeen (Insolvent Debtors)">Al-Gharimeen (Distressed Debtors)</option>
              <option value="Fi Sabilillah (In Allah’s Cause / Dawah)">Fi Sabilillah (Quran Teachers, Students & Da'wah)</option>
              <option value="Ibnus-Sabeel (Stranded Travellers)">Ibnus-Sabeel (Stranded Travellers / Bus Station)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Beneficiary Households *
              </label>
              <input
                type="number"
                min="1"
                required
                value={distFormData.beneficiaryCount}
                onChange={(e) => setDistFormData({ ...distFormData, beneficiaryCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Total Disbursed (ETB) *
              </label>
              <input
                type="number"
                min="100"
                required
                value={distFormData.totalDisbursedETB}
                onChange={(e) => setDistFormData({ ...distFormData, totalDisbursedETB: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Target Woredas / Districts *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kersa & Dedo Districts"
                value={distFormData.woredaDistrict}
                onChange={(e) => setDistFormData({ ...distFormData, woredaDistrict: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Disbursement Channel
              </label>
              <input
                type="text"
                placeholder="e.g. Direct CBE Birr / Biometric Voucher"
                value={distFormData.distributionChannel}
                onChange={(e) => setDistFormData({ ...distFormData, distributionChannel: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Field Audit Notes & Verification
            </label>
            <textarea
              rows={2}
              value={distFormData.notes}
              onChange={(e) => setDistFormData({ ...distFormData, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddDistModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post to Zakat Ledger
            </Button>
          </div>
        </form>
      </Modal>

      {/* NISAB & ZAKAT CALCULATOR MODAL */}
      <Modal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        title="Shari'ah Zakat & Nisab Calculator"
        subtitle="Jimma Zone Islamic Affairs Supreme Council Official Assessment Engine"
      >
        <div className="space-y-5">
          {/* Calc type tabs */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1">
            <button
              onClick={() => setCalcType('wealth')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                calcType === 'wealth'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Commercial & Wealth Zakat (2.5%)
            </button>
            <button
              onClick={() => setCalcType('agriculture')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                calcType === 'agriculture'
                  ? 'bg-white dark:bg-stone-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Coffee & Agricultural Ushr (5% / 10%)
            </button>
          </div>

          {calcType === 'wealth' ? (
            /* Wealth Calculator */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cash in Hand & Vault (ETB)
                  </label>
                  <input
                    type="number"
                    value={calcCash}
                    onChange={(e) => setCalcCash(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Bank Balances & Savings (ETB)
                  </label>
                  <input
                    type="number"
                    value={calcBank}
                    onChange={(e) => setCalcBank(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Gold & Silver Value (ETB)
                  </label>
                  <input
                    type="number"
                    value={calcGoldValue}
                    onChange={(e) => setCalcGoldValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Commercial Trade Stock / Goods
                  </label>
                  <input
                    type="number"
                    value={calcInventory}
                    onChange={(e) => setCalcInventory(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Less: Immediate Short-Term Debts (ETB)
                </label>
                <input
                  type="number"
                  value={calcDebts}
                  onChange={(e) => setCalcDebts(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-rose-600"
                />
              </div>

              {/* Result box */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-300">
                  <span>Net Zakat Base (Assets - Debts):</span>
                  <span className="font-mono">ETB {netWealthAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-emerald-900 dark:text-emerald-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span>Calculated Zakat Due (2.5%):</span>
                  <span className="text-xl font-mono">ETB {zakatPayableETB.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() =>
                  applyCalculatedZakat(
                    zakatPayableETB,
                    'Zakat ul-Mal',
                    `Zakat ul-Mal assessed on net assets of ETB ${netWealthAssets.toLocaleString()}`
                  )
                }
              >
                Transfer to Contribution Form
              </Button>
            </div>
          ) : (
            /* Agricultural Ushr Calculator */
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Total Seasonal Harvest Value (ETB)
                </label>
                <input
                  type="number"
                  value={calcHarvestYieldETB}
                  onChange={(e) => setCalcHarvestYieldETB(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono font-bold"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Nisab threshold for Coffee / Cereals is 5 Wasqs (~653 kg).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Irrigation Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcIrrigationType('rain')}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      calcIrrigationType === 'rain'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600'
                    }`}
                  >
                    <div className="text-xs">Rain-Fed / Natural (10%)</div>
                    <div className="text-[10px] opacity-80 font-normal">Standard for Jimma Highlands</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCalcIrrigationType('irrigated')}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      calcIrrigationType === 'irrigated'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600'
                    }`}
                  >
                    <div className="text-xs">Artificially Irrigated (5%)</div>
                    <div className="text-[10px] opacity-80 font-normal">Motorized pumps & canal costs</div>
                  </button>
                </div>
              </div>

              {/* Result box */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-300">
                  <span>Applied Ushr Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">{(ushrRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-emerald-900 dark:text-emerald-300 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <span>Agricultural Ushr Due:</span>
                  <span className="text-xl font-mono">ETB {ushrPayableETB.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() =>
                  applyCalculatedZakat(
                    ushrPayableETB,
                    'Coffee Harvest Ushr',
                    `Agricultural Ushr (${(ushrRate * 100).toFixed(0)}%) on harvest yield of ETB ${calcHarvestYieldETB.toLocaleString()}`
                  )
                }
              >
                Transfer to Contribution Form
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* OFFICIAL ZAKAT & SADAQAH CERTIFICATE MODAL */}
      <Modal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        title="Official Shari'ah Contribution Receipt & Certificate"
        subtitle="Jimma Zone Islamic Affairs Supreme Council Treasury Certificate"
      >
        {selectedDonationForCert && (
          <div className="space-y-6">
            <div
              id="printable-zakat-certificate"
              className="p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-emerald-600 shadow-2xl relative overflow-hidden space-y-6"
            >
              <IslamicPattern opacity={0.06} />

              {/* Top Certificate Header */}
              <div className="text-center border-b-2 border-emerald-600/20 pb-5 relative z-10 space-y-2">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-serif font-bold text-lg">
                    ج
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 tracking-wide">
                  JIMMA ZONE ISLAMIC AFFAIRS SUPREME COUNCIL
                </h3>
                <p className="text-[11px] uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold">
                  Majlis Al-Islami Al-A'la Li-Mantaqat Jimma • Treasury & Zakat Board
                </p>
                <div className="font-serif text-emerald-700 dark:text-emerald-300 text-lg sm:text-xl pt-1">
                  بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </div>
              </div>

              {/* Certificate Body */}
              <div className="relative z-10 space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Official Receipt #</span>
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                      {selectedDonationForCert.receiptNo}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Tax Exemption ID</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                      {selectedDonationForCert.taxExemptCode || 'JIC-TAX-2026-001'}
                    </span>
                  </div>
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-stone-500 dark:text-stone-400 text-xs">This certifies that the council has received from:</p>
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {selectedDonationForCert.isAnonymous ? 'ANONYMOUS SERVANT OF ALLAH' : selectedDonationForCert.donorName}
                  </h4>
                  {selectedDonationForCert.district && (
                    <p className="text-xs text-stone-500">Resident / Organization of {selectedDonationForCert.district}</p>
                  )}
                </div>

                {/* Amount Display */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-center space-y-1">
                  <span className="text-[11px] uppercase font-bold text-emerald-900 dark:text-emerald-300">
                    The Sum Of
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    ETB {selectedDonationForCert.amountETB.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    Designated Purpose: {selectedDonationForCert.categoryType || 'General Contribution'} — {selectedDonationForCert.fundName}
                  </p>
                </div>

                {/* Shariah Du'a */}
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-1">
                  <div className="font-serif text-amber-900 dark:text-amber-300 text-base sm:text-lg font-bold">
                    جَزَاكُمُ ٱللَّٰهُ خَيْرًا وَبَارَكَ فِيكُمْ وَفِي أَمْوَالِكُمْ
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 italic">
                    "May Allah reward you with goodness and bless your wealth and your household."
                  </p>
                </div>

                {/* Verification Metadata Footer */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-500">
                  <div>
                    <span className="block font-bold text-stone-400 uppercase">Issue Date</span>
                    <span className="font-mono">{selectedDonationForCert.date}</span>
                    {selectedDonationForCert.hijriDate && <div>{selectedDonationForCert.hijriDate}</div>}
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-stone-400 uppercase">Channel</span>
                    <span className="font-mono">{selectedDonationForCert.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-stone-400 uppercase">Authorized Officer</span>
                    <span className="text-stone-800 dark:text-stone-200">{selectedDonationForCert.collectorName || 'Chief Treasurer'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setIsCertificateModalOpen(false)}>
                Close
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => window.print()}
                >
                  Print Certificate
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    window.print();
                    addToast('Certificate Ready', 'PDF generator initiated.', 'success');
                  }}
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
