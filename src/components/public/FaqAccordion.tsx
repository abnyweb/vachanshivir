import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Faq } from '../../types';

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {faqs.map((f) => {
        const open = openId === f.id;
        return (
          <div key={f.id} className="transition-colors">
            <h3>
              <button
                className="flex w-full items-start justify-between gap-4 py-5 text-left group"
                aria-expanded={open}
                aria-controls={`faq-${f.id}`}
                onClick={() => setOpenId(open ? null : f.id)}
              >
                <span className="font-serif text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{f.question}</span>
                <span className="mt-1 shrink-0 text-amber-700">{open ? <Minus size={17} /> : <Plus size={17} />}</span>
              </button>
            </h3>
            {open && (
              <div id={`faq-${f.id}`} className="pb-5 pr-8 text-[15px] leading-relaxed text-slate-600">
                {f.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
