import { JobItem } from '../data/seedData';
import { parseJobCtcLpa } from './jobnovaLogic';

export interface JobMatchBreakdown {
  matchedSkills: string[];
  missingSkills: string[];
  matchPercent: number;
  salaryRelation: 'above' | 'within' | 'below' | 'unknown';
  salaryLpa: number | null;
}

export function computeJobMatchBreakdown(params: {
  job: JobItem;
  userSkills: string[];
  expectedMinLpa: number;
  expectedMaxLpa: number;
}): JobMatchBreakdown {
  const { job, userSkills, expectedMinLpa, expectedMaxLpa } = params;

  const normalizedUserSkills = new Set(
    userSkills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  );

  const jobTokens = job.skills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const token of jobTokens) {
    if (normalizedUserSkills.has(token)) {
      matchedSkills.push(token);
    } else {
      missingSkills.push(token);
    }
  }

  const matchPercent =
    jobTokens.length === 0
      ? 0
      : Math.round((matchedSkills.length / jobTokens.length) * 100);

  const parsedLpa = job.ctc ? parseJobCtcLpa(job.ctc) : 0;
  const salaryLpa = parsedLpa > 0 ? parsedLpa : null;

  let salaryRelation: JobMatchBreakdown['salaryRelation'] = 'unknown';
  if (salaryLpa !== null) {
    if (salaryLpa > expectedMaxLpa) salaryRelation = 'above';
    else if (salaryLpa >= expectedMinLpa) salaryRelation = 'within';
    else salaryRelation = 'below';
  }

  return {
    matchedSkills,
    missingSkills,
    matchPercent,
    salaryRelation,
    salaryLpa
  };
}
