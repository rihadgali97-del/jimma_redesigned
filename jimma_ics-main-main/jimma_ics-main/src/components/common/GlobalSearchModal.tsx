import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Building, BookOpen, Users, HandHeart, Calendar, ArrowRight, X } from 'lucide-react';
import { searchDirectoryMadrasas, searchDirectoryMosques } from '../../services/directoryApi';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    mosques,
    madrasas,
    ulema,
    publicServices,
    events,
  } = useApp();

  const [query, setQuery] = useState('');
  const [databaseMosques, setDatabaseMosques] = useState<typeof mosques>([]);
  const [databaseMadrasas, setDatabaseMadrasas] = useState<typeof madrasas>([]);
  const [directorySearchError, setDirectorySearchError] = useState('');
  const [isSearchingDirectories, setIsSearchingDirectories] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const q = query.toLowerCase().trim();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    let active = true;
    const term = query.trim();
    setDirectorySearchError('');

    if (!isSearchOpen || term.length < 2) {
      setDatabaseMosques([]);
      setDatabaseMadrasas([]);
      setIsSearchingDirectories(false);
      return () => { active = false; };
    }

    setIsSearchingDirectories(true);
    const timer = window.setTimeout(() => {
      void Promise.allSettled([searchDirectoryMosques(term), searchDirectoryMadrasas(term)])
        .then(([mosqueResult, madrasaResult]) => {
          if (!active) return;
          if (mosqueResult.status === 'fulfilled') setDatabaseMosques(mosqueResult.value);
          else setDatabaseMosques([]);
          if (madrasaResult.status === 'fulfilled') setDatabaseMadrasas(madrasaResult.value);
          else setDatabaseMadrasas([]);
          const failure = mosqueResult.status === 'rejected' ? mosqueResult.reason
            : madrasaResult.status === 'rejected' ? madrasaResult.reason : null;
          if (failure) setDirectorySearchError(failure instanceof Error ? failure.message : 'Could not search the directory database.');
          setIsSearchingDirectories(false);
        });
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  const localMosques = mosques.filter(
    (m) => (m.name || '').toLowerCase().includes(q) || (m.district || '').toLowerCase().includes(q) || (m.imam || '').toLowerCase().includes(q)
  );
  const matchedMosques = [...databaseMosques, ...localMosques]
    .filter((mosque, index, all) => all.findIndex((candidate) => candidate.id === mosque.id) === index)
    .slice(0, 3);

  const localMadrasas = madrasas.filter(
    (m) => (m.name || '').toLowerCase().includes(q) || (m.district || '').toLowerCase().includes(q) || (m.headTeacher || '').toLowerCase().includes(q)
  );
  const matchedMadrasas = [...databaseMadrasas, ...localMadrasas]
    .filter((madrasa, index, all) => all.findIndex((candidate) => candidate.id === madrasa.id) === index)
    .slice(0, 3);

  const matchedUlema = ulema.filter(
    (u) => (u.name || '').toLowerCase().includes(q) || (u.specializations || []).some((s) => (s || '').toLowerCase().includes(q)) || (u.district || '').toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedServices = publicServices.filter(
    (s) => (s.title || '').toLowerCase().includes(q) || (s.shortDesc || '').toLowerCase().includes(q)
  ).slice(0, 3);

  const matchedEvents = events.filter(
    (e) => (e.title || '').toLowerCase().includes(q) || (e.speaker || '').toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q)
  ).slice(0, 2);

  const hasResults =
    matchedMosques.length > 0 ||
    matchedMadrasas.length > 0 ||
    matchedUlema.length > 0 ||
    matchedServices.length > 0 ||
    matchedEvents.length > 0;

  const handleSelect = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-stone-100 dark:border-stone-800">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mosques, madrasas, ulema, services, events..."
            className="w-full px-3 py-4 text-sm md:text-base bg-transparent border-none outline-hidden text-stone-900 dark:text-stone-100 placeholder-stone-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 divide-y divide-stone-100 dark:divide-stone-800">
          {!q ? (
            <div className="p-6 text-center text-stone-400 text-sm">
              <p className="font-medium text-stone-600 dark:text-stone-300 mb-1">
                Jimma Islamic Council Knowledge Base
              </p>
              <p className="text-xs">
                Type keywords like "Grand Anwar", "Zakat", "Hifz", "Nikah", or "Sheikh Abdullah"
              </p>
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-stone-400">
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                No matching records found for "{query}"
              </p>
              <p className="text-xs mt-1">
                {isSearchingDirectories ? 'Searching the live mosque and madrasa registry…' : directorySearchError || 'Try searching by kebele name, scholar title, or service category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {/* Mosques */}
              {matchedMosques.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mosques</span>
                  </div>
                  {matchedMosques.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(`/mosques/${m.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {m.district} • Imam: {m.imam}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Madrasas */}
              {matchedMadrasas.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Madrasas</span>
                  </div>
                  {matchedMadrasas.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelect(`/madrasas/${m.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm">{m.name}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {m.district} • {m.totalStudents} Students
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Ulema */}
              {matchedUlema.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ulema Scholars</span>
                  </div>
                  {matchedUlema.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleSelect(`/ulema/${u.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm">{u.name}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {u.title} • {u.specializations.slice(0, 2).join(', ')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Services */}
              {matchedServices.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                    <HandHeart className="w-3.5 h-3.5 text-rose-600" />
                    <span>Community Services</span>
                  </div>
                  {matchedServices.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelect('/services')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-sm">{s.title}</div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {s.category} • {s.shortDesc.slice(0, 60)}...
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}


            </div>
          )}
        </div>
      </div>
    </div>
  );
};
