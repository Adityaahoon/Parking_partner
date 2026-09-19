import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const PartnerReviewsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getPartnerReviews()
      .then(res => setData(res))
      .catch(() => showToast('Failed to load reviews', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { reviews, totalReviews, avgRating, ratingBreakdown } = data;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
          Customer Reviews & Satisfaction
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor driver ratings and feedback across all your managed parking facilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rating Summary Card */}
        <div className="lg:col-span-4 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="text-center">
            <span className="font-heading font-black text-5xl text-white block">{avgRating}</span>
            <div className="flex items-center justify-center gap-1 my-2 text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-slate-400">Based on {totalReviews} driver ratings</span>
          </div>

          {/* Star Breakdown Progress Bars */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingBreakdown?.[stars] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-2 text-slate-300">
                  <span className="w-8 font-semibold">{stars} ★</span>
                  <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-500 text-[11px]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews Stream */}
        <div className="lg:col-span-8 bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="font-heading font-bold text-base text-white">Recent Driver Feedback</h2>

          {reviews.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No customer reviews recorded yet.
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-900">
              {reviews.map((r: any) => (
                <div key={r.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                        {r.user_name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{r.user_name}</span>
                        <span className="text-[10px] text-slate-400">{r.location_name}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      {r.rating}.0
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
