import { useState } from 'react';
import { Download, Edit } from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { DataTable } from '../../components/common/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusPill } from '../../components/common/StatusPill';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listAttendees, searchAttendees, toCsv } from '../../services/attendeeService';
import { checkInPatch, undoCheckInPatch } from '../../services/checkInService';
import { EditEntryModal } from '../../components/admin/EditEntryModal';
import type { Attendee } from '../../types';

export default function AdminAttendees() {
  const { db, update } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Attendees — Vachan Shivir Management');

  const [query, setQuery] = useState('');
  const [editingEntry, setEditingEntry] = useState<Attendee | null>(null);

  const all = listAttendees(db, event.id);
  const rows = searchAttendees(all, query);

  function exportCsv() {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vachanshivir-${event.year}-attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${rows.length} attendees.`);
  }

  const handleSaveEntry = (updatedPatch: any) => {
    if (!editingEntry) return;
    update('attendees', editingEntry.id, updatedPatch);

    const matchingReg = (db.registrations || []).find(
      (r) => r.id === editingEntry.registrationId || r.reference === editingEntry.reference
    );
    if (matchingReg) {
      update('registrations', matchingReg.id, updatedPatch);
    }
    notify(`Updated Entry ID #${updatedPatch.legacyEntryId || editingEntry.reference} (${updatedPatch.name}).`);
    setEditingEntry(null);
  };

  return (
    <AdminPage
      title="Attendees & Delegate Registry"
      description="Operational attendee records with Excel Entry ID tracking, check-in controls, and Admin edit capabilities."
      actions={<Button size="sm" variant="light" onClick={exportCsv}><Download size={15} /> Export CSV</Button>}
    >
      <div className="mb-4 max-w-md">
        <SearchInput tone="light" value={query} onChange={setQuery} label="Search attendees" placeholder="Search Entry ID (e.g. 105), Name, Email, Reference..." />
      </div>

      <DataTable
        rows={rows}
        rowKey={(r) => r.id}
        empty={<EmptyState tone="light" title="No attendees" description="Attendees are created when a registration is submitted or imported." />}
        columns={[
          {
            key: 'entryId',
            header: 'Entry ID',
            render: (r) => (
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {r.legacyEntryId ? `#${r.legacyEntryId}` : (r.entryId ? `#${r.entryId}` : '—')}
              </span>
            ),
          },
          { key: 'ref', header: 'Reference', render: (r) => <span className="tabular-nums text-ink font-mono text-xs">{r.reference}</span> },
          { key: 'name', header: 'Name', render: (r) => <span className="font-semibold text-ink">{r.name}</span> },
          { key: 'org', header: 'Church', render: (r) => r.organisation || r.churchName || '—' },
          { key: 'from', header: 'From', render: (r) => [r.city, r.state].filter(Boolean).join(', ') || '—' },
          { key: 'pay', header: 'Payment', render: (r) => <StatusPill value={r.paymentStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
          { key: 'room', header: 'Rooming', render: (r) => <StatusPill value={r.roomingStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
          { key: 'checkin', header: 'Check-in', render: (r) => <StatusPill value={r.checkInStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
          {
            key: 'action', header: 'Actions', className: 'text-right',
            render: (r) => (
              <div className="flex items-center justify-end gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingEntry(r)}
                  className="!px-2 !py-1 text-xs text-amber-900 border-amber-300 bg-amber-50 hover:bg-amber-100"
                >
                  <Edit size={13} /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => {
                    const arrived = r.checkInStatus === 'checked-in';
                    update('attendees', r.id, arrived ? undoCheckInPatch() : checkInPatch());
                    notify(arrived ? `${r.name} marked as not arrived.` : `${r.name} checked in.`);
                  }}
                >
                  {r.checkInStatus === 'checked-in' ? 'Undo' : 'Check in'}
                </Button>
              </div>
            ),
          },
        ]}
      />

      <EditEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleSaveEntry}
      />
    </AdminPage>
  );
}
