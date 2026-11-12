import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FileText,
  GraduationCap,
  HeartPulse,
  LogIn,
  LogOut,
  MapPin,
  PlusCircle,
  RefreshCw,
  Save,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Unlink,
  UserCheck,
  X
} from 'lucide-react';
import {
  CertificationItem,
  CourseItem,
  DEFAULT_USER_PROFILE,
  JobItem,
  SEED_LINKEDIN_HEADLINE,
  SEED_LINKEDIN_PROFILE_SUMMARY,
  SEED_LINKEDIN_WORK_HISTORY,
  UserProfile,
  UserSettings,
  WorkExperienceItem
} from '../data/seedData';
import {
  buildResumeStructuredData,
  computeLinkedInConnectionHealth,
  computeProfileSkillGapAnalysis,
  computeProfileSkillProficiencyList,
  computeResumeHealthScore,
  disconnectLinkedInProfile,
  formatWorkExperienceDuration,
  importLinkedInProfileData,
  ProficiencyTier,
  ResumeHealthTip,
  updateExpectedSalarySettings,
  updateSkillProficiencyMap
} from '../utils/jobnovaLogic';
import { exportStudentResumePdf, GeneratedPdfResult } from '../utils/pdfResumeGenerator';

interface ProfileSettingsViewProps {
  user: UserProfile | null;
  settings: UserSettings;
  certifications: CertificationItem[];
  savedCertIds: number[];
  courses: CourseItem[];
  enrolledCourseIds: number[];
  jobs: JobItem[];
  appliedJobIds: number[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onLoginProvider: (provider: 'Google' | 'GitHub') => void;
  onLogout: () => void;
  onToggleCourseEnroll?: (course: CourseItem) => void;
  onToggleCertTrack?: (cert: CertificationItem) => void;
  onNavigateToLearning?: (skillKeyword?: string) => void;
  onNotify?: (message: string) => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  user,
  settings,
  certifications,
  savedCertIds,
  courses,
  enrolledCourseIds,
  jobs,
  appliedJobIds,
  onUpdateProfile,
  onUpdateSettings,
  onLoginProvider,
  onLogout,
  onToggleCourseEnroll,
  onToggleCertTrack,
  onNavigateToLearning,
  onNotify
}) => {
  const [nameInput, setNameInput] = useState(user?.name || 'Harish Ragavendran');
  const [emailInput, setEmailInput] = useState(user?.email || 'harishragavendran56@gmail.com');
  const [headlineInput, setHeadlineInput] = useState(
    user?.headline ||
      'Full-Stack Developer — Java, Spring Boot, React.js, JavaScript, HTML5, CSS3 & MySQL'
  );
  const [locationInput, setLocationInput] = useState(user?.location || 'Chennai, India');
  const [summaryInput, setSummaryInput] = useState(
    user?.summary ||
      'Full-stack Computer Science student building web applications with Java, Spring Boot, React.js, JavaScript, HTML5, CSS3, and MySQL. Actively exploring Software Engineer and Full-Stack Developer opportunities.'
  );
  const [educationInput, setEducationInput] = useState(
    user?.education ||
      'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027)'
  );
  const [skillsInput, setSkillsInput] = useState(
    (
      user?.skills || [
        'java',
        'springboot',
        'react',
        'javascript',
        'html',
        'css',
        'mysql'
      ]
    ).join(', ')
  );
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, number>>(
    user?.skillProficiencies || {}
  );
  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // PDF Resume Export options & last generated state
  const [includeCoursesInPdf, setIncludeCoursesInPdf] = useState(true);
  const [includeTargetRolesInPdf, setIncludeTargetRolesInPdf] = useState(true);
  const [lastPdfExport, setLastPdfExport] = useState<GeneratedPdfResult | null>(null);

  // LinkedIn Integration & Work History state
  const [workHistory, setWorkHistory] = useState<WorkExperienceItem[]>(
    user?.workHistory || []
  );
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [linkedInModalOpen, setLinkedInModalOpen] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkCompany, setNewWorkCompany] = useState('');
  const [newWorkLocation, setNewWorkLocation] = useState('Chennai, India');
  const [newWorkStartDate, setNewWorkStartDate] = useState('');
  const [newWorkEndDate, setNewWorkEndDate] = useState('');
  const [newWorkCurrent, setNewWorkCurrent] = useState(false);
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkSkills, setNewWorkSkills] = useState('');

  // Keep form fields synchronized whenever the user object updates from backend or OAuth
  useEffect(() => {
    if (user) {
      setNameInput(user.name);
      setEmailInput(user.email);
      setHeadlineInput(user.headline);
      setLocationInput(user.location);
      setSummaryInput(user.summary);
      if (user.education) setEducationInput(user.education);
      if (user.skills && user.skills.length > 0) setSkillsInput(user.skills.join(', '));
      if (user.skillProficiencies) setSkillProficiencies(user.skillProficiencies);
      if (user.workHistory) setWorkHistory(user.workHistory);
    }
  }, [user]);

  const parsedSkillsInput = skillsInput
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const activeUserSkills =
    parsedSkillsInput.length > 0
      ? parsedSkillsInput
      : user?.skills && user.skills.length > 0
      ? user.skills
      : [
          'java',
          'springboot',
          'react',
          'javascript',
          'html',
          'css',
          'mysql'
        ];

  const resumePreviewData = buildResumeStructuredData({
    user: user
      ? {
          ...user,
          name: nameInput,
          email: emailInput,
          headline: headlineInput,
          location: locationInput,
          summary: summaryInput,
          education: educationInput,
          skills: activeUserSkills,
          skillProficiencies
        }
      : null,
    certifications,
    savedCertIds,
    courses,
    enrolledCourseIds,
    jobs,
    appliedJobIds,
    customProficiencyOverrides: skillProficiencies
  });

  const resumeHealth = computeResumeHealthScore({
    name: nameInput,
    email: emailInput,
    headline: headlineInput,
    location: locationInput,
    summary: summaryInput,
    education: educationInput,
    skills: activeUserSkills,
    savedCertIds,
    enrolledCourseIds,
    customProficiencyOverrides: skillProficiencies
  });

  const linkedInHealth = computeLinkedInConnectionHealth({
    connected: user?.linkedInConnected,
    lastSyncedIso: user?.lastLinkedInSync
  });

  const skillProficiencyList = computeProfileSkillProficiencyList({
    userSkills: activeUserSkills,
    jobs,
    savedJobIds: appliedJobIds,
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides: skillProficiencies
  });

  const skillGapSummary = computeProfileSkillGapAnalysis({
    userSkills: activeUserSkills,
    jobs,
    savedJobIds: appliedJobIds,
    courses,
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides: skillProficiencies
  });

  const handleApplyHealthTip = (tip: ResumeHealthTip) => {
    if (tip.actionType === 'complete_education') {
      const enrichedEdu =
        'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027) · CGPA: 8.8/10 · Coursework: DSA, DBMS & OS';
      setEducationInput(enrichedEdu);
      onUpdateProfile({
        id: user?.id || 1,
        oauthId: user?.oauthId || 'google-oauth2-student-101',
        name: nameInput.trim() || 'Harish Ragavendran',
        email: emailInput.trim() || 'harishragavendran56@gmail.com',
        provider: user?.provider || 'Google',
        headline: headlineInput.trim(),
        location: locationInput.trim(),
        summary: summaryInput.trim(),
        education: enrichedEdu,
        skills: activeUserSkills,
        skillProficiencies,
        dob: user?.dob || 'Not provided by OAuth provider'
      });
      const msg = 'Updated Education History with CGPA (8.8/10) and Core CS Coursework (+7% Resume Health).';
      setSavedBanner(msg);
      if (onNotify) onNotify(msg);
    } else if (tip.actionType === 'add_skill_sql') {
      handleQuickAddSkill('sql');
    } else if (tip.actionType === 'track_certification') {
      const untrackedCert = certifications.find((c) => !savedCertIds.includes(c.id));
      if (untrackedCert && onToggleCertTrack) {
        onToggleCertTrack(untrackedCert);
        setSavedBanner(`Tracked "${untrackedCert.name}" (+${tip.impactPoints}% Resume Health).`);
      }
    } else if (tip.actionType === 'expand_summary') {
      const enrichedSummary =
        'Full-stack Computer Science student building scalable web applications with Java, Spring Boot, React.js, JavaScript, HTML5, CSS3, and MySQL. Engineered RESTful microservices and OAuth2 pipelines; actively seeking Software Engineer roles.';
      setSummaryInput(enrichedSummary);
      onUpdateProfile({
        id: user?.id || 1,
        oauthId: user?.oauthId || 'google-oauth2-student-101',
        name: nameInput.trim() || 'Harish Ragavendran',
        email: emailInput.trim() || 'harishragavendran56@gmail.com',
        provider: user?.provider || 'Google',
        headline: headlineInput.trim(),
        location: locationInput.trim(),
        summary: enrichedSummary,
        education: educationInput.trim(),
        skills: activeUserSkills,
        skillProficiencies,
        dob: user?.dob || 'Not provided by OAuth provider'
      });
      const msg = 'Expanded professional summary with quantified project impact.';
      setSavedBanner(msg);
      if (onNotify) onNotify(msg);
    }
  };

  const handleUpdateSkillLevel = (
    skillKey: string,
    skillLabel: string,
    levelOrScore: ProficiencyTier | number
  ) => {
    const nextMap = updateSkillProficiencyMap(skillProficiencies, skillKey, levelOrScore);
    setSkillProficiencies(nextMap);

    onUpdateProfile({
      id: user?.id || 1,
      oauthId: user?.oauthId || 'google-oauth2-student-101',
      name: nameInput.trim() || 'Harish Ragavendran',
      email: emailInput.trim() || 'harishragavendran56@gmail.com',
      provider: user?.provider || 'Google',
      headline: headlineInput.trim(),
      location: locationInput.trim(),
      summary: summaryInput.trim(),
      education: educationInput.trim(),
      skills: activeUserSkills,
      skillProficiencies: nextMap,
      dob: user?.dob || 'Not provided by OAuth provider'
    });

    const newScore = nextMap[skillKey.toLowerCase()];
    const msg =
      typeof levelOrScore === 'string'
        ? `Updated ${skillLabel} proficiency to ${levelOrScore} (${newScore}%) — Skill Gap Analysis recalculated.`
        : `Updated ${skillLabel} proficiency to ${newScore}% — Skill Gap Analysis recalculated.`;
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
  };

  const handleQuickAddSkill = (skillKey: string) => {
    const currentList = skillsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (currentList.includes(skillKey)) return;

    const updatedSkills = [...currentList, skillKey];
    setSkillsInput(updatedSkills.join(', '));
    onUpdateProfile({
      id: user?.id || 1,
      oauthId: user?.oauthId || 'google-oauth2-student-101',
      name: nameInput.trim() || 'Harish Ragavendran',
      email: emailInput.trim() || 'harishragavendran56@gmail.com',
      provider: user?.provider || 'Google',
      headline: headlineInput.trim(),
      location: locationInput.trim(),
      summary: summaryInput.trim(),
      education: educationInput.trim(),
      skills: updatedSkills,
      skillProficiencies,
      dob: user?.dob || 'Not provided by OAuth provider'
    });
    const msg = `Added "${skillKey}" to your listed profile skills.`;
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
  };

  const handleExportPdfResume = () => {
    const result = exportStudentResumePdf(resumePreviewData, {
      includeCourses: includeCoursesInPdf,
      includeTargetRoles: includeTargetRolesInPdf
    });
    setLastPdfExport(result);
    const msg = `Exported PDF Resume: ${result.fileName} (${Math.round(result.byteLength / 1024)} KB)`;
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
  };

  // OAuth PostMessage listener for LinkedIn popup completion
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'LINKEDIN_AUTH_SUCCESS') {
        setIsConnectingLinkedIn(false);
        const incomingProfile = event.data.profile;
        if (incomingProfile) {
          await handleApplyLinkedInImport(incomingProfile);
        }
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user, nameInput, emailInput, headlineInput, locationInput, summaryInput, educationInput, skillsInput, workHistory]);

  const handleApplyLinkedInImport = async (data: {
    headline?: string;
    summary?: string;
    workHistory?: WorkExperienceItem[];
    skills?: string[];
    linkedInProfileUrl?: string;
  }) => {
    const base = user || DEFAULT_USER_PROFILE;
    const merged = importLinkedInProfileData(base, {
      headline: data.headline || SEED_LINKEDIN_HEADLINE,
      summary: data.summary || SEED_LINKEDIN_PROFILE_SUMMARY,
      workHistory: data.workHistory || SEED_LINKEDIN_WORK_HISTORY,
      skills: data.skills || ['docker', 'kubernetes', 'rest-api'],
      linkedInProfileUrl: data.linkedInProfileUrl || 'https://linkedin.com/in/harish-ragavendran'
    });

    onUpdateProfile(merged);
    setHeadlineInput(merged.headline);
    setSummaryInput(merged.summary);
    setSkillsInput(merged.skills.join(', '));
    setWorkHistory(merged.workHistory || []);

    try {
      await fetch('/api/auth/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch {
      // Local state is already updated
    }

    const msg = `LinkedIn connected! Imported ${merged.workHistory?.length || 0} work experience roles, updated professional summary & headline.`;
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
    setLinkedInModalOpen(false);
  };

  const handleConnectLinkedIn = async () => {
    setIsConnectingLinkedIn(true);
    try {
      const res = await fetch('/api/auth/linkedin/url');
      const data = await res.json();
      const authUrl = data.authUrl || '/auth/linkedin/callback';

      // Open popup window per OAuth standard integration flow
      const popup = window.open(
        authUrl,
        'linkedin_oauth_popup',
        'width=600,height=720,status=no,toolbar=no,menubar=no'
      );

      // If popup was blocked or iframe restriction occurs, smoothly fallback to direct import
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        await handleDirectImportLinkedIn();
      }
    } catch {
      await handleDirectImportLinkedIn();
    }
  };

  const handleDirectImportLinkedIn = async () => {
    setIsConnectingLinkedIn(true);
    try {
      const res = await fetch('/api/auth/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: SEED_LINKEDIN_HEADLINE,
          summary: SEED_LINKEDIN_PROFILE_SUMMARY,
          workHistory: SEED_LINKEDIN_WORK_HISTORY,
          skills: ['docker', 'kubernetes', 'rest-api']
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onUpdateProfile(data.user);
          setHeadlineInput(data.user.headline);
          setSummaryInput(data.user.summary);
          setSkillsInput(data.user.skills.join(', '));
          setWorkHistory(data.user.workHistory || []);
        }
      } else {
        await handleApplyLinkedInImport({
          headline: SEED_LINKEDIN_HEADLINE,
          summary: SEED_LINKEDIN_PROFILE_SUMMARY,
          workHistory: SEED_LINKEDIN_WORK_HISTORY,
          skills: ['docker', 'kubernetes', 'rest-api']
        });
      }
    } catch {
      await handleApplyLinkedInImport({
        headline: SEED_LINKEDIN_HEADLINE,
        summary: SEED_LINKEDIN_PROFILE_SUMMARY,
        workHistory: SEED_LINKEDIN_WORK_HISTORY,
        skills: ['docker', 'kubernetes', 'rest-api']
      });
    } finally {
      setIsConnectingLinkedIn(false);
      const msg = 'Imported LinkedIn work history and professional summary directly into your JobNova profile!';
      setSavedBanner(msg);
      if (onNotify) onNotify(msg);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    const base = user || DEFAULT_USER_PROFILE;
    const disconnected = disconnectLinkedInProfile(base, true);
    onUpdateProfile(disconnected);
    try {
      await fetch('/api/auth/linkedin/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retainWorkHistory: true })
      });
    } catch {
      // Local state updated
    }
    const msg = 'LinkedIn account disconnected from JobNova profile.';
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
  };

  const handleDeleteWorkExperience = (id: string) => {
    const nextHistory = workHistory.filter((item) => item.id !== id);
    setWorkHistory(nextHistory);
    const base = user || DEFAULT_USER_PROFILE;
    onUpdateProfile({
      ...base,
      workHistory: nextHistory
    });
    setSavedBanner('Work experience entry removed.');
  };

  const handleSaveNewWorkExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkTitle.trim() || !newWorkCompany.trim()) {
      return;
    }

    const skillsArray = newWorkSkills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const newItem: WorkExperienceItem = {
      id: `exp-manual-${Date.now()}`,
      title: newWorkTitle.trim(),
      company: newWorkCompany.trim(),
      location: newWorkLocation.trim() || 'Chennai, India',
      startDate: newWorkStartDate.trim() || '2024',
      endDate: newWorkCurrent ? 'Present' : newWorkEndDate.trim() || 'Present',
      current: newWorkCurrent,
      description: newWorkDescription.trim(),
      skillsUsed: skillsArray,
      importedFrom: 'Manual'
    };

    const nextHistory = [newItem, ...workHistory];
    setWorkHistory(nextHistory);
    const base = user || DEFAULT_USER_PROFILE;
    onUpdateProfile({
      ...base,
      workHistory: nextHistory
    });

    setNewWorkTitle('');
    setNewWorkCompany('');
    setNewWorkStartDate('');
    setNewWorkEndDate('');
    setNewWorkCurrent(false);
    setNewWorkDescription('');
    setNewWorkSkills('');
    setShowAddWorkModal(false);

    const msg = `Added "${newItem.title}" at ${newItem.company} to work history.`;
    setSavedBanner(msg);
    if (onNotify) onNotify(msg);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !emailInput.trim()) {
      setValidationError('Name and email address are required.');
      return;
    }
    setValidationError(null);
    const updatedSkills = skillsInput
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    onUpdateProfile({
      id: user?.id || 1,
      oauthId: user?.oauthId || 'google-oauth2-student-101',
      name: nameInput.trim(),
      email: emailInput.trim(),
      provider: user?.provider || 'Google',
      headline: headlineInput.trim(),
      location: locationInput.trim(),
      summary: summaryInput.trim(),
      education: educationInput.trim(),
      skills: updatedSkills,
      skillProficiencies,
      dob: user?.dob || 'Not provided by OAuth provider',
      linkedInConnected: user?.linkedInConnected,
      linkedInProfileUrl: user?.linkedInProfileUrl,
      workHistory,
      lastLinkedInSync: user?.lastLinkedInSync
    });

    setSavedBanner('Profile and skill preferences saved.');
    setTimeout(() => setSavedBanner(null), 3000);
  };

  const handleToggleSetting = (key: keyof UserSettings) => {
    const currentVal = settings[key];
    if (typeof currentVal === 'boolean') {
      const nextVal = !currentVal;
      const next: UserSettings = { ...settings, [key]: nextVal };
      onUpdateSettings(next);
      const message =
        key === 'enableEmailNotifications'
          ? `Email notifications for application status changes ${nextVal ? 'enabled' : 'disabled'}.`
          : 'Account settings updated.';
      setSavedBanner(message);
      if (onNotify && key === 'enableEmailNotifications') {
        onNotify(message);
      }
      setTimeout(() => setSavedBanner(null), 3000);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onUpdateSettings({ ...settings, theme });
    setSavedBanner(`Theme changed to ${theme === 'dark' ? 'Dark Mode' : 'Light Mode'}.`);
    setTimeout(() => setSavedBanner(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top Section: Formatted PDF Resume Builder & Live Preview */}
      <section
        aria-label="Formatted PDF Resume Builder and Exporter"
        data-testid="pdf-resume-exporter"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Instant Career Document
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Includes <span className="font-mono tabular-nums">{resumePreviewData.skills.length}</span> skills &amp;{' '}
                <span className="font-mono tabular-nums">{resumePreviewData.trackedCertifications.length}</span> tracked certifications
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Student Profile &amp; Formatted PDF Resume Export
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Export your current profile details, calibrated technical skills, and tracked industry certifications into a clean A4 PDF resume (<code className="font-mono text-xs">{resumePreviewData.fileName}</code>).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportPdfResume}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Resume (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Export Status Banner */}
        {lastPdfExport && (
          <div
            role="status"
            data-testid="pdf-export-status"
            className="mt-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Successfully generated <strong>{lastPdfExport.fileName}</strong> ({Math.round(lastPdfExport.byteLength / 1024)} KB · A4 Portrait PDF) at {lastPdfExport.timestamp}
              </span>
            </div>
            <span className="font-mono tabular-nums">
              {resumePreviewData.skills.length} Skills · {resumePreviewData.trackedCertifications.length} Certifications Included
            </span>
          </div>
        )}

        {/* Resume Options & Live Document Sheet Preview */}
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 4 Cols: Export Customization Controls */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              PDF Resume Sections Included
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Profile Contact &amp; Summary
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Always Included</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Listed Skills ({resumePreviewData.skills.length})
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Always Included</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Tracked Certifications ({resumePreviewData.trackedCertifications.length})
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Always Included</span>
              </div>
              <label className="py-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Include Enrolled Courses ({resumePreviewData.enrolledCourses.length})
                </span>
                <input
                  type="checkbox"
                  checked={includeCoursesInPdf}
                  onChange={() => setIncludeCoursesInPdf((v) => !v)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="py-2.5 flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Include Applied Job Roles ({resumePreviewData.targetRoles.length})
                </span>
                <input
                  type="checkbox"
                  checked={includeTargetRolesInPdf}
                  onChange={() => setIncludeTargetRolesInPdf((v) => !v)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tip: Edit your profile name, headline, summary, or comma-separated skills in the form below to immediately update the live resume preview and exported PDF.
            </p>
          </div>

          {/* Right 8 Cols: Live Formatted Resume Sheet Preview */}
          <div className="lg:col-span-8 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Live PDF Resume Preview ({resumePreviewData.fileName})</span>
              <span className="font-mono">A4 Portrait · Vector PDF</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5">
              {/* Preview Header */}
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {resumePreviewData.fullName}
                </h3>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {resumePreviewData.headline}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  <span>{resumePreviewData.email}</span>
                  <span aria-hidden="true">·</span>
                  <span>{resumePreviewData.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>Verified via {resumePreviewData.oauthProvider} OAuth2</span>
                </div>
              </div>

              {/* Preview Summary */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Professional Summary
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {resumePreviewData.summary}
                </p>
              </div>

              {/* Preview Skills */}
              <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Technical Skills &amp; Proficiency ({resumePreviewData.skills.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                  {resumePreviewData.skills.map((sk) => (
                    <div key={sk.name} className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{sk.name}</span>
                      <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-semibold">
                        {sk.proficiency}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Tracked Certifications */}
              <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Tracked Industry Certifications ({resumePreviewData.trackedCertifications.length})
                </div>
                {resumePreviewData.trackedCertifications.length === 0 ? (
                  <p className="text-xs text-slate-500">No certifications tracked yet.</p>
                ) : (
                  <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
                    {resumePreviewData.trackedCertifications.map((cert) => (
                      <div key={cert.name} className="py-1.5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {cert.name}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400"> · {cert.issuer}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {cert.credentialUrl}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Courses (if enabled) */}
              {includeCoursesInPdf && resumePreviewData.enrolledCourses.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                  <div className="text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    Enrolled Coursework ({resumePreviewData.enrolledCourses.length})
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {resumePreviewData.enrolledCourses
                      .map((c) => `${c.title} (${c.provider})`)
                      .join(' · ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Resume Health Score Widget: Completeness Percentage, Pillar Breakdown & Actionable Tips */}
      <section
        aria-label="Resume Health Score"
        data-testid="resume-health-score-widget"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <HeartPulse className="w-4 h-4" />
              <span>Resume Health Score · Profile Completeness Diagnostic</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                Evaluates{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  Skills, Education History &amp; Certification Count
                </strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Resume Health Score &amp; Actionable Improvement Tips
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Calculates a real-time percentage score based on your profile summary, listed full-stack skills, academic education details, and tracked industry certifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Resume Health Score
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    data-testid="resume-health-overall-score"
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      resumeHealth.overallScore >= 95
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : resumeHealth.overallScore >= 80
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {resumeHealth.overallScore}%
                  </span>
                  <span
                    data-testid="resume-health-grade-badge"
                    className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded border ${
                      resumeHealth.overallScore >= 95
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : resumeHealth.overallScore >= 80
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {resumeHealth.gradeLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Completeness Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Overall Profile &amp; Resume Completeness
            </span>
            <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
              {resumeHealth.overallScore} / 100 pts ({resumeHealth.actionableTips.length === 0 ? 'All criteria met' : `${resumeHealth.actionableTips.length} improvements available`})
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Overall Resume Health Score"
            aria-valuenow={resumeHealth.overallScore}
            aria-valuemin={0}
            aria-valuemax={100}
            data-testid="resume-health-progress-bar"
            className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                resumeHealth.overallScore >= 95
                  ? 'bg-emerald-500'
                  : resumeHealth.overallScore >= 80
                  ? 'bg-indigo-600'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${resumeHealth.overallScore}%` }}
            />
          </div>
        </div>

        {/* 4 Pillar Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {resumeHealth.pillars.map((pillar) => {
            const isFull = pillar.earnedPoints >= pillar.maxPoints;
            return (
              <div
                key={pillar.id}
                data-testid={`resume-health-pillar-${pillar.id}`}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {pillar.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded border ${
                      isFull
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {pillar.earnedPoints}/{pillar.maxPoints} pts
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      isFull ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${pillar.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{pillar.statusLabel}</span>
                  <span>{pillar.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable Tips for Improvement & Completed Strengths */}
        <div
          data-testid="resume-health-tips-list"
          className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {resumeHealth.actionableTips.length > 0
                ? `Actionable Tips for Improvement (${resumeHealth.actionableTips.length})`
                : 'All Resume Health Benchmarks Completed (100%)'}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click any tip below to apply the improvement immediately
            </span>
          </div>

          {resumeHealth.actionableTips.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {resumeHealth.actionableTips.map((tip) => (
                <div
                  key={tip.id}
                  data-testid={`resume-health-tip-${tip.id}`}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-semibold rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {tip.category === 'Education' && <GraduationCap className="w-3 h-3" />}
                        {tip.category === 'Certifications' && <Award className="w-3 h-3" />}
                        {tip.category === 'Skills' && <Sparkles className="w-3 h-3" />}
                        <span>{tip.category}</span>
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        +{tip.impactPoints}% Score
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {tip.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>

                  {tip.actionType && tip.actionLabel && (
                    <button
                      type="button"
                      data-testid={`apply-health-tip-${tip.actionType}`}
                      onClick={() => handleApplyHealthTip(tip)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{tip.actionLabel}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              data-testid="resume-health-all-complete"
              className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200"
            >
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Your profile is 100% Recruiter-Ready across Skills, Education History (with CGPA &amp; Coursework), and 3+ Tracked Certifications!
                </span>
              </div>
              <span className="font-mono font-bold">100 / 100 pts</span>
            </div>
          )}
        </div>
      </section>

      {/* Skill Proficiency Tracker Section: Progress Bars & Manual Level Calibration */}
      <section
        aria-label="Skill Proficiency Tracker"
        data-testid="profile-skill-proficiency-tracker"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Skill Proficiency Tracker · Interactive Self-Assessment</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                Directly calibrates the{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  Skill Gap Analysis
                </strong>{' '}
                &amp; PDF Resume
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Skill Proficiency Tracker ({skillProficiencyList.length} Profile Skills)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Track your mastery across each skill in your profile with interactive progress bars. Manually switch any skill between{' '}
              <strong>Beginner (45%)</strong>, <strong>Intermediate (72%)</strong>, or <strong>Advanced (92%)</strong> — or fine-tune with the slider — to immediately recalculate your top skill gaps and role readiness below.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Average Skill Mastery
              </div>
              <div
                data-testid="skill-tracker-average-mastery"
                className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400"
              >
                {skillProficiencyList.length > 0
                  ? Math.round(
                      skillProficiencyList.reduce((acc, s) => acc + s.proficiency, 0) /
                        skillProficiencyList.length
                    )
                  : 0}
                %
              </div>
            </div>
            {Object.keys(skillProficiencies).length > 0 && (
              <button
                type="button"
                data-testid="reset-skill-proficiencies-btn"
                onClick={() => {
                  setSkillProficiencies({});
                  onUpdateProfile({
                    id: user?.id || 1,
                    oauthId: user?.oauthId || 'google-oauth2-student-101',
                    name: nameInput.trim() || 'Harish Ragavendran',
                    email: emailInput.trim() || 'harishragavendran56@gmail.com',
                    provider: user?.provider || 'Google',
                    headline: headlineInput.trim(),
                    location: locationInput.trim(),
                    summary: summaryInput.trim(),
                    skills: activeUserSkills,
                    skillProficiencies: {},
                    dob: user?.dob || 'Not provided by OAuth provider'
                  });
                  setSavedBanner('Reset all skill proficiencies to auto-calibrated values.');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Reset to Auto-Calibrated
              </button>
            )}
          </div>
        </div>

        {/* Grid of Skill Proficiency Cards with Progress Bars & Level Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillProficiencyList.map((item) => {
            const meetsBenchmark = item.proficiency >= item.industryBenchmark;
            const isCustomOverride = typeof skillProficiencies[item.skillKey] === 'number';
            const tiers: ProficiencyTier[] = ['Beginner', 'Intermediate', 'Advanced'];
            return (
              <div
                key={item.skillKey}
                data-testid={`skill-proficiency-card-${item.skillKey}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex flex-col justify-between space-y-3.5"
              >
                {/* Header: Skill Label & Tier Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.skillLabel}
                      </h3>
                      {isCustomOverride && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Manual
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      Target: {item.industryBenchmark}% ·{' '}
                      <span
                        className={
                          meetsBenchmark
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-amber-600 dark:text-amber-400 font-semibold'
                        }
                      >
                        {meetsBenchmark
                          ? 'Meets Benchmark'
                          : `-${item.industryBenchmark - item.proficiency}% Gap`}
                      </span>
                    </p>
                  </div>

                  <span
                    data-testid={`skill-tier-badge-${item.skillKey}`}
                    className={`px-2.5 py-0.5 text-[11px] font-mono font-bold rounded border shrink-0 ${
                      item.tier === 'Advanced'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : item.tier === 'Intermediate'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {item.tier} · {item.proficiency}%
                  </span>
                </div>

                {/* Progress Bar with Industry Target Marker */}
                <div className="space-y-1.5">
                  <div
                    role="progressbar"
                    aria-label={`${item.skillLabel} proficiency`}
                    aria-valuenow={item.proficiency}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    data-testid={`skill-progress-bar-${item.skillKey}`}
                    className="relative h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        item.tier === 'Advanced'
                          ? 'bg-emerald-500'
                          : item.tier === 'Intermediate'
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.proficiency}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-900 dark:bg-white"
                      style={{ left: `${item.industryBenchmark}%` }}
                      title={`Industry Target: ${item.industryBenchmark}%`}
                    />
                  </div>

                  {/* Fine-tune Range Slider */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="range"
                      min={15}
                      max={100}
                      step={1}
                      aria-label={`Adjust ${item.skillLabel} proficiency percentage`}
                      data-testid={`skill-slider-${item.skillKey}`}
                      value={item.proficiency}
                      onChange={(e) =>
                        handleUpdateSkillLevel(
                          item.skillKey,
                          item.skillLabel,
                          Number(e.target.value)
                        )
                      }
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Level Selector Buttons: Beginner / Intermediate / Advanced */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {tiers.map((tier) => {
                    const isActive = item.tier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        data-testid={`skill-level-btn-${item.skillKey}-${tier}`}
                        onClick={() =>
                          handleUpdateSkillLevel(item.skillKey, item.skillLabel, tier)
                        }
                        className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tier}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Skill Gap Analysis Summary Section: Top 3 Missing Skills & Suggested Learning Courses */}
      <section
        aria-label="Skill Gap Analysis"
        data-testid="profile-skill-gap-analysis"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Skill Gap Analysis · Saved Job Role Requirements</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                Benchmarked against{' '}
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  {skillGapSummary.benchmarkedRoleNames.join(', ')}
                </strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Top 3 Missing Skills &amp; Recommended Upskilling Courses
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Highlights the top 3 missing or under-indexed skills required by your saved job roles and pairs each gap with targeted learning courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Role Readiness Score
              </div>
              <div className="text-base font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                {skillGapSummary.overallReadinessScore}%
              </div>
            </div>
            {onNavigateToLearning && (
              <button
                type="button"
                onClick={() => onNavigateToLearning()}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Explore All 30 Courses →
              </button>
            )}
          </div>
        </div>

        {/* 3-Column Grid of Top 3 Missing Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {skillGapSummary.topMissingSkills.map((gapItem) => {
            const isStrictlyMissing = gapItem.status === 'Missing from Profile';
            return (
              <article
                key={gapItem.skillKey}
                data-testid={`skill-gap-card-${gapItem.rank}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Priority Badge & Gap Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-[11px] font-mono font-bold rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Priority Gap #{gapItem.rank}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded border ${
                        isStrictlyMissing
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isStrictlyMissing
                        ? `Missing Skill (-${gapItem.gapPoints}%)`
                        : `-${gapItem.gapPoints}% Proficiency Gap`}
                    </span>
                  </div>

                  {/* Skill Name & Demanding Roles */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {gapItem.skillLabel}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Required for:{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {gapItem.requiredByRoles.join(' · ')}
                      </span>
                    </p>
                  </div>

                  {/* Proficiency Comparison Bar */}
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span className="text-slate-500 dark:text-slate-400">
                        Your Level:{' '}
                        <strong className="text-slate-900 dark:text-slate-100">
                          {gapItem.studentProficiency}%
                        </strong>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Target: {gapItem.industryRequirement}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-amber-500 rounded-full"
                        style={{ width: `${gapItem.studentProficiency}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 dark:bg-indigo-400"
                        style={{ left: `${gapItem.industryRequirement}%` }}
                        title={`Industry Standard: ${gapItem.industryRequirement}%`}
                      />
                    </div>
                  </div>

                  {/* Suggested Learning Courses */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Suggested Learning Courses</span>
                    </div>

                    <div className="space-y-2">
                      {gapItem.suggestedCourses.map((course) => {
                        const isEnrolled = enrolledCourseIds.includes(course.id);
                        return (
                          <div
                            key={course.id}
                            data-testid={`suggested-course-${gapItem.rank}-${course.id}`}
                            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {course.title}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {course.provider} · {course.level || 'Self-Paced'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                              <a
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <span>Course Syllabus</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              {onToggleCourseEnroll && (
                                <button
                                  type="button"
                                  onClick={() => onToggleCourseEnroll(course)}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                                    isEnrolled
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  }`}
                                >
                                  {isEnrolled ? 'Enrolled ✓' : 'Enroll Course'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Add Missing Skill to Profile or Filter Learning */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isStrictlyMissing ? (
                    <button
                      type="button"
                      data-testid={`add-missing-skill-${gapItem.skillKey}`}
                      onClick={() => handleQuickAddSkill(gapItem.skillKey)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add #{gapItem.skillKey} to Profile</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Listed in Profile Skills</span>
                    </span>
                  )}

                  {onNavigateToLearning && (
                    <button
                      type="button"
                      onClick={() => onNavigateToLearning(gapItem.skillKey)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      More #{gapItem.skillKey} tracks →
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Bottom 2-Column Split: Profile Editor (Left) & Account Settings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile Card & OAuth Session + Editor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                  {user ? user.name.slice(0, 2).toUpperCase() : 'JN'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {user ? user.name : 'Not Logged In'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user ? `${user.email} · ${user.provider} OAuth2` : 'Sign in with Google or GitHub below'}
                  </p>
                </div>
              </div>
            </div>

            {/* OAuth2 Login & Third-Party Integration Controls */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Connected Account Sign-In
                </span>
                <div className="flex items-center gap-2">
                  <span
                    data-testid="linkedin-connection-health-pill"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono font-semibold rounded-full border transition-all ${linkedInHealth.badgeClass}`}
                    title={`LinkedIn Connection Health: ${linkedInHealth.statusLabel} · ${linkedInHealth.displayText}`}
                  >
                    <span
                      data-testid="linkedin-health-pill-dot"
                      className={`w-1.5 h-1.5 rounded-full ${linkedInHealth.dotColorClass} ${
                        linkedInHealth.isOnline ? 'animate-pulse' : ''
                      }`}
                    />
                    <span data-testid="linkedin-connection-health-pill-text">
                      {user?.linkedInConnected ? linkedInHealth.displayText : 'LinkedIn: Disconnected'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onLoginProvider('Google')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLoginProvider('GitHub')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-950 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login with GitHub</span>
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>

              {/* LinkedIn Account Connection & Profile Import Hub */}
              <div
                data-testid="linkedin-integration-panel"
                className="mt-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      in
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>LinkedIn Integration</span>
                        <span
                          data-testid="linkedin-connection-health-badge"
                          className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold font-mono ${linkedInHealth.badgeClass}`}
                        >
                          <span data-testid="linkedin-connection-health-label">
                            {linkedInHealth.statusLabel}
                          </span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user?.linkedInConnected
                          ? `Imported work history & professional summary · ${workHistory.length} roles`
                          : 'Connect your LinkedIn account to import work history, summary & skills.'}
                      </div>
                    </div>
                  </div>

                  {user?.linkedInConnected ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid="reimport-linkedin-btn"
                        onClick={handleDirectImportLinkedIn}
                        disabled={isConnectingLinkedIn}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#0A66C2] bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg border border-[#0A66C2]/30 transition-colors cursor-pointer"
                        title="Re-sync work experience and summary from LinkedIn"
                      >
                        <RefreshCw className={`w-3 h-3 ${isConnectingLinkedIn ? 'animate-spin' : ''}`} />
                        <span>Re-sync</span>
                      </button>
                      <button
                        type="button"
                        data-testid="disconnect-linkedin-btn"
                        onClick={handleDisconnectLinkedIn}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                        title="Disconnect LinkedIn account"
                      >
                        <Unlink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid="connect-linkedin-btn"
                        onClick={handleConnectLinkedIn}
                        disabled={isConnectingLinkedIn}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        {isConnectingLinkedIn ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Connecting...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold">in</span>
                            <span>Connect LinkedIn</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        data-testid="direct-import-linkedin-btn"
                        onClick={handleDirectImportLinkedIn}
                        disabled={isConnectingLinkedIn}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                        title="1-Click Direct Import without popup window"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Import</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Explicit Connection Health Visual Indicator */}
                <div
                  data-testid="linkedin-connection-health-indicator"
                  className="pt-2.5 border-t border-slate-200/90 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          data-testid="linkedin-health-status-dot"
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${linkedInHealth.dotColorClass} ${
                            linkedInHealth.isOnline ? 'animate-pulse' : ''
                          }`}
                          aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Connection Health:
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {linkedInHealth.status === 'Healthy'
                          ? 'Optimal Sync'
                          : linkedInHealth.status === 'Stale'
                          ? 'Stale Sync'
                          : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Health Indicator:</span>
                      <span
                        data-testid="linkedin-connection-health-time"
                        className="font-mono font-bold text-slate-900 dark:text-slate-100"
                      >
                        {linkedInHealth.displayText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{linkedInHealth.actionRecommendation}</span>
                    <span className="font-mono font-semibold shrink-0 text-slate-700 dark:text-slate-300">
                      Score: {linkedInHealth.healthScorePct}%
                    </span>
                  </div>

                  {/* Health score meter */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      data-testid="linkedin-health-progress-bar"
                      className={`h-full transition-all duration-300 ${
                        linkedInHealth.status === 'Healthy'
                          ? 'bg-emerald-500'
                          : linkedInHealth.status === 'Stale'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${linkedInHealth.healthScorePct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Update Student Profile &amp; Skills
              </h3>
            </div>

            {validationError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
                {validationError}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label htmlFor="profile-name-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="profile-email-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  id="profile-email-input"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="profile-headline-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Career Headline
                </label>
                <input
                  id="profile-headline-input"
                  type="text"
                  value={headlineInput}
                  onChange={(e) => setHeadlineInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="profile-location-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Location
                </label>
                <input
                  id="profile-location-input"
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="profile-summary-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Professional Summary
                  </label>
                  <button
                    type="button"
                    data-testid="sync-linkedin-summary-btn"
                    onClick={() => {
                      setSummaryInput(SEED_LINKEDIN_PROFILE_SUMMARY);
                      setHeadlineInput(SEED_LINKEDIN_HEADLINE);
                      setSavedBanner('Applied LinkedIn professional summary & headline into form.');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A66C2] hover:underline cursor-pointer"
                    title="Fill summary and headline from LinkedIn"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Sync from LinkedIn</span>
                  </button>
                </div>
                <textarea
                  id="profile-summary-input"
                  data-testid="profile-summary-input"
                  rows={3}
                  value={summaryInput}
                  onChange={(e) => setSummaryInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="profile-education-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Education History (Degree, University, Graduation Year &amp; CGPA)
                </label>
                <input
                  id="profile-education-input"
                  data-testid="profile-education-input"
                  type="text"
                  value={educationInput}
                  onChange={(e) => setEducationInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="profile-skills-input" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  id="profile-skills-input"
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
              <button
                type="button"
                onClick={handleExportPdfResume}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Save &amp; Export PDF</span>
              </button>
            </div>
          </form>

          {/* Work Experience & LinkedIn History Section */}
          <section
            aria-label="Work Experience & LinkedIn History"
            data-testid="profile-work-history-section"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Work Experience &amp; Internships
                  </h3>
                  <span
                    data-testid="work-history-count-badge"
                    className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    {workHistory.length} {workHistory.length === 1 ? 'Role' : 'Roles'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Imported directly from your connected LinkedIn profile or added manually.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="import-work-history-linkedin-btn"
                  onClick={handleDirectImportLinkedIn}
                  disabled={isConnectingLinkedIn}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnectingLinkedIn ? 'animate-spin' : ''}`} />
                  <span>Import from LinkedIn</span>
                </button>
                <button
                  type="button"
                  data-testid="add-work-experience-btn"
                  onClick={() => setShowAddWorkModal(!showAddWorkModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{showAddWorkModal ? 'Close Form' : 'Add Role'}</span>
                </button>
              </div>
            </div>

            {/* Inline Add Work Experience Form */}
            {showAddWorkModal && (
              <form
                onSubmit={handleSaveNewWorkExperience}
                data-testid="add-work-experience-form"
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Add Work Experience Role
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddWorkModal(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Role / Position Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Software Engineering Intern"
                      value={newWorkTitle}
                      onChange={(e) => setNewWorkTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TechCorp India"
                      value={newWorkCompany}
                      onChange={(e) => setNewWorkCompany(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2024"
                      value={newWorkStartDate}
                      onChange={(e) => setNewWorkStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      placeholder={newWorkCurrent ? 'Present' : 'e.g. Dec 2024'}
                      disabled={newWorkCurrent}
                      value={newWorkCurrent ? 'Present' : newWorkEndDate}
                      onChange={(e) => setNewWorkEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai (Hybrid)"
                      value={newWorkLocation}
                      onChange={(e) => setNewWorkLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWorkCurrent}
                    onChange={(e) => setNewWorkCurrent(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    I currently work in this role
                  </span>
                </label>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Key Achievements / Project Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Built REST microservices in Spring Boot, reduced API latency by 28%..."
                    value={newWorkDescription}
                    onChange={(e) => setNewWorkDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Skills Used (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="java, springboot, mysql, docker"
                    value={newWorkSkills}
                    onChange={(e) => setNewWorkSkills(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddWorkModal(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Save Role
                  </button>
                </div>
              </form>
            )}

            {/* List of Work Experience Items */}
            {workHistory.length > 0 ? (
              <div className="space-y-3" data-testid="work-history-cards-list">
                {workHistory.map((item, index) => (
                  <article
                    key={item.id || index}
                    data-testid={`work-experience-card-${index}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          {item.importedFrom === 'LinkedIn' && (
                            <span
                              data-testid={`badge-imported-linkedin-${index}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20"
                            >
                              <span>in</span>
                              <span>LinkedIn</span>
                            </span>
                          )}
                          {item.current && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Current Role
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{item.company}</span>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{formatWorkExperienceDuration(item)}</span>
                          </span>
                          {item.location && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.location}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid={`delete-work-experience-${item.id || index}`}
                        onClick={() => handleDeleteWorkExperience(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Remove work experience entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.skillsUsed && item.skillsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                        {item.skillsUsed.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 text-[11px] font-mono rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            #{sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div
                data-testid="work-history-empty-card"
                className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] mx-auto flex items-center justify-center font-bold text-sm">
                  in
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    No Work Experience Logged Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Connect your LinkedIn profile to import your software engineering internships, technical leadership roles, and professional summary automatically.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    data-testid="empty-connect-linkedin-btn"
                    onClick={handleDirectImportLinkedIn}
                    disabled={isConnectingLinkedIn}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <span className="font-bold">in</span>
                    <span>Import Experience from LinkedIn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddWorkModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Manually</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Account Settings */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Account Settings &amp; Preferences
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your account visibility, notifications, theme, and privacy.
                </p>
              </div>
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            {savedBanner && (
              <div
                role="status"
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedBanner}</span>
              </div>
            )}

            {/* Account Preferences */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Account Preferences
              </h3>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">Show profile publicly</span>
                <input
                  type="checkbox"
                  checked={settings.showProfilePublicly}
                  onChange={() => handleToggleSetting('showProfilePublicly')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">Receive job alerts via email</span>
                <input
                  type="checkbox"
                  checked={settings.receiveJobAlertsEmail}
                  onChange={() => handleToggleSetting('receiveJobAlertsEmail')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">Enable two-factor authentication</span>
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactorAuth}
                  onChange={() => handleToggleSetting('enableTwoFactorAuth')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Career Preferences: Minimum & Maximum Expected CTC Sliders (LPA) */}
            <div
              data-testid="career-preferences-expected-ctc"
              className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Career Preferences · Expected Salary Range (LPA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust the sliders to define your Minimum Expected CTC and Maximum Expected CTC. Persists in your userSettings state and benchmarks saved jobs in the Jobs Bar Chart.
                  </p>
                </div>
                <span
                  data-testid="expected-ctc-range-badge"
                  className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-mono font-bold text-teal-700 dark:text-teal-300 tabular-nums"
                >
                  {settings.expectedSalaryMinLpa.toFixed(1)} – {settings.expectedSalaryMaxLpa.toFixed(1)} LPA
                </span>
              </div>

              {/* Visual Salary Range Track & Summary Readout */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">
                    Minimum:{' '}
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {settings.expectedSalaryMinLpa.toFixed(1)} LPA
                    </strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Target Midpoint:{' '}
                    <strong className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      {((settings.expectedSalaryMinLpa + settings.expectedSalaryMaxLpa) / 2).toFixed(1)} LPA
                    </strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Maximum:{' '}
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {settings.expectedSalaryMaxLpa.toFixed(1)} LPA
                    </strong>
                  </span>
                </div>

                <div className="relative h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-teal-500 dark:bg-teal-400 rounded-full transition-all"
                    style={{
                      left: `${Math.max(0, ((settings.expectedSalaryMinLpa - 2) / 48) * 100)}%`,
                      width: `${Math.max(
                        3,
                        ((settings.expectedSalaryMaxLpa - settings.expectedSalaryMinLpa) / 48) * 100
                      )}%`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tabular-nums">
                  <span>2.0 LPA</span>
                  <span>15.0 LPA</span>
                  <span>30.0 LPA</span>
                  <span>50.0 LPA</span>
                </div>
              </div>

              {/* Pair of Sliders: Minimum Expected CTC & Maximum Expected CTC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="slider-expected-ctc-min"
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Minimum Expected CTC
                    </label>
                    <span
                      data-testid="min-expected-ctc-value"
                      className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums"
                    >
                      {settings.expectedSalaryMinLpa.toFixed(1)} LPA
                    </span>
                  </div>

                  <input
                    id="slider-expected-ctc-min"
                    data-testid="slider-expected-ctc-min"
                    type="range"
                    aria-label="Minimum Expected CTC"
                    min={2}
                    max={45}
                    step={0.5}
                    value={settings.expectedSalaryMinLpa}
                    onChange={(e) => {
                      const nextSettings = updateExpectedSalarySettings(
                        settings,
                        'min',
                        Number(e.target.value)
                      );
                      onUpdateSettings(nextSettings);
                      setSavedBanner(
                        `Minimum Expected CTC updated (${nextSettings.expectedSalaryMinLpa.toFixed(1)} – ${nextSettings.expectedSalaryMaxLpa.toFixed(1)} LPA).`
                      );
                    }}
                    className="w-full h-2 accent-indigo-600 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label
                      htmlFor="settings-expected-salary-min"
                      className="text-[11px] text-slate-500 dark:text-slate-400"
                    >
                      Exact Min (LPA):
                    </label>
                    <input
                      id="settings-expected-salary-min"
                      type="number"
                      step="0.5"
                      min={2}
                      max={45}
                      value={settings.expectedSalaryMinLpa}
                      onChange={(e) => {
                        const nextSettings = updateExpectedSalarySettings(
                          settings,
                          'min',
                          Number(e.target.value)
                        );
                        onUpdateSettings(nextSettings);
                        setSavedBanner(
                          `Expected salary range updated to ${nextSettings.expectedSalaryMinLpa.toFixed(1)} – ${nextSettings.expectedSalaryMaxLpa.toFixed(1)} LPA.`
                        );
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="slider-expected-ctc-max"
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                    >
                      Maximum Expected CTC
                    </label>
                    <span
                      data-testid="max-expected-ctc-value"
                      className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums"
                    >
                      {settings.expectedSalaryMaxLpa.toFixed(1)} LPA
                    </span>
                  </div>

                  <input
                    id="slider-expected-ctc-max"
                    data-testid="slider-expected-ctc-max"
                    type="range"
                    aria-label="Maximum Expected CTC"
                    min={2}
                    max={50}
                    step={0.5}
                    value={settings.expectedSalaryMaxLpa}
                    onChange={(e) => {
                      const nextSettings = updateExpectedSalarySettings(
                        settings,
                        'max',
                        Number(e.target.value)
                      );
                      onUpdateSettings(nextSettings);
                      setSavedBanner(
                        `Maximum Expected CTC updated (${nextSettings.expectedSalaryMinLpa.toFixed(1)} – ${nextSettings.expectedSalaryMaxLpa.toFixed(1)} LPA).`
                      );
                    }}
                    className="w-full h-2 accent-teal-600 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label
                      htmlFor="settings-expected-salary-max"
                      className="text-[11px] text-slate-500 dark:text-slate-400"
                    >
                      Exact Max (LPA):
                    </label>
                    <input
                      id="settings-expected-salary-max"
                      type="number"
                      step="0.5"
                      min={2}
                      max={50}
                      value={settings.expectedSalaryMaxLpa}
                      onChange={(e) => {
                        const nextSettings = updateExpectedSalarySettings(
                          settings,
                          'max',
                          Number(e.target.value)
                        );
                        onUpdateSettings(nextSettings);
                        setSavedBanner(
                          `Expected salary range updated to ${nextSettings.expectedSalaryMinLpa.toFixed(1)} – ${nextSettings.expectedSalaryMaxLpa.toFixed(1)} LPA.`
                        );
                      }}
                      className="w-24 px-2.5 py-1 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                <span
                  className={`text-xs font-mono font-semibold ${
                    settings.enableEmailNotifications
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Status Email Alerts: {settings.enableEmailNotifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <label
                htmlFor="settings-enable-email-notifications"
                className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <div className="pr-4">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Email notifications for application status changes
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Send instant email alerts to <span className="font-mono">{user?.email || 'your account'}</span> whenever a job application moves between Applied, Interviewing, Offer Received, or Rejected.
                  </div>
                </div>
                <input
                  id="settings-enable-email-notifications"
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={() => handleToggleSetting('enableEmailNotifications')}
                  aria-label="Enable email notifications for application status changes"
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">Push notifications for new internships</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggleSetting('pushNotifications')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">Weekly career tips digest</span>
                <input
                  type="checkbox"
                  checked={settings.weeklyCareerTips}
                  onChange={() => handleToggleSetting('weeklyCareerTips')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Theme */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Interface Theme
              </h3>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-700 dark:text-slate-300">Choose appearance mode</span>
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Privacy
              </h3>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Share learning progress with employers
                </span>
                <input
                  type="checkbox"
                  checked={settings.shareLearningProgress}
                  onChange={() => handleToggleSetting('shareLearningProgress')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Show certification badges publicly
                </span>
                <input
                  type="checkbox"
                  checked={settings.showCertificationBadges}
                  onChange={() => handleToggleSetting('showCertificationBadges')}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
