// src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { queryOne, run, getLastInsertId } from '../models/database.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { name, email, password } = parsed.data;
  const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, passwordHash]);
  const userId = getLastInsertId();

  const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
  res.status(201).json({ token, user: { id: userId, name, email } });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { email, password } = parsed.data;
  const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiry });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;