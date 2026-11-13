import type { JobItem } from '../data/seedData';

export interface UserAlertRecord {
  id: string;
  userEmail: string;
  sourceJobId: number;
  sourceJobTitle: string;
  sourceCompany: string;
  skills: string[];
  location: string;
  pushEnabled: boolean;
  browserPermission: string;
  createdAt: string;
  lastTriggeredAt?: string;
  matchedNewJobIds: number[];
}

export interface AlertMatchResult {
  alert: UserAlertRecord;
  sharedSkills: string[];
}

export function parseJobSkills(skillsRaw: string): string[] {
  if (!skillsRaw) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of skillsRaw.split(',')) {
    const clean = part.trim().toLowerCase();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }
  return result;
}

export function createUserAlertFromJob(params: {
  job: JobItem;
  userEmail?: string;
  pushEnabled?: boolean;
  browserPermission?: string;
  id?: string;
  createdAt?: string;
}): UserAlertRecord {
  const skills = parseJobSkills(params.job.skills);
  const nowIso = params.createdAt || new Date().toISOString();
  return {
    id:
      params.id ||
      `alert-${params.job.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    userEmail: (params.userEmail || 'guest@jobnova.in').trim().toLowerCase(),
    sourceJobId: params.job.id,
    sourceJobTitle: params.job.title,
    sourceCompany: params.job.company,
    skills,
    location: params.job.location || 'All Locations',
    pushEnabled: params.pushEnabled ?? true,
    browserPermission: params.browserPermission || 'default',
    createdAt: nowIso,
    matchedNewJobIds: []
  };
}

export function findAlertForJob(
  alerts: UserAlertRecord[],
  job: Pick<JobItem, 'id' | 'skills'>
): UserAlertRecord | undefined {
  const exactById = alerts.find((a) => a.sourceJobId === job.id);
  if (exactById) return exactById;

  const jobSkills = parseJobSkills(job.skills).sort().join(',');
  if (!jobSkills) return undefined;
  return alerts.find((a) => [...a.skills].sort().join(',') === jobSkills);
}

export function getSharedSkills(alertSkills: string[], jobSkillsRaw: string): string[] {
  const normalizedJobSkills = parseJobSkills(jobSkillsRaw);
  const jobSet = new Set(normalizedJobSkills);
  return alertSkills.filter((skill) => jobSet.has(skill.toLowerCase()));
}

/**
 * Matches newly added jobs against UserAlerts based on shared skill requirements.
 * Requires at least 2 overlapping skills (or 1 if either the alert or new job lists only 1 skill).
 */
export function findMatchingAlertsForNewJob(
  alerts: UserAlertRecord[],
  newJob: JobItem
): AlertMatchResult[] {
  const newJobSkills = parseJobSkills(newJob.skills);
  if (newJobSkills.length === 0) return [];

  const matches: AlertMatchResult[] = [];
  for (const alert of alerts) {
    if (!alert.pushEnabled) continue;
    if (alert.sourceJobId === newJob.id) continue;

    const sharedSkills = getSharedSkills(alert.skills, newJob.skills);
    const threshold = Math.min(2, alert.skills.length, newJobSkills.length);
    if (threshold > 0 && sharedSkills.length >= threshold) {
      matches.push({ alert, sharedSkills });
    }
  }
  return matches;
}

export function recordAlertJobMatches(
  alerts: UserAlertRecord[],
  matches: AlertMatchResult[],
  newJobId: number,
  triggeredAt = new Date().toISOString()
): UserAlertRecord[] {
  if (matches.length === 0) return alerts;
  const matchedIds = new Set(matches.map((m) => m.alert.id));
  return alerts.map((alert) => {
    if (!matchedIds.has(alert.id)) return alert;
    const nextJobs = alert.matchedNewJobIds.includes(newJobId)
      ? alert.matchedNewJobIds
      : [...alert.matchedNewJobIds, newJobId];
    return {
      ...alert,
      lastTriggeredAt: triggeredAt,
      matchedNewJobIds: nextJobs
    };
  });
}

export function buildSimilarJobTemplate(sourceJob: JobItem): {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string;
  type: string;
  ctc: string;
} {
  const skillsList = parseJobSkills(sourceJob.skills);
  const primarySkill = skillsList[0] ? skillsList[0].toUpperCase() : 'Engineering';
  const baseTitle = sourceJob.title.replace(/\s*\([^)]*Team\)\s*$/i, '').trim() || sourceJob.title;
  return {
    title: `${baseTitle} (${primarySkill} Team)`,
    company: sourceJob.company === 'TCS' ? 'Zoho' : 'Razorpay',
    location: sourceJob.location,
    description: `Newly opened ${baseTitle} position requiring ${skillsList.join(', ')} with production architecture ownership.`,
    skills: sourceJob.skills,
    type: sourceJob.type || 'Full-Time',
    ctc: sourceJob.ctc || '14.5 LPA'
  };
}

export function dispatchBrowserPushNotification(params: {
  title: string;
  body: string;
  tag?: string;
  enabled?: boolean;
}): { sent: boolean; permission: string } {
  if (params.enabled === false) {
    return { sent: false, permission: 'disabled' };
  }
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { sent: false, permission: 'unsupported' };
  }
  const permission = Notification.permission;
  if (permission !== 'granted') {
    return { sent: false, permission };
  }
  try {
    new Notification(params.title, {
      body: params.body,
      tag: params.tag
    });
    return { sent: true, permission };
  } catch {
    return { sent: false, permission };
  }
}
