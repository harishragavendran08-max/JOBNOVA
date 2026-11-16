import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_USER_SETTINGS,
  SEED_CERTIFICATIONS,
  SEED_COURSES,
  SEED_INTERNSHIPS,
  SEED_JOBS,
  SEED_LINKEDIN_EDUCATION,
  SEED_LINKEDIN_HEADLINE,
  SEED_LINKEDIN_PROFILE_SUMMARY,
  SEED_LINKEDIN_SKILLS,
  SEED_LINKEDIN_WORK_HISTORY,
  SPRING_BOOT_DIAGNOSTICS
} from '../data/seedData';
import {
  addInterviewFeedbackRecord,
  applyLinkedInSyncPayload,
  buildFinishProfileAiPrompt,
  buildJobShareLinks,
  buildLinkedInShareUrl,
  buildMockLinkedInProfilePayload,
  buildResumeStructuredData,
  computeCareerStats,
  computeCareerTimelineSummary,
  computeInterviewCountdown,
  computeLinkedInConnectionHealth,
  computePersonalizedSkillAlerts,
  computeProfileCompletionProgress,
  computeProfileSkillGapAnalysis,
  computeProfileSkillProficiencyList,
  computeResumeHealthScore,
  computeSalaryComparisonData,
  computeSkillRadarData,
  deriveStudentProficiencyTier,
  disconnectLinkedInProfile,
  evaluateMockInterviewAnswer,
  filterCertifications,
  filterCourses,
  filterDiagnostics,
  filterInternships,
  filterJobsBySkill,
  filterJobsList,
  formatApplicationStatusNotification,
  normalizeSavedJobIds,
  formatWorkExperienceDuration,
  generateLinkedInShareText,
  generateMockInterviewQuestions,
  getDefaultInterviewIso,
  getStageStepIndex,
  getThemeToggleMeta,
  importLinkedInProfileData,
  matchOfflineCareerAssistant,
  parseJobCtcLpa,
  syncApplicationStageRecords,
  toggleItemSelection,
  toggleThemeSetting,
  updateApplicationStageRecord,
  updateExpectedSalarySettings,
  updateInterviewScheduleRecord,
  updateSkillProficiencyMap
} from './jobnovaLogic';

test('filterJobsBySkill filters 65 seeded jobs across iOS/Swift, Java, GenAI, Go, Rust, Cloud, Data, QA & Security stacks', () => {
  assert.equal(SEED_JOBS.length, 65);
  const javaJobs = filterJobsBySkill(SEED_JOBS, 'springboot');
  assert.ok(javaJobs.length >= 10);
  assert.equal(javaJobs[0].company, 'TCS');
  assert.equal(javaJobs[1].company, 'Infosys');

  const iosJobs = filterJobsBySkill(SEED_JOBS, 'swift');
  assert.equal(iosJobs.length, 4);
  assert.equal(iosJobs[0].company, 'Apple India');

  const chennaiJobs = filterJobsBySkill(SEED_JOBS, '', 'Chennai');
  assert.equal(chennaiJobs.length, 11);

  const genaiJobs = filterJobsBySkill(SEED_JOBS, 'genai');
  assert.ok(genaiJobs.length >= 2);
  assert.equal(genaiJobs[0].company, 'Krutrim AI');

  const goJobs = filterJobsBySkill(SEED_JOBS, 'golang');
  assert.ok(goJobs.length >= 3);
  assert.equal(goJobs[0].company, 'Gojek');

  const rustJobs = filterJobsBySkill(SEED_JOBS, 'rust');
  assert.ok(rustJobs.length >= 2);
  assert.equal(rustJobs[0].company, 'Zerodha');

  const k8sJobs = filterJobsBySkill(SEED_JOBS, 'kubernetes');
  assert.ok(k8sJobs.length >= 8);

  const dataJobs = filterJobsBySkill(SEED_JOBS, 'snowflake');
  assert.equal(dataJobs.length, 3);

  const qaJobs = filterJobsBySkill(SEED_JOBS, 'playwright');
  assert.equal(qaJobs.length, 2);
  assert.equal(qaJobs[0].company, 'BrowserStack');

  const secJobs = filterJobsBySkill(SEED_JOBS, 'cybersecurity');
  assert.equal(secJobs.length, 3);
});

test('filterInternships filters 20 seeded internships accurately', () => {
  assert.equal(SEED_INTERNSHIPS.length, 20);
  const remoteInterns = filterInternships(SEED_INTERNSHIPS, '', 'Remote');
  assert.equal(remoteInterns.length, 6);

  const pythonInterns = filterInternships(SEED_INTERNSHIPS, 'python');
  assert.equal(pythonInterns.length, 3);
  assert.equal(pythonInterns[0].company, 'Infosys');

  const genaiInterns = filterInternships(SEED_INTERNSHIPS, 'langchain');
  assert.equal(genaiInterns.length, 1);
  assert.equal(genaiInterns[0].company, 'Krutrim AI');
});

test('filterCourses filters 34 seeded courses by keyword and provider', () => {
  assert.equal(SEED_COURSES.length, 34);
  const springCourses = filterCourses(SEED_COURSES, 'Spring');
  assert.equal(springCourses.length, 2); // Spring Boot Complete Guide & REST API Design

  const courseraCourses = filterCourses(SEED_COURSES, '', 'Coursera');
  assert.ok(courseraCourses.length >= 10);

  const ragCourses = filterCourses(SEED_COURSES, 'LangChain');
  assert.equal(ragCourses.length, 1);
});

