import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicSiteHeader } from './PublicSiteHeader';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastContainer } from '../ui/ToastContainer';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { PublicTranslationLayer } from './PublicTranslationLayer';

export const PublicLayout: React.FC = () => {
  const { refreshEvents, refreshAnnouncements } = useApp();
  const { language } = useLanguage();
  useEffect(() => {
    void refreshEvents(false);
    void refreshAnnouncements(false);
  }, []);

  return (
    <div lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} className="public-site min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors selection:bg-emerald-200 selection:text-emerald-950">
      <PublicSiteHeader />
      <main className="flex-1 pb-24 xl:pb-16">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <ToastContainer />
      <GlobalSearchModal />
      <PublicTranslationLayer />
    </div>
  );
};
