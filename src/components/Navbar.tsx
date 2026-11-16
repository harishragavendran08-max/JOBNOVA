import React, { useEffect, useRef, useState } from 'react';
import { LogIn, LogOut, Moon, Sun, UserPlus } from 'lucide-react';
import { getThemeToggleMeta } from '../utils/jobnovaLogic';

export type ActiveTab =
  | 'home'
  | 'jobs'
  | 'internships'
  | 'interview-prep'
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
    { id: 'resume', label: 'Resume' },
    { id: 'ai', label: 'AI Assistant' }
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
    <header className="sticky top-0 z-30 ios-glass-bar bg-white/82 dark:bg-[#12141C]/85 border-b border-slate-200/80 dark:border-slate-800/80 theme-transition-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="text-xl font-extrabold tracking-tight text-[#007AFF] dark:text-[#3898FF] hover:text-[#0062CC] dark:hover:text-blue-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] dark:focus-visible:ring-blue-400 rounded-xl whitespace-nowrap shrink-0"
        >
          JobNova
        </button>

        {/* Zone 2: iOS Segmented Control Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 ios-segmented"
        >
          {navItems.map((item) => {
            const isActive =
              activeTab === item.id ||
              (item.id === 'learning' && activeTab === 'certifications');
            return (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] dark:focus-visible:ring-blue-400 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-[#007AFF] dark:text-[#3898FF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Prominent iOS Theme Switch & Account / Separate Auth Actions */}
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
                className={`group inline-flex items-center gap-2 min-h-[38px] pl-1.5 pr-3 py-1 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                  isDark
                    ? 'bg-slate-800/90 border-blue-400/70 text-slate-100 hover:bg-slate-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs'
                } ${
                  isFeedbackPulsing
                    ? isDark
                      ? 'ring-4 ring-blue-400/35'
                      : 'ring-4 ring-[#007AFF]/25'
                    : ''
                }`}
              >
                {/* iOS Control Center sliding switch track */}
                <span
                  aria-hidden="true"
                  className={`relative inline-flex items-center w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${
                    isDark ? 'bg-[#007AFF]' : 'bg-[#E5E5EA]'
                  }`}
                >
                  <Sun
                    className={`w-3 h-3 ml-0.5 transition-opacity duration-200 ${
                      isDark ? 'text-white/70 opacity-60' : 'text-amber-600 opacity-0'
                    }`}
                  />
                  <Moon
                    className={`w-3 h-3 ml-auto mr-0.5 transition-opacity duration-200 ${
                      isDark ? 'text-blue-200 opacity-0' : 'text-slate-600 opacity-70'
                    }`}
                  />
                  {/* Sliding active indicator knob */}
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-200 ${
                      isDark
                        ? 'translate-x-4.5 text-[#007AFF]'
                        : 'translate-x-0 text-amber-500'
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
                  className={`pointer-events-none hidden md:inline-flex absolute right-0 top-full mt-2 z-40 items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-md whitespace-nowrap ios-glass-bar ${
                    isDark
                      ? 'bg-slate-900/90 border-blue-400/70 text-blue-200'
                      : 'bg-white/95 border-slate-200 text-slate-900'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3 h-3 text-[#3898FF] shrink-0" />
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
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-[#007AFF] text-white border-[#007AFF] dark:bg-blue-600 dark:border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#007AFF] dark:hover:border-blue-400 shadow-xs'
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 dark:hover:border-rose-800 cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'login'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#007AFF] dark:hover:border-blue-400'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                type="button"
                data-testid="navbar-signup-btn"
                onClick={() => onSelectTab('signup')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full border cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'signup'
                    ? 'bg-[#0062CC] text-white border-[#0062CC] dark:bg-blue-500 dark:border-blue-500'
                    : 'bg-[#007AFF] text-white border-[#007AFF] hover:bg-[#0062CC] dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-500'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Compact Scrollable Segmented Tab Row */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center gap-2 px-4 h-11 border-t border-slate-200/70 dark:border-slate-800/70 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive =
            activeTab === item.id ||
            (item.id === 'learning' && activeTab === 'certifications');
          return (
            <button
              key={`mobile-${item.id}`}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

