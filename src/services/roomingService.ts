import type { Database } from '../store/database';
import type { Attendee, Room } from '../types';

export const listRooms = (db: Database, eventId: string): Room[] =>
  db.rooms.filter((r) => r.eventId === eventId).sort((a, b) => a.number.localeCompare(b.number));

export const occupantsOf = (attendees: Attendee[], roomId: string): Attendee[] =>
  attendees.filter((a) => a.roomId === roomId);

export function roomStatusFor(room: Room, occupied: number): Room['status'] {
  if (room.status === 'blocked') return 'blocked';
  if (occupied === 0) return 'available';
  return occupied >= room.capacity ? 'full' : 'partial';
}

export function roomingSummary(rooms: Room[], attendees: Attendee[]) {
  const assigned = attendees.filter((a) => a.roomId).length;
  return {
    rooms: rooms.length,
    beds: rooms.reduce((sum, r) => sum + r.capacity, 0),
    assigned,
    unassigned: attendees.length - assigned,
  };
}
