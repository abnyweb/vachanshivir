import { useState } from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onReset?: () => void;
  verified: boolean;
  className?: string;
}

export function CaptchaWidget({ onVerify, onReset, verified, className }: CaptchaWidgetProps) {
  const [checking, setChecking] = useState(false);
  const [challengeActive, setChallengeActive] = useState(false);
  const [mathProblem, setMathProblem] = useState<{ q: string; a: number }>({ q: '4 + 3', a: 7 });
  const [userAnswer, setUserAnswer] = useState('');
  const [challengeError, setChallengeError] = useState(false);

  const generateProblem = () => {
    const num1 = Math.floor(Math.random() * 8) + 2;
    const num2 = Math.floor(Math.random() * 8) + 1;
    setMathProblem({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setUserAnswer('');
    setChallengeError(false);
  };

  const handleCheckboxClick = () => {
    if (verified || checking) return;

    setChecking(true);
    // Simulate brief bot-behavior and browser telemetry check
    setTimeout(() => {
      setChecking(false);
      generateProblem();
      setChallengeActive(true);
    }, 600);
  };

  const handleVerifyChallenge = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (parseInt(userAnswer.trim(), 10) === mathProblem.a) {
      setChallengeActive(false);
      const token = `cap_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      onVerify(token);
    } else {
      setChallengeError(true);
      setTimeout(() => generateProblem(), 800);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setChallengeActive(false);
    setChecking(false);
    setUserAnswer('');
    setChallengeError(false);
    if (onReset) onReset();
  };

  return (
    <div
      className={cn(
        'w-full rounded-2xl border transition-all select-none p-3.5',
        verified
          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
          : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-300',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox & Status */}
        <div
          onClick={handleCheckboxClick}
          className={cn(
            'flex items-center gap-3.5 cursor-pointer py-0.5 flex-1',
            verified && 'cursor-default',
          )}
        >
          <div
            className={cn(
              'w-7 h-7 rounded-lg border flex items-center justify-center transition-all',
              verified
                ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                : checking
                ? 'border-amber-400 bg-amber-400/10'
                : 'border-slate-500 bg-slate-800/80 hover:border-amber-400',
            )}
          >
            {verified ? (
              <CheckCircle2 size={18} className="stroke-[3]" />
            ) : checking ? (
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            ) : null}
          </div>

          <div className="text-left">
            <p className={cn('text-xs font-semibold tracking-wide', verified ? 'text-emerald-400' : 'text-slate-200')}>
              {verified ? 'Human Verification Passed' : checking ? 'Verifying browser environment…' : "I'm not a robot / मानव सत्यापन"}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {verified ? 'Cloud anti-abuse & bot protection active' : 'Click checkbox to complete security challenge'}
            </p>
          </div>
        </div>

        {/* Protection Badge */}
        <div className="flex flex-col items-end shrink-0 pl-2 border-l border-slate-700/60">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <ShieldCheck size={14} />
            <span>ShieldSec</span>
          </div>
          <span className="text-[8px] text-slate-400 font-mono tracking-tighter">Turnstile 2.4</span>
        </div>
      </div>

      {/* Interactive Micro Challenge Modal if triggered */}
      {challengeActive && !verified && (
        <form
          onSubmit={handleVerifyChallenge}
          className="mt-3 pt-3 border-t border-slate-700/80 flex items-center gap-2 animate-fadeIn"
        >
          <div className="text-xs font-mono font-medium text-amber-300">
            Solve: <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-bold text-white">{mathProblem.q}</span> =
          </div>
          <input
            type="number"
            autoFocus
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="?"
            className={cn(
              'w-16 px-2 py-1 text-xs text-center rounded-lg bg-slate-800 border text-white font-mono focus:outline-none',
              challengeError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-600 focus:border-amber-400',
            )}
          />
          <button
            type="submit"
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Refresh challenge"
            className="p-1 text-slate-400 hover:text-white"
          >
            <RotateCcw size={13} />
          </button>
        </form>
      )}
    </div>
  );
}
