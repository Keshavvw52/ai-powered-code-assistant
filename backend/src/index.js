import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { initDb } from './models/database.js';

import authRoutes from './routes/auth.js';
import generateRoutes from './routes/generate.js';
import reviewRoutes from './routes/review.js';
import explainRoutes from './routes/explain.js';
import documentRoutes from './routes/document.js';
import testsRoutes from './routes/tests.js';
import translateRoutes from './routes/translate.js';
import refactorRoutes from './routes/refactor.js';
import snippetsRoutes from './routes/snippets.js';
import miscRoutes from './routes/misc.js';

const app = express();

// Security & middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: { error: 'Too many requests' } });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: 'AI rate limit exceeded' } });
app.use('/api/', limiter);
app.use('/api/generate', aiLimiter);
app.use('/api/review', aiLimiter);
app.use('/api/explain', aiLimiter);
app.use('/api/document', aiLimiter);
app.use('/api/tests', aiLimiter);
app.use('/api/translate', aiLimiter);
app.use('/api/refactor', aiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/refactor', refactorRoutes);
app.use('/api/snippets', snippetsRoutes);
app.use('/api', miscRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start
async function start() {
  await initDb();
  app.listen(config.port, () => {
    console.log(` Server running on http://localhost:${config.port}`);
    console.log(` Gemini API key: ${config.geminiApiKey ? ' configured' : ' missing'}`);
  });
}

start().catch(console.error);
