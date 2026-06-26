import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import logger from '../utils/logger.js';

// Shared token + role gate. The DB is the source of truth for the role on every
// request, so a stale/forged token can never escalate privileges.
function authenticate(allowedRoles) {
  return async function (req, res, next) {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Missing Authorization header' });
      }
      const token = auth.split(' ')[1];
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) return res.status(500).json({ success: false, message: 'JWT secret not configured' });

      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }

      const profile = await prisma.profile.findUnique({
        where: { id: decoded.sub },
        select: { id: true, full_name: true, role: true, status: true },
      });

      if (!profile) return res.status(403).json({ success: false, message: 'Profile not found' });
      if (profile.status === 'suspended') return res.status(403).json({ success: false, message: 'Account suspended' });
      if (!allowedRoles.includes(profile.role)) {
        return res.status(403).json({ success: false, message: `Requires role: ${allowedRoles.join(' or ')}` });
      }

      req.user = { id: decoded.sub, email: decoded.email, role: profile.role, profile };
      return next();
    } catch (err) {
      logger.error({ err }, 'Auth middleware error');
      return res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  };
}

// admin only — user management, role changes
export const requireAdmin = authenticate(['admin']);
// admin or editor — day-to-day content management
export const requireStaff = authenticate(['admin', 'editor']);
