import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  User
} from 'lucide-react';
import {
  DEFAULT_USER_PROFILE,
  InternshipItem,
  JobItem,
  SEED_INTERNSHIPS,
  SEED_JOBS
} from '../data/seedData';
import {
  ApplicationStageRecord,
  computeSkillRadarData,
  deriveStudentProficiencyTier,
  InterviewConfidenceRating
} from '../utils/jobnovaLogic';
import { MockInterviewSession } from './MockInterviewSession';
import { SpringJavaCheatSheet } from './SpringJavaCheatSheet';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

interface CareerAssistantViewProps {
  jobs?: JobItem[];
  savedJobIds?: number[];
  internships?: InternshipItem[];
  appliedInternshipIds?: number[];
  applicationStageRecords?: Record<number, ApplicationStageRecord>;
  userSkills?: string[];
  enrolledCourseIds?: number[];
  savedCertIds?: number[];
  onAddInterviewFeedback?: (params: {
    jobId: number;
    roundTitle: string;
    interviewerOrFormat: string;
    questionsAsked: string;
    keyTakeaways: string;
    confidenceRating: InterviewConfidenceRating;
  }) => void;
  pendingPromptRequest?: { id: number; prompt: string } | null;
  onConsumePendingPrompt?: () => void;
}

const QUICK_PROMPTS = [
  { label: 'Resume Tips', prompt: 'Give me resume tips for a fresher software engineer' },
  { label: 'Interview Prep', prompt: 'How do I prepare for a technical & HR interview?' },
  { label: 'Tell Me About Yourself', prompt: 'How should I answer Tell me about yourself?' },
  { label: 'LinkedIn Profile', prompt: 'How can I improve my LinkedIn profile to attract recruiters?' },
  { label: 'Java & Spring Boot', prompt: 'How do I prepare for my first job in Java and Spring Boot?' },
  { label: 'GenAI & Python LLM', prompt: 'How do I break into GenAI and LLM engineering with Python, RAG, and LangChain?' },
  { label: 'Go, Cloud & SRE', prompt: 'What skills are required for Golang, Cloud, Kubernetes, and SRE roles?' },
  { label: 'Data Engineering', prompt: 'How do I prepare for Data Engineering roles with Spark, dbt, Airflow, and Snowflake?' },
  { label: 'React & Full-Stack', prompt: 'How do I build full-stack projects with React.js, TypeScript, Node.js, and SQL?' },
  { label: 'Soft Skills', prompt: 'What are the most important soft skills for students?' },
  { label: 'Handling Rejection', prompt: 'How do I handle job rejection positively?' }
];

export const CareerAssistantView: React.FC<CareerAssistantViewProps> = ({
  jobs = SEED_JOBS,
  savedJobIds = [1],
  internships = SEED_INTERNSHIPS,
  appliedInternshipIds = [2],
  applicationStageRecords = {},
  userSkills = DEFAULT_USER_PROFILE.skills,
  enrolledCourseIds = [3, 5],
  savedCertIds = [1, 7],
  onAddInterviewFeedback,
  pendingPromptRequest = null,
  onConsumePendingPrompt
}) => {
  const [activeMode, setActiveMode] = useState<'mock' | 'cheatsheet' | 'chat'>(
    pendingPromptRequest ? 'chat' : 'mock'
  );
  const lastHandledPromptIdRef = useRef<number | null>(null);

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

  const pipelineRoleCount = savedJobIds.length + appliedInternshipIds.length;

  // Career Q&A Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: "Hello! I'm your JobNova Career Assistant. Ask me about resumes, interviews, LinkedIn optimization, Java/Spring Boot, GenAI/Python, Go/Cloud/SRE, Data Engineering, or switch to Mock Interview Mode above to practice role-specific questions."
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

  useEffect(() => {
    if (
      pendingPromptRequest &&
      pendingPromptRequest.prompt.trim() &&
      lastHandledPromptIdRef.current !== pendingPromptRequest.id
    ) {
      lastHandledPromptIdRef.current = pendingPromptRequest.id;
      setActiveMode('chat');
      sendQuestion(pendingPromptRequest.prompt);
      if (onConsumePendingPrompt) {
        onConsumePendingPrompt();
      }
    }
  }, [pendingPromptRequest]);

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
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Career Coach &amp; Technical Interview Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              JobNova AI Career Assistant &amp; Interview Prep
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Practice Gemini-evaluated mock interviews, study the Spring Boot &amp; Java cheat sheet tailored to your pipeline (<span className="font-mono font-semibold tabular-nums">{pipelineRoleCount}</span> active roles · <span className="font-mono font-semibold tabular-nums">{averageProficiencyScore}% · {detectedTier}</span>), or ask career questions.
            </p>
          </div>

          {/* Mode Toggle Buttons */}
          <div
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 self-start xl:self-center"
            role="group"
            aria-label="Select AI Assistant Mode"
          >
            <button
              type="button"
              data-testid="mode-mock-btn"
              onClick={() => setActiveMode('mock')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'mock'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Mock Interview
            </button>
            <button
              type="button"
              data-testid="mode-cheatsheet-btn"
              onClick={() => setActiveMode('cheatsheet')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'cheatsheet'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cheat Sheet</span>
            </button>
            <button
              type="button"
              data-testid="mode-chat-btn"
              onClick={() => setActiveMode('chat')}
              className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeMode === 'chat'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Career Q&amp;A Chat
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MODE 1: GEMINI MOCK INTERVIEW SIMULATOR ==================== */}
      {activeMode === 'mock' && (
        <section
          aria-label="Mock Interview Practice Mode"
          data-testid="mock-interview-section"
        >
          <MockInterviewSession
            jobs={jobs}
            savedJobIds={savedJobIds}
            userSkills={userSkills}
            initialTier={detectedTier}
            onLogFeedback={onAddInterviewFeedback}
          />
        </section>
      )}

      {/* ==================== MODE 2: PIPELINE-TAILORED SPRING BOOT & JAVA CHEAT SHEET ==================== */}
      {activeMode === 'cheatsheet' && (
        <section
          aria-label="Spring Boot and Java Interview Cheat Sheet"
          data-testid="cheat-sheet-section"
        >
          <SpringJavaCheatSheet
            jobs={jobs}
            savedJobIds={savedJobIds}
            internships={internships}
            appliedInternshipIds={appliedInternshipIds}
            stageRecords={applicationStageRecords}
            userSkills={userSkills}
            onAskFollowUp={(prompt) => {
              setActiveMode('chat');
              sendQuestion(prompt);
            }}
          />
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
                Ask any question about resumes, interviews, LinkedIn, GenAI/Python, Java/Spring Boot, Go, Cloud/SRE, Data Engineering, or React.
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
                  className="px-3 py-1.5 text-xs font-medium text-[#2557A7] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
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
                  <div className="w-8 h-8 rounded-lg bg-[#2557A7] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#2557A7] text-white'
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
                placeholder="Ask about resumes, interviews, GenAI, Go, Cloud/SRE, Java, Data Engineering..."
                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2557A7]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send Question</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
