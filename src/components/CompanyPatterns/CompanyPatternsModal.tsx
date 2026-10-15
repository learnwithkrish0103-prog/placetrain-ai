import React from 'react';
import { X, Award, Clock, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { COMPANY_PLACEMENT_PATTERNS, CompanyPlacementPattern } from '../../data/companyPatterns';

interface CompanyPatternsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCompanyDrill?: (company: CompanyPlacementPattern) => void;
}

export const CompanyPatternsModal: React.FC<CompanyPatternsModalProps> = ({
  isOpen,
  onClose,
  onStartCompanyDrill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Campus Placement Aptitude Patterns & Syllabus
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs text-slate-500">
            Real sectional patterns, question distributions, and time limits from major IT recruiters for the 2025–2026 placement season.
          </p>

          <div className="space-y-4">
            {COMPANY_PLACEMENT_PATTERNS.map((comp) => (
              <div key={comp.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${comp.color} text-white font-bold text-sm flex items-center justify-center shadow-xs`}
                    >
                      {comp.logoLetter}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{comp.name}</h3>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Total Time: {comp.totalDurationMinutes} mins · Target Readiness: &ge; {comp.readinessThresholdScore}%
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                    Eligibility: {comp.eligibility}
                  </span>
                </div>

                {/* Sectional Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  {comp.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-800">{sec.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {sec.questionCount} Questions · {sec.timeMinutes} Mins
                      </div>
                      <div className="text-[11px] text-indigo-600 font-medium">
                        Focus: {sec.keyTopics.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
