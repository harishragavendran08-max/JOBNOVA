import React from 'react';
import { LogIn, LogOut, Moon, Sun, UserPlus } from 'lucide-react';

export type ActiveTab =
  | 'home'
  | 'jobs'
  | 'internships'
  | 'codelab'
  | 'learning'
  | 'certifications'
  | 'ai'
  | 'resume'
  | 'profile'
  | 'login'
  | 'signup';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userName?: string;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userName,
  onLogout,
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
    { id: 'resume', label: 'Resume Builder' },
    { id: 'ai', label: 'Career Assistant' }
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between gap-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="text-xl font-extrabold tracking-tight text-[#2557A7] dark:text-blue-400 hover:text-[#164081] dark:hover:text-blue-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2557A7] rounded whitespace-nowrap shrink-0"
        >
          JobNova
        </button>

        {/* Zone 2: Clean Underline Tab Links (Indeed / Glassdoor Navigation Style) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-stretch h-15 gap-5 overflow-x-auto"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex items-center px-0.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#2557A7] dark:border-blue-400 text-[#2557A7] dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Switch & Account / Separate Auth Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleTheme && (
            <button
              type="button"
              data-testid="navbar-dark-mode-toggle"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-pressed={isDark}
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
          )}

          {userName ? (
            <>
              <button
                type="button"
                data-testid="navbar-profile-btn"
                onClick={() => onSelectTab('profile')}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#2557A7] dark:hover:border-blue-400'
                }`}
              >
                <span className="font-mono text-[11px] font-bold">
                  {userName.slice(0, 2).toUpperCase()}
                </span>
                <span aria-hidden="true" className="opacity-40">
                  |
                </span>
                <span>{userName.split(' ')[0]}</span>
              </button>

              {onLogout && (
                <button
                  type="button"
                  data-testid="navbar-logout-btn"
                  aria-label="Sign out"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                type="button"
                data-testid="navbar-login-btn"
                onClick={() => onSelectTab('login')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#2557A7] dark:hover:border-blue-400'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                data-testid="navbar-signup-btn"
                onClick={() => onSelectTab('signup')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'signup'
                    ? 'bg-[#164081] text-white border-[#164081] dark:bg-blue-500 dark:border-blue-500'
                    : 'bg-[#2557A7] text-white border-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-500'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Compact Scrollable Tab Row */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center gap-4 px-4 h-11 border-t border-slate-200 dark:border-slate-800 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={`mobile-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`h-full inline-flex items-center text-xs font-semibold border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#2557A7] dark:border-blue-400 text-[#2557A7] dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
