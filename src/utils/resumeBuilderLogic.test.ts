import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_USER_PROFILE,
  SEED_CERTIFICATIONS,
  SEED_COURSES,
  SEED_JOBS,
  SEED_LINKEDIN_WORK_HISTORY
} from '../data/seedData';
import {
  buildResumeDraftFromProfile,
  buildResumeFileSlug,
  convertDraftToPdfDocument,
  DEFAULT_RESUME_VISIBILITY,
  evaluateResumeAtsMatch,
  parseEducationString,
  serializePrimaryEducation
} from './resumeBuilderLogic';

test('parseEducationString parses degree, university, and period cleanly', () => {
  const entries = parseEducationString(
    'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027) · CGPA: 8.8/10'
  );
  assert.equal(entries.length, 1);
  assert.equal(entries[0].degree, 'B.E. in Computer Science & Engineering');
  assert.equal(entries[0].institution, 'Anna University, Chennai');
  assert.equal(entries[0].period, '2023–2027');
  assert.equal(entries[0].highlights, 'CGPA: 8.8/10');

  const roundTrip = serializePrimaryEducation(entries[0]);
  assert.equal(
    roundTrip,
    'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027) · CGPA: 8.8/10'
  );
});

test('buildResumeDraftFromProfile pulls live user profile, work history, skills, certs, and coursework', () => {
  const enrichedUser = {
    ...DEFAULT_USER_PROFILE,
    workHistory: SEED_LINKEDIN_WORK_HISTORY,
    linkedInConnected: true
  };

  const draft = buildResumeDraftFromProfile({
    user: enrichedUser,
    certifications: SEED_CERTIFICATIONS,
    savedCertIds: [1, 7],
    courses: SEED_COURSES,
    enrolledCourseIds: [3, 5],
    jobs: SEED_JOBS,
    appliedJobIds: [1, 2]
  });

  assert.equal(draft.fileName, 'Harish_Ragavendran_Resume.pdf');
  assert.equal(draft.fullName, 'Harish Ragavendran');
  assert.equal(draft.email, 'harishragavendran56@gmail.com');
  assert.equal(draft.experiences.length, 2);
  assert.equal(draft.experiences[0].company, 'TechCorp India');
  assert.equal(draft.skills.length, 7);
  assert.equal(draft.trackedCertifications.length, 2);
  assert.equal(draft.enrolledCourses.length, 2);
  assert.equal(draft.targetRoles.length, 2);
  assert.equal(draft.educationEntries[0].institution, 'Anna University, Chennai');
});

test('evaluateResumeAtsMatch calculates accurate keyword overlap and missing skills', () => {
  const draft = buildResumeDraftFromProfile({
    user: DEFAULT_USER_PROFILE,
    certifications: SEED_CERTIFICATIONS,
    savedCertIds: [1],
    courses: SEED_COURSES,
    enrolledCourseIds: [3],
    jobs: SEED_JOBS,
    appliedJobIds: [1]
  });

  // Job 21: Junior Java & Spring Boot Engineer (java,springboot,mysql,docker) -> missing 'docker'
  const persistentJob = SEED_JOBS.find((j) => j.id === 21)!;
  const result = evaluateResumeAtsMatch({ draft, targetJob: persistentJob });
  assert.ok(result);
  assert.equal(result.totalRequired, 4);
  assert.equal(result.matchedCount, 3);
  assert.equal(result.scorePct, 75);
  assert.deepEqual(result.missingSkills, ['docker']);
});

test('convertDraftToPdfDocument respects visibility flags and template choice', () => {
  const draft = buildResumeDraftFromProfile({
    user: {
      ...DEFAULT_USER_PROFILE,
      workHistory: SEED_LINKEDIN_WORK_HISTORY
    },
    certifications: SEED_CERTIFICATIONS,
    savedCertIds: [1, 7],
    courses: SEED_COURSES,
    enrolledCourseIds: [3, 5],
    jobs: SEED_JOBS,
    appliedJobIds: [1]
  });

  const pdfDoc = convertDraftToPdfDocument({
    draft,
    template: 'modern',
    visibility: {
      ...DEFAULT_RESUME_VISIBILITY,
      showCourses: false,
      showTargetRoles: true
    }
  });

  assert.equal(pdfDoc.template, 'modern');
  assert.equal(pdfDoc.enrolledCourses.length, 0);
  assert.equal(pdfDoc.targetRoles.length, 1);
  assert.equal(pdfDoc.experiences.length, 2);
  assert.equal(pdfDoc.educationEntries.length, 1);
  assert.equal(buildResumeFileSlug('Harish R.'), 'Harish_R_Resume.pdf');
});
