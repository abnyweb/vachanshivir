import type { GalleryAlbum, GalleryImage } from '../types';
import { CURRENT_EVENT_ID } from './eventData';

export const galleryAlbums: GalleryAlbum[] = [
  { id: 'alb-2026', eventId: CURRENT_EVENT_ID, title: 'Vachan Shivir 2026', category: 'Retreat Highlights', year: 2026, coverImage: '/assets/hero-aipc-900.webp', displayOrder: 1, status: 'published' },
  { id: 'alb-glimpses', eventId: CURRENT_EVENT_ID, title: 'Glimpses of Vachan Shivir', category: 'Worship & Expositions', year: 2025, coverImage: '/assets/hero-aipc-900.webp', displayOrder: 2, status: 'published' },
];

export const galleryImages: GalleryImage[] = [
  { id: 'img-1', albumId: 'alb-2026', src: '/assets/hero-aipc-1600.webp', caption: 'Expository Keynote Session', alt: 'Delegates gathered in the main auditorium at Vachan Shivir', displayOrder: 1, pendingAsset: false },
  { id: 'img-2', albumId: 'alb-2026', src: '/assets/hero-aipc-900.webp', caption: 'Praise & Evening Assembly', alt: 'Assembly in evening praise at Vachan Shivir', displayOrder: 2, pendingAsset: false },
];
