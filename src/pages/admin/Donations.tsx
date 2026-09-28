import { useState, useMemo, useEffect } from 'react';
import {
  Heart, Search, Download, Plus, CheckCircle2, Clock, RefreshCw, Eye, X
} from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { useStore } from '../../store/StoreContext';
import { useToast } from '../../components/common/ToastProvider';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { getDonationStats, listDonations, generateDonationReceipt } from '../../services/donationService';
import type { Donation, DonationPaymentMode, DonationPaymentStatus } from '../../types';

export default function AdminDonations() {
  useDocumentMeta('Ministry Support & Donations — Vachan Shivir Admin');
  const { db, create, update } = useStore();
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for manual offline donation entry
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    amount: 3000,
    paymentMode: 'direct_bank' as DonationPaymentMode,
    paymentStatus: 'paid' as DonationPaymentStatus,
    purpose: '1 पास्टर पास प्रायोजित (Sponsor 1 Rural Pastor)',
    utrNumber: '',
    notes: '',
  });

  // Fetch latest donations from backend on load
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshDonations = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/donations');
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.includes('application/json')) {
        const data = await res.json();
        if (data.donations && Array.isArray(data.donations)) {
          // Merge missing into client store
          const existingIds = new Set((db.donations || []).map((d) => d.id));
          for (const d of data.donations) {
            if (!existingIds.has(d.id)) {
              create('donations', d);
            }
          }
        }
      }
    } catch {
      // offline/client store fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshDonations();
  }, []);

  const allDonations = useMemo(() => listDonations(db), [db.donations]);
  const stats = useMemo(() => getDonationStats(allDonations), [allDonations]);

  const filtered = useMemo(() => {
    return allDonations.filter((d) => {
      if (statusFilter !== 'all' && d.paymentStatus !== statusFilter) return false;
      if (modeFilter !== 'all' && d.paymentMode !== modeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const name = (d.donorName || '').toLowerCase();
        const email = (d.donorEmail || '').toLowerCase();
        const phone = (d.donorPhone || '').toLowerCase();
        const receipt = (d.receiptNumber || '').toLowerCase();
        const payId = (d.razorpayPaymentId || '').toLowerCase();
        const utr = (d.bankDetails?.utrNumber || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !receipt.includes(q) && !payId.includes(q) && !utr.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allDonations, statusFilter, modeFilter, search]);

  const handleVerifyDonation = async (donation: Donation) => {
    update('donations', donation.id, {
      paymentStatus: 'paid',
      verifiedBy: 'Administrator',
      updatedAt: new Date().toISOString(),
    });

    try {
      await fetch(`/api/donations/${donation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
    } catch {
      // ignore
    }

    notify(`सहयोग रसीद #${donation.receiptNumber} सत्यापित एवं पूर्ण चिन्हित की गई!`, 'success');
  };

  const handleCreateManualDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName.trim()) {
      notify('कृपया सहयोगी का नाम दर्ज करें', 'error');
      return;
    }
    if (formData.amount <= 0) {
      notify('कृपया मान्य राशि दर्ज करें', 'error');
      return;
    }

    const newDonation: Donation = {
      id: `dnt_adm_${Date.now()}`,
      donorName: formData.donorName.trim(),
      donorEmail: formData.donorEmail.trim(),
      donorPhone: formData.donorPhone.trim(),
      amount: Number(formData.amount),
      currency: 'INR',
      paymentMode: formData.paymentMode,
      paymentStatus: formData.paymentStatus,
      receiptNumber: generateDonationReceipt(),
      purpose: formData.purpose.trim(),
      notes: formData.notes.trim(),
      bankDetails: formData.utrNumber ? { bankName: 'HDFC Bank', utrNumber: formData.utrNumber.trim() } : undefined,
      createdAt: new Date().toISOString(),
      verifiedBy: 'Administrator',
    };

    create('donations', newDonation);

    try {
      await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonation),
      });
    } catch {
      // ignore
    }

    setIsAddModalOpen(false);
    notify('सहयोग प्रविष्टि सफलतापूर्वक जोड़ी गई!', 'success');
    setFormData({
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      amount: 3000,
      paymentMode: 'direct_bank',
      paymentStatus: 'paid',
      purpose: '1 पास्टर पास प्रायोजित (Sponsor 1 Rural Pastor)',
      utrNumber: '',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      notify('निर्यात करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है', 'info');
      return;
    }
    const headers = ['Receipt', 'Date', 'Donor Name', 'Email', 'Phone', 'Amount (INR)', 'Payment Mode', 'Status', 'Payment/UTR ID', 'Purpose'];
    const rows = filtered.map((d) => [
      `"${d.receiptNumber || ''}"`,
      `"${new Date(d.createdAt).toLocaleDateString()}"`,
      `"${d.donorName || ''}"`,
      `"${d.donorEmail || ''}"`,
      `"${d.donorPhone || ''}"`,
      d.amount,
      `"${d.paymentMode}"`,
      `"${d.paymentStatus}"`,
      `"${d.razorpayPaymentId || d.bankDetails?.utrNumber || ''}"`,
      `"${d.purpose || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vachanshivir_donations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('सहयोग डेटा CSV सफलतापूर्वक डाउनलोड हुआ!', 'success');
  };

  return (
    <AdminPage
      title="Ministry Support & Donations"
      description="Track delegate sponsorships, Bible distribution offerings, and live donor payments received for Vachan Shivir 2026."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={refreshDonations}
            disabled={isRefreshing}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-xs flex items-center justify-center"
            title="Refresh Donations"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-navy' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#153A66] hover:bg-[#1B4980] text-white text-xs font-medium rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Record Offline Support</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
              Total Support Collected
            </span>
            <div className="text-2xl font-bold text-slate-900 font-sans flex items-baseline gap-1">
              <span>₹{stats.totalAmountCollected.toLocaleString()}</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{stats.paidCount} Verified Contributions</span>
            </div>
          </div>

          <div className="bg-white border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Pending Verification
            </span>
            <div className="text-2xl font-black text-amber-700 font-mono">
              ₹{stats.totalPendingAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
              <Clock size={12} />
              <span>{stats.pendingCount} Direct Transfers</span>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Pastors Passes Funded
            </span>
            <div className="text-2xl font-black text-navy-800 font-mono">
              {stats.pastorPassesSponsored} <span className="text-xs font-sans text-slate-500 font-normal">Passes (₹3k ea)</span>
            </div>
            <div className="text-[11px] text-slate-500">Full 4-Day Delegate Coverage</div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Ministry Supporters
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {stats.uniqueDonorsCount}
            </div>
            <div className="text-[11px] text-slate-500">Unique Donors Recorded</div>
          </div>

          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-raleway">
              Average Contribution
            </span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{stats.avgDonation.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Per Successful Transaction</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Donor Name, Email, Phone, Receipt #, or UTR/Txn ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold font-raleway border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-navy"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid / Verified</option>
              <option value="pending">Pending Verification</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold font-raleway border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-navy"
            >
              <option value="all">All Modes</option>
              <option value="razorpay">Razorpay Online</option>
              <option value="direct_bank">Direct HDFC Bank</option>
              <option value="upi">Direct UPI</option>
              <option value="cash">Cash / Offline</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 uppercase font-raleway tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Receipt #</th>
                  <th className="px-4 py-3.5">Donor Details</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Mode</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Purpose / Notes</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <Heart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold">No ministry support records match your filters.</p>
                      <p className="text-xs text-slate-400 mt-1">Donations submitted on the public portal will appear here automatically.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-navy-950 whitespace-nowrap">
                        {d.receiptNumber || 'VS26-DON'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-sm">{d.donorName}</div>
                        <div className="text-[11px] text-slate-500 font-sans flex items-center gap-2 mt-0.5">
                          {d.donorEmail && <span>{d.donorEmail}</span>}
                          {d.donorPhone && <span>• {d.donorPhone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-black text-sm text-navy-950 whitespace-nowrap">
                        ₹{d.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                          d.paymentMode === 'razorpay'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {d.paymentMode === 'razorpay' ? 'Razorpay' : 'HDFC Bank / UPI'}
                        </span>
                        {d.bankDetails?.utrNumber && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            UTR: {d.bankDetails.utrNumber}
                          </div>
                        )}
                        {d.razorpayPaymentId && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {d.razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-raleway tracking-wider ${
                          d.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : d.paymentStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {d.paymentStatus === 'paid' ? 'Verified / Paid' : d.paymentStatus === 'pending' ? 'Pending Verification' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                        <div className="font-semibold text-slate-800 truncate">{d.purpose}</div>
                        {d.notes && <div className="text-[11px] text-slate-400 truncate italic">{d.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.paymentStatus === 'pending' && (
                            <button
                              onClick={() => handleVerifyDonation(d)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] font-raleway transition-colors"
                              title="Verify Bank Transfer"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedDonation(d)}
                            className="p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Receipt Details"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Record Manual Offline Support */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-navy">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-amber-600" />
                <h3 className="font-raleway font-black text-lg text-slate-900">Record Offline Ministry Support</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualDonation} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Kumar"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="donor@example.com"
                    value={formData.donorEmail}
                    onChange={(e) => setFormData({ ...formData, donorEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9696110134"
                    value={formData.donorPhone}
                    onChange={(e) => setFormData({ ...formData, donorPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold focus:border-navy"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as DonationPaymentMode })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:border-navy"
                  >
                    <option value="direct_bank">Direct HDFC Bank (NEFT/IMPS)</option>
                    <option value="upi">Direct UPI (satyamultiservicejob@icici)</option>
                    <option value="cash">Cash Contribution</option>
                    <option value="razorpay">Razorpay Online</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank UTR Number / UPI Ref ID</label>
                <input
                  type="text"
                  placeholder="e.g. 429182749102"
                  value={formData.utrNumber}
                  onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono focus:border-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sponsorship Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Pastor Pass Sponsorship / Bible Distribution"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:border-navy"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any additional pastoral or conference notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:border-navy"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-navy text-crossgold font-black rounded-xl font-raleway uppercase tracking-wider hover:bg-navy-900 shadow-sm border border-navy-950"
                >
                  Save Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Donation Receipt Details */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-navy">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  Official Ministry Receipt
                </span>
                <h3 className="font-raleway font-black text-xl text-navy-950">
                  {selectedDonation.receiptNumber || 'VS26-DON'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Contribution Amount:</span>
                  <span className="font-mono font-black text-lg text-navy-950">₹{selectedDonation.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-700 capitalize">{selectedDonation.paymentStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold text-slate-800 uppercase font-mono">{selectedDonation.paymentMode}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Donor Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedDonation.donorName}</span>
                </div>
                {selectedDonation.donorEmail && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                    <span className="text-slate-800">{selectedDonation.donorEmail}</span>
                  </div>
                )}
                {selectedDonation.donorPhone && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                    <span className="text-slate-800 font-mono">{selectedDonation.donorPhone}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Purpose</span>
                  <span className="text-slate-800">{selectedDonation.purpose}</span>
                </div>
                {selectedDonation.bankDetails?.utrNumber && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank UTR Number</span>
                    <span className="font-mono font-bold text-navy">{selectedDonation.bankDetails.utrNumber}</span>
                  </div>
                )}
                {selectedDonation.razorpayPaymentId && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Razorpay Payment ID</span>
                    <span className="font-mono text-slate-700">{selectedDonation.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDonation(null)}
                className="w-full py-2.5 bg-navy text-crossgold font-black rounded-xl font-raleway uppercase tracking-wider text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
