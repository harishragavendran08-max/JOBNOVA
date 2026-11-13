import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileDown,
  Linkedin,
  Plus,
  Printer,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Target,
  Trash2,
  UserCheck
} from 'lucide-react';
import {
  CertificationItem,
  CourseItem,
  DEFAULT_USER_PROFILE,
  InternshipItem,
  JobItem,
  SEED_LINKEDIN_WORK_HISTORY,
  UserProfile,
  WorkExperienceItem
} from '../data/seedData';
import { exportStudentResumePdf, GeneratedPdfResult } from '../utils/pdfResumeGenerator';
import {
  buildResumeDraftFromProfile,
  buildResumeFileSlug,
  convertDraftToPdfDocument,
  DEFAULT_RESUME_VISIBILITY,
  evaluateResumeAtsMatch,
  formatResumeSkillLabel,
  ResumeSectionVisibility,
  ResumeTemplateId,
  serializePrimaryEducation,
  StructuredResumeDraft
} from '../utils/resumeBuilderLogic';

interface ResumeBuilderViewProps {
  user: UserProfile | null;
  certifications: CertificationItem[];
  savedCertIds: number[];
  courses: CourseItem[];
  enrolledCourseIds: number[];
  jobs: JobItem[];
  appliedJobIds: number[];
  internships: InternshipItem[];
  appliedInternshipIds: number[];
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToProfile: () => void;
  onNotify?: (message: string) => void;
}

