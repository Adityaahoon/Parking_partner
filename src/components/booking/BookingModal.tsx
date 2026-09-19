import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Calendar,
  Clock,
  Car,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Plus,
  QrCode,
  Lock,
  Smartphone,
  Building
} from 'lucide-react';
import { ParkingLocation, Vehicle, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { DigitalParkingPass } from './DigitalParkingPass';

interface BookingModalProps {
  location: ParkingLocation;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  location,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);

  // New vehicle form
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState<'CAR' | 'SUV' | 'BIKE'>('CAR');

  // Booking parameters
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [arrivalTime, setArrivalTime] = useState('14:00');
  const [durationHours, setDurationHours] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING' | 'WALLET'>('UPI');
  const [upiId, setUpiId] = useState('aditya@oksbi');

  // Submission & Confirmation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load vehicles
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      api.getVehicles()
        .then(res => {
          setVehicles(res.vehicles);
          if (res.vehicles.length > 0) {
            setSelectedVehicle(res.vehicles.find(v => v.is_primary) || res.vehicles[0]);
          } else {
            setIsAddingVehicle(true);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">Sign in to Reserve</h3>
          <p className="text-xs text-slate-500 mb-6">
            Please log in or create an account to reserve your parking spot at {location.name}.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { onClose(); openAuthModal('login'); }}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md"
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fees calculation
  const parkingFee = location.hourly_rate * durationHours;
  const serviceFee = 10.0;
  const taxFee = Math.round(parkingFee * 0.05 * 100) / 100;
  const totalAmount = parkingFee + serviceFee + taxFee;

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleNumber || !newVehicleModel) {
      showToast('Please enter vehicle number and model', 'warning');
      return;
    }

    try {
      const res = await api.addVehicle({
        vehicleNumber: newVehicleNumber,
        vehicleModel: newVehicleModel,
        vehicleType: newVehicleType,
        isPrimary: 1
      });
      setVehicles(prev => [res.vehicle, ...prev]);
      setSelectedVehicle(res.vehicle);
      setIsAddingVehicle(false);
      setNewVehicleNumber('');
      setNewVehicleModel('');
      showToast('Vehicle added successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add vehicle', 'error');
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedVehicle) {
      showToast('Please select a vehicle', 'warning');
      setStep(2);
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate 1.2s bank verification
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.createBooking({
        locationId: location.id,
        vehicleNumber: selectedVehicle.vehicle_number,
        vehicleModel: selectedVehicle.vehicle_model,
        vehicleType: selectedVehicle.vehicle_type,
        bookingDate,
        arrivalTime,
        durationHours,
        paymentMethod
      });

      setConfirmedBooking(res.booking);
      setStep(5);

      // Trigger Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast('Parking spot reserved successfully!', 'success');
      if (onBookingSuccess) onBookingSuccess(res.booking);
    } catch (err: any) {
      showToast(err.message || 'Payment or reservation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                {step === 5 ? 'Booking Confirmed' : `Reserve at ${location.name}`}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 1 && 'Step 1 of 4: Schedule & Time'}
                {step === 2 && 'Step 2 of 4: Select Vehicle'}
                {step === 3 && 'Step 3 of 4: Review Summary'}
                {step === 4 && 'Step 4 of 4: Secure Payment'}
                {step === 5 && 'Your Digital Parking Pass is Ready'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden shadow-xs"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Duration
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-hidden shadow-xs"
                  >
                    <option value={1}>1 Hour (₹{location.hourly_rate * 1})</option>
                    <option value={2}>2 Hours (₹{location.hourly_rate * 2})</option>
                    <option value={3}>3 Hours (₹{location.hourly_rate * 3})</option>
                    <option value={4}>4 Hours (₹{location.hourly_rate * 4})</option>
                    <option value={8}>8 Hours (₹{location.hourly_rate * 8})</option>
                    <option value={24}>Full Day (₹{location.daily_rate})</option>
                  </select>
                </div>
              </div>

              {/* Quick Rate Banner */}
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-brand-900 font-bold block">Rate tier: Standard Hourly</span>
                  <span className="text-brand-700">₹{location.hourly_rate}/hr • Free cancellation up to 15m prior</span>
                </div>
                <span className="font-extrabold text-base text-brand-700">₹{parkingFee}</span>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Continue to Vehicle Selection</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Vehicle Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Your Vehicle
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                  className="text-xs text-brand-600 font-semibold hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingVehicle ? 'View Saved' : 'Add New Vehicle'}
                </button>
              </div>

              {isAddingVehicle ? (
                <form onSubmit={handleAddVehicle} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900">Add Vehicle Details</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Plate Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TN 07 CB 4920"
                      value={newVehicleNumber}
                      onChange={(e) => setNewVehicleNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 uppercase font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Model / Make</label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Nexon EV / Hyundai Creta"
                      value={newVehicleModel}
                      onChange={(e) => setNewVehicleModel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CAR', 'SUV', 'BIKE'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewVehicleType(t)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                            newVehicleType === t
                              ? 'bg-brand-600 text-white border-brand-600'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition"
                  >
                    Save & Use Vehicle
                  </button>
                </form>
              ) : (
                <div className="space-y-2.5">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicle?.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-400/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-sm text-slate-900 block">
                              {v.vehicle_number}
                            </span>
                            <span className="text-xs text-slate-500">
                              {v.vehicle_model} • {v.vehicle_type}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-600" />}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => {
                  if (!selectedVehicle) {
                    showToast('Please select or add a vehicle', 'warning');
                    return;
                  }
                  setStep(3);
                }}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Summary Breakdown */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Location</span>
                  <span className="font-bold text-slate-900 text-right">{location.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Schedule</span>
                  <span className="font-semibold text-slate-800">{bookingDate} @ {arrivalTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-800">{durationHours} Hour(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-mono font-bold text-slate-800">{selectedVehicle?.vehicle_number}</span>
                </div>
              </div>

              {/* Price Breakdown Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Parking Fee ({durationHours} hrs × ₹{location.hourly_rate})</span>
                  <span className="font-medium">₹{parkingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Convenience & FastPass Fee</span>
                  <span className="font-medium">₹{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%)</span>
                  <span className="font-medium">₹{taxFee.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-slate-900">Total Payable</span>
                  <span className="font-black text-xl text-emerald-700">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Payment Gateway Mock */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Safe 256-bit Encrypted Checkout</span>
                    <span className="text-[10px] text-emerald-700">Instant refund guarantee</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-800">₹{totalAmount.toFixed(2)}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                {[
                  { id: 'UPI', label: 'UPI / Google Pay / PhonePe', icon: Smartphone, desc: 'Zero surcharge • Fast authorization' },
                  { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                  { id: 'NET_BANKING', label: 'Net Banking', icon: Building, desc: 'All Indian Banks supported' },
                  { id: 'WALLET', label: 'Parking Partner Wallet', icon: QrCode, desc: 'Balance: ₹500.00' },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-400/30'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{m.label}</span>
                          <span className="text-[10px] text-slate-500">{m.desc}</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {paymentMethod === 'UPI' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enter VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
                    placeholder="e.g. yourname@oksbi"
                  />
                </div>
              )}

              <button
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing & Allocating Slot...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalAmount.toFixed(2)} & Reserve Spot</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: Digital Parking Pass View */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-4">
              <DigitalParkingPass
                booking={confirmedBooking}
                onStartSession={async () => {
                  try {
                    await api.startSession(confirmedBooking.id);
                    showToast('Active parking session started!', 'success');
                    onClose();
                  } catch (e: any) {
                    showToast(e.message || 'Could not start session', 'error');
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
