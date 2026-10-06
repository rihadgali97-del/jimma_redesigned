import { Teacher } from '../types';
import { apiRequest } from './authApi';

interface ApiTeacher extends Omit<Teacher, 'id' | 'madrasaId' | 'phone' | 'email'> {
  id: number;
  madrasaId: number;
  madrasaName: string;
  phone?: string;
  email?: string;
  district?: string;
}

export type TeacherInput = Omit<Teacher, 'id' | 'madrasaName'> & { madrasaName?: string };

function mapTeacher(record: ApiTeacher): Teacher {
  return {
    ...record,
    id: String(record.id),
    madrasaId: String(record.madrasaId),
    phone: record.phone || '',
    email: record.email || '',
    assignedStudentsCount: record.assignedStudentsCount ?? record.studentsCount,
  };
}

async function fetchTeachers(path: string): Promise<Teacher[]> {
  const all: Teacher[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const rows = await apiRequest<ApiTeacher[]>(`${path}?page=${page}&pageSize=100`);
    all.push(...rows.map(mapTeacher));
    if (rows.length < 100) break;
  }
  return all;
}

export const fetchPublicTeachers = () => fetchTeachers('/teachers');
export const fetchAdminTeachers = () => fetchTeachers('/admin/teachers');

export async function fetchPublicTeacher(id: string): Promise<Teacher> {
  const record = await apiRequest<ApiTeacher>(`/teachers/${encodeURIComponent(id)}`);
  return mapTeacher(record);
}

export async function createTeacherRecord(data: TeacherInput): Promise<Teacher> {
  const record = await apiRequest<ApiTeacher>('/admin/teachers', {
    method: 'POST',
    body: JSON.stringify({ ...data, madrasaId: Number(data.madrasaId) }),
  });
  return mapTeacher(record);
}

export async function updateTeacherRecord(id: string, data: Partial<TeacherInput>): Promise<Teacher> {
  const record = await apiRequest<ApiTeacher>(`/admin/teachers/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...data,
      ...(data.madrasaId !== undefined ? { madrasaId: Number(data.madrasaId) } : {}),
    }),
  });
  return mapTeacher(record);
}

export function deleteTeacherRecord(id: string) {
  return apiRequest<void>(`/admin/teachers/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
