import React, { useState, useEffect } from "react";
import { Send, Trash2, RefreshCw, Megaphone, Calendar } from "lucide-react";
import { apiClient } from "../api";
import type { Notice } from "../types";

export default function NoticeManager({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadNotices = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/notices");
      setNotices(data);
    } catch (err) {
      console.error("নটিশ লোড করতে ব্যর্থ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotices(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      await apiClient.post("/notices", { subject: subject.trim(), content: content.trim() });
      setSubject("");
      setContent("");
      setSuccessMsg("✅ নটিশ সফলভাবে প্রকাশিত হয়েছে!");
      setTimeout(() => setSuccessMsg(""), 4000);
      await loadNotices();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "নটিশ প্রকাশ করতে ব্যর্থ।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই নটিশটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;
    setDeleteLoading(id);
    try {
      await apiClient.delete(`/notices/${id}`);
      await loadNotices();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "মুছতে ব্যর্থ।");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">📢 নটিশ বোর্ড ম্যানেজমেন্ট</h2>
          <p className="text-xs text-slate-400 mt-1">নতুন নটিশ প্রকাশ করুন — তাৎক্ষণিকভাবে পাবলিক পেজে দেখা যাবে</p>
        </div>
        <button
          onClick={loadNotices}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 rounded-lg hover:bg-cyan-950 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          রিফ্রেশ
        </button>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-purple-300">নতুন নটিশ প্রকাশ করুন</h3>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">বিষয় (Subject)</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="নটিশের বিষয় লিখুন..."
            className="w-full px-4 py-2.5 bg-[#05070f]/45 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/20"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">বিস্তারিত (Details)</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="নটিশের বিস্তারিত বর্ণনা লিখুন..."
            rows={5}
            className="w-full px-4 py-2.5 bg-[#05070f]/45 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/20 resize-y"
            required
          />
        </div>

        {successMsg && (
          <p className="text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/20 px-3 py-2 rounded-lg">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !subject.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50"
        >
          {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
          এখনই প্রকাশ করুন
        </button>
      </form>

      {/* Existing Notices */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 mb-3">
          প্রকাশিত নটিশ ({notices.length})
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin text-slate-500 mx-auto" />
            <p className="text-xs text-slate-500 mt-2">লোড হচ্ছে...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
            <p className="text-sm text-slate-500">কোনো নটিশ প্রকাশিত হয়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(notice => (
              <div
                key={notice.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm mb-1">{notice.subject}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-3">
                      <Calendar size={10} />
                      {notice.createdAt}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    disabled={deleteLoading === notice.id}
                    className="flex-shrink-0 p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="মুছুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
