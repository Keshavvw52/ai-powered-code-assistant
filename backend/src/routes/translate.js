// src/routes/translate.js
import { Router } from 'express';
import { z } from 'zod';
import { generateContent, streamContent } from '../services/llm-client.js';
import { buildTranslatePrompt } from '../prompts/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { run } from '../models/database.js';

const router = Router();
const LANGS = ['python', 'javascript', 'typescript', 'go', 'java', 'rust', 'cpp'];

const schema = z.object({
  sourceLanguage: z.enum(LANGS),
  targetLanguage: z.enum(LANGS),
  code: z.string().min(5).max(50000),
  stream: z.boolean().default(true),
});

router.post('/', optionalAuth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { sourceLanguage, targetLanguage, code, stream } = parsed.data;
  if (sourceLanguage === targetLanguage) return res.status(400).json({ error: 'Source and target must differ' });

  const prompt = buildTranslatePrompt({ sourceLanguage, targetLanguage, code });

  if (stream) return streamContent(prompt, res);

  try {
    const translated = await generateContent(prompt, { temperature: 0.4 });
    if (req.user) {
      run('INSERT INTO history (user_id, action_type, language, prompt, response) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'translate', `${sourceLanguage}->${targetLanguage}`, code.substring(0, 200), translated]);
    }
    res.json({ translatedCode: translated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;