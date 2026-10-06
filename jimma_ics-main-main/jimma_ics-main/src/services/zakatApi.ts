import { apiRequest } from './authApi';
import { ZakatBeneficiaryDistribution } from '../types';

export interface NisabRate {
  goldPricePerGram: number;
  silverPricePerGram: number;
  effectiveDate: string;
}

export type ZakatApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ZakatApplication {
  id: number;
  referenceNumber: string;
  status: ZakatApplicationStatus;
  woreda: { id: number; code: string };
  applicantFullName: string;
  applicantPhone: string;
  householdSize: number | null;
  eligibilityNotes: string | null;
  assignedOfficer: { id: number; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedZakatApplication {
  referenceNumber: string;
  status: ZakatApplicationStatus;
  applicantFullName: string;
  createdAt: string;
  updatedAt: string;
}

export function fetchCurrentNisabRate() {
  return apiRequest<NisabRate | null>('/zakat/rates');
}

export function setNisabRate(data: Omit<NisabRate, 'effectiveDate'> & { effectiveDate?: string }) {
  return apiRequest<NisabRate>('/admin/zakat/rates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function submitZakatApplication(data: {
  woredaId: number;
  applicantFullName: string;
  applicantPhone: string;
  householdSize?: number;
  eligibilityNotes?: string;
}) {
  return apiRequest<Pick<ZakatApplication, 'referenceNumber' | 'status' | 'createdAt'>>('/services/zakat/applications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function trackZakatApplication(reference: string, phone: string) {
  const params = new URLSearchParams({ phone });
  return apiRequest<TrackedZakatApplication>(`/services/zakat/applications/track/${encodeURIComponent(reference)}?${params}`);
}

export function fetchZakatApplications(params: { page?: number; pageSize?: number; search?: string; status?: ZakatApplicationStatus } = {}) {
  const query = new URLSearchParams();
  query.set('page', String(params.page || 1));
  query.set('pageSize', String(params.pageSize || 100));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  return apiRequest<ZakatApplication[]>(`/admin/zakat/applications?${query.toString()}`);
}

export function updateZakatApplicationStatus(id: number, data: {
  status: ZakatApplicationStatus;
  eligibilityNotes?: string;
}) {
  return apiRequest<ZakatApplication>(`/admin/zakat/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function assignZakatOfficer(id: number, assignedOfficerId: number | null) {
  return apiRequest<ZakatApplication>(`/admin/zakat/applications/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedOfficerId }),
  });
}

export function saveZakatAssessment(title: string, summary: Record<string, unknown>) {
  return apiRequest<{ id: string; title: string; date: string; [key: string]: unknown }>('/account/zakat/assessments', {
    method: 'POST',
    body: JSON.stringify({ title, summary }),
  });
}

export function deleteZakatAssessment(id: string) {
  return apiRequest<void>(`/account/zakat/assessments/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchZakatDistributions() {
  return apiRequest<ZakatBeneficiaryDistribution[]>('/admin/zakat/distributions');
}

export function createZakatDistribution(data: Omit<ZakatBeneficiaryDistribution, 'id'>) {
  return apiRequest<ZakatBeneficiaryDistribution>('/admin/zakat/distributions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
