import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTopRoleRadarComparison } from './topRoleRadarLogic';
import type { JobItem } from '../data/seedData';

const SAMPLE_FRONTEND_JOB: JobItem = {
  id: 3,
  title: 'Frontend Engineer',
  company: 'Wipro',
  location: 'Hyderabad',
  description: 'Build modern web interfaces.',
  skills: 'html,css,javascript,react',
  type: 'Full-Time',
  ctc: '6.8 LPA'
};

const SAMPLE_BACKEND_JOB: JobItem = {
  id: 1,
  title: 'Software Engineer',
  company: 'TCS',
  location: 'Chennai',
  description: 'Develop enterprise Java & Spring Boot apps.',
  skills: 'java,springboot,sql',
  type: 'Full-Time',
  ctc: '7.5 LPA'
};

test('computeTopRoleRadarComparison builds >= 5 axes and identifies full match vs gap across jobs', () => {
  const userSkills = ['java', 'springboot', 'react', 'javascript', 'html', 'css', 'mysql'];

  const frontendRadar = computeTopRoleRadarComparison({
    job: SAMPLE_FRONTEND_JOB,
    userSkills,
    enrolledCourseIds: [3, 5],
    savedCertIds: [1, 7]
  });

  assert.equal(frontendRadar.totalRequiredCount, 4);
  assert.equal(frontendRadar.matchedRequiredCount, 4);
  assert.ok(frontendRadar.axes.length >= 5, 'Should pad to at least 5 axes for radar polygon');
  assert.ok(frontendRadar.overallReadinessPct >= 90);
  assert.equal(frontendRadar.strongestSkill?.key, 'html');
  assert.equal(frontendRadar.topFocusSkill, null);

  const backendRadar = computeTopRoleRadarComparison({
    job: SAMPLE_BACKEND_JOB,
    userSkills,
    enrolledCourseIds: [3, 5],
    savedCertIds: [1, 7]
  });

  assert.equal(backendRadar.totalRequiredCount, 3);
  assert.equal(backendRadar.matchedRequiredCount, 2);
  assert.ok(backendRadar.axes.length >= 5);
  assert.equal(backendRadar.topFocusSkill?.key, 'sql');
  assert.equal(backendRadar.topFocusSkill?.status, 'Needs Focus');
  assert.ok((backendRadar.topFocusSkill?.gap ?? 0) < 0);
});

test('computeTopRoleRadarComparison respects manual skillProficiency overrides from user profile', () => {
  const radarDefault = computeTopRoleRadarComparison({
    job: SAMPLE_BACKEND_JOB,
    userSkills: ['java', 'springboot', 'sql'],
    customProficiencyOverrides: {}
  });

  const radarBoosted = computeTopRoleRadarComparison({
    job: SAMPLE_BACKEND_JOB,
    userSkills: ['java', 'springboot', 'sql'],
    customProficiencyOverrides: {
      java: 96,
      springboot: 94,
      sql: 95
    }
  });

  const javaDefault = radarDefault.axes.find((a) => a.key === 'java')!;
  const javaBoosted = radarBoosted.axes.find((a) => a.key === 'java')!;

  assert.equal(javaBoosted.userProficiency, 96);
  assert.ok(radarBoosted.overallReadinessPct >= radarDefault.overallReadinessPct);
  assert.ok(javaBoosted.gap > javaDefault.gap);
  assert.equal(javaBoosted.status, 'Exceeds');
});
