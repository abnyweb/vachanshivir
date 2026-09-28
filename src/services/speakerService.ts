import type { Database } from '../store/database';
import type { Speaker } from '../types';

export const listSpeakers = (db: Database, eventId: string): Speaker[] =>
  db.speakers.filter((s) => s.eventId === eventId).sort((a, b) => a.displayOrder - b.displayOrder);

export const listPublishedSpeakers = (db: Database, eventId: string): Speaker[] =>
  listSpeakers(db, eventId).filter((s) => s.status === 'published');

export const getSpeaker = (db: Database, id: string): Speaker | undefined =>
  db.speakers.find((s) => s.id === id);

export function searchSpeakers(speakers: Speaker[], query: string, country: string): Speaker[] {
  const q = query.trim().toLowerCase();
  return speakers.filter((s) => {
    const matchesQuery = !q || [s.name, s.organisation, s.country, s.topic].some((v) => v.toLowerCase().includes(q));
    const matchesCountry = country === 'all' || s.country === country;
    return matchesQuery && matchesCountry;
  });
}
