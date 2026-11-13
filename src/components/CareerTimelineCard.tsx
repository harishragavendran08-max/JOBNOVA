import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  GitCommitHorizontal,
  MessageSquarePlus,
  Send,
  Sparkles,
  XCircle
} from 'lucide-react';
import { JobItem } from '../data/seedData';
import {
  APPLICATION_STAGES,
  ApplicationStage,
  ApplicationStageRecord,
  InterviewConfidenceRating,
  computeCareerTimelineSummary
} from '../utils/jobnovaLogic';
import { InterviewCountdownTimer } from './InterviewCountdownTimer';

interface CareerTimelineCardProps {
  jobs: JobItem[];
  appliedJobIds: number[];
  stageRecords: Record<number, ApplicationStageRecord>;
  onUpdateStage: (
    jobId: number,
    nextStage: ApplicationStage,
    customNote?: string
  ) => void;
  onUpdateInterviewSchedule?: (
    jobId: number,
    nextScheduledIso: string,
    nextRoundTitle: string
  ) => void;
  onAddInterviewFeedback?: (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
  }) => void;
  onExploreJobs?: () => void;
}

const PROGRESSION_STEPS: ApplicationStage[] = [
  'Applied',
  'Interviewing',
  'Offer Received'
];

const CONFIDENCE_OPTIONS: InterviewConfidenceRating[] = [
  'Strong',
  'Moderate',
  'Needs Review'
];

