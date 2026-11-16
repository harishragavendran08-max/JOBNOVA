import type { JobItem } from '../data/seedData';
import type {
  ApplicationStage,
  ApplicationStageRecord,
  InterviewConfidenceRating,
  InterviewFeedbackNote
} from './jobnovaLogic';

export interface AggregatedInterviewFeedbackItem {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  location: string;
  ctc: string;
  skills: string[];
  currentStage: ApplicationStage;
  roundTitle: string;
  interviewerOrFormat: string;
  questionsAsked: string;
  keyTakeaways: string;
  confidenceRating: InterviewConfidenceRating;
  confidenceScore: number;
  timestamp: string;
  dateLabel: string;
  parsedDateMs: number;
  chronologicalIndex: number;
}

export interface ConfidenceTrendPoint {
  id: string;
  sessionNumber: number;
  jobId: number;
  company: string;
  jobTitle: string;
  roundTitle: string;
  dateLabel: string;
  parsedDateMs: number;
  confidenceRating: InterviewConfidenceRating;
  confidenceScore: number;
  movingAverageScore: number;
  keyTakeaways: string;
}

export interface TopicConfidenceStat {
  topic: string;
  sessionsCount: number;
  averageScore: number;
  strongCount: number;
}

export interface InterviewPrepAnalyticsSummary {
  totalSessions: number;
  averageConfidenceScore: number;
  latestConfidenceScore: number;
  confidenceMomentumDelta: number;
  trendDirection: 'upward' | 'steady' | 'needs-focus';
  strongRatePercent: number;
  ratingCounts: Record<InterviewConfidenceRating, number>;
  companiesCovered: string[];
  trendPoints: ConfidenceTrendPoint[];
  topTopics: TopicConfidenceStat[];
  filteredRecords: AggregatedInterviewFeedbackItem[];
}

export function confidenceRatingToScore(rating: InterviewConfidenceRating): number {
  switch (rating) {
    case 'Strong':
      return 90;
    case 'Moderate':
      return 68;
    case 'Needs Review':
      return 42;
  }
}

export function parseFeedbackTimestampMs(timestamp: string, fallbackOrder = 0): number {
  const cleaned = (timestamp || '')
    .replace(/^Just now\s*·\s*/i, '')
    .replace(/^Updated\s+/i, '')
    .trim();

  const parsed = Date.parse(cleaned);
  if (!Number.isNaN(parsed)) {
    return parsed + fallbackOrder * 1000;
  }

  // Fallback deterministic base date (Nov 1, 2026) + offset
  return Date.parse('2026-11-01T09:00:00Z') + fallbackOrder * 86400000;
}

export function formatShortDateLabel(timestamp: string, parsedDateMs: number): string {
  const cleaned = (timestamp || '').replace(/^Just now\s*·\s*/i, '').trim();
  if (/^[A-Z][a-z]{2}\s+\d{1,2}(,\s*\d{4})?$/i.test(cleaned)) {
    return cleaned.replace(/,\s*\d{4}$/, '');
  }
  const d = new Date(parsedDateMs);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return cleaned || 'Session';
}

const CANONICAL_TOPICS: { label: string; patterns: string[] }[] = [
  { label: 'Spring Boot', patterns: ['spring boot', 'springboot', '@transactional', 'aop', 'jpa', 'hibernate'] },
  { label: 'Java Core', patterns: ['java', 'jvm', 'stream', 'hashmap', 'concurrency'] },
  { label: 'MySQL & SQL', patterns: ['mysql', 'sql', 'innodb', 'index', 'join', 'database', 'postgres'] },
  { label: 'System Design', patterns: ['system design', 'caching', 'microservices', 'scalability', 'kafka', 'distributed'] },
  { label: 'REST APIs', patterns: ['rest', 'api', 'pagination', 'http', 'controller'] },
  { label: 'React & Frontend', patterns: ['react', 'javascript', 'typescript', 'html', 'css', 'dom'] },
  { label: 'DSA & Coding', patterns: ['dsa', 'algorithm', 'coding', 'array', 'tree', 'graph', 'dynamic programming'] }
];

export function extractTopicsFromFeedback(
  note: InterviewFeedbackNote,
  jobSkills: string[]
): string[] {
  const combined = `${note.roundTitle} ${note.questionsAsked} ${note.keyTakeaways} ${jobSkills.join(' ')}`.toLowerCase();
  const matched: string[] = [];

  for (const item of CANONICAL_TOPICS) {
    if (item.patterns.some((p) => combined.includes(p))) {
      matched.push(item.label);
    }
  }

  if (matched.length === 0 && jobSkills.length > 0) {
    matched.push(jobSkills[0].toUpperCase());
  }
  return matched;
}

