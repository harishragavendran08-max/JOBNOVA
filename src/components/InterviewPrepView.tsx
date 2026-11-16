import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Sparkles
} from 'lucide-react';
import type { JobItem } from '../data/seedData';
import type {
  ApplicationStageRecord,
  InterviewConfidenceRating
} from '../utils/jobnovaLogic';
import { aggregateInterviewFeedbackRecords } from '../utils/interviewPrepAnalyticsLogic';

interface InterviewPrepViewProps {
  jobs: JobItem[];
  appliedJobIds: number[];
  stageRecords: Record<number, ApplicationStageRecord>;
  isDarkMode?: boolean;
  onAddInterviewFeedback: (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
    timestamp?: string;
  }) => void;
  onOpenMockInterview?: () => void;
  onExploreJobs?: () => void;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  jobs,
  appliedJobIds,
  stageRecords,
  onAddInterviewFeedback,
  onOpenMockInterview,
  onExploreJobs
}) => {
  const [confidenceFilter, setConfidenceFilter] = useState<InterviewConfidenceRating | 'ALL'>('ALL');
  const [companyFilter, setCompanyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick-Log Form State
  const defaultJobId = appliedJobIds[0] || jobs[0]?.id || 1;
  const [formJobId, setFormJobId] = useState<number>(defaultJobId);
  const [formRoundTitle, setFormRoundTitle] = useState<string>(
    'Round 2: System Design & Spring Boot Microservices'
  );
  const [formFormat, setFormFormat] = useState<string>(
    'Principal Architect · 60m Architecture Deep Dive'
  );
  const [formQuestions, setFormQuestions] = useState<string>(
    'Spring Boot Bean Validation (@NotBlank, @Email), MySQL read replicas, and circuit breaker resilience'
  );
  const [formTakeaways, setFormTakeaways] = useState<string>(
    'Explained @RestControllerAdvice validation error contracts and idempotent API design clearly.'
  );
  const [formConfidence, setFormConfidence] = useState<InterviewConfidenceRating>('Strong');
  const [formError, setFormError] = useState<string | null>(null);

  const summary = useMemo(
    () =>
      aggregateInterviewFeedbackRecords({
        stageRecords,
        jobs,
        confidenceFilter,
        companyFilter,
        searchQuery
      }),
    [stageRecords, jobs, confidenceFilter, companyFilter, searchQuery]
  );

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoundTitle.trim() || !formQuestions.trim() || !formTakeaways.trim()) {
      setFormError('Please provide the round title, questions asked, and key takeaways.');
      return;
    }
    setFormError(null);
    onAddInterviewFeedback({
      jobId: formJobId,
      roundTitle: formRoundTitle.trim(),
      interviewerOrFormat: formFormat.trim() || 'Technical Interview Panel',
      questionsAsked: formQuestions.trim(),
      keyTakeaways: formTakeaways.trim(),
      confidenceRating: formConfidence,
      timestamp: 'Nov 16, 2026'
    });
    setFormRoundTitle('');
    setFormQuestions('');
    setFormTakeaways('');
  };

  return (
    <div className="space-y-6" data-testid="interview-prep-view">
      {/* Header & Summary Strip (No cluttered charts) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
              <span>Interview Notes &amp; Round Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Interview Preparation &amp; Feedback Notes
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Review all saved interview rounds, questions asked, and key takeaways across your job applications in one clean workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onOpenMockInterview && (
              <button
                type="button"
                data-testid="interview-prep-open-mock-btn"
                onClick={onOpenMockInterview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#2557A7] dark:hover:border-blue-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2557A7] dark:text-blue-400" />
                <span>AI Mock Interview</span>
              </button>
            )}
            {onExploreJobs && (
              <button
                type="button"
                onClick={onExploreJobs}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#2557A7] hover:bg-[#164081] text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Browse Roles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean 4-Column Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 pt-5">
          <div className="py-2 sm:py-0 sm:pr-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Saved Feedback Rounds
            </div>
            <div
              data-testid="interview-prep-total-sessions"
              className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1"
            >
              {summary.totalSessions}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Across {summary.companiesCovered.length || 1} company
            </div>
          </div>

          <div className="py-2 sm:py-0 sm:px-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Strong Readiness Rounds
            </div>
            <div
              data-testid="interview-prep-strong-count"
              className="text-2xl font-extrabold font-mono tabular-nums text-[#087F31] dark:text-emerald-400 mt-1"
            >
              {summary.ratingCounts['Strong']}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              High-confidence sessions
            </div>
          </div>

          <div className="py-2 sm:py-0 sm:px-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Moderate Rounds
            </div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-700 dark:text-amber-400 mt-1">
              {summary.ratingCounts['Moderate']}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow-up practice recommended
            </div>
          </div>

          <div className="py-2 sm:py-0 sm:pl-5">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Needs Review
            </div>
            <div className="text-2xl font-extrabold font-mono tabular-nums text-rose-700 dark:text-rose-400 mt-1">
              {summary.ratingCounts['Needs Review']}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Priority revision topics
            </div>
          </div>
        </div>
      </section>

      {/* Clean 2-Column Workspace: Left Log Form, Right Filterable Feedback Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Quick-Log New Interview Feedback Session */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Plus className="w-4 h-4 text-[#2557A7] dark:text-blue-400" />
              <span>Log New Interview Round</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Save questions asked and takeaways from your latest interview or mock session.
            </p>
          </div>

          <form
            onSubmit={handleLogSubmit}
            data-testid="interview-prep-log-form"
            className="space-y-3.5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="prep-job-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Target Role &amp; Company
                </label>
                <select
                  id="prep-job-select"
                  data-testid="prep-job-select"
                  value={formJobId}
                  onChange={(e) => setFormJobId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                >
                  {jobs.slice(0, 12).map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.company} — {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="prep-confidence-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Self-Assessed Readiness
                </label>
                <select
                  id="prep-confidence-select"
                  data-testid="prep-confidence-select"
                  value={formConfidence}
                  onChange={(e) =>
                    setFormConfidence(e.target.value as InterviewConfidenceRating)
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                >
                  <option value="Strong">Strong</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Needs Review">Needs Review</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="prep-round-title-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Interview Round Title
              </label>
              <input
                id="prep-round-title-input"
                data-testid="prep-round-title-input"
                type="text"
                value={formRoundTitle}
                onChange={(e) => setFormRoundTitle(e.target.value)}
                placeholder="e.g. Round 2: System Design & Spring Boot"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
              />
            </div>

            <div>
              <label
                htmlFor="prep-format-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Interviewer / Panel Format
              </label>
              <input
                id="prep-format-input"
                data-testid="prep-format-input"
                type="text"
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
                placeholder="e.g. Principal Engineer · 60m Live Coding"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
              />
            </div>

            <div>
              <label
                htmlFor="prep-questions-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Questions Asked &amp; Technical Topics
              </label>
              <textarea
                id="prep-questions-input"
                data-testid="prep-questions-input"
                rows={2}
                value={formQuestions}
                onChange={(e) => setFormQuestions(e.target.value)}
                placeholder="e.g. Spring Boot Bean Validation, MySQL indexing, REST pagination..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7] resize-y"
              />
            </div>

            <div>
              <label
                htmlFor="prep-takeaways-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Post-Interview Feedback &amp; Key Takeaways
              </label>
              <textarea
                id="prep-takeaways-input"
                data-testid="prep-takeaways-input"
                rows={2}
                value={formTakeaways}
                onChange={(e) => setFormTakeaways(e.target.value)}
                placeholder="e.g. Answered @Valid and SQL optimization clearly..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7] resize-y"
              />
            </div>

            {formError && (
              <p
                data-testid="prep-form-error"
                className="text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              data-testid="prep-submit-feedback-btn"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Interview Note</span>
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Filterable Aggregated Interview Feedback Records */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Saved Interview Feedback Cards ({summary.filteredRecords.length})
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Filter saved reflection cards by readiness tier, company, or topic keyword.
              </p>
            </div>

            {/* Search & Company Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="prep-feedback-search" className="sr-only">
                  Search feedback records
                </label>
                <input
                  id="prep-feedback-search"
                  data-testid="prep-feedback-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic or company..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
                />
              </div>

              <label htmlFor="prep-company-filter" className="sr-only">
                Filter feedback by company
              </label>
              <select
                id="prep-company-filter"
                data-testid="prep-company-filter"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
              >
                <option value="ALL">All Companies</option>
                {summary.companiesCovered.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Confidence Filter Buttons */}
          <div
            className="flex flex-wrap items-center gap-1.5 pt-1"
            role="group"
            aria-label="Filter feedback records by confidence rating"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(['ALL', 'Strong', 'Moderate', 'Needs Review'] as const).map((rating) => {
              const isSelected = confidenceFilter === rating;
              return (
                <button
                  key={rating}
                  type="button"
                  data-testid={`prep-filter-${rating.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setConfidenceFilter(rating)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#2557A7] text-white border-[#2557A7] dark:bg-blue-600 dark:border-blue-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {rating === 'ALL' ? `All (${summary.totalSessions})` : rating}
                </button>
              );
            })}
          </div>

          {/* Aggregated Feedback Cards List */}
          {summary.filteredRecords.length === 0 ? (
            <div
              data-testid="prep-feedback-empty"
              className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2"
            >
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No interview feedback records match your current filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfidenceFilter('ALL');
                  setCompanyFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2557A7] text-white hover:bg-[#164081] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3" data-testid="prep-feedback-list">
              {summary.filteredRecords.map((item) => (
                <article
                  key={item.id}
                  data-testid={`prep-feedback-card-${item.chronologicalIndex}`}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/50 space-y-2.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-[#2557A7] dark:text-blue-400">
                          Round #{item.chronologicalIndex}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {item.company} ({item.jobTitle})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.roundTitle}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.interviewerOrFormat} · Stage: {item.currentStage}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border shrink-0 ${
                        item.confidenceRating === 'Strong'
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-[#087F31] dark:text-emerald-300'
                          : item.confidenceRating === 'Moderate'
                          ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {item.confidenceRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700 dark:text-slate-300 pt-1">
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">
                        Questions &amp; Topics:
                      </strong>{' '}
                      {item.questionsAsked}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">
                        Key Takeaways:
                      </strong>{' '}
                      {item.keyTakeaways}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
