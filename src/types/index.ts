export type UserRole = 'CUSTOMER' | 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  avatar?: string;
  created_at: string;
}

export interface ParkingPartner {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  contact_phone: string;
  bank_account?: string;
  ifsc_code?: string;
  verification_status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  document_url?: string;
  tax_id?: string;
  created_at: string;
}

export interface Facilities {
  cctv?: boolean;
  security?: boolean;
  covered?: boolean;
  ev_charging?: boolean;
  washroom?: boolean;
  valet?: boolean;
  accessible?: boolean;
}

export interface ParkingLocation {
  id: string;
  partner_id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  description: string;
  hourly_rate: number;
  daily_rate: number;
  weekend_rate: number;
  peak_rate: number;
  total_slots: number;
  available_slots: number;
  occupied_slots?: number;
  reserved_slots?: number;
  is_active: number;
  opening_hours: string;
  image_url: string;
  images: string[];
  facilities: Facilities;
  rating: number;
  reviews_count: number;
  distance_km?: number;
  distance_label?: string;
  availability_status?: 'AVAILABLE' | 'LIMITED' | 'FULL';
  created_at: string;
}

export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type SlotType = 'STANDARD' | 'EV_CHARGING' | 'ACCESSIBLE' | 'VIP';

export interface ParkingSlot {
  id: string;
  location_id: string;
  slot_number: string;
  slot_type: SlotType;
  status: SlotStatus;
  vehicle_type: 'CAR' | 'BIKE' | 'SUV';
  current_booking_id?: string;
  vehicle_number?: string;
  vehicle_model?: string;
  arrival_time?: string;
  exit_time?: string;
  customer_name?: string;
  updated_at: string;
}

export type BookingStatus = 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  user_id: string;
  location_id: string;
  slot_id?: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_model: string;
  booking_date: string;
  arrival_time: string;
  exit_time: string;
  duration_hours: number;
  parking_fee: number;
  service_fee: number;
  tax_fee: number;
  total_amount: number;
  payment_status: 'PAID' | 'PENDING' | 'REFUNDED';
  payment_method: string;
  booking_status: BookingStatus;
  qr_data: string;
  session_started_at?: string;
  session_ended_at?: string;
  location_name?: string;
  location_address?: string;
  location_image?: string;
  latitude?: number;
  longitude?: number;
  slot_number?: string;
  slot_type?: string;
  customer_name?: string;
  created_at: string;
}

export interface ParkingSession {
  id: string;
  booking_id: string;
  location_id: string;
  user_id: string;
  slot_id?: string;
  start_time: string;
  estimated_end_time: string;
  actual_end_time?: string;
  status: 'ACTIVE' | 'EXTENDED' | 'COMPLETED';
  current_cost: number;
  vehicle_number?: string;
  vehicle_model?: string;
  vehicle_type?: string;
  arrival_time?: string;
  exit_time?: string;
  duration_hours?: number;
  total_amount?: number;
  qr_data?: string;
  location_name?: string;
  location_address?: string;
  hourly_rate?: number;
  latitude?: number;
  longitude?: number;
  slot_number?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  vehicle_number: string;
  vehicle_model: string;
  vehicle_type: 'CAR' | 'BIKE' | 'SUV';
  is_primary: number;
  created_at: string;
}

export interface Review {
  id: string;
  location_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  location_name?: string;
  created_at: string;
}

export interface Favorite {
  favorite_id: string;
  saved_at: string;
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  hourly_rate: number;
  rating: number;
  reviews_count: number;
  available_slots: number;
  total_slots: number;
  image_url: string;
  facilities: Facilities;
  images: string[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'PAYMENT' | 'REMINDER' | 'SYSTEM';
  is_read: number;
  created_at: string;
}
