import type { Database } from '../store/database';
import type { GalleryAlbum, GalleryImage } from '../types';

export const listAlbums = (db: Database, eventId: string): GalleryAlbum[] =>
  db.galleryAlbums.filter((a) => a.eventId === eventId).sort((a, b) => a.displayOrder - b.displayOrder);

export const listPublishedAlbums = (db: Database, eventId: string): GalleryAlbum[] =>
  listAlbums(db, eventId).filter((a) => a.status === 'published');

export const imagesOf = (db: Database, albumId: string): GalleryImage[] =>
  db.galleryImages.filter((i) => i.albumId === albumId).sort((a, b) => a.displayOrder - b.displayOrder);

export const availableImagesOf = (db: Database, albumId: string): GalleryImage[] =>
  imagesOf(db, albumId).filter((i) => !i.pendingAsset && i.src);
