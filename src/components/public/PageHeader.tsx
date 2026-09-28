import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  intro,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="relative bg-navy text-white overflow-hidden border-b-4 border-crossgold">
      {/* Background subtle dot pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FBB33B_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />
      <div className="shell py-10 sm:py-14 relative z-10">
        {eyebrow && (
          <div className="mb-2">
            <span className="inline-block text-xs font-black tracking-widest text-crossgold uppercase font-raleway bg-navy-900/80 border border-crossgold/40 px-3 py-1 rounded-full shadow-2xs">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-raleway tracking-tight">
          {title}
        </h1>
        {intro && (
          <div className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-navy-100 font-sans">
            {intro}
          </div>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    </section>
  );
}
