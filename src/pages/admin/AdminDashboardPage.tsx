import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Car,
  FileCheck,
  IndianRupee,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getAdminDashboard()
      .then(res => setData(res))
      .catch(() => showToast('Failed to load admin stats', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { metrics, recentActivity } = data;

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          Platform Administration & Operations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          System health, transaction volume, partner compliance, and platform take-rate analytics.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Platform Volume</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            ₹{Number(metrics.grossVolume).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% Digital Settlements
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Platform Take-Rate (Commission)</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-rose-400">
            ₹{Number(metrics.platformCommission).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            Net convenience fees accrued
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Drivers & Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            {metrics.totalUsers}
          </span>
          <span className="text-[11px] text-blue-400 font-semibold block mt-1">
            Registered customer accounts
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Operators</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            {metrics.activePartners}
          </span>
          <span className="text-[11px] text-amber-400 font-semibold block mt-1">
            Verified parking partners
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Pending Verifications</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-amber-400">
            {metrics.pendingVerifications}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            Awaiting document review
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Managed Parking Bays</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <span className="font-heading font-black text-2xl sm:text-3xl text-white">
            {metrics.totalParkingSpaces}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            Across Chennai & Bengaluru
          </span>
        </div>
      </div>

      {/* Real-time Activity Stream Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-base text-white">Live Platform Booking Stream</h2>
            <p className="text-xs text-slate-400">System-wide reservations, check-ins, and settlements</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Stream</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Booking Ref</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Facility Hub</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
              {recentActivity.map((act: any) => (
                <tr key={act.id} className="hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-white">{act.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">{act.user_name}</td>
                  <td className="px-6 py-4 text-slate-400">{act.location_name}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">₹{act.total_amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={act.booking_status} type="booking" />
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
