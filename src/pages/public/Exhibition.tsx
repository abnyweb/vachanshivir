import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { SectionHeading } from '../../components/common/SectionHeading';
import { Button } from '../../components/common/Button';
import { EnquiryForm } from '../../components/public/EnquiryForm';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listStalls, stallSummary } from '../../services/stallService';
import { inr } from '../../utils/format';

export default function Exhibition() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Resource Exhibition — ${event.name} ${event.year}`, 'Exhibition stalls at Vachan Shivir.');

  const stalls = listStalls(db, event.id);
  const summary = stallSummary(stalls);
  const packages = [...new Map(stalls.map((s) => [`${s.zone}-${s.type}`, s])).values()];

  return (
    <>
      <PageHeader
        title="Resource Exhibition"
        intro="Reserve a booth alongside the retreat to showcase Christian literature, study Bibles, and ministry tools to delegates from across India."
        action={<Button to="/stalls">View Floor Plan</Button>}
      />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="shell py-14">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['Total Stalls', summary.total],
              ['Available', summary.available],
              ['Reserved', summary.reserved],
              ['Confirmed', summary.sold],
            ].map(([k, v]) => (
              <div key={k as string} className="border-t border-amber-500/30 pt-4">
                <dd className="font-serif text-3xl font-bold text-amber-700 tabular-nums">{v}</dd>
                <dt className="mt-1 text-[13px] text-slate-600">{k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="shell py-14">
          <SectionHeading title="Stall Packages" intro="Every stall package includes a display table, chairs, spotlight, power point, and fascia name board." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {packages.map((p) => (
              <article key={p.id} className="border border-slate-200 bg-white rounded-2xl p-6 shadow-xs">
                <h3 className="font-serif text-xl font-bold text-slate-900">{p.zone}</h3>
                <p className="mt-1 text-xs font-bold text-amber-800 uppercase font-mono">{p.type} &bull; {p.size}</p>
                <p className="mt-3 font-serif text-2xl font-bold text-slate-900">{inr(p.price)}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.facilities.map((f) => (
                    <li key={f} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-14">
        <div className="max-w-3xl">
          <SectionHeading title="Stall Reservation Inquiry" intro="Fill in your details below and our exhibition coordinator will get back to you with stall availability." />
          <div className="mt-6">
            <EnquiryForm
              kind="stall"
              submitLabel="Send Stall Inquiry"
              messageLabel="Describe the resources or books you will be displaying"
              extraFields={[
                { name: 'stallType', label: 'Stall Package', type: 'select', options: ['Shell Scheme', 'Exposition Space'], required: true },
                { name: 'preferredStall', label: 'Preferred Stall Number', hint: 'Optional. Refer to the interactive floor plan.' },
                { name: 'representatives', label: 'Number of Booth Representatives' },
                { name: 'gstin', label: 'GSTIN (Tax Invoice)', hint: 'Optional' },
              ]}
            />
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Want to explore available locations first? <Link to="/stalls" className="text-amber-800 font-bold hover:underline">Open Floor Plan</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
