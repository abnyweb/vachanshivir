import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { DataTable, type Column } from '../common/DataTable';
import { EmptyState } from '../common/EmptyState';
import { FormField } from '../common/FormField';
import { Modal } from '../common/Modal';
import { SearchInput } from '../common/SearchInput';
import { AdminPage } from './AdminPage';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../common/ToastProvider';
import type { Collection, Database } from '../../store/database';

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'list';

export interface FieldDef<T> {
  name: Extract<keyof T, string>;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  full?: boolean;
}

interface Props<K extends Collection, T extends Database[K][number] & { id: string }> {
  collection: K;
  title: string;
  description: string;
  singular: string;
  rows: T[];
  columns: Column<T>[];
  fields: FieldDef<T>[];
  makeEmpty: () => T;
  searchKeys: Extract<keyof T, string>[];
  emptyState?: ReactNode;
  extraActions?: ReactNode;
}

export function CrudModule<K extends Collection, T extends Database[K][number] & { id: string }>({
  collection, title, description, singular, rows, columns, fields, makeEmpty, searchKeys, emptyState, extraActions,
}: Props<K, T>) {
  const { create, update, remove } = useStore();
  const { notify } = useToast();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  function openNew() {
    setDraft(makeEmpty());
    setIsNew(true);
  }

  function openEdit(row: T) {
    setDraft({ ...row });
    setIsNew(false);
  }

  function save() {
    if (!draft) return;
    const missing = fields.find((f) => f.required && !String(draft[f.name] ?? '').trim());
    if (missing) {
      notify(`${missing.label} is required.`, 'error');
      return;
    }
    if (isNew) {
      create(collection, draft as Database[K][number]);
      notify(`${singular} created.`);
    } else {
      update(collection, draft.id, draft as Partial<Database[K][number]>);
      notify('Changes saved.');
    }
    setDraft(null);
  }

  function confirmDelete() {
    if (!confirmId) return;
    remove(collection, confirmId);
    setConfirmId(null);
    notify(`${singular} deleted.`);
  }

  const allColumns: Column<T>[] = [
    ...columns,
    {
      key: '__actions',
      header: 'Actions',
      className: 'w-24 text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => openEdit(row)}
            aria-label={`Edit ${singular}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setConfirmId(row.id)}
            aria-label={`Delete ${singular}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage
      title={title}
      description={description}
      actions={
        <>
          {extraActions}
          <Button variant="primary" size="sm" onClick={openNew} className="!rounded-lg shadow-sm">
            <Plus size={15} /> New {singular.toLowerCase()}
          </Button>
        </>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchInput tone="light" value={query} onChange={setQuery} label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}...`} />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filtered.length}</span> of {rows.length} records
        </div>
      </div>

      <DataTable
        columns={allColumns}
        rows={filtered}
        rowKey={(r) => r.id}
        empty={
          emptyState ?? (
            <EmptyState
              tone="light"
              title={query ? 'No matches' : `No ${title.toLowerCase()} yet`}
              description={query ? 'Try a different search term.' : `Create the first ${singular.toLowerCase()} to get started.`}
              action={!query && <Button size="sm" onClick={openNew}><Plus size={15} /> New {singular.toLowerCase()}</Button>}
            />
          )
        }
      />

      <Modal
        open={draft !== null}
        title={isNew ? `New ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}
        onClose={() => setDraft(null)}
        footer={
          <>
            <Button variant="light" size="sm" onClick={() => setDraft(null)}>Cancel</Button>
            <Button size="sm" onClick={save}>{isNew ? `Create ${singular.toLowerCase()}` : 'Save changes'}</Button>
          </>
        }
      >
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const value = draft[f.name];
              const id = `field-${String(f.name)}`;
              return (
                <div key={String(f.name)} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <FormField tone="light" label={f.label} name={id} required={f.required} hint={f.hint}>
                    {f.type === 'textarea' ? (
                      <textarea
                        id={id}
                        rows={4}
                        className="field-light"
                        value={String(value ?? '')}
                        placeholder={f.placeholder}
                        onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                      />
                    ) : f.type === 'select' ? (
                      <select
                        id={id}
                        className="field-light"
                        value={String(value ?? '')}
                        onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                      >
                        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                          id={id}
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => setDraft({ ...draft, [f.name]: e.target.checked })}
                        />
                        {f.hint ?? 'Enabled'}
                      </label>
                    ) : f.type === 'list' ? (
                      <textarea
                        id={id}
                        rows={3}
                        className="field-light"
                        value={Array.isArray(value) ? (value as string[]).join('\n') : ''}
                        placeholder="One per line"
                        onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value.split('\n').filter(Boolean) })}
                      />
                    ) : (
                      <input
                        id={id}
                        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                        className="field-light"
                        value={String(value ?? '')}
                        placeholder={f.placeholder}
                        onChange={(e) =>
                          setDraft({ ...draft, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })
                        }
                      />
                    )}
                  </FormField>
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        open={confirmId !== null}
        title={`Delete ${singular.toLowerCase()}`}
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <Button variant="light" size="sm" onClick={() => setConfirmId(null)}>Keep it</Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This removes the record from the platform. It cannot be undone from here.
        </p>
      </Modal>
    </AdminPage>
  );
}
