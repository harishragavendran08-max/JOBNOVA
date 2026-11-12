/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileDown,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
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
  computeCareerStats,
  filterCertifications,
  filterCourses,
  filterInternships,
  filterJobsBySkill,
  formatApplicationStatusNotification,
  syncApplicationStageRecords,
  toggleItemSelection,
  toggleThemeSetting,
  updateApplicationStageRecord,
  updateInterviewScheduleRecord
} from './utils/jobnovaLogic';
import { ActiveTab, Navbar } from './components/Navbar';
import { CareerAssistantView } from './components/CareerAssistantView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { SkillProficiencyRadarCard } from './components/SkillProficiencyRadarCard';
import { JobSalaryComparisonCard } from './components/JobSalaryComparisonCard';
import { CareerTimelineCard } from './components/CareerTimelineCard';
import { PersonalizedAlertsCard } from './components/PersonalizedAlertsCard';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

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

  // Interactive Filters
  const [jobSkillQuery, setJobSkillQuery] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('ALL');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Fetch initial data from Express API routes matching Spring Boot controllers
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [jobsRes, internsRes, coursesRes, certsRes, userRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/internships'),
          fetch('/api/courses'),
          fetch('/api/certifications'),
          fetch('/user')
        ]);

        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (internsRes.ok) setInternships(await internsRes.json());
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (certsRes.ok) setCertifications(await certsRes.json());
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
    handleUpdateSettings(nextSettings);
    showToast(
      `Switched to ${nextSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Saved in userSettings).`
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
    showToast(`Signed in via ${provider} OAuth2.`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    showToast('Signed out of JobNova session.');
  };

  // Filtered collections
  const filteredJobs = filterJobsBySkill(jobs, jobSkillQuery, jobLocationFilter);
  const filteredInternships = filterInternships(internships, internQuery, internLocationFilter);
  const filteredCourses = filterCourses(courses, courseQuery, courseProviderFilter);
  const filteredCertifications = filterCertifications(certifications, certQuery, certIssuerFilter);

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
    { label: 'Java', value: 'java' },
    { label: 'Spring Boot', value: 'springboot' },
    { label: 'React.js', value: 'react' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'HTML5', value: 'html' },
    { label: 'CSS3', value: 'css' },
    { label: 'MySQL', value: 'mysql' }
  ];
  const courseProviders = ['ALL', 'Coursera', 'Udemy', 'Google', 'edX', 'Amazon AWS', 'Microsoft Learn'];
  const certIssuers = ['ALL', 'Oracle', 'Amazon', 'Google', 'Microsoft', 'Coursera', 'IBM', 'VMware'];

  const getCompanyBadge = (company: string) => {
    const c = company.toLowerCase();
    if (c.includes('google')) {
      return {
        initials: 'G',
        className: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
      };
    }
    if (c.includes('amazon')) {
      return {
        initials: 'A',
        className: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      };
    }
    if (c.includes('infosys') || c.includes('wipro')) {
      return {
        initials: company.slice(0, 2).toUpperCase(),
        className: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
      };
    }
    if (c.includes('tcs') || c.includes('cognizant')) {
      return {
        initials: company.slice(0, 2).toUpperCase(),
        className: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
      };
    }
    if (c.includes('zoho') || c.includes('technova')) {
      return {
        initials: company.slice(0, 2).toUpperCase(),
        className: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      };
    }
    return {
      initials: company.slice(0, 2).toUpperCase(),
      className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    };
  };

  const getProviderBadge = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('coursera')) return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (p.includes('google')) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    if (p.includes('aws') || p.includes('amazon')) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (p.includes('microsoft')) return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
    if (p.includes('edx')) return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    return 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userName={user?.name}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg border border-slate-700 text-sm">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* ==================== 1. HOME / DASHBOARD VIEW ==================== */}
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Career Command Center Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/70 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-stretch">
                {/* Left: Student Welcome & Live Career Pipeline KPIs */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        CAREER PIPELINE ACTIVE
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        JobNova Engineering Platform
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                      Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">{user ? user.name : 'Student Explorer'}</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                      Accelerate your software engineering career. Match with full-time campus roles, secure verified internships, strengthen full-stack competencies across Java, Spring Boot, React.js &amp; MySQL, and track interview feedback.
                    </p>
                  </div>

                  {/* Career Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-xs">
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target CTC</div>
                      <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                        ₹{settings.expectedSalaryMinLpa} - ₹{settings.expectedSalaryMaxLpa} <span className="text-xs font-normal text-slate-500">LPA</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Matches</div>
                      <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 tabular-nums">
                        {careerStats.matchedJobsCount} <span className="text-xs font-normal text-slate-500">Roles</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Pipeline</div>
                      <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                        {appliedJobIds.length + appliedInternshipIds.length} <span className="text-xs font-normal text-slate-500">Applied</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upskilling</div>
                      <div className="text-sm font-bold font-mono text-violet-600 dark:text-violet-400 mt-0.5 tabular-nums">
                        {enrolledCourseIds.length} Courses <span className="text-xs font-normal text-slate-500">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary & Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('jobs')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer whitespace-nowrap"
                    >
                      <span>Explore {jobs.length} Open Jobs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('ai')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>AI Career Assistant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>Profile &amp; Resume PDF</span>
                    </button>
                  </div>
                </div>

                {/* Right: Core Tech Stack Matcher */}
                <div className="lg:col-span-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 p-5 flex flex-col justify-between shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        <Target className="w-3.5 h-3.5" />
                        <span>Core Tech Stack Filter</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {careerStats.matchedJobsCount} matches
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Full-Stack Engineering
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Select any competency below to filter curated job opportunities directly by your tech stack:
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {coreStackFilters.slice(1).map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setJobSkillQuery(item.value);
                            setActiveTab('jobs');
                          }}
                          className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-indigo-600"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>View Skill Gap &amp; Proficiency</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 Core JobNova Platform Modules */}
            <section aria-label="Platform Modules" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Module 1: Jobs */}
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className="group relative text-left bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md tabular-nums">
                      {jobs.length} Roles
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                    <span>Full-Time Jobs</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Software engineer roles across TCS, Infosys, Google India, Amazon &amp; Zoho with CTC metrics.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{appliedJobIds.length} applied</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-sans font-medium group-hover:underline">Browse roles →</span>
                </div>
              </button>

              {/* Module 2: Internships */}
              <button
                type="button"
                onClick={() => setActiveTab('internships')}
                className="group relative text-left bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md tabular-nums">
                      {internships.length} Open
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    <span>Internships</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Summer &amp; winter student internships in Full-Stack Web Dev, Java, AI, and UI/UX with stipends.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{appliedInternshipIds.length} applied</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium group-hover:underline">Explore offers →</span>
                </div>
              </button>

              {/* Module 3: Learning Courses */}
              <button
                type="button"
                onClick={() => setActiveTab('learning')}
                className="group relative text-left bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 rounded-xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-md tabular-nums">
                      {courses.length} Courses
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-center justify-between">
                    <span>Learning Tracks</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Curated tracks from Coursera, Udemy, Google, edX, and Microsoft Learn to close skill gaps.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{enrolledCourseIds.length} active</span>
                  <span className="text-violet-600 dark:text-violet-400 font-sans font-medium group-hover:underline">Start learning →</span>
                </div>
              </button>

              {/* Module 4: Certifications */}
              <button
                type="button"
                onClick={() => setActiveTab('certifications')}
                className="group relative text-left bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md tabular-nums">
                      {certifications.length} Certs
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>Certifications</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Credentials from Oracle, AWS, Google Cloud, Microsoft &amp; IBM to validate industry readiness.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{savedCertIds.length} tracked</span>
                  <span className="text-amber-600 dark:text-amber-400 font-sans font-medium group-hover:underline">View badges →</span>
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

            {/* Student Career Readiness & Matched Jobs Preview */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Top Roles Matching Your Profile Skills
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Matched <span className="font-mono font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">{careerStats.matchedJobsCount}</span> of <span className="font-mono tabular-nums">{jobs.length}</span> open roles based on your skills: <span className="font-mono text-slate-700 dark:text-slate-300">{(user?.skills || DEFAULT_USER_PROFILE.skills).join(' · ')}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>View all {jobs.length} jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.slice(0, 6).map((job) => {
                  const isApplied = appliedJobIds.includes(job.id);
                  const badge = getCompanyBadge(job.company);
                  const skillsList = job.skills.split(',').map((s) => s.trim()).filter(Boolean);

                  return (
                    <article
                      key={job.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-600/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Company & CTC Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                              {badge.initials}
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                                {job.company}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{job.location}</span>
                              </div>
                            </div>
                          </div>
                          {job.ctc && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 tabular-nums">
                              {job.ctc}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {skillsList.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Apply CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {job.type || 'Full-Time'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleJobApply(job)}
                          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isApplied
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
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

        {/* ==================== 2. JOBS EXPLORER VIEW (jobs.html) ==================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Explore Job Opportunities
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-mono font-semibold tabular-nums">{filteredJobs.length}</span> of <span className="font-mono tabular-nums">{jobs.length}</span> roles from top companies in India
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 w-full md:w-96">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <label htmlFor="job-skill-search" className="sr-only">
                    Search jobs by skill, title, or company
                  </label>
                  <input
                    id="job-skill-search"
                    type="text"
                    value={jobSkillQuery}
                    onChange={(e) => setJobSkillQuery(e.target.value)}
                    placeholder="Search by skill (e.g. Java, Python, AI, React)..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                {jobSkillQuery && (
                  <button
                    type="button"
                    onClick={() => setJobSkillQuery('')}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Recharts Salary Comparison Bar Chart (Saved Jobs Avg CTC vs Expected Salary Range) */}
            <JobSalaryComparisonCard
              jobs={jobs}
              savedJobIds={appliedJobIds}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onNavigateToSettings={() => setActiveTab('profile')}
            />

            {/* Core Stack Quick-Filter Bar (Java, Spring Boot, React.js, JavaScript, HTML5, CSS3, MySQL) */}
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
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {stack.label}
                </button>
              ))}
            </div>

            {/* Interactive Location Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter jobs by location">
              {jobLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setJobLocationFilter(loc)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    jobLocationFilter === loc
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {loc === 'ALL' ? 'All Locations' : loc}
                </button>
              ))}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No jobs match "{jobSkillQuery}" in {jobLocationFilter === 'ALL' ? 'any location' : jobLocationFilter}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setJobSkillQuery('');
                    setJobLocationFilter('ALL');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Reset Job Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => {
                  const isApplied = appliedJobIds.includes(job.id);
                  const badge = getCompanyBadge(job.company);
                  const skillsList = job.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return (
                    <article
                      key={job.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/80 dark:hover:border-indigo-600/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Company & CTC Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                              {badge.initials}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                                {job.company}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{job.location}</span>
                              </div>
                            </div>
                          </div>
                          {job.ctc && (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 tabular-nums">
                              {job.ctc}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {job.description}
                          </p>
                        </div>

                        {/* Interactive Skill Chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {skillsList.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => setJobSkillQuery(skill)}
                              title={`Filter jobs requiring ${skill}`}
                              className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                            >
                              #{skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Footer Apply CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {job.type || 'Full-Time Engineering'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleJobApply(job)}
                          aria-label={isApplied ? `Withdraw application for ${job.title} at ${job.company}` : `Apply for ${job.title} at ${job.company}`}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isApplied
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
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

        {/* ==================== 3. INTERNSHIPS VIEW (internships.html) ==================== */}
        {activeTab === 'internships' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Explore Internship Opportunities
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-mono font-semibold tabular-nums">{filteredInternships.length}</span> of <span className="font-mono tabular-nums">{internships.length}</span> internships for students & freshers
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-96">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <label htmlFor="internship-search" className="sr-only">
                    Search internships by company or skill
                  </label>
                  <input
                    id="internship-search"
                    type="text"
                    value={internQuery}
                    onChange={(e) => setInternQuery(e.target.value)}
                    placeholder="Search by company or skill (e.g. Python, UI/UX, AI)..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Location Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter internships by location">
              {['ALL', 'Remote', 'Chennai', 'Bengaluru', 'Hyderabad', 'Noida'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setInternLocationFilter(loc)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    internLocationFilter === loc
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {loc === 'ALL' ? 'All Locations' : loc}
                </button>
              ))}
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Reset Internship Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInternships.map((intern) => {
                  const isApplied = appliedInternshipIds.includes(intern.id);
                  const badge = getCompanyBadge(intern.company);

                  return (
                    <article
                      key={intern.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400/80 dark:hover:border-emerald-600/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Company & Duration Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${badge.className}`}>
                              {badge.initials}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                                {intern.company}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{intern.location}</span>
                              </div>
                            </div>
                          </div>
                          {intern.duration && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              {intern.duration}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {intern.title}
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {intern.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer Stipend & Apply CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Stipend</span>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {intern.stipend || 'Paid Stipend'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleInternshipApply(intern)}
                          aria-label={isApplied ? `Withdraw internship application for ${intern.title} at ${intern.company}` : `Apply Now for ${intern.title} at ${intern.company}`}
                          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isApplied
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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

        {/* ==================== 4. LEARNING COURSES VIEW (learning.html) ==================== */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Learn and Grow Your Skills
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-mono font-semibold tabular-nums">{filteredCourses.length}</span> of <span className="font-mono tabular-nums">{courses.length}</span> structured courses from basics to advanced
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-96">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <label htmlFor="course-search" className="sr-only">
                    Search courses by topic or provider
                  </label>
                  <input
                    id="course-search"
                    type="text"
                    value={courseQuery}
                    onChange={(e) => setCourseQuery(e.target.value)}
                    placeholder="Search by topic (e.g. Spring Boot, Java, AI, HTML)..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Provider Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter courses by provider">
              {courseProviders.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setCourseProviderFilter(provider)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    courseProviderFilter === provider
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {provider === 'ALL' ? 'All Providers (30)' : provider}
                </button>
              ))}
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Reset Course Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.includes(course.id);
                  const providerStyle = getProviderBadge(course.provider);

                  return (
                    <article
                      key={course.id}
                      className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-violet-400/80 dark:hover:border-violet-600/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Provider & Level Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${providerStyle}`}>
                            {course.provider}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {course.level || 'Self-Paced'}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {course.title}
                          </h2>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer Syllabus & Enroll CTA */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                        >
                          <span>Course Syllabus</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggleCourseEnroll(course)}
                          aria-label={isEnrolled ? `Unenroll from ${course.title}` : `Start Learning ${course.title}`}
                          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isEnrolled
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Achieve Industry Certifications
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-mono font-semibold tabular-nums">{filteredCertifications.length}</span> of <span className="font-mono tabular-nums">{certifications.length}</span> verified credentials
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-96">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <label htmlFor="cert-search" className="sr-only">
                    Search certifications by name or issuer
                  </label>
                  <input
                    id="cert-search"
                    type="text"
                    value={certQuery}
                    onChange={(e) => setCertQuery(e.target.value)}
                    placeholder="Search certifications (e.g. AWS, Java, Google, Spring)..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Issuer Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Filter certifications by issuer">
              {certIssuers.map((issuer) => (
                <button
                  key={issuer}
                  type="button"
                  onClick={() => setCertIssuerFilter(issuer)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    certIssuerFilter === issuer
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900'
                  }`}
                >
                  {issuer === 'ALL' ? 'All Issuers (7)' : issuer}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCertifications.map((cert) => {
                const isTracked = savedCertIds.includes(cert.id);

                return (
                  <article
                    key={cert.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-600/80 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Issuer & Shield Header */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{cert.issuer}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          Verified Credential
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {cert.name}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Official industry exam credential recognized across global technology enterprises.
                        </p>
                      </div>
                    </div>

                    {/* Footer Credential Link & Track CTA */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <span>Exam Syllabus</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleToggleCertTrack(cert)}
                        aria-label={isTracked ? `Remove ${cert.name} from tracked certifications` : `Track ${cert.name}`}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          isTracked
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
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

        {/* ==================== 6. AI CAREER ASSISTANT VIEW (ai.html) ==================== */}
        {activeTab === 'ai' && (
          <CareerAssistantView
            jobs={jobs}
            savedJobIds={appliedJobIds}
            userSkills={user?.skills || DEFAULT_USER_PROFILE.skills}
            enrolledCourseIds={enrolledCourseIds}
            savedCertIds={savedCertIds}
          />
        )}

        {/* ==================== 7. PROFILE & SETTINGS VIEW (profile.html + settings.html) ==================== */}
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
            onNotify={showToast}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>JobNova © 2026 — Student Career, Jobs &amp; Learning Platform</span>
          <span>Java · Spring Boot · React.js · JavaScript · HTML5 · CSS3 · MySQL</span>
        </div>
      </footer>
    </div>
  );
}
