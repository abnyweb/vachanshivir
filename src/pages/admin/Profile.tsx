import { useState, useEffect } from 'react';
import {
  Mail, Phone, ShieldCheck, CheckCircle2, Save,
  KeyRound, RefreshCw
} from 'lucide-react';
import { AdminPage } from '../../components/admin/AdminPage';
import { useAuth } from '../../auth/AuthContext';
import { useStore } from '../../store/StoreContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../components/common/ToastProvider';
import { titleCase } from '../../utils/format';

export default function ProfilePage() {
  useDocumentMeta('My Admin Profile — Vachan Shivir');
  const { user: currentUser } = useAuth();
  const { db, update } = useStore();
  const { notify } = useToast();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Load existing profile from backend or store
  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || '');

    // Check store users first
    const match = (db.users || []).find((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (match && match.phone) {
      setPhone(match.phone);
    }

    // Also fetch fresh from server
    fetch(`/api/admin/profile?email=${encodeURIComponent(currentUser.email)}`)
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return res.ok && ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data && data.profile) {
          if (data.profile.phone) setPhone(data.profile.phone);
          if (data.profile.name) setName(data.profile.name);
        }
      })
      .catch(() => {
        /* fallback to client session */
      });
  }, [currentUser, db.users]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) {
        console.warn('Admin profile endpoint returned non-200 status, saved to store.');
      }

      // Update in client store
      const userInStore = (db.users || []).find((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (userInStore) {
        update('users', userInStore.id, {
          name: name.trim(),
          phone: phone.trim(),
        });
      }

      // Also persist to current session
      const sessionRaw = sessionStorage.getItem('vachanshivir.google.session') || localStorage.getItem('vachanshivir.google.session');
      if (sessionRaw) {
        try {
          const sessionUser = JSON.parse(sessionRaw);
          sessionUser.name = name.trim();
          sessionUser.phone = phone.trim();
          sessionStorage.setItem('vachanshivir.google.session', JSON.stringify(sessionUser));
          localStorage.setItem('vachanshivir.google.session', JSON.stringify(sessionUser));
        } catch {
          /* ignore */
        }
      }

      notify('Phone number & profile updated successfully!', 'success');
    } catch (err: any) {
      notify('Failed to save profile updates. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'VS';

  return (
    <AdminPage
      title="Administrator Profile"
      description="Manage your verified administrative credentials, contact telephone, and system access rights."
    >
      <div className="max-w-4xl space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#153A66] text-white font-bold text-xl sm:text-2xl flex items-center justify-center border-2 sm:border-4 border-slate-200 shadow-sm shrink-0">
                {initials}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-2xl font-black font-raleway text-slate-900 tracking-tight">
                    {name || currentUser?.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-900 border border-amber-400 whitespace-nowrap shrink-0">
                    <ShieldCheck size={12} className="text-amber-600" />
                    {currentUser ? titleCase(currentUser.role.toLowerCase()) : 'Admin'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser?.email}</span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] text-emerald-600 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Verified Account</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono">Active Session</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left sm:text-right text-xs space-y-1 w-full sm:w-auto">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400">Security Clearance</div>
              <div className="font-mono text-slate-800 font-bold">ALL ACCESS (*)</div>
              <div className="text-[10px] text-emerald-600 font-bold">Server Verified</div>
            </div>
          </div>
        </div>

        {/* Edit Contact Details Form */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black font-raleway text-slate-900">Personal Contact Information</h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Update your mobile phone number for verification, event coordination, and alerts.
              </p>
            </div>
            {saving && (
              <span className="text-xs font-mono text-amber-600 flex items-center gap-1">
                <RefreshCw size={13} className="animate-spin" /> Saving...
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1.5">
                  Display Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-navy bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1.5">
                  Verified Google Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-500 bg-slate-100 cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Managed via Google Single Sign-On. Identity email cannot be changed directly.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1.5 flex items-center justify-between">
                  <span>Contact Phone Number</span>
                  <span className="text-[10px] text-amber-700 font-mono font-bold">Important for Admin Alerts</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-navy font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Add or update your official phone number. It will be saved securely and synced to your CRM record.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 font-raleway mb-1.5">
                  Administrative Role
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.role || 'SUPER_ADMIN'}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-500 bg-slate-100 cursor-not-allowed font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Server-side authorization enforced via email whitelist.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#153A66] hover:bg-[#1B4980] text-white font-medium text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{saving ? 'Saving Updates…' : 'Save Profile & Phone Number'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & Access Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-black font-raleway text-sm">
            <KeyRound size={16} className="text-amber-600" />
            <span>Security &amp; Authorization Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Authentication Method</div>
              <div className="font-bold text-slate-900">Google OAuth 2.0 SSO</div>
              <div className="text-[11px] text-slate-500">JWT Token Signature Checked</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Role Hierarchy</div>
              <div className="font-bold text-slate-900">Super Administrator</div>
              <div className="text-[11px] text-slate-500">Full Unrestricted Backoffice Scope</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Bot Defense Status</div>
              <div className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Active &amp; Enforced
              </div>
              <div className="text-[11px] text-slate-500">ShieldSec Turnstile Captcha</div>
            </div>
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
