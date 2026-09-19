import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Calendar,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminUsers({
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined
      });
      setUsers(res.users);
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change ${user.name}'s status to ${newStatus}?`)) return;

    try {
      await api.updateAdminUserStatus(user.id, newStatus);
      showToast(`User status updated to ${newStatus}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            User & Driver Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search registered users, inspect booking frequency, total volume, and account access statuses.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2">
          {['ALL', 'CUSTOMER', 'PARTNER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                roleFilter === r
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">User Details</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Total Bookings</th>
                <th className="px-6 py-3.5">Gross Spend</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-[11px] text-slate-500">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : u.role === 'PARTNER'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : 'bg-brand-950/60 text-brand-400 border border-brand-800/40'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{u.phone || '—'}</td>
                  <td className="px-6 py-4 font-bold text-white">{u.total_bookings} Bookings</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">₹{Number(u.total_spent).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition border ${
                          u.status === 'ACTIVE'
                            ? 'border-rose-800/60 text-rose-400 hover:bg-rose-950/40'
                            : 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
