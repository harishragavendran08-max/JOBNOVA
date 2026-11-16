import type { JobItem } from '../data/seedData';
import {
  deriveStudentProficiencyTier,
  type ProficiencyTier
} from './jobnovaLogic';
import { parseJobSkills } from './userAlertsLogic';

export interface TopRoleRadarAxis {
  key: string;
  label: string;
  userProficiency: number;
  requiredLevel: number;
  gap: number;
  isRequiredByJob: boolean;
  isUserSkill: boolean;
  tier: ProficiencyTier;
  status: 'Exceeds' | 'Target Met' | 'Needs Focus' | 'Supporting';
}

export interface TopRoleRadarComparison {
  job: JobItem;
  axes: TopRoleRadarAxis[];
  overallReadinessPct: number;
  matchedRequiredCount: number;
  totalRequiredCount: number;
  strongestSkill: TopRoleRadarAxis | null;
  topFocusSkill: TopRoleRadarAxis | null;
}

const RADAR_SKILL_LABELS: Record<string, string> = {
  java: 'Java',
  springboot: 'Spring Boot',
  spring: 'Spring',
  hibernate: 'Hibernate',
  mysql: 'MySQL',
  sql: 'SQL',
  react: 'React.js',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  html: 'HTML5',
  css: 'CSS3',
  python: 'Python',
  aws: 'AWS',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  git: 'Git',
  nodejs: 'Node.js',
  nextjs: 'Next.js',
  genai: 'GenAI',
  llm: 'LLMs',
  langchain: 'LangChain',
  rag: 'RAG',
  fastapi: 'FastAPI',
  golang: 'Golang',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
  rust: 'Rust',
  terraform: 'Terraform',
  spark: 'Spark',
  snowflake: 'Snowflake',
  playwright: 'Playwright',
  cybersecurity: 'Security',
  pandas: 'Pandas',
  swift: 'Swift',
  swiftui: 'SwiftUI',
  ios: 'iOS',
  graphql: 'GraphQL',
  microservices: 'Microservices'
};

const RADAR_BASE_STUDENT_SCORE: Record<string, number> = {
  java: 82,
  springboot: 76,
  mysql: 80,
  sql: 78,
  react: 74,
  javascript: 78,
  js: 78,
  html: 88,
  css: 84,
  typescript: 70,
  python: 72,
  aws: 60,
  hibernate: 64,
  docker: 55,
  kubernetes: 48,
  linux: 70,
  devops: 56,
  genai: 60,
  llm: 58,
  langchain: 52,
  rag: 54,
  fastapi: 62,
  golang: 50,
  postgresql: 66,
  redis: 58,
  rust: 42,
  terraform: 50,
  spark: 48,
  snowflake: 46,
  playwright: 60,
  cybersecurity: 54,
  nodejs: 68,
  nextjs: 64,
  pandas: 65,
  swift: 58,
  swiftui: 56,
  ios: 58,
  git: 82,
  microservices: 68,
  graphql: 62
};

const RADAR_REQUIRED_TARGET: Record<string, number> = {
  java: 85,
  springboot: 86,
  mysql: 82,
  sql: 82,
  react: 82,
  javascript: 80,
  js: 80,
  html: 76,
  css: 76,
  typescript: 82,
  python: 84,
  aws: 84,
  hibernate: 78,
  docker: 82,
  kubernetes: 80,
  linux: 78,
  devops: 82,
  genai: 84,
  llm: 84,
  langchain: 80,
  rag: 82,
  fastapi: 80,
  golang: 84,
  postgresql: 82,
  redis: 78,
  rust: 86,
  terraform: 82,
  spark: 84,
  snowflake: 80,
  playwright: 80,
  cybersecurity: 85,
  nodejs: 80,
  nextjs: 80,
  pandas: 80,
  swift: 84,
  swiftui: 82,
  ios: 84,
  git: 78,
  microservices: 84,
  graphql: 78
};

export function formatRadarSkillLabel(key: string): string {
  const normalized = key.trim().toLowerCase();
  if (RADAR_SKILL_LABELS[normalized]) {
    return RADAR_SKILL_LABELS[normalized];
  }
  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : '';
}

