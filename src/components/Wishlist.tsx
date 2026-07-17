import React, { useState, useEffect } from "react";
import { ListPlus, Trash2, Eye, Download, Search, AlertCircle, RefreshCw } from "lucide-react";
import { WishlistItem } from "../types";
import { apiClient } from "../api";

interface WishlistProps {
  onPreviewWishlist: (item: WishlistItem) => void;
  onRefreshStats: () => void;
}

export default function Wishlist({ onPreviewWishlist, onRefreshStats }: WishlistProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Adding item form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [wishName, setWishName] = useState("");
  const [wishAuthor, setWishAuthor] = useState("");
  const [wishPublisher, setWishPublisher] = useState("");

  const [formErr, setFormErr] = useState("");
  const [wishToDelete, setWishToDelete] = useState<{ id: string; name: string } | null>(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiClient.get("/wishlist");
      setWishlist(data);
    } catch (err: any) {
      setErrorMsg(err.message || "উইশলিস্ট ডাটা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr("");
    if (!wishName.trim()) {
      setFormErr("বইয়ের নাম দিতেই হবে!");
      return;
    }

    try {
      await apiClient.post("/wishlist", {
        name: wishName.trim(),
        author: wishAuthor.trim(),
        publisher: wishPublisher.trim(),
      });
      setWishName("");
      setWishAuthor("");
      setWishPublisher("");
      setIsAddOpen(false);
      fetchWishlist();
      onRefreshStats();
    } catch (err: any) {
      setFormErr(err.message || "সংরক্ষণ করা যায়নি।");
    }
  };

  const handleDeleteWish = async (id: string) => {
    try {
      await apiClient.delete(`/wishlist/${id}`);
      fetchWishlist();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || "ডিলিট করা যায়নি।");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus?: string) => {
    try {
      const nextStatus = currentStatus === "fulfilled" ? "pending" : "fulfilled";
      await apiClient.put(`/wishlist/${id}/status`, { status: nextStatus });
      fetchWishlist();
      onRefreshStats();
    } catch (err: any) {
      alert(err.message || "স্ট্যাটাস আপডেট করা যায়নি।");
    }
  };

  const filteredWish = wishlist.filter(item =>
    item.name.toLowerCase().includes(q.toLowerCase()) ||
    item.author.toLowerCase().includes(q.toLowerCase()) ||
    item.publisher.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">৫. বই উইশলিস্ট (Wishlist)</h2>
          <p className="text-xs text-[#6B6B70]">পাঠকদের চাহিদা বা কেনার জন্য প্রস্তাবিত বইয়ের তালিকা সংরক্ষণ করুন</p>
        </div>
        <button
          onClick={() => {
            setFormErr("");
            setIsAddOpen(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white rounded-lg text-xs font-bold shadow-lg shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ListPlus size={14} />
          ইচ্ছাতালিকায় বই যোগ করুন
        </button>
      </div>

      {/* Searching wishlist */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="উইশলিস্টে থাকা বই খুঁজুন..."
          className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] placeholder:text-slate-600 focus:outline-none focus:border-[#22242A]"
        />
      </div>

      {/* Grid list container */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B6B70]">উইশলিস্ট লোড হচ্ছে...</div>
      ) : filteredWish.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-2xl">
          <p className="text-[#6B6B70] text-sm">উইশলিস্টে কোনো বই সাজানো নেই। উপরের বাটন দিয়ে নতুন বই সাজান।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWish.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl border border-[#E5E5EA] flex flex-col justify-between hover:border-[#22242A] duration-200"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-[#22242A] tracking-widest uppercase bg-[#F5F3EF] px-1.5 py-0.5 rounded">
                    WISHLIST ITEM
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === "fulfilled" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                    {item.status === "fulfilled" ? "✓ সংগৃহীত (Fulfilled)" : "⏳ অপেক্ষমাণ (Pending)"}
                  </span>
                </div>
                <h3 className="font-bold text-[#22242A] text-sm sm:text-base pt-1">{item.name}</h3>
                <p className="text-[#6B6B70] text-xs">লেখক: {item.author || "অজ্ঞাত"}</p>
                <p className="text-[#6B6B70] text-[10px]">প্রকাশনা: {item.publisher || "অজ্ঞাত"}</p>
                {item.memberFormNumber && (
                  <p className="text-[#6B6B70] text-[10px] font-mono mt-1">প্রস্তাবক সদস্য: #{item.memberFormNumber}</p>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-[#E5E5EA] mt-3">
                <span className="text-[9px] font-mono text-[#6B6B70]">সংরক্ষিত: {item.createdAt.split(" ")[0]}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`px-2 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors flex items-center gap-1 ${item.status === "fulfilled" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"}`}
                    title={item.status === "fulfilled" ? "Pending করুন" : "Fulfilled করুন"}
                  >
                    {item.status === "fulfilled" ? "↩ Pending" : "✓ Fulfill"}
                  </button>
                  <button
                    onClick={() => onPreviewWishlist(item)}
                    className="p-1.5 hover:bg-white rounded text-[#22242A] cursor-pointer"
                    title="প্রাকদর্শন স্লিপ এবং PDF"
                  >
                    <Eye size={13} />
                  </button>
                  <button
                    onClick={() => setWishToDelete(item)}
                    className="p-1.5 hover:bg-[#F5F3EF] rounded text-[#FF6B6B] cursor-pointer"
                    title="ডিলিট করুন"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIALOG WISHLIST POPUP ADD */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-120">
            <h3 className="text-lg font-bold text-[#22242A] mb-4 flex items-center gap-2">
              <ListPlus size={18} className="text-[#22242A]" />
              উইশলিস্টে নতুন বই সংগ্রহ
            </h3>
            
            {formErr && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] mb-3 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{formErr}</span>
              </div>
            )}

            <form onSubmit={handleAddWishSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">বইয়ের নাম *</label>
                <input
                  type="text"
                  value={wishName}
                  onChange={(e) => setWishName(e.target.value)}
                  placeholder="যেমন: পদ্মা নদীর মাঝি"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">লেখক (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={wishAuthor}
                  onChange={(e) => setWishAuthor(e.target.value)}
                  placeholder="মানিক বন্দ্যোপাধ্যায়"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">প্রকাশনা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={wishPublisher}
                  onChange={(e) => setWishPublisher(e.target.value)}
                  placeholder="যেমন: বেঙ্গল পাবলিশার্স"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-[#F5F3EF] border text-[#6B6B70] rounded-lg hover:bg-white text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22242A] text-white rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer"
                >
                  লিস্টে যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG WISHLIST POPUP CONFIRM DELETE */}
      {wishToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-[#22242A] mb-2 flex items-center gap-2">
              <Trash2 className="text-[#FF6B6B] shrink-0" size={16} />
              উইশলিস্ট আইটেম ডিলিট
            </h3>
            
            <p className="text-xs text-[#22242A] mt-2">
              আপনি কি সত্যি উইশলিস্ট থেকে <strong className="text-[#22242A]">'{wishToDelete.name}'</strong> বইটি ডিলিট করতে চান?
            </p>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setWishToDelete(null)}
                className="px-3 py-1.5 bg-[#F5F3EF] border text-[#6B6B70] rounded-lg hover:bg-white text-[11px] font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await handleDeleteWish(wishToDelete.id);
                  } finally {
                    setWishToDelete(null);
                  }
                }}
                className="px-4 py-1.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-lg text-[11px] font-bold cursor-pointer"
              >
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
