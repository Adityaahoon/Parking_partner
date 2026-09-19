import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_parking_partner_jwt_key_2026';

// POST /api/auth/register
router.post('/register', async (req, res): Promise<any> => {
  try {
    const { name, email, phone, password, role = 'CUSTOMER', businessName, businessType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const userRole = (role === 'PARTNER' || role === 'ADMIN') ? role : 'CUSTOMER';
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, status, avatar, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
    `).run(
      userId,
      name.trim(),
      email.toLowerCase().trim(),
      phone || null,
      passwordHash,
      userRole,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt
    );

    // If Partner, create partner record
    if (userRole === 'PARTNER') {
      const partnerId = `part-${Date.now()}`;
      db.prepare(`
        INSERT INTO parking_partners (id, user_id, business_name, business_type, contact_phone, verification_status, created_at)
        VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
      `).run(
        partnerId,
        userId,
        businessName || `${name}'s Parking Solutions`,
        businessType || 'Commercial Lot',
        phone || null,
        createdAt
      );
    }

    const token = jwt.sign(
      { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = db.prepare('SELECT id, name, email, phone, role, status, avatar, created_at FROM users WHERE id = ?').get(userId);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact platform support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Partner verification info if partner
    let partnerInfo = null;
    if (user.role === 'PARTNER') {
      partnerInfo = db.prepare('SELECT * FROM parking_partners WHERE user_id = ?').get(user.id);
    }

    const { password_hash, ...safeUser } = user;
    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
      partner: partnerInfo
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const user: any = db.prepare('SELECT id, name, email, phone, role, status, avatar, created_at FROM users WHERE id = ?').get(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let partnerInfo = null;
    if (user.role === 'PARTNER') {
      partnerInfo = db.prepare('SELECT * FROM parking_partners WHERE user_id = ?').get(user.id);
    }

    return res.json({ user, partner: partnerInfo });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { name, phone, avatar } = req.body;
    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          phone = COALESCE(?, phone),
          avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(name, phone, avatar, req.user!.id);

    const updatedUser = db.prepare('SELECT id, name, email, phone, role, status, avatar, created_at FROM users WHERE id = ?').get(req.user!.id);
    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
