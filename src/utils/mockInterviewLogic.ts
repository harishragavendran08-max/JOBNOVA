/**
 * Mock Interview Session Logic: Session State, Response Persistence,
 * Scoring Engine, and Gemini AI Evaluation Contract.
 */

import { JobItem, SEED_JOBS } from '../data/seedData';
import {
  generateMockInterviewQuestions,
  MockInterviewQuestion,
  ProficiencyTier
} from './jobnovaLogic';

export interface MockSessionQuestion {
  id: string;
  category: 'Technical' | 'System Design' | 'Behavioral';
  difficulty: ProficiencyTier;
  skillFocus: string;
  question: string;
  keyPoints: string[];
  sampleAnswer: string;
}

export interface MockQuestionEvaluation {
  questionId: string;
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Strong' | 'Adequate' | 'Needs Improvement';
  feedback: string;
  matchedConcepts: string[];
  missingConcepts: string[];
  suggestedImprovement: string;
}

export interface MockSessionEvaluation {
  overallScore: number; // 0 - 100
  verdict: 'Strong Hire' | 'Hire' | 'Borderline / Needs Review' | 'Not Yet Ready';
  readinessSummary: string;
  keyStrengths: string[];
  keyAreasForImprovement: string[];
  questionEvaluations: MockQuestionEvaluation[];
  evaluatedAt: string;
  evaluatorSource: 'gemini' | 'knowledge-base';
}

export interface MockInterviewSession {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  roleSkills: string[];
  proficiencyTier: ProficiencyTier;
  createdAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'evaluated';
  questions: MockSessionQuestion[];
  answers: Record<string, string>; // questionId -> candidate's response
  evaluation?: MockSessionEvaluation;
  timeSpentSeconds: number;
}

export const MOCK_INTERVIEW_STORAGE_KEY = 'jobnova_mock_interview_sessions_v1';

/**
 * Creates a new simulated mock interview session tailored to the specified job role.
 */
