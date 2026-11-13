import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Plus, Trash2, X } from 'lucide-react';
import { JobItem } from '../data/seedData';
import {
  buildSimilarJobTemplate,
  UserAlertRecord
} from '../utils/userAlertsLogic';

interface UserAlertsPanelProps {
  alerts: UserAlertRecord[];
  activeJob: JobItem | null;
  browserPermission: string;
  onRequestBrowserPermission: () => Promise<void>;
  onDeleteAlert: (alertId: string) => Promise<void> | void;
  onCreateJobAndNotify: (payload: {
    title: string;
    company: string;
    location: string;
    description: string;
    skills: string;
    type: string;
    ctc: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const UserAlertsPanel: React.FC<UserAlertsPanelProps> = ({
  alerts,
  activeJob,
  browserPermission,
  onRequestBrowserPermission,
  onDeleteAlert,
  onCreateJobAndNotify,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [ctc, setCtc] = useState('14.5 LPA');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (activeJob) {
      const template = buildSimilarJobTemplate(activeJob);
      setTitle(template.title);
      setCompany(template.company);
      setLocation(template.location);
      setSkills(template.skills);
      setCtc(template.ctc);
    }
  }, [activeJob?.id]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !skills.trim()) return;
    setIsPublishing(true);
    try {
      await onCreateJobAndNotify({
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || 'Bengaluru',
        description: `Newly posted ${title.trim()} opening at ${company.trim()} requiring ${skills.trim()}.`,
        skills: skills.trim(),
        type: 'Full-Time',
        ctc: ctc.trim() || '14.5 LPA'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section
      data-testid="user-alerts-panel"
      aria-label="UserAlerts Job Notification Subscriptions"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#2557A7] dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              UserAlerts · Skill-Based Push Notification Store ({alerts.length})
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Active job alert subscriptions trigger browser push notifications whenever a newly added role shares matching skill requirements.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {browserPermission !== 'granted' && browserPermission !== 'unsupported' && (
            <button
              type="button"
              data-testid="enable-browser-push-btn"
              onClick={onRequestBrowserPermission}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2557A7] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Push</span>
            </button>
          )}
          <span className="text-[11px] font-mono px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Push: {browserPermission}
          </span>
          <button
            type="button"
            aria-label="Close UserAlerts panel"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Saved UserAlerts List */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Subscriptions ({alerts.length})
          </div>

          {alerts.length === 0 ? (
            <div
              data-testid="user-alerts-empty"
              className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400"
            >
              No active records in <code className="font-mono">UserAlerts</code> yet. Select any job listing and click <strong>Get Notified</strong> in the Job Detail pane to subscribe.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  data-testid={`user-alert-item-${alert.sourceJobId}`}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {alert.sourceJobTitle}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {alert.sourceCompany} · {alert.location}
                      </span>
                      {alert.matchedNewJobIds.length > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#087F31] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {alert.matchedNewJobIds.length} new match
                          {alert.matchedNewJobIds.length > 1 ? 'es' : ''} pushed
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Watching skills:
                      </span>
                      {alert.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 text-[11px] font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid={`delete-alert-btn-${alert.sourceJobId}`}
                    onClick={() => onDeleteAlert(alert.id)}
                    aria-label={`Remove alert for ${alert.sourceJobTitle}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publish New Job to Trigger & Test UserAlerts Push Notification */}
        <form
          onSubmit={handlePublish}
          data-testid="publish-similar-job-form"
          className="lg:col-span-5 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
        >
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Publish New Job (Test Push Alert)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Adds a new role to the jobs feed and triggers matching <code className="font-mono">UserAlerts</code> push notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              data-testid="new-job-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Role title"
              aria-label="New job title"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7]"
            />
            <input
              type="text"
              data-testid="new-job-company-input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              aria-label="New job company"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              data-testid="new-job-location-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              aria-label="New job location"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7]"
            />
            <input
              type="text"
              data-testid="new-job-ctc-input"
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              placeholder="CTC (e.g. 16.0 LPA)"
              aria-label="New job CTC"
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7]"
            />
          </div>

          <input
            type="text"
            data-testid="new-job-skills-input"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Comma-separated skills (e.g. java,springboot,sql)"
            aria-label="New job required skills"
            className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2557A7]"
          />

          <button
            type="submit"
            data-testid="publish-job-test-alert-btn"
            disabled={isPublishing}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#2557A7] hover:bg-[#164081] disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Add Job & Notify Matching Alerts'}</span>
          </button>
        </form>
      </div>
    </section>
  );
};
