// backend/src/routes/document.js
import { Router } from 'express';
import { z } from 'zod';
import { generateContent, streamContent } from '../services/llm-client.js';
import { buildDocumentPrompt } from '../prompts/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { run } from '../models/database.js';

const router = Router();
const schema = z.object({
  language: z.enum(['python', 'javascript', 'typescript', 'go', 'java', 'rust', 'cpp']),
  code: z.string().min(5).max(50000),
  stream: z.boolean().default(true),
});

router.post('/', optionalAuth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { language, code, stream } = parsed.data;
  const prompt = buildDocumentPrompt({ language, code });

  if (stream) return streamContent(prompt, res);

  try {
    const docs = await generateContent(prompt, { temperature: 0.3 });
    if (req.user) {
      run('INSERT INTO history (user_id, action_type, language, prompt, response) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'document', language, code.substring(0, 200), docs]);
    }
    res.json({ documentation: docs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
