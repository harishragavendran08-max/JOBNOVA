import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_JOBS } from '../data/seedData';
import {
  completeMockInterviewSession,
  computeSessionProgress,
  createMockInterviewSession,
  evaluateMockSessionOffline,
  formatSessionDuration,
  saveSessionResponse
} from './mockInterviewLogic';

test('createMockInterviewSession initializes a full session tailored to the job', () => {
  const job = SEED_JOBS[0]; // TCS Software Engineer (java, springboot, sql)
  const session = createMockInterviewSession({
    job,
    proficiencyTier: 'Intermediate',
    variantIndex: 0
  });

  assert.ok(session.id.startsWith('mock-session-'));
  assert.equal(session.jobId, job.id);
  assert.equal(session.jobTitle, job.title);
  assert.equal(session.company, job.company);
  assert.equal(session.status, 'in_progress');
  assert.equal(session.proficiencyTier, 'Intermediate');
  assert.equal(session.questions.length, 4);
  assert.equal(session.timeSpentSeconds, 0);
  assert.deepEqual(session.answers, {});

  const qCategories = session.questions.map((q) => q.category);
  assert.ok(qCategories.includes('Technical'));
  assert.ok(qCategories.includes('System Design'));
  assert.ok(qCategories.includes('Behavioral'));
});

test('saveSessionResponse and computeSessionProgress track answered questions accurately', () => {
  const job = SEED_JOBS[0];
  let session = createMockInterviewSession({
    job,
    proficiencyTier: 'Intermediate'
  });

  assert.deepEqual(computeSessionProgress(session), {
    answeredCount: 0,
    totalQuestions: 4,
    percentComplete: 0
  });

  const q1 = session.questions[0];
  session = saveSessionResponse(session, q1.id, 'Java memory model uses heap for objects and stack for method frames.');

  assert.equal(session.answers[q1.id], 'Java memory model uses heap for objects and stack for method frames.');
  assert.deepEqual(computeSessionProgress(session), {
    answeredCount: 1,
    totalQuestions: 4,
    percentComplete: 25
  });

  const q2 = session.questions[1];
  session = saveSessionResponse(session, q2.id, 'Spring Boot auto-configuration uses @EnableAutoConfiguration.');
  assert.deepEqual(computeSessionProgress(session), {
    answeredCount: 2,
    totalQuestions: 4,
    percentComplete: 50
  });
});

test('completeMockInterviewSession transitions status and records elapsed duration', () => {
  const job = SEED_JOBS[1];
  let session = createMockInterviewSession({
    job,
    proficiencyTier: 'Advanced'
  });

  session = completeMockInterviewSession(session, 340);
  assert.equal(session.status, 'completed');
  assert.equal(session.timeSpentSeconds, 340);
  assert.ok(typeof session.completedAt === 'string');
});

test('evaluateMockSessionOffline grades answers against key concepts with strengths and areas for improvement', () => {
  const job = SEED_JOBS[0];
  let session = createMockInterviewSession({
    job,
    proficiencyTier: 'Intermediate'
  });

  // Provide thorough answers for Q1 (HashMap) and Q2 (@Transactional), and empty for Q3/Q4
  const q1 = session.questions[0];
  const q2 = session.questions[1];

  session = saveSessionResponse(
    session,
    q1.id,
    `Java HashMap computes an index from key.hashCode() into an internal bucket array. When collision occurs between two keys, elements are stored in a linked list. In Java 8+, if a bucket exceeds 8 entries, it treeifies into a balanced red-black tree for O(log n) lookup. Keys must properly implement equals and hashCode to ensure lookup correctness.`
  );

  session = saveSessionResponse(
    session,
    q2.id,
    `Spring Boot transactions use @Transactional to manage atomicity and rollback on unchecked exceptions. Propagation controls how transaction boundaries merge across services, and @ControllerAdvice provides unified global REST exception handling with input validation.`
  );

  const evaluation = evaluateMockSessionOffline(session);

  assert.ok(evaluation.overallScore > 0);
  assert.equal(evaluation.evaluatorSource, 'knowledge-base');
  assert.ok(['Strong Hire', 'Hire', 'Borderline / Needs Review', 'Not Yet Ready'].includes(evaluation.verdict));
  assert.equal(evaluation.questionEvaluations.length, 4);

  const q1Eval = evaluation.questionEvaluations.find((qe) => qe.questionId === q1.id);
  assert.ok(q1Eval);
  assert.ok(q1Eval.score >= 50);
  assert.ok(q1Eval.matchedConcepts.length > 0);

  const q3Eval = evaluation.questionEvaluations.find((qe) => qe.questionId === session.questions[2].id);
  assert.ok(q3Eval);
  assert.equal(q3Eval.score, 0);
  assert.equal(q3Eval.rating, 'Needs Improvement');
});

test('formatSessionDuration formats mm:ss strings cleanly', () => {
  assert.equal(formatSessionDuration(0), '00:00');
  assert.equal(formatSessionDuration(45), '00:45');
  assert.equal(formatSessionDuration(65), '01:05');
  assert.equal(formatSessionDuration(600), '10:00');
});
