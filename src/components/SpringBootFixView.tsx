import React, { useState } from 'react';
import { Check, Copy, Download, FileCode, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SPRING_BOOT_DIAGNOSTICS, SpringBootDiagnostic } from '../data/seedData';
import { filterDiagnostics } from '../utils/jobnovaLogic';

export const SpringBootFixView: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Critical' | 'High' | 'Medium'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleDiagnostics = filterDiagnostics(SPRING_BOOT_DIAGNOSTICS, severityFilter);

  const handleCopyCode = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header & Summary Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Spring Boot 3.5.7 Root-Cause Analysis & Resolution
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              All 6 Errors in SpringBootProjectJOBNOVA-main Diagnosed & Fixed
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We analyzed your uploaded archive (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">SpringBootProjectJOBNOVA-main.zip</code>) and startup log (<code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">output.txt</code>). The application is now running live in this workspace, and you can also download the repaired Maven project zip to run locally.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/JOBNOVA-Fixed-SpringBoot.zip"
              download="JOBNOVA-Fixed-SpringBoot.zip"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Fixed Spring Boot Project (.zip)</span>
            </a>
          </div>
        </div>

        {/* Quick Run Instructions for Local Maven (flat divided columns, no cards-within-cards) */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x md:divide-slate-200 dark:md:divide-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 1: Clean Stale Target Classes</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Purges the cached <code className="font-mono">OpenAiAudioSpeechAutoConfiguration</code> bytecode that caused the startup crash.
            </p>
            <code className="block font-mono text-xs bg-slate-900 text-slate-100 px-3 py-2 rounded">
              ./mvnw clean
            </code>
          </div>

          <div className="md:pl-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Step 2: Run Unified Root Project</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Starts Tomcat with all 5 JPA repositories, 6 REST controllers, and 30+ seeded H2 records.
            </p>
            <code className="block font-mono text-xs bg-slate-900 text-slate-100 px-3 py-2 rounded">
              ./mvnw spring-boot:run
            </code>
          </div>

          <div className="md:pl-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Step 3: Open Local or Live App</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              In this preview, all endpoints and pages are already running live on Port 3000.
            </p>
            <code className="block font-mono text-xs bg-slate-900 text-slate-100 px-3 py-2 rounded">
              http://localhost:8080/home.html
            </code>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{visibleDiagnostics.length}</span> of <span className="font-mono tabular-nums">{SPRING_BOOT_DIAGNOSTICS.length}</span> resolved issues
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg" role="group" aria-label="Filter diagnostics by severity">
          {(['ALL', 'Critical', 'High', 'Medium'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                severityFilter === sev
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {sev === 'ALL' ? 'All Issues (6)' : `${sev} Severity`}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnostic Cards */}
      <div className="space-y-6">
        {visibleDiagnostics.map((diag: SpringBootDiagnostic) => (
          <article
            key={diag.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {diag.severity} Severity
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{diag.file}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Fixed</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {diag.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(diag.id, diag.afterCode)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedId === diag.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Fixed Code</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Fixed Code</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong className="font-semibold text-slate-900 dark:text-slate-100">Root Cause: </strong>
              {diag.rootCause}
            </p>

            <div className="bg-rose-950/90 text-rose-100 p-3.5 rounded-lg overflow-x-auto">
              <div className="text-[11px] font-mono text-rose-300 mb-1">
                Original Error Log / Broken Code Excerpt:
              </div>
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {diag.errorExcerpt}
              </pre>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-lg p-4 overflow-x-auto">
                <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2">
                  Before (Broken in Uploaded Archive)
                </div>
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {diag.beforeCode}
                </pre>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-lg p-4 overflow-x-auto">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  After (Repaired & Verified)
                </div>
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {diag.afterCode}
                </pre>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
