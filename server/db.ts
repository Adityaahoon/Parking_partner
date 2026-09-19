import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'parking_partner.db');
export const db = new Database(DB_PATH);

// Enable WAL mode & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'PARTNER', 'ADMIN')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED')),
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_partners (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_name TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'Commercial Facility',
      contact_phone TEXT,
      bank_account TEXT,
      ifsc_code TEXT,
      verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK(verification_status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED')),
      document_url TEXT,
      tax_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_locations (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES parking_partners(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Chennai',
      area TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT NOT NULL,
      hourly_rate REAL NOT NULL,
      daily_rate REAL NOT NULL,
      weekend_rate REAL NOT NULL,
      peak_rate REAL NOT NULL,
      total_slots INTEGER NOT NULL,
      available_slots INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      opening_hours TEXT NOT NULL DEFAULT '24/7',
      image_url TEXT NOT NULL,
      images TEXT NOT NULL,
      facilities TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 4.5,
      reviews_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_slots (
      id TEXT PRIMARY KEY,
      location_id TEXT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
      slot_number TEXT NOT NULL,
      slot_type TEXT NOT NULL DEFAULT 'STANDARD' CHECK(slot_type IN ('STANDARD', 'EV_CHARGING', 'ACCESSIBLE', 'VIP')),
      status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
      vehicle_type TEXT NOT NULL DEFAULT 'CAR' CHECK(vehicle_type IN ('CAR', 'BIKE', 'SUV')),
      current_booking_id TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_number TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      vehicle_type TEXT NOT NULL DEFAULT 'CAR' CHECK(vehicle_type IN ('CAR', 'BIKE', 'SUV')),
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
      slot_id TEXT REFERENCES parking_slots(id),
      vehicle_number TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      vehicle_model TEXT NOT NULL,
      booking_date TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      exit_time TEXT NOT NULL,
      duration_hours INTEGER NOT NULL,
      parking_fee REAL NOT NULL,
      service_fee REAL NOT NULL,
      tax_fee REAL NOT NULL,
      total_amount REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'PAID' CHECK(payment_status IN ('PAID', 'PENDING', 'REFUNDED')),
      payment_method TEXT NOT NULL DEFAULT 'UPI',
      booking_status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(booking_status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
      qr_data TEXT NOT NULL,
      session_started_at TEXT,
      session_ended_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parking_sessions (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      slot_id TEXT REFERENCES parking_slots(id),
      start_time TEXT NOT NULL,
      estimated_end_time TEXT NOT NULL,
      actual_end_time TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'EXTENDED', 'COMPLETED')),
      current_cost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      location_id TEXT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      user_avatar TEXT,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES parking_locations(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, location_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'BOOKING',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      booking_id TEXT,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'INVESTIGATING', 'RESOLVED')),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_locations_city ON parking_locations(city);
    CREATE INDEX IF NOT EXISTS idx_slots_location ON parking_slots(location_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location_id);
  `);
  console.log('✅ SQLite Database schema initialized successfully.');
}
