import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  X, 
  Store, 
  HelpCircle,
  Sparkles, 
  Filter, 
  Upload,
  CheckCircle2,
  Info,
  PhoneCall,
  ArrowLeft,
  FileText,
  BookOpen,
  Coffee
} from "lucide-react";
import { ShopItem } from "../types";
import { apiClient } from "../api";

interface SalesCornerProps {
  isAdmin: boolean;
  onRefreshStats?: () => void;
}

export default function SalesCorner({ isAdmin, onRefreshStats }: SalesCornerProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("overview");

  // Category Icon resolver
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("টি-শার্ট") || cat.includes("t-shirt") || cat.includes("সার্ট")) {
      return <Tag size={26} className="text-purple-400 group-hover:scale-110 transition-transform" />;
    }
    if (cat.includes("প্যাড") || cat.includes("ডায়েরি") || cat.includes("খাতা") || cat.includes("notebook") || cat.includes("প্যাড")) {
      return <FileText size={26} className="text-blue-400 group-hover:scale-110 transition-transform" />;
    }
    if (cat.includes("বই") || cat.includes("book") || cat.includes("উপন্যাস")) {
      return <BookOpen size={26} className="text-emerald-400 group-hover:scale-110 transition-transform" />;
    }
    if (cat.includes("মগ") || cat.includes("mug") || cat.includes("কাপ") || cat.includes("coffee") || cat.includes("চা")) {
      return <Coffee size={26} className="text-orange-400 group-hover:scale-110 transition-transform" />;
    }
    return <Sparkles size={26} className="text-pink-400 group-hover:scale-110 transition-transform" />;
  };

  // Admin Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("টি-শার্ট");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Detailed view modal
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ShopItem | null>(null);

  const [categories, setCategories] = useState<string[]>(["সব", "টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"]);
  const [formCategories, setFormCategories] = useState<string[]>(["টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"]);

  const [helplineNumber, setHelplineNumber] = useState("০১৩৩৩৪৭৮৪৪৮");
  const [helplineText, setHelplineText] = useState("বিক্রয় কর্নারের যেকোনো পণ্য সংগ্রহ করতে আমাদের হেল্পলাইন নাম্বারে যোগাযোগ করুন অথবা সরাসরি অক্ষর লাইব্রেরির কাউন্টারে ভিজিট করে সংগ্রহ করতে পারবেন।");

  const fetchHelpline = async () => {
    try {
      const res = await apiClient.get("/public/shop/helpline");
      if (res && res.success && res.helpline) {
        setHelplineNumber(res.helpline.number);
        setHelplineText(res.helpline.text);
      }
    } catch (err) {
      console.warn("হেল্পলাইন তথ্য লোড করতে ব্যর্থ:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/public/shop/categories");
      if (res && res.success && res.categories) {
        setCategories(["সব", ...res.categories]);
        setFormCategories(res.categories);
        if (res.categories.length > 0) {
          setItemCategory(res.categories[0]);
        }
      }
    } catch (err) {
      console.warn("ক্যাটাগরি সমূহ লোড করতে ব্যর্থ:", err);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await apiClient.get("/public/shop/items");
      if (res && res.success) {
        setItems(res.shopItems || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchHelpline();

    const handleUpdate = () => {
      fetchHelpline();
    };
    window.addEventListener("helpline-updated", handleUpdate);
    return () => {
      window.removeEventListener("helpline-updated", handleUpdate);
    };
  }, []);

  // Handle Photo Upload Conversion to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError("ছবির সাইজ ২ এমবি এর কম হতে হবে!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setItemImageUrl(reader.result);
        setImagePreview(reader.result);
      }
    };
    reader.onerror = () => {
      setFormError("ছবি প্রসেস করতে ত্রুটি হয়েছে।");
    };
    reader.readAsDataURL(file);
  };

  const openAddForm = () => {
    setFormMode("add");
    setCurrentItemId(null);
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemCategory(formCategories[0] || "টি-শার্ট");
    setItemImageUrl("");
    setImagePreview("");
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (item: ShopItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card details modal
    setFormMode("edit");
    setCurrentItemId(item.id);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategory(item.category);
    setItemImageUrl(item.imageUrl || "");
    setImagePreview(item.imageUrl || "");
    setFormError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    if (!itemName.trim() || !itemPrice || !itemCategory) {
      setFormError("নাম, মূল্য এবং ক্যাটাগরি পূরণ করা আবশ্যক!");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        name: itemName.trim(),
        description: itemDescription.trim(),
        price: Number(itemPrice),
        category: itemCategory,
        imageUrl: itemImageUrl
      };

      if (formMode === "add") {
        const res = await apiClient.post("/admin/shop/items", payload);
        if (res && res.success) {
          setSuccessMsg(`'${itemName}' পণ্যটি বিক্রয় তালিকায় সফলভাবে যুক্ত হয়েছে!`);
          setIsFormOpen(false);
          fetchItems();
          if (onRefreshStats) onRefreshStats();
        }
      } else if (formMode === "edit" && currentItemId) {
        const res = await apiClient.put(`/admin/shop/items/${currentItemId}`, payload);
        if (res && res.success) {
          setSuccessMsg(`'${itemName}' পণ্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!`);
          setIsFormOpen(false);
          fetchItems();
          if (onRefreshStats) onRefreshStats();
        }
      }
    } catch (err: any) {
      setFormError(err.message || "পণ্যটি সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (item: ShopItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await apiClient.delete(`/admin/shop/items/${itemToDelete.id}`);
      if (res) {
        setSuccessMsg(`'${itemToDelete.name}' পণ্যটি বিক্রয় তালিকা থেকে মুছে ফেলা হয়েছে!`);
        setItemToDelete(null);
        fetchItems();
        if (onRefreshStats) onRefreshStats();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "পণ্যটি মুছতে ব্যর্থ হয়েছে।");
    }
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "overview" || selectedCategory === "সব" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-5 rounded-2xl border border-purple-500/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              অক্ষর বিক্রয় কর্নার <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">বই ও উপহার</span>
            </h1>
            <p className="text-xs text-slate-400">পাঠাগারের অফিশিয়াল টি-শার্ট, রাইটিং প্যাড, ডায়েরি এবং কাস্টমাইজড উপহার সামগ্রীর নির্ভরযোগ্য সংগ্রহশালা।</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-purple-500/10 transition-all border border-purple-400/20"
          >
            <Plus size={14} />
            নতুন পণ্য যোগ করুন
          </button>
        )}
      </div>

      {/* Success and General Errors */}
      {successMsg && (
        <div className="bg-emerald-950/45 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/45 border border-red-500/20 p-4 rounded-xl text-xs text-red-300 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-5 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="পণ্যের নাম বা বিবরণ লিখে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs p-3 pl-10 bg-[#080c16]/55 border border-purple-500/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50 transition-colors"
          />
        </div>

        {/* Back to Overview or active navigation breadcrumb */}
        {selectedCategory !== "overview" && (
          <div className="lg:col-span-7 flex items-center justify-between gap-3 bg-purple-950/20 px-4 py-2 border border-purple-500/10 rounded-xl">
            <button
              onClick={() => {
                setSelectedCategory("overview");
                setSearchTerm("");
              }}
              className="flex items-center gap-1.5 text-purple-300 hover:text-purple-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> সকল গ্রুপে ফিরে যান
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              বর্তমান বিভাগঃ <span className="text-purple-300">{selectedCategory}</span>
            </span>
          </div>
        )}
      </div>

      {/* Main product catalog content */}
      {selectedCategory === "overview" && !searchTerm ? (
        /* LEVEL 1: Category/Groups Dashboard Overview */
        <div className="space-y-4">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Filter size={12} /> গ্রুপ ভিত্তিক প্রোডাক্ট ক্যাটালগ:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
            {/* 1. All Items group card */}
            <div
              onClick={() => setSelectedCategory("সব")}
              className="group relative p-5 bg-gradient-to-br from-indigo-950/45 to-slate-900/40 border border-indigo-500/10 hover:border-indigo-400/35 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4.5 shadow-xl"
            >
              <div className="p-4 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                <ShoppingBag size={28} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors">সকল উপহার ও পণ্য</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">সব ক্যাটাগরির সামগ্রী একসাথে দেখুন</p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-full">
                  মোট {items.length} টি সামগ্রী
                </span>
              </div>
            </div>

            {/* Other custom groups */}
            {formCategories.map((cat) => {
              const count = items.filter(item => item.category === cat).length;
              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="group relative p-5 bg-gradient-to-br from-purple-950/30 to-slate-900/40 border border-purple-500/10 hover:border-purple-400/35 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4.5 shadow-xl"
                >
                  <div className="p-4 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors shrink-0">
                    {getCategoryIcon(cat)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-white group-hover:text-purple-300 transition-colors">{cat}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{cat} সম্পর্কিত উপহার সামগ্রী</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-full">
                      {count} টি সামগ্রী
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* LEVEL 2: Compact Product Catalog List (like Book Catalog) */
        <div className="space-y-4">
          {/* Internal sub-category switching chips inside level 2 */}
          <div className="flex flex-wrap gap-1.5 items-center bg-slate-950/30 p-3 rounded-xl border border-purple-500/10">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2 flex items-center gap-1 shrink-0">
              <Filter size={10} /> বিভাগঃ
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  setSelectedCategory("overview");
                  setSearchTerm("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-purple-400 hover:text-purple-300`}
              >
                ◀ সকল গ্রুপসমূহ
              </button>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isActive 
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold shadow-md shadow-purple-500/5" 
                        : "bg-slate-950/50 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">পণ্য তালিকা লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-[#080c16]/30 border border-dashed border-purple-500/5 rounded-2xl">
              <ShoppingBag className="mx-auto text-slate-600 mb-3" size={32} />
              <p className="text-xs text-slate-500">কোন সামগ্রী খুঁজে পাওয়া যায়নি।</p>
            </div>
          ) : (
            /* COMPACT CARDS GRID (Matching the book catalog layout style precisely) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="glass-panel p-3.5 rounded-2xl border border-white/5 flex gap-4 hover:border-purple-500/35 duration-200 hover:-translate-y-0.5 relative group cursor-pointer"
                >
                  {/* Compact Product Image panel */}
                  <div className="w-20 h-28 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center shrink-0 relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-600">
                        <ImageIcon size={22} className="stroke-[1.5]" />
                        <span className="text-[9px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>

                  {/* Right hand metadata block */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950 text-purple-300 ring-1 ring-purple-500/10 truncate">
                          {item.category}
                        </span>
                        <span className="text-xs font-black text-amber-300 shrink-0">৳{item.price}</span>
                      </div>

                      <h3 className="font-bold text-white text-xs sm:text-sm truncate pt-1 group-hover:text-purple-300 transition-colors font-sans" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed" title={item.description}>
                        {item.description || "কোনো বিবরণ প্রদান করা হয়নি।"}
                      </p>
                    </div>

                    {/* Price and actions line */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5 mt-1">
                      <span className="text-[10px] font-bold text-purple-400 group-hover:underline flex items-center gap-1">
                        বিস্তারিত <Info size={10} />
                      </span>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => openEditForm(item, e)}
                            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 rounded-lg cursor-pointer transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(item, e)}
                            className="p-1.5 bg-slate-900/80 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 rounded-lg cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Guideline Card */}
      <div className="bg-[#0c1626]/40 border border-cyan-500/10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shrink-0">
          <HelpCircle size={18} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-200">ক্রয় করার নির্দেশিকা (How to buy?)</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {helplineText}
          </p>
        </div>
        <div className="sm:ml-auto w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <a
            href={`tel:${helplineNumber.split('').map(char => ({'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'}[char] || char)).join('').replace(/\D/g, '')}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/20 transition-colors"
          >
            <PhoneCall size={12} />
            {helplineNumber}
          </a>
        </div>
      </div>

      {/* ADD/EDIT ITEM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#080c16] border border-purple-500/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-purple-500/10">
              <div className="flex items-center gap-2">
                <Store size={16} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {formMode === "add" ? "নতুন পণ্য যোগ করুন" : "পণ্যের তথ্য পরিবর্তন করুন"}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error alerts inside form */}
            {formError && (
              <div className="my-3.5 bg-red-950/45 border border-red-500/20 p-3.5 rounded-xl text-[11px] text-red-300 flex items-center gap-2.5">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4 overflow-y-auto flex-1 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমনঃ অক্ষর লোগো টি-শার্ট"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-purple-500/15 rounded-xl text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-950 border border-purple-500/15 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  >
                    {formCategories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="যেমনঃ ৩৫০"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-950 border border-purple-500/15 rounded-xl text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  placeholder="পণ্যের সংক্ষিপ্ত বর্ণনা দিন..."
                  rows={3}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-950 border border-purple-500/15 rounded-xl text-white focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">পণ্যের ছবি (Gallery থেকে আপলোড)</label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8">
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-purple-500/20 hover:border-purple-400/40 rounded-xl bg-slate-950 hover:bg-slate-900 cursor-pointer transition-all gap-1.5 text-center">
                      <Upload size={16} className="text-purple-400 animate-pulse" />
                      <span className="text-[11px] text-slate-300 font-semibold">ছবি আপলোড করুন</span>
                      <span className="text-[9px] text-slate-500">JPG, PNG (Max 2MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="sm:col-span-4 h-24 bg-slate-950/80 rounded-xl border border-purple-500/10 flex items-center justify-center overflow-hidden relative">
                    {imagePreview ? (
                      <>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setItemImageUrl("");
                            setImagePreview("");
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-950 text-red-400 rounded-lg border border-red-500/20"
                          title="ছবি সরান"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-600">নো প্রিভিউ</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-purple-500/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {formLoading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#080c16] border border-purple-500/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col">
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer z-10"
            >
              <X size={16} />
            </button>

            <div className="space-y-4 text-left">
              {/* Image Preview */}
              <div className="h-64 w-full bg-slate-950 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                {selectedItem.imageUrl ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-600">
                    <ImageIcon size={36} className="stroke-[1.5]" />
                    <span className="text-xs">ছবি যুক্ত নেই</span>
                  </div>
                )}
                
                {/* Category overlay */}
                <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 bg-slate-950/90 text-purple-300 border border-purple-500/25 rounded-lg backdrop-blur-sm">
                  {selectedItem.category}
                </span>
              </div>

              {/* Text content */}
              <div>
                <h3 className="text-base font-extrabold text-white mb-1">{selectedItem.name}</h3>
                <p className="text-[10px] font-mono text-slate-500">ID: {selectedItem.id} | যোগ করা হয়েছে: {selectedItem.createdAt}</p>
                
                <div className="mt-3 text-xs text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-1">
                  {selectedItem.description || "পণ্যটির কোন বিস্তারিত বিবরণ দেওয়া হয়নি।"}
                </div>
              </div>

              {/* Price Tag Box */}
              <div className="p-4 bg-purple-950/15 border border-purple-500/10 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">মূল্য (Total Price)</span>
                  <span className="text-lg font-extrabold text-white">৳{selectedItem.price} টাকা</span>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      setSelectedItem(null);
                      openEditForm(selectedItem, e);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-500/25 text-purple-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 size={11} />
                    তথ্য পরিবর্তন
                  </button>
                )}
              </div>

              {/* Order Box instructions */}
              <div className="bg-cyan-950/20 border border-cyan-500/15 p-4 rounded-xl text-xs space-y-2.5">
                <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Info size={13} /> অর্ডার করতে চান?
                </p>
                <p className="text-slate-400 leading-relaxed">
                  {helplineText}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${helplineNumber.split('').map(char => ({'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'}[char] || char)).join('').replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline"
                  >
                    <PhoneCall size={12} /> হেল্পলাইন: {helplineNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#080c16] border border-red-500/20 rounded-2xl p-5 shadow-2xl relative text-center">
            <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto text-red-500 border border-red-500/25 mb-4">
              <Trash2 size={22} />
            </div>
            
            <h3 className="text-sm font-bold text-white mb-2">আপনি কি নিশ্চিত?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              আপনি কি সত্যিই <span className="font-semibold text-slate-300">'{itemToDelete.name}'</span> পণ্যটি বিক্রয় তালিকা থেকে মুছে ফেলতে চান? এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।
            </p>

            <div className="flex items-center justify-center gap-2.5">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-white/5 cursor-pointer transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer transition-all"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
