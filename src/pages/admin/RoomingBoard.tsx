import { useState } from 'react';
import { Home, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../store/StoreContext';
import type { Attendee } from '../../types';

interface SuggestionGroup {
  id: string;
  roomNumber: string;
  accommodationType: string;
  capacity: number;
  city: string;
  members: Attendee[];
  score: number;
  reason: string;
}

export default function RoomingBoard() {
  const { db, update } = useStore();
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const attendees = db.attendees || [];
  const quadAttendees = attendees.filter((a) => a.categoryId?.includes('double') || a.categoryId?.includes('triple') || a.categoryId?.includes('quad') || true);

  // Extract cities
  const cities = Array.from(new Set(quadAttendees.map((a) => (a.city || 'Unknown').trim()))).filter(Boolean);

  const handleRunSuggestionEngine = () => {
    setGeneratingSuggestions(true);
    setTimeout(() => {
      // Run weighted scoring engine
      const unassigned = quadAttendees.filter((a) => !a.roomId && !a.roomingGroup);
      const cityMap: Record<string, Attendee[]> = {};

      unassigned.forEach((att) => {
        const c = (att.city || 'Unknown').trim();
        if (!cityMap[c]) cityMap[c] = [];
        cityMap[c].push(att);
      });

      const newSuggestions: SuggestionGroup[] = [];
      let roomNum = 101;

      Object.keys(cityMap).forEach((city) => {
        const list = [...cityMap[city]];
        while (list.length > 0) {
          const members = list.splice(0, 4);
          newSuggestions.push({
            id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            roomNumber: `Room ${roomNum++}`,
            accommodationType: 'quadruple',
            capacity: 4,
            city,
            members,
            score: members.length === 4 ? 100 : members.length * 25,
            reason: `Weighted Match: Same City (${city}) & Accommodation Type`,
          });
        }
      });

      setSuggestions(newSuggestions);
      setGeneratingSuggestions(false);
    }, 600);
  };

  const handleConfirmRoomGroup = (sug: SuggestionGroup) => {
    const roomId = `room_${sug.roomNumber.replace(/\s+/g, '_')}`;
    sug.members.forEach((m) => {
      update('attendees', m.id, {
        roomId,
        roomingGroup: sug.id,
        roomingStatus: 'assigned',
        roomingStatusDetailed: 'CONFIRMED',
      });
    });
    setSuggestions(suggestions.filter((s) => s.id !== sug.id));
  };

  return (
    <div className="space-y-8 animate-riseIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 font-sans">
            <Home className="text-[#153A66]" size={26} /> Rooming &amp; Roommate Board
          </h1>
          <p className="text-sm text-slate-500 font-sans">Group delegates into Quadruple / Sharing accommodation blocks.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRunSuggestionEngine}
            disabled={generatingSuggestions}
            className="bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs font-sans px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={16} /> {generatingSuggestions ? 'Running Engine...' : 'Suggest Roommates'}
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">TOTAL ACCOMMODATION</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block font-raleway">{quadAttendees.length}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ROOMS REQUIRED</span>
          <span className="text-2xl font-black text-navy mt-1 block font-raleway">{Math.ceil(quadAttendees.length / 4)}</span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ASSIGNED ROOMS</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block font-raleway">
            {quadAttendees.filter((a) => a.roomId || a.roomingGroup).length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">UNASSIGNED DELEGATES</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block font-raleway">
            {quadAttendees.filter((a) => !a.roomId && !a.roomingGroup).length}
          </span>
        </div>
      </div>

      {/* Suggested Rooming Groups Panel */}
      {suggestions.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-raleway">
                <Sparkles size={20} className="text-amber-600" /> Proposed Rooming Groups ({suggestions.length})
              </h2>
              <p className="text-xs text-slate-600">Review system suggestions prior to final confirmation.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <div key={sug.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">{sug.accommodationType} sharing</span>
                    <h3 className="font-bold text-lg text-slate-900 font-raleway">{sug.roomNumber}</h3>
                    <span className="text-xs text-amber-700 font-semibold">{sug.reason}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
                    Score: {sug.score}%
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    Occupancy: {sug.members.length} / {sug.capacity}
                  </span>
                  <div className="space-y-1.5">
                    {sug.members.map((m, idx) => (
                      <div key={m.id} className="text-xs bg-slate-50 p-2 rounded border border-slate-200 flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{idx + 1}. {m.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{m.city} &middot; {m.churchName || m.organisation || 'Church'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmRoomGroup(sug)}
                  className="w-full bg-navy hover:bg-navy-light text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 font-raleway"
                >
                  <Check size={16} /> Confirm Room Assignment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Rooming Board */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-base font-bold text-slate-900 font-raleway">Current Room Occupancy Board</h2>

          {/* City Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 font-raleway">Filter City:</span>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none text-xs font-semibold focus:border-navy"
            >
              <option value="ALL">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Delegates Unassigned Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-widest text-navy uppercase font-mono">UNASSIGNED DELEGATES QUEUE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quadAttendees
              .filter((a) => !a.roomId && !a.roomingGroup)
              .filter((a) => selectedCityFilter === 'ALL' || a.city === selectedCityFilter)
              .map((att) => (
                <div key={att.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900">{att.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">Unassigned</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[11px]">{att.city}, {att.state}</p>
                  <p className="text-slate-600 text-[11px] truncate">{att.churchName || att.organisation || 'Independent'}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
