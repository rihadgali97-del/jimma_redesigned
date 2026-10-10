import { apiRequest } from './authApi';

export type OfficialInquiryStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface OfficialInquiry {
  id: number;
  referenceNumber: string;
  status: OfficialInquiryStatus;
  fullName: string;
  phone: string;
  email: string | null;
  inquiryType: string;
  department: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmittedOfficialInquiry {
  referenceNumber: string;
  status: OfficialInquiryStatus;
  createdAt: string;
}

export interface TrackedOfficialInquiry {
  service: 'official_inquiry';
  referenceNumber: string;
  status: OfficialInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export function submitOfficialInquiry(data: {
  fullName: string;
  phone: string;
  email?: string;
  inquiryType: string;
  department: string;
  message: string;
}) {
  return apiRequest<SubmittedOfficialInquiry>('/official-inquiries', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function trackOfficialInquiry(reference: string, phone: string) {
  const query = new URLSearchParams({ phone });
  return apiRequest<TrackedOfficialInquiry>(
    `/track/${encodeURIComponent(reference)}?${query.toString()}`
  );
}

export function fetchOfficialInquiries(params: {
  page?: number;
  pageSize?: number;
  status?: OfficialInquiryStatus;
  search?: string;
} = {}) {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 100),
  });
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  return apiRequest<OfficialInquiry[]>(`/admin/official-inquiries?${query.toString()}`);
}

export function updateOfficialInquiryStatus(id: number, status: OfficialInquiryStatus) {
  return apiRequest<OfficialInquiry>(`/admin/official-inquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
