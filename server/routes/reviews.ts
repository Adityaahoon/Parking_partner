import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// GET /api/reviews/:locationId
router.get('/:locationId', (req, res): any => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.avatar as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.location_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.locationId);

    return res.json({ reviews });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews - Add review
router.post('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { locationId, rating, comment } = req.body;
    if (!locationId || !rating || !comment) {
      return res.status(400).json({ error: 'Location ID, rating (1-5), and comment are required.' });
    }

    const reviewId = `rev-${Date.now()}`;
    const user = req.user!;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, location_id, user_id, user_name, user_avatar, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reviewId,
      locationId,
      user.id,
      user.name,
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      Number(rating),
      comment.trim(),
      now
    );

    // Recompute location rating and reviews count
    const stats: any = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE location_id = ?
    `).get(locationId);

    if (stats) {
      db.prepare(`
        UPDATE parking_locations
        SET rating = ROUND(?, 1), reviews_count = ?
        WHERE id = ?
      `).run(stats.avg_rating, stats.total_reviews, locationId);
    }

    const created = db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    return res.status(201).json({ message: 'Review submitted successfully', review: created });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
});

export default router;
