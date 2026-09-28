import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listAnnouncements } from '../../services/documentService';
import { uid } from '../../utils/ids';
import { titleCase } from '../../utils/format';
import type { Announcement } from '../../types';

const KINDS = ['general', 'registration', 'programme', 'venue', 'notice'];

const FIELDS: FieldDef<Announcement>[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'kind', label: 'Type', type: 'select', options: KINDS.map((k) => ({ value: k, label: titleCase(k) })) },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'active', label: 'Active', type: 'checkbox', hint: 'Show in the announcement bar and on the announcements page' },
  { name: 'body', label: 'Message', type: 'textarea', required: true },
];

export default function AdminAnnouncements() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Announcements — Vachan Shivir Management');

  return (
    <CrudModule
      collection="announcements"
      title="Announcements"
      singular="Announcement"
      description="The first active announcement appears in the bar at the top of every public page."
      rows={listAnnouncements(db, event.id)}
      searchKeys={['title', 'body', 'kind']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('ann'), eventId: event.id, title: '', body: '', kind: 'general',
        active: true, date: new Date().toISOString().slice(0, 10),
      })}
      columns={[
        { key: 'title', header: 'Title', render: (r) => <span className="text-ink">{r.title}</span> },
        { key: 'kind', header: 'Type', render: (r) => titleCase(r.kind) },
        { key: 'active', header: 'Public', render: (r) => (r.active ? 'Shown' : 'Hidden') },
      ]}
    />
  );
}
