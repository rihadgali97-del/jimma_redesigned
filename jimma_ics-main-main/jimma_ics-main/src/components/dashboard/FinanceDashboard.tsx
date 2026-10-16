import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { KEBELE_NAMES } from '../../constants/kebeles';
import {
  FileCheck2,
  HeartHandshake,
  Download,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FundDistributionCard } from '../charts/FinancialCharts';

export const FinanceDashboard: React.FC = () => {
  const {
    funds,
    transactions,
    expenseApprovals,
    updateExpenseStatus,
    addZakatDistribution,
    addToast,
    currentUser,
  } = useApp();

  const [isZakatModalOpen, setIsZakatModalOpen] = useState(false);
  const [selectedTxType, setSelectedTxType] = useState<'all' | 'Income' | 'Expense'>('all');

  // Form states for Zakat Disbursal
  const [zakatBeneficiary, setZakatBeneficiary] = useState('');
  const [zakatCategory, setZakatCategory] = useState<'Orphans' | 'Widows' | 'Medical Relief' | 'Destitute' | 'Emergency'>('Destitute');
  const [zakatAmount, setZakatAmount] = useState('');
  const [zakatDistrict, setZakatDistrict] = useState('');
  const [zakatNotes, setZakatNotes] = useState('');

  const pendingApprovals = expenseApprovals.filter(
    (e) => e.status === 'Pending Review'
  );

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
      notes: zakatNotes,
      approvedBy: currentUser.name,
    });

    if (!saved) return;
    addToast(
      'Zakat distribution record saved',
      'This records the reported distribution; the application does not transfer funds.',
      'info'
    );
    setIsZakatModalOpen(false);
    setZakatBeneficiary('');
    setZakatAmount('');
    setZakatNotes('');
  };

  const handleExportStatement = () => {
    if (transactions.length === 0) {
      addToast('No ledger records', 'There are no transaction records available to export.', 'info');
      return;
    }
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
    addToast('Ledger Exported', 'Downloaded the transaction records currently available in this session.', 'info');
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
            Record Zakat Distribution
          </Button>

        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900 dark:bg-amber-950/20">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">Financial records are not fully connected</h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
          Live treasury balances, general-ledger transactions, expense approvals, and payment-gateway reconciliation are not available from the backend. No sample balances or trends are shown.
        </p>
        <Link to="/admin/finance/donations" className="mt-3 inline-flex text-sm font-semibold text-emerald-800 hover:underline dark:text-emerald-300">
          View saved donation records
        </Link>
      </Card>

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
              <Badge variant="gold">Not connected</Badge>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-200 dark:border-stone-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Approval records are unavailable
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  The backend does not currently store expense approval requests.
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
                          Requested by: <span className="font-semibold">{req.requestedBy}</span> ({req.role})
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
                          updateExpenseStatus(req.id, 'Finance Approved', 'Approved by Finance Officer');
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
              {filteredTransactions.length === 0 ? (
                <p className="rounded-xl bg-stone-50 p-4 text-center text-sm text-stone-500 dark:bg-stone-800">
                  No saved general-ledger transactions are available.
                </p>
              ) : filteredTransactions.slice(0, 8).map((tx) => (
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

        </div>
      </div>

      {/* Authorize Zakat Payout Modal */}
      {isZakatModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Record Zakat Distribution
                </h3>
                <p className="text-xs text-stone-500">Save a record of an actual distribution. No payment is processed here.</p>
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
                    required
                    value={zakatDistrict}
                    onChange={(e) => setZakatDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="">Select area</option>
                    {KEBELE_NAMES.map((kebele) => <option key={kebele} value={kebele}>{kebele}</option>)}
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
                  Save Distribution Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
