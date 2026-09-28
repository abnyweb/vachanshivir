import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('vachanshivir.db.v4');
      localStorage.removeItem('vachanshivir.db.v5');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1D33] px-6 text-white font-sans">
        <div className="max-w-md w-full text-center bg-[#122E52] border-2 border-[#FBB33B]/60 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FBB33B] text-[#0B1D33] flex items-center justify-center mx-auto text-2xl font-black font-raleway border-2 border-white/20">
            VS
          </div>
          <div>
            <h1 className="text-2xl font-black font-raleway text-white">त्रुटि निवारण (System Recovery)</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              पृष्ठ लोड करने में समस्या आई है। कृपया नीचे दिए गए बटन से रीसेट करके पुनः लोड करें।
            </p>
            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-[#0B1D33] rounded-xl border border-red-500/40 text-left text-xs font-mono text-red-300 break-words max-h-28 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleResetAndReload}
              className="bg-[#FBB33B] hover:bg-[#e5a02e] text-[#0B1D33] font-raleway font-black px-6 py-3 text-xs uppercase tracking-wider rounded-xl border-2 border-[#0B1D33] shadow-md transition-all cursor-pointer"
            >
              रीसेट एवं रीलोड करें (Reset &amp; Reload)
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1B4980] hover:bg-[#2563a6] text-white font-raleway font-bold px-5 py-3 text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              पुनः प्रयास करें (Retry)
            </button>
          </div>
        </div>
      </div>
    );
  }
}
