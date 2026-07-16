import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Trash2, Star, RefreshCw, Clock, Filter } from "lucide-react";
import { apiClient } from "../api";
import type { Review } from "../types";

export default function ReviewManager({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/reviews");
      setReviews(data);
    } catch (err) {
      console.error("রিভিউ লোড করতে ব্যর্থ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.put(`/reviews/${id}/approve`, {});
      await loadReviews();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "অনুমোদন করতে ব্যর্থ।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await apiClient.put(`/reviews/${id}/reject`, {});
      await loadReviews();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "প্রত্যাখ্যান করতে ব্যর্থ।");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই রিভিউটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;
    setActionLoading(id);
    try {
      await apiClient.delete(`/reviews/${id}`);
      await loadReviews();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "মুছতে ব্যর্থ।");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter(r => filter === "all" ? true : r.status === filter);
  const pendingCount = reviews.filter(r => r.status === "pending").length;
  const approvedCount = reviews.filter(r => r.status === "approved").length;
  const rejectedCount = reviews.filter(r => r.status === "rejected").length;

  const statusColors: Record<string, string> = {
    pending: "text-[#FACC15] bg-[#F5F3EF] border-[#E5E5EA]",
    approved: "text-[#22242A] bg-[#F5F3EF] border-[#E5E5EA]",
    rejected: "text-[#FF6B6B] bg-[#F5F3EF] border-[#E5E5EA]",
  };
  const statusLabels: Record<string, string> = {
    pending: "অপেক্ষমাণ",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">📝 রিভিউ ম্যানেজমেন্ট</h2>
          <p className="text-xs text-[#6B6B70] mt-1">সদস্যদের জমাদানকৃত রিভিউ অনুমোদন বা প্রত্যাখ্যান করুন</p>
        </div>
        <button
          onClick={loadReviews}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          রিফ্রেশ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "অপেক্ষমাণ", count: pendingCount, color: "text-[#FACC15] bg-[#F5F3EF] border-[#E5E5EA]" },
          { label: "অনুমোদিত", count: approvedCount, color: "text-[#22242A] bg-[#E5E5EA]/30 border-[#E5E5EA]" },
          { label: "প্রত্যাখ্যাত", count: rejectedCount, color: "text-[#FF6B6B] bg-[#F5F3EF] border-[#E5E5EA]" },
        ].map(s => (
          <div key={s.label} className={`p-3 rounded-xl border text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
              filter === f
                ? "bg-[#F5F3EF] text-[#22242A] border-[#E5E5EA]"
                : "bg-transparent text-[#6B6B70] border-[#E5E5EA] hover:border-[#E5E5EA] hover:text-white"
            }`}
          >
            <Filter size={11} className="inline mr-1" />
            {f === "all" ? "সবগুলো" : statusLabels[f]} ({f === "all" ? reviews.length : f === "pending" ? pendingCount : f === "approved" ? approvedCount : rejectedCount})
          </button>
        ))}
      </div>

      {/* Review Cards */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={24} className="animate-spin text-[#6B6B70] mx-auto" />
          <p className="text-xs text-[#6B6B70] mt-2">লোড হচ্ছে...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.02] border border-[#E5E5EA] rounded-2xl">
          <p className="text-sm text-[#6B6B70]">কোনো রিভিউ নেই</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(review => (
            <div
              key={review.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{review.subject}</h3>
                  <p className="text-[10px] text-[#6B6B70] mt-0.5">
                    {review.memberName} (ফরম: {review.memberFormNumber}) • {review.createdAt}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[review.status]}`}>
                  {statusLabels[review.status]}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < review.rating ? "#F7941D" : "none"} stroke={i < review.rating ? "#F7941D" : "#475569"} />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm text-[#22242A] leading-relaxed mb-4 whitespace-pre-wrap">
                {review.content}
              </p>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {review.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#E5E5EA]/40 text-[#22242A] border border-[#E5E5EA] rounded-lg hover:bg-[#E5E5EA] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> অনুমোদন
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={13} /> প্রত্যাখ্যান
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actionLoading === review.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-[#6B6B70] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] hover:text-[#FF6B6B] hover:border-[#E5E5EA] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} /> মুছুন
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
