import test from 'node:test';
import assert from 'node:assert/strict';
import { JobItem, SEED_JOBS } from '../data/seedData';
import { generateQuickInterviewTips } from './quickInterviewTipsLogic';

test('generateQuickInterviewTips returns exactly 3 tailored questions for Java/Spring Boot/SQL job', () => {
  const tcsJob = SEED_JOBS.find((j) => j.id === 1) || SEED_JOBS[0];
  const bundle = generateQuickInterviewTips(tcsJob);

  assert.equal(bundle.jobId, tcsJob.id);
  assert.equal(bundle.jobTitle, tcsJob.title);
  assert.equal(bundle.company, tcsJob.company);
  assert.equal(bundle.questions.length, 3);

  const skillLabels = bundle.questions.map((q) => q.skillLabel.toLowerCase());
  assert.ok(skillLabels.some((s) => s.includes('java')));
  assert.ok(skillLabels.some((s) => s.includes('spring')));
  assert.ok(skillLabels.some((s) => s.includes('sql')));

  for (const q of bundle.questions) {
    assert.ok(q.question.length > 25);
    assert.ok(q.whatInterviewersLookFor.length >= 2);
    assert.ok(q.quickTip.length > 15);
  }
});

test('generateQuickInterviewTips adapts questions dynamically to GenAI, Golang, and unknown custom skill stacks', () => {
  const genaiJob = SEED_JOBS.find((j) => j.skills.toLowerCase().includes('genai'));
  assert.ok(genaiJob, 'Expected a seeded GenAI job');
  const genaiBundle = generateQuickInterviewTips(genaiJob);
  assert.equal(genaiBundle.questions.length, 3);
  const genaiQuestionsText = genaiBundle.questions.map((q) => `${q.skillLabel} ${q.question}`).join(' ').toLowerCase();
  assert.ok(
    genaiQuestionsText.includes('python') ||
      genaiQuestionsText.includes('llm') ||
      genaiQuestionsText.includes('rag') ||
      genaiQuestionsText.includes('genai')
  );

  const goJob = SEED_JOBS.find((j) => j.skills.toLowerCase().includes('golang'));
  assert.ok(goJob, 'Expected a seeded Golang job');
  const goBundle = generateQuickInterviewTips(goJob);
  assert.equal(goBundle.questions.length, 3);
  assert.ok(
    goBundle.questions.some((q) => q.skillLabel.toLowerCase().includes('go'))
  );

  const sparseCustomJob: JobItem = {
    id: 9999,
    title: 'Systems Engineer',
    company: 'EdgeCore',
    location: 'Bengaluru',
    skills: 'elixir',
    description: 'Build distributed Erlang/Elixir telemetry services.',
    ctc: '18.0 LPA'
  };
  const customBundle = generateQuickInterviewTips(sparseCustomJob);
  assert.equal(customBundle.questions.length, 3);
  assert.equal(customBundle.questions[0].skillLabel, 'Elixir');
  assert.ok(customBundle.questions[0].question.includes('Elixir'));
  assert.equal(new Set(customBundle.questions.map((q) => q.id)).size, 3);
});
