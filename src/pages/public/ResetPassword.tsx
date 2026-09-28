import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useDocumentMeta('Set New Password — Vachan Shivir 2026');

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Missing or invalid reset token. Please request a new password reset link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await resetPassword(token, password);
      setBusy(false);

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to update password. Your reset link may have expired.');
      }
    } catch {
      setBusy(false);
      setError('A connection error occurred. Please try again.');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center text-white px-4 py-12 selection:bg-crossgold selection:text-navy-950 font-sans"
      style={{
        backgroundColor: '#0B1D33',
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, #1B4980 0%, #0B1D33 70%, #071322 100%)',
      }}
    >
      <div className="w-full max-w-md bg-[#0B1D33]/95 border-2 border-crossgold/40 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#1B4980] space-y-5 relative overflow-hidden backdrop-blur-xl">
        {/* Decorative Ambient Accents */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-crossgold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#1B4980]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-crossgold text-navy-950 font-raleway font-black text-lg flex items-center justify-center border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF]">
              VS
            </div>
            <div className="text-left">
              <span className="block text-xl font-black font-raleway text-white tracking-tight leading-none">
                VACHAN SHIVIR
              </span>
              <span className="text-[10px] font-mono tracking-widest text-crossgold uppercase font-bold">
                Account Security
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-black font-raleway text-white tracking-tight">
              Create New Password
            </h1>
            <p className="mt-0.5 text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              Set a secure password for your Vachan Shivir participant account.
            </p>
          </div>
        </div>

        {/* Missing Token Warning */}
        {!token ? (
          <div className="p-4 bg-amber-950/70 border border-amber-500/50 rounded-2xl text-center space-y-3">
            <AlertCircle size={28} className="text-amber-400 mx-auto" />
            <h2 className="text-sm font-bold text-white">Reset Token Missing</h2>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              No reset token was found in the link. Please request a new password reset email.
            </p>
            <div className="pt-2">
              <Link
                to="/forgot-password"
                className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-bold text-xs uppercase tracking-wider inline-block text-center border-2 border-navy-950"
              >
                Request Password Reset
              </Link>
            </div>
          </div>
        ) : success ? (
          /* Success Screen */
          <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-base font-bold text-white font-raleway">
              Password Reset Complete!
            </h2>
            <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
              Your new password has been securely saved. You can now sign in to access your registration and passes.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-raleway cursor-pointer"
              >
                <span>Proceed to Participant Sign In</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          /* Password Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || !password || !confirmPassword}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
                !busy && password && confirmPassword
                  ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{busy ? 'Updating Password…' : 'Set New Password'}</span>
              <ArrowRight size={13} className="opacity-80" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-[10px] text-white/50 text-center pt-3 border-t border-white/10">
          <Link to="/login" className="text-crossgold font-bold hover:underline font-raleway">
            Return to Participant Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
