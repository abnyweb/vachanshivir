import { PageHeader } from '../../components/public/PageHeader';
import { EnquiryForm } from '../../components/public/EnquiryForm';
import { SectionHeading } from '../../components/common/SectionHeading';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { isPending } from '../../utils/format';

export default function Contact() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Contact — ${event.name} ${event.year}`, 'Contact the Vachan Shivir organising team.');

  return (
    <>
      <PageHeader title="Contact Support" intro="Have questions about registration, travel, accommodation, or group passes? Get in touch with us." />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_18rem]">
        <div className="max-w-2xl">
          <EnquiryForm kind="contact" submitLabel="Send Message" messageLabel="How can we help you?" />

          <div className="rule my-12 bg-slate-200" />

          <SectionHeading title="Speaker & Workshop Inquiries" intro="Submit speaker topics or workshop session proposals for committee review." />
          <div className="mt-6">
            <EnquiryForm
              kind="speaker-application"
              submitLabel="Send Speaker Proposal"
              messageLabel="Proposed Session Abstract"
              extraFields={[
                { name: 'topic', label: 'Proposed Topic', required: true },
                { name: 'bio', label: 'Short Biography', type: 'textarea', required: true },
                { name: 'linkedin', label: 'Website or Profile Link' },
              ]}
            />
          </div>
        </div>

        <aside className="h-fit border border-slate-200 bg-white rounded-3xl p-6 shadow-xs lg:sticky lg:top-24">
          <h2 className="font-sans text-xs uppercase font-bold tracking-widest text-amber-800">Organising Committee</h2>
          <ul className="mt-3 space-y-2">
            {db.settings.contactPhones.map((p) => (
              <li key={p}><a href={`tel:${p.replace(/\s/g, '')}`} className="text-sm font-bold text-slate-900 hover:text-amber-700">{p}</a></li>
            ))}
          </ul>
          {!isPending(db.settings.contactEmail) && (
            <a href={`mailto:${db.settings.contactEmail}`} className="mt-3 block text-xs font-bold text-amber-800 hover:underline">
              {db.settings.contactEmail}
            </a>
          )}
          <div className="rule my-5 bg-slate-200" />
          <h2 className="font-sans text-xs uppercase font-bold tracking-widest text-amber-800">Venue Address</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{db.settings.address}</p>
        </aside>
      </section>
    </>
  );
}
