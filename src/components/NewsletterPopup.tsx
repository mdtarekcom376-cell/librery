import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Loader2, Check, Heart, Mail } from "lucide-react";

const NEWSLETTER_DISMISS_KEY = "okkhor_newsletter_dismissed_at";
const SUPPRESS_DAYS = 7;

function shouldShowPopup(): boolean {
  try {
    const raw = localStorage.getItem(NEWSLETTER_DISMISS_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    if (isNaN(dismissedAt)) return true;
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return daysSince >= SUPPRESS_DAYS;
  } catch {
    return true;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(NEWSLETTER_DISMISS_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch("/api/public/newsletter-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { success: !!data.success, message: data.message };
  } catch {
    return { success: false, message: "নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।" };
  }
}

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Show popup after 4 seconds if not recently dismissed
  useEffect(() => {
    if (!shouldShowPopup()) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    markDismissed();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError("সঠিক ইমেইল ঠিকানা দিন।");
      return;
    }

    setSubmitting(true);
    const result = await subscribeNewsletter(trimmed);
    setSubmitting(false);

    if (result.success) {
      setDone(true);
      markDismissed();
      // Auto-close after 3 seconds
      setTimeout(() => setVisible(false), 3000);
    } else {
      setError(result.message || "সাবস্ক্রাইব করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Popup Card */}
          <motion.div
            className="fixed z-[9999] left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md"
            initial={{ opacity: 0, y: "-30%", x: "-50%" }}
            animate={{ opacity: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, y: "-30%", x: "-50%" }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                backdropFilter: "blur(20px) saturate(1.6)",
                borderColor: "rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer border-none transition-colors"
                style={{ background: "rgba(0,0,0,0.06)", color: "#64748b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.12)";
                  e.currentTarget.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.06)";
                  e.currentTarget.style.color = "#64748b";
                }}
                aria-label="বন্ধ করুন"
              >
                <X size={16} />
              </button>

              {/* Top accent bar */}
              <div
                className="h-1"
                style={{ background: "linear-gradient(90deg, #F7941D, #EC2C7B, #1C8FE0)" }}
              />

              <div className="px-6 pt-6 pb-2">
                {/* Icon + Heading */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #1C8FE0, #38BDF8)" }}
                  >
                    <Mail size={20} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="font-display-bn text-lg font-bold"
                      style={{ color: "var(--ink-navy, #16233F)" }}
                    >
                      আপডেট পেতে সাবস্ক্রাইব করুন
                    </h3>
                    <p className="font-body-bn text-xs" style={{ color: "#64748b" }}>
                      নতুন বই, ইভেন্ট ও খবরের আপডেট সরাসরি ইমেইলে পান
                    </p>
                  </div>
                </div>

                {/* Email Form */}
                {!done ? (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="আপনার ইমেইল ঠিকানা"
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-body-bn border"
                        style={{
                          borderColor: error ? "#ef4444" : "#e2e8f0",
                          color: "var(--ink-navy, #16233F)",
                          outline: "none",
                          background: "white",
                        }}
                        disabled={submitting}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl cursor-pointer border-none font-ui text-sm font-bold flex items-center gap-2 transition-opacity shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #F7941D, #EC2C7B)",
                          color: "white",
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        {submitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={14} />
                            <span className="hidden sm:inline">সাবস্ক্রাইব</span>
                          </>
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs font-body-bn" style={{ color: "#ef4444" }}>
                        {error}
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="flex items-center gap-3 py-3 px-4 rounded-xl" style={{ background: "#f0fdf4" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100">
                      <Check size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-display-bn text-sm font-bold text-green-700">
                        সাবস্ক্রাইব সফল হয়েছে!
                      </p>
                      <p className="font-body-bn text-xs text-green-600">
                        ধন্যবাদ! আমরা আপনাকে আপডেট পাঠাবো।
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Donation CTA Block — identical styling to footer */}
              <div className="px-6 pb-6 pt-4">
                <div className="bg-gradient-to-r from-[#F7941D]/10 to-[#EC2C7B]/10 p-5 rounded-xl border border-[#F7941D]/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
                  <h4
                    className="font-display-bn text-sm font-bold mb-3 relative z-10"
                    style={{ color: "var(--ink-navy, #16233F)" }}
                  >
                    আলো ছড়ানোর মিছিলে যুক্ত হোন
                  </h4>
                  <a
                    href="http://donat.okkhorpathagar.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 flex items-center justify-center gap-2 bg-gradient-to-r from-[#F7941D] to-[#EC2C7B] text-white px-5 py-2.5 rounded-lg font-ui text-sm font-bold shadow-lg shadow-[#F7941D]/20 group-hover:shadow-xl group-hover:shadow-[#F7941D]/40 group-hover:-translate-y-0.5 transition-all w-full text-center"
                    style={{ textDecoration: "none" }}
                  >
                    <Heart size={16} className="text-white fill-white/80" strokeWidth={2} />
                    ডোনেট করুন
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
