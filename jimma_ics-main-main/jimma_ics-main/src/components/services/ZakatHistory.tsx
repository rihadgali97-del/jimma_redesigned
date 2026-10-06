import React, { useState, useMemo } from 'react';
import {
  History,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Download,
  Printer,
  Calendar,
  DollarSign,
  FileText,
  Building,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Trash2,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ZakatCalculationRecord, Donation, User } from '../../types';
import { ZakatCalculationDetailModal } from './ZakatCalculationDetailModal';
import { ZakatReceiptModal } from './ZakatReceiptModal';

interface ZakatHistoryProps {
  onLoadCalculation?: (snapshot: NonNullable<ZakatCalculationRecord['inputSnapshot']>) => void;
  onProceedToPaymentGateway?: (amountETB: number) => void;
  onOpenCalculatorTab?: () => void;
}

export const ZakatHistory: React.FC<ZakatHistoryProps> = ({
  onLoadCalculation,
  onProceedToPaymentGateway,
  onOpenCalculatorTab,
}) => {
  const {
    isLoggedIn,
    currentUser,
    logout,
    zakatCalculations,
    deleteZakatCalculation,
    donations,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'calculations' | 'donations'>('calculations');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Fulfilled / Discharged' | 'Obligation Pending'>('all');

  // Modals state
  const [selectedCalcForDetail, setSelectedCalcForDetail] = useState<ZakatCalculationRecord | null>(null);
  const [selectedDonationForReceipt, setSelectedDonationForReceipt] = useState<Donation | null>(null);

  // Calculations for current user
  const userCalculations = useMemo(() => {
    if (!isLoggedIn) return [];
    return zakatCalculations.filter((calc) => {
      // Show user's records or admin demo records if logged in as admin
      const isMatch =
        calc.userEmail.toLowerCase() === currentUser.email.toLowerCase() ||
        calc.userName.toLowerCase() === currentUser.name.toLowerCase() ||
        (currentUser.role === 'Super Admin' && calc.userEmail.includes('admin@jimma'));
      return isMatch;
    });
  }, [zakatCalculations, currentUser, isLoggedIn]);

  // Filtered calculations
  const filteredCalculations = useMemo(() => {
    return userCalculations.filter((calc) => {
      const matchesSearch =
        calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.hijriYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || calc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userCalculations, searchQuery, statusFilter]);

  // Donations for current user
  const userDonations = useMemo(() => {
    if (!isLoggedIn) return [];
    return donations.filter((d) => {
      const emailMatch = d.email && d.email.toLowerCase() === currentUser.email.toLowerCase();
      const nameMatch = d.donorName && d.donorName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]);
      const isZakatFund = d.fundId === 'fund-4' || d.fundName.toLowerCase().includes('zakat') || d.categoryType?.includes('Zakat');
      return emailMatch || nameMatch || isZakatFund;
    });
  }, [donations, currentUser, isLoggedIn]);

  // KPI calculations
  const totalZakatPaidETB = useMemo(() => {
    return userDonations
      .filter((d) => d.status === 'Completed')
      .reduce((acc, curr) => acc + curr.amountETB, 0);
  }, [userDonations]);

  const pendingObligationsCount = useMemo(() => {
    return userCalculations.filter((c) => c.status === 'Obligation Pending').length;
  }, [userCalculations]);

  // Zakat history is available after a real account sign-in.
  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <Lock className="mx-auto mb-3 h-8 w-8 text-emerald-700" />
        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">Sign in to view your Zakat history</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-stone-600 dark:text-stone-400">Use your council account to access saved assessments, donation records, and receipts.</p>
        <a href="/login" className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Sign in or create account</a>
      </div>
    );
  }
  // LOGGED-IN VIEW
  return (
    <div className="space-y-6">
      {/* Logged-In User Profile Banner & KPIs */}
      <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* User Details */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-600/30 flex items-center justify-center font-serif text-xl font-bold shrink-0 shadow-inner">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  {currentUser.name}
                </h3>
                <Badge variant="success" className="text-[10px] py-0.5 px-2.5">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Verified Donor Profile
                </Badge>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {currentUser.email} {currentUser.phone ? `• ${currentUser.phone}` : ''}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {onOpenCalculatorTab && (
              <Button
                variant="gold"
                size="sm"
                onClick={onOpenCalculatorTab}
                icon={<Calculator className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                + New Assessment
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-3.5 h-3.5" />}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-stone-100 dark:border-stone-800">
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
              Total Zakat Contributed
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 block">
              {totalZakatPaidETB.toLocaleString()} ETB
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block tracking-wider">
              Archived Calculations
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 block">
              {userCalculations.length} Assessments
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 block tracking-wider">
              Audited Receipts
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 block">
              {userDonations.length} Certificates
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">
              Pending Obligations
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-bold font-mono text-amber-800 dark:text-amber-300">
                {pendingObligationsCount}
              </span>
              {pendingObligationsCount === 0 ? (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  (All Discharged)
                </span>
              ) : (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  (Needs Disbursal)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('calculations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'calculations'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Past Calculations & Valuations ({userCalculations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('donations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'donations'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Donation Receipts & Certificates ({userDonations.length})</span>
          </button>
        </div>

        {/* Filter / Search for Calculations */}
        {activeSubTab === 'calculations' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search year or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="Fulfilled / Discharged">Fulfilled / Discharged</option>
              <option value="Obligation Pending">Obligation Pending</option>
            </select>
          </div>
        )}
      </div>

      {/* SUB-TAB 1: CALCULATIONS */}
      {activeSubTab === 'calculations' && (
        <div className="space-y-4">
          {filteredCalculations.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <Calculator className="w-10 h-10 text-stone-400 mx-auto" />
              <h4 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-base">
                No Zakat Calculations Found
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                You have not saved any calculations matching your search. Use the Zakat Calculator to compute
                your assets and save your assessment to your archive.
              </p>
              {onOpenCalculatorTab && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={onOpenCalculatorTab}
                  className="text-xs font-bold mt-2"
                >
                  Go to Calculator Now →
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCalculations.map((calc) => (
                <div
                  key={calc.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 transition-all shadow-sm space-y-4"
                >
                  {/* Top Bar: Title, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                          {calc.title}
                        </h4>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {calc.hijriYear}
                        </span>
                      </div>
                      <span className="text-xs text-stone-400 block">
                        Assessed on {calc.date} • Nisab benchmark: {calc.nisabStandard.toUpperCase()} (
                        {calc.nisabThresholdETB.toLocaleString()} ETB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={calc.status === 'Fulfilled / Discharged' ? 'success' : 'warning'}
                        className="text-xs py-1 px-3"
                      >
                        {calc.status === 'Fulfilled / Discharged' ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        )}
                        {calc.status}
                      </Badge>

                      <button
                        onClick={() => deleteZakatCalculation(calc.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg"
                        title="Delete assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">
                        Gross Assets
                      </span>
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200 text-sm">
                        {calc.totalAssetsETB.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">
                        Liabilities / Deductions
                      </span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                        - {calc.totalLiabilitiesETB.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">
                        Net Zakatable Wealth
                      </span>
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                        {calc.netZakatableWealthETB.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                      <span className="text-amber-800 dark:text-amber-400 block text-[10px] uppercase font-bold">
                        Zakat Obligation Due
                      </span>
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-200 text-base">
                        {calc.totalZakatObligationETB.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Asset Breakdown Pills */}
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      Cash/Bank: {calc.assetBreakdown.cashAndLiquidityETB.toLocaleString()} ETB
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      Gold/Silver: {calc.assetBreakdown.goldAndSilverETB.toLocaleString()} ETB
                    </span>
                    {calc.assetBreakdown.businessStockETB > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                        Trade Stock: {calc.assetBreakdown.businessStockETB.toLocaleString()} ETB
                      </span>
                    )}
                    {calc.assetBreakdown.agricultureUshrETB > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        Harvest Ushr: {calc.assetBreakdown.agricultureUshrETB.toLocaleString()} ETB
                      </span>
                    )}
                    {calc.linkedDonationReceiptNo && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Discharged under #{calc.linkedDonationReceiptNo}
                      </span>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCalcForDetail(calc)}
                      icon={<FileText className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      View Detailed Statement
                    </Button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {calc.inputSnapshot && onLoadCalculation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onLoadCalculation(calc.inputSnapshot!);
                            if (onOpenCalculatorTab) onOpenCalculatorTab();
                          }}
                          icon={<RotateCcw className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          Load into Calculator
                        </Button>
                      )}

                      {calc.status === 'Obligation Pending' && onProceedToPaymentGateway && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => onProceedToPaymentGateway(calc.totalZakatObligationETB)}
                          icon={<ArrowRight className="w-3.5 h-3.5" />}
                          className="text-xs font-bold"
                        >
                          Pay via Gateway ({calc.totalZakatObligationETB.toLocaleString()} ETB)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DONATION RECEIPTS & CERTIFICATES */}
      {activeSubTab === 'donations' && (
        <div className="space-y-4">
          {userDonations.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
              <Award className="w-10 h-10 text-stone-400 mx-auto" />
              <h4 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-base">
                No Donation Receipts Recorded
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                Any Zakat or Sadaqah contributions made through Telebirr, CBE Birr, or Bank Transfer will appear
                here with official downloadable discharge certificates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {userDonations.map((don) => (
                <div
                  key={don.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-emerald-600/60 dark:hover:border-emerald-500/60 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300">
                        {don.receiptNo}
                      </span>
                      <Badge variant="success" className="text-[10px] py-0.5 px-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Discharge Certified
                      </Badge>
                      <span className="text-xs text-stone-400">
                        {don.date} {don.hijriDate ? `(${don.hijriDate})` : ''}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {don.fundName} • {don.categoryType || 'Zakat Contribution'}
                    </h4>

                    <div className="flex flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span>Channel: <strong className="text-stone-700 dark:text-stone-300">{don.paymentMethod}</strong></span>
                      <span>•</span>
                      <span>Donor: <strong className="text-stone-700 dark:text-stone-300">{don.donorName}</strong></span>
                      {don.taxExemptCode && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            {don.taxExemptCode}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0 w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
                      {don.amountETB.toLocaleString()} ETB
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDonationForReceipt(don)}
                      icon={<Award className="w-3.5 h-3.5 text-amber-500" />}
                      className="text-xs font-semibold"
                    >
                      View Certificate & Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ZakatCalculationDetailModal
        isOpen={!!selectedCalcForDetail}
        onClose={() => setSelectedCalcForDetail(null)}
        record={selectedCalcForDetail}
        onLoadIntoCalculator={(rec) => {
          if (rec.inputSnapshot && onLoadCalculation) {
            onLoadCalculation(rec.inputSnapshot);
          }
          if (onOpenCalculatorTab) onOpenCalculatorTab();
        }}
        onProceedToPayment={(amt) => {
          if (onProceedToPaymentGateway) {
            onProceedToPaymentGateway(amt);
          }
        }}
      />

      <ZakatReceiptModal
        isOpen={!!selectedDonationForReceipt}
        onClose={() => setSelectedDonationForReceipt(null)}
        donation={selectedDonationForReceipt}
      />
    </div>
  );
};
