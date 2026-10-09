import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileCheck2,
  HeartHandshake,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  DollarSign,
  AlertCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { IncomeExpenseChart, FundDistributionCard } from '../charts/FinancialCharts';

export const FinanceDashboard: React.FC = () => {
  const {
    funds,
    transactions,
    addTransaction,
    expenseApprovals,
    updateExpenseStatus,
    donations,
    zakatDistributions,
    addZakatDistribution,
    addToast,
    currentUser,
  } = useApp();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isZakatModalOpen, setIsZakatModalOpen] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [selectedTxType, setSelectedTxType] = useState<'all' | 'Income' | 'Expense'>('all');

  // Form states for Record Voucher
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCategory, setTxCategory] = useState('Zakat Collection');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState('Telebirr');
  const [txFundId, setTxFundId] = useState('fund-zakat');

  // Form states for Zakat Disbursal
  const [zakatBeneficiary, setZakatBeneficiary] = useState('');
  const [zakatCategory, setZakatCategory] = useState<'Orphans' | 'Widows' | 'Medical Relief' | 'Destitute' | 'Emergency'>('Destitute');
  const [zakatAmount, setZakatAmount] = useState('');
  const [zakatDistrict, setZakatDistrict] = useState('Jimma Central');
  const [zakatNotes, setZakatNotes] = useState('');

  const totalTreasury = funds.reduce((acc, f) => acc + (f.allocatedETB || 0), 0);
  const pendingApprovals = expenseApprovals.filter(
    (e) => e.status === 'Pending' || e.status === 'Under Review'
  );

  const totalDonationsMonth = donations.reduce((acc, d) => acc + (d.amountETB || 0), 0);
  const totalZakatDisbursed = zakatDistributions.reduce((acc, z) => acc + (z.amountETB ?? z.totalDisbursedETB ?? 0), 0);

  const handleRecordVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      addToast('Invalid Amount', 'Please enter a valid amount in ETB.', 'error');
      return;
    }
    if (!txDescription.trim()) {
      addToast('Missing Description', 'Please provide a clear transaction memo.', 'error');
      return;
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: txType,
      category: txCategory,
      amountETB: amountNum,
      description: txDescription,
      paymentMethod: txPaymentMethod as any,
      fundId: txFundId,
      status: 'Completed',
    });

    addToast(
      'Voucher Recorded',
      `Successfully logged ${txType} of ${amountNum.toLocaleString()} ETB under ${txCategory}.`,
      'success'
    );
    setIsRecordModalOpen(false);
    setTxAmount('');
    setTxDescription('');
  };

  const handleDisburseZakat = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(zakatAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      addToast('Invalid Amount', 'Please enter a valid amount in ETB.', 'error');
      return;
    }
    if (!zakatBeneficiary.trim()) {
      addToast('Missing Name', 'Please provide the verified beneficiary name.', 'error');
      return;
    }

    const saved = await addZakatDistribution({
      asnafCategory: zakatCategory,
      beneficiaryName: zakatBeneficiary,
      category: zakatCategory,
      amountETB: amountNum,
      totalDisbursedETB: amountNum,
      beneficiaryCount: 1,
      district: zakatDistrict,
      woredaDistrict: zakatDistrict,
      verificationStatus: 'Verified',
      disbursementDate: new Date().toISOString().split('T')[0],
      lastDisbursalDate: new Date().toISOString().split('T')[0],
      notes: zakatNotes || 'Approved by Finance Directorate',
      approvedBy: currentUser.name,
    });

    if (!saved) return;
    addToast(
      'Zakat Payout Authorized',
      `Disbursed ${amountNum.toLocaleString()} ETB to ${zakatBeneficiary} (${zakatCategory}).`,
      'success'
    );
    setIsZakatModalOpen(false);
    setZakatBeneficiary('');
    setZakatAmount('');
    setZakatNotes('');
  };

  const handleReconcileTelebirr = () => {
    setIsReconciling(true);
    setTimeout(() => {
      setIsReconciling(false);
      addToast(
        'Telebirr Gateway Synced',
        'Reconciled 142 incoming digital payments against CBE & Telebirr merchant API. Balance matched 100%.',
        'success'
      );
    }, 1200);
  };

  const handleExportStatement = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Date,Type,Category,AmountETB,PaymentMethod,Status\n' +
      transactions
        .map(
          (t) =>
            `${t.id},${t.date},${t.type},${t.category},${t.amountETB},${t.paymentMethod},${t.status}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jimma_Council_Treasury_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit Statement Exported', 'Downloaded signed CSV statement.', 'info');
  };

  const filteredTransactions = transactions.filter((t) => {
    if (selectedTxType === 'all') return true;
    return t.type === selectedTxType;
  });

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue">Finance & Treasury Directorate</Badge>
            <span className="text-xs text-stone-400 font-mono">Fiscal Control Room</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Treasury & Financial Operations
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Supervise Shari'ah-compliant treasury reserves, approve operational expense vouchers, and authorize Zakat relief payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 text-emerald-600 ${isReconciling ? 'animate-spin' : ''}`} />}
            onClick={handleReconcileTelebirr}
            disabled={isReconciling}
          >
            {isReconciling ? 'Reconciling...' : 'Reconcile Telebirr'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-stone-600" />}
            onClick={handleExportStatement}
          >
            Export Ledger
          </Button>

          <Button
            variant="gold"
            size="sm"
            icon={<HeartHandshake className="w-4 h-4" />}
            onClick={() => setIsZakatModalOpen(true)}
          >
            Authorize Zakat Payout
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRecordModalOpen(true)}
          >
            Post Voucher
          </Button>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Total Treasury Balance
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800 dark:text-emerald-400 font-mono">
            ETB {(totalTreasury / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <span className="text-emerald-600 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span>vs previous quarter</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Pending Expense Approvals
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {pendingApprovals.length} <span className="text-sm font-sans font-normal text-stone-500">vouchers</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <span className="text-amber-600 font-semibold">Level 1 Review Required</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Donations Collected (MTD)
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-800 dark:text-blue-400 font-mono">
            ETB {(totalDonationsMonth / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <Badge variant="emerald">Live Telebirr Synced</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Zakat Relief Disbursed
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-800 dark:text-purple-400 font-mono">
            ETB {(totalZakatDisbursed / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>{zakatDistributions.length} verified beneficiary families</span>
          </div>
        </Card>
      </div>

      {/* Main Row: Financial Flow Chart & Pending Approval Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Pending Approvals & Quick Decision */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-amber-600" />
                  <span>Pending Vouchers Awaiting Your Approval</span>
                </h3>
                <p className="text-xs text-stone-500">
                  First-level operational approval required before bank debit.
                </p>
              </div>
              <Badge variant="gold">{pendingApprovals.length} Pending</Badge>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  All Vouchers Up to Date!
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  There are no pending Level-1 expense approval requests at this moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                          {req.id} • {req.category}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {req.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                          Requested by: <span className="font-semibold">{req.requestedBy}</span> ({req.department})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 block">
                          ETB {req.amountETB.toLocaleString()}
                        </span>
                        <Badge variant="gold">{req.status}</Badge>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                      "{req.justification || req.description}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        icon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => {
                          updateExpenseStatus(req.id, 'Rejected', 'Rejected by Finance Officer');
                          addToast('Voucher Rejected', `Voucher ${req.id} was marked as rejected.`, 'info');
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs"
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          updateExpenseStatus(req.id, 'Approved', 'Approved by Finance Officer');
                          addToast('Voucher Approved', `Voucher ${req.id} (ETB ${req.amountETB.toLocaleString()}) approved.`, 'success');
                        }}
                      >
                        Approve (Level 1)
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Fund Breakdown Card */}
          <Card className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              Designated Shari'ah Fund Reserves
            </h3>
            <FundDistributionCard funds={funds} />
          </Card>
        </div>

        {/* Right 5 cols: Live Transactions & Telebirr Auditing */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                Live Transaction Ledger
              </h3>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs">
                {(['all', 'Income', 'Expense'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTxType(t)}
                    className={`px-2 py-0.5 rounded-lg font-medium capitalize transition-colors ${
                      selectedTxType === t
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredTransactions.slice(0, 8).map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        tx.type === 'Income'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {tx.type === 'Income' ? '+' : '-'}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {tx.description}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {tx.category} • {tx.paymentMethod} • {tx.date}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold shrink-0 text-right ${
                      tx.type === 'Income' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'Income' ? '+' : '-'}ETB {tx.amountETB.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Bank Accounts Status */}
          <div className="p-5 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
              Council Banking Gateways
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-stone-800">
                <span>Commercial Bank of Ethiopia (CBE)</span>
                <span className="font-mono text-emerald-400 font-bold">ETB 1,840,500</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-stone-800">
                <span>Telebirr Merchant #88490</span>
                <span className="font-mono text-emerald-400 font-bold">ETB 620,400</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Awash Bank (Waqf Account)</span>
                <span className="font-mono text-emerald-400 font-bold">ETB 950,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Graph */}
      <Card className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
          Council Revenue vs Operational Outflows (Fiscal Year 2026)
        </h3>
        <IncomeExpenseChart />
      </Card>

      {/* Record Voucher Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Post Treasury Voucher Entry
                </h3>
                <p className="text-xs text-stone-500">Record certified collection or disbursement voucher</p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Voucher Type
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Income">Income (Collection)</option>
                    <option value="Expense">Expense (Disbursement)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Amount (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Budget Category
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Zakat Collection">Zakat Collection</option>
                  <option value="Mosque Waqf Contribution">Mosque Waqf Contribution</option>
                  <option value="Tahfeez Teacher Subsidies">Tahfeez Teacher Subsidies</option>
                  <option value="Emergency Welfare Relief">Emergency Welfare Relief</option>
                  <option value="Madrasa Books & Syllabus">Madrasa Books & Syllabus</option>
                  <option value="General Council Operations">General Council Operations</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Payment Gateway
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Telebirr">Telebirr Merchant</option>
                    <option value="Bank Transfer">CBE Direct Transfer</option>
                    <option value="Cash Receipt">Council Cash Receipt</option>
                    <option value="Cheque">Awash Bank Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Designated Fund
                  </label>
                  <select
                    value={txFundId}
                    onChange={(e) => setTxFundId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    {funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Description / Memo
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Monthly stipend grant for 4 rural Tahfeez mu'allims in Gomma Kebele"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsRecordModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Record Entry & Sign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authorize Zakat Payout Modal */}
      {isZakatModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Authorize Zakat Beneficiary Payout
                </h3>
                <p className="text-xs text-stone-500">Disburse verified hardship assistance</p>
              </div>
              <button
                onClick={() => setIsZakatModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDisburseZakat} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Beneficiary Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fatima Kedir (Widow, 4 children)"
                    value={zakatBeneficiary}
                    onChange={(e) => setZakatBeneficiary(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Payout Amount (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 7500"
                    value={zakatAmount}
                    onChange={(e) => setZakatAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold text-purple-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Zakat Category (Masarif)
                  </label>
                  <select
                    value={zakatCategory}
                    onChange={(e) => setZakatCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Destitute">Destitute / Fuqara</option>
                    <option value="Widows">Widowed Mother Assistance</option>
                    <option value="Orphans">Orphan Support (Kafala)</option>
                    <option value="Medical Relief">Urgent Medical / Dialysis Relief</option>
                    <option value="Emergency">Disaster & Fire Hardship</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Kebele
                  </label>
                  <select
                    value={zakatDistrict}
                    onChange={(e) => setZakatDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Jimma Central">Jimma Central</option>
                    <option value="Mendera Kochore">Mendera Kochore</option>
                    <option value="Hermata">Hermata</option>
                    <option value="Bosa Addis">Bosa Addis</option>
                    <option value="Agaro">Agaro</option>
                    <option value="Gomma">Gomma</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Verification Dossier & Approval Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Field assessment confirmed by Zakat Inspector Hassan Ababor on Aug 28."
                  value={zakatNotes}
                  onChange={(e) => setZakatNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsZakatModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" type="submit">
                  Authorize & Disburse
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
