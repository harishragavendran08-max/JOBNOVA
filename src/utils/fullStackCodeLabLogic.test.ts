import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeMockMySqlQuery,
  evaluateFullStackChallenge,
  MOCK_MYSQL_TABLES,
  MYSQL_SCHEMAS,
  PRESET_SQL_QUERIES,
  FULL_STACK_CHALLENGES,
  SPRING_BOOT_ANNOTATION_GUIDE
} from './fullStackCodeLabLogic';

test('executeMockMySqlQuery handles SHOW TABLES and DESCRIBE schema inspection', () => {
  const showResult = executeMockMySqlQuery('SHOW TABLES;');
  assert.equal(showResult.error, undefined);
  assert.equal(showResult.queryType, 'SHOW');
  assert.equal(showResult.rowCount, 4);
  assert.deepEqual(showResult.columns, ['Tables_in_jobnova_db']);

  const descResult = executeMockMySqlQuery('DESCRIBE jobs;');
  assert.equal(descResult.error, undefined);
  assert.equal(descResult.queryType, 'DESCRIBE');
  assert.equal(descResult.rowCount, 7);
  assert.ok(descResult.rows.some((r) => r[0] === 'ctc_lpa'));
});

test('executeMockMySqlQuery executes SELECT with WHERE, ORDER BY, and LIMIT accurately', () => {
  const query = 'SELECT id, title, company, ctc_lpa FROM jobs WHERE ctc_lpa >= 8.5 ORDER BY ctc_lpa DESC LIMIT 3;';
  const result = executeMockMySqlQuery(query);

  assert.equal(result.error, undefined);
  assert.equal(result.queryType, 'SELECT');
  assert.equal(result.rowCount, 3);
  assert.deepEqual(result.columns, ['id', 'title', 'company', 'ctc_lpa']);
  // Top CTC should be Google India (28.0) or Amazon India (24.0)
  assert.equal(result.rows[0][2], 'Google India');
  assert.equal(result.rows[0][3], 28.0);
  assert.equal(result.rows[1][2], 'Amazon India');
  assert.equal(result.rows[1][3], 24.0);
});

test('executeMockMySqlQuery handles INNER JOIN between applications and jobs', () => {
  const joinQuery = 'SELECT applications.id, jobs.title, jobs.company, applications.stage FROM applications JOIN jobs ON applications.job_id = jobs.id;';
  const result = executeMockMySqlQuery(joinQuery);

  assert.equal(result.error, undefined);
  assert.equal(result.queryType, 'SELECT');
  assert.equal(result.rowCount, MOCK_MYSQL_TABLES.applications.length);
  assert.ok(result.columns.includes('jobs.title') || result.columns.includes('title'));
});

test('executeMockMySqlQuery filters skills table with LIKE operator', () => {
  const sql = "SELECT title, company, skills FROM jobs WHERE skills LIKE '%springboot%' ORDER BY ctc_lpa DESC;";
  const result = executeMockMySqlQuery(sql);

  assert.equal(result.error, undefined);
  assert.equal(result.rowCount, 3); // TCS, Infosys, Cognizant
  assert.ok(result.rows.every((row) => String(row[2]).includes('springboot')));
});

test('evaluateFullStackChallenge grades code against solution keywords accurately', () => {
  const javaChallenge = FULL_STACK_CHALLENGES.find((c) => c.technology === 'Java')!;
  const goodJavaCode = `
    public List<String> getTopCompanies(List<Job> jobs) {
      return jobs.stream().filter(j -> j.getCtcLpa() >= 8.0).map(Job::getCompany).collect(Collectors.toList());
    }
  `;
  const resultPass = evaluateFullStackChallenge(javaChallenge, goodJavaCode);
  assert.equal(resultPass.passed, true);
  assert.ok(resultPass.score >= 80);

  const incompleteCode = 'function test() { return 42; }';
  const resultFail = evaluateFullStackChallenge(javaChallenge, incompleteCode);
  assert.equal(resultFail.passed, false);
  assert.ok(resultFail.missingKeywords.length > 0);
});

test('SPRING_BOOT_ANNOTATION_GUIDE covers all 5 core Spring Boot architectural annotations', () => {
  assert.equal(SPRING_BOOT_ANNOTATION_GUIDE.length, 5);
  const names = SPRING_BOOT_ANNOTATION_GUIDE.map((a) => a.name);
  assert.ok(names.includes('@SpringBootApplication'));
  assert.ok(names.includes('@RestController'));
  assert.ok(names.includes('@Transactional'));
  assert.ok(names.includes('@Repository'));
  assert.ok(names.includes('@CrossOrigin'));
});
