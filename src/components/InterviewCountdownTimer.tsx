import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckSquare, Clock, Sparkles } from 'lucide-react';
import {
  computeInterviewCountdown,
  getDefaultInterviewIso
} from '../utils/jobnovaLogic';

interface InterviewCountdownTimerProps {
  jobId: number;
  jobTitle: string;
  company: string;
  skills: string;
  scheduledIso?: string;
  roundTitle?: string;
  onUpdateSchedule?: (
    jobId: number,
    nextScheduledIso: string,
    nextRoundTitle: string
  ) => void;
}

export const InterviewCountdownTimer: React.FC<
  InterviewCountdownTimerProps
> = ({
  jobId,
  jobTitle,
  company,
  skills,
  scheduledIso,
  roundTitle,
  onUpdateSchedule
}) => {
  const effectiveIso = scheduledIso || getDefaultInterviewIso(Date.now(), 52.5);
  const effectiveRound =
    roundTitle || `Technical & System Design Round · ${company}`;

  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [customRoundInput, setCustomRoundInput] = useState(effectiveRound);
  const [prepChecked, setPrepChecked] = useState<Record<string, boolean>>({
    skills: true,
    projects: false,
    setup: false
  });

  useEffect(() => {
    setCustomRoundInput(
      roundTitle || `Technical & System Design Round · ${company}`
    );
  }, [roundTitle, company]);

  // Tick every 1 second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const countdown = computeInterviewCountdown(effectiveIso, nowMs);

  const formattedScheduledDate = new Date(effectiveIso).toLocaleString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

  // Convert ISO to YYYY-MM-DDTHH:mm for datetime-local input
  const toDateTimeLocalValue = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleQuickOffset = (offsetHours: number, presetLabel?: string) => {
    if (!onUpdateSchedule) return;
    const nextIso = getDefaultInterviewIso(Date.now(), offsetHours);
    const nextRound = presetLabel || customRoundInput || effectiveRound;
    setCustomRoundInput(nextRound);
    onUpdateSchedule(jobId, nextIso, nextRound);
  };

  const prepItems = [
    {
      id: 'skills',
      label: `Review core technical stack (${skills.split(',').slice(0, 3).join(', ')})`
    },
    {
      id: 'projects',
      label: `Prepare STAR system design & project walkthrough for ${company}`
    },
    {
      id: 'setup',
      label: 'Verify camera, microphone & coding environment 15m before start'
    }
  ];

  const completedPrepCount = Object.values(prepChecked).filter(Boolean).length;

  return (
    <div
      data-testid={`interview-countdown-${jobId}`}
      aria-label={`Upcoming interview countdown for ${jobTitle} at ${company}`}
      className="rounded-lg border border-amber-300/90 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/25 p-4 space-y-4"
    >
      {/* Top Row: Round Title, Scheduled Date & Digital Countdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Upcoming Scheduled Interview Countdown</span>
            </span>
            <span aria-hidden="true" className="text-amber-400">
              ·
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                countdown.urgency === 'imminent'
                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  : countdown.urgency === 'completed'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
              }`}
            >
              {countdown.urgency === 'imminent'
                ? 'Imminent (< 24h)'
                : countdown.urgency === 'completed'
                  ? 'Session Time Reached'
                  : 'Scheduled'}
            </span>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {effectiveRound}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Target Slot:{' '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {formattedScheduledDate}
              </strong>
            </span>
          </p>
        </div>

        {/* 4-Box Monospace Countdown Display */}
        <div
          role="timer"
          aria-label={`Time remaining until ${company} interview: ${countdown.formattedCountdown}`}
          className="flex items-center gap-2 shrink-0"
        >
          {[
            { label: 'DAYS', value: countdown.days },
            { label: 'HRS', value: countdown.hours },
            { label: 'MINS', value: countdown.minutes },
            { label: 'SECS', value: countdown.seconds }
          ].map((unit) => (
            <div
              key={unit.label}
              className="w-16 py-2 px-2 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 text-center shadow-2xs"
            >
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 leading-none">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-400 mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Split: Interview Schedule Controls + Prep Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-amber-200/70 dark:border-amber-800/50">
        {/* Left: Reschedule / Slot Controls */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Update Interview Slot &amp; Round
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  handleQuickOffset(6, `Technical Coding Round · ${company}`)
                }
                className="px-2 py-1 text-[11px] font-mono font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                +6h (Imminent)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickOffset(24, `System Design Round · ${company}`)
                }
                className="px-2 py-1 text-[11px] font-mono font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                +1 Day
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickOffset(72, `Final Hiring Manager Round · ${company}`)
                }
                className="px-2 py-1 text-[11px] font-mono font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                +3 Days
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`interview-round-${jobId}`}
                className="sr-only"
              >
                Interview Round Title for {company}
              </label>
              <input
                id={`interview-round-${jobId}`}
                type="text"
                value={customRoundInput}
                onChange={(e) => setCustomRoundInput(e.target.value)}
                onBlur={() => {
                  if (onUpdateSchedule && customRoundInput.trim()) {
                    onUpdateSchedule(
                      jobId,
                      effectiveIso,
                      customRoundInput.trim()
                    );
                  }
                }}
                placeholder="Interview round title..."
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor={`interview-datetime-${jobId}`}
                className="sr-only"
              >
                Scheduled Interview Date and Time for {company}
              </label>
              <input
                id={`interview-datetime-${jobId}`}
                type="datetime-local"
                value={toDateTimeLocalValue(effectiveIso)}
                onChange={(e) => {
                  if (!onUpdateSchedule || !e.target.value) return;
                  const parsed = new Date(e.target.value);
                  if (!Number.isNaN(parsed.getTime())) {
                    onUpdateSchedule(
                      jobId,
                      parsed.toISOString(),
                      customRoundInput.trim() || effectiveRound
                    );
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Interview Readiness Checklist */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Interview Preparation Checklist</span>
            </span>
            <span className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {completedPrepCount}/{prepItems.length} Ready
            </span>
          </div>

          <div className="space-y-1.5">
            {prepItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!prepChecked[item.id]}
                  onChange={() =>
                    setPrepChecked((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id]
                    }))
                  }
                  className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer shrink-0"
                />
                <span
                  className={
                    prepChecked[item.id]
                      ? 'line-through text-slate-400 dark:text-slate-500'
                      : ''
                  }
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
