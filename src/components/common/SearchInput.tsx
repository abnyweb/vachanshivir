import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  tone?: 'dark' | 'light';
}

export function SearchInput({ value, onChange, placeholder, label, tone = 'light' }: Props) {
  const isWhite = tone === 'dark';
  return (
    <label className="relative block w-full">
      <span className="sr-only">{label}</span>
      <Search
        size={16}
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isWhite ? 'text-white/40' : 'text-slate-400'}`}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${isWhite ? 'bg-white/10 text-white border-white/20' : 'field'} pl-9`}
      />
    </label>
  );
}