test('filterCertifications filters 18 seeded certifications by name and issuer', () => {
  assert.equal(SEED_CERTIFICATIONS.length, 18);
  const awsCerts = filterCertifications(SEED_CERTIFICATIONS, 'aws');
  assert.equal(awsCerts.length, 3);
  assert.equal(awsCerts[0].issuer, 'Amazon');
  assert.equal(awsCerts[1].issuer, 'Amazon');
  assert.equal(awsCerts[2].issuer, 'Amazon');

  const k8sCerts = filterCertifications(SEED_CERTIFICATIONS, 'Kubernetes');
  assert.equal(k8sCerts.length, 1);
  assert.equal(k8sCerts[0].issuer, 'CNCF');
});

test('matchOfflineCareerAssistant returns knowledge base responses for known keywords', () => {
  const resumeReply = matchOfflineCareerAssistant('Can you give me resume tips?');
  assert.ok(resumeReply.includes('Resume Tips'));

  const interviewReply = matchOfflineCareerAssistant('How to prepare for an interview?');
  assert.ok(interviewReply.includes('Interview'));

  const fallbackReply = matchOfflineCareerAssistant('unrelated random query xyz');
  assert.ok(fallbackReply.includes('JobNova Career Assistant'));
});

test('toggleItemSelection adds and removes IDs cleanly', () => {
  const afterAdd = toggleItemSelection([1, 2], 3);
  assert.deepEqual(afterAdd, [1, 2, 3]);

  const afterRemove = toggleItemSelection(afterAdd, 2);
  assert.deepEqual(afterRemove, [1, 3]);
});

test('computeCareerStats calculates matched jobs and totals', () => {
  const stats = computeCareerStats({
    jobs: SEED_JOBS,
    userSkills: ['java', 'springboot'],
    appliedJobIds: [1, 2],
    appliedInternshipIds: [2],
    enrolledCourseIds: [3, 5],
    savedCertIds: [1]
  });
  assert.ok(stats.matchedJobsCount >= 6);
  assert.equal(stats.totalApplications, 3);
  assert.equal(stats.enrolledCoursesCount, 2);
  assert.equal(stats.savedCertsCount, 1);
});

test('filterDiagnostics returns all 6 Spring Boot fixes and filters by severity', () => {
  assert.equal(SPRING_BOOT_DIAGNOSTICS.length, 6);
  const criticalOnly = filterDiagnostics(SPRING_BOOT_DIAGNOSTICS, 'Critical');
  assert.equal(criticalOnly.length, 3);
});

test('computeSkillRadarData computes student proficiency vs industry requirements for saved job roles', () => {
  const savedJobs = SEED_JOBS.slice(0, 2); // TCS (java,springboot,sql) & Infosys (java,springboot,hibernate)
  const radarData = computeSkillRadarData({
    userSkills: ['java', 'springboot', 'sql', 'react', 'python', 'aws'],
    savedJobs,
    enrolledCourseIds: [3, 5],
    savedCertIds: [1]
  });

  assert.ok(radarData.length >= 6);
  const javaPoint = radarData.find((p) => p.key === 'java');
  assert.ok(javaPoint);
  assert.ok(javaPoint.studentProficiency > 0 && javaPoint.studentProficiency <= 100);
  assert.ok(javaPoint.industryRequirement >= 85);
  assert.equal(javaPoint.fullMark, 100);
});

test('buildResumeStructuredData formats profile, skills, and tracked certifications for PDF export', () => {
  const resume = buildResumeStructuredData({
    user: DEFAULT_USER_PROFILE,
    certifications: SEED_CERTIFICATIONS,
    savedCertIds: [1, 7],
    courses: SEED_COURSES,
    enrolledCourseIds: [3, 5],
    jobs: SEED_JOBS,
    appliedJobIds: [1]
  });

  assert.equal(resume.fileName, 'Harish_Ragavendran_Resume.pdf');
  assert.equal(resume.fullName, 'Harish Ragavendran');
  assert.equal(resume.skills.length, 7);
  assert.equal(resume.trackedCertifications.length, 2);
  assert.equal(resume.trackedCertifications[0].name, 'Java SE 11 Developer');
  assert.equal(resume.trackedCertifications[1].name, 'Spring Framework Developer');
  assert.equal(resume.enrolledCourses.length, 2);
});

test('computeSalaryComparisonData compares average CTC of saved jobs against expected salary range', () => {
  assert.equal(parseJobCtcLpa('7.5 LPA'), 7.5);
  assert.equal(parseJobCtcLpa('28.0 LPA'), 28);

  // Saved jobs: TCS (7.5 LPA) and Google India (28.0 LPA) -> avg 17.8 LPA
  const comparison = computeSalaryComparisonData({
    jobs: SEED_JOBS,
    savedJobIds: [1, 5],
    expectedSalaryMinLpa: 8.0,
    expectedSalaryMaxLpa: 16.0
  });

  assert.equal(comparison.savedJobsCount, 2);
  assert.equal(comparison.savedJobsAverageLpa, 17.8);
  assert.equal(comparison.expectedMinLpa, 8);
  assert.equal(comparison.expectedMaxLpa, 16);
  assert.equal(comparison.expectedMidpointLpa, 12);
  assert.equal(comparison.alignmentStatus, 'Above Expected Range');
  assert.ok(comparison.bars.length >= 6);
});

