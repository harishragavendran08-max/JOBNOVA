import {
  CAREER_KNOWLEDGE_BASE,
  CertificationItem,
  CourseItem,
  InternshipItem,
  JobItem,
  SPRING_BOOT_DIAGNOSTICS,
  SpringBootDiagnostic,
  UserProfile,
  UserSettings,
  WorkExperienceItem
} from '../data/seedData';

/**
 * Filters jobs by skill/title/company keyword and optional location filter.
 * Mirrors JobRepository.findBySkillsContainingIgnoreCase + client search in jobs.html.
 */
export function filterJobsBySkill(
  jobs: JobItem[],
  query: string,
  locationFilter = 'ALL'
): JobItem[] {
  const q = query.trim().toLowerCase();
  return jobs.filter((job) => {
    const matchesLocation =
      locationFilter === 'ALL' ||
      job.location.toLowerCase() === locationFilter.toLowerCase();
    if (!matchesLocation) return false;
    if (!q) return true;
    return (
      job.skills.toLowerCase().includes(q) ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.description.toLowerCase().includes(q)
    );
  });
}

/**
 * Filters internships by title, company, or description keyword and optional location filter.
 * Mirrors searchInternships() in internships.html.
 */
export function filterInternships(
  internships: InternshipItem[],
  query: string,
  locationFilter = 'ALL'
): InternshipItem[] {
  const q = query.trim().toLowerCase();
  return internships.filter((intern) => {
    const matchesLocation =
      locationFilter === 'ALL' ||
      intern.location.toLowerCase() === locationFilter.toLowerCase();
    if (!matchesLocation) return false;
    if (!q) return true;
    return (
      intern.title.toLowerCase().includes(q) ||
      intern.company.toLowerCase().includes(q) ||
      intern.description.toLowerCase().includes(q) ||
      intern.location.toLowerCase().includes(q)
    );
  });
}

/**
 * Filters learning courses by title, description, or provider keyword and optional provider filter.
 * Mirrors searchCourses() in app.js / learning.html.
 */
export function filterCourses(
  courses: CourseItem[],
  query: string,
  providerFilter = 'ALL'
): CourseItem[] {
  const q = query.trim().toLowerCase();
  return courses.filter((course) => {
    const matchesProvider =
      providerFilter === 'ALL' ||
      course.provider.toLowerCase() === providerFilter.toLowerCase();
    if (!matchesProvider) return false;
    if (!q) return true;
    return (
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.provider.toLowerCase().includes(q)
    );
  });
}

/**
 * Filters certifications by name or issuer keyword and optional issuer filter.
 * Mirrors searchCerts() in certifications.html.
 */
export function filterCertifications(
  certifications: CertificationItem[],
  query: string,
  issuerFilter = 'ALL'
): CertificationItem[] {
  const q = query.trim().toLowerCase();
  return certifications.filter((cert) => {
    const matchesIssuer =
      issuerFilter === 'ALL' ||
      cert.issuer.toLowerCase() === issuerFilter.toLowerCase();
    if (!matchesIssuer) return false;
    if (!q) return true;
    return (
      cert.name.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q)
    );
  });
}

/**
 * Matches user prompt against the predefined knowledge base in GeminiController.java.
 */
export function matchOfflineCareerAssistant(prompt: string): string {
  const normalized = (prompt || '').trim().toLowerCase();
  if (!normalized) {
    return 'Please enter a career question about resumes, interviews, LinkedIn, soft skills, or job preparation.';
  }

  for (const [keyword, answer] of Object.entries(CAREER_KNOWLEDGE_BASE)) {
    if (normalized.includes(keyword)) {
      return answer;
    }
  }

  if (normalized.includes('java') || normalized.includes('spring')) {
    return `Java & Spring Boot Career Path on JobNova:
• Complete the "Complete Java Developer" (Coursera) and "Spring Boot Complete Guide" (Udemy) courses in the Learning tab.
• Earn the "Java SE 11 Developer" (Oracle) and "Spring Framework Developer" (VMware) certifications.
• Apply to matching roles on JobNova: Software Engineer @ TCS, Backend Developer @ Infosys, Full Stack Developer @ Cognizant, and Web Application Developer @ Oracle India.`;
  }

  if (
    normalized.includes('react') ||
    normalized.includes('javascript') ||
    normalized.includes('html') ||
    normalized.includes('css') ||
    normalized.includes('mysql')
  ) {
    return `Full-Stack Web & Database Career Path (React.js, JavaScript, HTML5, CSS3 & MySQL):
• Complete "HTML & CSS from Scratch", "JavaScript Mastery", "ReactJS & Modern Frontend", and "Database Management with MySQL" in the Learning section.
• Combine your React.js & JavaScript frontend with Java, Spring Boot & MySQL backend REST APIs.
• Target roles on JobNova: Frontend Engineer @ Wipro, Full Stack Developer @ Cognizant, Web Developer @ Flipkart, and Software Engineer @ TCS.`;
  }

  if (normalized.includes('python') || normalized.includes('ai') || normalized.includes('data')) {
    return `Data Science, Python & AI Career Path on JobNova:
• Take "Python for Beginners", "Data Science with Python & Pandas", and "AI and Machine Learning Foundations".
• Earn the "Google Data Analytics Certificate" or "Python Programming Professional Certificate".
• Target roles: AI Engineer @ Google India, Data Analyst @ HCL, AI Research Intern @ NVIDIA India, and Data Engineer @ Reliance Jio.`;
  }

  return "I'm your JobNova Career Assistant! Ask me about resumes, interviews, LinkedIn, soft skills, Java, Spring Boot, React.js, JavaScript, HTML, CSS, MySQL, or preparing for your first job.";
}

/**
 * Toggles or records an item ID in an array (e.g., applied jobs, applied internships, enrolled courses).
 */
export function toggleItemSelection(list: number[], id: number): number[] {
  if (list.includes(id)) {
    return list.filter((item) => item !== id);
  }
  return [...list, id];
}

/**
 * Computes student career readiness metrics based on user activity and matched job skills.
 */
export function computeCareerStats(params: {
  jobs: JobItem[];
  userSkills: string[];
  appliedJobIds: number[];
  appliedInternshipIds: number[];
  enrolledCourseIds: number[];
  savedCertIds: number[];
}): {
  matchedJobsCount: number;
  totalApplications: number;
  enrolledCoursesCount: number;
  savedCertsCount: number;
} {
  const normalizedSkills = params.userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const matchedJobsCount = params.jobs.filter((job) => {
    const jobSkills = job.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return jobSkills.some((js) => normalizedSkills.includes(js));
  }).length;

  return {
    matchedJobsCount,
    totalApplications: params.appliedJobIds.length + params.appliedInternshipIds.length,
    enrolledCoursesCount: params.enrolledCourseIds.length,
    savedCertsCount: params.savedCertIds.length
  };
}

/**
 * Filters Spring Boot diagnostics by severity.
 */
export function filterDiagnostics(
  diagnostics: SpringBootDiagnostic[] = SPRING_BOOT_DIAGNOSTICS,
  severity: 'ALL' | 'Critical' | 'High' | 'Medium' = 'ALL'
): SpringBootDiagnostic[] {
  if (severity === 'ALL') return diagnostics;
  return diagnostics.filter((d) => d.severity === severity);
}

export interface SkillRadarPoint {
  skill: string;
  key: string;
  studentProficiency: number;
  industryRequirement: number;
  gap: number;
  fullMark: number;
}

const SKILL_DISPLAY_NAMES: Record<string, string> = {
  java: 'Java',
  springboot: 'Spring Boot',
  mysql: 'MySQL',
  sql: 'SQL',
  react: 'React.js',
  python: 'Python',
  aws: 'AWS Cloud',
  hibernate: 'Hibernate',
  javascript: 'JavaScript',
  html: 'HTML5',
  css: 'CSS3',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  tensorflow: 'TensorFlow',
  ai: 'AI / LLM',
  ml: 'Machine Learning',
  linux: 'Linux',
  devops: 'DevOps'
};

// Base student proficiency scores (out of 100) for common student skills, boosted by enrolled courses & certs
const BASE_STUDENT_PROFICIENCY: Record<string, number> = {
  java: 82,
  springboot: 76,
  mysql: 80,
  sql: 78,
  react: 74,
  python: 72,
  aws: 60,
  hibernate: 64,
  javascript: 78,
  html: 88,
  css: 84,
  docker: 55,
  kubernetes: 48,
  tensorflow: 58,
  ai: 65,
  ml: 62,
  linux: 70,
  devops: 56
};

// Industry standard proficiency benchmark (out of 100) when a skill is required by saved/target job roles
const INDUSTRY_BENCHMARK_BY_SKILL: Record<string, number> = {
  java: 85,
  springboot: 88,
  mysql: 82,
  sql: 82,
  react: 80,
  python: 85,
  aws: 84,
  hibernate: 78,
  javascript: 80,
  html: 75,
  css: 75,
  docker: 82,
  kubernetes: 80,
  tensorflow: 86,
  ai: 85,
  ml: 85,
  linux: 78,
  devops: 82
};

/**
 * Computes radar chart comparison points for the student's listed skills
 * against industry standard requirements for saved/applied job roles.
 */
