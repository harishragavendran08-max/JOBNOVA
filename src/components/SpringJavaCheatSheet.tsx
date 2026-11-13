import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Copy,
  Filter,
  MessageSquarePlus,
  RotateCcw,
  Search
} from 'lucide-react';
import { InternshipItem, JobItem } from '../data/seedData';
import {
  buildPipelineCheatSheet,
  CHEAT_SHEET_MASTERED_STORAGE_KEY,
  CHEAT_SHEET_TOPICS,
  CheatSheetTopic,
  computeCheatSheetProgress,
  filterCheatSheetItems
} from '../utils/cheatSheetLogic';
import { ApplicationStageRecord } from '../utils/jobnovaLogic';

interface SpringJavaCheatSheetProps {
  jobs: JobItem[];
  savedJobIds: number[];
  internships?: InternshipItem[];
  appliedInternshipIds?: number[];
  stageRecords?: Record<number, ApplicationStageRecord>;
  userSkills?: string[];
  onAskFollowUp?: (questionPrompt: string) => void;
}

export const SpringJavaCheatSheet: React.FC<SpringJavaCheatSheetProps> = ({
  jobs,
  savedJobIds,
  internships = [],
  appliedInternshipIds = [],
  stageRecords = {},
  userSkills = [],
  onAskFollowUp
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'ALL' | CheatSheetTopic>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineOnly, setPipelineOnly] = useState(false);
  const [masteryFilter, setMasteryFilter] = useState<'ALL' | 'UNREVIEWED' | 'MASTERED'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [reviewedIds, setReviewedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(CHEAT_SHEET_MASTERED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read failure
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CHEAT_SHEET_MASTERED_STORAGE_KEY, JSON.stringify(reviewedIds));
    } catch {
      // Ignore storage write failure
    }
  }, [reviewedIds]);

  const pipelineJobs = useMemo(
    () => jobs.filter((job) => savedJobIds.includes(job.id)),
    [jobs, savedJobIds]
  );

  const pipelineInternships = useMemo(
    () => internships.filter((intern) => appliedInternshipIds.includes(intern.id)),
    [internships, appliedInternshipIds]
  );

  const cheatSheetData = useMemo(
    () =>
      buildPipelineCheatSheet({
        pipelineJobs,
        pipelineInternships,
        stageRecords,
        userSkills
      }),
    [pipelineJobs, pipelineInternships, stageRecords, userSkills]
  );

  // Open the highest-priority pipeline question by default on initial mount
  useEffect(() => {
    if (cheatSheetData.items.length > 0 && Object.keys(expandedIds).length === 0) {
      setExpandedIds({ [cheatSheetData.items[0].question.id]: true });
    }
  }, [cheatSheetData.items, expandedIds]);

  const filteredItems = useMemo(
    () =>
      filterCheatSheetItems({
        items: cheatSheetData.items,
        topic: selectedTopic,
        searchQuery,
        pipelineOnly,
        masteryFilter,
        reviewedIds
      }),
    [cheatSheetData.items, selectedTopic, searchQuery, pipelineOnly, masteryFilter, reviewedIds]
  );

  const progress = useMemo(
    () =>
      computeCheatSheetProgress({
        items: cheatSheetData.items,
        reviewedIds
      }),
    [cheatSheetData.items, reviewedIds]
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleReviewed = (id: string) => {
    setReviewedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyCode = (id: string, code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExpandAll = () => {
    const allOpen = filteredItems.every((i) => expandedIds[i.question.id]);
    const next: Record<string, boolean> = {};
    for (const item of filteredItems) {
      next[item.question.id] = !allOpen;
    }
    setExpandedIds((prev) => ({ ...prev, ...next }));
  };

  const handleResetFilters = () => {
    setSelectedTopic('ALL');
    setSearchQuery('');
    setPipelineOnly(false);
    setMasteryFilter('ALL');
  };

  const allVisibleExpanded =
    filteredItems.length > 0 && filteredItems.every((i) => expandedIds[i.question.id]);

  return (
    <div className="space-y-6" data-testid="spring-java-cheat-sheet">
      {/* Pipeline Tailoring Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Pipeline-Tailored Technical Prep</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Spring Boot &amp; Java Interview Cheat Sheet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Questions are automatically ranked against the technical requirements of roles currently in your career pipeline. Review concise 30-second answers, code patterns, and common interviewer follow-ups.
            </p>
          </div>

          {/* Readiness Progress Block (Single-Elevation Inline Metric) */}
          <div className="lg:w-80 shrink-0 pt-2 lg:pt-0 lg:pl-6 lg:border-l border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {progress.pipelineTotal > 0 ? 'Pipeline Readiness' : 'Core Track Readiness'}
              </span>
              <span
                data-testid="cheat-sheet-readiness-percent"
                className="text-lg font-bold font-mono tabular-nums text-[#2557A7] dark:text-blue-400"
              >
                {progress.readinessPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-[#2557A7] dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${progress.readinessPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
              {progress.pipelineTotal > 0 ? (
                <span>
                  {progress.pipelineReviewedCount}/{progress.pipelineTotal} pipeline topics
                </span>
              ) : (
                <span>
                  {progress.reviewedCount}/{progress.total} core topics
                </span>
              )}
              <span>{progress.reviewedCount} mastered</span>
            </div>
          </div>
        </div>

        {/* Active Career Pipeline Context Strip */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          {cheatSheetData.isPipelineEmpty ? (
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>
                Your career pipeline currently has no applied jobs or internships. Showing the complete Spring Boot &amp; Java Core Track until you apply to target roles.
              </span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Active Pipeline ({cheatSheetData.pipelineRoles.length}):</span>
                </span>
                {cheatSheetData.pipelineRoles.map((role, idx) => (
                  <React.Fragment key={role.key}>
                    {idx > 0 && (
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                    )}
                    <span data-testid={`pipeline-role-${role.key}`}>
                      <strong className="font-semibold text-slate-900 dark:text-slate-100">
                        {role.title}
                      </strong>{' '}
                      @ {role.company}{' '}
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        ({role.stage})
                      </span>
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {cheatSheetData.topRequiredTokens.length > 0 && (
                <div className="text-slate-500 dark:text-slate-400 font-mono shrink-0">
                  Detected Stack: {cheatSheetData.topRequiredTokens.slice(0, 6).join(' · ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <label htmlFor="cheat-sheet-search" className="sr-only">
              Search Spring Boot and Java interview questions
            </label>
            <input
              id="cheat-sheet-search"
              data-testid="cheat-sheet-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic, annotation, or company (e.g. @Transactional, N+1, HashMap, TCS)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          {/* Pipeline & Mastery Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="pipeline-only-toggle"
              aria-pressed={pipelineOnly}
              disabled={cheatSheetData.isPipelineEmpty || !cheatSheetData.hasJavaSpringPipelineMatch}
              onClick={() => setPipelineOnly((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-45 disabled:cursor-not-allowed ${
                pipelineOnly
                  ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Pipeline Required Only ({progress.pipelineTotal})</span>
            </button>

            <div
              className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0"
              role="group"
              aria-label="Filter by mastery status"
            >
              {(['ALL', 'UNREVIEWED', 'MASTERED'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setMasteryFilter(status)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    masteryFilter === status
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {status === 'ALL'
                    ? 'All'
                    : status === 'UNREVIEWED'
                    ? 'To Review'
                    : 'Mastered'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExpandAll}
              disabled={filteredItems.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-45"
            >
              {allVisibleExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Topic Filter Buttons */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          role="group"
          aria-label="Filter cheat sheet questions by topic"
        >
          <button
            type="button"
            data-testid="topic-filter-ALL"
            onClick={() => setSelectedTopic('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedTopic === 'ALL'
                ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Topics ({cheatSheetData.items.length})
          </button>
          {CHEAT_SHEET_TOPICS.map((topic) => {
            const count = cheatSheetData.items.filter((i) => i.question.topic === topic).length;
            return (
              <button
                key={topic}
                type="button"
                data-testid={`topic-filter-${topic.replace(/[^a-zA-Z0-9]/g, '_')}`}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedTopic === topic
                    ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {topic} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Row */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
        <span>
          Showing{' '}
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {filteredItems.length}
          </span>{' '}
          of{' '}
          <span className="font-mono tabular-nums">{cheatSheetData.items.length}</span>{' '}
          Spring Boot &amp; Java questions
        </span>
        {(selectedTopic !== 'ALL' || searchQuery || pipelineOnly || masteryFilter !== 'ALL') && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Questions List or Empty Filter State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No cheat sheet topics match your current filter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try clearing your search query, disabling the pipeline filter, or switching to All Topics.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Questions</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, idx) => {
            const { question, matchedRoles, matchedTokens, isPipelineRequired } = item;
            const isExpanded = Boolean(expandedIds[question.id]);
            const isReviewed = reviewedIds.includes(question.id);

            return (
              <article
                key={question.id}
                data-testid={`cheat-sheet-card-${question.id}`}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 space-y-3.5 ${
                  isReviewed
                    ? 'border-emerald-300 dark:border-emerald-800/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Metadata & Mastered Toggle */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Unboxed inline metadata row (zero-pill discipline) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        Q{String(idx + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {question.topic}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{question.difficulty}</span>
                      {isPipelineRequired && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span
                            data-testid={`pipeline-priority-${question.id}`}
                            className="font-semibold text-emerald-700 dark:text-emerald-400"
                          >
                            Pipeline Priority ({matchedTokens.join(', ')})
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {question.question}
                    </h3>
                  </div>

                  <button
                    type="button"
                    data-testid={`mark-mastered-${question.id}`}
                    aria-pressed={isReviewed}
                    onClick={() => toggleReviewed(question.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isReviewed
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                  >
                    {isReviewed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Mark Mastered</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Matched Pipeline Roles Line */}
                {isPipelineRequired && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Required by pipeline:
                    </span>
                    {matchedRoles.map((mr, rIdx) => (
                      <React.Fragment key={mr.roleKey}>
                        {rIdx > 0 && <span aria-hidden="true">·</span>}
                        <span>
                          {mr.title} @ {mr.company} ({mr.stage})
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Concise 30-Second Verbal Answer */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                  {question.conciseAnswer}
                </div>

                {/* Action Row: Expand Deep Dive & Ask AI */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    data-testid={`toggle-details-${question.id}`}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(question.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide Code &amp; Deep Dive</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Show Code, Deep Dive &amp; Follow-up</span>
                      </>
                    )}
                  </button>

                  {onAskFollowUp && (
                    <button
                      type="button"
                      data-testid={`ask-ai-followup-${question.id}`}
                      onClick={() =>
                        onAskFollowUp(
                          `Explain this Spring Boot & Java technical follow-up for my pipeline roles: "${question.interviewerFollowUp}" (Topic: ${question.question})`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Ask AI Follow-up</span>
                    </button>
                  )}
                </div>

                {/* Expanded Deep Dive, Code Snippet & Interviewer Follow-up */}
                {isExpanded && (
                  <div
                    data-testid={`cheat-sheet-details-${question.id}`}
                    className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
                  >
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        What Interviewers Listen For
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                        {question.deepDiveNotes.map((note, noteIdx) => (
                          <li key={noteIdx} className="leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {question.codeSnippet && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Reference Pattern
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(question.id, question.codeSnippet!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {copiedId === question.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Snippet</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                          <code>{question.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Common Interviewer Follow-up
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {question.interviewerFollowUp}
                      </p>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
