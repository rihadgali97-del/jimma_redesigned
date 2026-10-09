import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Download,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Eye,
  Key,
  Database,
  Building,
  Sparkles,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Clock,
  Printer,
  FileText,
  HelpCircle,
  Hash,
  Scale,
  Landmark,
  ShieldAlert,
  Fingerprint,
  Check,
  X,
  Send,
  Plus,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuditDirective, AuditChecklistItem, CompliancePillar, AuditSeverity, AuditCategory, StaffDepartment } from '../../types';
import {
  archiveAuditDirective,
  AuditIntegritySnapshot,
  createAuditDirective,
  createIntegritySnapshot,
  fetchAuditDirectives,
  fetchChecklistStatus,
  fetchComplianceAuditTrail,
  updateChecklistStatus,
  updateAuditDirective as updateAuditDirectiveApi,
} from '../../services/auditComplianceApi';

export const AuditorDashboard: React.FC = () => {
  const {
    transactions,
    expenseApprovals,
    funds,
    donations,
    zakatDistributions,
    auditChecklist: defaultAuditChecklist,
    ledgerBlocks,
    addToast,
    currentUser,
  } = useApp();
  const [auditDirectives, setAuditDirectives] = useState<AuditDirective[]>([]);
  const [auditChecklist, setAuditChecklist] = useState<AuditChecklistItem[]>(() => defaultAuditChecklist.map((item) => ({
    ...item,
    status: 'Pending Review',
    evidenceNote: undefined,
    verifiedBy: '',
    lastVerified: 'Not reviewed',
  })));
  const [auditTrail, setAuditTrail] = useState<Awaited<ReturnType<typeof fetchComplianceAuditTrail>>>([]);
  const [auditDataLoading, setAuditDataLoading] = useState(true);
  const [auditDataError, setAuditDataError] = useState('');
  const [auditReloadKey, setAuditReloadKey] = useState(0);
  const [integritySnapshot, setIntegritySnapshot] = useState<AuditIntegritySnapshot | null>(null);

  useEffect(() => {
    let mounted = true;
    setAuditDataLoading(true);
    setAuditDataError('');
    Promise.all([fetchAuditDirectives(), fetchChecklistStatus(), fetchComplianceAuditTrail()])
      .then(([directives, checklistUpdates, trail]) => {
        if (!mounted) return;
        setAuditDirectives(directives);
        const updates = new Map(checklistUpdates.map((item) => [item.itemId, item]));
        setAuditChecklist(defaultAuditChecklist.map((item) => {
          const update = updates.get(item.id);
          return {
            ...item,
            status: update?.status || 'Pending Review',
            evidenceNote: update?.evidenceNote || undefined,
            verifiedBy: update?.verifiedBy || '',
            lastVerified: update?.lastVerified || 'Not reviewed',
          };
        }));
        setAuditTrail(trail);
        const snapshotEvent = trail.find((event) => event.entityType === 'audit_integrity_scan');
        if (snapshotEvent?.after && typeof snapshotEvent.after === 'object' && !Array.isArray(snapshotEvent.after)) {
          setIntegritySnapshot(snapshotEvent.after as AuditIntegritySnapshot);
        }
      })
      .catch((error: unknown) => {
        if (mounted) setAuditDataError(error instanceof Error ? error.message : 'Could not load audit data.');
      })
      .finally(() => {
        if (mounted) setAuditDataLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [defaultAuditChecklist, auditReloadKey]);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'directives' | 'ledger' | 'checklist' | 'vouchers' | 'security' | 'certificate'
  >('overview');

  // Reconciliation state
  const [isVerifying, setIsVerifying] = useState(false);
  const [reconciliationResult, setReconciliationResult] = useState<AuditIntegritySnapshot | null>(null);

  // Modals
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedDirective, setSelectedDirective] = useState<AuditDirective | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState('');

  // Voucher inspector
  const [selectedVoucherId, setSelectedVoucherId] = useState<string>(expenseApprovals[0]?.id || 'EXP-001');
  const [stampedVouchers, setStampedVouchers] = useState<Record<string, 'Passed' | 'Flagged'>>({});

  // Directives filtering
  const [directiveCategoryFilter, setDirectiveCategoryFilter] = useState<string>('all');
  const [directiveStatusFilter, setDirectiveStatusFilter] = useState<string>('all');
  const [directiveSearch, setDirectiveSearch] = useState('');

  // Checklist filtering
  const [checklistPillarFilter, setChecklistPillarFilter] = useState<string>('all');

  // Security logs filtering
  const [logFilter, setLogFilter] = useState<'all' | 'Finance_Security' | 'Role_Change' | 'Auth' | 'Compliance'>('all');
  const [searchLog, setSearchLog] = useState('');

  // New Directive Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AuditCategory>('Procurement_VAT');
  const [newSeverity, setNewSeverity] = useState<AuditSeverity>('High');
  const [newDepartment, setNewDepartment] = useState<StaffDepartment>('Finance & Endowment');
  const [newTargetEntity, setNewTargetEntity] = useState('');
  const [newFindings, setNewFindings] = useState('');
  const [newRequiredAction, setNewRequiredAction] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-09-30');
  const [newAmountETB, setNewAmountETB] = useState<number | ''>('');
  const [newVoucherId, setNewVoucherId] = useState('');

  // Handle run deep reconciliation
  const handleRunVerification = async () => {
    setIsVerifying(true);
    try {
      const res = await createIntegritySnapshot();
      setReconciliationResult(res);
      addToast(
        'Data integrity snapshot created',
        `${res.checkedRecords.toLocaleString()} records included in the SHA-256 snapshot.`,
        'success'
      );
      setAuditReloadKey((key) => key + 1);
    } catch (error) {
      addToast('Integrity scan failed', error instanceof Error ? error.message : 'Could not create the snapshot.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle create new directive
  const handleCreateDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTargetEntity || !newFindings) {
      addToast('Missing Fields', 'Please complete all required fields.', 'warning');
      return;
    }

    try {
      const created = await createAuditDirective({
        title: newTitle,
        category: newCategory,
        severity: newSeverity,
        status: 'Open',
        targetEntity: newTargetEntity,
        department: newDepartment,
        findings: newFindings,
        requiredAction: newRequiredAction || 'Directorate response required within statutory timeline.',
        assignedAuditor: currentUser.name,
        dueDate: newDueDate,
        amountETB: newAmountETB ? Number(newAmountETB) : undefined,
        voucherId: newVoucherId || undefined,
      });
      setAuditDirectives((records) => [created, ...records]);
      setAuditReloadKey((key) => key + 1);
      setIsFlagModalOpen(false);
      setNewTitle('');
      setNewTargetEntity('');
      setNewFindings('');
      setNewRequiredAction('');
      setNewAmountETB('');
      setNewVoucherId('');
      addToast('Audit directive created', `${created.id} has been saved.`, 'success');
    } catch (error) {
      addToast('Could not create directive', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  // Handle resolve directive
  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirective) return;
    try {
      const updated = await updateAuditDirectiveApi(selectedDirective.id, {
        status: 'Resolved',
        resolutionNote: resolveNote || 'Auditor confirmed full compliance and documentation clearance.',
      });
      setAuditDirectives((records) => records.map((directive) => directive.id === updated.id ? updated : directive));
      setAuditReloadKey((key) => key + 1);
      setIsResolveModalOpen(false);
      setSelectedDirective(null);
      setResolveNote('');
      addToast('Audit directive resolved', `${updated.id} was updated.`, 'success');
    } catch (error) {
      addToast('Could not resolve directive', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  const changeDirectiveStatus = async (directive: AuditDirective, status: AuditDirective['status']) => {
    try {
      const updated = await updateAuditDirectiveApi(directive.id, { status });
      setAuditDirectives((records) => records.map((item) => item.id === updated.id ? updated : item));
      setAuditReloadKey((key) => key + 1);
      addToast('Directive status updated', `${updated.id}: ${status}.`, 'success');
    } catch (error) {
      addToast('Could not update directive', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  const removeDirective = async (directive: AuditDirective) => {
    if (!window.confirm(`Archive audit directive ${directive.id}? The audit history will be retained.`)) return;
    try {
      await archiveAuditDirective(directive.id);
      setAuditDirectives((records) => records.filter((item) => item.id !== directive.id));
      setAuditReloadKey((key) => key + 1);
      addToast('Directive archived', `${directive.id} remains in the audit history.`, 'success');
    } catch (error) {
      addToast('Could not archive directive', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  const changeChecklistStatus = async (item: AuditChecklistItem, status: AuditChecklistItem['status'], evidenceNote: string) => {
    try {
      const update = await updateChecklistStatus(item.id, {
        status,
        evidenceNote,
        verifiedBy: currentUser.name,
      });
      setAuditChecklist((items) => items.map((entry) => entry.id === item.id
        ? { ...entry, status: update.status, evidenceNote: update.evidenceNote, verifiedBy: update.verifiedBy, lastVerified: update.lastVerified }
        : entry));
      setAuditReloadKey((key) => key + 1);
      addToast('Compliance checklist saved', `${item.id} is now ${status}.`, 'success');
    } catch (error) {
      addToast('Could not save checklist status', error instanceof Error ? error.message : 'Please try again.', 'error');
    }
  };

  // Export only records currently available from the server.
  const handleExportSealedAudit = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity', 'Entity ID', 'IP Address'];
    const rows = auditTrail.map((event) => [
      event.id,
      event.createdAt,
      event.actor?.fullName || 'System',
      event.actor?.role.name || '',
      event.action,
      event.entityType,
      event.entityId ?? '',
      event.ipAddress || 'Not recorded',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jimma_Council_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Audit trail exported', `Exported ${auditTrail.length} persisted events.`, 'success');
  };

  // Filtered Directives
  const filteredDirectives = (auditDirectives || []).filter((d) => {
    const matchesCategory = directiveCategoryFilter === 'all' || d.category === directiveCategoryFilter;
    const matchesStatus = directiveStatusFilter === 'all' || d.status === directiveStatusFilter;
    const s = (directiveSearch || '').toLowerCase();
    const matchesSearch =
      (d.title || '').toLowerCase().includes(s) ||
      (d.targetEntity || '').toLowerCase().includes(s) ||
      (d.findings || '').toLowerCase().includes(s) ||
      (d.id || '').toLowerCase().includes(s);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Filtered Checklist
  const filteredChecklist = (auditChecklist || []).filter((c) => {
    return checklistPillarFilter === 'all' || c.pillar === checklistPillarFilter;
  });

  // Filtered Security Logs
  const filteredLogs = auditTrail.map((event) => {
    const category = event.entityType === 'auth' || event.entityType === 'session'
      ? 'Auth'
      : event.entityType === 'role' || event.action.toLowerCase().includes('role')
        ? 'Role_Change'
        : event.entityType.startsWith('audit_') || event.entityType === 'compliance_checklist'
          ? 'Compliance'
          : 'Finance_Security';
    const after = event.after && typeof event.after === 'object' && !Array.isArray(event.after)
      ? event.after as Record<string, unknown>
      : null;
    const summary = after?.title || after?.itemId || after?.referenceNumber || after?.status || '';
    return {
      id: String(event.id),
      category,
      status: /fail|block|reject/i.test(event.action) ? 'Blocked' : /delete|archive|escalat/i.test(event.action) ? 'Warning' : 'Success',
      action: event.action,
      target: `${event.entityType}${event.entityId ? ` #${event.entityId}` : ''}`,
      details: `${event.action} ${event.entityType}${summary ? `: ${String(summary)}` : ''}`,
      timestamp: event.createdAt,
      ipAddress: event.ipAddress || 'Not recorded',
      actorName: event.actor?.fullName || 'System',
      actorRole: event.actor?.role.name || 'System',
    };
  }).filter((log) => {
    const matchesFilter = logFilter === 'all' || log.category === logFilter;
    const s = searchLog.toLowerCase();
    const matchesSearch =
      (log.action || '').toLowerCase().includes(s) ||
      (log.actorName || '').toLowerCase().includes(s) ||
      (log.details || '').toLowerCase().includes(s) ||
      (log.target || '').toLowerCase().includes(s);
    return matchesFilter && matchesSearch;
  });

  // Active counts
  const openDirectivesCount = auditDirectives.filter((d) => d.status === 'Open' || d.status === 'Under Investigation').length;
  const criticalDirectivesCount = auditDirectives.filter((d) => d.severity === 'Critical' && d.status !== 'Resolved').length;
  const compliantChecklistCount = auditChecklist.filter((c) => c.status === 'Compliant').length;
  const totalChecklistCount = auditChecklist.length;
  const compliancePercentage = totalChecklistCount > 0 ? Math.round((compliantChecklistCount / totalChecklistCount) * 100) : 100;

  // Selected voucher details
  const selectedVoucher = expenseApprovals.find((v) => v.id === selectedVoucherId) || expenseApprovals[0];

  if (activeTab === 'overview') {
    const sections: { id: typeof activeTab; title: string; description: string; icon: React.ReactNode; count: string }[] = [
      { id: 'directives', title: 'Audit findings', description: 'Create, assign, escalate, and resolve review findings.', icon: <AlertTriangle className="h-5 w-5" />, count: `${openDirectivesCount} open` },
      { id: 'checklist', title: 'Compliance checklist', description: 'Review standards and record verification notes.', icon: <ShieldCheck className="h-5 w-5" />, count: `${compliantChecklistCount}/${totalChecklistCount} compliant` },
      { id: 'ledger', title: 'Data integrity', description: 'Create a SHA-256 snapshot of persisted donation and Zakat records.', icon: <Database className="h-5 w-5" />, count: integritySnapshot ? `${integritySnapshot.checkedRecords} records scanned` : 'Not scanned' },
      { id: 'vouchers', title: 'Voucher review', description: 'Voucher inspection is not yet connected to persisted backend records.', icon: <FileCheck2 className="h-5 w-5" />, count: 'Not connected' },
      { id: 'security', title: 'System audit trail', description: 'Search persisted administrative activity and compliance events.', icon: <Lock className="h-5 w-5" />, count: `${auditTrail.length} latest events` },
    ];

    return (
      <div className="space-y-6">
        <header className="space-y-2">
          <Badge variant="gold">Audit & Compliance</Badge>
          <h1 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">Audit workspace</h1>
          <p className="max-w-2xl text-sm text-stone-500 dark:text-stone-400">
            Choose a review area to see its records and actions. Directive changes, checklist updates, and system events are saved to the server audit trail.
          </p>
        </header>

        {auditDataError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            <span>{auditDataError}</span>
            <Button variant="secondary" size="sm" onClick={() => setAuditReloadKey((key) => key + 1)}>Retry</Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveTab(section.id)}
              className="rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-xs transition-colors hover:border-amber-400 hover:bg-amber-50/40 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="font-semibold text-stone-900 dark:text-stone-100">{section.title}</div>
                  <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{section.description}</p>
                </div>
                <span className="rounded-xl bg-stone-100 p-2 text-amber-700 dark:bg-stone-800 dark:text-amber-400">{section.icon}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs dark:border-stone-800">
                <span className="text-stone-500">{auditDataLoading ? 'Loading…' : section.count}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">Open <ChevronRight className="h-3.5 w-3.5" /></span>
              </div>
            </button>
          ))}
        </div>

        {integritySnapshot && (
          <Card className="space-y-2">
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">Latest data integrity snapshot</h2>
            <p className="text-xs text-stone-500">
              {integritySnapshot.checkedRecords} records checked at {new Date(integritySnapshot.scannedAt).toLocaleString()}.
            </p>
            <code className="block break-all rounded-lg bg-stone-50 p-3 text-xs text-stone-700 dark:bg-stone-800 dark:text-stone-300">{integritySnapshot.digest}</code>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Institutional Header */}
      <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="gold">Audit & Compliance</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-amber-600" />
            <span>Audit & Compliance workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-3xl">
            Record audit findings, review compliance controls, and inspect persisted administrative activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 text-emerald-600 ${isVerifying ? 'animate-spin' : ''}`} />}
            onClick={handleRunVerification}
            disabled={isVerifying}
          >
            {isVerifying ? 'Creating snapshot…' : 'Create integrity snapshot'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4 text-amber-600" />}
            onClick={() => setIsFlagModalOpen(true)}
          >
            New audit finding
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportSealedAudit}
          >
            Export audit trail
          </Button>
        </div>
      </div>

      {/* Overview metrics are hidden while a specific feature is selected. */}
      {activeTab === 'overview' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Checklist completion
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {compliancePercentage}%
            </span>
            <span className="text-xs text-stone-400 font-medium">({compliantChecklistCount}/{totalChecklistCount} standards)</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Checklist status</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Current
            </span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Audit events loaded
            </span>
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 border border-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
              {auditTrail.length.toLocaleString()}
            </span>
            <span className="text-xs text-stone-400">records</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Source</span>
            <span className="font-mono font-bold text-stone-600 dark:text-stone-300">Backend audit log</span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Audit Inquiries & Flags
            </span>
            <div className={`p-2.5 rounded-2xl ${openDirectivesCount > 0 ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 border border-amber-500/20' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-serif font-bold font-mono ${openDirectivesCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700'}`}>
              {openDirectivesCount}
            </span>
            <span className="text-xs text-stone-400">active ({criticalDirectivesCount} critical)</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>Resolution Rate</span>
            <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono">
              {auditDirectives.length > 0 ? Math.round(((auditDirectives.length - openDirectivesCount) / auditDirectives.length) * 100) : 100}% cleared
            </span>
          </div>
        </Card>

        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Latest snapshot
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 border border-purple-500/20">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 font-mono">
              {integritySnapshot?.checkedRecords ?? '—'}
            </span>
            <span className="text-xs text-stone-400">records</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
            <span>SHA-256 digest</span>
            <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 truncate max-w-[120px]">
              {integritySnapshot?.digest.slice(0, 10) || 'Not scanned'}
            </span>
          </div>
        </Card>
      </div>}

      {auditDataError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{auditDataError}</span>
          <Button variant="secondary" size="sm" onClick={() => setAuditReloadKey((key) => key + 1)}>Retry</Button>
        </div>
      )}

      {/* Auditor Navigation Sub-tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-stone-200 dark:border-stone-800 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('directives')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'directives'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Findings ({openDirectivesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'checklist'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Compliance checklist</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'ledger'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data integrity</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'vouchers'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Voucher Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>System audit trail</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE AUDIT OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shari'ah & Institutional Compliance Status Card */}
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                      Shari'ah Governance & Ringfencing Status
                    </h3>
                    <p className="text-xs text-stone-500">
                      Continuous audit of Zakat 8-Asnaf segregation, Waqf corpus preservation, and interest-free treasury.
                    </p>
                  </div>
                </div>
                <Badge variant="emerald">100% Segregated</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-200">
                    <span>Zakat ul-Mal & Fitr Fund</span>
                    <span className="text-emerald-600 font-mono">100% Shari'ah Compliant</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Strict sub-ledger ringfencing. Disbursed strictly to verified Fuqara, Masakeen, and Fi Sabilillah. Zero operational overhead deduction.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono border-t border-stone-200 dark:border-stone-700">
                    <span>Beneficiaries: {zakatDistributions.length + 84}</span>
                    <span>Audit Status: Certified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-200">
                    <span>Waqf Endowment Corpus</span>
                    <span className="text-emerald-600 font-mono">Principal Preserved</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Habis al-Asl governance verified. 154 registered mosques and commercial farmland properties held in perpetuity without liquidation.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono border-t border-stone-200 dark:border-stone-700">
                    <span>Properties: 154 Mosques / 48 Madrasas</span>
                    <span>Audit Status: Certified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-200">
                    <span>Treasury & Banking Windows</span>
                    <span className="text-emerald-600 font-mono">Zero Riba Detected</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    All accounts held under CBE Noor, Oromia Bank, Hijra Bank, and ZamZam Bank Islamic profit-sharing contracts.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono border-t border-stone-200 dark:border-stone-700">
                    <span>Accounts Audited: 6 Main Windows</span>
                    <span>Audit Status: Certified</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-200">
                    <span>Dual-Signature Disbursement Mandate</span>
                    <span className="text-emerald-600 font-mono">100% Enforced</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Transactions &gt; 10,000 ETB automatically require dual cryptographic authorization by Finance Officer and General Secretary.
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-mono border-t border-stone-200 dark:border-stone-700">
                    <span>Vouchers Audited: {expenseApprovals.length}</span>
                    <span>Audit Status: Certified</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Audit Action Panel */}
            <Card className="space-y-4">
              <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-amber-600" />
                  <span>Auditor Quick Terminal</span>
                </h3>
                <p className="text-xs text-stone-500">Authorized actions for {currentUser.name}</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleRunVerification}
                  disabled={isVerifying}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700">
                      <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Run Forensic Ledger Scan
                      </div>
                      <div className="text-[11px] text-stone-400">Verify SHA-256 Merkle block digest</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                </button>

                <button
                  onClick={() => setIsFlagModalOpen(true)}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Issue Audit Directive / Flag
                      </div>
                      <div className="text-[11px] text-stone-400">Attach compliance requirement to record</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
                </button>

                <button
                  onClick={() => setIsCertificateModalOpen(true)}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-stone-200 dark:border-stone-700 hover:border-purple-300 dark:hover:border-purple-700 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Shari'ah Audit Certificate
                      </div>
                      <div className="text-[11px] text-stone-400">View & print certified seal</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-purple-600 transition-colors" />
                </button>

                <button
                  onClick={handleExportSealedAudit}
                  className="w-full p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-700 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Export Forensic Package
                      </div>
                      <div className="text-[11px] text-stone-400">Download cryptographically sealed file</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </Card>
          </div>

          {/* Recent Directives Table Preview */}
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Active Audit Directives & Compliance Inquiries</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Targeted compliance findings requiring documentary justification or administrative correction.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsFlagModalOpen(true)}
                >
                  New Directive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => setActiveTab('directives')}
                >
                  View All ({auditDirectives.length})
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Directive ID</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-sans">
                  {auditDirectives.slice(0, 4).map((d) => (
                    <tr key={d.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {d.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                        <div>{d.targetEntity}</div>
                        <div className="text-[11px] text-stone-400 font-normal truncate max-w-xs">{d.title}</div>
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 font-mono text-[11px]">
                          {d.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            d.severity === 'Critical'
                              ? 'error'
                              : d.severity === 'High'
                              ? 'amber'
                              : d.severity === 'Medium'
                              ? 'gold'
                              : 'blue'
                          }
                        >
                          {d.severity}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            d.status === 'Resolved'
                              ? 'emerald'
                              : d.status === 'Escalated to Shura'
                              ? 'error'
                              : 'amber'
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-500">
                        {d.dueDate}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedDirective(d);
                            setActiveTab('directives');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-300 font-bold transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: AUDIT DIRECTIVES & COMPLIANCE INQUIRIES */}
      {activeTab === 'directives' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Regulatory & Shari'ah Compliance Directives</span>
              </h3>
              <p className="text-xs text-stone-500">
                Formal inquiries logged by internal auditors. Resolving or escalating records updates the immutable audit ledger.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsFlagModalOpen(true)}
              >
                Attach Directive
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-xs">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search directives, findings, entities..."
                value={directiveSearch}
                onChange={(e) => setDirectiveSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={directiveCategoryFilter}
                onChange={(e) => setDirectiveCategoryFilter(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              >
                <option value="all">All Categories</option>
                <option value="Shariah_Compliance">Shari'ah Compliance</option>
                <option value="Procurement_VAT">Procurement & VAT</option>
                <option value="Waqf_Endowment">Waqf & Endowment</option>
                <option value="CSO_Regulatory">CSO Regulatory</option>
                <option value="Financial_Integrity">Financial Integrity</option>
              </select>

              <select
                value={directiveStatusFilter}
                onChange={(e) => setDirectiveStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Escalated to Shura">Escalated to Shura</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Directives Cards List */}
          <div className="space-y-3">
            {filteredDirectives.length === 0 ? (
              <div className="py-12 text-center text-stone-400 space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="font-bold text-sm">No audit directives match your query.</p>
                <p className="text-xs">{auditDataLoading ? 'Loading saved findings…' : 'Create a finding when a review requires follow-up.'}</p>
              </div>
            ) : (
              filteredDirectives.map((d) => (
                <div
                  key={d.id}
                  className={`p-5 rounded-3xl border transition-all space-y-3 text-xs ${
                    d.status === 'Resolved'
                      ? 'bg-stone-50/60 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800'
                      : d.status === 'Escalated to Shura'
                      ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-900'
                      : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                          {d.id}
                        </span>
                        <Badge
                          variant={
                            d.severity === 'Critical'
                              ? 'error'
                              : d.severity === 'High'
                              ? 'amber'
                              : d.severity === 'Medium'
                              ? 'gold'
                              : 'blue'
                          }
                        >
                          {d.severity} Priority
                        </Badge>
                        <Badge
                          variant={
                            d.status === 'Resolved'
                              ? 'emerald'
                              : d.status === 'Escalated to Shura'
                              ? 'error'
                              : 'amber'
                          }
                        >
                          {d.status}
                        </Badge>
                        <span className="text-[11px] font-mono text-stone-400">
                          Dept: {d.department}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        {d.title}
                      </h4>
                      <p className="text-stone-500 dark:text-stone-400 font-semibold">
                        Target Entity: <span className="text-stone-800 dark:text-stone-200">{d.targetEntity}</span>
                        {d.amountETB ? ` • Disputed Sum: ETB ${d.amountETB.toLocaleString()}` : ''}
                        {d.voucherId ? ` • Voucher: ${d.voucherId}` : ''}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-stone-400 font-mono shrink-0">
                      <div>Logged: {d.createdDate}</div>
                      <div className="text-amber-600 dark:text-amber-400 font-semibold">Due: {d.dueDate}</div>
                    </div>
                  </div>

                  {/* Findings & Required Action Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-2xl bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-stone-400 block">
                        Audit Findings:
                      </span>
                      <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                        {d.findings}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Mandated Corrective Action:
                      </span>
                      <p className="text-amber-950 dark:text-amber-200 leading-relaxed">
                        {d.requiredAction}
                      </p>
                    </div>
                  </div>

                  {/* Resolution note if resolved */}
                  {d.status === 'Resolved' && d.resolutionNote && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Resolution Recorded ({d.resolvedDate}):</span> {d.resolutionNote}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                    <div className="text-stone-400 font-mono">
                      Assigned Auditor: <span className="text-stone-600 dark:text-stone-300">{d.assignedAuditor}</span>
                      {d.evidenceReference ? ` • Ref: ${d.evidenceReference}` : ''}
                    </div>

                    <div className="flex items-center gap-2">
                      {d.status !== 'Resolved' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Check className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => {
                              setSelectedDirective(d);
                              setIsResolveModalOpen(true);
                            }}
                          >
                            Resolve & Clear
                          </Button>

                          {d.status !== 'Escalated to Shura' && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                              onClick={() => changeDirectiveStatus(d, 'Escalated to Shura')}
                            >
                              Escalate to Shura
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<X className="w-3.5 h-3.5 text-stone-400" />}
                        onClick={() => removeDirective(d)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: 4 PILLARS GOVERNANCE MATRIX */}
      {activeTab === 'checklist' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Institutional Governance & Compliance Matrix (4 Pillars)</span>
              </h3>
              <p className="text-xs text-stone-500">
                Continuous compliance benchmark alignment covering Shari'ah standards (AAOIFI), Ethiopian CSO laws, and internal controls.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={checklistPillarFilter}
                onChange={(e) => setChecklistPillarFilter(e.target.value)}
                className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              >
                <option value="all">All 4 Pillars</option>
                <option value="Shariah">Pillar 1: Shari'ah Financial Governance</option>
                <option value="Financial">Pillar 2: Financial Integrity & Controls</option>
                <option value="Regulatory">Pillar 3: CSO Regulatory & Statutory</option>
                <option value="Governance">Pillar 4: Property & Digital Governance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChecklist.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 shadow-xs space-y-3 text-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-400">
                        {item.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase">
                        {item.pillar}
                      </span>
                    </div>

                    <Badge
                      variant={
                        item.status === 'Compliant'
                          ? 'emerald'
                          : item.status === 'Pending Review'
                          ? 'amber'
                          : 'error'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    {item.title}
                  </h4>
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-300 space-y-1">
                    <div>Standard: <span className="font-bold text-stone-800 dark:text-stone-200">{item.standardReference}</span></div>
                    {item.evidenceNote && (
                      <div className="text-stone-500 italic">"{item.evidenceNote}"</div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-mono">Verified: {item.lastVerified}</span>

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'Compliant' ? (
                      <button
                        onClick={() => changeChecklistStatus(item, 'Compliant', 'Auditor verified complete documentation.')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark Compliant
                      </button>
                    ) : (
                      <button
                        onClick={() => changeChecklistStatus(item, 'Action Required', 'Requires re-audit for next fiscal quarter.')}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold hover:bg-stone-200 transition-colors"
                      >
                        Re-inspect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'ledger' && (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Financial data integrity</h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500">
                Create a SHA-256 fingerprint from saved donation intents and Zakat distribution records. This is a point-in-time snapshot, not a blockchain or verification against a previously sealed ledger.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className={`h-4 w-4 ${isVerifying ? 'animate-spin' : ''}`} />}
              onClick={handleRunVerification}
              disabled={isVerifying}
            >
              {isVerifying ? 'Creating…' : 'Create snapshot'}
            </Button>
          </div>
          {integritySnapshot ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                  <div className="text-xs text-stone-500">Records included</div>
                  <div className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{integritySnapshot.checkedRecords.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                  <div className="text-xs text-stone-500">Donation intents</div>
                  <div className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{integritySnapshot.donationIntentCount.toLocaleString()}</div>
                </div>
                <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
                  <div className="text-xs text-stone-500">Zakat distributions</div>
                  <div className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-100">{integritySnapshot.zakatDistributionCount.toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between gap-2 text-xs text-stone-500">
                  <span>SHA-256 snapshot digest</span>
                  <span>{new Date(integritySnapshot.scannedAt).toLocaleString()}</span>
                </div>
                <code className="block break-all rounded-xl border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">{integritySnapshot.digest}</code>
              </div>
              <div className="text-xs text-stone-500">Included datasets: {integritySnapshot.scannedTables.join(', ')}</div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500 dark:border-stone-700">
              {auditDataLoading ? 'Loading saved snapshot…' : 'No saved integrity snapshot yet. Create one to fingerprint the current records.'}
            </div>
          )}
        </Card>
      )}

      {/* Legacy demonstration ledger is intentionally not shown; the database has no Merkle-chain ledger. */}
      {false && activeTab === 'ledger' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <span>Cryptographic Merkle Blockchain & Immutable Ledger</span>
              </h3>
              <p className="text-xs text-stone-500">
                Every batch of financial journals, Zakat disbursements, and endowment deeds is hashed into a tamper-evident SHA-256 block chain.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 text-emerald-600 ${isVerifying ? 'animate-spin' : ''}`} />}
              onClick={handleRunVerification}
              disabled={isVerifying}
            >
              {isVerifying ? 'Calculating Hashes...' : 'Re-verify Block Tree'}
            </Button>
          </div>

          <div className="space-y-3">
            {ledgerBlocks.map((block) => (
              <div
                key={block.blockHeight}
                className="p-5 rounded-3xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 font-mono text-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-sans">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-mono">
                        Block #{block.blockHeight}
                      </span>
                      <span className="ml-2 px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-[10px] font-bold text-stone-700 dark:text-stone-300">
                        {block.blockType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="emerald">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {block.status}
                    </Badge>
                    <span className="text-[11px] text-stone-400">{block.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1 border-t border-stone-200/60 dark:border-stone-700">
                  <div className="space-y-1 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                    <div className="text-stone-400 font-sans font-bold uppercase text-[10px]">Current Block Hash (SHA-256)</div>
                    <div className="text-purple-600 dark:text-purple-400 break-all select-all font-semibold">
                      {block.blockHash}
                    </div>
                  </div>

                  <div className="space-y-1 bg-white dark:bg-stone-900 p-3 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                    <div className="text-stone-400 font-sans font-bold uppercase text-[10px]">Merkle Root Tree</div>
                    <div className="text-emerald-600 dark:text-emerald-400 break-all select-all font-semibold">
                      {block.merkleRoot}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1 font-sans">
                  <div>
                    Batch Volume: <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">ETB {block.totalValueETB.toLocaleString()}</span> ({block.transactionsCount} txs)
                  </div>
                  <div>
                    Seal Signature: <span className="font-mono text-stone-400">{block.validator}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'vouchers' && (
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 dark:text-stone-100">Voucher review is not connected</h2>
              <p className="mt-1 max-w-2xl text-sm text-stone-500 dark:text-stone-400">
                Expense voucher records and audit stamps are not currently persisted by the backend. No sample vouchers are shown or marked as verified.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Legacy voucher demonstration uses local mock data and is intentionally not shown. */}
      {false && activeTab === 'vouchers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voucher List */}
          <Card className="space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Expense Vouchers to Inspect</span>
              </h3>
              <p className="text-xs text-stone-500">Select any voucher for line-by-line audit</p>
            </div>

            <div className="space-y-2">
              {expenseApprovals.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoucherId(v.id)}
                  className={`w-full p-3 rounded-2xl text-left transition-all border text-xs space-y-1 ${
                    selectedVoucherId === v.id
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-amber-700 dark:text-amber-400">{v.id}</span>
                    <span className="text-stone-900 dark:text-stone-100 font-mono">ETB {v.amount.toLocaleString()}</span>
                  </div>
                  <div className="font-sans font-semibold text-stone-800 dark:text-stone-200 truncate">
                    {v.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>{v.department}</span>
                    <Badge variant={stampedVouchers[v.id] === 'Passed' ? 'emerald' : v.status === 'Approved' ? 'emerald' : 'amber'}>
                      {stampedVouchers[v.id] || v.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Detailed Inspector View */}
          <Card className="lg:col-span-2 space-y-5">
            {selectedVoucher ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-amber-700 dark:text-amber-400">
                        {selectedVoucher.id}
                      </span>
                      <Badge variant="gold">{selectedVoucher.department}</Badge>
                      {stampedVouchers[selectedVoucher.id] && (
                        <Badge variant={stampedVouchers[selectedVoucher.id] === 'Passed' ? 'emerald' : 'error'}>
                          Audit Stamped: {stampedVouchers[selectedVoucher.id]}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 mt-1">
                      {selectedVoucher.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 font-mono">
                      ETB {selectedVoucher.amount.toLocaleString()}
                    </div>
                    <span className="text-xs text-stone-400">Date: {selectedVoucher.date}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">Justification & Purpose:</span>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{selectedVoucher.purpose}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-stone-400 uppercase text-[10px]">Submitted By:</span>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{selectedVoucher.submittedBy}</div>
                      <div className="text-[11px] text-stone-500 font-mono">Department: {selectedVoucher.department}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 space-y-1">
                      <span className="font-bold text-stone-400 uppercase text-[10px]">Target Fund Allocation:</span>
                      <div className="font-bold text-stone-800 dark:text-stone-200">{selectedVoucher.fund}</div>
                      <div className="text-[11px] text-stone-500 font-mono">Dual-Authorization: Verified</div>
                    </div>
                  </div>

                  {/* Cryptographic Signatures */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                    <span className="font-bold text-stone-400 uppercase text-[10px]">
                      Digital Approval Signatures & Audit Trail:
                    </span>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>1. Department Head (Endorsement)</span>
                        <span>SHA256: 4f89...21a8 [VALID]</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span>2. Executive Secretary (Authorization)</span>
                        <span>SHA256: 9b12...ec45 [VALID]</span>
                      </div>
                      <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                        <span>3. Independent Auditor (Inspection)</span>
                        <span>{stampedVouchers[selectedVoucher.id] ? `STAMPED: ${stampedVouchers[selectedVoucher.id]}` : 'PENDING AUDIT STAMP'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Stamp Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    onClick={() => {
                      setStampedVouchers((prev) => ({ ...prev, [selectedVoucher.id]: 'Flagged' }));
                      addToast('Voucher Flagged', `Voucher ${selectedVoucher.id} flagged for missing merchant receipt.`, 'warning');
                    }}
                  >
                    Flag For Inquiry
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    onClick={() => {
                      setStampedVouchers((prev) => ({ ...prev, [selectedVoucher.id]: 'Passed' }));
                      addToast('Audit Stamp Applied', `Voucher ${selectedVoucher.id} stamped as compliant and verified.`, 'success');
                    }}
                  >
                    Stamp as Passed & Verified
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-stone-400">Select a voucher to inspect</div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 6: IMMUTABLE SECURITY AUDIT TRAIL */}
      {activeTab === 'security' && (
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>System audit trail</span>
              </h3>
              <p className="text-xs text-stone-500">
                Saved administrative actions and audit workflow updates. IP addresses are captured from the connection received by the server.
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit trail..."
                  value={searchLog}
                  onChange={(e) => setSearchLog(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as typeof logFilter)}
                className="p-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
              >
                <option value="all">All Events</option>
                <option value="Finance_Security">Finance & Treasury</option>
                <option value="Role_Change">Role Changes</option>
                <option value="Auth">Authentication</option>
                <option value="Compliance">Compliance</option>
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<RefreshCw className={`h-3.5 w-3.5 ${auditDataLoading ? 'animate-spin' : ''}`} />}
                disabled={auditDataLoading}
                onClick={() => setAuditReloadKey((key) => key + 1)}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {auditDataLoading ? (
              <div className="py-8 text-center text-sm text-stone-500">Loading saved audit events…</div>
            ) : auditDataError ? (
              <div className="py-8 text-center text-sm text-rose-600">{auditDataError}</div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-sm text-stone-500">No persisted events match these filters.</div>
            ) : filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === 'Success' ? 'emerald' : 'gold'}>
                        {log.status}
                      </Badge>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Target: {log.target}
                      </span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-300 mt-1">
                      {log.details}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-stone-500 shrink-0 font-mono">
                    <div>{log.timestamp.split('T')[0]}</div>
                    <div className="mt-1">IP: {log.ipAddress}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1.5 border-t border-stone-200/60 dark:border-stone-700 font-mono">
                  <span>Actor: {log.actorName} ({log.actorRole})</span>
                  <span>Category: {log.category}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL: CREATE AUDIT DIRECTIVE */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Attach Formal Audit Directive</span>
                </h3>
                <p className="text-stone-500">Require justification or corrective action from Directorate</p>
              </div>
              <button
                onClick={() => setIsFlagModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDirective} className="space-y-3.5">
              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Directive Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Missing Official VAT Merchant Receipt for Generator Repairs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Compliance Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Procurement_VAT">Procurement & VAT</option>
                    <option value="Shariah_Compliance">Shari'ah Compliance</option>
                    <option value="Waqf_Endowment">Waqf & Endowment</option>
                    <option value="CSO_Regulatory">CSO Regulatory</option>
                    <option value="Financial_Integrity">Financial Integrity</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Severity Priority
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Low">Low (Informational)</option>
                    <option value="Medium">Medium (Documentation Clarification)</option>
                    <option value="High">High (Discrepancy Requiring Audit Reply)</option>
                    <option value="Critical">Critical (Immediate Freeze on Funds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Target Directorate / Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Finance & Endowment">Finance & Endowment</option>
                    <option value="Mosque & Waqf Affairs">Mosque & Waqf Affairs</option>
                    <option value="Education Directorate">Education Directorate</option>
                    <option value="Executive Secretariat">Executive Secretariat</option>
                    <option value="Social Services & Zakat">Social Services & Zakat</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                    Due Date for Correction
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Target Entity / Project / Voucher *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grand Anwar Mosque Facilities Committee (Voucher #EXP-089)"
                  value={newTargetEntity}
                  onChange={(e) => setNewTargetEntity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Specific Audit Finding & Non-Compliance *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail the documentary gap or regulatory clause violated..."
                  value={newFindings}
                  onChange={(e) => setNewFindings(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Mandated Corrective Action Required
                </label>
                <textarea
                  rows={2}
                  placeholder="State the concrete document or step required to close this inquiry..."
                  value={newRequiredAction}
                  onChange={(e) => setNewRequiredAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsFlagModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Log Audit Directive
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE DIRECTIVE */}
      {isResolveModalOpen && selectedDirective && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Resolve Audit Directive</span>
                </h3>
                <p className="text-stone-500">Record formal compliance clearance for {selectedDirective.id}</p>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-3">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-stone-800 dark:text-stone-200">{selectedDirective.title}</div>
                <div className="text-stone-500 mt-1">{selectedDirective.findings}</div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Resolution & Clearance Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Mosque Treasurer submitted authenticated MoR VAT machine invoice #VR-84910. Ledger variance cleared."
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsResolveModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Confirm & Seal Resolution
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SHARI'AH AUDIT OPINION CERTIFICATE */}
      {isCertificateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 text-stone-900 dark:text-stone-100">
            {/* Certificate Header with Seal */}
            <div className="text-center space-y-2 border-b-2 border-amber-600/30 pb-6 relative">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center border-2 border-amber-500/40 shadow-inner">
                <Landmark className="w-8 h-8" />
              </div>
              <div className="text-xs font-serif tracking-widest text-amber-700 dark:text-amber-400 uppercase font-bold">
                Jimma City Islamic Affairs Supreme Council
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                CERTIFICATE OF SHARI'AH & FINANCIAL AUDIT COMPLIANCE
              </h2>
              <div className="text-xs text-stone-500 font-mono">
                Independent Audit Opinion • Clean & Unqualified Rating • FY 2025/2026
              </div>
            </div>

            {/* Formal Certificate Body */}
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300 font-serif">
              <p>
                <strong>To the Supreme Shura Assembly and Community of Jimma City:</strong>
              </p>
              <p>
                The Independent Internal Audit and Shari'ah Compliance Board has conducted a comprehensive forensic audit of all financial ledgers, Zakat disbursements, Waqf property title deeds, and expense vouchers for the Jimma Islamic Council for the period ending August 31, 2026.
              </p>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2 text-xs font-sans">
                <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                  Official Shari'ah Supervisory Opinion:
                </div>
                <p className="text-amber-950 dark:text-amber-300 leading-relaxed">
                  "In our professional opinion as independent Shari'ah auditors, all collected Zakat funds were ringfenced strictly in accordance with Surah At-Tawbah (9:60) and AAOIFI Standard No. 35. Waqf assets maintain complete principal preservation (Habis al-Asl), and all treasury liquidity remains 100% free of conventional usurious interest (Riba)."
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans pt-2">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-stone-500 block">Ledger Reconciled:</span>
                  <span className="font-mono font-bold text-emerald-600">1,420+ Tx (0.00 Variance)</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700">
                  <span className="font-bold text-stone-500 block">CSO Proclamation 1113/2019:</span>
                  <span className="font-mono font-bold text-emerald-600">100% Statutory Compliant</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs">
              <div className="text-center space-y-1">
                <div className="font-serif italic text-amber-700 dark:text-amber-400 font-bold">
                  Sheikh Dr. Khalid Ahmed
                </div>
                <div className="text-[11px] text-stone-500">Lead Shari'ah Auditor, Jimma City</div>
                <div className="text-[10px] text-stone-400 font-mono">ID: SH-AUD-KHALID-2026</div>
              </div>

              <div className="text-center space-y-1">
                <div className="font-serif italic text-amber-700 dark:text-amber-400 font-bold">
                  Amina Kedir, CPA
                </div>
                <div className="text-[11px] text-stone-500">Chief Inspector of Internal Controls</div>
                <div className="text-[10px] text-stone-400 font-mono">ID: AUD-AMINA-ETH-98</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-stone-800">
              <span className="text-[11px] text-stone-400 font-mono">
                SHA-256 Digest: e3b0c44298fc1c149afbf4c8996fb924...
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Printer className="w-4 h-4" />}
                  onClick={() => {
                    window.print();
                  }}
                >
                  Print Certificate
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCertificateModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
