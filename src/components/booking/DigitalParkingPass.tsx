import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  Clock,
  Car,
  MapPin,
  CheckCircle2,
  Download,
  Share2,
  Navigation,
  Sparkles,
  ShieldCheck,
  Play
} from 'lucide-react';
import { Booking } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';

interface DigitalParkingPassProps {
  booking: Booking;
  onStartSession?: () => void;
  onClose?: () => void;
}

export const DigitalParkingPass: React.FC<DigitalParkingPassProps> = ({
  booking,
  onStartSession,
  onClose,
}) => {
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Parking Pass - ${booking.location_name}`,
        text: `My Parking Pass for ${booking.location_name}. Booking ID: ${booking.id}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Booking ID: ${booking.id} at ${booking.location_name}`);
      showToast('Booking details copied to clipboard', 'info');
    }
  };

  const handleDirections = () => {
    const lat = booking.latitude || 13.0827;
    const lng = booking.longitude || 80.2707;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Parking at ${booking.location_name}`);
    const details = encodeURIComponent(`Slot: ${booking.slot_number || 'Assigned on Entry'}, Vehicle: ${booking.vehicle_number}`);
    const locationStr = encodeURIComponent(booking.location_address || '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${locationStr}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-md w-full mx-auto font-sans">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black text-sm">
              P
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight block leading-none">
                Parking Partner
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Official Digital Pass
              </span>
            </div>
          </div>
          <StatusBadge status={booking.booking_status} type="booking" />
        </div>

        <div className="relative z-10">
          <h2 className="text-xl font-extrabold font-heading text-white line-clamp-1">
            {booking.location_name}
          </h2>
          <p className="text-xs text-slate-300 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
            {booking.location_address}
          </p>
        </div>
      </div>

      {/* Ticket Cutout Line Effect */}
      <div className="relative flex items-center justify-between px-3 py-1 bg-slate-50 border-y border-dashed border-slate-200">
        <div className="w-4 h-4 rounded-full bg-slate-800 -ml-5 shadow-inner" />
        <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">
          PASS ID: {booking.id}
        </span>
        <div className="w-4 h-4 rounded-full bg-slate-800 -mr-5 shadow-inner" />
      </div>

      {/* Middle QR Code & Spot Assignment */}
      <div className="p-6 flex flex-col items-center bg-white text-center">
        {/* Dynamic QR Box */}
        <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-200 shadow-md mb-3 flex flex-col items-center">
          <QRCodeSVG
            value={booking.qr_data || JSON.stringify({ bookingId: booking.id, user: booking.user_id })}
            size={160}
            level="H"
            includeMargin={true}
          />
          <span className="text-[11px] font-mono font-semibold text-slate-500 mt-1">
            SCAN AT FACILITY BARRIER
          </span>
        </div>

        {/* Assigned Spot Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 font-bold text-sm mb-4">
          <span>Assigned Slot:</span>
          <span className="text-base text-brand-700 font-black">{booking.slot_number || 'A-01'}</span>
        </div>

        {/* Details Grid */}
        <div className="w-full grid grid-cols-2 gap-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              {booking.booking_date}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Time Window</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              {booking.arrival_time} - {booking.exit_time}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vehicle</span>
            <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
              <Car className="w-3.5 h-3.5 text-brand-600" />
              {booking.vehicle_number}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">{booking.vehicle_model}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Paid Amount</span>
            <span className="font-extrabold text-emerald-700 text-sm mt-0.5 block">
              ₹{booking.total_amount.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400">Via {booking.payment_method}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
        {booking.booking_status === 'CONFIRMED' && onStartSession && (
          <button
            onClick={onStartSession}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            Start Parking Session (I Have Arrived)
          </button>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleDirections}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            Directions
          </button>
          <button
            onClick={handleAddToCalendar}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Print/Save
          </button>
        </div>
      </div>
    </div>
  );
};
