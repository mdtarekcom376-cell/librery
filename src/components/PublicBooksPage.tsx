import React, { useState, useEffect } from "react";
import FallbackImage from "./FallbackImage";
import { ArrowLeft, BookMarked, BookOpen, Search, RefreshCw, LayoutGrid } from "lucide-react";
import { apiClient } from "../api";
import { Book } from "../types";

interface PublicBooksPageProps {
  onBack: () => void;
  logoBase64?: string;
  onBookSelect?: (book: Book) => void;
}

export default function PublicBooksPage({ onBack, logoBase64, onBookSelect }: PublicBooksPageProps) {
  const logoSrc = logoBase64 || "";
  
  const [books, setBooks] = useState<Book[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filtering states
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); 
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [priceSort, setPriceSort] = useState<"none" | "low-to-high" | "high-to-low">("none");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const booksRes = await apiClient.get("/public/books?limit=1000");
        if (booksRes && Array.isArray(booksRes.books)) {
          setBooks(booksRes.books);
        } else if (Array.isArray(booksRes)) {
          setBooks(booksRes);
        }

        const groupsRes = await apiClient.get("/public/groups");
        if (groupsRes && Array.isArray(groupsRes.groups)) {
          setGroups(groupsRes.groups);
        }
      } catch (err) {
        console.error("Failed to load books for public view:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueBookGroups = Array.from(new Set([
    ...groups,
    ...books.map(b => b.group).filter((g): g is string => !!g && g.trim() !== "")
  ]));

  const groupCounts = books.reduce<Record<string, number>>((acc, b) => {
    if (b.group) acc[b.group] = (acc[b.group] || 0) + 1;
    return acc;
  }, {});

  const filteredBooks = books.filter(b => {
    const text = searchVal.trim().toLowerCase();
    const matchesText = text === "" ? true : (
      b.name.toLowerCase().includes(text) ||
      b.code.toLowerCase().includes(text) ||
      b.author.toLowerCase().includes(text) ||
      b.publisher.toLowerCase().includes(text) ||
      (b.group && b.group.toLowerCase().includes(text))
    );

    const matchesStatus = statusFilter === "" ? true : b.status === statusFilter;
    const matchesGroup = selectedGroup === "" ? true : b.group === selectedGroup;

    return matchesText && matchesStatus && matchesGroup;
  });

  if (priceSort === "low-to-high") {
    filteredBooks.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (priceSort === "high-to-low") {
    filteredBooks.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#F5F3EF] backdrop-blur-md border-b border-[#E5E5EA] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#E5E5EA] text-[#6B6B70] hover:bg-white"
              title="হোম পেজে ফিরে যান"
              aria-label="হোম পেজে ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">হোম পেজ</span>
            </button>

            <div className="flex items-center gap-2.5">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="অক্ষর পাঠাগার লোগো"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain bg-white border border-[#E5E5EA] p-0.5"
                />
              )}
              <div>
                <h1 className="text-sm md:text-base font-bold flex items-center gap-2" style={{ color: "var(--ink-navy)" }}>
                  <BookOpen size={16} className="text-[#FF6B6B]" />
                  সব বই
                </h1>
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  Akkhor Library Catalog
                </p>
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 bg-white text-[#22242A] border border-[#E5E5EA]">
            <BookMarked size={10} />
            পাবলিক ক্যাটালগ
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-[#6B6B70] mb-4" />
            <p className="text-sm text-[#6B6B70] font-bold">বইয়ের তালিকা লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 lg:gap-8">
            
            {/* Mobile Filters: search, category chips, status + sort in one compact block */}
            <div className="md:hidden space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
                <input
                  type="search"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="নাম, লেখক, কোড বা প্রকাশনী..."
                  className="w-full text-sm font-bold pl-11 pr-4 py-3 bg-white rounded-xl border border-[#E5E5EA] text-[#22242A] placeholder:text-[#6B6B70] placeholder:font-semibold focus:outline-none shadow-sm focus:border-[#22242A] focus:ring-4 focus:ring-[#22242A]/5"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                {[{ key: "", label: "সকল বই", count: books.length }, ...uniqueBookGroups.map(g => ({ key: g, label: g, count: groupCounts[g] || 0 }))].map(({ key, label, count }) => (
                  <button
                    key={key || "__all"}
                    onClick={() => setSelectedGroup(key)}
                    className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all border ${
                      selectedGroup === key
                        ? "bg-[#22242A] text-white border-[#22242A] shadow-md"
                        : "bg-white text-[#6B6B70] border-[#E5E5EA]"
                    }`}
                  >
                    {label}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${selectedGroup === key ? "bg-white/20" : "bg-[#F5F3EF]"}`}>{count}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex bg-white rounded-xl border border-[#E5E5EA] p-1">
                  <button
                    onClick={() => setStatusFilter("")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === "" ? "bg-[#F5F3EF] text-[#22242A]" : "text-[#6B6B70]"}`}
                  >
                    সকল
                  </button>
                  <button
                    onClick={() => setStatusFilter("Available")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${statusFilter === "Available" ? "bg-emerald-50 text-emerald-700" : "text-[#6B6B70]"}`}
                  >
                    উপলব্ধ
                  </button>
                </div>
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as any)}
                  aria-label="মূল্য অনুযায়ী সাজান"
                  className="w-full min-w-0 text-xs font-bold px-3 py-2 bg-white rounded-xl border border-[#E5E5EA] text-[#22242A] focus:outline-none cursor-pointer"
                >
                  <option value="none">ডিফল্ট ক্রম</option>
                  <option value="low-to-high">মূল্য: কম → বেশি</option>
                  <option value="high-to-low">মূল্য: বেশি → কম</option>
                </select>
              </div>
            </div>

            {/* Left Sidebar (Filters) — tablet & desktop */}
            <aside className="hidden md:block md:w-64 lg:w-72 shrink-0 space-y-5 md:sticky md:top-20 md:self-start">
              
              {/* Category Filter */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm">
                <h3 className="text-[11px] font-bold text-[#6B6B70] uppercase tracking-wider mb-3 pb-2 border-b border-[#E5E5EA]">
                  বইয়ের ধরন / ক্যাটাগরি
                </h3>
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  <button
                    onClick={() => setSelectedGroup("")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedGroup === ""
                        ? "bg-[#22242A] text-white shadow-md"
                        : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
                    }`}
                  >
                    <span>সকল বই</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${selectedGroup === "" ? "bg-white/20" : "bg-[#F5F3EF]"}`}>{books.length}</span>
                  </button>
                  {uniqueBookGroups.map(g => {
                    const count = groupCounts[g] || 0;
                    return (
                      <button
                        key={g}
                        onClick={() => setSelectedGroup(g)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          selectedGroup === g
                            ? "bg-[#22242A] text-white shadow-md"
                            : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
                        }`}
                      >
                        <span className="truncate pr-2">{g}</span>
                        <span className={`shrink-0 text-[9px] px-2 py-0.5 rounded-full ${selectedGroup === g ? "bg-white/20" : "bg-[#F5F3EF]"}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Other Filters */}
              <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm">
                <h3 className="text-[11px] font-bold text-[#6B6B70] uppercase tracking-wider mb-4 pb-2 border-b border-[#E5E5EA]">
                  স্ট্যাটাস ও মূল্য
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[#6B6B70] uppercase tracking-wider block mb-2">স্ট্যাটাস অনুযায়ী</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setStatusFilter("")}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors border ${statusFilter === "" ? "bg-[#F5F3EF] border-[#E5E5EA] text-[#22242A]" : "bg-white border-transparent text-[#6B6B70] hover:bg-[#F5F3EF]"}`}
                      >
                        সকল
                      </button>
                      <button
                        onClick={() => setStatusFilter("Available")}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors border ${statusFilter === "Available" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-transparent text-[#6B6B70] hover:bg-[#F5F3EF]"}`}
                      >
                        উপলব্ধ
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-[#6B6B70] uppercase tracking-wider block mb-2">মূল্য অনুযায়ী সাজান</label>
                    <select 
                      value={priceSort}
                      onChange={(e) => setPriceSort(e.target.value as any)}
                      className="w-full text-xs font-bold p-3 bg-[#F5F3EF] rounded-xl border border-[#E5E5EA] text-[#22242A] focus:outline-none cursor-pointer"
                    >
                      <option value="none">সাধারণ ক্রম (ডিফল্ট)</option>
                      <option value="low-to-high">কম থেকে বেশি (Low to High)</option>
                      <option value="high-to-low">বেশি থেকে কম (High to Low)</option>
                    </select>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 flex flex-col">
              
              {/* Search Bar — tablet & desktop (mobile search lives in the filter block above) */}
              <div className="relative mb-6 hidden md:block">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="বইয়ের নাম, লেখক, কোড বা প্রকাশনী দিয়ে খুঁজুন..."
                  className="w-full text-sm font-bold pl-12 pr-4 py-4 bg-white rounded-2xl border border-[#E5E5EA] text-[#22242A] placeholder:text-[#6B6B70] focus:outline-none shadow-sm transition-all focus:border-[#22242A] focus:ring-4 focus:ring-[#22242A]/5"
                />
              </div>

              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="min-w-0 text-base md:text-xl font-black text-[#22242A] flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#FF6B6B] shrink-0" />
                  <span className="truncate">{selectedGroup ? `${selectedGroup}` : "সকল বই"}</span>
                </h2>
                <span className="shrink-0 text-[10px] sm:text-xs font-bold text-[#6B6B70] bg-white px-3 py-1.5 rounded-xl border border-[#E5E5EA] shadow-sm">
                  {filteredBooks.length} টি বই পাওয়া গেছে
                </span>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="bg-white p-8 sm:p-12 text-center rounded-3xl border border-[#E5E5EA] shadow-sm mt-4">
                  <div className="w-16 h-16 bg-[#F5F3EF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-[#6B6B70]" />
                  </div>
                  <h3 className="text-base font-bold text-[#22242A] mb-2">কোনো বই পাওয়া যায়নি</h3>
                  <p className="text-[#6B6B70] text-xs">অনুসন্ধান শব্দ সংশোধন করুন অথবা অন্য ফিল্টার বা ক্যাটাগরি সিলেক্ট করুন।</p>
                  
                  {(statusFilter || selectedGroup || searchVal || priceSort !== "none") && (
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setSelectedGroup("");
                        setSearchVal("");
                        setPriceSort("none");
                      }}
                      className="mt-6 px-4 py-2 bg-[#F5F3EF] hover:bg-[#E5E5EA] text-[#22242A] rounded-xl text-xs font-bold transition-colors"
                    >
                      ফিল্টারসমূহ রিসেট করুন
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-12">
                   {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => onBookSelect && onBookSelect(book)}
                        className="min-w-0 bg-white rounded-xl border border-[#E5E5EA] overflow-hidden flex flex-col hover:border-[#22242A] hover:shadow-md transition-all duration-300 group cursor-pointer relative"
                      >
                        {/* Cover Image as Background Top Half */}
                        <div className="aspect-[4/3] w-full bg-[#F5F3EF] relative overflow-hidden shrink-0 border-b border-[#E5E5EA]">
                          <FallbackImage
                            src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                            alt={book.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            referrerPolicy="no-referrer" 
                          />
                          
                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end z-10">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm backdrop-blur-md ${book.status === "Available" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                              {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Miniature Content Area */}
                        <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between bg-white z-10">
                          <div>
                            <h3 className="font-bold text-[#22242A] text-xs leading-snug line-clamp-2" title={book.name}>
                              {book.name}
                            </h3>
                            <p className="text-[#6B6B70] text-[10px] font-semibold line-clamp-1 mt-0.5" title={book.author}>{book.author}</p>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#E5E5EA] border-dashed">
                            <span className="text-[10px] font-bold text-[#FF6B6B] truncate">
                              {book.price ? `৳${book.price}` : book.group || "View"}
                            </span>
                            <span className="text-[10px] bg-[#22242A] group-hover:bg-[#FF6B6B] transition-colors text-white px-2 py-1 rounded shrink-0">
                              বিস্তারিত
                            </span>
                          </div>
                        </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
