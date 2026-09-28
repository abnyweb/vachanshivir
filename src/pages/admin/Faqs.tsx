import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listFaqs } from '../../services/documentService';
import { uid } from '../../utils/ids';
import type { Faq } from '../../types';

const FIELDS: FieldDef<Faq>[] = [
  { name: 'question', label: 'Question', type: 'text', required: true, full: true },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }],
  },
  { name: 'answer', label: 'Answer', type: 'textarea', required: true },
];

export default function AdminFaqs() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('FAQs — Vachan Shivir Management');

  return (
    <CrudModule
      collection="faqs"
      title="FAQs"
      singular="Question"
      description="These match the questions published on the public site."
      rows={listFaqs(db, event.id)}
      searchKeys={['question', 'answer', 'category']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('faq'), eventId: event.id, question: '', answer: '', category: 'General',
        displayOrder: db.faqs.length + 1, status: 'draft',
      })}
      columns={[
        { key: 'q', header: 'Question', render: (r) => <span className="text-ink">{r.question}</span> },
        { key: 'cat', header: 'Category', render: (r) => r.category || '—' },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
      ]}
    />
  );
}
