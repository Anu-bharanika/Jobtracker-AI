import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health / Status endpoint (100% Free, zero billing, zero paid APIs)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: '100% Free & Open',
    pricing: 'Zero Billing Required',
    timestamp: new Date().toISOString()
  });
});

// Fallback chat endpoint (zero API key, zero token cost, zero billing)
app.post('/api/gemini/chat', (req, res) => {
  const { messages, rolePersona = 'interview_coach' } = req.body;
  const lastMsg = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '';
  
  res.json({
    role: 'model',
    content: `Thank you for your question! As your 100% free career assistant, I am running completely free without any billing or token costs. Let me know if you would like mock interview questions, resume bullet tailoring, or salary negotiation advice!`,
    modelUsed: 'Free Client Engine',
    timestamp: new Date().toISOString()
  });
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
    console.log(`Jobtracker free server running on port ${PORT}`);
  });
}

startServer();
