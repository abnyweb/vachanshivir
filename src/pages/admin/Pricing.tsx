import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listCategories } from '../../services/pricingService';
import { uid } from '../../utils/ids';
import { inr } from '../../utils/format';
import type { RegistrationCategory } from '../../types';

const FIELDS: FieldDef<RegistrationCategory>[] = [
  { name: 'name', label: 'Category name', type: 'text', required: true },
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'currency', label: 'Currency', type: 'text' },
  { name: 'taxPercent', label: 'Tax %', type: 'number', hint: 'Confirm the GST position before charging tax.' },
  { name: 'taxNote', label: 'Tax note', type: 'text' },
  { name: 'validFrom', label: 'Valid from', type: 'text' },
  { name: 'validUntil', label: 'Valid until', type: 'text' },
  {
    name: 'sharingType', label: 'Sharing type', type: 'select',
    options: [
      { value: 'quadruple', label: 'Quadruple' }, { value: 'triple', label: 'Triple' },
      { value: 'double', label: 'Double' }, { value: 'single', label: 'Single' },
      { value: 'day-scholar', label: 'Day scholar' },
    ],
  },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox', hint: 'Show this category on the public site' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'benefits', label: 'What is included', type: 'list', hint: 'One per line.' },
];

export default function AdminPricing() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Pricing — Vachan Shivir Management');

  return (
    <CrudModule
      collection="registrationCategories"
      title="Registration pricing"
      singular="Category"
      description="Registration categories and fees."
      rows={listCategories(db, event.id)}
      searchKeys={['name', 'sharingType']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('cat'), eventId: event.id, name: '', description: '', price: 0, currency: 'INR',
        taxPercent: 0, taxNote: 'Tax treatment to be confirmed by Vachan Shivir', validFrom: '', validUntil: '',
        benefits: [], sharingType: 'quadruple', maxGuests: null, active: true,
        displayOrder: db.registrationCategories.length + 1,
      })}
      columns={[
        { key: 'name', header: 'Category', render: (r) => <span className="text-ink">{r.name}</span> },
        { key: 'price', header: 'Price', render: (r) => inr(r.price) },
        { key: 'tax', header: 'Tax', render: (r) => (r.taxPercent ? `${r.taxPercent}%` : 'None set') },
        { key: 'active', header: 'Public', render: (r) => (r.active ? 'Shown' : 'Hidden') },
      ]}
    />
  );
}
