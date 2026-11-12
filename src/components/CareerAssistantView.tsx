import React, { useMemo, useState } from 'react';
import {
  Bot,
  Briefcase,
  CheckCircle2,
  Eye,
  GraduationCap,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  User
} from 'lucide-react';
import {
  DEFAULT_USER_PROFILE,
  JobItem,
  SEED_JOBS
} from '../data/seedData';
import {
  computeSkillRadarData,
  deriveStudentProficiencyTier,
  evaluateMockInterviewAnswer,
  generateMockInterviewQuestions,
  MockAnswerEvaluation,
  MockInterviewQuestion,
  ProficiencyTier
} from '../utils/jobnovaLogic';
import { SpringBootFixView } from './SpringBootFixView';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

interface CareerAssistantViewProps {
  jobs?: JobItem[];
  savedJobIds?: number[];
  userSkills?: string[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
}

const QUICK_PROMPTS = [
  { label: 'Resume Tips', prompt: 'Give me resume tips for a fresher software engineer' },
  { label: 'Interview Prep', prompt: 'How do I prepare for a technical & HR interview?' },
  { label: 'Tell Me About Yourself', prompt: 'How should I answer Tell me about yourself?' },
  { label: 'LinkedIn Profile', prompt: 'How can I improve my LinkedIn profile to attract recruiters?' },
  { label: 'Java & Spring Boot', prompt: 'How do I prepare for my first job in Java and Spring Boot?' },
  { label: 'React & MySQL Stack', prompt: 'How do I build full-stack projects with React.js, JavaScript, HTML, CSS, and MySQL?' },
  { label: 'Soft Skills', prompt: 'What are the most important soft skills for students?' },
  { label: 'Handling Rejection', prompt: 'How do I handle job rejection positively?' }
];

export const CareerAssistantView: React.FC<CareerAssistantViewProps> = ({
  jobs = SEED_JOBS,
  savedJobIds = [1],
  userSkills = DEFAULT_USER_PROFILE.skills,
  enrolledCourseIds = [3, 5],
  savedCertIds = [1, 7]
}) => {
  const [activeMode, setActiveMode] = useState<'mock' | 'chat' | 'diagnostics'>('mock');

  // Compute student's baseline proficiency score & tier from their listed skills and saved roles
  const savedJobsList = useMemo(() => {
    const matched = jobs.filter((j) => savedJobIds.includes(j.id));
    return matched.length > 0 ? matched : jobs.slice(0, 3);
  }, [jobs, savedJobIds]);

  const radarPoints = useMemo(
    () =>
      computeSkillRadarData({
        userSkills,
        savedJobs: savedJobsList,
        enrolledCourseIds,
        savedCertIds
      }),
    [userSkills, savedJobsList, enrolledCourseIds, savedCertIds]
  );

  const averageProficiencyScore = useMemo(() => {
    if (radarPoints.length === 0) return 78;
    const sum = radarPoints.reduce((acc, p) => acc + p.studentProficiency, 0);
    return Math.round(sum / radarPoints.length);
  }, [radarPoints]);

  const detectedTier = deriveStudentProficiencyTier(averageProficiencyScore);

  // Mock Interview Mode State
  const [selectedJobId, setSelectedJobId] = useState<number>(
    savedJobsList[0]?.id || SEED_JOBS[0].id
  );
  const [proficiencyTier, setProficiencyTier] =
    useState<ProficiencyTier>(detectedTier);
  const [variantIndex, setVariantIndex] = useState<number>(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<
    Record<string, MockAnswerEvaluation>
  >({});
  const [revealedSampleIds, setRevealedSampleIds] = useState<
    Record<string, boolean>
  >({});

  const selectedJob =
    jobs.find((j) => j.id === selectedJobId) ||
    savedJobsList[0] ||
    SEED_JOBS[0];

  const mockQuestions: MockInterviewQuestion[] = useMemo(
    () =>
      generateMockInterviewQuestions({
        job: selectedJob,
        proficiencyTier,
        userSkills,
        variantIndex
      }),
    [selectedJob, proficiencyTier, userSkills, variantIndex]
  );

  const handleEvaluateAnswer = (q: MockInterviewQuestion) => {
    const draft = practiceAnswers[q.id] || '';
    const result = evaluateMockInterviewAnswer(q, draft);
    setEvaluations((prev) => ({ ...prev, [q.id]: result }));
  };

  const handleGenerateNewSet = () => {
    setVariantIndex((v) => v + 1);
    setEvaluations({});
    setRevealedSampleIds({});
  };

  // Career Q&A Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: "Hello! I'm your JobNova Career Assistant. Ask me about resumes, interviews, LinkedIn optimization, Java/Spring Boot, React.js/MySQL career paths, soft skills, or switch to Mock Interview Mode above to practice role-specific questions."
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sendQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a career question before sending.');
      return;
    }

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.response || 'No response received.',
          source: data.source
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: 'Keep your resume short (1 page), highlight projects with action verbs, and practice explaining your code clearly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(inputPrompt);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: "Hello! I'm your JobNova Career Assistant. Ask me about resumes, interviews, LinkedIn optimization, Java/Spring Boot, React.js/MySQL career paths, or soft skills."
      }
    ]);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Career Coach &amp; Interview Simulator</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              JobNova AI Career Assistant &amp; Mock Interview Mode
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Practice tailored interview questions based on your saved job roles (<span className="font-mono font-semibold">{savedJobsList.length}</span> saved) and current skill proficiency (<span className="font-mono font-semibold">{averageProficiencyScore}% · {detectedTier}</span>), or ask career questions.
            </p>
          </div>

          {/* Mode Toggle Buttons */}
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 self-start md:self-center"
            role="group"
            aria-label="Select AI Assistant Mode"
          >
            <button
              type="button"
              onClick={() => setActiveMode('mock')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeMode === 'mock'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Mock Interview Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeMode === 'chat'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Career Q&amp;A Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('diagnostics')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeMode === 'diagnostics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Spring Boot Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODE 1: MOCK INTERVIEW SIMULATOR ==================== */}
      {activeMode === 'mock' && (
        <section
          aria-label="Mock Interview Practice Mode"
          data-testid="mock-interview-section"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
        >
          {/* Configuration Controls: Target Saved Role & Proficiency Level */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-6 border-b border-slate-200 dark:border-slate-800 items-end">
            {/* Saved Job Role Selector */}
            <div className="lg:col-span-5 space-y-1.5">
              <label
                htmlFor="mock-role-select"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Target Saved Job Role</span>
              </label>
              <select
                id="mock-role-select"
                value={selectedJob.id}
                onChange={(e) => setSelectedJobId(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <optgroup label={`Your Saved / Applied Roles (${savedJobsList.length})`}>
                  {savedJobsList.map((job) => (
                    <option key={`saved-${job.id}`} value={job.id}>
                      {job.title} — {job.company} ({job.skills})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Open Roles on JobNova">
                  {jobs
                    .filter((j) => !savedJobIds.includes(j.id))
                    .slice(0, 8)
                    .map((job) => (
                      <option key={`other-${job.id}`} value={job.id}>
                        {job.title} — {job.company} ({job.skills})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Proficiency Level Selector */}
            <div className="lg:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Proficiency Level</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Profile Avg: {averageProficiencyScore}% ({detectedTier})
                </span>
              </div>

              <div
                className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
                role="group"
                aria-label="Select Mock Interview Proficiency Level"
              >
                {(['Beginner', 'Intermediate', 'Advanced'] as ProficiencyTier[]).map(
                  (tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setProficiencyTier(tier)}
                      className={`py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        proficiencyTier === tier
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {tier}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Generate New Set Button */}
            <div className="lg:col-span-3">
              <button
                type="button"
                onClick={handleGenerateNewSet}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Generate New Questions</span>
              </button>
            </div>
          </div>

          {/* Role & Skill Context Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Active Mock Session:
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {selectedJob.title} @ {selectedJob.company}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 dark:text-slate-400">
                Role Stack:{' '}
                <code className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedJob.skills.split(',').join(' · ')}
                </code>
              </span>
            </div>
            <div className="font-mono text-slate-600 dark:text-slate-400 tabular-nums">
              Difficulty: <strong>{proficiencyTier}</strong> · {mockQuestions.length} Practice Questions
            </div>
          </div>

          {/* Generated Practice Questions List */}
          <div className="space-y-5">
            {mockQuestions.map((q, index) => {
              const evaluation = evaluations[q.id];
              const isSampleVisible = !!revealedSampleIds[q.id];

              return (
                <article
                  key={q.id}
                  data-testid={`mock-question-card-${index + 1}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        Q0{index + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                        {q.skillFocus}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      Level: {q.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.question}
                  </h3>

                  {/* Key Concepts Hint */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Expected Key Concepts:
                    </span>
                    {q.keyPoints.map((kp) => (
                      <span
                        key={kp}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300"
                      >
                        {kp}
                      </span>
                    ))}
                  </div>

                  {/* Practice Answer Input */}
                  <div className="space-y-2.5">
                    <label
                      htmlFor={`mock-answer-${index + 1}`}
                      className="sr-only"
                    >
                      Your Practice Answer for Question {index + 1}
                    </label>
                    <textarea
                      id={`mock-answer-${index + 1}`}
                      rows={2}
                      value={practiceAnswers[q.id] || ''}
                      onChange={(e) =>
                        setPracticeAnswers((prev) => ({
                          ...prev,
                          [q.id]: e.target.value
                        }))
                      }
                      placeholder="Type your practice answer here to check concept coverage and get instant feedback..."
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleEvaluateAnswer(q)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Evaluate Answer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRevealedSampleIds((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id]
                          }))
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {isSampleVisible
                            ? 'Hide Reference Answer'
                            : 'View Reference Answer'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Evaluation Feedback Banner */}
                  {evaluation && (
                    <div
                      role="status"
                      className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                        evaluation.score >= 75
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Answer Evaluation Feedback</span>
                        <span className="font-mono tabular-nums">
                          Score: {evaluation.score}%
                        </span>
                      </div>
                      <p>{evaluation.feedback}</p>
                    </div>
                  )}

                  {/* Model Reference Answer */}
                  {isSampleVisible && (
                    <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400">
                        Model Reference Answer ({q.difficulty}):
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {q.sampleAnswer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== MODE 2: CAREER Q&A CHAT ==================== */}
      {activeMode === 'chat' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Interactive Career Q&amp;A Chat
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ask any question about resumes, interviews, LinkedIn, Java, Spring Boot, React.js, or MySQL.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Quick Topic Prompts */}
          <div className="space-y-2 mb-6">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Suggested Career Topics:
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => sendQuestion(item.prompt)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div
            className="space-y-4 max-h-[420px] overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {msg.text}
                  {msg.role === 'assistant' && msg.source && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Sparkles className="w-3 h-3" />
                      <span>
                        Source: {msg.source === 'gemini' ? 'Gemini AI' : 'JobNova Career Knowledge Base'}
                      </span>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            {errorMsg && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
                {errorMsg}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="career-prompt-input" className="sr-only">
                Ask Career Assistant
              </label>
              <input
                id="career-prompt-input"
                type="text"
                value={inputPrompt}
                onChange={(e) => {
                  setInputPrompt(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ask about resumes, interviews, LinkedIn, Java, Spring Boot, or soft skills..."
                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send Question</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODE 3: SPRING BOOT ARCHITECTURE DIAGNOSTICS ==================== */}
      {activeMode === 'diagnostics' && (
        <section aria-label="Spring Boot Architecture Diagnostics">
          <SpringBootFixView />
        </section>
      )}
    </div>
  );
};
