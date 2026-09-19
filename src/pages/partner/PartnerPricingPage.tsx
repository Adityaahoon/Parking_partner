import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  Sparkles,
  Save,
  Layers,
  AlertCircle
} from 'lucide-react';
import { ParkingLocation } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PartnerPricingPage: React.FC = () => {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<ParkingLocation | null>(null);

  const [hourlyRate, setHourlyRate] = useState(50);
  const [peakRate, setPeakRate] = useState(70);
  const [weekendRate, setWeekendRate] = useState(60);
  const [dailyRate, setDailyRate] = useState(300);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getPartnerLocations().then(res => {
      setLocations(res.locations);
      if (res.locations.length > 0) {
        const first = res.locations[0];
        setSelectedLoc(first);
        setHourlyRate(first.hourly_rate);
        setPeakRate(first.peak_rate);
        setWeekendRate(first.weekend_rate);
        setDailyRate(first.daily_rate);
      }
    });
  }, []);

  const handleSelectLocation = (loc: ParkingLocation) => {
    setSelectedLoc(loc);
    setHourlyRate(loc.hourly_rate);
    setPeakRate(loc.peak_rate);
    setWeekendRate(loc.weekend_rate);
    setDailyRate(loc.daily_rate);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;
    try {
      setIsSaving(true);
      await api.updatePartnerLocation(selectedLoc.id, {
        hourly_rate: Number(hourlyRate),
        peak_rate: Number(peakRate),
        weekend_rate: Number(weekendRate),
        daily_rate: Number(dailyRate),
      });
      showToast('Dynamic pricing tier saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update pricing', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          Dynamic Pricing Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure base hourly rates, rush hour surge pricing, weekend premiums, and 24-hour daily max caps.
        </p>
      </div>

      {/* Facility Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {locations.map((l) => (
          <button
            key={l.id}
            onClick={() => handleSelectLocation(l)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              selectedLoc?.id === l.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pricing Form */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6">
          <h2 className="font-heading font-bold text-base text-white">
            Configuring Rates for: {selectedLoc?.name}
          </h2>

          <form onSubmit={handleSavePricing} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Normal Base Rate */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase">
                  Standard Hourly Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-black text-lg focus:outline-hidden"
                    required
                  />
                  <span className="text-slate-400 font-semibold">/hr</span>
                </div>
                <p className="text-[10px] text-slate-500">Standard weekday off-peak rate</p>
              </div>

              {/* Peak Rate */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-amber-400 uppercase">
                  Peak-Hour Surge Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={peakRate}
                    onChange={(e) => setPeakRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-400 font-black text-lg focus:outline-hidden"
                    required
                  />
                  <span className="text-slate-400 font-semibold">/hr</span>
                </div>
                <p className="text-[10px] text-slate-500">Applies during 08:00-11:00 & 17:00-21:00</p>
              </div>

              {/* Weekend Rate */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-indigo-400 uppercase">
                  Weekend Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={weekendRate}
                    onChange={(e) => setWeekendRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-300 font-black text-lg focus:outline-hidden"
                    required
                  />
                  <span className="text-slate-400 font-semibold">/hr</span>
                </div>
                <p className="text-[10px] text-slate-500">Applies on Saturdays and Sundays</p>
              </div>

              {/* Daily Pass Max Cap */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase">
                  Full Day Max Cap (24 hrs)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-emerald-400 font-black text-lg focus:outline-hidden"
                    required
                  />
                  <span className="text-slate-400 font-semibold">/day</span>
                </div>
                <p className="text-[10px] text-slate-500">Maximum cap for 24-hour overnight stay</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Apply Dynamic Pricing'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Customer Preview */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Customer Checkout Preview
          </span>
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Normal 2hr Stay</span>
              <span className="font-bold text-white">₹{hourlyRate * 2}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Peak 2hr Stay</span>
              <span className="font-bold text-amber-400">₹{peakRate * 2}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Weekend 4hr Stay</span>
              <span className="font-bold text-indigo-300">₹{weekendRate * 4}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
              <span className="text-slate-300">Overnight Day Pass</span>
              <span className="text-emerald-400">₹{dailyRate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
