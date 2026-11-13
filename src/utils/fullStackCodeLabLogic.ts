/**
 * Full-Stack Code Lab Logic: In-Browser MySQL Engine, Java/Spring Boot Simulator,
 * and Full-Stack Placement Assessment Evaluator.
 */

import type { JobItem } from '../data/seedData';
import type { UserAlertRecord } from './userAlertsLogic';

export interface SqlQueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
  message?: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'SHOW' | 'DESCRIBE' | 'OTHER';
}

export interface MySqlDatabaseState {
  tables: Record<string, Record<string, any>[]>;
  schemas: SqlTableSchema[];
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
    name: 'Avg & Count CTC by Location (GROUP BY)',
    sql: 'SELECT location, COUNT(*) AS open_roles, AVG(ctc_lpa) AS avg_ctc_lpa FROM jobs GROUP BY location ORDER BY avg_ctc_lpa DESC;'
  },
  {
    name: 'Insert New Java + Spring Boot Role (INSERT)',
    sql: "INSERT INTO jobs (title, company, location, ctc_lpa, skills, type) VALUES ('Spring Cloud Engineer', 'Paytm', 'Bengaluru', 16.5, 'java,springboot,mysql,kafka', 'Full-Time');"
  },
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
    name: 'Student Candidates & Primary Stack',
    sql: 'SELECT name, cgpa, primary_stack FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;'
  },
  {
    name: 'Core Skills & Industry Demand',
    sql: "SELECT name, category, proficiency_pct, industry_demand FROM skills WHERE industry_demand = 'Critical' ORDER BY proficiency_pct DESC;"
  }
];

export function createMySqlSandboxState(
  liveJobs?: JobItem[],
  liveAlerts?: UserAlertRecord[]
): MySqlDatabaseState {
  const jobsRows =
    liveJobs && liveJobs.length > 0
      ? liveJobs.map((j) => {
          const parsedCtc = parseFloat(String(j.ctc || '8.0').replace(/[^0-9.]/g, ''));
          return {
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            ctc_lpa: Number.isFinite(parsedCtc) ? parsedCtc : 8.0,
            skills: j.skills,
            type: j.type || 'Full-Time'
          };
        })
      : MOCK_MYSQL_TABLES.jobs.map((r) => ({ ...r }));

  const alertRows = (liveAlerts || []).map((a, idx) => ({
    id: idx + 1,
    alert_key: a.id,
    user_email: a.userEmail,
    source_job_id: a.sourceJobId,
    watched_skills: a.skills.join(','),
    push_enabled: a.pushEnabled ? 1 : 0,
    matched_count: a.matchedNewJobIds.length
  }));

  const tables: Record<string, Record<string, any>[]> = {
    jobs: jobsRows,
    students: MOCK_MYSQL_TABLES.students.map((r) => ({ ...r })),
    applications: MOCK_MYSQL_TABLES.applications.map((r) => ({ ...r })),
    skills: MOCK_MYSQL_TABLES.skills.map((r) => ({ ...r })),
    user_alerts: alertRows
  };

  const schemas: SqlTableSchema[] = [
    ...MYSQL_SCHEMAS.map((s) => ({
      ...s,
      columns: s.columns.map((c) => ({ ...c })),
      rowCount: (tables[s.name] || []).length
    })),
    {
      name: 'user_alerts',
      description: 'Active skill-based push notification subscriptions',
      rowCount: alertRows.length,
      columns: [
        { name: 'id', type: 'INT', key: 'PRI' },
        { name: 'alert_key', type: 'VARCHAR(64)' },
        { name: 'user_email', type: 'VARCHAR(120)' },
        { name: 'source_job_id', type: 'INT', key: 'FK' },
        { name: 'watched_skills', type: 'VARCHAR(255)' },
        { name: 'push_enabled', type: 'TINYINT(1)' },
        { name: 'matched_count', type: 'INT' }
      ]
    }
  ];

  return { tables, schemas };
}

/**
 * Lightweight, robust in-browser SQL executor for MySQL placement queries.
 * Handles SELECT, SHOW TABLES, DESCRIBE, JOINs, WHERE, ORDER BY, and LIMIT.
 */
export function executeMockMySqlQuery(
  rawSql: string,
  state?: MySqlDatabaseState
): SqlQueryResult {
  return executeStatefulMySqlQuery(rawSql, state || {
    tables: Object.fromEntries(
      Object.entries(MOCK_MYSQL_TABLES).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))])
    ),
    schemas: MYSQL_SCHEMAS.map((s) => ({ ...s, columns: s.columns.map((c) => ({ ...c })) }))
  }).result;
}

