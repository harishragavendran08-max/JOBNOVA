import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_JOBS, JobItem } from '../data/seedData';
import {
  buildSimilarJobTemplate,
  createUserAlertFromJob,
  findAlertForJob,
  findMatchingAlertsForNewJob,
  parseJobSkills,
  recordAlertJobMatches
} from './userAlertsLogic';

test('parseJobSkills splits, trims, lowercases, and deduplicates skills', () => {
  assert.deepEqual(parseJobSkills(' Java, SpringBoot , java, SQL '), [
    'java',
    'springboot',
    'sql'
  ]);
  assert.deepEqual(parseJobSkills(''), []);
});

test('createUserAlertFromJob and findAlertForJob manage UserAlerts records cleanly', () => {
  const job = SEED_JOBS[0]; // TCS Software Engineer: java,springboot,sql
  const alert = createUserAlertFromJob({
    job,
    userEmail: 'Harish@JobNova.in',
    browserPermission: 'granted',
    id: 'alert-test-1'
  });

  assert.equal(alert.id, 'alert-test-1');
  assert.equal(alert.userEmail, 'harish@jobnova.in');
  assert.equal(alert.sourceJobId, job.id);
  assert.deepEqual(alert.skills, ['java', 'springboot', 'sql']);
  assert.equal(alert.pushEnabled, true);
  assert.equal(alert.browserPermission, 'granted');
  assert.deepEqual(alert.matchedNewJobIds, []);

  assert.equal(findAlertForJob([alert], job)?.id, 'alert-test-1');
  // Identical skill set on another job also resolves cleanly
  assert.equal(
    findAlertForJob([alert], { id: 999, skills: 'sql, java, springboot' })?.id,
    'alert-test-1'
  );
  assert.equal(findAlertForJob([alert], { id: 999, skills: 'python,pytorch' }), undefined);
});

test('findMatchingAlertsForNewJob matches new jobs with similar skill requirements and updates alert history', () => {
  const javaAlert = createUserAlertFromJob({
    job: SEED_JOBS[0], // java,springboot,sql
    id: 'alert-java'
  });
  const aiAlert = createUserAlertFromJob({
    job: SEED_JOBS[4], // python,tensorflow,ai,ml
    id: 'alert-ai'
  });

  const newJavaMicroservicesJob: JobItem = {
    id: 101,
    title: 'Java Microservices Engineer',
    company: 'Flipkart',
    location: 'Bengaluru',
    description: 'Build distributed services with Java, Spring Boot, and PostgreSQL.',
    skills: 'java,springboot,docker,kafka',
    type: 'Full-Time',
    ctc: '20.0 LPA'
  };

  const matches = findMatchingAlertsForNewJob([javaAlert, aiAlert], newJavaMicroservicesJob);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].alert.id, 'alert-java');
  assert.deepEqual(matches[0].sharedSkills, ['java', 'springboot']);

  const updated = recordAlertJobMatches(
    [javaAlert, aiAlert],
    matches,
    newJavaMicroservicesJob.id,
    '2026-11-12T22:45:00.000Z'
  );
  assert.deepEqual(updated[0].matchedNewJobIds, [101]);
  assert.equal(updated[0].lastTriggeredAt, '2026-11-12T22:45:00.000Z');
  assert.deepEqual(updated[1].matchedNewJobIds, []);
});

test('buildSimilarJobTemplate preserves required skills for new job creation', () => {
  const source = SEED_JOBS[2]; // Frontend Engineer: html,css,javascript,react
  const template = buildSimilarJobTemplate(source);
  assert.equal(template.skills, source.skills);
  assert.ok(template.title.includes(source.title));
  assert.equal(template.location, source.location);

  const repeated = buildSimilarJobTemplate({ ...source, title: template.title });
  assert.equal(repeated.title, template.title);
});
