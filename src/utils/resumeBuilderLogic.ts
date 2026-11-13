import {
  CertificationItem,
  CourseItem,
  InternshipItem,
  JobItem,
  UserProfile,
  WorkExperienceItem
} from '../data/seedData';
import { computeSkillRadarData, ResumeDocumentData } from './jobnovaLogic';

export type ResumeTemplateId = 'classic' | 'modern' | 'compact';

export interface ResumeSectionVisibility {
  showSummary: boolean;
  showEducation: boolean;
  showExperience: boolean;
  showSkills: boolean;
  showSkillProficiencyBars: boolean;
  showCertifications: boolean;
  showCourses: boolean;
  showTargetRoles: boolean;
  showLinkedInUrl: boolean;
}

export const DEFAULT_RESUME_VISIBILITY: ResumeSectionVisibility = {
  showSummary: true,
  showEducation: true,
  showExperience: true,
  showSkills: true,
  showSkillProficiencyBars: false,
  showCertifications: true,
  showCourses: true,
  showTargetRoles: false,
  showLinkedInUrl: true
};

export interface ResumeEducationEntry {
  id: string;
  degree: string;
  institution: string;
  period: string;
  highlights: string;
}

export interface ResumeSkillItem {
  key: string;
  name: string;
  proficiency: number;
}

export interface StructuredResumeDraft {
  fileName: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedInProfileUrl: string;
  githubOrPortfolioUrl: string;
  oauthProvider: string;
  summary: string;
  educationEntries: ResumeEducationEntry[];
  experiences: WorkExperienceItem[];
  skills: ResumeSkillItem[];
  trackedCertifications: {
    id: number;
    name: string;
    issuer: string;
    credentialUrl: string;
  }[];
  enrolledCourses: {
    id: number;
    title: string;
    provider: string;
    level: string;
  }[];
  targetRoles: {
    id: number;
    title: string;
    company: string;
    location: string;
    ctc?: string;
  }[];
  generatedDate: string;
}

export interface ResumeAtsMatchResult {
  targetJobTitle: string;
  targetCompany: string;
  scorePct: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedCount: number;
  totalRequired: number;
}

const DISPLAY_SKILL_NAMES: Record<string, string> = {
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
  devops: 'DevOps',
  typescript: 'TypeScript',
  'rest-api': 'REST APIs',
  kafka: 'Apache Kafka',
  genai: 'GenAI',
  llm: 'LLMs',
  langchain: 'LangChain',
  rag: 'RAG',
  fastapi: 'FastAPI',
  vectordb: 'Vector DB',
  openai: 'OpenAI API',
  pytorch: 'PyTorch',
  huggingface: 'Hugging Face',
  mlflow: 'MLflow',
  airflow: 'Apache Airflow',
  golang: 'Go (Golang)',
  grpc: 'gRPC',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
  rust: 'Rust',
  tokio: 'Tokio',
  django: 'Django',
  terraform: 'Terraform',
  prometheus: 'Prometheus',
  grafana: 'Grafana',
  azure: 'Microsoft Azure',
  gcp: 'Google Cloud (GCP)',
  microservices: 'Microservices',
  spark: 'Apache Spark',
  dbt: 'dbt',
  snowflake: 'Snowflake',
  playwright: 'Playwright',
  selenium: 'Selenium',
  restassured: 'REST Assured',
  cicd: 'CI/CD',
  testing: 'QA Automation',
  cybersecurity: 'Cybersecurity',
  iam: 'Cloud IAM',
  siem: 'SIEM',
  'react-native': 'React Native',
  nodejs: 'Node.js',
  nextjs: 'Next.js'
};

export function formatResumeSkillLabel(rawKey: string): string {
  const clean = rawKey.trim().toLowerCase();
  return DISPLAY_SKILL_NAMES[clean] || rawKey.trim();
}

export function buildResumeFileSlug(fullName: string): string {
  const slug = fullName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return `${slug || 'JobNova_Student'}_Resume.pdf`;
}

/**
 * Parses a single-line education string from UserProfile into structured degree, institution, period, and highlights.
 */
