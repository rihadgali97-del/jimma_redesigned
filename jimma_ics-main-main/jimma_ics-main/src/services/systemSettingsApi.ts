import { apiRequest } from './authApi';

export interface SystemSettingsStatus {
  checkedAt: string;
  database: 'connected' | 'unavailable';
  integrations: {
    telegram: boolean;
    email: boolean;
    cloudinary: boolean;
    browserNotifications: boolean;
  };
}

export function fetchSystemSettingsStatus() {
  return apiRequest<SystemSettingsStatus>('/admin/system-settings/status');
}
