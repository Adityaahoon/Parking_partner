import { Router, Response } from 'express';
import { db } from '../db.ts';
import { AuthRequest, authenticateToken } from '../middleware/auth.ts';

const router = Router();

// POST /api/bookings - Create new booking
router.post('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id;
    const {
      locationId,
      vehicleNumber,
      vehicleType = 'CAR',
      vehicleModel = 'Vehicle',
      bookingDate,
      arrivalTime,
      durationHours = 2,
      paymentMethod = 'UPI',
      preferredSlotId
    } = req.body;

    if (!locationId || !vehicleNumber || !bookingDate || !arrivalTime) {
      return res.status(400).json({ error: 'Location, vehicle number, date, and arrival time are required.' });
    }

    const location: any = db.prepare('SELECT * FROM parking_locations WHERE id = ? AND is_active = 1').get(locationId);
    if (!location) {
      return res.status(404).json({ error: 'Parking location not found or inactive.' });
    }

    // Check slot availability transactionally
    const allocateSlotTx = db.transaction(() => {
      let chosenSlot: any = null;

      if (preferredSlotId) {
        chosenSlot = db.prepare('SELECT * FROM parking_slots WHERE id = ? AND location_id = ? AND status = "AVAILABLE"').get(preferredSlotId, locationId);
      }

      if (!chosenSlot) {
        // Find first available slot suitable for vehicle
        chosenSlot = db.prepare(`
          SELECT * FROM parking_slots 
          WHERE location_id = ? AND status = 'AVAILABLE'
          ORDER BY slot_number ASC
          LIMIT 1
        `).get(locationId);
      }

      if (!chosenSlot) {
        throw new Error('PARKING_FULL');
      }

      // Calculate end time
      const [arrHours, arrMins] = arrivalTime.split(':').map(Number);
      const exitHour = (arrHours + Number(durationHours)) % 24;
      const exitTime = `${exitHour < 10 ? '0' + exitHour : exitHour}:${arrMins < 10 ? '0' + arrMins : arrMins || '00'}`;

      // Calculate fees
      const hourlyRate = location.hourly_rate;
      const parkingFee = hourlyRate * Number(durationHours);
      const serviceFee = 10.0;
      const taxFee = Math.round(parkingFee * 0.05 * 100) / 100;
      const totalAmount = parkingFee + serviceFee + taxFee;

      const bookingId = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();

      const qrPayload = JSON.stringify({
        bookingId,
        userId,
        locationId,
        locationName: location.name,
        slotNumber: chosenSlot.slot_number,
        vehicleNumber,
        date: bookingDate,
        time: arrivalTime,
        validUntil: exitTime
      });

      // Insert booking
      db.prepare(`
        INSERT INTO bookings (
          id, user_id, location_id, slot_id, vehicle_number, vehicle_type, vehicle_model,
          booking_date, arrival_time, exit_time, duration_hours, parking_fee, service_fee,
          tax_fee, total_amount, payment_status, payment_method, booking_status, qr_data, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', ?, 'CONFIRMED', ?, ?)
      `).run(
        bookingId, userId, locationId, chosenSlot.id, vehicleNumber, vehicleType, vehicleModel,
        bookingDate, arrivalTime, exitTime, durationHours, parkingFee, serviceFee, taxFee,
        totalAmount, paymentMethod, qrPayload, nowIso
      );

      // Lock slot as RESERVED
      db.prepare(`
        UPDATE parking_slots
        SET status = 'RESERVED', current_booking_id = ?, updated_at = ?
        WHERE id = ?
      `).run(bookingId, nowIso, chosenSlot.id);

      // Update location available count
      db.prepare(`
        UPDATE parking_locations
        SET available_slots = MAX(0, available_slots - 1)
        WHERE id = ?
      `).run(locationId);

      // Insert notification
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'BOOKING', 0, ?)
      `).run(
        `notif-${Date.now()}`,
        userId,
        `Reservation Confirmed #${bookingId}`,
        `Your parking spot ${chosenSlot.slot_number} at ${location.name} has been booked for ${bookingDate} at ${arrivalTime}.`,
        nowIso
      );

      return { bookingId, slotNumber: chosenSlot.slot_number, totalAmount, exitTime };
    });

    try {
      const result = allocateSlotTx();
      const booking = db.prepare(`
        SELECT b.*, l.name as location_name, l.address as location_address, l.image_url as location_image, s.slot_number
        FROM bookings b
        JOIN parking_locations l ON b.location_id = l.id
        LEFT JOIN parking_slots s ON b.slot_id = s.id
        WHERE b.id = ?
      `).get(result.bookingId);

      return res.status(201).json({
        message: 'Parking reserved successfully!',
        booking
      });
    } catch (txErr: any) {
      if (txErr.message === 'PARKING_FULL') {
        return res.status(409).json({ error: 'Sorry, this parking facility has no available slots at the moment.' });
      }
      throw txErr;
    }
  } catch (err: any) {
    console.error('Booking creation error:', err);
    return res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
});

