import { apiRequest } from './authApi';

export const CIVIC_PUBLIC_SERVICE_IDS = [
  'srv-2',
  'srv-4',
  'srv-5',
  'srv-6',
  'srv-7',
  'srv-8',
] as const;

export type CivicPublicServiceId = (typeof CIVIC_PUBLIC_SERVICE_IDS)[number];

export function isCivicPublicServiceId(serviceId: string): serviceId is CivicPublicServiceId {
  return CIVIC_PUBLIC_SERVICE_IDS.some((id) => id === serviceId);
}

export interface CivicServiceAvailability {
  serviceKey: CivicPublicServiceId;
  isEnabled: boolean;
  updatedAt: string | null;
}

export function fetchCivicServiceAvailability() {
  return apiRequest<CivicServiceAvailability[]>('/services/availability');
}

export function fetchAdminCivicServiceAvailability() {
  return apiRequest<CivicServiceAvailability[]>('/admin/services/availability');
}

export function setCivicServiceAvailability(serviceKey: CivicPublicServiceId, isEnabled: boolean) {
  return apiRequest<CivicServiceAvailability>(`/admin/services/${serviceKey}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isEnabled }),
  });
}
