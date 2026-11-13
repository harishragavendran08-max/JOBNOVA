import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_INTERNSHIPS, SEED_JOBS } from '../data/seedData';
import {
  syncApplicationStageRecords,
  updateApplicationStageRecord
} from './jobnovaLogic';
import {
  buildPipelineCheatSheet,
  computeCheatSheetProgress,
  extractRoleSkillTokens,
  filterCheatSheetItems,
  SPRING_JAVA_CHEAT_SHEET
} from './cheatSheetLogic';

test('extractRoleSkillTokens normalizes comma skills and infers tokens from internship descriptions', () => {
  const jobTokens = extractRoleSkillTokens(SEED_JOBS[0]); // TCS Software Engineer: java,springboot,sql
  assert.ok(jobTokens.includes('java'));
  assert.ok(jobTokens.includes('springboot'));
  assert.ok(jobTokens.includes('spring'));
  assert.ok(jobTokens.includes('sql'));

  const internTokens = extractRoleSkillTokens(SEED_INTERNSHIPS[1]); // TCS Java Backend Intern
  assert.ok(internTokens.includes('java'));
  assert.ok(internTokens.includes('springboot'));
  assert.ok(internTokens.includes('rest-api'));
});

test('buildPipelineCheatSheet prioritizes Spring Boot, Java, and SQL questions for TCS Interviewing pipeline', () => {
  const baseRecords = syncApplicationStageRecords({
    appliedJobIds: [1],
    jobs: SEED_JOBS,
    existingRecords: {}
  });
  const stageRecords = updateApplicationStageRecord({
    existingRecords: baseRecords,
    job: SEED_JOBS[0],
    nextStage: 'Interviewing',
    timestamp: 'Nov 12, 2026'
  });

  const result = buildPipelineCheatSheet({
    pipelineJobs: [SEED_JOBS[0]], // TCS Software Engineer (java,springboot,sql)
    pipelineInternships: [SEED_INTERNSHIPS[1]], // TCS Java Backend Intern
    stageRecords,
    userSkills: ['java', 'springboot', 'mysql']
  });

  assert.equal(result.isPipelineEmpty, false);
  assert.equal(result.hasJavaSpringPipelineMatch, true);
  assert.equal(result.pipelineRoles.length, 2);
  assert.equal(result.pipelineRoles[0].stage, 'Interviewing');

  // Highest scoring questions should be matched to the TCS pipeline
  const topItem = result.items[0];
  assert.equal(topItem.isPipelineRequired, true);
  assert.ok(topItem.matchedRoles.some((r) => r.company === 'TCS' && r.stage === 'Interviewing'));
  assert.ok(topItem.relevanceScore >= result.items[result.items.length - 1].relevanceScore);
});

test('buildPipelineCheatSheet handles Kafka and Hibernate pipeline additions accurately', () => {
  const ciscoJob = SEED_JOBS.find((j) => j.id === 25)!; // java,springboot,kafka,sql
  const result = buildPipelineCheatSheet({
    pipelineJobs: [ciscoJob],
    pipelineInternships: []
  });

  const kafkaItem = result.items.find((i) => i.question.id === 'arch-kafka-micro');
  assert.ok(kafkaItem);
  assert.equal(kafkaItem.isPipelineRequired, true);
  assert.ok(kafkaItem.matchedTokens.includes('kafka'));
  assert.equal(kafkaItem.matchedRoles[0].company, 'Cisco India');
});

test('buildPipelineCheatSheet handles empty pipeline gracefully without crashing', () => {
  const result = buildPipelineCheatSheet({
    pipelineJobs: [],
    pipelineInternships: [],
    userSkills: ['java']
  });

  assert.equal(result.isPipelineEmpty, true);
  assert.equal(result.hasJavaSpringPipelineMatch, false);
  assert.equal(result.items.length, SPRING_JAVA_CHEAT_SHEET.length);
  assert.ok(result.items.every((item) => item.isPipelineRequired === false));
});

test('filterCheatSheetItems filters by topic, pipelineOnly, search query, and mastery state', () => {
  const result = buildPipelineCheatSheet({
    pipelineJobs: [SEED_JOBS[0]], // java,springboot,sql
    pipelineInternships: []
  });

  const springOnly = filterCheatSheetItems({
    items: result.items,
    topic: 'Spring Boot',
    searchQuery: '',
    pipelineOnly: true
  });
  assert.ok(springOnly.length > 0);
  assert.ok(springOnly.every((i) => i.question.topic === 'Spring Boot' && i.isPipelineRequired));

  const queryMatched = filterCheatSheetItems({
    items: result.items,
    topic: 'ALL',
    searchQuery: 'N+1',
    pipelineOnly: false
  });
  assert.equal(queryMatched.length, 1);
  assert.equal(queryMatched[0].question.id, 'jpa-nplus1');

  const masteredOnly = filterCheatSheetItems({
    items: result.items,
    topic: 'ALL',
    searchQuery: '',
    pipelineOnly: false,
    masteryFilter: 'MASTERED',
    reviewedIds: ['sb-autoconfig', 'java-hashmap']
  });
  assert.equal(masteredOnly.length, 2);
});

test('computeCheatSheetProgress computes pipeline readiness percentage accurately', () => {
  const result = buildPipelineCheatSheet({
    pipelineJobs: [SEED_JOBS[0]],
    pipelineInternships: []
  });

  const pipelineIds = result.items.filter((i) => i.isPipelineRequired).map((i) => i.question.id);
  const progressHalf = computeCheatSheetProgress({
    items: result.items,
    reviewedIds: pipelineIds.slice(0, Math.floor(pipelineIds.length / 2))
  });

  assert.equal(progressHalf.total, SPRING_JAVA_CHEAT_SHEET.length);
  assert.equal(progressHalf.pipelineTotal, pipelineIds.length);
  assert.ok(progressHalf.readinessPercent >= 40 && progressHalf.readinessPercent <= 60);

  const progressFull = computeCheatSheetProgress({
    items: result.items,
    reviewedIds: pipelineIds
  });
  assert.equal(progressFull.readinessPercent, 100);
});
