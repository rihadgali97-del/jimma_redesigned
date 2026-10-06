import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language } from '../../types';

export const LanguageSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; native: string; flag: string }[] = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'om', label: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹' },
    { code: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
    { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all duration-150 border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'
        }`}
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        <span className="font-medium">{currentLang.native}</span>
        <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-stone-400 border-b border-stone-100 dark:border-stone-800 mb-1">
            Language / Afaan / اللغة
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-sm text-left transition-colors ${
                language === lang.code
                  ? 'bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.native}</span>
                {lang.code !== 'en' && (
                  <span className="text-[11px] text-stone-400 font-normal">({lang.label})</span>
                )}
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
