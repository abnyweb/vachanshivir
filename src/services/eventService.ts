import type { Database } from '../store/database';
import { seedDatabase } from '../store/database';
import type { EventEdition } from '../types';

export const listEvents = (db: Database): EventEdition[] => {
  const events = Array.isArray(db?.events) && db.events.length > 0 ? db.events : seedDatabase().events;
  return [...events].sort((a, b) => b.year - a.year);
};

export const getCurrentEvent = (db: Database): EventEdition => {
  const defaultEvt = seedDatabase().events[0];
  if (!db || !Array.isArray(db.events) || db.events.length === 0) {
    return defaultEvt;
  }
  const currId = db.settings?.currentEventId;
  return (currId ? db.events.find((e) => e.id === currId) : undefined) ?? db.events[0] ?? defaultEvt;
};

export const getEventBySlug = (db: Database, slug: string): EventEdition | undefined => {
  const events = Array.isArray(db?.events) && db.events.length > 0 ? db.events : seedDatabase().events;
  return events.find((e) => e.slug === slug || e.id === slug) ?? events[0];
};

export function countdownParts(target: string, from: Date = new Date()) {
  const diff = new Date(`${target}T00:00:00+05:30`).getTime() - from.getTime();
  const clamped = Math.max(diff, 0);
  return {
    expired: diff <= 0,
    days: Math.floor(clamped / 86_400_000),
    hours: Math.floor((clamped % 86_400_000) / 3_600_000),
    minutes: Math.floor((clamped % 3_600_000) / 60_000),
    seconds: Math.floor((clamped % 60_000) / 1000),
  };
}
