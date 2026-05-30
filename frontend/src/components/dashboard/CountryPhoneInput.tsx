'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { COUNTRY_PHONE_CONFIGS, CountryPhoneConfig } from '@/lib/indianData';

interface CountryPhoneInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export default function CountryPhoneInput({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
}: CountryPhoneInputProps) {
  const [selectedConfig, setSelectedConfig] = useState<CountryPhoneConfig>(
    COUNTRY_PHONE_CONFIGS[0] // Default to India (+91)
  );
  const [phoneVal, setPhoneVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync incoming value (e.g. "+91 9988776655" or just "9988776655")
  useEffect(() => {
    if (!value) {
      setPhoneVal('');
      setErrorMsg('');
      return;
    }

    // Try to parse the dial code
    const matchedConfig = COUNTRY_PHONE_CONFIGS.find((c) =>
      value.startsWith(c.dialCode + ' ') || value.startsWith(c.dialCode)
    );

    if (matchedConfig) {
      setSelectedConfig(matchedConfig);
      const remaining = value.replace(matchedConfig.dialCode, '').trim();
      setPhoneVal(remaining);
      validate(remaining, matchedConfig);
    } else {
      // Fallback
      setPhoneVal(value);
      validate(value, selectedConfig);
    }
  }, [value]);

  // Click outside listener for the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = (val: string, config: CountryPhoneConfig) => {
    if (!val) {
      setErrorMsg(required ? 'This field is required.' : '');
      return;
    }
    const cleanDigits = val.replace(/\D/g, '');
    if (!config.regex.test(cleanDigits)) {
      setErrorMsg(config.errorMsg);
    } else {
      setErrorMsg('');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow only digits and spaces/dashes
    const cleanDigits = rawVal.replace(/[^\d\s-]/g, '');
    setPhoneVal(cleanDigits);
    validate(cleanDigits, selectedConfig);

    const fullNumber = `${selectedConfig.dialCode} ${cleanDigits.replace(/[\s-]/g, '')}`;
    onChange(fullNumber);
  };

  const handleSelectCountry = (config: CountryPhoneConfig) => {
    setSelectedConfig(config);
    setShowDropdown(false);
    setSearchQuery('');
    validate(phoneVal, config);

    const fullNumber = `${config.dialCode} ${phoneVal.replace(/[\s-]/g, '')}`;
    onChange(fullNumber);
  };

  const filteredConfigs = COUNTRY_PHONE_CONFIGS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-1.5 flex-1 w-full" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative flex rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 focus-within:border-sky-500 dark:focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all duration-200">
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 px-3 border-r border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80 rounded-l-xl transition shrink-0 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
        >
          <span className="text-base leading-none select-none">{selectedConfig.flag}</span>
          <span className="font-mono text-zinc-650 dark:text-zinc-400">{selectedConfig.dialCode}</span>
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        </button>

        {/* Phone Input Box */}
        <input
          type="tel"
          disabled={disabled}
          required={required}
          value={phoneVal}
          onChange={handlePhoneChange}
          placeholder={placeholder || selectedConfig.placeholder}
          className="w-full bg-transparent px-4 py-2.5 text-xs text-zinc-850 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none font-mono"
        />

        {/* Dropdown Box */}
        {showDropdown && (
          <div className="absolute left-0 top-full mt-1.5 z-[100] w-64 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in">
            <input
              type="text"
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2 w-full rounded-lg border border-zinc-150 bg-zinc-50/50 px-2.5 py-1.5 text-xs text-zinc-800 outline-none placeholder-zinc-400 focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            />
            
            <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredConfigs.length > 0 ? (
                filteredConfigs.map((config) => (
                  <button
                    key={config.code}
                    type="button"
                    onClick={() => handleSelectCountry(config)}
                    className={`flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition ${
                      selectedConfig.code === config.code
                        ? 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/5 dark:text-sky-400'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base select-none leading-none">{config.flag}</span>
                      <span>{config.name}</span>
                    </div>
                    <span className="font-mono text-zinc-400 dark:text-zinc-500">{config.dialCode}</span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-zinc-400 italic text-[11px]">No countries match query.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Inline Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-650 dark:text-red-400 animate-slide-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
