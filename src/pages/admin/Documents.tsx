import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listDocuments } from '../../services/documentService';
import { uid } from '../../utils/ids';
import type { EventDocument } from '../../types';

const FIELDS: FieldDef<EventDocument>[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'text' },
  { name: 'file', label: 'File URL', type: 'text', hint: 'Leave blank to record it as pending.' },
  { name: 'date', label: 'Date', type: 'date' },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }],
  },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function AdminDocuments() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Documents — Vachan Shivir Management');

  return (
    <CrudModule
      collection="documents"
      title="Documents"
      singular="Document"
      description="Downloadable files shown on the public documents page."
      rows={listDocuments(db, event.id)}
      searchKeys={['title', 'category']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('doc'), eventId: event.id, title: '', description: '', category: 'General',
        file: null, date: '', status: 'draft', pendingAsset: true,
      })}
      columns={[
        { key: 'title', header: 'Title', render: (r) => <span className="text-ink">{r.title}</span> },
        { key: 'cat', header: 'Category', render: (r) => r.category || '—' },
        { key: 'file', header: 'File', render: (r) => (r.file ? 'Attached' : 'Pending') },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
      ]}
    />
  );
}
