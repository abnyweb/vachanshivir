import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { ShieldCheck, Search } from 'lucide-react';

interface AuditEntry {
  id: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/audit-logs')
      .then((res) => (res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json() : { logs: [] }))
      .then((data) => setLogs(data.logs || []))
      .catch(() => setLogs([]));
  }, []);

  const filtered = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entityType.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      (l.userEmail || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-sans text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-[#153A66]" size={26} />
          System Audit Logs & Security History
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-sans">
          Complete chronological record of administrator actions, registration updates, payment verifications, and resource modifications.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search audit logs by action, user, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-raleway font-bold text-slate-900">Audit Records ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
              <tr>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Entity Type</th>
                <th className="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{l.userEmail || 'system@vachanshivir.org'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-navy-50 text-navy font-bold text-[10px] uppercase border border-navy/15">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{l.entityType}</td>
                    <td className="px-4 py-2.5 text-slate-800">{l.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
