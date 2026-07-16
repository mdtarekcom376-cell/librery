import React from "react";
import { ArrowLeft, BookOpen, Package, User, Building, Hash } from "lucide-react";
import { motion } from "motion/react";
import { Book } from "../types";

interface PublicBookDetailsPageProps {
  book: Book;
  onBack: () => void;
  logoBase64?: string;
}

export default function PublicBookDetailsPage({ book, onBack, logoBase64 }: PublicBookDetailsPageProps) {
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
                  <BookOpen size={16} style={{ color: "var(--flame-orange)" }} />
                  বই পরিচিতি
                </h1>
                <p className="text-[10px]" style={{ color: "#64748b", fontFamily: "'Fraunces', serif" }}>
                  Akkhor Book Details
                </p>
              </div>
            </div>
          </div>

          {/* Right: Badge */}
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA]"
          >
            <BookOpen size={10} />
            {book.group || "সাধারণ বই"}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        className="max-w-5xl mx-auto px-4 py-8 md:py-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E5E5EA] shadow-sm flex flex-col md:flex-row">
          
          {/* Left side: Book Cover */}
          <div className="w-full md:w-1/3 lg:w-2/5 bg-slate-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#E5E5EA] relative">
            <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-[#E5E5EA] bg-white flex items-center justify-center relative">
              {book.imageUrl ? (
                <img 
                  src={book.imageUrl} 
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-[#22242A] flex flex-col items-center gap-3 p-6 text-center">
                  <Package size={48} />
                  <span className="text-xs font-bold font-body-bn">কভার ছবি নেই</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold font-body-bn shadow-sm border backdrop-blur-md ${
                  book.status === "Available" 
                    ? "bg-[#F5F3EF] text-[#22242A] border-[#E5E5EA]"
                    : "bg-[#F5F3EF] text-[#FF6B6B] border-[#E5E5EA]"
                }`}>
                  {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Details */}
          <div className="w-full md:w-2/3 lg:w-3/5 p-6 md:p-10 flex flex-col">
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-[#E5E5EA] flex items-center gap-1">
                <Hash size={12} /> কোড: {book.code}
              </span>
              {book.group && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] flex items-center gap-1">
                  <BookOpen size={12} /> {book.group}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-4xl font-bold text-[#22242A] mb-2 leading-tight font-display-bn">
              {book.name}
            </h2>
            
            {/* Author */}
            <div className="flex items-center gap-2 text-[#F25A29] mb-8 font-bold font-body-bn text-lg">
              <User size={18} />
              <span>{book.author}</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-[#6B6B70] uppercase tracking-wider mb-3">বইয়ের বিবরণ</h3>
              <p className="text-slate-600 font-body-bn leading-relaxed text-sm md:text-base whitespace-pre-wrap bg-slate-50 p-5 rounded-xl border border-[#E5E5EA]">
                {book.description || "এই বইয়ের কোনো বিবরণ যুক্ত করা হয়নি।"}
              </p>
            </div>

            {/* Additional info */}
            <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#E5E5EA] pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#22242A]">
                  <Building size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#6B6B70] font-bold uppercase">প্রকাশনী</p>
                  <p className="font-bold text-slate-700 text-sm font-body-bn">{book.publisher}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center bg-slate-50 border-[#E5E5EA] mt-auto">
        <p className="text-xs text-[#6B6B70] font-bold" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
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
