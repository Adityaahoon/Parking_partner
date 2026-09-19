import {
  User,
  ParkingLocation,
  ParkingSlot,
  Booking,
  ParkingSession,
  Vehicle,
  Review,
  Favorite,
  NotificationItem
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('pp_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'An unexpected error occurred' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; partner?: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User; partner?: any }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Parking Discovery & Search
  async getParkingLocations(params?: Record<string, any>): Promise<{ count: number; locations: ParkingLocation[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const res = await fetch(`${API_BASE}/parking?${query.toString()}`);
    return handleResponse(res);
  },

  async getParkingDetails(id: string): Promise<{ location: ParkingLocation; partner: any; reviews: Review[] }> {
    const res = await fetch(`${API_BASE}/parking/${id}`);
    return handleResponse(res);
  },

  async getParkingSlots(id: string): Promise<{ slots: ParkingSlot[] }> {
    const res = await fetch(`${API_BASE}/parking/${id}/slots`);
    return handleResponse(res);
  },

  // Bookings
  async createBooking(data: {
    locationId: string;
    vehicleNumber: string;
    vehicleType: string;
    vehicleModel: string;
    bookingDate: string;
    arrivalTime: string;
    durationHours: number;
    paymentMethod: string;
    preferredSlotId?: string;
  }): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getMyBookings(status?: string): Promise<{ bookings: Booking[] }> {
    const url = status && status !== 'ALL' ? `${API_BASE}/bookings?status=${status}` : `${API_BASE}/bookings`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getBooking(id: string): Promise<{ booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async cancelBooking(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async extendBooking(id: string, extraHours: number): Promise<any> {
    const res = await fetch(`${API_BASE}/bookings/${id}/extend`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ extraHours })
    });
    return handleResponse(res);
  },

  // Sessions
  async getActiveSession(): Promise<{ session: ParkingSession | null }> {
    const res = await fetch(`${API_BASE}/sessions/active`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async startSession(bookingId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId })
    });
    return handleResponse(res);
  },

  async endSession(bookingId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookingId })
    });
    return handleResponse(res);
  },

  // Vehicles
  async getVehicles(): Promise<{ vehicles: Vehicle[] }> {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async addVehicle(data: { vehicleNumber: string; vehicleModel: string; vehicleType: string; isPrimary?: number }): Promise<{ vehicle: Vehicle }> {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteVehicle(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Favorites
  async getFavorites(): Promise<{ favorites: Favorite[] }> {
    const res = await fetch(`${API_BASE}/favorites`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async toggleFavorite(locationId: string): Promise<{ isFavorite: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/favorites/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ locationId })
    });
    return handleResponse(res);
  },

  // Reviews
  async addReview(data: { locationId: string; rating: number; comment: string }): Promise<{ review: Review }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async markAllNotificationsRead(): Promise<any> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Partner APIs
  async getPartnerDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/dashboard`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getPartnerLocations(): Promise<{ locations: ParkingLocation[] }> {
    const res = await fetch(`${API_BASE}/partner/locations`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createPartnerLocation(data: any): Promise<{ location: ParkingLocation }> {
    const res = await fetch(`${API_BASE}/partner/locations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updatePartnerLocation(id: string, data: any): Promise<{ location: ParkingLocation }> {
    const res = await fetch(`${API_BASE}/partner/locations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getPartnerSlots(locationId: string): Promise<{ slots: ParkingSlot[] }> {
    const res = await fetch(`${API_BASE}/partner/slots/${locationId}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateSlotStatus(slotId: string, status: string, slot_type?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/slots/${slotId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, slot_type })
    });
    return handleResponse(res);
  },

  async getPartnerBookings(params?: Record<string, any>): Promise<{ bookings: Booking[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/partner/bookings?${query.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updatePartnerBookingStatus(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/bookings/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getPartnerReviews(): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/reviews`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getPartnerAnalytics(range = '30d'): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/analytics?range=${range}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updatePartnerSettings(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/partner/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Admin APIs
  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAdminUsers(params?: Record<string, any>): Promise<{ users: any[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateAdminUserStatus(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAdminPartners(): Promise<{ partners: any[] }> {
    const res = await fetch(`${API_BASE}/admin/partners`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async verifyAdminPartner(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/partners/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAdminComplaints(): Promise<{ complaints: any[] }> {
    const res = await fetch(`${API_BASE}/admin/complaints`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateAdminComplaint(id: string, status: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/complaints/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};
