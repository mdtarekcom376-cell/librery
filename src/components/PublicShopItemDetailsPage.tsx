import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingBag, Package, Store, MessageCircle, Hash } from "lucide-react";
import { motion } from "motion/react";
import { ShopItem } from "../types";
import { apiClient } from "../api";

interface PublicShopItemDetailsPageProps {
  item: ShopItem;
  onBack: () => void;
  logoBase64?: string;
}

export default function PublicShopItemDetailsPage({ item, onBack, logoBase64 }: PublicShopItemDetailsPageProps) {
  const logoSrc = logoBase64 || "";
  const [helplineNumber, setHelplineNumber] = useState("");

  useEffect(() => {
    // Fetch helpline number for ordering
    apiClient.get("/public/shop/helpline")
      .then((res: any) => {
        if (res?.success && res.helpline?.number) {
          setHelplineNumber(res.helpline.number);
        }
      })
      .catch(() => {}); // silently fail and fallback to default
  }, []);

  const handleOrder = () => {
    const number = helplineNumber || "01333478448";
    // Formatting the number: remove any non-digit chars
    const cleanNumber = number.replace(/[^0-9]/g, "");
    
    // Product Link (simulated, since it's a SPA without individual item routes)
    const productLink = `${window.location.origin}/#sales`;
    
    const message = `hi i want purches this product . ${productLink} and ${item.name} ok?`;
    
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="বিক্রয় কর্নারে ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">বিক্রয় কর্নার</span>
            </button>

            <div className="flex items-center gap-2.5">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="অক্ষর পাঠাগার লোগো"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain bg-white border border-purple-500/20 p-0.5"
                />
              )}
              <div>
                <h1 className="text-sm md:text-base font-bold flex items-center gap-2" style={{ color: "var(--ink-navy)", fontFamily: "'Noto Serif Bengali', serif" }}>
                  <Store size={16} style={{ color: "var(--flame-orange)" }} />
                  পণ্য পরিচিতি
                </h1>
                <p className="text-[10px]" style={{ color: "#64748b", fontFamily: "'Fraunces', serif" }}>
                  Akkhor Shop Item
                </p>
              </div>
            </div>
          </div>

          {/* Right: Badge */}
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full hidden sm:inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200"
          >
            <ShoppingBag size={10} />
            {item.category || "সাধারণ পণ্য"}
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
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row">
          
          {/* Left side: Product Image */}
          <div className="w-full md:w-1/3 lg:w-2/5 bg-slate-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 relative">
            <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white flex items-center justify-center relative">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center gap-3 p-6 text-center">
                  <Package size={48} />
                  <span className="text-xs font-bold font-body-bn">ছবি নেই</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Details */}
          <div className="w-full md:w-2/3 lg:w-3/5 p-6 md:p-10 flex flex-col">
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {item.category && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <ShoppingBag size={12} /> {item.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-4 leading-tight font-display-bn">
              {item.name}
            </h2>
            
            {/* Price */}
            <div className="flex items-center gap-2 text-[#F25A29] mb-8 font-bold font-display-lat text-3xl">
              <span>৳{item.price}</span>
            </div>

            {/* Description */}
            <div className="mb-8 flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">পণ্যের বিবরণ</h3>
              <p className="text-slate-600 font-body-bn leading-relaxed text-sm md:text-base whitespace-pre-wrap bg-slate-50 p-5 rounded-xl border border-slate-100">
                {item.description || "এই পণ্যের কোনো বিবরণ যুক্ত করা হয়নি।"}
              </p>
            </div>

            {/* Action */}
            <div className="mt-auto border-t border-slate-100 pt-6">
              <button
                onClick={handleOrder}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl font-bold transition-all cursor-pointer text-lg font-body-bn shadow-sm"
              >
                <MessageCircle size={20} />
                হোয়াটসঅ্যাপে অর্ডার করুন
              </button>
            </div>

          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center bg-slate-50 border-slate-200 mt-auto">
        <p className="text-xs text-slate-500 font-bold" style={{ fontFamily: "'Noto Serif Bengali', serif" }}>
          © ২০২৬ অক্ষর পাঠাগার। সর্বস্বত্ব সংরক্ষিত। বাংলায় তৈরি 🇧🇩
        </p>
        <button
          onClick={onBack}
          className="mt-3 flex items-center justify-center mx-auto gap-1 text-xs text-[#F25A29] hover:text-[#e04818] cursor-pointer bg-transparent border-none font-bold group"
          style={{ fontFamily: "'Noto Serif Bengali', serif" }}
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          বিক্রয় কর্নারে ফিরে যান
        </button>
      </footer>
    </div>
  );
}
