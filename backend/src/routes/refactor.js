// backend/src/routes/refactor.js
import { Router } from 'express';
import { z } from 'zod';
import { generateContent } from '../services/llm-client.js';
import { buildRefactorPrompt } from '../prompts/index.js';
import { optionalAuth } from '../middleware/auth.js';
import { run } from '../models/database.js';

const router = Router();
const schema = z.object({
  language: z.enum(['python', 'javascript', 'typescript', 'go', 'java', 'rust', 'cpp']),
  code: z.string().min(10).max(50000),
});

router.post('/', optionalAuth, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { language, code } = parsed.data;
  const prompt = buildRefactorPrompt({ language, code });

  try {
    const raw = await generateContent(prompt, { temperature: 0.3 });
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    if (req.user) {
      run('INSERT INTO history (user_id, action_type, language, prompt, response) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'refactor', language, code.substring(0, 200), JSON.stringify(result)]);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
