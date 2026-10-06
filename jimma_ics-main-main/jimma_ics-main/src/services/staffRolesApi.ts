import {
  RoleDefinition,
  SecurityAuditLog,
  StaffDepartment,
  User,
} from '../types';
import { apiRequest } from './authApi';

type Metadata = Record<string, unknown>;
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api/v1').replace(/\/$/, '');
const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

function resolveStaffPhotoUrl(url: string): string {
  const resolved = new URL(url, `${API_ORIGIN}/`);
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(resolved.hostname)) {
    return new URL(`${resolved.pathname}${resolved.search}${resolved.hash}`, `${API_ORIGIN}/`).toString();
  }
  return resolved.toString();
}

interface ApiRole {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  isSystemRole: boolean;
  assignedUsersCount: number;
  createdAt: string;
  updatedAt: string;
  metadata: Metadata | null;
}

interface ApiUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  role: { id: number; name: string; permissions: string[] };
  lastLoginAt: string | null;
  createdAt: string;
  metadata: Metadata | null;
}

interface ApiAuditLog {
  id: number;
  actor: { fullName: string; email: string; role: { name: string } } | null;
  action: string;
  entityType: string;
  entityId: number | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  createdAt: string;
}

const departments: StaffDepartment[] = [
  'Executive Secretariat',
  'Shariah & Fatwa Board',
  'Education Directorate',
  'Finance & Endowment',
  'Mosque & Waqf Affairs',
  'Social Services & Zakat',
  'IT & Media Communications',
];

function readMetadata(metadata: Metadata | null, key: string): string {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : '';
}

function toRole(role: ApiRole): RoleDefinition {
  const metadata = role.metadata;
  const department = readMetadata(metadata, 'department') || 'Education Directorate';
  const privilegeLevel = readMetadata(metadata, 'privilegeLevel');
  return {
    id: String(role.id),
    name: role.name,
    arabicName: readMetadata(metadata, 'arabicName') || undefined,
    department,
    description: role.description || '',
    isSystemRole: role.isSystemRole,
    privilegeLevel: ['Critical', 'High', 'Medium', 'Standard'].includes(privilegeLevel)
      ? (privilegeLevel as RoleDefinition['privilegeLevel'])
      : role.isSystemRole ? 'High' : 'Standard',
    defaultDashboard: readMetadata(metadata, 'defaultDashboard') || '/admin',
    color: readMetadata(metadata, 'color') || '#059669',
    assignedUsersCount: role.assignedUsersCount,
    permissions: role.permissions,
    createdAt: role.createdAt.slice(0, 10),
    updatedAt: role.updatedAt.slice(0, 10),
  };
}

function toStaff(user: ApiUser): User {
  const metadata = user.metadata;
  const department = readMetadata(metadata, 'department');
  const status = readMetadata(metadata, 'status');
  const customPermissions = Array.isArray(metadata?.customPermissions)
    ? metadata.customPermissions.filter((permission): permission is string => typeof permission === 'string')
    : [];
  return {
    id: String(user.id),
    name: user.fullName,
    arabicName: readMetadata(metadata, 'arabicName') || undefined,
    email: user.email,
    role: user.role.name,
    title: readMetadata(metadata, 'title') || undefined,
    department: departments.includes(department as StaffDepartment) ? department : department || undefined,
    avatar: readMetadata(metadata, 'avatar') ? resolveStaffPhotoUrl(readMetadata(metadata, 'avatar')) : undefined,
    phone: user.phone || '',
    district: readMetadata(metadata, 'district') || undefined,
    status: user.isActive ? 'Active' : status === 'On Leave' || status === 'Pending Invitation' ? status : 'Suspended',
    joinedDate: user.createdAt.slice(0, 10),
    lastLogin: user.lastLoginAt || 'Never logged in',
    twoFactorEnabled: metadata?.twoFactorEnabled === true,
    accessLevel: readMetadata(metadata, 'accessLevel') || undefined,
    permissions: Array.from(new Set([...user.role.permissions, ...customPermissions])),
    customPermissions,
    notes: readMetadata(metadata, 'notes') || undefined,
  };
}

