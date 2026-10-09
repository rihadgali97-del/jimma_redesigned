import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getUserRoleCategory,
  checkRoutePermission,
} from '../../middleware/authMiddleware';
import {
  LayoutDashboard,
  Building,
  BookOpen,
  GraduationCap,
  Users2,
  Users,
  WalletCards,
  FileCheck2,
  HeartHandshake,
  HandHeart,
  Calendar,
  FileText,
  ShieldCheck,
  Landmark,
  ArrowLeft,
  X,
  Radio,
  MapPin,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Settings,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  end?: boolean;
  badge?: string | number;
  badgeVariant?: 'amber' | 'emerald' | 'blue';
}

interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { currentUser, serviceRequests } = useApp();
  const { language } = useLanguage();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const roleCategory = getUserRoleCategory(currentUser);

  const pendingServicesCount = serviceRequests.filter(
    (s) => s.status === 'Submitted' || s.status === 'In Review'
  ).length;

  const rawNavGroups: SidebarNavGroup[] = [
    {
      title: 'Main Operations',
      items: [
        { label: 'Executive Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
        { label: 'Mosques Registry', path: '/admin/mosques', icon: <Building className="w-4 h-4" /> },
        { label: 'Madrasas & Centers', path: '/admin/madrasas', icon: <BookOpen className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Islamic Education',
      items: [
        { label: 'Students & Hifz Records', path: '/admin/students', icon: <GraduationCap className="w-4 h-4" /> },
        { label: 'Teachers & Mu’allims', path: '/admin/teachers', icon: <Users2 className="w-4 h-4" /> },
        { label: 'Materials & Khutbahs', path: '/admin/resources', icon: <BookOpen className="w-4 h-4 text-emerald-400" /> },
        { label: 'Ulema & Fatwa Board', path: '/admin/ulema', icon: <Users className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Finance & Endowment',
      items: [
        { label: 'Financial Control Center', path: '/admin/finance', icon: <WalletCards className="w-4 h-4" />, end: true },
        {
          label: 'Expense Approvals',
          path: '/admin/finance/approvals',
          icon: <FileCheck2 className="w-4 h-4" />,
        },
        { label: 'Donations & Zakat Logs', path: '/admin/finance/donations', icon: <HeartHandshake className="w-4 h-4" /> },
        { label: 'Zakat Applications', path: '/admin/zakat/applications', icon: <Scale className="w-4 h-4 text-amber-500" /> },
        { label: 'Audit & Compliance', path: '/admin/audit', icon: <Scale className="w-4 h-4 text-amber-500" /> },
      ],
    },
    {
      title: 'Community Services',
      items: [
        {
          label: 'SMS & Telegram Gateway',
          path: '/admin/gateway',
          icon: <Radio className="w-4 h-4 text-emerald-500" />,
          badge: 'Live',
          badgeVariant: 'emerald' as const,
        },
        {
          label: 'Service Requests Desk',
          path: '/admin/services',
          icon: <HandHeart className="w-4 h-4" />,
          badge: pendingServicesCount > 0 ? pendingServicesCount : undefined,
          badgeVariant: 'blue' as const,
        },
        { label: 'Interactive GIS Map', path: '/map', icon: <MapPin className="w-4 h-4 text-amber-500" /> },
        { label: 'Events & Programs', path: '/admin/events', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Announcements', path: '/admin/announcements', icon: <Radio className="w-4 h-4" /> },
        { label: 'Waqf Asset Registry', path: '/admin/waqf', icon: <Landmark className="w-4 h-4" /> },
        { label: 'Council Documents', path: '/admin/documents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Staff & Role Access', path: '/admin/users', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    ...(roleCategory === 'Admin' || Boolean(currentUser.authRole)
      ? [{
          title: 'Administration',
          items: [
            { label: 'Kebeles', path: '/admin/woredas', icon: <MapPin className="w-4 h-4 text-amber-400" /> },
            { label: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4 text-amber-400" /> },
          ],
        }]
      : []),
  ];

  // Filter navigation items against authentication middleware
  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => checkRoutePermission(currentUser, item.path).isAuthorized),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/70 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`admin-sidebar fixed top-0 left-0 z-40 h-screen bg-stone-900 text-stone-300 border-r border-stone-800 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          /* Mobile: drawer */
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop: collapsed (w-20) vs expanded (w-72) */
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        }`}
      >
        {/* Top Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className={`p-4 border-b border-stone-800 flex items-center justify-between ${isCollapsed ? 'lg:p-3 lg:justify-center' : ''}`}>
            <Link
              to="/"
              className={`flex items-center gap-3 group min-w-0 ${isCollapsed ? 'lg:justify-center' : ''}`}
              title="Jimma Islamic Council Admin System"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5 text-amber-300" />
              </div>
              <div className={`flex flex-col min-w-0 transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                <span className="font-serif font-bold text-white tracking-tight leading-none text-base truncate">
                  Jimma Council
                </span>
                <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider mt-1 truncate">
                  Admin System
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse / Expand Toggle Icon in header (only when expanded) */}
            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Current User Role Pill */}
          <div
            className={`mx-3 mt-3 p-2.5 rounded-xl bg-stone-800/80 border border-stone-700/80 flex items-center transition-all ${
              isCollapsed ? 'lg:mx-2 lg:p-2 lg:justify-center' : 'justify-between'
            }`}
            title={`${currentUser.name} (${currentUser.role})`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-700/60 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-amber-400 truncate">{currentUser.role}</span>
                  <span
                    className={`text-[8px] font-mono px-1 py-0.2 rounded-xs uppercase font-bold tracking-tight ${
                      roleCategory === 'Teacher'
                        ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50'
                        : roleCategory === 'Admin'
                        ? 'bg-amber-900/80 text-amber-300 border border-amber-600/50'
                        : 'bg-sky-900/80 text-sky-300 border border-sky-600/50'
                    }`}
                  >
                    {roleCategory}
                  </span>
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse ${isCollapsed ? 'lg:hidden' : 'block'}`} />
          </div>

          {/* Navigation Links List */}
          <nav className="flex-1 mt-3 px-2.5 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-800">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {/* Group Title (hidden or separator when collapsed) */}
                <div
                  className={`px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 transition-all ${
                    isCollapsed ? 'lg:hidden' : 'block mb-1.5'
                  }`}
                >
                  {group.title}
                </div>

                {isCollapsed && (
                  <div className="hidden lg:block my-2 border-t border-stone-800/80 mx-1" />
                )}

                {group.items.map((item) => (
                  <div key={item.path} className="relative group">
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={({ isActive }) =>
                        `flex items-center ${
                          isCollapsed ? 'lg:justify-center lg:px-2' : 'justify-between px-3'
                        } py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-900/90 text-amber-300 font-bold border border-emerald-700/60 shadow-xs'
                            : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        }`
                      }
                    >
                      <div className={`flex items-center gap-2.5 ${isCollapsed ? 'lg:gap-0' : ''}`}>
                        <span className="shrink-0">{item.icon}</span>
                        <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                          {item.label}
                        </span>
                      </div>

                      {/* Badges */}
                      {item.badge !== undefined && (
                        <>
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-stone-950 shrink-0 ${
                              isCollapsed ? 'lg:hidden' : 'block'
                            }`}
                          >
                            {item.badge}
                          </span>
                          {isCollapsed && (
                            <span className="hidden lg:block absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-stone-900" />
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Floating Tooltip for Collapsed Sidebar on Desktop */}
                    {isCollapsed && (
                      <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-3 py-1.5 bg-stone-900 text-stone-100 text-xs font-medium rounded-xl shadow-xl border border-stone-700 whitespace-nowrap items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-stone-950">
                            {item.badge}
                          </span>
                        )}
                        {/* Little triangle arrow pointing left */}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-stone-900" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Return to Public Portal & Expand/Collapse Trigger */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/80 space-y-2">
          {/* Quick Collapse / Expand button at bottom on desktop */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex w-full items-center ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } px-3 py-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-medium transition-colors`}
            title={isCollapsed ? 'Expand Sidebar (Ctrl+[)' : 'Collapse Sidebar (Ctrl+[)'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div className="flex items-center gap-2">
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-stone-400" />
              )}
              <span className={isCollapsed ? 'hidden' : 'block'}>Collapse Sidebar</span>
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono text-stone-500 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                [
              </span>
            )}
          </button>

          {/* Return to Public Portal */}
          <Link
            to="/"
            className={`w-full flex items-center ${
              isCollapsed ? 'lg:justify-center px-2' : 'justify-center gap-2 px-3'
            } py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors border border-stone-700`}
            title="Return to Public Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              Return to Public Portal
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};
