import React, { useState, useEffect } from "react";
import { Send, Trash2, RefreshCw, Rss, Calendar, ImageIcon, X, ListFilter } from "lucide-react";
import { apiClient } from "../api";
import type { BlogPost } from "../types";
import { compressImage } from "../lib/imageCompressor";

export default function BlogManager({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"blog" | "news" | "event">("blog");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/blog_posts");
      setPosts(data);
    } catch (err) {
      console.error("পোস্ট লোড করতে ব্যর্থ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

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
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        image: image,
        eventDate: category === "event" && eventDate ? eventDate : null
      };
      await apiClient.post("/blog_posts", payload);
      setTitle("");
      setContent("");
      setEventDate("");
      setCategory("blog");
      setImage(null);
      setImageFile(null);
      setImagePreview(null);
      setSuccessMsg("✅ পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
      setTimeout(() => setSuccessMsg(""), 4000);
      await loadPosts();
      onRefreshStats?.();
    } catch (err: any) {
      alert(err.message || "পোস্ট প্রকাশ করতে ব্যর্থ।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;
    setDeleteLoading(id);
    try {
      await apiClient.delete(`/blog_posts/${id}`);
      await loadPosts();
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
          <h2 className="text-lg sm:text-xl font-bold">📰 সংবাদ ও ইভেন্ট ম্যানেজমেন্ট</h2>
          <p className="text-xs text-[#6B6B70] mt-1">নতুন ব্লগ, সংবাদ বা ইভেন্ট প্রকাশ করুন</p>
        </div>
        <button
          onClick={loadPosts}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] rounded-lg hover:bg-[#F5F3EF] transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          রিফ্রেশ
        </button>
      </div>

      {/* Post Form */}
      <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Rss size={18} className="text-[#22242A]" />
          <h3 className="text-sm font-bold text-[#22242A]">নতুন পোস্ট প্রকাশ করুন</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">ক্যাটাগরি</label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm appearance-none focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20"
              >
                <option value="blog">ব্লগ (Blog)</option>
                <option value="news">সংবাদ (News)</option>
                <option value="event">ইভেন্ট (Event)</option>
              </select>
              <ListFilter className="absolute right-3 top-3 text-[#6B6B70] pointer-events-none" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">শিরোনাম (Title)</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="পোস্টের শিরোনাম লিখুন..."
              className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20"
              required
            />
          </div>
        </div>

        {category === "event" && (
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">ইভেন্টের তারিখ</label>
            <input
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20"
              required={category === "event"}
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">বিস্তারিত (Content)</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="বিস্তারিত বর্ণনা লিখুন..."
            rows={5}
            className="w-full px-4 py-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-sm focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20 resize-y"
            required
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5">কভার ছবি (ঐচ্ছিক)</label>
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
          disabled={submitting || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-r bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50"
        >
          {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
          এখনই প্রকাশ করুন
        </button>
      </form>

      {/* Existing Posts */}
      <div>
        <h3 className="text-sm font-bold text-[#22242A] mb-3">
          প্রকাশিত পোস্ট ({posts.length})
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw size={24} className="animate-spin text-[#6B6B70] mx-auto" />
            <p className="text-xs text-[#6B6B70] mt-2">লোড হচ্ছে...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.02] border border-[#E5E5EA] rounded-2xl">
            <p className="text-sm text-[#6B6B70]">কোনো পোস্ট প্রকাশিত হয়নি</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(post => (
              <div
                key={post.id}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-[#E5E5EA] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E5E5EA] text-[#6B6B70]">
                        {post.category === "blog" ? "ব্লগ" : post.category === "news" ? "সংবাদ" : "ইভেন্ট"}
                      </span>
                      {post.eventDate && (
                        <span className="flex items-center gap-1 text-[10px] text-[#6B6B70]">
                          <Calendar size={10} />
                          {post.eventDate}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm mb-1">{post.title}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B70] mb-3">
                      <Calendar size={10} />
                      প্রকাশিত: {new Date(post.createdAt).toLocaleDateString("bn-BD")}
                    </div>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="max-h-48 w-full object-contain rounded-xl mb-3 border border-[#E5E5EA]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <p className="text-sm text-[#22242A] leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleteLoading === post.id}
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
