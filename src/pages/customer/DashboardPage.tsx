import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Car,
  Zap,
  ShieldCheck,
  Heart,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ParkingLocation, Booking } from '../../types';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { SkeletonGrid } from '../../components/common/SkeletonLoader';
import { BookingModal } from '../../components/booking/BookingModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EV' | 'COVERED' | 'VALET' | 'CHEAP'>('ALL');

  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTime, setSearchTime] = useState('14:00');
  const [searchDuration, setSearchDuration] = useState(2);

  // Booking modal state
  const [selectedLocationForBooking, setSelectedLocationForBooking] = useState<ParkingLocation | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [locRes, favRes] = await Promise.all([
        api.getParkingLocations(),
        api.getFavorites().catch(() => ({ favorites: [] }))
      ]);
      setLocations(locRes.locations);
      setFavorites(favRes.favorites.map((f: any) => f.id));
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(searchQuery)}&date=${searchDate}&time=${searchTime}&duration=${searchDuration}`);
  };

  const handleQuickReserve = (loc: ParkingLocation) => {
    setSelectedLocationForBooking(loc);
    setIsBookingModalOpen(true);
  };

  // Filter locations in memory based on chip
  const filteredLocations = locations.filter(loc => {
    if (selectedFilter === 'EV') return loc.facilities?.ev_charging;
    if (selectedFilter === 'COVERED') return loc.facilities?.covered;
    if (selectedFilter === 'VALET') return loc.facilities?.valet;
    if (selectedFilter === 'CHEAP') return loc.hourly_rate <= 40;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Personalized Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name.split(' ')[0] || 'Aditya'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Where are you driving today? Reserve a spot ahead and save travel time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-2xs transition flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>My Bookings</span>
          </button>
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-md shadow-brand-500/20 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Explore Map</span>
          </button>
        </div>
      </div>

      {/* Main Search Panel */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/90 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-brand-600" />
            <span>Where do you want to park?</span>
          </h2>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Destination Input */}
              <div className="sm:col-span-5 relative">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Destination / Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-brand-600 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Marina Beach, Phoenix Mall, Chennai Central"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Arrival Time */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Arrival Time
                </label>
                <input
                  type="time"
                  value={searchTime}
                  onChange={(e) => setSearchTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              {/* Duration */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Duration
                </label>
                <select
                  value={searchDuration}
                  onChange={(e) => setSearchDuration(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                >
                  <option value={1}>1 Hour</option>
                  <option value={2}>2 Hours</option>
                  <option value={3}>3 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={24}>Full Day</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                <span>Find Parking</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Filters:
          </span>
          {[
            { id: 'ALL', label: 'All Locations' },
            { id: 'EV', label: '⚡ EV Fast Charging' },
            { id: 'COVERED', label: '☂️ Covered Garage' },
            { id: 'VALET', label: '🚗 Valet Service' },
            { id: 'CHEAP', label: '💰 Under ₹40/hr' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setSelectedFilter(chip.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedFilter === chip.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/search')}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 shrink-0"
        >
          <span>View on Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nearby Parking Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-extrabold text-xl text-slate-900">
              Nearby Parking Spaces
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredLocations.length} verified smart parking facilities around Chennai
            </p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : filteredLocations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No parking facilities match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the filter chips above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((loc) => (
              <ParkingCard
                key={loc.id}
                location={loc}
                isFavorite={favorites.includes(loc.id)}
                onFavoriteToggle={(id, isFav) => {
                  setFavorites(prev => isFav ? [...prev, id] : prev.filter(x => x !== id));
                }}
                onSelectBooking={handleQuickReserve}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedLocationForBooking && (
        <BookingModal
          location={selectedLocationForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
