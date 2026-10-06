import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';
import { DemoPresentationBar } from '../common/DemoPresentationBar';
import { ToastContainer } from '../ui/ToastContainer';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { checkRoutePermission } from '../../middleware/authMiddleware';
import { AccessDeniedView } from '../common/AccessDeniedView';

const SIDEBAR_COLLAPSED_KEY = 'jimma_council_admin_sidebar_collapsed';

export const AdminLayout: React.FC = () => {
  const { isLoggedIn, authReady, currentUser } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Keyboard shortcut: Ctrl+[ or Command+[ to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!authReady) {
    return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Restoring secure session…</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // Middleware authorization check: verify user role (Admin vs. Teacher vs. Staff) against attempted route
  const routeAccess = checkRoutePermission(currentUser, location.pathname);

  return (
    <div className="admin-shell min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors">
      {/* Admin Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area - dynamically adapts to collapsed (80px / pl-20) vs expanded (288px / pl-72) */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <AdminTopNav
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 sm:pb-24">
          {routeAccess.isAuthorized ? (
            <Outlet />
          ) : (
            <AccessDeniedView user={currentUser} accessResult={routeAccess} />
          )}
        </main>
      </div>

      <DemoPresentationBar />
      <ToastContainer />
      <GlobalSearchModal />
    </div>
  );
};
