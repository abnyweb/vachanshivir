import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
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

export default function Login() {
  const { user, signInWithPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  useDocumentMeta('Participant Sign In — Vachan Shivir 2026');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  // If already logged in, redirect
  if (user) {
    if (user.role === 'PARTICIPANT') {
      return <Navigate to="/my-vachanshivir" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Handle Google One-Tap / credential response
  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    if (!response?.credential) {
      setError('No credential token received from Google.');
      return;
    }

    setBusy(true);
    setError(null);
    setNotRegistered(false);

    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        setError('Unable to decode Google profile information.');
        setBusy(false);
        return;
      }

      const res = await signInWithGoogle({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        credential: response.credential,
        captchaToken: 'google-oauth-participant-verified',
      });

      setBusy(false);

      if (res.ok && res.user) {
        if (res.user.role === 'PARTICIPANT') {
          navigate('/my-vachanshivir', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        if (res.notRegistered) {
          setNotRegistered(true);
          setError(`No Vachan Shivir registration was found for ${payload.email}. Please register first to activate your account.`);
        } else {
          setError(res.message || 'Google sign-in was unsuccessful.');
        }
      }
    } catch {
      setBusy(false);
      setError('An error occurred during Google authentication. Please try again.');
    }
  };

  // Initialize Google Identity Services
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

        const btnElement = document.getElementById('participant-gsi-button');
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
  }, []);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaVerified || !captchaToken) {
      setError('Please complete the Captcha security verification challenge.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setBusy(true);
    setError(null);
    setErrorCode(null);
    setNotRegistered(false);

    try {
      const res = await signInWithPassword({
        email: trimmedEmail,
        password,
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
        setErrorCode(res.code || null);
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setBusy(false);
      setError('Connection error. Please try again.');
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
                Participant Portal
              </span>
            </div>
          </Link>

          <div>
            <h1 className="text-lg sm:text-xl font-black font-raleway text-white tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="mt-0.5 text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              View your registration status, family members, payment receipt, and download your delegate pass.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>

            {errorCode === 'NO_PASSWORD_SET' && (
              <Link
                to={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-crossgold hover:underline mt-1 bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <Sparkles size={12} />
                <span>Click here to set your password</span>
              </Link>
            )}

            {notRegistered && (
              <Link
                to="/registration"
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-crossgold hover:underline mt-1 bg-white/10 px-2.5 py-1 rounded-lg"
              >
                <span>Register for Vachan Shivir 2026 &rarr;</span>
              </Link>
            )}
          </div>
        )}

        {/* Participant Email + Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-3.5">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
              Registered Email
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
                  setErrorCode(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#071322] border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-crossgold transition-all font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider font-raleway">
                Password
              </label>
              <Link
                to={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="text-[11px] text-crossgold hover:underline font-semibold font-raleway"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
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

          {/* Sign In Submit Button */}
          <button
            type="submit"
            disabled={!captchaVerified || busy || !email.trim() || !password}
            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all font-raleway ${
              captchaVerified && !busy && email.trim() && password
                ? 'bg-crossgold text-navy-950 border-2 border-navy-950 shadow-[2px_2px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed opacity-60'
            }`}
          >
            <Lock size={13} />
            <span>{busy ? 'Verifying Account…' : 'Sign In to Registration'}</span>
            <ArrowRight size={13} className="opacity-80" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center pt-1">
          <div className="w-full border-t border-white/10" />
          <span className="bg-[#0B1D33] px-3 text-[10px] uppercase tracking-wider font-mono text-white/50 absolute">
            Or Continue With Google
          </span>
        </div>

        {/* Google SSO Container */}
        <div className="pt-1 flex flex-col items-center justify-center space-y-2 text-center">
          <div id="participant-gsi-button" className="flex justify-center min-h-[40px] max-w-full overflow-hidden" />
          <p className="text-[10px] text-white/50 font-sans">
            Registered with a Gmail address? You can sign in instantly.
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-[11px] text-white/60 text-center space-y-2 pt-3 border-t border-white/10">
          <p>
            Don't have a registration yet?{' '}
            <Link to="/registration" className="text-crossgold font-bold hover:underline">
              Register Now
            </Link>
          </p>
          <div>
            <Link to="/" className="text-slate-400 hover:text-white inline-block text-[10px] font-raleway">
              &larr; Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
