import type { Database } from '../store/database';
import type { Sponsor, SponsorTier } from '../types';

export const TIERS: SponsorTier[] = ['principal', 'gold', 'silver', 'supporting'];

export const listSponsors = (db: Database, eventId: string): Sponsor[] =>
  db.sponsors.filter((s) => s.eventId === eventId).sort((a, b) => a.displayOrder - b.displayOrder);

export const listActiveSponsors = (db: Database, eventId: string): Sponsor[] =>
  listSponsors(db, eventId).filter((s) => s.active);

export function groupByTier(sponsors: Sponsor[]) {
  return TIERS.map((tier) => ({ tier, sponsors: sponsors.filter((s) => s.tier === tier) })).filter(
    (g) => g.sponsors.length > 0,
  );
}
