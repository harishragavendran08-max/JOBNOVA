import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { JobItem, UserSettings } from '../data/seedData';
import { computeSalaryComparisonData, parseJobCtcLpa } from '../utils/jobnovaLogic';

interface JobSalaryComparisonCardProps {
  jobs: JobItem[];
  savedJobIds: number[];
  settings: UserSettings;
  onUpdateSettings: (nextSettings: UserSettings) => void;
  onNavigateToSettings: () => void;
}

export const JobSalaryComparisonCard: React.FC<JobSalaryComparisonCardProps> = ({
  jobs,
  savedJobIds,
  settings,
  onUpdateSettings,
  onNavigateToSettings
}) => {
  const isDarkMode = settings.theme === 'dark';

  const summary = computeSalaryComparisonData({
    jobs,
    savedJobIds,
    expectedSalaryMinLpa: settings.expectedSalaryMinLpa,
    expectedSalaryMaxLpa: settings.expectedSalaryMaxLpa
  });

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));

  const handleMinChange = (val: number) => {
    const cleanMin = Math.max(2, Math.min(45, val));
    const cleanMax = Math.max(cleanMin, settings.expectedSalaryMaxLpa);
    onUpdateSettings({
      ...settings,
      expectedSalaryMinLpa: cleanMin,
      expectedSalaryMaxLpa: cleanMax
    });
  };

  const handleMaxChange = (val: number) => {
    const cleanMax = Math.max(2, Math.min(50, val));
    const cleanMin = Math.min(settings.expectedSalaryMinLpa, cleanMax);
    onUpdateSettings({
      ...settings,
      expectedSalaryMinLpa: cleanMin,
      expectedSalaryMaxLpa: cleanMax
    });
  };

  const getBarColor = (name: string, category: string) => {
    if (name === 'Saved Jobs Avg') return '#4f46e5'; // Indigo-600
    if (category === 'Expected Range') return '#0d9488'; // Teal-600
    if (name === 'Market Avg (20)') return '#64748b'; // Slate-500
    return '#d97706'; // Amber-600 for individual saved company roles
  };

  return (
    <section
      aria-label="Saved Applications CTC vs Expected Salary Range Bar Chart"
      data-testid="job-salary-bar-chart"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Compensation Benchmark
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Saved Applications (<span className="font-mono tabular-nums">{summary.savedJobsCount}</span>) Avg:{' '}
              <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {summary.savedJobsAverageLpa} LPA
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Expected Range:{' '}
              <span className="font-mono font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                {summary.expectedMinLpa} – {summary.expectedMaxLpa} LPA
              </span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Saved Job Applications CTC vs. Student Expected Salary Range
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Apply to or withdraw from job cards below to dynamically compare your saved applications&apos; average CTC against your expected salary band configured in User Settings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateToSettings}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Edit in User Settings →
          </button>
        </div>
      </div>

      {/* Main Split: Recharts BarChart (Left 7 Cols) + Expected Salary Controls & Breakdown (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* BarChart Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.bars}
                margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDarkMode ? '#1e293b' : '#e2e8f0'}
                />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: isDarkMode ? '#cbd5e1' : '#334155',
                    fontSize: 11,
                    fontWeight: 500
                  }}
                  axisLine={{ stroke: isDarkMode ? '#334155' : '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  unit=" LPA"
                  tick={{
                    fill: isDarkMode ? '#94a3b8' : '#64748b',
                    fontSize: 11
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }}
                  formatter={(value: unknown, _name: unknown, props: { payload?: { category?: string } }) => [
                    `${Number(value).toFixed(1)} LPA`,
                    props?.payload?.category || 'CTC'
                  ]}
                />
                <ReferenceLine
                  y={summary.expectedMinLpa}
                  stroke="#0d9488"
                  strokeDasharray="4 4"
                  label={{
                    value: `Min (${summary.expectedMinLpa}L)`,
                    position: 'insideTopRight',
                    fill: isDarkMode ? '#2dd4bf' : '#0f766e',
                    fontSize: 10
                  }}
                />
                <ReferenceLine
                  y={summary.expectedMaxLpa}
                  stroke="#0d9488"
                  strokeDasharray="4 4"
                  label={{
                    value: `Max (${summary.expectedMaxLpa}L)`,
                    position: 'insideTopRight',
                    fill: isDarkMode ? '#2dd4bf' : '#0f766e',
                    fontSize: 10
                  }}
                />
                <Bar dataKey="ctcLpa" name="Annual CTC (LPA)" radius={[6, 6, 0, 0]} maxBarSize={46}>
                  {summary.bars.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={getBarColor(entry.name, entry.category)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
              <span>Saved Applications Avg ({summary.savedJobsAverageLpa} LPA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-teal-600 inline-block" />
              <span>Expected Salary Range ({summary.expectedMinLpa}–{summary.expectedMaxLpa} LPA)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-600 inline-block" />
              <span>Individual Saved Roles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-500 inline-block" />
              <span>All 20 Jobs Market Avg ({summary.marketAverageLpa} LPA)</span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Salary Expectation Calibration & Saved Applications Table */}
        <div className="lg:col-span-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8 space-y-5">
          {/* KPI Summary Row */}
          <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Saved Avg CTC</div>
              <div className="text-lg font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                {summary.savedJobsAverageLpa} LPA
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Expected Band</div>
              <div className="text-lg font-bold font-mono tabular-nums text-teal-600 dark:text-teal-400">
                {summary.expectedMinLpa}–{summary.expectedMaxLpa}L
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Status</div>
              <div
                className={`text-xs font-semibold mt-1 ${
                  summary.alignmentStatus === 'Below Expected Minimum'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {summary.alignmentStatus}
              </div>
            </div>
          </div>

          {/* Quick Expected Salary Range Sliders synced with UserSettings */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Expected Salary Range (Synced with User Settings)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="jobs-expected-min-input"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Minimum Expected (LPA)
                </label>
                <input
                  id="jobs-expected-min-input"
                  type="number"
                  step="0.5"
                  min={2}
                  max={45}
                  value={settings.expectedSalaryMinLpa}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label
                  htmlFor="jobs-expected-max-input"
                  className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"
                >
                  Maximum Expected (LPA)
                </label>
                <input
                  id="jobs-expected-max-input"
                  type="number"
                  step="0.5"
                  min={2}
                  max={50}
                  value={settings.expectedSalaryMaxLpa}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Saved Applications Breakdown */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Saved Job Applications Breakdown ({savedJobs.length})
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No jobs saved yet. Click &quot;Apply&quot; on any job below to include its CTC in the comparison chart.
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs max-h-36 overflow-y-auto">
                {savedJobs.map((job) => {
                  const ctcNum = parseJobCtcLpa(job.ctc);
                  const meetsMin = ctcNum >= summary.expectedMinLpa;
                  return (
                    <div key={job.id} className="py-1.5 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {job.title} · {job.company}
                      </span>
                      <span
                        className={`font-mono font-semibold tabular-nums shrink-0 ${
                          meetsMin
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {job.ctc}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
