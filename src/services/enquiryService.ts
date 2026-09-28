import type { Database } from '../store/database';
import type { Enquiry, EnquiryKind } from '../types';
import { enquiryReference, uid } from '../utils/ids';

export const ENQUIRY_LABELS: Record<EnquiryKind, string> = {
  contact: 'Contact',
  'speaker-application': 'Speaker application',
  sponsor: 'Sponsorship',
  exhibitor: 'Exhibitor',
  stall: 'Stall booking',
};

export const listEnquiries = (db: Database, eventId: string): Enquiry[] =>
  db.enquiries.filter((e) => e.eventId === eventId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function nextEnquiryReference(db: Database): string {
  const used = db.enquiries.map((e) => Number(e.reference.split('-')[1])).filter(Number.isFinite);
  return enquiryReference((used.length ? Math.max(...used) : 0) + 1);
}

export function buildEnquiry(
  kind: EnquiryKind,
  eventId: string,
  reference: string,
  fields: { name: string; email: string; phone?: string; organisation?: string; subject?: string; message: string },
  meta: Record<string, string> = {},
): Enquiry {
  return {
    id: uid('enq'),
    reference,
    eventId,
    kind,
    name: fields.name.trim(),
    email: fields.email.trim(),
    phone: (fields.phone ?? '').trim(),
    organisation: (fields.organisation ?? '').trim(),
    subject: (fields.subject ?? ENQUIRY_LABELS[kind]).trim(),
    message: fields.message.trim(),
    meta,
    status: 'new',
    notes: '',
    createdAt: new Date().toISOString(),
    isDemo: true,
  };
}
