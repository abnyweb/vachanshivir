import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/public/PageHeader';
import { Lightbox } from '../../components/public/Lightbox';
import { PendingNotice } from '../../components/public/PendingNotice';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { imagesOf, listPublishedAlbums } from '../../services/galleryService';
import { cn } from '../../utils/cn';

export default function Gallery() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Gallery — ${event.name} ${event.year}`, 'Photographs from previous editions of Vachan Shivir.');

  const albums = listPublishedAlbums(db, event.id);
  const [albumId, setAlbumId] = useState(albums[0]?.id ?? '');
  const [index, setIndex] = useState<number | null>(null);

  const images = useMemo(() => imagesOf(db, albumId), [db, albumId]);
  const available = images.filter((i) => !i.pendingAsset && i.src);
  const pendingCount = images.length - available.length;

  return (
    <>
      <PageHeader title="Gallery" intro="Glimpses of the conference." />
      <section className="shell py-14">
        {albums.length === 0 ? (
          <EmptyState title="No albums yet" description="Photograph albums will appear here once published." />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {albums.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setAlbumId(a.id); setIndex(null); }}
                  aria-pressed={albumId === a.id}
                  className={cn(
                    'border rounded-xl px-4 py-2 text-[13px] transition-all',
                    albumId === a.id
                      ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                  )}
                >
                  {a.title}
                </button>
              ))}
            </div>

            {pendingCount > 0 && (
              <div className="mt-6 max-w-2xl">
                <PendingNotice what={`${pendingCount} photograph${pendingCount === 1 ? '' : 's'} in this album could not be retrieved from the live site.`} />
              </div>
            )}

            {available.length === 0 ? (
              <div className="mt-8"><EmptyState title="No photographs loaded" description="Upload photographs from Admin → Gallery to fill this album." /></div>
            ) : (
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((img, i) => (
                  <li key={img.id}>
                    <button
                      onClick={() => setIndex(i)}
                      className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs hover:border-amber-400 transition-all"
                    >
                      <img
                        src={img.src || undefined}
                        alt={img.caption || 'Conference photograph'}
                        loading="lazy"
                        width={480}
                        height={360}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {img.caption && (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {img.caption}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Lightbox images={available} index={index} onClose={() => setIndex(null)} onMove={setIndex} />
          </>
        )}
      </section>
    </>
  );
}