function humanizeAuditKey(key: string): string {
  const labels: Record<string, string> = {
    id: 'ID',
    fullName: 'Full name',
    arabicName: 'Arabic name',
    isActive: 'Account status',
    lastLoginAt: 'Last login',
    createdAt: 'Created',
    customPermissions: 'Additional permissions',
    twoFactorEnabled: 'Two-factor authentication',
    avatar: 'Profile photo',
  };
  return labels[key] || key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditPermission(permission: string): string {
  const [area, ...actions] = permission.split('.');
  const formatWords = (value: string) => value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  return actions.length ? `${formatWords(area)}: ${actions.map(formatWords).join(' ')}` : formatWords(permission);
}

function formatAuditValue(value: unknown, key: string, depth = 0): string[] {
  const indent = '  '.repeat(depth);
  if (/password|token|secret|credential/i.test(key)) return [`${indent}${humanizeAuditKey(key)}: Hidden`];

  if (key === 'isActive' && typeof value === 'boolean') {
    return [`${indent}${humanizeAuditKey(key)}: ${value ? 'Active' : 'Inactive'}`];
  }
  if (key === 'twoFactorEnabled' && typeof value === 'boolean') {
    return [`${indent}${humanizeAuditKey(key)}: ${value ? 'Enabled' : 'Disabled'}`];
  }
  if ((key === 'createdAt' || key === 'lastLoginAt') && typeof value === 'string') {
    const date = new Date(value);
    return [`${indent}${humanizeAuditKey(key)}: ${Number.isNaN(date.getTime()) ? value : date.toLocaleString()}`];
  }
  if (key === 'avatar' && typeof value === 'string') {
    return [`${indent}${humanizeAuditKey(key)}: ${value ? 'Image on file' : 'None'}`];
  }
  if (Array.isArray(value)) {
    const entries = value.filter((entry): entry is string => typeof entry === 'string');
    const formatted = (key === 'permissions' || key === 'customPermissions')
      ? entries.map(formatAuditPermission)
      : entries;
    return [`${indent}${humanizeAuditKey(key)}: ${formatted.length ? formatted.join(', ') : 'None recorded'}`];
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return [`${indent}${humanizeAuditKey(key)}: No details recorded`];
    const heading = key === 'metadata' ? 'Additional staff information' : humanizeAuditKey(key);
    return [
      `${indent}${heading}:`,
      ...entries.flatMap(([childKey, childValue]) => formatAuditValue(childValue, childKey, depth + 1)),
    ];
  }
  if (value === null || value === undefined || value === '') {
    return [`${indent}${humanizeAuditKey(key)}: Not recorded`];
  }
  return [`${indent}${humanizeAuditKey(key)}: ${String(value)}`];
}

function formatAuditDetails(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value === null || value === undefined ? 'No additional details recorded.' : String(value);
  }
  return Object.entries(value)
    .flatMap(([key, fieldValue]) => formatAuditValue(fieldValue, key))
    .join('\n');
}

function toAuditLog(log: ApiAuditLog): SecurityAuditLog {
  const action = log.action.toLowerCase();
  const isDeactivated = log.after !== null
    && typeof log.after === 'object'
    && 'isActive' in log.after
    && log.after.isActive === false;
  const category: SecurityAuditLog['category'] =
    log.entityType === 'role' ? 'Role_Change' :
      log.entityType === 'auth' || log.entityType === 'session' || action === 'login' || action === 'logout'
        ? 'Auth'
        : 'Staff_Record';
  const state = log.after ?? log.before;
  return {
    id: String(log.id),
    timestamp: new Date(log.createdAt).toLocaleString(),
    actorName: log.actor?.fullName || 'System',
    actorEmail: log.actor?.email || '',
    actorRole: log.actor?.role.name || 'System',
    action: log.action,
    target: `${log.entityType}${log.entityId === null ? '' : ` #${log.entityId}`}`,
    category,
    status: /deactivat|delete/i.test(log.action) || isDeactivated ? 'Warning' : 'Success',
    ipAddress: log.ipAddress || 'Not recorded',
    details: formatAuditDetails(state),
  };
}

function toApiMetadata(value: Partial<User>): Metadata {
  return {
    ...(value.arabicName !== undefined ? { arabicName: value.arabicName } : {}),
    ...(value.title !== undefined ? { title: value.title } : {}),
    ...(value.department !== undefined ? { department: value.department } : {}),
    ...(value.district !== undefined ? { district: value.district } : {}),
    ...(value.status !== undefined ? { status: value.status } : {}),
    ...(value.accessLevel !== undefined ? { accessLevel: value.accessLevel } : {}),
    ...(value.twoFactorEnabled !== undefined ? { twoFactorEnabled: value.twoFactorEnabled } : {}),
    ...(value.avatar !== undefined ? { avatar: value.avatar } : {}),
    ...(value.notes !== undefined ? { notes: value.notes } : {}),
    ...(value.customPermissions !== undefined ? { customPermissions: value.customPermissions } : {}),
  };
}

