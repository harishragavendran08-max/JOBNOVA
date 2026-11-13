import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_JOBS } from '../data/seedData';
import {
  computeJobMatchBreakdown,
  getCopyLinkFeedbackMeta,
  sortJobsList
} from './marketplaceHelpers';

test('computeJobMatchBreakdown computes matched vs missing skills and salary relation', () => {
  const tcsJob = SEED_JOBS[0]; // java,springboot,sql · 7.5 LPA
  const res = computeJobMatchBreakdown({
    job: tcsJob,
    userSkills: ['java', 'springboot', 'react', 'mysql'],
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  });

  assert.deepEqual(res.matchedSkills, ['java', 'springboot']);
  assert.deepEqual(res.missingSkills, ['sql']);
  assert.equal(res.matchPercent, 67);
  assert.equal(res.salaryLpa, 7.5);
  assert.equal(res.salaryRelation, 'below');

  const phonePeJob = SEED_JOBS.find((j) => j.id === 28)!; // 25.0 LPA
  const highRes = computeJobMatchBreakdown({
    job: phonePeJob,
    userSkills: ['java', 'springboot', 'mysql'],
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  });
  assert.equal(highRes.salaryRelation, 'above');
  assert.equal(highRes.matchPercent, 75);
});

test('sortJobsList ranks roles cleanly by Best Skill Match and Highest/Lowest CTC without mutating input', () => {
  const subset = SEED_JOBS.slice(0, 12);
  const originalFirstId = subset[0].id;
  const skills = ['java', 'springboot', 'react', 'javascript', 'html', 'css', 'mysql'];

  const byMatch = sortJobsList(subset, {
    sortBy: 'match-desc',
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  });
  assert.equal(subset[0].id, originalFirstId);
  const firstMatch = computeJobMatchBreakdown({
    job: byMatch[0],
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  }).matchPercent;
  const lastMatch = computeJobMatchBreakdown({
    job: byMatch[byMatch.length - 1],
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  }).matchPercent;
  assert.ok(firstMatch >= lastMatch);

  const byHighCtc = sortJobsList(subset, {
    sortBy: 'ctc-desc',
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  });
  const firstCtc = computeJobMatchBreakdown({
    job: byHighCtc[0],
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  }).salaryLpa ?? 0;
  const lastCtc = computeJobMatchBreakdown({
    job: byHighCtc[byHighCtc.length - 1],
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  }).salaryLpa ?? 0;
  assert.ok(firstCtc >= lastCtc);

  const byLowCtc = sortJobsList(subset, {
    sortBy: 'ctc-asc',
    userSkills: skills,
    expectedMinLpa: 8,
    expectedMaxLpa: 16
  });
  assert.equal(byLowCtc[0].id, byHighCtc[byHighCtc.length - 1].id);
});

test('getCopyLinkFeedbackMeta switches cleanly between default and copied state for the matching job', () => {
  const idle = getCopyLinkFeedbackMeta({
    copiedJobLinkId: null,
    jobId: 4,
    jobTitle: 'Backend SDE'
  });
  assert.equal(idle.isCopied, false);
  assert.equal(idle.label, 'Copy Link');
  assert.equal(idle.statusTag, null);
  assert.equal(idle.ariaLabel, 'Copy job link for Backend SDE to clipboard');

  const copiedSameJob = getCopyLinkFeedbackMeta({
    copiedJobLinkId: 4,
    jobId: 4,
    jobTitle: 'Backend SDE'
  });
  assert.equal(copiedSameJob.isCopied, true);
  assert.equal(copiedSameJob.label, 'Link Copied');
  assert.equal(copiedSameJob.statusTag, 'Copied');
  assert.equal(copiedSameJob.ariaLabel, 'Job link for Backend SDE copied to clipboard');

  const copiedOtherJob = getCopyLinkFeedbackMeta({
    copiedJobLinkId: 9,
    jobId: 4,
    jobTitle: 'Backend SDE'
  });
  assert.equal(copiedOtherJob.isCopied, false);
  assert.equal(copiedOtherJob.label, 'Copy Link');
});
