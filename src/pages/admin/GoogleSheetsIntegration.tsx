import { useState, useEffect } from 'react';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Share2, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';

interface SyncData {
  connected: boolean;
  spreadsheetName: string;
  spreadsheetUrl: string;
  lastSync: string;
  stats: { total: number; successful: number; pending: number; failed: number };
  jobs: Array<{
    id: string;
    target: string;
    action: string;
    status: string;
    errorMessage?: string;
    createdAt: string;
  }>;
}

export default function GoogleSheetsIntegration() {
  const [data, setData] = useState<SyncData | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSyncData = async () => {
    try {
      const res = await fetch('/api/integrations/google-sheets');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('/api/integrations/google-sheets/sync', { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setMessage(json.message || 'Sync completed!');
        fetchSyncData();
      }
    } catch {
      setMessage('Failed to trigger sync.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-raleway text-navy-950 flex items-center gap-2">
            <Share2 className="text-crossgold" size={28} />
            Google Sheets Automated Synchronization
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-sans">
            Secondary data channel linking PostgreSQL DB registrations, payments, and CRM records to Google Sheets.
          </p>
        </div>
        <Button onClick={handleManualSync} disabled={syncing} className="flex items-center gap-2 bg-[#153A66] hover:bg-[#1B4980] text-white font-medium shadow-xs text-xs">
          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Synchronizing...' : 'Sync Now'}
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 font-bold font-sans">
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {data && (
        <>
          {/* Connection Overview Banner */}
          <Card className="bg-white border-l-4 border-l-emerald-600 shadow-sm">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-lg font-raleway font-bold text-slate-900">{data.spreadsheetName}</h2>
                </div>
                <p className="text-xs text-slate-500 font-sans">Last Successful Sync: {new Date(data.lastSync).toLocaleString()}</p>
              </div>
              <a
                href={data.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-navy hover:underline font-sans"
              >
                Open Google Spreadsheet <ExternalLink size={14} />
              </a>
            </CardContent>
          </Card>

          {/* Sync Queue Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-ink/50 uppercase font-semibold">Total Sync Jobs</p>
              <p className="text-2xl font-bold text-ink mt-1">{data.stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-ink/50 uppercase font-semibold">Successful Syncs</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{data.stats.successful}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-ink/50 uppercase font-semibold">Pending Queue</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{data.stats.pending}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-ink/50 uppercase font-semibold">Failed Syncs</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">{data.stats.failed}</p>
            </Card>
          </div>

          {/* Sync Jobs Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Google Sheets Sync Jobs Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bone/60 border-b border-ink/10 font-semibold text-ink/60 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Job ID</th>
                    <th className="px-4 py-2.5">Action</th>
                    <th className="px-4 py-2.5">Target</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {data.jobs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-ink/40">
                        No sync jobs logged.
                      </td>
                    </tr>
                  ) : (
                    data.jobs.map((j) => (
                      <tr key={j.id}>
                        <td className="px-4 py-2.5 font-mono text-ink/70">{j.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-ink">{j.action}</td>
                        <td className="px-4 py-2.5 text-ink/60">{j.target}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              j.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-ink/50">{new Date(j.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
