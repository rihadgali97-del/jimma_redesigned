import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KEBELE_NAMES } from '../../constants/kebeles';
import {
  HeartHandshake,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  AlertTriangle,
  FileCheck2,
  Home,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const ZakatWelfareDashboard: React.FC = () => {
  const {
    zakatDistributions,
    addZakatDistribution,
    funds,
    currentUser,
    addToast,
  } = useApp();

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [assessedName, setAssessedName] = useState('');
  const [assessedCategory, setAssessedCategory] = useState<'Destitute' | 'Widows' | 'Orphans' | 'Medical Relief' | 'Emergency'>('Destitute');
  const [assessedDistrict, setAssessedDistrict] = useState('');
  const [assessedDependents, setAssessedDependents] = useState('');
  const [assessedIncome, setAssessedIncome] = useState('');
  const [assessedAmount, setAssessedAmount] = useState('');
  const [assessedNotes, setAssessedNotes] = useState('');

  const [emergBeneficiary, setEmergBeneficiary] = useState('');
  const [emergAmount, setEmergAmount] = useState('');
  const [emergCategory, setEmergCategory] = useState<'Medical Relief' | 'Emergency' | 'Destitute'>('Emergency');
  const [emergDistrict, setEmergDistrict] = useState('');
  const [emergReason, setEmergReason] = useState('');

  const totalZakatFund = funds.find((fund) => fund.name.toLowerCase().includes('zakat'))?.allocatedETB;
  const totalDisbursedETB = zakatDistributions.reduce(
    (acc, z) => acc + (z.amountETB ?? z.totalDisbursedETB ?? 0),
    0
  );
  const totalBeneficiaries = zakatDistributions.reduce(
    (total, distribution) => total + (distribution.beneficiaryCount ?? 0),
    0
  );
  const orphanBeneficiaries = zakatDistributions
    .filter((distribution) => /orphan/i.test(`${distribution.category} ${distribution.asnafCategory}`))
    .reduce((total, distribution) => total + (distribution.beneficiaryCount ?? 0), 0);

  const filteredDistributions = zakatDistributions.filter((item) => {
    const q = (searchQuery || '').toLowerCase();
    const name = (item.beneficiaryName || item.asnafCategory || '').toLowerCase();
    const district = (item.district || item.woredaDistrict || '').toLowerCase();
    const matchesSearch = name.includes(q) || district.includes(q);
    const cat = (item.category || item.asnafCategory || '').toLowerCase();
    const matchesCat =
      filterCategory === 'all' ||
      cat.includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(assessedAmount);
    if (!assessedName.trim() || !assessedDistrict || !(amount > 0)) {
      addToast('Required details missing', 'Enter a beneficiary, area, and actual distribution amount.', 'warning');
      return;
    }

    const saved = await addZakatDistribution({
      asnafCategory: assessedCategory,
      beneficiaryName: assessedName,
      category: assessedCategory,
      amountETB: amount,
      totalDisbursedETB: amount,
      beneficiaryCount: 1,
      district: assessedDistrict,
      woredaDistrict: assessedDistrict,
      verificationStatus: 'Verified',
      disbursementDate: new Date().toISOString().split('T')[0],
      lastDisbursalDate: new Date().toISOString().split('T')[0],
      notes: [
        assessedDependents ? `Dependents: ${assessedDependents}` : '',
        assessedIncome ? `Monthly income (ETB): ${assessedIncome}` : '',
        assessedNotes.trim(),
      ].filter(Boolean).join('. '),
      approvedBy: currentUser.name,
      leadOfficer: currentUser.name,
    });

    if (!saved) return;
    addToast(
      'Distribution record saved',
      'This records the reported distribution; the application does not transfer funds.',
      'info'
    );
    setIsAssessmentModalOpen(false);
    setAssessedName('');
    setAssessedDistrict('');
    setAssessedNotes('');
    setAssessedAmount('');
    setAssessedDependents('');
    setAssessedIncome('');
  };

  const handleEmergencyDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(emergAmount);
    if (!amountNum || isNaN(amountNum) || !emergBeneficiary.trim() || !emergDistrict || !emergReason.trim()) {
      addToast('Required details missing', 'Enter the beneficiary, area, actual amount, and reason.', 'warning');
      return;
    }

    const saved = await addZakatDistribution({
      asnafCategory: 'Al-Fuqara (The Destitute)',
      beneficiaryName: emergBeneficiary,
      category: emergCategory as any,
      amountETB: amountNum,
      totalDisbursedETB: amountNum,
      beneficiaryCount: 1,
      district: emergDistrict,
      woredaDistrict: emergDistrict,
      verificationStatus: 'Disbursed',
      disbursementDate: new Date().toISOString().split('T')[0],
      lastDisbursalDate: new Date().toISOString().split('T')[0],
      notes: emergReason,
      approvedBy: currentUser.name,
      leadOfficer: currentUser.name,
    });

    if (!saved) return;
    addToast(
      'Distribution record saved',
      'This records the reported distribution; the application does not transfer funds.',
      'info'
    );
    setIsEmergencyModalOpen(false);
    setEmergBeneficiary('');
    setEmergAmount('');
    setEmergDistrict('');
    setEmergReason('');
  };

  const handleExportWelfare = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Beneficiary,Category,AmountETB,Kebele,Status,Date\n' +
      zakatDistributions
        .map(
          (z) =>
            `${z.id},"${z.beneficiaryName || z.asnafCategory}","${z.category || z.asnafCategory}",${z.amountETB ?? z.totalDisbursedETB ?? 0},"${z.district || z.woredaDistrict || 'Area not recorded'}","${z.verificationStatus || 'Status unavailable'}","${z.disbursementDate || z.lastDisbursalDate || ''}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zakat_Beneficiaries_Jimma_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Welfare Roster Exported', 'Downloaded signed beneficiary CSV report.', 'info');
  };

  return (
    <div className="space-y-8">
      {/* Role Action Quick Bar */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple">Social Services & Zakat Directorate</Badge>
            <span className="text-xs text-stone-400 font-mono">Poverty Relief Bureau</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Zakat & Social Welfare Operations
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Review recorded Zakat distributions. Fund balances and payment transfers are not managed by this application.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-stone-600" />}
            onClick={handleExportWelfare}
          >
            Export Roster
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<ShieldCheck className="w-4 h-4 text-purple-600" />}
            onClick={() => setIsEmergencyModalOpen(true)}
          >
            Record Emergency Distribution
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Home className="w-4 h-4" />}
            onClick={() => setIsAssessmentModalOpen(true)}
          >
            Record Welfare Distribution
          </Button>
        </div>
      </div>

      {/* 4 Core Welfare Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Zakat Reserve Balance
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-800 dark:text-purple-400 font-mono">
            {totalZakatFund === undefined ? 'Not configured' : `ETB ${(totalZakatFund / 1000).toFixed(0)}k`}
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Fund balance data is unavailable</span>
            <Badge variant="gold">Unavailable</Badge>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Verified Beneficiaries
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
            {totalBeneficiaries.toLocaleString()} <span className="text-sm font-sans font-normal text-stone-500">recorded</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>{zakatDistributions.length} recorded distributions</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Recorded Distributions
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-blue-800 dark:text-blue-400 font-mono">
            ETB {(totalDisbursedETB / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>Payment transfers are not processed here</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Orphan Sponsorships
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-700 dark:text-amber-400 font-mono">
            {orphanBeneficiaries.toLocaleString()} <span className="text-sm font-sans font-normal text-stone-500">recorded</span>
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
            <span>From saved distribution records</span>
          </div>
        </Card>
      </div>

      {/* Main Beneficiary Queue & Inspection Ledger */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-600" />
              <span>Verified Beneficiary Case Queue</span>
            </h3>
            <p className="text-xs text-stone-500">
              Track assessed households, relief categories, and payment verification records.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search beneficiary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
            >
              <option value="all">All Categories</option>
              <option value="Destitute">Destitute</option>
              <option value="Widows">Widows</option>
              <option value="Orphans">Orphans</option>
              <option value="Medical Relief">Medical Relief</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredDistributions.map((dist) => {
            const distAmount = dist.amountETB ?? dist.totalDisbursedETB ?? 0;
            const distBeneficiary =
              dist.beneficiaryName ||
              `${dist.beneficiaryCount ? `${dist.beneficiaryCount} Registered Families` : 'Beneficiary Household'} (${dist.asnafCategory || 'Asnaf'})`;
            const distDistrict = dist.district || dist.woredaDistrict || 'Area not recorded';
            const distCategory = dist.category || dist.asnafCategory || 'Masarif';
            const distDate = dist.disbursementDate || dist.lastDisbursalDate || 'Date not recorded';
            const distStatus = dist.verificationStatus || 'Status unavailable';

            return (
              <div
                key={dist.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                      {dist.id} • {distDistrict}
                    </span>
                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      {distBeneficiary}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="purple">{distCategory}</Badge>
                      <span className="text-xs text-stone-400">
                        Disbursed: {distDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-purple-800 dark:text-purple-400 block">
                      ETB {distAmount.toLocaleString()}
                    </span>
                    <Badge variant={distStatus === 'Disbursed' ? 'emerald' : 'gold'}>
                      {distStatus}
                    </Badge>
                  </div>
                </div>

                {dist.notes && (
                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800">
                    "{dist.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700">
                  <span>
                    Inspected & Authorized by:{' '}
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {dist.approvedBy || dist.leadOfficer || currentUser.name}
                    </span>
                  </span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Recorded distribution
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Field Assessment Modal */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Record Beneficiary Distribution
                </h3>
                <p className="text-stone-500">Enter details from an actual distribution record</p>
              </div>
              <button
                onClick={() => setIsAssessmentModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAssessment} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Head of Household Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Halima Kedir"
                  value={assessedName}
                  onChange={(e) => setAssessedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Masarif Category
                  </label>
                  <select
                    value={assessedCategory}
                    onChange={(e) => setAssessedCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Destitute">Destitute / Fuqara</option>
                    <option value="Widows">Widowed Mother</option>
                    <option value="Orphans">Orphan Family</option>
                    <option value="Medical Relief">Medical Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Kebele
                  </label>
                  <select
                    value={assessedDistrict}
                    onChange={(e) => setAssessedDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="">Select area</option>
                    {KEBELE_NAMES.map((kebele) => <option key={kebele} value={kebele}>{kebele}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Actual Distribution Amount (ETB)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={assessedAmount}
                  onChange={(e) => setAssessedAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={assessedDependents}
                    onChange={(e) => setAssessedDependents(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Estimated Monthly Income (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    value={assessedIncome}
                    onChange={(e) => setAssessedIncome(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Living Condition & Inspector Observations
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe housing condition, access to food/water, medical emergencies..."
                  value={assessedNotes}
                  onChange={(e) => setAssessedNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsAssessmentModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Distribution Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Disbursal Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Record Emergency Distribution
                </h3>
                <p className="text-stone-500">Enter an actual distribution record; no payment is processed here.</p>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEmergencyDisburse} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Beneficiary Full Name
                </label>
                <input
                  type="text"
                  required
                  value={emergBeneficiary}
                  onChange={(e) => setEmergBeneficiary(e.target.value)}
                  placeholder="e.g. Abdu Seid (Fire victim, Mendera)"
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Distribution Amount (ETB)
                  </label>
                  <input
                    type="number"
                    required
                    value={emergAmount}
                    onChange={(e) => setEmergAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold text-purple-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={emergCategory}
                    onChange={(e) => setEmergCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Emergency">Emergency Hardship</option>
                    <option value="Medical Relief">Medical Surgery / Dialysis</option>
                    <option value="Destitute">Immediate Food Relief</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Kebele
                </label>
                <select
                  required
                  value={emergDistrict}
                  onChange={(e) => setEmergDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="">Select area</option>
                  {KEBELE_NAMES.map((kebele) => <option key={kebele} value={kebele}>{kebele}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Reason & Hospital / Incident Reference
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Enter the actual reason or incident reference"
                  value={emergReason}
                  onChange={(e) => setEmergReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsEmergencyModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="purple" size="sm" type="submit">
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
