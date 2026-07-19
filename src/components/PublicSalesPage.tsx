import React from "react";
import { ArrowLeft, Store, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import PublicShopView from "./PublicShopView";
import DonationCTA from "./DonationCTA";

import { ShopItem } from "../types";

interface PublicSalesPageProps {
  onBack: () => void;
  logoBase64?: string;
  onItemSelect?: (item: ShopItem) => void;
}

export default function PublicSalesPage({ onBack, logoBase64, onItemSelect }: PublicSalesPageProps) {
  const logoSrc = logoBase64 || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-[#E5E5EA] shadow-sm"
      >
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
                <h1 className="text-sm md:text-base font-bold flex items-center gap-2" style={{ color: "var(--ink-navy)", fontFamily: "'Noto Serif Bengali', serif" }}>
                  <Store size={16} style={{ color: "var(--flame-orange)" }} />
                  অক্ষর বিক্রয় কর্নার
                </h1>
                <p className="text-[10px]" style={{ color: "#64748b", fontFamily: "'Fraunces', serif" }}>
                  Akkhor Sales Corner
                </p>
              </div>
            </div>
          </div>

          {/* Right: Badge */}
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA]"
          >
            <Store size={10} />
            বই ও উপহার
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <motion.section
        className="relative overflow-hidden py-12 md:py-16 px-4 bg-slate-50 border-b border-[#E5E5EA]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30"
            style={{ background: "var(--flame-orange)" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20"
            style={{ background: "var(--book-blue)" }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span
              className="inline-block text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-4 bg-white text-[#F25A29] border border-[#F25A29]/20 shadow-sm"
            >
              অক্ষর পাঠাগারের অফিশিয়াল স্টোর
            </span>
          </motion.div>

          <motion.h2
            className="text-2xl md:text-4xl font-bold mb-3"
            style={{ color: "var(--ink-navy)", fontFamily: "'Noto Serif Bengali', serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            বিক্রয় কর্নার
          </motion.h2>

          <motion.p
            className="text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "#64748b", fontFamily: "'Noto Serif Bengali', serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            পাঠাগারের অফিশিয়াল টি-শার্ট, রাইটিং প্যাড, ডায়েরি, বই এবং কাস্টমাইজড উপহার সামগ্রী — সবকিছু এক জায়গায়।
          </motion.p>
          
          <motion.div
            className="mt-8 flex justify-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <DonationCTA 
              title="❤️ আলো ছড়ানোর মিছিলে যোগাযোগ করুন"
              buttonLabel="আলো ছড়ানোর মিছিলে যুক্ত হোন"
              style={{ width: "199px", height: "83px" }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content - PublicShopView Component */}
      <motion.main
        className="py-8 md:py-12 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <PublicShopView onItemSelect={onItemSelect} />
      </motion.main>

      {/* Footer */}
      <footer
        className="border-t py-6 px-4 text-center bg-slate-50 border-[#E5E5EA]"
      >
        <p className="text-xs text-[#8E8E93] font-bold" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
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
