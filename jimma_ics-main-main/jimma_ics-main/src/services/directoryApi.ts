import { apiRequest, getPublicAssetUrl } from './authApi';
import { Madrasa, Mosque } from '../types';

type ApiMosque = {
  id: number;
  name: string;
  description: string | null;
  woreda: { id: number; code: string };
  latitude: number | null;
  longitude: number | null;
  capacity: number | null;
  hasWuduFacility: boolean;
  hasBoarding: boolean;
  imamName: string | null;
  photos: { id: number; url: string }[];
  isPublished: boolean;
  madrasa: { id: number; name: string } | null;
};

type ApiMadrasa = Omit<ApiMosque, 'hasWuduFacility' | 'imamName' | 'madrasa'> & {
  hasBoarding: boolean;
  mosqueId: number | null;
  headTeacherId: number | null;
  headTeacher: string | null;
  hifzGraduatesCount: number | null;
};
type ApiWoreda = { id: number; code: string; name: string | null };

function formatWoreda(code: string) {
  return code.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchAll<T>(path: string): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const batch = await apiRequest<T[]>(`${path}?page=${page}&pageSize=100&locale=en`);
    rows.push(...batch);
    if (batch.length < 100) break;
  }
  return rows;
}

async function resolveWoredaId(district: string) {
  const woredas = await fetchAll<ApiWoreda>('/locations/woredas');
  const normalize = (value: string) => value.toLowerCase().replace(/[-_]/g, ' ').replace(/\b(town|district|woreda|sub city)\b/g, '').replace(/\s+/g, ' ').trim();
  const normalizedDistrict = normalize(district);
  const aliases: Record<string, string> = { 'jimma central': 'jimma town', 'jimma central town': 'jimma town' };
  const match = woredas.find((woreda) => {
    const normalizedCode = normalize(woreda.code);
    const normalizedName = normalize(woreda.name || '');
    return normalizedCode === (aliases[normalizedDistrict] || normalizedDistrict) || normalizedName === normalizedDistrict;
  });
  if (!match) throw new Error(`No registered woreda matches “${district}”. Refresh the district list and try again.`);
  return match.id;
}

export async function fetchDirectoryWoredas(): Promise<{ id: number; code: string; name: string }[]> {
  const rows = await fetchAll<ApiWoreda>('/locations/woredas');
  return rows.map((woreda) => ({
    ...woreda,
    name: woreda.name || formatWoreda(woreda.code),
  }));
}

export async function createMosqueRecord(data: { name: string; district: string; imam: string; capacity: number; description: string; madrasaId: number | null }): Promise<{ id: number }> {
  const woredaId = await resolveWoredaId(data.district);
  return apiRequest<{ id: number }>('/admin/mosques', {
    method: 'POST',
    body: JSON.stringify({
      woredaId,
      imamName: data.imam,
      capacity: data.capacity,
      madrasaId: data.madrasaId,
      isPublished: true,
      name: { en: data.name },
      description: { en: data.description },
    }),
  });
}

export async function updateMosqueRecord(id: string, data: { name: string; district: string; imam: string; capacity: number; description: string; madrasaId: number | null }): Promise<{ id: number }> {
  const woredaId = await resolveWoredaId(data.district);
  return apiRequest<{ id: number }>(`/admin/mosques/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      woredaId,
      imamName: data.imam,
      capacity: data.capacity,
      madrasaId: data.madrasaId,
      name: { en: data.name },
      description: { en: data.description },
    }),
  });
}

async function uploadDirectoryPhoto(entityType: 'mosque' | 'madrasa', entityId: number, photo: File) {
  const body = new FormData();
  body.append('file', photo);
  return apiRequest<{ url: string }>(`/admin/${entityType}s/${entityId}/photo`, {
    method: 'POST',
    body,
  });
}

export async function uploadMosquePhoto(id: number, photo: File) {
  return uploadDirectoryPhoto('mosque', id, photo);
}

export async function uploadMadrasaPhoto(id: number, photo: File) {
  return uploadDirectoryPhoto('madrasa', id, photo);
}

export async function createMadrasaRecord(data: { name: string; district: string; capacity: number; description: string }): Promise<{ id: number }> {
  const woredaId = await resolveWoredaId(data.district);
  return apiRequest<{ id: number }>('/admin/madrasas', {
    method: 'POST',
    body: JSON.stringify({
      woredaId,
      capacity: data.capacity,
      isPublished: true,
      name: { en: data.name },
      description: { en: data.description },
    }),
  });
}

export async function updateMadrasaRecord(id: string, data: {
  name: string;
  district: string;
  capacity: number;
  description: string;
  headTeacherId: number | null;
  hifzGraduatesCount: number | null;
}): Promise<{ id: number }> {
  const woredaId = await resolveWoredaId(data.district);
  return apiRequest<{ id: number }>(`/admin/madrasas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      woredaId,
      capacity: data.capacity,
      headTeacherId: data.headTeacherId,
      hifzGraduatesCount: data.hifzGraduatesCount,
      name: { en: data.name },
      description: { en: data.description },
    }),
  });
}

