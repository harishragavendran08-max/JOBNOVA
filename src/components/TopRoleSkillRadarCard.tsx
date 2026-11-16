import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ArrowRight, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { JobItem } from '../data/seedData';
import {
  computeTopRoleRadarComparison,
  type TopRoleRadarAxis
} from '../utils/topRoleRadarLogic';

interface TopRoleSkillRadarCardProps {
  selectedJob: JobItem | null;
  topJobs: JobItem[];
  userSkills: string[];
  enrolledCourseIds: number[];
  savedCertIds: number[];
  customProficiencyOverrides?: Record<string, number>;
  isDarkMode: boolean;
  onSelectTopJob: (jobId: number) => void;
  onInspectJob: (jobId: number) => void;
  onNavigateToLearning: (skillKeyword?: string) => void;
  onNavigateToProfileSkills: () => void;
}

const SVG_WIDTH = 420;
const SVG_HEIGHT = 344;
const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT / 2;
const OUTER_RADIUS = 104;
const GRID_LEVELS = [25, 50, 75, 100];

export const TopRoleSkillRadarCard: React.FC<TopRoleSkillRadarCardProps> = ({
  selectedJob,
  topJobs,
  userSkills,
  enrolledCourseIds,
  savedCertIds,
  customProficiencyOverrides = {},
  isDarkMode,
  onSelectTopJob,
  onInspectJob,
  onNavigateToLearning,
  onNavigateToProfileSkills
}) => {
  const [hoveredAxisKey, setHoveredAxisKey] = useState<string | null>(null);
  const userPolygonRef = useRef<SVGPathElement | null>(null);
  const requiredPolygonRef = useRef<SVGPathElement | null>(null);

  const comparison = useMemo(() => {
    if (!selectedJob) return null;
    return computeTopRoleRadarComparison({
      job: selectedJob,
      userSkills,
      enrolledCourseIds,
      savedCertIds,
      customProficiencyOverrides
    });
  }, [
    selectedJob,
    userSkills,
    enrolledCourseIds,
    savedCertIds,
    customProficiencyOverrides
  ]);

  // D3 radial scale + line generators
  const chartGeometry = useMemo(() => {
    if (!comparison || comparison.axes.length === 0) return null;
    const axes = comparison.axes;
    const count = axes.length;
    const angleSlice = (Math.PI * 2) / count;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, OUTER_RADIUS]);

    const userLineGenerator = d3
      .lineRadial<TopRoleRadarAxis>()
      .angle((_, i) => i * angleSlice)
      .radius((d) => rScale(d.userProficiency))
      .curve(d3.curveLinearClosed);

    const requiredLineGenerator = d3
      .lineRadial<TopRoleRadarAxis>()
      .angle((_, i) => i * angleSlice)
      .radius((d) => rScale(d.requiredLevel))
      .curve(d3.curveLinearClosed);

    const ringPaths = GRID_LEVELS.map((level) => {
      const ringRadius = rScale(level);
      const pts = axes.map((_, i) => {
        const theta = i * angleSlice - Math.PI / 2;
        return [
          Math.cos(theta) * ringRadius,
          Math.sin(theta) * ringRadius
        ] as [number, number];
      });
      const polygonGenerator = d3.line<[number, number]>().curve(d3.curveLinearClosed);
      return {
        level,
        ringRadius,
        d: polygonGenerator(pts) || ''
      };
    });

    const axisCoords = axes.map((axis, i) => {
      const theta = i * angleSlice - Math.PI / 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      const userR = rScale(axis.userProficiency);
      const reqR = rScale(axis.requiredLevel);
      const labelR = OUTER_RADIUS + 30;

      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (cos > 0.22) textAnchor = 'start';
      else if (cos < -0.22) textAnchor = 'end';

      let dominantBaseline: 'auto' | 'middle' | 'hanging' = 'middle';
      if (sin < -0.55) dominantBaseline = 'auto';
      else if (sin > 0.55) dominantBaseline = 'hanging';

      return {
        axis,
        spokeX2: cos * OUTER_RADIUS,
        spokeY2: sin * OUTER_RADIUS,
        userX: cos * userR,
        userY: sin * userR,
        reqX: cos * reqR,
        reqY: sin * reqR,
        labelX: cos * labelR,
        labelY: sin * labelR,
        textAnchor,
        dominantBaseline
      };
    });

    return {
      userPathD: userLineGenerator(axes) || '',
      requiredPathD: requiredLineGenerator(axes) || '',
      ringPaths,
      axisCoords
    };
  }, [comparison]);

  // Smooth D3 SVG path transitions whenever selected job / skill values update
  useEffect(() => {
    if (!chartGeometry) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (userPolygonRef.current) {
      const sel = d3.select(userPolygonRef.current);
      if (prefersReducedMotion) {
        sel.attr('d', chartGeometry.userPathD);
      } else {
        sel
          .transition()
          .duration(260)
          .ease(d3.easeCubicOut)
          .attr('d', chartGeometry.userPathD);
      }
    }

    if (requiredPolygonRef.current) {
      const sel = d3.select(requiredPolygonRef.current);
      if (prefersReducedMotion) {
        sel.attr('d', chartGeometry.requiredPathD);
      } else {
        sel
          .transition()
          .duration(260)
          .ease(d3.easeCubicOut)
          .attr('d', chartGeometry.requiredPathD);
      }
    }
  }, [chartGeometry]);

  if (!comparison || !chartGeometry) {
    return null;
  }

  const activeAxis =
    comparison.axes.find((a) => a.key === hoveredAxisKey) ||
    comparison.topFocusSkill ||
    comparison.strongestSkill ||
    comparison.axes[0];

  const userStrokeColor = isDarkMode ? '#3898FF' : '#007AFF';
  const reqStrokeColor = isDarkMode ? '#FBBF24' : '#D97706';
  const gridStrokeColor = isDarkMode ? '#273043' : '#E2E8F0';
  const spokeStrokeColor = isDarkMode ? '#334155' : '#CBD5E1';
  const labelColor = isDarkMode ? '#E2E8F0' : '#1E293B';
  const mutedTickColor = isDarkMode ? '#64748B' : '#94A3B8';

  return (
    <section
      aria-label="Top Matched Job Skill Radar Comparison"
      data-testid="top-role-skill-radar-card"
      className="ios-card bg-white/95 dark:bg-[#151822]/95 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 space-y-5"
    >
      {/* Header Row: Selected Role Context & Quick Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-[#007AFF] dark:text-[#3898FF]">
              D3 Skill Radar Comparison
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {comparison.job.title}
              </span>{' '}
              at {comparison.job.company}
            </span>
            {comparison.job.ctc && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-[#1E8E3E] dark:text-emerald-400 tabular-nums">
                  {comparison.job.ctc}
                </span>
              </>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Your Skill Proficiency vs. Required Role Stack
          </h3>
        </div>

        {/* Role Selector Tabs synced with Top Roles Cards */}
        <div
          role="tablist"
          aria-label="Compare Top Matched Roles on Radar"
          className="flex flex-wrap items-center gap-1 ios-segmented shrink-0"
        >
          {topJobs.map((job) => {
            const isSelected = job.id === comparison.job.id;
            return (
              <button
                key={job.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`radar-role-tab-${job.id}`}
                onClick={() => onSelectTopJob(job.id)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-[#007AFF] dark:text-[#3898FF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {job.company}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Left D3 Radar SVG + Legend, Right Skill Breakdown & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left 6 Cols: Interactive D3 SVG Radar Chart */}
        <div className="lg:col-span-6 flex flex-col items-center space-y-3">
          <div className="w-full max-w-[420px]">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              role="img"
              aria-label={`D3 radar chart comparing your skill proficiency against ${comparison.job.title} at ${comparison.job.company}`}
              data-testid="top-role-d3-radar-svg"
              className="w-full h-auto overflow-visible select-none"
            >
              <g transform={`translate(${CENTER_X}, ${CENTER_Y})`}>
                {/* Concentric Polygonal Grid Rings */}
                {chartGeometry.ringPaths.map((ring) => (
                  <g key={ring.level}>
                    <path
                      d={ring.d}
                      fill={
                        ring.level === 100
                          ? isDarkMode
                            ? 'rgba(30, 41, 59, 0.25)'
                            : 'rgba(241, 245, 249, 0.5)'
                          : 'none'
                      }
                      stroke={gridStrokeColor}
                      strokeWidth={ring.level === 100 ? 1.25 : 1}
                    />
                    <text
                      x={4}
                      y={-ring.ringRadius - 3}
                      fontSize="9.5"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                      fill={mutedTickColor}
                    >
                      {ring.level}%
                    </text>
                  </g>
                ))}

                {/* Radial Axis Spokes & Labels */}
                {chartGeometry.axisCoords.map((item) => {
                  const isActive = activeAxis?.key === item.axis.key;
                  return (
                    <g key={item.axis.key}>
                      <line
                        x1={0}
                        y1={0}
                        x2={item.spokeX2}
                        y2={item.spokeY2}
                        stroke={isActive ? userStrokeColor : spokeStrokeColor}
                        strokeWidth={isActive ? 1.5 : 1}
                        strokeOpacity={isActive ? 0.85 : 0.7}
                      />
                      <text
                        x={item.labelX}
                        y={item.labelY}
                        textAnchor={item.textAnchor}
                        dominantBaseline={item.dominantBaseline}
                        fontSize="11.5"
                        fontWeight={isActive || item.axis.isRequiredByJob ? 700 : 500}
                        fill={
                          isActive
                            ? userStrokeColor
                            : item.axis.isRequiredByJob
                            ? labelColor
                            : mutedTickColor
                        }
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredAxisKey(item.axis.key)}
                        onMouseLeave={() => setHoveredAxisKey(null)}
                      >
                        {item.axis.label}
                        {item.axis.isRequiredByJob ? '' : ' *'}
                      </text>
                    </g>
                  );
                })}

                {/* Series 1: Required Role Benchmark Polygon */}
                <path
                  ref={requiredPolygonRef}
                  data-testid="radar-required-polygon"
                  d={chartGeometry.requiredPathD}
                  fill={reqStrokeColor}
                  fillOpacity={isDarkMode ? 0.14 : 0.12}
                  stroke={reqStrokeColor}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />

                {/* Series 2: User Current Skill Proficiency Polygon */}
                <path
                  ref={userPolygonRef}
                  data-testid="radar-user-polygon"
                  d={chartGeometry.userPathD}
                  fill={userStrokeColor}
                  fillOpacity={isDarkMode ? 0.28 : 0.22}
                  stroke={userStrokeColor}
                  strokeWidth={2.5}
                />

                {/* Required Vertex Markers */}
                {chartGeometry.axisCoords.map((item) => (
                  <circle
                    key={`req-dot-${item.axis.key}`}
                    cx={item.reqX}
                    cy={item.reqY}
                    r={hoveredAxisKey === item.axis.key ? 4.5 : 3}
                    fill={isDarkMode ? '#151822' : '#FFFFFF'}
                    stroke={reqStrokeColor}
                    strokeWidth={2}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredAxisKey(item.axis.key)}
                    onMouseLeave={() => setHoveredAxisKey(null)}
                  />
                ))}

                {/* User Proficiency Interactive Vertex Markers */}
                {chartGeometry.axisCoords.map((item) => {
                  const isActive = hoveredAxisKey === item.axis.key;
                  return (
                    <circle
                      key={`user-dot-${item.axis.key}`}
                      data-testid={`radar-vertex-${item.axis.key}`}
                      cx={item.userX}
                      cy={item.userY}
                      r={isActive ? 6 : 4}
                      fill={userStrokeColor}
                      stroke={isDarkMode ? '#090D16' : '#FFFFFF'}
                      strokeWidth={2}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredAxisKey(item.axis.key)}
                      onMouseLeave={() => setHoveredAxisKey(null)}
                      onClick={() => setHoveredAxisKey(item.axis.key)}
                    />
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Clean Chart Legend + Active Axis Focus Readout */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <span
                  aria-hidden="true"
                  className="w-3 h-0.5 rounded-full bg-[#007AFF] dark:bg-[#3898FF]"
                />
                Your Proficiency
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                <span
                  aria-hidden="true"
                  className="w-3 h-0 border-t-2 border-dashed border-amber-600 dark:border-amber-400"
                />
                Required for Role
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                * Supporting profile skill
              </span>
            </div>

            {activeAxis && (
              <div
                data-testid="radar-active-readout"
                className="font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300"
              >
                <span className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                  {activeAxis.label}:
                </span>{' '}
                You {activeAxis.userProficiency}% · Req {activeAxis.requiredLevel}%
              </div>
            )}
          </div>
        </div>

        {/* Right 6 Cols: Role Readiness Summary + Tabular Skill Comparison */}
        <div className="lg:col-span-6 space-y-4">
          {/* KPI Summary Strip */}
          <div className="grid grid-cols-3 gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800 text-left">
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Role Readiness
              </div>
              <div
                data-testid="radar-readiness-pct"
                className="text-xl font-extrabold font-mono tabular-nums text-[#007AFF] dark:text-[#3898FF]"
              >
                {comparison.overallReadinessPct}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Skills Matched
              </div>
              <div
                data-testid="radar-skills-matched-ratio"
                className="text-xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100"
              >
                {comparison.matchedRequiredCount}/{comparison.totalRequiredCount}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Top Strength
              </div>
              <div className="text-sm font-bold text-[#1E8E3E] dark:text-emerald-400 truncate mt-1">
                {comparison.strongestSkill ? comparison.strongestSkill.label : 'Balanced'}
              </div>
            </div>
          </div>

          {/* Skill-by-Skill Hairline Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            <div className="grid grid-cols-12 pb-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="col-span-5">Skill Axis</div>
              <div className="col-span-2 text-right">You</div>
              <div className="col-span-2 text-right">Req</div>
              <div className="col-span-3 text-right">Fit</div>
            </div>

            {comparison.axes.map((axis) => {
              const isHighlighted = hoveredAxisKey === axis.key;
              const isPositive = axis.gap >= 0;
              return (
                <div
                  key={axis.key}
                  onMouseEnter={() => setHoveredAxisKey(axis.key)}
                  onMouseLeave={() => setHoveredAxisKey(null)}
                  className={`grid grid-cols-12 items-center py-2 text-xs transition-colors ${
                    isHighlighted
                      ? 'bg-[#F2F2F7]/80 dark:bg-slate-800/60 px-1.5 -mx-1.5 rounded-lg'
                      : ''
                  }`}
                >
                  <div className="col-span-5 font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                    {axis.label}
                    {!axis.isRequiredByJob && (
                      <span className="ml-1 text-[10px] font-normal text-slate-400">
                        (Bonus)
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-right font-mono font-semibold tabular-nums text-[#007AFF] dark:text-[#3898FF]">
                    {axis.userProficiency}%
                  </div>
                  <div className="col-span-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {axis.requiredLevel}%
                  </div>
                  <div className="col-span-3 text-right font-mono font-semibold tabular-nums">
                    {axis.isRequiredByJob ? (
                      <span
                        className={
                          isPositive
                            ? 'text-[#1E8E3E] dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {isPositive ? `+${axis.gap}%` : `${axis.gap}%`}
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">
                        {axis.tier}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="radar-inspect-role-btn"
              onClick={() => onInspectJob(comparison.job.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070E0] rounded-xl cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Inspect Role</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {comparison.topFocusSkill && (
              <button
                type="button"
                data-testid="radar-upskill-gap-btn"
                onClick={() => onNavigateToLearning(comparison.topFocusSkill?.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 hover:border-amber-400 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upskill {comparison.topFocusSkill.label}</span>
              </button>
            )}

            <button
              type="button"
              data-testid="radar-adjust-skills-btn"
              onClick={onNavigateToProfileSkills}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-[#F2F2F7] dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl cursor-pointer whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Adjust Proficiency</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
