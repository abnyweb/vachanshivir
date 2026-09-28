import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  User,
  Shield,
  KeyRound,
  MessageSquare,
  Ticket,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { useAuth, isAuthorizedAdminEmail } from '../../auth/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { CaptchaWidget } from '../../components/common/CaptchaWidget';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '305428340271-8k799ruq6unmr1jsfuo29h03en2iufdt.apps.googleusercontent.com';

interface GoogleJwtPayload {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
}

function parseJwt(token: string): GoogleJwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse Google JWT token:', err);
    return null;
  }
}

export type PortalTab = 'participant' | 'admin' | 'password' | 'enquiry';

interface Props {
  initialCategory?: PortalTab;
}

export default function UnifiedPortal({ initialCategory }: Props) {
  const { user, signInWithPassword, signInWithGoogle, requestPasswordReset, resetPassword, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine initial active category tab
  const getInitialTab = (): PortalTab => {
    const queryTab = searchParams.get('tab') as PortalTab | null;
    if (queryTab && ['participant', 'admin', 'password', 'enquiry'].includes(queryTab)) {
      return queryTab;
    }
    if (searchParams.get('token')) {
      return 'password';
    }
    if (location.pathname.startsWith('/admin')) {
      return 'admin';
    }
    if (location.pathname.includes('password')) {
      return 'password';
    }
    if (location.pathname.includes('enquiry') || location.pathname.includes('contact')) {
      return 'enquiry';
    }
    return initialCategory || 'participant';
  };

  const [activeTab, setActiveTab] = useState<PortalTab>(getInitialTab);

  // Synchronize tab with route / query changes
  useEffect(() => {
    const tab = getInitialTab();
    setActiveTab(tab);
  }, [location.pathname, searchParams]);

  // Set document meta based on active tab
  useDocumentMeta(
    activeTab === 'admin'
      ? 'Master Admin Portal — Vachan Shivir 2026'
      : activeTab === 'password'
      ? 'Password Recovery — Vachan Shivir 2026'
      : activeTab === 'enquiry'
      ? 'Enquiry & Assistance — Vachan Shivir 2026'
      : 'Participant Portal — Vachan Shivir 2026'
  );

  // Common Form States
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Participant Login States
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPassword, setParticipantPassword] = useState('');
  const [showParticipantPassword, setShowParticipantPassword] = useState(false);
  const [participantErrorCode, setParticipantErrorCode] = useState<string | null>(null);
  const [participantNotRegistered, setParticipantNotRegistered] = useState(false);

  // 2. Admin Login States
  const [adminEmail, setAdminEmail] = useState('');

  // 3. Password Setup / Reset States
  const tokenFromUrl = searchParams.get('token') || '';
  const [resetToken, setResetToken] = useState(tokenFromUrl);
  const [forgotEmail, setForgotEmail] = useState(searchParams.get('email') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [forgotLinkSent, setForgotLinkSent] = useState(false);

  // 4. Enquiry Form States
  const [enqName, setEnqName] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqChurch, setEnqChurch] = useState('');
  const [enqMessage, setEnqMessage] = useState('');
  const [enqSubmitted, setEnqSubmitted] = useState(false);
  const [enqRef, setEnqRef] = useState('');

  // Reset errors and captchas when tab switches
  const handleTabSwitch = (newTab: PortalTab) => {
    setActiveTab(newTab);
    setError(null);
    setCaptchaVerified(false);
    setCaptchaToken('');
    // Update URL query cleanly without page reload
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('tab', newTab);
    setSearchParams(currentParams, { replace: true });
  };

  // Google Credential Response Handler (for both Participant & Admin)
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      setError('No credential token received from Google.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        setError('Unable to decode Google profile information.');
        setBusy(false);
        return;
      }

      // If on Admin tab, enforce admin email authorization
      if (activeTab === 'admin') {
        if (!isAuthorizedAdminEmail(payload.email)) {
          signOut();
          setBusy(false);
          setError(`Access Restricted: Account "${payload.email}" is not authorized for administrative access.`);
          return;
        }
      }

      const res = await signInWithGoogle({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        credential: response.credential,
        captchaToken: 'google-oauth-canvas-verified',
      });

      setBusy(false);

      if (res.ok && res.user) {
        if (res.user.role === 'PARTICIPANT') {
          if (activeTab === 'admin') {
            signOut();
            setError(`Access Restricted: Account "${payload.email}" does not have administrative privileges.`);
          } else {
            navigate('/my-vachanshivir', { replace: true });
          }
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        if (res.notRegistered) {
          setParticipantNotRegistered(true);
          setError(`No Vachan Shivir registration was found for ${payload.email}. Please register first.`);
        } else {
          setError(res.message || 'Google authentication failed.');
        }
      }
    } catch {
      setBusy(false);
      setError('An error occurred during Google authentication. Please try again.');
    }
  };

  // Initialize Google Identity Services (One-Tap & rendered button)
  useEffect(() => {
    let unmounted = false;

    const initGsi = () => {
      if (unmounted || !window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render participant button if present
        const pBtn = document.getElementById('unified-participant-gsi');
        if (pBtn) {
          pBtn.innerHTML = '';
          window.google.accounts.id.renderButton(pBtn, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }

        // Render admin button if present
        const aBtn = document.getElementById('unified-admin-gsi');
        if (aBtn) {
          aBtn.innerHTML = '';
          window.google.accounts.id.renderButton(aBtn, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }
      } catch (err) {
        console.warn('Google Identity Services warning:', err);
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const existingScript = document.getElementById('google-gsi-client-script');
      if (existingScript) {
        existingScript.addEventListener('load', initGsi);
      } else {
        const newScript = document.createElement('script');
        newScript.id = 'google-gsi-client-script';
        newScript.src = 'https://accounts.google.com/gsi/client';
        newScript.async = true;
        newScript.defer = true;
        newScript.onload = initGsi;
        document.body.appendChild(newScript);
      }
    }

    return () => {
      unmounted = true;
    };
  }, [activeTab]);

  // If already authenticated and visiting login directly, route forward
  if (user) {
    if (user.role === 'PARTICIPANT' && activeTab === 'participant') {
      return <Navigate to="/my-vachanshivir" replace />;
    }
    if (user.role !== 'PARTICIPANT' && activeTab === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // 1. Participant Password Login Submit
  const handleParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified || !captchaToken) {
      setError('Please complete the Captcha security verification challenge.');
      return;
    }
    const trimmedEmail = participantEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!participantPassword) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    setError(null);
    setParticipantErrorCode(null);
    setParticipantNotRegistered(false);

    try {
      const res = await signInWithPassword({
        email: trimmedEmail,
        password: participantPassword,
        captchaToken,
      });
      setBusy(false);

      if (res.ok && res.user) {
        if (res.user.role === 'PARTICIPANT') {
          navigate('/my-vachanshivir', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        setParticipantErrorCode(res.code || null);
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setBusy(false);
      setError('Connection error. Please try again.');
    }
  };

  // 2. Admin Manual Email Login Submit
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified || !captchaToken) {
      setError('Please complete the security Captcha challenge.');
      return;
    }
    const trimmedEmail = adminEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your administrative email address.');
      return;
    }
    if (!isAuthorizedAdminEmail(trimmedEmail)) {
      setError(`Access Restricted: Account "${trimmedEmail}" is not authorized for administrative access.`);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await signInWithGoogle({
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0],
        captchaToken,
      });
      setBusy(false);

      if (res.ok && res.user) {
        if (res.user.role === 'PARTICIPANT') {
          signOut();
          setError(`Access Restricted: Account "${trimmedEmail}" does not have administrative privileges.`);
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        setError(res.message || 'Administrative authentication failed.');
      }
    } catch {
      setBusy(false);
      setError('Connection error during admin authentication.');
    }
  };

  // 3A. Request Password Reset Link
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaVerified || !captchaToken) {
      setError('Please complete the Captcha security verification.');
      return;
    }
    const trimmedEmail = forgotEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await requestPasswordReset(trimmedEmail, captchaToken);
      setBusy(false);
      if (res.ok) {
        setForgotLinkSent(true);
      } else {
        setError(res.message || 'Failed to submit password reset request.');
      }
    } catch {
      setBusy(false);
      setError('Connection error. Please try again.');
    }
  };

  // 3B. Set New Password with Token
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await resetPassword(resetToken, newPassword);
      setBusy(false);
      if (res.ok) {
        setPasswordResetSuccess(true);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch {
      setBusy(false);
      setError('Connection error. Please try again.');
    }
  };

  // 4. Enquiry Form Submit
  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enqName.trim() || !enqEmail.trim() || !enqMessage.trim()) {
      setError('Please fill in your Name, Email, and Message.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enqName.trim(),
          email: enqEmail.trim().toLowerCase(),
          phone: enqPhone.trim(),
          organisation: enqChurch.trim(),
          message: enqMessage.trim(),
          kind: 'general',
        }),
      });

      const data = await res.json().catch(() => ({}));
      setBusy(false);

      if (res.ok && data.success) {
        setEnqSubmitted(true);
        setEnqRef(data.reference || 'ENQ-2026');
      } else {
        setError(data.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch {
      setBusy(false);
      setError('Network error. Please try again later.');
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center text-white px-3 sm:px-6 py-8 sm:py-12 selection:bg-crossgold selection:text-navy-950 font-sans"
      style={{
        backgroundColor: '#0B1D33',
        backgroundImage: 'radial-gradient(ellipse at 50% 20%, #1B4980 0%, #0B1D33 70%, #071322 100%)',
      }}
    >
      <div className="w-full max-w-lg bg-[#0B1D33]/95 border-2 border-crossgold/40 rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_#1B4980] space-y-5 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle Ambient Decorative Accents */}
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
                Unified Portal &amp; Forms Gateway
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-black font-raleway text-white tracking-tight">
              {activeTab === 'admin'
                ? 'Master Admin Control Center'
                : activeTab === 'password'
                ? 'Account Password Recovery'
                : activeTab === 'enquiry'
                ? 'Helpdesk & Support Enquiry'
                : 'Participant Access Portal'}
            </h1>
            <p className="mt-0.5 text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
              {activeTab === 'admin'
                ? 'Google Workspace OAuth & authorized administrative access.'
                : activeTab === 'password'
                ? 'Create or reset your participant account password with security verification.'
                : activeTab === 'enquiry'
                ? 'Submit your questions regarding registration, accommodation, or travel.'
                : 'Access your delegate registration status, family members, and digital passes.'}
            </p>
          </div>
        </div>

        {/* Categorized Segmented Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#071322] border border-crossgold/30 rounded-2xl text-[11px] font-bold font-raleway">
          <button
            type="button"
            onClick={() => handleTabSwitch('participant')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'participant'
                ? 'bg-crossgold text-navy-950 shadow-sm border border-navy-950 font-black'
                : 'text-white/80 hover:text-crossgold hover:bg-navy-900'
            }`}
          >
            <User size={13} className="shrink-0" />
            <span className="truncate">Participant</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'admin'
                ? 'bg-crossgold text-navy-950 shadow-sm border border-navy-950 font-black'
                : 'text-white/80 hover:text-crossgold hover:bg-navy-900'
            }`}
          >
            <Shield size={13} className="shrink-0" />
            <span className="truncate">Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('password')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'password'
                ? 'bg-crossgold text-navy-950 shadow-sm border border-navy-950 font-black'
                : 'text-white/80 hover:text-crossgold hover:bg-navy-900'
            }`}
          >
            <KeyRound size={13} className="shrink-0" />
            <span className="truncate">Password</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('enquiry')}
            className={`py-2 px-1.5 rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center ${
              activeTab === 'enquiry'
                ? 'bg-crossgold text-navy-950 shadow-sm border border-navy-950 font-black'
                : 'text-white/80 hover:text-crossgold hover:bg-navy-900'
            }`}
          >
            <MessageSquare size={13} className="shrink-0" />
            <span className="truncate">Enquiry</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>

            {participantErrorCode === 'NO_PASSWORD_SET' && (
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(participantEmail);
                  handleTabSwitch('password');
                }}
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-crossgold hover:underline mt-1 bg-white/10 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Click here to set your password now</span>
              </button>
            )}

            {participantNotRegistered && (
              <Link
                to="/registration"
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-crossgold hover:underline mt-1 bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <Ticket size={12} />
                <span>Register for Vachan Shivir 2026 &rarr;</span>
              </Link>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: PARTICIPANT SIGN IN */}
        {/* ========================================================= */}
        {activeTab === 'participant' && (
          <div className="space-y-4 animate-fadeIn">
            <form onSubmit={handleParticipantSubmit} className="space-y-3.5">
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
                    value={participantEmail}
                    onChange={(e) => {
                      setParticipantEmail(e.target.value);
                      setError(null);
                      setParticipantErrorCode(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(participantEmail);
                      handleTabSwitch('password');
                    }}
                    className="text-[11px] text-crossgold hover:underline font-semibold font-raleway cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type={showParticipantPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={participantPassword}
                    onChange={(e) => {
                      setParticipantPassword(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowParticipantPassword(!showParticipantPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                    title={showParticipantPassword ? 'Hide password' : 'Show password'}
                  >
                    {showParticipantPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Anti-Bot Captcha Challenge */}
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
                disabled={!captchaVerified || busy || !participantEmail.trim() || !participantPassword}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
                  captchaVerified && !busy && participantEmail.trim() && participantPassword
                    ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                    : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                <Lock size={13} />
                <span>{busy ? 'Verifying Account…' : 'Sign In to Registration'}</span>
                <ArrowRight size={13} className="opacity-80" />
              </button>
            </form>

            <div className="relative flex items-center justify-center pt-1">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#0B1D33] px-3 text-[10px] uppercase tracking-wider font-mono text-white/50 absolute">
                Or Continue With Google
              </span>
            </div>

            <div className="pt-1 flex flex-col items-center justify-center space-y-1.5 text-center">
              <div id="unified-participant-gsi" className="flex justify-center min-h-[40px] max-w-full overflow-hidden" />
              <p className="text-[10px] text-white/50 font-sans">
                Registered with Gmail? Instant sign-in available.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MASTER ADMIN PORTAL */}
        {/* ========================================================= */}
        {activeTab === 'admin' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Google One-Click SSO */}
            <div className="p-3.5 bg-[#071322] border border-crossgold/30 rounded-2xl space-y-2 text-center">
              <div className="flex justify-center items-center">
                <div id="unified-admin-gsi" className="flex justify-center min-h-[40px] max-w-full overflow-hidden" />
              </div>
              <p className="text-[10px] text-white/60 font-mono">
                Google Workspace Authorized Admin Sign-In
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-white/10" />
              <span className="bg-[#0B1D33] px-3 text-[10px] uppercase tracking-wider font-mono text-white/50 absolute">
                Or Admin Email
              </span>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="email"
                    required
                    placeholder="admin@vachanshivir.in"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      setError(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                  />
                </div>
                <div className="px-1 text-[10px] text-white/50">
                  <span>Authorized administrators only</span>
                </div>
              </div>

              {/* Captcha */}
              <div className="p-2.5 bg-[#071322]/80 border border-crossgold/20 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-white">
                  <span className="flex items-center gap-1 font-raleway text-slate-300">
                    <Shield size={12} className="text-crossgold" /> Anti-Bot Security Verification
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
                disabled={!captchaVerified || busy || !adminEmail.trim()}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
                  captchaVerified && !busy && adminEmail.trim()
                    ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                    : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
                }`}
              >
                <Lock size={13} />
                <span>{busy ? 'Authenticating…' : 'Authenticate & Enter Dashboard'}</span>
                <ArrowRight size={13} className="opacity-80" />
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PASSWORD SETUP & RECOVERY */}
        {/* ========================================================= */}
        {activeTab === 'password' && (
          <div className="space-y-4 animate-fadeIn">
            {resetToken ? (
              // Reset Password Form (Token Provided)
              passwordResetSuccess ? (
                <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="text-base font-bold text-white font-raleway">
                    Password Reset Complete!
                  </h2>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordResetSuccess(false);
                      setResetToken('');
                      handleTabSwitch('participant');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
                  >
                    <span>Proceed to Participant Sign In</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3.5">
                  <div className="p-3 bg-navy-900/90 border border-crossgold/30 rounded-xl text-xs space-y-1">
                    <p className="text-crossgold font-bold font-raleway flex items-center gap-1">
                      <KeyRound size={13} /> Reset Token Verified
                    </p>
                    <p className="text-white/60 text-[11px]">
                      Enter your new account password below.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
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
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy || !newPassword || !confirmPassword}
                    className="w-full py-3 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
                  >
                    <span>{busy ? 'Saving Password…' : 'Set New Password'}</span>
                    <ArrowRight size={13} />
                  </button>
                </form>
              )
            ) : (
              // Forgot Password Request Form (No Token Yet)
              forgotLinkSent ? (
                <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="text-base font-bold text-white font-raleway">
                    Reset Instructions Dispatched
                  </h2>
                  <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                    If an account or registration exists for <strong className="font-mono text-white">{forgotEmail}</strong>, a secure password setup link has been sent to your inbox.
                  </p>
                  <p className="text-[11px] text-white/60">
                    The link remains active for 1 hour. Please check your inbox and spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotLinkSent(false);
                      handleTabSwitch('participant');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
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
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
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
                    disabled={!captchaVerified || busy || !forgotEmail.trim()}
                    className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
                      captchaVerified && !busy && forgotEmail.trim()
                        ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                        : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{busy ? 'Sending Link…' : 'Send Password Setup Link'}</span>
                    <ArrowRight size={13} className="opacity-80" />
                  </button>
                </form>
              )
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ENQUIRY & HELPDESK */}
        {/* ========================================================= */}
        {activeTab === 'enquiry' && (
          <div className="space-y-4 animate-fadeIn">
            {enqSubmitted ? (
              <div className="p-5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 size={24} />
                </div>
                <h2 className="text-base font-bold text-white font-raleway">
                  Enquiry Submitted Successfully!
                </h2>
                <p className="text-xs text-emerald-200/90 leading-relaxed font-sans">
                  Thank you for reaching out. Your enquiry ticket reference is{' '}
                  <strong className="font-mono text-crossgold font-bold">{enqRef}</strong>.
                </p>
                <p className="text-[11px] text-white/60">
                  Our organizing committee will review your message and reply via email or phone shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEnqSubmitted(false);
                    setEnqMessage('');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
                >
                  <span>Submit Another Enquiry</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Paul"
                      value={enqName}
                      onChange={(e) => setEnqName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. samuel@example.com"
                      value={enqEmail}
                      onChange={(e) => setEnqEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                      Mobile / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={enqPhone}
                      onChange={(e) => setEnqPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                      Church / Organisation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grace Fellowship"
                      value={enqChurch}
                      onChange={(e) => setEnqChurch(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                    Your Question or Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How can we assist you regarding Vachan Shivir 2026?"
                    value={enqMessage}
                    onChange={(e) => setEnqMessage(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy || !enqName.trim() || !enqEmail.trim() || !enqMessage.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] cursor-pointer"
                >
                  <Send size={13} />
                  <span>{busy ? 'Transmitting…' : 'Submit Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Global Footer Actions & Shivir Registration Banner */}
        <div className="space-y-3 pt-3 border-t border-white/10 text-center">
          <div className="p-3 bg-[#071322]/80 border border-crossgold/30 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-bold text-white font-raleway flex items-center gap-1.5">
                <Ticket size={14} className="text-crossgold" />
                <span>New Registration</span>
              </p>
              <p className="text-[10px] text-white/60">
                Join delegates from all across India.
              </p>
            </div>
            <Link
              to="/registration"
              className="py-1.5 px-3.5 rounded-xl bg-crossgold hover:bg-crossgold-dark text-navy-950 font-black text-[11px] uppercase tracking-wider border border-navy-950 shadow-xs transition-transform hover:scale-105 shrink-0"
            >
              Register &rarr;
            </Link>
          </div>

          <div>
            <Link
              to="/"
              className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 text-xs font-raleway transition-colors"
            >
              <ArrowLeft size={12} />
              <span>Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
