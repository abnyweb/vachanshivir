import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { CaptchaWidget } from '../../components/common/CaptchaWidget';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  useDocumentMeta('Reset Your Password — Vachan Shivir 2026');

  const [email, setEmail] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    if (qEmail) {
      setEmail(qEmail.trim());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified || !captchaToken) {
      setError('Please complete the Captcha security challenge.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await requestPasswordReset(trimmedEmail, captchaToken);
      setBusy(false);

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(res.message || 'Unable to process reset request. Please try again.');
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
                Account Recovery
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-black font-raleway text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="mt-0.5 text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              Enter your registered email address and we'll send you a secure link to create or reset your password.
            </p>
          </div>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-base font-bold text-white font-raleway">
              Reset Instructions Dispatched
            </h2>
            <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
              If an account or registration exists for <strong className="font-mono text-white">{email}</strong>, a secure password setup link has been sent to your inbox.
            </p>
            <p className="text-[11px] text-white/60">
              Please check your inbox (and spam or promotions folder). The link remains valid for 1 hour.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider inline-flex items-center justify-center gap-1.5 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all font-raleway"
              >
                <span>Return to Sign In</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  required
                  placeholder="delegate@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="p-2.5 bg-[#071322]/80 border border-crossgold/20 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-white">
                <span className="flex items-center gap-1 font-raleway text-slate-300">
                  <ShieldCheck size={12} className="text-crossgold" /> Anti-Bot Security Verification
                </span>
                {captchaVerified && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
              </div>
              <CaptchaWidget
                verified={captchaVerified}
                onVerify={(token) => {
                  setCaptchaVerified(true);
                  setCaptchaToken(token);
                  setError(null);
                }}
                onReset={() => {
                  setCaptchaVerified(false);
                  setCaptchaToken('');
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!captchaVerified || busy || !email.trim()}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
                captchaVerified && !busy && email.trim()
                  ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                  : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{busy ? 'Sending Link…' : 'Send Password Reset Link'}</span>
              <ArrowRight size={13} className="opacity-80" />
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-crossgold font-bold hover:underline font-raleway"
              >
                <ArrowLeft size={13} />
                <span>Back to Participant Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-[10px] text-white/50 text-center pt-3 border-t border-white/10">
          <Link to="/" className="text-slate-400 hover:text-white inline-block font-raleway">
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
