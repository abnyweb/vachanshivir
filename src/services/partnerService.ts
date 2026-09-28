import type { Database } from '../store/database';
import type { Partner } from '../types';

export const listPartners = (db: Database, eventId: string): Partner[] =>
  db.partners.filter((p) => p.eventId === eventId).sort((a, b) => a.displayOrder - b.displayOrder);

export const listActivePartners = (db: Database, eventId: string): Partner[] =>
  listPartners(db, eventId).filter((p) => p.active);
