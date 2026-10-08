import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  ChevronRight,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface AdminTopNavProps {
  onMenuToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onMenuToggle,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const {
    currentUser,
    setIsSearchOpen,
    serviceRequests,
    logout,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, idx) => {
    const url = `/${pathParts.slice(0, idx + 1).join('/')}`;
    const name = part.charAt(0).toUpperCase() + part.slice(1);
    return { name, url };
  });

  const pendingItems = [
    ...serviceRequests
      .filter((s) => s.status === 'Submitted')
      .map((s) => ({
        id: s.id,
        title: `New Service Request: ${s.serviceType}`,
        time: s.submissionDate,
        type: 'service',
        link: '/admin/services',
      })),
  ];

  return (
    <header className="admin-topnav sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 transition-colors">
      {/* Left: Mobile Toggle, Desktop Expand/Collapse, & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Drawer Toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          aria-label="Toggle Mobile Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Expand / Contract Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar (Ctrl+[)' : 'Contract / Collapse Sidebar (Ctrl+[)'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200" />
            )}
          </button>
        )}

        {/* Breadcrumb Navigation */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 min-w-0 truncate">
          <Link
            to="/admin"
            className="hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold shrink-0 transition-colors"
          >
            Council Admin
          </Link>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
              <span
                className={`truncate ${
                  idx === breadcrumbs.length - 2
                    ? 'font-bold text-stone-900 dark:text-stone-100'
                    : 'hover:text-stone-700 dark:hover:text-stone-300 transition-colors'
                }`}
              >
                {crumb.name}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Controls: Quick Search, Notifications, Language, Theme */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Global Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors"
          title="Quick Search (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="hidden md:inline font-sans">Quick Search</span>
          <kbd className="hidden xl:inline px-1 py-0.5 text-[9px] font-mono bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xs">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 transition-colors"
            title="Notifications & Approval Queue"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                {pendingItems.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Action Required ({pendingItems.length})
                </span>
                <span className="text-[10px] text-stone-400">Live Council Queue</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {pendingItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    All tasks reviewed and up to date!
                  </div>
                ) : (
                  pendingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.link);
                        setNotificationsOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.time}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <LanguageSelector compact />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 transition-colors"
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Authenticated account menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            title={`Active: ${currentUser.name} (${currentUser.role})`}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight min-w-0 max-w-[120px]">
              <div className="font-bold truncate">{currentUser.name}</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate">{currentUser.role}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate">{currentUser.role}</div>
                  <div className="text-[9px] text-stone-400 truncate">{currentUser.email}</div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    void logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
