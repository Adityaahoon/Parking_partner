import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Car,
  ShieldCheck,
  Zap,
  CreditCard,
  QrCode,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  Building2,
  CheckCircle2,
  Navigation,
  Compass,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();

  const [destination, setDestination] = useState('');
  const [selectedCity, setSelectedCity] = useState('Chennai');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(destination)}&city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text & Search */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-bold tracking-wide shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Next-Gen Smart Urban Mobility Platform 2026</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-[1.1]">
                Parking made <span className="text-brand-600 underline decoration-brand-300 decoration-wavy">simple.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Find, reserve and pay for guaranteed parking before you arrive. Real-time availability, dynamic QR passes, and zero circling around the block.
              </p>

              {/* Main Search Component */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-200/90 max-w-xl mx-auto lg:mx-0 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-8 relative">
                    <MapPin className="w-4 h-4 text-brand-600 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Where do you want to park? (e.g. Marina Beach, Phoenix Mall)"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                    >
                      <option value="Chennai">Chennai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Parking Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signup', 'PARTNER')}
                    className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>List Parking</span>
                  </button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Popular:</span>
                {['Marina Beach', 'Phoenix Mall', 'Chennai Central', 'Airport T2', 'Anna Nagar'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/search?search=${encodeURIComponent(tag)}`)}
                    className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition shadow-2xs font-medium"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual: Simulated Live Map with Floating Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900">
                {/* Visual Map Background */}
                <img
                  src="/images/locations/phoenix_mall.jpg"
                  alt="Live Mobility Map"
                  className="w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

                {/* Pulsing Central Target */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-brand-500/30 animate-ping absolute" />
                  <div className="w-10 h-10 rounded-full bg-brand-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-xs">
                    YOU
                  </div>
                </div>

                {/* Floating Live Card 1 */}
                <div className="absolute top-6 left-6 right-16 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/60 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">City Center Parking</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      12 spots left
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Navigation className="w-3 h-3 text-brand-600" /> 0.3 km away
                    </span>
                    <span className="font-black text-slate-900 text-xs">₹40/hr</span>
                  </div>
                </div>

                {/* Floating Live Card 2 */}
                <div className="absolute bottom-6 left-8 right-8 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Phoenix Mall Smart Deck</span>
                        <span className="text-[10px] text-slate-300">Fast EV Chargers Available</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-400 text-xs">₹60/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="py-10 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <span className="font-heading font-black text-3xl sm:text-4xl text-brand-600 block">10K+</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">Live Parking Spots</span>
            </div>
            <div className="p-4">
              <span className="font-heading font-black text-3xl sm:text-4xl text-slate-900 block">50K+</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">Successful Bookings</span>
            </div>
            <div className="p-4">
              <span className="font-heading font-black text-3xl sm:text-4xl text-emerald-600 block">100+</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">Verified Partner Hubs</span>
            </div>
            <div className="p-4">
              <span className="font-heading font-black text-3xl sm:text-4xl text-amber-500 block">4.8 / 5</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 block">Driver Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (4 Simple Steps) */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 block mb-2">
              Seamless 4-Step Journey
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
              How Parking Partner Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From finding a spot to contactless exit in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Search',
                desc: 'Enter your destination or use live GPS to discover all nearby commercial & private parking facilities.',
                icon: Search,
                color: 'bg-blue-50 text-blue-600 border-blue-200'
              },
              {
                step: '02',
                title: 'Compare',
                desc: 'Compare hourly rates, live vacancy indicators, EV charging, CCTV security, and reviews.',
                icon: Compass,
                color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
              },
              {
                step: '03',
                title: 'Reserve',
                desc: 'Lock your slot in advance. Get an instant digital parking pass with dynamic QR barrier access.',
                icon: Calendar,
                color: 'bg-purple-50 text-purple-600 border-purple-200'
              },
              {
                step: '04',
                title: 'Park & Pay',
                desc: 'Navigate straight to your bay, scan QR to open gates, track active time, and pay digitally.',
                icon: QrCode,
                color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 relative group"
                >
                  <span className="text-4xl font-black text-slate-100 absolute top-4 right-4 group-hover:text-brand-50 transition-colors">
                    {item.step}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 block mb-2">
              Engineered For Modern Commuters
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-900">
              Everything You Need on the Road
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-Time Availability',
                desc: 'Never reach a full lot again. Dynamic green, orange, and red indicators give you 100% accurate slot counts.',
                icon: Clock
              },
              {
                title: 'FastPass QR Parking',
                desc: 'Automated barrier gate integration with high-fidelity digital passes on your mobile phone.',
                icon: QrCode
              },
              {
                title: 'Unified Digital Payments',
                desc: 'Pay seamlessly via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet.',
                icon: CreditCard
              },
              {
                title: 'Live Navigation Directions',
                desc: 'Turn-by-turn route guidance right into the dedicated parking ramp and reserved slot bay.',
                icon: Navigation
              },
              {
                title: 'Verified 24/7 Security',
                desc: 'All parking hubs are physically verified with CCTV surveillance, security guards, and well-lit bays.',
                icon: ShieldCheck
              },
              {
                title: 'Spending History & Analytics',
                desc: 'Track parking receipts, monthly expense charts, GST invoices, and manage saved multi-vehicles.',
                icon: TrendingUp
              }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FOR PARKING PARTNERS SECTION */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
                FOR FACILITY OWNERS & OPERATORS
              </span>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                Turn your parking spaces into a high-yield revenue stream.
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Connect your commercial garage, mall deck, corporate campus, or open lot to the Parking Partner network. Automate bookings, manage slots in real time, and maximize occupancy with dynamic peak pricing.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-2xl font-black text-amber-400">+42%</span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Average Occupancy Boost</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-2xl font-black text-emerald-400">100%</span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Digital Payouts & Invoicing</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => openAuthModal('signup', 'PARTNER')}
                  className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Become a Parking Partner</span>
                </button>
                <button
                  onClick={() => navigate('/partner/overview')}
                  className="py-3.5 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20 flex items-center justify-center gap-2"
                >
                  <span>Explore Partner Demo Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="font-heading font-bold text-lg text-white">Partner Benefits</h3>
              {[
                'Interactive live slot matrix & status management',
                'Dynamic surge and weekend hourly pricing engine',
                'Automated QR scanning ticketless barrier entries',
                'Daily bank settlements with 0% hidden deductions',
                'Detailed analytics on peak hours and vehicle trends',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black">
                P
              </div>
              <span className="font-heading font-extrabold text-base">Parking Partner</span>
            </div>
            <p className="text-xs text-slate-400">
              “Your spot. Your time. Your way.” Modern smart parking and urban mobility platform.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Discover</h4>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/search?city=Chennai')} className="hover:text-white">Chennai Parking</button></li>
              <li><button onClick={() => navigate('/search?city=Bengaluru')} className="hover:text-white">Bengaluru Parking</button></li>
              <li><button onClick={() => navigate('/search?ev_charging=true')} className="hover:text-white">EV Charging Hubs</button></li>
              <li><button onClick={() => navigate('/search?valet=true')} className="hover:text-white">Valet Garages</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Partners & Business</h4>
            <ul className="space-y-2">
              <li><button onClick={() => openAuthModal('signup', 'PARTNER')} className="hover:text-white">List Your Facility</button></li>
              <li><button onClick={() => navigate('/partner/overview')} className="hover:text-white">Partner Operator Console</button></li>
              <li><button onClick={() => navigate('/admin/dashboard')} className="hover:text-white">Platform Admin Panel</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Demo Accounts</h4>
            <div className="space-y-1.5 text-[11px]">
              <p><span className="text-slate-200 font-semibold">Customer:</span> user@parkingpartner.demo</p>
              <p><span className="text-slate-200 font-semibold">Partner:</span> partner@parkingpartner.demo</p>
              <p><span className="text-slate-200 font-semibold">Admin:</span> admin@parkingpartner.demo</p>
              <p className="text-slate-500 mt-2">Password for all: <code className="text-slate-300">password123</code></p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-slate-500">
          © 2026 Parking Partner Technologies Ltd. Built for production excellence.
        </div>
      </footer>
    </div>
  );
};