test('Career Timeline logic initializes stages, logs status updates, and computes stage counts', () => {
  assert.equal(getStageStepIndex('Applied'), 0);
  assert.equal(getStageStepIndex('Interviewing'), 1);
  assert.equal(getStageStepIndex('Offer Received'), 2);
  assert.equal(getStageStepIndex('Rejected'), 3);

  const initialRecords = syncApplicationStageRecords({
    appliedJobIds: [1, 2],
    jobs: SEED_JOBS,
    existingRecords: {},
    nowLabel: 'Nov 10, 2026'
  });

  assert.equal(initialRecords[1].currentStage, 'Applied');
  assert.equal(initialRecords[2].currentStage, 'Applied');
  assert.equal(initialRecords[1].history.length, 1);

  // Advance Job 1 (TCS) to Interviewing, then Offer Received with custom note
  const afterInterview = updateApplicationStageRecord({
    existingRecords: initialRecords,
    job: SEED_JOBS[0],
    nextStage: 'Interviewing',
    timestamp: 'Nov 11, 2026'
  });
  assert.equal(afterInterview[1].currentStage, 'Interviewing');
  assert.equal(afterInterview[1].history.length, 2);

  const afterOffer = updateApplicationStageRecord({
    existingRecords: afterInterview,
    job: SEED_JOBS[0],
    nextStage: 'Offer Received',
    customNote: 'Cleared final HR round and received 7.5 LPA offer letter!',
    timestamp: 'Nov 12, 2026'
  });
  assert.equal(afterOffer[1].currentStage, 'Offer Received');
  assert.equal(afterOffer[1].history.length, 3);
  assert.equal(
    afterOffer[1].history[0].note,
    'Cleared final HR round and received 7.5 LPA offer letter!'
  );

  const summary = computeCareerTimelineSummary({
    jobs: SEED_JOBS,
    appliedJobIds: [1, 2],
    stageRecords: afterOffer,
    stageFilter: 'ALL'
  });

  assert.equal(summary.totalTracked, 2);
  assert.equal(summary.stageCounts['Offer Received'], 1);
  assert.equal(summary.stageCounts.Applied, 1);
  assert.equal(summary.offerConversionRate, 50);

  const offerOnly = computeCareerTimelineSummary({
    jobs: SEED_JOBS,
    appliedJobIds: [1, 2],
    stageRecords: afterOffer,
    stageFilter: 'Offer Received'
  });
  assert.equal(offerOnly.entries.length, 1);
  assert.equal(offerOnly.entries[0].company, 'TCS');
});

test('enableEmailNotifications in UserSettings controls application status change alerts', () => {
  assert.equal(DEFAULT_USER_SETTINGS.enableEmailNotifications, true);

  const enabledAlert = formatApplicationStatusNotification({
    jobTitle: 'Software Engineer',
    company: 'TCS',
    nextStage: 'Interviewing',
    enableEmailNotifications: true,
    userEmail: 'harishragavendran56@gmail.com'
  });
  assert.ok(enabledAlert.includes('Email alert sent to harishragavendran56@gmail.com'));

  const mutedAlert = formatApplicationStatusNotification({
    jobTitle: 'Software Engineer',
    company: 'TCS',
    nextStage: 'Offer Received',
    enableEmailNotifications: false,
    userEmail: 'harishragavendran56@gmail.com'
  });
  assert.ok(mutedAlert.includes('Email alerts muted in Settings'));
});

test('computeInterviewCountdown and updateInterviewScheduleRecord calculate live interview countdowns accurately', () => {
  const baseNow = new Date('2026-11-12T10:00:00.000Z').getTime();
  // 2 days, 4 hours, 30 minutes, 15 seconds ahead = 189015 seconds
  const scheduledIso = new Date(baseNow + 189015 * 1000).toISOString();

  const countdown = computeInterviewCountdown(scheduledIso, baseNow);
  assert.equal(countdown.days, 2);
  assert.equal(countdown.hours, 4);
  assert.equal(countdown.minutes, 30);
  assert.equal(countdown.seconds, 15);
  assert.equal(countdown.isPast, false);
  assert.equal(countdown.urgency, 'upcoming');
  assert.equal(countdown.formattedCountdown, '02d : 04h : 30m : 15s');

  // Imminent interview (< 24h)
  const imminentIso = getDefaultInterviewIso(baseNow, 6);
  const imminentCountdown = computeInterviewCountdown(imminentIso, baseNow);
  assert.equal(imminentCountdown.days, 0);
  assert.equal(imminentCountdown.hours, 6);
  assert.equal(imminentCountdown.urgency, 'imminent');

  // Updating interview schedule record
  const initialRecords = syncApplicationStageRecords({
    appliedJobIds: [1],
    jobs: SEED_JOBS,
    existingRecords: {},
    baseNowMs: baseNow
  });
  const updatedRecords = updateInterviewScheduleRecord({
    existingRecords: initialRecords,
    job: SEED_JOBS[0],
    interviewScheduledAt: scheduledIso,
    interviewRoundTitle: 'System Design & Architecture Round'
  });

  assert.equal(updatedRecords[1].currentStage, 'Interviewing');
  assert.equal(updatedRecords[1].interviewScheduledAt, scheduledIso);
  assert.equal(updatedRecords[1].interviewRoundTitle, 'System Design & Architecture Round');
});

test('generateMockInterviewQuestions and evaluateMockInterviewAnswer generate tailored practice questions and score answers', () => {
  assert.equal(deriveStudentProficiencyTier(85), 'Advanced');
  assert.equal(deriveStudentProficiencyTier(75), 'Intermediate');
  assert.equal(deriveStudentProficiencyTier(50), 'Beginner');

  const questions = generateMockInterviewQuestions({
    job: SEED_JOBS[0], // Software Engineer @ TCS (java,springboot,sql)
    proficiencyTier: 'Intermediate',
    userSkills: DEFAULT_USER_PROFILE.skills,
    variantIndex: 0
  });

  assert.equal(questions.length, 4);
  assert.equal(questions[0].difficulty, 'Intermediate');
  assert.equal(questions[0].skillFocus, 'Java');
  assert.equal(questions[1].skillFocus, 'Spring Boot');
  assert.equal(questions[2].category, 'System Design');
  assert.equal(questions[3].category, 'Behavioral');

  const evaluation = evaluateMockInterviewAnswer(
    questions[0],
    'Java HashMap computes a bucket index using hashCode() and equals(), resolving collision chains by converting them to a Red-Black Tree.'
  );
  assert.ok(evaluation.score >= 80);
  assert.ok(evaluation.matchedKeywords.includes('hashcode'));
  assert.ok(evaluation.matchedKeywords.includes('red-black tree'));
});

