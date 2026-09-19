import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// GET /api/favorites - List user favorite locations
router.get('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const favorites = db.prepare(`
      SELECT f.id as favorite_id, f.created_at as saved_at, l.*
      FROM favorites f
      JOIN parking_locations l ON f.location_id = l.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user!.id);

    const formatted = favorites.map((loc: any) => {
      let facilities = {};
      let images = [];
      try { facilities = JSON.parse(loc.facilities); } catch(e) {}
      try { images = JSON.parse(loc.images); } catch(e) {}
      return {
        ...loc,
        facilities,
        images
      };
    });

    return res.json({ favorites: formatted });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch favorites.' });
  }
});

// POST /api/favorites/toggle - Toggle favorite
router.post('/toggle', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { locationId } = req.body;
    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required' });
    }

    const userId = req.user!.id;
    const existing: any = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND location_id = ?').get(userId, locationId);

    if (existing) {
      db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
      return res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      const id = `fav-${Date.now()}`;
      db.prepare('INSERT INTO favorites (id, user_id, location_id, created_at) VALUES (?, ?, ?, ?)').run(id, userId, locationId, new Date().toISOString());
      return res.json({ isFavorite: true, message: 'Saved to favorites' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to toggle favorite.' });
  }
});

export default router;
