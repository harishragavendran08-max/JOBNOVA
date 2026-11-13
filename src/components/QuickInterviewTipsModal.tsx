import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Lightbulb, Sparkles, X } from 'lucide-react';
import { QuickInterviewTipsBundle } from '../utils/quickInterviewTipsLogic';

interface QuickInterviewTipsModalProps {
  bundle: QuickInterviewTipsBundle;
  isOpen: boolean;
  onClose: () => void;
  onOpenMockInterview: () => void;
  onNotify?: (message: string) => void;
}

export const QuickInterviewTipsModal: React.FC<QuickInterviewTipsModalProps> = ({
  bundle,
  isOpen,
  onClose,
  onOpenMockInterview,
  onNotify
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCopiedAll(false);
  }, [bundle.jobId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyAll = () => {
    const formatted = [
      `Quick Interview Tips — ${bundle.jobTitle} at ${bundle.company}`,
      `Target Stack: ${bundle.stackLabels.join(', ')}`,
      '',
      ...bundle.questions.map(
        (q, idx) =>
          `${idx + 1}. [${q.skillLabel} · ${q.focusArea}] ${q.question}\n   Key signals: ${q.whatInterviewersLookFor.join(', ')}\n   Tip: ${q.quickTip}`
      )
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    onNotify?.(`Copied 3 tailored interview questions for ${bundle.jobTitle} at ${bundle.company}!`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-tips-modal-title"
        data-testid="quick-interview-tips-modal"
        className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Quick Interview Tips · 3 High-Impact Questions</span>
            </div>
            <h2
              id="quick-tips-modal-title"
              className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug"
            >
              {bundle.jobTitle}{' '}
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                at {bundle.company}
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Tailored to stack:{' '}
              <span className="font-mono font-semibold text-[#2557A7] dark:text-blue-400">
                {bundle.stackLabels.join(' · ')}
              </span>
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            data-testid="quick-tips-close-btn"
            aria-label="Close Quick Interview Tips"
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2557A7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 rounded-xl px-4 py-3 leading-relaxed">
            {bundle.summaryTip}
          </p>

          <ol className="space-y-3.5" data-testid="quick-tips-question-list">
            {bundle.questions.map((item, idx) => (
              <li
                key={item.id}
                data-testid={`quick-tip-card-${idx + 1}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#2557A7] dark:bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#2557A7] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {item.skillLabel}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {item.focusArea}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {item.question}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 mr-0.5">
                    Look for:
                  </span>
                  {item.whatInterviewersLookFor.map((signal) => (
                    <span
                      key={signal}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium"
                    >
                      {signal}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/70 rounded-lg px-3 py-2">
                  <strong className="font-semibold">Quick Tip:</strong> {item.quickTip}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            data-testid="quick-tips-copy-btn"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#2557A7] hover:text-[#2557A7] dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#087F31] dark:text-emerald-400" />
                <span>Copied All 3 ✓</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 3 Questions</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="quick-tips-open-mock-btn"
              onClick={onOpenMockInterview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#2557A7] hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice in Mock Interview</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
