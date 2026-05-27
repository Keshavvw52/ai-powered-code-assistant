// src/routes/generate.js
import { Router } from 'express';
import { z } from 'zod';
import { streamContent, generateContent } from '../services/llm-client.js';
import { buildGeneratePrompt, buildRefinePrompt } from '../prompts/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { run } from '../models/database.js';

const router = Router();

const generateSchema = z.object({
  language: z.enum(['python', 'javascript', 'typescript', 'go', 'java', 'rust', 'cpp']),
  prompt: z.string().min(10).max(2000),
  complexity: z.enum(['snippet', 'function', 'module', 'boilerplate']).default('function'),
  existingCode: z.string().optional(),
  stream: z.boolean().default(true),
});

const refineSchema = z.object({
  language: z.enum(['python', 'javascript', 'typescript', 'go', 'java', 'rust', 'cpp']),
  existingCode: z.string().min(1),
  refinement: z.string().min(5).max(1000),
  stream: z.boolean().default(true),
});

router.post('/', optionalAuth, async (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { language, prompt, complexity, existingCode, stream } = parsed.data;
  const llmPrompt = buildGeneratePrompt({ language, prompt, complexity, existingCode });

  if (req.user) {
    run('INSERT INTO history (user_id, action_type, language, prompt, response) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'generate', language, prompt, '']);
  }

  if (stream) {
    return streamContent(llmPrompt, res);
  }

  try {
    const code = await generateContent(llmPrompt);
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refine', optionalAuth, async (req, res) => {
  const parsed = refineSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { language, existingCode, refinement, stream } = parsed.data;
  const llmPrompt = buildRefinePrompt({ language, existingCode, refinement });

  if (stream) {
    return streamContent(llmPrompt, res);
  }

  try {
    const code = await generateContent(llmPrompt);
    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;