export function executeStatefulMySqlQuery(
  rawSql: string,
  state: MySqlDatabaseState
): { result: SqlQueryResult; nextState: MySqlDatabaseState } {
  const start = performance.now();
  const trimmed = rawSql.trim().replace(/;+$/, '').trim();
  const cloneState = (): MySqlDatabaseState => ({
    tables: Object.fromEntries(
      Object.entries(state.tables).map(([k, rows]) => [k, rows.map((r) => ({ ...r }))])
    ),
    schemas: state.schemas.map((s) => ({
      ...s,
      columns: s.columns.map((c) => ({ ...c })),
      rowCount: (state.tables[s.name] || []).length
    }))
  });

  if (!trimmed) {
    return {
      nextState: state,
      result: {
        columns: ['status'],
        rows: [['Empty SQL statement. Please enter a valid query.']],
        rowCount: 0,
        executionTimeMs: 0,
        error: 'Query cannot be empty.',
        queryType: 'OTHER'
      }
    };
  }

  const upper = trimmed.toUpperCase();

  // SHOW TABLES
  if (upper === 'SHOW TABLES' || upper.startsWith('SHOW TABLES')) {
    const tableNames = Object.keys(state.tables);
    return {
      nextState: state,
      result: {
        columns: ['Tables_in_jobnova_db'],
        rows: tableNames.map((t) => [t]),
        rowCount: tableNames.length,
        executionTimeMs: Math.max(1, Math.round(performance.now() - start)),
        queryType: 'SHOW'
      }
    };
  }

  // SHOW CREATE TABLE <table>
  if (upper.startsWith('SHOW CREATE TABLE ')) {
    const tableName = trimmed.replace(/^SHOW\s+CREATE\s+TABLE\s+/i, '').trim().toLowerCase().replace(/[`"';]/g, '');
    const schema = state.schemas.find((s) => s.name === tableName);
    if (!schema) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Table '${tableName}' does not exist in jobnova_db.`]],
          rowCount: 0,
          executionTimeMs: 1,
          error: `Table '${tableName}' not found.`,
          queryType: 'SHOW'
        }
      };
    }
    const ddlLines = schema.columns.map((c) => {
      const autoInc = c.name === 'id' ? ' AUTO_INCREMENT' : '';
      return `  \`${c.name}\` ${c.type}${c.key === 'PRI' ? ` NOT NULL${autoInc}` : ''}`;
    });
    const pkCol = schema.columns.find((c) => c.key === 'PRI');
    if (pkCol) ddlLines.push(`  PRIMARY KEY (\`${pkCol.name}\`)`);
    const ddl = `CREATE TABLE \`${schema.name}\` (\n${ddlLines.join(',\n')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    return {
      nextState: state,
      result: {
        columns: ['Table', 'Create Table'],
        rows: [[schema.name, ddl]],
        rowCount: 1,
        executionTimeMs: 1,
        queryType: 'SHOW'
      }
    };
  }

  // DESCRIBE <table>
  if (upper.startsWith('DESCRIBE ') || upper.startsWith('DESC ')) {
    const parts = trimmed.split(/\s+/);
    const tableName = (parts[1] || '').toLowerCase().replace(/[`"';]/g, '');
    const schema = state.schemas.find((s) => s.name === tableName);
    if (!schema) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Table '${tableName}' does not exist in jobnova_db.`]],
          rowCount: 0,
          executionTimeMs: Math.round(performance.now() - start),
          error: `Table '${tableName}' not found.`,
          queryType: 'DESCRIBE'
        }
      };
    }
    return {
      nextState: state,
      result: {
        columns: ['Field', 'Type', 'Key'],
        rows: schema.columns.map((c) => [c.name, c.type, c.key || '']),
        rowCount: schema.columns.length,
        executionTimeMs: Math.round(performance.now() - start),
        queryType: 'DESCRIBE'
      }
    };
  }

  // CREATE TABLE
  if (upper.startsWith('CREATE TABLE')) {
    const createMatch = trimmed.match(
      /^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_`"]+)\s*\(([\s\S]+)\)$/i
    );
    if (!createMatch) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [['Malformed CREATE TABLE syntax.']],
          rowCount: 0,
          executionTimeMs: 1,
          error: 'Format: CREATE TABLE table_name (id INT PRIMARY KEY, name VARCHAR(100));',
          queryType: 'CREATE'
        }
      };
    }
    const tableName = createMatch[1].toLowerCase().replace(/[`"]/g, '');
    const colDefs = createMatch[2]
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !/^PRIMARY\s+KEY|^FOREIGN\s+KEY|^KEY\s+|^INDEX\s+/i.test(s));

    const columns = colDefs.map((def) => {
      const tokens = def.split(/\s+/);
      const colName = tokens[0].replace(/[`"]/g, '');
      const colType = tokens[1] ? tokens[1].toUpperCase() : 'VARCHAR(255)';
      const isPri = /PRIMARY\s+KEY/i.test(def);
      return { name: colName, type: colType, ...(isPri ? { key: 'PRI' } : {}) };
    });

    const next = cloneState();
    if (!next.tables[tableName]) {
      next.tables[tableName] = [];
    }
    const existingIdx = next.schemas.findIndex((s) => s.name === tableName);
    const newSchema: SqlTableSchema = {
      name: tableName,
      description: 'User-defined MySQL table in sandbox',
      columns,
      rowCount: next.tables[tableName].length
    };
    if (existingIdx >= 0) {
      next.schemas[existingIdx] = newSchema;
    } else {
      next.schemas.push(newSchema);
    }

    return {
      nextState: next,
      result: {
        columns: ['Status', 'Table', 'Columns'],
        rows: [['OK (0 rows affected)', tableName, columns.map((c) => c.name).join(', ')]],
        rowCount: 1,
        executionTimeMs: 1,
        message: `Table '${tableName}' created cleanly in jobnova_db.`,
        queryType: 'CREATE'
      }
    };
  }

  // INSERT INTO
  if (upper.startsWith('INSERT')) {
    const insertMatch = trimmed.match(
      /^INSERT\s+INTO\s+([a-zA-Z0-9_`"]+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\(([\s\S]+)\)$/i
    );
    if (!insertMatch) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [['Malformed INSERT statement.']],
          rowCount: 0,
          executionTimeMs: 1,
          error: 'Format: INSERT INTO jobs (title, company, location, ctc_lpa, skills) VALUES (...);',
          queryType: 'INSERT'
        }
      };
    }

    const tableName = insertMatch[1].toLowerCase().replace(/[`"]/g, '');
    if (!state.tables[tableName]) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Table '${tableName}' does not exist.`]],
          rowCount: 0,
          executionTimeMs: 1,
          error: `Table '${tableName}' not found.`,
          queryType: 'INSERT'
        }
      };
    }

    const schema = state.schemas.find((s) => s.name === tableName);
    const colList = insertMatch[2]
      ? insertMatch[2].split(',').map((c) => c.trim().replace(/[`"]/g, ''))
      : (schema ? schema.columns.map((c) => c.name) : []);
    const values = splitSqlValues(insertMatch[3]);

    if (colList.length !== values.length) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Column count (${colList.length}) does not match value count (${values.length}).`]],
          rowCount: 0,
          executionTimeMs: 1,
          error: `Column count (${colList.length}) doesn't match value count (${values.length}).`,
          queryType: 'INSERT'
        }
      };
    }

    const next = cloneState();
    const existingRows = next.tables[tableName];
    const maxId = existingRows.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
    const newRow: Record<string, any> = {};
    if (schema?.columns.some((c) => c.name === 'id') && !colList.includes('id')) {
      newRow.id = maxId + 1;
    }
    colList.forEach((col, i) => {
      newRow[col] = values[i];
    });
    next.tables[tableName] = [newRow, ...existingRows];
    next.schemas = next.schemas.map((s) =>
      s.name === tableName ? { ...s, rowCount: next.tables[tableName].length } : s
    );

    const previewCols = Object.keys(newRow);
    return {
      nextState: next,
      result: {
        columns: previewCols,
        rows: [previewCols.map((c) => newRow[c])],
        rowCount: 1,
        executionTimeMs: Math.max(1, Math.round(performance.now() - start)),
        message: `INSERT OK: 1 row added to '${tableName}'.`,
        queryType: 'INSERT'
      }
    };
  }

  // UPDATE <table> SET ... [WHERE ...]
  if (upper.startsWith('UPDATE ')) {
    const updateMatch = trimmed.match(/^UPDATE\s+([a-zA-Z0-9_`"]+)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!updateMatch) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [['Malformed UPDATE syntax.']],
          rowCount: 0,
          executionTimeMs: 1,
          error: "Format: UPDATE jobs SET ctc_lpa = 12.0 WHERE company = 'TCS';",
          queryType: 'UPDATE'
        }
      };
    }
    const tableName = updateMatch[1].toLowerCase().replace(/[`"]/g, '');
    if (!state.tables[tableName]) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Table '${tableName}' not found.`]],
          rowCount: 0,
          executionTimeMs: 1,
          error: `Table '${tableName}' does not exist.`,
          queryType: 'UPDATE'
        }
      };
    }

    const assignments = updateMatch[2].split(',').map((part) => {
      const [lhs, ...rhsParts] = part.split('=');
      return {
        col: lhs.trim().replace(/[`"]/g, ''),
        val: parseSqlLiteral(rhsParts.join('=').trim())
      };
    });
    const whereExpr = updateMatch[3]?.trim();

    const next = cloneState();
    let updatedCount = 0;
    next.tables[tableName] = next.tables[tableName].map((row) => {
      if (!whereExpr || evaluateWhereClause(row, whereExpr)) {
        updatedCount++;
        const copy = { ...row };
        for (const a of assignments) copy[a.col] = a.val;
        return copy;
      }
      return row;
    });

    return {
      nextState: next,
      result: {
        columns: ['Status', 'Rows Updated'],
        rows: [[`Updated '${tableName}'`, updatedCount]],
        rowCount: updatedCount,
        executionTimeMs: 1,
        message: `UPDATE OK: ${updatedCount} row(s) updated in '${tableName}'.`,
        queryType: 'UPDATE'
      }
    };
  }

  // DELETE FROM <table> [WHERE ...]
  if (upper.startsWith('DELETE')) {
    const deleteMatch = trimmed.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_`"]+)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!deleteMatch) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [['Malformed DELETE syntax.']],
          rowCount: 0,
          executionTimeMs: 1,
          error: 'Format: DELETE FROM jobs WHERE id = 1;',
          queryType: 'DELETE'
        }
      };
    }
    const tableName = deleteMatch[1].toLowerCase().replace(/[`"]/g, '');
    if (!state.tables[tableName]) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[`Table '${tableName}' not found.`]],
          rowCount: 0,
          executionTimeMs: 1,
          error: `Table '${tableName}' does not exist.`,
          queryType: 'DELETE'
        }
      };
    }

    const whereExpr = deleteMatch[2]?.trim();
    const next = cloneState();
    const before = next.tables[tableName].length;
    next.tables[tableName] = whereExpr
      ? next.tables[tableName].filter((row) => !evaluateWhereClause(row, whereExpr))
      : [];
    const deletedCount = before - next.tables[tableName].length;
    next.schemas = next.schemas.map((s) =>
      s.name === tableName ? { ...s, rowCount: next.tables[tableName].length } : s
    );

    return {
      nextState: next,
      result: {
        columns: ['Status', 'Rows Deleted'],
        rows: [[`Deleted from '${tableName}'`, deletedCount]],
        rowCount: deletedCount,
        executionTimeMs: 1,
        message: `DELETE OK: ${deletedCount} row(s) removed from '${tableName}'.`,
        queryType: 'DELETE'
      }
    };
  }

  // SELECT
  if (upper.startsWith('SELECT')) {
    try {
      return {
        nextState: state,
        result: parseAndExecuteSelectQuery(trimmed, start, state)
      };
    } catch (err: any) {
      return {
        nextState: state,
        result: {
          columns: ['Error'],
          rows: [[err.message || 'Syntax error in SQL query.']],
          rowCount: 0,
          executionTimeMs: Math.round(performance.now() - start),
          error: err.message || 'Syntax error',
          queryType: 'SELECT'
        }
      };
    }
  }

  return {
    nextState: state,
    result: {
      columns: ['Status'],
      rows: [['Command recognized: executed in MySQL 8.0 sandbox mode.']],
      rowCount: 1,
      executionTimeMs: Math.round(performance.now() - start),
      queryType: 'OTHER'
    }
  };
}

