import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, Heart, User, LayoutDashboard, Grid3X3, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isPartner = user?.role === 'PARTNER' && location.pathname.startsWith('/partner');

  interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    authOnly?: boolean;
  }

  const customerNavItems: NavItem[] = [
    { label: 'Home', path: isAuthenticated ? '/dashboard' : '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Bookings', path: '/bookings', icon: Calendar, authOnly: true },
    { label: 'Saved', path: '/favorites', icon: Heart, authOnly: true },
    { label: 'Profile', path: '/profile', icon: User, authOnly: true },
  ];

  const partnerNavItems: NavItem[] = [
    { label: 'Overview', path: '/partner/overview', icon: LayoutDashboard },
    { label: 'Locations', path: '/partner/locations', icon: Layers },
    { label: 'Slots', path: '/partner/slots', icon: Grid3X3 },
    { label: 'Bookings', path: '/partner/bookings', icon: Calendar },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const navItems: NavItem[] = isPartner ? partnerNavItems : customerNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-1.5 px-3 shadow-2xl safe-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          if (item.authOnly && !isAuthenticated) return null;
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-brand-600 font-semibold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-600" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
