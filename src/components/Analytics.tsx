import React, { useState, useEffect } from "react";
import { RefreshCw, BarChart3, Eye, TrendingUp, Calendar } from "lucide-react";
import { apiClient } from "../api";

interface TrafficDay {
  date: string;
  view_count: number;
}

export default function Analytics() {
  const [data, setData] = useState<TrafficDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<7 | 30>(7);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/analytics");
      setData(res.data || []);
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-[#22242A] mb-4 h-10 w-10" />
        <span className="text-[#6B6B70] font-semibold font-sans">অ্যানালিটিক্স লোড হচ্ছে...</span>
      </div>
    );
  }

  // Filter data based on selected range
  const filtered = data.slice(-range);
  const totalViews = filtered.reduce((sum, d) => sum + d.view_count, 0);
  const avgViews = filtered.length > 0 ? Math.round(totalViews / filtered.length) : 0;
  const maxViews = Math.max(...filtered.map(d => d.view_count), 1);
  const todayViews = filtered.length > 0 ? filtered[filtered.length - 1].view_count : 0;

  // SVG Chart parameters (consistent with Dashboard.tsx)
  const chartWidth = 700;
  const chartHeight = 200;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const drawWidth = chartWidth - paddingLeft - paddingRight;
  const drawHeight = chartHeight - paddingTop - paddingBottom;
  const barCount = filtered.length;
  const barGap = Math.max(2, Math.floor(drawWidth / barCount * 0.2));
  const barWidth = barCount > 0 ? Math.max(6, (drawWidth - barGap * barCount) / barCount) : 20;

  // Y-axis labels
  const ySteps = 5;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((maxViews / ySteps) * i));

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ["জানু", "ফেব", "মার্চ", "এপ্রি", "মে", "জুন", "জুলা", "আগ", "সেপ্ট", "অক্টো", "নভে", "ডিসে"];
    return `${day} ${months[d.getMonth()]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={22} className="text-[#22242A]" />
          <h2 className="text-xl font-bold text-[#22242A]">ভিজিটর ও পারফরম্যান্স অ্যানালিটিক্স</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRange(7)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              range === 7 ? "bg-[#22242A] text-white" : "bg-gray-100 text-[#6B6B70] hover:bg-gray-200"
            }`}
          >
            ৭ দিন
          </button>
          <button
            onClick={() => setRange(30)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              range === 30 ? "bg-[#22242A] text-white" : "bg-gray-100 text-[#6B6B70] hover:bg-gray-200"
            }`}
          >
            ৩০ দিন
          </button>
          <button
            onClick={loadData}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
            title="রিফ্রেশ"
          >
            <RefreshCw size={14} className="text-[#6B6B70]" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">আজকের ভিজিট</span>
            <Eye size={18} className="text-[#22242A]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{todayViews}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">মোট ভিজিট ({range === 7 ? "৭ দিন" : "৩০ দিন"})</span>
            <TrendingUp size={18} className="text-[#22242A]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{totalViews}</h3>
          </div>
        </div>

        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#6B6B70] text-xs font-medium">দৈনিক গড়</span>
            <Calendar size={18} className="text-[#22242A]" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#22242A] font-mono">{avgViews}</h3>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-[#22242A] mb-4">
          দৈনিক ভিজিটর চার্ট ({range === 7 ? "গত ৭ দিন" : "গত ৩০ দিন"})
        </h3>

        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-[#6B6B70] text-sm">
            কোনো ট্রাফিক ডেটা পাওয়া যায়নি
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full"
              style={{ minWidth: range === 30 ? "600px" : "400px" }}
            >
              {/* Y-axis grid lines and labels */}
              {yLabels.map((val, i) => {
                const y = paddingTop + drawHeight - (drawHeight * val) / maxViews;
                return (
                  <g key={`y-${i}`}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth={1}
                      strokeDasharray={i === 0 ? "0" : "4,4"}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill="#6B6B70"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {filtered.map((day, i) => {
                const x = paddingLeft + i * (barWidth + barGap) + barGap / 2;
                const barH = (day.view_count / maxViews) * drawHeight;
                const y = paddingTop + drawHeight - barH;

                return (
                  <g key={day.date}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barH, 1)}
                      rx={3}
                      fill="#22242A"
                      opacity={0.85}
                    >
                      <title>{`${formatDate(day.date)}: ${day.view_count} ভিজিট`}</title>
                    </rect>

                    {/* Value on top */}
                    {day.view_count > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        textAnchor="middle"
                        fontSize={9}
                        fontWeight="bold"
                        fill="#22242A"
                      >
                        {day.view_count}
                      </text>
                    )}

                    {/* X-axis label */}
                    {(range === 7 || i % 3 === 0 || i === filtered.length - 1) && (
                      <text
                        x={x + barWidth / 2}
                        y={paddingTop + drawHeight + 16}
                        textAnchor="middle"
                        fontSize={9}
                        fill="#6B6B70"
                      >
                        {formatDate(day.date)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold text-[#22242A] mb-3">বিস্তারিত তথ্য</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-[#6B6B70] font-medium">তারিখ</th>
                <th className="text-right py-2 px-3 text-[#6B6B70] font-medium">ভিজিট সংখ্যা</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((day) => (
                <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-[#22242A]">{formatDate(day.date)}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-[#22242A]">{day.view_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
