import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  MapPin,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { Booking, ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PartnerBookingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPartnerBookings({ status: statusFilter !== 'ALL' ? statusFilter : undefined });
      setBookings(res.bookings);
    } catch (err) {
      showToast('Failed to load facility bookings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updatePartnerBookingStatus(id, newStatus);
      showToast(`Booking marked as ${newStatus}`, 'success');
      fetchBookings();
    } catch (err) {
      showToast('Failed to update booking status', 'error');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(term) ||
      (b.customer_name && b.customer_name.toLowerCase().includes(term)) ||
      b.vehicle_number.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Facility Reservations & Check-ins
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete log of all customer parking bookings, entry timestamps, and billing.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-3xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking ID, Customer name, or Vehicle plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Facility</th>
                <th className="px-6 py-3.5">Slot</th>
                <th className="px-6 py-3.5">Date & Time</th>
                <th className="px-6 py-3.5">Paid</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No reservations match the filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-white">{b.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-200 block">{b.customer_name || 'Customer'}</span>
                      <span className="text-[10px] text-slate-500">{b.user_id}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{b.vehicle_number}</td>
                    <td className="px-6 py-4 truncate max-w-[140px]">{b.location_name}</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{b.slot_number || 'A-01'}</td>
                    <td className="px-6 py-4">
                      <span className="block text-slate-200">{b.booking_date}</span>
                      <span className="text-[10px] text-slate-500">{b.arrival_time} - {b.exit_time}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400">₹{b.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.booking_status} type="booking" />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {b.booking_status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'ACTIVE')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                        >
                          Check-in
                        </button>
                      )}
                      {b.booking_status === 'ACTIVE' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px]"
                        >
                          Check-out
                        </button>
                      )}
                      {b.booking_status !== 'CANCELLED' && b.booking_status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                          className="px-2 py-1 rounded-lg border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
