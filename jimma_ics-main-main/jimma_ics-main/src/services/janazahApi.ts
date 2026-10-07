import { apiRequest } from './authApi';

export type JanazahRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface JanazahAvailability {
  serviceKey: string;
  isEnabled: boolean;
  updatedAt: string;
}

export interface JanazahRequest {
  id: number;
  referenceNumber: string;
  status: JanazahRequestStatus;
  woreda: { id: number; code: string };
  deceasedName: string;
  contactName: string;
  contactPhone: string;
  needsGhusl: boolean;
  needsTransport: boolean;
  needsCemeteryPlot: boolean;
  locationNote: string | null;
  assignedOfficer: { id: number; fullName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackedJanazahRequest {
  referenceNumber: string;
  status: JanazahRequestStatus;
  deceasedName: string;
  createdAt: string;
  updatedAt: string;
}

export const JANAZAH_CATALOGUE_ID = 'srv-3';

export function fetchJanazahAvailability() {
  return apiRequest<JanazahAvailability>('/services/janazah/availability');
}

export function fetchAdminJanazahAvailability() {
  return apiRequest<JanazahAvailability>('/admin/janazah/availability');
}

export function setJanazahAvailability(isEnabled: boolean) {
  return apiRequest<JanazahAvailability>('/admin/janazah/availability', {
    method: 'PATCH',
    body: JSON.stringify({ isEnabled }),
  });
}

export function submitJanazahRequest(data: {
  woredaId: number;
  deceasedName: string;
  contactName: string;
  contactPhone: string;
  needsGhusl?: boolean;
  needsTransport?: boolean;
  needsCemeteryPlot?: boolean;
  locationNote?: string;
}) {
  return apiRequest<Pick<JanazahRequest, 'referenceNumber' | 'status' | 'createdAt'>>(
    '/services/janazah/requests',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export function trackJanazahRequest(reference: string, phone: string) {
  const params = new URLSearchParams({ phone });
  return apiRequest<TrackedJanazahRequest>(
    `/services/janazah/requests/track/${encodeURIComponent(reference)}?${params}`
  );
}

export function fetchJanazahRequests(
  params: { page?: number; pageSize?: number; search?: string; status?: JanazahRequestStatus } = {}
) {
  const query = new URLSearchParams();
  query.set('page', String(params.page || 1));
  query.set('pageSize', String(params.pageSize || 100));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  return apiRequest<JanazahRequest[]>(`/admin/janazah/requests?${query.toString()}`);
}

export function updateJanazahRequestStatus(id: number, status: JanazahRequestStatus) {
  return apiRequest<JanazahRequest>(`/admin/janazah/requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function assignJanazahOfficer(id: number, assignedOfficerId: number | null) {
  return apiRequest<JanazahRequest>(`/admin/janazah/requests/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assignedOfficerId }),
  });
}
