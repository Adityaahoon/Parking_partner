import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  QrCode,
  Navigation,
  XCircle,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Booking } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DigitalParkingPass } from '../../components/booking/DigitalParkingPass';

export const BookingsPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Selected pass modal
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.getMyBookings(activeTab === 'UPCOMING' ? 'CONFIRMED' : activeTab);
      setBookings(res.bookings);
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, activeTab]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A full refund will be processed.')) return;
    try {
      await api.cancelBooking(bookingId);
      showToast('Booking cancelled. Refund initiated.', 'info');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleExtendBooking = async (bookingId: string) => {
    try {
      await api.extendBooking(bookingId, 1);
      showToast('Booking extended by 1 hour!', 'success');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to extend', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
          <Calendar className="w-12 h-12 text-brand-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Sign in to View Bookings</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Manage all your active, upcoming, and past parking passes.</p>
          <button onClick={() => openAuthModal('login')} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Title & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            My Parking Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your active digital parking passes, entry barcodes, and receipts.
          </p>
        </div>

        <button
          onClick={() => navigate('/search')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition"
        >
          <span>Book New Spot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'All Passes' },
          { id: 'UPCOMING', label: 'Upcoming' },
          { id: 'ACTIVE', label: '🟢 Active Now' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No {activeTab.toLowerCase()} bookings found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Find and reserve a spot at top parking facilities in seconds.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
          >
            Find Parking Spots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const isConfirmed = booking.booking_status === 'CONFIRMED';
            const isActive = booking.booking_status === 'ACTIVE';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                        ID: {booking.id}
                      </span>
                      <h3 className="font-heading font-bold text-base text-slate-900 line-clamp-1">
                        {booking.location_name}
                      </h3>
                    </div>
                    <StatusBadge status={booking.booking_status} type="booking" />
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-4 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    {booking.location_address}
                  </p>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Date & Time</span>
                      <span className="font-bold text-slate-800 block">{booking.booking_date}</span>
                      <span className="text-[11px] text-slate-500">{booking.arrival_time} - {booking.exit_time}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Spot & Vehicle</span>
                      <span className="font-bold text-brand-700 block">Slot {booking.slot_number || 'A-01'}</span>
                      <span className="text-[11px] font-mono font-semibold text-slate-600">{booking.vehicle_number}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-black text-slate-900">₹{booking.total_amount.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">Paid ({booking.payment_method})</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBookingForPass(booking)}
                      className="px-3 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-100 flex items-center gap-1 transition"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Pass</span>
                    </button>

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs transition"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    {isActive && (
                      <button
                        onClick={() => handleExtendBooking(booking.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+1h</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Digital Pass Modal */}
      {selectedBookingForPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative">
            <button
              onClick={() => setSelectedBookingForPass(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 font-bold text-xs flex items-center gap-1"
            >
              Close Pass ✕
            </button>
            <DigitalParkingPass
              booking={selectedBookingForPass}
              onClose={() => setSelectedBookingForPass(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
