import type { Exhibitor, Stall } from '../types';
import { CURRENT_EVENT_ID } from './eventData';

const ZONES = [
  { zone: 'Main Foyer', prefix: 'F', rows: 2, cols: 6, size: '3m x 2m', type: 'Shell Scheme', price: 25000 },
  { zone: 'Resource Hall', prefix: 'R', rows: 2, cols: 6, size: '3m x 3m', type: 'Exposition Space', price: 35000 },
];

const STATUSES: Stall['status'][] = ['available', 'available', 'reserved', 'available', 'confirmed', 'paid', 'available', 'held', 'available', 'blocked', 'available', 'available'];

export const stalls: Stall[] = ZONES.flatMap((z) =>
  Array.from({ length: z.rows * z.cols }, (_, i) => {
    const row = Math.floor(i / z.cols) + 1;
    const column = (i % z.cols) + 1;
    return {
      id: `stl-${z.prefix}${String(i + 1).padStart(2, '0')}`,
      eventId: CURRENT_EVENT_ID,
      number: `${z.prefix}${String(i + 1).padStart(2, '0')}`,
      size: z.size,
      type: z.type,
      price: z.price,
      currency: 'INR',
      zone: z.zone,
      row,
      column,
      exhibitorId: null,
      status: STATUSES[i % STATUSES.length],
      facilities: ['Table', '2 Chairs', 'Spotlight', 'Power Point', 'Banner Board'],
      isDemo: false,
    } as Stall;
  }),
);

export const exhibitors: Exhibitor[] = [
  {
    id: 'exh-1', eventId: CURRENT_EVENT_ID, company: 'Grace Publications & Books',
    contactPerson: 'David Roberts', email: 'exhibits@gracepub.org', phone: '+91 98765 11223',
    website: 'https://gracepub.org', category: 'Publishing & Literature', description: 'Curated commentary collections, study Bibles, and ministry books.',
    logo: null, stallId: 'stl-R03', status: 'confirmed', paymentStatus: 'paid', isDemo: false,
  },
  {
    id: 'exh-2', eventId: CURRENT_EVENT_ID, company: 'Biblical Media & Resources',
    contactPerson: 'Sarah Thomas', email: 'info@biblicalmedia.in', phone: '+91 98765 44556',
    website: 'https://biblicalmedia.in', category: 'Digital Media & Resources', description: 'Audio Bibles, sermon archives, and ministry software tools.',
    logo: null, stallId: 'stl-F02', status: 'confirmed', paymentStatus: 'paid', isDemo: false,
  },
];
