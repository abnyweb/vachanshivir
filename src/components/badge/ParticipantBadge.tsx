import React, { useState } from 'react';
import type { Attendee } from '../../types';
import { Printer, CheckCircle2 } from 'lucide-react';

interface ParticipantBadgeProps {
  attendee: Attendee;
  onPrint?: () => void;
  onDownload?: () => void;
}

/**
 * Renders a clean QR Code SVG pattern generated deterministically from a token string.
 */
function DeterministicQR({ token, size = 130 }: { token: string; size?: number }) {
  const cells = 21;
  const cellSize = size / cells;

  const getCellState = (r: number, c: number) => {
    if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || r === cells - 1 || r === cells - 7 || c === cells - 1 || c === cells - 7) return true;
      if (r === 1 || r === 5 || c === 1 || c === 5 || r === cells - 2 || r === cells - 6 || c === cells - 2 || c === cells - 6) return false;
      return true;
    }
    let hash = 0;
    const str = `${token}-${r}-${c}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2 === 0;
  };

  const rects: React.JSX.Element[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (getCellState(r, c)) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#000000"
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-2 border border-slate-300 rounded-lg shadow-xs">
      {rects}
    </svg>
  );
}

export function ParticipantBadge({ attendee, onPrint }: ParticipantBadgeProps) {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');

  const token = attendee.checkinToken || `chk_tok_${attendee.id}_${attendee.reference}`;
  const church = attendee.churchName || attendee.organisation || 'Independent Pastor';
  const location = [attendee.city, attendee.state].filter(Boolean).join(', ') || 'India';
  const categoryLabel = attendee.designation || (attendee.categoryId ? attendee.categoryId.replace(/cat-|-/g, ' ') : 'PASTOR / DELEGATE');

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-2xl">
      {/* Side Toggle Control Bar */}
      <div className="flex items-center gap-2 mb-4 bg-slate-900 text-white p-1.5 rounded-2xl border border-white/10 shadow-md print:hidden">
        <button
          onClick={() => setActiveSide('front')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeSide === 'front' ? 'bg-[#B50909] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Front Badge
        </button>
        <button
          onClick={() => setActiveSide('back')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeSide === 'back' ? 'bg-[#B50909] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Backside Schedule
        </button>
        <button
          onClick={() => setActiveSide('both')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
            activeSide === 'both' ? 'bg-[#B50909] text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Both Sides (Print View)
        </button>
        <button
          onClick={handlePrint}
          className="ml-2 flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Printer size={13} /> Print
        </button>
      </div>

      {/* Badges Container */}
      <div className="flex flex-wrap justify-center gap-6 items-start">
        
        {/* 1. FRONT BADGE (Theme & Participant Identity) */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="w-[320px] bg-white border-2 border-slate-900 rounded-2xl shadow-2xl overflow-hidden text-slate-900 flex flex-col justify-between relative print:shadow-none print:border-slate-800">
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-[#7F0401] to-[#B50909] text-white p-4 text-center relative overflow-hidden">
              <div className="text-[9px] font-black tracking-[0.2em] uppercase text-amber-300">
                VACHAN ADHYAYAN SHIVIR 2026
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white mt-0.5">
                VACHAN SHIVIR <span className="text-amber-400 font-serif">2026</span>
              </h1>
              <div className="text-[10px] font-bold tracking-wider text-white/90 uppercase mt-0.5 border-t border-white/20 pt-1">
                Theme: Expository Preaching & Church Ministry
              </div>
            </div>

            {/* Delegate Info */}
            <div className="p-5 text-center space-y-3 bg-gradient-to-b from-white to-slate-50">
              <div>
                <span className="text-[9px] font-extrabold tracking-widest text-[#B50909] uppercase px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                  {categoryLabel}
                </span>
                <h2 className="text-xl font-black text-slate-950 tracking-tight mt-2 leading-tight">
                  {attendee.name}
                </h2>
              </div>

              <div className="border-t border-b border-slate-200/80 py-2.5 space-y-0.5">
                <p className="font-bold text-xs text-slate-800 line-clamp-1">{church}</p>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{location}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center pt-1">
                <DeterministicQR token={token} size={120} />
                <span className="mt-1.5 font-mono text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                  REF: #{attendee.reference}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 text-white px-4 py-2 text-center text-[9px] font-bold tracking-wider flex justify-between items-center border-t border-slate-800">
              <span className="text-amber-300 uppercase">Puri, Odisha</span>
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED BADGE
              </span>
            </div>
          </div>
        )}

        {/* 2. BACKSIDE BADGE (Conference Programme Schedule) */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="w-[320px] bg-slate-900 text-white border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between relative print:shadow-none print:bg-slate-900 print:text-white">
            {/* Backside Header */}
            <div className="bg-[#7F0401] p-3 text-center border-b border-white/10">
              <div className="text-[9px] font-bold tracking-[0.2em] text-amber-300 uppercase">
                VACHAN SHIVIR 2026 PROGRAMME SCHEDULE
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                October 26 &ndash; 29, 2026 &bull; Puri, Odisha
              </div>
            </div>

            {/* Schedule Timeline Grid */}
            <div className="p-4 space-y-3 text-[10px] bg-slate-900">
              {/* Day 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300 border-b border-white/10 pb-0.5">
                  <span>DAY 1 &bull; MON, OCT 26</span>
                  <span className="text-[8px] font-normal text-white/60">CHECK-IN &amp; OPENING</span>
                </div>
                <div className="text-white/80 space-y-0.5 pl-1">
                  <div><strong className="text-white font-mono">05:00 PM</strong> Registration Check-in</div>
                  <div><strong className="text-white font-mono">07:00 PM</strong> Opening Dinner &amp; Session 1</div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300 border-b border-white/10 pb-0.5">
                  <span>DAY 2 &bull; TUE, OCT 27</span>
                  <span className="text-[8px] font-normal text-white/60">EXPOSITORY SESSIONS</span>
                </div>
                <div className="text-white/80 space-y-0.5 pl-1">
                  <div><strong className="text-white font-mono">09:00 AM</strong> Morning Expositions (S2 &amp; S3)</div>
                  <div><strong className="text-white font-mono">03:30 PM</strong> Afternoon Session (S4)</div>
                  <div><strong className="text-white font-mono">07:00 PM</strong> Dinner &amp; Session 5</div>
                </div>
              </div>

              {/* Day 3 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300 border-b border-white/10 pb-0.5">
                  <span>DAY 3 &bull; WED, OCT 28</span>
                  <span className="text-[8px] font-normal text-white/60">WORKSHOPS &amp; Q&amp;A</span>
                </div>
                <div className="text-white/80 space-y-0.5 pl-1">
                  <div><strong className="text-white font-mono">09:00 AM</strong> Morning Expositions (S6 &amp; S7)</div>
                  <div><strong className="text-white font-mono">03:30 PM</strong> Pastoral Q&amp;A (S8)</div>
                  <div><strong className="text-white font-mono">07:00 PM</strong> Evening Session (S9)</div>
                </div>
              </div>
            </div>

            {/* Backside Footer Rules & Helpline */}
            <div className="bg-slate-950 px-4 py-2 text-center text-[8px] text-white/60 border-t border-white/10 space-y-0.5">
              <div>Please wear this badge at all times during sessions &amp; meals.</div>
              <div className="text-amber-300 font-mono">Helpline: +91 96961 10134 &bull; Puri, Odisha</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

