import React, { useState } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { JobItem } from '../data/seedData';
import { computeSkillRadarData, SkillRadarPoint } from '../utils/jobnovaLogic';

interface SkillProficiencyRadarCardProps {
  userSkills: string[];
  jobs: JobItem[];
  savedJobIds: number[];
  enrolledCourseIds: number[];
  savedCertIds: number[];
  isDarkMode: boolean;
  onNavigateToLearning: (skillKeyword?: string) => void;
}

export const SkillProficiencyRadarCard: React.FC<SkillProficiencyRadarCardProps> = ({
  userSkills,
  jobs,
  savedJobIds,
  enrolledCourseIds,
  savedCertIds,
  isDarkMode,
  onNavigateToLearning
}) => {
  const [benchmarkScope, setBenchmarkScope] = useState<'saved' | 'matched'>('saved');
  const [proficiencyOverrides, setProficiencyOverrides] = useState<Record<string, number>>({});

  // Determine the target jobs used to compute the industry benchmark
  const savedJobsList = jobs.filter((job) => savedJobIds.includes(job.id));
  const matchedJobsList = jobs.filter((job) => {
    const tokens = job.skills.split(',').map((s) => s.trim().toLowerCase());
    return tokens.some((t) => userSkills.map((u) => u.toLowerCase()).includes(t));
  });

  const targetJobs =
    benchmarkScope === 'saved'
      ? savedJobsList.length > 0
        ? savedJobsList
        : jobs.slice(0, 3)
      : matchedJobsList.length > 0
        ? matchedJobsList
        : jobs;

  const radarData: SkillRadarPoint[] = computeSkillRadarData({
    userSkills,
    savedJobs: targetJobs,
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides: proficiencyOverrides
  });

  const averageProficiency = Math.round(
    radarData.reduce((acc, item) => acc + item.studentProficiency, 0) /
      Math.max(1, radarData.length)
  );
  const averageIndustryReq = Math.round(
    radarData.reduce((acc, item) => acc + item.industryRequirement, 0) /
      Math.max(1, radarData.length)
  );
  const readinessScore = Math.min(
    100,
    Math.round((averageProficiency / Math.max(1, averageIndustryReq)) * 100)
  );

  const handleSliderChange = (skillKey: string, value: number) => {
    setProficiencyOverrides((prev) => ({
      ...prev,
      [skillKey]: value
    }));
  };

  return (
    <section
      aria-label="Skill Proficiency vs Industry Standard Radar Analysis"
      data-testid="skill-proficiency-radar"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6"
    >
      {/* Card Header & Scope Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[#2557A7] dark:text-blue-400">
              Competency Benchmark
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Comparing <span className="font-mono tabular-nums">{radarData.length}</span> listed skills against{' '}
              <span className="font-mono tabular-nums">{targetJobs.length}</span>{' '}
              {benchmarkScope === 'saved' ? 'saved/applied job roles' : 'matched industry roles'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Student Skill Proficiency vs. Industry Standard Requirements
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Target roles benchmarked:{' '}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {targetJobs
                .slice(0, 4)
                .map((j) => `${j.title} (${j.company})`)
                .join(' · ')}
              {targetJobs.length > 4 ? ` +${targetJobs.length - 4} more` : ''}
            </span>
          </p>
        </div>

        {/* Benchmark Scope Switcher */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
            role="group"
            aria-label="Benchmark Role Scope"
          >
            <button
              type="button"
              onClick={() => setBenchmarkScope('saved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                benchmarkScope === 'saved'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Saved Job Roles ({savedJobsList.length || 3})
            </button>
            <button
              type="button"
              onClick={() => setBenchmarkScope('matched')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                benchmarkScope === 'matched'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All Matched Roles ({matchedJobsList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Split: Recharts Radar Chart (Left) + Skill Gap Breakdown Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-center">
        {/* Radar Chart Viewport */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="74%" data={radarData}>
                <PolarGrid stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fill: isDarkMode ? '#cbd5e1' : '#334155',
                    fontSize: 12,
                    fontWeight: 600
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{
                    fill: isDarkMode ? '#64748b' : '#94a3b8',
                    fontSize: 10
                  }}
                />
                <Radar
                  name="Student Proficiency"
                  dataKey="studentProficiency"
                  stroke="#2557A7"
                  strokeWidth={2.5}
                  fill="#2557A7"
                  fillOpacity={0.28}
                />
                <Radar
                  name="Industry Standard (Saved Roles)"
                  dataKey="industryRequirement"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="#f59e0b"
                  fillOpacity={0.14}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    color: isDarkMode ? '#f8fafc' : '#0f172a'
                  }}
                  formatter={(value: unknown, name: unknown) => [
                    `${Number(value)}%`,
                    String(name)
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary KPI Strip under Chart */}
          <div className="w-full pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Avg. Student Score
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-[#2557A7] dark:text-blue-400">
                {averageProficiency}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Industry Standard
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {averageIndustryReq}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Role Readiness Index
              </div>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {readinessScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-Density Tabular Skill Gap & Interactive Calibration */}
        <div className="lg:col-span-6 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Skill-by-Skill Proficiency &amp; Gap Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust sliders to calibrate self-assessed proficiency or click a skill gap to find courses.
              </p>
            </div>
            {Object.keys(proficiencyOverrides).length > 0 && (
              <button
                type="button"
                onClick={() => setProficiencyOverrides({})}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset Calibration
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            <div className="grid grid-cols-12 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="col-span-4">Listed Skill</div>
              <div className="col-span-3 text-right">Your Level</div>
              <div className="col-span-2 text-right">Industry</div>
              <div className="col-span-3 text-right">Delta / Action</div>
            </div>

            {radarData.map((row) => {
              const isSurplus = row.gap >= 0;
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-12 items-center py-2.5 text-xs gap-2"
                >
                  <div className="col-span-4 font-semibold text-slate-900 dark:text-slate-100">
                    {row.skill}
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={row.studentProficiency}
                      aria-label={`Adjust ${row.skill} proficiency`}
                      onChange={(e) => handleSliderChange(row.key, Number(e.target.value))}
                      className="w-16 accent-[#2557A7] cursor-pointer"
                    />
                    <span className="font-mono font-semibold tabular-nums text-[#2557A7] dark:text-blue-400 w-9 text-right">
                      {row.studentProficiency}%
                    </span>
                  </div>

                  <div className="col-span-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {row.industryRequirement}%
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        isSurplus
                          ? 'text-[#087F31] dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {isSurplus ? `+${row.gap}% Ready` : `${row.gap}% Gap`}
                    </span>
                    {!isSurplus && (
                      <button
                        type="button"
                        onClick={() => onNavigateToLearning(row.skill)}
                        className="text-[11px] font-semibold text-[#2557A7] dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                      >
                         Upskill →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
