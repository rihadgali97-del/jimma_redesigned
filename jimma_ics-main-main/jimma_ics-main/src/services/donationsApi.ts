import { apiRequest } from './authApi';

export interface DonationIntentRecord {
  id: string;
  reference: string;
  donorName: string | null;
  donorPhone: string;
  donorEmail: string | null;
  anonymous: boolean;
  amountETB: number;
  fundName: string;
  category: string;
  paymentMethod: 'TELEBIRR' | 'CBE_BIRR' | 'AWASH_BANK' | 'BANK_TRANSFER';
  status: 'PENDING_PAYMENT' | 'PAYMENT_REPORTED' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export function fetchDonationIntents() {
  return apiRequest<DonationIntentRecord[]>('/admin/donations/intents');
}
