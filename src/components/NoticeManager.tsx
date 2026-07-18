import React, { useState, useEffect } from "react";
import { Send, Trash2, RefreshCw, Megaphone, Calendar, ImageIcon, X } from "lucide-react";
import { apiClient } from "../api";
import type { Notice } from "../types";
import { compressImage } from "../lib/imageCompressor";

export default function NoticeManager({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const compressed = await compressImage(file, 1200);
      setImage(compressed);
      setImageFile(file);
      setImagePreview(compressed);
    } catch (err) {
      console.error("Image compress error:", err);
    } finally {
      setImageUploading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      await apiClient.post("/notices", { subject: subject.trim(), content: content.trim(), image: image });
      setSubject("");
      setContent("");
      setImage(null);
      setImageFile(null);
      setImagePreview(null);
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
          <p className="text-xs text-[#6B6B70] mt-1">নতুন নটিশ প্রকাশ করুন — তাৎক্ষণিকভাবে পাবলিক পেজে দেখা যাবে</p>
        </div>
        <button
          onClick={loadNotices}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          রিফ্রেশ
        </button>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={18} className="text-[#22242A]" />
          <h3 className="text-sm font-bold text-[#22242A]">নতুন নটিশ প্রকাশ করুন</h3>
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">বিষয় (Subject)</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="নটিশের বিষয় লিখুন..."
            className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">বিস্তারিত (Details)</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="নটিশের বিস্তারিত বর্ণনা লিখুন..."
            rows={5}
            className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20 resize-y"
            required
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">ছবি (ঐচ্ছিক)</label>
          {imagePreview ? (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-40 rounded-xl border border-[#E5E5EA]" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-[#22242A] text-white rounded-full shadow-md hover:bg-[#DC2626] transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl cursor-pointer hover:bg-[#F5F3EF]/80 transition-colors text-sm text-[#6B6B70]">
              <ImageIcon size={18} className="text-[#22242A]" />
              <span>{imageUploading ? 'সংকুচিত হচ্ছে...' : 'ছবি নির্বাচন করুন (webp/jpeg)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={imageUploading}
              />
            </label>
          )}
        </div>

        {successMsg && (
          <p className="text-xs text-[#22242A] font-bold bg-[#E5E5EA]/30 border border-[#E5E5EA] px-3 py-2 rounded-lg">
            {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !subject.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r bg-[#F5F3EF] bg-[#F5F3EF] hover:bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50"
        >
          {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
          এখনই প্রকাশ করুন
        </button>
      </form>

      {/* Existing Notices */}
      <div>
        <h3 className="text-sm font-bold text-[#22242A] mb-3">
          প্রকাশিত নটিশ ({notices.length})
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin text-[#6B6B70] mx-auto" />
            <p className="text-xs text-[#6B6B70] mt-2">লোড হচ্ছে...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-[#E5E5EA] rounded-2xl">
            <p className="text-sm text-[#6B6B70]">কোনো নটিশ প্রকাশিত হয়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(notice => (
              <div
                key={notice.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm mb-1">{notice.subject}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B70] mb-3">
                      <Calendar size={10} />
                      {notice.createdAt}
                    </div>
                    {notice.image && (
                      <img
                        src={notice.image}
                        alt="Notice"
                        className="max-h-48 w-full object-contain rounded-xl mb-3 border border-[#E5E5EA]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <p className="text-sm text-[#22242A] leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    disabled={deleteLoading === notice.id}
                    className="flex-shrink-0 p-2 text-[#6B6B70] hover:text-[#FF6B6B] hover:bg-[#F5F3EF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
