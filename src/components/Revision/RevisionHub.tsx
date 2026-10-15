import React, { useState } from 'react';
import {
  BookMarked,
  Bookmark,
  History,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { PlaceTrackStorage } from '../../services/storage';
import { VERIFIED_QUESTION_BANK } from '../../data/questionBank';
import { Question } from '../../types/aptitude';

interface RevisionHubProps {
  onStartRevisionDrill: (title: string, questions: Question[]) => void;
}

export const RevisionHub: React.FC<RevisionHubProps> = ({ onStartRevisionDrill }) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'incorrect' | 'attempted' | 'due'>(
    'bookmarks'
  );

  const bookmarks = PlaceTrackStorage.getBookmarks();
  const wrongAnswers = PlaceTrackStorage.getWrongAnswers();
  const sessions = PlaceTrackStorage.getSessions();

  // Bookmarked questions
  const bookmarkedQuestions = bookmarks
    .map((b) => VERIFIED_QUESTION_BANK.find((q) => q.id === b.questionId))
    .filter((q): q is Question => q !== undefined);

  // Incorrect questions
  const incorrectQuestions = wrongAnswers.map((w) => w.question);

  // Previously attempted questions
  const attemptedQuestionIds = new Set<string>();
  sessions.forEach((s) => s.answers.forEach((a) => attemptedQuestionIds.add(a.questionId)));
  const attemptedQuestions = Array.from(attemptedQuestionIds)
    .map((id) => VERIFIED_QUESTION_BANK.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  // Due for revision (spaced repetition: questions with mistake count > 0 or attempted > 24 hours ago)
  const dueForRevisionQuestions = wrongAnswers
    .filter((w) => !w.isUnderstood)
    .map((w) => w.question);

  const getCurrentList = () => {
    switch (activeTab) {
      case 'bookmarks':
        return bookmarkedQuestions;
      case 'incorrect':
        return incorrectQuestions;
      case 'attempted':
        return attemptedQuestions;
      case 'due':
        return dueForRevisionQuestions;
    }
  };

  const currentQuestions = getCurrentList();

  const handleLaunchRevision = () => {
    if (currentQuestions.length === 0) return;
    const tabName =
      activeTab === 'bookmarks'
        ? 'Bookmarked Questions'
        : activeTab === 'incorrect'
        ? 'Wrong Answers Revision'
        : activeTab === 'attempted'
        ? 'Past Questions Review'
        : 'Spaced Repetition Due List';

    onStartRevisionDrill(tabName, currentQuestions);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BookMarked className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Revision & Memory Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Strengthen weak formulas and reinforce problem-solving patterns through targeted revision drills.
          </p>
        </div>

        {currentQuestions.length > 0 && (
          <button
            onClick={handleLaunchRevision}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Revision Drill ({currentQuestions.length} Questions)</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bookmarks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarked ({bookmarkedQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('due')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'due'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due for Revision ({dueForRevisionQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('incorrect')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'incorrect'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Incorrect History ({incorrectQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attempted')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'attempted'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>All Attempted ({attemptedQuestions.length})</span>
        </button>
      </div>

      {/* List */}
      {currentQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No questions in this revision bucket yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bookmark tricky questions while practicing or re-solve wrong answers to build your personal memory deck.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="font-bold text-indigo-600">{q.topic}</span>
                  <span className="font-mono text-slate-600">{q.difficulty}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-slate-900 line-clamp-3 mt-2 leading-relaxed">
                  {q.question}
                </h4>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Subtopic: {q.subtopic}</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Option {['A', 'B', 'C', 'D'][q.correctAnswer]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
