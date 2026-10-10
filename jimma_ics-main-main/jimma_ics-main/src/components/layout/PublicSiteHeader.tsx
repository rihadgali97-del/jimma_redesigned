import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  ArrowUpRight,
  BookOpen,
  Building,
  Calculator,
  CalendarDays,
  ChevronDown,
  Compass,
  HeartHandshake,
  Landmark,
  LogIn,
  Menu,
  Moon,
  Search,
  Shield,
  Sun,
  Users,
  X,
} from 'lucide-react';

const institutionLinks = [
  { label: 'Mosques', path: '/mosques', icon: Building },
  { label: 'Madrasas & Hifz', path: '/madrasas', icon: BookOpen },
  { label: 'Teachers & Mu’allims', path: '/teachers', icon: Users },
  { label: 'Ulema scholars', path: '/ulema', icon: Users },
  { label: 'Explore the kebele map', path: '/map', icon: Compass },
];

const serviceLinks = [
  { label: 'All public services', path: '/services' },
  { label: 'Zakat & welfare assistance', path: '/services?apply=srv-2' },
  { label: 'Janazah support', path: '/services?apply=srv-3' },
  { label: 'Zakat calculator', path: '/donate?tab=zakat-calculator', icon: Calculator },
  { label: 'Waqf transparency', path: '/services?tab=waqf' },
  { label: 'Track an application', path: '/services?tab=track' },
];

export const PublicSiteHeader: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { setIsSearchOpen, currentUser, isLoggedIn } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'institutions' | 'services' | null>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const active = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navClass = (path: string) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
      active(path)
        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
    }`;

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const dropdown = (
    id: 'institutions' | 'services',
    label: string,
    links: typeof serviceLinks | typeof institutionLinks
  ) => {
    const isOpen = openMenu === id;
    const isCurrent = links.some((link) => active(link.path.split('?')[0]));
    return (
      <div className="relative">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          onClick={() => setOpenMenu(isOpen ? null : id)}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            isCurrent || isOpen
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'
          }`}
        >
          {label}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-900"
          >
            {links.map((link) => {
              const Icon = 'icon' in link ? link.icon : undefined;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  role="menuitem"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-emerald-900 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-emerald-200"
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="public-header sticky top-0 z-40 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/95">
      <div className="border-b border-emerald-950/10 bg-emerald-950 text-emerald-50 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <p className="min-w-0 truncate text-[11px] font-medium tracking-wide text-emerald-100/90 sm:text-xs">
            Jimma City Islamic Affairs Council <span className="hidden sm:inline">· Oromia, Ethiopia</span>
          </p>
          <div className="flex shrink-0 items-center gap-3 text-[11px] font-semibold sm:text-xs">
            <Link
              to="/donate?tab=zakat-calculator"
              className="hidden items-center gap-1.5 text-emerald-100 transition-colors hover:text-amber-300 sm:inline-flex"
            >
              <Calculator className="h-3.5 w-3.5" />
              Zakat calculator
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 text-emerald-100 transition-colors hover:text-amber-300"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Public user guide</span>
              <span className="sm:hidden">Guide</span>
            </Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-emerald-100 transition-colors hover:text-amber-300">
              <LogIn className="h-3.5 w-3.5 text-amber-300" />
              <span className="hidden sm:inline">{isLoggedIn ? currentUser.role : 'Staff sign in'}</span>
              <span className="sm:hidden">Staff</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[5rem] sm:px-6">
        <Link to="/" onClick={closeMenus} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-900 text-amber-300 shadow-sm sm:h-11 sm:w-11">
            <Landmark className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-serif text-sm font-extrabold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-800 dark:text-stone-100 dark:group-hover:text-emerald-300 sm:text-base">
              {language === 'ar' ? 'مجلس الشؤون الإسلامية' : language === 'om' ? 'Majiilisa Jimmaa' : 'Jimma Islamic Council'}
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[.14em] text-stone-500 dark:text-stone-400 sm:block">
              Community services
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <Link to="/" className={navClass('/')}>{t('home')}</Link>
          {dropdown('institutions', 'Institutions', institutionLinks)}
          {dropdown('services', t('services'), serviceLinks)}
          <Link to="/events" className={navClass('/events')}>{t('events')}</Link>
          <Link to="/announcements" className={navClass('/announcements')}>{t('announcements')}</Link>
          <Link to="/about" className={navClass('/about')}>{t('about')}</Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search council records"
            title="Search council records"
            className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-emerald-300"
          >
            <Search className="h-4 w-4" />
          </button>
          <span className="hidden sm:inline-flex"><LanguageSelector compact /></span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-600 transition-colors hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-amber-300"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/donate"
            className="hidden items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-emerald-950 shadow-sm transition-colors hover:bg-amber-400 sm:inline-flex"
          >
            <HeartHandshake className="h-4 w-4" />
            {t('donate')}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-navigation"
            className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="public-mobile-navigation"
          className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-stone-200 bg-stone-50 px-4 pb-6 pt-4 shadow-xl dark:border-stone-800 dark:bg-stone-950 lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="mx-auto max-w-2xl space-y-5">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: t('home'), path: '/' },
                { label: t('about'), path: '/about' },
                { label: t('events'), path: '/events', icon: CalendarDays },
                { label: t('announcements'), path: '/announcements' },
                { label: 'Contact', path: '/contact' },
              ].map(({ label, path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMenus}
                  className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    active(path)
                      ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100'
                      : 'bg-white text-stone-700 dark:bg-stone-900 dark:text-stone-200'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {label}
                </Link>
              ))}
            </div>

            <section aria-labelledby="mobile-institutions">
              <h2 id="mobile-institutions" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[.16em] text-stone-500 dark:text-stone-400">
                Institutions & directories
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {institutionLinks.map(({ label, path, icon: Icon }) => (
                  <Link key={path} to={path} onClick={closeMenus} className="flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-900 dark:text-stone-200">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            <section aria-labelledby="mobile-services">
              <h2 id="mobile-services" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[.16em] text-stone-500 dark:text-stone-400">
                Public services
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {serviceLinks.map(({ label, path }) => (
                  <Link key={path} to={path} onClick={closeMenus} className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-stone-700 dark:bg-stone-900 dark:text-stone-200">
                    {label}
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-400" />
                  </Link>
                ))}
              </div>
            </section>

            <div className="flex items-center gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
              <span className="sm:hidden"><LanguageSelector compact /></span>
              <Link to="/donate" onClick={closeMenus} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-emerald-950">
                <HeartHandshake className="h-4 w-4" />
                {t('donate')}
              </Link>
              <Link to="/login" onClick={closeMenus} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                <LogIn className="h-4 w-4" />
                Staff
              </Link>
              <Link to="/admin" onClick={closeMenus} aria-label="Council admin portal" className="grid h-11 w-11 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                <Shield className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
