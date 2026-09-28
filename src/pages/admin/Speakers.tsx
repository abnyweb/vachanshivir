import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listSpeakers } from '../../services/speakerService';
import { uid } from '../../utils/ids';
import type { Speaker } from '../../types';

const FIELDS: FieldDef<Speaker>[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'designation', label: 'Designation', type: 'text' },
  { name: 'organisation', label: 'Church or organisation', type: 'text' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'topic', label: 'Topic', type: 'text' },
  { name: 'photo', label: 'Photo URL', type: 'text', hint: 'Leave blank to show a pending placeholder.' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'linkedin', label: 'LinkedIn', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  {
    name: 'category', label: 'Speaker type', type: 'select',
    options: [
      { value: 'main-session', label: 'Main session' },
      { value: 'panel', label: 'Panel' },
      { value: 'workshop', label: 'Workshop' },
      { value: 'unannounced', label: 'Unannounced' },
    ],
  },
  {
    name: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  { name: 'bio', label: 'Biography', type: 'textarea' },
];

export default function AdminSpeakers() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Speakers — Vachan Shivir Management');

  return (
    <CrudModule
      collection="speakers"
      title="Speakers"
      singular="Speaker"
      description="Speaker management for Vachan Shivir. Anything created here stays a draft until you publish it."
      rows={listSpeakers(db, event.id)}
      searchKeys={['name', 'organisation', 'country', 'topic']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('spk'), eventId: event.id, name: '', designation: '', organisation: '', country: 'India',
        bio: '', photo: null, topic: '', sessionId: null, category: 'main-session', email: '', phone: '',
        linkedin: '', website: '', displayOrder: db.speakers.length + 1, status: 'draft',
      })}
      columns={[
        { key: 'name', header: 'Name', render: (r) => <span className="text-ink">{r.name}</span> },
        { key: 'org', header: 'Organisation', render: (r) => r.organisation || '—' },
        { key: 'country', header: 'Country', render: (r) => r.country || '—' },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
      ]}
    />
  );
}