test('addInterviewFeedbackRecord logs structured post-interview feedback cards and preserves them across application stages', () => {
  const initialRecords = syncApplicationStageRecords({
    appliedJobIds: [1],
    jobs: SEED_JOBS,
    existingRecords: {},
    nowLabel: 'Nov 10, 2026'
  });

  const interviewingRecords = updateApplicationStageRecord({
    existingRecords: initialRecords,
    job: SEED_JOBS[0],
    nextStage: 'Interviewing',
    timestamp: 'Nov 11, 2026'
  });

  const withFeedback = addInterviewFeedbackRecord({
    existingRecords: interviewingRecords,
    job: SEED_JOBS[0],
    roundTitle: 'Round 1: Java & Spring Boot Technical Assessment',
    interviewerOrFormat: 'Senior Backend Architect · 45m Live Coding',
    questionsAsked: 'Spring Boot @Transactional isolation levels, MySQL indexing, JVM GC tuning',
    keyTakeaways: 'Explained AOP proxy transactions clearly; brush up on composite index left-prefix rule before Round 2.',
    confidenceRating: 'Strong',
    timestamp: 'Nov 12, 2026'
  });

  assert.equal(withFeedback[1].interviewFeedbackNotes?.length, 1);
  assert.equal(
    withFeedback[1].interviewFeedbackNotes?.[0].roundTitle,
    'Round 1: Java & Spring Boot Technical Assessment'
  );
  assert.equal(withFeedback[1].interviewFeedbackNotes?.[0].confidenceRating, 'Strong');

  // Verify feedback cards remain preserved even after advancing to Offer Received
  const afterOffer = updateApplicationStageRecord({
    existingRecords: withFeedback,
    job: SEED_JOBS[0],
    nextStage: 'Offer Received',
    timestamp: 'Nov 14, 2026'
  });

  const summary = computeCareerTimelineSummary({
    jobs: SEED_JOBS,
    appliedJobIds: [1],
    stageRecords: afterOffer
  });

  assert.equal(summary.entries[0].interviewFeedbackNotes.length, 1);
  assert.equal(
    summary.entries[0].interviewFeedbackNotes[0].questionsAsked,
    'Spring Boot @Transactional isolation levels, MySQL indexing, JVM GC tuning'
  );
});

test('updateExpectedSalarySettings updates Minimum Expected CTC and Maximum Expected CTC sliders while preserving min <= max invariant', () => {
  const base = { ...DEFAULT_USER_SETTINGS }; // min: 7.5, max: 16.0
  const updatedMin = updateExpectedSalarySettings(base, 'min', 9.5);
  assert.equal(updatedMin.expectedSalaryMinLpa, 9.5);
  assert.equal(updatedMin.expectedSalaryMaxLpa, 16.0);

  // Pushing min above current max automatically raises max to maintain min <= max
  const pushedMin = updateExpectedSalarySettings(updatedMin, 'min', 18.0);
  assert.equal(pushedMin.expectedSalaryMinLpa, 18.0);
  assert.equal(pushedMin.expectedSalaryMaxLpa, 18.0);

  // Lowering max below current min automatically lowers min to maintain min <= max
  const loweredMax = updateExpectedSalarySettings(pushedMin, 'max', 12.5);
  assert.equal(loweredMax.expectedSalaryMinLpa, 12.5);
  assert.equal(loweredMax.expectedSalaryMaxLpa, 12.5);
});

test('computeProfileSkillGapAnalysis highlights top 3 missing skills required by saved job roles and suggests relevant courses', () => {
  const gapSummary = computeProfileSkillGapAnalysis({
    userSkills: DEFAULT_USER_PROFILE.skills, // java, springboot, react, javascript, html, css, mysql
    jobs: SEED_JOBS,
    savedJobIds: [1, 2], // TCS (java,springboot,sql) + Infosys (java,springboot,hibernate)
    courses: SEED_COURSES,
    enrolledCourseIds: [3, 5],
    savedCertIds: [1, 7]
  });

  assert.equal(gapSummary.savedRolesCount, 2);
  assert.equal(gapSummary.topMissingSkills.length, 3);

  // Top 2 missing skills from saved roles [1, 2] must be 'sql' and 'hibernate'
  const keys = gapSummary.topMissingSkills.map((s) => s.skillKey);
  assert.ok(keys.includes('sql'));
  assert.ok(keys.includes('hibernate'));

  // Each missing skill must include suggested learning courses from SEED_COURSES
  for (const item of gapSummary.topMissingSkills) {
    assert.ok(item.suggestedCourses.length >= 1);
    assert.ok(item.gapPoints > 0);
  }
});

test('toggleThemeSetting switches userSettings.theme between light and dark while preserving other preferences', () => {
  const initial = { ...DEFAULT_USER_SETTINGS, expectedSalaryMinLpa: 10, expectedSalaryMaxLpa: 22 };
  assert.equal(initial.theme, 'light');

  const darkSettings = toggleThemeSetting(initial);
  assert.equal(darkSettings.theme, 'dark');
  assert.equal(darkSettings.expectedSalaryMinLpa, 10);
  assert.equal(darkSettings.expectedSalaryMaxLpa, 22);

  const lightSettings = toggleThemeSetting(darkSettings);
  assert.equal(lightSettings.theme, 'light');
});

