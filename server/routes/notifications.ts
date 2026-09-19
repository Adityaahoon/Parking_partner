import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// GET /api/notifications
router.get('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(req.user!.id);
    const unreadCount: any = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user!.id);

    return res.json({ notifications, unreadCount: unreadCount.count });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user!.id);
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to mark notifications.' });
  }
});

export default router;
