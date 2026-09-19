import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Car,
  Zap,
  Shield,
  Umbrella,
  Accessibility,
  Heart,
  Share2,
  Navigation,
  CheckCircle2,
  ArrowRight,
  User,
  MessageSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { ParkingLocation, Review, ParkingSlot } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AvailabilityBadge } from '../../components/common/AvailabilityBadge';
import { BookingModal } from '../../components/booking/BookingModal';

export const ParkingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [location, setLocation] = useState<ParkingLocation | null>(null);
  const [partner, setPartner] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(searchParams.get('book') === 'true');

  const loadDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [res, slotRes, favRes] = await Promise.all([
        api.getParkingDetails(id),
        api.getParkingSlots(id),
        isAuthenticated ? api.getFavorites().catch(() => ({ favorites: [] })) : Promise.resolve({ favorites: [] })
      ]);
      setLocation(res.location);
      setPartner(res.partner);
      setReviews(res.reviews);
      setSlots(slotRes.slots);
      setIsFavorite(favRes.favorites.some((f: any) => f.id === id));
    } catch (err) {
      showToast('Failed to load parking details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id, isAuthenticated]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!location) return;

    try {
      const res = await api.toggleFavorite(location.id);
      setIsFavorite(res.isFavorite);
      showToast(res.message, 'info');
    } catch (e) {
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location?.name,
        text: `Check out ${location?.name} on Parking Partner: ₹${location?.hourly_rate}/hr`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!location || !reviewComment.trim()) return;

    try {
      setIsSubmittingReview(true);
      const res = await api.addReview({
        locationId: location.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setReviews(prev => [res.review, ...prev]);
      setShowReviewForm(false);
      setReviewComment('');
      showToast('Thank you! Your review has been published.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Loading parking facility details...</span>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Facility Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">The requested parking facility does not exist or has been removed.</p>
          <button onClick={() => navigate('/search')} className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const isFull = location.available_slots === 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AvailabilityBadge
              availableSlots={location.available_slots}
              totalSlots={location.total_slots}
              size="md"
            />
            <span className="text-xs text-slate-500 font-semibold">• {location.area}, {location.city}</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
            {location.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 mt-1.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{location.address}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handleFavoriteToggle}
            className={`p-2.5 rounded-2xl border transition shadow-2xs ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Save to Favorites"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-2xs"
            title="Share Link"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`, '_blank')}
            className="py-2.5 px-4 rounded-2xl bg-slate-900 text-white hover:bg-black transition text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Navigation className="w-4 h-4 text-brand-400" />
            <span>Directions</span>
          </button>
        </div>
      </div>

      {/* 2. Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-72 sm:h-96 rounded-3xl overflow-hidden shadow-md bg-slate-100">
          <img
            src={location.image_url}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col gap-4 h-96">
          {(location.images.slice(1, 3).length > 0 ? location.images.slice(1, 3) : [location.image_url, location.image_url]).map((img, i) => (
            <div key={i} className="flex-1 rounded-2xl overflow-hidden shadow-sm bg-slate-100">
              <img src={img} alt={`${location.name} preview`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Split Section: Details + Sticky Reservation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Key Information, Amenities, Live Slot Matrix, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Real-Time Vacancy Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Vacancy</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {location.available_slots} spots available out of {location.total_slots}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {Math.round((location.available_slots / location.total_slots) * 100)}% Free Capacity
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  location.available_slots === 0
                    ? 'bg-rose-500'
                    : location.available_slots <= 5
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${(location.available_slots / location.total_slots) * 100}%` }}
              />
            </div>
          </div>

          {/* Description & Operating Hours */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">About this Facility</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{location.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Operating Hours</span>
                  <span className="text-xs font-bold text-slate-800">{location.opening_hours}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Operator Verification</span>
                  <span className="text-xs font-bold text-slate-800">{partner?.business_name || 'Verified Parking Partner'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facilities & Amenities Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">Amenities & Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'EV Fast Charging', active: location.facilities?.ev_charging, icon: Zap },
                { label: 'Covered / Indoor', active: location.facilities?.covered, icon: Umbrella },
                { label: '24/7 CCTV Monitoring', active: location.facilities?.cctv, icon: Shield },
                { label: 'Security Guard On-Duty', active: location.facilities?.security, icon: CheckCircle2 },
                { label: 'Valet Service', active: location.facilities?.valet, icon: Car },
                { label: 'Wheelchair Accessible', active: location.facilities?.accessible, icon: Accessibility },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold ${
                      item.active
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Live Slot Matrix Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">Live Parking Slot Map</h2>
                <p className="text-xs text-slate-500">Real-time status across parking decks</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Free</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Occupied</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Reserved</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pt-2">
              {slots.map((s) => {
                const isAvail = s.status === 'AVAILABLE';
                const isOccupied = s.status === 'OCCUPIED';
                const isReserved = s.status === 'RESERVED';

                return (
                  <div
                    key={s.id}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isAvail
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : isOccupied
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : isReserved
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}
                  >
                    <span className="font-mono font-bold text-xs block">{s.slot_number}</span>
                    <span className="text-[9px] uppercase font-bold tracking-tighter block mt-0.5">
                      {s.slot_type === 'EV_CHARGING' ? '⚡ EV' : s.slot_type === 'ACCESSIBLE' ? '♿' : s.status.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews & Ratings */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-lg text-slate-900">User Reviews & Ratings</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{location.rating.toFixed(1)} out of 5</span>
                  <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
                </div>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold hover:bg-brand-100 transition"
              >
                Write a Review
              </button>
            </div>

            {/* Review Form Drawer */}
            {showReviewForm && (
              <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Share your parking experience</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Comment / Feedback</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How was the parking experience? Cleanliness, barrier gates, lighting..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((r) => (
                <div key={r.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.user_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${r.user_name}`}
                        alt={r.user_name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-900">{r.user_name}</span>
                    </div>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      {r.rating}.0
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Reservation Card */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold block">Standard Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹{location.hourly_rate}</span>
                  <span className="text-xs font-bold text-slate-500">/ hour</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                Instant Pass
              </span>
            </div>

            {/* Pricing Tiers Table */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rate Breakdown
              </span>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-slate-50 text-slate-700">
                <span>1 Hour</span>
                <span className="font-bold">₹{location.hourly_rate}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-slate-50 text-slate-700">
                <span>2 Hours</span>
                <span className="font-bold">₹{location.hourly_rate * 2 - 10}</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-slate-50 text-slate-700">
                <span>Weekend Rate</span>
                <span className="font-bold">₹{location.weekend_rate}/hr</span>
              </div>
              <div className="flex justify-between py-1.5 px-3 rounded-xl bg-brand-50 text-brand-900 font-bold">
                <span>Daily Max Pass (24 hrs)</span>
                <span>₹{location.daily_rate}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                disabled={isFull}
                onClick={() => setIsBookingOpen(true)}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isFull
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25'
                }`}
              >
                <span>{isFull ? 'Facility Full' : 'Reserve Spot Now'}</span>
                {!isFull && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Free instant cancellation up to 15 mins before arrival
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {location && (
        <BookingModal
          location={location}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onBookingSuccess={() => loadDetails()}
        />
      )}
    </div>
  );
};