function toRoleMetadata(value: Partial<RoleDefinition>): Metadata {
  return {
    ...(value.arabicName !== undefined ? { arabicName: value.arabicName } : {}),
    ...(value.department !== undefined ? { department: value.department } : {}),
    ...(value.privilegeLevel !== undefined ? { privilegeLevel: value.privilegeLevel } : {}),
    ...(value.defaultDashboard !== undefined ? { defaultDashboard: value.defaultDashboard } : {}),
    ...(value.color !== undefined ? { color: value.color } : {}),
  };
}

export async function fetchStaffAndRoles() {
  const [users, roles, logs] = await Promise.all([
    apiRequest<ApiUser[]>('/admin/users?page=1&pageSize=100'),
    apiRequest<ApiRole[]>('/admin/roles'),
    apiRequest<ApiAuditLog[]>('/admin/audit-logs?page=1&pageSize=100'),
  ]);
  return {
    staff: users.map(toStaff),
    roles: roles.map(toRole),
    logs: logs.map(toAuditLog),
  };
}

async function uploadStaffPhoto(id: string, photo: File) {
  const body = new FormData();
  body.append('file', photo);
  const result = await apiRequest<{ url: string }>(`/admin/users/${encodeURIComponent(id)}/photo`, {
    method: 'POST',
    body,
  });
  return resolveStaffPhotoUrl(result.url);
}

export async function createStaffRecord(
  value: Omit<User, 'id'> & { password: string },
  roles: RoleDefinition[],
  photo?: File
) {
  const role = roles.find((item) => item.name === value.role);
  if (!role) throw new Error('Select a role that exists in the backend.');
  const metadata = toApiMetadata(photo ? { ...value, avatar: undefined } : value);
  const user = await apiRequest<ApiUser>('/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      fullName: value.name,
      email: value.email,
      phone: value.phone || undefined,
      password: value.password,
      roleId: Number(role.id),
      isActive: value.status === 'Active',
      metadata,
    }),
  });
  let staff = toStaff(user);
  if (photo) {
    const avatar = await uploadStaffPhoto(staff.id, photo);
    staff = { ...staff, avatar };
  }
  return staff;
}

export async function updateStaffRecord(id: string, value: Partial<User>, roles: RoleDefinition[], photo?: File) {
  const role = value.role ? roles.find((item) => item.name === value.role) : undefined;
  if (value.role && !role) throw new Error('Select a role that exists in the backend.');
  const user = await apiRequest<ApiUser>(`/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(value.name !== undefined ? { fullName: value.name } : {}),
      ...(value.email !== undefined ? { email: value.email } : {}),
      ...(value.phone !== undefined ? { phone: value.phone || null } : {}),
      ...(role ? { roleId: Number(role.id) } : {}),
      ...(value.status !== undefined ? { isActive: value.status === 'Active' } : {}),
      metadata: toApiMetadata(photo ? { ...value, avatar: undefined } : value),
    }),
  });
  let staff = toStaff(user);
  if (photo) {
    const avatar = await uploadStaffPhoto(id, photo);
    staff = { ...staff, avatar };
  }
  return staff;
}

export async function deactivateStaffRecord(id: string) {
  const user = await apiRequest<ApiUser>(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return toStaff(user);
}

export async function createRoleRecord(value: Omit<RoleDefinition, 'id' | 'createdAt' | 'updatedAt'>) {
  const role = await apiRequest<ApiRole>('/admin/roles', {
    method: 'POST',
    body: JSON.stringify({
      name: value.name,
      description: value.description,
      permissions: value.permissions,
      metadata: toRoleMetadata(value),
    }),
  });
  return toRole(role);
}

export async function updateRoleRecord(id: string, value: Partial<RoleDefinition>) {
  const role = await apiRequest<ApiRole>(`/admin/roles/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(value.name !== undefined ? { name: value.name } : {}),
      ...(value.description !== undefined ? { description: value.description } : {}),
      ...(value.permissions !== undefined ? { permissions: value.permissions } : {}),
      metadata: toRoleMetadata(value),
    }),
  });
  return toRole(role);
}

export function deleteRoleRecord(id: string) {
  return apiRequest<void>(`/admin/roles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
