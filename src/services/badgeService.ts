import type { Attendee, EventEdition } from '../types';

export interface BadgePayload {
  reference: string;
  name: string;
  organisation: string;
  designation: string;
  eventName: string;
  eventDates: string;
  qrValue: string;
}

export function buildBadge(attendee: Attendee, event: EventEdition): BadgePayload {
  return {
    reference: attendee.reference,
    name: attendee.name,
    organisation: attendee.organisation,
    designation: attendee.designation,
    eventName: `${event.name} ${event.year}`,
    eventDates: `${event.startDate} to ${event.endDate}`,
    // Scanned at the desk. A real QR image is generated server-side at print time.
    qrValue: `VS:${event.year}:${attendee.reference}`,
  };
}
