import type { PaymentResult } from './adapters/RazorpayAdapter';

/**
 * Payment boundary for the future platform.
 *
 * During the 2026 cycle this deliberately returns 'not-configured'. The live WordPress +
 * Gravity Forms + Razorpay flow on aipc.live remains the only place money moves, and this
 * application must not interfere with it.
 */
export async function startPayment(reference: string, amount: number): Promise<PaymentResult> {
  const backend = import.meta.env.VITE_API_BASE_URL;
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!backend || !keyId || keyId.includes('placeholder')) {
    return {
      status: 'not-configured',
      message:
        `Payment is not connected in this build. Registration ${reference} for ₹${amount} has been recorded as unpaid. ` +
        'Connect a backend that creates Razorpay orders and verifies signatures before taking money here.',
    };
  }

  // Real flow: backend creates the order, checkout opens with the public key, a server-side
  // webhook verifies the signature and marks the registration paid. Never trust the client.
  return { status: 'failed', message: 'Backend order endpoint is configured but not yet implemented.' };
}
