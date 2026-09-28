import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { EnquiryForm } from '../../components/public/EnquiryForm';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { groupByTier, listActiveSponsors } from '../../services/sponsorService';
import { titleCase } from '../../utils/format';

export default function Sponsors() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Sponsors — ${event.name} ${event.year}`);

  const groups = groupByTier(listActiveSponsors(db, event.id));

  return (
    <>
      <PageHeader title="Sponsors" intro="Organisations supporting the conference." />
      <section className="shell space-y-14 py-14">
        {groups.length === 0 ? (
          <EmptyState
            title="No sponsors published"
            description="Vachan Shivir has not published sponsors for this edition. If your organisation would like to support the conference, send an enquiry below."
          />
        ) : (
          groups.map((g) => (
            <div key={g.tier}>
              <SectionHeading title={titleCase(g.tier)} />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.sponsors.map((s) => (
                  <article key={s.id} className="border border-slate-200 bg-white rounded-2xl p-6 shadow-xs">
                    {s.logo && <img src={s.logo} alt="" loading="lazy" width={160} height={80} className="mb-4 h-14 w-auto object-contain" />}
                    <h3 className="font-serif text-xl font-bold text-slate-900">{s.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 font-sans">{s.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="max-w-3xl">
          <SectionHeading title="Sponsorship enquiry" intro="Tell us about your organisation and how you would like to help." />
          <div className="mt-6">
            <EnquiryForm
              kind="sponsor"
              submitLabel="Send sponsorship enquiry"
              messageLabel="How would you like to support Vachan Shivir?"
              extraFields={[{ name: 'budget', label: 'Indicative budget', hint: 'Optional.' }]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
