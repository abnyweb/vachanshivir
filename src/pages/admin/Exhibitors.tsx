import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { StatusPill } from '../../components/common/StatusPill';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listExhibitors } from '../../services/exhibitorService';
import { uid } from '../../utils/ids';
import type { Exhibitor } from '../../types';

export default function AdminExhibitors() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Exhibitors — Vachan Shivir Management');

  const fields: FieldDef<Exhibitor>[] = [
    { name: 'company', label: 'Company', type: 'text', required: true },
    { name: 'contactPerson', label: 'Contact person', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'website', label: 'Website', type: 'text' },
    { name: 'category', label: 'Category', type: 'text' },
    {
      name: 'stallId', label: 'Assigned stall', type: 'select',
      options: [{ value: '', label: 'No stall assigned' }, ...db.stalls.map((s) => ({ value: s.id, label: `${s.number} — ${s.zone}` }))],
    },
    {
      name: 'status', label: 'Status', type: 'select',
      options: [
        { value: 'enquiry', label: 'Enquiry' }, { value: 'approved', label: 'Approved' },
        { value: 'confirmed', label: 'Confirmed' }, { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      name: 'paymentStatus', label: 'Payment', type: 'select',
      options: [
        { value: 'unpaid', label: 'Unpaid' }, { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' }, { value: 'refunded', label: 'Refunded' }, { value: 'failed', label: 'Failed' },
      ],
    },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  return (
    <CrudModule
      collection="exhibitors"
      title="Exhibitors"
      singular="Exhibitor"
      description="Confirmed exhibitors appear in the public directory. Everything seeded here is demonstration data."
      rows={listExhibitors(db, event.id)}
      searchKeys={['company', 'category', 'contactPerson', 'email']}
      fields={fields}
      makeEmpty={() => ({
        id: uid('exh'), eventId: event.id, company: '', contactPerson: '', email: '', phone: '',
        website: '', category: '', description: '', logo: null, stallId: null,
        status: 'enquiry', paymentStatus: 'unpaid', isDemo: false,
      })}
      columns={[
        { key: 'company', header: 'Company', render: (r) => <span className="text-ink">{r.company}</span> },
        { key: 'category', header: 'Category', render: (r) => r.category || '—' },
        { key: 'stall', header: 'Stall', render: (r) => db.stalls.find((s) => s.id === r.stallId)?.number ?? '—' },
        { key: 'status', header: 'Status', render: (r) => <StatusPill value={r.status} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
        { key: 'payment', header: 'Payment', render: (r) => <StatusPill value={r.paymentStatus} className="!border-ink/15 !bg-ink/[0.04] !text-ink/70" /> },
      ]}
    />
  );
}
