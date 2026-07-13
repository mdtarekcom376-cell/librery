import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "motion/react";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Activity,
  Bell,
  Users,
  Shield,
  ClipboardList,
  FileSpreadsheet,
  Palette,
  Check,
  Star,
  Shirt,
  Coffee,
  BookOpen,
  StickyNote,
  Package,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Send,
  Loader2,
} from "lucide-react";
import akkhorLogo from "../assets/images/akkhor_logo_1781456142605.jpg";

/* ===========================================
   DEMO DATA CONSTANTS
   All placeholder content below. Replace with
   real API responses from /api/* endpoints.
   =========================================== */

const DEMO_BOOKS = [
  { id: "1", title: "পথের পাঁচালী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", color: "#1C8FE0", corner: "উপন্যাস" },
  { id: "2", title: "গীতাঞ্জলি", author: "রবীন্দ্রনাথ ঠাকুর", color: "#0D5FA0", corner: "রবীন্দ্রনাথ কর্নার" },
  { id: "3", title: "অগ্নিবীণা", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার" },
  { id: "4", title: "শেষের কবিতা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#EC2C7B", corner: "রবীন্দ্রনাথ কর্নার" },
  { id: "5", title: "দেবদাস", author: "শরৎচন্দ্র চট্টোপাধ্যায়", color: "#16233F", corner: "উপন্যাস" },
  { id: "6", title: "ফেলুদা সমগ্র", author: "সত্যজিৎ রায়", color: "#29ABE2", corner: "গল্প" },
  { id: "7", title: "চাঁদের পাহাড়", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", color: "#0D5FA0", corner: "উপন্যাস" },
  { id: "8", title: "সঞ্চয়িতা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#F7941D", corner: "কবিতা" },
];

const DEMO_CORNER_COUNTS: Record<string, number> = {
  "নজরুল কর্নার": 42,
  "রবীন্দ্রনাথ কর্নার": 68,
  "উপন্যাস": 124,
  "গল্প": 89,
  "কবিতা": 53,
  "ইতিহাস": 31,
};

const DEMO_STATS = {
  totalBooks: 3200,
  activeMembers: 850,
  issuedBooks: 1480,
  activeCorners: 6,
  yearsRunning: 5,
};

const DEMO_MEMBERS = [
  { initials: "র.ক.", name: "রহিমা খাতুন", quote: "অক্ষর পাঠাগার আমাদের এলাকার পড়াশোনার আলো। বই খুঁজে পেতে আগে কত কষ্ট হতো, এখন এক ক্লিকেই!", rating: 5 },
  { initials: "ম.হ.", name: "মোহন হোসেন", quote: "SMS রিমাইন্ডার ফিচারটা অসাধারণ। ফেরতের তারিখ ভুলে যাওয়ার ঝামেলা শেষ!", rating: 5 },
  { initials: "স.দ.", name: "সুমিত দাস", quote: "গেস্ট হিসেবে ঢুকেও বইয়ের তালিকা দেখা যায় — এটা সবার জন্য সত্যিই সুবিধাজনক।", rating: 4 },
];

const DEMO_NEWS = [
  { id: "1", title: "নতুন বই উৎসব ২০২৬", date: "১৫ জুলাই, ২০২৬", summary: "এ বছরের বই উৎসবে ২০০+ নতুন বই যোগ হচ্ছে। সদস্যদের জন্য বিশেষ ছাড়।" },
  { id: "2", title: "সদস্যদের জন্য কর্মশালা", date: "২০ জুলাই, ২০২৬", summary: "ডিজিটাল রিডিং ও লাইব্রেরি ব্যবহারের ওপর বিনামূল্যে কর্মশালা।" },
  { id: "3", title: "রিডিং ক্লাব শুরু", date: "১ আগস্ট, ২০২৬", summary: "প্রতি শনিবার সন্ধ্যায় বই আলোচনার জন্য রিডিং ক্লাব চালু হচ্ছে।" },
];

const DEMO_SALES_ITEMS = [
  { id: "1", name: "অক্ষর পাঠাগার টি-শার্ট", price: "৳ ৪৫০", icon: Shirt },
  { id: "2", name: "লাইব্রেরি মগ", price: "৳ ২৫০", icon: Coffee },
  { id: "3", name: "রিডিং নোটপ্যাড", price: "৳ ১৫০", icon: StickyNote },
  { id: "4", name: "বই বান্ডেল প্যাক", price: "৳ ৮০০", icon: Package },
  { id: "5", name: "বুক মার্ক সেট", price: "৳ ১০০", icon: BookOpen },
];

const NAV_LINKS = [
  { label: "হোম", href: "#hero" },
  { label: "বৈশিষ্ট্য", href: "#features" },
  { label: "বইয়ের কর্নার", href: "#corners" },
  { label: "সদস্যপদ", href: "#membership" },
  { label: "আমাদের সম্পর্কে", href: "#about" },
  { label: "বিক্রয় কর্নার", href: "#sales" },
  { label: "মতামত", href: "#testimonials" },
  { label: "যোগাযোগ", href: "#contact" },
];

const FEATURES = [
  { icon: Activity, title: "রিয়েল-টাইম ট্র্যাকিং", desc: "কে কোন বই নিয়েছে, সাথে সাথে জানুন" },
  { icon: Bell, title: "স্বয়ংক্রিয় SMS রিমাইন্ডার", desc: "ফেরতের তারিখ ভুলে যাওয়ার দিন শেষ" },
  { icon: Users, title: "মাল্টি-রোল অ্যাক্সেস", desc: "অ্যাডমিন, সদস্য ও গেস্ট আলাদা ড্যাশবোর্ড" },
  { icon: ClipboardList, title: "অডিট লগ", desc: "প্রতিটি কাজের হিসাব, সেকেন্ড ধরে" },
  { icon: FileSpreadsheet, title: "গুগল শীট সিঙ্ক", desc: "আপনার পুরনো স্প্রেডশিট থেকেই শুরু করুন" },
  { icon: Palette, title: "৫টি থিম", desc: "লাইব্রেরির মেজাজ অনুযায়ী চেহারা বদলান" },
];

/* ===========================================
   HELPER COMPONENTS
   =========================================== */

// Section header pattern: eyebrow → H2 → flame underline
function SectionHeader({ eyebrow, heading, id }: { eyebrow: string; heading: string; id?: string }) {
  return (
    <motion.div
      className="text-center mb-12 md:mb-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5 }}
    >
      <span className="font-display-lat text-sm md:text-base tracking-wide" style={{ color: "var(--flame-orange)" }}>
        {eyebrow}
      </span>
      <h2 id={id} className="font-display-bn text-2xl md:text-4xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
        {heading}
      </h2>
      <motion.span
        className="flame-underline mx-auto"
        style={{ maxWidth: 80 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />
    </motion.div>
  );
}

// Placeholder book spine SVG
function BookSpine({ title, author, color }: { title: string; author: string; color: string }) {
  return (
    <div
      className="hp-card relative overflow-hidden flex flex-col justify-between"
      style={{ width: 160, minHeight: 220, padding: "20px 16px" }}
    >
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{ background: color }}
      />
      <div className="mt-2">
        <p className="font-display-bn text-sm font-bold leading-snug" style={{ color: "var(--ink-navy)" }}>
          {title}
        </p>
        <p className="font-body-bn text-xs mt-2" style={{ color: "#64748b" }}>
          {author}
        </p>
      </div>
      <div className="flex items-center gap-1 mt-auto pt-4">
        <BookOpen size={12} style={{ color }} />
        <span className="text-[10px] font-ui" style={{ color }}>অক্ষর পাঠাগার</span>
      </div>
    </div>
  );
}

// Count-up hook using motion's animate
function useCountUp(target: number, inView: boolean) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, target, {
        duration: 1.8,
        ease: "easeOut",
      });
      return () => controls.stop();
    }
  }, [inView, target, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  return displayValue;
}

