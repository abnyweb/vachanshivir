import { PageHeader } from '../../components/public/PageHeader';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function Venue() {
  const event = useCurrentEvent();
  useDocumentMeta(`Venue — ${event.name} ${event.year}`, `${event.venueName}, ${event.venueAddress}`);

  return (
    <>
      <PageHeader
        title={event.venueName}
        intro={event.venueAddress}
        action={<Button href={event.venueMapUrl} variant="outline">Open in Google Maps</Button>}
      />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-2xl">
          <SectionHeading title="Getting there and settling in" />
          <p className="mt-5 text-[15px] leading-relaxed text-slate-700">
            The conference and accommodation are both at {event.venueName} in {event.venueCity}. Check-in opens at{' '}
            {event.checkInTime} and the conference closes {event.closeTime}.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
            Puri Railway Station is well connected by trains from across India. See the travel page
            for directions and practical tips.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/travel">Travel instructions</Button>
            <Button to="/registration" variant="outline">Register Now</Button>
          </div>

          <div className="mt-10 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <iframe
              title="Google Map Ishopanthi Ashram"
              src="https://maps.google.com/maps?q=Ishopanthi%20Ashram,%20Puri,%20Odisha,%20India&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-80 border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
        <aside className="h-fit border border-slate-200 bg-white rounded-3xl p-6 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">Venue Information</span>
          <p className="mt-3 font-serif text-lg font-bold text-slate-900">{event.venueName}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-slate-600">{event.venueAddress}</p>
          <Button href={event.venueMapUrl || 'https://maps.google.com/?q=Ishopanthi+Ashram+Puri+Odisha'} size="sm" variant="outline" className="mt-6 w-full">Directions in Google Maps</Button>
        </aside>
      </section>
    </>
  );
}