test('getThemeToggleMeta returns accurate accessible labels and visual feedback strings for light and dark modes', () => {
  const lightMeta = getThemeToggleMeta('light');
  assert.equal(lightMeta.isDark, false);
  assert.equal(lightMeta.currentLabel, 'Light');
  assert.equal(lightMeta.nextModeLabel, 'Dark Mode');
  assert.match(lightMeta.ariaLabel, /Light Mode active/i);
  assert.match(lightMeta.ariaLabel, /Switch to Dark Mode/i);
  assert.equal(lightMeta.feedbackBadgeText, 'Light Mode Active');

  const darkMeta = getThemeToggleMeta('dark');
  assert.equal(darkMeta.isDark, true);
  assert.equal(darkMeta.currentLabel, 'Dark');
  assert.equal(darkMeta.nextModeLabel, 'Light Mode');
  assert.match(darkMeta.ariaLabel, /Dark Mode active/i);
  assert.match(darkMeta.ariaLabel, /Switch to Light Mode/i);
  assert.equal(darkMeta.feedbackBadgeText, 'Dark Mode Active');
});

test('computeProfileSkillProficiencyList and updateSkillProficiencyMap dynamically influence computeProfileSkillGapAnalysis', () => {
  // Set 'java' to 'Beginner' (45%) and 'springboot' to 'Advanced' (92%)
  let overrides = updateSkillProficiencyMap({}, 'java', 'Beginner');
  overrides = updateSkillProficiencyMap(overrides, 'springboot', 'Advanced');

  assert.equal(overrides.java, 45);
  assert.equal(overrides.springboot, 92);

  const trackerList = computeProfileSkillProficiencyList({
    userSkills: DEFAULT_USER_PROFILE.skills,
    jobs: SEED_JOBS,
    savedJobIds: [1], // TCS Software Engineer (java,springboot,sql)
    customProficiencyOverrides: overrides
  });

  const javaItem = trackerList.find((i) => i.skillKey === 'java');
  const springItem = trackerList.find((i) => i.skillKey === 'springboot');
  assert.equal(javaItem?.proficiency, 45);
  assert.equal(javaItem?.tier, 'Beginner');
  assert.equal(springItem?.proficiency, 92);
  assert.equal(springItem?.tier, 'Advanced');

  // Verify Skill Gap Analysis reflects the manual proficiency changes:
  // 'java' now has a 40% gap (45% vs 85% target) so it enters topMissingSkills,
  // while 'springboot' (92% vs 88% target) is no longer a proficiency gap!
  const gapSummary = computeProfileSkillGapAnalysis({
    userSkills: DEFAULT_USER_PROFILE.skills,
    jobs: SEED_JOBS,
    savedJobIds: [1],
    courses: SEED_COURSES,
    customProficiencyOverrides: overrides
  });

  const gapKeys = gapSummary.topMissingSkills.map((g) => g.skillKey);
  assert.ok(gapKeys.includes('java'));
  assert.ok(!gapKeys.includes('springboot'));
});

test('computeResumeHealthScore calculates percentage score from skills, education, and certifications and provides actionable tips', () => {
  // Default profile state: 7 skills, degree without CGPA, 2 tracked certifications, 2 enrolled courses
  const initialHealth = computeResumeHealthScore({
    name: DEFAULT_USER_PROFILE.name,
    email: DEFAULT_USER_PROFILE.email,
    headline: DEFAULT_USER_PROFILE.headline,
    location: DEFAULT_USER_PROFILE.location,
    summary: DEFAULT_USER_PROFILE.summary,
    education: DEFAULT_USER_PROFILE.education,
    skills: DEFAULT_USER_PROFILE.skills,
    savedCertIds: [1, 7],
    enrolledCourseIds: [3, 5]
  });

  // 20 (Profile) + 26 (Skills) + 18 (Education) + 20 (Certifications) = 84%
  assert.equal(initialHealth.overallScore, 84);
  assert.equal(initialHealth.gradeLabel, 'Strong Profile');
  assert.equal(initialHealth.pillars.length, 4);
  assert.equal(initialHealth.actionableTips.length, 3);
  assert.equal(initialHealth.actionableTips[0].category, 'Education');
  assert.equal(initialHealth.actionableTips[0].impactPoints, 7);

  // After applying all 3 actionable tips: CGPA added to education, 3rd certification tracked, 8th skill ('sql') added
  const completedHealth = computeResumeHealthScore({
    name: DEFAULT_USER_PROFILE.name,
    email: DEFAULT_USER_PROFILE.email,
    headline: DEFAULT_USER_PROFILE.headline,
    location: DEFAULT_USER_PROFILE.location,
    summary: DEFAULT_USER_PROFILE.summary,
    education:
      'B.E. in Computer Science & Engineering · Anna University, Chennai (2023–2027) · CGPA: 8.8/10 · Coursework: DSA, DBMS & OS',
    skills: [...DEFAULT_USER_PROFILE.skills, 'sql'],
    savedCertIds: [1, 7, 2],
    enrolledCourseIds: [3, 5]
  });

  assert.equal(completedHealth.overallScore, 100);
  assert.equal(completedHealth.gradeLabel, 'Recruiter-Ready');
  assert.equal(completedHealth.actionableTips.length, 0);
});

