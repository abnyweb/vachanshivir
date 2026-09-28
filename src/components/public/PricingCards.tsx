import { Check } from 'lucide-react';
import { Button } from '../common/Button';
import type { RegistrationCategory } from '../../types';
import { inr } from '../../utils/format';

export function PricingCards({ categories, showCta = true }: { categories: RegistrationCategory[]; showCta?: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c) => (
        <article key={c.id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400 hover:shadow-md transition-all">
          <div>
            <span className="inline-block text-[11px] font-mono font-bold tracking-wider text-amber-800 uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {c.name}
            </span>
            <p className="mt-4 font-serif text-3xl font-black text-slate-900">{inr(c.price)}</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">per person{c.taxPercent === 0 ? '' : ` + ${c.taxPercent}% tax`}</p>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{c.description}</p>
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {c.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-slate-700">
                  <Check size={14} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          {showCta && (
            <Button to="/registration" size="sm" variant="outline" className="mt-6 w-full">
              Choose this
            </Button>
          )}
        </article>
      ))}
    </div>
  );
}
