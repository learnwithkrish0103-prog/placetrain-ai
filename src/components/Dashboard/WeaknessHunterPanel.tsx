import React from 'react';
import { Crosshair, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
import { WeaknessInsight } from '../../types/aptitude';

interface WeaknessHunterPanelProps {
  insights: WeaknessInsight[];
  onStartRemediation: (insight: WeaknessInsight) => void;
}

export const WeaknessHunterPanel: React.FC<WeaknessHunterPanelProps> = ({
  insights,
  onStartRemediation,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Weakness Hunter</h2>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Pattern Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithmically scans practice mistakes, answer latencies, and recurring traps to diagnose underlying gaps.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          {insights.length} Learning {insights.length === 1 ? 'Gap' : 'Gaps'} Identified
        </div>
      </div>

      {/* Empty State */}
      {insights.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Critical Weaknesses Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your recent practice demonstrates solid consistency across attempted topics. Continue taking mock assessments and timed drills to keep your accuracy high.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                insight.severity === 'confirmed'
                  ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                  : 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
              }`}
            >
              <div className="space-y-3">
                {/* Topic Header & Severity Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Topic Area
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{insight.topic}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      insight.severity === 'confirmed'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {insight.severity === 'confirmed' ? 'Confirmed Pattern' : 'Emerging Observation'}
                  </span>
                </div>

                {/* Evidence from Practice */}
                <div className="p-3 bg-white rounded-lg border border-slate-200/80 text-xs space-y-1">
                  <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Evidence from Actual Practice:</span>
                  </div>
                  <p className="text-slate-600 font-mono text-[11px] leading-relaxed">
                    {insight.evidence}
                  </p>
                </div>

                {/* Likely Learning Gap */}
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Likely Root Cause / Gap:</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {insight.likelyGap}
                  </p>
                </div>

                {/* Way to Measure Improvement */}
                <div className="text-xs space-y-1 pt-1 border-t border-slate-200/50">
                  <span className="font-semibold text-indigo-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    <span>Target Metric to Confirm Mastery:</span>
                  </span>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {insight.improvementMetric}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => onStartRemediation(insight)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Recommended Practice Drill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
