import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_parking_partner_jwt_key_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'PARTNER' | 'ADMIN';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
    return;
  }
}

export function requireRole(allowedRoles: ('CUSTOMER' | 'PARTNER' | 'ADMIN')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied: insufficient permissions for this role.' });
      return;
    }

    next();
  };
}
