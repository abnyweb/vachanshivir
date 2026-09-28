interface Props {
  title: string;
  data: { label: string; value: number }[];
  format?: (v: number) => string;
}

export function BarChart({ title, data, format = (v) => String(v) }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-900 font-sans">{title}</h2>
        <span className="text-xs text-slate-400 font-medium">{data.length} categories</span>
      </div>

      {data.length === 0 ? (
        <p className="mt-6 py-6 text-center text-sm text-slate-400">Nothing to chart yet.</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {data.map((d) => {
            const pct = Math.round((d.value / max) * 100);
            return (
              <li key={d.label} className="group">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate font-semibold text-slate-700 group-hover:text-navy transition-colors font-raleway">
                    {d.label}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="font-bold text-slate-900">{format(d.value)}</span>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-navy via-[#1B4980] to-crossgold transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