type EditorPanelTab = 'content' | 'experience' | 'customize';

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  user,
  certifications,
  savedCertIds,
  courses,
  enrolledCourseIds,
  jobs,
  appliedJobIds,
  internships,
  appliedInternshipIds,
  onUpdateProfile,
  onNavigateToProfile,
  onNotify
}) => {
  const initialDraft = useMemo(
    () =>
      buildResumeDraftFromProfile({
        user,
        certifications,
        savedCertIds,
        courses,
        enrolledCourseIds,
        jobs,
        appliedJobIds,
        internships,
        appliedInternshipIds
      }),
    [
      user,
      certifications,
      savedCertIds,
      courses,
      enrolledCourseIds,
      jobs,
      appliedJobIds,
      internships,
      appliedInternshipIds
    ]
  );

  const [draft, setDraft] = useState<StructuredResumeDraft>(initialDraft);
  const [skillsText, setSkillsText] = useState<string>(
    (user?.skills || DEFAULT_USER_PROFILE.skills).join(', ')
  );
  const [template, setTemplate] = useState<ResumeTemplateId>('modern');
  const [visibility, setVisibility] = useState<ResumeSectionVisibility>(DEFAULT_RESUME_VISIBILITY);
  const [editorTab, setEditorTab] = useState<EditorPanelTab>('content');
  const [targetJobId, setTargetJobId] = useState<number>(
    appliedJobIds[0] || jobs[0]?.id || 1
  );
  const [compactZoom, setCompactZoom] = useState(false);
  const [hasLocalEdits, setHasLocalEdits] = useState(false);
  const [lastPdfExport, setLastPdfExport] = useState<GeneratedPdfResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Add Experience inline form state
  const [showAddExpForm, setShowAddExpForm] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expLocation, setExpLocation] = useState('Chennai, India');
  const [expStartDate, setExpStartDate] = useState('Jun 2025');
  const [expEndDate, setExpEndDate] = useState('Present');
  const [expCurrent, setExpCurrent] = useState(true);
  const [expDescription, setExpDescription] = useState('');
  const [expSkills, setExpSkills] = useState('java, springboot, react, mysql');

  // Re-sync live from UserProfile & career tracking records unless the user has uncommitted local overrides
  useEffect(() => {
    if (!hasLocalEdits) {
      setDraft(initialDraft);
      setSkillsText((user?.skills || DEFAULT_USER_PROFILE.skills).join(', '));
    }
  }, [initialDraft, hasLocalEdits, user?.skills]);

  const targetJob = useMemo(
    () => jobs.find((j) => j.id === targetJobId) || jobs[0] || null,
    [jobs, targetJobId]
  );

  const atsMatch = useMemo(
    () => evaluateResumeAtsMatch({ draft, targetJob }),
    [draft, targetJob]
  );

  const handleFieldChange = <K extends keyof StructuredResumeDraft>(
    key: K,
    value: StructuredResumeDraft[K]
  ) => {
    setHasLocalEdits(true);
    setDraft((prev) => ({
      ...prev,
      [key]: value,
      fileName: key === 'fullName' ? buildResumeFileSlug(String(value)) : prev.fileName
    }));
  };

  const handleEducationChange = (
    field: 'degree' | 'institution' | 'period' | 'highlights',
    value: string
  ) => {
    setHasLocalEdits(true);
    setDraft((prev) => {
      const currentFirst = prev.educationEntries[0] || {
        id: 'edu-1',
        degree: '',
        institution: '',
        period: '',
        highlights: ''
      };
      return {
        ...prev,
        educationEntries: [{ ...currentFirst, [field]: value }, ...prev.educationEntries.slice(1)]
      };
    });
  };

  const handleSkillsTextChange = (rawValue: string) => {
    setHasLocalEdits(true);
    setSkillsText(rawValue);
    const parsedKeys = rawValue
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const nextSkills = parsedKeys.map((key) => {
      const existing = draft.skills.find((sk) => sk.key === key);
      return (
        existing || {
          key,
          name: formatResumeSkillLabel(key),
          proficiency: 78
        }
      );
    });

    setDraft((prev) => ({
      ...prev,
      skills: nextSkills
    }));
  };

  const handleQuickAddSkill = (skillKey: string) => {
    const clean = skillKey.trim().toLowerCase();
    if (!clean) return;
    if (draft.skills.some((s) => s.key === clean)) return;
    const nextText = skillsText.trim() ? `${skillsText.trim()}, ${clean}` : clean;
    handleSkillsTextChange(nextText);
    const msg = `Added "${formatResumeSkillLabel(clean)}" to your resume skills.`;
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handleImportLinkedInExperience = () => {
    setHasLocalEdits(true);
    const mergedMap = new Map<string, WorkExperienceItem>();
    [...SEED_LINKEDIN_WORK_HISTORY, ...draft.experiences].forEach((item) => {
      mergedMap.set(item.id, item);
    });
    const nextExperiences = Array.from(mergedMap.values());
    setDraft((prev) => ({
      ...prev,
      experiences: nextExperiences
    }));
    const msg = `Loaded ${SEED_LINKEDIN_WORK_HISTORY.length} experience entries from LinkedIn profile template.`;
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handleAddExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expCompany.trim()) return;

    setHasLocalEdits(true);
    const parsedExpSkills = expSkills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const newEntry: WorkExperienceItem = {
      id: `exp-resume-${Date.now()}`,
      title: expTitle.trim(),
      company: expCompany.trim(),
      location: expLocation.trim() || draft.location,
      startDate: expStartDate.trim() || '2025',
      endDate: expCurrent ? 'Present' : expEndDate.trim() || 'Present',
      current: expCurrent,
      description:
        expDescription.trim() ||
        'Designed and implemented full-stack features using Java, Spring Boot, React.js, and MySQL.',
      skillsUsed: parsedExpSkills,
      importedFrom: 'Manual'
    };

    setDraft((prev) => ({
      ...prev,
      experiences: [newEntry, ...prev.experiences]
    }));

    setExpTitle('');
    setExpCompany('');
    setExpDescription('');
    setShowAddExpForm(false);

    const msg = `Added "${newEntry.title}" at ${newEntry.company} to your resume.`;
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handleRemoveExperience = (id: string) => {
    setHasLocalEdits(true);
    setDraft((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id)
    }));
  };

  const handleSyncFromProfile = () => {
    const fresh = buildResumeDraftFromProfile({
      user,
      certifications,
      savedCertIds,
      courses,
      enrolledCourseIds,
      jobs,
      appliedJobIds,
      internships,
      appliedInternshipIds
    });
    setDraft(fresh);
    setSkillsText((user?.skills || DEFAULT_USER_PROFILE.skills).join(', '));
    setHasLocalEdits(false);
    const msg = 'Pulled latest details, certifications, coursework, and work history from your JobNova profile.';
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handleSaveToProfile = () => {
    const base = user || DEFAULT_USER_PROFILE;
    const primaryEdu = serializePrimaryEducation(draft.educationEntries[0]);
    const updatedSkills = draft.skills.map((s) => s.key);

    onUpdateProfile({
      ...base,
      name: draft.fullName.trim() || base.name,
      email: draft.email.trim() || base.email,
      headline: draft.headline.trim() || base.headline,
      location: draft.location.trim() || base.location,
      summary: draft.summary.trim() || base.summary,
      education: primaryEdu || base.education,
      skills: updatedSkills.length > 0 ? updatedSkills : base.skills,
      linkedInProfileUrl: draft.linkedInProfileUrl.trim() || base.linkedInProfileUrl,
      workHistory: draft.experiences
    });

    setHasLocalEdits(false);
    const msg = 'Saved Resume Builder updates directly to your JobNova Profile.';
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handleExportPdf = () => {
    const pdfDoc = convertDraftToPdfDocument({
      draft,
      visibility,
      template
    });
    const result = exportStudentResumePdf(pdfDoc, {
      template,
      includeCourses: visibility.showCourses,
      includeTargetRoles: visibility.showTargetRoles,
      visibility
    });
    setLastPdfExport(result);
    const msg = `Downloaded PDF resume: ${result.fileName} (${Math.max(1, Math.round(result.byteLength / 1024))} KB)`;
    setStatusMessage(msg);
    if (onNotify) onNotify(msg);
  };

  const handlePrintResume = () => {
    window.print();
  };

  const primaryEducation = draft.educationEntries[0] || {
    id: 'edu-1',
    degree: '',
    institution: '',
    period: '',
    highlights: ''
  };

  const isClassic = template === 'classic';
  const isCompact = template === 'compact';

  const contactItems = [
    draft.email,
    draft.phone,
    draft.location,
    visibility.showLinkedInUrl
      ? draft.linkedInProfileUrl.replace(/^https?:\/\/(www\.)?/, '')
      : '',
    draft.githubOrPortfolioUrl.replace(/^https?:\/\/(www\.)?/, '')
  ].filter(Boolean);

  return (
    <div className="space-y-6" data-testid="resume-builder-view">
      {/* Studio Top Bar Card */}
      <section className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-[#2557A7] dark:text-blue-400">
                Resume Builder Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Synced with <strong className="text-slate-800 dark:text-slate-200">{user ? user.name : 'Student Profile'}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {draft.skills.length} skills · {draft.experiences.length} experience · {draft.trackedCertifications.length} certs
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Build &amp; Export Your Professional Resume
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Automatically pulls your contact details, education, work history, verified skills, and certifications from your JobNova profile into a clean ATS-friendly A4 layout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              data-testid="resume-sync-profile-btn"
              onClick={handleSyncFromProfile}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] hover:text-[#2557A7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Pull Profile Data</span>
            </button>

            <button
              type="button"
              data-testid="resume-save-profile-btn"
              onClick={handleSaveToProfile}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                hasLocalEdits
                  ? 'border-[#087F31] bg-emerald-50 dark:bg-emerald-950/40 text-[#087F31] dark:text-emerald-300 hover:bg-emerald-100'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7]'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{hasLocalEdits ? 'Save Changes to Profile' : 'Synced with Profile'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintResume}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              data-testid="resume-export-pdf-btn"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Resume</span>
            </button>
          </div>
        </div>

        {/* Status Feedback Banner */}
        {(lastPdfExport || statusMessage) && (
          <div
            role="status"
            data-testid="resume-pdf-export-status"
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs font-medium text-[#087F31] dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {lastPdfExport
                  ? `Exported ${lastPdfExport.fileName} (${Math.max(1, Math.round(lastPdfExport.byteLength / 1024))} KB · ${lastPdfExport.pageCount} page${lastPdfExport.pageCount > 1 ? 's' : ''} · ${template} template) at ${lastPdfExport.timestamp}`
                  : statusMessage}
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="font-semibold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Edit full account settings →
            </button>
          </div>
        )}
      </section>

      {/* Main Split Studio: Left Editor (5 Cols) + Right A4 Resume Sheet Preview (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Editor Controls, Experience Manager & ATS Tailor */}
        <aside className="no-print lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {/* Segmented Tabs */}
          <div
            role="tablist"
            aria-label="Resume Builder Editor Sections"
            className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50"
          >
            <button
              type="button"
              role="tab"
              aria-selected={editorTab === 'content'}
              data-testid="resume-tab-content"
              onClick={() => setEditorTab('content')}
              className={`py-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                editorTab === 'content'
                  ? 'border-[#2557A7] text-[#2557A7] dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Profile &amp; Skills
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorTab === 'experience'}
              data-testid="resume-tab-experience"
              onClick={() => setEditorTab('experience')}
              className={`py-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                editorTab === 'experience'
                  ? 'border-[#2557A7] text-[#2557A7] dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Experience ({draft.experiences.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={editorTab === 'customize'}
              data-testid="resume-tab-customize"
              onClick={() => setEditorTab('customize')}
              className={`py-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                editorTab === 'customize'
                  ? 'border-[#2557A7] text-[#2557A7] dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Layout &amp; ATS
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* TAB 1: PROFILE, SUMMARY, EDUCATION & SKILLS */}
            {editorTab === 'content' && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Contact &amp; Header Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="resume-fullname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        id="resume-fullname"
                        data-testid="resume-input-fullname"
                        type="text"
                        value={draft.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="resume-location" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Location
                      </label>
                      <input
                        id="resume-location"
                        type="text"
                        value={draft.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="resume-headline" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Role Headline
                    </label>
                    <input
                      id="resume-headline"
                      data-testid="resume-input-headline"
                      type="text"
                      value={draft.headline}
                      onChange={(e) => handleFieldChange('headline', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="resume-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email
                      </label>
                      <input
                        id="resume-email"
                        type="email"
                        value={draft.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="resume-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone (optional)
                      </label>
                      <input
                        id="resume-phone"
                        type="text"
                        placeholder="+91 98400 00000"
                        value={draft.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="resume-linkedin" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        id="resume-linkedin"
                        type="text"
                        value={draft.linkedInProfileUrl}
                        onChange={(e) => handleFieldChange('linkedInProfileUrl', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="resume-github" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        GitHub / Portfolio
                      </label>
                      <input
                        id="resume-github"
                        type="text"
                        value={draft.githubOrPortfolioUrl}
                        onChange={(e) => handleFieldChange('githubOrPortfolioUrl', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label htmlFor="resume-summary" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Professional Summary
                  </label>
                  <textarea
                    id="resume-summary"
                    data-testid="resume-input-summary"
                    rows={4}
                    value={draft.summary}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    className="w-full px-3 py-2 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Education
                  </h2>
                  <div>
                    <label htmlFor="resume-degree" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Degree &amp; Major
                    </label>
                    <input
                      id="resume-degree"
                      type="text"
                      value={primaryEducation.degree}
                      onChange={(e) => handleEducationChange('degree', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="resume-institution" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        University / College
                      </label>
                      <input
                        id="resume-institution"
                        type="text"
                        value={primaryEducation.institution}
                        onChange={(e) => handleEducationChange('institution', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                    <div>
                      <label htmlFor="resume-edu-period" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Graduation Years
                      </label>
                      <input
                        id="resume-edu-period"
                        type="text"
                        placeholder="2023–2027"
                        value={primaryEducation.period}
                        onChange={(e) => handleEducationChange('period', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="resume-edu-highlights" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CGPA / Coursework Highlights (optional)
                    </label>
                    <input
                      id="resume-edu-highlights"
                      type="text"
                      placeholder="CGPA: 8.8/10 · DSA, DBMS, Operating Systems"
                      value={primaryEducation.highlights}
                      onChange={(e) => handleEducationChange('highlights', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <label htmlFor="resume-skills" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Technical Skills (comma-separated)
                  </label>
                  <textarea
                    id="resume-skills"
                    data-testid="resume-input-skills"
                    rows={2}
                    value={skillsText}
                    onChange={(e) => handleSkillsTextChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {['docker', 'hibernate', 'typescript', 'aws', 'sql'].map((sug) => {
                      const exists = draft.skills.some((s) => s.key === sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          disabled={exists}
                          onClick={() => handleQuickAddSkill(sug)}
                          className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors ${
                            exists
                              ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-default'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#2557A7] hover:text-[#2557A7] cursor-pointer'
                          }`}
                        >
                          {exists ? `✓ ${formatResumeSkillLabel(sug)}` : `+ ${formatResumeSkillLabel(sug)}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EXPERIENCE & PROJECTS */}
            {editorTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Work History &amp; Projects
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Synced with your Profile work history &amp; LinkedIn import.
                    </p>
                  </div>
                  <button
                    type="button"
                    data-testid="resume-add-exp-toggle"
                    onClick={() => setShowAddExpForm((v) => !v)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddExpForm ? 'Cancel' : 'Add Entry'}</span>
                  </button>
                </div>

                {showAddExpForm && (
                  <form
                    onSubmit={handleAddExperienceSubmit}
                    data-testid="resume-add-exp-form"
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label htmlFor="exp-title" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Role / Project Title
                        </label>
                        <input
                          id="exp-title"
                          type="text"
                          required
                          placeholder="e.g. Java Backend Intern"
                          value={expTitle}
                          onChange={(e) => setExpTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-company" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Company / Team
                        </label>
                        <input
                          id="exp-company"
                          type="text"
                          required
                          placeholder="e.g. TCS / Capstone"
                          value={expCompany}
                          onChange={(e) => setExpCompany(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="exp-location" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Location
                        </label>
                        <input
                          id="exp-location"
                          type="text"
                          value={expLocation}
                          onChange={(e) => setExpLocation(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-start" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Start Date
                        </label>
                        <input
                          id="exp-start"
                          type="text"
                          value={expStartDate}
                          onChange={(e) => setExpStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-end" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          End Date
                        </label>
                        <input
                          id="exp-end"
                          type="text"
                          disabled={expCurrent}
                          value={expCurrent ? 'Present' : expEndDate}
                          onChange={(e) => setExpEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expCurrent}
                        onChange={(e) => setExpCurrent(e.target.checked)}
                        className="accent-[#2557A7] rounded"
                      />
                      <span>Currently active role / ongoing project</span>
                    </label>

                    <div>
                      <label htmlFor="exp-desc" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Impact &amp; Engineering Highlights
                      </label>
                      <textarea
                        id="exp-desc"
                        rows={3}
                        placeholder="Engineered Spring Boot REST APIs backed by MySQL..."
                        value={expDescription}
                        onChange={(e) => setExpDescription(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="exp-skills" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tech Stack Used
                      </label>
                      <input
                        id="exp-skills"
                        type="text"
                        value={expSkills}
                        onChange={(e) => setExpSkills(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <button
                      type="submit"
                      data-testid="resume-submit-exp-btn"
                      className="w-full py-2 text-xs font-bold text-white bg-[#087F31] hover:bg-[#066828] rounded-lg cursor-pointer"
                    >
                      Add to Resume Experience
                    </button>
                  </form>
                )}

                {draft.experiences.length === 0 ? (
                  <div className="p-5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      No work experience or project entries in your profile yet. Import sample LinkedIn work history or add an internship/capstone project above.
                    </p>
                    <button
                      type="button"
                      data-testid="resume-import-linkedin-exp-btn"
                      onClick={handleImportLinkedInExperience}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>Import LinkedIn Experience ({SEED_LINKEDIN_WORK_HISTORY.length})</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    {draft.experiences.map((exp) => (
                      <div key={exp.id} className="py-3 first:pt-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {exp.title}
                            </h3>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {exp.company} · {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${exp.title}`}
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEMPLATE, VISIBILITY & ATS KEYWORD TAILORING */}
            {editorTab === 'customize' && (
              <div className="space-y-5">
                {/* Template Selector */}
                <div className="space-y-2.5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Resume Layout Template
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'modern', label: 'Modern Tech', desc: 'Cobalt & clean' },
                        { id: 'classic', label: 'Classic ATS', desc: 'Centered serif' },
                        { id: 'compact', label: 'Compact 1-Pg', desc: 'Dense fresher' }
                      ] as const
                    ).map((opt) => {
                      const active = template === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          data-testid={`resume-template-${opt.id}`}
                          onClick={() => setTemplate(opt.id)}
                          className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-[#2557A7] bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-400'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className={`text-xs font-bold ${active ? 'text-[#2557A7] dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Visibility Toggles */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Visible Resume Sections
                  </h2>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {(
                      [
                        { key: 'showSummary', label: 'Professional Summary' },
                        { key: 'showExperience', label: `Experience & Projects (${draft.experiences.length})` },
                        { key: 'showEducation', label: 'Education History' },
                        { key: 'showSkills', label: `Technical Skills (${draft.skills.length})` },
                        { key: 'showSkillProficiencyBars', label: 'Show Proficiency % Bars' },
                        { key: 'showCertifications', label: `Certifications (${draft.trackedCertifications.length})` },
                        { key: 'showCourses', label: `Coursework (${draft.enrolledCourses.length})` },
                        { key: 'showTargetRoles', label: `Target Pipeline Roles (${draft.targetRoles.length})` },
                        { key: 'showLinkedInUrl', label: 'Include LinkedIn Profile URL' }
                      ] as const
                    ).map((row) => (
                      <label key={row.key} className="py-2 flex items-center justify-between cursor-pointer">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {row.label}
                        </span>
                        <input
                          type="checkbox"
                          checked={visibility[row.key]}
                          onChange={() =>
                            setVisibility((prev) => ({
                              ...prev,
                              [row.key]: !prev[row.key]
                            }))
                          }
                          className="w-4 h-4 accent-[#2557A7] rounded cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* ATS Keyword Tailor Against Target Job */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#2557A7] dark:text-blue-400" />
                      <span>ATS Keyword Matcher</span>
                    </h2>
                    {atsMatch && (
                      <span
                        data-testid="resume-ats-score"
                        className={`text-xs font-mono font-bold tabular-nums ${
                          atsMatch.scorePct >= 75
                            ? 'text-[#087F31] dark:text-emerald-400'
                            : 'text-[#2557A7] dark:text-blue-400'
                        }`}
                      >
                        {atsMatch.scorePct}% Match
                      </span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ats-job-select" className="sr-only">
                      Select target role to check ATS keywords
                    </label>
                    <select
                      id="ats-job-select"
                      data-testid="resume-ats-job-select"
                      value={targetJobId}
                      onChange={(e) => setTargetJobId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} · {job.company} ({job.ctc || job.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {atsMatch && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-600 dark:text-slate-400">
                        Matched <span className="font-mono font-bold tabular-nums">{atsMatch.matchedCount}/{atsMatch.totalRequired}</span> required skills for <strong>{atsMatch.targetCompany}</strong>.
                      </p>
                      {atsMatch.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {atsMatch.missingSkills.map((missing) => (
                            <button
                              key={missing}
                              type="button"
                              data-testid={`ats-add-skill-${missing}`}
                              onClick={() => handleQuickAddSkill(missing)}
                              className="px-2 py-1 text-[11px] font-mono font-semibold text-[#2557A7] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 cursor-pointer"
                            >
                              + Add {formatResumeSkillLabel(missing)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#087F31] dark:text-emerald-400 font-semibold">
                          All target role keywords are present on your resume.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: LIVE STRUCTURED A4 DOCUMENT PREVIEW */}
        <section
          aria-label="Live Structured Resume Sheet Preview"
          className="lg:col-span-7 space-y-3"
        >
          {/* Paper Sheet Preview Toolbar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2557A7] dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                A4 Preview
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{draft.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCompactZoom((z) => !z)}
                className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#2557A7] cursor-pointer"
              >
                {compactZoom ? 'Zoom: 90%' : 'Zoom: 100%'}
              </button>
            </div>
          </div>

          {/* Crisp White A4 Resume Sheet (Prints Cleanly via #resume-document-sheet) */}
          <article
            id="resume-document-sheet"
            data-testid="resume-document-sheet"
            className={`bg-white text-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-transform origin-top ${
              compactZoom ? 'lg:scale-[0.92]' : ''
            }`}
          >
            {/* Top Template Accent Strip */}
            {template !== 'classic' && (
              <div className={`w-full bg-[#2557A7] ${isCompact ? 'h-1' : 'h-1.5'}`} />
            )}

            <div className={`${isCompact ? 'p-6 sm:p-8 space-y-4' : 'p-7 sm:p-10 space-y-6'}`}>
              {/* Resume Header */}
              <header
                className={`pb-4 border-b ${
                  isClassic ? 'border-slate-900 text-center' : 'border-[#2557A7]/30'
                }`}
              >
                <h2
                  data-testid="resume-preview-name"
                  className={`font-bold tracking-tight text-slate-900 ${
                    isClassic ? 'font-serif text-2xl sm:text-3xl' : isCompact ? 'text-2xl' : 'text-2xl sm:text-3xl'
                  }`}
                >
                  {draft.fullName || 'Student Explorer'}
                </h2>

                {draft.headline && (
                  <p
                    data-testid="resume-preview-headline"
                    className={`mt-1 font-medium ${
                      isClassic ? 'font-serif text-sm text-slate-700' : 'text-sm text-[#2557A7]'
                    }`}
                  >
                    {draft.headline}
                  </p>
                )}

                <div
                  className={`mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 ${
                    isClassic ? 'justify-center' : ''
                  }`}
                >
                  {contactItems.map((item, idx) => (
                    <span
                      key={`${item}-${idx}`}
                      className="inline-flex items-center gap-2 whitespace-nowrap"
                    >
                      {idx > 0 && (
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                      )}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </header>

              {/* Section: Summary */}
              {visibility.showSummary && draft.summary && (
                <section className="space-y-1.5">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Professional Summary
                  </h3>
                  <p className={`${isCompact ? 'text-xs' : 'text-[13px]'} text-slate-700 leading-relaxed`}>
                    {draft.summary}
                  </p>
                </section>
              )}

              {/* Section: Experience & Projects */}
              {visibility.showExperience && (
                <section className="space-y-3" data-testid="resume-preview-experience">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Experience &amp; Engineering Projects
                  </h3>

                  {draft.experiences.length === 0 ? (
                    <div className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>No experience entries added yet — switch to the Experience tab to add roles or import from LinkedIn.</span>
                      <button
                        type="button"
                        onClick={() => setEditorTab('experience')}
                        className="no-print font-semibold text-[#2557A7] hover:underline cursor-pointer"
                      >
                        + Add Experience
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {draft.experiences.map((exp) => (
                        <div key={exp.id} className="space-y-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {exp.title}
                            </h4>
                            <span className="text-xs font-mono text-slate-500 tabular-nums">
                              {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700">
                            {exp.company}
                            {exp.location ? <span className="font-normal text-slate-500"> · {exp.location}</span> : null}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {exp.description}
                          </p>
                          {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                            <p className="text-[11px] font-mono text-slate-500">
                              Stack: {exp.skillsUsed.map(formatResumeSkillLabel).join(' · ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Section: Education */}
              {visibility.showEducation && draft.educationEntries.length > 0 && (
                <section className="space-y-2" data-testid="resume-preview-education">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Education
                  </h3>
                  {draft.educationEntries.map((edu) => (
                    <div key={edu.id} className="space-y-0.5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {edu.degree}
                        </h4>
                        {edu.period && (
                          <span className="text-xs font-mono text-slate-500 tabular-nums">
                            {edu.period}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700">{edu.institution}</div>
                      {edu.highlights && (
                        <div className="text-xs text-slate-500 italic">{edu.highlights}</div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Section: Technical Skills */}
              {visibility.showSkills && draft.skills.length > 0 && (
                <section className="space-y-2" data-testid="resume-preview-skills">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Technical Skills ({draft.skills.length})
                  </h3>

                  {visibility.showSkillProficiencyBars ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {draft.skills.map((sk) => (
                        <div key={sk.key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{sk.name}</span>
                            <span className="font-mono text-[#2557A7] tabular-nums">{sk.proficiency}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2557A7] rounded-full"
                              style={{ width: `${sk.proficiency}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-800 leading-relaxed">
                      {draft.skills.map((sk) => sk.name).join(' · ')}
                    </p>
                  )}
                </section>
              )}

              {/* Section: Industry Certifications */}
              {visibility.showCertifications && draft.trackedCertifications.length > 0 && (
                <section className="space-y-2" data-testid="resume-preview-certifications">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Industry Certifications ({draft.trackedCertifications.length})
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    {draft.trackedCertifications.map((cert) => (
                      <div key={cert.id} className="py-1.5 first:pt-0 last:pb-0 flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900">{cert.name}</span>
                          <span className="text-slate-500"> · {cert.issuer}</span>
                        </div>
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] text-slate-500 hover:text-[#2557A7] inline-flex items-center gap-1"
                        >
                          <span className="truncate max-w-[210px]">{cert.credentialUrl}</span>
                          <ExternalLink className="w-3 h-3 no-print shrink-0" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Section: Relevant Coursework */}
              {visibility.showCourses && draft.enrolledCourses.length > 0 && (
                <section className="space-y-1.5" data-testid="resume-preview-courses">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Relevant Coursework
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700">
                    {draft.enrolledCourses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{course.title}</span>
                        <span className="font-mono text-[11px] text-slate-500 shrink-0">
                          {course.provider}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Optional Target Roles Footer */}
              {visibility.showTargetRoles && draft.targetRoles.length > 0 && (
                <section className="space-y-1.5">
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider pb-1 border-b border-slate-200 ${
                      isClassic ? 'font-serif text-slate-900' : 'text-[#2557A7]'
                    }`}
                  >
                    Target Engineering Roles
                  </h3>
                  <p className="text-xs text-slate-700">
                    {draft.targetRoles
                      .map((r) => `${r.title} (${r.company}, ${r.location})`)
                      .join(' · ')}
                  </p>
                </section>
              )}

              {/* Clean Document Footer */}
              <footer className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>Verified via {draft.oauthProvider} OAuth2</span>
                </span>
                <span className="font-mono">{draft.generatedDate}</span>
              </footer>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};
