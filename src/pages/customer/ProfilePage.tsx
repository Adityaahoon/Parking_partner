import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Car,
  CreditCard,
  Bell,
  Shield,
  Trash2,
  Plus,
  CheckCircle2,
  Lock,
  LogOut,
  Save,
  Phone,
  Mail,
  Building2
} from 'lucide-react';
import { Vehicle } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, partner, logout, refreshUser, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Personal Info Form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<'CAR' | 'SUV' | 'BIKE'>('CAR');

  // Preferences
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [notifExpiry, setNotifExpiry] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      api.getVehicles()
        .then(res => setVehicles(res.vehicles))
        .catch(() => {});
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      await api.updateProfile({ name, phone });
      await refreshUser();
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber || !model) return;
    try {
      const res = await api.addVehicle({
        vehicleNumber: plateNumber,
        vehicleModel: model,
        vehicleType: type,
        isPrimary: vehicles.length === 0 ? 1 : 0
      });
      setVehicles(prev => [res.vehicle, ...prev]);
      setIsAddingVehicle(false);
      setPlateNumber('');
      setModel('');
      showToast('Vehicle added to your profile!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add vehicle', 'error');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Delete this vehicle from your profile?')) return;
    try {
      await api.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      showToast('Vehicle deleted', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vehicle', 'error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
          <User className="w-12 h-12 text-brand-600 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900">Sign in to Access Profile</h3>
          <button onClick={() => openAuthModal('login')} className="mt-4 w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
          User Account & Vehicle Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, registered vehicles, and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="w-full h-full rounded-full object-cover border-4 border-brand-50 shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-lg text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              {user.role} Account
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {user.role === 'PARTNER' && (
              <button
                onClick={() => navigate('/partner/overview')}
                className="w-full py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Partner Console</span>
              </button>
            )}

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Side Settings Panels */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registered Vehicles Manager */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-brand-600" />
                <span>My Registered Vehicles</span>
              </h3>
              <button
                onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                className="text-xs text-brand-600 font-bold hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingVehicle ? 'Close Form' : 'Add Vehicle'}</span>
              </button>
            </div>

            {isAddingVehicle && (
              <form onSubmit={handleAddVehicle} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900">Add New Vehicle</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Plate Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TN 07 CB 4920"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 uppercase font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Make / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. Tata Nexon EV"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['CAR', 'SUV', 'BIKE'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-1.5 rounded-lg border font-bold text-xs ${
                          type === t ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold">
                  Save Vehicle
                </button>
              </form>
            )}

            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-slate-900 block">{v.vehicle_number}</span>
                      <span className="text-xs text-slate-500">{v.vehicle_model} • {v.vehicle_type}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVehicle(v.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Preferences */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-600" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Reservation Confirmations</span>
                  <span className="text-slate-500 text-[11px]">Instant SMS & app alerts on successful bookings</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifBookings}
                  onChange={(e) => setNotifBookings(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded-md"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Session Expiry Warnings (15 mins)</span>
                  <span className="text-slate-500 text-[11px]">Receive an alert before parking reservation ends</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifExpiry}
                  onChange={(e) => setNotifExpiry(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded-md"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
