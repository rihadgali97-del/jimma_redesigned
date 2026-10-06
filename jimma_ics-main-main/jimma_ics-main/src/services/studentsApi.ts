import { Student } from '../types';
import { apiRequest } from './authApi';

type ApiStudent = Omit<
  Student,
  | 'id'
  | 'madrasaId'
  | 'madrasaName'
  | 'teacherId'
  | 'teacherName'
  | 'guardianName'
  | 'guardianPhone'
  | 'arabicName'
  | 'sabaqSurah'
  | 'sabaqAyahStart'
  | 'sabaqAyahEnd'
  | 'sabaqiJuz'
  | 'manzilJuz'
  | 'dailyAttendance'
  | 'level'
  | 'graduationYear'
  | 'avatar'
> & {
  id: number;
  madrasaId: number;
  madrasaName: string;
  teacherId: string | null;
  teacherName: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  arabicName: string | null;
  sabaqSurah: string | null;
  sabaqAyahStart: number | null;
  sabaqAyahEnd: number | null;
  sabaqiJuz: number | null;
  manzilJuz: string | null;
  dailyAttendance: Student['dailyAttendance'] | null;
  level: string | null;
  graduationYear: number | null;
  avatar: string | null;
};

function mapStudent(record: ApiStudent): Student {
  return {
    ...record,
    id: String(record.id),
    madrasaId: String(record.madrasaId),
    teacherId: record.teacherId || '',
    teacherName: record.teacherName || 'Not assigned',
    guardianName: record.guardianName || record.parentName,
    guardianPhone: record.guardianPhone || record.parentPhone,
    dailyAttendance: record.dailyAttendance || undefined,
    level: record.level || undefined,
    graduationYear: record.graduationYear || undefined,
    avatar: record.avatar || undefined,
    arabicName: record.arabicName || undefined,
    sabaqSurah: record.sabaqSurah || undefined,
    sabaqAyahStart: record.sabaqAyahStart || undefined,
    sabaqAyahEnd: record.sabaqAyahEnd || undefined,
    sabaqiJuz: record.sabaqiJuz || undefined,
    manzilJuz: record.manzilJuz || undefined,
  };
}

async function fetchStudents(): Promise<Student[]> {
  const records: Student[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const rows = await apiRequest<ApiStudent[]>(`/admin/students?page=${page}&pageSize=100`);
    records.push(...rows.map(mapStudent));
    if (rows.length < 100) break;
  }
  return records;
}

function toApiStudent(data: Partial<Student>) {
  const fields = { ...data };
  delete fields.id;
  delete fields.madrasaName;
  return {
    ...fields,
    ...(data.madrasaId !== undefined ? { madrasaId: Number(data.madrasaId) } : {}),
    ...(data.teacherId !== undefined ? { teacherId: data.teacherId || null } : {}),
  };
}

export const fetchAdminStudents = fetchStudents;

export async function createStudentRecord(data: Omit<Student, 'id'>): Promise<Student> {
  const record = await apiRequest<ApiStudent>('/admin/students', {
    method: 'POST',
    body: JSON.stringify(toApiStudent(data)),
  });
  return mapStudent(record);
}

export async function updateStudentRecord(id: string, updates: Partial<Student>): Promise<Student> {
  const record = await apiRequest<ApiStudent>(`/admin/students/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiStudent(updates)),
  });
  return mapStudent(record);
}