export function parseEducationString(rawEducation?: string): ResumeEducationEntry[] {
  const text = (rawEducation || '').trim();
  if (!text) {
    return [
      {
        id: 'edu-1',
        degree: 'B.E. in Computer Science & Engineering',
        institution: 'Anna University, Chennai',
        period: '2023–2027',
        highlights: ''
      }
    ];
  }

  const parts = text.split('·').map((p) => p.trim()).filter(Boolean);
  const degree = parts[0] || text;
  const secondPart = parts[1] || '';

  let institution = secondPart;
  let period = '';

  const periodMatch = secondPart.match(/\(([^)]+)\)\s*$/);
  if (periodMatch) {
    period = periodMatch[1].trim();
    institution = secondPart.slice(0, periodMatch.index).trim();
  }

  const highlights = parts.slice(2).join(' · ');

  return [
    {
      id: 'edu-1',
      degree,
      institution: institution || 'University / Institute',
      period,
      highlights
    }
  ];
}

/**
 * Formats structured education back to the compact profile education string.
 */
export function serializePrimaryEducation(entry?: ResumeEducationEntry): string {
  if (!entry) return '';
  const base = [
    entry.degree.trim(),
    [entry.institution.trim(), entry.period.trim() ? `(${entry.period.trim()})` : '']
      .filter(Boolean)
      .join(' ')
  ]
    .filter(Boolean)
    .join(' · ');
  if (entry.highlights.trim()) {
    return `${base} · ${entry.highlights.trim()}`;
  }
  return base;
}

/**
 * Pulls live data from UserProfile and connected career pipeline records
 * to assemble a complete, structured resume draft.
 */
export function buildResumeDraftFromProfile(params: {
  user: UserProfile | null;
  certifications: CertificationItem[];
  savedCertIds: number[];
  courses: CourseItem[];
  enrolledCourseIds: number[];
  jobs: JobItem[];
  appliedJobIds: number[];
  internships?: InternshipItem[];
  appliedInternshipIds?: number[];
}): StructuredResumeDraft {
  const {
    user,
    certifications,
    savedCertIds,
    courses,
    enrolledCourseIds,
    jobs,
    appliedJobIds
  } = params;

  const fullName = user?.name?.trim() || 'Student Explorer';
  const appliedJobs = jobs.filter((j) => appliedJobIds.includes(j.id));
  const rawSkills = user?.skills || [];
  const overrides = user?.skillProficiencies || {};

  const radarPoints = computeSkillRadarData({
    userSkills: rawSkills,
    savedJobs: appliedJobs.length > 0 ? appliedJobs : jobs.slice(0, 2),
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides: overrides
  });

  const skills: ResumeSkillItem[] = rawSkills
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((key) => {
      const manual = overrides[key];
      const matched = radarPoints.find((p) => p.key === key);
      return {
        key,
        name: formatResumeSkillLabel(key),
        proficiency:
          typeof manual === 'number'
            ? manual
            : matched
              ? matched.studentProficiency
              : 75
      };
    });

  const trackedCertifications = certifications
    .filter((cert) => savedCertIds.includes(cert.id))
    .map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      credentialUrl: cert.credentialUrl
    }));

  const enrolledCourses = courses
    .filter((course) => enrolledCourseIds.includes(course.id))
    .map((course) => ({
      id: course.id,
      title: course.title,
      provider: course.provider,
      level: course.level || 'Self-Paced'
    }));

  const targetRoles = appliedJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    ctc: job.ctc
  }));

  const githubSlug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    fileName: buildResumeFileSlug(fullName),
    fullName,
    headline:
      user?.headline?.trim() ||
      'Full-Stack Developer — Java, Spring Boot, React.js & MySQL',
    email: user?.email?.trim() || 'student@jobnova.edu',
    phone: '',
    location: user?.location?.trim() || 'Chennai, India',
    linkedInProfileUrl:
      user?.linkedInProfileUrl?.trim() ||
      `https://linkedin.com/in/${githubSlug || 'student-explorer'}`,
    githubOrPortfolioUrl: `https://github.com/${githubSlug || 'student-dev'}`,
    oauthProvider: user?.provider || 'Google',
    summary:
      user?.summary?.trim() ||
      'Computer Science undergraduate building full-stack applications with Java, Spring Boot, React.js, and MySQL.',
    educationEntries: parseEducationString(user?.education),
    experiences: user?.workHistory ? [...user.workHistory] : [],
    skills,
    trackedCertifications,
    enrolledCourses,
    targetRoles,
    generatedDate: 'November 2026'
  };
}

