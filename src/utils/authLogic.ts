import type { UserProfile } from '../data/seedData';
import type { ActiveTab } from '../components/Navbar';

export interface SignUpTrackPreset {
  id: string;
  label: string;
  headline: string;
  skills: string[];
  summary: string;
}

export const SIGNUP_TRACK_PRESETS: SignUpTrackPreset[] = [
  {
    id: 'java-fullstack',
    label: 'Java & Spring Boot Full-Stack',
    headline: 'Full-Stack Developer — Java, Spring Boot, React.js, TypeScript & MySQL',
    skills: ['java', 'springboot', 'react', 'typescript', 'mysql', 'docker'],
    summary:
      'Building scalable RESTful APIs with Java & Spring Boot alongside responsive React frontends and relational databases.'
  },
  {
    id: 'genai-python',
    label: 'Python, AI & GenAI / LLM Engineering',
    headline: 'AI & Backend Engineer — Python, FastAPI, LangChain, RAG & PyTorch',
    skills: ['python', 'fastapi', 'llm', 'rag', 'pytorch', 'sql'],
    summary:
      'Designing production LLM workflows, vector retrieval pipelines, and ML inference APIs in Python.'
  },
  {
    id: 'backend-cloud',
    label: 'Go, Cloud & Kubernetes Infrastructure',
    headline: 'Backend & Cloud Engineer — Go, Kubernetes, Docker, AWS & Terraform',
    skills: ['go', 'kubernetes', 'docker', 'aws', 'terraform', 'linux'],
    summary:
      'Architecting distributed microservices, infrastructure-as-code modules, and resilient cloud deployments.'
  },
  {
    id: 'data-engineering',
    label: 'Data Engineering & Lakehouse Analytics',
    headline: 'Data Engineer — Python, Apache Spark, Kafka, Airflow & SQL',
    skills: ['python', 'spark', 'kafka', 'sql', 'airflow', 'aws'],
    summary:
      'Building high-throughput ETL/ELT lakehouse pipelines, streaming ingestion workflows, and analytics models.'
  },
  {
    id: 'frontend-mobile',
    label: 'Frontend, Next.js & Mobile Engineering',
    headline: 'Frontend & Mobile Engineer — React, Next.js, TypeScript, Tailwind & React Native',
    skills: ['react', 'nextjs', 'typescript', 'javascript', 'tailwind', 'html'],
    summary:
      'Crafting accessible, high-performance web interfaces and cross-platform mobile applications.'
  },
  {
    id: 'qa-security',
    label: 'SDET Automation & Cloud Security',
    headline: 'SDET & Security Engineer — Playwright, Java, Python, Cybersecurity & CI/CD',
    skills: ['playwright', 'java', 'python', 'cybersecurity', 'linux', 'docker'],
    summary:
      'Automating end-to-end quality gates, API test suites, and cloud application security posture checks.'
  }
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface PasswordStrengthInfo {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Empty' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  percent: number;
  barColorClass: string;
  textColorClass: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateLoginInput(input: {
  email: string;
  password: string;
}): ValidationResult {
  const email = input.email.trim();
  const password = input.password;

  if (!email) {
    return { valid: false, error: 'Please enter your email address.' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., name@domain.com).' };
  }
  if (!password) {
    return { valid: false, error: 'Please enter your password.' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { valid: true };
}

export function validateSignUpInput(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}): ValidationResult {
  const name = input.name.trim();
  const email = input.email.trim();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (name.length < 2) {
    return { valid: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      error: 'Password must include at least one letter and one number.'
    };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match. Please re-enter carefully.' };
  }
  if (!input.acceptTerms) {
    return { valid: false, error: 'Please accept the JobNova Terms of Service to create your account.' };
  }
  return { valid: true };
}

export function computePasswordStrength(password: string): PasswordStrengthInfo {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      percent: 0,
      barColorClass: 'bg-slate-200 dark:bg-slate-700',
      textColorClass: 'text-slate-500 dark:text-slate-400'
    };
  }

  let points = 0;
  if (password.length >= 8) points += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) points += 1;

  const score = Math.max(1, Math.min(4, points)) as 1 | 2 | 3 | 4;
  if (score === 1) {
    return {
      score,
      label: 'Weak',
      percent: 25,
      barColorClass: 'bg-rose-500',
      textColorClass: 'text-rose-600 dark:text-rose-400'
    };
  }
  if (score === 2) {
    return {
      score,
      label: 'Fair',
      percent: 50,
      barColorClass: 'bg-amber-500',
      textColorClass: 'text-amber-600 dark:text-amber-400'
    };
  }
  if (score === 3) {
    return {
      score,
      label: 'Good',
      percent: 75,
      barColorClass: 'bg-[#2557A7] dark:bg-blue-500',
      textColorClass: 'text-[#2557A7] dark:text-blue-400'
    };
  }
  return {
    score: 4,
    label: 'Strong',
    percent: 100,
    barColorClass: 'bg-[#087F31] dark:bg-emerald-500',
    textColorClass: 'text-[#087F31] dark:text-emerald-400'
  };
}

export function buildUserProfileFromSignUp(params: {
  id: number;
  name: string;
  email: string;
  trackId?: string;
  location?: string;
}): UserProfile {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const preset =
    SIGNUP_TRACK_PRESETS.find((t) => t.id === params.trackId) || SIGNUP_TRACK_PRESETS[0];

  return {
    id: params.id,
    oauthId: `email-user-${params.id}-${cleanEmail.split('@')[0]}`,
    name: cleanName,
    email: cleanEmail,
    provider: 'Email',
    headline: preset.headline,
    location: params.location?.trim() || 'Bengaluru, India',
    summary: preset.summary,
    education: 'B.Tech / B.E. in Computer Science & Engineering',
    skills: [...preset.skills],
    dob: 'Not specified',
    linkedInConnected: false,
    linkedInProfileUrl: '',
    workHistory: []
  };
}

export function resolveTabFromPathname(pathname: string): ActiveTab {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase();
  if (normalized === '/login') return 'login';
  if (normalized === '/signup') return 'signup';
  if (normalized === '/interview-prep') return 'interview-prep';
  return 'home';
}

export function getPathnameForTab(tab: ActiveTab): string {
  if (tab === 'login') return '/login';
  if (tab === 'signup') return '/signup';
  if (tab === 'interview-prep') return '/interview-prep';
  return '/';
}
