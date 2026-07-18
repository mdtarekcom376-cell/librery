import React from "react";
import { ArrowLeft, Bell, Calendar, Clock } from "lucide-react";
import { motion } from "motion/react";

interface PublicNoticeDetailsPageProps {
  notice: {
    id: string;
    subject: string;
    content: string;
    image?: string | null;
    createdAt: string;
  };
  onBack: () => void;
  logoBase64?: string;
}

export default function PublicNoticeDetailsPage({
  notice,
  onBack,
  logoBase64,
}: PublicNoticeDetailsPageProps) {
  const logoSrc = logoBase64 || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-[#E5E5EA] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#E5E5EA] text-slate-600 hover:bg-slate-50"
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
                <h1
                  className="text-sm md:text-base font-bold flex items-center gap-2"
                  style={{
                    color: "var(--ink-navy)",
                    fontFamily: "'Noto Serif Bengali', serif",
                  }}
                >
                  <Bell size={16} style={{ color: "var(--flame-orange)" }} />
                  নোটিশ পরিচিতি
                </h1>
                <p
                  className="text-[10px]"
                  style={{ color: "#64748b", fontFamily: "'Fraunces', serif" }}
                >
                  Akkhor Notice Details
                </p>
              </div>
            </div>
          </div>

          {/* Right: Badge */}
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA]">
            <Calendar size={10} />
            {notice.createdAt || "তারিখ নেই"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="max-w-4xl mx-auto px-4 py-8 md:py-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E5EA] shadow-sm">
          {/* Notice Image (full-width top) */}
          {notice.image && (
            <div className="w-full bg-slate-50 border-b border-[#E5E5EA] overflow-hidden">
              <img
                src={notice.image}
                alt={notice.subject}
                className="w-full max-h-[420px] object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {/* Notice Content */}
          <div className="p-6 md:p-10">
            {/* Date */}
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} style={{ color: "var(--flame-orange)" }} />
              <span
                className="text-xs font-ui font-bold"
                style={{ color: "var(--flame-orange)" }}
              >
                {notice.createdAt}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl md:text-4xl font-bold text-[#22242A] mb-6 leading-tight font-display-bn"
            >
              {notice.subject}
            </h2>

            {/* Full Content */}
            <div
              className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-body-bn"
              style={{ color: "#374151" }}
            >
              {notice.content}
            </div>
          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center bg-slate-50 border-[#E5E5EA]">
        <p
          className="text-xs text-[#8E8E93] font-bold"
          style={{ fontFamily: "'Noto Serif Bengali', serif" }}
        >
          © ২০২৬ অক্ষর পাঠাগার। সর্বস্বত্ব সংরক্ষিত। বাংলায় তৈরি 🇧🇩
        </p>
        <button
          onClick={onBack}
          className="mt-3 flex items-center justify-center mx-auto gap-1 text-xs text-[#F25A29] hover:text-[#e04818] cursor-pointer bg-transparent border-none font-bold group"
          style={{ fontFamily: "'Noto Serif Bengali', serif" }}
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          হোম পেজে ফিরে যান
        </button>
      </footer>
    </div>
  );
}
