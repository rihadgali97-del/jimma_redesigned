import { Ulema } from '../types';
import { apiRequest } from './authApi';

type ApiUlema = Omit<Ulema, 'id' | 'avatar'> & {
  id: number;
  avatar?: string | null;
};

export type UlemaInput = Omit<Ulema, 'id' | 'avatar'> & { avatar?: string };

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api/v1').replace(/\/$/, '');
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

function resolveAvatarUrl(url?: string | null) {
  if (!url) return '';
  const resolved = new URL(url, `${API_ORIGIN}/`);
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(resolved.hostname)) {
    return new URL(`${resolved.pathname}${resolved.search}${resolved.hash}`, `${API_ORIGIN}/`).toString();
  }
  return resolved.toString();
}

function mapUlema(record: ApiUlema): Ulema {
  return {
    ...record,
    id: String(record.id),
    avatar: resolveAvatarUrl(record.avatar),
    contactPhone: record.contactPhone || '',
    email: record.email || '',
  };
}

async function fetchUlema(path: string) {
  const result: Ulema[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const rows = await apiRequest<ApiUlema[]>(`${path}?page=${page}&pageSize=100`);
    result.push(...rows.map(mapUlema));
    if (rows.length < 100) break;
  }
  return result;
}

export const fetchPublicUlema = () => fetchUlema('/ulema');
export const fetchAdminUlema = () => fetchUlema('/admin/ulema');

export async function fetchPublicUlemaProfile(id: string) {
  const record = await apiRequest<ApiUlema>(`/ulema/${encodeURIComponent(id)}`);
  return mapUlema(record);
}

export async function createUlemaRecord(data: UlemaInput) {
  const record = await apiRequest<ApiUlema>('/admin/ulema', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return mapUlema(record);
}

export async function updateUlemaRecord(id: string, data: Partial<UlemaInput>) {
  const record = await apiRequest<ApiUlema>(`/admin/ulema/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return mapUlema(record);
}

export async function uploadUlemaAvatar(id: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  const record = await apiRequest<ApiUlema>(`/admin/ulema/${encodeURIComponent(id)}/avatar`, {
    method: 'POST',
    body,
  });
  return mapUlema(record);
}

export function deleteUlemaRecord(id: string) {
  return apiRequest<void>(`/admin/ulema/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
