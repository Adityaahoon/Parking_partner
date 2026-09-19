import React from 'react';
import { BookingStatus, SlotStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | SlotStatus | string;
  type?: 'booking' | 'slot' | 'verification';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'booking' }) => {
  const normalized = (status || '').toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status;

  if (type === 'booking') {
    switch (normalized) {
      case 'CONFIRMED':
        colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        label = 'Confirmed';
        break;
      case 'ACTIVE':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold animate-pulse';
        label = 'Active Session';
        break;
      case 'COMPLETED':
        colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
        label = 'Completed';
        break;
      case 'CANCELLED':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Cancelled';
        break;
    }
  } else if (type === 'slot') {
    switch (normalized) {
      case 'AVAILABLE':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Available';
        break;
      case 'OCCUPIED':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Occupied';
        break;
      case 'RESERVED':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        label = 'Reserved';
        break;
      case 'MAINTENANCE':
        colorClasses = 'bg-slate-100 text-slate-500 border-slate-300';
        label = 'Maintenance';
        break;
    }
  } else if (type === 'verification') {
    switch (normalized) {
      case 'VERIFIED':
        colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        label = 'Verified Partner';
        break;
      case 'UNDER_REVIEW':
      case 'PENDING':
        colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
        label = 'Under Review';
        break;
      case 'REJECTED':
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
        label = 'Rejected';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${colorClasses}`}>
      {label}
    </span>
  );
};
