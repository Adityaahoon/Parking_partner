import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm animate-pulse flex flex-col md:flex-row gap-4">
    <div className="w-full md:w-48 h-40 bg-slate-200 rounded-xl shrink-0" />
    <div className="flex-1 flex flex-col justify-between py-1">
      <div>
        <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2.5" />
        <div className="h-3.5 bg-slate-100 rounded w-1/2 mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-slate-100 rounded-full w-20" />
          <div className="h-6 bg-slate-100 rounded-full w-24" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-9 bg-slate-200 rounded-lg w-28" />
      </div>
    </div>
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
