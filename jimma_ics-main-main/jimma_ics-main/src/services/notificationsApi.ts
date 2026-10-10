import { EventNotificationSubscription, MessageCategory } from '../types';
import { apiRequest } from './authApi';

const MANAGE_TOKEN_KEY = 'jic_notification_manage_token';

type ManagedSubscription = EventNotificationSubscription & { manageToken: string; created: boolean };

export interface PushConfiguration {
  enabled: boolean;
  publicKey: string | null;
}

export interface TelegramGatewayStatus {
  enabled: boolean;
  channelId: string;
}

export interface TelegramGatewayHistoryRecord {
  id: string;
  title: string;
  category: MessageCategory;
  content: string;
  messageId: string | null;
  channelId: string;
  status: 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface TelegramGatewayHistoryPage {
  items: TelegramGatewayHistoryRecord[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export type TelegramBroadcastCategory = Exclude<MessageCategory, 'sabaq_alert'>;

export function fetchTelegramGatewayHistory(
  page: number,
  pageSize: number,
  status?: TelegramGatewayHistoryRecord['status']
) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) query.set('status', status);
  return apiRequest<TelegramGatewayHistoryPage>(`/admin/notifications/telegram/history?${query.toString()}`);
}

export function fetchTelegramGatewayStatus() {
  return apiRequest<TelegramGatewayStatus>('/admin/notifications/telegram/status');
}

export function sendTelegramGatewayMessage(title: string, content: string, category: TelegramBroadcastCategory) {
  return apiRequest<{ channelId: string; messageId: string }>('/admin/notifications/telegram', {
    method: 'POST',
    body: JSON.stringify({ title, content, category }),
  });
}

export function readNotificationManageToken() {
  return localStorage.getItem(MANAGE_TOKEN_KEY);
}

export function storeNotificationManageToken(token: string) {
  localStorage.setItem(MANAGE_TOKEN_KEY, token);
}

export function clearNotificationManageToken() {
  localStorage.removeItem(MANAGE_TOKEN_KEY);
}

export function fetchNotificationSubscription(token: string) {
  return apiRequest<EventNotificationSubscription>('/notifications/subscriptions/current', {
    headers: { 'x-notification-manage-token': token },
  });
}

export function saveNotificationSubscription(
  data: Omit<EventNotificationSubscription, 'id' | 'subscribedAt' | 'manageToken'>,
  token?: string
) {
  return apiRequest<ManagedSubscription>('/notifications/subscriptions', {
    method: 'POST',
    headers: token ? { 'x-notification-manage-token': token } : undefined,
    body: JSON.stringify(data),
  });
}

export function deleteNotificationSubscription(token: string) {
  return apiRequest<void>('/notifications/subscriptions/current', {
    method: 'DELETE',
    headers: { 'x-notification-manage-token': token },
  });
}

export function fetchPushConfiguration() {
  return apiRequest<PushConfiguration>('/notifications/push/config');
}

export function saveBrowserPushSubscription(token: string, subscription: PushSubscriptionJSON) {
  return apiRequest<{ registered: boolean }>('/notifications/subscriptions/current/push', {
    method: 'POST',
    headers: { 'x-notification-manage-token': token },
    body: JSON.stringify(subscription),
  });
}

export function deleteBrowserPushSubscription(token: string, endpoint: string) {
  return apiRequest<void>('/notifications/subscriptions/current/push', {
    method: 'DELETE',
    headers: { 'x-notification-manage-token': token },
    body: JSON.stringify({ endpoint }),
  });
}

export function sendBrowserPushTest(token: string, endpoint: string) {
  return apiRequest<{ id: string; status: 'SENT' }>('/notifications/subscriptions/current/push/test', {
    method: 'POST',
    headers: { 'x-notification-manage-token': token },
    body: JSON.stringify({ endpoint }),
  });
}

export function verifyNotificationEmail(token: string) {
  return apiRequest<EventNotificationSubscription>('/notifications/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function decodeVapidPublicKey(value: string) {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`;
  const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
