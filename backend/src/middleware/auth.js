import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
//it is a SQL query that should return one row 
import { queryOne } from '../models/database.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = queryOne('SELECT id, name, email FROM users WHERE id = ?', [payload.userId]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = queryOne('SELECT id, name, email FROM users WHERE id = ?', [payload.userId]);
    req.user = user;
  } catch {
    // ignore
  }
  next();
}