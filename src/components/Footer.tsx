import React, { useState } from "react";
import {
  Home,
  FileEdit,
  Users,
  Phone,
  MapPin,
  Mail,
  Send,
  Heart,
  Facebook,
  Youtube,
  Instagram,
  ChevronRight,
  User,
  Loader2,
  Check,
} from "lucide-react";
import tawhidImg from "../assets/images/tawhid.png";
import akkhorLogo from "../assets/images/akkhor_logo_1781456142605.jpg";
import { subscribeNewsletter } from "./NewsletterPopup";

interface FooterProps {
  logoSrc?: string;
  scrollTo?: (id: string) => void;
  onNavigateToBooks?: () => void;
  onNavigateToBlog?: () => void;
  onSalesCorner?: () => void;
}

export default function Footer({
  logoSrc = akkhorLogo,
  scrollTo,
  onNavigateToBooks,
  onNavigateToBlog,
  onSalesCorner,
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) return;
    setSubStatus("loading");
    try {
      const res = await subscribeNewsletter(trimmed);
      if (res.success) {
        setSubStatus("done");
        setEmail("");
        setTimeout(() => setSubStatus("idle"), 4000);
      } else {
        setSubStatus("error");
        setTimeout(() => setSubStatus("idle"), 3000);
      }
    } catch {
      setSubStatus("error");
      setTimeout(() => setSubStatus("idle"), 3000);
    }
  };

  const handleScroll = (id: string) => {
    if (scrollTo) {
      scrollTo(id);
    } else {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-white text-slate-800 select-none overflow-hidden font-body-bn">
      {/* =================================================================
          TOP ROW: 5 COLUMNS WITH CLEAN VERTICAL DIVIDERS
          ================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-0">
          
          {/* Col 1: Logo, Organization Info & Donation Card (Span 3) */}
          <div className="lg:col-span-3 lg:pr-8 flex flex-col justify-between">
            <div>
              {/* Brand logo + Name */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0">
                  <img
                    src={logoSrc}
                    alt="অক্ষর পাঠাগার লোগো"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl font-display-bn leading-tight">
                    অক্ষর পাঠাগার
                  </h3>
                  <p className="text-xs text-slate-500 font-body-bn mt-0.5">জ্ঞান হোক সহজলভ্য</p>
                </div>
              </div>

              {/* Short Bio */}
              <p className="text-xs sm:text-[13px] text-slate-600 font-body-bn leading-relaxed mb-6">
                অরাজনৈতিক, অলাভজনক, শিক্ষামূলক ও মানবিক স্বেচ্ছাসেবী সংগঠন। জ্ঞানচর্চা, শিক্ষা ও মানবিক উন্নয়নের বিকাশে নিবেদিত।
              </p>
            </div>

            {/* Donation Card */}
            <div className="rounded-2xl p-4 border border-slate-200/90 bg-white shadow-2xs">
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                  <Heart size={15} className="text-[#E11D48]" />
                </div>
                <p className="text-xs font-semibold text-slate-700 font-display-bn leading-snug">
                  আপনার সহায়তায় এগিয়ে যাক অক্ষর পাঠাগার
                </p>
              </div>
              <a
                href="http://donat.okkhorpathagar.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs hover:opacity-95 hover:shadow-md transition-all cursor-pointer font-ui"
                style={{
                  background: "linear-gradient(90deg, #E11D48 0%, #4361EE 100%)",
                  textDecoration: "none",
                }}
              >
                <Heart size={14} className="fill-white" />
                <span>Donation</span>
              </a>
            </div>
          </div>

          {/* Col 2: দ্রুত লিংক (Quick Links) (Span 2) */}
          <div className="lg:col-span-2 lg:px-6 lg:border-l border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-base font-display-bn mb-1.5">
              দ্রুত লিংক
            </h4>
            <div className="w-6 h-0.5 bg-[#E11D48] rounded-full mb-6" />

            <div className="flex flex-col">
              {[
                { label: "হোম", href: "#hero", icon: Home, action: () => handleScroll("#hero") },
                { label: "বৈশিষ্ট্য", href: "#features", icon: FileEdit, action: () => handleScroll("#features") },
                { label: "সদস্যপদ", href: "#membership", icon: Users, action: () => handleScroll("#membership") },
                { label: "যোগাযোগ", href: "#contact", icon: Phone, action: () => handleScroll("#contact") },
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <button
                    key={idx}
                    onClick={link.action}
                    className="flex items-center justify-between py-2.5 border-b border-slate-100/90 text-slate-700 hover:text-[#E11D48] transition-colors cursor-pointer group text-left bg-transparent"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className="text-slate-500 group-hover:text-[#E11D48] transition-colors" />
                      <span className="text-xs sm:text-[13px] font-medium font-body-bn">
                        {link.label}
                      </span>
                    </div>
                    <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col 3: যোগাযোগ (Contact Info) (Span 3) */}
          <div className="lg:col-span-3 lg:px-6 lg:border-l border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-base font-display-bn mb-1.5">
              যোগাযোগ
            </h4>
            <div className="w-6 h-0.5 bg-[#E11D48] rounded-full mb-6" />

            {/* Address Pill Box */}
            <div className="bg-[#FFF6F0] border border-[#FDE9DC] rounded-2xl p-3.5 flex items-start gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-full bg-rose-100/80 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={13} className="text-[#E11D48]" />
              </div>
              <span className="text-xs text-slate-700 font-body-bn leading-snug">
                পশ্চিম কাচাতাজ রোড, বরগুনা,<br />সদর বরগুনা
              </span>
            </div>

            {/* Contact details list */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-700 font-body-bn">
                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <Phone size={11} className="text-[#E11D48]" />
                </div>
                <span>01642-816737, 01798-084404</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-700 font-body-bn">
                <div className="w-6 h-6 rounded-lg bg-rose-50/80 flex items-center justify-center shrink-0 border border-rose-100/90">
                  <Mail size={12} className="text-[#E11D48]" />
                </div>
                <a
                  href="mailto:hello@okkhorpathagar.com"
                  className="hover:text-[#E11D48] transition-colors truncate"
                >
                  hello@okkhorpathagar.com
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-[13px] text-slate-700 font-body-bn">
                <div className="w-6 h-6 rounded-lg bg-rose-50/80 flex items-center justify-center shrink-0 border border-rose-100/90">
                  <Mail size={12} className="text-[#E11D48]" />
                </div>
                <a
                  href="mailto:okkhorpathagar@gmail.com"
                  className="hover:text-[#E11D48] transition-colors truncate"
                >
                  okkhorpathagar@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: পরিচালনা পরিষদ (Management) (Span 2) */}
          <div className="lg:col-span-2 lg:px-6 lg:border-l border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-base font-display-bn mb-1.5">
              পরিচালনা পরিষদ
            </h4>
            <div className="w-6 h-0.5 bg-[#E11D48] rounded-full mb-6" />

            <div className="flex flex-col gap-4">
              {/* Person 1 */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                  <User size={15} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-[13px] font-display-bn leading-tight">
                    মোঃ মাহফুজ ইসলাম তোহা
                  </h5>
                  <p className="text-[11px] text-slate-500 font-body-bn leading-tight mt-0.5">
                    প্রতিষ্ঠাতা, পরিচালক, অক্ষর পাঠাগার
                  </p>
                  <a
                    href="tel:01642816737"
                    className="text-xs font-bold text-[#E11D48] hover:underline block mt-1"
                  >
                    01642-816737
                  </a>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Person 2 */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                  <User size={15} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-[13px] font-display-bn leading-tight">
                    এমরান বিন আব্দুল আজিজ
                  </h5>
                  <p className="text-[11px] text-slate-500 font-body-bn leading-tight mt-0.5">
                    প্রতিষ্ঠাতা, সহকারী পরিচালক, অক্ষর পাঠাগার
                  </p>
                  <a
                    href="tel:01798084404"
                    className="text-xs font-bold text-[#E11D48] hover:underline block mt-1"
                  >
                    01798-084404
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 5: আপডেট পান (Newsletter) (Span 2) */}
          <div className="lg:col-span-2 lg:pl-6 lg:border-l border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-base font-display-bn mb-1.5">
              আপডেট পান
            </h4>
            <div className="w-6 h-0.5 bg-[#E11D48] rounded-full mb-6" />

            <p className="text-xs text-slate-600 font-body-bn leading-relaxed mb-4">
              নতুন বই ও ইভেন্টের খবর সবার আগে পেতে সাবস্ক্রাইব করুন
            </p>

            <form onSubmit={handleSubscribe} className="relative w-full">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-2xs focus-within:ring-2 focus-within:ring-[#E11D48]/20 focus-within:border-[#E11D48] transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল"
                  required
                  className="w-full px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none font-body-bn"
                />
                <button
                  type="submit"
                  disabled={subStatus === "loading"}
                  className="w-8 h-8 rounded-xl bg-[#E11D48] hover:bg-[#c9183e] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                  title="সাবস্ক্রাইব করুন"
                >
                  {subStatus === "loading" ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : subStatus === "done" ? (
                    <Check size={13} />
                  ) : (
                    <Send size={13} className="translate-x-0.5" />
                  )}
                </button>
              </div>

              {subStatus === "done" && (
                <p className="text-[11px] text-emerald-600 mt-1.5 font-display-bn">
                  ধন্যবাদ! সাবস্ক্রিপশন সম্পন্ন হয়েছে।
                </p>
              )}
              {subStatus === "error" && (
                <p className="text-[11px] text-rose-500 mt-1.5 font-display-bn">
                  দুঃখিত, আবার চেষ্টা করুন।
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* =================================================================
          ORGANIC FULL-WIDTH WAVY DUNE SECTION ("How can we help?")
          ================================================================= */}
      <div className="relative w-full bg-[#FAF3EA] overflow-hidden pt-0 pb-10">
        {/* Continuous organic top wave SVG dividing White from Sand Cream */}
        <div className="w-full leading-none overflow-hidden -mt-1 pointer-events-none">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-20 md:h-24 lg:h-28 block text-[#FAF3EA]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L0,35 C220,70 380,85 620,60 C860,35 1100,5 1280,25 C1360,35 1410,48 1440,55 L1440,0 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* Ambient floating pastel confetti and botanical sketches */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle leaves drawing on right behind the book */}
          <svg
            className="absolute right-6 top-8 w-44 h-44 text-amber-700/10"
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M60 110 C60 60 100 20 100 20 C100 20 70 45 60 110 Z" />
            <path d="M60 110 C60 70 30 35 30 35 C30 35 55 60 60 110 Z" />
            <path d="M60 110 L60 20" />
            <path d="M60 65 L82 50" />
            <path d="M60 80 L38 68" />
            <path d="M60 50 L78 38" />
          </svg>

          {/* Floating pastel geometric confetti */}
          <div className="absolute top-12 left-1/4 w-3 h-3 rounded-full border border-pink-300 opacity-60" />
          <div className="absolute top-16 right-1/3 w-2.5 h-2.5 rotate-45 border border-amber-300 opacity-60" />
          <div className="absolute bottom-16 left-1/3 w-3 h-3 rotate-12 border border-blue-200 opacity-60" />
          <div className="absolute top-10 right-28 w-3.5 h-3.5 border border-rose-300 rounded-sm rotate-45 opacity-50" />
          <div className="absolute top-24 left-16 w-2.5 h-2.5 rounded-full bg-pink-200/50" />
          <div className="absolute bottom-20 right-1/4 w-3 h-3 rotate-45 bg-amber-200/40" />
        </div>

        {/* Banner content container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-2 items-center">
            
            {/* Left Column: Detailed Vector Illustration of Thinking Young Man */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start items-center">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                
                {/* Floating confetti around character */}
                <div className="absolute top-6 left-2 w-3.5 h-3.5 border-2 border-pink-300 rotate-12 rounded-xs" />
                <div className="absolute top-3 right-8 w-3 h-3 bg-amber-200/80 rotate-45" />
                <div className="absolute bottom-10 left-4 w-3.5 h-3.5 rounded-full border-2 border-sky-300" />
                <div className="absolute top-20 -left-1 w-2.5 h-2.5 bg-rose-200 rounded-full" />
                <div className="absolute bottom-16 right-4 w-3.5 h-2.5 border-2 border-violet-300 rotate-45" />

                {/* High quality vector thinking character matching reference image */}
                <svg
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full object-contain drop-shadow-xs"
                >
                  {/* Subtle soft background circle */}
                  <circle cx="100" cy="105" r="65" fill="#FFFBF5" opacity="0.7" />

                  {/* Body & White T-Shirt */}
                  <path
                    d="M45 180 C45 150 65 138 100 138 C135 138 155 150 155 180 Z"
                    fill="#FFFFFF"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  {/* Shirt round neckline */}
                  <path
                    d="M90 138 C94 145 106 145 110 138"
                    stroke="#1E293B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Right Arm Folded Horizontally Resting on Table */}
                  <path
                    d="M65 178 C80 162 135 162 150 178"
                    fill="#FDDEC5"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Left Arm Bent Up with Elbow on Table */}
                  <path
                    d="M58 178 C54 154 66 130 78 116"
                    stroke="#1E293B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M66 178 C62 158 72 136 82 120"
                    stroke="#1E293B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Neck */}
                  <path
                    d="M92 118 L92 138 C92 140 108 140 108 138 L108 118 Z"
                    fill="#FDDEC5"
                    stroke="#1E293B"
                    strokeWidth="2.2"
                  />

                  {/* Head / Face */}
                  <path
                    d="M84 94 C84 78 94 68 108 68 C122 68 132 78 132 94 C132 110 120 122 106 122 C94 122 84 110 84 94 Z"
                    fill="#FDDEC5"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                  />

                  {/* Hand Supporting Cheek / Chin */}
                  <path
                    d="M78 116 C76 106 84 104 88 108 C91 111 90 120 84 124 Z"
                    fill="#FDDEC5"
                    stroke="#1E293B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />

                  {/* Eyes, Brows, Nose, Smile */}
                  <path d="M96 86 Q101 84 105 86" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M114 86 Q119 84 123 86" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="101" cy="92" r="2.5" fill="#1E293B" />
                  <circle cx="118" cy="92" r="2.5" fill="#1E293B" />
                  <path d="M110 92 Q112 98 109 100" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M106 108 Q110 110 114 108" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

                  {/* Stylish Modern Blue Hair */}
                  <path
                    d="M82 86 C78 64 94 50 112 50 C128 50 140 60 140 76 C140 88 135 92 133 94 C130 80 122 72 110 72 C98 72 90 78 82 86 Z"
                    fill="#1E3A8A"
                  />
                  {/* Forehead tufts */}
                  <path
                    d="M92 70 C98 65 108 67 106 78 C100 76 96 74 92 70 Z"
                    fill="#1E3A8A"
                  />
                  <path
                    d="M112 70 C120 65 128 67 130 76 C124 74 118 74 112 70 Z"
                    fill="#1E3A8A"
                  />
                </svg>
              </div>
            </div>

            {/* Middle Column: Heading text */}
            <div className="lg:col-span-4 text-center lg:text-left">
              <p className="font-serif italic text-2xl sm:text-3xl text-[#E11D48] font-bold leading-tight mb-1">
                How can we help?
              </p>
              <h3 className="text-2xl sm:text-3xl md:text-[34px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
                Contact us anytime.
              </h3>
            </div>

            {/* Right Column: Contact floating cards */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center lg:justify-start xl:justify-center gap-3.5 relative xl:pr-28">
              {/* Card 1: Send us a message */}
              <a
                href="mailto:hello@okkhorpathagar.com"
                className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/90 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto shrink-0"
                style={{ textDecoration: "none" }}
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center shrink-0 border border-rose-100">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display-lat">
                    SEND US A MESSAGE
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate block mt-0.5">
                    hello@okkhorpathagar.com
                  </span>
                </div>
              </a>

              {/* Card 2: Call us */}
              <a
                href="tel:01642816737"
                className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/90 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto shrink-0"
                style={{ textDecoration: "none" }}
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-[#E11D48] flex items-center justify-center shrink-0 border border-rose-100">
                  <Phone size={18} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-display-lat">
                    CALL US
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 block mt-0.5">
                    01642-816737
                  </span>
                </div>
              </a>
            </div>

          </div>

          {/* High-Fidelity 3D Open Book Graphic resting gracefully on the wave crest on far right */}
          <div className="hidden xl:block absolute top-0 right-4 lg:right-8 xl:right-14 w-40 h-28 pointer-events-none drop-shadow-md">
            <svg
              viewBox="0 0 160 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Book Hardcover Red Base */}
              <path
                d="M12 94 Q80 75 80 98 Q80 75 148 94 L152 84 Q80 66 80 88 Q80 66 8 84 Z"
                fill="#BE123C"
              />

              {/* Left Side Pages Layers */}
              <path
                d="M14 82 Q46 68 78 76 L78 30 Q46 22 14 38 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <path
                d="M16 80 Q48 66 78 74 L78 28 Q48 20 16 36 Z"
                fill="#F8FAFC"
                stroke="#E2E8F0"
                strokeWidth="0.8"
              />
              <path
                d="M18 78 Q50 64 78 72 L78 26 Q50 18 18 34 Z"
                fill="#FFFFFF"
              />
              {/* Subtle lines on left page */}
              <path d="M26 42 Q48 34 68 40" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
              <path d="M26 50 Q48 42 68 48" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
              <path d="M26 58 Q48 50 68 56" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />

              {/* Right Side Pages Layers */}
              <path
                d="M146 82 Q114 68 82 76 L82 30 Q114 22 146 38 Z"
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth="0.8"
              />
              <path
                d="M144 80 Q112 66 82 74 L82 28 Q112 20 144 36 Z"
                fill="#F8FAFC"
                stroke="#E2E8F0"
                strokeWidth="0.8"
              />
              <path
                d="M142 78 Q110 64 82 72 L82 26 Q110 18 142 34 Z"
                fill="#FFFFFF"
              />
              {/* Subtle lines on right page */}
              <path d="M92 40 Q112 34 134 42" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
              <path d="M92 48 Q112 42 134 50" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />
              <path d="M92 56 Q112 50 134 58" stroke="#E2E8F0" strokeWidth="1" strokeLinecap="round" />

              {/* Spine Center & Red Bookmark Ribbon */}
              <path d="M80 25 L80 96" stroke="#94A3B8" strokeWidth="1.8" />
              <path
                d="M80 26 Q84 56 88 86 Q90 102 96 106 L92 98 Q86 72 80 26 Z"
                fill="#E11D48"
              />
            </svg>
          </div>
        </div>

        {/* =================================================================
            BOTTOM ROW: COPYRIGHT, SOCIALS & CRAFTED-BY PILL WITH DIVIDERS
            ================================================================= */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center text-center md:text-left">
            
            {/* Left Col: Copyright text (Span 4) */}
            <div className="md:col-span-4">
              <p className="text-xs sm:text-[13px] font-medium text-slate-800 font-display-bn">
                © ২০২৪ অক্ষর পাঠাগার | সর্বস্বত্ব সংরক্ষিত
              </p>
              <p className="text-[11px] text-slate-600 font-body-bn mt-0.5">
                বাংলাদেশের জ্ঞানচর্চার এক নির্ভরযোগ্য প্ল্যাটফর্ম
              </p>
            </div>

            {/* Center Col: Social icons with vertical divider (Span 4) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center gap-2 md:border-l md:border-r border-slate-300/50 py-1">
              <span className="text-[11px] font-semibold text-slate-600 font-display-bn">
                আমাদের সাথে থাকুন
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://facebook.com/okkhorpathagar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-blue-50/50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                  title="ফেসবুক"
                >
                  <Facebook size={14} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-black hover:border-black/40 hover:bg-slate-50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                  title="টুইটার / এক্স"
                >
                  {/* Classic Twitter Bird Vector */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-[#FF0000] hover:border-red-200 hover:bg-red-50/50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                  title="ইউটিউব"
                >
                  <Youtube size={14} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-700 hover:text-[#E4405F] hover:border-pink-200 hover:bg-pink-50/50 flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                  title="ইনস্টাগ্রাম"
                >
                  <Instagram size={14} />
                </a>
              </div>
            </div>

            {/* Right Col: Crafted by pill badge (Span 4) */}
            <div className="md:col-span-4 flex items-center justify-center md:justify-end">
              <div className="flex items-center gap-2.5 bg-[#FFF0E2] border border-[#FCDDC6] rounded-full px-4 py-1.5 shadow-2xs">
                <img
                  src={tawhidImg}
                  alt="মোঃ তাওহীদ ইসলাম ওমর"
                  className="w-7 h-7 rounded-full object-cover border border-amber-300/80 shrink-0"
                />
                <span className="text-xs text-slate-800 font-display-bn">
                  Crafted by — <strong className="font-bold text-slate-900">মোঃ তাওহীদ ইসলাম ওমর</strong>
                </span>
                <Heart size={14} className="text-[#E11D48] shrink-0 fill-none" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
