import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car,
  Bell,
  User,
  Heart,
  Calendar,
  History,
  ShieldCheck,
  Building2,
  LogOut,
  ChevronDown,
  Sparkles,
  MapPin,
  Menu,
  X,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, loginAsDemo, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then(res => {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast('All notifications marked as read', 'info');
    } catch (e) {}
  };

  const handleDemoSwitch = async (role: 'customer' | 'partner' | 'admin') => {
    try {
      await loginAsDemo(role);
      showToast(`Logged in as Demo ${role.toUpperCase()}`, 'success');
      if (role === 'partner') navigate('/partner/overview');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to switch demo account', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Demo Account Quick-Switch Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-white">Live Prototype Mode:</span>
          <span>Explore instant multi-role flows with one click</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Switch Demo Account:</span>
          <button
            onClick={() => handleDemoSwitch('customer')}
            className={`px-2.5 py-0.5 rounded-full text-xs transition font-medium ${
              user?.role === 'CUSTOMER'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            👤 Customer
          </button>
          <button
            onClick={() => handleDemoSwitch('partner')}
            className={`px-2.5 py-0.5 rounded-full text-xs transition font-medium ${
              user?.role === 'PARTNER'
                ? 'bg-amber-500 text-slate-900 font-semibold shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            🏢 Partner Operator
          </button>
          <button
            onClick={() => handleDemoSwitch('admin')}
            className={`px-2.5 py-0.5 rounded-full text-xs transition font-medium ${
              user?.role === 'ADMIN'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            ⚡ Platform Admin
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <span className="font-black text-xl tracking-tight">P</span>
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1">
                Parking<span className="text-brand-600">Partner</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Smart Mobility
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLinkActive('/search')
                  ? 'bg-brand-50 text-brand-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Find Parking
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLinkActive('/bookings')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/favorites"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLinkActive('/favorites')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  Favorites
                </Link>
                <Link
                  to="/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isLinkActive('/history')
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  History
                </Link>
              </>
            )}
            
            {/* Operator or Admin Quick Jumps */}
            {user?.role === 'PARTNER' && (
              <Link
                to="/partner/overview"
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                Partner Dashboard
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            No notifications right now.
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`p-3.5 text-xs transition ${
                                !n.is_read ? 'bg-brand-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-slate-800">{n.title}</span>
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200/60"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover border border-brand-500/30"
                    />
                    <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user?.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                  </button>

                  {/* Profile Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand-50 text-brand-700 border border-brand-200">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          My Profile & Vehicles
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          My Bookings
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          Saved Parking Spots
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium"
                        >
                          <History className="w-4 h-4 text-slate-400" />
                          Parking History
                        </Link>

                        {user?.role === 'PARTNER' && (
                          <Link
                            to="/partner/overview"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-800 bg-amber-50/60 hover:bg-amber-100/80 transition font-medium"
                          >
                            <Building2 className="w-4 h-4 text-amber-600" />
                            Partner Operator Console
                          </Link>
                        )}

                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-800 bg-rose-50/60 hover:bg-rose-100/80 transition font-medium"
                          >
                            <ShieldCheck className="w-4 h-4 text-rose-600" />
                            Admin Control Center
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition font-medium text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login', 'CUSTOMER')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup', 'CUSTOMER')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/25 transition"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => { handleDemoSwitch('customer'); setIsMobileMenuOpen(false); }}
              className="px-2 py-1.5 rounded-lg text-xs bg-brand-50 text-brand-700 font-medium text-center"
            >
              👤 Customer
            </button>
            <button
              onClick={() => { handleDemoSwitch('partner'); setIsMobileMenuOpen(false); }}
              className="px-2 py-1.5 rounded-lg text-xs bg-amber-50 text-amber-800 font-medium text-center"
            >
              🏢 Partner
            </button>
            <button
              onClick={() => { handleDemoSwitch('admin'); setIsMobileMenuOpen(false); }}
              className="px-2 py-1.5 rounded-lg text-xs bg-rose-50 text-rose-800 font-medium text-center"
            >
              ⚡ Admin
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              🔍 Find Parking
            </Link>
            <Link
              to="/bookings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              📅 My Bookings
            </Link>
            <Link
              to="/favorites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              ❤️ Saved Spots
            </Link>
            <Link
              to="/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              📊 Parking History
            </Link>
            {user?.role === 'PARTNER' && (
              <Link
                to="/partner/overview"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-amber-800 bg-amber-50 rounded-lg"
              >
                🏢 Partner Console
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-semibold text-rose-800 bg-rose-50 rounded-lg"
              >
                ⚡ Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
