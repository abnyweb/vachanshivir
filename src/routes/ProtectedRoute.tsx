import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, LogOut, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function ProtectedRoute() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  // Participants cannot access administrative backoffice routes
  if (user.role === 'PARTICIPANT') {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-white p-6 font-sans"
        style={{ backgroundColor: '#0B1D33', backgroundImage: 'radial-gradient(ellipse at 50% 20%, #1B4980 0%, #0B1D33 70%, #071322 100%)' }}
      >
        <div className="w-full max-w-md bg-[#0B1D33]/95 border-2 border-crossgold/40 rounded-3xl p-8 shadow-[6px_6px_0px_#1B4980] text-center space-y-6 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-crossgold/15 border-2 border-crossgold text-crossgold mx-auto flex items-center justify-center shadow-[2px_2px_0px_#1B4980]">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black font-raleway text-white tracking-tight">Administrator Access Restricted</h1>
            <p className="text-xs text-white/70 leading-relaxed">
              You are signed in with Google as <strong className="text-crossgold font-bold">{user.email}</strong>.
              This account has <span className="font-bold text-emerald-400">Participant / Delegate</span> privileges and does not have administrative access to the backoffice management portal.
            </p>
          </div>

          <div className="p-3.5 bg-[#071322] border-2 border-crossgold/20 rounded-2xl text-left space-y-1">
            <div className="text-[10px] font-mono uppercase font-bold text-crossgold tracking-wider">
              Assigned Access Level
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-bold font-raleway">Participant Portal &amp; Delegate Pass</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              to="/my-vachanshivir"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-crossgold text-navy-950 font-black text-xs uppercase tracking-wider font-raleway border-2 border-navy-950 shadow-[3px_3px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <UserCheck size={16} />
              <span>Go to My Vachan Shivir Portal</span>
              <ArrowRight size={14} />
            </Link>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={signOut}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold font-raleway text-white border-2 border-white/20 transition-colors"
              >
                <LogOut size={14} />
                <span>Switch Account</span>
              </button>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold font-raleway text-white border-2 border-white/20 transition-colors"
              >
                <Home size={14} />
                <span>Public Site</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
