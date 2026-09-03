import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Image, Download, FilePlus2, Eye, FileText, Check, AlertCircle, RefreshCw, Database, LayoutGrid, List, Sparkles, Filter, X, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Book } from "../types";
import { apiClient } from "../api";

interface BookManagerProps {
  books: Book[];
  onAddBook: (bookData: Partial<Book>) => Promise<any>;
  onEditBook: (id: string, bookData: Partial<Book>) => Promise<any>;
  onDeleteBook: (id: string) => Promise<any>;
  onBulkImport: (booksList: any[]) => Promise<any>;
  onPreview: (book: Book) => void;
  onPreviewBooksList?: (books: Book[]) => void;
}

export default function BookManager({ books, onAddBook, onEditBook, onDeleteBook, onBulkImport, onPreview, onPreviewBooksList }: BookManagerProps) {
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Modals status
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Form states
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookCode, setBookCode] = useState("");
  const [bookName, setBookName] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookPublisher, setBookPublisher] = useState("");
  const [bookImageUrl, setBookImageUrl] = useState("");
  const [bookGroup, setBookGroup] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [bookPageCount, setBookPageCount] = useState("");
  const [bookPrice, setBookPrice] = useState("");
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await apiClient.get("/public/groups");
        if (res && res.success) {
          setGroups(res.groups);
        }
      } catch (err) {
        console.warn("গ্রুপ সমূহ লোড করতে ব্যর্থ:", err);
      }
    };
    fetchGroups();
  }, [isAddOpen, isEditOpen]);

  // Bulk raw input
  const [bulkInput, setBulkInput] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Bulk Group Assign states
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [bulkAssignGroup, setBulkAssignGroup] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [formErr, setFormErr] = useState("");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [deleteConfirmError, setDeleteConfirmError] = useState("");

  const uniqueBookGroups = Array.from(new Set([
    ...groups,
    ...books.map(b => b.group).filter((g): g is string => !!g && g.trim() !== "")
  ]));

  // Filter books matching search
  const filteredBooks = books.filter(b => {
    const matchesQ =
      b.code.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.author.toLowerCase().includes(searchVal.toLowerCase()) ||
      b.publisher.toLowerCase().includes(searchVal.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    const matchesGroup = selectedGroup === "" ? true : b.group === selectedGroup;
    return matchesQ && matchesStatus && matchesGroup;
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন।");
      return;
    }
    
    setIsProcessingImage(true);
    try {
      const { compressImage } = await import("../lib/imageCompressor");
      const compressedDataUrl = await compressImage(file, 1200);
      setBookImageUrl(compressedDataUrl);
    } catch (err) {
      console.error("Image compression error:", err);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const openEdit = (book: Book) => {
    setSelectedBook(book);
    setBookCode(book.code);
    setBookName(book.name);
    setBookAuthor(book.author);
    setBookPublisher(book.publisher);
    setBookImageUrl(book.imageUrl);
    setBookGroup(book.group || "");
    setBookDescription(book.description || "");
    setBookPageCount(book.pageCount ? String(book.pageCount) : "");
    setBookPrice(book.price ? String(book.price) : "");
    setIsEditOpen(true);
    setFormErr("");
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookCode || !bookName || !bookAuthor || !bookPublisher) {
      setFormErr("বই কোড, নাম, লেখক এবং প্রকাশনার নাম আবশ্যক!");
      return;
    }
    try {
      await onAddBook({
        code: bookCode.toUpperCase().trim(),
        name: bookName.trim(),
        author: bookAuthor.trim(),
        publisher: bookPublisher.trim(),
        imageUrl: bookImageUrl.trim() || undefined,
        group: bookGroup || undefined,
        description: bookDescription.trim() || undefined,
        pageCount: bookPageCount ? Number(bookPageCount) : undefined,
        price: bookPrice ? Number(bookPrice) : undefined,
      } as any);
      setBookCode("");
      setBookName("");
      setBookAuthor("");
      setBookPublisher("");
      setBookImageUrl("");
      setBookGroup("");
      setBookDescription("");
      setBookPageCount("");
      setBookPrice("");
      setIsAddOpen(false);
      setFormErr("");
    } catch (err: any) {
      setFormErr(err.message || "সংরক্ষণ ব্যর্থ হয়েছে। কুয়েরি চেক করুন।");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    if (!bookCode || !bookName || !bookAuthor || !bookPublisher) {
      setFormErr("সব তথ্য পূরণ করুন!");
      return;
    }
    try {
      await onEditBook(selectedBook.id, {
        code: bookCode.toUpperCase().trim(),
        name: bookName.trim(),
        author: bookAuthor.trim(),
        publisher: bookPublisher.trim(),
        imageUrl: bookImageUrl.trim(),
        group: bookGroup || "",
        description: bookDescription.trim() || undefined,
        pageCount: bookPageCount ? Number(bookPageCount) : undefined,
        price: bookPrice ? Number(bookPrice) : undefined,
      } as any);
      setIsEditOpen(false);
      setSelectedBook(null);
      setBookGroup("");
      setBookDescription("");
      setBookPageCount("");
      setBookPrice("");
      setFormErr("");
    } catch (err: any) {
      setFormErr(err.message || "সংরক্ষণ ব্যর্থ হয়েছে। কুয়েরি চেক করুন।");
    }
  };

  const handleBulkGroupAssign = async () => {
    if (selectedBookIds.size === 0) return;
    setIsAssigning(true);
    try {
      const res = await apiClient.put("/books/bulk-group", {
        bookIds: Array.from(selectedBookIds),
        groupName: bulkAssignGroup
      });
      if (res && res.success) {
        setSelectedBookIds(new Set());
        setBulkAssignGroup("");
        window.dispatchEvent(new Event("data-imported"));
      }
    } catch (err: any) {
      alert("গ্রুপ অ্যাসাইন করতে সমস্যা হয়েছে।");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleBulkSubmit = async () => {
    setBulkError("");
    setBulkSuccessMsg("");
    if (!bulkInput.trim()) {
      setBulkError("অনুগ্রহ করে বইয়ের ডাটা ইনপুট বক্সে পেস্ট করুন।");
      return;
    }

    const lines = bulkInput.split("\n");
    const parsedList: any[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;
      let cols = line.split("\t");
      if (cols.length < 3) {
        cols = line.split(",");
      }

      const code = cols[0]?.trim();
      const name = cols[1]?.trim();
      const author = cols[2]?.trim();
      const publisher = cols[3]?.trim() || "অজ্ঞাত প্রকাশনা";
      const imageUrl = cols[4]?.trim() || "";
      const pageCount = cols[5]?.trim() ? Number(cols[5].trim()) : undefined;
      const price = cols[6]?.trim() ? Number(cols[6].trim()) : undefined;
      const group = "";

      if (code && name && author) {
        parsedList.push({ code, name, author, publisher, group, imageUrl, pageCount: isNaN(pageCount as number) ? undefined : pageCount, price: isNaN(price as number) ? undefined : price });
      }
    });

    if (parsedList.length === 0) {
      setBulkError("কোনো সঠিক ডাটা রো উদ্ধার করা যায়নি। ফর্ম্যাট চেক করুন: BookCode, BookName, Author, Publisher");
      return;
    }

    try {
      const res = await onBulkImport(parsedList);
      setBulkSuccessMsg(`অভিনন্দন! মোট ${res.importedCount} টি বই সফলভাবে ইম্পোর্ট করা হয়েছে। ডুপ্লিকেট বাতিল হয়েছে: ${res.duplicatesCount} টি।`);
      setBulkInput("");
    } catch (err: any) {
      setBulkError(err.message || "ইম্পোর্ট ব্যর্থ হয়েছে।");
    }
  };

  const handleExportCSV = () => {
    if (books.length === 0) return;
    const headers = ["BookCode", "BookName", "Author", "Publisher", "Status", "Group", "PageCount", "Price"];
    const rows = books.map(b => [b.code, b.name, b.author, b.publisher, b.status, b.group || "", b.pageCount || "", b.price || ""]);
    
    const csvContent = "\ufeff" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Akkhor_Library_Books_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookIds(new Set(filteredBooks.map(b => b.id)));
    } else {
      setSelectedBookIds(new Set());
    }
  };

  return (
    <div className="space-y-6">

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">বইয়ের রেজিস্ট্রি ও ব্যবস্থাপনা</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              {books.length} টি বই
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">লাইব্রেরির বই ক্যাটালগ, নতুন ভাণ্ডার সংযোজন ও তথ্য সংশোধন পরিচালনা করুন</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-slate-700 hover:text-indigo-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all cursor-pointer"
            title="CSV এক্সপোর্ট করুন"
          >
            <Download size={14} />
            <span>এক্সপোর্ট</span>
          </button>

          <button
            onClick={() => {
              setBulkInput("");
              setBulkError("");
              setBulkSuccessMsg("");
              setIsBulkOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white text-slate-700 hover:text-indigo-600 text-xs font-semibold rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <FilePlus2 size={14} className="text-amber-500" />
            <span>বাল্ক ইম্পোর্ট</span>
          </button>

          <button
            onClick={() => {
              setBookCode("");
              setBookName("");
              setBookAuthor("");
              setBookPublisher("");
              setBookImageUrl("");
              setBookGroup("");
              setBookDescription("");
              setBookPageCount("");
              setBookPrice("");
              setFormErr("");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>নতুন বই যোগ</span>
          </button>
        </div>
      </div>

      {/* Modern Filter & Search Controls Toolbar */}
      <div className="glass-panel p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Bar (8 Cols) */}
          <div className="md:col-span-7 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="কোড, বইয়ের নাম, লেখক বা প্রকাশনী দিয়ে খুঁজুন..."
              className="w-full text-xs pl-10 pr-9 py-2.5 glass-input font-sans placeholder:text-slate-400"
            />
            {searchVal && (
              <button 
                onClick={() => setSearchVal("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 glass-input cursor-pointer font-sans"
            >
              <option value="">সকল অবস্থা (Available & Issued)</option>
              <option value="Available">উপলব্ধ (তাত্ক্ষণিক লেনদেন যোগ্য)</option>
              <option value="Issued">ধারকৃত (বর্তমানে ঋণ দেয়া)</option>
            </select>
          </div>

          {/* View Mode Toggle: Grid vs Table (2 Cols) */}
          <div className="md:col-span-2 flex items-center justify-end gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewMode === "table" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
              title="টেবিল ভিউ"
            >
              <List size={14} />
              <span className="text-[11px]">টেবিল</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
              title="কার্ড ভিউ"
            >
              <LayoutGrid size={14} />
              <span className="text-[11px]">কার্ড</span>
            </button>
          </div>

        </div>

        {/* Group Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Filter size={11} />
            গ্রুপ:
          </span>
          <button
            type="button"
            onClick={() => setSelectedGroup("")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              selectedGroup === ""
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            সকল গ্রুপ ({books.length})
          </button>
          {uniqueBookGroups.map(g => {
            const count = books.filter(b => b.group === g).length;
            const isSelected = selectedGroup === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs font-bold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {g} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Multi-Select Bulk Action Dock */}
      <AnimatePresence>
        {selectedBookIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 border-indigo-200 bg-indigo-50/70 shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                {selectedBookIds.size}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                টি বই নির্বাচিত হয়েছে
              </span>
              <button 
                onClick={() => setSelectedBookIds(new Set())} 
                className="text-xs text-slate-500 hover:text-rose-600 underline cursor-pointer"
              >
                বাতিল
              </button>
            </div>

            <div className="flex gap-2.5 items-center flex-wrap">
              <select
                value={bulkAssignGroup}
                onChange={(e) => setBulkAssignGroup(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="">কোনো গ্রুপ নেই (খালি করুন)</option>
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button
                onClick={handleBulkGroupAssign}
                disabled={isAssigning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm disabled:opacity-50 transition-all"
              >
                {isAssigning ? "প্রসেসিং হচ্ছে..." : "গ্রুপে যুক্ত করুন"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredBooks.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
          <BookOpen size={36} className="text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">কোনো বই খুঁজে পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            সার্চ ফিল্টার রিসেট করুন অথবা উপরের বাটন থেকে নতুন বই যোগ করুন।
          </p>
        </div>
      ) : viewMode === "table" ? (
        
        /* DATA TABLE VIEW (Sticky Header, Zebra Striping, Data-Dense) */
        <div className="glass-panel overflow-hidden border border-slate-200/90 rounded-2xl shadow-sm">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left text-xs text-slate-800 border-collapse">
              <thead className="bg-slate-50/95 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/90 text-[11px] uppercase font-bold text-slate-600">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedBookIds.size === filteredBooks.length && filteredBooks.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer accent-indigo-600"
                    />
                  </th>
                  <th className="py-3.5 px-3 font-semibold">বই কোড</th>
                  <th className="py-3.5 px-4 font-semibold">কভার ও নাম</th>
                  <th className="py-3.5 px-4 font-semibold">লেখক ও প্রকাশনী</th>
                  <th className="py-3.5 px-3 font-semibold">গ্রুপ / কর্নার</th>
                  <th className="py-3.5 px-3 font-semibold font-mono text-center">পৃষ্ঠা / মূল্য</th>
                  <th className="py-3.5 px-3 font-semibold text-center">অবস্থা</th>
                  <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book, idx) => {
                  const isSelected = selectedBookIds.has(book.id);
                  const isEven = idx % 2 === 0;
                  return (
                    <tr 
                      key={book.id} 
                      className={`transition-colors duration-150 ${isSelected ? 'bg-indigo-50/50' : isEven ? 'bg-white' : 'bg-slate-50/40'} hover:bg-indigo-50/30`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSet = new Set(selectedBookIds);
                            if (e.target.checked) newSet.add(book.id);
                            else newSet.delete(book.id);
                            setSelectedBookIds(newSet);
                          }}
                          className="w-4 h-4 rounded text-indigo-600 cursor-pointer accent-indigo-600"
                        />
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {book.code}
                        </span>
                      </td>

                      {/* Cover + Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-2xs group relative">
                            <img 
                              src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                              alt={book.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-xs" title={book.name}>
                              {book.name}
                            </p>
                            {book.description && (
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{book.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Author & Publisher */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 text-xs truncate max-w-[180px]">{book.author}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{book.publisher}</p>
                      </td>

                      {/* Group */}
                      <td className="py-3 px-3">
                        {book.group ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[120px] inline-block">
                            {book.group}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Page Count & Price */}
                      <td className="py-3 px-3 text-center">
                        <div className="text-[10px] font-mono text-slate-600">
                          {book.pageCount ? `${book.pageCount} পৃ:` : ""}
                          {book.pageCount && book.price ? " • " : ""}
                          {book.price ? <strong className="text-slate-800">৳{book.price}</strong> : ""}
                          {!book.pageCount && !book.price && <span className="text-slate-400">—</span>}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${book.status === "Available" ? "badge-available" : "badge-issued"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${book.status === "Available" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                          {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPreview(book)}
                            className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                            title="স্লিপ ও প্রিভিউ"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(book)}
                            className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-600 rounded-lg transition-colors cursor-pointer"
                            title="সংশোধন করুন"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmError("");
                              setBookToDelete(book);
                            }}
                            className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="glass-panel p-4 flex gap-4 hover:border-indigo-200 duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md relative group"
            >
              <div className="absolute top-3 left-3 z-10 bg-white/90 rounded-md backdrop-blur-sm shadow-xs">
                <input
                  type="checkbox"
                  checked={selectedBookIds.has(book.id)}
                  onChange={(e) => {
                    const newSet = new Set(selectedBookIds);
                    if (e.target.checked) newSet.add(book.id);
                    else newSet.delete(book.id);
                    setSelectedBookIds(newSet);
                  }}
                  className="w-4 h-4 m-1 cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="w-20 h-28 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                <img 
                  src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                  alt={book.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex items-center gap-1 min-w-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {book.code}
                      </span>
                      {book.group && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 truncate" title={book.group}>
                          {book.group}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${book.status === "Available" ? "badge-available" : "badge-issued"}`}>
                      {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate mt-1" title={book.name}>{book.name}</h3>
                  <p className="text-slate-600 text-xs truncate">{book.author}</p>
                  <p className="text-slate-400 text-[10px] truncate">প্রকাশনী: {book.publisher}</p>
                  
                  {(book.pageCount || book.price) && (
                    <div className="flex items-center gap-2 mt-1">
                      {book.pageCount ? <span className="text-[10px] text-slate-500 font-mono">📄 {book.pageCount} পৃ:</span> : null}
                      {book.price ? <span className="text-[10px] text-slate-800 font-bold font-mono">৳{book.price}</span> : null}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => onPreview(book)}
                    className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"
                    title="রিসিট স্লিপ ও প্রিভিউ"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => openEdit(book)}
                    className="p-1.5 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-amber-600 cursor-pointer transition-colors"
                    title="সংশোধন করুন"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmError("");
                      setBookToDelete(book);
                    }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD BOOK */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" />
                লাইব্রেরিতে নতুন বই এন্ট্রি
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            
            {formErr && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-600 mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formErr}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বই কোড / বারকোড *</label>
                <input
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  placeholder="যেমন: BOK-106"
                  className="w-full text-xs p-3 glass-input uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের নাম (বাংলা ইউনিকোড) *</label>
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="বইয়ের পূর্ণ শিরোনাম লিখুন"
                  className="w-full text-xs p-3 glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">লেখকের নাম *</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="হুমায়ূন আহমেদ"
                    className="w-full text-xs p-3 glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">প্রকাশনী প্রেস *</label>
                  <input
                    type="text"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    placeholder="যেমনঃ অন্যপ্রকাশ"
                    className="w-full text-xs p-3 glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের গ্রুপ বা কর্নার (ঐচ্ছিক)</label>
                <select
                  value={bookGroup}
                  onChange={(e) => setBookGroup(e.target.value)}
                  className="w-full text-xs p-3 glass-input cursor-pointer"
                >
                  <option value="">কোনো গ্রুপ নেই (সাধারণ বই)</option>
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="বইয়ের সংক্ষিপ্ত পরিচিতি বা বিষয়বস্তু লিখুন..."
                  className="w-full text-xs p-3 glass-input h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">পৃষ্ঠা সংখ্যা (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(e.target.value)}
                    placeholder="যেমন: 250"
                    min="0"
                    className="w-full text-xs p-3 glass-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">মূল্য ৳ (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="যেমন: 350.00"
                    min="0"
                    step="0.01"
                    className="w-full text-xs p-3 glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">কভার ছবি</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-1 h-28 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative group shadow-inner">
                    {bookImageUrl ? (
                      <>
                        <img src={bookImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBookImageUrl("")}
                          className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 text-xs font-bold transition-opacity cursor-pointer text-center"
                        >
                          মুছে ফেলুন
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Image className="mx-auto mb-1 opacity-50" size={22} />
                        <span className="text-[10px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-3 space-y-2.5">
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <p className="text-xs text-slate-800 font-bold">
                        {isProcessingImage ? "প্রসেসিং হচ্ছে..." : "গ্যালারি থেকে ছবি আপলোড করুন"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isProcessingImage ? "দয়া করে অপেক্ষা করুন" : "ক্লিক করে কম্পিউটার বা মোবাইল থেকে ছবি সিলেক্ট করুন"}
                      </p>
                    </div>
                    
                    <input
                      type="url"
                      value={bookImageUrl.startsWith("data:") ? "" : bookImageUrl}
                      onChange={(e) => setBookImageUrl(e.target.value)}
                      placeholder="অথবা কভার ছবির সরাসরি URL পেস্ট করুন (https://...)"
                      className="w-full text-xs p-2.5 glass-input font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all active:scale-95"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT BOOK */}
      {isEditOpen && selectedBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 size={18} className="text-amber-500" />
                বইয়ের তথ্য সম্পাদন / সংশোধন
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            
            {formErr && (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-600 mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formErr}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বই কোড (সংশোধন সম্ভব) *</label>
                <input
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  className="w-full text-xs p-3 glass-input uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের নাম *</label>
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full text-xs p-3 glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">লেখক *</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full text-xs p-3 glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">প্রকাশনী *</label>
                  <input
                    type="text"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    className="w-full text-xs p-3 glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের গ্রুপ বা কর্নার (ঐচ্ছিক)</label>
                <select
                  value={bookGroup}
                  onChange={(e) => setBookGroup(e.target.value)}
                  className="w-full text-xs p-3 glass-input cursor-pointer"
                >
                  <option value="">কোনো গ্রুপ নেই (সাধারণ বই)</option>
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">বইয়ের বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="বইয়ের সংক্ষিপ্ত বিবরণ লিখুন..."
                  className="w-full text-xs p-3 glass-input h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">পৃষ্ঠা সংখ্যা (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(e.target.value)}
                    placeholder="যেমন: 250"
                    min="0"
                    className="w-full text-xs p-3 glass-input font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">মূল্য ৳ (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="যেমন: 350.00"
                    min="0"
                    step="0.01"
                    className="w-full text-xs p-3 glass-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">কভার ছবি</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-1 h-28 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative group shadow-inner">
                    {bookImageUrl ? (
                      <>
                        <img src={bookImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBookImageUrl("")}
                          className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 text-xs font-bold transition-opacity cursor-pointer text-center"
                        >
                          মুছে ফেলুন
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Image className="mx-auto mb-1 opacity-50" size={22} />
                        <span className="text-[10px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-3 space-y-2.5">
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <p className="text-xs text-slate-800 font-bold">
                        {isProcessingImage ? "প্রসেসিং হচ্ছে..." : "গ্যালারি থেকে নতুন ছবি আপলোড করুন"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isProcessingImage ? "দয়া করে অপেক্ষা করুন" : "ক্লিক করে নতুন ছবি সিলেক্ট করুন"}
                      </p>
                    </div>
                    
                    <input
                      type="url"
                      value={bookImageUrl.startsWith("data:") ? "" : bookImageUrl}
                      onChange={(e) => setBookImageUrl(e.target.value)}
                      placeholder="অথবা কভার ছবির সরাসরি URL পেস্ট করুন"
                      className="w-full text-xs p-2.5 glass-input font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all active:scale-95"
                >
                  সংশোধন সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK IMPORT */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FilePlus2 className="text-indigo-600" />
                বইয়ের ক্যাটালগ বাল্ক ইম্পোর্ট
              </h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 mb-3 shrink-0">
              নিচে বক্সে নতুন বইয়ের তালিকা পেস্ট করুন। ফরম্যাট হতে হবে: <code className="text-indigo-700 font-mono text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">বই_কোড, বই_নাম, লেখকের_নাম, প্রকাশনী, ছবি_URL, পৃষ্ঠা_সংখ্যা, মূল্য</code>
              <br/><span className="text-[11px] text-slate-400">প্রথম ৩টি কলাম (কোড, নাম, লেখক) আবশ্যক। বাকিগুলো ঐচ্ছিক। Tab বা কমা দিয়ে এক্সেল থেকে কপি করে পেস্ট করতে পারবেন।</span>
            </p>

            {bulkError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-600 mb-3 flex items-center gap-2 shrink-0">
                <AlertCircle size={15} />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-700 mb-3 flex items-center gap-2 shrink-0 font-medium">
                <Check size={15} />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <div className="flex-1 overflow-auto py-2">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="BOK-201, দেবদাস, শরৎচন্দ্র চট্টোপাধ্যায়, দেব সাহিত্য কুটির, , 250, 350&#10;BOK-202, নৌকাডুবি, রবীন্দ্রনাথ ঠাকুর, বেঙ্গল পাবলিশার্স, , 180, 280"
                className="w-full h-56 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono text-xs focus:outline-none focus:border-indigo-500 focus:bg-white resize-none transition-all"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all active:scale-95"
              >
                ডাটা ইম্পোর্ট প্রসেস করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">বই মুছে ফেলার সতর্কতা</h3>
                <p className="text-xs text-slate-500">এই অ্যাকশনটি স্থায়ী এবং অপরিবর্তনীয়</p>
              </div>
            </div>
            
            <div className="mt-4 text-slate-600 text-xs space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <p><span className="text-slate-400">বইয়ের নাম:</span> <strong className="text-slate-900 text-sm ml-1">{bookToDelete.name}</strong></p>
                <p><span className="text-slate-400">বই কোড:</span> <span className="font-mono text-rose-600 font-bold ml-1">{bookToDelete.code}</span></p>
                <p><span className="text-slate-400">লেখক:</span> <span className="text-slate-700 ml-1">{bookToDelete.author}</span></p>
              </div>
            </div>

            {deleteConfirmError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-600 mt-4 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{deleteConfirmError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-5 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setBookToDelete(null);
                  setDeleteConfirmError("");
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setDeleteConfirmError("");
                    await onDeleteBook(bookToDelete.id);
                    setBookToDelete(null);
                  } catch (err: any) {
                    setDeleteConfirmError(err.message || "বইটি ডিলিট করা সম্ভব হয়নি।");
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 size={14} />
                হ্যাঁ, নিশ্চিতভাবে মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
