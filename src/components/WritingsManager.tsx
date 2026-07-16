import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Trash2, RefreshCw, Filter, Paperclip } from "lucide-react";
import { apiClient } from "../api";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  attachmentPath: string | null;
  status: string;
  createdAt: string;
}

export default function WritingsManager({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "rejected">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/submissions");
      setSubmissions(data);
    } catch (err) {
      console.error("তথ্য লোড করতে ব্যর্থ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubmissions(); }, []);

  const handleStatusUpdate = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await apiClient.put(`/submissions/${id}/status`, { status });
      await loadSubmissions();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "স্ট্যাটাস আপডেট করতে ব্যর্থ।");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = submissions.filter(s => filter === "all" ? true : s.status === filter);
  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const reviewedCount = submissions.filter(s => s.status === "reviewed").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;

  const statusColors: Record<string, string> = {
    pending: "text-[#FACC15] bg-[#F5F3EF] border-[#E5E5EA]",
    reviewed: "text-[#22242A] bg-[#F5F3EF] border-[#E5E5EA]",
    rejected: "text-[#FF6B6B] bg-[#F5F3EF] border-[#E5E5EA]",
  };
  const statusLabels: Record<string, string> = {
    pending: "অপেক্ষমাণ",
    reviewed: "পর্যালোচিত",
    rejected: "বাতিল",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">✍️ লেখা ও অভিযোগ ম্যানেজমেন্ট</h2>
          <p className="text-xs text-[#6B6B70] mt-1">পাবলিকদের পাঠানো লেখা, অভিযোগ বা পরামর্শ পর্যালোচনা করুন</p>
        </div>
        <button
          onClick={loadSubmissions}
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
          { label: "পর্যালোচিত", count: reviewedCount, color: "text-[#22242A] bg-[#E5E5EA]/30 border-[#E5E5EA]" },
          { label: "বাতিল", count: rejectedCount, color: "text-[#FF6B6B] bg-[#F5F3EF] border-[#E5E5EA]" },
        ].map(s => (
          <div key={s.label} className={`p-3 rounded-xl border text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending", "reviewed", "rejected", "all"] as const).map(f => (
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
            {f === "all" ? "সবগুলো" : statusLabels[f]} ({f === "all" ? submissions.length : f === "pending" ? pendingCount : f === "reviewed" ? reviewedCount : rejectedCount})
          </button>
        ))}
      </div>

      {/* Submission Cards */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw size={24} className="animate-spin text-[#6B6B70] mx-auto" />
          <p className="text-xs text-[#6B6B70] mt-2">লোড হচ্ছে...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/[0.02] border border-[#E5E5EA] rounded-2xl">
          <p className="text-sm text-[#6B6B70]">কোনো তথ্য নেই</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(submission => (
            <div
              key={submission.id}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5E5EA]/40 text-[#22242A]">
                      {submission.category}
                    </span>
                    <h3 className="font-bold text-sm truncate">{submission.subject}</h3>
                  </div>
                  <p className="text-[10px] text-[#6B6B70] mt-1">
                    {submission.name} ({submission.email}) • {submission.createdAt}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[submission.status]}`}>
                  {statusLabels[submission.status]}
                </span>
              </div>

              {/* Content */}
              <p className="text-sm text-[#22242A] leading-relaxed mb-4 whitespace-pre-wrap">
                {submission.message}
              </p>

              {/* Attachment */}
              {submission.attachmentPath && (
                <div className="mb-4">
                  <a
                    href={submission.attachmentPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F7941D] bg-[#F7941D]/10 rounded-lg hover:bg-[#F7941D]/20 transition-colors"
                  >
                    <Paperclip size={14} /> ফাইলটি দেখুন
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {submission.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(submission.id, "reviewed")}
                      disabled={actionLoading === submission.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#E5E5EA]/40 text-[#22242A] border border-[#E5E5EA] rounded-lg hover:bg-[#E5E5EA] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> পর্যালোচনা সম্পন্ন
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(submission.id, "rejected")}
                      disabled={actionLoading === submission.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={13} /> বাতিল করুন
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
