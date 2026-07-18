import React, { useState, useEffect, useRef, useCallback } from "react";
import DonationCTA from "./DonationCTA";
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
  CalendarClock,
  Send,
  Loader2,
  Book,
  Heart,
} from "lucide-react";
import akkhorLogo from "../assets/images/akkhor_logo_1781456142605.jpg";
import foundersImg from "../assets/images/founders.png";
import karyonirbahiImg from "../assets/images/karyonirbahi.png";
import tawhidImg from "../assets/images/tawhid.png";
import cornerBanner from "../assets/images/corner-banner.jpg";
import Hero3DImage from "./Hero3DImage";
import NewsletterPopup, { subscribeNewsletter } from "./NewsletterPopup";

/* ===========================================
   DEMO DATA CONSTANTS
   All placeholder content below. Replace with
   real API responses from /api/* endpoints.
   =========================================== */

const DEMO_BOOKS = [
  // নজরুল কর্নার
  { id: "1", title: "অগ্নিবীণা", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার", reads: 98 },
  { id: "2", title: "বিষের বাঁশী", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার", reads: 82 },
  { id: "3", title: "সাম্যবাদী", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার", reads: 75 },
  { id: "4", title: "সর্বহারা", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার", reads: 60 },
  { id: "5", title: "দোলনচাঁপা", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "নজরুল কর্নার", reads: 55 },
  // রবীন্দ্রনাথ কর্নার
  { id: "6", title: "গীতাঞ্জলি", author: "রবীন্দ্রনাথ ঠাকুর", color: "#0D5FA0", corner: "রবীন্দ্রনাথ কর্নার", reads: 120 },
  { id: "7", title: "শেষের কবিতা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#EC2C7B", corner: "রবীন্দ্রনাথ কর্নার", reads: 105 },
  { id: "8", title: "গোরা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#0D5FA0", corner: "রবীন্দ্রনাথ কর্নার", reads: 90 },
  { id: "9", title: "ঘরে-বাইরে", author: "রবীন্দ্রনাথ ঠাকুর", color: "#0D5FA0", corner: "রবীন্দ্রনাথ কর্নার", reads: 78 },
  { id: "10", title: "সঞ্চয়িতা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#0D5FA0", corner: "রবীন্দ্রনাথ কর্নার", reads: 68 },
  // উপন্যাস
  { id: "11", title: "পথের পাঁচালী", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", color: "#1C8FE0", corner: "উপন্যাস", reads: 135 },
  { id: "12", title: "দেবদাস", author: "শরৎচন্দ্র চট্টোপাধ্যায়", color: "#16233F", corner: "উপন্যাস", reads: 112 },
  { id: "13", title: "চাঁদের পাহাড়", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", color: "#0D5FA0", corner: "উপন্যাস", reads: 95 },
  { id: "14", title: "শ্রীকান্ত", author: "শরৎচন্দ্র চট্টোপাধ্যায়", color: "#16233F", corner: "উপন্যাস", reads: 88 },
  { id: "15", title: "আরণ্যক", author: "বিভূতিভূষণ বন্দ্যোপাধ্যায়", color: "#1C8FE0", corner: "উপন্যাস", reads: 72 },
  // গল্প
  { id: "16", title: "ফেলুদা সমগ্র", author: "সত্যজিৎ রায়", color: "#29ABE2", corner: "গল্প", reads: 140 },
  { id: "17", title: "গল্পগুচ্ছ", author: "রবীন্দ্রনাথ ঠাকুর", color: "#29ABE2", corner: "গল্প", reads: 110 },
  { id: "18", title: "প্রফেসর শঙ্কু", author: "সত্যজিৎ রায়", color: "#29ABE2", corner: "গল্প", reads: 102 },
  { id: "19", title: "হীরক রাজার দেশে", author: "সত্যজিৎ রায়", color: "#29ABE2", corner: "গল্প", reads: 85 },
  { id: "20", title: "মহেশ", author: "শরৎচন্দ্র চট্টোপাধ্যায়", color: "#29ABE2", corner: "গল্প", reads: 65 },
  // কবিতা
  { id: "21", title: "সোনার তরী", author: "রবীন্দ্রনাথ ঠাকুর", color: "#F7941D", corner: "কবিতা", reads: 95 },
  { id: "22", title: "বলাকা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#F7941D", corner: "কবিতা", reads: 80 },
  { id: "23", title: "চিত্রা", author: "রবীন্দ্রনাথ ঠাকুর", color: "#F7941D", corner: "কবিতা", reads: 70 },
  { id: "24", title: "বাঁধন হারা", author: "কাজী নজরুল ইসলাম", color: "#F7941D", corner: "কবিতা", reads: 62 },
  { id: "25", title: "রূপসী বাংলা", author: "জীবনানন্দ দাশ", color: "#F7941D", corner: "কবিতা", reads: 58 },
  // ইতিহাস
  { id: "26", title: "বাংলাদেশের ইতিহাস", author: "রমেশচন্দ্র মজুমদার", color: "#16233F", corner: "ইতিহাস", reads: 88 },
  { id: "27", title: "একাত্তরের দিনগুলি", author: "জাহানারা ইমাম", color: "#16233F", corner: "ইতিহাস", reads: 105 },
  { id: "28", title: "মুক্তিযুদ্ধের ইতিহাস", author: "মুনতাসীর মামুন", color: "#16233F", corner: "ইতিহাস", reads: 72 },
  { id: "29", title: "ভারতবর্ষের ইতিহাস", author: "অক্ষয়কুমার মৈত্রেয়", color: "#16233F", corner: "ইতিহাস", reads: 55 },
  { id: "30", title: "বাঙালির ইতিহাস", author: "নীহাররঞ্জন রায়", color: "#16233F", corner: "ইতিহাস", reads: 48 },
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
  { label: "বিক্রয় কর্নার", href: "#sales", isPage: true },
  { label: "মতামত", href: "#testimonials" },
  { label: "যোগাযোগ", href: "#contact" },
];

const FEATURES = [
  { icon: Activity, title: "রিয়েল-টাইম ট্র্যাকিং", desc: "কে কোন বই নিয়েছে, সাথে সাথে জানুন" },
  { icon: Bell, title: "স্বয়ংক্রিয় SMS রিমাইন্ডার", desc: "ফেরতের তারিখ ভুলে যাওয়ার দিন শেষ" },
  { icon: Users, title: "মাল্টি-রোল অ্যাক্সেস", desc: "অ্যাডমিন, সদস্য ও গেস্ট আলাদা ড্যাশবোর্ড" },
  { icon: ClipboardList, title: "অডিট লগ", desc: "প্রতিটি কাজের হিসাব, সেকেন্ড ধরে" },
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
  onMemberLogin: () => void;   // Navigate to membership signup
  onLibraryMemberLogin: () => void; // Navigate to member login
  onGuestEntry: () => void;    // Enter as guest
  logoBase64?: string;         // Dynamic logo from server
  onSalesCorner?: () => void;  // Navigate to dedicated sales page
  onBookSelect?: (book: any) => void; // Show book details
  onNoticeSelect?: (notice: any) => void; // Show notice details
}

export default function HomePage({ onLogin, onMemberLogin, onLibraryMemberLogin, onGuestEntry, logoBase64, onSalesCorner, onBookSelect, onNoticeSelect }: HomePageProps) {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openCorner, setOpenCorner] = useState<string | null>("নজরুল কর্নার");
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  // New Write Form states
  const [contactTab, setContactTab] = useState<'contact' | 'write'>('contact');
  const [writeForm, setWriteForm] = useState({ name: "", email: "", subject: "", category: "পরামর্শ", message: "" });
  const [writeAttachment, setWriteAttachment] = useState<File | null>(null);
  const [writeSubmitting, setWriteSubmitting] = useState(false);
  const [writeSent, setWriteSent] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [footerEmail, setFooterEmail] = useState("");
  const [footerSubStatus, setFooterSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [realBooks, setRealBooks] = useState<any[]>([]);
  const [hotSalesItems, setHotSalesItems] = useState<any[]>([]);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [liveNotices, setLiveNotices] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState(DEMO_STATS);
  const [liveCorners, setLiveCorners] = useState<{name: string; bookCount: number; topBooks: {id: string; code: string; title: string; author: string; imageUrl: string; reads: number}[]}[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/public/books");
        if (res.ok) {
          const data = await res.json();
          const booksArray = Array.isArray(data) ? data : (data.books || []);
          if (Array.isArray(booksArray)) {
            setRealBooks(booksArray.filter((b: any) => b.imageUrl));
          }
        }
      } catch (e) {
        console.warn("Failed to load real books", e);
      }
    };
    
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/public/shop/items");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.shopItems && Array.isArray(data.shopItems)) {
            setHotSalesItems(data.shopItems.slice(0, 5));
          }
        }
      } catch (e) {
        console.warn("Failed to load sales items", e);
      }
    };

    const fetchReviewsAndNotices = async () => {
      try {
        const [reviewsRes, noticesRes] = await Promise.all([
          fetch("/api/public/reviews"),
          fetch("/api/public/notices")
        ]);
        if (reviewsRes.ok) {
          const r = await reviewsRes.json();
          if (Array.isArray(r)) {
            setAllReviews(r);
            setLiveReviews(r.slice(0, 3));
          }
        }
        if (noticesRes.ok) {
          const n = await noticesRes.json();
          if (Array.isArray(n)) setLiveNotices(n.slice(0, 3));
        }
      } catch (e) {
        console.warn("Failed to load reviews/notices", e);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/public/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setLiveStats({
              totalBooks: data.totalBooks ?? 0,
              activeMembers: data.activeMembers ?? 0,
              issuedBooks: data.issuedBooks ?? 0,
              activeCorners: data.activeCorners ?? 0,
              yearsRunning: data.yearsRunning ?? 1,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to load stats", e);
      }
    };

    const fetchCorners = async () => {
      try {
        const res = await fetch("/api/public/corners");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.corners) && data.corners.length > 0) {
            setLiveCorners(data.corners);
          }
        }
      } catch (e) {
        console.warn("Failed to load corners", e);
      }
    };

    fetchBooks();
    fetchSales();
    fetchReviewsAndNotices();
    fetchStats();
    fetchCorners();
  }, []);

  const displayBooks = realBooks.length >= 5 ? realBooks : [...realBooks, ...DEMO_BOOKS];

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

  // Contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactSent(true);
        setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setContactSent(false), 4000);
      } else {
        alert("বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
      }
    } catch (e) {
      console.error(e);
      alert("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    } finally {
      setContactSubmitting(false);
    }
  };

  // Write Us form submission
  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWriteSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", writeForm.name);
      formData.append("email", writeForm.email);
      formData.append("subject", writeForm.subject);
      formData.append("category", writeForm.category);
      formData.append("message", writeForm.message);
      if (writeAttachment) {
        formData.append("attachment", writeAttachment);
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setWriteSent(true);
        setWriteForm({ name: "", email: "", subject: "", category: "পরামর্শ", message: "" });
        setWriteAttachment(null);
        setTimeout(() => setWriteSent(false), 4000);
      } else {
        alert("জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err) {
      alert("জমা দিতে সমস্যা হয়েছে।");
    } finally {
      setWriteSubmitting(false);
    }
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
  const heroWords = "জ্ঞান হোক সবার জন্য, পরিবর্তন শুরু হোক শিক্ষা দিয়ে".split(" ");

  return (
    <div className="homepage">
      {/* ======================================
          §4.1 HEADER / NAVIGATION — Floating Pill
          ====================================== */}
      <header
        className={`hp-header fixed top-0 left-0 right-0 z-50 px-4 md:px-6 pt-3 md:pt-4 ${headerScrolled ? "scrolled" : ""}`}
        style={{ backgroundColor: "transparent", pointerEvents: "none" }}
      >
        <div className="hp-header-pill" style={{ pointerEvents: "auto" }}>
          {/* Logo + Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src={logoSrc}
              alt="অক্ষর পাঠাগার লোগো"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full object-contain bg-white border border-[#1C8FE0]/15 p-0.5"
            />
            <span className="font-display-bn text-sm md:text-base font-bold" style={{ color: "var(--ink-navy)" }}>
              অক্ষর পাঠাগার
            </span>
          </div>

          {/* Desktop Nav — center links */}
          <nav className="hidden lg:flex items-center gap-1 mx-4" id="homepage-desktop-nav">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  if (link.isPage && link.href === "#sales" && onSalesCorner) {
                    onSalesCorner();
                  } else {
                    scrollTo(link.href);
                  }
                }}
                className="pill-nav-link font-body-bn"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side — login + CTA + mobile toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onLogin}
              className="pill-login-link font-ui hidden sm:inline-flex"
              id="homepage-login-btn"
            >
              লগইন
            </button>
            <span className="pill-divider hidden sm:block" />
            <button
              onClick={onMemberLogin}
              className="pill-cta font-ui"
              id="homepage-member-btn"
            >
              সদস্য হোন
            </button>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="pill-mobile-toggle lg:hidden"
              aria-label="মোবাইল মেনু খুলুন"
            >
              <Menu size={20} />
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
                    onClick={() => {
                      if (link.isPage && link.href === "#sales" && onSalesCorner) {
                        setMobileMenuOpen(false);
                        onSalesCorner();
                      } else {
                        scrollTo(link.href);
                      }
                    }}
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
              জ্ঞানচর্চা, শিক্ষা ও মানবিক মূল্যবোধের এক নিরবচ্ছিন্ন কেন্দ্র
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
              অক্ষর পাঠাগার একটি অরাজনৈতিক, অলাভজনক, শিক্ষামূলক ও মানবিক স্বেচ্ছাসেবী সংগঠন। আমাদের লক্ষ্য জ্ঞানচর্চার প্রসার, পাঠাভ্যাস গড়ে তোলা, মানবিক মূল্যবোধের বিকাশ এবং শিক্ষাবঞ্চিত ও সুবিধাবঞ্চিত মানুষের পাশে দাঁড়িয়ে একটি আলোকিত সমাজ গড়ে তোলা।
            </motion.p>

            {/* CTA row */}
            <motion.div
              className="flex flex-wrap gap-3 mt-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <button
                onClick={onGuestEntry}
                className="btn-ghost px-6 py-3 text-sm md:text-base font-ui"
                id="hero-cta-guest"
              >
                গেস্ট হিসেবে দেখুন
              </button>
              <button
                onClick={onLibraryMemberLogin}
                className="btn-blue px-6 py-3 text-sm md:text-base font-ui"
                id="hero-cta-member-login"
              >
                পাঠাগারের সদস্য লগইন
              </button>
              <button
                onClick={onMemberLogin}
                className="btn-flame px-6 py-3 text-sm md:text-base font-ui flex items-center gap-2 group"
                id="hero-cta-primary"
              >
                পাঠাগারে সদস্য হোন
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
                চলছে <strong className="font-display-lat" style={{ color: "var(--ink-navy)" }}>{liveStats.totalBooks.toLocaleString("bn-BD")}+</strong> বই
              </span>
              <span style={{ color: "#cbd5e1" }}>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--book-blue)" }} />
                <strong className="font-display-lat" style={{ color: "var(--ink-navy)" }}>{liveStats.activeMembers.toLocaleString("bn-BD")}</strong> সক্রিয় সদস্য
              </span>
            </motion.div>
          </div>

          {/* Right: Hero 3D Image */}
          <motion.div
            className="relative flex items-center justify-center w-full h-80 md:h-[450px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Hero3DImage />
          </motion.div>
        </div>
      </section>

      {/* ======================================
          §4.3 WHY AKKHOR PATHAGAR
          ====================================== */}
      <section id="features" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto relative overflow-hidden rounded-[2rem] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5 }}
          >
            {/* Dark Header Block */}
            <div 
              className="px-8 py-12 md:py-16 md:px-16 text-center relative"
              style={{ background: "linear-gradient(135deg, #0B1120 0%, #172554 100%)" }}
            >
              {/* Decorative Circle */}
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6 bg-white/5 backdrop-blur-sm">
                <div className="w-4 h-4 rounded-full bg-white/20" />
              </div>
              
              {/* Pill Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] text-white/90 font-display-lat">
                  WHAT IS THE OKKHOR PATHAGAR?
                </span>
              </div>

              {/* Headings */}
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 font-display-bn">
                অক্ষর পাঠাগার কী?
              </h2>
              <p className="text-[#94a3b8] text-lg md:text-xl font-display-lat italic">
                Just a <span className="relative inline-block">
                  <span className="relative z-10 text-white">PDF library?</span>
                  <span className="absolute bottom-1 left-0 w-full h-[3px] rounded-full bg-[#38BDF8]/60 z-0" />
                </span>
                {" "}No — <span className="relative inline-block">
                  <span className="relative z-10 text-white">a knowledge center.</span>
                  <span className="absolute bottom-1 left-0 w-full h-[3px] rounded-full bg-[#38BDF8]/60 z-0" />
                </span>
              </p>

              {/* Wavy Divider */}
              <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg className="relative block w-full h-[40px] rotate-180" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
                </svg>
              </div>
            </div>

            {/* White Body Content */}
            <div className="bg-white px-6 py-12 md:p-16 text-center relative z-10">
              <span className="inline-block text-[10px] md:text-xs uppercase font-bold tracking-widest px-4 py-1.5 rounded-full mb-8 font-display-bn bg-[#F8FAFC] text-[#64748b] border border-[#E2E8F0]">
                বিস্তারিত
              </span>

              <p className="font-body-bn text-xl md:text-[22px] leading-relaxed mx-auto mb-8 text-left" style={{ color: "var(--ink-navy)", maxWidth: "700px" }}>
                <span className="font-bold text-2xl md:text-3xl block mb-6 leading-tight" style={{ color: "var(--book-blue)" }}>
                  <span style={{ color: "var(--flame-orange)" }}>*</span> জ্ঞানচর্চা, শিক্ষা ও মানবিক মূল্যবোধের এক নিরবচ্ছিন্ন কেন্দ্র
                </span>
                <span className="block mb-5 text-[#334155]">
                  "অক্ষর পাঠাগার" একটি অরাজনৈতিক, অলাভজনক, শিক্ষামূলক ও মানবিক স্বেচ্ছাসেবী সংগঠন। যা গণগ্রন্থাগার অধিদপ্তর থেকে বেসরকারি লাইব্রেরী নিবন্ধন তালিকাভুক্ত, বেসর/লাই নং-০৪।
                </span>
                <span className="block mb-5 text-[#334155] font-medium p-5 rounded-2xl bg-[#F8FAFC] border-l-4 border-l-[var(--book-blue)] shadow-sm">
                  আমাদের লক্ষ্য জ্ঞানচর্চার প্রসার, পাঠাভ্যাস গড়ে তোলা, মানবিক মূল্যবোধের বিকাশ এবং শিক্ষাবঞ্চিত ও সুবিধাবঞ্চিত মানুষের পাশে দাঁড়িয়ে একটি আলোকিত সমাজ গড়ে তোলা।
                </span>
                <span className="block text-[#475569] font-medium p-5 rounded-2xl bg-[#F8FAFC] border-l-4 border-l-[var(--book-blue)] shadow-sm">
                  আমাদের ডিজিটাল প্ল্যাটফর্মে বাংলা সাহিত্য, ইসলামিক বই, একাডেমিক বই, গবেষণামূলক প্রকাশনা, জ্ঞানভিত্তিক রিসোর্স এবং অন্যান্য শিক্ষাসামগ্রী সহজে খুঁজে পাওয়ার সুযোগ রয়েছে।
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================
          §4.4 OUR MISSION
          ====================================== */}
      <section id="mission" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <SectionHeader eyebrow="আমাদের লক্ষ্য" heading="জ্ঞানভিত্তিক সমাজ গড়ার অঙ্গীকার" />

            <motion.div
              className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-[#E2E8F0] relative overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5 }}
            >
              {/* Decorative accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: "var(--flame-gradient)" }} />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--sky-tint)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--book-blue)" strokeWidth="2" className="w-6 h-6">
                    <path d="M12 6v12M6 12h12" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display-bn text-xl md:text-2xl font-bold" style={{ color: "var(--ink-navy)" }}>
                    একটি জ্ঞানভিত্তিক সমাজ গড়ার লক্ষ্যে
                  </h3>
                </div>
              </div>

              <p className="font-body-bn text-base md:text-lg leading-relaxed mb-6" style={{ color: "#334155" }}>
                আমাদের লক্ষ্য এমন একটি জ্ঞানভিত্তিক সমাজ গড়ে তোলা, যেখানে শিক্ষা, বই, গবেষণা, নৈতিকতা ও মানবিক মূল্যবোধ সকলের কাছে সমানভাবে পৌঁছে যায়। প্রযুক্তিকে কাজে লাগিয়ে আমরা জ্ঞানকে আরও সহজলভ্য, সংগঠিত এবং সবার জন্য উন্মুক্ত করার চেষ্টা করছি।
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { value: "শিক্ষা", desc: "জ্ঞানচর্চার প্রসার" },
                  { value: "মানবিকতা", desc: "সামাজিক দায়বদ্ধতা" },
                  { value: "গবেষণা", desc: "তথ্যভিত্তিক জ্ঞান" },
                  { value: "প্রযুক্তি", desc: "জ্ঞানের সহজলভ্যতা" },
                ].map((item, i) => (
                  <motion.div
                    key={item.value}
                    className="text-center p-4 rounded-xl"
                    style={{ background: "#F8FAFC" }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  >
                    <p className="font-display-bn text-sm font-bold mb-1" style={{ color: "var(--book-blue)" }}>
                      {item.value}
                    </p>
                    <p className="font-body-bn text-xs" style={{ color: "#64748b" }}>
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.5 WHAT WE DO
          ====================================== */}
      <section id="what-we-do" className="section-tint py-16 md:py-24 px-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="আমরা যা করি" heading="জ্ঞান ও মানবিকতার জন্য আমাদের উদ্যোগ" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { icon: BookOpen, title: "জ্ঞানচর্চা ও পাঠাভ্যাস", desc: "বই পড়ার অভ্যাস গড়ে তোলা এবং জ্ঞানচর্চায় উৎসাহ প্রদান করা আমাদের প্রধান লক্ষ্য।" },
              { icon: Users, title: "শিক্ষামূলক উদ্যোগ", desc: "শিক্ষাবঞ্চিত ও সুবিধাবঞ্চিত শিশু-কিশোরদের জন্য শিক্ষামূলক কার্যক্রম ও কর্মশালা পরিচালনা।" },
              { icon: Heart, title: "মানবিক ও সামাজিক কার্যক্রম", desc: "দুর্যোগকালীন সহায়তা, অসহায় মানুষের পাশে দাঁড়ানো ও সমাজসেবামূলক প্রকল্প বাস্তবায়ন।" },
              { icon: Book, title: "বই ও জ্ঞানসম্পদের ডিজিটাল সংরক্ষণ", desc: "বাংলা সাহিত্য, ইসলামিক বই, একাডেমিক বই ও গবেষণাপত্র ডিজিটাল আকারে সংরক্ষণ ও সহজলভ্যকরণ।" },
              { icon: FileSpreadsheet, title: "বাংলায় শিক্ষামূলক রিসোর্স তৈরি", desc: "বাংলা ভাষায় জ্ঞানভিত্তিক কনটেন্ট, শিক্ষামূলক উপকরণ ও রিসোর্স তৈরি ও প্রকাশ।" },
              { icon: ClipboardList, title: "গবেষণা ও তথ্যভিত্তিক শিক্ষা", desc: "গবেষণামূলক প্রকাশনা, তথ্যভিত্তিক শিক্ষা ও জ্ঞানচর্চাকে উৎসাহিত করা এবং প্রাসঙ্গিক তথ্য সরবরাহ।" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="hp-card p-6 group cursor-default"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all"
                  style={{ background: "var(--sky-tint)" }}
                >
                  <item.icon size={24} style={{ color: "var(--book-blue)" }} />
                </div>
                <h4 className="font-display-bn text-base font-bold mb-2" style={{ color: "var(--ink-navy)" }}>
                  {item.title}
                </h4>
                <p className="font-body-bn text-sm leading-relaxed" style={{ color: "#64748b" }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          §4.6 CORNERS (ACCORDION)
          ====================================== */}
      <section id="corners" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="কর্নার" heading="পাঠাগারের বইগুলো বিষয়ভিত্তিকভাবে সাজানো রয়েছে" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Left: Shelf Image Placeholder */}
            <motion.div
              className="hidden lg:flex flex-col items-center justify-center"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <img 
                  src={cornerBanner} 
                  alt="Corner Visual" 
                  className="rounded-2xl shadow-xl w-full max-w-sm object-cover"
                  style={{ border: "4px solid white" }}
                />
                <div 
                  className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full -z-10"
                  style={{ background: "var(--flame-gradient)", filter: "blur(20px)", opacity: 0.6 }}
                ></div>
              </div>
            </motion.div>

            {/* Right: Accordion */}
            <div className="space-y-3">
              {(liveCorners.length > 0 ? liveCorners : Object.entries(DEMO_CORNER_COUNTS).map(([name, bookCount]) => ({ name, bookCount, topBooks: DEMO_BOOKS.filter(b => b.corner === name).sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, 5).map(b => ({ id: b.id, code: '', title: b.title, author: b.author, imageUrl: '', reads: b.reads || 0 })) }))).map((cornerData, i) => {
                const isOpen = openCorner === cornerData.name;
                return (
                  <motion.div
                    key={cornerData.name}
                    className="corner-tab hp-card overflow-hidden"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                  >
                    <button
                      onClick={() => setOpenCorner(isOpen ? null : cornerData.name)}
                      className="w-full flex items-center justify-between px-5 py-4 cursor-pointer bg-transparent border-none text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-display-bn text-base font-bold" style={{ color: "var(--ink-navy)" }}>
                        {cornerData.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-display-lat text-xs px-2.5 py-0.5 rounded-full" style={{ background: "var(--sky-tint)", color: "var(--book-blue)" }}>
                          {cornerData.bookCount}টি বই
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
                          <div className="px-5 pb-5">
                            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <Book size={16} style={{ color: "var(--book-blue)" }} />
                              <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>
                                এই কর্নারে মোট <strong style={{ color: "var(--ink-navy)", fontSize: '1.1em' }}>{cornerData.bookCount}টি</strong> বই সংরক্ষিত আছে
                              </p>
                            </div>
                            {cornerData.topBooks.length > 0 && (
                              <>
                                <p className="font-body-bn text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--book-blue)" }}>
                                  🔥 সর্বাধিক পঠিত বই
                                </p>
                                <div className="space-y-2">
                                  {cornerData.topBooks.map((book, idx) => (
                                    <div
                                      key={book.id}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                                      style={{ background: idx === 0 ? 'var(--sky-tint)' : 'transparent' }}
                                    >
                                      <span
                                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-display-lat text-xs font-bold"
                                        style={{
                                          background: idx < 3 ? 'var(--flame-gradient)' : '#e2e8f0',
                                          color: idx < 3 ? 'white' : '#64748b',
                                        }}
                                      >
                                        {idx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-body-bn text-sm font-semibold truncate" style={{ color: 'var(--ink-navy)' }}>
                                          {book.title}
                                        </p>
                                        <p className="font-body-bn text-xs truncate" style={{ color: '#94a3b8' }}>
                                          {book.author}
                                        </p>
                                      </div>
                                      <span className="flex-shrink-0 font-display-lat text-xs px-2 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                        {book.reads} বার
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
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
              {displayBooks.map((book, i) => (
                <motion.div
                  key={book.id || i}
                  className="snap-start shrink-0 cursor-pointer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => {
                    if (onBookSelect) onBookSelect(book);
                  }}
                >
                  {book.imageUrl ? (
                    <div className="hp-card overflow-hidden flex flex-col justify-between" style={{ width: 160, height: 220, padding: 0 }}>
                      <img src={book.imageUrl} alt={book.name || book.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <BookSpine title={book.title || book.name} author={book.author} color={book.color || "#1C8FE0"} />
                  )}
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
          <SectionHeader eyebrow="সদস্যপদ" heading="আপনার পছন্দের পরিষেবাটি বেছে নিন" />
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
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-ui font-bold px-3 py-1 rounded-full text-[#22242A]"
                style={{ background: "var(--flame-gradient)" }}
              >
                সবচেয়ে জনপ্রিয়
              </span>
              <h3 className="font-display-bn text-xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>সদস্য</h3>
              <p className="font-display-lat text-3xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
                ১০০ BDT<span className="text-base font-normal">/মাস</span>
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
              <h3 className="font-display-bn text-xl font-bold" style={{ color: "var(--ink-navy)" }}>আজীবন সদস্য</h3>
              <p className="font-display-lat text-3xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
                ৯৯৯৯ <span className="text-base font-normal font-body-bn text-[#64748b]">টাকা</span>
              </p>
              <p className="font-body-bn text-sm mt-1 mb-6" style={{ color: "#64748b" }}>অগ্রাধিকার সুবিধা</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  { text: "সদস্যের সব সুবিধা", included: true },
                  { text: "অগ্রাধিকার রিজার্ভেশন", included: true },
                  { text: "বর্ধিত মেয়াদ", included: true },
                  { text: "বিশেষ ইভেন্ট অ্যাক্সেস", included: true },
                  { text: "SMS রিমাইন্ডার", included: true },
                  { text: "আজীবন সদস্য ব্যাজ", included: true },
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
          §4.7 ABOUT — আমাদের গল্প
          ====================================== */}
      <section id="about" className="section-tint py-16 md:py-24 px-4 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <style>{`
          .about-p::before {
            content: "";
            position: absolute; left: -38px; top: 0.55em;
            width: 7px; height: 7px; border-radius: 50%;
            background: #FFFFFF;
            border: 2px solid #F97316;
            transform: scale(1);
          }
          @media(max-width:880px) { .about-p::before { left: -26px; } }
          
          .about-mark {
            position: relative;
            background: none;
            font-weight: 700;
            background-image: linear-gradient(90deg, #F97316, #F43F5E);
            -webkit-background-clip: text; background-clip: text; color: transparent;
            padding-bottom: 2px;
          }
          .about-mark::after {
            content: "";
            position: absolute; left: 0; bottom: -1px; height: 2px; width: 100%;
            background: linear-gradient(90deg, #F97316, #F43F5E);
          }
        `}</style>

        <div className="max-w-7xl mx-auto">
          {/* Custom Header using the new styling */}
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block font-semibold text-[0.95rem] text-[#F97316] mb-3.5"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: 0.05 }}
            >
              কেন শুরু হলো অক্ষর পাঠাগার?
            </motion.span>
            <motion.h2 
              className="font-display-bn font-extrabold text-[#0F172A]"
              style={{ fontSize: "clamp(1.9rem, 4vw, 2.7rem)", fontFamily: "'Baloo Da 2', 'Tiro Bangla', serif" }}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.18 }}
            >
              আমাদের গল্প
            </motion.h2>
            <motion.div 
              className="w-[70px] h-1 rounded-sm mx-auto mt-4"
              style={{ background: "linear-gradient(90deg, #F97316, #F97316, #F43F5E)" }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: 0.6 }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 lg:gap-[70px] items-center max-w-6xl mx-auto">
            {/* Left: Card Col */}
            <motion.div 
              className="flex flex-col items-center relative order-2 lg:order-1"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <div 
                className="w-full bg-white rounded-3xl p-2.5 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ boxShadow: "0 20px 50px rgba(15,23,42,0.10)" }}
              >
                <img src={karyonirbahiImg} alt="কার্যনির্বাহী পরিষদ" className="w-full rounded-2xl block object-cover" />
              </div>

            </motion.div>

            {/* Right: Text Col */}
            <div className="relative pl-7 md:pl-10 order-1 lg:order-2">
              {/* Progress track */}
              <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: "rgba(15,23,42,0.10)" }}>
                <motion.div 
                  className="absolute left-0 top-0 w-full rounded-full"
                  style={{ 
                    background: "linear-gradient(180deg, #F97316, #F97316, #F43F5E)",
                    boxShadow: "0 0 12px rgba(249,115,22,0.5)"
                  }}
                  initial={{ height: "0%" }}
                  whileInView={{ height: "100%" }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                />
              </div>

              {/* Quote Mark */}
              <motion.div 
                className="relative w-16 h-16 flex items-center justify-center mb-5"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div 
                  className="absolute -inset-3.5 rounded-full blur-md"
                  style={{ background: "radial-gradient(circle, rgba(249,115,22,0.30), rgba(244,63,94,0.18) 55%, transparent 75%)", animation: "pulse 3s infinite" }}
                />
                <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" className="relative w-10 h-10 z-10">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25-.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                </svg>
              </motion.div>

              {/* Lead Text */}
              <motion.p 
                className="font-display-bn text-[#0F172A] text-xl md:text-[1.34rem] font-normal leading-relaxed mb-8"
                style={{ fontFamily: "'Tiro Bangla', serif", lineHeight: 1.85 }}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                একটি বই বদলে দিতে পারে একজন মানুষকে, একজন মানুষ বদলে দিতে পারে একটি সমাজ, আর একটি পাঠাগার বদলে দিতে পারে গোটা একটি জাতিকে।
              </motion.p>

              {/* Content text */}
              <motion.p 
                className="relative text-[#334155] text-[1.02rem] leading-[1.95] tracking-[.002em] mb-6 about-p"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                বই শুধু জ্ঞানের উৎস নয়; এটি একটি <span className="about-mark">উন্নত, সচেতন ও মানবিক সমাজ</span> গঠনের অন্যতম ভিত্তি। সেই জ্ঞানের আলো সবার কাছে—বিশেষ করে বিনামূল্যে বই পড়ার সুযোগের মাধ্যমে—পৌঁছে দিতেই <b>অক্ষর পাঠাগারের পথচলা।</b>
              </motion.p>

              {/* Divider */}
              <motion.div 
                className="flex items-center gap-3 my-7"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                <span className="text-[0.8rem] font-bold tracking-[.12em] text-[#F97316] whitespace-nowrap px-3.5 py-1.5 rounded-full border border-orange-500/20"
                  style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.10), rgba(244,63,94,0.08))" }}
                >
                  লক্ষ্য ও উদ্দেশ্য
                </span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(15,23,42,0.10), transparent)" }} />
              </motion.div>

              <motion.p 
                className="relative text-[#334155] text-[1.02rem] leading-[1.95] tracking-[.002em] mb-6 about-p"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 0.8 }}
              >
                সমাজে জ্ঞানের আলো ছড়িয়ে দেওয়ার দৃঢ় প্রত্যয় নিয়ে আমরা কয়েকজন উদ্যমী মানুষ হাতে হাত মিলিয়ে গড়ে তুলেছি একটি <b>উন্মুক্ত পাঠাগার</b>, যেখানে জ্ঞানের দুয়ার সবার জন্য সমানভাবে উন্মুক্ত।
              </motion.p>

              <motion.p 
                className="relative text-[#334155] text-[1.02rem] leading-[1.95] tracking-[.002em] mb-6 about-p"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                আমরা সুবিধাবঞ্চিত, অবহেলিত ও মেধাবী শিক্ষার্থীদের নৈতিক, জ্ঞানভিত্তিক ও মূল্যবোধনির্ভর শিক্ষায় উদ্বুদ্ধ করতে, শিশু ও প্রাপ্তবয়স্ক শিক্ষার মাধ্যমে নিরক্ষরতা হ্রাসে ভূমিকা রাখতে এবং বইকে মানুষের নিত্যসঙ্গী করে তুলতে নিরলসভাবে কাজ করে যাচ্ছি।
              </motion.p>

              <motion.p 
                className="relative text-[#334155] text-[1.02rem] leading-[1.95] tracking-[.002em] mb-6 about-p"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, delay: 1.0 }}
              >
                আমাদের বিশ্বাস, প্রতিটি মানুষের হাতে একটি বই এবং প্রতিটি এলাকায় একটি কার্যকর পাঠাগার গড়ে উঠলে জ্ঞানের আলো পৌঁছে যাবে প্রতিটি হৃদয়ে; গড়ে উঠবে একটি <span className="about-mark">আলোকিত, নৈতিক, মানবিক ও সমৃদ্ধ সমাজ।</span>
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.8 LIVE STATS (COUNT-UP)
          ====================================== */}
      <StatsSection stats={liveStats} />

      {/* ======================================
          §4.9 SALES CORNER
          ====================================== */}
      <section id="sales" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="" heading="বিক্রয় কর্নার" />
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {hotSalesItems.length > 0 
              ? hotSalesItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="hp-card p-4 flex flex-col items-center text-center cursor-pointer group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    onClick={() => {
                      if (onSalesCorner) onSalesCorner();
                    }}
                  >
                    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-50 border border-[#E5E5EA] flex items-center justify-center">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package size={24} className="text-slate-300" />
                      )}
                    </div>
                    <h4 className="font-body-bn text-sm font-bold line-clamp-1" style={{ color: "var(--ink-navy)" }}>
                      {item.name}
                    </h4>
                    <p className="font-display-lat text-base font-bold mt-1" style={{ color: "var(--flame-orange)" }}>
                      ৳{item.price}
                    </p>
                  </motion.div>
                ))
              : DEMO_SALES_ITEMS.map((item, i) => {
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
                })
            }
          </div>
          
          <DonationCTA 
            title="❤️ জ্ঞানচর্চার এই উদ্যোগে পাশে থাকুন"
            description="আপনার অনুদান বইভিত্তিক কার্যক্রম, শিক্ষামূলক উদ্যোগ এবং মানবিক সেবাকে আরও মানুষের কাছে পৌঁছে দিতে সহায়তা করে।"
            buttonLabel="অনুদান করুন"
            className="mt-12 max-w-2xl mx-auto"
          />

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => {
                if (onSalesCorner) onSalesCorner();
              }}
              className="btn-ghost px-6 py-3 text-sm md:text-base font-ui flex items-center gap-2 group cursor-pointer"
            >
              সকল পণ্য দেখুন
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.10 TESTIMONIALS
          ====================================== */}
      <section id="testimonials" className="section-warm py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="মতামত" heading="সদস্যদের রিভিউ" />
          <div className="marquee-container max-w-5xl mx-auto pt-6 pb-6">
            <div className="marquee-content">
              {/* Reviews list */}
              {[...(liveReviews.length > 0 ? liveReviews : DEMO_MEMBERS), ...(liveReviews.length > 0 ? liveReviews : DEMO_MEMBERS)].map((member, i) => (
                <div
                  key={`${member.id || 'demo'}-${i}`}
                  className="hp-card p-6 marquee-item"
                >
                  {/* Stars */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={16}
                          fill={starIdx < member.rating ? "#F7941D" : "none"}
                          stroke={starIdx < member.rating ? "#F7941D" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                    {member.subject && (
                      <span className="text-[10px] font-bold text-[#22242A] bg-[#F5F3EF] px-2 py-0.5 rounded-full line-clamp-1 max-w-[120px]" title={member.subject}>
                        {member.subject}
                      </span>
                    )}
                  </div>
                  <p 
                    className="font-body-bn text-sm leading-relaxed mb-5" 
                    style={{ 
                      color: "#475569",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    "{member.content || member.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar initials={member.initials || member.memberName?.substring(0, 2) || "স."} />
                    <div>
                      <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>
                        {member.memberName || member.name}
                      </p>
                      <p className="text-xs font-body-bn" style={{ color: "#94a3b8" }}>
                        সদস্য {member.memberFormNumber ? `(ফরম: ${member.memberFormNumber})` : "[DEMO]"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAllReviewsModal(true)}
              className="btn-ghost px-6 py-3 text-sm md:text-base font-ui flex items-center gap-2 group cursor-pointer"
            >
              সকল মতামত দেখুন
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================
          §4.11 NEWS / EVENTS
          ====================================== */}
      <section id="news" className="section-tint py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <SectionHeader eyebrow="সর্বশেষ" heading="পাঠাগারের নোটিশ বোর্ড" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(liveNotices.length > 0 ? liveNotices : DEMO_NEWS).map((news, i) => (
              <motion.div
                key={news.id}
                className="hp-card p-6 cursor-pointer group/card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => {
                  if (onNoticeSelect) {
                    onNoticeSelect(news);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} style={{ color: "var(--flame-orange)" }} />
                  <span className="text-xs font-ui" style={{ color: "var(--flame-orange)" }}>
                    {news.createdAt || news.date}
                  </span>
                </div>
                {news.image && (
                  <img
                    src={news.image}
                    alt="Notice"
                    className="w-full h-40 object-cover rounded-xl mb-3 border border-gray-200 group-hover/card:shadow-md transition-shadow"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <h4 className="font-display-bn text-lg font-bold mb-2 group-hover/card:text-[#F25A29] transition-colors" style={{ color: "var(--ink-navy)" }}>
                  {news.subject || news.title}
                </h4>
                <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>
                  {news.content || news.summary}
                </p>
                {(news.summary || news.content) && (
                  <button
                    className="mt-4 text-sm font-ui font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none"
                    style={{ color: "var(--book-blue)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onNoticeSelect) onNoticeSelect(news);
                    }}
                  >
                    বিস্তারিত <ChevronRight size={14} />
                  </button>
                )}
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
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-display-bn text-2xl md:text-4xl font-bold mt-2" style={{ color: "var(--ink-navy)" }}>
              Form
            </h2>
            <motion.div
              className="mx-auto mt-4"
              style={{ maxWidth: 80, height: 3, background: "linear-gradient(90deg, #F7941D, #EC2C7B)", borderRadius: 2 }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>

          {/* Toggle Buttons */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center bg-white rounded-full p-1.5 border border-[#E5E5EA] shadow-sm">
              <button
                onClick={() => setContactTab('contact')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${contactTab === 'contact' ? 'bg-[#22242A] text-[#FACC15]' : 'text-[#6B6B70] hover:text-[#22242A]'}`}
              >
                যোগাযোগ
              </button>
              <button
                onClick={() => setContactTab('write')}
                className={`px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${contactTab === 'write' ? 'bg-[#22242A] text-[#FACC15]' : 'text-[#6B6B70] hover:text-[#22242A]'}`}
              >
                আমাদের লিখুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Form */}
            {contactTab === 'contact' ? (
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
                    ফোন নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border"
                    style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                    placeholder="০১৭xxxxxxxx"
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
            ) : (
              <motion.form
                onSubmit={handleWriteSubmit}
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
                    value={writeForm.name}
                    onChange={(e) => setWriteForm({ ...writeForm, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border bg-white shadow-sm"
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
                    value={writeForm.email}
                    onChange={(e) => setWriteForm({ ...writeForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border bg-white shadow-sm"
                    style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                      বিষয়
                    </label>
                    <input
                      type="text"
                      value={writeForm.subject}
                      onChange={(e) => setWriteForm({ ...writeForm, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border bg-white shadow-sm"
                      style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                      placeholder="বিষয় লিখুন"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                      ক্যাটাগরি
                    </label>
                    <div className="relative">
                      <select
                        value={writeForm.category}
                        onChange={(e) => setWriteForm({ ...writeForm, category: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border appearance-none bg-white shadow-sm cursor-pointer"
                        style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                      >
                        <option value="অভিযোগ">অভিযোগ</option>
                        <option value="পরামর্শ">পরামর্শ</option>
                        <option value="গল্প">গল্প</option>
                        <option value="কবিতা">কবিতা</option>
                        <option value="উপন্যাস">উপন্যাস</option>
                        <option value="প্রবন্ধ">প্রবন্ধ</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                    বিস্তারিত লিখুন
                  </label>
                  <textarea
                    rows={4}
                    value={writeForm.message}
                    onChange={(e) => setWriteForm({ ...writeForm, message: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm font-body-bn border resize-none bg-white shadow-sm"
                    style={{ borderColor: "#e2e8f0", color: "var(--ink-navy)", outline: "none" }}
                    placeholder="আপনার লেখা বা অভিযোগ বিস্তারিত এখানে লিখুন..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-ui font-bold uppercase tracking-wider mb-1.5" style={{ color: "#64748b" }}>
                    ফাইল যুক্ত করুন (ঐচ্ছিক)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setWriteAttachment(e.target.files[0]);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-body-bn border bg-white shadow-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#22242A] file:text-[#FACC15] hover:file:bg-black file:cursor-pointer"
                    style={{ borderColor: "#e2e8f0", outline: "none" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={writeSubmitting}
                  className="px-6 py-3 text-sm font-bold w-full flex items-center justify-center gap-2 rounded-xl text-[#FACC15] bg-[#22242A] hover:bg-black transition-colors shadow-md"
                >
                  {writeSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : writeSent ? (
                    <>
                      <Check size={16} /> জমা দেওয়া হয়েছে!
                    </>
                  ) : (
                    <>
                      <Send size={16} /> জমা দিন
                    </>
                  )}
                </button>
              </motion.form>
            )}

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
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>পশ্চিম কলেজ রোড, বরগুনা, সদর বরগুনা</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} style={{ color: "var(--book-blue)" }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>ফোন</p>
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>01642816737, 01798084404</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={20} style={{ color: "var(--book-blue)" }} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>ইমেইল</p>
                    <p className="font-body-bn text-sm" style={{ color: "#64748b" }}>okkhorpathagar@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Social icons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.facebook.com/OkkhhorPathagar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl flex items-center justify-center cursor-pointer border-none gap-2"
                  style={{ 
                    background: "var(--book-blue)", 
                    color: "white", 
                    boxShadow: "0 0 20px rgba(28, 143, 224, 0.4)",
                    textDecoration: "none"
                  }}
                >
                  <Facebook size={18} />
                  <span className="font-display-lat text-sm font-bold">Facebook</span>
                </a>
                <a
                  href="https://instagram.com/okkhorpathagar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
                  style={{ background: "var(--sky-tint)", color: "var(--book-blue)", textDecoration: "none" }}
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
                  style={{ background: "var(--sky-tint)", color: "var(--book-blue)", textDecoration: "none" }}
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-colors"
                  style={{ background: "var(--sky-tint)", color: "var(--book-blue)", textDecoration: "none" }}
                >
                  <Linkedin size={18} />
                </a>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Brand & Donate */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoSrc} alt="Logo" className="w-9 h-9 rounded-lg object-contain bg-white p-0.5" />
                <span className="font-display-bn text-lg font-bold">অক্ষর পাঠাগার</span>
              </div>
              <p className="font-body-bn text-sm leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
                অরাজনৈতিক, অলাভজনক, শিক্ষামূলক ও মানবিক স্বেচ্ছাসেবী সংগঠন। জ্ঞানচর্চা, শিক্ষা ও মানবিক মূল্যবোধের বিকাশে নিয়োজিত।
              </p>
              
              {/* Donate CTA — Premium Redesign (Reused Component) */}
              <DonationCTA title="আলো ছড়ানোর মিছিলে যোগাযোগ করুন" />
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
              <div className="flex flex-col gap-3 font-body-bn text-sm" style={{ color: "#94a3b8" }}>
                <a 
                  href="https://maps.app.goo.gl/E5vehANcowQ2vcEv5?g_st=aw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group border border-white/10 bg-white/5 p-2 rounded-lg hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/10 transition-all text-[#94a3b8] hover:text-white"
                  style={{ textDecoration: 'none' }}
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#38BDF8] group-hover:-translate-y-0.5 transition-transform" />
                  <span>পশ্চিম কলেজ রোড, বরগুনা, সদর বরগুনা</span>
                </a>
                <span className="flex items-center gap-2 px-2 mt-1">
                  <Phone size={14} className="text-[#64748b]" />
                  01642-816737, 01798-084404
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-md border border-white/5 w-fit mt-1">
                  <Mail size={14} className="text-[#38BDF8]" />
                  <span className="text-white font-bold tracking-wide">hello@okkhorpathagar.com</span>
                </span>
                <span className="flex items-center gap-2 px-2">
                  <Mail size={14} className="text-[#64748b]" />
                  okkhorpathagar@gmail.com
                </span>
              </div>
            </div>

            {/* Founders */}
            <div>
              <h4 className="font-ui text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "#64748b" }}>
                পরিচালনা পরিষদ
              </h4>
              <div className="flex flex-col gap-5">
                <div>
                  <p className="font-body-bn text-sm font-bold text-white mb-0.5">মোঃ সাইফুল ইসলাম তোহা</p>
                  <p className="font-body-bn text-xs mb-1" style={{ color: "#94a3b8" }}>প্রতিষ্ঠাতা, পরিচালক, অক্ষর পাঠাগার</p>
                  <p className="font-body-bn text-xs font-bold" style={{ color: "var(--sky-tint)" }}>01642-816737</p>
                </div>
                <div>
                  <p className="font-body-bn text-sm font-bold text-white mb-0.5">ওমর বিন আব্দুল আজিজ</p>
                  <p className="font-body-bn text-xs mb-1" style={{ color: "#94a3b8" }}>প্রতিষ্ঠাতা, সহকারী পরিচালক, অক্ষর পাঠাগার</p>
                  <p className="font-body-bn text-xs font-bold" style={{ color: "var(--sky-tint)" }}>01798-084404</p>
                </div>
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
              <form className="flex gap-2" onSubmit={async (e) => {
                e.preventDefault();
                const trimmed = footerEmail.trim();
                if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) return;
                setFooterSubStatus("loading");
                const result = await subscribeNewsletter(trimmed);
                if (result.success) {
                  setFooterSubStatus("done");
                  setFooterEmail("");
                  setTimeout(() => setFooterSubStatus("idle"), 4000);
                } else {
                  setFooterSubStatus("error");
                  setTimeout(() => setFooterSubStatus("idle"), 3000);
                }
              }}>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="আপনার ইমেইল"
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-body-bn border-none"
                  style={{ background: "rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  disabled={footerSubStatus === "loading"}
                />
                <button
                  type="submit"
                  disabled={footerSubStatus === "loading"}
                  className="px-3 py-2 rounded-lg cursor-pointer border-none font-ui text-sm font-bold flex items-center justify-center"
                  style={{ background: "var(--flame-gradient)", color: "white", minWidth: 40 }}
                >
                  {footerSubStatus === "loading" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : footerSubStatus === "done" ? (
                    <Check size={14} />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
              {footerSubStatus === "done" && (
                <p className="text-xs font-body-bn mt-2" style={{ color: "#4ade80" }}>সাবস্ক্রাইব সফল হয়েছে!</p>
              )}
              {footerSubStatus === "error" && (
                <p className="text-xs font-body-bn mt-2" style={{ color: "#f87171" }}>সমস্যা হয়েছে, আবার চেষ্টা করুন।</p>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-8 mt-4 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-center md:text-left font-body-bn text-sm text-[#94a3b8]">
              © ২০২৬ অক্ষর পাঠাগার। সর্বস্বত্ব সংরক্ষিত। বাংলায় তৈরি 🇧🇩 | Developed by <a href="https://artx.techvrs.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#22242A] transition-colors" style={{ textDecoration: 'none', color: 'inherit', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>ARTX</a>
            </p>
            <div className="flex items-center gap-3 bg-white/5 rounded-full pl-3 pr-4 py-2 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
              <img src={tawhidImg} alt="মোঃ তাওহীদ ইসলাম অন্তর" className="w-7 h-7 rounded-full object-cover border border-white/20" />
              <span className="font-body-bn text-xs text-[#cbd5e1]">
                Crafted by — <strong className="text-white font-medium">মোঃ তাওহীদ ইসলাম অন্তর</strong>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* All Reviews Modal */}
      <AnimatePresence>
        {showAllReviewsModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllReviewsModal(false)}
            />
            <motion.div
              className="fixed inset-4 md:inset-10 lg:inset-x-24 lg:inset-y-12 bg-white rounded-3xl z-[100] shadow-2xl flex flex-col overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50 shrink-0">
                <h2 className="font-display-bn text-xl md:text-2xl font-bold text-[#16233F]">
                  সদস্যদের সকল মতামত
                </h2>
                <button
                  onClick={() => setShowAllReviewsModal(false)}
                  className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer text-gray-500 hover:text-gray-900 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {(allReviews.length > 0 ? allReviews : DEMO_MEMBERS).map((member, i) => (
                  <div key={member.id || i} className="hp-card p-6 h-full flex flex-col bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            size={16}
                            fill={starIdx < member.rating ? "#F7941D" : "none"}
                            stroke={starIdx < member.rating ? "#F7941D" : "#cbd5e1"}
                          />
                        ))}
                      </div>
                      {member.subject && (
                        <span className="text-[10px] font-bold text-[#22242A] bg-[#F5F3EF] px-2 py-0.5 rounded-full line-clamp-1 max-w-[120px]" title={member.subject}>
                          {member.subject}
                        </span>
                      )}
                    </div>
                    <p className="font-body-bn text-sm leading-relaxed mb-5 flex-1" style={{ color: "#475569" }}>
                      "{member.content || member.quote}"
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <InitialsAvatar initials={member.initials || member.memberName?.substring(0, 2) || "স."} />
                      <div>
                        <p className="font-display-bn text-sm font-bold" style={{ color: "var(--ink-navy)" }}>
                          {member.memberName || member.name}
                        </p>
                        <p className="text-xs font-body-bn" style={{ color: "#94a3b8" }}>
                          সদস্য {member.memberFormNumber ? `(ফরম: ${member.memberFormNumber})` : "[DEMO]"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Newsletter Popup — appears 4s after mount, suppressed for 7 days after dismiss */}
      <NewsletterPopup />
    </div>
  );
}

/* ===========================================
   STATS SECTION (Extracted for useInView hook)
   =========================================== */
function StatsSection({ stats = DEMO_STATS }: { stats?: typeof DEMO_STATS }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const statItems = [
    { label: "মোট বই", value: stats.totalBooks, suffix: "+", icon: Book },
    { label: "সক্রিয় সদস্য", value: stats.activeMembers, suffix: "+", icon: Users },
    { label: "ইস্যুকৃত বই", value: stats.issuedBooks, suffix: "+" },
    { label: "সক্রিয় কর্নার", value: stats.activeCorners, suffix: "" },
    { label: "চালু আছে (বছর)", value: stats.yearsRunning, suffix: "", icon: CalendarClock },
  ];

  return (
    <section id="stats" className="section-warm py-16 md:py-24 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader eyebrow="সংক্ষেপে" heading="এক নজরে পাঠাগারের হালচাল" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
          {statItems.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

const StatCard: React.FC<{ stat: { label: string; value: number; suffix: string; icon?: React.ElementType }; index: number; inView: boolean }> = ({ stat, index, inView }) => {
  const displayValue = useCountUp(stat.value, inView);
  const Icon = stat.icon;

  return (
    <motion.div
      className="hp-card p-5 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {Icon && (
        <div className="flex justify-center mb-3">
          <Icon size={32} style={{ color: "var(--book-blue)" }} strokeWidth={1.5} />
        </div>
      )}
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