function parseSqlLiteral(raw: string): string | number | boolean | null {
  const t = raw.trim();
  if (/^null$/i.test(t)) return null;
  if (/^true$/i.test(t)) return true;
  if (/^false$/i.test(t)) return false;
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1);
  }
  const n = Number(t);
  return t !== '' && !Number.isNaN(n) ? n : t;
}

function splitSqlValues(raw: string): (string | number | boolean | null)[] {
  const result: string[] = [];
  let current = '';
  let quoteChar: string | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if ((ch === "'" || ch === '"') && raw[i - 1] !== '\\') {
      if (quoteChar === ch) {
        quoteChar = null;
      } else if (!quoteChar) {
        quoteChar = ch;
      }
      current += ch;
    } else if (ch === ',' && !quoteChar) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim() !== '') result.push(current.trim());
  return result.map(parseSqlLiteral);
}

function parseAndExecuteSelectQuery(
  sql: string,
  startTime: number,
  state: MySqlDatabaseState
): SqlQueryResult {
  const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM\s+([a-zA-Z0-9_`"]+)(.*)/is);
  if (!selectMatch) {
    throw new Error('Malformed SELECT query. Format: SELECT <columns> FROM <table> [WHERE ...] [ORDER BY ...]');
  }

  const rawCols = selectMatch[1].trim();
  const primaryTable = selectMatch[2].trim().toLowerCase().replace(/[`"]/g, '');
  const remainder = selectMatch[3].trim();

  const baseData = state.tables[primaryTable];
  if (!baseData) {
    throw new Error(`Table '${primaryTable}' does not exist in jobnova_db.`);
  }

  let workingRows: Record<string, any>[] = baseData.map((row) => ({ ...row }));

  // Check for JOIN
  const joinMatch = remainder.match(/(?:LEFT\s+|INNER\s+)?JOIN\s+([a-zA-Z0-9_`"]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)(.*)/i);
  if (joinMatch) {
    const joinedTableName = joinMatch[1].toLowerCase().replace(/[`"]/g, '');
    const leftKey = joinMatch[2].trim();
    const rightKey = joinMatch[3].trim();
    const joinedData = state.tables[joinedTableName];

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
  const whereMatch = remainder.match(/WHERE\s+([\s\S]*?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/is);
  if (whereMatch) {
    const whereExpr = whereMatch[1].trim();
    workingRows = workingRows.filter((row) => evaluateWhereClause(row, whereExpr));
  }

  // Handle GROUP BY and/or aggregate functions (COUNT, AVG, SUM, MIN, MAX)
  const groupMatch = remainder.match(/GROUP\s+BY\s+([a-zA-Z0-9_.]+)/i);
  const rawSelectTokens = rawCols === '*' ? [] : rawCols.split(',').map((c) => c.trim()).filter(Boolean);
  const hasAggregate = rawSelectTokens.some((tok) => /^(COUNT|AVG|SUM|MIN|MAX)\s*\(/i.test(tok));

  if (groupMatch || hasAggregate) {
    const groupCol = groupMatch ? groupMatch[1].trim() : null;
    const groups = new Map<string, Record<string, any>[]>();
    if (groupCol) {
      for (const r of workingRows) {
        const keyVal = r[groupCol] !== undefined ? r[groupCol] : r[groupCol.split('.').pop() || ''];
        const key = String(keyVal ?? 'NULL');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      }
    } else {
      groups.set('__ALL__', workingRows);
    }

    const parsedSelectExprs = rawSelectTokens.map((expr) => {
      const asMatch = expr.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
      const baseExpr = (asMatch ? asMatch[1] : expr).trim();
      const label = (asMatch ? asMatch[2] : baseExpr).trim();
      return { baseExpr, label };
    });

    const aggregatedRows: Record<string, any>[] = [];
    for (const [, groupRows] of groups.entries()) {
      const aggRow: Record<string, any> = {};
      for (const { baseExpr, label } of parsedSelectExprs) {
        const aggFn = baseExpr.match(/^(COUNT|AVG|SUM|MIN|MAX)\s*\(\s*([^)]+)\s*\)$/i);
        if (aggFn) {
          const fn = aggFn[1].toUpperCase();
          const arg = aggFn[2].trim();
          let val: number | null = 0;
          if (fn === 'COUNT') {
            val = arg === '*'
              ? groupRows.length
              : groupRows.filter((r) => (r[arg] ?? r[arg.split('.').pop() || '']) != null).length;
          } else {
            const nums = groupRows
              .map((r) => Number(r[arg] ?? r[arg.split('.').pop() || '']))
              .filter((n) => !Number.isNaN(n));
            if (nums.length === 0) {
              val = null;
            } else if (fn === 'SUM') {
              val = Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100;
            } else if (fn === 'AVG') {
              val = Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
            } else if (fn === 'MIN') {
              val = Math.min(...nums);
            } else if (fn === 'MAX') {
              val = Math.max(...nums);
            }
          }
          aggRow[label] = val;
        } else {
          const sample = groupRows[0] || {};
          aggRow[label] = sample[baseExpr] ?? sample[baseExpr.split('.').pop() || ''] ?? null;
        }
      }
      aggregatedRows.push(aggRow);
    }

    const orderMatchAgg = remainder.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
    if (orderMatchAgg) {
      const orderCol = orderMatchAgg[1].trim();
      const isDesc = (orderMatchAgg[2] || '').toUpperCase() === 'DESC';
      aggregatedRows.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }
        return isDesc
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
    }

    const limitMatchAgg = remainder.match(/LIMIT\s+(\d+)/i);
    const slicedAgg = limitMatchAgg
      ? aggregatedRows.slice(0, Math.max(0, parseInt(limitMatchAgg[1], 10)))
      : aggregatedRows;

    const cols = parsedSelectExprs.map((p) => p.label);
    return {
      columns: cols,
      rows: slicedAgg.map((r) => cols.map((c) => r[c] ?? null)),
      rowCount: slicedAgg.length,
      executionTimeMs: Math.max(1, Math.round(performance.now() - startTime)),
      queryType: 'SELECT'
    };
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
      projectedCols = Object.keys(workingRows[0]).filter((k) => !k.includes('.'));
    } else {
      const schema = state.schemas.find((s) => s.name === primaryTable);
      projectedCols = schema ? schema.columns.map((c) => c.name) : ['id'];
    }
  } else {
    projectedCols = rawCols.split(',').map((c) => c.trim().replace(/[`"]/g, '')).filter(Boolean);
  }

  const resultRows = workingRows.map((row) => {
    return projectedCols.map((colExpr) => {
      const asMatch = colExpr.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
      const actualCol = asMatch ? asMatch[1].trim() : colExpr;
      if (row[actualCol] !== undefined) return row[actualCol];
      const simpleCol = actualCol.split('.').pop() || actualCol;
      return row[simpleCol] !== undefined ? row[simpleCol] : null;
    });
  });

  const displayColumns = projectedCols.map((colExpr) => {
    const asMatch = colExpr.match(/^([\s\S]+?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
    return asMatch ? asMatch[2].trim() : colExpr;
  });

  return {
    columns: displayColumns,
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
  },
  {
    name: '@Valid · @NotBlank · @Email',
    layer: 'Web/REST',
    description: 'Enforces Jakarta Bean Validation on JobController and AuthController request DTOs before executing business logic.',
    codeSnippet: `public record SignUpRequest(\n    @NotBlank(message = "Name is required") @Size(min = 2, max = 80) String name,\n    @NotBlank(message = "Email is required") @Email(message = "Invalid email") String email,\n    @NotBlank @Size(min = 8, max = 100) String password\n) {}\n\n@PostMapping("/signup")\npublic ResponseEntity<?> register(@Valid @RequestBody SignUpRequest req) {\n    return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));\n}`,
    keyRule: 'Pair @Valid on @RequestBody parameters with a @ExceptionHandler(MethodArgumentNotValidException.class) to return structured 400 fieldErrors.'
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

// ==================== SPRING BOOT + JAVA + MYSQL CODE GENERATOR ====================

export interface SpringBootFieldSpec {
  name: string;
  javaType: 'String' | 'Double' | 'Integer' | 'Boolean';
  mysqlType: string;
}

export interface SpringBootEntitySpec {
  id: string;
  entityName: string;
  tableName: string;
  endpointPath: string;
  description: string;
  fields: SpringBootFieldSpec[];
  samplePostPayload: Record<string, string | number | boolean>;
}

export interface GeneratedSpringBootBundle {
  entityJava: string;
  repositoryJava: string;
  serviceJava: string;
  controllerJava: string;
  mysqlDdl: string;
  frontendJs: string;
  reactComponentJsx: string;
  hibernateSqlTrace: string;
}

export const SPRING_BOOT_ENTITY_TEMPLATES: SpringBootEntitySpec[] = [
  {
    id: 'job',
    entityName: 'Job',
    tableName: 'jobs',
    endpointPath: '/api/jobs',
    description: 'Engineering job postings persisted in MySQL and exposed via Spring Boot REST API.',
    fields: [
      { name: 'title', javaType: 'String', mysqlType: 'VARCHAR(120) NOT NULL' },
      { name: 'company', javaType: 'String', mysqlType: 'VARCHAR(80) NOT NULL' },
      { name: 'location', javaType: 'String', mysqlType: 'VARCHAR(60) NOT NULL' },
      { name: 'skills', javaType: 'String', mysqlType: 'VARCHAR(255) NOT NULL' },
      { name: 'ctc', javaType: 'String', mysqlType: 'VARCHAR(40)' }
    ],
    samplePostPayload: {
      title: 'Java Spring Boot Microservices Engineer',
      company: 'Zoho',
      location: 'Chennai',
      skills: 'java,springboot,mysql,docker',
      ctc: '12.5 LPA'
    }
  },
  {
    id: 'user-alert',
    entityName: 'UserAlert',
    tableName: 'user_alerts',
    endpointPath: '/api/user-alerts',
    description: 'Skill-watched job alert subscriptions persisted in MySQL for browser push triggers.',
    fields: [
      { name: 'userEmail', javaType: 'String', mysqlType: 'VARCHAR(120) NOT NULL' },
      { name: 'sourceJobId', javaType: 'Integer', mysqlType: 'INT NOT NULL' },
      { name: 'watchedSkills', javaType: 'String', mysqlType: 'VARCHAR(255) NOT NULL' },
      { name: 'pushEnabled', javaType: 'Boolean', mysqlType: 'TINYINT(1) DEFAULT 1' }
    ],
    samplePostPayload: {
      userEmail: 'harish@jobnova.in',
      sourceJobId: 1,
      watchedSkills: 'java,springboot,mysql',
      pushEnabled: true
    }
  },
  {
    id: 'student-application',
    entityName: 'JobApplication',
    tableName: 'applications',
    endpointPath: '/api/applications',
    description: 'Tracks candidate application stages across Applied, Interviewing, and Offer Received.',
    fields: [
      { name: 'studentId', javaType: 'Integer', mysqlType: 'INT NOT NULL' },
      { name: 'jobId', javaType: 'Integer', mysqlType: 'INT NOT NULL' },
      { name: 'stage', javaType: 'String', mysqlType: 'VARCHAR(40) NOT NULL' },
      { name: 'appliedAt', javaType: 'String', mysqlType: 'VARCHAR(32)' }
    ],
    samplePostPayload: {
      studentId: 101,
      jobId: 2,
      stage: 'Interviewing',
      appliedAt: '2026-11-12'
    }
  },
  {
    id: 'auth-user',
    entityName: 'AuthUser',
    tableName: 'users',
    endpointPath: '/api/auth/signup',
    description: 'Candidate account registration and authentication validated via Spring Boot @NotBlank, @Email, and @Size.',
    fields: [
      { name: 'name', javaType: 'String', mysqlType: 'VARCHAR(80) NOT NULL' },
      { name: 'email', javaType: 'String', mysqlType: 'VARCHAR(120) NOT NULL UNIQUE' },
      { name: 'password', javaType: 'String', mysqlType: 'VARCHAR(120) NOT NULL' },
      { name: 'location', javaType: 'String', mysqlType: 'VARCHAR(80) NOT NULL' }
    ],
    samplePostPayload: {
      name: 'Ananya Sharma',
      email: 'ananya.sharma@jobnova.in',
      password: 'Password123',
      location: 'Bengaluru, India'
    }
  }
];

function toSnakeCase(input: string): string {
  return input.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

function capitalize(input: string): string {
  return input ? input.charAt(0).toUpperCase() + input.slice(1) : '';
}

export function generateSpringBootFullStackBundle(spec: SpringBootEntitySpec): GeneratedSpringBootBundle {
  const entity = capitalize(spec.entityName.trim()) || 'Job';
  const varName = entity.charAt(0).toLowerCase() + entity.slice(1);
  const table = spec.tableName.trim() || `${toSnakeCase(entity)}s`;
  const firstStringField = spec.fields.find((f) => f.javaType === 'String')?.name || spec.fields[0]?.name || 'title';
  const firstStringCap = capitalize(firstStringField);

  const entityFields = spec.fields
    .map((f) => {
      const isEmailField = f.javaType === 'String' && f.name.toLowerCase().includes('email');
      const isPasswordField = f.javaType === 'String' && f.name.toLowerCase().includes('password');
      const annotations: string[] = [];
      if (f.javaType === 'String') {
        annotations.push(`    @NotBlank(message = "${f.name} is required")`);
        if (isEmailField) {
          annotations.push(`    @Email(message = "${f.name} must be a valid email address")`);
        } else if (isPasswordField) {
          annotations.push(`    @Size(min = 8, max = 100, message = "${f.name} must be between 8 and 100 characters")`);
        } else {
          annotations.push(`    @Size(min = 2, max = 255, message = "${f.name} must be between 2 and 255 characters")`);
        }
      } else {
        annotations.push(`    @NotNull(message = "${f.name} is required")`);
      }
      return `${annotations.join('\n')}\n    @Column(name = "${toSnakeCase(f.name)}", nullable = false)\n    private ${f.javaType} ${f.name};`;
    })
    .join('\n\n');

  const gettersSetters = spec.fields
    .map(
      (f) =>
        `    public ${f.javaType} get${capitalize(f.name)}() { return ${f.name}; }\n    public void set${capitalize(f.name)}(${f.javaType} ${f.name}) { this.${f.name} = ${f.name}; }`
    )
    .join('\n\n');

  const entityJava = `package com.jobnova.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "${table}")
public class ${entity} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${entityFields}

    public ${entity}() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

${gettersSetters}
}`;

  const repositoryJava = `package com.jobnova.repository;

import com.jobnova.model.${entity};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ${entity}Repository extends JpaRepository<${entity}, Long> {
    List<${entity}> findBy${firstStringCap}ContainingIgnoreCase(String keyword);

    @Query(value = "SELECT * FROM ${table} ORDER BY id DESC LIMIT :limit", nativeQuery = true)
    List<${entity}> findRecentRecords(@Param("limit") int limit);
}`;

  const firstStringGetter = `get${firstStringCap}()`;
  const serviceJava = `package com.jobnova.service;

import com.jobnova.model.${entity};
import com.jobnova.repository.${entity}Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;

@Service
public class ${entity}Service {
    private final ${entity}Repository repository;

    public ${entity}Service(${entity}Repository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<${entity}> findAllOrdered() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(${entity}::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<${entity}> searchByKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return findAllOrdered();
        }
        String normalized = keyword.trim().toLowerCase();
        return repository.findAll().stream()
                .filter(item -> item.${firstStringGetter} != null
                        && item.${firstStringGetter}.toLowerCase().contains(normalized))
                .toList();
    }

    @Transactional
    public ${entity} createValidated(${entity} payload) {
        if (payload == null || payload.${firstStringGetter} == null || payload.${firstStringGetter}.isBlank()) {
            throw new IllegalArgumentException("${firstStringField} must not be empty");
        }
        return repository.save(payload);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("${entity} not found for id=" + id);
        }
        repository.deleteById(id);
    }
}`;

  const controllerJava = `package com.jobnova.controller;

import com.jobnova.model.${entity};
import com.jobnova.service.${entity}Service;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("${spec.endpointPath}")
@CrossOrigin(origins = "http://localhost:3000")
public class ${entity}Controller {
    private final ${entity}Service service;

    public ${entity}Controller(${entity}Service service) {
        this.service = service;
    }

    @GetMapping
    public List<${entity}> listAll(@RequestParam(required = false) String q) {
        return service.searchByKeyword(q);
    }

    @PostMapping
    public ResponseEntity<${entity}> create(@Valid @RequestBody ${entity} payload) {
        ${entity} saved = service.createValidated(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBeanValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("exception", ex.getClass().getName());
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }
}`;

  const ddlCols = [
    '  `id` BIGINT NOT NULL AUTO_INCREMENT',
    ...spec.fields.map((f) => `  \`${toSnakeCase(f.name)}\` ${f.mysqlType}`),
    '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    '  PRIMARY KEY (`id`)',
    `  INDEX \`idx_${table}_${toSnakeCase(firstStringField)}\` (\`${toSnakeCase(firstStringField)}\`)`
  ];

  const mysqlDdl = `-- MySQL 8.0 Schema for JobNova (${entity})
CREATE TABLE IF NOT EXISTS \`${table}\` (
${ddlCols.join(',\n')}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const frontendJs = `// HTML5 + JavaScript Fetch Client for Spring Boot ${entity}Controller
async function load${entity}Records() {
  const res = await fetch('${spec.endpointPath}');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const items = await res.json();
  console.log('Loaded ${table}:', items.length);
  return items;
}

async function create${entity}(payload) {
  const res = await fetch('${spec.endpointPath}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}`;

  const displayField = spec.fields[0]?.name || 'id';
  const secondaryField = spec.fields[1]?.name || displayField;
  const reactComponentJsx = `import React, { useEffect, useState } from 'react';

export function ${entity}Directory() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('${spec.endpointPath}')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load ${table}');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setItems(Array.isArray(data) ? data : (data.alerts || []));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  const filtered = items.filter((item) =>
    String(item.${displayField} || '').toLowerCase().includes(query.trim().toLowerCase())
  );

  if (loading) return <p className="text-sm text-slate-500">Loading ${table}...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <section className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter ${table}..."
        className="px-3 py-2 text-sm border border-slate-300 rounded-lg w-full"
      />
      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
        {filtered.map((row) => (
          <li key={row.id} className="p-3 flex items-center justify-between text-sm">
            <span className="font-semibold">{row.${displayField}}</span>
            <span className="text-slate-500">{String(row.${secondaryField} || '')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}`;

  const selectCols = ['id', ...spec.fields.map((f) => toSnakeCase(f.name))].join(', ');
  const hibernateSqlTrace = `Hibernate: select ${varName}1_0.${selectCols.replace(/, /g, `, ${varName}1_0.`)} from ${table} ${varName}1_0`;

  return {
    entityJava,
    repositoryJava,
    serviceJava,
    controllerJava,
    mysqlDdl,
    frontendJs,
    reactComponentJsx,
    hibernateSqlTrace
  };
}

export function validateApiRequestBodyJson(
  rawJson: string
): { valid: true; parsed: Record<string, unknown> } | { valid: false; error: string } {
  const trimmed = rawJson.trim();
  if (!trimmed) {
    return { valid: false, error: 'Request JSON body cannot be empty.' };
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { valid: false, error: 'Request body must be a JSON object.' };
    }
    return { valid: true, parsed: parsed as Record<string, unknown> };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? `Invalid JSON: ${err.message}` : 'Invalid JSON payload.'
    };
  }
}

// ==================== HTML5 + CSS3 + JAVASCRIPT SANDBOX ====================

export interface WebSandboxPreset {
  id: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

export const WEB_SANDBOX_PRESETS: WebSandboxPreset[] = [
  {
    id: 'api-job-explorer',
    name: 'Live API Job Cards (Fetch + CSS Grid)',
    description: 'Fetches live roles from /api/jobs, filters by skill in JavaScript, and renders responsive CSS Grid cards.',
    html: `<section class="shell">
  <header class="topbar">
    <div>
      <p class="eyebrow">HTML5 · CSS3 · JavaScript + Backend API</p>
      <h2>JobNova Live Stack Explorer</h2>
    </div>
    <input id="skill-filter" type="search" placeholder="Filter skill (java, springboot, mysql, react)..." />
  </header>
  <div id="status-bar" class="status">Loading /api/jobs...</div>
  <div id="jobs-grid" class="grid"></div>
</section>`,
    css: `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; padding: 18px; }
.shell { max-width: 900px; margin: 0 auto; }
.topbar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.eyebrow { margin: 0 0 2px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #2557A7; }
h2 { margin: 0; font-size: 18px; }
#skill-filter { padding: 8px 12px; min-width: 260px; border: 1.5px solid #94a3b8; border-radius: 8px; font-size: 13px; background: #fff; }
.status { font-size: 12px; color: #475569; margin-bottom: 12px; font-family: monospace; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.card { background: #fff; border: 1.5px solid #b8c4d4; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 6px; }
.card-head { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.company { font-size: 12px; font-weight: 600; color: #475569; }
.ctc { font-size: 12px; font-weight: 700; color: #087F31; font-family: monospace; }
.title { font-size: 14px; font-weight: 700; margin: 0; }
.skills { font-size: 11px; color: #2557A7; font-family: monospace; }`,
    js: `const grid = document.getElementById('jobs-grid');
const status = document.getElementById('status-bar');
const filterInput = document.getElementById('skill-filter');
let allJobs = [];

function render(list) {
  grid.innerHTML = list.slice(0, 6).map((j) => \`
    <article class="card">
      <div class="card-head">
        <span class="company">\${j.company} · \${j.location}</span>
        <span class="ctc">\${j.ctc || 'Competitive'}</span>
      </div>
      <h3 class="title">\${j.title}</h3>
      <div class="skills">\${j.skills}</div>
    </article>
  \`).join('');
}

async function init() {
  try {
    const res = await fetch('/api/jobs');
    allJobs = await res.json();
    status.textContent = \`Connected: \${allJobs.length} roles loaded from /api/jobs\`;
    console.log('Fetched jobs count:', allJobs.length);
    render(allJobs);
  } catch (err) {
    status.textContent = 'Offline fallback preview active';
    console.warn('API fetch fallback:', err.message);
  }
}

filterInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allJobs.filter((j) =>
    (j.title + ' ' + j.skills + ' ' + j.company).toLowerCase().includes(q)
  );
  status.textContent = \`Showing \${filtered.length} matching roles\`;
  render(filtered);
});

init();`
  },
  {
    id: 'pipeline-widget',
    name: 'Application Stage Tracker (Interactive DOM)',
    description: 'Interactive vanilla JavaScript pipeline card switching between Applied, Interviewing, and Offer.',
    html: `<div class="panel">
  <div class="header">
    <div>
      <span class="badge">Java + Spring Boot · TCS</span>
      <h2>Backend Engineer Application</h2>
    </div>
    <span id="stage-label" class="stage">Interviewing</span>
  </div>
  <div class="steps" id="steps">
    <button data-stage="Applied">1. Applied</button>
    <button data-stage="Interviewing" class="active">2. Interviewing</button>
    <button data-stage="Offer Received">3. Offer Received</button>
  </div>
  <p id="log" class="log">Current milestone: Technical round scheduled with Spring Boot & MySQL panel.</p>
</div>`,
    css: `body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; }
.panel { max-width: 580px; margin: 0 auto; background: #1e293b; border: 1.5px solid #475569; border-radius: 12px; padding: 18px; }
.header { display: flex; justify-content: space-between; align-items: start; gap: 12px; margin-bottom: 14px; }
.badge { font-size: 11px; color: #93c5fd; font-family: monospace; }
h2 { margin: 4px 0 0; font-size: 18px; }
.stage { padding: 4px 10px; border-radius: 6px; border: 1px solid #38bdf8; color: #38bdf8; font-size: 12px; font-weight: 700; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.steps button { padding: 9px 10px; border-radius: 8px; border: 1.5px solid #475569; background: #0f172a; color: #cbd5e1; font-weight: 600; cursor: pointer; }
.steps button.active { background: #2557A7; border-color: #60a5fa; color: #fff; }
.log { margin: 14px 0 0; font-size: 13px; color: #cbd5e1; }`,
    js: `const buttons = document.querySelectorAll('#steps button');
const label = document.getElementById('stage-label');
const log = document.getElementById('log');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const stage = btn.dataset.stage;
    label.textContent = stage;
    log.textContent = 'Stage updated to: ' + stage;
    console.log('Pipeline stage changed ->', stage);
  });
});`
  },
  {
    id: 'spring-job-publisher',
    name: 'Spring Boot Job Publisher (HTML5 Form + POST)',
    description: 'Submits a validated HTML5 form via JavaScript POST /api/jobs to create a live backend job record.',
    html: `<section class="publisher">
  <header class="head">
    <h2>Publish Engineering Job</h2>
    <p>HTML5 validation + CSS3 form grid + JS POST /api/jobs</p>
  </header>
  <form id="job-form" class="form-grid">
    <label>Role Title <input id="f-title" required value="Java Spring Boot Developer" /></label>
    <label>Company <input id="f-company" required value="Zoho" /></label>
    <label>Location <input id="f-location" required value="Chennai" /></label>
    <label>CTC Benchmark <input id="f-ctc" required value="12.0 LPA" /></label>
    <label class="full">Tech Stack <input id="f-skills" required value="java,springboot,mysql,react" /></label>
    <button type="submit" class="btn">Publish to /api/jobs</button>
  </form>
  <div id="publish-result" class="result">Ready to POST validated payload to backend store.</div>
</section>`,
    css: `* { box-sizing: border-box; }
body { margin: 0; padding: 18px; font-family: system-ui, sans-serif; background: #f5f6f8; color: #0f172a; }
.publisher { max-width: 620px; margin: 0 auto; background: #fff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 18px; }
.head h2 { margin: 0; font-size: 17px; }
.head p { margin: 4px 0 14px; font-size: 12px; color: #475569; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: #334155; }
label.full { grid-column: 1 / -1; }
input { padding: 8px 10px; border: 1.5px solid #94a3b8; border-radius: 7px; font-size: 13px; }
.btn { grid-column: 1 / -1; margin-top: 4px; padding: 10px 14px; border: none; border-radius: 8px; background: #2557A7; color: #fff; font-weight: 700; cursor: pointer; }
.btn:hover { background: #164081; }
.result { margin-top: 12px; padding: 10px; border-radius: 8px; background: #f8fafc; border: 1px solid #cbd5e1; font-size: 12px; font-family: monospace; color: #087F31; }`,
    js: `const form = document.getElementById('job-form');
const output = document.getElementById('publish-result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('f-title').value.trim(),
    company: document.getElementById('f-company').value.trim(),
    location: document.getElementById('f-location').value.trim(),
    ctc: document.getElementById('f-ctc').value.trim(),
    skills: document.getElementById('f-skills').value.trim(),
    type: 'Full-Time'
  };
  output.textContent = 'Sending POST /api/jobs...';
  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Validation failed');
    output.textContent = 'Created Job #' + data.job.id + ': ' + data.job.title + ' at ' + data.job.company;
    console.log('POST /api/jobs -> HTTP', res.status, 'id=' + data.job.id);
  } catch (err) {
    output.textContent = 'Error: ' + err.message;
    console.error('Publish failed:', err.message);
  }
});`
  }
];

export function compileWebSandboxDocument(params: {
  html: string;
  css: string;
  js: string;
}): string {
  const safeJs = params.js.replace(/<\/script>/gi, '<\\/script>');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${params.css}</style>
</head>
<body>
${params.html}
<script>
(function() {
  function postConsole(level, args) {
    try {
      var text = Array.prototype.slice.call(args).map(function(item) {
        if (typeof item === 'object') {
          try { return JSON.stringify(item); } catch (e) { return String(item); }
        }
        return String(item);
      }).join(' ');
      window.parent.postMessage({ type: 'JOBNOVA_SANDBOX_CONSOLE', level: level, message: text }, '*');
    } catch (e) {}
  }
  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;
  console.log = function() { postConsole('log', arguments); return origLog.apply(console, arguments); };
  console.warn = function() { postConsole('warn', arguments); return origWarn.apply(console, arguments); };
  console.error = function() { postConsole('error', arguments); return origError.apply(console, arguments); };
  window.addEventListener('error', function(e) {
    postConsole('error', [e.message || 'Runtime Error']);
  });

  var pendingFetches = {};
  var reqCounter = 0;
  window.addEventListener('message', function(ev) {
    if (ev.data && ev.data.type === 'JOBNOVA_SANDBOX_FETCH_RES' && pendingFetches[ev.data.reqId]) {
      var entry = pendingFetches[ev.data.reqId];
      delete pendingFetches[ev.data.reqId];
      if (ev.data.error) {
        entry.reject(new Error(ev.data.error));
      } else {
        entry.resolve({
          ok: ev.data.ok,
          status: ev.data.status,
          json: function() { return Promise.resolve(ev.data.data); },
          text: function() { return Promise.resolve(JSON.stringify(ev.data.data)); }
        });
      }
    }
  });
  var origFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.startsWith('/api/')) {
      return new Promise(function(resolve, reject) {
        var reqId = 'req_' + (++reqCounter);
        pendingFetches[reqId] = { resolve: resolve, reject: reject };
        window.parent.postMessage({ type: 'JOBNOVA_SANDBOX_FETCH_REQ', reqId: reqId, url: url, options: options || {} }, '*');
      });
    }
    return origFetch ? origFetch(url, options) : Promise.reject(new Error('Fetch unavailable'));
  };
})();
</script>
<script>
try {
${safeJs}
} catch (err) {
  console.error(err && err.message ? err.message : String(err));
}
</script>
</body>
</html>`;
}
