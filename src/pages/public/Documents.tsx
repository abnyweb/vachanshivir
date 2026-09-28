import { Download, FileText } from 'lucide-react';
import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listPublishedDocuments } from '../../services/documentService';
import { longDate } from '../../utils/format';

export default function Documents() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Documents — ${event.name} ${event.year}`);

  const documents = listPublishedDocuments(db, event.id);

  return (
    <>
      <PageHeader title="Documents" intro="Brochures, instructions and policies you can download." />
      <section className="shell py-14">
        {documents.length === 0 ? (
          <EmptyState title="No documents published" description="Downloadable documents will appear here once published." />
        ) : (
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {documents.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-4 py-5">
                <FileText size={22} className="shrink-0 text-amber-600" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-serif text-lg font-bold text-slate-900">{d.title}</h2>
                  <p className="mt-0.5 text-[13px] text-slate-500">
                    {d.category}{d.date && ` · ${longDate(d.date)}`}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{d.description}</p>
                </div>
                {d.file ? (
                  <a href={d.file} className="inline-flex shrink-0 items-center gap-2 border border-slate-300 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-800 bg-white hover:border-amber-500 hover:text-amber-800 shadow-xs transition-all">
                    <Download size={15} /> Download
                  </a>
                ) : (
                  <span className="shrink-0 text-[13px] text-slate-400 font-medium">File pending</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
