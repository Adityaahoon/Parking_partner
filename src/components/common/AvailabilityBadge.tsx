import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface AvailabilityBadgeProps {
  availableSlots: number;
  totalSlots: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  availableSlots,
  totalSlots,
  size = 'md',
  showCount = true,
}) => {
  let status: 'available' | 'limited' | 'full' = 'available';
  if (availableSlots === 0) {
    status = 'full';
  } else if (availableSlots <= 5 || availableSlots / totalSlots <= 0.2) {
    status = 'limited';
  }

  const isFull = status === 'full';
  const isLimited = status === 'limited';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${sizeClasses} ${
        isFull
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : isLimited
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
      }`}
    >
      <span className="relative flex">
        <span
          className={`animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isFull ? 'bg-rose-400' : isLimited ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full ${dotSize} ${
            isFull ? 'bg-rose-500' : isLimited ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
      </span>

      <span>
        {isFull
          ? 'Full'
          : isLimited
          ? showCount
            ? `${availableSlots} spots left (Fast filling)`
            : 'Limited Availability'
          : showCount
          ? `${availableSlots} spots available`
          : 'Available'}
      </span>
    </div>
  );
};
