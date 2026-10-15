import React, { useState } from 'react';
import {
  Dna,
  Calculator,
  Cpu,
  BookOpen,
  BarChart3,
  Code,
  Terminal,
  Award,
  ChevronRight,
  Info,
  Clock,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SkillTrackMetrics, SkillClassification } from '../../types/aptitude';

interface PlacementDNAMapProps {
  skills: SkillTrackMetrics[];
  onPracticeSkill: (skill: SkillTrackMetrics) => void;
}

export const PlacementDNAMap: React.FC<PlacementDNAMapProps> = ({
  skills,
  onPracticeSkill,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || 'track-quant');
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const getClassificationBadge = (cls: SkillClassification) => {
    switch (cls) {
      case 'Strong':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Consistent':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Developing':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Beginner':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Insufficient Data':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quant':
        return <Calculator className="w-4 h-4 text-blue-600" />;
      case 'logical':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      case 'verbal':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'di':
        return <BarChart3 className="w-4 h-4 text-amber-600" />;
      case 'coding':
        return <Code className="w-4 h-4 text-violet-600" />;
      case 'technical':
        return <Terminal className="w-4 h-4 text-teal-600" />;
      case 'mock':
      default:
        return <Award className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Personal Placement DNA</h2>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                7 Skill Areas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live algorithmic skill mapping calibrated against actual campus placement assessments.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRulesInfo(!showRulesInfo)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showRulesInfo ? 'Hide Classification Rules' : 'Classification Rules'}</span>
        </button>
      </div>

      {/* Transparent Classification Rules Explanation */}
      {showRulesInfo && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2 animate-in fade-in duration-150">
          <div className="font-bold text-slate-900">How Skills Are Classified:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-slate-800">Insufficient Data:</strong> &lt; 3 attempts. Baseline still developing.
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-rose-700">Beginner:</strong> &lt; 45% accuracy. Focus on fundamentals.
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-amber-700">Developing:</strong> 45% – 64% accuracy. Build speed & eliminate traps.
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <strong className="text-blue-700">Consistent:</strong> 65% – 79% accuracy. Reliable under exam conditions.
            </div>
            <div className="p-2 bg-white rounded border border-slate-200 sm:col-span-2 md:col-span-4">
              <strong className="text-emerald-700">Strong:</strong> &ge; 80% accuracy across 5+ verified question attempts. Top-tier placement readiness!
            </div>
          </div>
        </div>
      )}

      {/* Desktop 2-Column Split: Skill Grid (Left) + Deep Dive Radar Deck (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 7 Skills List */}
        <div className="lg:col-span-7 space-y-2.5">
          {skills.map((skill) => {
            const isSelected = skill.id === selectedSkillId;
            const hasData = skill.classification !== 'Insufficient Data';

            return (
              <div
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                    {getCategoryIcon(skill.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {skill.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getClassificationBadge(
                          skill.classification
                        )}`}
                      >
                        {skill.classification}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {hasData
                        ? `${skill.attempted} attempted · ${skill.accuracy}% accuracy · ${skill.avgTimeSeconds}s avg`
                        : 'Practice questions to calibrate placement readiness'}
                    </div>
                  </div>
                </div>

                {/* Progress bar snippet */}
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${hasData ? skill.accuracy : 0}%` }}
                    />
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isSelected ? 'translate-x-1 text-indigo-600' : ''
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Skill Deep-Dive Inspector Deck */}
        <div className="lg:col-span-5 bg-slate-50/70 rounded-xl border border-slate-200 p-5 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {getCategoryIcon(selectedSkill.category)}
              <span>Skill Deep Dive</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{selectedSkill.name}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{selectedSkill.description}</p>
          </div>

          {/* Metric Quad */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">Accuracy</div>
              <div className="text-lg font-bold text-indigo-600 font-mono tabular-nums mt-0.5">
                {selectedSkill.classification === 'Insufficient Data' ? 'N/A' : `${selectedSkill.accuracy}%`}
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">Attempted</div>
              <div className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                {selectedSkill.attempted}
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">Correct / Wrong</div>
              <div className="text-sm font-semibold text-slate-800 font-mono tabular-nums mt-1">
                {selectedSkill.correct} / {selectedSkill.incorrect}
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">Avg Time</div>
              <div className="text-sm font-semibold text-slate-800 font-mono tabular-nums mt-1">
                {selectedSkill.attempted > 0 ? `${selectedSkill.avgTimeSeconds}s` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Status rationale */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Classification Rationale:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getClassificationBadge(selectedSkill.classification)}`}>
                {selectedSkill.classification}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {selectedSkill.classificationReason}
            </p>
          </div>

          {/* Weak Topics in this track */}
          {selectedSkill.weakTopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Topics Requiring Practice:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkill.weakTopics.map((wt, i) => (
                  <span
                    key={i}
                    className="text-xs bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded"
                  >
                    {wt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strong Topics in this track */}
          {selectedSkill.strongTopics.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demonstrated Strengths:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkill.strongTopics.map((st, i) => (
                  <span
                    key={i}
                    className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action CTA */}
          <button
            onClick={() => onPracticeSkill(selectedSkill)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Practice {selectedSkill.name}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
