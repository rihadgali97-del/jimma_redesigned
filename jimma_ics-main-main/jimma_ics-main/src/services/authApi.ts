const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000/api/v1').replace(/\/$/, '');
const SESSION_KEY = 'jimma_ics_auth_session';

export function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function getPublicAssetUrl(path: string) {
  if (!path) return '';
  return new URL(path, new URL(API_BASE_URL, window.location.origin).origin).toString();
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  roleId: number;
  permissions: string[];
  lastLoginAt?: string | null;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message?: string };
}

function logApiResponse(method: string, path: string, response: Response, startedAt: number) {
  if (!import.meta.env.DEV) return;
  const requestId = response.headers.get('x-request-id');
  const suffix = requestId ? ` requestId=${requestId}` : '';
  console.info(`[API] ${method} ${path.split('?')[0]} -> ${response.status} (${Math.round(performance.now() - startedAt)} ms)${suffix}`);
}

function logApiFailure(method: string, path: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[API] ${method} ${path.split('?')[0]} failed: ${error instanceof Error ? error.message : 'Network error'}`);
  }
}

function readSession(): AuthSession | null {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const value = storage.getItem(SESSION_KEY);
      if (!value) continue;
      const parsed = JSON.parse(value) as AuthSession;
      if (parsed.accessToken && parsed.refreshToken) return parsed;
    } catch {
      // Ignore unavailable or malformed browser storage.
    }
  }
  return null;
}

function isFormData(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function writeSession(session: AuthSession, remember: boolean) {
  clearSession();
  const storage = remember ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    // Remove legacy demo-only login flags so they cannot restore an impersonated user.
    window.localStorage.removeItem('jimma_council_is_logged_in');
    window.localStorage.removeItem('jimma_council_current_user');
  } catch {
    // Storage may be disabled by the browser.
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !body?.success) {
    throw new Error(body?.error?.message || `Request failed (${response.status})`);
  }
  return body.data;
}

async function publicRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !isFormData(init.body) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const startedAt = performance.now();
  const method = (init.method || 'GET').toUpperCase();
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
    logApiResponse(method, path, response, startedAt);
    return await parseResponse<T>(response);
  } catch (error) {
    logApiFailure(method, path, error);
    throw error;
  }
}

let refreshInFlight: Promise<AuthSession | null> | null = null;

async function refreshSession(): Promise<AuthSession | null> {
  const current = readSession();
  if (!current) return null;

  if (!refreshInFlight) {
    refreshInFlight = publicRequest<AuthSession>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
      .then((next) => {
        const remember = Boolean(window.localStorage.getItem(SESSION_KEY));
        writeSession(next, remember);
        return next;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const startedAt = performance.now();
  const method = (init.method || 'GET').toUpperCase();
  const send = async (accessToken?: string) => {
    const headers = new Headers(init.headers);
    if (init.body && !isFormData(init.body) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  };

  try {
    let session = readSession();
    let response = await send(session?.accessToken);
    if (response.status === 401 && path !== '/auth/refresh' && session?.refreshToken) {
      session = await refreshSession();
      if (session) response = await send(session.accessToken);
    }
    logApiResponse(method, path, response, startedAt);
    return await parseResponse<T>(response);
  } catch (error) {
    logApiFailure(method, path, error);
    throw error;
  }
}

export async function apiRequestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  const startedAt = performance.now();
  const method = (init.method || 'GET').toUpperCase();
  const send = async (accessToken?: string) => {
    const headers = new Headers(init.headers);
    if (init.body && !isFormData(init.body) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  };

  try {
    let session = readSession();
    let response = await send(session?.accessToken);
    if (response.status === 401 && path !== '/auth/refresh' && session?.refreshToken) {
      session = await refreshSession();
      if (session) response = await send(session.accessToken);
    }
    logApiResponse(method, path, response, startedAt);
    if (!response.ok) {
      await parseResponse<never>(response);
      throw new Error(`Request failed (${response.status})`);
    }
    return await response.blob();
  } catch (error) {
    logApiFailure(method, path, error);
    throw error;
  }
}

export async function loginWithPassword(email: string, password: string, remember: boolean) {
  const result = await publicRequest<AuthSession & { user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  writeSession({ accessToken: result.accessToken, refreshToken: result.refreshToken }, remember);
  return result.user;
}

export function registerAccount(data: { fullName: string; email: string; phone?: string; password: string }) {
  return publicRequest<{
    accountCreated: boolean;
    awaitingRoleAssignment: boolean;
    user: AuthUser;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function restoreAuthUser() {
  if (!readSession()) return null;
  try {
    return await apiRequest<AuthUser>('/auth/me');
  } catch {
    return null;
  }
}

export async function logoutFromServer() {
  const session = readSession();
  clearSession();
  if (session?.refreshToken) {
    try {
      await publicRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    } catch {
      // Clear the local session even if the API is temporarily unreachable.
    }
  }
}
