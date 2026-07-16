import React from "react";
import { BookOpen, CheckCircle, ShieldAlert, Award, FileSpreadsheet, Users, RefreshCw, Send } from "lucide-react";
import { DashboardData } from "../types";

interface DashboardProps {
  data: DashboardData | null;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
  onPostSmsCheck: () => void;
}

export default function Dashboard({ data, onRefresh, onNavigate, onPostSmsCheck }: DashboardProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-[#22242A] mb-4 h-10 w-10" />
        <span className="text-[#6B6B70] font-semibold font-sans">ড্যাশবোর্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  const { stats, charts } = data;

  // Maximum issues for normalizer mapping
  const maxIssuesInChart = Math.max(...charts.monthlyReport.map(item => Math.max(item.issues, item.returns, 1)));

  // SVG Chart calculation parameters
  const chartHeight = 160;
  const paddingBottom = 25;
  const listCount = charts.monthlyReport.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Title and Sync Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5EA] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#22242A] tracking-tight flex items-center gap-2">
            <span>পেশাদার ড্যাশবোর্ড</span>
          </h2>
          <p className="text-[#6B6B70] text-xs mt-1">পাঠাগার পরিচালনার রিয়েল-টাইম পরিমাপক পরিসংখ্যান</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onPostSmsCheck}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold border border-[#E5E5EA] bg-white text-[#22242A] rounded-full hover:border-[#22242A]/30 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors"
          >
            <Send size={14} className="text-[#FACC15]" />
            অবিলম্বে SMS শিডিউল সিঙ্ক
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center justify-center p-2 rounded-full bg-white border border-[#E5E5EA] hover:border-[#22242A]/30 cursor-pointer text-[#6B6B70] hover:text-[#22242A] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Desk */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* Total books card */}
        <button
          type="button" 
          onClick={() => onNavigate("books")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">মোট বই সংখ্যা</span>
            <BookOpen size={18} className="text-[#FACC15]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.totalBooks}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">তালিকা দেখুন →</p>
          </div>
        </button>

        {/* Available books card */}
        <button
          type="button" 
          onClick={() => onNavigate("books")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">উপলব্ধ বই</span>
            <CheckCircle size={18} className="text-[#FACC15]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.availableBooks}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">তাত্ক্ষণিক লেনদেন যোগ্য →</p>
          </div>
        </button>

        {/* Issued card */}
        <button
          type="button" 
          onClick={() => onNavigate("issue")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">ধারকৃত বই</span>
            <BookOpen size={18} className="text-[#FF6B6B]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.issuedBooks}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">রিটার্ন গ্রহণ করুন →</p>
          </div>
        </button>

        {/* Late Returns card */}
        <button
          type="button" 
          onClick={() => onNavigate("sms")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">বিলম্বিত বই (Overdue)</span>
            <ShieldAlert size={18} className="text-[#FF6B6B]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.lateBooks}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">সতর্কতা প্রেরণ →</p>
          </div>
        </button>

        {/* Today's Transactions card */}
        <button
          type="button" 
          onClick={() => onNavigate("history")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">আজকের লেনদেন</span>
            <FileSpreadsheet size={18} className="text-[#22242A]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.todaysTransactions}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">লগ হিস্ট্রি →</p>
          </div>
        </button>

        {/* Total Members card */}
        <button
          type="button" 
          onClick={() => onNavigate("members")}
          className="w-full text-left glass-panel p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">মোট সদস্য সংখ্যা</span>
            <Users size={18} className="text-[#22242A]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{stats.totalMembers}</h3>
            <p className="text-[10px] text-[#22242A] mt-1 font-semibold group-hover:underline">সদস্য প্যানেল →</p>
          </div>
        </button>

      </div>

      {/* 3. Deep Analytic Charts Layout (Custom Responsive SVG Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Chart A: Monthly issue/returns */}
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold text-[#22242A]">মাসভিত্তিক বই লেনদেন</h3>
              <p className="text-[#6B6B70] text-[11px]">বিগত ৬ মাসের বই ইস্যু এবং জমা রেকর্ডের তুলনামূলক রেখাচিত্র</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#6B6B70] font-sans font-medium">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#22242A]"></span>ইস্যু
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#FACC15] ml-1"></span>ফিরতি
            </div>
          </div>

          <div className="w-full relative py-2">
            {charts.monthlyReport.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-[#6B6B70] text-xs">কোনো ডাটা পাওয়া যায়নি।</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Dynamic Custom Chart with interactive SVG layout */}
                  <svg viewBox={`0 0 500 ${chartHeight}`} className="w-full h-44 overflow-visible font-sans">
                    {/* Horizontal lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const yVal = chartHeight - paddingBottom - ratio * (chartHeight - paddingBottom - 10);
                      const num = Math.round(ratio * maxIssuesInChart);
                      return (
                        <g key={i} className="opacity-40">
                          <line x1="40" y1={yVal} x2="480" y2={yVal} stroke="#E5E5EA" strokeDasharray="3,3" strokeWidth="1" />
                          <text x="32" y={yVal + 3} fill="#6B6B70" fontSize="9" textAnchor="end">{num}</text>
                        </g>
                      );
                    })}

                    {/* Rendering double bars side by side */}
                    {charts.monthlyReport.map((item, idx) => {
                      const colWidth = 440 / listCount;
                      const xBase = 50 + idx * colWidth + colWidth / 4;
                      
                      const barWidth = 14;
                      const issueBarHeight = ((item.issues || 0) / maxIssuesInChart) * (chartHeight - paddingBottom - 20);
                      const returnBarHeight = ((item.returns || 0) / maxIssuesInChart) * (chartHeight - paddingBottom - 20);

                      const issueY = chartHeight - paddingBottom - issueBarHeight;
                      const returnY = chartHeight - paddingBottom - returnBarHeight;

                      return (
                        <g key={idx} className="group">
                          {/* Issue bar */}
                          <rect
                            x={xBase - barWidth}
                            y={issueY}
                            width={barWidth}
                            height={Math.max(issueBarHeight, 2)}
                            fill="#22242A"
                            rx="4"
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          />
                          {/* Return bar */}
                          <rect
                            x={xBase + 2}
                            y={returnY}
                            width={barWidth}
                            height={Math.max(returnBarHeight, 2)}
                            fill="#FACC15"
                            rx="4"
                            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                          />
                          {/* Hover tooltip hint labels */}
                          <text x={xBase} y={Math.min(issueY, returnY) - 8} fill="#22242A" fontSize="9" fontWeight="bold" textAnchor="middle" className="hidden group-hover:block bg-white p-1 rounded">
                            ই:{item.issues} / ফে:{item.returns}
                          </text>
                          {/* Label bottom */}
                          <text x={xBase} y={chartHeight - 8} fill="#6B6B70" fontSize="10" textAnchor="middle" fontWeight="600">
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

        {/* Chart B: Popular Books and Active Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Popular books */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#22242A] mb-4 flex items-center gap-2">
                <Award size={16} className="text-[#FACC15]" />
                সবচেয়ে জনপ্রিয় বইসমূহ
              </h3>
              {charts.popularBooks.length === 0 ? (
                <p className="text-[11px] text-[#6B6B70] py-6">কোনো বুক ট্রানজেকশন হিস্ট্রি নেই।</p>
              ) : (
                <div className="space-y-4">
                  {charts.popularBooks.map((item, i) => {
                    const topCount = charts.popularBooks[0]?.count || 1;
                    const pct = (item.count / topCount) * 100;
                    return (
                      <button type="button" key={item.code} className="w-full text-left group cursor-pointer block" onClick={() => onNavigate("search-smart")}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-[#22242A] truncate max-w-[120px]">{item.name}</span>
                          <span className="text-[#6B6B70] font-bold font-mono">{item.count} বার</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                          <div
                            className="bg-[#22242A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active members */}
          <div className="glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#22242A] mb-4 flex items-center gap-2">
                <Users size={16} className="text-[#FACC15]" />
                সবচেয়ে সক্রিয় পাঠক সদস্য
              </h3>
              {charts.activeMembers.length === 0 ? (
                <p className="text-[11px] text-[#6B6B70] py-6">কোনো সদস্য লিজ ইতিহাস পাওয়া যায়নি।</p>
              ) : (
                <div className="space-y-4">
                  {charts.activeMembers.map((item, i) => {
                    const topCount = charts.activeMembers[0]?.count || 1;
                    const pct = (item.count / topCount) * 100;
                    return (
                      <button type="button" key={item.formNumber} className="w-full text-left group cursor-pointer hover:bg-black/5 p-1 -mx-1 rounded block" onClick={() => onNavigate("members")}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-[#22242A] truncate max-w-[120px]">{item.name}</span>
                          <span className="text-[#6B6B70] font-bold font-mono">#{item.formNumber} ({item.count})</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E5EA] rounded-full overflow-hidden">
                          <div
                            className="bg-[#22242A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Display list of overdue loans */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B6B]"></span>
              অপ্রদত্ত ও মেয়াদোত্তীর্ণ বই তালিকা (Late Returns)
            </h3>
            <p className="text-[#6B6B70] text-[10px] mt-1">নিচের সদস্যদের বই জমা দেওয়ার সময়সীমা অতিবাহিত হয়েছে। তাদের SMS রিকল শিডিউল সচল আছে।</p>
          </div>
          <button
            onClick={() => onNavigate("sms")}
            className="text-xs text-[#22242A] hover:underline cursor-pointer font-bold bg-[#F5F3EF] px-3 py-1.5 rounded-full"
          >
            সতর্কীকরণ SMS প্যানেল →
          </button>
        </div>

        {charts.lateReportLoans.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6B6B70]">অসাধারণ! বর্তমানে কোনো মেয়াদোত্তীর্ণ বই পেন্ডিং নেই।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#22242A]">
              <thead>
                <tr className="border-b border-[#E5E5EA] text-[#6B6B70] text-[10px] uppercase font-bold">
                  <th className="py-3 font-medium">বই বিবরণ</th>
                  <th className="py-3 font-medium">সদস্য তথ্য</th>
                  <th className="py-3 font-medium">মোবাইল নম্বর</th>
                  <th className="py-3 font-mono font-medium">নির্ধারিত সময়সীমা</th>
                  <th className="py-3 font-medium">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {charts.lateReportLoans.map(item => (
                  <tr key={item.id} className="hover:bg-[#F5F3EF] duration-150">
                    <td className="py-3">
                      <p className="font-bold text-[#22242A]">{item.bookName}</p>
                      <p className="text-[10px] text-[#6B6B70] font-mono mt-0.5">{item.bookCode}</p>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-[#22242A]">{item.memberName}</p>
                      <p className="text-[10px] text-[#6B6B70] font-mono mt-0.5">ফরম: #{item.formNumber}</p>
                    </td>
                    <td className="py-3 font-mono text-[#22242A]">{item.mobile}</td>
                    <td className="py-3 text-[#FF6B6B] font-bold font-mono">{item.returnDate}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded text-[9px] font-bold bg-[#FF6B6B]/10 text-[#FF6B6B]">
                        OVERDUE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
