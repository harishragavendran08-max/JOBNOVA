import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  ExternalLink,
  FileCode,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Zap
} from 'lucide-react';
import {
  executeMockMySqlQuery,
  evaluateFullStackChallenge,
  FULL_STACK_CHALLENGES,
  FullStackChallenge,
  MOCK_MYSQL_TABLES,
  MYSQL_SCHEMAS,
  PRESET_SQL_QUERIES,
  SPRING_BOOT_ANNOTATION_GUIDE,
  SqlQueryResult
} from '../utils/fullStackCodeLabLogic';

export const FullStackCodeLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mysql' | 'java-spring' | 'web-sandbox' | 'challenges'>('mysql');

  // MySQL Console State
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_SQL_QUERIES[0].sql);
  const [sqlResult, setSqlResult] = useState<SqlQueryResult>(() => executeMockMySqlQuery(PRESET_SQL_QUERIES[0].sql));
  const [selectedTable, setSelectedTable] = useState<string>('jobs');

  const handleRunSql = () => {
    const result = executeMockMySqlQuery(sqlQuery);
    setSqlResult(result);
  };

  // Challenges State
  const [selectedChallenge, setSelectedChallenge] = useState<FullStackChallenge>(FULL_STACK_CHALLENGES[0]);
  const [userCode, setUserCode] = useState<string>(FULL_STACK_CHALLENGES[0].starterCode);
  const [evaluationResult, setEvaluationResult] = useState<{
    passed: boolean;
    message: string;
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  } | null>(null);

  const handleSelectChallenge = (c: FullStackChallenge) => {
    setSelectedChallenge(c);
    setUserCode(c.starterCode);
    setEvaluationResult(null);
  };

  const handleEvaluateChallenge = () => {
    const res = evaluateFullStackChallenge(selectedChallenge, userCode);
    setEvaluationResult(res);
  };

  // Web Sandbox State (HTML/CSS/JS/React)
  const [htmlCode, setHtmlCode] = useState<string>(
`<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
  <h2 style="margin: 0 0 10px 0; color: #38bdf8;">Full-Stack Software Engineer · Live Preview</h2>
  <p style="color: #94a3b8; font-size: 14px; margin-bottom: 16px;">
    Testing HTML5 + CSS3 + JavaScript frontend logic for JobNova Campus Placement.
  </p>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <span style="background: #1e293b; color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-family: monospace;">Java</span>
    <span style="background: #1e293b; color: #4ade80; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-family: monospace;">Spring Boot</span>
    <span style="background: #1e293b; color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-family: monospace;">React.js</span>
    <span style="background: #1e293b; color: #fbbf24; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-family: monospace;">MySQL</span>
  </div>
  <button onclick="document.getElementById('demo-output').innerText = 'Backend connection verified: 200 OK via Spring Boot 3.5 REST endpoint!';" style="margin-top: 16px; background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">
    Verify Full-Stack Status
  </button>
  <div id="demo-output" style="margin-top: 12px; font-size: 13px; color: #34d399; font-weight: 500;"></div>
</div>`
  );

  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopySnippet = (key: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-4 h-4" />
              <span>Full-Stack Engineering Workbench &amp; Simulator</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Java · Spring Boot · React.js · JavaScript · HTML5 · CSS3 · MySQL Lab
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Professional engineering environment designed for campus placement preparation. Execute live MySQL queries on the placement database, review Spring Boot architectural contracts, preview frontend code, and evaluate code challenges.
            </p>
          </div>

          {/* Module Switcher Buttons */}
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 self-start md:self-center overflow-x-auto"
            role="group"
            aria-label="Code Lab Mode"
          >
            <button
              type="button"
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
              onClick={() => setActiveTab('web-sandbox')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'web-sandbox'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Web Sandbox (React/HTML)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'challenges'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Code Challenges</span>
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
                    MySQL 8.0 · jobnova_db (In-Memory Engine)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSqlQuery('SELECT * FROM jobs;')}
                    className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
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
                  rows={4}
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Type SQL query (e.g. SELECT * FROM jobs WHERE ctc_lpa >= 8.0;)..."
                  className="w-full p-3.5 text-xs font-mono bg-slate-950 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Preset SQL Queries Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Query Presets
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SQL_QUERIES.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSqlQuery(preset.sql);
                        const res = executeMockMySqlQuery(preset.sql);
                        setSqlResult(res);
                      }}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
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
                  4 Tables
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {MYSQL_SCHEMAS.map((schema) => (
                  <button
                    key={schema.name}
                    type="button"
                    onClick={() => {
                      setSelectedTable(schema.name);
                      const q = `SELECT * FROM ${schema.name} LIMIT 10;`;
                      setSqlQuery(q);
                      setSqlResult(executeMockMySqlQuery(q));
                    }}
                    className={`px-3 py-2 text-left text-xs font-mono rounded-lg transition-colors cursor-pointer border ${
                      selectedTable === schema.name
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>{schema.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{schema.rowCount} rows</div>
                  </button>
                ))}
              </div>

              {/* Columns for selected table */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Columns in <span className="font-mono text-indigo-600 dark:text-indigo-400">{selectedTable}</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {MYSQL_SCHEMAS.find((s) => s.name === selectedTable)?.columns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between text-xs font-mono py-1 px-2 rounded bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    >
                      <span>{col.name}</span>
                      <span className="text-[10px] text-slate-400">{col.type} {col.key && `[${col.key}]`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Query Results Data Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-900 dark:text-slate-100">Query Results:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  {sqlResult.rowCount} rows returned
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 tabular-nums">{sqlResult.executionTimeMs}ms execution time</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Engine: MySQL Memory Table</span>
            </div>

            {sqlResult.error ? (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 text-slate-800 dark:text-slate-200 tabular-nums">
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
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Spring Boot 3.5 &amp; Java 17 Architectural Contract Reference
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Understand the core annotations and best practices expected in enterprise Java and Spring Boot technical interviews:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SPRING_BOOT_ANNOTATION_GUIDE.map((item) => (
              <div
                key={item.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.layer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="relative pt-2">
                    <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                      {item.codeSnippet}
                    </pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 leading-tight">
                    <strong>Rule:</strong> {item.keyRule}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(item.name, item.codeSnippet)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    {copiedSnippet === item.name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSnippet === item.name ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 3. WEB SANDBOX (REACT · HTML5 · CSS3 · JS) ==================== */}
      {activeTab === 'web-sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Editor Pane */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                  Frontend Code Editor (HTML5 / CSS3 / JavaScript)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setHtmlCode(
                      `<div style="font-family: sans-serif; padding: 16px; background: #1e1b4b; color: white; border-radius: 8px;">\n  <h3>JobNova React Component</h3>\n  <p>Live interactive web sandbox.</p>\n</div>`
                    )
                  }
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Load Minimal Template
                </button>
              </div>
              <textarea
                rows={14}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-cyan-300 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 leading-relaxed resize-y"
                spellCheck={false}
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Live updates automatically render in the iframe preview on the right.
            </div>
          </div>

          {/* Live Preview Pane */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Rendered Output
              </span>
              <span className="text-[11px] font-mono text-slate-400">Isolated Sandbox</span>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white min-h-[340px]">
              <iframe
                title="Frontend Sandbox Live Render"
                srcDoc={htmlCode}
                sandbox="allow-scripts"
                className="w-full h-80 border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. PLACEMENT CODE CHALLENGES ==================== */}
      {activeTab === 'challenges' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Challenge Selector */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Full-Stack Challenges ({FULL_STACK_CHALLENGES.length})
            </h3>
            <div className="space-y-2">
              {FULL_STACK_CHALLENGES.map((challenge) => (
                <button
                  key={challenge.id}
                  type="button"
                  onClick={() => handleSelectChallenge(challenge)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedChallenge.id === challenge.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{challenge.technology}</span>
                    <span className="font-mono">{challenge.difficulty}</span>
                  </div>
                  <div className="text-xs font-semibold line-clamp-1">{challenge.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Challenge Workspace */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {selectedChallenge.technology} · {selectedChallenge.difficulty}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedChallenge.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedChallenge.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleEvaluateChallenge}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Solution</span>
              </button>
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
