import React, { useState, useEffect } from "react";
import { BookOpen, UserCheck, CalendarDays, RefreshCw, CheckCircle2, ArrowRightLeft, Clock, MessageSquare, AlertTriangle, List, Search, AlertCircle, Info, Calendar } from "lucide-react";
import { apiClient } from "../api";

interface IssueReturnProps {
  onIssueBook: (payload: any) => Promise<any>;
  onReturnBook: (payload: any) => Promise<any>;
  onChangeTime: (payload: any) => Promise<any>;
  activeIssues: any[]; // Used for Time Extension selectors
  onRefreshAll: () => void;
}

export default function IssueReturn({ onIssueBook, onReturnBook, onChangeTime, activeIssues, onRefreshAll }: IssueReturnProps) {
  // Navigation tabs Inside Issue Page
  const [activeSubTab, setActiveSubTab] = useState<"issue" | "return" | "time" | "active">("issue");

  // --- ISSUE STATE ---
  const [issueBookCode, setIssueBookCode] = useState("");
  const [issueBookName, setIssueBookName] = useState("");
  const [issueBookAuthor, setIssueBookAuthor] = useState("");
  const [issueBookPublisher, setIssueBookPublisher] = useState("");

  const [issueMemName, setIssueMemName] = useState("");
  const [issueMemForm, setIssueMemForm] = useState("");
  const [issueMemMobile, setIssueMemMobile] = useState("");
  const [issueMemAddress, setIssueMemAddress] = useState("");

  const [returnOption, setReturnOption] = useState("7"); // "1", "2", "7", "10", "manual"
  const [manualReturnDate, setManualReturnDate] = useState("");

  // Suggest arrays
  const [bookSuggestions, setBookSuggestions] = useState<any[]>([]);
  const [memSuggestions, setMemSuggestions] = useState<any[]>([]);
  const [showBookSug, setShowBookSug] = useState(false);
  const [showMemSug, setShowMemSug] = useState(false);

  // --- RETURN STATE ---
  const [returnBookCode, setReturnBookCode] = useState("");
  const [returnComments, setReturnComments] = useState("");

  // --- TIME ADJUST STATE ---
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [timeAction, setTimeAction] = useState<"Extend" | "Reduce">("Extend");
  const [timeDays, setTimeDays] = useState("3");

  const [opLoading, setOpLoading] = useState(false);
  const [opSuccess, setOpSuccess] = useState("");
  const [opError, setOpError] = useState("");

  // --- ACTIVE ISSUES LIST STATE ---
  const [activeDetailedIssues, setActiveDetailedIssues] = useState<any[]>([]);
  const [activeIssuesLoading, setActiveIssuesLoading] = useState(false);
  const [activeIssuesError, setActiveIssuesError] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");

  // Fetch active detailed issues when tab changes
  useEffect(() => {
    if (activeSubTab === "active") {
      fetchActiveDetailedIssues();
    }
  }, [activeSubTab]);

  const fetchActiveDetailedIssues = async () => {
    setActiveIssuesLoading(true);
    setActiveIssuesError("");
    try {
      const data = await apiClient.get("/issues/active-detailed");
      setActiveDetailedIssues(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("ইস্যুকৃত বইসমূহ লোড ব্যর্থ:", err);
      setActiveIssuesError(err.message || "তালিকা লোড করতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setActiveIssuesLoading(false);
    }
  };

  // --- REAL-TIME AUTOSUGGEST LOOPS ---
  useEffect(() => {
    if (!issueBookCode && !issueBookName) {
      setBookSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const q = issueBookCode || issueBookName;
      try {
        const matches = await apiClient.get(`/books/suggest?q=${encodeURIComponent(q)}`);
        // Filter to available books for issuing
        setBookSuggestions(matches);
      } catch (err) {}
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [issueBookCode, issueBookName]);

  useEffect(() => {
    if (!issueMemName && !issueMemForm) {
      setMemSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      const q = issueMemName || issueMemForm;
      try {
        const matches = await apiClient.get(`/members/suggest?q=${encodeURIComponent(q)}`);
        setMemSuggestions(matches);
      } catch (err) {}
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [issueMemName, issueMemForm]);

  // Autofill helpers
  const fillBook = (book: any) => {
    setIssueBookCode(book.code);
    setIssueBookName(book.name);
    setIssueBookAuthor(book.author);
    setIssueBookPublisher(book.publisher);
    setShowBookSug(false);
  };

  const fillMember = (mem: any) => {
    setIssueMemName(mem.name);
    setIssueMemForm(mem.formNumber);
    setIssueMemMobile(mem.mobile);
    setIssueMemAddress(mem.address);
    setShowMemSug(false);
  };

  // Submit Issue handle
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError("");
    setOpSuccess("");
    if (!issueBookCode || !issueBookName || !issueMemName || !issueMemForm || !issueMemMobile) {
      setOpError("অনুগ্রহ করে তারকাচিহ্নিত (*) বাধ্যতামূলক তথ্যসমূহ পূরণ করুন।");
      return;
    }

    setOpLoading(true);
    try {
      await onIssueBook({
        name: issueMemName.trim(),
        formNumber: issueMemForm.trim(),
        mobile: issueMemMobile.trim(),
        address: issueMemAddress.trim(),
        bookCode: issueBookCode.trim(),
        bookName: issueBookName.trim(),
        author: issueBookAuthor.trim(),
        publisher: issueBookPublisher.trim(),
        returnOption,
        manualReturnDate,
      });

      setOpSuccess(`অভিনন্দন! বইটি সফলভাবে '${issueMemName}' গ্রাহকের অনুকূলে ইস্যু করা হয়েছে।`);
      // Reset issue fields
      setIssueBookCode("");
      setIssueBookName("");
      setIssueBookAuthor("");
      setIssueBookPublisher("");
      setIssueMemName("");
      setIssueMemForm("");
      setIssueMemMobile("");
      setIssueMemAddress("");
    } catch (err: any) {
      setOpError(err.message || "ইস্যু ব্যর্থ হয়েছে। দয়া করে বইয়ের স্ট্যাটাস পরীক্ষা করুন।");
    } finally {
      setOpLoading(false);
    }
  };

  // Submit Return handle
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError("");
    setOpSuccess("");
    if (!returnBookCode) {
      setOpError("ফেরত গ্রহণ করার জন্য বইয়ের কোডটি লিখুন!");
      return;
    }

    setOpLoading(true);
    try {
      await onReturnBook({
        bookCode: returnBookCode.trim().toUpperCase(),
        comments: returnComments.trim(),
      });
      setOpSuccess(`বইটি সফলভাবে লাইব্রেরির তাকে ফেরত গ্রহণ করা হয়েছে এবং স্ট্যাটাস Available করা হয়েছে।`);
      setReturnBookCode("");
      setReturnComments("");
    } catch (err: any) {
      setOpError(err.message || "ফেরত গ্রহণ নিষ্ফল হয়েছে। বই কোড সঠিক কিনা চেক করুন।");
    } finally {
      setOpLoading(false);
    }
  };

  // Submit Extension handle
  const handleTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpError("");
    setOpSuccess("");
    if (!selectedIssueId) {
      setOpError("অনুগ্রহ করে একটি বই ও গ্রাহক নির্বাচন করুন।");
      return;
    }

    const offsetVal = parseInt(timeDays, 10);
    if (isNaN(offsetVal) || offsetVal <= 0) {
      setOpError("সঠিক দিনের সংখ্যা নির্ধারণ করুন।");
      return;
    }

    setOpLoading(true);
    try {
      await onChangeTime({
        issueId: selectedIssueId,
        action: timeAction,
        days: offsetVal,
      });
      setOpSuccess(`বইটির জমা দেওয়ার নির্ধারিত সময়সীমা সফলভাবে ${timeAction === "Extend" ? "বৃদ্ধি" : "হ্রাস"} করা হয়েছে এবং অডিটে সংরক্ষিত হয়েছে।`);
      setSelectedIssueId("");
    } catch (err: any) {
      setOpError(err.message || "সময় পরিবর্তন ব্যর্থ হয়েছে।");
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">বই লেনদেন (Issue & Return)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              {activeIssues.length} টি সক্রিয় ঋণ
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">বই ধার প্রদান, ফেরত গ্রহণ এবং সময়সীমা সমন্বয় পরিচালনা করুন</p>
        </div>
      </div>

      {/* Modern Segmented Sub Navigation Control */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            setActiveSubTab("issue");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
            activeSubTab === "issue" 
              ? "bg-white text-indigo-600 shadow-xs" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen size={16} />
          <span>বই ধার প্রদান (Checkout)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("return");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
            activeSubTab === "return" 
              ? "bg-white text-indigo-600 shadow-xs" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>বই রিটার্ন গ্রহণ (Checkin)</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("time");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
            activeSubTab === "time" 
              ? "bg-white text-indigo-600 shadow-xs" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ArrowRightLeft size={16} />
          <span>সময় বৃদ্ধি ও হ্রাস</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("active");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
            activeSubTab === "active" 
              ? "bg-white text-indigo-600 shadow-xs" 
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <List size={16} />
          <span>ইস্যুকৃত বইসমূহ ({activeIssues.length})</span>
        </button>
      </div>

      {/* Operation Alert Statuses */}
      {opError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-700 flex items-center gap-3 animate-pulse shadow-xs">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <span className="font-semibold">{opError}</span>
        </div>
      )}

      {opSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 shadow-xs font-medium">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{opSuccess}</span>
        </div>
      )}

      {/* --- FORM SUBTAB A: ISSUE BOOK --- */}
      {activeSubTab === "issue" && (
        <form onSubmit={handleIssueSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Borrower Customer Information */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck size={18} className="text-indigo-600" />
                <span>গ্রাহক সদস্যের তথ্যাদি</span>
              </h3>

              {/* Form text input with dynamic AutoSuggest overlay */}
              <div className="relative">
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">সদস্যের নাম বা ফরম নাম্বার লিখুন *</label>
                <input
                  type="text"
                  value={issueMemName}
                  onChange={(e) => {
                    setIssueMemName(e.target.value);
                    setShowMemSug(true);
                  }}
                  onFocus={() => setShowMemSug(true)}
                  placeholder="খুঁজতে টাইপ করুন..."
                  className="w-full text-xs p-3 glass-input"
                  required
                />
                
                {/* Auto Suggestions dropdown */}
                {showMemSug && memSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto shadow-2xl z-20 divide-y divide-slate-100">
                    {memSuggestions.map(mem => (
                      <div
                        key={mem.formNumber}
                        onClick={() => fillMember(mem)}
                        className="p-3 hover:bg-indigo-50/50 text-xs text-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{mem.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">মোবাইল: {mem.mobile}</p>
                        </div>
                        <span className="font-mono text-indigo-700 font-bold text-[10px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          #{mem.formNumber}
                        </span>
                      </div>
                    ))}
                    <div className="p-2 text-[10px] text-slate-400 text-center bg-slate-50 border-t border-slate-100">
                      মিল থাকলে ক্লিক করুন, না থাকলে টাইপ শেষ করুন
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">সদস্য ফরম নাম্বার (ID) *</label>
                  <input
                    type="text"
                    value={issueMemForm}
                    onChange={(e) => {
                      setIssueMemForm(e.target.value);
                      setShowMemSug(true);
                    }}
                    placeholder="যেমন: M-101"
                    className="w-full text-xs p-3 glass-input font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={issueMemMobile}
                    onChange={(e) => setIssueMemMobile(e.target.value)}
                    placeholder="01712xxxxxx"
                    className="w-full text-xs p-3 glass-input font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">গ্রাহকের ঠিকানা</label>
                <input
                  type="text"
                  value={issueMemAddress}
                  onChange={(e) => setIssueMemAddress(e.target.value)}
                  placeholder="ঠিকানা লিখুন..."
                  className="w-full text-xs p-3 glass-input"
                />
              </div>

            </div>

            {/* 2. Target Book Information to issue */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen size={18} className="text-indigo-600" />
                <span>বইয়ের কোড ও বিবরণ</span>
              </h3>

              {/* Book search input with AutoSuggest */}
              <div className="relative">
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">বই কোড বা নাম লিখুন *</label>
                <input
                  type="text"
                  value={issueBookCode}
                  onChange={(e) => {
                    setIssueBookCode(e.target.value);
                    setShowBookSug(true);
                  }}
                  onFocus={() => setShowBookSug(true)}
                  placeholder="যেমন: BOK-101..."
                  className="w-full text-xs p-3 glass-input font-mono uppercase"
                  required
                />

                {/* Auto Suggestions dropdown */}
                {showBookSug && bookSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl max-h-48 overflow-y-auto shadow-2xl z-20 divide-y divide-slate-100">
                    {bookSuggestions.map(book => (
                      <div
                        key={book.id}
                        onClick={() => fillBook(book)}
                        className="p-3 hover:bg-indigo-50/50 text-xs text-slate-800 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 truncate text-xs">{book.name}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{book.author}</p>
                        </div>
                        <span className={`shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${book.status === "Available" ? "badge-available" : "badge-issued"}`}>
                          {book.code} ({book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">বইয়ের নাম *</label>
                <input
                  type="text"
                  value={issueBookName}
                  onChange={(e) => setIssueBookName(e.target.value)}
                  placeholder="যেমন: লালসালু"
                  className="w-full text-xs p-3 glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">লেখক</label>
                  <input
                    type="text"
                    value={issueBookAuthor}
                    onChange={(e) => setIssueBookAuthor(e.target.value)}
                    placeholder="লেখক..."
                    className="w-full text-xs p-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">প্রকাশনী</label>
                  <input
                    type="text"
                    value={issueBookPublisher}
                    onChange={(e) => setIssueBookPublisher(e.target.value)}
                    placeholder="প্রকাশনী..."
                    className="w-full text-xs p-3 glass-input"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 3. Date settings and submit */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <CalendarDays size={18} className="text-indigo-600" />
              <span>বই ফেরত দেওয়ার সময়সীমা নির্ধারণ (Time Offset & Return Date)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-500 mb-2">ফেরত লিজ সময় কোটা দিন</label>
                <div className="grid grid-cols-5 gap-2">
                  {["1", "2", "7", "10", "manual"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReturnOption(opt)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                        returnOption === opt 
                          ? "bg-indigo-600 text-white shadow-xs" 
                          : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      {opt === "manual" ? "ম্যানুয়াল" : `${opt} দিন`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Date Input Picker */}
              {returnOption === "manual" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <label className="block text-[11px] uppercase font-bold text-rose-600 mb-1.5">ফেরত তারিখ সিলেক্ট করুন *</label>
                  <input
                    type="date"
                    value={manualReturnDate}
                    onChange={(e) => setManualReturnDate(e.target.value)}
                    className="w-full text-xs p-3 glass-input font-mono"
                    required
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  ফেরত প্রদানের শেষ তারিখটি আজ থেকে হিসাব করে সিস্টেমের ডাটাবেইজে স্বয়ংক্রিয় শিডিউলে সংযুক্ত হবে।
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 mt-6 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={opLoading}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {opLoading ? (
                  <RefreshCw className="animate-spin" size={15} />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>লেনদেন সফল করুন ও বই ইস্যু করুন</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- FORM SUBTAB B: RETURN BOOK --- */}
      {activeSubTab === "return" && (
        <form onSubmit={handleReturnSubmit} className="glass-panel p-7 max-w-xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <span>বই লাইব্রেরিতে ফেরত গ্রহণ (Return Check-in)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">পাঠকের কাছ থেকে বই গ্রহণ করে তাকে পুনরায় উপলব্ধ তালিকায় সংযুক্ত করুন</p>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">বই কোড স্ক্যান অথবা কী-ইন করুন *</label>
            <input
              type="text"
              value={returnBookCode}
              onChange={(e) => setReturnBookCode(e.target.value)}
              placeholder="যেমন: BOK-103"
              className="w-full text-xs p-3.5 glass-input font-mono uppercase text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">ফেরত গ্রহণের সময় মন্তব্য / ক্ষতির বিবরণী (ঐচ্ছিক)</label>
            <textarea
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="যেমন: প্রচ্ছদ বা পৃষ্ঠা ভালো অবস্থায় এসেছে..."
              className="w-full text-xs p-3 h-24 glass-input resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={opLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {opLoading ? <RefreshCw className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
              <span>ফেরত নিশ্চিত ও তাকে জমা গ্রহণ করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* --- FORM SUBTAB C: TIME EXTENSION/REDUCTION --- */}
      {activeSubTab === "time" && (
        <form onSubmit={handleTimeSubmit} className="glass-panel p-7 max-w-xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              <span>সময়সীমা প্রলম্বিত করা অথবা হ্রাসকরণ (Return Line Extend/Reduce)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">ধারকৃত বইয়ের নির্ধারিত জমাদানের তারিখ প্রয়োজন অনুযায়ী পরিবর্তন করুন</p>
          </div>

          <div>
            <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">চলমান ইস্যুকৃত ধার স্লিপ সিলেক্ট করুন *</label>
            {activeIssues.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 block bg-slate-50 p-3 rounded-xl border border-slate-100">
                বর্তমানে কোনো বই ধারকৃত বা Issued হিসেবে সচল নাই।
              </p>
            ) : (
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="w-full text-xs p-3 glass-input cursor-pointer"
                required
              >
                <option value="">নির্ধারিত লিজ একাউন্ট নির্বাচন করুন...</option>
                {activeIssues.map(issue => (
                  <option key={issue.id} value={issue.id}>
                    {issue.bookName} ({issue.bookCode}) - {issue.memberName} (রিটার্ন তারিখ: {issue.returnDate})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">অ্যাকশন নির্বাচন করুন</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeAction("Extend")}
                  className={`py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    timeAction === "Extend" 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  সময় বাড়ান (+)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeAction("Reduce")}
                  className={`py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                    timeAction === "Reduce" 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  সময় কমান (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-500 mb-1.5">কত দিন পরিবর্তন করবেন? *</label>
              <input
                type="number"
                value={timeDays}
                onChange={(e) => setTimeDays(e.target.value)}
                min="1"
                max="60"
                className="w-full text-xs p-2.5 glass-input font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={opLoading || activeIssues.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 shadow-sm hover:shadow transition-all active:scale-95"
            >
              {opLoading ? <RefreshCw className="animate-spin" size={15} /> : <CheckCircle2 size={15} />}
              <span>সময় পরিবর্তন নিশ্চিত করুন</span>
            </button>
          </div>
        </form>
      )}

      {/* --- FORM SUBTAB D: ACTIVE ISSUES LIST --- */}
      {activeSubTab === "active" && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <List size={20} className="text-indigo-600" />
                <span>বর্তমানে ইস্যুকৃত সকল বইয়ের তালিকা</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">ধারকৃত বইগুলোর বিস্তারিত ওভারভিউ ও মেয়াদোত্তীর্ণ তথ্য</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="বই, কোড, মেম্বার বা মোবাইল..."
                value={activeSearchQuery}
                onChange={(e) => setActiveSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs glass-input"
              />
            </div>
          </div>

          {activeIssuesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl skeleton-shimmer"></div>
              ))}
            </div>
          ) : activeIssuesError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangle size={28} className="text-rose-500" />
              <p className="text-sm text-rose-600 font-semibold">{activeIssuesError}</p>
              <button
                onClick={fetchActiveDetailedIssues}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                <RefreshCw size={13} /> পুনরায় লোড করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const filtered = activeDetailedIssues.filter(issue => {
                  const q = activeSearchQuery.toLowerCase();
                  return (
                    (issue.bookName || "").toLowerCase().includes(q) ||
                    (issue.bookCode || "").toLowerCase().includes(q) ||
                    (issue.memberName || "").toLowerCase().includes(q) ||
                    (issue.mobile || "").toLowerCase().includes(q) ||
                    (issue.formNumber || "").toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0 && activeDetailedIssues.length > 0) {
                  return (
                    <div className="col-span-1 md:col-span-2 py-10 text-center text-slate-400 text-xs">
                      "{activeSearchQuery}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                      <span className="font-semibold text-slate-700">বর্তমানে কোনো বই ধারকৃত অবস্থায় নেই।</span>
                      <span className="text-[11px]">সকল বই লাইব্রেরিতে জমা রয়েছে।</span>
                    </div>
                  );
                }

                return filtered.map((issue) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const target = new Date(issue.returnDate);
                  target.setHours(0, 0, 0, 0);
                  const diffTime = target.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isOverdue = diffDays < 0;

                  return (
                    <div key={issue.id} className="glass-panel p-4 flex gap-4 hover:border-indigo-200 transition-all relative overflow-hidden group shadow-xs hover:shadow-md">
                      {isOverdue && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1">
                          <AlertCircle size={10} /> {Math.abs(diffDays)} দিন ওভারডিউ
                        </div>
                      )}
                      
                      {/* Book Thumbnail */}
                      <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shadow-2xs">
                        {issue.imageUrl ? (
                          <img src={issue.imageUrl} alt={issue.bookName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <BookOpen className="text-slate-300" size={32} />
                        )}
                      </div>

                      <div className="flex flex-col flex-1 min-w-0 justify-between">
                        {/* Book Info */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[10px] font-bold border border-slate-200">
                              {issue.bookCode}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={issue.author}>
                              {issue.author}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate" title={issue.bookName}>
                            {issue.bookName}
                          </h4>
                        </div>

                        {/* Member Info */}
                        <div className="bg-slate-50/80 border border-slate-100 p-2.5 rounded-xl my-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
                            <UserCheck size={13} className="text-indigo-600 shrink-0" />
                            <span className="truncate">{issue.memberName}</span>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0 font-mono">(#{issue.formNumber})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 ml-4.5 font-mono">
                            {issue.mobile}
                          </div>
                        </div>

                        {/* Dates Info */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-slate-400 font-mono">
                            <Calendar size={11} />
                            ইস্যু: {issue.issueDate}
                          </div>
                          <div className={`flex items-center gap-1 font-bold font-mono ${isOverdue ? "text-rose-600" : "text-emerald-600"}`}>
                            <CalendarDays size={11} />
                            রিটার্ন: {issue.returnDate}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
