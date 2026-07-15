import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Image as ImageIcon,
  MessageCircle,
  Filter
} from "lucide-react";
import { motion } from "motion/react";
import { ShopItem } from "../types";
import { apiClient } from "../api";

interface PublicShopViewProps {
  onItemSelect?: (item: ShopItem) => void;
}

export default function PublicShopView({ onItemSelect }: PublicShopViewProps = {}) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [categories, setCategories] = useState<string[]>(["সব"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("সব");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [helplineNumber, setHelplineNumber] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catRes, helpRes] = await Promise.all([
        apiClient.get("/public/shop/items"),
        apiClient.get("/public/shop/categories"),
        apiClient.get("/public/shop/helpline")
      ]);

      if (itemsRes?.success) setItems(itemsRes.shopItems || []);
      if (catRes?.success && catRes.categories) setCategories(["সব", ...catRes.categories]);
      if (helpRes?.success && helpRes.helpline?.number) setHelplineNumber(helpRes.helpline.number);
      
    } catch (err: any) {
      setErrorMsg("পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrder = (item: ShopItem) => {
    const number = helplineNumber || "01333478448";
    // Formatting the number: remove any non-digit chars
    const cleanNumber = number.replace(/[^0-9]/g, "");
    
    // Product Link (simulated, since it's a SPA without individual item routes)
    const productLink = `${window.location.origin}/#sales`;
    
    const message = `hi i want purches this product . ${productLink} and ${item.name} ok?`;
    
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "সব" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#E5E5EA]">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm p-3 pl-10 bg-slate-50 border border-[#E5E5EA] rounded-xl text-slate-700 focus:outline-none focus:border-[#F25A29] focus:ring-2 focus:ring-[#F25A29]/20 transition-all font-body-bn"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter size={14} /> বিভাগ:
          </span>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-body-bn cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-[#F25A29] text-white shadow-md shadow-[#F25A29]/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-[#E5E5EA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-[#F25A29] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-body-bn font-bold">লোড হচ্ছে...</span>
        </div>
      ) : errorMsg ? (
        <div className="text-center py-20 bg-[#F5F3EF] text-[#FF6B6B] rounded-2xl border border-[#E5E5EA] font-body-bn font-bold">
          {errorMsg}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-[#E5E5EA] rounded-2xl">
          <ShoppingBag className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 font-body-bn font-bold">কোনো পণ্য পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#E5E5EA] hover:border-[#E5E5EA] transition-all flex flex-col group ${onItemSelect ? 'cursor-pointer' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => {
                if (onItemSelect) onItemSelect(item);
              }}
            >
              {/* Product Image */}
              <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-[#E5E5EA]">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-bold mt-2">ছবি নেই</span>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-white backdrop-blur text-xs font-bold rounded shadow-sm text-slate-700 font-body-bn">
                  {item.category}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-display-bn text-lg font-bold text-[#22242A] line-clamp-2 leading-snug group-hover:text-[#F25A29] transition-colors">
                  {item.name}
                </h3>
                
                <p className="text-slate-500 text-xs font-body-bn mt-2 line-clamp-2 flex-1">
                  {item.description || "কোনো বিবরণ নেই"}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="font-display-lat font-bold text-lg text-[#F25A29]">
                    ৳{item.price}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrder(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-[#22242A] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    অর্ডার করুন
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
