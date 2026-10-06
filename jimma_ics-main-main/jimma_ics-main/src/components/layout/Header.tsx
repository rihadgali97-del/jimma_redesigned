import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Menu,
  X,
  Search,
  Moon,
  Sun,
  Shield,
  HeartHandshake,
  LogIn,
  ChevronDown,
  Building,
  BookOpen,
  Users,
  Calendar,
  HandHeart,
  Landmark,
  Compass,
  Scale,
  Calculator,
  CalendarCheck2,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { setIsSearchOpen, currentUser, isLoggedIn } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileInstitutionsOpen, setMobileInstitutionsOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: t('home'), path: '/' },
    { label: t('about'), path: '/about' },
    {
      label: t('institutions'),
      id: 'institutions',
      path: '/mosques',
      isDropdown: true,
      children: [
        { label: t('mosques'), path: '/mosques', icon: <Building className="w-4 h-4 text-emerald-600" /> },
        { label: t('madrasas'), path: '/madrasas', icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
        { label: t('quranTeachers'), path: '/teachers', icon: <Users className="w-4 h-4 text-emerald-600" /> },
        { label: t('ulema'), path: '/ulema', icon: <Users className="w-4 h-4 text-blue-600" /> },
        { label: t('gisMap'), path: '/map', icon: <Compass className="w-4 h-4 text-teal-600" /> },
      ],
    },
    {
      label: t('services'),
      id: 'services',
      path: '/services',
      isDropdown: true,
      children: [
        { label: t('servicesCatalogue'), path: '/services', icon: <HandHeart className="w-4 h-4 text-emerald-600" /> },
        { label: t('nikahRegistration'), path: '/services?apply=srv-1', icon: <HeartHandshake className="w-4 h-4 text-rose-600" /> },
        { label: t('zakatWelfareAid'), path: '/services?apply=srv-2', icon: <Scale className="w-4 h-4 text-amber-600" /> },
        { label: t('janazahEmergency'), path: '/services?apply=srv-3', icon: <Building className="w-4 h-4 text-stone-600" /> },
        { label: t('zakatCalculator'), path: '/services?tab=zakat', icon: <Calculator className="w-4 h-4 text-emerald-600" /> },
        { label: t('waqfRegistry'), path: '/services?tab=waqf', icon: <Building className="w-4 h-4 text-emerald-600" /> },
        { label: t('trackApplication'), path: '/services?tab=track', icon: <Search className="w-4 h-4 text-teal-600" /> },
      ],
    },
    { label: t('events'), path: '/events' },
    { label: t('announcements'), path: '/announcements' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="site-header sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      {/* Top institutional strip */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-emerald-900/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-serif tracking-wider text-amber-300 hidden md:inline font-medium shrink-0">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </span>
            <span className="text-emerald-300 hidden md:inline">•</span>
            <span className="text-stone-300 font-sans truncate text-[11px] sm:text-xs">
              Jimma Zone Islamic Affairs Supreme Council • Oromia, Ethiopia
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/services?tab=zakat"
              className="hidden lg:flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Zakat Calculator</span>
            </Link>
            <span className="text-emerald-800 hidden lg:inline">|</span>
            <Link
              to="/donate"
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold transition-colors"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('donate')}</span>
            </Link>
            <span className="text-emerald-800">|</span>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-emerald-200 hover:text-amber-300 transition-colors"
              title="Staff & Faculty Authentication Portal"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Staff Sign In</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 hidden md:inline">
                {isLoggedIn ? currentUser.role : 'Staff'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            {/* Emblem / Star Icon */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center shadow-md border border-amber-400/40 group-hover:scale-105 transition-transform shrink-0">
              <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-sm sm:text-base md:text-lg lg:text-xl text-stone-900 dark:text-stone-100 tracking-tight leading-none group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                {language === 'ar' ? 'مجلس الشؤون الإسلامية' : language === 'om' ? 'Majiilisa Jimmaa' : 'Jimma Islamic Council'}
              </span>
              <span className="text-[9px] sm:text-[11px] font-sans text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-wider font-semibold truncate">
                Digital Management Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((link) => {
              const dropdownId = link.id || link.label;
              if (link.isDropdown && link.children) {
                const isAnyChildActive = link.children.some((c) => isActive(c.path)) || (link.path ? isActive(link.path) : false);
                const isOpen = openDropdown === dropdownId;
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(dropdownId)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      onClick={() => {
                        if (link.path) {
                          navigate(link.path);
                          setOpenDropdown(null);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors cursor-pointer ${
                        isAnyChildActive
                          ? 'text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                          : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 w-64 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setOpenDropdown(null)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs xl:text-sm transition-colors ${
                              isActive(child.path)
                                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold'
                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className="shrink-0 p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
                              {child.icon}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate">{child.label}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path!}
                  className={`px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-medium transition-colors ${
                    isActive(link.path!)
                      ? 'text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Language, Theme, Donate CTA, Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/80 rounded-xl border border-stone-200/60 dark:border-stone-700/60 transition-colors cursor-pointer"
              title="Search Council Records (Ctrl+K)"
              aria-label="Search Council Records"
            >
              <Search className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="hidden md:inline font-sans">{t('search')}</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-sm">
                ⌘K
              </kbd>
            </button>

            {/* Language Selector */}
            <LanguageSelector compact />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Donate CTA */}
            <Link to="/donate" className="hidden sm:inline-flex">
              <Button
                variant="gold"
                size="sm"
                icon={<HeartHandshake className="w-4 h-4" />}
                className="font-bold shadow-xs text-xs whitespace-nowrap"
              >
                {t('donate')}
              </Button>
            </Link>

            {/* Staff Portal / Sign In Button */}
            <Link to="/login" className="hidden lg:inline-flex">
              <Button
                variant="outline"
                size="sm"
                icon={<LogIn className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                className="text-xs font-semibold whitespace-nowrap"
              >
                {t('staffPortal')}
              </Button>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Toggle Mobile Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-[105px] z-40 bg-stone-950/60 xl:hidden backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div id="public-mobile-navigation" className="fixed inset-x-0 top-[105px] max-h-[calc(100vh-105px)] overflow-y-auto z-50 xl:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-6 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                    : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive('/about')
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold'
                    : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {t('about')}
              </Link>

              {/* Institutions Accordion */}
              <div className="pt-2 pb-1">
                <button
                  onClick={() => setMobileInstitutionsOpen(!mobileInstitutionsOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                >
                  <span>Institutions & Directory</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileInstitutionsOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobileInstitutionsOpen && (
                  <div className="space-y-1 mt-1 pl-2">
                    <Link
                      to="/mosques"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <Building className="w-4 h-4 text-emerald-600" />
                      <span>{t('mosques')} Directory</span>
                    </Link>
                    <Link
                      to="/madrasas"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span>{t('madrasas')} & Hifz</span>
                    </Link>
                    <Link
                      to="/ulema"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{t('ulema')} Scholars</span>
                    </Link>
                    <Link
                      to="/map"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 font-bold"
                    >
                      <Compass className="w-4 h-4 text-emerald-600" />
                      <span>{t('gisMap')} (Interactive 18 Woredas)</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Services & Civic Desk Accordion */}
              <div className="pt-2 pb-1">
                <button
                  onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400"
                >
                  <span className="flex items-center gap-1.5">
                    <HandHeart className="w-4 h-4" />
                    <span>Public Services & Civic Desk</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {mobileServicesOpen && (
                  <div className="space-y-1 mt-1 pl-2">
                    <Link
                      to="/services"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 font-bold"
                    >
                      <HandHeart className="w-4 h-4 text-emerald-600" />
                      <span>All Services Catalogue</span>
                    </Link>
                    <Link
                      to="/services?apply=srv-1"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    >
                      <HeartHandshake className="w-4 h-4 text-rose-600" />
                      <span>Nikah Marriage Registration</span>
                    </Link>
                    <Link
                      to="/services?apply=srv-2"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>Zakat & Social Welfare Aid</span>
                    </Link>
                    <Link
                      to="/services?apply=srv-3"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Building className="w-4 h-4 text-stone-600" />
                      <span>Janazah Emergency Support (24/7)</span>
                    </Link>
                    <Link
                      to="/services?tab=zakat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                    >
                      <Calculator className="w-4 h-4 text-amber-500" />
                      <span>Zakat & Ushr Calculator</span>
                    </Link>
                    <Link
                      to="/services?tab=track"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Search className="w-4 h-4 text-teal-600" />
                      <span>Track Service Application</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Community & Governance */}
              <div className="pt-3 pb-1 px-4 text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Community & Governance
              </div>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {t('services')} (Nikah, Zakat, Janazah)
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {t('events')}
              </Link>
              <Link
                to="/announcements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              >
                {t('announcements')}
              </Link>
              {/* Mobile Actions */}
              <div className="pt-4 mt-2 border-t border-stone-100 dark:border-stone-800 space-y-2.5 pb-6">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-sm border border-stone-200 dark:border-stone-700 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Staff & Faculty Authentication</span>
                </Link>
                <Link
                  to="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t('donateNowBtn')}</span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-300" />
                  <span>Open Council Admin Portal</span>
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};
