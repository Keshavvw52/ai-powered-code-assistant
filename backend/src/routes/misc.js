// src/routes/misc.js
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { queryAll } from '../models/database.js';
import { generateContent } from '../services/llm-client.js';
import { buildDetectLanguagePrompt } from '../prompts/index.js';
import { z } from 'zod';

const router = Router();

router.get('/history', authenticate, (req, res) => {
  const history = queryAll(
    'SELECT id, action_type, language, prompt, created_at FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json({ history });
});

router.post('/detect-language', async (req, res) => {
  const parsed = z.object({ code: z.string().min(5) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Code required' });

  try {
    const raw = await generateContent(buildDetectLanguagePrompt({ code: parsed.data.code }), { temperature: 0.1 });
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'python', label: 'Python', testFramework: 'pytest', docFormat: 'Docstrings' },
      { id: 'javascript', label: 'JavaScript', testFramework: 'Jest', docFormat: 'JSDoc' },
      { id: 'typescript', label: 'TypeScript', testFramework: 'Vitest', docFormat: 'TSDoc' },
      { id: 'go', label: 'Go', testFramework: 'testing', docFormat: 'GoDoc' },
      { id: 'java', label: 'Java', testFramework: 'JUnit 5', docFormat: 'Javadoc' },
      { id: 'rust', label: 'Rust', testFramework: 'cargo test', docFormat: '/// docs' },
      { id: 'cpp', label: 'C++', testFramework: 'Google Test', docFormat: 'Doxygen' },
    ],
  });
});

router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

export default router;