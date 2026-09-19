import React, { useState, useEffect } from 'react';
import { Play, Clock, ChevronRight, MapPin } from 'lucide-react';
import { ParkingSession } from '../../types';
import { api } from '../../services/api';
import { ActiveSessionModal } from './ActiveSessionModal';
import { useAuth } from '../../context/AuthContext';

export const ActiveSessionBar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeSession, setActiveSession] = useState<ParkingSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSession = async () => {
    if (!isAuthenticated) {
      setActiveSession(null);
      return;
    }
    try {
      const res = await api.getActiveSession();
      setActiveSession(res.session);
    } catch (e) {
      setActiveSession(null);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!activeSession) return null;

  return (
    <>
      <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-lg w-[92%] sm:w-auto">
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-4 cursor-pointer hover:bg-black transition-all transform hover:-translate-y-0.5 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-400">ACTIVE SESSION</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-xs font-bold text-slate-200 line-clamp-1 block">
                {activeSession.location_name} • Slot {activeSession.slot_number || 'A-01'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors whitespace-nowrap">
              Manage Session
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      <ActiveSessionModal
        session={activeSession}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionEnded={() => {
          setActiveSession(null);
          setIsModalOpen(false);
        }}
        onSessionExtended={fetchSession}
      />
    </>
  );
};
