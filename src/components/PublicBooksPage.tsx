import React, { useState, useEffect } from "react";
import { ArrowLeft, BookMarked, Search, RefreshCw, LayoutGrid } from "lucide-react";
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
        const booksRes = await apiClient.get("/public/books");
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#E5E5EA] text-[#6B6B70] hover:bg-white"
              title="হোম পেজে ফিরে যান"
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
                  <LibraryIcon />
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={24} className="animate-spin text-[#6B6B70] mb-4" />
            <p className="text-sm text-[#6B6B70] font-bold">বইয়ের তালিকা লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
            
            {/* Left Sidebar (Filters) */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-5">
              
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
                    const count = books.filter(b => b.group === g).length;
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
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="বইয়ের নাম, লেখক, কোড বা প্রকাশনী দিয়ে খুঁজুন..."
                  className="w-full text-sm font-bold pl-12 pr-4 py-4 bg-white rounded-2xl border border-[#E5E5EA] text-[#22242A] placeholder:text-[#6B6B70] focus:outline-none shadow-sm transition-all focus:border-[#22242A] focus:ring-4 focus:ring-[#22242A]/5"
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-black text-[#22242A] flex items-center gap-2">
                  <LayoutGrid size={20} className="text-[#FF6B6B]" />
                  {selectedGroup ? `${selectedGroup}` : "সকল বই"}
                </h2>
                <span className="text-[10px] sm:text-xs font-bold text-[#6B6B70] bg-white px-3 py-1.5 rounded-xl border border-[#E5E5EA] shadow-sm">
                  {filteredBooks.length} টি বই পাওয়া গেছে
                </span>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-3xl border border-[#E5E5EA] shadow-sm mt-4">
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
                <div className="flex flex-wrap gap-4 pb-12 justify-center sm:justify-start">
                   {filteredBooks.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => onBookSelect && onBookSelect(book)}
                        className="w-[152px] h-[201px] bg-white rounded-xl border border-[#E5E5EA] overflow-hidden flex flex-col hover:border-[#22242A] hover:shadow-md transition-all duration-300 group cursor-pointer shrink-0 relative"
                      >
                        {/* Cover Image as Background Top Half */}
                        <div className="h-[115px] w-full bg-[#F5F3EF] relative overflow-hidden shrink-0 border-b border-[#E5E5EA]">
                          <img 
                            src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                            alt={book.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            referrerPolicy="no-referrer" 
                          />
                          
                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end z-10">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm backdrop-blur-md ${book.status === "Available" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
                              {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Miniature Content Area */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between bg-white z-10">
                          <div>
                            <h3 className="font-bold text-[#22242A] text-[11px] leading-tight line-clamp-2" title={book.name}>
                              {book.name}
                            </h3>
                            <p className="text-[#6B6B70] text-[9px] font-semibold line-clamp-1 mt-0.5" title={book.author}>{book.author}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[#E5E5EA] border-dashed">
                            <span className="text-[9px] font-bold text-[#FF6B6B] truncate pr-1">
                              {book.price ? `৳${book.price}` : book.group || "View"}
                            </span>
                            <span className="text-[9px] bg-[#22242A] hover:bg-[#FF6B6B] transition-colors text-white px-2 py-0.5 rounded shrink-0">
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

function LibraryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF6B6B]">
      <path d="M4 19.5v-15A2.5 2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}
