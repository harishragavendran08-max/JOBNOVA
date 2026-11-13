/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BellRing,
  Bookmark,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  FileDown,
  GraduationCap,
  Lightbulb,
  Link2,
  Mail,
  MapPin,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import {
  CertificationItem,
  CourseItem,
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_SETTINGS,
  InternshipItem,
  JobItem,
  SEED_CERTIFICATIONS,
  SEED_COURSES,
  SEED_INTERNSHIPS,
  SEED_JOBS,
  UserProfile,
  UserSettings
} from './data/seedData';
import {
  ApplicationStage,
  ApplicationStageRecord,
  InterviewConfidenceRating,
  addInterviewFeedbackRecord,
  buildJobShareLinks,
  buildLinkedInShareUrl,
  computeCareerStats,
  filterCertifications,
  filterCourses,
  filterInternships,
  filterJobsBySkill,
  filterJobsList,
  formatApplicationStatusNotification,
  generateLinkedInShareText,
  normalizeSavedJobIds,
  syncApplicationStageRecords,
  toggleItemSelection,
  toggleThemeSetting,
  updateApplicationStageRecord,
  updateInterviewScheduleRecord
} from './utils/jobnovaLogic';
import {
  computeJobMatchBreakdown,
  getCopyLinkFeedbackMeta,
  JobSortOption,
  sortJobsList
} from './utils/marketplaceHelpers';
import { ActiveTab, Navbar } from './components/Navbar';
import { CareerAssistantView } from './components/CareerAssistantView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { SkillProficiencyRadarCard } from './components/SkillProficiencyRadarCard';
import { JobSalaryComparisonCard } from './components/JobSalaryComparisonCard';
import { CareerTimelineCard } from './components/CareerTimelineCard';
import { PersonalizedAlertsCard } from './components/PersonalizedAlertsCard';
import { FullStackCodeLabView } from './components/FullStackCodeLabView';
import { ResumeBuilderView } from './components/ResumeBuilderView';
import { LoginView } from './components/LoginView';
import { SignUpView } from './components/SignUpView';
import { UserAlertsPanel } from './components/UserAlertsPanel';
import { QuickInterviewTipsModal } from './components/QuickInterviewTipsModal';
import { generateQuickInterviewTips } from './utils/quickInterviewTipsLogic';
import { getPathnameForTab, resolveTabFromPathname } from './utils/authLogic';
import {
  createUserAlertFromJob,
  dispatchBrowserPushNotification,
  findAlertForJob,
  findMatchingAlertsForNewJob,
  parseJobSkills,
  recordAlertJobMatches,
  UserAlertRecord
} from './utils/userAlertsLogic';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    typeof window !== 'undefined' ? resolveTabFromPathname(window.location.pathname) : 'home'
  );

  const navigateToTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetPath = getPathnameForTab(tab);
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }
  };

  // Data stores hydrated from backend API (/api/jobs, /api/internships, /api/courses, /api/certifications)
  const [jobs, setJobs] = useState<JobItem[]>(SEED_JOBS);
  const [internships, setInternships] = useState<InternshipItem[]>(SEED_INTERNSHIPS);
  const [courses, setCourses] = useState<CourseItem[]>(SEED_COURSES);
  const [certifications, setCertifications] = useState<CertificationItem[]>(SEED_CERTIFICATIONS);

  // User & Settings (persisted in localStorage + backend /api/user/me)
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER_PROFILE);
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const cached = localStorage.getItem('jobnova_user_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_USER_SETTINGS,
          ...parsed
        };
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_USER_SETTINGS;
  });

  // Overview Hero Two-Input Marketplace Search
  const [heroWhatQuery, setHeroWhatQuery] = useState('');
  const [heroWhereLocation, setHeroWhereLocation] = useState('ALL');

  // Interactive Filters & Master-Detail Selection
  const [jobSkillQuery, setJobSkillQuery] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('ALL');
  const [showSavedJobsOnly, setShowSavedJobsOnly] = useState(false);
  const [jobSortBy, setJobSortBy] = useState<JobSortOption>('featured');
  const [selectedJobId, setSelectedJobId] = useState<number>(SEED_JOBS[0].id);
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<number[]>(() => {
    try {
      const cached = localStorage.getItem('jobnova_bookmarked_job_ids');
      if (cached) {
        return normalizeSavedJobIds(JSON.parse(cached));
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });
  const [userAlerts, setUserAlerts] = useState<UserAlertRecord[]>(() => {
    try {
      const cached = localStorage.getItem('jobnova_user_alerts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const [browserPushPermission, setBrowserPushPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && typeof Notification !== 'undefined') {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);
  const [copiedJobLinkId, setCopiedJobLinkId] = useState<number | null>(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isQuickTipsModalOpen, setIsQuickTipsModalOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const copyLinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareMenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [internQuery, setInternQuery] = useState('');
  const [internLocationFilter, setInternLocationFilter] = useState('ALL');

  const [courseQuery, setCourseQuery] = useState('');
  const [courseProviderFilter, setCourseProviderFilter] = useState('ALL');

  const [certQuery, setCertQuery] = useState('');
  const [certIssuerFilter, setCertIssuerFilter] = useState('ALL');

  // Student Progress / Application State
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([1]);
  const [applicationStageRecords, setApplicationStageRecords] = useState<
    Record<number, ApplicationStageRecord>
  >(() => {
    const base = syncApplicationStageRecords({
      appliedJobIds: [1],
      jobs: SEED_JOBS,
      existingRecords: {}
    });
    const interviewing = updateApplicationStageRecord({
      existingRecords: base,
      job: SEED_JOBS[0],
      nextStage: 'Interviewing',
      customNote:
        'Shortlisted for Technical & System Design Interview Round 1 at TCS.',
      timestamp: 'Nov 12, 2026'
    });
    return addInterviewFeedbackRecord({
      existingRecords: interviewing,
      job: SEED_JOBS[0],
      roundTitle: 'Round 1: Java & Spring Boot Technical Screening · TCS',
      interviewerOrFormat: 'Senior Backend Architect · 45m Live Coding',
      questionsAsked:
        'Spring Boot @Transactional propagation, MySQL InnoDB composite indexing, and REST API pagination',
      keyTakeaways:
        'Answered Spring AOP transaction proxies and SQL join optimization well; review distributed caching patterns before Round 2.',
      confidenceRating: 'Strong',
      timestamp: 'Nov 12, 2026'
    });
  });
  const [appliedInternshipIds, setAppliedInternshipIds] = useState<number[]>([2]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([3, 5]);
  const [savedCertIds, setSavedCertIds] = useState<number[]>([1, 7]);

  // Toast feedback banner (replaces window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<{ id: number; prompt: string } | null>(
    null
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    setIsShareMenuOpen(false);
    setIsQuickTipsModalOpen(false);
    setCopiedJobLinkId(null);
    if (copyLinkTimerRef.current) {
      clearTimeout(copyLinkTimerRef.current);
      copyLinkTimerRef.current = null;
    }
    if (shareMenuCloseTimerRef.current) {
      clearTimeout(shareMenuCloseTimerRef.current);
      shareMenuCloseTimerRef.current = null;
    }
  }, [selectedJobId, activeTab]);

  useEffect(() => {
    return () => {
      if (copyLinkTimerRef.current) clearTimeout(copyLinkTimerRef.current);
      if (shareMenuCloseTimerRef.current) clearTimeout(shareMenuCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShareMenuOpen]);

  const handleFinishProfileWithAi = (prompt: string) => {
    setPendingAiPrompt({ id: Date.now(), prompt });
    setActiveTab('ai');
    showToast('Opened AI Career Assistant to help complete your missing profile sections.');
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Sync dark mode class, data-theme, and color-scheme on <html>
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = settings.theme;
    document.documentElement.style.colorScheme = settings.theme;
  }, [settings.theme]);

  // Fetch initial data from Express API routes matching Spring Boot controllers
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [jobsRes, internsRes, coursesRes, certsRes, userRes, alertsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/internships'),
          fetch('/api/courses'),
          fetch('/api/certifications'),
          fetch('/user'),
          fetch('/api/user-alerts')
        ]);

        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (internsRes.ok) setInternships(await internsRes.json());
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (certsRes.ok) setCertifications(await certsRes.json());
        if (alertsRes.ok) {
          const alertsPayload = await alertsRes.json();
          if (Array.isArray(alertsPayload?.alerts) && alertsPayload.alerts.length > 0) {
            setUserAlerts(alertsPayload.alerts);
          }
        }
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && userData.authenticated !== false) {
            setUser({
              id: userData.id || 1,
              oauthId: userData.oauthId || userData.sub || 'google-oauth2-student-101',
              name: userData.name || 'Harish Ragavendran',
              email: userData.email || 'harishragavendran56@gmail.com',
              provider: userData.provider || 'Google',
              headline:
                userData.headline ||
                'Full-Stack Developer — Java, Spring Boot, React.js, JavaScript, HTML5, CSS3 & MySQL',
              location: userData.location || 'Chennai, India',
              summary: userData.summary || DEFAULT_USER_PROFILE.summary,
              education: userData.education || DEFAULT_USER_PROFILE.education,
              skills: Array.isArray(userData.skills) ? userData.skills : DEFAULT_USER_PROFILE.skills,
              skillProficiencies: userData.skillProficiencies || {},
              linkedInConnected: Boolean(userData.linkedInConnected),
              linkedInProfileUrl: userData.linkedInProfileUrl,
              workHistory: Array.isArray(userData.workHistory) ? userData.workHistory : [],
              lastLinkedInSync: userData.lastLinkedInSync,
              dob: userData.dob || 'Not provided by OAuth provider'
            });

            if (window.location.search.includes('linkedin_connected=true')) {
              showToast('LinkedIn account successfully connected and work history imported!');
              window.history.replaceState({}, '', window.location.pathname);
            }
          } else {
            setUser(null);
          }
        }
      } catch {
        // Fallback to deterministic seed data already initialized
      }
    }
    loadInitialData();
  }, []);

  const handleToggleJobApply = (job: JobItem) => {
    const alreadyApplied = appliedJobIds.includes(job.id);
    const nextJobIds = toggleItemSelection(appliedJobIds, job.id);
    setAppliedJobIds(nextJobIds);
    setApplicationStageRecords((prev) =>
      syncApplicationStageRecords({
        appliedJobIds: nextJobIds,
        jobs,
        existingRecords: prev
      })
    );
    showToast(
      alreadyApplied
        ? `Withdrew application for ${job.title} at ${job.company}.`
        : `Applied for ${job.title} at ${job.company} (Added to Career Timeline)!`
    );
  };

  const handleToggleJobBookmark = (job: JobItem) => {
    const alreadyBookmarked = bookmarkedJobIds.includes(job.id);
    const nextSavedIds = toggleItemSelection(bookmarkedJobIds, job.id);
    setBookmarkedJobIds(nextSavedIds);
    try {
      localStorage.setItem('jobnova_bookmarked_job_ids', JSON.stringify(nextSavedIds));
    } catch {
      // Ignore storage write errors
    }
    showToast(
      alreadyBookmarked
        ? `Removed "${job.title}" at ${job.company} from Saved Jobs.`
        : `Saved "${job.title}" at ${job.company} to Saved Jobs.`
    );
  };

  const persistUserAlerts = (nextAlerts: UserAlertRecord[]) => {
    setUserAlerts(nextAlerts);
    try {
      localStorage.setItem('jobnova_user_alerts', JSON.stringify(nextAlerts));
    } catch {
      // Ignore storage write errors
    }
  };

  const handleRequestBrowserPushPermission = async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      setBrowserPushPermission('unsupported');
      showToast('Browser Notification API is unavailable in this environment; in-app alerts remain active.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPushPermission(permission);
      showToast(
        permission === 'granted'
          ? 'Browser push notifications enabled for UserAlerts!'
          : `Browser push permission is "${permission}". In-app alerts remain active.`
      );
    } catch {
      showToast('Unable to request browser notification permission right now.');
    }
  };

  const handleToggleGetNotified = async (job: JobItem) => {
    const existing = findAlertForJob(userAlerts, job);
    if (existing) {
      const next = userAlerts.filter((a) => a.id !== existing.id);
      persistUserAlerts(next);
      try {
        await fetch(`/api/user-alerts/${encodeURIComponent(existing.id)}`, {
          method: 'DELETE'
        });
      } catch {
        // Ignore network errors
      }
      showToast(`Removed UserAlerts subscription for "${job.title}" skills.`);
      return;
    }

    let currentPermission = browserPushPermission;
    if (
      settings.pushNotifications &&
      typeof window !== 'undefined' &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      try {
        currentPermission = await Notification.requestPermission();
        setBrowserPushPermission(currentPermission);
      } catch {
        // Safe fallback in automated/iframe browsers
      }
    }

    let createdAlert = createUserAlertFromJob({
      job,
      userEmail: user?.email,
      pushEnabled: settings.pushNotifications,
      browserPermission: currentPermission
    });

    try {
      const res = await fetch('/api/user-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          userEmail: user?.email,
          pushEnabled: settings.pushNotifications,
          browserPermission: currentPermission
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.alert) {
          createdAlert = data.alert;
        }
        if (Array.isArray(data?.alerts)) {
          persistUserAlerts(data.alerts);
        } else {
          persistUserAlerts([createdAlert, ...userAlerts]);
        }
      } else {
        persistUserAlerts([createdAlert, ...userAlerts]);
      }
    } catch {
      persistUserAlerts([createdAlert, ...userAlerts]);
    }

    dispatchBrowserPushNotification({
      title: `JobNova Alert Active: ${job.title}`,
      body: `You'll be notified when similar roles (${createdAlert.skills.join(', ')}) are posted.`,
      tag: `jobnova-alert-${createdAlert.id}`,
      enabled: settings.pushNotifications
    });

    showToast(
      `Added to UserAlerts! Watching ${createdAlert.skills.join(', ')} for browser push notifications.`
    );
  };

  const handleDeleteUserAlert = async (alertId: string) => {
    const next = userAlerts.filter((a) => a.id !== alertId);
    persistUserAlerts(next);
    try {
      await fetch(`/api/user-alerts/${encodeURIComponent(alertId)}`, {
        method: 'DELETE'
      });
    } catch {
      // Ignore
    }
    showToast('Removed subscription from UserAlerts.');
  };

  const handleCreateJobAndNotify = async (payload: {
    title: string;
    company: string;
    location: string;
    description: string;
    skills: string;
    type: string;
    ctc: string;
  }) => {
    let createdJob: JobItem | null = null;
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        createdJob = data.job;
      }
    } catch {
      // Fallback below
    }

    if (!createdJob) {
      const nextId = jobs.reduce((max, j) => Math.max(max, j.id), 0) + 1;
      createdJob = { id: nextId, ...payload };
    }

    setJobs((prev) => [createdJob!, ...prev]);
    setSelectedJobId(createdJob.id);

    const matchedAlerts = findMatchingAlertsForNewJob(userAlerts, createdJob);
    if (matchedAlerts.length > 0) {
      const updatedAlerts = recordAlertJobMatches(userAlerts, matchedAlerts, createdJob.id);
      persistUserAlerts(updatedAlerts);
      const sharedSkillsList = Array.from(
        new Set(matchedAlerts.flatMap((m) => m.sharedSkills))
      );

      dispatchBrowserPushNotification({
        title: `New Matching Job: ${createdJob.title} at ${createdJob.company}`,
        body: `Matches your UserAlerts skills (${sharedSkillsList.join(', ')}) · ${createdJob.location} · ${createdJob.ctc || 'Competitive CTC'}`,
        tag: `jobnova-new-job-${createdJob.id}`,
        enabled: settings.pushNotifications
      });

      showToast(
        `Push Notification Triggered: "${createdJob.title}" at ${createdJob.company} matches ${matchedAlerts.length} UserAlert(s) (${sharedSkillsList.join(', ')})!`
      );
    } else {
      showToast(
        `Published "${createdJob.title}" at ${createdJob.company} (no matching UserAlerts skills).`
      );
    }
  };

  const handleUpdateApplicationStage = (
    jobId: number,
    nextStage: ApplicationStage,
    customNote?: string
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;
    setApplicationStageRecords((prev) =>
      updateApplicationStageRecord({
        existingRecords: prev,
        job: targetJob,
        nextStage,
        customNote
      })
    );
    showToast(
      formatApplicationStatusNotification({
        jobTitle: targetJob.title,
        company: targetJob.company,
        nextStage,
        enableEmailNotifications: settings.enableEmailNotifications,
        userEmail: user?.email || DEFAULT_USER_PROFILE.email
      })
    );
  };

  const handleUpdateInterviewSchedule = (
    jobId: number,
    nextScheduledIso: string,
    nextRoundTitle: string
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;
    setApplicationStageRecords((prev) =>
      updateInterviewScheduleRecord({
        existingRecords: prev,
        job: targetJob,
        interviewScheduledAt: nextScheduledIso,
        interviewRoundTitle: nextRoundTitle
      })
    );
    showToast(
      `Scheduled "${nextRoundTitle}" for ${targetJob.title} at ${targetJob.company}.`
    );
  };

  const handleAddInterviewFeedback = (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
  }) => {
    const targetJob = jobs.find((j) => j.id === params.jobId);
    if (!targetJob) return;
    setApplicationStageRecords((prev) =>
      addInterviewFeedbackRecord({
        existingRecords: prev,
        job: targetJob,
        roundTitle: params.roundTitle,
        interviewerOrFormat: params.interviewerOrFormat,
        questionsAsked: params.questionsAsked,
        keyTakeaways: params.keyTakeaways,
        confidenceRating: params.confidenceRating,
        timestamp: 'Just now · Nov 12, 2026'
      })
    );
    showToast(
      `Saved post-interview feedback card ("${params.roundTitle}") for ${targetJob.company}.`
    );
  };

  const handleToggleInternshipApply = (intern: InternshipItem) => {
    const alreadyApplied = appliedInternshipIds.includes(intern.id);
    setAppliedInternshipIds((prev) => toggleItemSelection(prev, intern.id));
    showToast(
      alreadyApplied
        ? `Withdrew internship application at ${intern.company}.`
        : `Applied for ${intern.title} at ${intern.company}!`
    );
  };

  const handleToggleCourseEnroll = (course: CourseItem) => {
    const alreadyEnrolled = enrolledCourseIds.includes(course.id);
    setEnrolledCourseIds((prev) => toggleItemSelection(prev, course.id));
    showToast(
      alreadyEnrolled
        ? `Removed "${course.title}" from your learning list.`
        : `Enrolled in "${course.title}" (${course.provider}).`
    );
  };

  const handleToggleCertTrack = (cert: CertificationItem) => {
    const alreadySaved = savedCertIds.includes(cert.id);
    setSavedCertIds((prev) => toggleItemSelection(prev, cert.id));
    showToast(
      alreadySaved
        ? `Removed "${cert.name}" from tracked certifications.`
        : `Added "${cert.name}" (${cert.issuer}) to your certification roadmap.`
    );
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    try {
      await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: updatedProfile })
      });
    } catch {
      // Local state already updated
    }
  };

  const handleUpdateSettings = async (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
    try {
      localStorage.setItem('jobnova_user_settings', JSON.stringify(updatedSettings));
    } catch {
      // Ignore storage write errors
    }
    try {
      await fetch('/api/user/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: updatedSettings })
      });
    } catch {
      // Local state already updated
    }
  };

  const handleToggleTheme = () => {
    const nextSettings = toggleThemeSetting(settings);
    const isDark = nextSettings.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = nextSettings.theme;
    document.documentElement.style.colorScheme = nextSettings.theme;
    handleUpdateSettings(nextSettings);
    showToast(
      `Switched to ${isDark ? 'Dark Mode' : 'Light Mode'} (Saved in userSettings).`
    );
  };

  const handleLoginProvider = async (provider: 'Google' | 'GitHub') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (activeTab === 'login' || activeTab === 'signup') {
          navigateToTab('home');
        }
        showToast(`Signed in via ${provider} OAuth2 as ${data.user.name}.`);
        return;
      }
    } catch {
      // Fallback
    }
    setUser({
      ...DEFAULT_USER_PROFILE,
      provider
    });
    if (activeTab === 'login' || activeTab === 'signup') {
      navigateToTab('home');
    }
    showToast(`Signed in via ${provider} OAuth2.`);
  };

  const handleEmailLogin = async (credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'Email',
          email: credentials.email,
          password: credentials.password
        })
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated || !data.user) {
        return {
          ok: false,
          error: data?.error || 'Invalid email or password.'
        };
      }
      setUser(data.user);
      navigateToTab('home');
      showToast(`Welcome back, ${data.user.name}!`);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Network error while signing in. Please try again.'
      };
    }
  };

  const handleSignUp = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    trackId: string;
    location: string;
    acceptTerms: boolean;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.authenticated || !data.user) {
        return {
          ok: false,
          error: data?.error || 'Unable to create your account.'
        };
      }
      setUser(data.user);
      navigateToTab('home');
      showToast(`Account created for ${data.user.name}! Welcome to JobNova.`);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Network error while creating your account. Please try again.'
      };
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    navigateToTab('login');
    showToast('Signed out of JobNova session.');
  };

  // Filtered & sorted collections
  const filteredJobs = filterJobsList(jobs, {
    query: jobSkillQuery,
    locationFilter: jobLocationFilter,
    onlySaved: showSavedJobsOnly,
    savedJobIds: bookmarkedJobIds
  });
  const sortedJobs = sortJobsList(filteredJobs, {
    sortBy: jobSortBy,
    userSkills: user?.skills || DEFAULT_USER_PROFILE.skills,
    expectedMinLpa: settings.expectedSalaryMinLpa,
    expectedMaxLpa: settings.expectedSalaryMaxLpa
  });
  const filteredInternships = filterInternships(internships, internQuery, internLocationFilter);
  const filteredCourses = filterCourses(courses, courseQuery, courseProviderFilter);
  const filteredCertifications = filterCertifications(certifications, certQuery, certIssuerFilter);

  const activeSelectedJob =
    sortedJobs.find((j) => j.id === selectedJobId) || sortedJobs[0] || null;

  const activeSelectedJobBreakdown = activeSelectedJob
    ? computeJobMatchBreakdown({
        job: activeSelectedJob,
        userSkills: user?.skills || DEFAULT_USER_PROFILE.skills,
        expectedMinLpa: settings.expectedSalaryMinLpa,
        expectedMaxLpa: settings.expectedSalaryMaxLpa
      })
    : null;

  const careerStats = computeCareerStats({
    jobs,
    userSkills: user?.skills || DEFAULT_USER_PROFILE.skills,
    appliedJobIds,
    appliedInternshipIds,
    enrolledCourseIds,
    savedCertIds
  });

  const jobLocations = ['ALL', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Mumbai', 'Noida', 'Remote'];
  const coreStackFilters = [
    { label: 'All Stack', value: '' },
    { label: 'Python', value: 'python' },
    { label: 'GenAI / LLM', value: 'genai' },
    { label: 'Java', value: 'java' },
    { label: 'Spring Boot', value: 'springboot' },
    { label: 'Golang', value: 'golang' },
    { label: 'Rust', value: 'rust' },
    { label: 'React.js', value: 'react' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'AWS Cloud', value: 'aws' },
    { label: 'Kubernetes', value: 'kubernetes' },
    { label: 'Data / Spark', value: 'spark' },
    { label: 'SQL / Postgres', value: 'sql' },
    { label: 'QA / Automation', value: 'testing' },
    { label: 'Cybersecurity', value: 'cybersecurity' }
  ];
  const courseProviders = ['ALL', 'Coursera', 'Udemy', 'Google', 'edX', 'DeepLearning.AI', 'Amazon AWS', 'Microsoft Learn'];
  const certIssuers = ['ALL', 'Oracle', 'Amazon', 'Google', 'Microsoft', 'Coursera', 'IBM', 'VMware', 'CNCF', 'HashiCorp', 'Databricks'];

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJobSkillQuery(heroWhatQuery);
    setJobLocationFilter(heroWhereLocation);
    setActiveTab('jobs');
  };

  const handleCopyLinkedInPost = (
    shareKey: string,
    payload: Parameters<typeof generateLinkedInShareText>[0]
  ) => {
    const shareText = generateLinkedInShareText(payload);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedShareKey(shareKey);
    setTimeout(() => setCopiedShareKey(null), 2000);
    showToast(`Copied LinkedIn broadcast post for ${payload.title} at ${payload.company}!`);
  };

  const handleCopyJobLink = (job: JobItem, targetUrl: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(targetUrl).catch(() => {});
    } else if (typeof document !== 'undefined') {
      const tempInput = document.createElement('textarea');
      tempInput.value = targetUrl;
      tempInput.setAttribute('readonly', '');
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();
      try {
        document.execCommand('copy');
      } catch {
        // Ignore fallback copy failure in restricted contexts
      }
      document.body.removeChild(tempInput);
    }

    if (copyLinkTimerRef.current) clearTimeout(copyLinkTimerRef.current);
    if (shareMenuCloseTimerRef.current) clearTimeout(shareMenuCloseTimerRef.current);

    setCopiedJobLinkId(job.id);
    showToast(`Copied share link for ${job.title} at ${job.company}!`);

    // Keep menu open briefly so the checked icon animation is clearly visible before closing
    shareMenuCloseTimerRef.current = setTimeout(() => {
      setIsShareMenuOpen(false);
      shareMenuCloseTimerRef.current = null;
    }, 950);

    copyLinkTimerRef.current = setTimeout(() => {
      setCopiedJobLinkId((current) => (current === job.id ? null : current));
      copyLinkTimerRef.current = null;
    }, 2400);
  };

  const getCompanyMonogram = (company: string) => {
    const c = company.toLowerCase();
    if (c.includes('google')) {
      return {
        initials: 'G',
        className: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
      };
    }
    if (c.includes('amazon')) {
      return {
        initials: 'AM',
        className: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      };
    }
    if (c.includes('zoho') || c.includes('technova')) {
      return {
        initials: company.slice(0, 2).toUpperCase(),
        className: 'bg-emerald-50 dark:bg-emerald-950/50 text-[#087F31] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      };
    }
    return {
      initials: company.slice(0, 2).toUpperCase(),
      className: 'bg-blue-50 dark:bg-blue-950/50 text-[#2557A7] dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-[#f5f6f8] dark:bg-slate-950 text-slate-900 dark:text-slate-100 theme-transition-surface transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        userName={user?.name}
        onLogout={handleLogout}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="no-print fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white shadow-lg border border-slate-700 text-sm sm:max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* ==================== 1. HOME / OVERVIEW MARKETPLACE VIEW ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Indeed / Glassdoor Unified Career Search Hero */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2557A7] dark:text-blue-400">
                    JobNova Career &amp; Compensation Marketplace · India Engineering Roles
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    Find engineering roles, internships, and verified salary benchmarks
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-100">{user ? user.name : 'Student Explorer'}</span>. Search verified roles across Python, GenAI/LLM, Java, Spring Boot, Go, Rust, React, Cloud/DevOps, Data Engineering &amp; Cybersecurity and manage your active application pipeline.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2557A7] dark:text-blue-400" />
                    <span>Mock Interview &amp; Cheat Sheet</span>
                  </button>
                  <button
                    type="button"
                    data-testid="overview-resume-builder-btn"
                    onClick={() => setActiveTab('resume')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <FileDown className="w-3.5 h-3.5 text-[#2557A7] dark:text-blue-400" />
                    <span>Resume Builder &amp; PDF</span>
                  </button>
                </div>
              </div>

              {/* Authentic Two-Input Marketplace Search Bar (What + Where + Find Jobs) */}
              <form
                onSubmit={handleHeroSearchSubmit}
                data-testid="hero-search-form"
                className="flex flex-col md:flex-row items-stretch rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-hidden focus-within:border-[#2557A7] focus-within:ring-1 focus-within:ring-[#2557A7]"
              >
                <div className="flex-1 flex items-center gap-2.5 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    What
                  </span>
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-what-input" className="sr-only">
                    Job title, skill, or company
                  </label>
                  <input
                    id="hero-what-input"
                    data-testid="hero-what-input"
                    type="text"
                    value={heroWhatQuery}
                    onChange={(e) => setHeroWhatQuery(e.target.value)}
                    placeholder="Job title, skill (Python, GenAI, Java, Go, React, AWS), or company"
                    className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="md:w-64 flex items-center gap-2.5 px-4 py-3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    Where
                  </span>
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <label htmlFor="hero-where-select" className="sr-only">
                    Select job location
                  </label>
                  <select
                    id="hero-where-select"
                    data-testid="hero-where-select"
                    value={heroWhereLocation}
                    onChange={(e) => setHeroWhereLocation(e.target.value)}
                    className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {jobLocations.map((loc) => (
                      <option
                        key={loc}
                        value={loc}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        {loc === 'ALL' ? 'All India & Remote' : loc}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  data-testid="hero-find-jobs-btn"
                  className="px-6 py-3 text-sm font-bold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Find Jobs
                </button>
              </form>

              {/* Quick Tech Stack Filter Links */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Popular searches:
                </span>
                {coreStackFilters.slice(1).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setJobSkillQuery(item.value);
                      setJobLocationFilter('ALL');
                      setActiveTab('jobs');
                    }}
                    className="px-2.5 py-1 font-mono font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Flat Hairline-Divided 4-Metric Pipeline Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-5">
                <div className="py-2 sm:py-0 sm:pr-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Target CTC
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[#087F31] dark:text-emerald-400 mt-0.5">
                    ₹{settings.expectedSalaryMinLpa}–{settings.expectedSalaryMaxLpa} LPA
                  </div>
                </div>
                <div className="py-2 sm:py-0 sm:px-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Matched Roles
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-[#2557A7] dark:text-blue-400 mt-0.5">
                    {careerStats.matchedJobsCount} Roles
                  </div>
                </div>
                <div className="py-2 sm:py-0 sm:px-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    In Pipeline
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {appliedJobIds.length + appliedInternshipIds.length} Applied
                  </div>
                </div>
                <div className="py-2 sm:py-0 sm:pl-5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Learning &amp; Certs
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {enrolledCourseIds.length} Active · {savedCertIds.length} Certs
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Core Platform Channel Tiles */}
            <section aria-label="Platform Modules" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Module 1: Jobs */}
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#2557A7] dark:text-blue-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#2557A7] dark:text-blue-400 tabular-nums">
                      {jobs.length} Roles
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2557A7] dark:group-hover:text-blue-400 flex items-center justify-between">
                    <span>Full-Time Jobs</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2557A7] dark:group-hover:text-blue-400" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Software engineer roles across TCS, Infosys, Google India, Amazon &amp; Zoho with verified CTC ranges.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{appliedJobIds.length} applied</span>
                  <span className="text-[#2557A7] dark:text-blue-400 font-semibold group-hover:underline">Browse roles</span>
                </div>
              </button>

              {/* Module 2: Internships */}
              <button
                type="button"
                onClick={() => setActiveTab('internships')}
                className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#087F31] dark:hover:border-emerald-500 rounded-xl p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#087F31] dark:text-emerald-400 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#087F31] dark:text-emerald-400 tabular-nums">
                      {internships.length} Open
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#087F31] dark:group-hover:text-emerald-400 flex items-center justify-between">
                    <span>Internships</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#087F31] dark:group-hover:text-emerald-400" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Summer &amp; winter student internships in GenAI/LLM, Go, Python Data, Full-Stack, Cloud &amp; QA with stipends.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{appliedInternshipIds.length} applied</span>
                  <span className="text-[#087F31] dark:text-emerald-400 font-semibold group-hover:underline">Explore offers</span>
                </div>
              </button>

              {/* Module 3: Learning Courses */}
              <button
                type="button"
                onClick={() => setActiveTab('learning')}
                className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
                      {courses.length} Courses
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2557A7] dark:group-hover:text-blue-400 flex items-center justify-between">
                    <span>Learning Tracks</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2557A7] dark:group-hover:text-blue-400" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Structured engineering tracks from Coursera, Udemy, Google, edX, and Microsoft Learn.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{enrolledCourseIds.length} enrolled</span>
                  <span className="text-[#2557A7] dark:text-blue-400 font-semibold group-hover:underline">Start learning</span>
                </div>
              </button>

              {/* Module 4: Certifications */}
              <button
                type="button"
                onClick={() => setActiveTab('certifications')}
                className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                      {certifications.length} Certs
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2557A7] dark:group-hover:text-blue-400 flex items-center justify-between">
                    <span>Certifications</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#2557A7] dark:group-hover:text-blue-400" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Industry credentials from AWS, Google Cloud, Oracle, Microsoft, CNCF Kubernetes, HashiCorp &amp; Databricks.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{savedCertIds.length} tracked</span>
                  <span className="text-[#2557A7] dark:text-blue-400 font-semibold group-hover:underline">View credentials</span>
                </div>
              </button>
            </section>

            {/* Personalized Alerts: Skill-Driven Job & Internship Recommendations */}
            <PersonalizedAlertsCard
              userSkills={user?.skills || DEFAULT_USER_PROFILE.skills}
              skillProficiencies={user?.skillProficiencies}
              jobs={jobs}
              internships={internships}
              appliedJobIds={appliedJobIds}
              appliedInternshipIds={appliedInternshipIds}
              onApplyJob={handleToggleJobApply}
              onApplyInternship={handleToggleInternshipApply}
              onNavigateToJobs={(skillKeyword) => {
                if (skillKeyword) {
                  setJobSkillQuery(skillKeyword);
                }
                setActiveTab('jobs');
              }}
              onNavigateToInternships={(skillKeyword) => {
                if (skillKeyword) {
                  setInternQuery(skillKeyword);
                }
                setActiveTab('internships');
              }}
              onNavigateToProfile={() => setActiveTab('profile')}
            />

            {/* Recharts Skill Proficiency Radar Chart vs Saved Job Roles */}
            <SkillProficiencyRadarCard
              userSkills={user?.skills || DEFAULT_USER_PROFILE.skills}
              jobs={jobs}
              savedJobIds={appliedJobIds}
              enrolledCourseIds={enrolledCourseIds}
              savedCertIds={savedCertIds}
              isDarkMode={settings.theme === 'dark'}
              onNavigateToLearning={(skillKeyword) => {
                if (skillKeyword) {
                  setCourseQuery(skillKeyword);
                }
                setActiveTab('learning');
              }}
            />

            {/* Career Timeline Component: Visualizes Job Application Stages & Status Updates */}
            <CareerTimelineCard
              jobs={jobs}
              appliedJobIds={appliedJobIds}
              stageRecords={applicationStageRecords}
              onUpdateStage={handleUpdateApplicationStage}
              onUpdateInterviewSchedule={handleUpdateInterviewSchedule}
              onAddInterviewFeedback={handleAddInterviewFeedback}
              onExploreJobs={() => setActiveTab('jobs')}
            />

            {/* Featured Matched Jobs Preview */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Top Roles Matching Your Profile Skills
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Matched <span className="font-mono font-semibold tabular-nums text-[#2557A7] dark:text-blue-400">{careerStats.matchedJobsCount}</span> of <span className="font-mono tabular-nums">{jobs.length}</span> open roles · Profile stack: <span className="font-mono text-slate-700 dark:text-slate-300">{(user?.skills || DEFAULT_USER_PROFILE.skills).join(' · ')}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>View all {jobs.length} jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.slice(0, 6).map((job) => {
                  const isApplied = appliedJobIds.includes(job.id);
                  const isBookmarked = bookmarkedJobIds.includes(job.id);
                  const badge = getCompanyMonogram(job.company);
                  const skillsList = job.skills.split(',').map((s) => s.trim()).filter(Boolean);
                  const linkedInUrl = buildLinkedInShareUrl({
                    title: job.title,
                    company: job.company,
                    type: 'job',
                    location: job.location,
                    ctc: job.ctc,
                    skills: job.skills
                  });

                  return (
                    <article
                      key={job.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                              {badge.initials}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                                {job.company}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {job.ctc && (
                              <span className="text-xs font-mono font-bold text-[#087F31] dark:text-emerald-400 tabular-nums">
                                {job.ctc}
                              </span>
                            )}
                            <button
                              type="button"
                              data-testid={`overview-bookmark-btn-${job.id}`}
                              onClick={() => handleToggleJobBookmark(job)}
                              aria-pressed={isBookmarked}
                              aria-label={
                                isBookmarked
                                  ? `Remove ${job.title} at ${job.company} from Saved Jobs`
                                  : `Save ${job.title} at ${job.company}`
                              }
                              title={isBookmarked ? 'Saved to Saved Jobs' : 'Save job for later'}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isBookmarked
                                  ? 'border-[#2557A7] bg-blue-50 text-[#2557A7] dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-400'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                              }`}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                              />
                            </button>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setActiveTab('jobs');
                            }}
                            className="text-left text-base font-bold text-slate-900 dark:text-slate-100 hover:text-[#2557A7] dark:hover:text-blue-400 cursor-pointer"
                          >
                            {job.title}
                          </button>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {skillsList.join(' · ')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#2557A7] dark:hover:text-blue-400"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share on LinkedIn</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleJobApply(job)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isApplied
                              ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                              : 'bg-[#2557A7] text-white hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500'
                          }`}
                        >
                          {isApplied ? 'Applied ✓' : 'Apply Now'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ==================== 2. JOBS EXPLORER VIEW (INDEED / GLASSDOOR MASTER-DETAIL SPLIT) ==================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Explore Engineering Jobs
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Showing <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">{sortedJobs.length}</span> of <span className="font-mono tabular-nums">{jobs.length}</span> open roles · Click any listing to inspect compensation &amp; skill match
                  </p>
                </div>

                {/* Search Input, Sort Selector & Saved/Alerts Toggles */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative flex-1 min-w-[200px] sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <label htmlFor="job-skill-search" className="sr-only">
                      Search jobs by skill, title, or company
                    </label>
                    <input
                      id="job-skill-search"
                      type="text"
                      value={jobSkillQuery}
                      onChange={(e) => setJobSkillQuery(e.target.value)}
                      placeholder="Job title, skill (Python, GenAI, Go, Java, AWS, SQL), or company..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>

                  <div>
                    <label htmlFor="job-sort-select" className="sr-only">
                      Sort jobs by
                    </label>
                    <select
                      id="job-sort-select"
                      data-testid="jobs-sort-select"
                      aria-label="Sort jobs by"
                      value={jobSortBy}
                      onChange={(e) => {
                        const nextSort = e.target.value as JobSortOption;
                        setJobSortBy(nextSort);
                        const nextList = sortJobsList(filteredJobs, {
                          sortBy: nextSort,
                          userSkills: user?.skills || DEFAULT_USER_PROFILE.skills,
                          expectedMinLpa: settings.expectedSalaryMinLpa,
                          expectedMaxLpa: settings.expectedSalaryMaxLpa
                        });
                        if (nextList.length > 0) {
                          setSelectedJobId(nextList[0].id);
                        }
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2557A7] cursor-pointer"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="match-desc">Sort: Best Skill Match</option>
                      <option value="ctc-desc">Sort: Highest Salary (LPA)</option>
                      <option value="ctc-asc">Sort: Entry Salary (Low-High)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    data-testid="jobs-saved-filter-toggle"
                    aria-pressed={showSavedJobsOnly}
                    onClick={() => setShowSavedJobsOnly((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      showSavedJobsOnly
                        ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${showSavedJobsOnly ? 'fill-current' : ''}`}
                    />
                    <span>Saved Jobs</span>
                    <span
                      data-testid="jobs-saved-count-badge"
                      className={`px-1.5 py-0.5 text-[11px] font-mono rounded ${
                        showSavedJobsOnly
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {bookmarkedJobIds.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-testid="jobs-alerts-toggle"
                    aria-pressed={isAlertsPanelOpen}
                    onClick={() => setIsAlertsPanelOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isAlertsPanelOpen
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>UserAlerts</span>
                    <span
                      data-testid="jobs-alerts-count-badge"
                      className={`px-1.5 py-0.5 text-[11px] font-mono rounded ${
                        isAlertsPanelOpen
                          ? 'bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {userAlerts.length}
                    </span>
                  </button>

                  {(jobSkillQuery || jobLocationFilter !== 'ALL' || showSavedJobsOnly || jobSortBy !== 'featured') && (
                    <button
                      type="button"
                      data-testid="jobs-reset-filters-btn"
                      onClick={() => {
                        setJobSkillQuery('');
                        setJobLocationFilter('ALL');
                        setShowSavedJobsOnly(false);
                        setJobSortBy('featured');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Stack & Location Filter Rows */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter jobs by core tech stack">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                    Tech Stack:
                  </span>
                  {coreStackFilters.map((stack) => (
                    <button
                      key={stack.label}
                      type="button"
                      onClick={() => setJobSkillQuery(stack.value)}
                      className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        jobSkillQuery.toLowerCase() === stack.value
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {stack.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter jobs by location">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
                    Location:
                  </span>
                  {jobLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setJobLocationFilter(loc)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        jobLocationFilter === loc
                          ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7]'
                      }`}
                    >
                      {loc === 'ALL' ? 'All Locations' : loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {isAlertsPanelOpen && (
              <UserAlertsPanel
                alerts={userAlerts}
                activeJob={activeSelectedJob}
                browserPermission={browserPushPermission}
                onRequestBrowserPermission={handleRequestBrowserPushPermission}
                onDeleteAlert={handleDeleteUserAlert}
                onCreateJobAndNotify={handleCreateJobAndNotify}
                onClose={() => setIsAlertsPanelOpen(false)}
              />
            )}

            {sortedJobs.length === 0 ? (
              <div
                data-testid="jobs-empty-state"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3"
              >
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {showSavedJobsOnly && bookmarkedJobIds.length === 0
                    ? 'You have no saved jobs yet. Click the bookmark icon on any job card to save it for later.'
                    : showSavedJobsOnly
                    ? `No saved jobs match "${jobSkillQuery || 'all skills'}" in ${jobLocationFilter === 'ALL' ? 'any location' : jobLocationFilter}.`
                    : `No jobs match "${jobSkillQuery}" in ${jobLocationFilter === 'ALL' ? 'any location' : jobLocationFilter}`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {showSavedJobsOnly && (
                    <button
                      type="button"
                      data-testid="jobs-show-all-btn"
                      onClick={() => setShowSavedJobsOnly(false)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] rounded-lg cursor-pointer"
                    >
                      Browse All Jobs
                    </button>
                  )}
                  {(jobSkillQuery || jobLocationFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setJobSkillQuery('');
                        setJobLocationFilter('ALL');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      Reset Job Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Master-Detail Split Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Job Feed List */}
                <div
                  className="lg:col-span-5 space-y-3"
                  role="list"
                  aria-label="Job listings feed"
                >
                  {sortedJobs.map((job) => {
                    const isSelected = activeSelectedJob?.id === job.id;
                    const isApplied = appliedJobIds.includes(job.id);
                    const isBookmarked = bookmarkedJobIds.includes(job.id);
                    const badge = getCompanyMonogram(job.company);
                    const skillsList = job.skills.split(',').map((s) => s.trim()).filter(Boolean);
                    const breakdown = computeJobMatchBreakdown({
                      job,
                      userSkills: user?.skills || DEFAULT_USER_PROFILE.skills,
                      expectedMinLpa: settings.expectedSalaryMinLpa,
                      expectedMaxLpa: settings.expectedSalaryMaxLpa
                    });

                    return (
                      <article
                        key={job.id}
                        role="listitem"
                        data-testid={`job-list-card-${job.id}`}
                        className={`relative bg-white dark:bg-slate-900 rounded-xl border p-4 ${
                          isSelected
                            ? 'border-[#2557A7] ring-1 ring-[#2557A7] dark:border-blue-500 dark:ring-blue-500'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          data-testid={`job-card-bookmark-btn-${job.id}`}
                          onClick={() => handleToggleJobBookmark(job)}
                          aria-pressed={isBookmarked}
                          aria-label={
                            isBookmarked
                              ? `Remove ${job.title} at ${job.company} from Saved Jobs`
                              : `Save ${job.title} at ${job.company}`
                          }
                          title={isBookmarked ? 'Saved to Saved Jobs' : 'Save job for later'}
                          className={`absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isBookmarked
                              ? 'border-[#2557A7] bg-blue-50 text-[#2557A7] dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          aria-pressed={isSelected}
                          className="w-full text-left space-y-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2557A7] rounded"
                        >
                          <div className="flex items-start justify-between gap-2 pr-10">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                                {badge.initials}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                                  {job.company}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{job.location}</span>
                                </span>
                              </div>
                            </div>

                            {isApplied && (
                              <span className="text-xs font-semibold text-[#087F31] dark:text-emerald-400 shrink-0 whitespace-nowrap">
                                Applied ✓
                              </span>
                            )}
                          </div>

                          <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {job.title}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs mt-1">
                              {job.ctc && (
                                <span className="font-mono font-bold text-[#087F31] dark:text-emerald-400 tabular-nums">
                                  {job.ctc}
                                </span>
                              )}
                              <span className="text-slate-400" aria-hidden="true">·</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {job.type || 'Full-Time'}
                              </span>
                              <span className="text-slate-400" aria-hidden="true">·</span>
                              <span className="font-mono font-semibold text-[#2557A7] dark:text-blue-400 tabular-nums">
                                {breakdown.matchPercent}% match
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>

                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
                            {skillsList.join(' · ')}
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>

                {/* Right Column: Sticky Job Detail Inspector Pane */}
                {activeSelectedJob && activeSelectedJobBreakdown && (
                  <aside
                    data-testid="job-detail-pane"
                    aria-label={`Job details for ${activeSelectedJob.title} at ${activeSelectedJob.company}`}
                    className="lg:col-span-7 lg:sticky lg:top-20 lg:z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-visible"
                  >
                    {/* Sticky Header inside Detail Pane */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${
                              getCompanyMonogram(activeSelectedJob.company).className
                            }`}
                          >
                            {getCompanyMonogram(activeSelectedJob.company).initials}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {activeSelectedJob.company}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                <span>{activeSelectedJob.location}</span>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{activeSelectedJob.type || 'Full-Time Engineering'}</span>
                            </div>
                          </div>
                        </div>

                        {activeSelectedJob.ctc && (
                          <div className="text-right shrink-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Compensation
                            </div>
                            <div className="text-lg font-extrabold font-mono text-[#087F31] dark:text-emerald-400 tabular-nums">
                              {activeSelectedJob.ctc}
                            </div>
                          </div>
                        )}
                      </div>

                      <h2
                        data-testid="job-detail-title"
                        className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight"
                      >
                        {activeSelectedJob.title}
                      </h2>

                      {/* Compensation & Profile Match Strip */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="font-mono font-bold text-[#2557A7] dark:text-blue-400 tabular-nums">
                          {activeSelectedJobBreakdown.matchPercent}% Profile Skill Match
                        </span>
                        <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">|</span>
                        <span
                          className={`font-semibold ${
                            activeSelectedJobBreakdown.salaryRelation === 'below'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-[#087F31] dark:text-emerald-400'
                          }`}
                        >
                          {activeSelectedJobBreakdown.salaryRelation === 'above'
                            ? `Above your ₹${settings.expectedSalaryMinLpa}–${settings.expectedSalaryMaxLpa} LPA target`
                            : activeSelectedJobBreakdown.salaryRelation === 'within'
                            ? `Within your ₹${settings.expectedSalaryMinLpa}–${settings.expectedSalaryMaxLpa} LPA target`
                            : activeSelectedJobBreakdown.salaryRelation === 'below'
                            ? `Below your ₹${settings.expectedSalaryMinLpa} LPA minimum target`
                            : 'Verified Compensation Package'}
                        </span>
                      </div>

                      {/* Primary Action Bar */}
                      {(() => {
                        const sharePayload = {
                          title: activeSelectedJob.title,
                          company: activeSelectedJob.company,
                          type: 'job' as const,
                          location: activeSelectedJob.location,
                          ctc: activeSelectedJob.ctc,
                          skills: activeSelectedJob.skills
                        };
                        const shareLinks = buildJobShareLinks(sharePayload);

                        return (
                          <div className="flex flex-wrap items-center gap-2.5 pt-1">
                            <button
                              type="button"
                              data-testid="job-detail-apply-btn"
                              onClick={() => handleToggleJobApply(activeSelectedJob)}
                              aria-label={
                                appliedJobIds.includes(activeSelectedJob.id)
                                  ? `Withdraw application for ${activeSelectedJob.title} at ${activeSelectedJob.company}`
                                  : `Apply Now for ${activeSelectedJob.title} at ${activeSelectedJob.company}`
                              }
                              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                appliedJobIds.includes(activeSelectedJob.id)
                                  ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                                  : 'bg-[#2557A7] text-white hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500'
                              }`}
                            >
                              {appliedJobIds.includes(activeSelectedJob.id) ? 'Applied ✓' : 'Apply Now'}
                            </button>

                            <button
                              type="button"
                              data-testid="job-detail-bookmark-btn"
                              aria-pressed={bookmarkedJobIds.includes(activeSelectedJob.id)}
                              aria-label={
                                bookmarkedJobIds.includes(activeSelectedJob.id)
                                  ? `Remove ${activeSelectedJob.title} at ${activeSelectedJob.company} from Saved Jobs`
                                  : `Save ${activeSelectedJob.title} at ${activeSelectedJob.company}`
                              }
                              onClick={() => handleToggleJobBookmark(activeSelectedJob)}
                              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                bookmarkedJobIds.includes(activeSelectedJob.id)
                                  ? 'border-[#2557A7] bg-blue-50 text-[#2557A7] dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                              }`}
                            >
                              <Bookmark
                                className={`w-3.5 h-3.5 ${
                                  bookmarkedJobIds.includes(activeSelectedJob.id)
                                    ? 'fill-current'
                                    : ''
                                }`}
                              />
                              <span>
                                {bookmarkedJobIds.includes(activeSelectedJob.id)
                                  ? 'Saved'
                                  : 'Save'}
                              </span>
                            </button>

                            {(() => {
                              const existingAlert = findAlertForJob(userAlerts, activeSelectedJob);
                              const isAlerted = Boolean(existingAlert);
                              return (
                                <button
                                  type="button"
                                  data-testid="job-detail-get-notified-btn"
                                  aria-pressed={isAlerted}
                                  aria-label={
                                    isAlerted
                                      ? `Unsubscribe from alerts for ${activeSelectedJob.title} skills`
                                      : `Get notified for new jobs with skills like ${activeSelectedJob.skills}`
                                  }
                                  onClick={() => handleToggleGetNotified(activeSelectedJob)}
                                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                    isAlerted
                                      ? 'border-[#087F31] bg-emerald-50 text-[#087F31] dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                                  }`}
                                >
                                  {isAlerted ? (
                                    <>
                                      <BellRing className="w-3.5 h-3.5" />
                                      <span>Notified ✓</span>
                                    </>
                                  ) : (
                                    <>
                                      <Bell className="w-3.5 h-3.5" />
                                      <span>Get Notified</span>
                                    </>
                                  )}
                                </button>
                              );
                            })()}

                            <a
                              data-testid="job-detail-linkedin-share"
                              href={shareLinks.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Share on LinkedIn</span>
                            </a>

                            <button
                              type="button"
                              data-testid="job-detail-copy-post-btn"
                              onClick={() =>
                                handleCopyLinkedInPost(`job-${activeSelectedJob.id}`, sharePayload)
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              {copiedShareKey === `job-${activeSelectedJob.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#087F31] dark:text-emerald-400" />
                                  <span>Copied Post</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Post</span>
                                </>
                              )}
                            </button>

                            {/* Share Icon + Multi-Channel Dropdown Menu */}
                            {(() => {
                              const copyLinkFeedback = getCopyLinkFeedbackMeta({
                                copiedJobLinkId,
                                jobId: activeSelectedJob.id,
                                jobTitle: activeSelectedJob.title
                              });

                              return (
                                <div ref={shareMenuRef} className="relative">
                                  <button
                                    type="button"
                                    data-testid="job-detail-share-btn"
                                    aria-haspopup="menu"
                                    aria-expanded={isShareMenuOpen}
                                    aria-label="Share job via Twitter, WhatsApp, Email, or LinkedIn"
                                    onClick={() => {
                                      if (shareMenuCloseTimerRef.current) {
                                        clearTimeout(shareMenuCloseTimerRef.current);
                                        shareMenuCloseTimerRef.current = null;
                                      }
                                      setIsShareMenuOpen((prev) => !prev);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                      copyLinkFeedback.isCopied
                                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-[#087F31] dark:text-emerald-300'
                                        : isShareMenuOpen
                                        ? 'border-[#2557A7] bg-blue-50 text-[#2557A7] dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-300'
                                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400'
                                    }`}
                                  >
                                    {copyLinkFeedback.isCopied ? (
                                      <Check className="w-3.5 h-3.5 text-[#087F31] dark:text-emerald-400 animate-share-check-pop" />
                                    ) : (
                                      <Share2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>{copyLinkFeedback.isCopied ? 'Link Copied' : 'Share'}</span>
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                        isShareMenuOpen ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>

                                  {isShareMenuOpen && (
                                    <div
                                      role="menu"
                                      data-testid="job-detail-share-menu"
                                      aria-label={`Share ${activeSelectedJob.title} at ${activeSelectedJob.company}`}
                                      className="absolute left-0 top-full mt-2 w-56 sm:w-60 z-30 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1.5"
                                    >
                                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                          Share Job Listing
                                        </span>
                                      </div>

                                      <a
                                        role="menuitem"
                                        data-testid="share-option-twitter"
                                        href={shareLinks.twitterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                          setIsShareMenuOpen(false);
                                          showToast(`Opening Twitter / X share for ${activeSelectedJob.title}`);
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          aria-hidden="true"
                                          className="w-3.5 h-3.5 shrink-0 text-slate-900 dark:text-slate-100"
                                        >
                                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        <span className="flex-1">Share via Twitter / X</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                      </a>

                                      <a
                                        role="menuitem"
                                        data-testid="share-option-whatsapp"
                                        href={shareLinks.whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                          setIsShareMenuOpen(false);
                                          showToast(`Opening WhatsApp share for ${activeSelectedJob.title}`);
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#087F31] dark:hover:text-emerald-400 transition-colors"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          aria-hidden="true"
                                          className="w-3.5 h-3.5 shrink-0 text-[#087F31] dark:text-emerald-400"
                                        >
                                          <path d="M12.03 2a9.97 9.97 0 0 0-8.65 14.94L2 22l5.2-1.36A9.97 9.97 0 1 0 12.03 2Zm5.82 14.12c-.25.7-1.44 1.34-1.99 1.41-.51.07-1.15.1-1.85-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.29-5.06-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.25.6.84 2.06.91 2.21.08.15.13.33.03.53-.1.2-.15.33-.3.5-.15.18-.32.4-.45.54-.15.15-.31.31-.13.61.18.3.78 1.29 1.68 2.09 1.15 1.03 2.13 1.35 2.43 1.5.3.15.48.13.66-.07.18-.2.76-.89.96-1.19.2-.3.4-.25.68-.15.28.1 1.76.83 2.06.98.3.15.5.23.58.35.07.13.07.73-.18 1.43Z" />
                                        </svg>
                                        <span className="flex-1">Share via WhatsApp</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                      </a>

                                      <a
                                        role="menuitem"
                                        data-testid="share-option-email"
                                        href={shareLinks.emailUrl}
                                        onClick={() => {
                                          setIsShareMenuOpen(false);
                                          showToast(`Opening email draft for ${activeSelectedJob.title}`);
                                        }}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors"
                                      >
                                        <Mail className="w-3.5 h-3.5 shrink-0 text-[#2557A7] dark:text-blue-400" />
                                        <span className="flex-1">Share via Email</span>
                                      </a>

                                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                      <a
                                        role="menuitem"
                                        data-testid="share-option-linkedin"
                                        href={shareLinks.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setIsShareMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors"
                                      >
                                        <svg
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          aria-hidden="true"
                                          className="w-3.5 h-3.5 shrink-0 text-[#0A66C2] dark:text-blue-400"
                                        >
                                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
                                        </svg>
                                        <span className="flex-1">Share on LinkedIn</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                      </a>

                                      <button
                                        type="button"
                                        role="menuitem"
                                        data-testid="share-option-copy-linkedin"
                                        onClick={() => {
                                          setIsShareMenuOpen(false);
                                          handleCopyLinkedInPost(`job-${activeSelectedJob.id}`, sharePayload);
                                        }}
                                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                        <span className="flex-1">Copy LinkedIn Post</span>
                                      </button>

                                      <button
                                        type="button"
                                        role="menuitem"
                                        data-testid="share-option-copy-link"
                                        data-copied={copyLinkFeedback.isCopied ? 'true' : 'false'}
                                        aria-label={copyLinkFeedback.ariaLabel}
                                        onClick={() => handleCopyJobLink(activeSelectedJob, shareLinks.targetUrl)}
                                        className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors duration-200 cursor-pointer ${
                                          copyLinkFeedback.isCopied
                                            ? 'bg-emerald-50/90 dark:bg-emerald-950/50 text-[#087F31] dark:text-emerald-300'
                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2557A7] dark:hover:text-blue-400'
                                        }`}
                                      >
                                        <span
                                          className={`relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                            copyLinkFeedback.isCopied
                                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-[#087F31] dark:text-emerald-300 animate-share-confirm-pulse'
                                              : 'bg-transparent text-slate-500 dark:text-slate-400'
                                          }`}
                                        >
                                          <Link2
                                            className={`w-3.5 h-3.5 transition-all duration-200 ${
                                              copyLinkFeedback.isCopied
                                                ? 'opacity-0 scale-50 -rotate-12'
                                                : 'opacity-100 scale-100 rotate-0'
                                            }`}
                                          />
                                          {copyLinkFeedback.isCopied && (
                                            <Check
                                              data-testid="share-copy-link-check-icon"
                                              className="w-3.5 h-3.5 absolute inset-0 m-auto text-[#087F31] dark:text-emerald-400 animate-share-check-pop"
                                              strokeWidth={2.5}
                                            />
                                          )}
                                        </span>
                                        <span className="flex-1 transition-colors duration-200">
                                          {copyLinkFeedback.label}
                                        </span>
                                        {copyLinkFeedback.statusTag && (
                                          <span
                                            data-testid="share-copy-link-status"
                                            className="text-[10px] font-semibold uppercase tracking-wider text-[#087F31] dark:text-emerald-400"
                                          >
                                            {copyLinkFeedback.statusTag}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {(() => {
                              const activeAlert = findAlertForJob(userAlerts, activeSelectedJob);
                              if (!activeAlert) return null;
                              return (
                                <div
                                  data-testid="job-detail-alert-status"
                                  className="w-full mt-1 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-300"
                                >
                                  <span>
                                    <strong>UserAlerts active:</strong> Watching{' '}
                                    <span className="font-mono">{activeAlert.skills.join(', ')}</span>{' '}
                                    for browser push notifications.
                                  </span>
                                  <button
                                    type="button"
                                    data-testid="open-user-alerts-from-detail"
                                    onClick={() => setIsAlertsPanelOpen(true)}
                                    className="font-semibold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
                                  >
                                    Manage &amp; Test Alerts ({userAlerts.length})
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Body: Full Description & Skill Match Breakdown */}
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          Role Overview &amp; Responsibilities
                        </h3>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {activeSelectedJob.description}
                        </p>
                      </div>

                      {/* Required Tech Stack Interactive Filter Buttons */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            Required Skills &amp; Profile Alignment
                          </h3>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {activeSelectedJobBreakdown.matchedSkills.length} of{' '}
                            {activeSelectedJobBreakdown.matchedSkills.length +
                              activeSelectedJobBreakdown.missingSkills.length}{' '}
                            matched
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <span className="font-semibold text-[#087F31] dark:text-emerald-400 block">
                              Matched From Your Profile
                            </span>
                            {activeSelectedJobBreakdown.matchedSkills.length === 0 ? (
                              <p className="text-slate-500 dark:text-slate-400">
                                Add matching skills in your profile settings to boost this score.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {activeSelectedJobBreakdown.matchedSkills.map((sk) => (
                                  <button
                                    key={sk}
                                    type="button"
                                    onClick={() => setJobSkillQuery(sk)}
                                    className="px-2.5 py-1 font-mono font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-[#087F31] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:border-[#087F31] cursor-pointer"
                                  >
                                    ✓ {sk}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                              Skills to Strengthen
                            </span>
                            {activeSelectedJobBreakdown.missingSkills.length === 0 ? (
                              <p className="text-[#087F31] dark:text-emerald-400 font-medium">
                                You meet all core skills listed for this role.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {activeSelectedJobBreakdown.missingSkills.map((sk) => (
                                  <button
                                    key={sk}
                                    type="button"
                                    onClick={() => {
                                      setCourseQuery(sk);
                                      setActiveTab('learning');
                                    }}
                                    title={`Browse ${sk} courses`}
                                    className="px-2.5 py-1 font-mono font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7] cursor-pointer"
                                  >
                                    + {sk}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Interview Tips Section */}
                      <div
                        data-testid="job-detail-quick-tips-section"
                        className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                      >
                        <div className="rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>Quick Interview Tips</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              Preparing for <span className="font-semibold">{activeSelectedJob.company}</span>? Pop open 3 high-impact interview questions tailored specifically to{' '}
                              <span className="font-mono font-semibold text-[#2557A7] dark:text-blue-400">
                                {activeSelectedJob.skills}
                              </span>.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              data-testid="job-detail-quick-tips-btn"
                              aria-haspopup="dialog"
                              aria-expanded={isQuickTipsModalOpen}
                              onClick={() => setIsQuickTipsModalOpen(true)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            >
                              <Lightbulb className="w-3.5 h-3.5" />
                              <span>View 3 Quick Tips</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTab('ai')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#2557A7] dark:text-blue-400 hover:border-[#2557A7] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Full Mock Interview</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {activeSelectedJob && (
              <QuickInterviewTipsModal
                bundle={generateQuickInterviewTips(activeSelectedJob)}
                isOpen={isQuickTipsModalOpen}
                onClose={() => setIsQuickTipsModalOpen(false)}
                onOpenMockInterview={() => {
                  setIsQuickTipsModalOpen(false);
                  setActiveTab('ai');
                }}
                onNotify={showToast}
              />
            )}

            {/* Recharts Salary Comparison Bar Chart (Saved Jobs Avg CTC vs Expected Salary Range) */}
            <JobSalaryComparisonCard
              jobs={jobs}
              savedJobIds={appliedJobIds}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onNavigateToSettings={() => setActiveTab('profile')}
            />
          </div>
        )}

        {/* ==================== 3. INTERNSHIPS VIEW (internships.html) ==================== */}
        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Explore Student Internships
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Showing <span className="font-mono font-semibold tabular-nums">{filteredInternships.length}</span> of <span className="font-mono tabular-nums">{internships.length}</span> verified paid internships
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-96">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <label htmlFor="internship-search" className="sr-only">
                      Search internships by company or skill
                    </label>
                    <input
                      id="internship-search"
                      type="text"
                      value={internQuery}
                      onChange={(e) => setInternQuery(e.target.value)}
                      placeholder="Search by company or skill (e.g. GenAI, Go, Python, React, Cloud)..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>
                </div>
              </div>

              {/* Location Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 dark:border-slate-800" role="group" aria-label="Filter internships by location">
                {['ALL', 'Remote', 'Chennai', 'Bengaluru', 'Hyderabad', 'Noida'].map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setInternLocationFilter(loc)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      internLocationFilter === loc
                        ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7]'
                    }`}
                  >
                    {loc === 'ALL' ? 'All Locations' : loc}
                  </button>
                ))}
              </div>
            </div>

            {filteredInternships.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No internships found matching your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setInternQuery('');
                    setInternLocationFilter('ALL');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] rounded-lg cursor-pointer"
                >
                  Reset Internship Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInternships.map((intern) => {
                  const isApplied = appliedInternshipIds.includes(intern.id);
                  const badge = getCompanyMonogram(intern.company);
                  const linkedInUrl = buildLinkedInShareUrl({
                    title: intern.title,
                    company: intern.company,
                    type: 'internship',
                    location: intern.location,
                    stipend: intern.stipend
                  });

                  return (
                    <article
                      key={intern.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Company & Duration Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                              {badge.initials}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                                {intern.company}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{intern.location}</span>
                                {intern.duration && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono shrink-0">{intern.duration}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#087F31] dark:text-emerald-400 shrink-0 tabular-nums">
                            {intern.stipend || 'Paid Stipend'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {intern.title}
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {intern.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer Share & Apply CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <a
                          data-testid={`internship-linkedin-share-${intern.id}`}
                          href={linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#2557A7] dark:hover:text-blue-400"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share on LinkedIn</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleToggleInternshipApply(intern)}
                          aria-label={isApplied ? `Withdraw internship application for ${intern.title} at ${intern.company}` : `Apply Now for ${intern.title} at ${intern.company}`}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isApplied
                              ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                              : 'bg-[#2557A7] hover:bg-[#164081] text-white dark:bg-blue-600 dark:hover:bg-blue-500'
                          }`}
                        >
                          {isApplied ? 'Applied ✓' : 'Apply Now'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3.5 FULL-STACK ENGINEERING CODE LAB ==================== */}
        {activeTab === 'codelab' && (
          <FullStackCodeLabView
            jobs={jobs}
            userAlerts={userAlerts}
            onJobsUpdated={() => {
              fetch('/api/jobs')
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                  if (Array.isArray(data)) setJobs(data);
                })
                .catch(() => {});
            }}
          />
        )}

        {/* ==================== 4. LEARNING COURSES VIEW (learning.html) ==================== */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Learn and Grow Your Skills
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Showing <span className="font-mono font-semibold tabular-nums">{filteredCourses.length}</span> of <span className="font-mono tabular-nums">{courses.length}</span> structured engineering courses
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-96">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <label htmlFor="course-search" className="sr-only">
                      Search courses by topic or provider
                    </label>
                    <input
                      id="course-search"
                      type="text"
                      value={courseQuery}
                      onChange={(e) => setCourseQuery(e.target.value)}
                      placeholder="Search by topic (e.g. Spring Boot, Java, React, MySQL)..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>
                </div>
              </div>

              {/* Provider Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 dark:border-slate-800" role="group" aria-label="Filter courses by provider">
                {courseProviders.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setCourseProviderFilter(provider)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      courseProviderFilter === provider
                        ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7]'
                    }`}
                  >
                    {provider === 'ALL' ? `All Providers (${courses.length})` : provider}
                  </button>
                ))}
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No courses match your search criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCourseQuery('');
                    setCourseProviderFilter('ALL');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] rounded-lg cursor-pointer"
                >
                  Reset Course Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.includes(course.id);

                  return (
                    <article
                      key={course.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#2557A7] dark:text-blue-400">
                            {course.provider}
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {course.level || 'Self-Paced'}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {course.title}
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors"
                        >
                          <span>Course Syllabus</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggleCourseEnroll(course)}
                          aria-label={isEnrolled ? `Unenroll from ${course.title}` : `Start Learning ${course.title}`}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isEnrolled
                              ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                              : 'bg-[#2557A7] hover:bg-[#164081] text-white dark:bg-blue-600 dark:hover:bg-blue-500'
                          }`}
                        >
                          {isEnrolled ? 'Enrolled ✓' : 'Start Learning'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== 5. CERTIFICATIONS VIEW (certifications.html) ==================== */}
        {activeTab === 'certifications' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Achieve Industry Certifications
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Showing <span className="font-mono font-semibold tabular-nums">{filteredCertifications.length}</span> of <span className="font-mono tabular-nums">{certifications.length}</span> verified credentials
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-96">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <label htmlFor="cert-search" className="sr-only">
                      Search certifications by name or issuer
                    </label>
                    <input
                      id="cert-search"
                      type="text"
                      value={certQuery}
                      onChange={(e) => setCertQuery(e.target.value)}
                      placeholder="Search certifications (e.g. AWS, Java, Google, Spring)..."
                      className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>
                </div>
              </div>

              {/* Issuer Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-slate-100 dark:border-slate-800" role="group" aria-label="Filter certifications by issuer">
                {certIssuers.map((issuer) => (
                  <button
                    key={issuer}
                    type="button"
                    onClick={() => setCertIssuerFilter(issuer)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      certIssuerFilter === issuer
                        ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7]'
                    }`}
                  >
                    {issuer === 'ALL' ? `All Issuers (${certifications.length})` : issuer}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCertifications.map((cert) => {
                const isTracked = savedCertIds.includes(cert.id);

                return (
                  <article
                    key={cert.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#2557A7] dark:text-blue-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{cert.issuer}</span>
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          Verified Exam
                        </span>
                      </div>

                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {cert.name}
                        </h2>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Official industry exam credential recognized across global technology enterprises.
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors"
                      >
                        <span>Exam Syllabus</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleToggleCertTrack(cert)}
                        aria-label={isTracked ? `Remove ${cert.name} from tracked certifications` : `Track ${cert.name}`}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isTracked
                            ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                            : 'bg-[#2557A7] hover:bg-[#164081] text-white dark:bg-blue-600 dark:hover:bg-blue-500'
                        }`}
                      >
                        {isTracked ? 'Tracked ✓' : 'Track Goal'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== 6. AI CAREER ASSISTANT VIEW ==================== */}
        {activeTab === 'ai' && (
          <CareerAssistantView
            jobs={jobs}
            savedJobIds={appliedJobIds}
            internships={internships}
            appliedInternshipIds={appliedInternshipIds}
            applicationStageRecords={applicationStageRecords}
            userSkills={user?.skills || DEFAULT_USER_PROFILE.skills}
            enrolledCourseIds={enrolledCourseIds}
            savedCertIds={savedCertIds}
            onAddInterviewFeedback={handleAddInterviewFeedback}
            pendingPromptRequest={pendingAiPrompt}
            onConsumePendingPrompt={() => setPendingAiPrompt(null)}
          />
        )}

        {/* ==================== 6.5 RESUME BUILDER VIEW ==================== */}
        {activeTab === 'resume' && (
          <ResumeBuilderView
            user={user}
            certifications={certifications}
            savedCertIds={savedCertIds}
            courses={courses}
            enrolledCourseIds={enrolledCourseIds}
            jobs={jobs}
            appliedJobIds={appliedJobIds}
            internships={internships}
            appliedInternshipIds={appliedInternshipIds}
            onUpdateProfile={handleUpdateProfile}
            onNavigateToProfile={() => setActiveTab('profile')}
            onNotify={showToast}
          />
        )}

        {/* ==================== 7. PROFILE & SETTINGS VIEW ==================== */}
        {activeTab === 'profile' && (
          <ProfileSettingsView
            user={user}
            settings={settings}
            certifications={certifications}
            savedCertIds={savedCertIds}
            courses={courses}
            enrolledCourseIds={enrolledCourseIds}
            jobs={jobs}
            appliedJobIds={appliedJobIds}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onLoginProvider={handleLoginProvider}
            onLogout={handleLogout}
            onToggleCourseEnroll={handleToggleCourseEnroll}
            onToggleCertTrack={handleToggleCertTrack}
            onNavigateToLearning={(skillKeyword) => {
              if (skillKeyword) {
                setCourseQuery(skillKeyword);
              }
              setActiveTab('learning');
            }}
            onOpenResumeBuilder={() => navigateToTab('resume')}
            onFinishProfileWithAi={handleFinishProfileWithAi}
            onOpenLogin={() => navigateToTab('login')}
            onOpenSignUp={() => navigateToTab('signup')}
            onNotify={showToast}
          />
        )}

        {/* ==================== 8. SEPARATE LOG IN VIEW ==================== */}
        {activeTab === 'login' && (
          <LoginView
            onEmailLogin={handleEmailLogin}
            onOAuthLogin={handleLoginProvider}
            onSwitchToSignUp={() => navigateToTab('signup')}
            onExploreJobs={() => navigateToTab('jobs')}
          />
        )}

        {/* ==================== 9. SEPARATE SIGN UP VIEW ==================== */}
        {activeTab === 'signup' && (
          <SignUpView
            onSignUp={handleSignUp}
            onOAuthLogin={handleLoginProvider}
            onSwitchToLogin={() => navigateToTab('login')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>JobNova © 2026 — Engineering Jobs, Salary Insights &amp; Career Platform</span>
          <span>Python · GenAI/LLM · Java · Spring Boot · Go · Rust · React · Cloud/K8s · Data &amp; Security</span>
        </div>
      </footer>
    </div>
  );
}

