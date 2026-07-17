import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Image, Download, FilePlus2, Eye, FileText, Check, AlertCircle, RefreshCw, Database } from "lucide-react";
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

  // Open Edit Dialog
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি ছবি ফাইল সিলেক্ট করুন।");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBookImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  // Handle Add Form Submission
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
      // Reset form
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

  // Handle Edit Form Submission
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

  // Parse bulk text block copy-paste helper
  const handleBulkSubmit = async () => {
    setBulkError("");
    setBulkSuccessMsg("");
    if (!bulkInput.trim()) {
      setBulkError("অনুগ্রহ করে বইয়ের ডাটা ইনপুট বক্সে পেস্ট করুন।");
      return;
    }

    // Parse logic: Supports CSV (comma separated) or Tab Separated formats
    // Format expected: BookCode, BookName, Author, Publisher, ImageUrl (optional)
    const lines = bulkInput.split("\n");
    const parsedList: any[] = [];

    lines.forEach((line, index) => {
      if (!line.trim()) return;
      
      // Attempt split by tab first, then comma
      let cols = line.split("\t");
      if (cols.length < 3) {
        cols = line.split(",");
      }

      const code = cols[0]?.trim();
      const name = cols[1]?.trim();
      const author = cols[2]?.trim();
      const publisher = cols[3]?.trim() || "অজ্ঞাত প্রকাশনা";
      const imageUrl = cols[4]?.trim() || "";

      if (code && name && author) {
        parsedList.push({ code, name, author, publisher, imageUrl });
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

  // Export current list to CSV
  const handleExportCSV = () => {
    if (books.length === 0) return;
    const headers = ["BookCode", "BookName", "Author", "Publisher", "Status"];
    const rows = books.map(b => [b.code, b.name, b.author, b.publisher, b.status]);
    
    // Prepare string
    const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Akkhor_Library_Books_Export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="space-y-6">


      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">বইয়ের রেজিস্ট্রি ও ব্যবস্থাপনা</h2>
          <p className="text-xs text-[#6B6B70]">লাইব্রেরির বই যুক্ত করুন, তথ্য সংশোধন করুন এবং স্ট্যাটাস পরিবর্তন পরিচালনা করুন</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setBulkInput("");
              setBulkError("");
              setBulkSuccessMsg("");
              setIsBulkOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-xs font-semibold rounded-lg hover:border-[#22242A]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors cursor-pointer"
          >
            <FilePlus2 size={14} className="text-[#FACC15]" />
            বাল্ক ইম্পোর্ট
          </button>

          <button
            onClick={() => {
              setBookCode("");
              setBookName("");
              setBookAuthor("");
              setBookPublisher("");
              setBookImageUrl("");
              setFormErr("");
              setIsAddOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-[#22242A] text-white text-xs font-bold rounded-lg hover:bg-[#2d2f36] transition-all cursor-pointer shadow-[0_2px_8px_rgba(34,36,42,0.15)]"
          >
            <Plus size={14} className="text-[#FACC15]" />
            নতুন বই যোগ
          </button>
        </div>
      </div>

      {/* Filter Options bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E5EA]">
        <div className="relative col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="কোড, নাম, লেখক বা প্রকাশক দিয়ে খুঁজুন..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#F5F3EF] rounded-lg border border-[#E5E5EA] text-[#22242A] placeholder:text-[#6B6B70] focus:outline-none focus:border-[#22242A]/40"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-[#F5F3EF] rounded-lg border border-[#E5E5EA] text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
          >
            <option value="">সকল স্ট্যাটাস (Available & Issued)</option>
            <option value="Available">উপলব্ধ (তাত্ক্ষণিক লেনদেন যোগ্য)</option>
            <option value="Issued">ধারকৃত (বর্তমানে ধারকৃত)</option>
          </select>
        </div>
      </div>

      {/* Group selection pills right below search bar */}
      <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E5EA]">
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B6B70]">বইয়ের গ্রুপ / কর্নার ভিত্তিক ফিল্টার:</div>
        {uniqueBookGroups.length === 0 ? (
          <p className="text-xs text-[#6B6B70] italic">কোনো গ্রুপ বা কর্নার পাওয়া যায়নি।</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGroup("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedGroup === ""
                  ? "bg-[#22242A] text-[#FACC15] shadow-md font-bold"
                  : "bg-[#F5F3EF] text-[#6B6B70] hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent"
              }`}
            >
              সকল বই ({books.length})
            </button>
            {uniqueBookGroups.map(g => {
              const count = books.filter(b => b.group === g).length;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGroup(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedGroup === g
                      ? "bg-[#22242A] text-[#FACC15] shadow-md font-bold"
                      : "bg-[#F5F3EF] text-[#6B6B70] hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent"
                  }`}
                >
                  {g} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Books Table Cards Layout */}
      {filteredBooks.length === 0 ? (
        <div className="glass-panel p-10 text-center rounded-2xl">
          <p className="text-[#6B6B70] text-sm">কোনো বই খুঁজে পাওয়া যায়নি। উপরের ইনপুট চেক করুন বা নতুন বই যোগ করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="glass-panel p-4 flex gap-4 hover:border-[#22242A]/30 duration-200 hover:-translate-y-0.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
            >
              <div className="w-20 h-28 rounded bg-[#F5F3EF] overflow-hidden border border-[#E5E5EA] flex items-center justify-center shrink-0">
                <img 
                  src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                  alt={book.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <div className="flex items-center gap-1 min-w-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] uppercase tracking-wider truncate mb-1">
                        {book.code}
                      </span>
                      {book.group && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F5F3EF] text-[#6B6B70] border border-[#E5E5EA] truncate mb-1" title={book.group}>
                          {book.group}
                        </span>
                      )}
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${book.status === "Available" ? "bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA]" : "bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA]"}`}>
                      {book.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#22242A] text-xs sm:text-sm truncate" title={book.name}>{book.name}</h3>
                  <p className="text-[#6B6B70] text-xs truncate">{book.author}</p>
                  <p className="text-[#6B6B70] text-[10px] truncate">প্রকাশক: {book.publisher}</p>
                  {(book.pageCount || book.price) && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {book.pageCount ? <span className="text-[9px] text-[#6B6B70] font-mono">📄 {book.pageCount} পৃষ্ঠা</span> : null}
                      {book.price ? <span className="text-[9px] text-[#22242A] font-bold font-mono">৳{book.price}</span> : null}
                    </div>
                  )}
                </div>

                {/* Operations links and buttons */}
                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-[#E5E5EA] mt-2">
                  <button
                    onClick={() => onPreview(book)}
                    className="p-1.5 hover:bg-[#F5F3EF] rounded text-[#6B6B70] hover:text-[#22242A] cursor-pointer transition-colors"
                    title="রিসিট স্লিপ এবং চোখের প্রাকদর্শন"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(book)}
                    className="p-1.5 hover:bg-[#F5F3EF] rounded text-[#6B6B70] hover:text-[#FACC15] cursor-pointer transition-colors"
                    title="সংশোধন করুন"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmError("");
                      setBookToDelete(book);
                    }}
                    className="p-1.5 hover:bg-[#F5F3EF] rounded text-[#6B6B70] hover:text-[#FF6B6B] cursor-pointer transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD BOOK */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#22242A] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[#FACC15]" />
              লাইব্রেরিতে নতুন বই এন্ট্রি
            </h3>
            
            {formErr && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] mb-3 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{formErr}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বই কোড / বারকোড *</label>
                <input
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  placeholder="যেমন: BOK-106"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের নাম (বাংলা ইউনিকোড) *</label>
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="বইয়ের আকর্ষণীয় নাম লিখুন"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">লেখকের নাম *</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="হুমায়ূন আহমেদ"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">প্রকাশনী প্রেস *</label>
                  <input
                    type="text"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    placeholder="যেমনঃ অন্যপ্রকাশ"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের গ্রুপ বা কর্নার (ঐচ্ছিক)</label>
                <select
                  value={bookGroup}
                  onChange={(e) => setBookGroup(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                >
                  <option value="">কোনো গ্রুপ নেই (সাধারণ বই)</option>
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="বইয়ের সংক্ষিপ্ত বিবরণ লিখুন..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">পৃষ্ঠা সংখ্যা (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(e.target.value)}
                    placeholder="যেমন: 250"
                    min="0"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">মূল্য ৳ (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="যেমন: 350.00"
                    min="0"
                    step="0.01"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-2">কভার ছবি</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-1 h-28 bg-[#E5E5EA] rounded-xl overflow-hidden border border-transparent flex items-center justify-center relative group">
                    {bookImageUrl ? (
                      <>
                        <img src={bookImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBookImageUrl("")}
                          className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FF6B6B] text-xs font-bold transition-opacity cursor-pointer text-center"
                        >
                          মুছে ফেলুন
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-[#6B6B70]">
                        <Image className="mx-auto mb-1 opacity-40" size={20} />
                        <span className="text-[9px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-3 space-y-2">
                    <div className="relative border border-dashed border-[#E5E5EA] rounded-xl p-4 bg-white hover:bg-[#F5F3EF] transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs text-[#22242A] font-bold">
                          গ্যালারি থেকে ছবি আপলোড করুন
                        </p>
                        <p className="text-[10px] text-[#6B6B70]">মোবাইল ক্যামেরা বা গ্যালারি থেকে ছবি সিলেক্ট করুন</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#6B6B70] uppercase font-mono tracking-wider">অথবা কভার ছবির URL পেস্ট করুন:</span>
                    </div>
                    
                    <input
                      type="url"
                      value={bookImageUrl.startsWith("data:") ? "" : bookImageUrl}
                      onChange={(e) => setBookImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-[#F5F3EF] text-[#6B6B70] rounded-lg hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22242A] text-[#FACC15] rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer shadow-[0_2px_8px_rgba(34,36,42,0.15)]"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#22242A] mb-4 flex items-center gap-2">
              <Edit3 size={18} className="text-[#FACC15]" />
              বইয়ের তথ্য সম্পাদন / সংশোধন
            </h3>
            
            {formErr && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] mb-3 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{formErr}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বই কোড (সংশোধন সম্ভব) *</label>
                <input
                  type="text"
                  value={bookCode}
                  onChange={(e) => setBookCode(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের নাম *</label>
                <input
                  type="text"
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">লেখক *</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">প্রকাশনী *</label>
                  <input
                    type="text"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের গ্রুপ বা কর্নার (ঐচ্ছিক)</label>
                <select
                  value={bookGroup}
                  onChange={(e) => setBookGroup(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                >
                  <option value="">কোনো গ্রুপ নেই (সাধারণ বই)</option>
                  {groups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">বইয়ের বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="বইয়ের সংক্ষিপ্ত বিবরণ লিখুন..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">পৃষ্ঠা সংখ্যা (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPageCount}
                    onChange={(e) => setBookPageCount(e.target.value)}
                    placeholder="যেমন: 250"
                    min="0"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-1">মূল্য ৳ (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="যেমন: 350.00"
                    min="0"
                    step="0.01"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6B70] mb-2">কভার ছবি</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-1 h-28 bg-[#E5E5EA] rounded-xl overflow-hidden border border-transparent flex items-center justify-center relative group">
                    {bookImageUrl ? (
                      <>
                        <img src={bookImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBookImageUrl("")}
                          className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FF6B6B] text-xs font-bold transition-opacity cursor-pointer text-center"
                        >
                          মুছে ফেলুন
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-2 text-[#6B6B70]">
                        <Image className="mx-auto mb-1 opacity-40" size={20} />
                        <span className="text-[9px]">ছবি নেই</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="sm:col-span-3 space-y-2">
                    <div className="relative border border-dashed border-[#E5E5EA] rounded-xl p-4 bg-white hover:bg-[#F5F3EF] transition-all text-center group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs text-[#22242A] font-bold">
                          গ্যালারি থেকে নতুন ছবি আপলোড করুন
                        </p>
                        <p className="text-[10px] text-[#6B6B70]">মোবাইল ক্যামেরা বা গ্যালারি থেকে নতুন ছবি সিলেক্ট করুন</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#6B6B70] uppercase font-mono tracking-wider">অথবা কভার ছবির URL পেস্ট করুন:</span>
                    </div>
                    
                    <input
                      type="url"
                      value={bookImageUrl.startsWith("data:") ? "" : bookImageUrl}
                      onChange={(e) => setBookImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]/40 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-[#F5F3EF] text-[#6B6B70] rounded-lg hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#22242A] text-[#FACC15] rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer shadow-[0_2px_8px_rgba(34,36,42,0.15)]"
                >
                  সংশোধন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK IMPORT */}
      {isBulkOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <h3 className="text-lg font-bold text-[#22242A] mb-2 flex items-center gap-2 shrink-0">
              <FilePlus2 className="text-[#22242A]" />
              বইয়ের ক্যাটালগ বাল্ক ইম্পোর্ট
            </h3>
            
            <p className="text-[11px] text-[#6B6B70] mb-4 shrink-0">
              নিচে বক্সে নতুন বইয়ের তালিকা পেস্ট করুন। ফরম্যাট হতে হবে: <code className="text-[#22242A] font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-[#E5E5EA]">বই_কোড [Tab বা কমা] বই_নাম [Tab বা কমা] লেখকের_নাম [Tab বা কমা] প্রকাশনী_নাম</code>
              <br/>লাইন গ্যাপ দিয়ে একাধিক সারি পেস্ট করতে পারবেন (যেমন এক্সেল/সপ্রেডশিট থেকে কপি করে পেস্ট করুন)।
            </p>

            {bulkError && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] mb-3 flex items-center gap-2 shrink-0">
                <AlertCircle size={14} />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkSuccessMsg && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#22242A] mb-3 flex items-center gap-2 shrink-0 animate-pulse">
                <Check size={14} />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <div className="flex-1 overflow-auto py-2">
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="BOK-201, দেবদাস, শরৎচন্দ্র চট্টোপাধ্যায়, দেব সাহিত্য কুটির&#10;BOK-202, নৌকাডুবি, রবীন্দ্রনাথ ঠাকুর, বেঙ্গল পাবলিশার্স"
                className="w-full h-64 p-3 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] font-mono text-xs focus:outline-none focus:border-[#22242A]/40 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E5EA] shrink-0">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-4 py-2 bg-[#F5F3EF] text-[#6B6B70] rounded-lg hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent text-xs font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={handleBulkSubmit}
                className="px-5 py-2 bg-[#22242A] text-[#FACC15] rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer shadow-[0_2px_8px_rgba(34,36,42,0.15)]"
              >
                ডাটা ইম্পোর্ট প্রসেস করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CONFIRMATION */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-md shadow-2xl shadow-red-900/10 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#22242A] mb-3 flex items-center gap-2">
              <Trash2 className="text-[#FF6B6B] shrink-0" size={20} />
              বই মুছে ফেলার সতর্কতা!
            </h3>
            
            <div className="mt-2 text-[#6B6B70] text-xs space-y-2">
              <p>আপনি কি নিশ্চিতভাবেই নিচের বইটি সিস্টেম থেকে মুছে ফেলতে চান?</p>
              <div className="p-3 bg-[#F5F3EF] border border-[#E5E5EA] rounded-lg space-y-1">
                <p><span className="text-[#6B6B70]">বইয়ের নাম:</span> <strong className="text-[#22242A] text-sm">{bookToDelete.name}</strong></p>
                <p><span className="text-[#6B6B70]">বই কোড:</span> <span className="font-mono text-[#FF6B6B] font-semibold">{bookToDelete.code}</span></p>
                <p><span className="text-[#6B6B70]">লেখক:</span> <span className="text-[#22242A]">{bookToDelete.author}</span></p>
              </div>
              <p className="text-[10px] text-[#FF6B6B] flex items-start gap-1.5 pt-1">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                সতর্কতা: এই অপারেশনটি সম্পাদন করার ফলে ডাটা চিরতরে হারিয়ে যেতে পারে এবং এটি আর ডিলিট বাতিল/পুনরুদ্ধার করা সম্ভব নয়।
              </p>
            </div>

            {deleteConfirmError && (
              <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] mt-4 flex items-center gap-2 animate-pulse">
                <AlertCircle size={14} className="shrink-0" />
                <span>{deleteConfirmError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-5 mt-2 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => {
                  setBookToDelete(null);
                  setDeleteConfirmError("");
                }}
                className="px-4 py-2 bg-[#F5F3EF] text-[#6B6B70] rounded-lg hover:text-[#22242A] hover:bg-[#E5E5EA] border border-transparent text-xs font-semibold cursor-pointer"
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
                className="px-5 py-2 bg-[#FF6B6B] text-[#22242A] rounded-lg text-xs font-bold hover:bg-[#F5F3EF] cursor-pointer shadow-md shadow-red-900/10 flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
