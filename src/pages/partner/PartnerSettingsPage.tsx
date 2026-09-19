import React, { useState, useEffect } from 'react';
import {
  Building2,
  CreditCard,
  Phone,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const PartnerSettingsPage: React.FC = () => {
  const { partner, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState(partner?.business_name || '');
  const [businessType, setBusinessType] = useState(partner?.business_type || 'Multi-Level Commercial Facility');
  const [contactPhone, setContactPhone] = useState(partner?.contact_phone || '');
  const [bankAccount, setBankAccount] = useState(partner?.bank_account || '91823000492812');
  const [ifscCode, setIfscCode] = useState(partner?.ifsc_code || 'HDFC0001234');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setBusinessName(partner.business_name);
      setBusinessType(partner.business_type);
      setContactPhone(partner.contact_phone || '');
      setBankAccount(partner.bank_account || '');
      setIfscCode(partner.ifsc_code || '');
    }
  }, [partner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updatePartnerSettings({
        business_name: businessName,
        business_type: businessType,
        contact_phone: contactPhone,
        bank_account: bankAccount,
        ifsc_code: ifscCode,
      });
      await refreshUser();
      showToast('Partner settings & payout details saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          Partner Profile & Settlement Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your business credentials, banking details for direct revenue payouts, and operational policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Business Profile */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Business Entity Information</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Company / Legal Trade Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Facility Type</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                >
                  <option value="Multi-Level Commercial Facility">Multi-Level Commercial Facility</option>
                  <option value="Shopping Mall Deck">Shopping Mall Deck</option>
                  <option value="Airport Parking Authority">Airport Parking Authority</option>
                  <option value="Open Ground / Valet Lot">Open Ground / Valet Lot</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Operator Helpline Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Banking & Settlement Details */}
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Direct Payout & Bank Settlement Details</span>
          </h2>
          <p className="text-slate-400 text-xs">
            Daily booking collections (minus 5% platform fee) will be automatically wired to this account every midnight.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Bank Account Number</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="e.g. 50100482910394"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono uppercase font-bold"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save Partner Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
