import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '../../components/public/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { useStore } from '../../store/StoreContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getSpeaker } from '../../services/speakerService';

export default function SpeakerDetail() {
  const { id = '' } = useParams();
  const { db } = useStore();
  const speaker = getSpeaker(db, id);
  useDocumentMeta(speaker ? `${speaker.name} — Vachan Shivir` : 'Speaker not found — Vachan Shivir');

  if (!speaker) {
    return (
      <section className="shell py-20">
        <EmptyState
          title="Speaker not found"
          description="This profile is not published, or the link is out of date."
          action={<Button to="/speakers" variant="outline">Back to speakers</Button>}
        />
      </section>
    );
  }

  const session = db.sessions.find((s) => s.id === speaker.sessionId);

  return (
    <>
      <PageHeader eyebrow={speaker.organisation} title={speaker.name} intro={speaker.designation} />
      <section className="shell grid gap-10 py-14 lg:grid-cols-[18rem_1fr]">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit">
          {speaker.photo ? (
            <img src={speaker.photo} alt={speaker.name} width={400} height={480} className="w-full object-cover rounded-2xl shadow-xs" />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-slate-300 bg-slate-50 rounded-2xl text-[13px] text-slate-400 font-medium">
              Photograph pending
            </div>
          )}
          <dl className="mt-6 space-y-3 divide-y divide-slate-100">
            <div className="pt-2"><dt className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Country</dt><dd className="mt-0.5 text-[14px] font-semibold text-slate-900">{speaker.country}</dd></div>
            {speaker.topic && <div className="pt-2"><dt className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Topic</dt><dd className="mt-0.5 text-[14px] font-semibold text-slate-900">{speaker.topic}</dd></div>}
            {session && <div className="pt-2"><dt className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">Session</dt><dd className="mt-0.5 text-[14px] font-semibold text-slate-900">{session.title}</dd></div>}
          </dl>
          {(speaker.linkedin || speaker.website) && (
            <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {speaker.website && <Button href={speaker.website} size="sm" variant="outline">Website</Button>}
              {speaker.linkedin && <Button href={speaker.linkedin} size="sm" variant="outline">LinkedIn</Button>}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-4">About the Speaker</h3>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{speaker.bio}</p>
          </div>
          <div>
            <Link to="/speakers" className="inline-flex items-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-900 hover:underline">
              <ArrowLeft size={16} /> Back to all speakers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