test('computePersonalizedSkillAlerts surfaces job and internship recommendations based on recently added or progressed skills', () => {
  // Scenario 1: Default skills, with 'springboot' progressed to Advanced (92%)
  const alerts = computePersonalizedSkillAlerts({
    userSkills: DEFAULT_USER_PROFILE.skills, // ['java', 'springboot', 'react', 'javascript', 'html', 'css', 'mysql']
    skillProficiencies: { springboot: 92 },
    jobs: SEED_JOBS,
    internships: SEED_INTERNSHIPS,
    appliedJobIds: [1],
    appliedInternshipIds: []
  });

  assert.ok(alerts.alertGroups.length > 0);
  assert.ok(alerts.recommendedJobsCount > 0);
  assert.ok(alerts.recommendedInternshipsCount > 0);

  // First group should be the progressed skill 'springboot'
  const firstGroup = alerts.alertGroups[0];
  assert.equal(firstGroup.skillKey, 'springboot');
  assert.equal(firstGroup.reason, 'progressed_advanced');
  assert.equal(firstGroup.proficiency, 92);
  assert.ok(firstGroup.recommendations.length >= 1);

  // Verify recommendations contain both jobs and internships
  const jobRec = firstGroup.recommendations.find((r) => r.type === 'job');
  const internRec = firstGroup.recommendations.find((r) => r.type === 'internship');
  assert.ok(jobRec);
  assert.ok(internRec);

  // Scenario 2: When user adds a new skill 'python' to profile
  const alertsWithPython = computePersonalizedSkillAlerts({
    userSkills: [...DEFAULT_USER_PROFILE.skills, 'python'],
    skillProficiencies: {},
    jobs: SEED_JOBS,
    internships: SEED_INTERNSHIPS
  });

  // Recently added 'python' should appear prominently as 'recent_addition'
  const pythonGroup = alertsWithPython.alertGroups.find((g) => g.skillKey === 'python');
  assert.ok(pythonGroup);
  assert.equal(pythonGroup?.reason, 'recent_addition');
  assert.ok(pythonGroup?.recommendations.some((r) => r.company === 'Google India' || r.company === 'HCL'));
});

test('importLinkedInProfileData merges work history, professional summary, and skills into user profile', () => {
  const initialProfile = {
    ...DEFAULT_USER_PROFILE,
    linkedInConnected: false,
    workHistory: []
  };

  // 1. Import LinkedIn data
  const updatedProfile = importLinkedInProfileData(initialProfile, {
    headline: SEED_LINKEDIN_HEADLINE,
    summary: SEED_LINKEDIN_PROFILE_SUMMARY,
    workHistory: SEED_LINKEDIN_WORK_HISTORY,
    skills: ['docker', 'rest-api']
  });

  assert.equal(updatedProfile.linkedInConnected, true);
  assert.equal(updatedProfile.headline, SEED_LINKEDIN_HEADLINE);
  assert.equal(updatedProfile.summary, SEED_LINKEDIN_PROFILE_SUMMARY);
  assert.equal(updatedProfile.workHistory?.length, 2);
  assert.equal(updatedProfile.workHistory?.[0].company, 'TechCorp India');
  assert.equal(updatedProfile.workHistory?.[0].title, 'Software Engineering Intern');
  assert.equal(updatedProfile.workHistory?.[0].importedFrom, 'LinkedIn');
  assert.ok(updatedProfile.skills.includes('docker'));
  assert.ok(updatedProfile.skills.includes('rest-api'));
  assert.ok(updatedProfile.skills.includes('java')); // Preserved original skills
  assert.ok(updatedProfile.lastLinkedInSync);

  // 2. formatWorkExperienceDuration handles current and past roles
  const currentDuration = formatWorkExperienceDuration(updatedProfile.workHistory![0]);
  assert.equal(currentDuration, 'Jan 2024 – Present');

  const pastDuration = formatWorkExperienceDuration(updatedProfile.workHistory![1]);
  assert.equal(pastDuration, 'Jun 2023 – Dec 2023');

  // 3. Re-importing updates existing company+title entries without duplication
  const reimported = importLinkedInProfileData(updatedProfile, {
    workHistory: [
      {
        id: 'exp-linkedin-1',
        title: 'Software Engineering Intern',
        company: 'TechCorp India',
        location: 'Chennai (Hybrid)',
        startDate: 'Jan 2024',
        endDate: 'Present',
        current: true,
        description: 'Updated description with microservices benchmarks.',
        skillsUsed: ['java', 'springboot', 'mysql', 'docker', 'kubernetes'],
        importedFrom: 'LinkedIn'
      }
    ]
  });

  assert.equal(reimported.workHistory?.length, 2);
  assert.equal(
    reimported.workHistory?.[0].description,
    'Updated description with microservices benchmarks.'
  );

  // 4. Disconnect LinkedIn retains work history by default
  const disconnected = disconnectLinkedInProfile(reimported, true);
  assert.equal(disconnected.linkedInConnected, false);
  assert.equal(disconnected.workHistory?.length, 2);
  assert.equal(disconnected.lastLinkedInSync, undefined);
});

