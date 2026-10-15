import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

function getOfflinePedagogicalAnswer(
  action: string,
  question: string,
  explanation: string,
  query?: string
): string {
  if (action === 'hint') {
    return 'Conceptual Tip: Identify the core variable or baseline ratio first. Break down the given values into standard fractional parts or speed/time proportions before computing the final value.';
  }
  if (action === 'simplify') {
    return `Simplified Walkthrough:\n\n1. What is being asked: Identify the target output from the given constraints.\n2. Key Relationship: ${explanation || 'Follow standard proportionality and step-by-step substitution.'}\n3. Core Takeaway: Keep units consistent and verify if the final answer matches reasonable estimation bounds.`;
  }
  return `Tutor Explanation:\n\nRegarding your question: "${query || 'How to solve this problem'}"\n\n• Analysis: This problem tests standard placement aptitude principles. Make sure to clearly mark given data vs unknown variables.\n• Standard Formula & Reference: ${explanation || 'See step-by-step breakdown above.'}\n• Verification Tip: In campus recruitment tests (like TCS NQT, Infosys, Cognizant), always double check calculations with rough estimation to rule out distractor options quickly.`;
}

// AI Placement Aptitude Tutor Route
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { action, question, options, explanation, query } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        success: true,
        source: 'offline_tutor',
        content: getOfflinePedagogicalAnswer(action, question, explanation, query),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let prompt = '';
    if (action === 'hint') {
      prompt = `You are a high-level aptitude mentor for campus placement preparation (TCS, Infosys, Wipro, Accenture, Cognizant).
The student is currently attempting this question:
Question: ${question}
Options: ${JSON.stringify(options)}

Provide a concise, thoughtful HINT (2 to 3 sentences max) that guides their thinking toward the formula or pattern WITHOUT revealing which option is correct or giving away the final numerical value.`;
    } else if (action === 'simplify') {
      prompt = `You are an expert placement aptitude coach.
Explain this problem in crystal-clear, intuitive, simple steps for a student preparing for campus recruitment:
Question: ${question}
Official Solution: ${explanation}

Break down:
1. What the problem gives us
2. The core logic or shortcut
3. Step-by-step calculation
4. Why common mistakes happen in placement exams
Keep it encouraging and readable.`;
    } else {
      prompt = `You are PlaceTrack AI's expert Placement Aptitude Tutor.
Context of the question:
Question: ${question}
Options: ${JSON.stringify(options)}
Standard Solution: ${explanation}

Student's Doubt / Follow-up Query:
${query || 'Could you explain this problem step by step and give me a shortcut tip?'}

Give a helpful, mathematically verified, structured response with clear calculation steps and tips for placement aptitude tests.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are PlaceTrack AI, an encouraging and mathematically rigorous placement preparation aptitude tutor. Format formulas clearly and provide insightful explanations.',
      },
    });

    return res.json({
      success: true,
      source: 'gemini',
      content: response.text || getOfflinePedagogicalAnswer(action, question, explanation, query),
    });
  } catch (error: any) {
    console.error('Gemini API error in tutor route:', error);
    const { action, question, explanation, query } = req.body;
    return res.json({
      success: true,
      source: 'offline_fallback',
      content: getOfflinePedagogicalAnswer(action, question, explanation, query),
    });
  }
});

// Mount Vite or static server
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, host: '0.0.0.0', port },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`PlaceTrack AI server running on http://0.0.0.0:${port}`);
});
