import React, { useState, useEffect } from "react";
import { BookOpen, UserCheck, CalendarDays, RefreshCw, CheckCircle2, ArrowRightLeft, Clock, MessageSquare, AlertTriangle } from "lucide-react";
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
  const [activeSubTab, setActiveSubTab] = useState<"issue" | "return" | "time">("issue");

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
      
      {/* Tab Select Block */}
      <div className="flex border-b border-[#E5E5EA]">
        <button
          onClick={() => {
            setActiveSubTab("issue");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${activeSubTab === "issue" ? "border-[#E5E5EA] text-[#22242A] bg-[#F5F3EF]" : "border-transparent text-[#6B6B70] hover:text-[#22242A]"}`}
        >
          <BookOpen size={16} />
          বই ইস্যু করুন (Checkout)
        </button>

        <button
          onClick={() => {
            setActiveSubTab("return");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${activeSubTab === "return" ? "border-[#22242A] text-[#22242A] bg-[#F5F3EF]" : "border-transparent text-[#6B6B70] hover:text-[#22242A]"}`}
        >
          <CheckCircle2 size={16} />
          বই রিটার্ন গ্রহণ (Checkin)
        </button>

        <button
          onClick={() => {
            setActiveSubTab("time");
            setOpError("");
            setOpSuccess("");
          }}
          className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-all ${activeSubTab === "time" ? "border-[#E5E5EA] text-[#FACC15] bg-[#F5F3EF]" : "border-transparent text-[#6B6B70] hover:text-[#22242A]"}`}
        >
          <ArrowRightLeft size={16} />
          সময় বৃদ্ধি ও হ্রাস (Time Offset)
        </button>
      </div>

      {/* Operation Alert Statuses */}
      {opError && (
        <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 animate-pulse">
          <AlertTriangle size={16} className="text-[#FF6B6B] shrink-0" />
          <span>{opError}</span>
        </div>
      )}

      {opSuccess && (
        <div className="bg-[#E5E5EA]/40 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-3">
          <CheckCircle2 size={16} className="text-[#22242A] shrink-0" />
          <span>{opSuccess}</span>
        </div>
      )}

      {/* --- FORM SUBTAB A: ISSUE BOOK --- */}
      {activeSubTab === "issue" && (
        <form onSubmit={handleIssueSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Borrower Customer Information */}
            <div className="glass-panel p-5 rounded-2xl border border-[#E5E5EA] space-y-4">
              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-2">
                <UserCheck size={16} className="text-[#22242A]" />
                গ্রাহক সদস্যের তথ্যাদি
              </h3>

              {/* Form text input with dynamic AutoSuggest overlay */}
              <div className="relative">
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">সদস্যের নাম বা ফরম নাম্বার লিখুন *</label>
                <input
                  type="text"
                  value={issueMemName}
                  onChange={(e) => {
                    setIssueMemName(e.target.value);
                    setShowMemSug(true);
                  }}
                  onFocus={() => setShowMemSug(true)}
                  placeholder="খুঁজতে টাইপ করুন..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] placeholder:text-slate-600 focus:outline-none focus:border-[#22242A]"
                  required
                />
                
                {/* Auto Suggestions dropdown */}
                {showMemSug && memSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5EA] rounded-lg max-h-40 overflow-y-auto shadow-2xl z-20 divide-y divide-purple-500/5">
                    {memSuggestions.map(mem => (
                      <div
                        key={mem.formNumber}
                        onClick={() => fillMember(mem)}
                        className="p-2.5 hover:bg-[#F5F3EF] text-xs text-[#22242A] cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-[#22242A]">{mem.name}</p>
                          <p className="text-[10px] text-[#6B6B70]">মোবাইল: {mem.mobile}</p>
                        </div>
                        <span className="font-mono text-[#22242A] font-semibold text-[10px] bg-[#F5F3EF] px-1.5 py-0.5 rounded">
                          #{mem.formNumber}
                        </span>
                      </div>
                    ))}
                    <div className="p-1 px-2 text-[9px] text-[#22242A] text-right bg-[#F5F3EF]">
                      মিল থাকলে ক্লিক করুন, না থাকলে টাইপ শেষ করুন (স্বয়ংক্রিয় নতুন মেম্বার তৈরি হবে)
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">সদস্য ফরম নাম্বার (ID) *</label>
                  <input
                    type="text"
                    value={issueMemForm}
                    onChange={(e) => {
                      setIssueMemForm(e.target.value);
                      setShowMemSug(true);
                    }}
                    placeholder="যেমন: M-101"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">মোবাইল নম্বর *</label>
                  <input
                    type="text"
                    value={issueMemMobile}
                    onChange={(e) => setIssueMemMobile(e.target.value)}
                    placeholder="01712xxxxxx"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">গ্রাহকের ঠিকানা</label>
                <input
                  type="text"
                  value={issueMemAddress}
                  onChange={(e) => setIssueMemAddress(e.target.value)}
                  placeholder="ধামন্ডী, ঢাকা"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                />
              </div>

            </div>

            {/* 2. Target Book Information to issue */}
            <div className="glass-panel p-5 rounded-2xl border border-[#E5E5EA] space-y-4">
              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-2">
                <BookOpen size={16} className="text-[#22242A]" />
                বইয়ের কোড ও বিবরণ
              </h3>

              {/* Book search input with AutoSuggest */}
              <div className="relative">
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">বই কোড বা নাম লিখুন *</label>
                <input
                  type="text"
                  value={issueBookCode}
                  onChange={(e) => {
                    setIssueBookCode(e.target.value);
                    setShowBookSug(true);
                  }}
                  onFocus={() => setShowBookSug(true)}
                  placeholder="যেমন: BOK-101..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                  required
                />

                {/* Auto Suggestions dropdown */}
                {showBookSug && bookSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5EA] rounded-lg max-h-40 overflow-y-auto shadow-2xl z-20 divide-y divide-purple-500/5">
                    {bookSuggestions.map(book => (
                      <div
                        key={book.id}
                        onClick={() => fillBook(book)}
                        className="p-2.5 hover:bg-[#F5F3EF] text-xs text-[#22242A] cursor-pointer flex justify-between items-center"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-[#22242A] truncate text-xs">{book.name}</p>
                          <p className="text-[10px] text-[#6B6B70] truncate">{book.author}</p>
                        </div>
                        <span className={`shrink-0 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${book.status === "Available" ? "bg-[#F5F3EF] text-[#22242A]" : "bg-[#F5F3EF] text-[#FF6B6B]"}`}>
                          {book.code} ({book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">বইয়ের নাম *</label>
                <input
                  type="text"
                  value={issueBookName}
                  onChange={(e) => setIssueBookName(e.target.value)}
                  placeholder="যেমন: লালসালু"
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">লেখক</label>
                  <input
                    type="text"
                    value={issueBookAuthor}
                    onChange={(e) => setIssueBookAuthor(e.target.value)}
                    placeholder="সৈয়দ ওয়ালীউল্লাহ"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">প্রকাশনী</label>
                  <input
                    type="text"
                    value={issueBookPublisher}
                    onChange={(e) => setIssueBookPublisher(e.target.value)}
                    placeholder="রেনেসাঁ পাবলিশার্স"
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 3. Date settings and submit */}
          <div className="glass-panel p-5 rounded-2xl border border-[#E5E5EA]">
            <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 mb-4 border-b border-[#E5E5EA] pb-2">
              <CalendarDays size={16} className="text-[#22242A]" />
              বই ফেরত দেওয়ার সময়সীমা নির্ধারণ (Time Offset & Return Date)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">ফেরত লিজ সময় কোটা দিন</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {["1", "2", "7", "10", "manual"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReturnOption(opt)}
                      className={`py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${returnOption === opt ? "bg-[#F5F3EF] text-white font-semibold ring-2 ring-[#E5E5EA]" : "bg-white border border-[#E5E5EA] text-[#22242A] hover:bg-[#F5F3EF]"}`}
                    >
                      {opt === "manual" ? "ম্যানুয়াল" : `${opt} দিন`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Date Input Picker */}
              {returnOption === "manual" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-120">
                  <label className="block text-[10px] uppercase font-bold text-[#FF6B6B] mb-1">ফেরত তারিখ সিলেক্ট করুন *</label>
                  <input
                    type="date"
                    value={manualReturnDate}
                    onChange={(e) => setManualReturnDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#E5E5EA] font-mono"
                    required
                  />
                </div>
              ) : (
                <div className="text-xs text-[#6B6B70] py-2">
                  ফেরত প্রদানের শেষ তারিখটি আজ থেকে হিসাব করে সিস্টেমের ডাটাবেইজে স্বয়ংক্রিয় শিডিউলে সংযুক্ত হবে।
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E5EA] mt-5 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={opLoading}
                className="w-full sm:w-auto px-8 py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl shadow-lg shadow-none cursor-pointer flex items-center justify-center gap-1.5"
              >
                {opLoading ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                লেনদেন সফল করুন ও বই ইস্যু করুন
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- FORM SUBTAB B: RETURN BOOK --- */}
      {activeSubTab === "return" && (
        <form onSubmit={handleReturnSubmit} className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-2">
            <CheckCircle2 size={18} className="text-[#22242A]" />
            বই লাইব্রেরিতে ফেরত গ্রহণ ও রিসেট প্যানেল
          </h3>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">বই কোড স্ক্যান অথবা কী-ইন করুন *</label>
            <input
              type="text"
              value={returnBookCode}
              onChange={(e) => setReturnBookCode(e.target.value)}
              placeholder="যেমন: BOK-103"
              className="w-full text-xs p-3 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">ফেরত গ্রহণের সময় মন্তব্য / ক্ষতির বিবরণী (ঐচ্ছিক)</label>
            <textarea
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="যেমন: প্রচ্ছদ বা পৃষ্ঠা ছেঁড়া নেই, ভালো অবস্থায় এসেছে"
              className="w-full text-xs p-3 h-24 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={opLoading}
              className="w-full py-3 bg-gradient-to-r bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-none flex items-center justify-center gap-1"
            >
              {opLoading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
              ফেরত নিশ্চিত ও তাকে জমা গ্রহণ করুন
            </button>
          </div>
        </form>
      )}

      {/* --- FORM SUBTAB C: TIME EXTENSION/REDUCTION --- */}
      {activeSubTab === "time" && (
        <form onSubmit={handleTimeSubmit} className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-2">
            <Clock size={18} className="text-[#FACC15]" />
            সময়সীমা প্রলম্বিত করা অথবা হ্রাসকরণ (Return Line Extend/Reduce)
          </h3>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">চলমান ইস্যুকৃত ধার স্লিপ সিলেক্ট করুন *</label>
            {activeIssues.length === 0 ? (
              <p className="text-xs text-[#22242A] py-3 block">বর্তমানে কোনো বই ধারকৃত বা Issued হিসেবে সচল নাই।</p>
            ) : (
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                required
              >
                <option value="">নির্ধারিত লিজ একাউন্ট নির্বাচন করুন...</option>
                {activeIssues.map(issue => (
                  <option key={issue.id} value={issue.id} className="bg-white">
                    {issue.bookName} ({issue.bookCode}) - {issue.memberName} (রিটার্ন তারিখ: {issue.returnDate})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">কোন একশনটি নিবেন?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeAction("Extend")}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer ${timeAction === "Extend" ? "bg-[#F5F3EF] text-white font-semibold shadow" : "bg-white border border-[#E5E5EA] text-[#22242A]"}`}
                >
                  সময় বাড়ান (+)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeAction("Reduce")}
                  className={`py-2 text-xs font-bold rounded-lg cursor-pointer ${timeAction === "Reduce" ? "bg-[#F5F3EF] text-white font-semibold shadow" : "bg-white border border-[#E5E5EA] text-[#22242A]"}`}
                >
                  সময় কমান (-)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">কত দিন পরিবর্তন করবেন? *</label>
              <input
                type="number"
                value={timeDays}
                onChange={(e) => setTimeDays(e.target.value)}
                min="1"
                max="60"
                className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={opLoading || activeIssues.length === 0}
              className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
            >
              {opLoading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
              সময় পরিবর্তন নিশ্চিত করুন
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
