import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

// Secure password hashing using PBKDF2 / scrypt
export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const hashToVerify = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(hashToVerify, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

// In-memory active session tokens with expiration
interface SessionData {
  userId: number;
  username: string;
  name?: string;
  role: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting for admin login attempts
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

export function checkLoginRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.blockedUntil > now) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((record.blockedUntil - now) / 1000)
    };
  }

  if (record.count >= 5 && record.blockedUntil <= now) {
    // Reset after block expiry
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.blockedUntil = now + 15 * 60 * 1000; // Block for 15 minutes after 5 failed attempts
  }
  loginAttempts.set(ip, record);
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export function createSession(userId: number, username: string, role: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    username,
    role,
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

export function getSession(token: string): SessionData | null {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function removeSession(token: string): void {
  sessions.delete(token);
}

export interface AuthenticatedRequest extends Request {
  user?: SessionData;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.cookies?.sessionToken as string | undefined);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized. Admin login required.' });
    return;
  }

  const session = getSession(token);
  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    return;
  }

  req.user = session;
  next();
}
