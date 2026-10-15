import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  Target,
  Award,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PlaceTrackStorage } from '../../services/storage';

export const PersonalizedAnalytics: React.FC = () => {
  const analytics = PlaceTrackStorage.getAnalyticsSummary();
  const sessions = PlaceTrackStorage.getSessions();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Personalized Placement Analytics</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Metrics computed strictly from your verified assessment submissions and practice sessions.
        </p>
      </div>

      {/* KPI 4-Card Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Questions Attempted</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics.totalAttempted}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {analytics.sessionsCompleted} practice sessions
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Overall Accuracy</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums mt-1">
            {analytics.overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {analytics.totalCorrect} correct answers recorded
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Avg Time per Problem</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {analytics.avgTimePerQuestion}s
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Target for campus drives: &lt; 75s</div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Topics Mastered</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {analytics.completedTopicsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">&ge; 5 questions with &ge; 60% accuracy</div>
        </div>
      </div>

      {/* Weak vs Strong Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <div className="p-6 bg-white rounded-xl border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Weakest Topics (Requires Practice)</h3>
          </div>

          {analytics.weakTopics.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              No critical weak topics detected. Great job! Maintain consistency across all categories.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.weakTopics.map((topic) => {
                const stat = analytics.topicStats[topic];
                return (
                  <div key={topic} className="p-3 bg-rose-50/50 rounded-lg border border-rose-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-rose-950">{topic}</span>
                      <span className="font-mono font-bold text-rose-700">{stat.accuracy}% Accuracy</span>
                    </div>
                    <div className="text-[11px] text-rose-600 mt-0.5">
                      {stat.correct} of {stat.attempted} correct · Recommended: Revisit Easy questions
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Strong Topics */}
        <div className="p-6 bg-white rounded-xl border border-emerald-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Topics Ready for Advanced / Hard Practice</h3>
          </div>

          {analytics.strongTopics.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">
              Practice more questions to unlock insights and master topics for advanced challenge levels.
            </p>
          ) : (
            <div className="space-y-3">
              {analytics.strongTopics.map((topic) => {
                const stat = analytics.topicStats[topic];
                return (
                  <div key={topic} className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-emerald-950">{topic}</span>
                      <span className="font-mono font-bold text-emerald-700">{stat.accuracy}% Accuracy</span>
                    </div>
                    <div className="text-[11px] text-emerald-600 mt-0.5">
                      {stat.correct} of {stat.attempted} correct · Ready for TCS Digital / Amazon level questions
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900">Difficulty-Wise Accuracy Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
            const stat = analytics.difficultyStats[diff];
            const hasAttempts = stat.attempted > 0;

            return (
              <div key={diff} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">{diff} Difficulty</span>
                  <span className="font-mono text-xs font-semibold text-slate-600">
                    {hasAttempts ? `${stat.accuracy}%` : 'N/A'}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      diff === 'Easy'
                        ? 'bg-emerald-500'
                        : diff === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                  {hasAttempts
                    ? `${stat.correct} / ${stat.attempted} correct`
                    : 'Practice more questions to unlock insights.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Accuracy Table */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Topic Accuracy Ledger</h3>

        {Object.keys(analytics.topicStats).length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No topic attempts recorded yet. Solve your first module in Aptitude Practice to view detailed stats!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Topic Title</th>
                  <th className="py-2.5 px-3">Attempted</th>
                  <th className="py-2.5 px-3">Correct</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3">Status Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(analytics.topicStats).map(([topic, stat]) => {
                  const isLow = stat.attempted < 3;
                  return (
                    <tr key={topic} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{topic}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">{stat.attempted}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">{stat.correct}</td>
                      <td className="py-2.5 px-3 font-mono font-bold tabular-nums">
                        {isLow ? (
                          <span className="text-slate-400 font-normal">
                            Practice more questions to unlock insights.
                          </span>
                        ) : (
                          <span
                            className={
                              stat.accuracy >= 70
                                ? 'text-emerald-600'
                                : stat.accuracy >= 50
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }
                          >
                            {stat.accuracy}%
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-500">
                        {isLow
                          ? 'Min 3 questions needed for reliable benchmark'
                          : stat.accuracy >= 75
                          ? 'Mastered · Ready for Mock Tests'
                          : stat.accuracy >= 50
                          ? 'Progressing · Practice Medium'
                          : 'Focus needed · Re-solve formulas'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Storage persistence disclaimer (Requirement 12) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed">
        <strong className="text-slate-700">Local Data Storage Notice: </strong>
        Your assessment attempts, wrong answers notebook, and performance metrics are reliably saved in your browser's persistent local storage. They remain available across sessions and page refreshes. Please note that localStorage is browser-specific and does not automatically synchronize across separate devices.
      </div>
    </div>
  );
};
