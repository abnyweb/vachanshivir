import type { Database } from '../store/database';
import type { Attendee } from '../types';

export const listAttendees = (db: Database, eventId: string): Attendee[] =>
  db.attendees.filter((a) => a.eventId === eventId);

export function searchAttendees(attendees: Attendee[], query: string): Attendee[] {
  const q = query.trim().toLowerCase();
  if (!q) return attendees;
  return attendees.filter((a) =>
    [
      a.name,
      a.email,
      a.reference,
      a.legacyEntryId ? String(a.legacyEntryId) : '',
      a.entryId ? String(a.entryId) : '',
      a.legacyEntryId ? `#${a.legacyEntryId}` : '',
      a.organisation,
      a.city,
      a.state,
      a.phone,
    ].some((v) => v && String(v).toLowerCase().includes(q)),
  );
}

export function toCsv(attendees: Attendee[]): string {
  const header = ['Entry ID', 'Reference', 'Name', 'Email', 'Phone', 'Organisation', 'City', 'State', 'Payment', 'Check-in', 'Rooming'];
  const rows = attendees.map((a) => [
    a.legacyEntryId || a.entryId || '', a.reference, a.name, a.email, a.phone, a.organisation, a.city, a.state,
    a.paymentStatus, a.checkInStatus, a.roomingStatus,
  ]);
  return [header, ...rows]
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