/**
 * Computes D3 radar chart axes comparing the user's current skill proficiency
 * against the required skills for a selected top-matched job.
 * Guarantees at least 5 axes (when supporting skills exist) for clean radar polygon geometry,
 * while computing readiness & matched counts strictly across the job's required skills.
 */
export function computeTopRoleRadarComparison(params: {
  job: JobItem;
  userSkills: string[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  customProficiencyOverrides?: Record<string, number>;
}): TopRoleRadarComparison {
  const {
    job,
    userSkills,
    enrolledCourseIds = [],
    savedCertIds = [],
    customProficiencyOverrides = {}
  } = params;

  const requiredKeys = parseJobSkills(job.skills);
  const normalizedUserSet = new Set(
    userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
  const normalizedUserList = Array.from(normalizedUserSet);

  // Build up to 6 axes: all required job skills first, then top complementary user skills up to 5 axes
  const axisKeys: string[] = [...requiredKeys];
  for (const userSkill of normalizedUserList) {
    if (axisKeys.length >= 5 && axisKeys.length >= requiredKeys.length) break;
    if (!axisKeys.includes(userSkill)) {
      axisKeys.push(userSkill);
    }
  }

  // Fallback supporting stack skills if profile + job combined still have < 5 axes
  const fallbackPool = ['java', 'springboot', 'react', 'javascript', 'mysql'];
  for (const fb of fallbackPool) {
    if (axisKeys.length >= 5) break;
    if (!axisKeys.includes(fb)) {
      axisKeys.push(fb);
    }
  }

  const finalAxisKeys = axisKeys.slice(0, 7);
  const courseBonus = Math.min(8, enrolledCourseIds.length * 2);
  const certBonus = Math.min(6, savedCertIds.length * 2);

  const axes: TopRoleRadarAxis[] = finalAxisKeys.map((key) => {
    const isRequiredByJob = requiredKeys.includes(key);
    const isUserSkill = normalizedUserSet.has(key);
    const manualOverride = customProficiencyOverrides[key];

    const baseScore = isUserSkill
      ? RADAR_BASE_STUDENT_SCORE[key] ?? 74
      : Math.max(28, (RADAR_BASE_STUDENT_SCORE[key] ?? 58) - 26);

    const userProficiency =
      typeof manualOverride === 'number' && Number.isFinite(manualOverride)
        ? Math.min(100, Math.max(0, Math.round(manualOverride)))
        : Math.min(98, baseScore + (isUserSkill ? courseBonus + certBonus : 0));

    const requiredLevel = isRequiredByJob
      ? RADAR_REQUIRED_TARGET[key] ?? 82
      : 48;

    const gap = userProficiency - requiredLevel;
    let status: TopRoleRadarAxis['status'] = 'Supporting';
    if (isRequiredByJob) {
      if (gap >= 5) status = 'Exceeds';
      else if (gap >= 0) status = 'Target Met';
      else status = 'Needs Focus';
    }

    return {
      key,
      label: formatRadarSkillLabel(key),
      userProficiency,
      requiredLevel,
      gap,
      isRequiredByJob,
      isUserSkill,
      tier: deriveStudentProficiencyTier(userProficiency),
      status
    };
  });

  const requiredAxes = axes.filter((a) => a.isRequiredByJob);
  const matchedRequiredCount = requiredAxes.filter((a) => a.isUserSkill).length;
  const totalRequiredCount = requiredAxes.length;

  const overallReadinessPct =
    requiredAxes.length === 0
      ? 0
      : Math.round(
          (requiredAxes.reduce(
            (sum, ax) =>
              sum + Math.min(1, ax.userProficiency / Math.max(1, ax.requiredLevel)),
            0
          ) /
            requiredAxes.length) *
            100
        );

  const strongestSkill =
    requiredAxes.length > 0
      ? [...requiredAxes].sort((a, b) => b.gap - a.gap || b.userProficiency - a.userProficiency)[0]
      : null;

  const gapAxes = requiredAxes.filter((a) => a.gap < 0).sort((a, b) => a.gap - b.gap);
  const topFocusSkill = gapAxes[0] || null;

  return {
    job,
    axes,
    overallReadinessPct,
    matchedRequiredCount,
    totalRequiredCount,
    strongestSkill,
    topFocusSkill
  };
}
