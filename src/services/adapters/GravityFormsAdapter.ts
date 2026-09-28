import type { Registration } from '../../types';

/**
 * Sketch for reading the live Gravity Forms registration entries once AIPC authorises it.
 *
 * The Gravity Forms REST API requires a consumer key and secret. Those must live on a
 * backend service; this class expects an already-authenticated proxy endpoint. Field IDs
 * are intentionally left as configuration because they differ per form revision.
 */
export interface GravityFieldMap {
  firstName: string; lastName: string; email: string; phone: string;
  age: string; organisation: string; city: string; state: string;
  country: string; accommodation: string;
}

export class GravityFormsAdapter {
  readonly name = 'gravity-forms-read-only';
  private proxyUrl: string;
  private formId: string;
  private fields: GravityFieldMap;

  constructor(proxyUrl: string, formId: string, fields: GravityFieldMap) {
    this.proxyUrl = proxyUrl;
    this.formId = formId;
    this.fields = fields;
  }

  /** Maps Gravity entries onto the platform's Registration model. Read-only. */
  async listRegistrations(): Promise<Registration[]> {
    const res = await fetch(`${this.proxyUrl}/forms/${this.formId}/entries?per_page=200`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Gravity Forms request failed with ${res.status}`);
    const payload = (await res.json()) as { entries: Record<string, string>[] };
    return payload.entries.map((e) => this.toRegistration(e));
  }

  private toRegistration(entry: Record<string, string>): Registration {
    const f = this.fields;
    return {
      id: `gf-${entry.id}`,
      reference: `GF-${entry.id}`,
      eventId: 'evt-aipc-2026',
      firstName: entry[f.firstName] ?? '',
      lastName: entry[f.lastName] ?? '',
      email: entry[f.email] ?? '',
      phone: entry[f.phone] ?? '',
      age: entry[f.age] ? Number(entry[f.age]) : null,
      organisation: entry[f.organisation] ?? '',
      designation: '',
      city: entry[f.city] ?? '',
      state: entry[f.state] ?? '',
      country: entry[f.country] ?? 'India',
      categoryId: entry[f.accommodation] ?? '',
      addOns: [],
      amount: 0, tax: 0, total: 0, currency: 'INR',
      paymentStatus: 'unpaid',
      status: 'submitted',
      notes: 'Imported from Gravity Forms',
      createdAt: entry.date_created ?? '',
      isDemo: false,
    };
  }
}
