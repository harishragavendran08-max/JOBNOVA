import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateInterviewFeedbackRecords,
  confidenceRatingToScore,
  extractTopicsFromFeedback
} from './interviewPrepAnalyticsLogic.ts';
import type { ApplicationStageRecord } from './jobnovaLogic.ts';
import type { JobItem } from '../data/seedData.ts';

const SAMPLE_JOBS: JobItem[] = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'TCS',
    location: 'Chennai',
    description: 'Develop enterprise Java & Spring Boot apps.',
    skills: 'java,springboot,sql',
    type: 'Full-Time',
    ctc: '7.5 LPA'
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Infosys',
    location: 'Bengaluru',
    description: 'Work on REST APIs and microservices.',
    skills: 'java,springboot,hibernate',
    type: 'Full-Time',
    ctc: '8.2 LPA'
  }
];

test('confidenceRatingToScore maps confidence ratings to numeric 0-100 scale', () => {
  assert.equal(confidenceRatingToScore('Strong'), 90);
  assert.equal(confidenceRatingToScore('Moderate'), 68);
  assert.equal(confidenceRatingToScore('Needs Review'), 42);
});

test('extractTopicsFromFeedback identifies canonical engineering topics', () => {
  const topics = extractTopicsFromFeedback(
    {
      id: 'fb-1',
      roundTitle: 'Round 1: Java & Spring Boot Screening',
      interviewerOrFormat: '45m Live Coding',
      questionsAsked: 'Spring @Transactional propagation and MySQL composite index optimization',
      keyTakeaways: 'Good REST API design',
      confidenceRating: 'Strong',
      timestamp: 'Nov 10, 2026'
    },
    ['java', 'springboot', 'mysql']
  );

  assert.ok(topics.includes('Spring Boot'));
  assert.ok(topics.includes('Java Core'));
  assert.ok(topics.includes('MySQL & SQL'));
  assert.ok(topics.includes('REST APIs'));
});

test('aggregateInterviewFeedbackRecords computes chronological trend points, moving averages, and filters', () => {
  const stageRecords: Record<number, ApplicationStageRecord> = {
    1: {
      jobId: 1,
      currentStage: 'Interviewing',
      updatedAt: 'Nov 12, 2026',
      interviewFeedbackNotes: [
        {
          id: 'fb-3',
          roundTitle: 'Round 2: System Design & Caching · TCS',
          interviewerOrFormat: 'Hiring Manager · 60m',
          questionsAsked: 'Distributed caching, MySQL read replicas, and Spring Boot Actuator',
          keyTakeaways: 'Designed clean read-through cache and SQL indexing strategy.',
          confidenceRating: 'Strong',
          timestamp: 'Nov 12, 2026'
        },
        {
          id: 'fb-1',
          roundTitle: 'Round 1: Core Java & SQL · TCS',
          interviewerOrFormat: 'Technical Panel · 45m',
          questionsAsked: 'Java Streams, HashMap internals, and SQL joins',
          keyTakeaways: 'Need to brush up on concurrent collection edge cases.',
          confidenceRating: 'Needs Review',
          timestamp: 'Nov 4, 2026'
        }
      ],
      history: []
    },
    2: {
      jobId: 2,
      currentStage: 'Interviewing',
      updatedAt: 'Nov 8, 2026',
      interviewFeedbackNotes: [
        {
          id: 'fb-2',
          roundTitle: 'Round 1: Spring Boot REST API · Infosys',
          interviewerOrFormat: 'Senior Engineer · 45m',
          questionsAsked: 'REST pagination, Bean Validation @NotBlank, and JPA N+1 queries',
          keyTakeaways: 'Answered REST validation cleanly; reviewed JOIN FETCH pagination.',
          confidenceRating: 'Moderate',
          timestamp: 'Nov 8, 2026'
        }
      ],
      history: []
    }
  };

  const summary = aggregateInterviewFeedbackRecords({
    stageRecords,
    jobs: SAMPLE_JOBS
  });

  assert.equal(summary.totalSessions, 3);
  // Scores: 42 (Nov 4), 68 (Nov 8), 90 (Nov 12) -> avg = 67
  assert.equal(summary.averageConfidenceScore, 67);
  assert.equal(summary.latestConfidenceScore, 90);
  assert.equal(summary.confidenceMomentumDelta, 48);
  assert.equal(summary.trendDirection, 'upward');
  assert.equal(summary.ratingCounts.Strong, 1);
  assert.equal(summary.ratingCounts.Moderate, 1);
  assert.equal(summary.ratingCounts['Needs Review'], 1);

  assert.equal(summary.trendPoints.length, 3);
  assert.equal(summary.trendPoints[0].id, 'fb-1');
  assert.equal(summary.trendPoints[1].id, 'fb-2');
  assert.equal(summary.trendPoints[2].id, 'fb-3');
  assert.equal(summary.trendPoints[2].movingAverageScore, 67);

  // Filter by Strong rating
  const strongOnly = aggregateInterviewFeedbackRecords({
    stageRecords,
    jobs: SAMPLE_JOBS,
    confidenceFilter: 'Strong'
  });
  assert.equal(strongOnly.filteredRecords.length, 1);
  assert.equal(strongOnly.filteredRecords[0].id, 'fb-3');

  // Filter by company
  const infosysOnly = aggregateInterviewFeedbackRecords({
    stageRecords,
    jobs: SAMPLE_JOBS,
    companyFilter: 'Infosys'
  });
  assert.equal(infosysOnly.filteredRecords.length, 1);
  assert.equal(infosysOnly.filteredRecords[0].company, 'Infosys');
});
