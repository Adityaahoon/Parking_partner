import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Car,
  ShieldCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    authModalRole,
    closeAuthModal,
    login,
    register,
    loginAsDemo
  } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'login' | 'signup'>(authModalTab);
  const [role, setRole] = useState<'CUSTOMER' | 'PARTNER'>(authModalRole);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        showToast('Welcome back!', 'success');
      } else {
        await register({
          name,
          email,
          phone,
          password,
          role,
          businessName: role === 'PARTNER' ? businessName : undefined
        });
        showToast('Account created successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: 'customer' | 'partner' | 'admin') => {
    try {
      setIsLoading(true);
      await loginAsDemo(demoRole);
      showToast(`Logged in as Demo ${demoRole.toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-xl text-slate-900">
              {tab === 'login' ? 'Welcome to Parking Partner' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tab === 'login' ? 'Find and reserve parking in seconds.' : 'Join thousands of smart drivers & operators.'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Demo Logins Banner */}
        <div className="bg-slate-900 text-slate-200 p-4 border-b border-slate-800">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-2">
            🚀 1-Click Demo Evaluation
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('customer')}
              className="px-2 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-xs text-center"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('partner')}
              className="px-2 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs text-center"
            >
              🏢 Partner
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="px-2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs text-center"
            >
              ⚡ Admin
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              tab === 'login'
                ? 'border-brand-600 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
              tab === 'signup'
                ? 'border-brand-600 text-brand-600 bg-brand-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('CUSTOMER')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'CUSTOMER'
                      ? 'bg-brand-50 border-brand-600 text-brand-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PARTNER')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'PARTNER'
                      ? 'bg-amber-50 border-amber-500 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Parking Partner</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Bhandari"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          {tab === 'signup' && role === 'PARTNER' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Business Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. PrimePark Infrastructure Ltd"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  required
                />
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@parkingpartner.demo"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In to Parking Partner' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
