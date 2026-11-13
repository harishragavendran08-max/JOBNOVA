import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { validateLoginInput } from '../utils/authLogic';

interface LoginViewProps {
  onEmailLogin: (credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  onOAuthLogin: (provider: 'Google' | 'GitHub') => Promise<void> | void;
  onSwitchToSignUp: () => void;
  onExploreJobs: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onEmailLogin,
  onOAuthLogin,
  onSwitchToSignUp,
  onExploreJobs
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLoginInput({ email, password });
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please check your credentials.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await onEmailLogin({
        email: email.trim(),
        password,
        rememberMe
      });
      if (!result.ok) {
        setErrorMessage(result.error || 'Unable to log in. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('harishragavendran56@gmail.com');
    setPassword('JobNova@2026');
    setErrorMessage(null);
  };

  return (
    <section
      data-testid="login-view"
      aria-labelledby="login-page-heading"
      className="max-w-4xl mx-auto py-2 sm:py-6"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Informational Panel */}
        <div className="order-2 lg:order-1 lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2557A7] dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Candidate Sign In</span>
            </div>

            <h1
              id="login-page-heading"
              className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-snug"
            >
              Welcome back to JobNova
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in to continue tracking your engineering applications, salary benchmarks, and technical interview preparation.
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#087F31] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Saved applications &amp; interview stage notes across 44+ engineering roles</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#087F31] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Synced skill profile, ATS resume exports &amp; LinkedIn work history</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#087F31] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>AI Mock Interview evaluations &amp; technical interview cheat sheets</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExploreJobs}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Browse open roles first</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              /login
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="order-1 lg:order-2 lg:col-span-7 p-7 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Log in with email
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your registered email address and password.
              </p>
            </div>
            <button
              type="button"
              data-testid="login-fill-demo-btn"
              onClick={handleFillDemoCredentials}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] dark:hover:border-blue-400 transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3 h-3 text-[#2557A7] dark:text-blue-400" />
              <span>Fill Demo Account</span>
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              data-testid="login-error-alert"
              className="flex items-start gap-2.5 p-3.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  data-testid="login-email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Demo password: <code className="font-mono">JobNova@2026</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#2557A7] focus:ring-[#2557A7]"
                />
                <span>Keep me signed in on this browser</span>
              </label>
            </div>

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#2557A7] hover:bg-[#164081] disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing in...' : 'Log In'}</span>
            </button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
                or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="login-google-btn"
              onClick={() => onOAuthLogin('Google')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <span className="font-bold text-rose-600 dark:text-rose-400">G</span>
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              data-testid="login-github-btn"
              onClick={() => onOAuthLogin('GitHub')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-900 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <span className="font-mono font-bold">GH</span>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              New to JobNova?
            </span>
            <button
              type="button"
              data-testid="switch-to-signup-btn"
              onClick={onSwitchToSignUp}
              className="inline-flex items-center gap-1 font-bold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>Create an account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