test('generateLinkedInShareText and buildLinkedInShareUrl format broadcast posts and valid LinkedIn share URLs for jobs and internships', () => {
  // 1. Job broadcast post
  const jobPayload = {
    title: 'Software Engineer',
    company: 'TCS',
    type: 'job',
    location: 'Chennai',
    ctc: '7.5 LPA',
    skills: 'java,springboot,sql'
  };

  const jobShareText = generateLinkedInShareText(jobPayload);
  assert.ok(jobShareText.includes('Software Engineer'));
  assert.ok(jobShareText.includes('TCS'));
  assert.ok(jobShareText.includes('Chennai'));
  assert.ok(jobShareText.includes('7.5 LPA'));
  assert.ok(jobShareText.includes('#JobNova'));
  assert.ok(jobShareText.includes('#TCS'));
  assert.ok(jobShareText.includes('#SoftwareEngineering'));

  const jobShareUrl = buildLinkedInShareUrl(jobPayload);
  assert.ok(jobShareUrl.startsWith('https://www.linkedin.com/sharing/share-offsite/'));
  assert.ok(jobShareUrl.includes(encodeURIComponent('role=Software+Engineer')));
  assert.ok(jobShareUrl.includes(encodeURIComponent('company=TCS')));

  // 2. Internship broadcast post
  const internPayload = {
    title: 'Web Development Intern',
    company: 'TechNova',
    type: 'internship',
    location: 'Remote',
    stipend: '₹15,000 / mo',
    skills: 'HTML,CSS,JavaScript'
  };

  const internShareText = generateLinkedInShareText(internPayload);
  assert.ok(internShareText.includes('Web Development Intern'));
  assert.ok(internShareText.includes('TechNova'));
  assert.ok(internShareText.includes('Remote'));
  assert.ok(internShareText.includes('₹15,000 / mo'));
  assert.ok(internShareText.includes('#StudentInternship'));
  assert.ok(internShareText.includes('#TechNova'));

  const internShareUrl = buildLinkedInShareUrl(internPayload);
  assert.ok(internShareUrl.startsWith('https://www.linkedin.com/sharing/share-offsite/'));
  assert.ok(internShareUrl.includes(encodeURIComponent('role=Web+Development+Intern')));

  // 3. Multi-channel Share Links (Twitter, WhatsApp, Email, LinkedIn)
  const shareLinks = buildJobShareLinks(jobPayload);
  assert.ok(shareLinks.targetUrl.startsWith('https://jobnova.career/'));
  assert.ok(shareLinks.twitterUrl.startsWith('https://twitter.com/intent/tweet'));
  assert.ok(shareLinks.twitterUrl.includes('Software+Engineer'));
  assert.ok(shareLinks.whatsappUrl.startsWith('https://wa.me/'));
  assert.ok(shareLinks.whatsappUrl.includes('TCS'));
  assert.ok(shareLinks.emailUrl.startsWith('mailto:?subject='));
  assert.ok(shareLinks.emailUrl.includes('Software%20Engineer%20Opportunity%20at%20TCS'));
  assert.ok(shareLinks.linkedinUrl.startsWith('https://www.linkedin.com/sharing/share-offsite/'));
});

test('computeLinkedInConnectionHealth evaluates connection health, relative last sync time, and disconnected states', () => {
  const fixedNow = new Date('2026-11-12T14:00:00.000Z');

  // Case 1: Disconnected profile
  const disconnectedHealth = computeLinkedInConnectionHealth({
    connected: false,
    now: fixedNow
  });
  assert.equal(disconnectedHealth.status, 'Disconnected');
  assert.equal(disconnectedHealth.statusLabel, 'Disconnected');
  assert.equal(disconnectedHealth.displayText, 'Disconnected');
  assert.equal(disconnectedHealth.relativeTime, 'Never');
  assert.equal(disconnectedHealth.healthScorePct, 0);
  assert.equal(disconnectedHealth.isOnline, false);

  // Case 2: Connected, synced 2 hours ago
  const twoHoursAgoIso = new Date('2026-11-12T12:00:00.000Z').toISOString();
  const healthyTwoHours = computeLinkedInConnectionHealth({
    connected: true,
    lastSyncedIso: twoHoursAgoIso,
    now: fixedNow
  });
  assert.equal(healthyTwoHours.status, 'Healthy');
  assert.equal(healthyTwoHours.statusLabel, 'Optimal');
  assert.equal(healthyTwoHours.displayText, 'Last Synced: 2 hours ago');
  assert.equal(healthyTwoHours.relativeTime, '2 hours ago');
  assert.equal(healthyTwoHours.healthScorePct, 100);
  assert.equal(healthyTwoHours.isOnline, true);
  assert.ok(healthyTwoHours.badgeClass.includes('emerald'));

  // Case 3: Connected, synced just now (<45 seconds ago)
  const justNowIso = new Date('2026-11-12T13:59:30.000Z').toISOString();
  const healthyJustNow = computeLinkedInConnectionHealth({
    connected: true,
    lastSyncedIso: justNowIso,
    now: fixedNow
  });
  assert.equal(healthyJustNow.status, 'Healthy');
  assert.equal(healthyJustNow.displayText, 'Last Synced: Just now');
  assert.equal(healthyJustNow.healthScorePct, 100);

  // Case 4: Connected, synced 3 days ago (stale >24h)
  const threeDaysAgoIso = new Date('2026-11-09T14:00:00.000Z').toISOString();
  const staleHealth = computeLinkedInConnectionHealth({
    connected: true,
    lastSyncedIso: threeDaysAgoIso,
    now: fixedNow
  });
  assert.equal(staleHealth.status, 'Stale');
  assert.equal(staleHealth.statusLabel, 'Sync Stale');
  assert.equal(staleHealth.displayText, 'Last Synced: 3 days ago');
  assert.ok(staleHealth.healthScorePct < 100);
  assert.ok(staleHealth.badgeClass.includes('amber'));
  assert.ok(staleHealth.actionRecommendation.includes('Re-sync'));

  // Case 5: Connected but missing lastSyncedIso
  const defaultSynced = computeLinkedInConnectionHealth({
    connected: true,
    now: fixedNow
  });
  assert.equal(defaultSynced.status, 'Healthy');
  assert.equal(defaultSynced.displayText, 'Last Synced: Recently');
  assert.equal(defaultSynced.healthScorePct, 100);
});

