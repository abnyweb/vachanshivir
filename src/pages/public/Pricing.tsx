import { PageHeader } from '../../components/public/PageHeader';
import { PricingCards } from '../../components/public/PricingCards';
import { Button } from '../../components/common/Button';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listActiveCategories } from '../../services/pricingService';

export default function Pricing() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Registration fees — ${event.name} ${event.year}`, 'Registration fees for Vachan Shivir 2026.');

  const categories = listActiveCategories(db, event.id);
  const early = categories.filter((c) => c.name.startsWith('Early Bird'));
  const normal = categories.filter((c) => c.name.startsWith('Normal'));

  return (
    <>
      <PageHeader
        title="Registration fees"
        intro="Full Camp Pass (₹3,000) includes 3 nights accommodation in Puri, 4 days meals, study materials and session pass."
        action={<Button to="/registration">Register</Button>}
      />

      <section className="shell space-y-14 py-14">
        {early.length > 0 && (
          <div>
            <SectionHeading title="Early bird" />
            <div className="mt-6"><PricingCards categories={early} /></div>
          </div>
        )}

        {normal.length > 0 && (
          <div>
            <SectionHeading title="Normal" />
            <div className="mt-6"><PricingCards categories={normal} /></div>
          </div>
        )}

        {early.length === 0 && normal.length === 0 && (
          <div>
            <SectionHeading
              title="शिविर पास एवं आवास विकल्प (Camp Passes & Stay Options)"
              intro="मानक रजिस्ट्रेशन शुल्क ₹3,000 में 3 रात आवास, 4 दिन भोजन एवं अध्ययन किट सम्मिलित है।"
            />
            <div className="mt-6"><PricingCards categories={categories} /></div>
          </div>
        )}

        <div className="border border-slate-200 bg-white rounded-3xl p-8 shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Paying for {event.year}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
            The {event.year} registration can be completed online through our portal with Instant UPI / QR verification.
          </p>
          <Button to="/registration" className="mt-6">Register for Vachan Shivir 2026</Button>
        </div>
      </section>
    </>
  );
}
