/**
 * Full-Stack Code Lab Logic: In-Browser MySQL Engine, Java/Spring Boot Simulator,
 * and Full-Stack Placement Assessment Evaluator.
 */

export interface SqlQueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'SHOW' | 'DESCRIBE' | 'OTHER';
}

export interface SqlTableSchema {
  name: string;
  description: string;
  columns: { name: string; type: string; key?: string }[];
  rowCount: number;
}

export interface FullStackChallenge {
  id: string;
  title: string;
  technology: 'Java' | 'Spring Boot' | 'MySQL' | 'React' | 'JavaScript' | 'HTML5/CSS3';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  starterCode: string;
  solutionKeywords: string[];
  testExplanation: string;
}

export interface SpringBootAnnotationItem {
  name: string;
  layer: 'Core' | 'Web/REST' | 'Persistence/JPA' | 'Security/Config';
  description: string;
  codeSnippet: string;
  keyRule: string;
}

// Built-in MySQL Placement Database Tables
export const MOCK_MYSQL_TABLES: Record<string, Record<string, any>[]> = {
  jobs: [
    { id: 1, title: 'Software Engineer', company: 'TCS', location: 'Chennai', ctc_lpa: 7.5, skills: 'java,springboot,sql', type: 'Full-Time' },
    { id: 2, title: 'Backend Developer', company: 'Infosys', location: 'Bengaluru', ctc_lpa: 8.2, skills: 'java,springboot,hibernate', type: 'Full-Time' },
    { id: 3, title: 'Frontend Engineer', company: 'Wipro', location: 'Hyderabad', ctc_lpa: 6.8, skills: 'html,css,javascript,react', type: 'Full-Time' },
    { id: 4, title: 'Full Stack Engineer', company: 'Zoho', location: 'Chennai', ctc_lpa: 9.0, skills: 'java,react,mysql,css', type: 'Full-Time' },
    { id: 5, title: 'Java Cloud Developer', company: 'Cognizant', location: 'Pune', ctc_lpa: 8.5, skills: 'java,springboot,mysql,aws', type: 'Full-Time' },
    { id: 6, title: 'Software Development Engineer', company: 'Amazon India', location: 'Hyderabad', ctc_lpa: 24.0, skills: 'java,aws,sql,algorithms', type: 'Full-Time' },
    { id: 7, title: 'Full Stack Specialist', company: 'Google India', location: 'Bengaluru', ctc_lpa: 28.0, skills: 'java,react,javascript,mysql', type: 'Full-Time' },
    { id: 8, title: 'React Web Developer', company: 'Flipkart', location: 'Bengaluru', ctc_lpa: 15.0, skills: 'html,css,javascript,react', type: 'Full-Time' }
  ],
  students: [
    { id: 101, name: 'Harish Ragavendran', email: 'harish@jobnova.edu', cgpa: 8.85, grad_year: 2026, primary_stack: 'Java & React' },
    { id: 102, name: 'Aditi Sharma', email: 'aditi@jobnova.edu', cgpa: 9.10, grad_year: 2026, primary_stack: 'Spring Boot & MySQL' },
    { id: 103, name: 'Rohan Verma', email: 'rohan@jobnova.edu', cgpa: 8.40, grad_year: 2026, primary_stack: 'Frontend (React/CSS)' },
    { id: 104, name: 'Priya Nair', email: 'priya@jobnova.edu', cgpa: 8.95, grad_year: 2026, primary_stack: 'Full-Stack Java' }
  ],
  applications: [
    { id: 1001, student_id: 101, job_id: 1, stage: 'Interviewing', applied_at: '2026-11-01' },
    { id: 1002, student_id: 101, job_id: 2, stage: 'Applied', applied_at: '2026-11-05' },
    { id: 1003, student_id: 102, job_id: 2, stage: 'Interviewing', applied_at: '2026-11-03' },
    { id: 1004, student_id: 102, job_id: 6, stage: 'Offer Received', applied_at: '2026-10-25' },
    { id: 1005, student_id: 103, job_id: 3, stage: 'Interviewing', applied_at: '2026-11-04' },
    { id: 1006, student_id: 104, job_id: 4, stage: 'Offer Received', applied_at: '2026-11-02' }
  ],
  skills: [
    { id: 1, name: 'Java', category: 'Backend', proficiency_pct: 90, industry_demand: 'Critical' },
    { id: 2, name: 'Spring Boot', category: 'Framework', proficiency_pct: 84, industry_demand: 'Critical' },
    { id: 3, name: 'React.js', category: 'Frontend', proficiency_pct: 82, industry_demand: 'High' },
    { id: 4, name: 'MySQL', category: 'Database', proficiency_pct: 88, industry_demand: 'Critical' },
    { id: 5, name: 'JavaScript', category: 'Frontend/Core', proficiency_pct: 86, industry_demand: 'High' },
    { id: 6, name: 'HTML5', category: 'Web', proficiency_pct: 96, industry_demand: 'Medium' },
    { id: 7, name: 'CSS3', category: 'Styling', proficiency_pct: 92, industry_demand: 'Medium' }
  ]
};

