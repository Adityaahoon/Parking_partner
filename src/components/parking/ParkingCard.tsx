import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Zap,
  Shield,
  Umbrella,
  Accessibility,
  Heart,
  Car,
  Navigation,
  ArrowRight,
  Clock
} from 'lucide-react';
import { ParkingLocation } from '../../types';
import { AvailabilityBadge } from '../common/AvailabilityBadge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ParkingCardProps {
  location: ParkingLocation;
  isFavorite?: boolean;
  onFavoriteToggle?: (locationId: string, isFav: boolean) => void;
  onSelectBooking?: (location: ParkingLocation) => void;
  compact?: boolean;
  highlighted?: boolean;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  location,
  isFavorite = false,
  onFavoriteToggle,
  onSelectBooking,
  compact = false,
  highlighted = false,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [fav, setFav] = useState(isFavorite);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    try {
      setIsTogglingFav(true);
      const res = await api.toggleFavorite(location.id);
      setFav(res.isFavorite);
      if (onFavoriteToggle) onFavoriteToggle(location.id, res.isFavorite);
      showToast(res.message, 'info');
    } catch (err) {
      showToast('Failed to update favorites', 'error');
    } finally {
      setIsTogglingFav(false);
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  const isFull = location.available_slots === 0;

  return (
    <div
      onClick={() => navigate(`/parking/${location.id}`)}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col ${
        compact ? 'p-3 text-xs' : 'p-4 sm:p-5'
      } ${
        highlighted
          ? 'border-brand-500 shadow-elevated ring-2 ring-brand-400/30'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-100 mb-3.5">
        <img
          src={location.image_url}
          alt={location.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Left Availability Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <AvailabilityBadge
            availableSlots={location.available_slots}
            totalSlots={location.total_slots}
            size="sm"
          />
        </div>

        {/* Top Right Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFav}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            fav
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500 shadow-sm'
          }`}
          aria-label="Save to favorites"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Distance & Open Hours on Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            {location.distance_label || `${location.area}, ${location.city}`}
          </span>
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px]">
            <Clock className="w-3 h-3 text-emerald-400" />
            {location.opening_hours}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-heading font-bold text-base sm:text-lg text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
              {location.name}
            </h3>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{location.rating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-700 font-normal">({location.reviews_count})</span>
            </div>
          </div>

          {/* Address */}
          <p className="text-xs text-slate-500 line-clamp-1 mb-3">
            {location.address}
          </p>

          {/* Key Amenities */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {location.facilities?.ev_charging && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap className="w-3 h-3 text-emerald-600" /> EV Fast Charge
              </span>
            )}
            {location.facilities?.covered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Umbrella className="w-3 h-3 text-slate-500" /> Covered
              </span>
            )}
            {location.facilities?.cctv && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                <Shield className="w-3 h-3 text-slate-500" /> CCTV 24/7
              </span>
            )}
            {location.facilities?.valet && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Car className="w-3 h-3 text-indigo-500" /> Valet
              </span>
            )}
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{location.hourly_rate}
              </span>
              <span className="text-xs font-semibold text-slate-500">/hr</span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Day Pass: ₹{location.daily_rate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirections}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
              title="Get Directions"
              aria-label="Get Directions"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              disabled={isFull}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectBooking) {
                  onSelectBooking(location);
                } else {
                  navigate(`/parking/${location.id}?book=true`);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isFull
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 hover:shadow-md'
              }`}
            >
              <span>{isFull ? 'Full' : 'Reserve'}</span>
              {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
