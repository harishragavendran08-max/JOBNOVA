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

export type JobSortOption = 'featured' | 'match-desc' | 'ctc-desc' | 'ctc-asc';

export function sortJobsList(
  jobs: JobItem[],
  params: {
    sortBy: JobSortOption;
    userSkills: string[];
    expectedMinLpa: number;
    expectedMaxLpa: number;
  }
): JobItem[] {
  const { sortBy, userSkills, expectedMinLpa, expectedMaxLpa } = params;
  if (sortBy === 'featured' || jobs.length <= 1) {
    return [...jobs];
  }

  const metrics = new Map<number, { matchPercent: number; salaryLpa: number }>();
  for (const job of jobs) {
    const breakdown = computeJobMatchBreakdown({
      job,
      userSkills,
      expectedMinLpa,
      expectedMaxLpa
    });
    metrics.set(job.id, {
      matchPercent: breakdown.matchPercent,
      salaryLpa: breakdown.salaryLpa ?? 0
    });
  }

  return [...jobs].sort((a, b) => {
    const ma = metrics.get(a.id)!;
    const mb = metrics.get(b.id)!;

    if (sortBy === 'match-desc') {
      if (mb.matchPercent !== ma.matchPercent) return mb.matchPercent - ma.matchPercent;
      if (mb.salaryLpa !== ma.salaryLpa) return mb.salaryLpa - ma.salaryLpa;
      return a.id - b.id;
    }

    if (sortBy === 'ctc-desc') {
      if (mb.salaryLpa !== ma.salaryLpa) return mb.salaryLpa - ma.salaryLpa;
      if (mb.matchPercent !== ma.matchPercent) return mb.matchPercent - ma.matchPercent;
      return a.id - b.id;
    }

    // ctc-asc
    if (ma.salaryLpa !== mb.salaryLpa) return ma.salaryLpa - mb.salaryLpa;
    if (mb.matchPercent !== ma.matchPercent) return mb.matchPercent - ma.matchPercent;
    return a.id - b.id;
  });
}

export interface CopyLinkFeedbackMeta {
  isCopied: boolean;
  label: 'Link Copied' | 'Copy Link';
  statusTag: 'Copied' | null;
  ariaLabel: string;
}

export function getCopyLinkFeedbackMeta(params: {
  copiedJobLinkId: number | null;
  jobId: number;
  jobTitle?: string;
}): CopyLinkFeedbackMeta {
  const isCopied = params.copiedJobLinkId !== null && params.copiedJobLinkId === params.jobId;
  const roleSuffix = params.jobTitle?.trim() ? ` for ${params.jobTitle.trim()}` : '';

  if (isCopied) {
    return {
      isCopied: true,
      label: 'Link Copied',
      statusTag: 'Copied',
      ariaLabel: `Job link${roleSuffix} copied to clipboard`
    };
  }

  return {
    isCopied: false,
    label: 'Copy Link',
    statusTag: null,
    ariaLabel: `Copy job link${roleSuffix} to clipboard`
  };
}