// GET /api/bookings - Get user bookings
router.get('/', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    let query = `
      SELECT b.*, l.name as location_name, l.address as location_address, l.image_url as location_image,
             l.latitude, l.longitude, s.slot_number
      FROM bookings b
      JOIN parking_locations l ON b.location_id = l.id
      LEFT JOIN parking_slots s ON b.slot_id = s.id
      WHERE b.user_id = ?
    `;
    const params: any[] = [userId];

    if (status && status !== 'ALL') {
      query += ' AND b.booking_status = ?';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC';

    const bookings = db.prepare(query).all(...params);
    return res.json({ bookings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/:id - Single booking details
router.get('/:id', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const booking = db.prepare(`
      SELECT b.*, l.name as location_name, l.address as location_address, l.image_url as location_image,
             l.latitude, l.longitude, l.opening_hours, s.slot_number, s.slot_type
      FROM bookings b
      JOIN parking_locations l ON b.location_id = l.id
      LEFT JOIN parking_slots s ON b.slot_id = s.id
      WHERE b.id = ? AND (b.user_id = ? OR ? = 'ADMIN')
    `).get(req.params.id, req.user!.id, req.user!.role);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    return res.json({ booking });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const booking: any = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.booking_status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    if (booking.booking_status === 'COMPLETED') {
      return res.status(400).json({ error: 'Completed booking cannot be cancelled.' });
    }

    const cancelTx = db.transaction(() => {
      db.prepare(`
        UPDATE bookings 
        SET booking_status = 'CANCELLED', payment_status = 'REFUNDED'
        WHERE id = ?
      `).run(booking.id);

      if (booking.slot_id) {
        db.prepare(`
          UPDATE parking_slots
          SET status = 'AVAILABLE', current_booking_id = NULL, updated_at = ?
          WHERE id = ?
        `).run(new Date().toISOString(), booking.slot_id);
      }

      db.prepare(`
        UPDATE parking_locations
        SET available_slots = MIN(total_slots, available_slots + 1)
        WHERE id = ?
      `).run(booking.location_id);

      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'BOOKING', 0, ?)
      `).run(
        `notif-${Date.now()}`,
        booking.user_id,
        `Booking Cancelled #${booking.id}`,
        `Your reservation for booking #${booking.id} has been cancelled and a full refund has been initiated.`,
        new Date().toISOString()
      );
    });

    cancelTx();
    return res.json({ message: 'Booking cancelled successfully. Refund initiated.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to cancel booking.' });
  }
});

// PUT /api/bookings/:id/extend - Extend booking duration
router.put('/:id/extend', authenticateToken, (req: AuthRequest, res: Response): any => {
  try {
    const { extraHours = 1 } = req.body;
    const booking: any = db.prepare(`
      SELECT b.*, l.hourly_rate
      FROM bookings b
      JOIN parking_locations l ON b.location_id = l.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(req.params.id, req.user!.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const addedHours = Number(extraHours);
    const extraFee = booking.hourly_rate * addedHours;
    const newTotalDuration = booking.duration_hours + addedHours;
    const newTotalAmount = booking.total_amount + extraFee;

    const [arrHours, arrMins] = booking.exit_time.split(':').map(Number);
    const newExitHour = (arrHours + addedHours) % 24;
    const newExitTime = `${newExitHour < 10 ? '0' + newExitHour : newExitHour}:${arrMins < 10 ? '0' + arrMins : arrMins || '00'}`;

    db.prepare(`
      UPDATE bookings
      SET duration_hours = ?,
          exit_time = ?,
          parking_fee = parking_fee + ?,
          total_amount = ?
      WHERE id = ?
    `).run(newTotalDuration, newExitTime, extraFee, newTotalAmount, booking.id);

    // Update active session if exists
    db.prepare(`
      UPDATE parking_sessions
      SET status = 'EXTENDED',
          current_cost = current_cost + ?
      WHERE booking_id = ?
    `).run(extraFee, booking.id);

    return res.json({
      message: `Booking extended by ${addedHours} hour(s) successfully!`,
      newExitTime,
      newTotalDuration,
      newTotalAmount
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to extend booking.' });
  }
});

export default router;
