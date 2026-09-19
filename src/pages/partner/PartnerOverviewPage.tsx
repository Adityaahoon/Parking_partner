import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Calendar,
  Percent,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Car,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PartnerOverviewPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPartnerDashboard();
      setData(res);
    } catch (err) {
      showToast('Failed to load partner dashboard', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.updatePartnerBookingStatus(bookingId, newStatus);
      showToast(`Booking marked as ${newStatus}`, 'success');
      loadDashboard();
    } catch (err) {
      showToast('Failed to update booking status', 'error');
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, revenueChart, occupancyChart, recentBookings } = data;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Operator Overview & Live Facility Stats
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time occupancy, automated ticketing volume, and daily revenue settlements.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            ₹{Number(kpis.todayRevenue).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs last week
          </span>
        </div>

        {/* Today's Bookings */}
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            {kpis.todayBookings}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            Reservations & live walk-ins
          </span>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            {kpis.occupancyRate}%
          </span>
          <span className="text-[11px] text-indigo-400 font-semibold block mt-1">
            Optimal capacity threshold
          </span>
        </div>

        {/* Available Spaces */}
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Spaces</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
            {kpis.availableSpaces}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            Across {kpis.totalSpaces} total bays
          </span>
        </div>
      </div>

      {/* Interactive Charts: Revenue & Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-base text-white">7-Day Revenue Trend (INR)</h2>
              <p className="text-xs text-slate-400">Daily collections across all facilities</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Weekly Gross: ₹84,200
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Percentage Chart */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-extrabold text-base text-white">Occupancy Percentage (% over Time)</h2>
              <p className="text-xs text-slate-400">Bay utilization rate by weekday</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Peak: 95%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Occupancy']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Area type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#occGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Facility Bookings Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-base text-white">Live Facility Bookings & Check-ins</h2>
            <p className="text-xs text-slate-400">Incoming reservations and parking bay activity</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Facility</th>
                <th className="px-6 py-3.5">Slot</th>
                <th className="px-6 py-3.5">Schedule</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
              {recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-white">{b.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{b.customer_name || 'Customer'}</td>
                  <td className="px-6 py-4 font-mono">{b.vehicle_number}</td>
                  <td className="px-6 py-4 truncate max-w-[150px]">{b.location_name}</td>
                  <td className="px-6 py-4 font-bold text-amber-400">{b.slot_number || 'A-01'}</td>
                  <td className="px-6 py-4 text-slate-400">{b.arrival_time} - {b.exit_time}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={b.booking_status} type="booking" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {b.booking_status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleBookingStatusChange(b.id, 'ACTIVE')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow-xs"
                      >
                        Check-in
                      </button>
                    )}
                    {b.booking_status === 'ACTIVE' && (
                      <button
                        onClick={() => handleBookingStatusChange(b.id, 'COMPLETED')}
                        className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] transition"
                      >
                        Check-out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
