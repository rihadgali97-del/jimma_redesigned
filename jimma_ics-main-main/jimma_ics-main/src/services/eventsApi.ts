import { apiRequest } from './authApi';
import { CouncilEvent, EventRegistration, EventScheduleItem } from '../types';

type ApiEvent = Omit<CouncilEvent, 'id' | 'date' | 'attendeesCount'> & {
  id: number | string;
  date: string;
  attendeesCount: number;
};
type ApiRegistration = Omit<EventRegistration, 'id' | 'eventId' | 'status' | 'createdAt'> & {
  id: number | string;
  eventId: number | string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | EventRegistration['status'];
  createdAt: string;
};

const mapEvent = (event: ApiEvent): CouncilEvent => ({ ...event, id: String(event.id) });
const mapRegistration = (registration: ApiRegistration): EventRegistration => ({
  ...registration,
  id: String(registration.id),
  eventId: String(registration.eventId),
  status: registration.status === 'CHECKED_IN' ? 'Checked-In'
    : registration.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed',
});

function paginationParams() {
  return new URLSearchParams({ page: '1', pageSize: '100' });
}

export async function fetchPublicEvents(): Promise<CouncilEvent[]> {
  const rows = await apiRequest<ApiEvent[]>(`/events?${paginationParams()}`);
  return rows.map(mapEvent);
}

export async function fetchAdminEvents(): Promise<CouncilEvent[]> {
  const rows = await apiRequest<ApiEvent[]>(`/admin/events?${paginationParams()}`);
  return rows.map(mapEvent);
}

function eventPayload(event: Partial<CouncilEvent>) {
  const { id: _id, attendeesCount: _attendeesCount, ...payload } = event;
  return payload;
}

export async function createEventRecord(event: Omit<CouncilEvent, 'id'>): Promise<CouncilEvent> {
  const created = await apiRequest<ApiEvent>('/admin/events', {
    method: 'POST',
    body: JSON.stringify(eventPayload(event)),
  });
  return mapEvent(created);
}

export async function updateEventRecord(id: string, updates: Partial<CouncilEvent>): Promise<CouncilEvent> {
  const updated = await apiRequest<ApiEvent>(`/admin/events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(eventPayload(updates)),
  });
  return mapEvent(updated);
}

export function deleteEventRecord(id: string) {
  return apiRequest<void>(`/admin/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function registerForEventRecord(data: {
  eventId: string;
  fullName: string;
  phone: string;
  email?: string;
  district: string;
  organizationOrMadrasa?: string;
  attendeesCount: number;
  notes?: string;
}): Promise<EventRegistration> {
  const { eventId, ...body } = data;
  const registration = await apiRequest<ApiRegistration>(`/events/${encodeURIComponent(eventId)}/registrations`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapRegistration(registration);
}

export async function fetchEventRegistrations(eventId?: string): Promise<EventRegistration[]> {
  const query = paginationParams();
  if (eventId) query.set('eventId', eventId);
  const rows = await apiRequest<ApiRegistration[]>(`/admin/events/registrations?${query}`);
  return rows.map(mapRegistration);
}

export async function updateEventRegistrationStatus(id: string, status: 'CHECKED_IN' | 'CANCELLED') {
  const registration = await apiRequest<ApiRegistration>(`/admin/events/registrations/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return mapRegistration(registration);
}

export type EventScheduleInput = EventScheduleItem;
