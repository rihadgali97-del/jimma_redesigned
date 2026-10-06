import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building, HandHeart, HeartHandshake, Home } from 'lucide-react';

const links = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Services', path: '/services', icon: HandHeart },
  { label: 'Mosques', path: '/mosques', icon: Building },
  { label: 'Donate', path: '/donate', icon: HeartHandshake },
];

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] xl:hidden pointer-events-none"
    >
      <div className="mx-auto flex w-full max-w-sm items-center justify-around rounded-2xl border border-stone-200/90 bg-white/95 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-lg dark:border-stone-700 dark:bg-stone-900/95 pointer-events-auto">
        {links.map(({ label, path, icon: Icon }) => {
          const active = path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-[4.25rem] flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
