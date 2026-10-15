import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Play,
  Award,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Calculator,
  Cpu,
  BarChart3,
} from 'lucide-react';
import { CategoryId, Difficulty, Question } from '../../types/aptitude';
import { CATEGORIES_CONFIG, ALL_TOPICS_CATALOG } from '../../data/topicsCatalog';
import { VERIFIED_QUESTION_BANK } from '../../data/questionBank';
import { getAdaptiveRecommendationForTopic } from '../../services/adaptiveEngine';

interface AptitudeDashboardProps {
  onStartLearnMode: (topicTitle: string, questions: Question[]) => void;
  onStartPracticeMode: (topicTitle: string, difficulty: Difficulty | 'All', count: number, questions: Question[]) => void;
  onStartMockTest: () => void;
}

export const AptitudeDashboard: React.FC<AptitudeDashboardProps> = ({
  onStartLearnMode,
  onStartPracticeMode,
  onStartMockTest,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('quant');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);

  // Group questions by topic for quick lookup
  const questionsByTopic = useMemo(() => {
    const map = new Map<string, Question[]>();
    VERIFIED_QUESTION_BANK.forEach((q) => {
      const list = map.get(q.topic) || [];
      list.push(q);
      map.set(q.topic, list);
    });
    return map;
  }, []);

  // Filter topics for the active category and search
  const filteredTopics = useMemo(() => {
    return ALL_TOPICS_CATALOG.filter((topic) => {
      const matchesCategory = topic.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.frequentInCompanies.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const currentCategoryConfig = CATEGORIES_CONFIG.find((c) => c.id === activeCategory);

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'quant':
        return <Calculator className="w-4 h-4" />;
      case 'logical':
        return <Cpu className="w-4 h-4" />;
      case 'verbal':
        return <BookOpen className="w-4 h-4" />;
      case 'di':
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Mock Test Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Placement Assessment Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Comprehensive Campus Aptitude Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice mathematically verified questions, test your speed under real timer constraints, and receive instant step-by-step verified explanations.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartMockTest}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Full Placement Mock Test (25 Mins)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Domain Selection Tabs (Anti-pill clean segmented buttons) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {CATEGORIES_CONFIG.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or company..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Category Description Banner */}
        {currentCategoryConfig && (
          <div className="text-xs text-slate-500">
            <span>{currentCategoryConfig.description}</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="font-semibold text-slate-700">
              {filteredTopics.length} Curriculum Topics Available
            </span>
          </div>
        )}
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => {
          const availableQuestions = questionsByTopic.get(topic.title) || [];
          const hasQuestions = availableQuestions.length > 0;
          const adaptiveRec = getAdaptiveRecommendationForTopic(topic.title);

          return (
            <div
              key={topic.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Topic Header & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{topic.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      {hasQuestions ? (
                        <>
                          <span className="font-semibold text-indigo-600">{availableQuestions.length} Questions</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700">Verified & Active</span>
                        </>
                      ) : (
                        <span className="text-amber-700 font-medium">Curriculum in Verification</span>
                      )}
                    </div>
                  </div>

                  {hasQuestions ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" title="Active topic" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1" title="In development" />
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{topic.description}</p>

                {/* Adaptive Recommendation Tag & Explanation */}
                {hasQuestions && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Adaptive Recommendation:</span>
                      <span className="font-bold text-indigo-600">{adaptiveRec.recommendedDifficulty}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {adaptiveRec.actionGuidance}
                    </p>
                  </div>
                )}

                {/* Key Formulas Preview */}
                {topic.keyFormulas && topic.keyFormulas.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Key Formula:
                    </div>
                    <div className="font-mono text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200/80">
                      {topic.keyFormulas[0]}
                    </div>
                  </div>
                )}

                {/* Companies Tested In */}
                {topic.frequentInCompanies && topic.frequentInCompanies.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-medium text-slate-700">Frequent in: </span>
                    <span>{topic.frequentInCompanies.slice(0, 3).join(' · ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                {hasQuestions ? (
                  <>
                    <button
                      onClick={() => onStartLearnMode(topic.title, availableQuestions)}
                      className="flex-1 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      Learn Mode
                    </button>
                    <button
                      onClick={() =>
                        onStartPracticeMode(
                          topic.title,
                          adaptiveRec.recommendedDifficulty,
                          selectedQuestionCount,
                          availableQuestions
                        )
                      }
                      className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Practice ({adaptiveRec.recommendedDifficulty})
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 italic">
                    Curriculum verification in progress
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
