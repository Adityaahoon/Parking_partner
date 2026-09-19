import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowRight, Car } from 'lucide-react';
import { Favorite, ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ParkingCard } from '../../components/parking/ParkingCard';
import { BookingModal } from '../../components/booking/BookingModal';

export const FavoritesPage: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.getFavorites();
      setFavorites(res.favorites);
    } catch (err) {
      showToast('Failed to load favorites', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchFavorites();
  }, [isAuthenticated]);

  const handleFavoriteToggle = (locationId: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(f => f.id !== locationId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Sign in to View Favorites</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">Save your frequent parking locations for 1-click booking.</p>
          <button onClick={() => openAuthModal('login')} className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            Saved Parking Locations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quickly book spots at your favorite malls, transit hubs, and corporate parks.
          </p>
        </div>

        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Discover More</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
          <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800">No favorite locations yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Tap the heart icon on any parking card to save it for rapid bookings.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
          >
            Explore Parking Hubs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav: any) => (
            <ParkingCard
              key={fav.id}
              location={fav}
              isFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
              onSelectBooking={(loc) => {
                setSelectedLocation(loc);
                setIsBookingOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {selectedLocation && (
        <BookingModal
          location={selectedLocation}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
};
