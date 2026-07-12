import React, { useState, useEffect } from "react";
import { 
  BookMarked, 
  Search, 
  Sparkles, 
  Heart, 
  Layers, 
  Check, 
  Clock, 
  ListFilter, 
  MoreVertical, 
  Plus, 
  Book, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  FileText,
  RefreshCw,
  Award,
  BookOpen
} from "lucide-react";
import { apiClient } from "../api";
import { Book as BookType } from "../types";
import SalesCorner from "./SalesCorner";

interface PublicPortalProps {
  userRole: "member" | "guest";
  memberInfo?: any;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export default function PublicPortal({ userRole, memberInfo, activeTab, onNavigate }: PublicPortalProps) {
  // State definitions
  const [books, setBooks] = useState<BookType[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, issued: 0, available: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [memberProfile, setMemberProfile] = useState<any | null>(null);
  const [memberProfileLoading, setMemberProfileLoading] = useState(false);
  const [memberProfileError, setMemberProfileError] = useState("");
  
  // Search and Filtering states
  const [searchVal, setSearchVal] = useState("");
  const [showGroupsDropdown, setShowGroupsDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(""); // "", "Available", "Issued"
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showGroupsSubmenu, setShowGroupsSubmenu] = useState(false);

  // Dashboard Live Explorer states
  const [dashboardFilter, setDashboardFilter] = useState<string>(""); // "", "Available", "Issued"
  const [dashboardSearch, setDashboardSearch] = useState<string>("");

  // New Wishlist item form state
  const [wishBookName, setWishBookName] = useState("");
  const [wishError, setWishError] = useState("");
  const [wishSuccess, setWishSuccess] = useState("");
  const [wishLoading, setWishLoading] = useState(false);

  // Loader state
  const [loading, setLoading] = useState(false);

  // Fetch all initial data
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch statistics
      const statsRes = await apiClient.get("/public/stats");
      if (statsRes) {
        setStats({
          total: statsRes.totalBooks || 0,
          issued: statsRes.issuedBooks || 0,
          available: statsRes.availableBooks || 0
        });
      }

      // 2. Fetch books list
      const booksRes = await apiClient.get("/public/books");
      if (Array.isArray(booksRes)) {
        setBooks(booksRes);
      } else if (booksRes && Array.isArray(booksRes.books)) {
        setBooks(booksRes.books);
      }

      // 3. Fetch groups
      const groupsRes = await apiClient.get("/public/groups");
      if (groupsRes && groupsRes.success) {
        setGroups(groupsRes.groups);
      }

      // 4. Fetch leaderboard
      const lbRes = await apiClient.get("/public/leaderboard/books");
      if (lbRes && Array.isArray(lbRes.leaderboard)) {
        setLeaderboard(lbRes.leaderboard);
      } else if (Array.isArray(lbRes)) {
        setLeaderboard(lbRes);
      }

      // 5. Fetch wishlist (if member)
      if (userRole === "member") {
        const wlRes = await apiClient.get("/public/wishlist");
        if (wlRes && Array.isArray(wlRes.wishlist)) {
          setWishlist(wlRes.wishlist);
        } else if (Array.isArray(wlRes)) {
          setWishlist(wlRes);
        }

        if (memberInfo?.formNumber) {
          setMemberProfileLoading(true);
          try {
            const profileRes = await apiClient.get(`/public/members/${memberInfo.formNumber}/profile`);
            if (profileRes && profileRes.success) {
              setMemberProfile(profileRes);
            }
          } catch (err: any) {
            setMemberProfileError(err.message || "প্রোফাইল লোড করতে ব্যর্থ।");
          } finally {
            setMemberProfileLoading(false);
          }
        }
      }
    } catch (err) {
      console.warn("পাবলিক পোর্টাল ডাটা লোড ব্যর্থ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  // Handle wishlist submissions
  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWishError("");
    setWishSuccess("");
    if (!wishBookName.trim()) {
      setWishError("বইয়ের নাম টাইপ করা আবশ্যক!");
      return;
    }
    if (userRole !== "member" || !memberInfo) {
      setWishError("উইশলিস্ট শুধুমাত্র নিবন্ধিত সদস্যদের জন্য প্রযোজ্য।");
      return;
    }

    setWishLoading(true);
    try {
      const payload = {
        bookName: wishBookName.trim(),
        memberFormNumber: memberInfo.formNumber
      };
      const res = await apiClient.post("/public/wishlist", payload);
      if (res && res.success) {
        setWishSuccess("আপনার উইশ সফলভাবে সম্পন্ন হয়েছে!");
        setWishBookName("");
        // Reload wishlist items
        const wlRes = await apiClient.get("/public/wishlist");
        if (Array.isArray(wlRes)) {
          setWishlist(wlRes);
        }
      } else {
        setWishError(res.error || "উইশ জমা দিতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setWishError(err.message || "উইশ জমা করতে সমস্যা হয়েছে।");
    } finally {
      setWishLoading(false);
    }
  };

  // Filter books matching search or groups
  const uniqueBookGroups = Array.from(new Set([
    ...groups,
    ...books.map(b => b.group).filter((g): g is string => !!g && g.trim() !== "")
  ]));

  const filteredBooks = books.filter(b => {
    // 1. Text Search matching Book Name, Code, Author, Publisher, or Group
    const text = searchVal.trim().toLowerCase();
    const matchesText = text === "" ? true : (
      b.name.toLowerCase().includes(text) ||
      b.code.toLowerCase().includes(text) ||
      b.author.toLowerCase().includes(text) ||
      b.publisher.toLowerCase().includes(text) ||
      (b.group && b.group.toLowerCase().includes(text))
    );

    // 2. Status Filter
    const matchesStatus = statusFilter === "" ? true : b.status === statusFilter;

    // 3. Group Filter
    const matchesGroup = selectedGroup === "" ? true : b.group === selectedGroup;

    return matchesText && matchesStatus && matchesGroup;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. PUBLIC STATS TAB VIEW */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="border-b border-indigo-500/10 pb-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookMarked size={20} className="text-indigo-400" />
              পাঠাগার পরিসংখ্যান ও ড্যাশবোর্ড
            </h2>
            <p className="text-xs text-slate-400">লাইব্রেরির বর্তমান বই মজুদ ও ইস্যু সংক্রান্ত সাধারণ বিবরণী</p>
          </div>

          {/* Bento Desk: 6 Premium Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            
            {/* 1. Total Books */}
            <div 
              onClick={() => {
                setDashboardFilter("");
                const el = document.getElementById("dashboard-explorer-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 ${dashboardFilter === "" ? "ring-2 ring-blue-500/50 border-blue-500/40" : "border-white/5"}`}
            >
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-blue-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">মোট বই</span>
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-white font-mono">{stats.total} <span className="text-xs text-slate-400">টি</span></h3>
                <p className="text-[9px] text-blue-400 mt-1 font-semibold group-hover:underline">তালিকা দেখুন ↓</p>
              </div>
            </div>

            {/* 2. Available Books */}
            <div 
              onClick={() => {
                setDashboardFilter("Available");
                const el = document.getElementById("dashboard-explorer-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5 ${dashboardFilter === "Available" ? "ring-2 ring-emerald-500/50 border-emerald-500/40" : "border-white/5"}`}
            >
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-emerald-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">উপলব্ধ (Available)</span>
                <Check size={16} className="text-emerald-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-emerald-400 font-mono">{stats.available} <span className="text-xs text-slate-400">টি</span></h3>
                <p className="text-[9px] text-emerald-400 mt-1 font-semibold group-hover:underline">তালিকা দেখুন ↓</p>
              </div>
            </div>

            {/* 3. Issued Books */}
            <div 
              onClick={() => {
                setDashboardFilter("Issued");
                const el = document.getElementById("dashboard-explorer-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/5 ${dashboardFilter === "Issued" ? "ring-2 ring-rose-500/50 border-rose-500/40" : "border-white/5"}`}
            >
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-rose-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">ইস্যুকৃত (Issued)</span>
                <Clock size={16} className="text-rose-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-rose-400 font-mono">{stats.issued} <span className="text-xs text-slate-400">টি</span></h3>
                <p className="text-[9px] text-rose-400 mt-1 font-semibold group-hover:underline">তালিকা দেখুন ↓</p>
              </div>
            </div>

            {/* 4. Wishlist or Groups */}
            {userRole === "member" ? (
              <div 
                onClick={() => onNavigate("wishlist")}
                className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 border-white/5"
              >
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-purple-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">আমার উইশলিস্ট</span>
                  <Heart size={16} className="text-purple-400 font-bold" />
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-purple-400 font-mono">{wishlist.length} <span className="text-xs text-slate-400">টি</span></h3>
                  <p className="text-[9px] text-purple-400 mt-1 font-semibold group-hover:underline">আবদার সমূহ →</p>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => onNavigate("books")}
                className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/5 border-white/5"
              >
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-purple-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">কর্নার/গ্রুপসমূহ</span>
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-black text-purple-400 font-mono">{groups.length || 3} <span className="text-xs text-slate-400">টি</span></h3>
                  <p className="text-[9px] text-purple-400 mt-1 font-semibold group-hover:underline">গ্রুপসমূহ দেখুন →</p>
                </div>
              </div>
            )}

            {/* 5. Circulation Rate */}
            <div 
              className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/30 border-white/5"
            >
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-amber-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">সক্রিয়তার হার</span>
                <TrendingUp size={16} className="text-amber-400" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-amber-400 font-mono">
                  {stats.total > 0 ? Math.round((stats.issued / stats.total) * 100) : 0}%
                </h3>
                <p className="text-[9px] text-slate-400 mt-1">লেনদেনের সক্রিয়তার হার</p>
              </div>
            </div>

            {/* 6. Top Popular Book */}
            <div 
              onClick={() => {
                if (leaderboard[0]) {
                  setDashboardSearch(leaderboard[0].name);
                  const el = document.getElementById("dashboard-explorer-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="glass-panel p-4 rounded-xl flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/5 border-white/5"
            >
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-6 bg-cyan-500/5 rotate-12 rounded-full group-hover:scale-110 transition-transform pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">শীর্ষ পঠিত বই</span>
                <Award size={16} className="text-cyan-400" />
              </div>
              <div className="mt-2 min-w-0">
                <h4 className="text-[10px] font-black text-white truncate" title={leaderboard[0]?.name || "কোনো ডাটা নেই"}>
                  {leaderboard[0]?.name || "কোনো ডাটা নেই"}
                </h4>
                <p className="text-[9px] text-cyan-400 mt-1 font-semibold group-hover:underline">অনুসন্ধান করুন →</p>
              </div>
            </div>

          </div>

          {/* Section 2: Interactive Detailed Live Book Explorer */}
          <div id="dashboard-explorer-section" className="space-y-4 pt-4 border-t border-indigo-500/5 transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ListFilter size={16} className="text-indigo-400" />
                  বইয়ের লাইভ ডিরেক্টরি ও ক্যাটালগ এক্সপ্লোরার
                </h3>
                <p className="text-xs text-slate-400">ড্যাশবোর্ডের পরিসংখ্যানের ওপর ভিত্তি করে সরাসরি বইয়ের বিবরণ দেখুন</p>
              </div>
              
              {/* Quick status tabs inside stats section */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-lg border border-white/5 shrink-0">
                <button
                  onClick={() => setDashboardFilter("")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${dashboardFilter === "" ? "bg-indigo-600 text-white font-extrabold" : "text-slate-400 hover:text-white"}`}
                >
                  সব বই ({stats.total})
                </button>
                <button
                  onClick={() => setDashboardFilter("Available")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${dashboardFilter === "Available" ? "bg-emerald-600 text-white font-extrabold" : "text-slate-400 hover:text-white"}`}
                >
                  উপলব্ধ ({stats.available})
                </button>
                <button
                  onClick={() => setDashboardFilter("Issued")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${dashboardFilter === "Issued" ? "bg-rose-600 text-white font-extrabold" : "text-slate-400 hover:text-white"}`}
                >
                  বর্তমানে ধারকৃত ({stats.issued})
                </button>
              </div>
            </div>

            {/* Dashboard search input box */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
                placeholder="তালিকার ভিতর কোড, নাম, লেখক বা প্রকাশক দিয়ে সরাসরি সার্চ করুন..."
                className="w-full text-xs pl-9 pr-8 py-2 bg-slate-950 rounded-lg border border-indigo-500/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
              />
              {dashboardSearch && (
                <button 
                  onClick={() => setDashboardSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 hover:bg-white/20 text-slate-300 px-1.5 py-0.5 rounded transition-all font-bold"
                >
                  মুছুন
                </button>
              )}
            </div>

            {/* Filter tags feedback */}
            {(dashboardFilter || dashboardSearch) && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-indigo-500/5">
                <span>সক্রিয় ফিল্টার:</span>
                {dashboardFilter && (
                  <span className={`px-2 py-0.5 rounded font-bold ${dashboardFilter === "Available" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/15" : "bg-rose-950/80 text-rose-300 border border-rose-500/15"}`}>
                    স্ট্যাটাস: {dashboardFilter === "Available" ? "তাত্ক্ষণিক উপলব্ধ" : "বর্তমানে ধারকৃত"}
                  </span>
                )}
                {dashboardSearch && (
                  <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-500/15 rounded font-bold">
                    সার্চ: "{dashboardSearch}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setDashboardFilter("");
                    setDashboardSearch("");
                  }}
                  className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            )}

            {/* Results Grid inside stats view */}
            {books.filter(b => {
              const text = dashboardSearch.trim().toLowerCase();
              const matchesText = text === "" ? true : (
                b.name.toLowerCase().includes(text) ||
                b.code.toLowerCase().includes(text) ||
                b.author.toLowerCase().includes(text) ||
                b.publisher.toLowerCase().includes(text) ||
                (b.group && b.group.toLowerCase().includes(text))
              );
              const matchesStatus = dashboardFilter === "" ? true : b.status === dashboardFilter;
              return matchesText && matchesStatus;
            }).length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-xl border border-indigo-500/5">
                <p className="text-slate-400 text-xs italic">কোনো বই পাওয়া যায়নি। অন্য কিছু সার্চ করুন বা অন্য ড্যাশবোর্ড কার্ড সিলেক্ট করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.filter(b => {
                  const text = dashboardSearch.trim().toLowerCase();
                  const matchesText = text === "" ? true : (
                    b.name.toLowerCase().includes(text) ||
                    b.code.toLowerCase().includes(text) ||
                    b.author.toLowerCase().includes(text) ||
                    b.publisher.toLowerCase().includes(text) ||
                    (b.group && b.group.toLowerCase().includes(text))
                  );
                  const matchesStatus = dashboardFilter === "" ? true : b.status === dashboardFilter;
                  return matchesText && matchesStatus;
                }).slice(0, 9).map((book) => (
                  <div
                    key={book.id}
                    className="glass-panel p-3.5 rounded-xl border border-white/5 flex gap-3 hover:border-indigo-500/35 duration-150 transition-all hover:-translate-y-0.5"
                  >
                    <div className="w-16 h-22 rounded bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                      <img 
                        src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                        alt={book.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold bg-purple-900/30 text-purple-300 ring-1 ring-purple-500/10 uppercase tracking-wider truncate">
                            {book.code}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold shrink-0 ${book.status === "Available" ? "bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/15" : "bg-red-950/80 text-red-300 ring-1 ring-red-500/15"}`}>
                            {book.status === "Available" ? "তাত্ক্ষণিক উপলব্ধ" : "ধারকৃত"}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-xs sm:text-sm truncate pt-1" title={book.name}>{book.name}</h4>
                        <p className="text-slate-400 text-[11px] truncate">{book.author}</p>
                        <p className="text-slate-500 text-[9px] truncate">প্রকাশক: {book.publisher}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1.5">
                        <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                          {book.group ? `গ্রুপ: ${book.group}` : "সাধারণ বুক কর্নার"}
                        </span>
                        <button
                          onClick={() => {
                            // Apply filters to main page
                            setStatusFilter(book.status);
                            setSearchVal(book.name);
                            onNavigate("books");
                          }}
                          className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5"
                        >
                          বিস্তারিত দেখুন →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {books.filter(b => {
              const text = dashboardSearch.trim().toLowerCase();
              const matchesText = text === "" ? true : (
                b.name.toLowerCase().includes(text) ||
                b.code.toLowerCase().includes(text) ||
                b.author.toLowerCase().includes(text) ||
                b.publisher.toLowerCase().includes(text) ||
                (b.group && b.group.toLowerCase().includes(text))
              );
              const matchesStatus = dashboardFilter === "" ? true : b.status === dashboardFilter;
              return matchesText && matchesStatus;
            }).length > 9 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setStatusFilter(dashboardFilter);
                    setSearchVal(dashboardSearch);
                    onNavigate("books");
                  }}
                  className="text-xs bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/15 px-4 py-2 rounded-lg font-bold transition-all inline-block cursor-pointer"
                >
                  আরও {books.filter(b => {
                    const text = dashboardSearch.trim().toLowerCase();
                    const matchesText = text === "" ? true : (
                      b.name.toLowerCase().includes(text) ||
                      b.code.toLowerCase().includes(text) ||
                      b.author.toLowerCase().includes(text) ||
                      b.publisher.toLowerCase().includes(text) ||
                      (b.group && b.group.toLowerCase().includes(text))
                    );
                    const matchesStatus = dashboardFilter === "" ? true : b.status === dashboardFilter;
                    return matchesText && matchesStatus;
                  }).length - 9} টি বই মূল ক্যাটালগে দেখতে ক্লিক করুন →
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Integrated Leaderboard (Horizontal popular bars and Rank Cards side-by-side) */}
          <div className="space-y-4 pt-4 border-t border-indigo-500/5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  সর্বাধিক পঠিত ও জনপ্রিয় বইয়ের লিডারবোর্ড
                </h3>
                <p className="text-xs text-slate-400">লাইব্রেরিতে আমাদের পাঠকদের সর্বাধিক পঠিত বইয়ের পরিসংখ্যান</p>
              </div>
              <button
                onClick={() => onNavigate("leaderboard")}
                className="text-xs text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer font-bold bg-purple-950/30 px-3 py-1.5 rounded-lg border border-purple-500/10"
              >
                সম্পূর্ণ লিডারবোর্ড →
              </button>
            </div>

            {leaderboard.length === 0 ? (
              <div className="glass-panel p-8 text-center rounded-2xl border border-indigo-500/10">
                <p className="text-slate-400 text-xs italic">কোনো জনপ্রিয় বইয়ের পরিসংখ্যান পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Side: Popular books progress bar list (exactly like admin!) */}
                <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-purple-300 mb-4 flex items-center gap-1.5">
                      <TrendingUp size={13} className="text-purple-400" />
                      জনপ্রিয়তা ইনডেক্স (Relative Popularity Bar)
                    </h4>
                    <div className="space-y-4">
                      {leaderboard.slice(0, 5).map((item, i) => {
                        const topCount = leaderboard[0]?.count || leaderboard[0]?.issueCount || 1;
                        const itemVal = item.count || item.issueCount || 0;
                        const pct = Math.max(8, Math.round((itemVal / topCount) * 100));
                        return (
                          <div 
                            key={item.code || i} 
                            className="group cursor-pointer" 
                            onClick={() => {
                              setSearchVal(item.name);
                              onNavigate("books");
                            }}
                          >
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-300 truncate max-w-[200px] group-hover:text-purple-400 transition-colors">
                                {item.name}
                              </span>
                              <span className="text-cyan-400 font-bold font-mono">{itemVal} বার</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                              <div
                                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4 italic">※ ধার করার ফ্রিকোয়েন্সি বিবেচনা করে প্রতি ২৪ ঘন্টায় পরিসংখ্যানটি স্বয়ংক্রিয়ভাবে আপডেট হয়।</p>
                </div>

                {/* Right Side: Rank Cards with cover images */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                  {leaderboard.slice(0, 3).map((item, index) => {
                    const medalBgColors = [
                      "from-amber-500/15 to-yellow-600/5 border-amber-500/30 text-amber-300",
                      "from-slate-300/15 to-slate-400/5 border-slate-300/30 text-slate-300",
                      "from-amber-700/15 to-amber-800/5 border-amber-600/30 text-amber-500"
                    ];
                    const rankText = ["১ম স্থান", "২য় স্থান", "৩য় স্থান"];
                    const rankClass = medalBgColors[index] || "from-slate-800/40 to-slate-900/40 border-white/5 text-slate-400";

                    return (
                      <div
                        key={item.code || index}
                        onClick={() => {
                          setSearchVal(item.name);
                          onNavigate("books");
                        }}
                        className={`glass-panel p-3 rounded-xl border bg-gradient-to-br ${rankClass} flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/30 cursor-pointer transition-all duration-150 hover:-translate-y-1`}
                        title="বইটির বিস্তারিত ক্যাটালগে দেখতে ক্লিক করুন"
                      >
                        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 p-4 bg-purple-500/5 rotate-12 rounded-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                        
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-bold uppercase tracking-wider bg-black/40 px-1 rounded text-slate-300 truncate">
                            {item.code}
                          </span>
                          <span className="text-[10px] font-black shrink-0">{rankText[index]}</span>
                        </div>

                        <div className="w-16 h-22 rounded bg-slate-950 overflow-hidden border border-slate-800 mx-auto mb-2 shadow group-hover:scale-105 transition-transform">
                          <img
                            src={item.imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="text-center space-y-0.5">
                          <h4 className="font-bold text-white text-[10px] truncate" title={item.name}>{item.name}</h4>
                          <p className="text-slate-400 text-[9px] truncate">{item.author}</p>
                        </div>

                        <div className="flex justify-between items-center text-[9px] pt-1.5 border-t border-white/5 mt-1.5">
                          <span className="text-slate-400">মোট পঠিত:</span>
                          <span className="font-bold text-cyan-400 font-mono">{(item.count || item.issueCount || 0)} বার</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-purple-500/10 text-center space-y-4">
            <h3 className="text-sm font-bold text-purple-300">অক্ষর লাইব্রেরি ডিরেক্টরি নির্দেশিকা</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl mx-auto">
              আমাদের সকল সদস্য ও ভিজিটররা এই প্যানেল থেকে লাইব্রেরির যেকোনো বই সার্চ করে দেখতে পারবেন এবং বইয়ের কর্নার বা গ্রুপ ভিত্তিক ফিল্টার ব্যবহার করতে পারবেন। কোনো সদস্য তার পছন্দমতো বই খুঁজে না পেলে উইশলিস্টে যুক্ত করতে পারেন।
            </p>
          </div>
        </div>
      )}

      {/* 2. PUBLIC BOOKS CATALOG WITH FILTERS */}
      {activeTab === "books" && (
        <div className="space-y-6">
          <div className="border-b border-indigo-500/10 pb-4 mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookMarked size={20} className="text-cyan-400" />
                বই ক্যাটালগ ও সার্চ ইঞ্জিন
              </h2>
              <p className="text-xs text-slate-400">লাইব্রেরির বই খুঁজুন এবং নির্দিষ্ট কর্নার বা স্ট্যাটাস সিলেক্ট করুন</p>
            </div>
            
            {/* Clear Filters indicator */}
            {(statusFilter || selectedGroup || searchVal) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setSelectedGroup("");
                  setSearchVal("");
                }}
                className="text-[10px] bg-red-950/40 hover:bg-red-950/70 border border-red-500/20 text-red-300 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              >
                ফিল্টারসমূহ রিসেট করুন ✕
              </button>
            )}
          </div>

          {/* Interactive Search Bar and Filters Grid */}
          <div className="relative space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="বইয়ের নাম, কোড, লেখক বা প্রকাশনী দিয়ে সার্চ করুন..."
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-[#05070f]/55 rounded-xl border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
                />
              </div>

              {/* Three-dot Filters Popover Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-3 bg-[#05070f]/55 hover:bg-[#0c1228] border rounded-xl text-slate-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1 ${showFilterMenu ? "border-indigo-500 text-indigo-400" : "border-white/10"}`}
                  title="ফিল্টার অপশন ও মেনু"
                >
                  <ListFilter size={18} />
                  <span className="hidden sm:inline text-xs font-bold">ফিল্টার</span>
                </button>

                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#090e1d] border border-indigo-500/20 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-120">
                    <div className="px-2 py-1.5 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">ফিল্টার সিলেক্ট করুন</p>
                    </div>

                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setShowFilterMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${statusFilter === "" && !showGroupsSubmenu ? "bg-indigo-950/40 text-indigo-300 font-bold" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <span>১. সকল বই</span>
                      {statusFilter === "" && !showGroupsSubmenu && <Check size={12} />}
                    </button>

                    <button
                      onClick={() => {
                        setStatusFilter("Available");
                        setShowFilterMenu(false);
                        setShowGroupsSubmenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${statusFilter === "Available" ? "bg-indigo-950/40 text-indigo-300 font-bold" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <span>২. উপলব্ধ (Available) বই</span>
                      {statusFilter === "Available" && <Check size={12} />}
                    </button>

                    <button
                      onClick={() => {
                        setStatusFilter("Issued");
                        setShowFilterMenu(false);
                        setShowGroupsSubmenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${statusFilter === "Issued" ? "bg-indigo-950/40 text-indigo-300 font-bold" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <span>৩. ইস্যুকৃত বই</span>
                      {statusFilter === "Issued" && <Check size={12} />}
                    </button>

                    <button
                      onClick={() => {
                        setShowGroupsSubmenu(!showGroupsSubmenu);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${showGroupsSubmenu ? "bg-indigo-950/40 text-indigo-300 font-bold" : "text-slate-300 hover:bg-white/5"}`}
                    >
                      <span>৪. গ্রুপ ভিত্তিক ফিল্টার</span>
                      <span className="text-[9px] text-indigo-400 font-bold">▶</span>
                    </button>

                    {showGroupsSubmenu && (
                      <div className="border-t border-white/5 pt-1 mt-1 space-y-0.5 bg-[#0d152c]/50 rounded-lg p-1.5">
                        <button
                          onClick={() => {
                            setSelectedGroup("");
                            setShowFilterMenu(false);
                            setShowGroupsSubmenu(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-[11px] ${selectedGroup === "" ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"}`}
                        >
                          সকল গ্রুপ
                        </button>
                        {uniqueBookGroups.map(g => (
                          <button
                            key={g}
                            onClick={() => {
                              setSelectedGroup(g);
                              setShowFilterMenu(false);
                              setShowGroupsSubmenu(false);
                            }}
                            className={`w-full text-left px-2 py-1 rounded text-[11px] ${selectedGroup === g ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Permanent Group Selection Pills below search input */}
            <div className="flex flex-col gap-2 bg-slate-900/30 p-4 rounded-xl border border-indigo-500/10">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-400">বইয়ের গ্রুপ / কর্নার ভিত্তিক ফিল্টার:</div>
              {uniqueBookGroups.length === 0 ? (
                <p className="text-xs text-slate-500 italic">কোনো গ্রুপ বা কর্নার পাওয়া যায়নি।</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedGroup("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedGroup === ""
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-indigo-500/5"
                    }`}
                  >
                    সকল বই ({books.length})
                  </button>
                  {uniqueBookGroups.map(g => {
                    const count = books.filter(b => b.group === g).length;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGroup(g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedGroup === g
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold"
                            : "bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-indigo-500/5"
                        }`}
                      >
                        {g} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Filter tags summary banner */}
            {(selectedGroup || statusFilter) && (
              <div className="flex flex-wrap items-center gap-1.5 bg-[#0e1428]/40 border border-indigo-500/5 p-2 rounded-xl text-[11px]">
                <span className="text-slate-400">সক্রিয় ফিল্টারসমূহ:</span>
                {statusFilter && (
                  <span className="px-2 py-0.5 bg-indigo-950 border border-indigo-500/20 text-indigo-300 rounded font-bold">
                    {statusFilter === "Available" ? "উপলব্ধ বই" : "ইস্যুকৃত বই"}
                  </span>
                )}
                {selectedGroup && (
                  <span className="px-2 py-0.5 bg-purple-950 border border-purple-500/20 text-purple-300 rounded font-bold">
                    গ্রুপ: {selectedGroup}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Book Catalog Grid layout */}
          {filteredBooks.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-indigo-500/10">
              <p className="text-slate-400 text-sm">কোনো বই খুঁজে পাওয়া যায়নি। অনুসন্ধান শব্দ সংশোধন করুন বা অন্য ফিল্টার চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="glass-panel p-4 rounded-2xl border border-white/5 flex gap-4 hover:border-cyan-500/35 duration-200 hover:-translate-y-0.5 relative group"
                >
                  <div className="w-20 h-28 rounded bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center shrink-0">
                    <img 
                      src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                      alt={book.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex items-center gap-1 min-w-0 flex-wrap">
                          <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-purple-900/30 text-purple-300 ring-1 ring-purple-500/10 uppercase tracking-wider truncate">
                            {book.code}
                          </span>
                          {book.group && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950 text-indigo-300 ring-1 ring-indigo-500/10 truncate">
                              {book.group}
                            </span>
                          )}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${book.status === "Available" ? "bg-emerald-950/80 text-emerald-300 ring-1 ring-emerald-500/15" : "bg-red-950/80 text-red-300 ring-1 ring-red-500/15"}`}>
                          {book.status === "Available" ? "Available" : "Issued"}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-xs sm:text-sm truncate pt-1" title={book.name}>{book.name}</h3>
                      <p className="text-slate-400 text-xs truncate">{book.author}</p>
                      <p className="text-slate-500 text-[10px] truncate">প্রকাশক: {book.publisher}</p>
                    </div>

                    {/* Member option to quick wish */}
                    {userRole === "member" && (
                      <div className="flex justify-end pt-2 border-t border-white/5 mt-2">
                        <button
                          onClick={() => {
                            setWishBookName(book.name);
                            // Scroll or focus to wishlist input or notify them
                            alert(`'${book.name}' বইটি আপনার উইশ তালিকায় যুক্ত করতে নিচের উইশলিস্ট ট্যাব ব্যবহার করতে পারেন।`);
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          title="উইশলিস্টে যুক্ত করতে কপি করুন"
                        >
                          <Heart size={10} /> উইশ করুন
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. BOOK LEADERBOARD TAB */}
      {activeTab === "leaderboard" && (
        <div className="space-y-6">
          <div className="border-b border-indigo-500/10 pb-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              পাঠাগার সেরা জনপ্রিয় বইয়ের লিডারবোর্ড
            </h2>
            <p className="text-xs text-slate-400">পাঠক এবং সদস্যদের সর্বাধিক পঠিত ও গৃহীত বইয়ের তালিকা</p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-purple-500/10">
              <p className="text-slate-400 text-sm">লিডারবোর্ডে প্রদর্শনের মতো পর্যাপ্ত বইয়ের ইস্যু তথ্য পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-purple-500/10 overflow-hidden">
              <div className="bg-[#0b0e1d]/90 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={14} className="text-purple-400" />
                  শীর্ষ পঠিত বইসমূহ ক্রমানুসারে:
                </span>
                <span className="text-[10px] text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-500/15">রিয়েল-টাইম ডাটা</span>
              </div>
              
              <div className="divide-y divide-white/5">
                {leaderboard.map((item, index) => {
                  const medalColors = [
                    "bg-amber-500 text-slate-950 border-amber-300",
                    "bg-slate-300 text-slate-950 border-slate-100",
                    "bg-amber-700 text-white border-amber-500"
                  ];
                  const rankClass = index < 3 ? medalColors[index] : "bg-slate-900 text-slate-400 border-white/5";

                  return (
                    <div 
                      key={item.id || index}
                      className="p-4 px-6 flex items-center justify-between hover:bg-white/[0.01] transition-all gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Rank Badge */}
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center border shrink-0 ${rankClass}`}>
                          {index + 1}
                        </span>

                        <div className="w-10 h-14 bg-slate-950 rounded overflow-hidden border border-slate-800 shrink-0">
                          <img 
                            src={item.imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate" title={item.name}>{item.name}</h4>
                          <p className="text-slate-400 text-xs truncate">{item.author}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] bg-purple-950 px-1.5 py-0.2 rounded font-semibold text-purple-300">
                              কোড: {item.code}
                            </span>
                            {item.group && (
                              <span className="text-[9px] bg-indigo-950 px-1.5 py-0.2 rounded font-semibold text-indigo-300">
                                {item.group}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-xs sm:text-sm font-black text-cyan-400 font-mono">{item.issueCount || 0} বার</span>
                        <span className="text-[9px] text-slate-500">মোট ধার করা হয়েছে</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. PUBLIC MEMBER WISHLIST TAB */}
      {activeTab === "wishlist" && userRole === "member" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-indigo-500/10 pb-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart size={20} className="text-rose-400" />
              বইয়ের উইশ লিস্ট (Wishlist Hub)
            </h2>
            <p className="text-xs text-slate-400">পছন্দের বইয়ের জন্য রিকোয়েস্ট করুন। বইটি আমাদের তালিকায় আছে কিনা তা স্বয়ংক্রিয়ভাবে দেখাবে।</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Wishlist Form Column */}
            <div className="glass-panel p-6 rounded-2xl border border-rose-500/10 h-fit space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Plus size={16} className="text-rose-400" />
                নতুন বইয়ের উইশ বা আবদার করুন
              </h3>

              {wishError && (
                <div className="bg-red-950/45 border border-red-500/25 p-3 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span>{wishError}</span>
                </div>
              )}

              {wishSuccess && (
                <div className="bg-emerald-950/45 border border-emerald-500/25 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>{wishSuccess}</span>
                </div>
              )}

              <form onSubmit={handleWishSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">ইচ্ছাকৃত বইয়ের নাম (Bangla or English)</label>
                  <input
                    type="text"
                    value={wishBookName}
                    onChange={(e) => setWishBookName(e.target.value)}
                    placeholder="যেমনঃ দেয়াল, পথের পাঁচালী"
                    className="w-full px-3 py-2 bg-[#05070f]/55 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-rose-400"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed">
                  * উইশ জমা দেয়ার সাথে সাথেই তা অ্যাডমিনের উইশলিস্ট সিস্টেমে চলে যাবে। লাইব্রেরিতে বইটি ইতিমধ্যে থাকলে স্ট্যাটাস <strong>"Available"</strong> দেখাবে, নতুবা <strong>"Waiting"</strong> দেখাবে।
                </div>

                <button
                  type="submit"
                  disabled={wishLoading}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {wishLoading ? <RefreshCw size={13} className="animate-spin" /> : <Heart size={12} />}
                  উইশলিস্টে যোগ করুন
                </button>
              </form>
            </div>

            {/* Existing wishes tracking list Column */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">আমার উইশ ও ট্র্যাকিং স্ট্যাটাস</h3>
              
              {wishlist.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-2xl border border-white/5">
                  <p className="text-slate-500 text-xs italic">আপনার উইশলিস্টে কোনো তথ্য নেই। বামপাশের ফর্ম ব্যবহার করে প্রথম উইশটি করুন।</p>
                </div>
              ) : (
                <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                  {wishlist.map((item, index) => {
                    const isAvailable = item.status === "Available";
                    return (
                      <div key={item.id || index} className="p-4 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white">{item.bookName}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">আইডি: {item.id} | সদস্য: {item.memberFormNumber}</p>
                          </div>
                        </div>

                        <div>
                          {isAvailable ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                              <Check size={10} /> Available (লাইব্রেরিতে আছে)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/25 flex items-center gap-1">
                              <Clock size={10} /> Waiting (অপেক্ষমাণ)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. PUBLIC MEMBER TRACKER TAB */}
      {activeTab === "my-tracker" && userRole === "member" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-indigo-500/10 pb-4 mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-cyan-400" />
              আমার বই ও ব্যক্তিগত রিডিং ট্র্যাকার
            </h2>
            <p className="text-xs text-slate-400">আপনার বর্তমান ধার করা বই, জমাদেয়ার ডেডলাইন এবং সম্পূর্ণ পঠন ইতিহাস</p>
          </div>

          {memberProfileLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-2" size={24} />
              <p className="text-xs text-slate-400">রিডিং রেকর্ড লোড হচ্ছে...</p>
            </div>
          ) : memberProfileError ? (
            <div className="p-4 bg-red-950/45 border border-red-500/25 rounded-2xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{memberProfileError}</span>
            </div>
          ) : !memberProfile ? (
            <div className="glass-panel p-8 text-center rounded-2xl border border-white/5">
              <p className="text-slate-500 text-xs italic">কোনো ট্র্যাকিং রেকর্ড পাওয়া যায়নি।</p>
            </div>
          ) : (() => {
             const activeRents = memberProfile.activeRents || [];
             const returnedHistory = memberProfile.returnedHistory || [];
             const rentCount = memberProfile.rentCount || 0;
             const today = new Date();
             today.setHours(0,0,0,0);

             const overdueRents = activeRents.filter((i: any) => {
               if (!i.returnDate) return false;
               const rDate = new Date(i.returnDate);
               rDate.setHours(0,0,0,0);
               return today > rDate;
             });

             return (
               <div className="space-y-6">
                 {/* Member Profile Card Details */}
                 {memberProfile.member && (
                   <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 bg-[#0c101d]/60 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
                     <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>
                     <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <div className="space-y-1 text-left">
                         <div className="flex flex-wrap items-center gap-2">
                           <h3 className="text-base sm:text-lg font-bold text-white">{memberProfile.member.name}</h3>
                           <span className="px-2 py-0.5 bg-purple-950 border border-purple-500/30 text-purple-300 rounded text-[10px] font-bold font-mono">
                             ID: #{memberProfile.member.formNumber}
                           </span>
                         </div>
                         <p className="text-xs text-slate-400">
                           📍 ঠিকানা: {memberProfile.member.address || "অজ্ঞাত ঠিকানা"}
                         </p>
                         
                         {(memberProfile.member.educationInstitution || memberProfile.member.className || memberProfile.member.classRoll) && (
                           <div className="text-[11px] text-purple-300 pt-1 flex flex-wrap gap-2 items-center">
                             {memberProfile.member.educationInstitution && (
                               <span className="bg-purple-950/40 border border-purple-500/10 px-2 py-0.5 rounded">
                                 🏫 {memberProfile.member.educationInstitution}
                               </span>
                             )}
                             {memberProfile.member.className && (
                               <span className="bg-purple-950/40 border border-purple-500/10 px-2 py-0.5 rounded">
                                 শ্রেণী: {memberProfile.member.className}
                               </span>
                             )}
                             {memberProfile.member.classRoll && (
                               <span className="bg-purple-950/40 border border-purple-500/10 px-2 py-0.5 rounded">
                                 রোল: {memberProfile.member.classRoll}
                               </span>
                             )}
                           </div>
                         )}
                       </div>

                       <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
                         <div className="px-3 py-2 bg-[#05070f]/80 border border-cyan-500/10 rounded-xl text-left flex-1 md:flex-none min-w-[120px]">
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">মোবাইল নম্বর</p>
                           <p className="text-xs font-semibold text-cyan-300 font-mono mt-0.5">{memberProfile.member.mobile}</p>
                         </div>
                         
                         <div className="px-3 py-2 bg-[#05070f]/80 border border-purple-500/10 rounded-xl text-left flex-1 md:flex-none min-w-[120px]">
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">📅 জন্ম তারিখ (DOB)</p>
                           <p className="text-xs font-semibold text-purple-300 font-mono mt-0.5">{memberProfile.member.dob || "সংরক্ষিত নেই"}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Stats Cards Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="glass-panel p-5 rounded-2xl border border-blue-500/10 flex items-center gap-4 bg-slate-900/30">
                     <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                       <BookOpen size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">বর্তমানে পঠিত বই (Issued)</p>
                       <p className="text-2xl font-black text-white mt-1 font-mono">{activeRents.length} টি</p>
                     </div>
                   </div>

                   <div className="glass-panel p-5 rounded-2xl border border-rose-500/10 flex items-center gap-4 bg-slate-900/30">
                     <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400">
                       <Clock size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">সময়সীমা অতিক্রান্ত বই (Overdue)</p>
                       <p className={`text-2xl font-black mt-1 font-mono ${overdueRents.length > 0 ? "text-rose-400 animate-pulse" : "text-white"}`}>{overdueRents.length} টি</p>
                     </div>
                   </div>

                   <div className="glass-panel p-5 rounded-2xl border border-purple-500/10 flex items-center gap-4 bg-slate-900/30">
                     <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                       <FileText size={20} />
                     </div>
                     <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">সর্বমোট পঠিত বই (Total History)</p>
                       <p className="text-2xl font-black text-white mt-1 font-mono">{rentCount} টি</p>
                     </div>
                   </div>
                 </div>

                 {/* Lists Layout */}
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Left Column: Presently Borrowed & Overdue Alerts */}
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">বর্তমানে আপনার কাছে থাকা বইসমূহ</h3>
                       {overdueRents.length > 0 && (
                         <span className="px-2.5 py-0.5 bg-red-950 text-red-400 text-[9px] font-black border border-red-500/25 rounded-full animate-bounce">
                           ⚠️ জমাদেয়ার ডেট পার হয়েছে!
                         </span>
                       )}
                     </div>

                     {activeRents.length === 0 ? (
                       <div className="glass-panel p-8 text-center rounded-2xl border border-white/5">
                         <p className="text-slate-500 text-xs italic">এই মুহূর্তে আপনার নিকট কোনো বই ইস্যু করা নেই।</p>
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {activeRents.map((item: any) => {
                           const rDate = new Date(item.returnDate);
                           rDate.setHours(0,0,0,0);
                           const isOverdue = today > rDate;
                           return (
                             <div 
                               key={item.id} 
                               className={`glass-panel p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${isOverdue ? "border-red-500/30 bg-red-950/10" : "border-white/5"}`}
                             >
                               <div className="flex justify-between items-start gap-2">
                                 <div>
                                   <span className="px-1.5 py-0.5 rounded font-mono text-[8px] font-bold bg-indigo-900/40 text-indigo-300 tracking-wider">
                                     {item.bookCode}
                                   </span>
                                   <h4 className="font-bold text-white text-sm mt-1">{item.bookName}</h4>
                                   <p className="text-[10px] text-slate-400 mt-0.5">লেখক: {item.author || "অজানা লেখক"}</p>
                                 </div>
                                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${isOverdue ? "bg-red-950 text-red-400 border border-red-500/30" : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"}`}>
                                   {isOverdue ? "Overdue" : "Active"}
                                 </span>
                               </div>

                               <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] pt-2 border-t border-white/5 text-slate-400 gap-1.5">
                                 <span>ইস্যু ডেট: <strong className="text-slate-300 font-mono">{item.issueDate}</strong></span>
                                 <span>ফেরত ডেট: <strong className={`${isOverdue ? "text-red-400 font-black" : "text-slate-300"} font-mono`}>{item.returnDate}</strong></span>
                               </div>

                               {isOverdue && (
                                 <div className="bg-red-950/40 border border-red-500/20 px-3 py-2 rounded-lg text-[10px] text-red-400 flex items-center gap-1.5">
                                   <AlertCircle size={12} className="shrink-0" />
                                   <span>অনুগ্রহ করে বইটি দ্রুত লাইব্রেরিতে এসে জমা দিন বা ডেট রিনিউ করুন।</span>
                                 </div>
                               )}
                             </div>
                           );
                         })}
                       </div>
                     )}
                   </div>

                   {/* Right Column: Complete Borrow History */}
                   <div className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">ধারকৃত সকল বইয়ের ইতিহাস (রিড বুকস)</h3>
                     
                     {returnedHistory.length === 0 && activeRents.length === 0 ? (
                       <div className="glass-panel p-8 text-center rounded-2xl border border-white/5">
                         <p className="text-slate-500 text-xs italic">আপনার পূর্ববর্তী কোনো ট্র্যাকিং ইতিহাস নেই।</p>
                       </div>
                     ) : (
                       <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                         {[...activeRents, ...returnedHistory]
                           .sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                           .map((item: any, idx: number) => {
                             const isReturned = item.status === "Returned";
                             return (
                               <div key={item.id || idx} className="p-3.5 flex justify-between items-center gap-3">
                                 <div>
                                   <h4 className="text-xs font-bold text-white">{item.bookName}</h4>
                                   <p className="text-[10px] text-slate-500 mt-0.5">
                                     কোড: <span className="font-mono">{item.bookCode}</span> | ইস্যু: <span className="font-mono">{item.issueDate}</span>
                                   </p>
                                 </div>
                                 <div className="text-right shrink-0">
                                   {isReturned ? (
                                     <span className="px-2 py-0.5 rounded bg-slate-900/40 text-slate-400 border border-white/5 text-[9px] font-bold">
                                       ফেরত দেওয়া হয়েছে
                                     </span>
                                   ) : (
                                     <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-500/25 text-[9px] font-bold">
                                       আপনার নিকট আছে
                                     </span>
                                   )}
                                   <p className="text-[9px] text-slate-500 mt-1 font-mono">আইডি: #{item.id}</p>
                                 </div>
                               </div>
                             );
                           })}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             );
          })()}
        </div>
      )}

      {/* 6. PUBLIC SALES CORNER / SHOP TAB */}
      {activeTab === "shop" && (
        <div className="animate-in fade-in duration-150 text-left">
          <SalesCorner isAdmin={false} />
        </div>
      )}

    </div>
  );
}
