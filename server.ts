import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Role-specific system instructions
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  interview_coach: `You are the Lead Technical Interview Coach for Jobtracker AI, specializing in Data Science, Machine Learning, and AI Engineering roles.
Your role:
- Conduct rigorous, realistic mock interviews (Technical Screen, System Architecture, ML Theory, Take-Home Prep).
- Give concrete, actionable feedback on trade-offs (e.g., PyTorch vs JAX, vector databases, latency vs accuracy, LoRA vs full fine-tuning).
- Maintain multi-turn continuity: ask one challenging follow-up question at a time to simulate real interviewer pacing.
- Never hallucinate answers. Be encouraging, precise, and professional.`,

  resume_advisor: `You are the Senior Resume & Skill-Gap Strategist for Jobtracker AI.
Your role:
- Help candidates highlight their authentic technical accomplishments without fabricating experience.
- Guide the formulation of impact-driven bullet points using Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z].
- Advise on bridging missing keyword gaps (e.g., Transformers, Docker, MLOps, SQL) based on verified projects.`,

  negotiation_strategist: `You are an Executive Compensation & Career Negotiation Advisor for Jobtracker AI.
Your role:
- Guide candidates through evaluating job offers (Base Salary, Equity/RSUs, Sign-on Bonus, Benefits).
- Draft professional, respectful counter-offer emails and inquiry notes regarding decision timelines.
- Provide market salary benchmarks and strategic negotiation advice for AI/DS roles.`,

  career_strategist: `You are the Head Career Mentor for Jobtracker AI.
Your role:
- Help students and job seekers optimize their weekly application pipeline, outreach on LinkedIn, and GitHub portfolio visibility.
- Provide strategic advice on company research, networking with recruiters, and maintaining momentum during the job hunt.`
};

// API: Multi-turn Chat Endpoint with Gemini
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const {
      messages,
      modelChoice = 'gemini-3.8-flash',
      rolePersona = 'interview_coach',
      taskComplexity = 'general',
      context = ''
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Determine model based on task complexity or explicit choice
    let selectedModel = modelChoice;
    if (taskComplexity === 'complex') {
      selectedModel = 'gemini-4-argon';
    } else if (taskComplexity === 'fast') {
      selectedModel = 'gemini-3.1-flash-lite';
    } else if (taskComplexity === 'general' && !modelChoice) {
      selectedModel = 'gemini-3.8-flash';
    }

    const baseInstruction = SYSTEM_INSTRUCTIONS[rolePersona] || SYSTEM_INSTRUCTIONS.interview_coach;
    const fullSystemInstruction = context
      ? `${baseInstruction}\n\nContext regarding user's job hunt and background:\n${context}`
      : baseInstruction;

    // Convert messages to Gemini contents format
    const contents = messages.map((m: { role: 'user' | 'model'; content: string }) => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: 0.7,
      }
    });

    const replyText = response.text || 'I apologize, I could not generate a response. Please try again.';

    res.json({
      role: 'model',
      content: replyText,
      modelUsed: selectedModel,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process chat with Gemini.'
    });
  }
});

// Dev and Prod serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jobtracker AI server running on port ${PORT}`);
  });
}

startServer();
