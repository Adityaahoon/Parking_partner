import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  ExternalLink,
  ShieldCheck,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminPartnersPage: React.FC = () => {
  const { showToast } = useToast();
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminPartners();
      setPartners(res.partners);
    } catch (err) {
      showToast('Failed to load partner verifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleVerify = async (partnerId: string, status: string) => {
    try {
      await api.verifyAdminPartner(partnerId, status);
      showToast(`Partner status updated to ${status}!`, 'success');
      setSelectedPartner(null);
      fetchPartners();
    } catch (err) {
      showToast('Failed to update partner verification', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Partner Verification Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted operator licenses, facility ownership records, and grant live production access.
          </p>
        </div>

        <button
          onClick={fetchPartners}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((p) => {
          const isPending = p.verification_status === 'PENDING' || p.verification_status === 'UNDER_REVIEW';

          return (
            <div
              key={p.id}
              className={`bg-slate-950 rounded-3xl p-6 border transition-all space-y-4 shadow-sm ${
                isPending ? 'border-amber-500/50 shadow-amber-500/5' : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-white">{p.business_name}</h3>
                  <span className="text-xs text-slate-400">{p.business_type}</span>
                </div>
                <StatusBadge status={p.verification_status} type="verification" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Owner / Contact</span>
                  <span className="font-bold text-slate-200 block">{p.owner_name}</span>
                  <span className="text-[11px] text-slate-400">{p.contact_phone || p.owner_phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Managed Capacity</span>
                  <span className="font-bold text-amber-400 block">{p.total_facilities} Facilities</span>
                  <span className="text-[11px] text-slate-400">{p.total_capacity} Slots</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-500 font-mono">
                  Tax GST: {p.tax_id || 'GSTIN33AAACP1234F1Z5'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPartner(p)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Docs</span>
                  </button>

                  {isPending && (
                    <button
                      onClick={() => handleVerify(p.id, 'VERIFIED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Document Inspection Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden text-slate-200 font-sans">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">
                  Compliance Audit: {selectedPartner.business_name}
                </h3>
                <span className="text-xs text-slate-400">ID: {selectedPartner.id}</span>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Document Image Preview */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={selectedPartner.document_url || '/images/locations/airport_t2.jpg'}
                  alt="Commercial License Certificate"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-[11px] font-bold">
                    Official Facility Trade License & Fire Safety Certificate
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Holder</span>
                  <span className="font-bold text-white">{selectedPartner.owner_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Account</span>
                  <span className="font-mono text-white">{selectedPartner.bank_account || '91823000492812'} ({selectedPartner.ifsc_code || 'HDFC0001234'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status</span>
                  <StatusBadge status={selectedPartner.verification_status} type="verification" />
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVerify(selectedPartner.id, 'REJECTED')}
                  className="w-full py-2.5 rounded-xl border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 font-bold transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </button>
                <button
                  onClick={() => handleVerify(selectedPartner.id, 'VERIFIED')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Grant Live Access</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
