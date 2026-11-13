import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Moon, Sun, UserPlus } from 'lucide-react';
import { getThemeToggleMeta } from '../utils/jobnovaLogic';

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

  const themeMeta = getThemeToggleMeta(theme);
  const isDark = themeMeta.isDark;
  const [showThemeFeedback, setShowThemeFeedback] = useState(false);
  const [isFeedbackPulsing, setIsFeedbackPulsing] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
      if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const handleThemeToggleClick = () => {
    if (!onToggleTheme) return;
    onToggleTheme();
    setShowThemeFeedback(true);
    setIsFeedbackPulsing(true);
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    if (pulseTimerRef.current !== null) window.clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = window.setTimeout(() => setIsFeedbackPulsing(false), 650);
    feedbackTimerRef.current = window.setTimeout(() => setShowThemeFeedback(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 theme-transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-5">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="text-xl font-extrabold tracking-tight text-[#2557A7] dark:text-blue-400 hover:text-[#164081] dark:hover:text-blue-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2557A7] dark:focus-visible:ring-blue-400 rounded whitespace-nowrap shrink-0"
        >
          JobNova
        </button>

        {/* Zone 2: Clean Underline Tab Links (Indeed / Glassdoor Navigation Style) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-stretch h-16 gap-5 overflow-x-auto"
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
                className={`relative inline-flex items-center px-0.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2557A7] dark:focus-visible:ring-blue-400 rounded-t ${
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

        {/* Zone 3: Prominent Theme Switch & Account / Separate Auth Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleTheme && (
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                data-testid="navbar-dark-mode-toggle"
                aria-label={themeMeta.ariaLabel}
                aria-pressed={isDark}
                title={themeMeta.title}
                onClick={handleThemeToggleClick}
                className={`group inline-flex items-center gap-2 min-h-[38px] pl-1.5 pr-2.5 sm:pr-3 py-1 text-xs font-bold rounded-full border-2 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2557A7] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  isDark
                    ? 'bg-slate-800 border-blue-400/80 text-slate-100 hover:bg-slate-700 hover:border-blue-300 shadow-sm'
                    : 'bg-amber-50 border-amber-400 text-slate-900 hover:bg-amber-100 hover:border-amber-500 shadow-sm'
                } ${
                  isFeedbackPulsing
                    ? isDark
                      ? 'ring-4 ring-blue-400/40'
                      : 'ring-4 ring-amber-400/50'
                    : ''
                }`}
              >
                {/* Dual-mode sliding switch track */}
                <span
                  aria-hidden="true"
                  className={`relative inline-flex items-center w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ${
                    isDark ? 'bg-slate-950 border border-slate-700' : 'bg-amber-200/80 border border-amber-300'
                  }`}
                >
                  <Sun
                    className={`w-3 h-3 ml-0.5 transition-opacity duration-200 ${
                      isDark ? 'text-slate-500 opacity-60' : 'text-amber-700 opacity-0'
                    }`}
                  />
                  <Moon
                    className={`w-3 h-3 ml-auto mr-0.5 transition-opacity duration-200 ${
                      isDark ? 'text-blue-300 opacity-0' : 'text-slate-600 opacity-65'
                    }`}
                  />
                  {/* Sliding active indicator knob */}
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 ${
                      isDark
                        ? 'translate-x-5 bg-blue-500 text-white'
                        : 'translate-x-0 bg-amber-500 text-white'
                    }`}
                  >
                    {isDark ? (
                      <Moon className="w-2.5 h-2.5" strokeWidth={2.5} />
                    ) : (
                      <Sun className="w-2.5 h-2.5" strokeWidth={2.5} />
                    )}
                  </span>
                </span>

                <span className="tracking-tight leading-none">
                  {themeMeta.currentLabel}
                </span>
              </button>

              {/* Immediate visual feedback badge anchored below toggle */}
              {showThemeFeedback && (
                <div
                  role="status"
                  aria-live="polite"
                  data-testid="navbar-theme-feedback"
                  className={`pointer-events-none absolute right-0 top-full mt-2 z-40 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-md whitespace-nowrap transition-opacity duration-150 ${
                    isDark
                      ? 'bg-slate-900 border-blue-400/70 text-blue-200'
                      : 'bg-white border-amber-400 text-amber-900'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3 h-3 text-blue-400 shrink-0" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                  )}
                  <span>{themeMeta.feedbackBadgeText}</span>
                </div>
              )}
            </div>
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