export function computeSkillRadarData(params: {
  userSkills: string[];
  savedJobs: JobItem[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): SkillRadarPoint[] {
  const {
    userSkills,
    savedJobs,
    enrolledCourseIds = [],
    savedCertIds = [],
    customProficiencyOverrides = {}
  } = params;

  // Collect skills from user profile + any key skills from saved jobs (up to 8 axes for clean radar geometry)
  const normalizedUserSkills = userSkills
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const savedJobSkillCounts: Record<string, number> = {};
  for (const job of savedJobs) {
    const tokens = job.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    for (const token of tokens) {
      savedJobSkillCounts[token] = (savedJobSkillCounts[token] || 0) + 1;
    }
  }

  const combinedKeys = Array.from(
    new Set([
      ...normalizedUserSkills,
      ...Object.keys(savedJobSkillCounts)
    ])
  ).slice(0, 8);

  const finalKeys =
    combinedKeys.length >= 3
      ? combinedKeys
      : Array.from(new Set([...combinedKeys, 'java', 'springboot', 'sql', 'react', 'python', 'aws'])).slice(0, 6);

  // Course & certification bonus (up to +12 pts for relevant learning/cert progress)
  const courseBonus = Math.min(8, enrolledCourseIds.length * 2);
  const certBonus = Math.min(6, savedCertIds.length * 2);

  return finalKeys.map((key) => {
    const isListedByStudent = normalizedUserSkills.includes(key);
    const baseStudent = isListedByStudent
      ? BASE_STUDENT_PROFICIENCY[key] ?? 70
      : Math.max(35, (BASE_STUDENT_PROFICIENCY[key] ?? 55) - 22);

    const override = customProficiencyOverrides[key];
    const studentProficiency =
      typeof override === 'number'
        ? Math.min(100, Math.max(0, override))
        : Math.min(98, baseStudent + (isListedByStudent ? courseBonus + certBonus : 0));

    const demandCount = savedJobSkillCounts[key] || 0;
    const baseIndustry = INDUSTRY_BENCHMARK_BY_SKILL[key] ?? 80;
    // Industry requirement scales slightly higher if multiple saved roles demand this skill
    const industryRequirement =
      demandCount > 0
        ? Math.min(96, baseIndustry + Math.min(8, (demandCount - 1) * 4))
        : Math.max(70, baseIndustry - 8);

    const displayLabel =
      SKILL_DISPLAY_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);

    return {
      skill: displayLabel,
      key,
      studentProficiency,
      industryRequirement,
      gap: studentProficiency - industryRequirement,
      fullMark: 100
    };
  });
}

export interface ResumeDocumentData {
  fileName: string;
  fullName: string;
  headline: string;
  email: string;
  location: string;
  oauthProvider: string;
  summary: string;
  skills: { name: string; proficiency: number }[];
  trackedCertifications: { name: string; issuer: string; credentialUrl: string }[];
  enrolledCourses: { title: string; provider: string; level: string }[];
  targetRoles: { title: string; company: string; location: string }[];
  generatedDate: string;
}

/**
 * Formats the student's current profile, listed skills, tracked certifications,
 * and learning/application records into a structured resume payload for PDF export.
 */
export function buildResumeStructuredData(params: {
  user: {
    name: string;
    headline: string;
    email: string;
    location: string;
    provider: string;
    summary: string;
    education?: string;
    skills: string[];
    skillProficiencies?: Record<string, number>;
  } | null;
  certifications: CertificationItem[];
  savedCertIds: number[];
  courses?: CourseItem[];
  enrolledCourseIds?: number[];
  jobs?: JobItem[];
  appliedJobIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): ResumeDocumentData {
  const {
    user,
    certifications,
    savedCertIds,
    courses = [],
    enrolledCourseIds = [],
    jobs = [],
    appliedJobIds = [],
    customProficiencyOverrides
  } = params;

  const fullName = user?.name?.trim() || 'Student Explorer';
  const safeSlug = fullName
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const targetJobs = jobs.filter((j) => appliedJobIds.includes(j.id));
  const resolvedOverrides =
    customProficiencyOverrides || user?.skillProficiencies || {};
  const radarPoints = computeSkillRadarData({
    userSkills: user?.skills || [],
    savedJobs: targetJobs.length > 0 ? targetJobs : jobs.slice(0, 2),
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides: resolvedOverrides
  });

  const skills = (user?.skills || []).map((rawSkill) => {
    const clean = rawSkill.trim().toLowerCase();
    const matchedRadar = radarPoints.find((p) => p.key === clean);
    const manualScore = resolvedOverrides[clean];
    return {
      name: SKILL_DISPLAY_NAMES[clean] || rawSkill.trim(),
      proficiency:
        typeof manualScore === 'number'
          ? manualScore
          : matchedRadar
            ? matchedRadar.studentProficiency
            : 75
    };
  });

  const trackedCertifications = certifications
    .filter((cert) => savedCertIds.includes(cert.id))
    .map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      credentialUrl: cert.credentialUrl
    }));

  const enrolledCourses = courses
    .filter((c) => enrolledCourseIds.includes(c.id))
    .map((c) => ({
      title: c.title,
      provider: c.provider,
      level: c.level || 'Self-Paced'
    }));

  return {
    fileName: `${safeSlug || 'JobNova_Student'}_Resume.pdf`,
    fullName,
    headline:
      user?.headline?.trim() ||
      'Full-Stack Java & Spring Boot Developer | Final Year CS Student',
    email: user?.email?.trim() || 'student@jobnova.edu',
    location: user?.location?.trim() || 'Chennai, India',
    oauthProvider: user?.provider || 'Google',
    summary:
      user?.summary?.trim() ||
      'Passionate Computer Science student building full-stack applications with Java, Spring Boot, React, and AI integrations.',
    skills,
    trackedCertifications,
    enrolledCourses,
    targetRoles: targetJobs.map((j) => ({
      title: j.title,
      company: j.company,
      location: j.location
    })),
    generatedDate: 'November 2026'
  };
}

export interface SalaryComparisonBarPoint {
  name: string;
  category: 'Benchmark' | 'Expected Range' | 'Saved Role';
  ctcLpa: number;
  expectedMinLpa: number;
  expectedMaxLpa: number;
}

export interface SalaryComparisonSummary {
  savedJobsCount: number;
  savedJobsAverageLpa: number;
  marketAverageLpa: number;
  expectedMinLpa: number;
  expectedMaxLpa: number;
  expectedMidpointLpa: number;
  deltaFromMidpointLpa: number;
  alignmentStatus: 'Within Expected Range' | 'Above Expected Range' | 'Below Expected Minimum';
  bars: SalaryComparisonBarPoint[];
}

/**
 * Parses a formatted CTC string like "7.5 LPA" or "28.0 LPA" into a numeric LPA value.
 */