test('buildMockLinkedInProfilePayload and applyLinkedInSyncPayload sync work history, skills, and education cleanly', () => {
  const payload = buildMockLinkedInProfilePayload();
  assert.equal(payload.provider, 'LinkedIn');
  assert.equal(payload.education, SEED_LINKEDIN_EDUCATION);
  assert.deepEqual(payload.skills, SEED_LINKEDIN_SKILLS);
  assert.equal(payload.workHistory.length, 2);

  const startingProfile = {
    ...DEFAULT_USER_PROFILE,
    skills: ['java', 'springboot'],
    workHistory: [],
    education: 'B.E. in Computer Science'
  };

  const firstSync = applyLinkedInSyncPayload(startingProfile, payload);
  assert.equal(firstSync.user.linkedInConnected, true);
  assert.equal(firstSync.user.workHistory?.length, 2);
  assert.equal(firstSync.syncedRolesCount, 2);
  assert.equal(firstSync.addedSkillsCount, SEED_LINKEDIN_SKILLS.length);
  assert.equal(firstSync.educationUpdated, true);
  assert.equal(firstSync.user.education, SEED_LINKEDIN_EDUCATION);
  assert.ok(firstSync.user.skills.includes('java'));
  for (const sk of SEED_LINKEDIN_SKILLS) {
    assert.ok(firstSync.user.skills.includes(sk));
  }
  assert.ok(firstSync.syncedFields.includes('workHistory'));
  assert.ok(firstSync.syncedFields.includes('skills'));
  assert.ok(firstSync.syncedFields.includes('education'));

  // Re-syncing is idempotent: no duplicate roles or duplicate skills
  const secondSync = applyLinkedInSyncPayload(firstSync.user, payload);
  assert.equal(secondSync.user.workHistory?.length, 2);
  assert.equal(secondSync.addedSkillsCount, 0);
  assert.equal(secondSync.educationUpdated, false);
});

test('computeProfileCompletionProgress and buildFinishProfileAiPrompt evaluate work history, skills, and education and generate targeted AI prompts', () => {
  // 1. Default profile: 0 work roles, 7 skills, education without CGPA/coursework -> 43%
  const initialCompletion = computeProfileCompletionProgress({
    workHistory: DEFAULT_USER_PROFILE.workHistory,
    skills: DEFAULT_USER_PROFILE.skills,
    education: DEFAULT_USER_PROFILE.education
  });
  assert.equal(initialCompletion.percentage, 43);
  assert.equal(initialCompletion.completedSectionsCount, 0);
  assert.deepEqual(initialCompletion.missingSectionLabels, [
    'Work History',
    'Skills',
    'Education'
  ]);

  const prompt = buildFinishProfileAiPrompt(initialCompletion, DEFAULT_USER_PROFILE);
  assert.ok(prompt.includes('43%'));
  assert.ok(prompt.includes('Work History'));
  assert.ok(prompt.includes('Skills'));
  assert.ok(prompt.includes('Education'));

  const assistantReply = matchOfflineCareerAssistant(prompt);
  assert.ok(assistantReply.includes('Work History'));
  assert.ok(assistantReply.includes('Skills'));
  assert.ok(assistantReply.includes('Education'));

  // 2. Empty profile -> 0%
  const emptyCompletion = computeProfileCompletionProgress({
    workHistory: [],
    skills: [],
    education: ''
  });
  assert.equal(emptyCompletion.percentage, 0);

  // 3. Fully synced LinkedIn profile -> 100%
  const synced = applyLinkedInSyncPayload(DEFAULT_USER_PROFILE, buildMockLinkedInProfilePayload());
  const fullCompletion = computeProfileCompletionProgress({
    workHistory: synced.user.workHistory,
    skills: synced.user.skills,
    education: synced.user.education
  });
  assert.equal(fullCompletion.percentage, 100);
  assert.equal(fullCompletion.completedSectionsCount, 3);
  assert.deepEqual(fullCompletion.missingSectionLabels, []);
});

test('normalizeSavedJobIds and filterJobsList manage bookmarked jobs separately from applications', () => {
  assert.deepEqual(normalizeSavedJobIds([2, 5, 2, -1, 'invalid', 8, 0]), [2, 5, 8]);
  assert.deepEqual(normalizeSavedJobIds(null), []);

  // Toggling bookmark IDs leaves applied IDs untouched
  const appliedIds = [1];
  let savedIds = normalizeSavedJobIds([]);
  savedIds = toggleItemSelection(savedIds, 3);
  savedIds = toggleItemSelection(savedIds, 5);
  assert.deepEqual(savedIds, [3, 5]);
  assert.deepEqual(appliedIds, [1]);

  // Saved Jobs filter returns only bookmarked jobs matching query/location
  const allSaved = filterJobsList(SEED_JOBS, {
    query: '',
    locationFilter: 'ALL',
    onlySaved: true,
    savedJobIds: savedIds
  });
  assert.deepEqual(
    allSaved.map((j) => j.id),
    [3, 5]
  );

  const savedInBengaluru = filterJobsList(SEED_JOBS, {
    query: 'python',
    locationFilter: 'Bengaluru',
    onlySaved: true,
    savedJobIds: savedIds
  });
  assert.deepEqual(
    savedInBengaluru.map((j) => j.id),
    [5]
  );

  // Toggling off removes job cleanly
  savedIds = toggleItemSelection(savedIds, 3);
  const afterRemove = filterJobsList(SEED_JOBS, {
    query: '',
    locationFilter: 'ALL',
    onlySaved: true,
    savedJobIds: savedIds
  });
  assert.deepEqual(
    afterRemove.map((j) => j.id),
    [5]
  );
});
