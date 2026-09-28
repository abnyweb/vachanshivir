import type { Database } from '../store/database';
import type { Announcement, EventDocument, Faq } from '../types';

export const listDocuments = (db: Database, eventId: string): EventDocument[] =>
  db.documents.filter((d) => d.eventId === eventId);

export const listPublishedDocuments = (db: Database, eventId: string): EventDocument[] =>
  listDocuments(db, eventId).filter((d) => d.status === 'published');

export const listFaqs = (db: Database, eventId: string): Faq[] =>
  db.faqs.filter((f) => f.eventId === eventId).sort((a, b) => a.displayOrder - b.displayOrder);

export const listPublishedFaqs = (db: Database, eventId: string): Faq[] =>
  listFaqs(db, eventId).filter((f) => f.status === 'published');

export const listAnnouncements = (db: Database, eventId: string): Announcement[] =>
  db.announcements.filter((a) => a.eventId === eventId);

export const listActiveAnnouncements = (db: Database, eventId: string): Announcement[] =>
  listAnnouncements(db, eventId).filter((a) => a.active);
