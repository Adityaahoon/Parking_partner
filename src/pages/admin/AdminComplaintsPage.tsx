import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminComplaintsPage: React.FC = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminComplaints();
      setComplaints(res.complaints);
    } catch (err) {
      showToast('Failed to load complaints', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateAdminComplaint(id, newStatus);
      showToast(`Complaint status marked as ${newStatus}`, 'success');
      fetchComplaints();
    } catch (err) {
      showToast('Failed to update complaint', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Driver Complaints & Support Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Resolve user dispute tickets, hardware barrier malfunctions, and charger issues.
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="bg-slate-950 rounded-3xl p-12 text-center border border-slate-800 text-slate-500 text-xs">
            No open driver complaints. Everything is operating smoothly.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Ticket ID: {c.id}</span>
                  <h3 className="font-heading font-bold text-base text-white">{c.subject}</h3>
                  <span className="text-xs text-slate-400">Raised by: {c.user_name} • Booking: {c.booking_id || 'N/A'}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  c.status === 'RESOLVED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : c.status === 'INVESTIGATING'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                {c.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-[11px] text-slate-500">
                  Logged on {new Date(c.created_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {c.status !== 'INVESTIGATING' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'INVESTIGATING')}
                      className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition border border-amber-500/30"
                    >
                      Investigate
                    </button>
                  )}
                  {c.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(c.id, 'RESOLVED')}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                    >
                      Resolve Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
