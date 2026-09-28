import type { Attendee } from '../types';

export function checkInPatch(): Partial<Attendee> {
  return { checkInStatus: 'checked-in', checkedInAt: new Date().toISOString() };
}

export function undoCheckInPatch(): Partial<Attendee> {
  return { checkInStatus: 'not-arrived', checkedInAt: null };
}

export function checkInSummary(attendees: Attendee[]) {
  return {
    total: attendees.length,
    arrived: attendees.filter((a) => a.checkInStatus === 'checked-in').length,
    pending: attendees.filter((a) => a.checkInStatus === 'not-arrived').length,
  };
}
