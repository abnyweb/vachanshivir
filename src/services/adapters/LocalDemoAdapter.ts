import type { DataAdapter } from './types';
import { seedDatabase, type Database } from '../../store/database';

const KEY = 'vachanshivir.demo.v4';

/**
 * Development and demo adapter. Persists to localStorage so CRUD survives a refresh.
 * Contains only seed and demo data — never production attendee or payment records.
 */
export class LocalDemoAdapter implements DataAdapter {
  readonly name = 'local-demo';

  async load(): Promise<Database> {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.announcements)) {
          parsed.announcements = parsed.announcements.filter(
            (a: any) => !a.title?.includes('Quadruple') && !a.body?.includes('Quadruple')
          );
        }
        if (
          !Array.isArray(parsed.registrationCategories) ||
          parsed.registrationCategories.length === 0 ||
          parsed.registrationCategories.some((c: any) => c.eventId === 'evt-aipc-2026') ||
          !parsed.registrationCategories.some((c: any) => c.id === 'cat-std-full')
        ) {
          parsed.registrationCategories = seedDatabase().registrationCategories;
        }
        return { ...seedDatabase(), ...parsed } as Database;
      }
    } catch {
      // Corrupt or unavailable storage falls back to a clean seed.
    }
    return seedDatabase();
  }

  async persist(db: Database): Promise<void> {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      // Quota or private-mode failures are non-fatal in demo mode.
    }
  }

  async reset(): Promise<Database> {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    return seedDatabase();
  }
}