export function parseJobCtcLpa(ctc?: string): number {
  if (!ctc) return 0;
  const match = ctc.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Computes bar chart data and summary metrics comparing the average CTC of saved
 * job applications against the student's expected salary range from UserSettings.
 */
export function computeSalaryComparisonData(params: {
  jobs: JobItem[];
  savedJobIds: number[];
  expectedSalaryMinLpa: number;
  expectedSalaryMaxLpa: number;
}): SalaryComparisonSummary {
  const { jobs, savedJobIds, expectedSalaryMinLpa, expectedSalaryMaxLpa } = params;

  const minLpa = Math.max(1, Math.min(expectedSalaryMinLpa, expectedSalaryMaxLpa));
  const maxLpa = Math.max(minLpa, expectedSalaryMaxLpa);
  const midpointLpa = Number(((minLpa + maxLpa) / 2).toFixed(1));

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const savedCtcValues = savedJobs
    .map((j) => parseJobCtcLpa(j.ctc))
    .filter((v) => v > 0);

  const allCtcValues = jobs
    .map((j) => parseJobCtcLpa(j.ctc))
    .filter((v) => v > 0);

  const savedJobsAverageLpa =
    savedCtcValues.length > 0
      ? Number(
          (
            savedCtcValues.reduce((acc, v) => acc + v, 0) / savedCtcValues.length
          ).toFixed(1)
        )
      : 0;

  const marketAverageLpa =
    allCtcValues.length > 0
      ? Number(
          (allCtcValues.reduce((acc, v) => acc + v, 0) / allCtcValues.length).toFixed(1)
        )
      : 0;

  const deltaFromMidpointLpa = Number((savedJobsAverageLpa - midpointLpa).toFixed(1));

  let alignmentStatus: SalaryComparisonSummary['alignmentStatus'] = 'Within Expected Range';
  if (savedJobsAverageLpa < minLpa) {
    alignmentStatus = 'Below Expected Minimum';
  } else if (savedJobsAverageLpa > maxLpa) {
    alignmentStatus = 'Above Expected Range';
  }

  const bars: SalaryComparisonBarPoint[] = [
    {
      name: 'Expected Min',
      category: 'Expected Range',
      ctcLpa: minLpa,
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    },
    {
      name: 'Saved Jobs Avg',
      category: 'Benchmark',
      ctcLpa: savedJobsAverageLpa,
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    },
    {
      name: 'Expected Target',
      category: 'Expected Range',
      ctcLpa: midpointLpa,
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    },
    {
      name: 'Expected Max',
      category: 'Expected Range',
      ctcLpa: maxLpa,
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    },
    {
      name: 'Market Avg (20)',
      category: 'Benchmark',
      ctcLpa: marketAverageLpa,
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    },
    ...savedJobs.slice(0, 4).map((job) => ({
      name: `${job.company}`,
      category: 'Saved Role' as const,
      ctcLpa: parseJobCtcLpa(job.ctc),
      expectedMinLpa: minLpa,
      expectedMaxLpa: maxLpa
    }))
  ];

  return {
    savedJobsCount: savedJobs.length,
    savedJobsAverageLpa,
    marketAverageLpa,
    expectedMinLpa: minLpa,
    expectedMaxLpa: maxLpa,
    expectedMidpointLpa: midpointLpa,
    deltaFromMidpointLpa,
    alignmentStatus,
    bars
  };
}

export type ApplicationStage =
  | 'Applied'
  | 'Interviewing'
  | 'Offer Received'
  | 'Rejected';

export const APPLICATION_STAGES: ApplicationStage[] = [
  'Applied',
  'Interviewing',
  'Offer Received',
  'Rejected'
];

export interface ApplicationStatusLog {
  id: string;
  stage: ApplicationStage;
  note: string;
  timestamp: string;
}

export type InterviewConfidenceRating = 'Strong' | 'Moderate' | 'Needs Review';

export interface InterviewFeedbackNote {
  id: string;
  roundTitle: string;
  interviewerOrFormat: string;
  questionsAsked: string;
  keyTakeaways: string;
  confidenceRating: InterviewConfidenceRating;
  timestamp: string;
}

export interface ApplicationStageRecord {
  jobId: number;
  currentStage: ApplicationStage;
  updatedAt: string;
  interviewScheduledAt?: string;
  interviewRoundTitle?: string;
  interviewFeedbackNotes?: InterviewFeedbackNote[];
  history: ApplicationStatusLog[];
}

export interface JobApplicationTimelineEntry {
  jobId: number;
  jobTitle: string;
  company: string;
  location: string;
  ctc: string;
  skills: string;
  currentStage: ApplicationStage;
  stageStepIndex: number;
  updatedAt: string;
  latestNote: string;
  interviewScheduledAt?: string;
  interviewRoundTitle?: string;
  interviewFeedbackNotes: InterviewFeedbackNote[];
  history: ApplicationStatusLog[];
}

export interface CareerTimelineSummary {
  totalTracked: number;
  stageCounts: Record<ApplicationStage, number>;
  activePipelineCount: number;
  offerConversionRate: number;
  entries: JobApplicationTimelineEntry[];
}

export interface InterviewCountdownResult {
  totalRemainingSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  urgency: 'imminent' | 'upcoming' | 'completed';
  formattedCountdown: string;
}

/**
 * Generates an ISO timestamp offsetHours in the future from baseNowMs.
 */
export function getDefaultInterviewIso(
  baseNowMs: number = Date.now(),
  offsetHours = 52.5
): string {
  return new Date(baseNowMs + Math.round(offsetHours * 3600 * 1000)).toISOString();
}

/**
 * Pure calculation for the interview countdown timer component inside 'Interviewing' stage cards.
 */
export function computeInterviewCountdown(
  scheduledIso?: string,
  nowMs: number = Date.now()
): InterviewCountdownResult {
  if (!scheduledIso) {
    return {
      totalRemainingSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      urgency: 'completed',
      formattedCountdown: '00d : 00h : 00m : 00s'
    };
  }

  const targetMs = new Date(scheduledIso).getTime();
  if (Number.isNaN(targetMs)) {
    return {
      totalRemainingSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      urgency: 'completed',
      formattedCountdown: '00d : 00h : 00m : 00s'
    };
  }

  const diffSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  const isPast = targetMs <= nowMs;

  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  let urgency: InterviewCountdownResult['urgency'] = 'upcoming';
  if (isPast || diffSeconds === 0) {
    urgency = 'completed';
  } else if (diffSeconds <= 86400) {
    urgency = 'imminent';
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedCountdown = `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;

  return {
    totalRemainingSeconds: diffSeconds,
    days,
    hours,
    minutes,
    seconds,
    isPast,
    urgency,
    formattedCountdown
  };
}

/**
 * Returns the visual progression step index for a given stage.
 */
export function getStageStepIndex(stage: ApplicationStage): number {
  switch (stage) {
    case 'Applied':
      return 0;
    case 'Interviewing':
      return 1;
    case 'Offer Received':
      return 2;
    case 'Rejected':
      return 3;
  }
}

/**
 * Generates a realistic default status note when an application moves to a stage.
 */
export function getDefaultStageNote(
  stage: ApplicationStage,
  company: string,
  jobTitle: string
): string {
  switch (stage) {
    case 'Applied':
      return `Submitted resume and profile application for ${jobTitle} at ${company}.`;
    case 'Interviewing':
      return `Shortlisted for technical & system design interview rounds at ${company}.`;
    case 'Offer Received':
      return `Received official full-time offer letter from ${company} for ${jobTitle}!`;
    case 'Rejected':
      return `Application status closed by ${company} recruiting team after evaluation.`;
  }
}

/**
 * Synchronizes the map of application stage records with the active list of appliedJobIds.
 */
export function syncApplicationStageRecords(params: {
  appliedJobIds: number[];
  jobs: JobItem[];
  existingRecords: Record<number, ApplicationStageRecord>;
  nowLabel?: string;
  baseNowMs?: number;
}): Record<number, ApplicationStageRecord> {
  const {
    appliedJobIds,
    jobs,
    existingRecords,
    nowLabel = 'Nov 12, 2026',
    baseNowMs = Date.now()
  } = params;

  const nextRecords: Record<number, ApplicationStageRecord> = {};

  for (const jobId of appliedJobIds) {
    if (existingRecords[jobId]) {
      nextRecords[jobId] = existingRecords[jobId];
    } else {
      const job = jobs.find((j) => j.id === jobId);
      const company = job?.company || 'Company';
      const title = job?.title || 'Software Role';
      nextRecords[jobId] = {
        jobId,
        currentStage: 'Applied',
        updatedAt: nowLabel,
        interviewScheduledAt: getDefaultInterviewIso(baseNowMs, 48 + (jobId % 5) * 6),
        interviewRoundTitle: `Technical & System Design Round · ${company}`,
        interviewFeedbackNotes: [],
        history: [
          {
            id: `log-${jobId}-init`,
            stage: 'Applied',
            note: getDefaultStageNote('Applied', company, title),
            timestamp: nowLabel
          }
        ]
      };
    }
  }

  return nextRecords;
}

/**
 * Updates a specific job application's stage and appends a status update entry to its timeline history.
 */
export function updateApplicationStageRecord(params: {
  existingRecords: Record<number, ApplicationStageRecord>;
  job: JobItem;
  nextStage: ApplicationStage;
  customNote?: string;
  timestamp?: string;
  interviewScheduledAt?: string;
  interviewRoundTitle?: string;
  baseNowMs?: number;
}): Record<number, ApplicationStageRecord> {
  const {
    existingRecords,
    job,
    nextStage,
    customNote,
    timestamp = 'Just now · Nov 12, 2026',
    interviewScheduledAt,
    interviewRoundTitle,
    baseNowMs = Date.now()
  } = params;

  const current = existingRecords[job.id];
  const resolvedNote =
    customNote && customNote.trim().length > 0
      ? customNote.trim()
      : getDefaultStageNote(nextStage, job.company, job.title);

  const newLog: ApplicationStatusLog = {
    id: `log-${job.id}-${(current?.history.length || 0) + 1}`,
    stage: nextStage,
    note: resolvedNote,
    timestamp
  };

  const previousHistory = current?.history || [];

  const nextScheduledIso =
    interviewScheduledAt ||
    current?.interviewScheduledAt ||
    getDefaultInterviewIso(baseNowMs, 52.5);

  const nextRoundTitle =
    interviewRoundTitle ||
    current?.interviewRoundTitle ||
    `Technical & System Design Interview · ${job.company}`;

  return {
    ...existingRecords,
    [job.id]: {
      jobId: job.id,
      currentStage: nextStage,
      updatedAt: timestamp,
      interviewScheduledAt: nextScheduledIso,
      interviewRoundTitle: nextRoundTitle,
      interviewFeedbackNotes: current?.interviewFeedbackNotes || [],
      history: [newLog, ...previousHistory]
    }
  };
}

/**
 * Updates the scheduled interview date/time and round title for an application in the 'Interviewing' stage.
 */
export function updateInterviewScheduleRecord(params: {
  existingRecords: Record<number, ApplicationStageRecord>;
  job: JobItem;
  interviewScheduledAt: string;
  interviewRoundTitle?: string;
  timestamp?: string;
}): Record<number, ApplicationStageRecord> {
  const {
    existingRecords,
    job,
    interviewScheduledAt,
    interviewRoundTitle,
    timestamp = 'Just now · Nov 12, 2026'
  } = params;

  const current = existingRecords[job.id];
  const roundLabel =
    interviewRoundTitle?.trim() ||
    current?.interviewRoundTitle ||
    `Technical & System Design Interview · ${job.company}`;

  const formattedDate = new Date(interviewScheduledAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newLog: ApplicationStatusLog = {
    id: `log-${job.id}-sched-${(current?.history.length || 0) + 1}`,
    stage: 'Interviewing',
    note: `Scheduled "${roundLabel}" for ${formattedDate}.`,
    timestamp
  };

  return {
    ...existingRecords,
    [job.id]: {
      jobId: job.id,
      currentStage: 'Interviewing',
      updatedAt: timestamp,
      interviewScheduledAt,
      interviewRoundTitle: roundLabel,
      interviewFeedbackNotes: current?.interviewFeedbackNotes || [],
      history: [newLog, ...(current?.history || [])]
    }
  };
}

/**
 * Logs a structured post-interview feedback note for an application and records it in the application history.
 */
export function addInterviewFeedbackRecord(params: {
  existingRecords: Record<number, ApplicationStageRecord>;
  job: JobItem;
  roundTitle: string;
  interviewerOrFormat?: string;
  questionsAsked?: string;
  keyTakeaways: string;
  confidenceRating?: InterviewConfidenceRating;
  timestamp?: string;
}): Record<number, ApplicationStageRecord> {
  const {
    existingRecords,
    job,
    roundTitle,
    interviewerOrFormat,
    questionsAsked,
    keyTakeaways,
    confidenceRating = 'Strong',
    timestamp = 'Nov 12, 2026'
  } = params;

  const current = existingRecords[job.id];
  const cleanRound =
    roundTitle.trim() ||
    current?.interviewRoundTitle ||
    `Technical & System Design Round · ${job.company}`;
  const cleanFormat =
    interviewerOrFormat?.trim() || 'Live Technical & Coding Panel (45m)';
  const cleanQuestions =
    questionsAsked?.trim() ||
    `Core stack assessment (${job.skills.split(',').join(', ')})`;
  const cleanTakeaways =
    keyTakeaways.trim() ||
    `Completed ${cleanRound} at ${job.company}. Reviewed coding solutions and system architecture trade-offs.`;

  const existingFeedback = current?.interviewFeedbackNotes || [];
  const feedbackNote: InterviewFeedbackNote = {
    id: `feedback-${job.id}-${existingFeedback.length + 1}`,
    roundTitle: cleanRound,
    interviewerOrFormat: cleanFormat,
    questionsAsked: cleanQuestions,
    keyTakeaways: cleanTakeaways,
    confidenceRating,
    timestamp
  };

  const currentStage: ApplicationStage = current?.currentStage || 'Interviewing';
  const newLog: ApplicationStatusLog = {
    id: `log-${job.id}-fb-${(current?.history.length || 0) + 1}`,
    stage: currentStage,
    note: `Logged post-interview feedback for "${cleanRound}" (${confidenceRating}): ${cleanTakeaways}`,
    timestamp
  };

  return {
    ...existingRecords,
    [job.id]: {
      jobId: job.id,
      currentStage,
      updatedAt: timestamp,
      interviewScheduledAt: current?.interviewScheduledAt,
      interviewRoundTitle: current?.interviewRoundTitle || cleanRound,
      interviewFeedbackNotes: [feedbackNote, ...existingFeedback],
      history: [newLog, ...(current?.history || [])]
    }
  };
}

/**
 * Computes summary counts and enriched timeline entries for the Career Timeline component.
 */
export function computeCareerTimelineSummary(params: {
  jobs: JobItem[];
  appliedJobIds: number[];
  stageRecords: Record<number, ApplicationStageRecord>;
  stageFilter?: ApplicationStage | 'ALL';
}): CareerTimelineSummary {
  const {
    jobs,
    appliedJobIds,
    stageRecords,
    stageFilter = 'ALL'
  } = params;

  const stageCounts: Record<ApplicationStage, number> = {
    Applied: 0,
    Interviewing: 0,
    'Offer Received': 0,
    Rejected: 0
  };

  const allEntries: JobApplicationTimelineEntry[] = [];

  for (const jobId of appliedJobIds) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) continue;

    const record = stageRecords[jobId];
    const currentStage: ApplicationStage = record?.currentStage || 'Applied';
    stageCounts[currentStage] = (stageCounts[currentStage] || 0) + 1;

    const history: ApplicationStatusLog[] =
      record?.history && record.history.length > 0
        ? record.history
        : [
            {
              id: `log-${job.id}-default`,
              stage: currentStage,
              note: getDefaultStageNote(currentStage, job.company, job.title),
              timestamp: record?.updatedAt || 'Nov 12, 2026'
            }
          ];

    allEntries.push({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      ctc: job.ctc || 'Competitive',
      skills: job.skills,
      currentStage,
      stageStepIndex: getStageStepIndex(currentStage),
      updatedAt: record?.updatedAt || 'Nov 12, 2026',
      latestNote: history[0].note,
      interviewScheduledAt: record?.interviewScheduledAt,
      interviewRoundTitle:
        record?.interviewRoundTitle ||
        `Technical & System Design Interview · ${job.company}`,
      interviewFeedbackNotes: record?.interviewFeedbackNotes || [],
      history
    });
  }

  const totalTracked = allEntries.length;
  const activePipelineCount = stageCounts.Applied + stageCounts.Interviewing;
  const offerConversionRate =
    totalTracked > 0
      ? Math.round((stageCounts['Offer Received'] / totalTracked) * 100)
      : 0;

  const entries =
    stageFilter === 'ALL'
      ? allEntries
      : allEntries.filter((e) => e.currentStage === stageFilter);

  return {
    totalTracked,
    stageCounts,
    activePipelineCount,
    offerConversionRate,
    entries
  };
}

/**
 * Formats the toast/status notification when a student's job application stage changes,
 * accounting for the enableEmailNotifications setting in UserSettings.
 */
export function formatApplicationStatusNotification(params: {
  jobTitle: string;
  company: string;
  nextStage: ApplicationStage;
  enableEmailNotifications: boolean;
  userEmail?: string;
}): string {
  const {
    jobTitle,
    company,
    nextStage,
    enableEmailNotifications,
    userEmail = 'student@jobnova.edu'
  } = params;

  const baseMessage = `Updated ${jobTitle} at ${company} to "${nextStage}" stage.`;
  if (enableEmailNotifications) {
    return `${baseMessage} Email alert sent to ${userEmail}.`;
  }
  return `${baseMessage} (Email alerts muted in Settings).`;
}

export type ProficiencyTier = 'Beginner' | 'Intermediate' | 'Advanced';

export interface MockInterviewQuestion {
  id: string;
  category: 'Technical' | 'System Design' | 'Behavioral';
  difficulty: ProficiencyTier;
  skillFocus: string;
  question: string;
  keyPoints: string[];
  sampleAnswer: string;
}

export interface MockAnswerEvaluation {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
}

/**
 * Maps a numeric average student proficiency score (0-100) to a ProficiencyTier.
 */
export function deriveStudentProficiencyTier(avgScore: number): ProficiencyTier {
  if (avgScore >= 82) return 'Advanced';
  if (avgScore >= 65) return 'Intermediate';
  return 'Beginner';
}

const SKILL_QUESTION_BANK: Record<
  string,
  Record<
    ProficiencyTier,
    { question: string; keyPoints: string[]; sampleAnswer: string }
  >
> = {
  java: {
    Beginner: {
      question:
        'Explain the difference between an Interface and an Abstract Class in Java, and when you would use each in an enterprise project.',
      keyPoints: ['interface', 'abstract', 'multiple inheritance', 'state', 'default methods'],
      sampleAnswer:
        'An interface defines a contract of methods (with optional default/static methods since Java 8) and supports multiple implementation inheritance, whereas an abstract class can hold state (fields), constructors, and shared base logic for closely related subclasses.'
    },
    Intermediate: {
      question:
        'How does Java HashMap work internally, how are hash collisions resolved in Java 8+, and why must immutable keys implement equals() and hashCode()?',
      keyPoints: ['hashcode', 'equals', 'bucket', 'collision', 'red-black tree'],
      sampleAnswer:
        'HashMap computes a bucket index from key.hashCode(). Collisions are stored as a linked list in the bucket until the bucket exceeds TREEIFY_THRESHOLD (8), at which point it converts into a balanced Red-Black Tree (O(log n) lookup). Immutable keys prevent hash code mutation after insertion.'
    },
    Advanced: {
      question:
        'How do you diagnose thread contention, deadlocks, and GC pauses in a high-throughput Java microservice running on the JVM?',
      keyPoints: ['thread dump', 'gc', 'lock', 'volatile', 'completablefuture'],
      sampleAnswer:
        'Capture thread dumps (jstack/JFR) to inspect BLOCKED threads and lock owners, analyze GC logs for stop-the-world pauses, minimize synchronized scope using ConcurrentHashMap or lock-free atomics, and use CompletableFuture or virtual threads for non-blocking I/O.'
    }
  },
  springboot: {
    Beginner: {
      question:
        'What is Spring Boot Auto-Configuration, and how do @RestController, @Service, and @Repository work together in a layered architecture?',
      keyPoints: ['autoconfiguration', 'restcontroller', 'service', 'repository', 'dependency injection'],
      sampleAnswer:
        '@SpringBootApplication enables classpath-based auto-configuration. @RestController handles HTTP requests, delegates business rules to @Service beans via constructor dependency injection, and persists entities through Spring Data @Repository interfaces.'
    },
    Intermediate: {
      question:
        'How do you manage database transactions (@Transactional), exception handling (@ControllerAdvice), and DTO validation in a Spring Boot REST API?',
      keyPoints: ['transactional', 'rollback', 'controlleradvice', 'validation', 'dto'],
      sampleAnswer:
        'Annotate service methods with @Transactional so unchecked exceptions trigger automatic rollback, validate incoming request DTOs with @Valid, and centralize HTTP error responses using @RestControllerAdvice and @ExceptionHandler.'
    },
    Advanced: {
      question:
        'Design an idempotent, fault-tolerant Spring Boot REST service that handles concurrent updates and integrates OAuth2 / JWT security.',
      keyPoints: ['idempotency', 'optimistic locking', 'version', 'securityfilterchain', 'oauth2'],
      sampleAnswer:
        'Use @Version optimistic locking on JPA entities to prevent lost updates, enforce idempotency keys on mutating POST/PUT endpoints, and configure a stateless SecurityFilterChain validating OAuth2/JWT bearer tokens.'
    }
  },
  sql: {
    Beginner: {
      question:
        'What is the difference between INNER JOIN and LEFT JOIN in SQL, and how do primary and foreign keys enforce relational integrity?',
      keyPoints: ['inner join', 'left join', 'primary key', 'foreign key', 'null'],
      sampleAnswer:
        'INNER JOIN returns only rows matching in both tables, while LEFT JOIN returns all rows from the left table and NULLs for unmatched right rows. Primary keys uniquely identify rows, and foreign keys enforce referential integrity across tables.'
    },
    Intermediate: {
      question:
        'How do B-Tree indexes speed up MySQL/SQL queries, and how would you optimize a slow query filtering by skills and location?',
      keyPoints: ['index', 'explain', 'composite', 'selectivity', 'full table scan'],
      sampleAnswer:
        'Run EXPLAIN to inspect the query execution plan and avoid full table scans. Create a composite B-Tree index on (location, skills) ordered by selectivity, and project only required columns instead of SELECT *.'
    },
    Advanced: {
      question:
        'Explain ACID isolation levels (Read Committed vs. Repeatable Read) and how to prevent phantom reads and N+1 query bottlenecks in JPA/Hibernate.',
      keyPoints: ['isolation', 'repeatable read', 'n+1', 'join fetch', 'entitygraph'],
      sampleAnswer:
        'Repeatable Read uses MVCC snapshots to prevent non-repeatable reads. In JPA/Hibernate, eliminate N+1 query bottlenecks by using JOIN FETCH in JPQL or @EntityGraph on repository methods.'
    }
  },
  mysql: {
    Beginner: {
      question:
        'How do you design a normalized MySQL schema for students, jobs, and job applications with proper foreign key constraints?',
      keyPoints: ['primary key', 'foreign key', 'normalization', 'join', 'unique'],
      sampleAnswer:
        'Create separate users, jobs, and job_applications tables. Use a composite unique constraint on (user_id, job_id) in job_applications with foreign keys referencing users(id) and jobs(id).'
    },
    Intermediate: {
      question:
        'How do InnoDB transactions, composite indexes, and EXPLAIN plans help optimize high-read MySQL tables in a Spring Boot application?',
      keyPoints: ['innodb', 'explain', 'composite index', 'transaction', 'connection pool'],
      sampleAnswer:
        'InnoDB provides row-level locking and ACID transactions. Using EXPLAIN identifies missing indexes; adding composite indexes on frequently filtered columns and tuning HikariCP connection pools keeps query latency low.'
    },
    Advanced: {
      question:
        'How do you handle MySQL deadlock recovery, read replicas, and schema migrations (Flyway/Liquibase) without downtime?',
      keyPoints: ['deadlock', 'replica', 'flyway', 'index', 'migration'],
      sampleAnswer:
        'Keep transactions short and access tables in a consistent order to avoid InnoDB deadlocks, route read-heavy reporting queries to read replicas, and apply backward-compatible schema changes via Flyway.'
    }
  },
  react: {
    Beginner: {
      question:
        'Explain the difference between props and state in React.js, and how useState and useEffect manage component lifecycle.',
      keyPoints: ['props', 'state', 'usestate', 'useeffect', 'render'],
      sampleAnswer:
        'Props are immutable inputs passed from parent to child, while state (managed via useState) holds mutable data local to a component. useEffect runs side effects such as API data fetching after render and cleans up subscriptions.'
    },
    Intermediate: {
      question:
        'How do you prevent unnecessary re-renders in React.js when filtering large job lists and synchronizing form state?',
      keyPoints: ['usememo', 'usecallback', 'key', 'controlled', 'derived state'],
      sampleAnswer:
        'Compute filtered lists as derived state (or memoize expensive transforms with useMemo), use stable unique IDs for list keys, and keep inputs controlled with clean handler functions.'
    },
    Advanced: {
      question:
        'How would you architect state management, optimistic UI updates, and error boundaries in a complex React + TypeScript dashboard?',
      keyPoints: ['optimistic', 'error boundary', 'context', 'typescript', 'rollback'],
      sampleAnswer:
        'Apply optimistic state updates immediately for snappy UX while rolling back on API failure, isolate widgets with Error Boundaries, and enforce strict TypeScript interfaces across API payloads.'
    }
  },
  javascript: {
    Beginner: {
      question:
        'What are closures, Promises, and async/await in JavaScript, and how do you use fetch() to call a Spring Boot REST endpoint?',
      keyPoints: ['closure', 'promise', 'async', 'await', 'fetch'],
      sampleAnswer:
        'A closure retains access to its lexical scope. Promises and async/await simplify asynchronous HTTP calls with fetch(), allowing try/catch error handling and JSON parsing.'
    },
    Intermediate: {
      question:
        'Explain the JavaScript Event Loop, microtask queue vs. macrotask queue, and how debouncing improves search input performance.',
      keyPoints: ['event loop', 'microtask', 'call stack', 'debounce', 'promise'],
      sampleAnswer:
        'The event loop processes the call stack, then drains all microtasks (Promise callbacks) before executing the next macrotask (setTimeout). Debouncing delays search API calls until the user pauses typing.'
    },
    Advanced: {
      question:
        'How do you prevent memory leaks, race conditions in concurrent fetch requests, and XSS vulnerabilities in modern JavaScript apps?',
      keyPoints: ['abortcontroller', 'race condition', 'memory leak', 'xss', 'sanitize'],
      sampleAnswer:
        'Use AbortController to cancel stale in-flight fetch requests when filters change rapidly, clean up event listeners and timers on unmount, and escape untrusted content to prevent XSS.'
    }
  }
};

/**
 * Generates tailored practice interview questions based on a saved job role and the student's proficiency tier.
 */
export function generateMockInterviewQuestions(params: {
  job: JobItem;
  proficiencyTier: ProficiencyTier;
  userSkills?: string[];
  variantIndex?: number;
}): MockInterviewQuestion[] {
  const { job, proficiencyTier, variantIndex = 0 } = params;

  const jobSkillTokens = job.skills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const primarySkill = jobSkillTokens[0] || 'java';
  const secondarySkill = jobSkillTokens[1] || 'springboot';

  const bank1 =
    SKILL_QUESTION_BANK[primarySkill]?.[proficiencyTier] ||
    SKILL_QUESTION_BANK.java[proficiencyTier];
  const bank2 =
    SKILL_QUESTION_BANK[secondarySkill]?.[proficiencyTier] ||
    SKILL_QUESTION_BANK.springboot[proficiencyTier];

  const primaryLabel =
    SKILL_DISPLAY_NAMES[primarySkill] ||
    primarySkill.charAt(0).toUpperCase() + primarySkill.slice(1);
  const secondaryLabel =
    SKILL_DISPLAY_NAMES[secondarySkill] ||
    secondarySkill.charAt(0).toUpperCase() + secondarySkill.slice(1);

  const systemDesignPrompts: Record<ProficiencyTier, { q: string; keys: string[]; sample: string }> = {
    Beginner: {
      q: `For the ${job.title} role at ${job.company}, how would you structure the REST API endpoints, database tables, and frontend components for a job application tracker?`,
      keys: ['rest api', 'get', 'post', 'database', 'component'],
      sample: `Define REST endpoints (GET /api/jobs, POST /api/applications), a relational table linking user_id and job_id with status columns, and modular React components for filtering and status updates.`
    },
    Intermediate: {
      q: `As a ${job.title} candidate at ${job.company}, design a scalable search and recommendation service that filters thousands of jobs by ${primaryLabel} and ${secondaryLabel} with low latency.`,
      keys: ['index', 'pagination', 'cache', 'rest', 'query'],
      sample: `Use indexed database queries with cursor/page pagination, cache frequent skill searches, and expose a clean search endpoint with debounced client queries.`
    },
    Advanced: {
      q: `System Design (${job.company} — ${job.title}): Architect a high-availability notification and interview scheduling pipeline supporting real-time status updates and email alerts.`,
      keys: ['queue', 'idempotent', 'retry', 'database', 'scalability'],
      sample: `Persist stage transitions transactionally, publish status events to an async message queue, process email dispatch with idempotent retries, and respect user notification preferences.`
    }
  };

  const sysDesign = systemDesignPrompts[proficiencyTier];

  const behavioralQuestion =
    variantIndex % 2 === 0
      ? `Tell me about a challenging bug or architectural trade-off you resolved while building a project with ${primaryLabel} and ${secondaryLabel}, and why you are excited about joining ${job.company} as a ${job.title}.`
      : `Describe a time when you had to learn a new technology stack quickly under a deadline. How would you apply that approach in your first 90 days as a ${job.title} at ${job.company}?`;

  return [
    {
      id: `mock-${job.id}-${proficiencyTier}-1-${variantIndex}`,
      category: 'Technical',
      difficulty: proficiencyTier,
      skillFocus: primaryLabel,
      question: bank1.question,
      keyPoints: bank1.keyPoints,
      sampleAnswer: bank1.sampleAnswer
    },
    {
      id: `mock-${job.id}-${proficiencyTier}-2-${variantIndex}`,
      category: 'Technical',
      difficulty: proficiencyTier,
      skillFocus: secondaryLabel,
      question: bank2.question,
      keyPoints: bank2.keyPoints,
      sampleAnswer: bank2.sampleAnswer
    },
    {
      id: `mock-${job.id}-${proficiencyTier}-3-${variantIndex}`,
      category: 'System Design',
      difficulty: proficiencyTier,
      skillFocus: `${primaryLabel} & ${secondaryLabel} Architecture`,
      question: sysDesign.q,
      keyPoints: sysDesign.keys,
      sampleAnswer: sysDesign.sample
    },
    {
      id: `mock-${job.id}-${proficiencyTier}-4-${variantIndex}`,
      category: 'Behavioral',
      difficulty: proficiencyTier,
      skillFocus: 'STAR Behavioral & Role Fit',
      question: behavioralQuestion,
      keyPoints: ['situation', 'task', 'action', 'result', job.company.toLowerCase()],
      sampleAnswer: `Use the STAR framework: state the Situation and technical context, explain the Task/bug, detail the specific Actions you took using ${primaryLabel}/${secondaryLabel}, and quantify the Result.`
    }
  ];
}

/**
 * Evaluates a student's practice response against a MockInterviewQuestion's key points.
 */
export function evaluateMockInterviewAnswer(
  question: MockInterviewQuestion,
  studentAnswer: string
): MockAnswerEvaluation {
  const normalized = (studentAnswer || '').trim().toLowerCase();
  if (!normalized) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [...question.keyPoints],
      feedback: 'Please enter a practice answer before requesting evaluation.'
    };
  }

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kp of question.keyPoints) {
    if (normalized.includes(kp.toLowerCase())) {
      matchedKeywords.push(kp);
    } else {
      missingKeywords.push(kp);
    }
  }

  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const lengthScore = Math.min(40, Math.round((wordCount / 25) * 40));
  const keywordRatio =
    question.keyPoints.length > 0
      ? matchedKeywords.length / question.keyPoints.length
      : 1;
  const keywordScore = Math.round(keywordRatio * 60);
  const totalScore = Math.min(100, Math.max(15, lengthScore + keywordScore));

  let feedback = '';
  if (totalScore >= 80) {
    feedback = `Strong ${question.difficulty}-level answer! You covered key concepts (${matchedKeywords.join(', ') || 'core architecture'}) with clear technical depth.`;
  } else if (totalScore >= 50) {
    feedback = `Good foundation. To make your answer stand out for a ${question.difficulty} interview, also mention: ${missingKeywords.slice(0, 3).join(', ')}.`;
  } else {
    feedback = `Try expanding your explanation with concrete examples and key concepts such as: ${missingKeywords.slice(0, 4).join(', ')}.`;
  }

  return {
    score: totalScore,
    matchedKeywords,
    missingKeywords,
    feedback
  };
}

/**
 * Pure helper to update Minimum Expected CTC or Maximum Expected CTC via range sliders
 * while keeping expectedSalaryMinLpa <= expectedSalaryMaxLpa within valid LPA bounds (2 to 50 LPA).
 */
export function updateExpectedSalarySettings(
  settings: UserSettings,
  boundary: 'min' | 'max',
  rawValue: number
): UserSettings {
  const numeric = Number.isFinite(rawValue) ? Number(rawValue.toFixed(1)) : 6;
  if (boundary === 'min') {
    const nextMin = Math.max(2, Math.min(45, numeric));
    const nextMax = Math.max(nextMin, Math.min(50, settings.expectedSalaryMaxLpa));
    return {
      ...settings,
      expectedSalaryMinLpa: nextMin,
      expectedSalaryMaxLpa: nextMax
    };
  } else {
    const nextMax = Math.max(2, Math.min(50, numeric));
    const nextMin = Math.max(2, Math.min(settings.expectedSalaryMinLpa, nextMax));
    return {
      ...settings,
      expectedSalaryMinLpa: nextMin,
      expectedSalaryMaxLpa: nextMax
    };
  }
}

export interface MissingSkillRecommendation {
  rank: number;
  skillKey: string;
  skillLabel: string;
  status: 'Missing from Profile' | 'Proficiency Gap';
  studentProficiency: number;
  industryRequirement: number;
  gapPoints: number;
  requiredByRoles: string[];
  suggestedCourses: CourseItem[];
}

export interface ProfileSkillGapSummary {
  savedRolesCount: number;
  benchmarkedRoleNames: string[];
  overallReadinessScore: number;
  topMissingSkills: MissingSkillRecommendation[];
}

const SKILL_COURSE_KEYWORDS: Record<string, string[]> = {
  sql: ['mysql', 'sql', 'database', 'data'],
  mysql: ['mysql', 'sql', 'database', 'fullstack'],
  springboot: ['spring', 'rest api', 'java', 'fullstack'],
  spring: ['spring', 'rest api', 'java'],
  hibernate: ['rest api', 'spring', 'java', 'mysql'],
  java: ['java', 'spring', 'dsa', 'rest api'],
  react: ['react', 'javascript', 'fullstack', 'html'],
  javascript: ['javascript', 'react', 'fullstack'],
  js: ['javascript', 'react', 'fullstack'],
  html: ['html', 'bootstrap', 'fullstack'],
  css: ['css', 'html', 'bootstrap'],
  python: ['python', 'pandas', 'machine learning', 'ai'],
  aws: ['aws', 'cloud', 'devops', 'azure'],
  cloud: ['aws', 'azure', 'cloud', 'devops'],
  docker: ['docker', 'devops', 'linux', 'aws'],
  kubernetes: ['devops', 'docker', 'aws', 'linux'],
  jenkins: ['jenkins', 'devops', 'git'],
  devops: ['devops', 'docker', 'linux', 'aws'],
  linux: ['linux', 'devops', 'cybersecurity'],
  ai: ['ai', 'machine learning', 'deep learning', 'chatgpt'],
  ml: ['machine learning', 'deep learning', 'python'],
  tensorflow: ['tensorflow', 'deep learning', 'machine learning'],
  cybersecurity: ['cybersecurity', 'ethical hacking', 'linux'],
  uiux: ['ui/ux', 'figma', 'bootstrap'],
  figma: ['figma', 'ui/ux', 'bootstrap'],
  flutter: ['flutter', 'android', 'java']
};

/**
 * Matches up to 2 relevant learning courses for a given skill key from the courses catalog.
 */
function findSuggestedCoursesForSkill(
  skillKey: string,
  courses: CourseItem[]
): CourseItem[] {
  const cleanKey = skillKey.trim().toLowerCase();
  const keywords = SKILL_COURSE_KEYWORDS[cleanKey] || [cleanKey, 'fullstack', 'java'];

  const scored = courses.map((course) => {
    const haystack = `${course.title} ${course.description} ${course.provider}`.toLowerCase();
    let score = 0;
    if (haystack.includes(cleanKey)) score += 10;
    keywords.forEach((kw, idx) => {
      if (haystack.includes(kw)) {
        score += Math.max(2, 8 - idx * 2);
      }
    });
    return { course, score };
  });

  scored.sort((a, b) => b.score - a.score || a.course.id - b.course.id);
  return scored
    .filter((item) => item.score > 0)
    .slice(0, 2)
    .map((item) => item.course);
}

/**
 * Computes a 'Skill Gap Analysis' summary highlighting the top 3 missing/gap skills
 * required by the student's saved job roles and suggesting relevant learning courses.
 * Respects manual skill proficiency updates from the Skill Proficiency Tracker.
 */
export function computeProfileSkillGapAnalysis(params: {
  userSkills: string[];
  jobs: JobItem[];
  savedJobIds: number[];
  courses: CourseItem[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): ProfileSkillGapSummary {
  const {
    userSkills,
    jobs,
    savedJobIds,
    courses,
    enrolledCourseIds = [],
    savedCertIds = [],
    customProficiencyOverrides = {}
  } = params;

  const normalizedUserSkills = userSkills
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const primaryRoles = savedJobs.length > 0 ? savedJobs : jobs.slice(0, 2);

  // Supplemental roles in the student's career track to guarantee at least 3 distinct skill gaps
  const supplementalRoles = jobs.filter(
    (j) =>
      !primaryRoles.some((p) => p.id === j.id) &&
      (j.id === 2 || j.id === 10 || j.id === 4 || j.id === 6)
  );

  const courseBonus = Math.min(8, enrolledCourseIds.length * 2);
  const certBonus = Math.min(6, savedCertIds.length * 2);

  const computeEffectiveStudentScore = (key: string, isListed: boolean): number => {
    const manualOverride = customProficiencyOverrides[key];
    if (typeof manualOverride === 'number' && Number.isFinite(manualOverride)) {
      return Math.min(100, Math.max(0, Math.round(manualOverride)));
    }
    const baseStudent = isListed
      ? BASE_STUDENT_PROFICIENCY[key] ?? 70
      : Math.max(35, (BASE_STUDENT_PROFICIENCY[key] ?? 55) - 22);
    return Math.min(
      98,
      baseStudent + (isListed ? courseBonus + certBonus : 0)
    );
  };

  interface CandidateSkill {
    key: string;
    fromSavedRole: boolean;
    isMissingFromProfile: boolean;
    hasManualOverrideGap: boolean;
    studentProficiency: number;
    industryRequirement: number;
    gapPoints: number;
    requiredByRoles: string[];
  }

  const candidateMap = new Map<string, CandidateSkill>();

  const registerRoleSkills = (roleList: JobItem[], isSavedGroup: boolean) => {
    for (const job of roleList) {
      const roleLabel = `${job.title} (${job.company})`;
      const tokens = job.skills
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      for (const key of tokens) {
        const isListed = normalizedUserSkills.includes(key);
        const studentProficiency = computeEffectiveStudentScore(key, isListed);
        const industryRequirement = INDUSTRY_BENCHMARK_BY_SKILL[key] ?? 82;
        const rawGap = industryRequirement - studentProficiency;
        const hasManualOverrideGap =
          typeof customProficiencyOverrides[key] === 'number' && rawGap > 0;

        const existing = candidateMap.get(key);
        if (existing) {
          if (isSavedGroup) existing.fromSavedRole = true;
          if (!existing.requiredByRoles.includes(roleLabel)) {
            existing.requiredByRoles.push(roleLabel);
          }
        } else {
          candidateMap.set(key, {
            key,
            fromSavedRole: isSavedGroup,
            isMissingFromProfile: !isListed,
            hasManualOverrideGap,
            studentProficiency,
            industryRequirement,
            gapPoints: Math.max(0, rawGap),
            requiredByRoles: [roleLabel]
          });
        }
      }
    }
  };

  registerRoleSkills(primaryRoles, true);
  registerRoleSkills(supplementalRoles, false);

  // Also register any listed profile skills where the student manually set a lower proficiency
  // below industry standards so the Skill Proficiency Tracker directly influences the gap list
  for (const key of normalizedUserSkills) {
    if (!candidateMap.has(key)) {
      const studentProficiency = computeEffectiveStudentScore(key, true);
      const industryRequirement = INDUSTRY_BENCHMARK_BY_SKILL[key] ?? 80;
      const rawGap = industryRequirement - studentProficiency;
      if (rawGap > 0) {
        const matchingRole = jobs.find((j) =>
          j.skills
            .toLowerCase()
            .split(',')
            .map((s) => s.trim())
            .includes(key)
        );
        candidateMap.set(key, {
          key,
          fromSavedRole: true,
          isMissingFromProfile: false,
          hasManualOverrideGap: typeof customProficiencyOverrides[key] === 'number',
          studentProficiency,
          industryRequirement,
          gapPoints: rawGap,
          requiredByRoles: [
            matchingRole
              ? `${matchingRole.title} (${matchingRole.company})`
              : 'Full-Stack Engineering Benchmark'
          ]
        });
      }
    }
  }

  const allCandidates = Array.from(candidateMap.values()).filter(
    (c) => c.isMissingFromProfile || c.gapPoints > 0
  );

  // Sort priority:
  // 1. Missing from profile AND required by a saved job role
  // 2. Listed profile skill with a proficiency gap (or manual override gap) on saved/target role
  // 3. Missing from profile in supplemental career track roles
  // 4. Highest gapPoints
  allCandidates.sort((a, b) => {
    const scoreA =
      (a.fromSavedRole && a.isMissingFromProfile ? 1000 : 0) +
      (a.hasManualOverrideGap ? 750 : 0) +
      (a.fromSavedRole && a.gapPoints > 0 ? 500 : 0) +
      (a.isMissingFromProfile ? 250 : 0) +
      a.gapPoints;
    const scoreB =
      (b.fromSavedRole && b.isMissingFromProfile ? 1000 : 0) +
      (b.hasManualOverrideGap ? 750 : 0) +
      (b.fromSavedRole && b.gapPoints > 0 ? 500 : 0) +
      (b.isMissingFromProfile ? 250 : 0) +
      b.gapPoints;
    return scoreB - scoreA;
  });

  const topThree = allCandidates.slice(0, 3).map((item, idx) => {
    const displayLabel =
      SKILL_DISPLAY_NAMES[item.key] ||
      item.key.charAt(0).toUpperCase() + item.key.slice(1);
    const suggested = findSuggestedCoursesForSkill(item.key, courses);

    return {
      rank: idx + 1,
      skillKey: item.key,
      skillLabel: displayLabel,
      status: item.isMissingFromProfile
        ? ('Missing from Profile' as const)
        : ('Proficiency Gap' as const),
      studentProficiency: item.studentProficiency,
      industryRequirement: item.industryRequirement,
      gapPoints: Math.max(4, item.gapPoints),
      requiredByRoles: item.requiredByRoles.slice(0, 2),
      suggestedCourses: suggested
    };
  });

  // Compute overall readiness score across primaryRoles using customProficiencyOverrides
  const radarPoints = computeSkillRadarData({
    userSkills,
    savedJobs: primaryRoles,
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides
  });
  const avgRatio =
    radarPoints.length > 0
      ? radarPoints.reduce(
          (acc, p) =>
            acc +
            Math.min(1, p.studentProficiency / Math.max(1, p.industryRequirement)),
          0
        ) / radarPoints.length
      : 0.85;
  const overallReadinessScore = Math.round(avgRatio * 100);

  return {
    savedRolesCount: savedJobs.length,
    benchmarkedRoleNames: primaryRoles.map((j) => `${j.title} (${j.company})`),
    overallReadinessScore,
    topMissingSkills: topThree
  };
}

export const PROFICIENCY_TIER_SCORES: Record<ProficiencyTier, number> = {
  Beginner: 45,
  Intermediate: 72,
  Advanced: 92
};

export interface UserSkillProficiencyItem {
  skillKey: string;
  skillLabel: string;
  proficiency: number;
  tier: ProficiencyTier;
  industryBenchmark: number;
  deltaFromBenchmark: number;
  isRequiredBySavedRoles: boolean;
}

/**
 * Computes the list of user profile skills with their current proficiency percentage,
 * tier ('Beginner' | 'Intermediate' | 'Advanced'), and industry benchmark delta for the
 * Skill Proficiency Tracker in ProfileSettingsView.
 */
export function computeProfileSkillProficiencyList(params: {
  userSkills: string[];
  jobs: JobItem[];
  savedJobIds: number[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): UserSkillProficiencyItem[] {
  const {
    userSkills,
    jobs,
    savedJobIds,
    enrolledCourseIds = [],
    savedCertIds = [],
    customProficiencyOverrides = {}
  } = params;

  const normalizedUserSkills = Array.from(
    new Set(
      userSkills
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const savedRoleSkills = new Set<string>();
  for (const job of savedJobs) {
    job.skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach((sk) => savedRoleSkills.add(sk));
  }

  const courseBonus = Math.min(8, enrolledCourseIds.length * 2);
  const certBonus = Math.min(6, savedCertIds.length * 2);

  return normalizedUserSkills.map((key) => {
    const manualOverride = customProficiencyOverrides[key];
    const baseStudent = BASE_STUDENT_PROFICIENCY[key] ?? 72;
    const proficiency =
      typeof manualOverride === 'number' && Number.isFinite(manualOverride)
        ? Math.min(100, Math.max(0, Math.round(manualOverride)))
        : Math.min(98, baseStudent + courseBonus + certBonus);

    const industryBenchmark = INDUSTRY_BENCHMARK_BY_SKILL[key] ?? 80;
    const tier = deriveStudentProficiencyTier(proficiency);
    const skillLabel =
      SKILL_DISPLAY_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);

    return {
      skillKey: key,
      skillLabel,
      proficiency,
      tier,
      industryBenchmark,
      deltaFromBenchmark: proficiency - industryBenchmark,
      isRequiredBySavedRoles: savedRoleSkills.has(key)
    };
  });
}

/**
 * Pure helper to update a skill's proficiency level (by tier preset 'Beginner' | 'Intermediate' | 'Advanced'
 * or numeric score 0-100) in the user's custom proficiency map.
 */
export function updateSkillProficiencyMap(
  currentOverrides: Record<string, number>,
  skillKey: string,
  levelOrScore: ProficiencyTier | number
): Record<string, number> {
  const cleanKey = skillKey.trim().toLowerCase();
  if (!cleanKey) return currentOverrides;

  const numericScore =
    typeof levelOrScore === 'number'
      ? Math.min(100, Math.max(0, Math.round(levelOrScore)))
      : PROFICIENCY_TIER_SCORES[levelOrScore];

  return {
    ...currentOverrides,
    [cleanKey]: numericScore
  };
}

/**
 * Pure helper to toggle the interface theme between 'light' and 'dark' in UserSettings.
 */
export function toggleThemeSetting(settings: UserSettings): UserSettings {
  const nextTheme: UserSettings['theme'] =
    settings.theme === 'dark' ? 'light' : 'dark';
  return {
    ...settings,
    theme: nextTheme
  };
}

export interface ResumeHealthPillar {
  id: 'profile' | 'skills' | 'education' | 'certifications';
  label: string;
  earnedPoints: number;
  maxPoints: number;
  percentage: number;
  statusLabel: string;
}

export interface ResumeHealthTip {
  id: string;
  category: 'Skills' | 'Education' | 'Certifications' | 'Profile';
  title: string;
  description: string;
  impactPoints: number;
  actionType?:
    | 'complete_education'
    | 'add_skill_sql'
    | 'track_certification'
    | 'expand_summary';
  actionLabel?: string;
}

export interface ResumeHealthAssessment {
  overallScore: number;
  gradeLabel:
    | 'Needs Attention'
    | 'Good Standing'
    | 'Strong Profile'
    | 'Recruiter-Ready';
  pillars: ResumeHealthPillar[];
  actionableTips: ResumeHealthTip[];
  completedStrengths: string[];
}

/**
 * Computes a 0-100% Resume Health Score based on the completeness of the user's profile:
 * 1. Core Profile & Summary (20 pts)
 * 2. Technical Skills & Calibration (30 pts)
 * 3. Education History (25 pts)
 * 4. Certifications & Coursework (25 pts)
 * Also generates prioritized actionable tips with point impacts for improvement.
 */
export function computeResumeHealthScore(params: {
  name?: string;
  email?: string;
  headline?: string;
  location?: string;
  summary?: string;
  education?: string;
  skills: string[];
  savedCertIds: number[];
  enrolledCourseIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): ResumeHealthAssessment {
  const {
    name = '',
    email = '',
    headline = '',
    location = '',
    summary = '',
    education = '',
    skills = [],
    savedCertIds = [],
    enrolledCourseIds = [],
    customProficiencyOverrides = {}
  } = params;

  const actionableTips: ResumeHealthTip[] = [];
  const completedStrengths: string[] = [];

  // 1. Core Profile & Summary (Max 20 pts)
  let profilePoints = 0;
  const hasIdentity = name.trim().length >= 2 && email.trim().includes('@');
  const hasHeadlineAndLoc =
    headline.trim().length >= 15 && location.trim().length >= 2;
  const cleanSummary = summary.trim();
  const hasBaseSummary = cleanSummary.length >= 60;
  const hasDetailedSummary = cleanSummary.length >= 120;

  if (hasIdentity) profilePoints += 6;
  if (hasHeadlineAndLoc) profilePoints += 6;
  if (hasDetailedSummary) {
    profilePoints += 8;
    completedStrengths.push(' Comprehensive professional summary & headline');
  } else if (hasBaseSummary) {
    profilePoints += 5;
    actionableTips.push({
      id: 'tip-expand-summary',
      category: 'Profile',
      title: 'Expand your professional summary with project impact',
      description:
        'Summaries over 120 characters mentioning full-stack architecture and target roles rank higher in ATS scans.',
      impactPoints: 3,
      actionType: 'expand_summary',
      actionLabel: 'Enrich Summary (+3%)'
    });
  } else {
    actionableTips.push({
      id: 'tip-add-summary',
      category: 'Profile',
      title: 'Add a 2–3 sentence professional summary',
      description:
        'Introduce your core engineering stack (Java, Spring Boot, React.js, MySQL) and career goals.',
      impactPoints: 8,
      actionType: 'expand_summary',
      actionLabel: 'Add Summary (+8%)'
    });
  }

  // 2. Technical Skills & Calibration (Max 30 pts)
  const uniqueSkills = Array.from(
    new Set(
      skills
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    )
  );
  let skillsPoints = 0;
  if (uniqueSkills.length >= 8) {
    skillsPoints += 24;
    completedStrengths.push(`${uniqueSkills.length} technical skills listed across full-stack tiers`);
  } else if (uniqueSkills.length >= 6) {
    skillsPoints += 20;
    actionableTips.push({
      id: 'tip-add-8th-skill',
      category: 'Skills',
      title: 'Add enterprise SQL / database querying to reach 8+ core skills',
      description:
        'Listing at least 8 calibrated technical skills (including SQL alongside MySQL & Spring Boot) boosts keyword matching for SDE roles.',
      impactPoints: 4,
      actionType: 'add_skill_sql',
      actionLabel: 'Add #sql to Skills (+4%)'
    });
  } else {
    const earned = Math.min(18, uniqueSkills.length * 3);
    skillsPoints += earned;
    actionableTips.push({
      id: 'tip-add-core-skills',
      category: 'Skills',
      title: 'List at least 7–8 core full-stack skills in your profile',
      description:
        'Include Java, Spring Boot, React.js, JavaScript, HTML5, CSS3, MySQL, and SQL.',
      impactPoints: 24 - earned,
      actionType: 'add_skill_sql',
      actionLabel: `Add Core Skills (+${24 - earned}%)`
    });
  }

  // Calibration bonus (up to 6 pts)
  const overrideValues = Object.values(customProficiencyOverrides);
  const hasHighMastery =
    uniqueSkills.length >= 5 &&
    (overrideValues.length === 0 ||
      overrideValues.reduce((a, b) => a + b, 0) / overrideValues.length >= 65);
  if (hasHighMastery) {
    skillsPoints += 6;
  } else {
    skillsPoints += 3;
  }

  // 3. Education History Completeness (Max 25 pts)
  const cleanEdu = education.trim();
  const eduLower = cleanEdu.toLowerCase();
  let educationPoints = 0;
  const hasDegreeAndInst = cleanEdu.length >= 20;
  const hasGradYear = /\b202\d\b|\b201\d\b/.test(cleanEdu);
  const hasGpaOrCoursework =
    /cgpa|gpa|%|honors|coursework|dsa|dbms/i.test(eduLower);

  if (hasDegreeAndInst) educationPoints += 12;
  if (hasGradYear) educationPoints += 6;
  if (hasGpaOrCoursework) {
    educationPoints += 7;
    completedStrengths.push('Education history includes degree, graduation timeline & CGPA/coursework');
  } else {
    const missingEduPts = 25 - educationPoints;
    actionableTips.push({
      id: 'tip-complete-education',
      category: 'Education',
      title: 'Add CGPA & Core CS Coursework to your Education History',
      description:
        'Campus and fresher recruiters look for your CGPA (e.g., 8.8/10) and relevant coursework (DSA, DBMS, OS) in the Education section.',
      impactPoints: missingEduPts,
      actionType: 'complete_education',
      actionLabel: `Add CGPA & Coursework (+${missingEduPts}%)`
    });
  }

  // 4. Certifications & Coursework Count (Max 25 pts)
  let certPoints = 0;
  const certCount = savedCertIds.length;
  if (certCount >= 3) {
    certPoints += 21;
    completedStrengths.push(`${certCount} verified industry certifications tracked on resume`);
  } else if (certCount === 2) {
    certPoints += 16;
    actionableTips.push({
      id: 'tip-track-3rd-cert',
      category: 'Certifications',
      title: 'Track 1 more industry certification (target: 3+ credentials)',
      description:
        'You currently have 2 tracked certifications. Adding a 3rd credential (such as AWS Cloud Practitioner or Google Data Analytics) maximizes your credential score.',
      impactPoints: 5,
      actionType: 'track_certification',
      actionLabel: 'Track +1 Certification (+5%)'
    });
  } else if (certCount === 1) {
    certPoints += 10;
    actionableTips.push({
      id: 'tip-track-more-certs',
      category: 'Certifications',
      title: 'Track at least 3 industry certifications',
      description:
        'Link verified credentials from Oracle, VMware Spring, AWS, or Google to strengthen your resume.',
      impactPoints: 11,
      actionType: 'track_certification',
      actionLabel: 'Track +1 Certification (+6%)'
    });
  } else {
    actionableTips.push({
      id: 'tip-track-first-cert',
      category: 'Certifications',
      title: 'Add industry certifications to your profile',
      description:
        'Track certifications from Oracle Java, VMware Spring, or AWS so they appear on your exported A4 PDF resume.',
      impactPoints: 21,
      actionType: 'track_certification',
      actionLabel: 'Track Certification (+10%)'
    });
  }

  if (enrolledCourseIds.length >= 1) {
    certPoints += 4;
  }

  const overallScore = Math.min(
    100,
    Math.max(0, profilePoints + skillsPoints + educationPoints + certPoints)
  );

  let gradeLabel: ResumeHealthAssessment['gradeLabel'] = 'Needs Attention';
  if (overallScore >= 95) {
    gradeLabel = 'Recruiter-Ready';
  } else if (overallScore >= 80) {
    gradeLabel = 'Strong Profile';
  } else if (overallScore >= 65) {
    gradeLabel = 'Good Standing';
  }

  const pillars: ResumeHealthPillar[] = [
    {
      id: 'profile',
      label: 'Profile & Summary',
      earnedPoints: profilePoints,
      maxPoints: 20,
      percentage: Math.round((profilePoints / 20) * 100),
      statusLabel: profilePoints >= 20 ? 'Complete' : 'Needs Detail'
    },
    {
      id: 'skills',
      label: `Skills & Calibration (${uniqueSkills.length})`,
      earnedPoints: skillsPoints,
      maxPoints: 30,
      percentage: Math.round((skillsPoints / 30) * 100),
      statusLabel: skillsPoints >= 30 ? 'Optimal (8+)' : `${uniqueSkills.length}/8 Listed`
    },
    {
      id: 'education',
      label: 'Education History',
      earnedPoints: educationPoints,
      maxPoints: 25,
      percentage: Math.round((educationPoints / 25) * 100),
      statusLabel: educationPoints >= 25 ? 'Complete (CGPA)' : 'Missing CGPA/Courses'
    },
    {
      id: 'certifications',
      label: `Certifications (${certCount}/3+)`,
      earnedPoints: certPoints,
      maxPoints: 25,
      percentage: Math.round((certPoints / 25) * 100),
      statusLabel: certPoints >= 25 ? '3+ Verified' : `${certCount} Tracked`
    }
  ];

  // Sort actionable tips by highest impactPoints first
  actionableTips.sort((a, b) => b.impactPoints - a.impactPoints);

  return {
    overallScore,
    gradeLabel,
    pillars,
    actionableTips,
    completedStrengths
  };
}

export interface AlertRecommendationItem {
  id: number;
  type: 'job' | 'internship';
  title: string;
  company: string;
  location: string;
  ctcOrStipend: string;
  skills: string;
  matchedSkills: string[];
  description: string;
  isApplied: boolean;
}

export interface SkillAlertGroup {
  skillKey: string;
  skillLabel: string;
  proficiency: number;
  tier: ProficiencyTier;
  reason: 'recent_addition' | 'progressed_advanced' | 'core_strength';
  badgeText: string;
  recommendations: AlertRecommendationItem[];
}

export interface PersonalizedSkillAlertsResult {
  totalAlertsCount: number;
  recommendedJobsCount: number;
  recommendedInternshipsCount: number;
  activeSkillsCount: number;
  alertGroups: SkillAlertGroup[];
}

/**
 * Computes personalized recommendations for jobs and internships based on skills
 * the student has recently added or progressed in their profile.
 */
export function computePersonalizedSkillAlerts(params: {
  userSkills: string[];
  skillProficiencies?: Record<string, number>;
  jobs: JobItem[];
  internships: InternshipItem[];
  appliedJobIds?: number[];
  appliedInternshipIds?: number[];
  selectedSkillFilter?: string;
}): PersonalizedSkillAlertsResult {
  const {
    userSkills,
    skillProficiencies = {},
    jobs,
    internships,
    appliedJobIds = [],
    appliedInternshipIds = [],
    selectedSkillFilter = 'ALL'
  } = params;

  const normalizedUserSkills = userSkills
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Group candidate skills. Higher priority for:
  // 1. Manually progressed skills (in skillProficiencies, especially >= 75% or 92%)
  // 2. Added skills in reverse order (most recently listed in profile)
  const candidateSkillKeys: string[] = [];

  // Skills with custom proficiency updates first (sorted by highest proficiency)
  const progressedSkillKeys = Object.keys(skillProficiencies)
    .filter((k) => normalizedUserSkills.includes(k.toLowerCase()))
    .sort((a, b) => (skillProficiencies[b] || 0) - (skillProficiencies[a] || 0));

  for (const k of progressedSkillKeys) {
    if (!candidateSkillKeys.includes(k)) {
      candidateSkillKeys.push(k);
    }
  }

  // Then listed user skills in reverse order (most recently added at the end of skills array)
  for (let i = normalizedUserSkills.length - 1; i >= 0; i--) {
    const k = normalizedUserSkills[i];
    if (!candidateSkillKeys.includes(k)) {
      candidateSkillKeys.push(k);
    }
  }

  const alertGroups: SkillAlertGroup[] = [];

  for (const skillKey of candidateSkillKeys) {
    const rawScore = skillProficiencies[skillKey];
    const proficiency =
      typeof rawScore === 'number'
        ? rawScore
        : BASE_STUDENT_PROFICIENCY[skillKey] ?? 75;
    const tier = deriveStudentProficiencyTier(proficiency);

    let reason: SkillAlertGroup['reason'] = 'core_strength';
    let badgeText = 'Profile Skill Match';

    if (typeof rawScore === 'number') {
      if (rawScore >= 85) {
        reason = 'progressed_advanced';
        badgeText = `Progressed to ${tier} (${proficiency}%)`;
      } else {
        reason = 'recent_addition';
        badgeText = `Calibrated Level (${proficiency}%)`;
      }
    } else {
      // Recent position in list or high baseline
      const indexFromEnd =
        normalizedUserSkills.length - 1 - normalizedUserSkills.indexOf(skillKey);
      if (indexFromEnd <= 2) {
        reason = 'recent_addition';
        badgeText = 'Recently Added Skill';
      } else {
        reason = 'core_strength';
        badgeText = `Verified Strength (${proficiency}%)`;
      }
    }

    const skillLabel =
      SKILL_DISPLAY_NAMES[skillKey] ||
      skillKey.charAt(0).toUpperCase() + skillKey.slice(1);

    // Find matching jobs for this skill
    const matchingJobs: AlertRecommendationItem[] = [];
    for (const job of jobs) {
      const tokens = job.skills
        .toLowerCase()
        .split(',')
        .map((t) => t.trim());
      if (tokens.includes(skillKey)) {
        matchingJobs.push({
          id: job.id,
          type: 'job',
          title: job.title,
          company: job.company,
          location: job.location,
          ctcOrStipend: job.ctc || 'Competitive',
          skills: job.skills,
          matchedSkills: tokens.filter((t) => normalizedUserSkills.includes(t)),
          description: job.description,
          isApplied: appliedJobIds.includes(job.id)
        });
      }
    }

    // Find matching internships for this skill
    const matchingInternships: AlertRecommendationItem[] = [];
    for (const intern of internships) {
      const haystack = `${intern.title} ${intern.description}`.toLowerCase();
      // Match either direct skill keyword or tech synonym
      const isMatch =
        haystack.includes(skillKey) ||
        (skillKey === 'react' && (haystack.includes('web dev') || haystack.includes('front-end') || haystack.includes('js'))) ||
        (skillKey === 'javascript' && (haystack.includes('web dev') || haystack.includes('js'))) ||
        (skillKey === 'html' && haystack.includes('html')) ||
        (skillKey === 'css' && haystack.includes('css')) ||
        (skillKey === 'java' && haystack.includes('java')) ||
        (skillKey === 'springboot' && (haystack.includes('spring') || haystack.includes('rest api') || haystack.includes('java'))) ||
        (skillKey === 'mysql' && (haystack.includes('database') || haystack.includes('data') || haystack.includes('sql')));

      if (isMatch) {
        matchingInternships.push({
          id: intern.id,
          type: 'internship',
          title: intern.title,
          company: intern.company,
          location: intern.location,
          ctcOrStipend: intern.stipend || 'Stipend Provided',
          skills: skillLabel,
          matchedSkills: [skillKey],
          description: intern.description,
          isApplied: appliedInternshipIds.includes(intern.id)
        });
      }
    }

    // Combine matching roles, prioritize unapplied roles first
    const combinedRecs = [...matchingJobs, ...matchingInternships].sort((a, b) => {
      if (a.isApplied !== b.isApplied) {
        return a.isApplied ? 1 : -1;
      }
      return 0;
    });

    if (combinedRecs.length > 0) {
      alertGroups.push({
        skillKey,
        skillLabel,
        proficiency,
        tier,
        reason,
        badgeText,
        recommendations: combinedRecs
      });
    }
  }

  // Count totals
  const allJobIds = new Set<number>();
  const allInternshipIds = new Set<number>();
  for (const g of alertGroups) {
    for (const r of g.recommendations) {
      if (r.type === 'job') allJobIds.add(r.id);
      else allInternshipIds.add(r.id);
    }
  }

  // Apply optional filter by skillKey
  const filteredGroups =
    selectedSkillFilter === 'ALL'
      ? alertGroups
      : alertGroups.filter((g) => g.skillKey === selectedSkillFilter.toLowerCase());

  return {
    totalAlertsCount: allJobIds.size + allInternshipIds.size,
    recommendedJobsCount: allJobIds.size,
    recommendedInternshipsCount: allInternshipIds.size,
    activeSkillsCount: alertGroups.length,
    alertGroups: filteredGroups
  };
}

/**
 * Merges imported LinkedIn account data (headline, professional summary,
 * work experience items, skills, and sync metadata) into the student's UserProfile.
 */
export function importLinkedInProfileData(
  currentProfile: UserProfile,
  linkedInData: {
    headline?: string;
    summary?: string;
    workHistory?: WorkExperienceItem[];
    skills?: string[];
    linkedInProfileUrl?: string;
    location?: string;
    education?: string;
    name?: string;
  }
): UserProfile {
  const mergedHeadline = linkedInData.headline?.trim() || currentProfile.headline;
  const mergedSummary = linkedInData.summary?.trim() || currentProfile.summary;
  const mergedLocation = linkedInData.location?.trim() || currentProfile.location;
  const mergedEducation = linkedInData.education?.trim() || currentProfile.education;
  const mergedUrl =
    linkedInData.linkedInProfileUrl?.trim() ||
    currentProfile.linkedInProfileUrl ||
    'https://linkedin.com/in/harish-ragavendran';

  // Merge technical skills (deduplicated and trimmed)
  const existingSkills = new Set(
    currentProfile.skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  if (Array.isArray(linkedInData.skills)) {
    for (const skill of linkedInData.skills) {
      const clean = skill.trim().toLowerCase();
      if (clean) existingSkills.add(clean);
    }
  }

  // Merge work history:
  // We keep existing manual entries and add imported LinkedIn entries without duplicating company + title
  const currentHistory = currentProfile.workHistory || [];
  const incomingHistory = linkedInData.workHistory || [];

  const normalizedIncoming: WorkExperienceItem[] = incomingHistory.map((item, idx) => ({
    id: item.id || `linkedin-exp-${Date.now()}-${idx}`,
    title: item.title.trim(),
    company: item.company.trim(),
    location: item.location?.trim() || 'Chennai, India',
    startDate: item.startDate.trim(),
    endDate: item.endDate?.trim() || (item.current ? 'Present' : ''),
    current: Boolean(item.current || item.endDate?.toLowerCase() === 'present'),
    description: item.description.trim(),
    skillsUsed: (item.skillsUsed || []).map((s) => s.trim().toLowerCase()).filter(Boolean),
    importedFrom: 'LinkedIn'
  }));

  const mergedHistory: WorkExperienceItem[] = [...currentHistory];
  for (const item of normalizedIncoming) {
    const key = `${item.company.toLowerCase()}:::${item.title.toLowerCase()}`;
    const existingIndex = mergedHistory.findIndex(
      (w) => `${w.company.toLowerCase()}:::${w.title.toLowerCase()}` === key
    );
    if (existingIndex >= 0) {
      mergedHistory[existingIndex] = {
        ...mergedHistory[existingIndex],
        ...item,
        importedFrom: 'LinkedIn'
      };
    } else {
      mergedHistory.push(item);
    }
  }

  return {
    ...currentProfile,
    headline: mergedHeadline,
    summary: mergedSummary,
    location: mergedLocation,
    education: mergedEducation,
    skills: Array.from(existingSkills),
    linkedInConnected: true,
    linkedInProfileUrl: mergedUrl,
    workHistory: mergedHistory,
    lastLinkedInSync: new Date().toISOString()
  };
}

/**
 * Disconnects the linked LinkedIn account from the profile.
 */
export function disconnectLinkedInProfile(
  currentProfile: UserProfile,
  retainWorkHistory = true
): UserProfile {
  return {
    ...currentProfile,
    linkedInConnected: false,
    lastLinkedInSync: undefined,
    workHistory: retainWorkHistory
      ? currentProfile.workHistory?.map((w) => ({
          ...w,
          importedFrom: undefined
        }))
      : currentProfile.workHistory?.filter((w) => w.importedFrom !== 'LinkedIn')
  };
}

/**
 * Formats duration for a work experience entry (e.g., "Jan 2024 – Present").
 */
export function formatWorkExperienceDuration(item: WorkExperienceItem): string {
  const start = item.startDate?.trim() || '';
  const end = item.current ? 'Present' : item.endDate?.trim() || 'Present';
  if (!start) return end;
  return `${start} – ${end}`;
}






