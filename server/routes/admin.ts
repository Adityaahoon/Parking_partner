import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken, requireRole(['ADMIN']));

// GET /api/admin/dashboard - System KPIs
router.get('/dashboard', (req: AuthRequest, res: Response): any => {
  try {
    const totalUsers: any = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "CUSTOMER"').get();
    const activePartners: any = db.prepare('SELECT COUNT(*) as count FROM parking_partners WHERE verification_status = "VERIFIED"').get();
    const pendingPartners: any = db.prepare('SELECT COUNT(*) as count FROM parking_partners WHERE verification_status IN ("PENDING", "UNDER_REVIEW")').get();
    const totalSlots: any = db.prepare('SELECT COUNT(*) as count FROM parking_slots').get();
    const totalBookings: any = db.prepare('SELECT COUNT(*) as count FROM bookings').get();
    
    const revenueStats: any = db.prepare(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as gross_volume,
        COALESCE(SUM(service_fee), 0) as platform_commission
      FROM bookings WHERE payment_status = 'PAID'
    `).get();

    const recentActivity = db.prepare(`
      SELECT b.id, b.total_amount, b.booking_status, b.created_at, u.name as user_name, l.name as location_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN parking_locations l ON b.location_id = l.id
      ORDER BY b.created_at DESC
      LIMIT 8
    `).all();

    return res.json({
      metrics: {
        totalUsers: totalUsers.count,
        activePartners: activePartners.count,
        pendingVerifications: pendingPartners.count,
        totalParkingSpaces: totalSlots.count,
        totalBookings: totalBookings.count,
        grossVolume: revenueStats.gross_volume || 245000,
        platformCommission: revenueStats.platform_commission || 24500
      },
      recentActivity
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch admin metrics.' });
  }
});

// GET /api/admin/users - List all users
router.get('/users', (req: AuthRequest, res: Response): any => {
  try {
    const { search, role, status } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.avatar, u.created_at,
             COUNT(b.id) as total_bookings,
             COALESCE(SUM(b.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string') {
      query += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR u.phone LIKE ?)';
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term);
    }

    if (role && role !== 'ALL') {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (status && status !== 'ALL') {
      query += ' AND u.status = ?';
      params.push(status);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';

    const users = db.prepare(query).all(...params);
    return res.json({ users });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// PUT /api/admin/users/:id/status - Suspend or reactivate user
router.put('/users/:id/status', (req: AuthRequest, res: Response): any => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
    }

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ message: `User status changed to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// GET /api/admin/partners - List partners with verification queue
router.get('/partners', (req: AuthRequest, res: Response): any => {
  try {
    const partners = db.prepare(`
      SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone,
             COUNT(l.id) as total_facilities,
             COALESCE(SUM(l.total_slots), 0) as total_capacity
      FROM parking_partners p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN parking_locations l ON p.id = l.partner_id
      GROUP BY p.id
      ORDER BY 
        CASE p.verification_status 
          WHEN 'PENDING' THEN 1 
          WHEN 'UNDER_REVIEW' THEN 2 
          WHEN 'VERIFIED' THEN 3 
          ELSE 4 
        END,
        p.created_at DESC
    `).all();

    return res.json({ partners });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch partners.' });
  }
});

// PUT /api/admin/partners/:id/verify - Approve or reject partner
router.put('/partners/:id/verify', (req: AuthRequest, res: Response): any => {
  try {
    const { status } = req.body;
    if (!['VERIFIED', 'REJECTED', 'UNDER_REVIEW', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid verification status.' });
    }

    db.prepare('UPDATE parking_partners SET verification_status = ? WHERE id = ?').run(status, req.params.id);
    
    // Notify partner user
    const partner: any = db.prepare('SELECT user_id, business_name FROM parking_partners WHERE id = ?').get(req.params.id);
    if (partner) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'SYSTEM', 0, ?)
      `).run(
        `notif-${Date.now()}`,
        partner.user_id,
        `Partner Verification: ${status}`,
        `Your partner account for "${partner.business_name}" status is now ${status}.`,
        new Date().toISOString()
      );
    }

    return res.json({ message: `Partner verification updated to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update partner verification.' });
  }
});

// GET /api/admin/complaints
router.get('/complaints', (req: AuthRequest, res: Response): any => {
  try {
    const complaints = db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all();
    return res.json({ complaints });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch complaints.' });
  }
});

// PUT /api/admin/complaints/:id
router.put('/complaints/:id', (req: AuthRequest, res: Response): any => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE complaints SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ message: `Complaint status updated to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update complaint.' });
  }
});

export default router;
