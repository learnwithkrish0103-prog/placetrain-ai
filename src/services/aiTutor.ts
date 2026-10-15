import { Question } from '../types/aptitude';

export interface TutorResponse {
  success: boolean;
  content: string;
  source: 'gemini' | 'offline_tutor' | 'offline_fallback';
}

export async function askAiTutor(params: {
  action: 'hint' | 'simplify' | 'doubt';
  question: Question;
  query?: string;
  studentAnswer?: number | null;
}): Promise<TutorResponse> {
  const { action, question, query, studentAnswer } = params;

  try {
    const res = await fetch('/api/gemini/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        question: question.question,
        options: question.options,
        explanation: question.explanation,
        studentAnswer,
        query,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      content: data.content,
      source: data.source || 'gemini',
    };
  } catch (err) {
    console.warn('AI Tutor network call failed, providing stored pedagogical explanation:', err);
    // Offline deterministic fallback
    let fallbackText = '';
    if (action === 'hint') {
      fallbackText = question.hint || 'Identify the core ratio or base formula first. Check if units need conversion before calculating.';
    } else if (action === 'simplify') {
      fallbackText = `Key Concept Breakdown:\n\n1. Target: Solve for the exact unknown requested.\n2. Formula / Rule: ${question.formulaNotes || 'Follow standard proportionality.'}\n3. Official Solution: ${question.explanation}`;
    } else {
      fallbackText = `Tutor Note on this problem:\n\n• Principle: ${question.subtopic} (${question.topic})\n• Standard Solution: ${question.explanation}\n• Step-by-Step Breakdown:\n${question.stepByStepSolution.join('\n')}\n\nPlacement Tip: In campus recruitment drives, verify calculations with rough estimations to quickly eliminate wrong options!`;
    }

    return {
      success: true,
      content: fallbackText,
      source: 'offline_fallback',
    };
  }
}
