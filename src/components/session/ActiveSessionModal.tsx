import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Car,
  MapPin,
  Navigation,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  StopCircle,
  QrCode
} from 'lucide-react';
import { ParkingSession } from '../../types';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ActiveSessionModalProps {
  session: ParkingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionEnded?: () => void;
  onSessionExtended?: () => void;
}

export const ActiveSessionModal: React.FC<ActiveSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onSessionEnded,
  onSessionExtended,
}) => {
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpiring: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpiring: false,
  });

  const [isExtending, setIsExtending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Live timer tick
  useEffect(() => {
    if (!session || !isOpen) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(session.estimated_end_time).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpiring: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpiring: diff < 15 * 60 * 1000 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleExtend = async (extraHours: number) => {
    try {
      setIsExtending(true);
      await api.extendBooking(session.booking_id, extraHours);
      showToast(`Extended parking session by ${extraHours} hour(s)!`, 'success');
      if (onSessionExtended) onSessionExtended();
    } catch (err: any) {
      showToast(err.message || 'Failed to extend session', 'error');
    } finally {
      setIsExtending(false);
    }
  };

  const handleEndSession = async () => {
    if (!window.confirm('Are you sure you want to end this parking session and check out?')) return;

    try {
      setIsEnding(true);
      await api.endSession(session.booking_id);
      showToast('Parking session completed! Safe travels.', 'success');
      onClose();
      if (onSessionEnded) onSessionEnded();
    } catch (err: any) {
      showToast(err.message || 'Failed to end session', 'error');
    } finally {
      setIsEnding(false);
    }
  };

  const handleDirections = () => {
    const lat = session.latitude || 13.0827;
    const lng = session.longitude || 80.2707;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-100">
              Live Parking Session Active
            </span>
          </div>

          <h3 className="font-heading font-extrabold text-xl line-clamp-1">{session.location_name}</h3>
          <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {session.location_address}
          </p>
        </div>

        {/* Big Countdown Timer */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Remaining Reservation Time
          </span>
          <div className="flex items-center justify-center gap-2 font-heading font-black text-4xl sm:text-5xl text-slate-900 my-2">
            <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
              {String(timeLeft.hours).padStart(2, '0')}
              <span className="block text-[10px] font-sans font-bold text-slate-400 -mt-1">HRS</span>
            </div>
            <span className="text-slate-400 -mt-4">:</span>
            <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
              {String(timeLeft.minutes).padStart(2, '0')}
              <span className="block text-[10px] font-sans font-bold text-slate-400 -mt-1">MIN</span>
            </div>
            <span className="text-slate-400 -mt-4">:</span>
            <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm text-emerald-600">
              {String(timeLeft.seconds).padStart(2, '0')}
              <span className="block text-[10px] font-sans font-bold text-slate-400 -mt-1">SEC</span>
            </div>
          </div>

          {timeLeft.isExpiring && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mt-2 animate-bounce">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Session expiring soon! Extend to prevent overstay fine.</span>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Spot</span>
              <span className="font-extrabold text-base text-brand-700">{session.slot_number || 'A-01'}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle</span>
              <span className="font-mono font-bold text-slate-800 block truncate">{session.vehicle_number}</span>
            </div>
          </div>

          {/* Extend Time Quick Buttons */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Need More Time?</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isExtending}
                onClick={() => handleExtend(1)}
                className="py-2.5 px-3 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+1 Hour (₹{session.hourly_rate || 40})</span>
              </button>
              <button
                disabled={isExtending}
                onClick={() => handleExtend(2)}
                className="py-2.5 px-3 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+2 Hours (₹{(session.hourly_rate || 40) * 2})</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleDirections}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition shadow-sm"
            >
              <Navigation className="w-4 h-4 text-brand-400" />
              <span>Navigate to Parking Bay</span>
            </button>

            <button
              disabled={isEnding}
              onClick={handleEndSession}
              className="w-full py-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <StopCircle className="w-4 h-4 text-rose-600" />
              <span>{isEnding ? 'Checking Out...' : 'Check Out & End Session'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
