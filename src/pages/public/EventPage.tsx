import { PageHeader } from '../../components/public/PageHeader';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Button } from '../../components/common/Button';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { dateRange } from '../../utils/format';

export default function EventPage() {
  const event = useCurrentEvent();
  useDocumentMeta(`About ${event.name} ${event.year}`, event.description);

  const facts = [
    ['Edition', `${event.edition}, ${event.year}`],
    ['Dates', dateRange(event.startDate, event.endDate)],
    ['Check-in', event.checkInTime],
    ['Closes', event.closeTime],
    ['Venue', `${event.venueName}, ${event.venueAddress}`],
    ['Organiser', event.organiser],
    ['Who attends', event.audience],
    ['Language', 'English'],
  ];

  return (
    <>
      <PageHeader eyebrow={`${event.edition} · ${event.year}`} title="About the conference" intro={event.description} />

      <section className="border-b border-slate-200">
        <div className="shell grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading title={`Theme: “${event.theme}”`} intro={event.themeBlurb} />
            <blockquote className="mt-7 border-l-4 border-amber-500 pl-5 py-3 pr-4 bg-amber-50/70 rounded-r-2xl font-serif text-lg leading-relaxed text-slate-800 italic">
              {event.themeScripture}
            </blockquote>

            <h3 className="mt-12 font-serif text-2xl font-bold text-slate-900">What the conference is for</h3>
            <ul className="mt-5 space-y-3">
              {event.objectives.map((o) => (
                <li key={o} className="border-l-4 border-amber-500 pl-4 py-1 text-[15px] leading-relaxed text-slate-700 bg-amber-50/40 rounded-r-xl">{o}</li>
              ))}
            </ul>

            <h3 className="mt-12 font-serif text-2xl font-bold text-slate-900">Before you register</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{event.eligibilityNotice}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{event.languageNotice}</p>

            <h3 className="mt-12 font-serif text-2xl font-bold text-slate-900">Organiser</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-700">{event.organiserBlurb}</p>
            <Button href={event.organiserUrl} variant="outline" className="mt-6">Visit {event.organiser}</Button>
          </div>

          <aside className="h-fit border border-slate-200 bg-white rounded-3xl p-6 shadow-xs lg:sticky lg:top-24">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">Key information</span>
            <dl className="mt-4 space-y-3 divide-y divide-slate-100">
              {facts.map(([k, v]) => (
                <div key={k} className="pt-2">
                  <dt className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
            <Button to="/registration" className="mt-6 w-full">Register</Button>
          </aside>
        </div>
      </section>
    </>
  );
}
