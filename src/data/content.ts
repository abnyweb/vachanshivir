import type { Announcement, EventDocument, Enquiry, Registration, Attendee, Room, SiteSettings } from '../types';
import { CURRENT_EVENT_ID } from './eventData';

export const siteSettings: SiteSettings = {
  siteName: 'वचन अध्ययन शिविर 2026 (Vachan Adhyayan Shivir 2026)',
  contactEmail: 'support@abny.in',
  contactPhones: ['9696110134'],
  whatsapp: '9696110134',
  address: 'Ishopanthi Ashram, Baliapanda Road, Near Light House, Puri – 752001, Odisha',
  social: [
    { label: 'YouTube', url: 'https://youtube.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
  ],
  currentEventId: CURRENT_EVENT_ID,
  registrationOpen: true,
  registrationExternalUrl: '',
};

export const announcements: Announcement[] = [
  {
    id: 'ann-1',
    eventId: CURRENT_EVENT_ID,
    kind: 'notice',
    title: 'सीमित सीटों के कारण कृपया शीघ्र ही पंजीकरण कर अपनी सीट सुनिश्चित करें!',
    body: '26 से 29 अक्टूबर 2026 (4 Days) | Ishopanthi Ashram, Puri, Odisha | पंजीकरण शुल्क ₹3000 मात्र।',
    active: true,
    date: '2026-09-12',
  },
  {
    id: 'ann-2',
    eventId: CURRENT_EVENT_ID,
    kind: 'notice',
    title: 'वचन अध्ययन शिविर 2026 - मुख्य उद्देश्य एवं विषय',
    body: 'परमेश्वर के वचन को सही रीति से समझना, जीवन में लागू करना और विश्वासयोग्यता से सिखाना।',
    active: true,
    date: '2026-09-12',
  },
];

export const documents: EventDocument[] = [
  {
    id: 'doc-1',
    eventId: CURRENT_EVENT_ID,
    title: 'Travel & Location Guide',
    description: 'Station and airport directions to Ishopanthi Ashram, Baliapanda Road, Puri, Odisha.',
    category: 'Travel',
    file: null,
    date: '2026-05-01',
    status: 'published',
    pendingAsset: false,
  },
  {
    id: 'doc-2',
    eventId: CURRENT_EVENT_ID,
    title: 'Vachan Shivir 2026 Brochure',
    description: 'Comprehensive guide to keynote sessions, speakers, and schedule.',
    category: 'General',
    file: null,
    date: '2026-06-01',
    status: 'published',
    pendingAsset: false,
  },
];

import initialRegistrations from './importedRegistrations.json';
import initialAttendees from './importedAttendees.json';

/** Master registrations list — seeded with 528 delegate entries and synced dynamically */
export const registrations: Registration[] = initialRegistrations as unknown as Registration[];

/** Master attendees list — seeded with 528 delegate entries and synced dynamically */
export const attendees: Attendee[] = initialAttendees as unknown as Attendee[];

export const rooms: Room[] = [
  { id: 'room-1', eventId: CURRENT_EVENT_ID, number: '101', block: 'Ashram Block A', sharingType: 'quadruple', capacity: 4, checkIn: '2026-10-26', checkOut: '2026-10-29', status: 'available', isDemo: false },
  { id: 'room-2', eventId: CURRENT_EVENT_ID, number: '102', block: 'Ashram Block A', sharingType: 'triple', capacity: 3, checkIn: '2026-10-26', checkOut: '2026-10-29', status: 'available', isDemo: false },
  { id: 'room-3', eventId: CURRENT_EVENT_ID, number: '201', block: 'Ashram Block B', sharingType: 'double', capacity: 2, checkIn: '2026-10-26', checkOut: '2026-10-29', status: 'available', isDemo: false },
];

export const enquiries: Enquiry[] = [];
