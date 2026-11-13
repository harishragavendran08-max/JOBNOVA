import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  Briefcase,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  GraduationCap,
  History,
  Lightbulb,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Zap
} from 'lucide-react';
import { JobItem, SEED_JOBS } from '../data/seedData';
import { InterviewConfidenceRating, ProficiencyTier } from '../utils/jobnovaLogic';
import {
  completeMockInterviewSession,
  computeSessionProgress,
  createMockInterviewSession,
  evaluateMockSessionOffline,
  formatSessionDuration,
  MOCK_INTERVIEW_STORAGE_KEY,
  MockInterviewSession as MockSessionType,
  MockQuestionEvaluation,
  MockSessionEvaluation,
  MockSessionQuestion,
  saveSessionResponse
} from '../utils/mockInterviewLogic';

interface MockInterviewSessionProps {
  jobs: JobItem[];
  savedJobIds: number[];
  userSkills: string[];
  initialTier?: ProficiencyTier;
  onLogFeedback?: (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
  }) => void;
}

export const MockInterviewSession: React.FC<MockInterviewSessionProps> = ({
  jobs = SEED_JOBS,
  savedJobIds = [1],
  userSkills = ['java', 'springboot', 'react', 'mysql'],
  initialTier = 'Intermediate',
  onLogFeedback
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(() => {
    return savedJobIds[0] || jobs[0]?.id || 1;
  });
  const [selectedTier, setSelectedTier] = useState<ProficiencyTier>(initialTier);
  const [variantIndex, setVariantIndex] = useState(0);

  // Active Session State
  const [currentSession, setCurrentSession] = useState<MockSessionType>(() => {
    const job = jobs.find((j) => j.id === (savedJobIds[0] || jobs[0]?.id || 1)) || jobs[0] || SEED_JOBS[0];
    return createMockInterviewSession({
      job,
      proficiencyTier: initialTier,
      userSkills,
      variantIndex: 0
    });
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'session' | 'history'>('session');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [showKeyHints, setShowKeyHints] = useState(false);
  const [revealedSample, setRevealedSample] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Saved Past Sessions list from localStorage
  const [savedSessions, setSavedSessions] = useState<MockSessionType[]>(() => {
    try {
      const raw = localStorage.getItem(MOCK_INTERVIEW_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore read errors
    }
    return [];
  });

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && currentSession.status !== 'evaluated') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, currentSession.status]);

  // Toast banner auto-dismiss
  useEffect(() => {
    if (!saveToast) return;
    const t = setTimeout(() => setSaveToast(null), 2500);
    return () => clearTimeout(t);
  }, [saveToast]);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || SEED_JOBS[0];
  const activeQuestion: MockSessionQuestion | undefined = currentSession.questions[currentQuestionIndex];
  const sessionProgress = computeSessionProgress(currentSession);

  // Start / Reset Session
  const handleStartNewSession = (jobOverride?: JobItem, tierOverride?: ProficiencyTier) => {
    const job = jobOverride || selectedJob;
    const tier = tierOverride || selectedTier;
    const newSession = createMockInterviewSession({
      job,
      proficiencyTier: tier,
      userSkills,
      variantIndex: variantIndex + 1
    });
    setVariantIndex((v) => v + 1);
    setCurrentSession(newSession);
    setCurrentQuestionIndex(0);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setShowKeyHints(false);
    setRevealedSample(false);
    setEvalError(null);
    setSaveToast(`Started simulated interview for ${job.title} @ ${job.company}`);
  };

  // Update answer in state and local storage
  const handleAnswerChange = (val: string) => {
    if (!activeQuestion) return;
    const updated = saveSessionResponse(currentSession, activeQuestion.id, val);
    setCurrentSession(updated);
  };

  // Save progress toast
  const handleSaveDraft = () => {
    setSaveToast('Response saved to session draft ✓');
  };

  // Finish session
  const handleFinishSession = () => {
    setIsTimerRunning(false);
    const completed = completeMockInterviewSession(currentSession, timerSeconds);
    setCurrentSession(completed);
    persistSession(completed);
    setSaveToast('Session completed! Ready for AI evaluation.');
  };

  // Persist session to past history
  const persistSession = (sess: MockSessionType) => {
    setSavedSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sess.id);
      const next = [sess, ...filtered].slice(0, 15);
      try {
        localStorage.setItem(MOCK_INTERVIEW_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  // Evaluate with Gemini AI
  const handleEvaluateWithGemini = async () => {
    setIsEvaluating(true);
    setEvalError(null);
    setIsTimerRunning(false);

    const completed = completeMockInterviewSession(currentSession, timerSeconds);

    try {
      const res = await fetch('/api/mock-interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: completed })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const evaluation: MockSessionEvaluation =
        data.evaluation || evaluateMockSessionOffline(completed);

      const evaluatedSession: MockSessionType = {
        ...completed,
        status: 'evaluated',
        evaluation
      };

      setCurrentSession(evaluatedSession);
      persistSession(evaluatedSession);
      setSaveToast(`Gemini evaluation complete · Score: ${evaluation.overallScore}% (${evaluation.verdict})`);
    } catch (err) {
      console.warn('Falling back to local mock evaluation:', err);
      const fallbackEvaluation = evaluateMockSessionOffline(completed);
      const evaluatedSession: MockSessionType = {
        ...completed,
        status: 'evaluated',
        evaluation: fallbackEvaluation
      };
      setCurrentSession(evaluatedSession);
      persistSession(evaluatedSession);
      setSaveToast(`Evaluated with local scorecard · Score: ${fallbackEvaluation.overallScore}%`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Log session to user's Career Timeline
  const handleSaveToTimeline = () => {
    if (!onLogFeedback || !currentSession.evaluation) return;
    const evalData = currentSession.evaluation;

    let rating: InterviewConfidenceRating = 'Moderate';
    if (evalData.overallScore >= 75) rating = 'Strong';
    else if (evalData.overallScore < 55) rating = 'Needs Review';

    onLogFeedback({
      jobId: currentSession.jobId,
      roundTitle: `Simulated Mock Interview (${currentSession.proficiencyTier}) · ${currentSession.jobTitle}`,
      interviewerOrFormat: `JobNova Gemini AI Interview Simulator · Score ${evalData.overallScore}% (${evalData.verdict})`,
      questionsAsked: currentSession.questions.map((q) => q.question).slice(0, 2).join(' | '),
      keyTakeaways: `${evalData.readinessSummary} Strengths: ${evalData.keyStrengths.join(', ')}. Focus Areas: ${evalData.keyAreasForImprovement.join(', ')}.`,
      confidenceRating: rating
    });

    setSaveToast('Saved mock interview scorecard directly into Career Timeline & Profile!');
  };

  const currentAnswer = activeQuestion ? currentSession.answers[activeQuestion.id] || '' : '';
  const currentEvaluation: MockQuestionEvaluation | undefined =
    currentSession.evaluation?.questionEvaluations.find(
      (qe) => qe.questionId === activeQuestion?.id
    );

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {saveToast && (
        <div
          role="status"
          className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-medium">{saveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveToast(null)}
            className="text-indigo-500 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Session Config & Navigation Bar */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#2557A7] dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
                GEMINI AI INTERVIEW SIMULATOR
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                · Real-Time Speech &amp; Coding Questions
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Interactive Mock Interview Session
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Conduct a realistic simulated technical interview. Type your responses for each round, save drafts, and submit all answers for comprehensive evaluation powered by the Gemini API.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-testid="mock-tab-session"
              onClick={() => setActiveTab('session')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'session'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Active Interview
            </button>
            <button
              type="button"
              data-testid="mock-tab-history"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Past Saved Sessions ({savedSessions.length})</span>
            </button>
          </div>
        </div>

        {/* Controls: Target Role, Difficulty Tier, Session Timer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          <div className="md:col-span-5 space-y-1">
            <label
              htmlFor="mock-role-selector"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span>Target Role &amp; Company</span>
            </label>
            <select
              id="mock-role-selector"
              data-testid="mock-role-select"
              value={selectedJobId}
              onChange={(e) => {
                const jid = Number(e.target.value);
                setSelectedJobId(jid);
                const nextJob = jobs.find((j) => j.id === jid);
                if (nextJob) handleStartNewSession(nextJob, selectedTier);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <optgroup label="Saved / Applied Job Roles">
                {jobs
                  .filter((j) => savedJobIds.includes(j.id))
                  .map((j) => (
                    <option key={`saved-${j.id}`} value={j.id}>
                      {j.title} · {j.company} ({j.skills})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="All Platform Roles">
                {jobs
                  .filter((j) => !savedJobIds.includes(j.id))
                  .slice(0, 10)
                  .map((j) => (
                    <option key={`all-${j.id}`} value={j.id}>
                      {j.title} · {j.company} ({j.skills})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Interview Level</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['Beginner', 'Intermediate', 'Advanced'] as ProficiencyTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  data-testid={`mock-tier-${tier.toLowerCase()}`}
                  onClick={() => {
                    setSelectedTier(tier);
                    handleStartNewSession(selectedJob, tier);
                  }}
                  className={`py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    currentSession.proficiencyTier === tier
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 flex items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{formatSessionDuration(timerSeconds)}</span>
            </div>
            <button
              type="button"
              data-testid="start-new-session-btn"
              onClick={() => handleStartNewSession()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Generate a fresh set of questions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Set</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== TAB 1: ACTIVE SESSION VIEW ==================== */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          {/* Stepper & Progress Bar */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {sessionProgress.answeredCount} of {sessionProgress.totalQuestions} answered ({sessionProgress.percentComplete}%)
                </span>
              </div>
              <span
                data-testid="session-status-badge"
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  currentSession.status === 'evaluated'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : currentSession.status === 'completed'
                    ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                {currentSession.status === 'evaluated'
                  ? 'Evaluated by Gemini'
                  : currentSession.status === 'completed'
                  ? 'Responses Saved (Ready)'
                  : 'In Progress'}
              </span>
            </div>

            {/* Stepper buttons */}
            <div className="grid grid-cols-4 gap-2">
              {currentSession.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = Boolean(currentSession.answers[q.id]?.trim());
                return (
                  <button
                    key={q.id}
                    type="button"
                    data-testid={`question-step-btn-${idx + 1}`}
                    onClick={() => {
                      setCurrentQuestionIndex(idx);
                      setShowKeyHints(false);
                      setRevealedSample(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500 shadow-2xs'
                        : isAnswered
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">
                      Q0{idx + 1} · {q.category}
                    </span>
                    {isAnswered && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${sessionProgress.percentComplete}%` }}
              />
            </div>
          </div>

          {/* Active Question Card */}
          {activeQuestion && (
            <article
              data-testid="active-question-card"
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-indigo-600 text-white">
                    Round {currentQuestionIndex + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {activeQuestion.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Focus: {activeQuestion.skillFocus}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Target: {currentSession.company} ({currentSession.proficiencyTier})
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Interviewer Prompt</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {activeQuestion.question}
                </h3>
              </div>

              {/* Hints & Key Concepts Toggle */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  data-testid="toggle-hints-btn"
                  onClick={() => setShowKeyHints((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showKeyHints ? 'Hide Concepts Expected' : 'Show Concepts Expected'}</span>
                </button>
                <button
                  type="button"
                  data-testid="toggle-sample-btn"
                  onClick={() => setRevealedSample((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{revealedSample ? 'Hide Reference Answer' : 'View Reference Answer'}</span>
                </button>
              </div>

              {showKeyHints && (
                <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5">
                  <span className="font-semibold text-amber-900 dark:text-amber-200">
                    Key Concepts to Cover in Your Response:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeQuestion.keyPoints.map((kp) => (
                      <span
                        key={kp}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 font-mono text-[11px] text-amber-800 dark:text-amber-300"
                      >
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {revealedSample && (
                <div className="p-3.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs space-y-1.5">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Model Reference Answer:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {activeQuestion.sampleAnswer}
                  </p>
                </div>
              )}

              {/* Response Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label
                    htmlFor="candidate-response-input"
                    className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <span>Your Response</span>
                    <span className="text-slate-400 font-normal">
                      (Responses are auto-saved in your session)
                    </span>
                  </label>
                  <span className="font-mono text-slate-500 text-[11px]">
                    {currentAnswer.length} chars · {currentAnswer.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  id="candidate-response-input"
                  data-testid="mock-response-textarea"
                  rows={5}
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your response thoroughly. Explain your thought process, architecture, and code patterns as if speaking to the interviewer..."
                  className="w-full p-3.5 text-xs font-sans bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>

              {/* Navigation Controls between questions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="mock-prev-btn"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                      setShowKeyHints(false);
                      setRevealedSample(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    type="button"
                    data-testid="mock-save-draft-btn"
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < currentSession.questions.length - 1 ? (
                    <button
                      type="button"
                      data-testid="mock-next-btn"
                      onClick={() => {
                        setCurrentQuestionIndex((prev) => prev + 1);
                        setShowKeyHints(false);
                        setRevealedSample(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs cursor-pointer transition-colors"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid="mock-finish-btn"
                      onClick={handleFinishSession}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Interview</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          )}

          {/* Evaluation Action Hub & Scorecard */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Interview Evaluation &amp; Feedback
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All {sessionProgress.answeredCount} responses recorded in this session will be graded by the Gemini API against technical benchmarks for {currentSession.jobTitle}.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  data-testid="evaluate-session-gemini-btn"
                  onClick={handleEvaluateWithGemini}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                      <span>Evaluate All Responses with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Scorecard Results */}
            {currentSession.evaluation && (
              <div
                data-testid="mock-evaluation-scorecard"
                className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6"
              >
                {/* Header Score & Verdict */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 items-center">
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#2557A7] text-white flex flex-col items-center justify-center font-bold">
                      <span className="text-2xl font-mono leading-none">
                        {currentSession.evaluation.overallScore}%
                      </span>
                      <span className="text-[10px] uppercase font-sans tracking-wider text-blue-100 mt-1">
                        Readiness
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono font-semibold">
                        Hiring Verdict
                      </div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{currentSession.evaluation.verdict}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Evaluated via {currentSession.evaluation.evaluatorSource === 'gemini' ? 'Gemini 3.8 Flash' : 'Career Knowledge Base'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Executive Summary
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {currentSession.evaluation.readinessSummary}
                    </p>
                  </div>
                </div>

                {/* Key Strengths & Areas for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Key Technical Strengths</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {currentSession.evaluation.keyStrengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Areas for Technical Elevation</span>
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {currentSession.evaluation.keyAreasForImprovement.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Per-Question Detailed Feedback */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                    Per-Question Assessment Breakdown
                  </h4>
                  <div className="space-y-3">
                    {currentSession.questions.map((q, idx) => {
                      const qe = currentSession.evaluation?.questionEvaluations.find(
                        (item) => item.questionId === q.id
                      );
                      const userAnswer = currentSession.answers[q.id];

                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              Q0{idx + 1} ({q.category} · {q.skillFocus}): {q.question}
                            </span>
                            {qe && (
                              <span
                                className={`px-2 py-0.5 rounded font-mono font-bold ${
                                  qe.score >= 75
                                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                                    : qe.score >= 50
                                    ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                                    : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {qe.score}% · {qe.rating}
                              </span>
                            )}
                          </div>

                          <div className="text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 italic">
                            &quot;{userAnswer?.trim() || '(No answer provided)'}&quot;
                          </div>

                          {qe && (
                            <div className="space-y-1">
                              <p className="text-slate-700 dark:text-slate-300 font-medium">
                                {qe.feedback}
                              </p>
                              <p className="text-indigo-600 dark:text-indigo-400">
                                💡 Tip: {qe.suggestedImprovement}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Save to Timeline Action */}
                {onLogFeedback && (
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                        Record Session to Your Profile Career Timeline
                      </span>
                      <span className="text-xs text-indigo-700 dark:text-indigo-400">
                        Adds a verified Mock Interview Round feedback card under your {currentSession.company} application.
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid="save-to-timeline-btn"
                      onClick={handleSaveToTimeline}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Save to Career Timeline</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PAST SAVED SESSIONS HISTORY ==================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Past Saved Mock Interview Sessions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review previously saved responses and re-examine Gemini AI scorecards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSavedSessions([]);
                  try {
                    localStorage.removeItem(MOCK_INTERVIEW_STORAGE_KEY);
                  } catch {}
                  setSaveToast('Cleared mock interview session history.');
                }}
                className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>

            {savedSessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Bot className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No past interview sessions saved yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('session')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Start your first mock interview session →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSessions.map((sessionItem) => {
                  const evalRes = sessionItem.evaluation;
                  const isCurrent = currentSession.id === sessionItem.id;
                  const answered = computeSessionProgress(sessionItem).answeredCount;

                  return (
                    <div
                      key={sessionItem.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {sessionItem.jobTitle} @ {sessionItem.company}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {sessionItem.proficiencyTier}
                          </span>
                          {evalRes && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              Score: {evalRes.overallScore}% ({evalRes.verdict})
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {answered} of {sessionItem.questions.length} questions answered · Created {new Date(sessionItem.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentSession(sessionItem);
                            setActiveTab('session');
                            setSaveToast(`Loaded session for ${sessionItem.jobTitle} @ ${sessionItem.company}`);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          {isCurrent ? 'Viewing' : 'Resume / Review Session'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