// Initials avatar placeholder
function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-display-bn text-sm font-bold shrink-0"
      style={{ background: "var(--sky-tint)", color: "var(--book-blue)" }}
    >
      {initials}
    </div>
  );
}

// SVG Quill illustration (simplified from logo)
function QuillSVG() {
  return (
    <svg viewBox="0 0 300 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Open book */}
      <path
        d="M60 220 C60 190 100 170 150 170 C200 170 240 190 240 220 L240 260 C240 250 200 240 150 240 C100 240 60 250 60 260 Z"
        fill="#1C8FE0"
        opacity="0.9"
      />
      <path
        d="M150 170 L150 240"
        stroke="#16233F"
        strokeWidth="2"
        opacity="0.3"
      />
      {/* Left page */}
      <path
        d="M65 222 C65 195 105 178 148 178 L148 238 C105 238 65 248 65 255 Z"
        fill="#29ABE2"
        opacity="0.6"
      />
      {/* Right page */}
      <path
        d="M235 222 C235 195 195 178 152 178 L152 238 C195 238 235 248 235 255 Z"
        fill="#1C8FE0"
        opacity="0.7"
      />
      {/* Quill feather - animated stroke */}
      <path
        className="quill-draw"
        d="M170 180 C175 150 185 120 200 80 C210 55 215 35 210 20 C205 35 195 50 180 75 C165 100 158 140 160 170 C162 155 168 130 180 105 C190 85 198 65 200 45"
        stroke="#16233F"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Quill feather fill (appears after draw) */}
      <path
        d="M170 180 C175 150 185 120 200 80 C210 55 215 35 210 20 C205 35 195 50 180 75 C165 100 158 140 160 170 Z"
        fill="url(#quillGrad)"
        opacity="0.15"
      />
      {/* Flame ribbon beneath */}
      <path
        className="flame-flow"
        d="M120 250 C130 240 145 248 150 240 C155 248 170 240 180 250 C175 258 160 252 150 260 C140 252 125 258 120 250"
        fill="url(#flameGrad)"
        opacity="0.8"
      />
      <path
        d="M130 255 C138 248 148 254 155 246 C160 254 170 248 175 255 C168 260 158 256 150 262 C142 256 132 260 130 255"
        fill="url(#flameGrad)"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="quillGrad" x1="160" y1="180" x2="210" y2="20">
          <stop offset="0%" stopColor="#1C8FE0" />
          <stop offset="100%" stopColor="#BADDFF" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="120" y1="250" x2="180" y2="250">
          <stop offset="0%" stopColor="#F7941D" />
          <stop offset="100%" stopColor="#EC2C7B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ===========================================
   MAIN HOMEPAGE COMPONENT
   =========================================== */

interface HomePageProps {
  onLogin: () => void;         // Navigate to admin login
  onMemberLogin: () => void;   // Navigate to member login
  onGuestEntry: () => void;    // Enter as guest
  logoBase64?: string;         // Dynamic logo from server
}

export default function HomePage({ onLogin, onMemberLogin, onGuestEntry, logoBase64 }: HomePageProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCorner, setOpenCorner] = useState<string | null>("নজরুল কর্নার");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollTo = useCallback((href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Contact form submit simulation
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSent(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setContactSent(false), 4000);
    }, 1500);
  };

  // Carousel scroll
  const scrollCarousel = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const amount = dir === "left" ? -200 : 200;
      carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const logoSrc = logoBase64 || akkhorLogo;

  // Hero headline words for staggered animation
  const heroWords = "বইয়ের চেয়ে বিশ্বস্ত বন্ধু আর হয় না".split(" ");

  return (
    <div className="homepage">
      {/* ======================================
          §4.1 HEADER / NAVIGATION
          ====================================== */}
      <header
        className={`hp-header fixed top-0 left-0 right-0 z-50 ${headerScrolled ? "scrolled" : ""}`}
        style={!headerScrolled ? { backgroundColor: "transparent" } : undefined}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          {/* Logo + Wordmark */}
          <div className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="অক্ষর পাঠাগার লোগো"
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-contain bg-white border border-[#1C8FE0]/20 p-0.5"
            />
            <div>
              <h1 className="font-display-bn text-base md:text-lg font-bold" style={{ color: "var(--ink-navy)" }}>
                অক্ষর পাঠাগার
              </h1>
              <p className="text-[10px] font-display-lat hidden sm:block" style={{ color: "#64748b" }}>
                Akkhor Pathagar
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" id="homepage-desktop-nav">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="nav-flame-link font-body-bn text-sm cursor-pointer bg-transparent border-none"
                style={{ color: "var(--ink-navy)" }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onLogin}
              className="btn-ghost px-4 py-2 text-xs md:text-sm hidden sm:inline-flex font-ui"
              id="homepage-login-btn"
            >
              লগইন
            </button>
            <button
              onClick={onMemberLogin}
              className="btn-flame px-4 py-2 text-xs md:text-sm font-ui"
              id="homepage-member-btn"
            >
              সদস্য হোন
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 cursor-pointer bg-transparent border-none"
              style={{ color: "var(--ink-navy)" }}
              aria-label="মোবাইল মেনু খুলুন"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-drawer p-6"
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <img src={logoSrc} alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
                  <span className="font-display-bn font-bold" style={{ color: "var(--ink-navy)" }}>
                    অক্ষর পাঠাগার
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 cursor-pointer bg-transparent border-none"
                  style={{ color: "var(--ink-navy)" }}
                  aria-label="মেনু বন্ধ করুন"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="text-left py-3 px-3 rounded-xl font-body-bn text-sm cursor-pointer bg-transparent border-none hover:bg-[#EAF5FD] transition-colors"
                    style={{ color: "var(--ink-navy)" }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-2">
                <button onClick={onLogin} className="btn-ghost px-4 py-2.5 text-sm font-ui w-full">
                  লগইন
                </button>
                <button onClick={onMemberLogin} className="btn-flame px-4 py-2.5 text-sm font-ui w-full">
                  সদস্য হোন
                </button>
                <button onClick={onGuestEntry} className="btn-blue px-4 py-2.5 text-sm font-ui w-full">
                  গেস্ট হিসেবে দেখুন
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ======================================
          §4.2 HERO
          ====================================== */}
      <section
        id="hero"
        className="section-warm pt-28 md:pt-36 pb-16 md:pb-24 px-4"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            {/* Eyebrow */}
            <motion.p
              className="font-display-lat text-sm md:text-base tracking-wide mb-4"
              style={{ color: "var(--flame-orange)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              জ্ঞানের একটি ঘর, একটি হৃদয়ে
            </motion.p>

            {/* Headline — word by word reveal */}
            <h2 className="font-display-bn text-3xl md:text-5xl lg:text-[3.4rem] font-bold leading-tight" style={{ color: "var(--ink-navy)" }}>
              {heroWords.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                >
                  {word}
                </motion.span>
              ))}
            </h2>

            {/* Subtext */}
            <motion.p
              className="font-body-bn text-base md:text-lg mt-5 leading-relaxed max-w-lg"
              style={{ color: "#475569" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              অক্ষর পাঠাগার আপনার লাইব্রেরির প্রতিটি বই, সদস্য আর লেনদেন এক জায়গায় গুছিয়ে রাখে — বাংলায়, সহজে।
            </motion.p>

            {/* CTA row */}
            <motion.div
              className="flex flex-wrap gap-3 mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <button
                onClick={onMemberLogin}
                className="btn-flame px-6 py-3 text-sm md:text-base font-ui flex items-center gap-2 group"
                id="hero-cta-primary"
              >
                লাইব্রেরি এক্সপ্লোর করুন
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={onGuestEntry}
                className="btn-ghost px-6 py-3 text-sm md:text-base font-ui"
                id="hero-cta-guest"
              >
                গেস্ট হিসেবে দেখুন
              </button>
            </motion.div>

            {/* Stat strip */}
            <motion.div
              className="flex items-center gap-4 mt-10 text-sm font-body-bn"
              style={{ color: "#64748b" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--flame-orange)" }} />
                চলছে <strong className="font-display-lat" style={{ color: "var(--ink-navy)" }}>{DEMO_STATS.totalBooks.toLocaleString("bn-BD")}+</strong> বই
              </span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--book-blue)" }} />
                <strong className="font-display-lat" style={{ color: "var(--ink-navy)" }}>{DEMO_STATS.activeMembers.toLocaleString("bn-BD")}</strong> সক্রিয় সদস্য
              </span>
            </motion.div>
          </div>

          {/* Right: Quill SVG + floating books */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-64 h-72 md:w-80 md:h-96">
              <QuillSVG />
            </div>
            {/* Floating demo book cards */}
            <div className="absolute -top-2 -left-4 md:left-0 float-book" style={{ zIndex: 2 }}>
              <BookSpine title={DEMO_BOOKS[0].title} author={DEMO_BOOKS[0].author} color={DEMO_BOOKS[0].color} />
            </div>
            <div className="absolute top-12 -right-2 md:right-0 float-book-delayed" style={{ zIndex: 2 }}>
              <BookSpine title={DEMO_BOOKS[2].title} author={DEMO_BOOKS[2].author} color={DEMO_BOOKS[2].color} />
            </div>
            <div className="absolute bottom-4 left-8 md:left-16 float-book-slow hidden md:block" style={{ zIndex: 2 }}>
              <BookSpine title={DEMO_BOOKS[1].title} author={DEMO_BOOKS[1].author} color={DEMO_BOOKS[1].color} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================
          §4.3 FEATURES
          ====================================== */}
      <section id="features" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="কেন অক্ষর পাঠাগার" heading="লাইব্রেরি চালানো হোক ঝামেলাহীন" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="hp-card p-6"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: "var(--sky-tint)" }}
                  >
                    <Icon size={22} style={{ color: "var(--book-blue)" }} />
                  </div>
                  <h3 className="font-display-bn text-lg font-bold mb-1" style={{ color: "var(--ink-navy)" }}>
                    {feature.title}
                  </h3>
                  <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================
          §4.4 CORNERS (ACCORDION)
          ====================================== */}
      <section id="corners" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="কর্নার" heading="আপনার বইগুলো যেভাবে সাজানো" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Shelf illustration */}
            <motion.div
              className="hidden lg:flex flex-col items-center justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
            >
              <svg viewBox="0 0 300 320" className="w-full max-w-sm">
                {/* Bookshelf */}
                {[0, 1, 2].map((row) => (
                  <React.Fragment key={row}>
                    {/* Shelf plank */}
                    <rect x="30" y={80 + row * 90} width="240" height="8" rx="2" fill="#16233F" opacity="0.15" />
                    {/* Books on shelf */}
                    {[0, 1, 2, 3, 4].map((col) => {
                      const colors = ["#1C8FE0", "#0D5FA0", "#F7941D", "#EC2C7B", "#29ABE2"];
                      const heights = [55, 62, 48, 58, 52];
                      return (
                        <rect
                          key={col}
                          x={40 + col * 46}
                          y={80 + row * 90 - heights[col]}
                          width={32}
                          height={heights[col]}
                          rx="3"
                          fill={colors[(col + row) % colors.length]}
                          opacity={0.7 + (col % 2) * 0.15}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
                {/* Shelf sides */}
                <rect x="25" y="18" width="6" height="280" rx="3" fill="#16233F" opacity="0.12" />
                <rect x="269" y="18" width="6" height="280" rx="3" fill="#16233F" opacity="0.12" />
              </svg>
            </motion.div>

            {/* Right: Accordion */}
            <div className="space-y-3">
              {Object.entries(DEMO_CORNER_COUNTS).map(([corner, count], i) => {
                const isOpen = openCorner === corner;
                return (
                  <motion.div
                    key={corner}
                    className="corner-tab hp-card overflow-hidden"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  >
                    <button
                      onClick={() => setOpenCorner(isOpen ? null : corner)}
                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display-bn text-base font-bold" style={{ color: "var(--ink-navy)" }}>
                        {corner}
                      </span>
                      <div className="flex items-center gap-3">
                        {/* DEMO_CORNER_COUNTS marker */}
                        <span className="font-display-lat text-xs px-2.5 py-0.5 rounded-full" style={{ background: "var(--sky-tint)", color: "var(--book-blue)" }}>
                          {count}টি বই
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={18} style={{ color: "var(--ink-navy)" }} />
                        </motion.div>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4">
                            <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>
                              এই কর্নারে মোট <strong>{count}টি</strong> বই সংরক্ষিত আছে। ব্রাউজ করুন এবং আপনার পছন্দের বই খুঁজে নিন।
                            </p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {DEMO_BOOKS.filter((b) => b.corner === corner)
                                .slice(0, 3)
                                .map((book) => (
                                  <span
                                    key={book.id}
                                    className="text-xs px-3 py-1 rounded-full font-body-bn"
                                    style={{ background: "var(--sky-tint)", color: "var(--book-blue-deep)" }}
                                  >
                                    {book.title}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.5 FEATURED BOOKS (CAROUSEL)
          ====================================== */}
      <section id="featured-books" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="নতুন সংযোজন" heading="সম্প্রতি যোগ হওয়া বই" />
          <div className="relative">
            {/* Carousel controls */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none hidden md:flex"
              style={{ background: "var(--flame-gradient)", color: "white" }}
              aria-label="আগের বই"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-none hidden md:flex"
              style={{ background: "var(--flame-gradient)", color: "white" }}
              aria-label="পরের বই"
            >
              <ArrowRight size={18} />
            </button>

            {/* Scrollable carousel */}
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 px-2 md:px-14 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {DEMO_BOOKS.map((book, i) => (
                <motion.div
                  key={book.id}
                  className="snap-start shrink-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <BookSpine title={book.title} author={book.author} color={book.color} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.6 MEMBERSHIP (PRICING)
          ====================================== */}
      <section id="membership" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="সদস্যপদ" heading="আপনার জন্য কোনটি ঠিক" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Guest */}
            <motion.div
              className="hp-card p-6 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <h3 className="font-display-bn text-xl font-bold" style={{ color: "var(--ink-navy)" }}>গেস্ট</h3>
              <p className="font-display-lat text-3xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
                ফ্রি
              </p>
              <p className="font-body-bn text-sm mt-1 mb-6" style={{ color: "#64748b" }}>শুধু ব্রাউজ করুন</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  { text: "বইয়ের তালিকা দেখুন", included: true },
                  { text: "পরিসংখ্যান দেখুন", included: true },
                  { text: "লিডারবোর্ড দেখুন", included: true },
                  { text: "বই ইস্যু করুন", included: false },
                  { text: "রিজার্ভেশন", included: false },
                  { text: "SMS রিমাইন্ডার", included: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-body-bn text-sm" style={{ color: item.included ? "var(--ink-navy)" : "#94a3b8" }}>
                    {item.included
                      ? <Check size={16} style={{ color: "var(--book-blue)" }} />
                      : <X size={16} style={{ color: "#cbd5e1" }} />
                    }
                    {item.text}
                  </li>
                ))}
              </ul>
              <button onClick={onGuestEntry} className="btn-ghost w-full py-2.5 text-sm font-ui">
                শুরু করুন
              </button>
            </motion.div>

            {/* Member — highlighted */}
            <motion.div
              className="hp-card p-6 flex flex-col relative glow-pulse"
              style={{ border: "2px solid transparent", backgroundImage: "linear-gradient(white, white), linear-gradient(90deg, #F7941D, #EC2C7B)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-ui font-bold px-3 py-1 rounded-full text-white"
                style={{ background: "var(--flame-gradient)" }}
              >
                সবচেয়ে জনপ্রিয়
              </span>
              <h3 className="font-display-bn text-xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>সদস্য</h3>
              <p className="font-display-lat text-3xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
                ডেমো ফি<span className="text-base font-normal">/মাস</span>
              </p>
              <p className="font-body-bn text-sm mt-1 mb-6" style={{ color: "#64748b" }}>পূর্ণাঙ্গ সদস্যপদ</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  { text: "বইয়ের তালিকা দেখুন", included: true },
                  { text: "বই ইস্যু করুন", included: true },
                  { text: "রিজার্ভেশন", included: true },
                  { text: "SMS রিমাইন্ডার", included: true },
                  { text: "উইশলিস্ট", included: true },
                  { text: "বর্ধিত মেয়াদ", included: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-body-bn text-sm" style={{ color: item.included ? "var(--ink-navy)" : "#94a3b8" }}>
                    {item.included
                      ? <Check size={16} style={{ color: "var(--flame-orange)" }} />
                      : <X size={16} style={{ color: "#cbd5e1" }} />
                    }
                    {item.text}
                  </li>
                ))}
              </ul>
              <button onClick={onMemberLogin} className="btn-flame w-full py-2.5 text-sm font-ui">
                শুরু করুন
              </button>
            </motion.div>

            {/* Patron */}
            <motion.div
              className="hp-card p-6 flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="font-display-bn text-xl font-bold" style={{ color: "var(--ink-navy)" }}>প্যাট্রন</h3>
              <p className="font-display-lat text-3xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
                ডেমো ফি<span className="text-base font-normal">/বছর</span>
              </p>
              <p className="font-body-bn text-sm mt-1 mb-6" style={{ color: "#64748b" }}>অগ্রাধিকার সুবিধা</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  { text: "সদস্যের সব সুবিধা", included: true },
                  { text: "অগ্রাধিকার রিজার্ভেশন", included: true },
                  { text: "বর্ধিত মেয়াদ", included: true },
                  { text: "বিশেষ ইভেন্ট অ্যাক্সেস", included: true },
                  { text: "SMS রিমাইন্ডার", included: true },
                  { text: "পৃষ্ঠপোষক ব্যাজ", included: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-body-bn text-sm" style={{ color: item.included ? "var(--ink-navy)" : "#94a3b8" }}>
                    {item.included
                      ? <Check size={16} style={{ color: "var(--book-blue)" }} />
                      : <X size={16} style={{ color: "#cbd5e1" }} />
                    }
                    {item.text}
                  </li>
                ))}
              </ul>
              <button onClick={onMemberLogin} className="btn-blue w-full py-2.5 text-sm font-ui">
                শুরু করুন
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.7 ABOUT
          ====================================== */}
      <section id="about" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="আমাদের গল্প" heading="কেন অক্ষর পাঠাগার তৈরি হলো" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            {/* Left: Founder placeholder */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-52 h-52 md:w-64 md:h-64 rounded-full flex items-center justify-center" style={{ background: "var(--sky-tint)", border: "3px solid var(--book-blue)" }}>
                <div className="text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center font-display-bn text-2xl font-bold mb-3"
                    style={{ background: "var(--blue-gradient)", color: "white" }}
                  >
                    ডে.না.
                  </div>
                  <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>
                    প্রতিষ্ঠাতা
                  </p>
                  <p className="text-xs font-body-bn" style={{ color: "#64748b" }}>
                    [ডেমো নাম]
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right: Story */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-body-bn text-base leading-relaxed mb-5" style={{ color: "#475569" }}>
                ছোট্ট একটি স্বপ্ন থেকে শুরু — বাংলাদেশের প্রতিটি ছোট লাইব্রেরিকে ডিজিটাল করে তোলা।
                কাগজের রেজিস্টারে বইয়ের হিসাব রাখার দিন শেষ করে, আমরা অক্ষর পাঠাগার তৈরি করেছি
                যাতে প্রতিটি বই, প্রতিটি সদস্য, প্রতিটি লেনদেন — সব এক জায়গায় থাকে।
              </p>
              <p className="font-body-bn text-base leading-relaxed mb-6" style={{ color: "#475569" }}>
                সম্পূর্ণ বাংলায়, সহজবোধ্য ইন্টারফেসে, যেকোনো ডিভাইস থেকে ব্যবহারযোগ্য — এটাই ছিল আমাদের লক্ষ্য।
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "প্রতিষ্ঠা", value: "২০২১ [ডেমো]" },
                  { label: "অবস্থান", value: "বাংলাদেশ [ডেমো]" },
                  { label: "ইমেইল", value: "demo@akkhor.com" },
                  { label: "ফোন", value: "+880 XXXX [ডেমো]" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="font-ui text-xs font-bold uppercase tracking-wider" style={{ color: "var(--book-blue)" }}>
                      {item.label}
                    </dt>
                    <dd className="font-body-bn text-sm mt-0.5" style={{ color: "var(--ink-navy)" }}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.8 LIVE STATS (COUNT-UP)
          ====================================== */}
      <StatsSection />

      {/* ======================================
          §4.9 SALES CORNER
          ====================================== */}
      <section id="sales" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="বিক্রয় কর্নার" heading="লাইব্রেরির নিজস্ব শপ" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {DEMO_SALES_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.id}
                  className="hp-card p-5 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "var(--sky-tint)" }}
                  >
                    <Icon size={28} style={{ color: "var(--book-blue)" }} />
                  </div>
                  <h4 className="font-body-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>
                    {item.name}
                  </h4>
                  <p className="font-display-lat text-base font-bold mt-1" style={{ color: "var(--flame-orange)" }}>
                    {item.price}
                  </p>
                  <button
                    className="mt-3 text-xs font-ui px-3 py-1.5 rounded-lg cursor-pointer border-none"
                    style={{ background: "var(--sky-tint)", color: "var(--book-blue)" }}
                  >
                    দেখুন
                  </button>
                </motion.div>
              );
            })}
          </div>
          {/* DEMO banner */}
          <motion.p
            className="text-center font-body-bn text-sm mt-8"
            style={{ color: "#64748b" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="font-display-lat font-bold" style={{ color: "var(--flame-orange)" }}>১,০০০+</span> সদস্য আমাদের শপ থেকে কিনেছেন <span className="text-xs">[DEMO]</span>
          </motion.p>
        </div>
      </section>

      {/* ======================================
          §4.10 TESTIMONIALS
          ====================================== */}
      <section id="testimonials" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="মতামত" heading="সদস্যরা যা বলেন" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* DEMO_MEMBERS */}
            {DEMO_MEMBERS.map((member, i) => (
              <motion.div
                key={i}
                className="hp-card p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      size={16}
                      fill={starIdx < member.rating ? "#F7941D" : "none"}
                      stroke={starIdx < member.rating ? "#F7941D" : "#cbd5e1"}
                    />
                  ))}
                </div>
                <p className="font-body-bn text-sm leading-relaxed mb-5" style={{ color: "#475569" }}>
                  "{member.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <InitialsAvatar initials={member.initials} />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>
                      {member.name}
                    </p>
                    <p className="text-xs font-body-bn" style={{ color: "#94a3b8" }}>
                      সদস্য [DEMO]
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          §4.11 NEWS / EVENTS
          ====================================== */}
      <section id="news" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="সর্বশেষ" heading="লাইব্রেরির খবর" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {DEMO_NEWS.map((news, i) => (
              <motion.div
                key={news.id}
                className="hp-card p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} style={{ color: "var(--flame-orange)" }} />
                  <span className="text-xs font-ui" style={{ color: "var(--flame-orange)" }}>
                    {news.date}
                  </span>
                </div>
                <h4 className="font-display-bn text-lg font-bold mb-2" style={{ color: "var(--ink-navy)" }}>
                  {news.title}
                </h4>
                <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>
                  {news.summary}
                </p>
                <button
                  className="mt-4 text-sm font-ui font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none"
                  style={{ color: "var(--book-blue)" }}
                >
                  বিস্তারিত <ChevronRight size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          §4.12 CONTACT
          ====================================== */}
      <section id="contact" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="যোগাযোগ" heading="আমাদের লিখুন" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Form */}
            <motion.form
              onSubmit={handleContactSubmit}
              className="space-y-4"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                  নাম
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border"
                  style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                  placeholder="আপনার নাম"
                />
              </div>
              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                  ইমেইল
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border"
                  style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                  বিষয়
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border"
                  style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                  placeholder="বিষয় লিখুন"
                />
              </div>
              <div>
                <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                  বার্তা
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border resize-none"
                  style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                  placeholder="আপনার বার্তা লিখুন..."
                />
              </div>
              <button
                type="submit"
                disabled={contactSubmitting}
                className="btn-flame px-6 py-3 text-sm font-ui w-full flex items-center justify-center gap-2"
              >
                {contactSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : contactSent ? (
                  <>
                    <Check size={16} /> পাঠানো হয়েছে!
                  </>
                ) : (
                  <>
                    <Send size={16} /> পাঠান
                  </>
                )}
              </button>
            </motion.form>

            {/* Contact meta */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
            >
              <div className="hp-card p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin size={20} style={{ color: "var(--book-blue)" }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>ঠিকানা</p>
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>ঢাকা, বাংলাদেশ [ডেমো ঠিকানা]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} style={{ color: "var(--book-blue)" }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>ফোন</p>
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>+880 XXXX-XXXXXX [ডেমো]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={20} style={{ color: "var(--book-blue)" }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>ইমেইল</p>
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>demo@akkhorpathagar.com [ডেমো]</p>
                  </div>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
                    style={{ background: "var(--sky-tint)", color: "var(--book-blue)" }}
                    aria-label="Social link [DEMO]"
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.13 FOOTER
          ====================================== */}
      <footer className="py-12 md:py-16 px-4" style={{ background: "var(--ink-navy)", color: "white" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoSrc} alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5" />
                <span className="font-display-bn text-lg font-bold">অক্ষর পাঠাগার</span>
              </div>
              <p className="font-body-bn text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                বাংলায় তৈরি স্মার্ট লাইব্রেরি ম্যানেজমেন্ট সিস্টেম। প্রতিটি বই, প্রতিটি সদস্য — এক জায়গায়।
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-ui text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
                দ্রুত লিংক
              </h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: "হোম", href: "#hero" },
                  { label: "বৈশিষ্ট্য", href: "#features" },
                  { label: "সদস্যপদ", href: "#membership" },
                  { label: "যোগাযোগ", href: "#contact" },
                ].map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollTo(link.href)}
                    className="text-left font-body-bn text-sm cursor-pointer bg-transparent border-none transition-colors"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-ui text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
                যোগাযোগ
              </h4>
              <div className="flex flex-col gap-2 font-body-bn text-sm" style={{ color: "#94a3b8" }}>
                <span>ঢাকা, বাংলাদেশ [ডেমো]</span>
                <span>+880 XXXX-XXXXXX [ডেমো]</span>
                <span>demo@akkhorpathagar.com</span>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-ui text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
                আপডেট পান
              </h4>
              <p className="font-body-bn text-sm mb-3" style={{ color: "#94a3b8" }}>
                নতুন বই ও ইভেন্টের খবর সরাসরি পান
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="আপনার ইমেইল"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-body-bn border-none"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
                <button
                  className="px-3 py-2 rounded-lg cursor-pointer border-none font-ui text-sm font-bold"
                  style={{ background: "var(--flame-gradient)", color: "white" }}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-center font-body-bn text-xs" style={{ color: "#64748b" }}>
              © ২০২৬ অক্ষর পাঠাগার। সর্বস্বত্ব সংরক্ষিত। বাংলায় তৈরি 🇧🇩
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ===========================================
   STATS SECTION (Extracted for useInView hook)
   =========================================== */
function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const statItems = [
    { label: "মোট বই", value: DEMO_STATS.totalBooks, suffix: "+" },
    { label: "সক্রিয় সদস্য", value: DEMO_STATS.activeMembers, suffix: "+" },
    { label: "ইস্যুকৃত বই", value: DEMO_STATS.issuedBooks, suffix: "+" },
    { label: "সক্রিয় কর্নার", value: DEMO_STATS.activeCorners, suffix: "" },
    { label: "চালু আছে (বছর)", value: DEMO_STATS.yearsRunning, suffix: "" },
  ];

  return (
    <section id="stats" className="section-warm py-16 md:py-24 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader eyebrow="সংক্ষেপে" heading="এক নজরে অক্ষর পাঠাগার" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
          {statItems.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({ stat, index, inView }: { stat: { label: string; value: number; suffix: string }; index: number; inView: boolean }) {
  const displayValue = useCountUp(stat.value, inView);

  return (
    <motion.div
      className="hp-card p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <p className="font-display-lat text-3xl md:text-4xl font-bold" style={{ color: "var(--ink-navy)" }}>
        {displayValue.toLocaleString()}{stat.suffix}
      </p>
      <motion.div
        className="flame-underline mx-auto mt-2"
        style={{ maxWidth: 40 }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
      />
      <p className="font-body-bn text-sm mt-3" style={{ color: "#64748b" }}>
        {stat.label}
      </p>
    </motion.div>
  );
}
