import { useState } from 'react';
import { AdminPage } from '../../components/admin/AdminPage';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listEvents } from '../../services/eventService';
import { isDemoMode } from '../../services/dataSource';
import { ROLE_PERMISSIONS } from '../../auth/roles';
import { titleCase } from '../../utils/format';

export default function AdminSettings() {
  const { db, updateSettings, resetDemoData } = useStore();
  const { notify } = useToast();
  useDocumentMeta('Settings — Vachan Shivir Management');

  const [phones, setPhones] = useState(db.settings.contactPhones.join('\n'));

  return (
    <AdminPage title="Settings" description="Site-wide settings, the current edition, and how this platform connects to other systems.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-ink/10 bg-white p-5">
          <h2 className="text-base text-ink">Site</h2>
          <div className="mt-4 space-y-4">
            <FormField tone="light" label="Site name" name="site-name">
              <input id="site-name" className="field-light" value={db.settings.siteName} onChange={(e) => updateSettings({ siteName: e.target.value })} />
            </FormField>
            <FormField tone="light" label="Contact email" name="site-email" hint="Enter the official contact address here.">
              <input id="site-email" className="field-light" value={db.settings.contactEmail} onChange={(e) => updateSettings({ contactEmail: e.target.value })} />
            </FormField>
            <FormField tone="light" label="Contact phones" name="site-phones" hint="One per line.">
              <textarea
                id="site-phones"
                rows={3}
                className="field-light"
                value={phones}
                onChange={(e) => setPhones(e.target.value)}
                onBlur={() => { updateSettings({ contactPhones: phones.split('\n').map((p) => p.trim()).filter(Boolean) }); notify('Contact details saved.'); }}
              />
            </FormField>
            <FormField tone="light" label="Venue address" name="site-address">
              <input id="site-address" className="field-light" value={db.settings.address} onChange={(e) => updateSettings({ address: e.target.value })} />
            </FormField>
          </div>
        </section>

        <section className="rounded-sm border border-ink/10 bg-white p-5">
          <h2 className="text-base text-ink">Current edition</h2>
          <div className="mt-4 space-y-4">
            <FormField tone="light" label="Edition shown on the public site" name="current-event">
              <select
                id="current-event"
                className="field-light"
                value={db.settings.currentEventId}
                onChange={(e) => { updateSettings({ currentEventId: e.target.value }); notify('Current edition changed.'); }}
              >
                {listEvents(db).map((e) => <option key={e.id} value={e.id}>{e.year} — {e.theme}</option>)}
              </select>
            </FormField>
            <FormField tone="light" label="Live registration URL" name="reg-url" hint="Where the public site sends people to pay for the current cycle.">
              <input id="reg-url" className="field-light" value={db.settings.registrationExternalUrl} onChange={(e) => updateSettings({ registrationExternalUrl: e.target.value })} />
            </FormField>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={db.settings.registrationOpen}
                onChange={(e) => updateSettings({ registrationOpen: e.target.checked })}
              />
              Registration is open
            </label>
          </div>
        </section>

        <section className="rounded-sm border border-ink/10 bg-white p-5">
          <h2 className="text-base text-ink">Integrations</h2>
          <dl className="mt-4 space-y-3 text-[13.5px]">
            {[
              ['Data source', isDemoMode ? 'Local demo data (browser storage)' : 'Backend API'],
              ['Payments', 'Not connected. Razorpay orders must be created by a backend.'],
              ['Email', 'Not connected. Templates are defined in notificationService.'],
              ['WhatsApp', 'Not connected. Templates are defined in whatsappService.'],
              ['WordPress', 'Read-only adapter sketch. Never writes to aipc.live.'],
              ['Gravity Forms', 'Read-only adapter sketch. Requires a backend proxy holding the API secret.'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-ink/[0.07] pb-2 last:border-0">
                <dt className="text-ink/55">{k}</dt>
                <dd className="text-ink/85">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[12px] leading-relaxed text-ink/45">
            No secret key is stored in this application. Configure the backend service and set the values in .env.local.
          </p>
        </section>

        <section className="rounded-sm border border-ink/10 bg-white p-5">
          <h2 className="text-base text-ink">Roles</h2>
          <dl className="mt-4 space-y-3 text-[13.5px]">
            {Object.entries(ROLE_PERMISSIONS).map(([role, areas]) => (
              <div key={role} className="border-b border-ink/[0.07] pb-2 last:border-0">
                <dt className="text-ink">{titleCase(role.toLowerCase())}</dt>
                <dd className="mt-0.5 text-ink/55">{areas.includes('*') ? 'Every area' : areas.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>

        {isDemoMode && (
          <section className="rounded-sm border border-amber-300 bg-amber-50 p-5 lg:col-span-2">
            <h2 className="text-base text-amber-900">Demo data</h2>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-amber-900/80">
              This build stores its records in your browser. Resetting restores the seeded Vachan Shivir content and clears
              anything you created while testing. No production data is touched either way.
            </p>
            <Button
              variant="light"
              size="sm"
              className="mt-4"
              onClick={() => { resetDemoData(); notify('Demo data reset.'); }}
            >
              Reset demo data
            </Button>
          </section>
        )}
      </div>
    </AdminPage>
  );
}
