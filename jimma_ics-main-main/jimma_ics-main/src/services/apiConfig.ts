const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be set to the production API URL before building the frontend.');
}

export const API_BASE_URL = (configuredApiBaseUrl || 'http://localhost:4000/api/v1').replace(/\/$/, '');
export const API_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

if (import.meta.env.PROD && new URL(API_BASE_URL, window.location.origin).protocol !== 'https:') {
  throw new Error('VITE_API_BASE_URL must use HTTPS in production.');
}
