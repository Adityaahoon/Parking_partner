import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Building2,
  FileCheck,
  AlertCircle,
  Settings,
  LogOut,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Platform Dashboard', path: '/admin/dashboard', icon: Activity },
    { label: 'User & Driver Management', path: '/admin/users', icon: Users },
    { label: 'Partner Verification Queue', path: '/admin/partners', icon: FileCheck },
    { label: 'Disputes & Complaints', path: '/admin/complaints', icon: AlertCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-5 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black">
                P
              </div>
              <div>
                <span className="font-heading font-extrabold text-sm text-white tracking-tight block leading-none">
                  Parking Partner
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                  Admin Control Center
                </span>
              </div>
            </Link>

            <div className="mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-xs font-bold text-rose-200">Root Administrator</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400">v1.0.0</span>
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
                      ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-600/20'
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition font-medium"
          >
            <span>Customer Portal</span>
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

      {/* Admin Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
