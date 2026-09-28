import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Shield, ShieldAlert, CheckCircle2, Lock, Mail, ArrowRight, Check } from 'lucide-react';
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
  email_verified?: boolean;
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

export default function Login() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentMeta('Sign In with Google — Vachan Shivir 2026');

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [oneClickReady, setOneClickReady] = useState(false);

  // If already logged in, redirect appropriately
  if (user) {
    if (user.role === 'PARTICIPANT') {
      return <Navigate to="/my-vachanshivir" replace />;
    }
    const fromPath = (location.state as { from?: string } | null)?.from;
    return <Navigate to={fromPath && !fromPath.startsWith('/admin/dashboard') ? fromPath : '/admin/dashboard'} replace />;
  }

  // Handle Google One-Click / One-Tap credential response
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      setError('No credential token received from Google.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        setError('Unable to decode verified Google profile information.');
        setBusy(false);
        return;
      }

      if (!isAuthorizedAdminEmail(payload.email)) {
        signOut();
        setBusy(false);
        setError(`Access Restricted: Account "${payload.email}" is not authorized for administrative access.`);
        return;
      }

      const res = await signInWithGoogle({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        credential: response.credential,
        captchaToken: 'google-oauth-one-click-verified',
      });

      setBusy(false);

      if (res.ok && res.user) {
        if (res.user.role === 'PARTICIPANT') {
          signOut();
          setError(`Access Restricted: Account "${payload.email}" does not have administrative privileges.`);
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        setError(res.message || 'Google One-Click login failed.');
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

        const btnElement = document.getElementById('gsi-button-container');
        if (btnElement) {
          btnElement.innerHTML = '';
          window.google.accounts.id.renderButton(btnElement, {
            type: 'standard',
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 320,
          });
        }

        setOneClickReady(true);

        // Prompt Google One Tap
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('Google Identity Services init warning:', err);
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
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, []);

  async function handleManualGoogleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!captchaVerified || !captchaToken) {
      setError('Please complete the Captcha security verification challenge first.');
      return;
    }

    const trimmedEmail = googleEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your Google account email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const res = await signInWithGoogle({
        email: trimmedEmail,
        name: trimmedEmail.split('@')[0],
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
        setError(res.message || 'Authentication failed. Please try again.');
      }
    } catch {
      setBusy(false);
      setError('Failed to authenticate with Google. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-100 selection:text-[#153A66] font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50 space-y-6 relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
            <div className="w-11 h-11 rounded-xl bg-[#153A66] text-white font-sans font-bold text-lg flex items-center justify-center shadow-xs border border-slate-700/30">
              VS
            </div>
            <div className="text-left">
              <span className="block text-xl font-bold font-sans text-slate-900 tracking-tight leading-none">
                VACHAN SHIVIR
              </span>
              <span className="text-[11px] font-medium tracking-wider text-slate-500 uppercase font-sans">
                Master Admin Portal
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-bold font-sans text-slate-900 tracking-tight">
              Sign In to Control Center
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Google Workspace OAuth &amp; Authorized Admin Access
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <ShieldAlert size={16} className="shrink-0 text-rose-500" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* 1. GOOGLE ONE-CLICK SSO CONTAINER */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-center">
          <div className="flex justify-center items-center">
            <div id="gsi-button-container" className="flex justify-center min-h-[40px] max-w-full overflow-hidden" />
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-sans">
            {oneClickReady ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check size={12} /> Google One-Tap Ready
              </span>
            ) : (
              <span>Connecting Google SSO…</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400 absolute font-sans">
            Or Authorized Email
          </span>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleManualGoogleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@abny.in or admin email"
                value={googleEmail}
                onChange={(e) => {
                  setGoogleEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#153A66]/20 focus:border-[#153A66] transition-all font-mono shadow-xs"
              />
            </div>
            <div className="px-1 text-[11px] text-slate-500">
              <span>Authorized administrators only</span>
            </div>
          </div>

          {/* Inline Captcha Challenge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 font-sans text-slate-700">
                <Shield size={13} className="text-[#153A66]" /> Anti-Bot Verification
              </span>
              {captchaVerified && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Verified
                </span>
              )}
            </div>
            <CaptchaWidget
              verified={captchaVerified}
              onVerify={(token) => {
                setCaptchaVerified(true);
                setCaptchaToken(token);
                setError('');
              }}
              onReset={() => {
                setCaptchaVerified(false);
                setCaptchaToken('');
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!captchaVerified || busy || !googleEmail.trim()}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center space-x-2 transition-all font-sans shadow-xs ${
              captchaVerified && !busy && googleEmail.trim()
                ? 'bg-[#153A66] hover:bg-[#1B4980] text-white cursor-pointer'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Lock size={13} />
            <span>{busy ? 'Authenticating…' : 'Authenticate & Enter'}</span>
            <ArrowRight size={13} className="opacity-80" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-xs text-slate-500 text-center space-y-1.5 pt-3 border-t border-slate-100 font-sans">
          <p>
            Role and permissions are determined automatically by the server.
          </p>
          <Link to="/" className="text-[#153A66] hover:underline inline-block font-semibold">
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
