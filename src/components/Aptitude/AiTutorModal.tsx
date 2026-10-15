import React, { useState, useEffect } from 'react';
import { X, Sparkles, Send, Lightbulb, HelpCircle, Bot, Loader2 } from 'lucide-react';
import { Question } from '../../types/aptitude';
import { askAiTutor } from '../../services/aiTutor';

interface AiTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  initialMode: 'hint' | 'simplify' | 'doubt';
}

export const AiTutorModal: React.FC<AiTutorModalProps> = ({
  isOpen,
  onClose,
  question,
  initialMode,
}) => {
  const [activeTab, setActiveTab] = useState<'hint' | 'simplify' | 'doubt'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [hintText, setHintText] = useState<string>('');
  const [explainText, setExplainText] = useState<string>('');
  const [userQuery, setUserQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'tutor'; text: string; timestamp: number }[]
  >([]);

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'hint' && !hintText) {
      loadHint();
    } else if (activeTab === 'simplify' && !explainText) {
      loadExplanation();
    }
  }, [isOpen, activeTab]);

  const loadHint = async () => {
    setLoading(true);
    try {
      const res = await askAiTutor({
        action: 'hint',
        question,
      });
      setHintText(res.content);
    } catch (e) {
      setHintText(question.hint || 'Identify the core ratio and target unknown before computing.');
    } finally {
      setLoading(false);
    }
  };

  const loadExplanation = async () => {
    setLoading(true);
    try {
      const res = await askAiTutor({
        action: 'simplify',
        question,
      });
      setExplainText(res.content);
    } catch (e) {
      setExplainText(question.explanation);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || loading) return;

    const query = userQuery.trim();
    setUserQuery('');

    const newMessages = [
      ...chatMessages,
      { sender: 'user' as const, text: query, timestamp: Date.now() },
    ];
    setChatMessages(newMessages);

    setLoading(true);
    try {
      const res = await askAiTutor({
        action: 'doubt',
        question,
        query,
      });
      setChatMessages([
        ...newMessages,
        { sender: 'tutor' as const, text: res.content, timestamp: Date.now() },
      ]);
    } catch (e) {
      setChatMessages([
        ...newMessages,
        {
          sender: 'tutor' as const,
          text: 'Unable to connect to tutor backend. Please review the official solution steps provided with the question.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Placement Aptitude Tutor</h3>
              <p className="text-xs text-slate-500">
                Grounded guidance for {question.topic} · {question.difficulty}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('hint')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'hint'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Get a Hint</span>
          </button>
          <button
            onClick={() => setActiveTab('simplify')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'simplify'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Explain Problem</span>
          </button>
          <button
            onClick={() => setActiveTab('doubt')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'doubt'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Ask Follow-up Doubt</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Question reminder */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 line-clamp-3">
            <strong className="text-slate-800">Problem: </strong>
            {question.question}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-500 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Consulting AI Tutor...</span>
            </div>
          )}

          {!loading && activeTab === 'hint' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Conceptual Direction (Without Spoiling the Answer)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {hintText || question.hint}
              </p>
            </div>
          )}

          {!loading && activeTab === 'simplify' && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Intuitive Step-by-Step Breakdown</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                {explainText || question.explanation}
              </p>
            </div>
          )}

          {activeTab === 'doubt' && (
            <div className="space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium text-slate-700">Have a doubt about this aptitude problem?</p>
                  <p className="mt-1 text-slate-400">
                    Ask how a specific step works, request a faster shortcut formula, or clarify terms.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Input for Follow-up Doubt */}
        {activeTab === 'doubt' && (
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50"
          >
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="E.g., Can you explain why we used LCM of 12 and 18?"
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={!userQuery.trim() || loading}
              className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
          <span>Powered by Gemini 3.8 Flash & PlaceTrack Pedagogy</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Back to Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
