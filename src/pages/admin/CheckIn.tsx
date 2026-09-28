import { useState } from 'react';
import { AdminPage } from '../../components/admin/AdminPage';
import { StatCard } from '../../components/admin/StatCard';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listAttendees, searchAttendees } from '../../services/attendeeService';
import { checkInPatch, checkInSummary, undoCheckInPatch } from '../../services/checkInService';
import { UserCheck, Users, Clock } from 'lucide-react';

export default function AdminCheckIn() {
  const { db, update } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Check-in — Vachan Shivir Management');

  const [query, setQuery] = useState('');
  const all = listAttendees(db, event.id);
  const summary = checkInSummary(all);
  const results = query.trim() ? searchAttendees(all, query) : [];

  return (
    <AdminPage
      title="Check-in desk"
      description={`Search by name or reference, then check the person in. Check-in opens at ${event.checkInTime}.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Expected" value={summary.total} icon={Users} />
        <StatCard label="Arrived" value={summary.arrived} icon={UserCheck} />
        <StatCard label="Still to arrive" value={summary.pending} icon={Clock} />
      </div>

      <div className="mt-6 max-w-lg">
        <SearchInput
          tone="light"
          value={query}
          onChange={setQuery}
          label="Search for an attendee"
          placeholder="Type a name or VS26- reference"
        />
      </div>

      <div className="mt-5 max-w-3xl">
        {!query.trim() ? (
          <EmptyState tone="light" title="Ready" description="Start typing a name or reference to find someone." />
        ) : results.length === 0 ? (
          <EmptyState tone="light" title="No match" description="Check the spelling, or search by the VS26- reference instead." />
        ) : (
          <ul className="divide-y divide-ink/[0.07] rounded-sm border border-ink/10 bg-white">
            {results.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] text-ink">{a.name}</p>
                  <p className="text-[13px] text-ink/50">
                    {a.reference} · {a.organisation || 'No church recorded'} · {[a.city, a.state].filter(Boolean).join(', ')}
                  </p>
                </div>
                <StatusPill value={a.paymentStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" />
                <StatusPill value={a.checkInStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" />
                <Button
                  size="sm"
                  variant={a.checkInStatus === 'checked-in' ? 'light' : 'primary'}
                  onClick={() => {
                    const arrived = a.checkInStatus === 'checked-in';
                    update('attendees', a.id, arrived ? undoCheckInPatch() : checkInPatch());
                    notify(arrived ? `${a.name} marked as not arrived.` : `${a.name} checked in.`);
                  }}
                >
                  {a.checkInStatus === 'checked-in' ? 'Undo check-in' : 'Check in'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink/45">
        QR scanning is not enabled in this build. The badge payload already carries a scannable value, so a scanner can
        be wired to this screen once the backend is connected.
      </p>
    </AdminPage>
  );
}
