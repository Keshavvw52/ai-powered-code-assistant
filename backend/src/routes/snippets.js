// src/routes/snippets.js
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { queryAll, queryOne, run, getLastInsertId } from '../models/database.js';

const router = Router();

const snippetSchema = z.object({
  title: z.string().min(1).max(200),
  language: z.string(),
  code: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

router.get('/', authenticate, (req, res) => {
  const { search, language } = req.query;
  let sql = 'SELECT * FROM snippets WHERE user_id = ?';
  const params = [req.user.id];

  if (language) { sql += ' AND language = ?'; params.push(language); }
  if (search) { sql += ' AND (title LIKE ? OR code LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY created_at DESC';

  const snippets = queryAll(sql, params).map(s => ({ ...s, tags: JSON.parse(s.tags || '[]') }));
  res.json({ snippets });
});

router.post('/', authenticate, (req, res) => {
  const parsed = snippetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { title, language, code, tags } = parsed.data;
  run('INSERT INTO snippets (user_id, title, language, code, tags) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, title, language, code, JSON.stringify(tags)]);
  const id = getLastInsertId();
  res.status(201).json({ snippet: { id, title, language, code, tags } });
});

router.delete('/:id', authenticate, (req, res) => {
  const snippet = queryOne('SELECT id FROM snippets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!snippet) return res.status(404).json({ error: 'Snippet not found' });
  run('DELETE FROM snippets WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;