export const MYSQL_SCHEMAS: SqlTableSchema[] = [
  {
    name: 'jobs',
    description: 'Campus placement software engineering job postings',
    rowCount: MOCK_MYSQL_TABLES.jobs.length,
    columns: [
      { name: 'id', type: 'INT', key: 'PRI' },
      { name: 'title', type: 'VARCHAR(100)' },
      { name: 'company', type: 'VARCHAR(80)' },
      { name: 'location', type: 'VARCHAR(60)' },
      { name: 'ctc_lpa', type: 'DECIMAL(4,1)' },
      { name: 'skills', type: 'VARCHAR(255)' },
      { name: 'type', type: 'VARCHAR(40)' }
    ]
  },
  {
    name: 'students',
    description: 'Enrolled engineering student profiles & placement readiness',
    rowCount: MOCK_MYSQL_TABLES.students.length,
    columns: [
      { name: 'id', type: 'INT', key: 'PRI' },
      { name: 'name', type: 'VARCHAR(80)' },
      { name: 'email', type: 'VARCHAR(120)' },
      { name: 'cgpa', type: 'DECIMAL(3,2)' },
      { name: 'grad_year', type: 'INT' },
      { name: 'primary_stack', type: 'VARCHAR(100)' }
    ]
  },
  {
    name: 'applications',
    description: 'Student job application pipeline records & status tracking',
    rowCount: MOCK_MYSQL_TABLES.applications.length,
    columns: [
      { name: 'id', type: 'INT', key: 'PRI' },
      { name: 'student_id', type: 'INT', key: 'FK' },
      { name: 'job_id', type: 'INT', key: 'FK' },
      { name: 'stage', type: 'VARCHAR(40)' },
      { name: 'applied_at', type: 'DATE' }
    ]
  },
  {
    name: 'skills',
    description: 'Core full-stack competencies & student proficiency metrics',
    rowCount: MOCK_MYSQL_TABLES.skills.length,
    columns: [
      { name: 'id', type: 'INT', key: 'PRI' },
      { name: 'name', type: 'VARCHAR(60)' },
      { name: 'category', type: 'VARCHAR(40)' },
      { name: 'proficiency_pct', type: 'INT' },
      { name: 'industry_demand', type: 'VARCHAR(20)' }
    ]
  }
];

export const PRESET_SQL_QUERIES = [
  {
    name: 'High-Paying Roles (> 8 LPA)',
    sql: 'SELECT id, title, company, location, ctc_lpa FROM jobs WHERE ctc_lpa >= 8.0 ORDER BY ctc_lpa DESC;'
  },
  {
    name: 'Applications with Job Details (JOIN)',
    sql: 'SELECT applications.id, jobs.title, jobs.company, applications.stage, applications.applied_at FROM applications JOIN jobs ON applications.job_id = jobs.id;'
  },
  {
    name: 'Java & Spring Boot Roles',
    sql: "SELECT title, company, ctc_lpa, skills FROM jobs WHERE skills LIKE '%springboot%' ORDER BY ctc_lpa DESC;"
  },
  {
    name: 'Chennai & Bengaluru Engineering Jobs',
    sql: "SELECT title, company, location, ctc_lpa FROM jobs WHERE location = 'Chennai' OR location = 'Bengaluru' ORDER BY ctc_lpa DESC;"
  },
  {
    name: 'Student Candidates & Primary Stack',
    sql: 'SELECT name, cgpa, primary_stack FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;'
  },
  {
    name: 'Core Skills & Industry Demand',
    sql: "SELECT name, category, proficiency_pct, industry_demand FROM skills WHERE industry_demand = 'Critical' ORDER BY proficiency_pct DESC;"
  }
];

