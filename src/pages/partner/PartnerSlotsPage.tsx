import React, { useState, useEffect } from 'react';
import {
  Grid3X3,
  Car,
  Zap,
  Accessibility,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Edit2,
  X,
  Filter
} from 'lucide-react';
import { ParkingSlot, ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PartnerSlotsPage: React.FC = () => {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected slot for modal
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('AVAILABLE');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    api.getPartnerLocations().then(res => {
      setLocations(res.locations);
      if (res.locations.length > 0) {
        setSelectedLocationId(res.locations[0].id);
      }
    });
  }, []);

  const fetchSlots = async () => {
    if (!selectedLocationId) return;
    try {
      setIsLoading(true);
      const res = await api.getPartnerSlots(selectedLocationId);
      setSlots(res.slots);
    } catch (err) {
      showToast('Failed to load parking slots', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedLocationId]);

  const handleSlotClick = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setOverrideStatus(slot.status);
  };

  const handleUpdateSlotStatus = async () => {
    if (!selectedSlot) return;
    try {
      setIsUpdating(true);
      await api.updateSlotStatus(selectedSlot.id, overrideStatus);
      showToast(`Slot ${selectedSlot.slot_number} marked as ${overrideStatus}`, 'success');
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) {
      showToast('Failed to update slot status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const counts = {
    available: slots.filter(s => s.status === 'AVAILABLE').length,
    occupied: slots.filter(s => s.status === 'OCCUPIED').length,
    reserved: slots.filter(s => s.status === 'RESERVED').length,
    maintenance: slots.filter(s => s.status === 'MAINTENANCE').length,
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Live Parking Slot Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual bay-by-bay status monitor and manual occupancy override console.
          </p>
        </div>

        {/* Facility Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Facility:</span>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-hidden"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Status Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-emerald-400 text-xs font-bold block">Available</span>
            <span className="text-xl font-black text-white">{counts.available} Bays</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 flex items-center justify-between">
          <div>
            <span className="text-rose-400 text-xs font-bold block">Occupied</span>
            <span className="text-xl font-black text-white">{counts.occupied} Bays</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-between">
          <div>
            <span className="text-amber-400 text-xs font-bold block">Reserved</span>
            <span className="text-xl font-black text-white">{counts.reserved} Bays</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block">Maintenance</span>
            <span className="text-xl font-black text-white">{counts.maintenance} Bays</span>
          </div>
          <div className="w-3 h-3 rounded-full bg-slate-600" />
        </div>
      </div>

      {/* Visual Slot Grid Box */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Click any parking slot below to inspect details or override status
          </span>
          <button
            onClick={fetchSlots}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold"
          >
            Refresh Grid ↻
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading slot layout...</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {slots.map((slot) => {
              const isAvail = slot.status === 'AVAILABLE';
              const isOccupied = slot.status === 'OCCUPIED';
              const isReserved = slot.status === 'RESERVED';

              return (
                <div
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 flex flex-col justify-between h-24 ${
                    isAvail
                      ? 'bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400 text-emerald-300'
                      : isOccupied
                      ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400 text-rose-300'
                      : isReserved
                      ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400 text-amber-300'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-sm text-white">{slot.slot_number}</span>
                    {slot.slot_type === 'EV_CHARGING' && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                    {slot.slot_type === 'ACCESSIBLE' && <Accessibility className="w-3.5 h-3.5 text-blue-400" />}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold block uppercase tracking-tight truncate">
                      {slot.vehicle_number || slot.status}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {slot.customer_name ? slot.customer_name.split(' ')[0] : slot.slot_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slot Details & Override Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full overflow-hidden text-slate-200 font-sans">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Parking Bay: {selectedSlot.slot_number}
                </h3>
                <span className="text-xs text-slate-400">Type: {selectedSlot.slot_type}</span>
              </div>
              <button onClick={() => setSelectedSlot(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {selectedSlot.current_booking_id && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Active Booking Details</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer</span>
                    <span className="font-bold text-white">{selectedSlot.customer_name || 'Verified User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle</span>
                    <span className="font-mono font-bold text-white">{selectedSlot.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Window</span>
                    <span className="text-white">{selectedSlot.arrival_time} - {selectedSlot.exit_time}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">
                  Manual Status Override
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOverrideStatus(st)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        overrideStatus === st
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  disabled={isUpdating}
                  onClick={handleUpdateSlotStatus}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-60"
                >
                  {isUpdating ? 'Updating Status...' : 'Apply Status Override'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
