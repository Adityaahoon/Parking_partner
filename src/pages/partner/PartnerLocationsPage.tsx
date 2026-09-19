import React, { useState, useEffect } from 'react';
import {
  Plus,
  Layers,
  MapPin,
  Clock,
  Car,
  IndianRupee,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Zap,
  Shield,
  Umbrella,
  Accessibility
} from 'lucide-react';
import { ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PartnerLocationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ParkingLocation | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chennai');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState(50);
  const [dailyRate, setDailyRate] = useState(300);
  const [weekendRate, setWeekendRate] = useState(60);
  const [peakRate, setPeakRate] = useState(70);
  const [totalSlots, setTotalSlots] = useState(24);
  const [openingHours, setOpeningHours] = useState('24/7 Open');
  const [imageUrl, setImageUrl] = useState('');

  // Facilities Flags
  const [cctv, setCctv] = useState(true);
  const [security, setSecurity] = useState(true);
  const [covered, setCovered] = useState(true);
  const [evCharging, setEvCharging] = useState(true);
  const [valet, setValet] = useState(false);
  const [accessible, setAccessible] = useState(true);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPartnerLocations();
      setLocations(res.locations);
    } catch (err) {
      showToast('Failed to load facilities', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setName('');
    setAddress('');
    setArea('');
    setDescription('');
    setHourlyRate(50);
    setDailyRate(300);
    setWeekendRate(60);
    setPeakRate(70);
    setTotalSlots(24);
    setOpeningHours('24/7 Open');
    setImageUrl('');
    setCctv(true);
    setSecurity(true);
    setCovered(true);
    setEvCharging(true);
    setValet(false);
    setAccessible(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: ParkingLocation) => {
    setEditingLocation(loc);
    setName(loc.name);
    setAddress(loc.address);
    setArea(loc.area);
    setDescription(loc.description);
    setHourlyRate(loc.hourly_rate);
    setDailyRate(loc.daily_rate);
    setWeekendRate(loc.weekend_rate);
    setPeakRate(loc.peak_rate);
    setTotalSlots(loc.total_slots);
    setOpeningHours(loc.opening_hours);
    setImageUrl(loc.image_url);
    setCctv(!!loc.facilities?.cctv);
    setSecurity(!!loc.facilities?.security);
    setCovered(!!loc.facilities?.covered);
    setEvCharging(!!loc.facilities?.ev_charging);
    setValet(!!loc.facilities?.valet);
    setAccessible(!!loc.facilities?.accessible);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const facilities = { cctv, security, covered, ev_charging: evCharging, valet, accessible };
      if (editingLocation) {
        await api.updatePartnerLocation(editingLocation.id, {
          name, address, description, hourly_rate: hourlyRate, daily_rate: dailyRate,
          weekend_rate: weekendRate, peak_rate: peakRate, opening_hours: openingHours, facilities
        });
        showToast('Facility updated successfully!', 'success');
      } else {
        await api.createPartnerLocation({
          name, address, city, area, description, hourly_rate: hourlyRate, daily_rate: dailyRate,
          weekend_rate: weekendRate, peak_rate: peakRate, total_slots: totalSlots,
          opening_hours: openingHours, image_url: imageUrl, facilities
        });
        showToast('New facility registered with automatic slot matrix!', 'success');
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (err: any) {
      showToast(err.message || 'Failed to save location', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Parking Facility Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register, configure amenities, and manage all your physical parking premises.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parking Location</span>
        </button>
      </div>

      {/* Locations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="bg-slate-950 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-4"
          >
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900">
              <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover" />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  {loc.available_slots} / {loc.total_slots} Slots Free
                </span>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-xs font-black">
                  ₹{loc.hourly_rate}/hr
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg text-white">{loc.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {loc.address}
              </p>
            </div>

            {/* Quick stats & features */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Capacity</span>
                <span className="font-bold text-white">{loc.total_slots} Bays</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Peak Rate</span>
                <span className="font-bold text-amber-400">₹{loc.peak_rate}/hr</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Day Pass</span>
                <span className="font-bold text-emerald-400">₹{loc.daily_rate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {loc.opening_hours}
              </span>

              <button
                onClick={() => handleOpenEdit(loc)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-slate-200 font-sans">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-lg text-white">
                {editingLocation ? 'Edit Parking Facility' : 'Register New Parking Location'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marina Premium Smart Hub"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Area / Neighborhood</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Velachery / Mylapore"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, Gate Number"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                  required
                />
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base / hr</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peak / hr</label>
                  <input
                    type="number"
                    value={peakRate}
                    onChange={(e) => setPeakRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Weekend / hr</label>
                  <input
                    type="number"
                    value={weekendRate}
                    onChange={(e) => setWeekendRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Bays</label>
                  <input
                    type="number"
                    value={totalSlots}
                    disabled={!!editingLocation}
                    onChange={(e) => setTotalSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              {/* Facilities Checkboxes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Available Amenities</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={evCharging} onChange={(e) => setEvCharging(e.target.checked)} className="rounded text-amber-500" />
                    <span>⚡ EV Fast Charging</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={covered} onChange={(e) => setCovered(e.target.checked)} className="rounded text-amber-500" />
                    <span>☂️ Covered Parking</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={cctv} onChange={(e) => setCctv(e.target.checked)} className="rounded text-amber-500" />
                    <span>🛡️ 24/7 CCTV</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input type="checkbox" checked={valet} onChange={(e) => setValet(e.target.checked)} className="rounded text-amber-500" />
                    <span>🚗 Valet Assistance</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition"
              >
                {editingLocation ? 'Update Facility Configuration' : 'Register Location & Generate Slots'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
