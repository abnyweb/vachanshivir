import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getEventBySlug } from '../../services/eventService';
import { listSessions } from '../../services/agendaService';
import { listPublishedSpeakers } from '../../services/speakerService';
import { listPublishedAlbums } from '../../services/galleryService';
import { dateRange } from '../../utils/format';

export default function EventDetail() {
  const { slug = '' } = useParams();
  const { db } = useStore();
  const event = getEventBySlug(db, slug);
  useDocumentMeta(event ? `Vachan Shivir ${event.year} — ${event.theme}` : 'Edition not found — Vachan Shivir');

  if (!event) {
    return (
      <section className="shell py-20">
        <EmptyState title="Edition not found" description="That edition is not in the archive." action={<Button to="/events" variant="outline">All editions</Button>} />
      </section>
    );
  }

  const sessions = listSessions(db, event.id);
  const speakers = listPublishedSpeakers(db, event.id);
  const albums = listPublishedAlbums(db, event.id);

  return (
    <>
      <PageHeader
        eyebrow={`${event.edition} · ${event.year}`}
        title={event.theme === 'Content pending' ? `Vachan Shivir ${event.year}` : `“${event.theme}”`}
        intro={event.description}
      />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_18rem]">
        <div className="max-w-2xl space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ['Dates', dateRange(event.startDate, event.endDate)],
                ['Venue', `${event.venueName}, ${event.venueCity}`],
                ['Organiser', event.organiser],
                ['Sessions on record', String(sessions.length)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="mt-0.5 text-[15px] font-semibold text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {event.themeBlurb && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <p className="text-[15px] leading-relaxed text-slate-700">{event.themeBlurb}</p>
            </div>
          )}
        </div>

        <aside className="h-fit border border-slate-200 bg-white rounded-3xl p-6 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">This edition</span>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li><Link to="/programme" className="text-slate-700 font-medium hover:text-amber-800 flex items-center justify-between">Programme <span>({sessions.length})</span></Link></li>
            <li><Link to="/speakers" className="text-slate-700 font-medium hover:text-amber-800 flex items-center justify-between">Speakers <span>({speakers.length})</span></Link></li>
            <li><Link to="/gallery" className="text-slate-700 font-medium hover:text-amber-800 flex items-center justify-between">Gallery <span>({albums.length})</span></Link></li>
          </ul>
          {event.status === 'current' && <Button to="/registration" size="sm" className="mt-5 w-full">Register</Button>}
        </aside>
      </section>
    </>
  );
}
