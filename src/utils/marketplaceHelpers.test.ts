import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_JOBS } from '../data/seedData';
import { computeJobMatchBreakdown } from './marketplaceHelpers';

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
