import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { StatusPill } from '../../components/common/StatusPill';
import { EnquiryForm } from '../../components/public/EnquiryForm';
import { useStore } from '../../store/StoreContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getStall } from '../../services/stallService';
import { inr } from '../../utils/format';

export default function StallDetail() {
  const { id = '' } = useParams();
  const { db } = useStore();
  const stall = getStall(db, id);
  useDocumentMeta(stall ? `Stall ${stall.number} — Vachan Shivir exhibition` : 'Stall not found — Vachan Shivir');

  if (!stall) {
    return (
      <section className="shell py-20">
        <EmptyState title="Stall not found" description="That stall is not on the current floor plan." action={<Button to="/stalls" variant="outline">Back to the floor plan</Button>} />
      </section>
    );
  }

  const exhibitor = db.exhibitors.find((e) => e.id === stall.exhibitorId);

  return (
    <>
      <PageHeader eyebrow={stall.zone} title={`Stall ${stall.number}`} intro={`${stall.type}, ${stall.size}`} />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[1fr_20rem]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <StatusPill value={stall.status} />
            <span className="font-serif text-2xl font-bold text-amber-800">{inr(stall.price)}</span>
          </div>
          <h2 className="mt-8 font-serif text-xl font-bold text-slate-900">Included with this stall</h2>
          <ul className="mt-3 space-y-1.5">
            {stall.facilities.map((f) => <li key={f} className="border-l-2 border-amber-500 pl-4 text-sm text-slate-700">{f}</li>)}
          </ul>
          {exhibitor && (
            <>
              <h2 className="mt-10 font-serif text-xl font-bold text-slate-900">Assigned to</h2>
              <p className="mt-2 text-base font-medium text-slate-800">{exhibitor.company}</p>
            </>
          )}

          {stall.status === 'available' && (
            <>
              <h2 className="mt-12 font-serif text-xl font-bold text-slate-900">Enquire about stall {stall.number}</h2>
              <div className="mt-5">
                <EnquiryForm
                  kind="stall"
                  submitLabel={`Enquire about stall ${stall.number}`}
                  messageLabel="What will you be exhibiting?"
                  initialMeta={{ preferredStall: stall.number }}
                  extraFields={[
                    { name: 'preferredStall', label: 'Preferred stall number' },
                    { name: 'representatives', label: 'Number of representatives' },
                  ]}
                />
              </div>
            </>
          )}
        </div>

        <aside className="h-fit border border-slate-200 bg-white rounded-2xl p-6 shadow-xs">
          <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">Position</h2>
          <dl className="mt-3 space-y-3">
            {[['Zone', stall.zone], ['Row', String(stall.row)], ['Column', String(stall.column)]].map(([k, v]) => (
              <div key={k}><dt className="text-xs text-slate-500 font-medium">{k}</dt><dd className="text-sm font-semibold text-slate-900">{v}</dd></div>
            ))}
          </dl>
          <Button to="/stalls" variant="outline" size="sm" className="mt-6 w-full">Back to the floor plan</Button>
        </aside>
      </section>
    </>
  );
}
