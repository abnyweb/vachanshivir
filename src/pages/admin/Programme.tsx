import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listSessions } from '../../services/agendaService';
import { uid } from '../../utils/ids';
import { titleCase } from '../../utils/format';
import type { Session } from '../../types';

const TYPES = ['keynote', 'exposition', 'panel', 'workshop', 'presentation', 'networking', 'worship', 'meal', 'break', 'opening', 'closing'];

export default function AdminProgramme() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Programme — Vachan Shivir Management');

  const fields: FieldDef<Session>[] = [
    { name: 'title', label: 'Session title', type: 'text', required: true },
    { name: 'day', label: 'Day number', type: 'number', required: true },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'startTime', label: 'Start time', type: 'text', hint: 'Use 24-hour time, or leave as Content pending.' },
    { name: 'endTime', label: 'End time', type: 'text' },
    { name: 'type', label: 'Session type', type: 'select', options: TYPES.map((t) => ({ value: t, label: titleCase(t) })) },
    {
      name: 'speakerId', label: 'Speaker', type: 'select',
      options: [{ value: '', label: 'No speaker' }, ...db.speakers.map((s) => ({ value: s.id, label: s.name }))],
    },
    { name: 'room', label: 'Room or hall', type: 'text' },
    { name: 'displayOrder', label: 'Order within the day', type: 'number' },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }],
    },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <CrudModule
      collection="sessions"
      title="Programme"
      singular="Session"
      description="Sessions appear on the public programme once published. Draft sessions show as pending."
      rows={listSessions(db, event.id)}
      searchKeys={['title', 'room', 'type']}
      fields={fields}
      makeEmpty={() => ({
        id: uid('ses'), eventId: event.id, day: 1, date: event.startDate, startTime: '', endTime: '',
        title: '', type: 'exposition', speakerId: null, room: '', description: '',
        displayOrder: db.sessions.length + 1, status: 'draft',
      })}
      columns={[
        { key: 'day', header: 'Day', className: 'w-16', render: (r) => r.day },
        { key: 'time', header: 'Time', className: 'w-32', render: (r) => r.startTime || '—' },
        { key: 'title', header: 'Session', render: (r) => <span className="text-ink">{r.title}</span> },
        { key: 'type', header: 'Type', render: (r) => titleCase(r.type) },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
      ]}
    />
  );
}
