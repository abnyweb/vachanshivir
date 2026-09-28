import { AdminPage } from '../../components/admin/AdminPage';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listAttendees } from '../../services/attendeeService';
import { listRooms, occupantsOf, roomingSummary, roomStatusFor } from '../../services/roomingService';
import { titleCase } from '../../utils/format';
import { uid } from '../../utils/ids';
import { BedDouble, Users, DoorOpen, Plus } from 'lucide-react';

export default function AdminRooming() {
  const { db, update, create } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();
  useDocumentMeta('Rooming — Vachan Shivir Management');

  const rooms = listRooms(db, event.id);
  const attendees = listAttendees(db, event.id);
  const summary = roomingSummary(rooms, attendees);
  const unassigned = attendees.filter((a) => !a.roomId);

  function assign(attendeeId: string, roomId: string) {
    update('attendees', attendeeId, { roomId: roomId || null, roomingStatus: roomId ? 'assigned' : 'unassigned' });
    notify(roomId ? 'Room assigned.' : 'Room assignment cleared.');
  }

  return (
    <AdminPage
      title="Rooming"
      description="Assign attendees to rooms by sharing type. Rooms and capacities are demonstration data until the hotel list is loaded."
      actions={
        <Button size="sm" variant="light" onClick={() => {
          create('rooms', {
            id: uid('room'), eventId: event.id, number: `New ${rooms.length + 1}`, block: 'Main',
            sharingType: 'quadruple', capacity: 4, checkIn: event.startDate, checkOut: event.endDate,
            status: 'available', isDemo: false,
          });
          notify('Room added.');
        }}>
          <Plus size={15} /> Add room
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Rooms" value={summary.rooms} icon={DoorOpen} />
        <StatCard label="Beds" value={summary.beds} icon={BedDouble} />
        <StatCard label="Assigned" value={summary.assigned} icon={Users} />
        <StatCard label="Unassigned" value={summary.unassigned} icon={Users} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-base text-ink">Rooms</h2>
          {rooms.length === 0 ? (
            <EmptyState tone="light" title="No rooms" description="Add rooms to start assigning attendees." />
          ) : (
            <ul className="space-y-2">
              {rooms.map((r) => {
                const occupants = occupantsOf(attendees, r.id);
                const status = roomStatusFor(r, occupants.length);
                return (
                  <li key={r.id} className="rounded-sm border border-ink/10 bg-white p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[15px] text-ink">Room {r.number} <span className="text-ink/45">· {r.block}</span></p>
                      <p className="text-[13px] text-ink/55">
                        {titleCase(r.sharingType)} · {occupants.length}/{r.capacity} · {status}
                      </p>
                    </div>
                    {occupants.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {occupants.map((o) => (
                          <li key={o.id} className="flex items-center justify-between gap-3 text-[13px] text-ink/70">
                            <span>{o.name}</span>
                            <button onClick={() => assign(o.id, '')} className="text-[12px] text-maroon hover:underline">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-base text-ink">Waiting for a room</h2>
          {unassigned.length === 0 ? (
            <EmptyState tone="light" title="Everyone has a room" description="No attendee is waiting for an assignment." />
          ) : (
            <ul className="space-y-2">
              {unassigned.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-sm border border-ink/10 bg-white p-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-ink">{a.name}</span>
                    <span className="block text-[12px] tabular-nums text-ink/50">{a.reference}</span>
                  </span>
                  <select
                    className="field-light w-auto !py-1 !text-[13px]"
                    aria-label={`Assign a room to ${a.name}`}
                    value=""
                    onChange={(e) => assign(a.id, e.target.value)}
                  >
                    <option value="">Assign room…</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.number} — {titleCase(r.sharingType)} ({occupantsOf(attendees, r.id).length}/{r.capacity})
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminPage>
  );
}
