import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// GET /api/vehicles
router.get('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const vehicles = db.prepare('SELECT * FROM vehicles WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC').all(req.user!.id);
    return res.json({ vehicles });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch vehicles.' });
  }
});

// POST /api/vehicles
router.post('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { vehicleNumber, vehicleModel, vehicleType = 'CAR', isPrimary = 0 } = req.body;
    if (!vehicleNumber || !vehicleModel) {
      return res.status(400).json({ error: 'Vehicle number and model are required.' });
    }

    const id = `veh-${Date.now()}`;
    const userId = req.user!.id;

    if (isPrimary) {
      db.prepare('UPDATE vehicles SET is_primary = 0 WHERE user_id = ?').run(userId);
    }

    db.prepare(`
      INSERT INTO vehicles (id, user_id, vehicle_number, vehicle_model, vehicle_type, is_primary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, vehicleNumber.toUpperCase().trim(), vehicleModel.trim(), vehicleType, isPrimary ? 1 : 0, new Date().toISOString());

    const created = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    return res.status(201).json({ message: 'Vehicle added successfully', vehicle: created });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add vehicle.' });
  }
});

// DELETE /api/vehicles/:id
router.delete('/:id', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const result = db.prepare('DELETE FROM vehicles WHERE id = ? AND user_id = ?').run(req.params.id, req.user!.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }
    return res.json({ message: 'Vehicle deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete vehicle.' });
  }
});

export default router;
