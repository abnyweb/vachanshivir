import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/public/PageHeader';
import { FaqAccordion } from '../../components/public/FaqAccordion';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listPublishedFaqs } from '../../services/documentService';
import { cn } from '../../utils/cn';

export default function Faq() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`FAQ — ${event.name} ${event.year}`, 'Answers to common questions about Vachan Shivir.');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const all = listPublishedFaqs(db, event.id);
  const categories = useMemo(() => ['all', ...new Set(all.map((f) => f.category))], [all]);

  const results = all.filter((f) => {
    const q = query.trim().toLowerCase();
    const matches = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matches && (category === 'all' || f.category === category);
  });

  return (
    <>
      <PageHeader title="Questions" intro="If your question is not here, the team is happy to help." action={<Button to="/contact" variant="outline">Contact the team</Button>} />
      <section className="shell py-14">
        <div className="flex flex-wrap gap-3">
          <div className="w-full max-w-xs">
            <SearchInput value={query} onChange={setQuery} label="Search questions" placeholder="Search questions" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  'border rounded-xl px-3.5 py-2 text-[13px] transition-all',
                  category === c
                    ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                )}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {results.length === 0 ? (
            <EmptyState title="No questions match" description="Try a different word, or contact the team directly." />
          ) : (
            <FaqAccordion faqs={results} />
          )}
        </div>
      </section>
    </>
  );
}
