import { Announcement } from '../types';
import { apiRequest } from './authApi';

type ApiAnnouncement = Omit<Announcement, 'id'> & { id: number | string };

const mapAnnouncement = (item: ApiAnnouncement): Announcement => ({
  ...item,
  id: String(item.id),
  date: item.publishDate,
  isUrgent: item.isUrgent ?? item.priority === 'High',
  priority: item.priority ?? (item.isUrgent ? 'High' : 'Normal'),
});

function listQuery() {
  return new URLSearchParams({ page: '1', pageSize: '100' });
}

export async function fetchPublicAnnouncements(): Promise<Announcement[]> {
  const rows = await apiRequest<ApiAnnouncement[]>(`/announcements?${listQuery()}`);
  return rows.map(mapAnnouncement);
}

export async function fetchAdminAnnouncements(): Promise<Announcement[]> {
  const rows = await apiRequest<ApiAnnouncement[]>(`/admin/announcements?${listQuery()}`);
  return rows.map(mapAnnouncement);
}

function announcementPayload(item: Partial<Announcement>) {
  const { id: _id, date: _date, ...payload } = item;
  if (payload.isUrgent !== undefined && payload.priority === undefined) {
    return { ...payload, priority: payload.isUrgent ? 'High' : 'Normal' };
  }
  return payload;
}

export async function createAnnouncementRecord(item: Omit<Announcement, 'id'>): Promise<Announcement> {
  const created = await apiRequest<ApiAnnouncement>('/admin/announcements', {
    method: 'POST', body: JSON.stringify(announcementPayload(item)),
  });
  return mapAnnouncement(created);
}

export async function uploadAnnouncementBanner(id: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<{ url: string }>(`/admin/announcements/${encodeURIComponent(id)}/banner`, { method: 'POST', body });
}

export async function updateAnnouncementRecord(id: string, updates: Partial<Announcement>): Promise<Announcement> {
  const updated = await apiRequest<ApiAnnouncement>(`/admin/announcements/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: JSON.stringify(announcementPayload(updates)),
  });
  return mapAnnouncement(updated);
}

export function deleteAnnouncementRecord(id: string) {
  return apiRequest<void>(`/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
