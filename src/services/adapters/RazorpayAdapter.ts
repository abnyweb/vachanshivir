/**
 * Razorpay integration boundary.
 *
 * The key secret NEVER reaches the browser. The flow is:
 *   1. frontend asks the backend to create an order
 *   2. backend calls Razorpay with the secret and returns an order id
 *   3. frontend opens Razorpay Checkout with the PUBLIC key id and that order id
 *   4. backend verifies the signature via webhook before marking a registration paid
 *
 * Nothing here is connected during the 2026 cycle: the live WordPress + Razorpay setup
 * remains the system of record and must not be touched.
 */
export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  reference: string;
}

export interface PaymentResult {
  status: 'succeeded' | 'failed' | 'cancelled' | 'not-configured';
  orderId?: string;
  message: string;
}

export class RazorpayAdapter {
  readonly name = 'razorpay';
  private backendUrl: string;
  private publicKeyId: string;

  constructor(backendUrl: string, publicKeyId: string) {
    this.backendUrl = backendUrl;
    this.publicKeyId = publicKeyId;
  }

  async createOrder(reference: string, amount: number): Promise<PaymentOrder> {
    const res = await fetch(`${this.backendUrl}/payments/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, amount, currency: 'INR' }),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Order creation failed with ${res.status}`);
    return (await res.json()) as PaymentOrder;
  }

  get keyId(): string {
    return this.publicKeyId;
  }
}
