import type { Database } from '../store/database';
import type { CRMContact, EventParticipation, Registration } from '../types';
import { uid } from '../utils/ids';

export function findMatchingContact(db: Database, email: string, phone?: string, name?: string, org?: string): CRMContact | undefined {
  const eNorm = email.trim().toLowerCase();
  const pNorm = (phone || '').replace(/\D/g, '');
  const nNorm = (name || '').trim().toLowerCase();
  const oNorm = (org || '').trim().toLowerCase();

  return (db.crmContacts || []).find((c) => {
    if (eNorm && c.email.toLowerCase() === eNorm) return true;
    if (pNorm && c.phone && c.phone.replace(/\D/g, '') === pNorm) return true;
    if (nNorm && oNorm && c.fullName.toLowerCase() === nNorm && (c.organisation || '').toLowerCase() === oNorm) return true;
    return false;
  });
}

export function syncRegistrationToCRM(db: Database, reg: Registration): { contact: CRMContact; participation: EventParticipation } {
  let contact = findMatchingContact(db, reg.email, reg.phone, `${reg.firstName} ${reg.lastName}`, reg.organisation);
  const now = new Date().toISOString();

  if (!contact) {
    contact = {
      id: uid('crm_cnt'),
      firstName: reg.firstName,
      lastName: reg.lastName,
      fullName: `${reg.firstName} ${reg.lastName}`.trim(),
      email: reg.email,
      phone: reg.phone,
      whatsapp: reg.phone,
      age: reg.age,
      country: reg.country,
      state: reg.state,
      city: reg.city,
      churchName: reg.organisation,
      churchDenomination: 'Non-Denominational',
      role: reg.designation || 'Delegate',
      organisation: reg.organisation,
      designation: reg.designation,
      contactType: 'delegate',
      lifecycle: 'attendee',
      leadSource: 'Registration',
      tags: ['VS-2026', 'DELEGATE'],
      consent: true,
      createdAt: now,
      updatedAt: now,
    };
    db.crmContacts.unshift(contact);
  } else {
    contact.updatedAt = now;
    if (!contact.tags.includes('VS-2026')) contact.tags.push('VS-2026');
  }

  // Event Participation record
  let participation = (db.eventParticipations || []).find((p) => p.registrationId === reg.id);
  if (!participation) {
    participation = {
      id: uid('part'),
      contactId: contact.id,
      eventId: reg.eventId,
      eventYear: 2026,
      eventName: 'Vachan Shivir 2026',
      registrationId: reg.id,
      reference: reg.reference,
      role: reg.designation || 'Delegate',
      categoryName: reg.categoryId,
      amountPaid: reg.total,
      paymentStatus: reg.paymentStatus,
      attended: false,
      createdAt: now,
    };
    db.eventParticipations.unshift(participation);
  } else {
    participation.amountPaid = reg.total;
    participation.paymentStatus = reg.paymentStatus;
  }

  return { contact, participation };
}
