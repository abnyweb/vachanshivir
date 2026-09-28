import type { Database } from '../store/database';
import type { Donation, DonationPaymentMode, DonationPaymentStatus } from '../types';

export interface CreateDonationPayload {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  paymentMode: DonationPaymentMode;
  paymentStatus?: DonationPaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  purpose?: string;
  notes?: string;
  bankDetails?: {
    bankName?: string;
    utrNumber?: string;
    accountNumber?: string;
  };
}

export function generateDonationReceipt(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `VS26-DON-${Date.now().toString().slice(-4)}${num}`;
}

export async function submitDonationToBackend(payload: CreateDonationPayload): Promise<{ success: boolean; donation?: Donation; error?: string }> {
  try {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      const data = await res.json();
      return { success: true, donation: data.donation || data };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Server rejected donation submission' };
  } catch (err: any) {
    console.warn('Backend /api/donations unreachable, storing locally:', err);
    return { success: false, error: err.message };
  }
}

export function listDonations(db: Database): Donation[] {
  return [...(db.donations || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDonationStats(donations: Donation[]) {
  const total = donations.length;
  const paidDonations = donations.filter((d) => d.paymentStatus === 'paid');
  const pendingDonations = donations.filter((d) => d.paymentStatus === 'pending');
  const totalAmountCollected = paidDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalPendingAmount = pendingDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pastorPassesSponsored = Math.floor(totalAmountCollected / 3000);
  const uniqueDonorsCount = new Set(donations.map((d) => (d.donorEmail || d.donorPhone || d.donorName).toLowerCase().trim())).size;
  const avgDonation = paidDonations.length > 0 ? Math.round(totalAmountCollected / paidDonations.length) : 0;

  return {
    total,
    paidCount: paidDonations.length,
    pendingCount: pendingDonations.length,
    totalAmountCollected,
    totalPendingAmount,
    pastorPassesSponsored,
    uniqueDonorsCount,
    avgDonation,
  };
}
