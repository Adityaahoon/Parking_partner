import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.ts';

export async function seedDatabase() {
  initDatabase();

  console.log('🌱 Starting database seeding with realistic Indian mobility data...');

  // Clear existing records in correct foreign key order
  db.exec(`
    DELETE FROM complaints;
    DELETE FROM notifications;
    DELETE FROM favorites;
    DELETE FROM reviews;
    DELETE FROM parking_sessions;
    DELETE FROM bookings;
    DELETE FROM vehicles;
    DELETE FROM parking_slots;
    DELETE FROM parking_locations;
    DELETE FROM parking_partners;
    DELETE FROM users;
  `);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, phone, password_hash, role, status, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    {
      id: 'usr-customer-1',
      name: 'Aditya Bhandari',
      email: 'user@parkingpartner.demo',
      phone: '+91 98765 43210',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr-partner-1',
      name: 'Rajesh Kumar',
      email: 'partner@parkingpartner.demo',
      phone: '+91 98401 23456',
      role: 'PARTNER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    },
    {
      id: 'usr-partner-2',
      name: 'Priya Raman',
      email: 'partner2@parkingpartner.demo',
      phone: '+91 94440 98765',
      role: 'PARTNER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'usr-admin-1',
      name: 'Antigravity Platform Admin',
      email: 'admin@parkingpartner.demo',
      phone: '+91 99000 11223',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString()
    },
    {
      id: 'usr-customer-2',
      name: 'Vikram Sundaram',
      email: 'vikram.s@example.com',
      phone: '+91 98840 11223',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString()
    },
    {
      id: 'usr-customer-3',
      name: 'Ananya Sharma',
      email: 'ananya.s@example.com',
      phone: '+91 97110 55443',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    }
  ];

  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, u.phone, passwordHash, u.role, u.status, u.avatar, u.created_at);
  }

  // 2. Seed Parking Partners
  const insertPartner = db.prepare(`
    INSERT INTO parking_partners (id, user_id, business_name, business_type, contact_phone, bank_account, ifsc_code, verification_status, document_url, tax_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPartner.run(
    'part-1',
    'usr-partner-1',
    'PrimePark Infrastructure Ltd',
    'Multi-Level Commercial Facility',
    '+91 98401 23456',
    '91823000492812',
    'HDFC0001234',
    'VERIFIED',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    'GSTIN33AAACP1234F1Z5',
    new Date(Date.now() - 60 * 86400000).toISOString()
  );

  insertPartner.run(
    'part-2',
    'usr-partner-2',
    'MetroPark Urban Logistics',
    'Smart City Parking Operator',
    '+91 94440 98765',
    '50100482910394',
    'ICIC0000456',
    'UNDER_REVIEW',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    'GSTIN33AABCM9876Q1Z2',
    new Date(Date.now() - 10 * 86400000).toISOString()
  );

  // 3. Seed Parking Locations (Chennai focus + Top Metros)
  const insertLocation = db.prepare(`
    INSERT INTO parking_locations (id, partner_id, name, address, city, area, latitude, longitude, description, hourly_rate, daily_rate, weekend_rate, peak_rate, total_slots, available_slots, is_active, opening_hours, image_url, images, facilities, rating, reviews_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const locations = [
    {
      id: 'loc-1',
      partner_id: 'part-1',
      name: 'Marina Beach Smart Parking Hub',
      address: 'Kamarajar Salai, Opposite Light House, Marina Beach',
      city: 'Chennai',
      area: 'Mylapore / Marina',
      latitude: 13.0405,
      longitude: 80.2805,
      description: 'Ultra-modern covered parking facility located directly opposite Marina Beach. Equipped with automated barrier gates, 6 EV fast charging stations, 24/7 CCTV surveillance, and dedicated valet assistance.',
      hourly_rate: 40,
      daily_rate: 250,
      weekend_rate: 50,
      peak_rate: 60,
      total_slots: 50,
      available_slots: 32,
      is_active: 1,
      opening_hours: '24/7 Open',
      image_url: '/images/locations/marina_beach.jpg',
      images: JSON.stringify([
        '/images/locations/marina_beach.jpg',
        '/images/locations/omr_techpark.jpg',
        '/images/locations/phoenix_mall.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.8,
      reviews_count: 142,
      created_at: new Date(Date.now() - 40 * 86400000).toISOString()
    },
    {
      id: 'loc-2',
      partner_id: 'part-1',
      name: 'Phoenix MarketCity Premium Deck',
      address: '142 Velachery Main Road, Indira Gandhi Nagar, Velachery',
      city: 'Chennai',
      area: 'Velachery',
      latitude: 12.9918,
      longitude: 80.2170,
      description: 'Dedicated multi-level smart deck for mall visitors, shoppers and cinema-goers with automated license plate recognition, digital guidance lights, and fast exits.',
      hourly_rate: 60,
      daily_rate: 350,
      weekend_rate: 75,
      peak_rate: 80,
      total_slots: 40,
      available_slots: 18,
      is_active: 1,
      opening_hours: '09:00 AM - 11:30 PM',
      image_url: '/images/locations/phoenix_mall.jpg',
      images: JSON.stringify([
        '/images/locations/phoenix_mall.jpg',
        '/images/locations/airport_t2.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.7,
      reviews_count: 98,
      created_at: new Date(Date.now() - 35 * 86400000).toISOString()
    },
    {
      id: 'loc-3',
      partner_id: 'part-1',
      name: 'Chennai Central Station Plaza Parking',
      address: 'Near Gate 4, EVR Periyar Salai, Park Town',
      city: 'Chennai',
      area: 'Central / Park Town',
      latitude: 13.0827,
      longitude: 80.2757,
      description: 'High-security multi-tier parking lot next to Chennai Central Railway Station. Seamless access to suburban trains, metro and express platforms. 24/7 security patrol.',
      hourly_rate: 50,
      daily_rate: 300,
      weekend_rate: 55,
      peak_rate: 70,
      total_slots: 45,
      available_slots: 24,
      is_active: 1,
      opening_hours: '24/7 Open',
      image_url: '/images/locations/chennai_central.jpg',
      images: JSON.stringify([
        '/images/locations/chennai_central.jpg',
        '/images/locations/marina_beach.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: false,
        washroom: true,
        valet: false,
        accessible: true
      }),
      rating: 4.5,
      reviews_count: 85,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'loc-4',
      partner_id: 'part-1',
      name: 'Chennai International Airport Smart Park (T2)',
      address: 'Terminal 2 Departure Road, Meenambakkam',
      city: 'Chennai',
      area: 'Meenambakkam / Airport',
      latitude: 12.9815,
      longitude: 80.1636,
      description: 'Official smart multi-level parking terminal at Chennai Airport. Features 100% covered bays, automated flight-sync notifications, and premium overnight park-and-fly services.',
      hourly_rate: 80,
      daily_rate: 450,
      weekend_rate: 90,
      peak_rate: 100,
      total_slots: 60,
      available_slots: 45,
      is_active: 1,
      opening_hours: '24/7 Open',
      image_url: '/images/locations/airport_t2.jpg',
      images: JSON.stringify([
        '/images/locations/airport_t2.jpg',
        '/images/locations/phoenix_mall.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.9,
      reviews_count: 210,
      created_at: new Date(Date.now() - 50 * 86400000).toISOString()
    },
    {
      id: 'loc-5',
      partner_id: 'part-1',
      name: 'Anna Nagar Tower Park Plaza',
      address: '2nd Avenue, Near Anna Nagar Tower Park Metro',
      city: 'Chennai',
      area: 'Anna Nagar',
      latitude: 13.0878,
      longitude: 80.2155,
      description: 'Convenient neighborhood commercial garage with quick street access to famous dining, boutiques and cafes in Anna Nagar.',
      hourly_rate: 45,
      daily_rate: 280,
      weekend_rate: 55,
      peak_rate: 65,
      total_slots: 30,
      available_slots: 8,
      is_active: 1,
      opening_hours: '06:00 AM - 11:00 PM',
      image_url: '/images/locations/anna_nagar.jpg',
      images: JSON.stringify([
        '/images/locations/anna_nagar.jpg',
        '/images/locations/phoenix_mall.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: false,
        ev_charging: true,
        washroom: true,
        valet: false,
        accessible: true
      }),
      rating: 4.6,
      reviews_count: 64,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    },
    {
      id: 'loc-6',
      partner_id: 'part-1',
      name: 'T. Nagar Ranganathan Smart Hub',
      address: 'Usman Road Flyover Junction, T. Nagar',
      city: 'Chennai',
      area: 'T. Nagar',
      latitude: 13.0418,
      longitude: 80.2337,
      description: 'Multi-level automated vertical parking right at the heart of Chennai shopping district. Drop off your vehicle and our automated robotic pallet docks your car safely.',
      hourly_rate: 50,
      daily_rate: 320,
      weekend_rate: 70,
      peak_rate: 75,
      total_slots: 40,
      available_slots: 4,
      is_active: 1,
      opening_hours: '08:00 AM - 11:00 PM',
      image_url: '/images/locations/tnagar_tower.jpg',
      images: JSON.stringify([
        '/images/locations/tnagar_tower.jpg',
        '/images/locations/phoenix_mall.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: false,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.4,
      reviews_count: 52,
      created_at: new Date(Date.now() - 18 * 86400000).toISOString()
    },
    {
      id: 'loc-7',
      partner_id: 'part-1',
      name: 'Express Avenue Mall Underdeck',
      address: 'Patullos Road, Express Estate, Royapettah',
      city: 'Chennai',
      area: 'Royapettah / Express Estate',
      latitude: 13.0587,
      longitude: 80.2642,
      description: 'Climate-controlled basement parking bay with immediate elevator access to EA Mall, luxury retailers, gaming arenas and food court.',
      hourly_rate: 60,
      daily_rate: 380,
      weekend_rate: 80,
      peak_rate: 85,
      total_slots: 35,
      available_slots: 15,
      is_active: 1,
      opening_hours: '10:00 AM - 11:00 PM',
      image_url: '/images/locations/phoenix_mall.jpg',
      images: JSON.stringify([
        '/images/locations/phoenix_mall.jpg',
        '/images/locations/airport_t2.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.7,
      reviews_count: 88,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'loc-8',
      partner_id: 'part-1',
      name: 'OMR IT Corridor Tech Park Parking',
      address: 'Rajiv Gandhi Salai, Thoraipakkam, OMR',
      city: 'Chennai',
      area: 'OMR / Thoraipakkam',
      latitude: 12.9352,
      longitude: 80.2312,
      description: 'Spacious corporate campus parking with high-capacity fast DC EV chargers, digital slot displays, and monthly subscription passes for IT employees.',
      hourly_rate: 35,
      daily_rate: 200,
      weekend_rate: 35,
      peak_rate: 50,
      total_slots: 50,
      available_slots: 38,
      is_active: 1,
      opening_hours: '24/7 Open',
      image_url: '/images/locations/omr_techpark.jpg',
      images: JSON.stringify([
        '/images/locations/omr_techpark.jpg',
        '/images/locations/airport_t2.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: false,
        accessible: true
      }),
      rating: 4.8,
      reviews_count: 115,
      created_at: new Date(Date.now() - 12 * 86400000).toISOString()
    },
    {
      id: 'loc-9',
      partner_id: 'part-1',
      name: 'Besant Nagar Elliot’s Promenade Parking',
      address: '6th Avenue, Near Cooum Riverfront, Besant Nagar',
      city: 'Chennai',
      area: 'Besant Nagar',
      latitude: 12.9995,
      longitude: 80.2707,
      description: 'Beachside open and shaded parking lot right next to seaside cafes, Murugan Temple, and evening promenade walks.',
      hourly_rate: 30,
      daily_rate: 180,
      weekend_rate: 45,
      peak_rate: 50,
      total_slots: 25,
      available_slots: 0, // Full demonstration
      is_active: 1,
      opening_hours: '05:00 AM - 11:30 PM',
      image_url: '/images/locations/besant_nagar.jpg',
      images: JSON.stringify([
        '/images/locations/besant_nagar.jpg',
        '/images/locations/marina_beach.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: false,
        ev_charging: false,
        washroom: true,
        valet: false,
        accessible: true
      }),
      rating: 4.3,
      reviews_count: 42,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'loc-10',
      partner_id: 'part-1',
      name: 'Forum Koramangala Smart Deck',
      address: 'Hosur Road, Koramangala 7th Block',
      city: 'Bengaluru',
      area: 'Koramangala',
      latitude: 12.9352,
      longitude: 77.6139,
      description: 'Premier Bengaluru commercial parking facility with real-time digital space guidance, EV Superchargers, and immediate pedestrian overpass to Koramangala.',
      hourly_rate: 60,
      daily_rate: 350,
      weekend_rate: 80,
      peak_rate: 80,
      total_slots: 50,
      available_slots: 22,
      is_active: 1,
      opening_hours: '08:00 AM - 11:45 PM',
      image_url: '/images/locations/koramangala_deck.jpg',
      images: JSON.stringify([
        '/images/locations/koramangala_deck.jpg',
        '/images/locations/phoenix_mall.jpg'
      ]),
      facilities: JSON.stringify({
        cctv: true,
        security: true,
        covered: true,
        ev_charging: true,
        washroom: true,
        valet: true,
        accessible: true
      }),
      rating: 4.8,
      reviews_count: 130,
      created_at: new Date(Date.now() - 22 * 86400000).toISOString()
    }
  ];

  for (const loc of locations) {
    insertLocation.run(
      loc.id,
      loc.partner_id,
      loc.name,
      loc.address,
      loc.city,
      loc.area,
      loc.latitude,
      loc.longitude,
      loc.description,
      loc.hourly_rate,
      loc.daily_rate,
      loc.weekend_rate,
      loc.peak_rate,
      loc.total_slots,
      loc.available_slots,
      loc.is_active,
      loc.opening_hours,
      loc.image_url,
      loc.images,
      loc.facilities,
      loc.rating,
      loc.reviews_count,
      loc.created_at
    );
  }

  // 4. Seed Parking Slots (Generate matrix A01-A08, B01-B08, C01-C08 for locations)
  const insertSlot = db.prepare(`
    INSERT INTO parking_slots (id, location_id, slot_number, slot_type, status, vehicle_type, current_booking_id, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const loc of locations) {
    const rows = ['A', 'B', 'C', 'D'];
    let slotIndex = 1;
    for (const row of rows) {
      for (let num = 1; num <= 6; num++) {
        const paddedNum = num < 10 ? '0' + num : num;
        const slotNumber = `${row}-${paddedNum}`;
        let type = 'STANDARD';
        if (num === 1) type = 'ACCESSIBLE';
        else if (num === 2 && row === 'A') type = 'EV_CHARGING';
        else if (num === 6 && row === 'D') type = 'VIP';

        let status = 'AVAILABLE';
        if (loc.id === 'loc-9') {
          status = 'OCCUPIED';
        } else if (slotIndex % 7 === 0) {
          status = 'OCCUPIED';
        } else if (slotIndex % 11 === 0) {
          status = 'RESERVED';
        } else if (slotIndex % 19 === 0) {
          status = 'MAINTENANCE';
        }

        const slotId = `slot-${loc.id}-${row}${paddedNum}`;
        insertSlot.run(
          slotId,
          loc.id,
          slotNumber,
          type,
          status,
          num % 5 === 0 ? 'SUV' : (num % 4 === 0 ? 'BIKE' : 'CAR'),
          status === 'OCCUPIED' ? `BK-LIVE-${slotIndex}` : null,
          new Date().toISOString()
        );
        slotIndex++;
      }
    }
  }

  // 5. Seed Vehicles for Aditya Bhandari (Customer 1)
  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, user_id, vehicle_number, vehicle_model, vehicle_type, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertVehicle.run('veh-1', 'usr-customer-1', 'TN 07 CB 4920', 'Tata Nexon EV Max (Dark Edition)', 'CAR', 1, new Date().toISOString());
  insertVehicle.run('veh-2', 'usr-customer-1', 'TN 09 DE 1102', 'Hyundai Creta SX (O)', 'SUV', 0, new Date().toISOString());
  insertVehicle.run('veh-3', 'usr-customer-1', 'TN 01 BX 8876', 'Royal Enfield Hunter 350', 'BIKE', 0, new Date().toISOString());

  // 6. Seed Bookings & Sessions
  const insertBooking = db.prepare(`
    INSERT INTO bookings (id, user_id, location_id, slot_id, vehicle_number, vehicle_type, vehicle_model, booking_date, arrival_time, exit_time, duration_hours, parking_fee, service_fee, tax_fee, total_amount, payment_status, payment_method, booking_status, qr_data, session_started_at, session_ended_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSession = db.prepare(`
    INSERT INTO parking_sessions (id, booking_id, location_id, user_id, slot_id, start_time, estimated_end_time, actual_end_time, status, current_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Active Booking & Session for demo user
  const activeBookingId = 'BK-2026-8891';
  const now = new Date();
  const startTime = new Date(now.getTime() - 45 * 60000).toISOString(); // Started 45 mins ago
  const endTime = new Date(now.getTime() + 75 * 60000).toISOString();   // 75 mins remaining (2h total)
  
  insertBooking.run(
    activeBookingId,
    'usr-customer-1',
    'loc-1',
    'slot-loc-1-A01',
    'TN 07 CB 4920',
    'CAR',
    'Tata Nexon EV Max',
    now.toISOString().split('T')[0],
    '18:30',
    '20:30',
    2,
    80.0,
    10.0,
    5.0,
    95.0,
    'PAID',
    'UPI',
    'ACTIVE',
    JSON.stringify({ bookingId: activeBookingId, user: 'Aditya Bhandari', slot: 'A-01', location: 'Marina Beach Smart Parking Hub', timestamp: startTime }),
    startTime,
    null,
    startTime
  );

  insertSession.run(
    'sess-1',
    activeBookingId,
    'loc-1',
    'usr-customer-1',
    'slot-loc-1-A01',
    startTime,
    endTime,
    null,
    'ACTIVE',
    80.0
  );

  // Upcoming Booking
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  insertBooking.run(
    'BK-2026-9042',
    'usr-customer-1',
    'loc-2',
    'slot-loc-2-B02',
    'TN 07 CB 4920',
    'CAR',
    'Tata Nexon EV Max',
    tomorrow,
    '15:00',
    '18:00',
    3,
    180.0,
    15.0,
    10.0,
    205.0,
    'PAID',
    'CREDIT_CARD',
    'CONFIRMED',
    JSON.stringify({ bookingId: 'BK-2026-9042', user: 'Aditya Bhandari', slot: 'B-02', location: 'Phoenix MarketCity Premium Deck' }),
    null,
    null,
    new Date().toISOString()
  );

  // Past Completed Bookings
  const pastBookings = [
    { id: 'BK-2026-7810', loc: 'loc-3', daysAgo: 3, hours: 4, amount: 230, method: 'UPI' },
    { id: 'BK-2026-7104', loc: 'loc-4', daysAgo: 8, hours: 6, amount: 530, method: 'NET_BANKING' },
    { id: 'BK-2026-6421', loc: 'loc-7', daysAgo: 14, hours: 2, amount: 140, method: 'WALLET' },
    { id: 'BK-2026-5890', loc: 'loc-8', daysAgo: 22, hours: 8, amount: 310, method: 'CREDIT_CARD' },
    { id: 'BK-2026-4902', loc: 'loc-1', daysAgo: 30, hours: 3, amount: 145, method: 'UPI' },
  ];

  for (const pb of pastBookings) {
    const bookingDate = new Date(now.getTime() - pb.daysAgo * 86400000).toISOString().split('T')[0];
    insertBooking.run(
      pb.id,
      'usr-customer-1',
      pb.loc,
      `slot-${pb.loc}-A03`,
      'TN 07 CB 4920',
      'CAR',
      'Tata Nexon EV Max',
      bookingDate,
      '11:00',
      '15:00',
      pb.hours,
      pb.amount - 20,
      12.0,
      8.0,
      pb.amount,
      'PAID',
      pb.method,
      'COMPLETED',
      JSON.stringify({ bookingId: pb.id, user: 'Aditya Bhandari' }),
      new Date(now.getTime() - pb.daysAgo * 86400000).toISOString(),
      new Date(now.getTime() - pb.daysAgo * 86400000 + pb.hours * 3600000).toISOString(),
      new Date(now.getTime() - pb.daysAgo * 86400000).toISOString()
    );
  }

  // Partner Bookings (for Partner 1 overview)
  for (let i = 1; i <= 15; i++) {
    const bDate = new Date(now.getTime() - (i % 6) * 86400000).toISOString().split('T')[0];
    insertBooking.run(
      `BK-PARTNER-${1000 + i}`,
      i % 2 === 0 ? 'usr-customer-2' : 'usr-customer-3',
      i % 3 === 0 ? 'loc-2' : 'loc-1',
      `slot-loc-1-A0${(i % 5) + 1}`,
      `TN 0${i % 9} KL ${1000 + i}`,
      'CAR',
      'Sedan / Hatchback',
      bDate,
      '10:00',
      '13:00',
      3,
      120.0,
      10.0,
      6.0,
      136.0,
      'PAID',
      'UPI',
      i < 3 ? 'ACTIVE' : 'COMPLETED',
      JSON.stringify({ bookingId: `BK-PARTNER-${1000 + i}` }),
      new Date().toISOString(),
      null,
      new Date(now.getTime() - (i % 6) * 86400000).toISOString()
    );
  }

  // 7. Seed Reviews
  const insertReview = db.prepare(`
    INSERT INTO reviews (id, location_id, user_id, user_name, user_avatar, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const reviews = [
    {
      id: 'rev-1',
      loc: 'loc-1',
      name: 'Aditya Bhandari',
      rating: 5,
      comment: 'Super seamless entry via QR code. Fast EV charger topped up my Nexon in 40 mins while I enjoyed the beach!',
      daysAgo: 2
    },
    {
      id: 'rev-2',
      loc: 'loc-1',
      name: 'Karthik Raja',
      rating: 5,
      comment: 'Very clean, spacious slots, and security guards were extremely helpful guiding into the reserved bay.',
      daysAgo: 5
    },
    {
      id: 'rev-3',
      loc: 'loc-2',
      name: 'Ananya Sharma',
      rating: 5,
      comment: 'Saved me 30 mins of circling Phoenix Mall during weekend evening peak. Worth every rupee!',
      daysAgo: 4
    },
    {
      id: 'rev-4',
      loc: 'loc-3',
      name: 'Vikram Sundaram',
      rating: 4,
      comment: 'Great connectivity to Central station platforms. Clean washrooms and prompt exit gates.',
      daysAgo: 7
    },
    {
      id: 'rev-5',
      loc: 'loc-4',
      name: 'Dr. Suresh Menon',
      rating: 5,
      comment: 'Parked my vehicle here for 3 days during Mumbai flight trip. Fully secured and scratch free.',
      daysAgo: 12
    }
  ];

  for (const r of reviews) {
    insertReview.run(
      r.id,
      r.loc,
      'usr-customer-1',
      r.name,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      r.rating,
      r.comment,
      new Date(now.getTime() - r.daysAgo * 86400000).toISOString()
    );
  }

  // 8. Seed Favorites
  const insertFav = db.prepare(`
    INSERT INTO favorites (id, user_id, location_id, created_at)
    VALUES (?, ?, ?, ?)
  `);

  insertFav.run('fav-1', 'usr-customer-1', 'loc-1', new Date().toISOString());
  insertFav.run('fav-2', 'usr-customer-1', 'loc-2', new Date().toISOString());
  insertFav.run('fav-3', 'usr-customer-1', 'loc-4', new Date().toISOString());

  // 9. Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run(
    'notif-1',
    'usr-customer-1',
    'Parking Session Active',
    'Your parking session at Marina Beach Smart Parking Hub is currently active. 75 mins remaining.',
    'REMINDER',
    0,
    new Date(now.getTime() - 15 * 60000).toISOString()
  );

  insertNotif.run(
    'notif-2',
    'usr-customer-1',
    'Booking Confirmed #BK-2026-9042',
    'Reservation confirmed for Phoenix MarketCity Premium Deck for tomorrow 03:00 PM.',
    'BOOKING',
    0,
    new Date(now.getTime() - 2 * 3600000).toISOString()
  );

  insertNotif.run(
    'notif-3',
    'usr-customer-1',
    'Payment Successful ₹95.00',
    'UPI payment of ₹95.00 was verified successfully via Parking Partner Gateway.',
    'PAYMENT',
    1,
    new Date(now.getTime() - 1 * 86400000).toISOString()
  );

  // 10. Seed Complaints for Admin
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (id, user_id, user_name, booking_id, subject, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertComplaint.run(
    'cmp-1',
    'usr-customer-2',
    'Vikram Sundaram',
    'BK-2026-7810',
    'EV Charger slow rate on Bay A-02',
    'The 50kW fast charger was operating at 15kW during peak hours at Chennai Central hub.',
    'INVESTIGATING',
    new Date(now.getTime() - 3 * 86400000).toISOString()
  );

  console.log('✅ Database seeded successfully with demo users, locations, slots, bookings, and reviews!');
}

// Run if called directly via CLI
if (process.argv[1]?.includes('seed')) {
  seedDatabase().catch(err => {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  });
}
