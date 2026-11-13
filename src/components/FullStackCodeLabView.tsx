import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Code2,
  Database,
  FileCode,
  Play,
  RotateCcw,
  Terminal,
  Zap
} from 'lucide-react';
import type { JobItem } from '../data/seedData';
import type { UserAlertRecord } from '../utils/userAlertsLogic';
import {
  createMySqlSandboxState,
  evaluateFullStackChallenge,
  executeStatefulMySqlQuery,
  FULL_STACK_CHALLENGES,
  FullStackChallenge,
  MySqlDatabaseState,
  PRESET_SQL_QUERIES,
  SqlQueryResult
} from '../utils/fullStackCodeLabLogic';
import { SpringBootGeneratorPanel } from './SpringBootGeneratorPanel';
import { WebSandboxStudio } from './WebSandboxStudio';

interface FullStackCodeLabViewProps {
  jobs?: JobItem[];
  userAlerts?: UserAlertRecord[];
  onJobsUpdated?: () => void;
}

const SOLVED_CHALLENGES_KEY = 'jobnova_codelab_solved';

export const FullStackCodeLabView: React.FC<FullStackCodeLabViewProps> = ({
  jobs,
  userAlerts,
  onJobsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'java-spring' | 'web-sandbox' | 'challenges'>('mysql');

  // Stateful MySQL Workbench State
  const [dbState, setDbState] = useState<MySqlDatabaseState>(() =>
    createMySqlSandboxState(jobs, userAlerts)
  );
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_SQL_QUERIES[0].sql);
  const [sqlResult, setSqlResult] = useState<SqlQueryResult>(() =>
    executeStatefulMySqlQuery(PRESET_SQL_QUERIES[0].sql, createMySqlSandboxState(jobs, userAlerts)).result
  );
  const [selectedTable, setSelectedTable] = useState<string>('jobs');

  // Keep user_alerts table synced when alerts change without wiping user-created tables
  useEffect(() => {
    setDbState((prev) => {
      const fresh = createMySqlSandboxState(jobs, userAlerts);
      return {
        tables: {
          ...prev.tables,
          user_alerts: fresh.tables.user_alerts
        },
        schemas: prev.schemas.map((s) =>
          s.name === 'user_alerts' ? { ...s, rowCount: fresh.tables.user_alerts.length } : s
        )
      };
    });
  }, [userAlerts, jobs]);

  const runSqlStatement = (statement: string) => {
    const { result, nextState } = executeStatefulMySqlQuery(statement, dbState);
    setDbState(nextState);
    setSqlResult(result);
  };

  const handleRunSql = () => {
    runSqlStatement(sqlQuery);
  };

  const handleResetDatabase = () => {
    const fresh = createMySqlSandboxState(jobs, userAlerts);
    setDbState(fresh);
    const defaultSql = PRESET_SQL_QUERIES[0].sql;
    setSqlQuery(defaultSql);
    setSqlResult(executeStatefulMySqlQuery(defaultSql, fresh).result);
    setSelectedTable('jobs');
  };

  // Challenges State
  const [challengeFilter, setChallengeFilter] = useState<string>('ALL');
  const [selectedChallenge, setSelectedChallenge] = useState<FullStackChallenge>(FULL_STACK_CHALLENGES[0]);
  const [userCode, setUserCode] = useState<string>(FULL_STACK_CHALLENGES[0].starterCode);
  const [solvedIds, setSolvedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SOLVED_CHALLENGES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [evaluationResult, setEvaluationResult] = useState<{
    passed: boolean;
    message: string;
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(SOLVED_CHALLENGES_KEY, JSON.stringify(solvedIds));
    } catch {
      // Ignore storage failures
    }
  }, [solvedIds]);

  const handleSelectChallenge = (c: FullStackChallenge) => {
    setSelectedChallenge(c);
    setUserCode(c.starterCode);
    setEvaluationResult(null);
  };

  const handleEvaluateChallenge = () => {
    const res = evaluateFullStackChallenge(selectedChallenge, userCode);
    setEvaluationResult(res);
    if (res.passed && !solvedIds.includes(selectedChallenge.id)) {
      setSolvedIds((prev) => [...prev, selectedChallenge.id]);
    }
  };

  const filteredChallenges =
    challengeFilter === 'ALL'
      ? FULL_STACK_CHALLENGES
      : FULL_STACK_CHALLENGES.filter((c) => c.technology === challengeFilter);

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span>HTML5 · CSS3 · JavaScript · Java 17 · Spring Boot 3.5 · MySQL 8.0 Lab</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Full-Stack Engineering Workbench
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Run stateful MySQL queries (SELECT, GROUP BY, JOIN, INSERT, UPDATE, CREATE TABLE), generate Java + Spring Boot + MySQL code &amp; test REST endpoints, and build live HTML5/CSS3/JS interfaces.
            </p>
          </div>

          {/* Module Switcher Buttons */}
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shrink-0 self-start md:self-center overflow-x-auto"
            role="group"
            aria-label="Code Lab Mode"
          >
            <button
              type="button"
              data-testid="codelab-tab-mysql"
              onClick={() => setActiveTab('mysql')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'mysql'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>MySQL Workbench</span>
            </button>
            <button
              type="button"
              data-testid="codelab-tab-java-spring"
              onClick={() => setActiveTab('java-spring')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'java-spring'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Java &amp; Spring Boot</span>
            </button>
            <button
              type="button"
              data-testid="codelab-tab-web-sandbox"
              onClick={() => setActiveTab('web-sandbox')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'web-sandbox'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>HTML / CSS / JS Studio</span>
            </button>
            <button
              type="button"
              data-testid="codelab-tab-challenges"
              onClick={() => setActiveTab('challenges')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'challenges'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Challenges ({solvedIds.length}/{FULL_STACK_CHALLENGES.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 1. MYSQL WORKBENCH TAB ==================== */}
      {activeTab === 'mysql' && (
        <div className="space-y-6">
          {/* Query Editor & Table Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Query Editor & Execution */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    MySQL 8.0 · jobnova_db (Stateful In-Session Engine)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="mysql-reset-db-btn"
                    onClick={handleResetDatabase}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset DB</span>
                  </button>
                  <button
                    type="button"
                    data-testid="mysql-run-query-btn"
                    onClick={handleRunSql}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              {/* SQL Textarea */}
              <div className="relative">
                <label htmlFor="sql-query-input" className="sr-only">
                  SQL Query Statement
                </label>
                <textarea
                  id="sql-query-input"
                  data-testid="mysql-query-textarea"
                  rows={4}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Run SELECT, GROUP BY, JOIN, INSERT INTO, UPDATE, DELETE, CREATE TABLE, or SHOW CREATE TABLE..."
                  className="w-full p-3.5 text-xs font-mono bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Preset SQL Queries Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Query Presets (SELECT · GROUP BY · JOIN · INSERT)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SQL_QUERIES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSqlQuery(preset.sql);
                        runSqlStatement(preset.sql);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Database Schema Explorer */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Schema Explorer</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {dbState.schemas.length} Tables
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {dbState.schemas.map((schema) => (
                  <button
                    key={schema.name}
                    type="button"
                    data-testid={`mysql-table-btn-${schema.name}`}
                    onClick={() => {
                      setSelectedTable(schema.name);
                      const q = `SELECT * FROM ${schema.name} LIMIT 10;`;
                      setSqlQuery(q);
                      runSqlStatement(q);
                    }}
                    className={`px-3 py-2 text-left text-xs font-mono rounded-lg transition-colors cursor-pointer border ${
                      selectedTable === schema.name
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{schema.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans tabular-nums">{schema.rowCount} rows</div>
                  </button>
                ))}
              </div>

              {/* Columns for selected table */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Columns in <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedTable}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const q = `SHOW CREATE TABLE ${selectedTable};`;
                      setSqlQuery(q);
                      runSqlStatement(q);
                    }}
                    className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    SHOW DDL
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {dbState.schemas.find((s) => s.name === selectedTable)?.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    >
                      <span>{col.name}</span>
                      <span className="text-[10px] text-slate-500">{col.type} {col.key && `[${col.key}]`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Query Results Data Grid */}
          <div
            data-testid="mysql-results-panel"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-900 dark:text-slate-100">Query Results:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {sqlResult.rowCount} rows {sqlResult.queryType === 'SELECT' ? 'returned' : 'affected'}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 tabular-nums">{sqlResult.executionTimeMs}ms</span>
                {sqlResult.message && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{sqlResult.message}</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Engine: MySQL 8.0 Sandbox</span>
            </div>

            {sqlResult.error ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono">
                <strong>Error: </strong> {sqlResult.error}
              </div>
            ) : sqlResult.rows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                Empty set (0.00 sec). No records matched the WHERE condition.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
                    <tr>
                      {sqlResult.columns.map((col, idx) => (
                        <th key={`${col}-${idx}`} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[11px]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 text-slate-800 dark:text-slate-200 tabular-nums whitespace-pre-wrap">
                            {cell === null ? (
                              <span className="text-slate-400 italic">NULL</span>
                            ) : typeof cell === 'boolean' ? (
                              cell ? 'TRUE' : 'FALSE'
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 2. JAVA & SPRING BOOT ARCHITECTURE LAB ==================== */}
      {activeTab === 'java-spring' && (
        <SpringBootGeneratorPanel onJobsUpdated={onJobsUpdated} />
      )}

      {/* ==================== 3. HTML5 / CSS3 / JAVASCRIPT STUDIO ==================== */}
      {activeTab === 'web-sandbox' && (
        <WebSandboxStudio />
      )}

      {/* ==================== 4. PLACEMENT CODE CHALLENGES ==================== */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Challenge Selector */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Full-Stack Challenges ({filteredChallenges.length})
              </h3>
              <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                {solvedIds.length}/{FULL_STACK_CHALLENGES.length} Solved
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter challenges by technology">
              {['ALL', 'Java', 'Spring Boot', 'MySQL', 'JavaScript', 'HTML5/CSS3', 'React'].map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setChallengeFilter(tech)}
                  className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                    challengeFilter === tech
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredChallenges.map((challenge) => {
                const isSolved = solvedIds.includes(challenge.id);
                return (
                  <button
                    key={challenge.id}
                    type="button"
                    onClick={() => handleSelectChallenge(challenge)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedChallenge.id === challenge.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{challenge.technology}</span>
                      <span className="font-mono">
                        {isSolved ? '✓ Solved' : challenge.difficulty}
                      </span>
                    </div>
                    <div className="text-xs font-semibold line-clamp-1">{challenge.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Challenge Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {selectedChallenge.technology} · {selectedChallenge.difficulty}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                  {selectedChallenge.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedChallenge.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedChallenge.technology === 'MySQL' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSqlQuery(userCode);
                      runSqlStatement(userCode);
                      setActiveTab('mysql');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Run in MySQL</span>
                  </button>
                )}
                <button
                  type="button"
                  data-testid="challenge-verify-btn"
                  onClick={handleEvaluateChallenge}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Solution</span>
                </button>
              </div>
            </div>

            {/* Code Input */}
            <div className="relative">
              <textarea
                rows={10}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>

            {/* Evaluation Results Banner */}
            {evaluationResult && (
              <div
                data-testid="challenge-evaluation-banner"
                className={`p-4 rounded-xl border text-xs ${
                  evaluationResult.passed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm mb-1">
                  <span>Score: {evaluationResult.score}% · {evaluationResult.passed ? 'PASSED ✓' : 'INCOMPLETE'}</span>
                  <span className="font-mono text-xs">Target: 75%</span>
                </div>
                <p className="leading-relaxed">{evaluationResult.message}</p>
                <div className="mt-2 text-[11px] opacity-80">
                  <strong>Explanation: </strong> {selectedChallenge.testExplanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