/**
 * Evaluates ATS keyword match between the current resume draft and a target job listing.
 */
export function evaluateResumeAtsMatch(params: {
  draft: StructuredResumeDraft;
  targetJob: JobItem | null;
}): ResumeAtsMatchResult | null {
  const { draft, targetJob } = params;
  if (!targetJob) return null;

  const requiredSkills = targetJob.skills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (requiredSkills.length === 0) {
    return {
      targetJobTitle: targetJob.title,
      targetCompany: targetJob.company,
      scorePct: 100,
      matchedSkills: [],
      missingSkills: [],
      matchedCount: 0,
      totalRequired: 0
    };
  }

  const draftSkillKeys = new Set(draft.skills.map((s) => s.key.toLowerCase()));
  const searchableCorpus = [
    draft.headline,
    draft.summary,
    ...draft.experiences.map((e) => `${e.title} ${e.description} ${(e.skillsUsed || []).join(' ')}`),
    ...draft.trackedCertifications.map((c) => c.name),
    ...draft.enrolledCourses.map((c) => c.title)
  ]
    .join(' ')
    .toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of requiredSkills) {
    const label = formatResumeSkillLabel(req).toLowerCase();
    const hasSkill =
      draftSkillKeys.has(req) ||
      searchableCorpus.includes(req) ||
      searchableCorpus.includes(label);
    if (hasSkill) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const scorePct = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    targetJobTitle: targetJob.title,
    targetCompany: targetJob.company,
    scorePct,
    matchedSkills,
    missingSkills,
    matchedCount: matchedSkills.length,
    totalRequired: requiredSkills.length
  };
}

/**
 * Converts a StructuredResumeDraft + visibility toggles into an enriched ResumeDocumentData
 * consumed by the PDF generator.
 */
export function convertDraftToPdfDocument(params: {
  draft: StructuredResumeDraft;
  visibility: ResumeSectionVisibility;
  template: ResumeTemplateId;
}): ResumeDocumentData & {
  template: ResumeTemplateId;
  phone?: string;
  linkedInProfileUrl?: string;
  githubOrPortfolioUrl?: string;
  educationEntries: ResumeEducationEntry[];
  experiences: WorkExperienceItem[];
  visibility: ResumeSectionVisibility;
} {
  const { draft, visibility, template } = params;

  return {
    fileName: buildResumeFileSlug(draft.fullName),
    fullName: draft.fullName.trim() || 'Student Explorer',
    headline: draft.headline.trim(),
    email: draft.email.trim(),
    location: draft.location.trim(),
    oauthProvider: draft.oauthProvider,
    summary: visibility.showSummary ? draft.summary.trim() : '',
    skills: visibility.showSkills
      ? draft.skills.map((s) => ({ name: s.name, proficiency: s.proficiency }))
      : [],
    trackedCertifications: visibility.showCertifications
      ? draft.trackedCertifications.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          credentialUrl: c.credentialUrl
        }))
      : [],
    enrolledCourses: visibility.showCourses
      ? draft.enrolledCourses.map((c) => ({
          title: c.title,
          provider: c.provider,
          level: c.level
        }))
      : [],
    targetRoles: visibility.showTargetRoles
      ? draft.targetRoles.map((r) => ({
          title: r.title,
          company: r.company,
          location: r.location
        }))
      : [],
    generatedDate: draft.generatedDate,
    template,
    phone: draft.phone.trim() || undefined,
    linkedInProfileUrl: visibility.showLinkedInUrl
      ? draft.linkedInProfileUrl.trim() || undefined
      : undefined,
    githubOrPortfolioUrl: draft.githubOrPortfolioUrl.trim() || undefined,
    educationEntries: visibility.showEducation ? draft.educationEntries : [],
    experiences: visibility.showExperience ? draft.experiences : [],
    visibility
  };
}
