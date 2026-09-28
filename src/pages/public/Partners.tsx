import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useStore } from '../../store/StoreContext';
import { useCurrentEvent } from '../../hooks/useCurrentEvent';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { listActivePartners } from '../../services/partnerService';
import { titleCase } from '../../utils/format';

export default function Partners() {
  const { db } = useStore();
  const event = useCurrentEvent();
  useDocumentMeta(`Partners — ${event.name} ${event.year}`, 'Ministries partnering with Vachan Shivir.');

  const partners = listActivePartners(db, event.id);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20">
      <PageHeader title="Our Partners & Organisers" intro="Ministries working alongside Vachan Shivir to serve and equip local churches across India." />
      <section className="shell py-14">
        {partners.length === 0 ? (
          <EmptyState title="No partners published" description="Partner organisations will appear here once published." />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <a
                key={p.id}
                href={p.website}
                target="_blank"
                rel="noreferrer"
                className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all duration-300 group shadow-xs"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 p-2.5 flex items-center justify-center border border-slate-200 shadow-2xs">
                    {p.logo ? (
                      <img src={p.logo} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
                    ) : (
                      <span className="font-bold text-slate-800 text-xl">{p.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <span className="inline-block text-[10px] font-bold tracking-widest text-amber-800 uppercase mb-1 font-mono">
                      {titleCase(p.category)}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    {p.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>Visit Website</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