export function createMockInterviewSession(params: {
  job: JobItem;
  proficiencyTier: ProficiencyTier;
  userSkills?: string[];
  variantIndex?: number;
}): MockInterviewSession {
  const { job, proficiencyTier, userSkills, variantIndex = 0 } = params;
  const questions: MockInterviewQuestion[] = generateMockInterviewQuestions({
    job,
    proficiencyTier,
    userSkills,
    variantIndex
  });

  const sessionQuestions: MockSessionQuestion[] = questions.map((q) => ({
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    skillFocus: q.skillFocus,
    question: q.question,
    keyPoints: q.keyPoints,
    sampleAnswer: q.sampleAnswer
  }));

  const roleSkills = job.skills
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return {
    id: `mock-session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    roleSkills,
    proficiencyTier,
    createdAt: new Date().toISOString(),
    status: 'in_progress',
    questions: sessionQuestions,
    answers: {},
    timeSpentSeconds: 0
  };
}

/**
 * Saves or updates a candidate's response for a specific question in the session.
 */
export function saveSessionResponse(
  session: MockInterviewSession,
  questionId: string,
  answerText: string
): MockInterviewSession {
  return {
    ...session,
    answers: {
      ...session.answers,
      [questionId]: answerText
    }
  };
}

/**
 * Marks the interview session as completed and ready for evaluation.
 */
export function completeMockInterviewSession(
  session: MockInterviewSession,
  timeSpentSeconds?: number
): MockInterviewSession {
  return {
    ...session,
    status: session.evaluation ? 'evaluated' : 'completed',
    completedAt: session.completedAt || new Date().toISOString(),
    timeSpentSeconds: timeSpentSeconds !== undefined ? timeSpentSeconds : session.timeSpentSeconds
  };
}

/**
 * Performs offline deterministic evaluation of all saved answers in the session.
 * Used when Gemini API is offline or during offline unit testing.
 */
export function evaluateMockSessionOffline(
  session: MockInterviewSession
): MockSessionEvaluation {
  const questionEvaluations: MockQuestionEvaluation[] = session.questions.map((q) => {
    const rawAnswer = (session.answers[q.id] || '').trim();
    const lowerAnswer = rawAnswer.toLowerCase();

    if (!rawAnswer) {
      return {
        questionId: q.id,
        score: 0,
        rating: 'Needs Improvement',
        feedback: 'No response was provided for this question.',
        matchedConcepts: [],
        missingConcepts: [...q.keyPoints],
        suggestedImprovement: `Review foundational concepts: ${q.keyPoints.join(', ')}.`
      };
    }

    const matched: string[] = [];
    const missing: string[] = [];

    for (const kp of q.keyPoints) {
      const cleanKp = kp.toLowerCase().trim();
      const tokens = cleanKp.split(/\s+/).filter((t) => t.length > 2);
      const isPresent =
        lowerAnswer.includes(cleanKp) ||
        tokens.some((token) => lowerAnswer.includes(token));

      if (isPresent) {
        matched.push(kp);
      } else {
        missing.push(kp);
      }
    }

    const matchRatio = q.keyPoints.length > 0 ? matched.length / q.keyPoints.length : 0.5;
    const lengthBonus = Math.min(20, Math.floor(rawAnswer.length / 15));
    const calculatedScore = Math.min(100, Math.round(matchRatio * 80 + lengthBonus));

    let rating: MockQuestionEvaluation['rating'];
    if (calculatedScore >= 85) rating = 'Exceptional';
    else if (calculatedScore >= 70) rating = 'Strong';
    else if (calculatedScore >= 50) rating = 'Adequate';
    else rating = 'Needs Improvement';

    const feedback =
      matched.length > 0
        ? `Covered key concepts: ${matched.join(', ')}. ${
            missing.length > 0
              ? `Consider elaborating on: ${missing.join(', ')}.`
              : 'Comprehensive explanation.'
          }`
        : `Answer lacked expected technical concepts: ${q.keyPoints.join(', ')}.`;

    const suggestedImprovement =
      missing.length > 0
        ? `Incorporate ${missing.join(' and ')} to demonstrate architectural depth.`
        : 'Solid answer. To stand out, quantify production metrics or describe trade-offs.';

    return {
      questionId: q.id,
      score: calculatedScore,
      rating,
      feedback,
      matchedConcepts: matched,
      missingConcepts: missing,
      suggestedImprovement
    };
  });

  const totalScore =
    questionEvaluations.reduce((acc, qe) => acc + qe.score, 0) /
    (questionEvaluations.length || 1);
  const overallScore = Math.round(totalScore);

  let verdict: MockSessionEvaluation['verdict'];
  if (overallScore >= 80) verdict = 'Strong Hire';
  else if (overallScore >= 65) verdict = 'Hire';
  else if (overallScore >= 50) verdict = 'Borderline / Needs Review';
  else verdict = 'Not Yet Ready';

  const strengths: string[] = [];
  const improvements: string[] = [];

  for (const qe of questionEvaluations) {
    if (qe.matchedConcepts.length > 0) {
      strengths.push(...qe.matchedConcepts);
    }
    if (qe.missingConcepts.length > 0) {
      improvements.push(...qe.missingConcepts);
    }
  }

  const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 4);
  const uniqueImprovements = Array.from(new Set(improvements)).slice(0, 4);

  return {
    overallScore,
    verdict,
    readinessSummary: `Candidate achieved a score of ${overallScore}% for the ${session.jobTitle} position at ${session.company}. ${
      overallScore >= 70
        ? 'Demonstrated strong core competence in technical reasoning and architecture.'
        : 'Requires additional practice in system design and key framework concepts.'
    }`,
    keyStrengths:
      uniqueStrengths.length > 0
        ? uniqueStrengths
        : ['Structured communication', 'Clear explanation style'],
    keyAreasForImprovement:
      uniqueImprovements.length > 0
        ? uniqueImprovements
        : ['Elaborate with production trade-offs', 'Provide more concrete implementation details'],
    questionEvaluations,
    evaluatedAt: new Date().toISOString(),
    evaluatorSource: 'knowledge-base'
  };
}

/**
 * Calculates session progress (e.g. 3 of 4 questions answered).
 */
export function computeSessionProgress(session: MockInterviewSession): {
  answeredCount: number;
  totalQuestions: number;
  percentComplete: number;
} {
  const totalQuestions = session.questions.length;
  let answeredCount = 0;
  for (const q of session.questions) {
    if (session.answers[q.id]?.trim()) {
      answeredCount++;
    }
  }
  const percentComplete =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return {
    answeredCount,
    totalQuestions,
    percentComplete
  };
}

/**
 * Formats seconds into human-readable minutes and seconds (e.g. "04:32").
 */
export function formatSessionDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