export async function fetchAdminDirectoryMosques(): Promise<Mosque[]> {
  const rows = await fetchAll<ApiMosque>('/admin/mosques');
  return rows.map(mapMosque);
}

export async function fetchDirectoryMosques(): Promise<Mosque[]> {
  const rows = await fetchAll<ApiMosque>('/mosques');
  return rows.map(mapMosque);
}

function mapMosque(row: ApiMosque): Mosque {
  const district = formatWoreda(row.woreda.code);
  return {
    id: String(row.id),
    name: row.name,
    district,
    hasMadrasa: Boolean(row.madrasa),
    madrasaId: row.madrasa ? String(row.madrasa.id) : undefined,
    madrasaName: row.madrasa?.name || '',
    subCityOrWoreda: district,
    address: district,
    imam: row.imamName || 'Not listed',
    committeeChairman: '',
    establishedYear: 0,
    capacity: row.capacity || 0,
    students: 0,
    status: row.isPublished ? 'active' : 'planned',
    facilities: [row.hasWuduFacility && 'Wudu facilities', row.hasBoarding && 'Boarding']
      .filter((facility): facility is string => Boolean(facility)),
    contactPhone: '',
    image: getPublicAssetUrl(row.photos[row.photos.length - 1]?.url || ''),
    jummahAttendance: 0,
    monthlyExpensesETB: 0,
    coordinates: row.latitude != null && row.longitude != null
      ? { lat: row.latitude, lng: row.longitude }
      : undefined,
    description: row.description || '',
  };
}

export async function searchDirectoryMosques(query: string): Promise<Mosque[]> {
  const params = new URLSearchParams({ search: query, page: '1', pageSize: '100', locale: 'en' });
  const rows = await apiRequest<ApiMosque[]>(`/mosques?${params.toString()}`);
  return rows.map(mapMosque);
}

export async function fetchDirectoryMadrasas(): Promise<Madrasa[]> {
  const rows = await fetchAll<ApiMadrasa>('/madrasas');
  return rows.map(mapMadrasa);
}

export async function fetchAdminDirectoryMadrasas(): Promise<Madrasa[]> {
  const rows = await fetchAll<ApiMadrasa>('/admin/madrasas');
  return rows.map(mapMadrasa);
}

function mapMadrasa(row: ApiMadrasa): Madrasa {
  const district = formatWoreda(row.woreda.code);
  return {
    id: String(row.id),
    name: row.name,
    mosqueId: row.mosqueId == null ? '' : String(row.mosqueId),
    mosqueName: '',
    district,
    headTeacher: row.headTeacher || 'Not listed',
    headTeacherId: row.headTeacherId == null ? undefined : String(row.headTeacherId),
    hifzGraduatesCount: row.hifzGraduatesCount,
    establishedYear: 0,
    totalStudents: row.capacity || 0,
    totalTeachers: 0,
    levels: [],
    programs: [],
    status: row.isPublished ? 'active' : 'recess',
    shifts: [],
    contactPhone: '',
    image: getPublicAssetUrl(row.photos[row.photos.length - 1]?.url || ''),
    description: row.description || '',
    accreditationStatus: 'Under Review',
  };
}

export async function searchDirectoryMadrasas(query: string): Promise<Madrasa[]> {
  const params = new URLSearchParams({ search: query, page: '1', pageSize: '100', locale: 'en' });
  const rows = await apiRequest<ApiMadrasa[]>(`/madrasas?${params.toString()}`);
  return rows.map(mapMadrasa);
}
