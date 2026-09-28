import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listActiveAnnouncements } from '../../services/documentService';
import { longDate, titleCase } from '../../utils/format';

export default function News() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Announcements — ${event.name} ${event.year}`);

  const announcements = listActiveAnnouncements(db, event.id);

  return (
    <>
      <PageHeader title="Announcements" intro="Updates from the organising team." />
      <section className="shell py-14">
        {announcements.length === 0 ? (
          <EmptyState title="Nothing to announce" description="Updates from the team will appear here." />
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {announcements.map((a) => (
              <li key={a.id} className="py-6">
                <p className="text-xs font-bold text-amber-800 uppercase font-mono">{titleCase(a.kind)}{a.date && ` · ${longDate(a.date)}`}</p>
                <h2 className="mt-1.5 font-serif text-xl font-bold text-slate-900">{a.title}</h2>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-700 font-sans">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
