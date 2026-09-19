import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// Haversine distance calculator in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// GET /api/parking
router.get('/', (req: Request, res: Response): any => {
  try {
    const {
      search,
      city,
      minPrice,
      maxPrice,
      rating,
      ev_charging,
      covered,
      valet,
      cctv,
      accessible,
      open_now,
      sortBy = 'recommended',
      userLat,
      userLng
    } = req.query;

    let query = 'SELECT * FROM parking_locations WHERE is_active = 1';
    const params: any[] = [];

    if (city && typeof city === 'string') {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
    }

    if (search && typeof search === 'string') {
      query += ' AND (LOWER(name) LIKE ? OR LOWER(address) LIKE ? OR LOWER(area) LIKE ? OR LOWER(city) LIKE ?)';
      const term = `%${search.toLowerCase().trim()}%`;
      params.push(term, term, term, term);
    }

    if (minPrice) {
      query += ' AND hourly_rate >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ' AND hourly_rate <= ?';
      params.push(Number(maxPrice));
    }

    if (rating) {
      query += ' AND rating >= ?';
      params.push(Number(rating));
    }

    const rows: any[] = db.prepare(query).all(...params);

    // Compute dynamic availability and distance
    const parsedUserLat = userLat ? parseFloat(userLat as string) : 13.0827; // Default Chennai
    const parsedUserLng = userLng ? parseFloat(userLng as string) : 80.2707;

    const results = rows.map(loc => {
      let facilitiesObj = {};
      let imagesArr = [];
      try { facilitiesObj = JSON.parse(loc.facilities); } catch (e) {}
      try { imagesArr = JSON.parse(loc.images); } catch (e) {}

      // Calculate slot statistics
      const slotStats: any = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
          SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupied,
          SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END) as reserved,
          SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance
        FROM parking_slots WHERE location_id = ?
      `).get(loc.id);

      const realAvailable = slotStats ? (slotStats.available || 0) : loc.available_slots;
      const distance = calculateDistance(parsedUserLat, parsedUserLng, loc.latitude, loc.longitude);

      return {
        ...loc,
        facilities: facilitiesObj,
        images: imagesArr,
        total_slots: slotStats?.total || loc.total_slots,
        available_slots: realAvailable,
        occupied_slots: slotStats?.occupied || 0,
        reserved_slots: slotStats?.reserved || 0,
        distance_km: distance,
        distance_label: distance < 1 ? `${Math.round(distance * 1000)} m away` : `${distance} km away`,
        availability_status: realAvailable === 0 ? 'FULL' : realAvailable <= 5 ? 'LIMITED' : 'AVAILABLE'
      };
    });

    // Filter by amenities in memory
    let filtered = results.filter(loc => {
      const f = loc.facilities as any;
      if (ev_charging === 'true' && !f.ev_charging) return false;
      if (covered === 'true' && !f.covered) return false;
      if (valet === 'true' && !f.valet) return false;
      if (cctv === 'true' && !f.cctv) return false;
      if (accessible === 'true' && !f.accessible) return false;
      if (open_now === 'true' && loc.available_slots === 0) return false;
      return true;
    });

    // Sorting
    if (sortBy === 'closest') {
      filtered.sort((a, b) => a.distance_km - b.distance_km);
    } else if (sortBy === 'cheapest') {
      filtered.sort((a, b) => a.hourly_rate - b.hourly_rate);
    } else if (sortBy === 'highest_rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'availability') {
      filtered.sort((a, b) => b.available_slots - a.available_slots);
    } else {
      // Recommended: combination of distance, rating and availability
      filtered.sort((a, b) => {
        const scoreA = (a.rating * 2) + (a.available_slots > 0 ? 3 : 0) - (a.distance_km * 0.2);
        const scoreB = (b.rating * 2) + (b.available_slots > 0 ? 3 : 0) - (b.distance_km * 0.2);
        return scoreB - scoreA;
      });
    }

    return res.json({
      count: filtered.length,
      locations: filtered
    });
  } catch (err: any) {
    console.error('Error fetching parking locations:', err);
    return res.status(500).json({ error: 'Failed to fetch parking locations.' });
  }
});

// GET /api/parking/:id
router.get('/:id', (req: Request, res: Response): any => {
  try {
    const loc: any = db.prepare('SELECT * FROM parking_locations WHERE id = ?').get(req.params.id);
    if (!loc) {
      return res.status(404).json({ error: 'Parking location not found.' });
    }

    let facilitiesObj = {};
    let imagesArr = [];
    try { facilitiesObj = JSON.parse(loc.facilities); } catch (e) {}
    try { imagesArr = JSON.parse(loc.images); } catch (e) {}

    const reviews = db.prepare(`
      SELECT r.*, u.avatar as user_avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.location_id = ?
      ORDER BY r.created_at DESC
    `).all(loc.id);

    const slotStats: any = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'OCCUPIED' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END) as reserved,
        SUM(CASE WHEN status = 'MAINTENANCE' THEN 1 ELSE 0 END) as maintenance
      FROM parking_slots WHERE location_id = ?
    `).get(loc.id);

    const partner: any = db.prepare('SELECT business_name, contact_phone, verification_status FROM parking_partners WHERE id = ?').get(loc.partner_id);

    return res.json({
      location: {
        ...loc,
        facilities: facilitiesObj,
        images: imagesArr,
        total_slots: slotStats?.total || loc.total_slots,
        available_slots: slotStats?.available !== undefined ? slotStats.available : loc.available_slots,
        occupied_slots: slotStats?.occupied || 0,
        reserved_slots: slotStats?.reserved || 0,
        maintenance_slots: slotStats?.maintenance || 0,
        availability_status: (slotStats?.available || loc.available_slots) === 0 ? 'FULL' : (slotStats?.available || loc.available_slots) <= 5 ? 'LIMITED' : 'AVAILABLE'
      },
      partner,
      reviews
    });
  } catch (err: any) {
    console.error('Error fetching parking details:', err);
    return res.status(500).json({ error: 'Failed to fetch parking location details.' });
  }
});

// GET /api/parking/:id/slots
router.get('/:id/slots', (req: Request, res: Response): any => {
  try {
    const slots = db.prepare('SELECT * FROM parking_slots WHERE location_id = ? ORDER BY slot_number ASC').all(req.params.id);
    return res.json({ slots });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch parking slots.' });
  }
});

export default router;
