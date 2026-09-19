import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Car,
  PieChart as PieIcon,
  IndianRupee
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PartnerAnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [range, setRange] = useState('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPartnerAnalytics(range);
      setAnalytics(res);
    } catch (err) {
      showToast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ec4899'];

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Revenue & Facility Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep dive into occupancy patterns, duration distribution, and peak hours.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '3 Months' },
            { id: '1y', label: '1 Year' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                range === r.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Gross Inflows</span>
          <span className="font-heading font-black text-2xl text-white">₹{analytics.metrics.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Average Duration</span>
          <span className="font-heading font-black text-2xl text-amber-400">{analytics.metrics.averageDuration}</span>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Repeat Drivers</span>
          <span className="font-heading font-black text-2xl text-emerald-400">{analytics.metrics.repeatCustomersRate}</span>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Peak Occupancy</span>
          <span className="font-heading font-black text-2xl text-indigo-400">{analytics.metrics.peakOccupancyRate}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Peak Hours Distribution */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h2 className="font-heading font-extrabold text-base text-white">Hourly Demand & Bookings Pattern</h2>
            <p className="text-xs text-slate-400">Discover when your parking facility experiences rush traffic</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Bookings Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration Distribution Pie */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h2 className="font-heading font-extrabold text-base text-white">Stay Duration Breakdown</h2>
            <p className="text-xs text-slate-400">Short stay vs full-day pass distribution</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.durationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.durationDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {analytics.durationDistribution.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
