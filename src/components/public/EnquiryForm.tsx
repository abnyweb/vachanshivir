import { useState } from 'react';
import { Button } from '../common/Button';
import { FormField } from '../common/FormField';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../common/ToastProvider';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { buildEnquiry, nextEnquiryReference } from '../../services/enquiryService';
import type { EnquiryKind } from '../../types';

export interface ExtraField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
  hint?: string;
}

interface Props {
  kind: EnquiryKind;
  submitLabel: string;
  messageLabel?: string;
  extraFields?: ExtraField[];
  initialMeta?: Record<string, string>;
}

export function EnquiryForm({ kind, submitLabel, messageLabel = 'Message', extraFields = [], initialMeta = {} }: Props) {
  const { db, create } = useStore();
  const { notify } = useToast();
  const event = useCurrentEvent();

  const [values, setValues] = useState<Record<string, string>>({
    name: '', email: '', phone: '', organisation: '', message: '', ...initialMeta,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [reference, setReference] = useState('');
  // Honeypot: bots fill hidden fields, people do not.
  const [trap, setTrap] = useState('');

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  function submit() {
    const found: Record<string, string> = {};
    if (!values.name.trim()) found.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) found.email = 'Enter a valid email address.';
    if (!values.message.trim()) found.message = 'Tell us how we can help.';
    for (const f of extraFields) {
      if (f.required && !String(values[f.name] ?? '').trim()) found[f.name] = `${f.label} is required.`;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      notify('Check the highlighted fields.', 'error');
      return;
    }
    if (trap) return; // silently drop bot submissions

    setState('sending');
    const ref = nextEnquiryReference(db);
    const meta = Object.fromEntries(extraFields.map((f) => [f.name, values[f.name] ?? '']));
    const enquiryObj = buildEnquiry(kind, event.id, ref, {
      name: values.name, email: values.email, phone: values.phone,
      organisation: values.organisation, message: values.message,
    }, meta);

    // Feed to backend API
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryObj),
    }).catch((err) => {
      console.warn('Backend enquiry endpoint offline, local store fallback:', err);
    });

    create('enquiries', enquiryObj);
    setReference(ref);
    setState('sent');
    notify('Enquiry received.');
  }

  if (state === 'sent') {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-900 shadow-xs">
        <h3 className="font-serif text-xl font-bold text-amber-950">Enquiry received</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
          Your reference is <span className="font-bold text-amber-800">{reference}</span>. The Vachan Shivir team will reply to{' '}
          <strong className="text-slate-900">{values.email}</strong>. Quote the reference if you follow up.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Name" name="name" required error={errors.name}>
        <input id="name" className="field" value={values.name} onChange={(e) => set('name', e.target.value)} />
      </FormField>
      <FormField label="Email" name="email" required error={errors.email}>
        <input id="email" type="email" className="field" value={values.email} onChange={(e) => set('email', e.target.value)} />
      </FormField>
      <FormField label="Phone" name="phone">
        <input id="phone" type="tel" className="field" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
      </FormField>
      <FormField label="Church or organisation" name="organisation">
        <input id="organisation" className="field" value={values.organisation} onChange={(e) => set('organisation', e.target.value)} />
      </FormField>

      {extraFields.map((f) => (
        <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
          <FormField label={f.label} name={f.name} required={f.required} hint={f.hint} error={errors[f.name]}>
            {f.type === 'textarea' ? (
              <textarea id={f.name} rows={4} className="field" value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
            ) : f.type === 'select' ? (
              <select id={f.name} className="field" value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">Select…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input id={f.name} className="field" value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
            )}
          </FormField>
        </div>
      ))}

      <div className="sm:col-span-2">
        <FormField label={messageLabel} name="message" required error={errors.message}>
          <textarea id="message" rows={5} className="field" value={values.message} onChange={(e) => set('message', e.target.value)} />
        </FormField>
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="company-website">Leave this field empty</label>
        <input id="company-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>

      <div className="sm:col-span-2">
        <Button onClick={submit} disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
