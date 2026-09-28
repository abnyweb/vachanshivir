import { useState, useEffect, useMemo } from 'react';
import {
  Activity, ShieldCheck, Server, RefreshCw, Search
} from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import type { TrafficLog } from '../../types';

export default function TrafficLogs() {
  useDocumentMeta('Web App Traffic & Security Activity Logs — Vachan Shivir Admin');

  const [logs, setLogs] = useState<TrafficLog[]>([]);
  const [stats, setStats] = useState<{
    totalHits: number;
    uniqueIps: number;
    topPages: { path: string; count: number }[];
    blockedThreats: number;
  }>({
    totalHits: 0,
    uniqueIps: 0,
    topPages: [],
    blockedThreats: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const fetchTrafficData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/traffic-logs');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Backend traffic logs unavailable:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
    // Auto poll every 15s for live traffic
    const interval = setInterval(fetchTrafficData, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (threatFilter !== 'all' && l.threatLevel !== threatFilter) return false;
      if (methodFilter !== 'all' && l.method !== methodFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const ip = (l.ip || '').toLowerCase();
        const path = (l.path || '').toLowerCase();
        const ua = (l.userAgent || '').toLowerCase();
        const country = (l.country || '').toLowerCase();
        if (!ip.includes(q) && !path.includes(q) && !ua.includes(q) && !country.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [logs, threatFilter, methodFilter, search]);

  return (
    <AdminPage
      title="Web-App Traffic & Security Logs"
      description="Real-time monitoring of application traffic, unique visitor IP addresses, active endpoints, and web attack prevention events."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTrafficData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-navy' : ''} />
            <span>Refresh Feed</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* Real-time Telemetry Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-navy-950 rounded-2xl p-4 shadow-brutal space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Total Web-App Requests
            </span>
            <div className="text-3xl font-black text-navy-950 font-mono">
              {(stats.totalHits || logs.length).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <Activity size={13} className="animate-pulse" />
              <span>Live Traffic Feed Active</span>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Unique Visitor IPs
            </span>
            <div className="text-3xl font-black text-slate-900 font-mono">
              {stats.uniqueIps || new Set(logs.map((l) => l.ip)).size}
            </div>
            <div className="text-[11px] text-slate-500">Participants &amp; Public Guests</div>
          </div>

          <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Threat Shield Status
            </span>
            <div className="text-xl font-black text-emerald-700 flex items-center gap-1.5 font-raleway">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ACTIVE &amp; PROTECTED</span>
            </div>
            <div className="text-[11px] text-slate-500">Rate Limiter + Sanitizer Engaged</div>
          </div>

          <div className="bg-white border-2 border-rose-300 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Mitigated Threats
            </span>
            <div className="text-3xl font-black text-rose-700 font-mono">
              {stats.blockedThreats || logs.filter((l) => l.threatLevel === 'blocked').length}
            </div>
            <div className="text-[11px] text-rose-600 font-bold">Attacks Blocked by Firewall</div>
          </div>
        </div>

        {/* Top Active Endpoints Pill Strip */}
        {stats.topPages && stats.topPages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-navy font-raleway block">
              Most Visited Endpoints (Top Traffic)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {stats.topPages.map((tp, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="font-bold text-navy-950">{tp.path}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-navy text-crossgold font-bold text-[10px]">{tp.count} hits</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search traffic logs by IP, Path, Browser, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-navy"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold font-raleway border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-navy"
            >
              <option value="all">All Traffic</option>
              <option value="safe">Safe / Normal</option>
              <option value="suspicious">Suspicious</option>
              <option value="blocked">Blocked Threats</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold font-raleway border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-navy"
            >
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Live Traffic Stream Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 uppercase font-raleway tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Request Path</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Security Level</th>
                  <th className="px-4 py-3.5">Device / User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <Server className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">No traffic logs match current filter.</p>
                      <p className="text-xs text-slate-400 mt-1">Live requests from users and participants will stream here automatically.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.slice(0, 100).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-navy-950 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {l.ip}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          l.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                          l.method === 'PUT' ? 'bg-amber-100 text-amber-800' :
                          l.method === 'DELETE' ? 'bg-rose-100 text-rose-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {l.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800 max-w-xs truncate">
                        {l.path}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          l.status < 300 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          l.status < 400 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          l.status === 403 || l.status === 429 ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase font-raleway ${
                          l.threatLevel === 'blocked' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          l.threatLevel === 'suspicious' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {l.threatLevel || 'safe'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-[11px]" title={l.userAgent}>
                        {l.userAgent}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminPage>
  );
}
