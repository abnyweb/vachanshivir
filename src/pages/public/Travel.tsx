import { PageHeader } from '../../components/public/PageHeader';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Button } from '../../components/common/Button';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { travelByAir, travelByTrain, travelTips } from '../../data/travel';

export default function Travel() {
  const event = useCurrentEvent();
  useDocumentMeta(`Travel — ${event.name} ${event.year}`, `How to reach ${event.venueName}, ${event.venueCity}.`);

  return (
    <>
      <PageHeader
        title="Travel"
        intro={`How to reach ${event.venueName}, ${event.venueCity}.`}
        action={<Button href={event.venueMapUrl} variant="outline">Open in Google Maps</Button>}
      />

      <section className="shell space-y-14 py-14">
        <div className="max-w-2xl">
          <SectionHeading title="By train" intro={travelByTrain.nearest} />
          <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {travelByTrain.stations.map((s) => (
              <li key={s.name} className="py-4">
                <h3 className="font-serif text-lg font-bold text-slate-900">{s.name}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{s.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[14px] leading-relaxed text-slate-600">{travelByTrain.throughThane}</p>
        </div>

        <div className="max-w-2xl">
          <SectionHeading title="By air" intro={travelByAir.note} />
          <p className="mt-5 text-[15px] leading-relaxed text-slate-700">{travelByAir.advice}</p>
        </div>

        <div className="max-w-2xl">
          <SectionHeading title="Practical tips" />
          <ul className="mt-6 space-y-3">
            {travelTips.map((t) => (
              <li key={t} className="border-l-4 border-amber-500 pl-4 py-1 text-[15px] leading-relaxed text-slate-700 bg-amber-50/40 rounded-r-xl">{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
