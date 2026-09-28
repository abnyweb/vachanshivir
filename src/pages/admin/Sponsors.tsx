import { CrudModule, type FieldDef } from '../../components/admin/CrudModule';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listSponsors, TIERS } from '../../services/sponsorService';
import { uid } from '../../utils/ids';
import { titleCase } from '../../utils/format';
import type { Sponsor } from '../../types';

const FIELDS: FieldDef<Sponsor>[] = [
  { name: 'name', label: 'Sponsor name', type: 'text', required: true },
  { name: 'tier', label: 'Tier', type: 'select', options: TIERS.map((t) => ({ value: t, label: titleCase(t) })) },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'logo', label: 'Logo URL', type: 'text' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Active', type: 'checkbox', hint: 'Show on the public sponsors page' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function AdminSponsors() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta('Sponsors — Vachan Shivir Management');

  return (
    <CrudModule
      collection="sponsors"
      title="Sponsors"
      singular="Sponsor"
      description="Vachan Shivir publishes sponsors when confirmed. The seeded records are demonstration data."
      rows={listSponsors(db, event.id)}
      searchKeys={['name', 'tier']}
      fields={FIELDS}
      makeEmpty={() => ({
        id: uid('spn'), eventId: event.id, name: '', logo: null, tier: 'supporting',
        description: '', website: '', displayOrder: db.sponsors.length + 1, active: false, isDemo: false,
      })}
      columns={[
        { key: 'name', header: 'Sponsor', render: (r) => <span className="text-ink">{r.name}</span> },
        { key: 'tier', header: 'Tier', render: (r) => titleCase(r.tier) },
        { key: 'active', header: 'Public', render: (r) => (r.active ? 'Shown' : 'Hidden') },
        { key: 'demo', header: 'Source', render: (r) => (r.isDemo ? 'Demo data' : 'Real') },
      ]}
    />
  );
}
