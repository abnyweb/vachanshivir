import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listPartners } from '../../services/partnerService';
import { uid } from '../../utils/ids';
import { titleCase } from '../../utils/format';
import type { Partner } from '../../types';

const CATEGORIES = ['ministry', 'publishing', 'association', 'media', 'strategic', 'supporting'];

const FIELDS: FieldDef<Partner>[] = [
  { name: 'name', label: 'Partner name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORIES.map((c) => ({ value: c, label: titleCase(c) })) },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'logo', label: 'Logo URL', type: 'text' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox', hint: 'Show on the public partners page' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function AdminPartners() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Partners — Vachan Shivir Management');

  return (
    <CrudModule
      collection="partners"
      title="Partners & Organisers"
      singular="Partner"
      description="Ministries partnering with Vachan Shivir."
      rows={listPartners(db, event.id)}
      searchKeys={['name', 'category']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('ptn'), eventId: event.id, name: '', logo: null, category: 'ministry',
        description: '', website: '', displayOrder: db.partners.length + 1, active: true, isDemo: false,
      })}
      columns={[
        { key: 'name', header: 'Partner', render: (r) => <span className="text-ink">{r.name}</span> },
        { key: 'category', header: 'Category', render: (r) => titleCase(r.category) },
        { key: 'active', header: 'Public', render: (r) => (r.active ? 'Shown' : 'Hidden') },
      ]}
    />
  );
}
