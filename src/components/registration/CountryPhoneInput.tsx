import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: CountryCode[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Malaysia', code: 'MY', dialCode: '+60', flag: '🇲🇾' },
  { name: 'Nepal', code: 'NP', dialCode: '+977', flag: '🇳🇵' },
  { name: 'Sri Lanka', code: 'LK', dialCode: '+94', flag: '🇱🇰' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'New Zealand', code: 'NZ', dialCode: '+64', flag: '🇳🇿' },
];

interface CountryPhoneInputProps {
  value: string; // e.g. "+91 9876543210" or "9876543210"
  onChange: (fullNumber: string, countryCode: string, nationalNumber: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  label = 'Mobile / WhatsApp Number',
  error,
  required = true,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRIES[0]); // Default India
  const [nationalNumber, setNationalNumber] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync initial value if passed
  useEffect(() => {
    if (value) {
      const matchedCountry = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        setNationalNumber(value.replace(matchedCountry.dialCode, '').trim());
      } else {
        setNationalNumber(value.replace(/^\+\d+\s*/, '').trim());
      }
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    const full = `${country.dialCode} ${nationalNumber}`.trim();
    onChange(full, country.dialCode, nationalNumber);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s-]/g, '');
    setNationalNumber(raw);
    const full = `${selectedCountry.dialCode} ${raw}`.trim();
    onChange(full, selectedCountry.dialCode, raw);
  };

  const filteredCountries = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dialCode.includes(search)
  );

  return (
    <div className="space-y-1.5 w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
      )}

      <div className="relative flex rounded-xl border border-slate-700 bg-slate-900 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
        {/* Country Code Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-3 bg-slate-950/80 border-r border-slate-800 rounded-l-xl text-slate-200 hover:bg-slate-800 transition min-h-[48px] text-sm font-semibold flex-shrink-0"
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="font-mono text-xs text-indigo-400">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* National Number Input */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 98765 43210"
          value={nationalNumber}
          onChange={handleNumberChange}
          className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none min-h-[48px]"
        />

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-64 flex flex-col">
            <div className="p-2 border-b border-slate-800 bg-slate-950">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search country or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-800/40">
              {filteredCountries.map((c) => (
                <button
                  type="button"
                  key={c.code}
                  onClick={() => handleCountrySelect(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-800/80 flex items-center justify-between transition text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-slate-200 font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-indigo-400">{c.dialCode}</span>
                    {selectedCountry.code === c.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
};

export default CountryPhoneInput;
