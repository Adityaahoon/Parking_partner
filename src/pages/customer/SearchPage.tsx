import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  Zap,
  Shield,
  Umbrella,
  Accessibility,
  ArrowUpDown,
  Car,
  X,
  Map as MapIcon,
  List
} from 'lucide-react';
import { ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { ParkingMap } from '../../components/parking/ParkingMap';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { BookingModal } from '../../components/booking/BookingModal';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);

  // Mobile View Mode: 'list' or 'map'
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Booking Modal
  const [bookingLocation, setBookingLocation] = useState<ParkingLocation | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'Chennai');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recommended');
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [minRating, setMinRating] = useState<number>(0);
  const [filterEV, setFilterEV] = useState(searchParams.get('ev_charging') === 'true');
  const [filterCovered, setFilterCovered] = useState(searchParams.get('covered') === 'true');
  const [filterValet, setFilterValet] = useState(searchParams.get('valet') === 'true');
  const [filterCCTV, setFilterCCTV] = useState(false);
  const [filterAccessible, setFilterAccessible] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = {
        search,
        city: city !== 'ALL' ? city : undefined,
        sortBy,
        maxPrice,
        rating: minRating > 0 ? minRating : undefined,
        ev_charging: filterEV ? 'true' : undefined,
        covered: filterCovered ? 'true' : undefined,
        valet: filterValet ? 'true' : undefined,
        cctv: filterCCTV ? 'true' : undefined,
        accessible: filterAccessible ? 'true' : undefined,
        open_now: filterOpenNow ? 'true' : undefined
      };

      const [locRes, favRes] = await Promise.all([
        api.getParkingLocations(params),
        api.getFavorites().catch(() => ({ favorites: [] }))
      ]);

      setLocations(locRes.locations);
      setFavorites(favRes.favorites.map((f: any) => f.id));

      if (locRes.locations.length > 0 && !selectedLocation) {
        setSelectedLocation(locRes.locations[0]);
      }
    } catch (err) {
      showToast('Failed to search parking spots', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [search, city, sortBy, maxPrice, minRating, filterEV, filterCovered, filterValet, filterCCTV, filterAccessible, filterOpenNow]);

  const activeFilterCount = [
    city !== 'Chennai',
    maxPrice < 100,
    minRating > 0,
    filterEV,
    filterCovered,
    filterValet,
    filterCCTV,
    filterAccessible,
    filterOpenNow
  ].filter(Boolean).length;

  const resetFilters = () => {
    setCity('Chennai');
    setMaxPrice(100);
    setMinRating(0);
    setFilterEV(false);
    setFilterCovered(false);
    setFilterValet(false);
    setFilterCCTV(false);
    setFilterAccessible(false);
    setFilterOpenNow(false);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Search & Filter Control Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input & City Dropdown */}
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search area, mall, airport or landmark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 border-none text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-xs sm:text-sm font-semibold text-slate-800 border-none focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            >
              <option value="Chennai">Chennai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="ALL">All Cities</option>
            </select>
          </div>

          {/* Sort & Filter Drawer Trigger */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="closest">Closest Distance</option>
                <option value="cheapest">Cheapest Rate</option>
                <option value="highest_rated">Highest Rated</option>
                <option value="availability">Most Available</option>
              </select>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeFilterCount > 0
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-brand-700 text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile View Switcher (List vs Map) */}
            <div className="flex lg:hidden bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMobileView('list')}
                className={`p-1.5 rounded-lg transition ${
                  mobileView === 'list' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileView('map')}
                className={`p-1.5 rounded-lg transition ${
                  mobileView === 'map' ? 'bg-white text-brand-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
                aria-label="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Split-Screen on Desktop */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left: Parking Cards Column */}
          <div className={`lg:col-span-6 xl:col-span-5 space-y-4 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Found {locations.length} parking spots
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-brand-600 hover:text-brand-700 font-bold"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : locations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-slate-800">No parking facilities match your query</h3>
                <p className="text-xs text-slate-500 mt-1">Try expanding your price range or clearing amenities.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    onMouseEnter={() => setSelectedLocation(loc)}
                  >
                    <ParkingCard
                      location={loc}
                      highlighted={selectedLocation?.id === loc.id}
                      isFavorite={favorites.includes(loc.id)}
                      onFavoriteToggle={(id, isFav) => {
                        setFavorites(prev => isFav ? [...prev, id] : prev.filter(x => x !== id));
                      }}
                      onSelectBooking={(l) => {
                        setBookingLocation(l);
                        setIsBookingOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sticky Interactive Map */}
          <div className={`lg:col-span-6 xl:col-span-7 h-[500px] lg:h-[calc(100vh-140px)] sticky top-36 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            <ParkingMap
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
            />
          </div>
        </div>
      </div>

      {/* Filter Drawer / Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">Search Filters</h3>
              </div>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Max Price Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Max Hourly Price</span>
                  <span className="text-brand-600 font-extrabold text-sm">₹{maxPrice}/hr</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={5}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                  <span>₹30/hr</span>
                  <span>₹120/hr</span>
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Minimum Rating</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 4.0, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        minRating === r
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {r === 0 ? 'Any' : `${r}+ ★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities Toggles */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Facilities & Amenities</label>
                <div className="space-y-2 text-xs">
                  {[
                    { label: '⚡ Fast EV Charging', state: filterEV, setter: setFilterEV },
                    { label: '☂️ Covered / Basement Parking', state: filterCovered, setter: setFilterCovered },
                    { label: '🚗 Valet Service Available', state: filterValet, setter: setFilterValet },
                    { label: '🛡️ 24/7 CCTV & Security Guard', state: filterCCTV, setter: setFilterCCTV },
                    { label: '♿ Accessible / Wheelchair Parking', state: filterAccessible, setter: setFilterAccessible },
                    { label: '🟢 Open & Available Now', state: filterOpenNow, setter: setFilterOpenNow },
                  ].map((item, i) => (
                    <label
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
                    >
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.setter(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded-md border-slate-300 focus:ring-brand-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Booking Modal */}
      {bookingLocation && (
        <BookingModal
          location={bookingLocation}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={() => fetchLocations()}
        />
      )}
    </div>
  );
};
