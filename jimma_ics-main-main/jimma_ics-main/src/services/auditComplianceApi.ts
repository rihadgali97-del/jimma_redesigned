import { apiRequest } from './authApi';
import { AuditChecklistItem, AuditDirective } from '../types';

export interface AuditTrailRecord {
  id: number;
  actor: { fullName: string; email: string; role: { name: string } } | null;
  action: string;
  entityType: string;
  entityId: number | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export type AuditDirectiveCreate = Omit<AuditDirective, 'id' | 'createdDate'>;

export interface ChecklistStatusRecord {
  itemId: string;
  status: AuditChecklistItem['status'];
  evidenceNote: string;
  verifiedBy: string;
  lastVerified: string;
}

export interface AuditIntegritySnapshot {
  scannedTables: string[];
  checkedRecords: number;
  donationIntentCount: number;
  zakatDistributionCount: number;
  digest: string;
  scannedAt: string;
}

export function fetchComplianceAuditTrail(page = 1, pageSize = 100) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiRequest<AuditTrailRecord[]>(`/admin/audit-logs/compliance?${params}`);
}

export function fetchAuditDirectives() {
  return apiRequest<AuditDirective[]>('/admin/audit-logs/directives');
}

export function createAuditDirective(data: AuditDirectiveCreate) {
  return apiRequest<AuditDirective>('/admin/audit-logs/directives', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAuditDirective(id: string, data: {
  status: AuditDirective['status'];
  resolutionNote?: string;
}) {
  return apiRequest<AuditDirective>(`/admin/audit-logs/directives/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function archiveAuditDirective(id: string) {
  return apiRequest<{ id: string }>(`/admin/audit-logs/directives/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function fetchChecklistStatus() {
  return apiRequest<ChecklistStatusRecord[]>('/admin/audit-logs/checklist');
}

export function updateChecklistStatus(id: string, data: {
  status: AuditChecklistItem['status'];
  evidenceNote?: string;
  verifiedBy: string;
}) {
  return apiRequest<ChecklistStatusRecord>(`/admin/audit-logs/checklist/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function createIntegritySnapshot() {
  return apiRequest<AuditIntegritySnapshot>('/admin/audit-logs/integrity-scan', { method: 'POST' });
}
