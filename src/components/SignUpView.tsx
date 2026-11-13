import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  User,
  UserPlus
} from 'lucide-react';
import {
  SIGNUP_TRACK_PRESETS,
  computePasswordStrength,
  validateSignUpInput
} from '../utils/authLogic';

interface SignUpViewProps {
  onSignUp: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    trackId: string;
    location: string;
    acceptTerms: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  onOAuthLogin: (provider: 'Google' | 'GitHub') => Promise<void> | void;
  onSwitchToLogin: () => void;
}

export const SignUpView: React.FC<SignUpViewProps> = ({
  onSignUp,
  onOAuthLogin,
  onSwitchToLogin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trackId, setTrackId] = useState(SIGNUP_TRACK_PRESETS[0].id);
  const [location, setLocation] = useState('Bengaluru, India');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strength = computePasswordStrength(password);
  const activePreset =
    SIGNUP_TRACK_PRESETS.find((t) => t.id === trackId) || SIGNUP_TRACK_PRESETS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateSignUpInput({
      name,
      email,
      password,
      confirmPassword,
      acceptTerms
    });
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please review your registration details.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await onSignUp({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        trackId,
        location: location.trim() || 'Bengaluru, India',
        acceptTerms
      });
      if (!result.ok) {
        setErrorMessage(result.error || 'Unable to create account right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      data-testid="signup-view"
      aria-labelledby="signup-page-heading"
      className="max-w-4xl mx-auto py-2 sm:py-6"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Informational Panel */}
        <div className="order-2 lg:order-1 lg:col-span-5 bg-slate-50 dark:bg-slate-800/50 border-t lg:border-t-0 lg:border-r border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#087F31] dark:text-emerald-400">
              <UserPlus className="w-4 h-4" />
              <span>Create Candidate Account</span>
            </div>

            <h1
              id="signup-page-heading"
              className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-snug"
            >
              Launch your engineering career profile
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Create a dedicated JobNova account tailored to your engineering stack and unlock personalized job matching.
            </p>

            {/* Live Track Preview Card */}
            <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Compass className="w-4 h-4 text-[#2557A7] dark:text-blue-400" />
                <span>Starter Track: {activePreset.label}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activePreset.summary}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activePreset.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-[11px] font-mono font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <ul className="space-y-2.5 pt-1">
              <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#087F31] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Instant ATS-ready PDF resume builder pre-filled from your track</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#087F31] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Role fit scoring across India &amp; remote engineering openings</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Free forever for students &amp; devs</span>
            <span className="font-mono">/signup</span>
          </div>
        </div>

        {/* Right Sign Up Form Panel */}
        <div className="order-1 lg:order-2 lg:col-span-7 p-7 sm:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Sign up for JobNova
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Fill in your details below to create a new account.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              data-testid="signup-error-alert"
              className="flex items-start gap-2.5 p-3.5 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    data-testid="signup-name-input"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ananya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-location"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Preferred city / location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-location"
                    data-testid="signup-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bengaluru, India"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  data-testid="signup-email-input"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ananya.sharma@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="signup-track"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Primary engineering track
              </label>
              <select
                id="signup-track"
                data-testid="signup-track-select"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7] cursor-pointer"
              >
                {SIGNUP_TRACK_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    data-testid="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars (A-z & 0-9)"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-confirm-password"
                    data-testid="signup-confirm-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2557A7] focus:ring-1 focus:ring-[#2557A7]"
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Bar */}
            <div data-testid="signup-password-strength" className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Password strength
                </span>
                <span className={`font-semibold ${strength.textColorClass}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${strength.barColorClass}`}
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none pt-0.5">
              <input
                id="signup-terms"
                data-testid="signup-terms-checkbox"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-[#2557A7] focus:ring-[#2557A7]"
              />
              <span>
                I agree to the JobNova Candidate Terms of Service and Privacy Policy for career profile personalization.
              </span>
            </label>

            <button
              type="submit"
              data-testid="signup-submit-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#2557A7] hover:bg-[#164081] disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
                or sign up faster with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="signup-google-btn"
              onClick={() => onOAuthLogin('Google')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <span className="font-bold text-rose-600 dark:text-rose-400">G</span>
              <span>Sign up with Google</span>
            </button>
            <button
              type="button"
              data-testid="signup-github-btn"
              onClick={() => onOAuthLogin('GitHub')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-900 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <span className="font-mono font-bold">GH</span>
              <span>Sign up with GitHub</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              Already have a JobNova account?
            </span>
            <button
              type="button"
              data-testid="switch-to-login-btn"
              onClick={onSwitchToLogin}
              className="inline-flex items-center gap-1 font-bold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>Log in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
