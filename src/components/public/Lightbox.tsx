import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from '../../types';

interface Props {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onMove: (next: number) => void;
}

export function Lightbox({ images, index, onClose, onMove }: Props) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onMove((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onMove]);

  if (index === null) return null;
  const image = images[index];

  return (
    <div role="dialog" aria-modal="true" aria-label={image.caption} className="fixed inset-0 z-[85] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm text-white/70">{index + 1} of {images.length}</p>
        <button onClick={onClose} aria-label="Close gallery" className="p-2 text-white"><X size={20} /></button>
      </div>
      <div className="flex flex-1 items-center justify-center px-2 pb-4">
        <button
          onClick={() => onMove((index - 1 + images.length) % images.length)}
          aria-label="Previous image"
          className="p-3 text-white/70 hover:text-white"
        >
          <ChevronLeft size={26} />
        </button>
        <figure className="flex max-h-full min-w-0 flex-1 flex-col items-center">
          <img src={image.src ?? ''} alt={image.alt} className="max-h-[70vh] w-auto max-w-full object-contain" />
          <figcaption className="mt-3 px-4 text-center text-sm text-white/60">{image.caption}</figcaption>
        </figure>
        <button
          onClick={() => onMove((index + 1) % images.length)}
          aria-label="Next image"
          className="p-3 text-white/70 hover:text-white"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
}
