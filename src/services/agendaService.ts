import type { Database } from '../store/database';
import type { Session } from '../types';

export const listSessions = (db: Database, eventId: string): Session[] =>
  db.sessions
    .filter((s) => s.eventId === eventId)
    .sort((a, b) => a.day - b.day || a.displayOrder - b.displayOrder);

export function groupByDay(sessions: Session[]): { day: number; date: string; sessions: Session[] }[] {
  const map = new Map<number, { day: number; date: string; sessions: Session[] }>();
  for (const s of sessions) {
    const entry = map.get(s.day) ?? { day: s.day, date: s.date, sessions: [] };
    entry.sessions.push(s);
    map.set(s.day, entry);
  }
  return [...map.values()].sort((a, b) => a.day - b.day);
}
