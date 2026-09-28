import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { useStore } from '../../store/StoreContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listEvents } from '../../services/eventService';
import { dateRange, titleCase } from '../../utils/format';

export default function Events() {
  const { db } = useStore();
  useDocumentMeta('Editions — Vachan Shivir', 'Past, current, and upcoming editions of Vachan Shivir.');

  const events = listEvents(db);

  return (
    <>
      <PageHeader title="Retreat Editions" intro="Explore current and past editions of Vachan Shivir, theme expositions, and retreat archives." />
      <section className="shell py-14">
        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {events.map((e) => (
            <li key={e.id} className="py-6">
              <Link to={`/events/${e.slug}`} className="group flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-serif text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{e.year}</span>
                <span className="flex-1">
                  <span className="block text-lg font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{e.edition} &bull; {e.theme}</span>
                  <span className="mt-0.5 block text-xs text-slate-500 font-sans">
                    {dateRange(e.startDate, e.endDate)} &bull; {e.venueName}, {e.venueCity}
                  </span>
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">{titleCase(e.status)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
