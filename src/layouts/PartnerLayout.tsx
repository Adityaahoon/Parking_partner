import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Grid3X3,
  Calendar,
  IndianRupee,
  BarChart3,
  Star,
  Settings,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const PartnerLayout: React.FC = () => {
  const { user, partner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isVerified = partner?.verification_status === 'VERIFIED';
  const isPending = partner?.verification_status === 'PENDING' || partner?.verification_status === 'UNDER_REVIEW';

  const navItems = [
    { label: 'Overview', path: '/partner/overview', icon: LayoutDashboard },
    { label: 'Parking Locations', path: '/partner/locations', icon: Layers },
    { label: 'Parking Slots Matrix', path: '/partner/slots', icon: Grid3X3 },
    { label: 'Booking Management', path: '/partner/bookings', icon: Calendar },
    { label: 'Dynamic Pricing', path: '/partner/pricing', icon: IndianRupee },
    { label: 'Revenue & Analytics', path: '/partner/analytics', icon: BarChart3 },
    { label: 'Customer Reviews', path: '/partner/reviews', icon: Star },
    { label: 'Partner Settings', path: '/partner/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                P
              </div>
              <div>
                <span className="font-heading font-extrabold text-sm text-white tracking-tight block leading-none">
                  Parking Partner
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Partner Console
                </span>
              </div>
            </Link>

            {/* Operator Business Card */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white truncate">
                  {partner?.business_name || 'PrimePark Infra Ltd'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={partner?.verification_status || 'VERIFIED'} type="verification" />
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
          >
            <span>Switch to Customer App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition font-medium text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Partner Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        {/* Verification Warning Notice if Pending */}
        {isPending && (
          <div className="bg-amber-950/80 border-b border-amber-800 text-amber-200 px-6 py-2.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Verification in Progress:</strong> Our platform compliance team is currently reviewing your facility trade documents. You can still configure slots and preview analytics.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold bg-amber-900 px-2 py-0.5 rounded-full">
              Status: Under Review
            </span>
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
