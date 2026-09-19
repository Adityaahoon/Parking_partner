import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// GET /api/sessions/active - Get current active parking session for user
router.get('/active', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id;
    const session: any = db.prepare(`
      SELECT ps.*, b.vehicle_number, b.vehicle_model, b.vehicle_type, b.arrival_time, b.exit_time,
             b.duration_hours, b.total_amount, b.qr_data,
             l.name as location_name, l.address as location_address, l.hourly_rate,
             l.latitude, l.longitude, s.slot_number
      FROM parking_sessions ps
      JOIN bookings b ON ps.booking_id = b.id
      JOIN parking_locations l ON ps.location_id = l.id
      LEFT JOIN parking_slots s ON ps.slot_id = s.id
      WHERE ps.user_id = ? AND ps.status IN ('ACTIVE', 'EXTENDED')
      ORDER BY ps.start_time DESC
      LIMIT 1
    `).get(userId);

    return res.json({ session: session || null });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch active session.' });
  }
});

// POST /api/sessions/start - Check-in / Start parking session
router.post('/start', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, userId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.booking_status === 'ACTIVE') {
      return res.status(400).json({ error: 'Session is already active.' });
    }

    const now = new Date();
    const startTime = now.toISOString();
    const estEndTime = new Date(now.getTime() + booking.duration_hours * 3600000).toISOString();

    const sessionId = `sess-${Date.now()}`;

    const startTx = db.transaction(() => {
      // Mark booking active
      db.prepare(`
        UPDATE bookings
        SET booking_status = 'ACTIVE', session_started_at = ?
        WHERE id = ?
      `).run(startTime, booking.id);

      // Mark slot occupied
      if (booking.slot_id) {
        db.prepare(`
          UPDATE parking_slots
          SET status = 'OCCUPIED', updated_at = ?
          WHERE id = ?
        `).run(startTime, booking.slot_id);
      }

      // Insert session
      db.prepare(`
        INSERT INTO parking_sessions (id, booking_id, location_id, user_id, slot_id, start_time, estimated_end_time, status, current_cost)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)
      `).run(sessionId, booking.id, booking.location_id, userId, booking.slot_id, startTime, estEndTime, booking.total_amount);

      // Notification
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, 'Parking Session Started', 'You have checked into your parking space. Have a great day!', 'REMINDER', 0, ?)
      `).run(`notif-${Date.now()}`, userId, startTime);
    });

    startTx();

    return res.json({ message: 'Parking session started successfully!', sessionId });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to start parking session.' });
  }
});

// POST /api/sessions/end - Check-out / End parking session
router.post('/end', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, userId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const endNow = new Date().toISOString();

    const endTx = db.transaction(() => {
      // Mark booking completed
      db.prepare(`
        UPDATE bookings
        SET booking_status = 'COMPLETED', session_ended_at = ?
        WHERE id = ?
      `).run(endNow, booking.id);

      // Mark session completed
      db.prepare(`
        UPDATE parking_sessions
        SET status = 'COMPLETED', actual_end_time = ?
        WHERE booking_id = ?
      `).run(endNow, booking.id);

      // Free slot
      if (booking.slot_id) {
        db.prepare(`
          UPDATE parking_slots
          SET status = 'AVAILABLE', current_booking_id = NULL, updated_at = ?
          WHERE id = ?
        `).run(endNow, booking.slot_id);
      }

      // Update location availability
      db.prepare(`
        UPDATE parking_locations
        SET available_slots = MIN(total_slots, available_slots + 1)
        WHERE id = ?
      `).run(booking.location_id);

      // Notification
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, 'Parking Session Ended', 'Thank you for using Parking Partner. Hope you had a hassle-free parking experience!', 'SYSTEM', 0, ?)
      `).run(`notif-${Date.now()}`, userId, endNow);
    });

    endTx();

    return res.json({ message: 'Parking session completed successfully. Slot freed.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to end parking session.' });
  }
});

export default router;