export function aggregateInterviewFeedbackRecords(params: {
  stageRecords: Record<number, ApplicationStageRecord>;
  jobs: JobItem[];
  confidenceFilter?: InterviewConfidenceRating | 'ALL';
  companyFilter?: string;
  searchQuery?: string;
}): InterviewPrepAnalyticsSummary {
  const {
    stageRecords,
    jobs,
    confidenceFilter = 'ALL',
    companyFilter = 'ALL',
    searchQuery = ''
  } = params;

  const rawItems: Omit<AggregatedInterviewFeedbackItem, 'chronologicalIndex'>[] = [];
  let seq = 0;

  const sortedJobIds = Object.keys(stageRecords)
    .map((k) => Number(k))
    .sort((a, b) => a - b);

  for (const jobId of sortedJobIds) {
    const record = stageRecords[jobId];
    if (!record || !Array.isArray(record.interviewFeedbackNotes)) continue;

    const job = jobs.find((j) => j.id === jobId);
    const jobTitle = job?.title || `Engineering Role #${jobId}`;
    const company = job?.company || 'Tech Partner';
    const location = job?.location || 'India';
    const ctc = job?.ctc || 'Competitive';
    const skills = (job?.skills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Notes inside record.interviewFeedbackNotes are stored newest-first; iterate oldest-first for stable fallback order
    const notesOldestFirst = [...record.interviewFeedbackNotes].reverse();
    for (const note of notesOldestFirst) {
      seq += 1;
      const parsedDateMs = parseFeedbackTimestampMs(note.timestamp, seq);
      const confidenceScore = confidenceRatingToScore(note.confidenceRating);
      rawItems.push({
        id: note.id,
        jobId,
        jobTitle,
        company,
        location,
        ctc,
        skills,
        currentStage: record.currentStage,
        roundTitle: note.roundTitle,
        interviewerOrFormat: note.interviewerOrFormat,
        questionsAsked: note.questionsAsked,
        keyTakeaways: note.keyTakeaways,
        confidenceRating: note.confidenceRating,
        confidenceScore,
        timestamp: note.timestamp,
        dateLabel: formatShortDateLabel(note.timestamp, parsedDateMs),
        parsedDateMs
      });
    }
  }

  // Sort chronologically (oldest -> newest)
  const chronological = [...rawItems]
    .sort((a, b) => a.parsedDateMs - b.parsedDateMs)
    .map((item, idx) => ({
      ...item,
      chronologicalIndex: idx + 1
    }));

  const ratingCounts: Record<InterviewConfidenceRating, number> = {
    Strong: 0,
    Moderate: 0,
    'Needs Review': 0
  };

  const topicMap = new Map<string, { totalScore: number; count: number; strongCount: number }>();

  const trendPoints: ConfidenceTrendPoint[] = [];
  let runningSum = 0;

  for (let i = 0; i < chronological.length; i++) {
    const item = chronological[i];
    ratingCounts[item.confidenceRating] = (ratingCounts[item.confidenceRating] || 0) + 1;
    runningSum += item.confidenceScore;

    // 3-session trailing moving average
    const windowSlice = chronological.slice(Math.max(0, i - 2), i + 1);
    const windowAvg = Math.round(
      windowSlice.reduce((sum, x) => sum + x.confidenceScore, 0) / windowSlice.length
    );

    trendPoints.push({
      id: item.id,
      sessionNumber: i + 1,
      jobId: item.jobId,
      company: item.company,
      jobTitle: item.jobTitle,
      roundTitle: item.roundTitle,
      dateLabel: item.dateLabel,
      parsedDateMs: item.parsedDateMs,
      confidenceRating: item.confidenceRating,
      confidenceScore: item.confidenceScore,
      movingAverageScore: windowAvg,
      keyTakeaways: item.keyTakeaways
    });

    const topics = extractTopicsFromFeedback(item, item.skills);
    for (const topic of topics) {
      const current = topicMap.get(topic) || { totalScore: 0, count: 0, strongCount: 0 };
      current.totalScore += item.confidenceScore;
      current.count += 1;
      if (item.confidenceRating === 'Strong') current.strongCount += 1;
      topicMap.set(topic, current);
    }
  }

  const totalSessions = chronological.length;
  const averageConfidenceScore =
    totalSessions > 0 ? Math.round(runningSum / totalSessions) : 0;
  const latestConfidenceScore =
    totalSessions > 0 ? chronological[totalSessions - 1].confidenceScore : 0;
  const firstConfidenceScore =
    totalSessions > 0 ? chronological[0].confidenceScore : 0;
  const confidenceMomentumDelta =
    totalSessions > 1 ? latestConfidenceScore - firstConfidenceScore : 0;

  let trendDirection: InterviewPrepAnalyticsSummary['trendDirection'] = 'steady';
  if (confidenceMomentumDelta >= 8) {
    trendDirection = 'upward';
  } else if (confidenceMomentumDelta <= -8 || (totalSessions > 0 && latestConfidenceScore < 60)) {
    trendDirection = 'needs-focus';
  }

  const strongRatePercent =
    totalSessions > 0 ? Math.round((ratingCounts.Strong / totalSessions) * 100) : 0;

  const companiesCovered = Array.from(new Set(chronological.map((c) => c.company)));

  const topTopics: TopicConfidenceStat[] = Array.from(topicMap.entries())
    .map(([topic, stat]) => ({
      topic,
      sessionsCount: stat.count,
      averageScore: Math.round(stat.totalScore / stat.count),
      strongCount: stat.strongCount
    }))
    .sort((a, b) => b.sessionsCount - a.sessionsCount || b.averageScore - a.averageScore)
    .slice(0, 6);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecords = [...chronological]
    .reverse()
    .filter((item) => {
      if (confidenceFilter !== 'ALL' && item.confidenceRating !== confidenceFilter) {
        return false;
      }
      if (companyFilter !== 'ALL' && item.company.toLowerCase() !== companyFilter.toLowerCase()) {
        return false;
      }
      if (!normalizedQuery) return true;
      const haystack = `${item.roundTitle} ${item.company} ${item.jobTitle} ${item.questionsAsked} ${item.keyTakeaways} ${item.interviewerOrFormat}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

  return {
    totalSessions,
    averageConfidenceScore,
    latestConfidenceScore,
    confidenceMomentumDelta,
    trendDirection,
    strongRatePercent,
    ratingCounts,
    companiesCovered,
    trendPoints,
    topTopics,
    filteredRecords
  };
}
