import React from "react";
import { BookOpen, CheckCircle, ShieldAlert, Award, FileSpreadsheet, Users, RefreshCw, Send, ArrowUpRight, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { DashboardData } from "../types";

interface DashboardProps {
  data: DashboardData | null;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
  onPostSmsCheck: () => void;
}

export default function Dashboard({ data, onRefresh, onNavigate, onPostSmsCheck }: DashboardProps) {
  // Skeleton loader for ultra-modern instant feedback
  if (!data) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200/80">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton-shimmer rounded-xl"></div>
            <div className="h-4 w-72 skeleton-shimmer rounded-lg"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-44 skeleton-shimmer rounded-xl"></div>
            <div className="h-10 w-10 skeleton-shimmer rounded-xl"></div>
          </div>
        </div>

        {/* 6 Metric Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-3 w-16 skeleton-shimmer rounded"></div>
                <div className="h-6 w-6 skeleton-shimmer rounded-full"></div>
              </div>
              <div className="h-8 w-20 skeleton-shimmer rounded-lg"></div>
              <div className="h-3 w-24 skeleton-shimmer rounded"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-panel p-6 h-64 skeleton-shimmer"></div>
          <div className="glass-panel p-6 h-64 skeleton-shimmer"></div>
        </div>

        {/* Table Skeleton */}
        <div className="glass-panel p-6 space-y-4">
          <div className="h-6 w-56 skeleton-shimmer rounded-lg"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 w-full skeleton-shimmer rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { stats, charts } = data;

  const safeCharts = {
    monthlyReport: charts?.monthlyReport || [],
    popularBooks: charts?.popularBooks || [],
    activeMembers: charts?.activeMembers || [],
    lateReportLoans: charts?.lateReportLoans || [],
  };

  const maxIssuesInChart = safeCharts.monthlyReport.length > 0
    ? Math.max(...safeCharts.monthlyReport.map(item => Math.max(item.issues, item.returns, 1)))
    : 1;

  const chartHeight = 170;
  const paddingBottom = 28;
  const listCount = safeCharts.monthlyReport.length;

  // Stagger container animation variant
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="space-y-7"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      
      {/* 1. Modern Header with Title and Sync Trigger */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200/80"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              পেশাদার ড্যাশবোর্ড
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              <Sparkles size={11} className="text-indigo-600" />
              লাইভ ওভারভিউ
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">পাঠাগার পরিচালনা, সক্রিয় লেনদেন ও সদস্যদের রিয়েল-টাইম পরিমাপক পরিসংখ্যান</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onPostSmsCheck}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:border-amber-400/80 hover:bg-amber-50/30 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all duration-200 group"
          >
            <Send size={14} className="text-amber-600 group-hover:scale-110 transition-transform" />
            <span>অবিলম্বে SMS শিডিউল সিঙ্ক</span>
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center justify-center p-2.5 rounded-xl bg-white text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow cursor-pointer transition-all duration-200 active:scale-95"
            title="পরিসংখ্যান রিফ্রেশ করুন"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* 2. Top Metric Desk (6 Cards with High-Polish Glass Accents) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Books */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("books")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-indigo-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">মোট বই</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stats.totalBooks}</h3>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              তালিকা দেখুন <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

        {/* Card 2: Available Books */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("books")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-emerald-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">উপলব্ধ বই</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stats.availableBooks}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              লেনদেন যোগ্য <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

        {/* Card 3: Issued Books */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("issue")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-amber-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">ধারকৃত বই</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stats.issuedBooks}</h3>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              রিটার্ন গ্রহণ <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

        {/* Card 4: Overdue Books */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("sms")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-rose-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">মেয়াদোত্তীর্ণ</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono tracking-tight">{stats.lateBooks}</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              সতর্কতা প্রেরণ <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

        {/* Card 5: Today's Transactions */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("history")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-violet-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">আজকের লেনদেন</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-200">
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stats.todaysTransactions}</h3>
            <p className="text-[11px] text-violet-600 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              হিস্ট্রি দেখুন <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

        {/* Card 6: Total Members */}
        <motion.button
          type="button" 
          variants={itemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          onClick={() => onNavigate("members")}
          className="w-full text-left glass-panel p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer border-slate-200/80 hover:border-cyan-300/80"
        >
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-xs font-medium">সদস্য সংখ্যা</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 group-hover:bg-cyan-700 group-hover:text-white transition-colors duration-200">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3.5">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stats.totalMembers}</h3>
            <p className="text-[11px] text-cyan-700 font-semibold mt-1 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              সদস্য তালিকা <ArrowUpRight size={12} />
            </p>
          </div>
        </motion.button>

      </div>

      {/* 3. Deep Analytic Charts Layout (Ultra-Modern Responsive SVG) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Chart A: Monthly issue/returns (7 Cols) */}
        <motion.div variants={itemVariants} className="xl:col-span-7 glass-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>মাসভিত্তিক বই লেনদেন পরিসংখ্যান</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">বিগত ৬ মাসের বই ইস্যু ও জমাদানের তুলনামূলক চিত্র</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-sans font-medium bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>ইস্যু
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>ফিরতি
                </span>
              </div>
            </div>

            <div className="w-full relative py-2">
              {safeCharts.monthlyReport.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <BookOpen size={24} className="opacity-40" />
                  <span>কোনো মাসিক ডেটা রেকর্ড পাওয়া যায়নি</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[420px]">
                    <svg viewBox={`0 0 500 ${chartHeight}`} className="w-full h-48 overflow-visible font-sans">
                      <defs>
                        <linearGradient id="issueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                        <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const yVal = chartHeight - paddingBottom - ratio * (chartHeight - paddingBottom - 12);
                        const num = Math.round(ratio * maxIssuesInChart);
                        return (
                          <g key={i} className="opacity-60">
                            <line x1="36" y1={yVal} x2="480" y2={yVal} stroke="#E2E8F0" strokeDasharray="4,4" strokeWidth="1" />
                            <text x="28" y={yVal + 3} fill="#94A3B8" fontSize="10" textAnchor="end" fontFamily="monospace">{num}</text>
                          </g>
                        );
                      })}

                      {/* Side-by-side bars */}
                      {safeCharts.monthlyReport.map((item, idx) => {
                        const colWidth = 440 / listCount;
                        const xBase = 46 + idx * colWidth + colWidth / 4;
                        const barWidth = 13;
                        const issueBarHeight = ((item.issues || 0) / maxIssuesInChart) * (chartHeight - paddingBottom - 22);
                        const returnBarHeight = ((item.returns || 0) / maxIssuesInChart) * (chartHeight - paddingBottom - 22);

                        const issueY = chartHeight - paddingBottom - issueBarHeight;
                        const returnY = chartHeight - paddingBottom - returnBarHeight;

                        return (
                          <g key={idx} className="group cursor-pointer">
                            {/* Issue bar */}
                            <rect
                              x={xBase - barWidth - 1}
                              y={issueY}
                              width={barWidth}
                              height={Math.max(issueBarHeight, 3)}
                              fill="url(#issueGradient)"
                              rx="5"
                              className="transition-all duration-300 hover:opacity-85"
                            />
                            {/* Return bar */}
                            <rect
                              x={xBase + 2}
                              y={returnY}
                              width={barWidth}
                              height={Math.max(returnBarHeight, 3)}
                              fill="url(#returnGradient)"
                              rx="5"
                              className="transition-all duration-300 hover:opacity-85"
                            />
                            {/* Value label on top */}
                            <text x={xBase} y={Math.min(issueY, returnY) - 6} fill="#0F172A" fontSize="9" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.issues}/{item.returns}
                            </text>
                            {/* Month bottom label */}
                            <text x={xBase} y={chartHeight - 6} fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="600">
                              {item.month}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>সর্বোচ্চ লেনদেন মাত্রা: <strong className="text-slate-800 font-mono">{maxIssuesInChart}</strong> টি</span>
            <button onClick={() => onNavigate("history")} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              সম্পূর্ণ লগ রেজিস্ট্রি দেখুন →
            </button>
          </div>
        </motion.div>

        {/* Chart B: Top 5 Popular Books & Top 5 Active Readers (5 Cols) */}
        <motion.div variants={itemVariants} className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-6">
          
          {/* Popular books */}
          <div className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  জনপ্রিয় বইসমূহ (Top 5)
                </h3>
                <span className="text-[10px] text-slate-500 font-medium font-mono">ইস্যু সংখ্যা</span>
              </div>

              {safeCharts.popularBooks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো বুক ট্রানজেকশন হিস্ট্রি নেই</p>
              ) : (
                <div className="space-y-2.5">
                  {safeCharts.popularBooks.slice(0, 4).map((item, i) => (
                    <div key={item.code} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-100 transition-all">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-9 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-9 h-12 rounded-lg bg-indigo-100/60 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {item.code ? item.code.slice(0, 3) : "BOK"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            <span className={`inline-block text-[10px] font-mono px-1.5 py-0.2 mr-1.5 rounded-md ${i === 0 ? 'bg-amber-100 text-amber-800 font-bold' : i === 1 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
                              #{i + 1}
                            </span>
                            {item.name || "অজানা বই"}
                          </p>
                          <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
                            {item.count} বার
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.author || "অজানা লেখক"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Members */}
          <div className="glass-panel p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3.5">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  সক্রিয় পাঠক সদস্য (Top Readers)
                </h3>
                <span className="text-[10px] text-slate-500 font-medium font-mono">পঠিত বই</span>
              </div>

              {safeCharts.activeMembers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">কোনো সক্রিয় পাঠক তথ্য নেই</p>
              ) : (
                <div className="space-y-2">
                  {safeCharts.activeMembers.slice(0, 3).map((item, i) => (
                    <div key={item.formNumber} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/60 hover:bg-slate-100/80 border border-slate-100 transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {item.name ? item.name.charAt(0) : "ম"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{item.name || "অজানা সদস্য"}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ফরম #{item.formNumber} • {item.mobile || "মোবাইল অপ্রাপ্য"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shrink-0">
                        {item.count} টি
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </motion.div>

      </div>

      {/* 4. Display List of Overdue Loans (Sleek Data-Dense Table) */}
      <motion.div variants={itemVariants} className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h3 className="text-base font-bold text-slate-900">
                অপ্রদত্ত ও মেয়াদোত্তীর্ণ বই তালিকা (Late Returns)
              </h3>
            </div>
            <p className="text-slate-500 text-xs mt-1">নিচের সদস্যদের বই জমা দেওয়ার সময়সীমা অতিবাহিত হয়েছে। তাদের SMS রিকল শিডিউল সচল আছে।</p>
          </div>
          <button
            onClick={() => onNavigate("sms")}
            className="text-xs text-slate-700 hover:text-indigo-600 font-bold bg-slate-100/80 hover:bg-slate-200/70 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>সতর্কীকরণ SMS প্যানেল</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {safeCharts.lateReportLoans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <CheckCircle size={28} className="text-emerald-500" />
            <span className="font-semibold text-slate-700">অসাধারণ! বর্তমানে কোনো মেয়াদোত্তীর্ণ বই পেন্ডিং নেই।</span>
            <span className="text-[11px] text-slate-400">সকল ধারকৃত বই নির্ধারিত সময়সীমার মধ্যে রয়েছে।</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50/90 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200/80 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="py-3 px-4 font-semibold">বই বিবরণ</th>
                  <th className="py-3 px-4 font-semibold">সদস্য তথ্য</th>
                  <th className="py-3 px-4 font-semibold">মোবাইল নম্বর</th>
                  <th className="py-3 px-4 font-mono font-semibold">নির্ধারিত সময়সীমা</th>
                  <th className="py-3 px-4 font-semibold text-center">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeCharts.lateReportLoans.map((item, idx) => (
                  <tr key={item.id} className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-indigo-50/30`}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{item.bookName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{item.bookCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{item.memberName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">ফরম #{item.formNumber}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{item.mobile}</td>
                    <td className="py-3 px-4 text-rose-600 font-bold font-mono">{item.returnDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        OVERDUE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
