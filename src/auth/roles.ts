import type { AdminRole } from '../types';

/**
 * Which admin areas each role may open. In production this list is enforced by the backend
 * as well; the frontend copy decides navigation display and access boundaries.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ['*'],
  CONTENT_ADMIN: [
    'dashboard',
    'registrations',
    'attendees',
    'events',
    'programme',
    'speakers',
    'announcements',
    'gallery',
    'documents',
    'faqs',
    'enquiries',
    'check-in',
    'badges',
  ],
  PARTICIPANT: ['participant', 'my-vachanshivir'],
  EVENT_ADMIN: ['dashboard', 'events', 'programme', 'speakers', 'announcements', 'documents', 'faqs', 'settings'],
  REGISTRATION_ADMIN: ['dashboard', 'registrations', 'attendees', 'pricing', 'rooming', 'check-in', 'badges'],
  PAYMENT_ADMIN: ['dashboard', 'registrations', 'pricing'],
  CRM_ADMIN: ['dashboard', 'registrations', 'attendees'],
  EXHIBITION_ADMIN: ['dashboard', 'exhibitors', 'stalls', 'sponsors', 'partners', 'enquiries'],
  CHECKIN_ADMIN: ['dashboard', 'check-in', 'attendees', 'badges'],
  RESOURCE_ADMIN: ['dashboard', 'documents', 'gallery'],
  EVENT_MANAGER: ['dashboard', 'operations', 'attendees', 'check-in', 'badges', 'rooming', 'whatsapp'],
  CHECKIN_MANAGER: ['dashboard', 'check-in', 'attendees'],
};