export const CareerTimelineCard: React.FC<CareerTimelineCardProps> = ({
  jobs,
  appliedJobIds,
  stageRecords,
  onUpdateStage,
  onUpdateInterviewSchedule,
  onAddInterviewFeedback,
  onExploreJobs
}) => {
  const [stageFilter, setStageFilter] = useState<ApplicationStage | 'ALL'>('ALL');
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [selectedStages, setSelectedStages] = useState<
    Record<number, ApplicationStage>
  >({});

  // Local state for Post-Interview Feedback Logger in 'Interviewing' stage
  const [feedbackRounds, setFeedbackRounds] = useState<Record<number, string>>({});
  const [feedbackFormats, setFeedbackFormats] = useState<Record<number, string>>({});
  const [feedbackQuestions, setFeedbackQuestions] = useState<Record<number, string>>({});
  const [feedbackTakeaways, setFeedbackTakeaways] = useState<Record<number, string>>({});
  const [feedbackRatings, setFeedbackRatings] = useState<
    Record<number, InterviewConfidenceRating>
  >({});

  const summary = computeCareerTimelineSummary({
    jobs,
    appliedJobIds,
    stageRecords,
    stageFilter
  });

  const getStageColorClasses = (stage: ApplicationStage) => {
    switch (stage) {
      case 'Applied':
        return {
          text: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-950/50',
          border: 'border-indigo-200 dark:border-indigo-800/80',
          dot: 'bg-indigo-600 dark:bg-indigo-400'
        };
      case 'Interviewing':
        return {
          text: 'text-amber-700 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          border: 'border-amber-200 dark:border-amber-800/80',
          dot: 'bg-amber-500 dark:bg-amber-400'
        };
      case 'Offer Received':
        return {
          text: 'text-emerald-700 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          border: 'border-emerald-200 dark:border-emerald-800/80',
          dot: 'bg-emerald-600 dark:bg-emerald-400'
        };
      case 'Rejected':
        return {
          text: 'text-rose-700 dark:text-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/50',
          border: 'border-rose-200 dark:border-rose-800/80',
          dot: 'bg-rose-600 dark:bg-rose-400'
        };
    }
  };

  const getConfidenceBadgeClasses = (rating: InterviewConfidenceRating) => {
    switch (rating) {
      case 'Strong':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Moderate':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Needs Review':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
  };

  const getStageIcon = (stage: ApplicationStage) => {
    switch (stage) {
      case 'Applied':
        return <Send className="w-3.5 h-3.5" />;
      case 'Interviewing':
        return <Clock className="w-3.5 h-3.5" />;
      case 'Offer Received':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Rejected':
        return <XCircle className="w-3.5 h-3.5" />;
    }
  };

  const handleNoteSubmit = (
    e: React.FormEvent,
    jobId: number,
    currentStage: ApplicationStage
  ) => {
    e.preventDefault();
    const targetStage = selectedStages[jobId] || currentStage;
    const customNote = (noteInputs[jobId] || '').trim();
    onUpdateStage(jobId, targetStage, customNote || undefined);
    setNoteInputs((prev) => ({ ...prev, [jobId]: '' }));
  };

  const handleFeedbackSubmit = (
    e: React.FormEvent,
    jobId: number,
    defaultRoundTitle: string,
    company: string
  ) => {
    e.preventDefault();
    if (!onAddInterviewFeedback) return;

    const roundTitle = (feedbackRounds[jobId] ?? defaultRoundTitle).trim() || defaultRoundTitle;
    const interviewerOrFormat =
      (feedbackFormats[jobId] || '').trim() || `Technical Panel · ${company} (45m)`;
    const questionsAsked = (feedbackQuestions[jobId] || '').trim();
    const keyTakeaways = (feedbackTakeaways[jobId] || '').trim();
    const confidenceRating = feedbackRatings[jobId] || 'Strong';

    onAddInterviewFeedback({
      jobId,
      roundTitle,
      interviewerOrFormat,
      questionsAsked,
      keyTakeaways,
      confidenceRating
    });

    setFeedbackQuestions((prev) => ({ ...prev, [jobId]: '' }));
    setFeedbackTakeaways((prev) => ({ ...prev, [jobId]: '' }));
  };

  return (
    <section
      aria-label="Career Timeline"
      data-testid="career-timeline-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
    >
      {/* Top Header & KPI Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400">
            <GitCommitHorizontal className="w-4 h-4" />
            <span>Career Timeline · Application Stage Visualizer</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Student Job Application Pipeline &amp; Status Updates
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Track every role from <span className="font-semibold">Applied</span> through{' '}
            <span className="font-semibold">Interviewing</span>,{' '}
            <span className="font-semibold">Offer Received</span>, or{' '}
            <span className="font-semibold">Rejected</span> with post-interview feedback cards and timestamped status logs.
          </p>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Tracked Roles
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {summary.totalTracked}
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Pipeline
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-[#2557A7] dark:text-blue-400">
              {summary.activePipelineCount}
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Offers Received
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {summary.stageCounts['Offer Received']}
            </div>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Offer Conversion
            </div>
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
              {summary.offerConversionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Stage Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter career timeline by application stage"
        >
          <button
            type="button"
            onClick={() => setStageFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              stageFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Stages ({summary.totalTracked})
          </button>

          {APPLICATION_STAGES.map((stage) => {
            const count = summary.stageCounts[stage] || 0;
            const isSelected = stageFilter === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{stage}</span>
                <span className="font-mono tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400">
          Click any stage step or log post-interview feedback &amp; status updates below
        </span>
      </div>

      {/* Timeline Application Cards */}
      {summary.entries.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <Briefcase className="w-6 h-6 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {summary.totalTracked === 0
                ? 'No Job Applications in Your Career Timeline Yet'
                : `No Applications Currently in "${stageFilter}" Stage`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {summary.totalTracked === 0
                ? 'Apply to open roles in the Jobs section to start visualizing your application milestones and interview progress.'
                : 'Select another stage filter or advance one of your active applications to this stage.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {stageFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setStageFilter('ALL')}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                Show All Stages ({summary.totalTracked})
              </button>
            )}
            {onExploreJobs && (
              <button
                type="button"
                onClick={onExploreJobs}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-lg cursor-pointer"
              >
                Browse Open Jobs
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {summary.entries.map((entry) => {
            const stageColors = getStageColorClasses(entry.currentStage);
            const isRejected = entry.currentStage === 'Rejected';
            const activeStepIndex = isRejected
              ? -1
              : PROGRESSION_STEPS.indexOf(entry.currentStage);
            const dropdownStage =
              selectedStages[entry.jobId] || entry.currentStage;
            const defaultRoundLabel =
              entry.interviewRoundTitle ||
              `Technical & System Design Round · ${entry.company}`;
            const currentRating = feedbackRatings[entry.jobId] || 'Strong';

            return (
              <article
                key={entry.jobId}
                data-testid={`timeline-entry-${entry.jobId}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-5 space-y-5"
              >
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {entry.company}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.location}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {entry.ctc}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Updated {entry.updatedAt}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {entry.jobTitle}
                    </h3>
                  </div>

                  {/* Current Stage Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold shrink-0 self-start sm:self-center ${stageColors.bg} ${stageColors.border} ${stageColors.text}`}
                  >
                    {getStageIcon(entry.currentStage)}
                    <span>Stage: {entry.currentStage}</span>
                  </div>
                </div>

                {/* Visual Stage Progression Stepper */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Application Stage Progression
                    </span>
                    <span className="font-mono text-[11px]">
                      {isRejected
                        ? 'Status: Closed / Rejected'
                        : `Milestone ${activeStepIndex + 1} of ${PROGRESSION_STEPS.length}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {APPLICATION_STAGES.map((stage, idx) => {
                      const isCurrent = entry.currentStage === stage;
                      const isCompleted =
                        !isRejected &&
                        stage !== 'Rejected' &&
                        PROGRESSION_STEPS.indexOf(stage) <= activeStepIndex;

                      let buttonClasses =
                        'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-400';

                      if (isCurrent) {
                        if (stage === 'Offer Received') {
                          buttonClasses =
                            'border-emerald-600 bg-emerald-600 text-white shadow-xs';
                        } else if (stage === 'Rejected') {
                          buttonClasses =
                            'border-rose-600 bg-rose-600 text-white shadow-xs';
                        } else if (stage === 'Interviewing') {
                          buttonClasses =
                            'border-amber-500 bg-amber-500 text-slate-950 shadow-xs';
                        } else {
                          buttonClasses =
                            'border-indigo-600 bg-indigo-600 text-white shadow-xs';
                        }
                      } else if (isCompleted) {
                        buttonClasses =
                          'border-indigo-300 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300';
                      }

                      return (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => {
                            setSelectedStages((prev) => ({
                              ...prev,
                              [entry.jobId]: stage
                            }));
                            onUpdateStage(entry.jobId, stage);
                          }}
                          aria-label={`Set stage for ${entry.jobTitle} at ${entry.company} to ${stage}`}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${buttonClasses}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-[11px] opacity-80 tabular-nums">
                              0{idx + 1}
                            </span>
                            <span className="truncate">{stage}</span>
                          </div>
                          {isCurrent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : isCompleted ? (
                            <FileCheck2 className="w-3.5 h-3.5 shrink-0 opacity-75" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Countdown Timer Component for 'Interviewing' Stage Cards */}
                {entry.currentStage === 'Interviewing' && (
                  <InterviewCountdownTimer
                    jobId={entry.jobId}
                    jobTitle={entry.jobTitle}
                    company={entry.company}
                    skills={entry.skills}
                    scheduledIso={entry.interviewScheduledAt}
                    roundTitle={entry.interviewRoundTitle}
                    onUpdateSchedule={onUpdateInterviewSchedule}
                  />
                )}

                {/* Two-Column Bottom Area: Left (Feedback Logger + Status Update Form) & Right (Feedback Cards + History Timeline) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                  {/* Left Column: Post-Interview Feedback Form (in 'Interviewing' stage) + Status Update Form */}
                  <div className="lg:col-span-5 space-y-4 self-start">
                    {entry.currentStage === 'Interviewing' && onAddInterviewFeedback && (
                      <form
                        data-testid={`interview-feedback-form-${entry.jobId}`}
                        onSubmit={(e) =>
                          handleFeedbackSubmit(
                            e,
                            entry.jobId,
                            defaultRoundLabel,
                            entry.company
                          )
                        }
                        className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/70 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                            <ClipboardCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Log Post-Interview Feedback Note</span>
                          </div>
                          <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                            Interviewing Stage
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Record questions asked, coding topics, and reflection notes after your interview to save as a reference card in your application history.
                        </p>

                        <div className="space-y-2.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label
                                htmlFor={`feedback-round-${entry.jobId}`}
                                className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                              >
                                Interview Round Title
                              </label>
                              <input
                                id={`feedback-round-${entry.jobId}`}
                                type="text"
                                value={feedbackRounds[entry.jobId] ?? defaultRoundLabel}
                                onChange={(e) =>
                                  setFeedbackRounds((prev) => ({
                                    ...prev,
                                    [entry.jobId]: e.target.value
                                  }))
                                }
                                placeholder="e.g. Round 1: Java & Spring Boot"
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`feedback-confidence-${entry.jobId}`}
                                className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                              >
                                Self-Assessed Confidence
                              </label>
                              <select
                                id={`feedback-confidence-${entry.jobId}`}
                                value={currentRating}
                                onChange={(e) =>
                                  setFeedbackRatings((prev) => ({
                                    ...prev,
                                    [entry.jobId]: e.target
                                      .value as InterviewConfidenceRating
                                  }))
                                }
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                              >
                                {CONFIDENCE_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor={`feedback-format-${entry.jobId}`}
                              className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                            >
                              Interviewer / Panel Format
                            </label>
                            <input
                              id={`feedback-format-${entry.jobId}`}
                              type="text"
                              value={feedbackFormats[entry.jobId] || ''}
                              onChange={(e) =>
                                setFeedbackFormats((prev) => ({
                                  ...prev,
                                  [entry.jobId]: e.target.value
                                }))
                              }
                              placeholder={`e.g. Senior Backend Lead · 45m Live Coding (${entry.company})`}
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`feedback-questions-${entry.jobId}`}
                              className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                            >
                              Questions Asked &amp; Technical Topics
                            </label>
                            <input
                              id={`feedback-questions-${entry.jobId}`}
                              type="text"
                              value={feedbackQuestions[entry.jobId] || ''}
                              onChange={(e) =>
                                setFeedbackQuestions((prev) => ({
                                  ...prev,
                                  [entry.jobId]: e.target.value
                                }))
                              }
                              placeholder="e.g. Spring Boot @Transactional propagation, MySQL composite index, REST API design..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`feedback-takeaways-${entry.jobId}`}
                              className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                            >
                              Post-Interview Feedback &amp; Key Takeaways
                            </label>
                            <textarea
                              id={`feedback-takeaways-${entry.jobId}`}
                              rows={2}
                              value={feedbackTakeaways[entry.jobId] || ''}
                              onChange={(e) =>
                                setFeedbackTakeaways((prev) => ({
                                  ...prev,
                                  [entry.jobId]: e.target.value
                                }))
                              }
                              placeholder="e.g. Solved SQL join optimization cleanly; review JVM garbage collection tuning before next round..."
                              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            />
                          </div>

                          <button
                            type="submit"
                            data-testid={`save-interview-feedback-btn-${entry.jobId}`}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors cursor-pointer"
                          >
                            Save Interview Feedback Card
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Status Update Form */}
                    <form
                      onSubmit={(e) =>
                        handleNoteSubmit(e, entry.jobId, entry.currentStage)
                      }
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Post Status Update &amp; Milestone Note</span>
                      </div>

                      <div className="space-y-2.5">
                        <div>
                          <label
                            htmlFor={`stage-select-${entry.jobId}`}
                            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                          >
                            Stage for {entry.company}
                          </label>
                          <select
                            id={`stage-select-${entry.jobId}`}
                            value={dropdownStage}
                            onChange={(e) =>
                              setSelectedStages((prev) => ({
                                ...prev,
                                [entry.jobId]: e.target.value as ApplicationStage
                              }))
                            }
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          >
                            {APPLICATION_STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor={`status-note-${entry.jobId}`}
                            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
                          >
                            Status Update Note
                          </label>
                          <input
                            id={`status-note-${entry.jobId}`}
                            type="text"
                            value={noteInputs[entry.jobId] || ''}
                            onChange={(e) =>
                              setNoteInputs((prev) => ({
                                ...prev,
                                [entry.jobId]: e.target.value
                              }))
                            }
                            placeholder="e.g. Completed system design round with engineering lead..."
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full px-3 py-2 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-md transition-colors cursor-pointer"
                        >
                          Log Status Update for {entry.company}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Post-Interview Feedback Reference Cards + Chronological Status Updates Timeline */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-5">
                    {/* Post-Interview Feedback Reference Cards Section */}
                    <div
                      data-testid={`interview-feedback-history-${entry.jobId}`}
                      className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                          <ClipboardCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>
                            Interview Feedback Reference Cards (
                            {entry.interviewFeedbackNotes.length})
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Saved in Application History
                        </span>
                      </div>

                      {entry.interviewFeedbackNotes.length === 0 ? (
                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          No post-interview feedback cards logged yet for {entry.company}. Use the feedback logger during the Interviewing stage to record questions asked and reflections for future reference.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {entry.interviewFeedbackNotes.map((fb) => (
                            <div
                              key={fb.id}
                              data-testid={`interview-feedback-card-${fb.id}`}
                              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {fb.roundTitle}
                                  </h4>
                                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {fb.interviewerOrFormat} ·{' '}
                                    <span className="font-mono tabular-nums">
                                      {fb.timestamp}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded border ${getConfidenceBadgeClasses(
                                    fb.confidenceRating
                                  )}`}
                                >
                                  Confidence: {fb.confidenceRating}
                                </span>
                              </div>

                              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    Questions &amp; Topics:{' '}
                                  </span>
                                  <span>{fb.questionsAsked}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    Feedback &amp; Takeaways:{' '}
                                  </span>
                                  <span>{fb.keyTakeaways}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chronological Status Updates Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Status Update Timeline ({entry.history.length})
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Latest first
                        </span>
                      </div>

                      <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-2.5 space-y-3.5">
                        {entry.history.map((log, logIdx) => {
                          const logColors = getStageColorClasses(log.stage);
                          return (
                            <li key={log.id} className="ml-4 space-y-0.5">
                              <span
                                className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${logColors.dot}`}
                                aria-hidden="true"
                              />
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`text-xs font-bold ${logColors.text}`}
                                >
                                  {log.stage}
                                  {logIdx === 0 && (
                                    <span className="ml-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                      · Current
                                    </span>
                                  )}
                                </span>
                                <time className="text-[11px] font-mono text-slate-400 tabular-nums">
                                  {log.timestamp}
                                </time>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {log.note}
                              </p>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