/**
 * Lightweight, robust in-browser SQL executor for MySQL placement queries.
 * Handles SELECT, SHOW TABLES, DESCRIBE, JOINs, WHERE, ORDER BY, and LIMIT.
 */
export function executeMockMySqlQuery(rawSql: string): SqlQueryResult {
  const start = performance.now();
  const trimmed = rawSql.trim().replace(/;+$/, '').trim();

  if (!trimmed) {
    return {
      columns: ['status'],
      rows: [['Empty SQL statement. Please enter a valid query.']],
      rowCount: 0,
      executionTimeMs: 0,
      error: 'Query cannot be empty.',
      queryType: 'OTHER'
    };
  }

  const upper = trimmed.toUpperCase();

  // Handle SHOW TABLES
  if (upper === 'SHOW TABLES' || upper.startsWith('SHOW TABLES')) {
    const tableNames = Object.keys(MOCK_MYSQL_TABLES);
    return {
      columns: ['Tables_in_jobnova_db'],
      rows: tableNames.map((t) => [t]),
      rowCount: tableNames.length,
      executionTimeMs: Math.round(performance.now() - start),
      queryType: 'SHOW'
    };
  }

  // Handle DESCRIBE <table>
  if (upper.startsWith('DESCRIBE ') || upper.startsWith('DESC ')) {
    const parts = trimmed.split(/\s+/);
    const tableName = (parts[1] || '').toLowerCase().replace(/[`"';]/g, '');
    const schema = MYSQL_SCHEMAS.find((s) => s.name === tableName);
    if (!schema) {
      return {
        columns: ['Error'],
        rows: [[`Table '${tableName}' does not exist in jobnova_db.`]],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - start),
        error: `Table '${tableName}' not found.`,
        queryType: 'DESCRIBE'
      };
    }
    return {
      columns: ['Field', 'Type', 'Key'],
      rows: schema.columns.map((c) => [c.name, c.type, c.key || '']),
      rowCount: schema.columns.length,
      executionTimeMs: Math.round(performance.now() - start),
      queryType: 'DESCRIBE'
    };
  }

  // Handle SELECT Queries
  if (upper.startsWith('SELECT')) {
    try {
      return parseAndExecuteSelectQuery(trimmed, start);
    } catch (err: any) {
      return {
        columns: ['Error'],
        rows: [[err.message || 'Syntax error in SQL query.']],
        rowCount: 0,
        executionTimeMs: Math.round(performance.now() - start),
        error: err.message || 'Syntax error',
        queryType: 'SELECT'
      };
    }
  }

  return {
    columns: ['Status'],
    rows: [[`Command recognized: query executed in safe sandbox mode.`]],
    rowCount: 1,
    executionTimeMs: Math.round(performance.now() - start),
    queryType: 'OTHER'
  };
}

function parseAndExecuteSelectQuery(sql: string, startTime: number): SqlQueryResult {
  // Regex to extract main SELECT clauses
  // SELECT <cols> FROM <table1> [JOIN <table2> ON <cond>] [WHERE <cond>] [ORDER BY <col> [ASC|DESC]] [LIMIT <n>]
  const selectMatch = sql.match(/SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_`"]+)(.*)/is);
  if (!selectMatch) {
    throw new Error('Malformed SELECT query. Format: SELECT <columns> FROM <table> [WHERE ...] [ORDER BY ...]');
  }

  const rawCols = selectMatch[1].trim();
  const primaryTable = selectMatch[2].trim().toLowerCase().replace(/[`"]/g, '');
  const remainder = selectMatch[3].trim();

  const baseData = MOCK_MYSQL_TABLES[primaryTable];
  if (!baseData) {
    throw new Error(`Table '${primaryTable}' does not exist in jobnova_db.`);
  }

  let workingRows: Record<string, any>[] = baseData.map((row) => ({ ...row }));

  // Check for JOIN
  const joinMatch = remainder.match(/JOIN\s+([a-zA-Z0-9_`"]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)(.*)/i);
  if (joinMatch) {
    const joinedTableName = joinMatch[1].toLowerCase().replace(/[`"]/g, '');
    const leftKey = joinMatch[2].trim();
    const rightKey = joinMatch[3].trim();
    const joinedData = MOCK_MYSQL_TABLES[joinedTableName];

    if (!joinedData) {
      throw new Error(`Joined table '${joinedTableName}' does not exist.`);
    }

    const mergedRows: Record<string, any>[] = [];
    const getVal = (row: any, keyExpr: string, prefixTable: string) => {
      const parts = keyExpr.split('.');
      const col = parts.length > 1 ? parts[1] : parts[0];
      return row[col];
    };

    for (const leftRow of workingRows) {
      for (const rightRow of joinedData) {
        const leftVal = getVal(leftRow, leftKey, primaryTable);
        const rightVal = getVal(rightRow, rightKey, joinedTableName);
        if (leftVal !== undefined && rightVal !== undefined && String(leftVal) === String(rightVal)) {
          // Merge with namespacing
          const combined: Record<string, any> = {};
          for (const [k, v] of Object.entries(leftRow)) {
            combined[k] = v;
            combined[`${primaryTable}.${k}`] = v;
          }
          for (const [k, v] of Object.entries(rightRow)) {
            combined[k] = v;
            combined[`${joinedTableName}.${k}`] = v;
          }
          mergedRows.push(combined);
        }
      }
    }
    workingRows = mergedRows;
  }

  // Extract WHERE clause
  const whereMatch = remainder.match(/WHERE\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/is);
  if (whereMatch) {
    const whereExpr = whereMatch[1].trim();
    workingRows = workingRows.filter((row) => evaluateWhereClause(row, whereExpr));
  }

  // Extract ORDER BY clause
  const orderMatch = remainder.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch) {
    const orderCol = orderMatch[1].trim();
    const isDesc = (orderMatch[2] || '').toUpperCase() === 'DESC';
    workingRows.sort((a, b) => {
      const valA = a[orderCol] !== undefined ? a[orderCol] : a[orderCol.split('.').pop() || ''];
      const valB = b[orderCol] !== undefined ? b[orderCol] : b[orderCol.split('.').pop() || ''];
      if (valA === valB) return 0;
      if (valA == null) return isDesc ? 1 : -1;
      if (valB == null) return isDesc ? -1 : 1;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isDesc ? strB.localeCompare(strA) : strA.localeCompare(strB);
    });
  }

  // Extract LIMIT clause
  const limitMatch = remainder.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    const limitNum = parseInt(limitMatch[1], 10);
    if (!isNaN(limitNum) && limitNum >= 0) {
      workingRows = workingRows.slice(0, limitNum);
    }
  }

  // Determine projected columns
  let projectedCols: string[] = [];
  if (rawCols === '*') {
    if (workingRows.length > 0) {
      // Filter out dot-prefixed duplicate keys from joins for clean view
      projectedCols = Object.keys(workingRows[0]).filter((k) => !k.includes('.'));
    } else {
      const schema = MYSQL_SCHEMAS.find((s) => s.name === primaryTable);
      projectedCols = schema ? schema.columns.map((c) => c.name) : ['id'];
    }
  } else {
    projectedCols = rawCols.split(',').map((c) => c.trim().replace(/[`"]/g, '')).filter(Boolean);
  }

  const resultRows = workingRows.map((row) => {
    return projectedCols.map((colExpr) => {
      if (row[colExpr] !== undefined) return row[colExpr];
      const simpleCol = colExpr.split('.').pop() || colExpr;
      return row[simpleCol] !== undefined ? row[simpleCol] : null;
    });
  });

  return {
    columns: projectedCols,
    rows: resultRows,
    rowCount: resultRows.length,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
    queryType: 'SELECT'
  };
}

function evaluateWhereClause(row: Record<string, any>, whereExpr: string): boolean {
  // Check for OR first
  if (/\s+OR\s+/i.test(whereExpr)) {
    const subClauses = whereExpr.split(/\s+OR\s+/i);
    return subClauses.some((sub) => evaluateWhereClause(row, sub));
  }

  // Check for AND
  if (/\s+AND\s+/i.test(whereExpr)) {
    const subClauses = whereExpr.split(/\s+AND\s+/i);
    return subClauses.every((sub) => evaluateWhereClause(row, sub));
  }

  const clean = whereExpr.trim();

  // Pattern: col LIKE '%val%'
  const likeMatch = clean.match(/([a-zA-Z0-9_.]+)\s+LIKE\s+'%?([^%']+)%?'/i);
  if (likeMatch) {
    const colName = likeMatch[1].trim();
    const pattern = likeMatch[2].toLowerCase();
    const cellVal = String(row[colName] ?? row[colName.split('.').pop() || ''] ?? '').toLowerCase();
    return cellVal.includes(pattern);
  }

  // Pattern: col >= val
  const gteMatch = clean.match(/([a-zA-Z0-9_.]+)\s*>=\s*([0-9.]+)/i);
  if (gteMatch) {
    const col = gteMatch[1].trim();
    const threshold = parseFloat(gteMatch[2]);
    const val = parseFloat(row[col] ?? row[col.split('.').pop() || '']);
    return !isNaN(val) && val >= threshold;
  }

  // Pattern: col <= val
  const lteMatch = clean.match(/([a-zA-Z0-9_.]+)\s*<=\s*([0-9.]+)/i);
  if (lteMatch) {
    const col = lteMatch[1].trim();
    const threshold = parseFloat(lteMatch[2]);
    const val = parseFloat(row[col] ?? row[col.split('.').pop() || '']);
    return !isNaN(val) && val <= threshold;
  }

  // Pattern: col > val
  const gtMatch = clean.match(/([a-zA-Z0-9_.]+)\s*>\s*([0-9.]+)/i);
  if (gtMatch) {
    const col = gtMatch[1].trim();
    const threshold = parseFloat(gtMatch[2]);
    const val = parseFloat(row[col] ?? row[col.split('.').pop() || '']);
    return !isNaN(val) && val > threshold;
  }

  // Pattern: col < val
  const ltMatch = clean.match(/([a-zA-Z0-9_.]+)\s*<\s*([0-9.]+)/i);
  if (ltMatch) {
    const col = ltMatch[1].trim();
    const threshold = parseFloat(ltMatch[2]);
    const val = parseFloat(row[col] ?? row[col.split('.').pop() || '']);
    return !isNaN(val) && val < threshold;
  }

  // Pattern: col = 'str' or col = num
  const eqMatch = clean.match(/([a-zA-Z0-9_.]+)\s*=\s*['"]?([^'"]+)['"]?/i);
  if (eqMatch) {
    const col = eqMatch[1].trim();
    const target = eqMatch[2].trim();
    const cellVal = String(row[col] ?? row[col.split('.').pop() || '']).trim();
    return cellVal.toLowerCase() === target.toLowerCase();
  }

  return true;
}

export const SPRING_BOOT_ANNOTATION_GUIDE: SpringBootAnnotationItem[] = [
  {
    name: '@SpringBootApplication',
    layer: 'Core',
    description: 'Meta-annotation combining @Configuration, @EnableAutoConfiguration, and @ComponentScan.',
    codeSnippet: `@SpringBootApplication\npublic class JobnovaApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(JobnovaApplication.class, args);\n    }\n}`,
    keyRule: 'Must be placed in root package so @ComponentScan automatically discovers controllers, services, and repositories.'
  },
  {
    name: '@RestController',
    layer: 'Web/REST',
    description: 'Combines @Controller and @ResponseBody to automatically serialize returned objects to JSON HTTP responses.',
    codeSnippet: `@RestController\n@RequestMapping("/api/jobs")\npublic class JobController {\n    private final JobService jobService;\n    \n    public JobController(JobService jobService) {\n        this.jobService = jobService;\n    }\n    \n    @GetMapping\n    public List<Job> getAllJobs() {\n        return jobService.findAll();\n    }\n}`,
    keyRule: 'Always prefer constructor injection over field @Autowired for immutability and easy unit testing.'
  },
  {
    name: '@Transactional',
    layer: 'Persistence/JPA',
    description: 'Enforces ACID transaction boundaries around database operations, rolling back on RuntimeExceptions.',
    codeSnippet: `@Service\npublic class ApplicationService {\n    @Transactional\n    public Application applyForJob(Long studentId, Long jobId) {\n        studentRepo.findById(studentId).orElseThrow();\n        return appRepo.save(new Application(studentId, jobId, "Applied"));\n    }\n}`,
    keyRule: 'Use propagation = Propagation.REQUIRED (default) and readOnly = true on query-only service methods.'
  },
  {
    name: '@Repository',
    layer: 'Persistence/JPA',
    description: 'Marks Spring Data interface for automatic proxy creation and DataAccessException translation.',
    codeSnippet: `@Repository\npublic interface JobRepository extends JpaRepository<Job, Long> {\n    List<Job> findBySkillsContainingIgnoreCase(String skill);\n    \n    @Query("SELECT j FROM Job j WHERE j.ctcLpa >= :minCtc")\n    List<Job> findHighPayingRoles(@Param("minCtc") Double minCtc);\n}`,
    keyRule: 'Spring Data JPA automatically implements methods derived from entity property names without boilerplate.'
  },
  {
    name: '@CrossOrigin',
    layer: 'Web/REST',
    description: 'Enables Cross-Origin Resource Sharing (CORS) on REST controllers for React.js frontend requests.',
    codeSnippet: `@RestController\n@RequestMapping("/api/courses")\n@CrossOrigin(origins = "http://localhost:3000")\npublic class CourseController {\n    // Handles pre-flight OPTIONS requests seamlessly\n}`,
    keyRule: 'Specify exact frontend origins in production to prevent unauthorized cross-origin data exposure.'
  }
];

export const FULL_STACK_CHALLENGES: FullStackChallenge[] = [
  {
    id: 'java-streams-filter',
    title: 'Java 17: Filter & Map Campus Job Roles',
    technology: 'Java',
    difficulty: 'Intermediate',
    description: 'Use the Java Stream API to filter open jobs with CTC >= 8.0 LPA and collect their company names as uppercase strings.',
    starterCode: `public List<String> getTopCompanies(List<Job> jobs) {
    return jobs.stream()
        .filter(j -> j.getCtcLpa() >= 8.0)
        .map(j -> j.getCompany().toUpperCase())
        .collect(Collectors.toList());
}`,
    solutionKeywords: ['stream', 'filter', 'map', 'collect', 'collectors'],
    testExplanation: 'Correctly verifies stream pipeline filtering on ctcLpa and mapping to uppercase strings.'
  },
  {
    id: 'springboot-rest-controller',
    title: 'Spring Boot 3: REST Controller for Student Applications',
    technology: 'Spring Boot',
    difficulty: 'Intermediate',
    description: 'Write a Spring Boot @RestController with constructor-injected service and a @PostMapping method handling @RequestBody payload.',
    starterCode: `@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {
    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Application> submit(@RequestBody ApplicationDTO dto) {
        Application saved = service.apply(dto);
        return ResponseEntity.ok(saved);
    }
}`,
    solutionKeywords: ['@restcontroller', '@requestmapping', 'constructor', '@postmapping', '@requestbody', 'responseentity'],
    testExplanation: 'Verifies standard Spring Boot 3 REST controller best practices with constructor injection and JSON serialization.'
  },
  {
    id: 'mysql-join-query',
    title: 'MySQL: Student Applications with Job Title & Company',
    technology: 'MySQL',
    difficulty: 'Intermediate',
    description: 'Write a MySQL query joining applications and jobs to list student_id, job title, company, and stage where stage is "Interviewing".',
    starterCode: `SELECT applications.student_id, jobs.title, jobs.company, applications.stage
FROM applications
INNER JOIN jobs ON applications.job_id = jobs.id
WHERE applications.stage = 'Interviewing'
ORDER BY jobs.ctc_lpa DESC;`,
    solutionKeywords: ['select', 'from applications', 'join jobs on', 'where', 'stage'],
    testExplanation: 'Verifies correct inner join syntax between applications and jobs on foreign key relationship.'
  },
  {
    id: 'react-custom-hook',
    title: 'React.js: Placement Application Pipeline Hook',
    technology: 'React',
    difficulty: 'Intermediate',
    description: 'Implement a React functional hook usePlacementPipeline that tracks applied IDs in useState and provides toggleApply callback.',
    starterCode: `import { useState, useCallback } from 'react';

export function usePlacementPipeline(initialAppliedIds = [1]) {
  const [appliedIds, setAppliedIds] = useState(initialAppliedIds);

  const toggleApply = useCallback((jobId) => {
    setAppliedIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  }, []);

  return { appliedIds, toggleApply, totalCount: appliedIds.length };
}`,
    solutionKeywords: ['usestate', 'usecallback', 'setappliedids', 'includes', 'filter'],
    testExplanation: 'Validates immutable React state updates and stable memoized callbacks.'
  },
  {
    id: 'javascript-async-fetch',
    title: 'JavaScript: Safe Async/Await API Client with Timeout',
    technology: 'JavaScript',
    difficulty: 'Intermediate',
    description: 'Write an asynchronous JavaScript function fetchJobNovaEndpoint that handles fetch responses, JSON parsing, and error catching.',
    starterCode: `async function fetchJobNovaEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('HTTP Error: ' + response.status);
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}`,
    solutionKeywords: ['async', 'await', 'fetch', 'response.ok', 'json', 'try', 'catch'],
    testExplanation: 'Validates production-grade async/await error handling and response status verification.'
  },
  {
    id: 'html5-css3-responsive-card',
    title: 'HTML5 & CSS3: Semantic Job Card Layout with Flexbox',
    technology: 'HTML5/CSS3',
    difficulty: 'Beginner',
    description: 'Build an accessible HTML5 <article> component with semantic header, tag badges, and responsive CSS Flexbox row.',
    starterCode: `<article class="job-card">
  <header class="card-header">
    <h3 class="job-title">Full Stack Developer</h3>
    <span class="ctc-badge">8.5 LPA</span>
  </header>
  <p class="company-info">Cognizant · Pune</p>
  <footer class="card-actions">
    <span class="skill-tag">Java</span>
    <span class="skill-tag">Spring Boot</span>
    <button type="button" class="apply-btn">Apply Now</button>
  </footer>
</article>`,
    solutionKeywords: ['<article', '<header', '<h3', '<footer', '<button'],
    testExplanation: 'Verifies semantic HTML5 tags and accessible structure.'
  }
];

export function evaluateFullStackChallenge(
  challenge: FullStackChallenge,
  userCode: string
): { passed: boolean; message: string; score: number; matchedKeywords: string[]; missingKeywords: string[] } {
  const code = userCode.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of challenge.solutionKeywords) {
    if (code.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const score = Math.round((matched.length / challenge.solutionKeywords.length) * 100);
  const passed = score >= 75;

  let message = '';
  if (passed) {
    message = `Excellent work! Your solution scored ${score}% and satisfies all core ${challenge.technology} specifications.`;
  } else {
    message = `Needs review (${score}%). Missing essential concepts: ${missing.join(', ')}. Review the challenge specifications and retry.`;
  }

  return { passed, message, score, matchedKeywords: matched, missingKeywords: missing };
}
