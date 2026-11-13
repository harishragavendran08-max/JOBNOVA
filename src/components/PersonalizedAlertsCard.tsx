import React, { useState } from 'react';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { InternshipItem, JobItem } from '../data/seedData';
import {
  computePersonalizedSkillAlerts,
  PersonalizedSkillAlertsResult,
  SkillAlertGroup
} from '../utils/jobnovaLogic';

interface PersonalizedAlertsCardProps {
  userSkills: string[];
  skillProficiencies?: Record<string, number>;
  jobs: JobItem[];
  internships: InternshipItem[];
  appliedJobIds: number[];
  appliedInternshipIds: number[];
  onApplyJob: (job: JobItem) => void;
  onApplyInternship: (internship: InternshipItem) => void;
  onNavigateToJobs: (skillKeyword?: string) => void;
  onNavigateToInternships: (skillKeyword?: string) => void;
  onNavigateToProfile: () => void;
}

export const PersonalizedAlertsCard: React.FC<PersonalizedAlertsCardProps> = ({
  userSkills,
  skillProficiencies = {},
  jobs,
  internships,
  appliedJobIds,
  appliedInternshipIds,
  onApplyJob,
  onApplyInternship,
  onNavigateToJobs,
  onNavigateToInternships,
  onNavigateToProfile
}) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('ALL');
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | 'job' | 'internship'>('ALL');

  const alertsData: PersonalizedSkillAlertsResult = computePersonalizedSkillAlerts({
    userSkills,
    skillProficiencies,
    jobs,
    internships,
    appliedJobIds,
    appliedInternshipIds,
    selectedSkillFilter
  });

  // Extract unique skill buttons for filter pills
  const allAlertsUnfiltered = computePersonalizedSkillAlerts({
    userSkills,
    skillProficiencies,
    jobs,
    internships,
    appliedJobIds,
    appliedInternshipIds,
    selectedSkillFilter: 'ALL'
  });

  const availableSkillTabs = allAlertsUnfiltered.alertGroups.map((g) => ({
    key: g.skillKey,
    label: g.skillLabel,
    count: g.recommendations.length,
    reason: g.reason
  }));

  return (
    <section
      aria-label="Personalized Career Alerts"
      data-testid="personalized-alerts-card"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6"
    >
      {/* Header with KPI Readouts & Quick Link */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#2557A7] dark:text-blue-400">
            <Bell className="w-4 h-4 text-[#2557A7] dark:text-blue-400 shrink-0" />
            <span>Personalized Alerts &amp; Opportunity Matcher</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              Triggered by profile skill progression
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Skill-Driven Job &amp; Internship Recommendations
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            As you add skills or advance proficiency in your Profile, JobNova dynamically matches newly unlocked full-time roles and student internships to your verified tech stack.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#2557A7] dark:text-blue-400">
              Matched Opportunities
            </div>
            <div
              data-testid="alerts-total-count"
              className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100"
            >
              {alertsData.totalAlertsCount} Roles
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#2557A7] hover:text-[#2557A7] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Calibrate Skills in Profile →
          </button>
        </div>
      </div>

      {/* Filter Tabs: By Skill Group & Opportunity Type */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center gap-1.5 overflow-x-auto pb-1"
            role="group"
            aria-label="Filter recommendations by skill"
          >
            <button
              type="button"
              data-testid="alert-skill-filter-all"
              onClick={() => setSelectedSkillFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedSkillFilter === 'ALL'
                  ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Skills ({availableSkillTabs.reduce((acc, t) => acc + t.count, 0)})
            </button>
            {availableSkillTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                data-testid={`alert-skill-filter-${tab.key}`}
                onClick={() => setSelectedSkillFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedSkillFilter.toLowerCase() === tab.key.toLowerCase()
                    ? 'bg-[#2557A7] text-white dark:bg-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.reason === 'progressed_advanced' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : tab.reason === 'recent_addition' ? (
                  <Zap className="w-3 h-3 text-amber-500" />
                ) : null}
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Type Sub-Filter: All / Jobs / Internships */}
          <div
            className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs"
            role="group"
            aria-label="Filter by role type"
          >
            <button
              type="button"
              data-testid="alert-type-filter-all"
              onClick={() => setActiveTypeTab('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTypeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              data-testid="alert-type-filter-jobs"
              onClick={() => setActiveTypeTab('job')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTypeTab === 'job'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Jobs ({alertsData.recommendedJobsCount})
            </button>
            <button
              type="button"
              data-testid="alert-type-filter-internships"
              onClick={() => setActiveTypeTab('internship')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                activeTypeTab === 'internship'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Internships ({alertsData.recommendedInternshipsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Alert Skill Groups & Recommendation Cards */}
      {alertsData.alertGroups.length === 0 ? (
        <div
          data-testid="alerts-empty-state"
          className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3"
        >
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No recommendations for this filter
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try selecting a different skill or calibrate your proficiencies in your profile to trigger alerts.
          </p>
          <button
            type="button"
            onClick={() => setSelectedSkillFilter('ALL')}
            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Show All Skill Alerts
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {alertsData.alertGroups.map((group: SkillAlertGroup) => {
            const visibleRecs = group.recommendations.filter(
              (r) => activeTypeTab === 'ALL' || r.type === activeTypeTab
            );
            if (visibleRecs.length === 0) return null;

            return (
              <div
                key={group.skillKey}
                data-testid={`skill-alert-group-${group.skillKey}`}
                className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4"
              >
                {/* Skill Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {group.skillLabel} Alerts
                    </h3>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span
                      data-testid={`skill-alert-badge-${group.skillKey}`}
                      className={`text-xs font-mono font-semibold ${
                        group.reason === 'progressed_advanced'
                          ? 'text-[#087F31] dark:text-emerald-400'
                          : group.reason === 'recent_addition'
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-[#2557A7] dark:text-blue-400'
                      }`}
                    >
                      {group.badgeText}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Proficiency: <strong className="text-slate-900 dark:text-slate-100">{group.proficiency}% ({group.tier})</strong>
                  </div>
                </div>

                {/* Recommendation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleRecs.map((rec) => {
                    const isJob = rec.type === 'job';
                    return (
                      <article
                        key={`${rec.type}-${rec.id}`}
                        data-testid={`alert-rec-card-${rec.type}-${rec.id}`}
                        className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-[#2557A7] dark:hover:border-blue-500 rounded-xl p-4 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider ${
                                isJob
                                  ? 'text-[#2557A7] dark:text-blue-400'
                                  : 'text-[#087F31] dark:text-emerald-400'
                              }`}
                            >
                              {isJob ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                              <span>{rec.type}</span>
                            </span>

                            <span className="font-mono text-xs font-bold text-[#087F31] dark:text-emerald-400 tabular-nums">
                              {rec.ctcOrStipend}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {rec.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {rec.company} · {rec.location}
                            </p>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {rec.description}
                          </p>

                          <div className="pt-1">
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              Required: {rec.skills}
                            </span>
                          </div>
                        </div>

                        {/* Card Action Controls */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          {isJob ? (
                            <button
                              type="button"
                              onClick={() => onNavigateToJobs(group.skillKey)}
                              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2557A7] dark:hover:text-blue-400 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>View in Jobs</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onNavigateToInternships(group.skillKey)}
                              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#2557A7] dark:hover:text-blue-400 inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>View in Internships</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            type="button"
                            data-testid={`alert-apply-btn-${rec.type}-${rec.id}`}
                            onClick={() => {
                              if (isJob) {
                                const fullJob = jobs.find((j) => j.id === rec.id);
                                if (fullJob) onApplyJob(fullJob);
                              } else {
                                const fullIntern = internships.find((i) => i.id === rec.id);
                                if (fullIntern) onApplyInternship(fullIntern);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              rec.isApplied
                                ? 'bg-[#087F31] text-white hover:bg-[#066828]'
                                : 'bg-[#2557A7] text-white hover:bg-[#164081] dark:bg-blue-600 dark:hover:bg-blue-500'
                            }`}
                          >
                            {rec.isApplied ? 'Applied ✓' : 'Quick Apply'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
