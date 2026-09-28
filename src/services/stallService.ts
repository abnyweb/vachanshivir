import type { Database } from '../store/database';
import type { Stall, StallStatus } from '../types';

export const listStalls = (db: Database, eventId: string): Stall[] =>
  db.stalls.filter((s) => s.eventId === eventId).sort((a, b) => a.number.localeCompare(b.number));

export const getStall = (db: Database, id: string): Stall | undefined => db.stalls.find((s) => s.id === id);

export const STALL_STATUSES: StallStatus[] = ['available', 'held', 'reserved', 'confirmed', 'paid', 'blocked'];

export const STALL_STATUS_STYLE: Record<StallStatus, string> = {
  available: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  held: 'bg-amber-50 border-amber-300 text-amber-900',
  reserved: 'bg-sky-50 border-sky-300 text-sky-900',
  confirmed: 'bg-amber-100 border-amber-400 text-amber-950 font-semibold',
  paid: 'bg-purple-50 border-purple-300 text-purple-900 font-semibold',
  blocked: 'bg-slate-100 border-slate-300 text-slate-400 line-through',
};

export function stallSummary(stalls: Stall[]) {
  const by = (s: StallStatus) => stalls.filter((x) => x.status === s).length;
  return {
    total: stalls.length,
    available: by('available'),
    reserved: by('reserved') + by('held'),
    sold: by('confirmed') + by('paid'),
    blocked: by('blocked'),
    revenue: stalls.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.price, 0),
  };
}

export function zonesOf(stalls: Stall[]): { zone: string; stalls: Stall[] }[] {
  const map = new Map<string, Stall[]>();
  for (const s of stalls) map.set(s.zone, [...(map.get(s.zone) ?? []), s]);
  return [...map.entries()].map(([zone, list]) => ({ zone, stalls: list }));
}
