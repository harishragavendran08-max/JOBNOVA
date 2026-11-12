import React from 'react';
import { Briefcase, Moon, Sun, User } from 'lucide-react';

export type ActiveTab =
  | 'home'
  | 'jobs'
  | 'internships'
  | 'codelab'
  | 'learning'
  | 'certifications'
  | 'ai'
  | 'profile';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userName?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userName,
  theme = 'light',
  onToggleTheme
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Overview' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'internships', label: 'Internships' },
    { id: 'codelab', label: 'Code Lab' },
    { id: 'learning', label: 'Learning' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'ai', label: 'AI Career Assistant' }
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <button
        type="button"
        onClick={() => onSelectTab('home')}
        className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-lg p-1 -m-1"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-xs shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-none">
            JOBNOVA
          </span>
          <span className="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-0.5 font-mono">
            Career Platform
          </span>
        </div>
      </button>

      {/* Zone 2: Primary Navigation Links */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Top-Right Global Dark Mode Toggle & Profile Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onToggleTheme && (
          <button
            type="button"
            data-testid="navbar-dark-mode-toggle"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-pressed={isDark}
            onClick={onToggleTheme}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                : 'bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200/80'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">Dark</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          data-testid="navbar-profile-btn"
          onClick={() => onSelectTab('profile')}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
            {userName ? userName.slice(0, 2).toUpperCase() : 'JN'}
          </div>
          <span>{userName ? userName.split(' ')[0] : 'Profile'}</span>
        </button>
      </div>
    </header>
  );
};
