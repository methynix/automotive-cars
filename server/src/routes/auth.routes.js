import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

const router = express.Router();

function getSecret() {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    // Never fall back to a hardcoded secret: a known secret lets anyone forge
    // admin tokens. Fail loudly instead so misconfiguration can't ship to prod.
    throw Object.assign(new Error('SUPABASE_JWT_SECRET is not configured'), { status: 500 });
  }
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw Object.assign(new Error('SUPABASE_JWT_SECRET is too weak for production'), { status: 500 });
  }
  return secret;
}

function signToken(profile) {
  return jwt.sign(
    { sub: profile.id, email: profile.email, role: profile.role },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.profile.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const profile = await prisma.profile.create({
      data: { email, password_hash, full_name: full_name || null, role: 'user' },
    });

    const token = signToken(profile);
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role },
      },
    });
  } catch (err) {
    logger.error({ err }, 'Register error');
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(profile);
    return res.json({
      success: true,
      data: {
        token,
        user: { id: profile.id, email: profile.email, full_name: profile.full_name, role: profile.role },
      },
    });
  } catch (err) {
    logger.error({ err }, 'Login error');
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, getSecret());
    const profile = await prisma.profile.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, full_name: true, role: true },
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    logger.error({ err }, 'Auth me error');
    return res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
});

router.put('/api/auth/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, getSecret());
    const { full_name } = req.body || {};

    const updatePayload = {
      full_name: typeof full_name === 'string' ? full_name.trim() || null : undefined,
    };

    const profile = await prisma.profile.update({
      where: { id: decoded.sub },
      data: updatePayload,
      select: { id: true, email: true, full_name: true, role: true },
    });

    return res.json({ success: true, data: profile });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    logger.error({ err }, 'Profile update error');
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

export default router;
