import { useState } from 'react';
import { Printer } from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listAttendees, searchAttendees } from '../../services/attendeeService';
import { ParticipantBadge } from '../../components/badge/ParticipantBadge';

export default function AdminBadges() {
  const { db, update } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Badges — Vachan Shivir Management');

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const attendees = searchAttendees(listAttendees(db, event.id), query);
  const selectedAttendees = attendees.filter((a) => selected.includes(a.id));

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function markGenerated() {
    selected.forEach((id) => update('attendees', id, { badgeStatus: 'generated' }));
    notify(`${selected.length} badge${selected.length === 1 ? '' : 's'} marked as generated.`);
  }

  return (
    <AdminPage
      title="Badge Printing & Pass Verification"
      description="Select delegates to automatically match their profile details, theme-based front badge, and 3-day programme schedule on the backside."
      actions={
        <>
          <Button size="sm" variant="light" disabled={selected.length === 0} onClick={markGenerated}>Mark Generated</Button>
          <Button size="sm" disabled={selected.length === 0} onClick={() => window.print()}><Printer size={15} /> Print Selected Badges</Button>
        </>
      }
    >
      <div className="mb-4 max-w-sm print:hidden">
        <SearchInput tone="light" value={query} onChange={setQuery} label="Search attendees" placeholder="Name or reference" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="print:hidden">
          {attendees.length === 0 ? (
            <EmptyState tone="light" title="No attendees" description="Attendees appear once registrations are submitted." />
          ) : (
            <ul className="max-h-[32rem] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              {attendees.map((a) => (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50 transition">
                    <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} className="rounded text-navy focus:ring-navy" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-900">{a.name}</span>
                      <span className="block text-[10px] font-mono text-slate-500">{a.reference} &bull; {a.city || 'India'}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {selectedAttendees.length === 0 ? (
            <EmptyState tone="light" title="No badges selected" description="Tick an attendee on the left to preview & print their official badge." />
          ) : (
            <div className="space-y-8 flex flex-col items-center">
              {selectedAttendees.map((a) => (
                <ParticipantBadge
                  key={a.id}
                  attendee={a}
                  onPrint={() => window.print()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}

