import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
}

export function DataTable<T>({ columns, rows, rowKey, empty }: Props<T>) {
  if (rows.length === 0) return <>{empty}</>;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-card transition-all duration-200">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 bg-slate-50/80">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${c.className ?? ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="transition-colors duration-150 hover:bg-slate-50/80 group"
            >
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3.5 align-middle text-slate-700 font-medium ${c.className ?? ''}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
