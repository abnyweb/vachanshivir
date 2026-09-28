import type { Database } from '../store/database';
import type { Exhibitor } from '../types';

export const listExhibitors = (db: Database, eventId: string): Exhibitor[] =>
  db.exhibitors.filter((e) => e.eventId === eventId);

export const listPublicExhibitors = (db: Database, eventId: string): Exhibitor[] =>
  listExhibitors(db, eventId).filter((e) => e.status === 'confirmed');

export function searchExhibitors(exhibitors: Exhibitor[], query: string, category: string): Exhibitor[] {
  const q = query.trim().toLowerCase();
  return exhibitors.filter((e) => {
    const matchesQuery = !q || [e.company, e.category, e.contactPerson].some((v) => v.toLowerCase().includes(q));
    return matchesQuery && (category === 'all' || e.category === category);
  });
}
