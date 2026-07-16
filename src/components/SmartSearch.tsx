import React, { useState } from "react";
import { Search, MapPin, Phone, Calendar, Clock, MessageSquare, Eye, RefreshCw, Smartphone } from "lucide-react";
import { apiClient } from "../api";

interface SmartSearchResult {
  book: {
    id: string;
    code: string;
    name: string;
    author: string;
    publisher: string;
    imageUrl: string;
    status: "Available" | "Issued";
  };
  activeIssue: {
    id: string;
    bookCode: string;
    bookName: string;
    memberName: string;
    formNumber: string;
    mobile: string;
    address: string;
    issueDate: string;
    returnDate: string;
    status: "Issued" | "Returned";
    extensionHistory: Array<{ date: string; action: string; payload: string }>;
    comments: string[];
  } | null;
  history: any[];
}

interface SmartSearchProps {
  onPreviewTransaction: (record: any) => void;
}

export default function SmartSearch({ onPreviewTransaction }: SmartSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SmartSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setHasSearched(true);
    try {
      const res = await apiClient.get(`/books/search-smart?q=${encodeURIComponent(searchTerm.trim())}`);
      setResults(res);
    } catch (err: any) {
      setErrorMsg(err.message || "সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Banner */}
      <div>
        <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">৩. স্মার্ট বই ট্র্যাকিং ও বিস্তারিত অনুসন্ধান</h2>
        <p className="text-xs text-[#6B6B70]">বইয়ের নাম, বই কোড, নির্দিষ্ট লেখক বা প্রকাশনী দিয়ে সার্চ করলেই পাবেন বইটির বর্তমান অবস্থান ও গ্রাহক বিবরণী</p>
      </div>

      {/* Target Search Box Form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="বইয়ের নাম, বইয়ের কোড (যেমন: BOK-103) বা লেখকের নাম লিখে এন্টার চাপুন..."
            className="w-full text-xs pl-11 pr-4 py-3 bg-white rounded-xl border border-[#E5E5EA] text-[#22242A] placeholder:text-[#6B6B70] focus:outline-none focus:border-[#22242A] focus:ring-1 focus:ring-[#FACC15]/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl shadow-lg shadow-none cursor-pointer flex items-center gap-1 shrink-0 transition-opacity"
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          অনুসন্ধান
        </button>
      </form>

      {/* Error report */}
      {errorMsg && (
        <div className="p-4 bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA] rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <RefreshCw className="animate-spin text-[#22242A] mb-3" size={24} />
          <p className="text-xs text-[#6B6B70]">ডাটাবেইজ অনুসন্ধান করা হচ্ছে...</p>
        </div>
      )}

      {/* Output list section */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-[#6B6B70] text-sm">দুঃখিত, ওই তথ্য সম্পর্কিত কোনো নিবন্ধিত বই পাওয়া যায়নি। আবার ট্রাই করুন।</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-[#6B6B70]">মোট {results.length} টি সম্ভাব্য মিল পাওয়া গেছে:</p>

          <div className="space-y-4">
            {results.map((item) => {
              const { book, activeIssue } = item;
              return (
                <div
                  key={book.id}
                  className="glass-panel p-5 rounded-2xl border border-[#E5E5EA] flex flex-col md:flex-row gap-6 relative overflow-hidden"
                >
                  {/* Left Side: Cover, Title */}
                  <div className="w-full md:w-36 flex flex-col items-center gap-2 shrink-0">
                    <div className="w-full h-44 rounded-lg bg-white overflow-hidden border border-[#E5E5EA] flex items-center justify-center shadow-lg">
                      <img 
                        src={book.imageUrl && book.imageUrl.trim() ? book.imageUrl : "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"} 
                        alt={book.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-[#22242A] bg-[#F5F3EF] px-2.5 py-0.5 rounded border border-[#E5E5EA]">
                      {book.code}
                    </span>
                  </div>

                  {/* Right Side: details and conditions */}
                  <div className="flex-1 space-y-4">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5EA] pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#22242A]">{book.name}</h3>
                        <p className="text-xs text-[#6B6B70] mt-0.5">লেখক: {book.author} | প্রকাশনী: {book.publisher}</p>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${book.status === "Available" ? "bg-[#E5E5EA] text-[#22242A] border border-[#E5E5EA]" : "bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA]"}`}>
                          {book.status === "Available" ? "উপলব্ধ" : "ধারকৃত"}
                        </span>
                      </div>
                    </div>

                    {/* Rent Status Information Panel */}
                    {book.status === "Available" ? (
                      <div className="p-4 rounded-xl bg-[#E5E5EA]/20 border border-[#E5E5EA] flex items-center gap-3 text-[#22242A] text-xs">
                        <span className="w-2.5 h-2.5 bg-[#F5F3EF] rounded-full animate-pulse"></span>
                        <p>বইটি বর্তমানে লাইব্রেরিতে সংরক্ষণে রয়েছে। কোনো প্রকার বুকিং বা হোল্ড ছাড়া এই মুহূর্তে সরাসরি মেম্বারকে ইস্যু করা যাবে।</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeIssue ? (
                          <div className="bg-[#F5F3EF] rounded-xl p-4 border border-[#E5E5EA] space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#22242A]">
                              
                              {/* Borrower Profile */}
                              <div className="space-y-1">
                                <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider font-bold">গ্রাহক সদস্য:</p>
                                <p className="font-bold text-[#22242A] text-sm">{activeIssue.memberName}</p>
                                <p className="text-[10px] text-[#6B6B70]">ফরম আইডি: <strong className="font-mono text-[#22242A]">#{activeIssue.formNumber}</strong></p>
                              </div>

                              {/* Contacts */}
                              <div className="space-y-1">
                                <p className="text-[10px] text-[#6B6B70] uppercase tracking-wider font-bold">যোগাযোগের সূত্র:</p>
                                <p className="flex items-center gap-1.5 font-mono text-[#22242A]">
                                  <Phone size={12} className="text-[#22242A]" />
                                  {activeIssue.mobile}
                                </p>
                                <p className="flex items-center gap-1.5 text-[#6B6B70]">
                                  <MapPin size={12} className="text-[#22242A] shrink-0" />
                                  <span className="truncate">{activeIssue.address}</span>
                                </p>
                              </div>

                              {/* Dates row */}
                              <div className="space-y-1 md:col-span-2 border-t border-[#E5E5EA] pt-2 mt-1 grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-[10px] text-[#6B6B70] font-bold uppercase">ইস্যু করার তারিখ:</p>
                                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#22242A] font-mono">
                                    <Calendar size={13} />
                                    {activeIssue.issueDate}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[#6B6B70] font-bold uppercase">রিটার্ন প্রদানের ডেটলাইন:</p>
                                  <p className="flex items-center gap-1.5 text-sm font-bold text-[#FF6B6B] font-mono animate-pulse">
                                    <Clock size={13} />
                                    {activeIssue.returnDate}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Extension History tracking log */}
                            {activeIssue.extensionHistory && activeIssue.extensionHistory.length > 0 && (
                              <div className="border-t border-[#E5E5EA] pt-2 text-xs">
                                <p className="text-[#22242A] font-semibold text-[10px] uppercase mb-1">সময় পরিবর্তন ইতিহাস (Time Extensions):</p>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {activeIssue.extensionHistory.map((ext, idx) => (
                                    <p key={idx} className="text-[10px] text-[#6B6B70]">
                                      ● <b className="font-mono">{ext.date}</b> এ {ext.payload}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Comments tracking */}
                            {activeIssue.comments && activeIssue.comments.length > 0 && (
                              <div className="border-t border-[#E5E5EA] pt-2 text-xs">
                                <p className="text-[#22242A] font-semibold text-[10px] uppercase mb-1">অ্যাডমিন নোট / ক্ষতি বিবরণ:</p>
                                <div className="space-y-0.5 text-[10px] text-[#22242A]">
                                  {activeIssue.comments.map((comment, idx) => (
                                    <p key={idx} className="flex items-start gap-1">
                                      <MessageSquare size={10} className="mt-0.5 shrink-0 text-[#6B6B70]" />
                                      <span>{comment}</span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Slips downloads buttons */}
                            <div className="border-t border-[#E5E5EA] pt-2.5 flex justify-end gap-2">
                              <button
                                onClick={() => onPreviewTransaction(activeIssue)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22242A] hover:bg-[#2d2f36] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow shadow-none"
                              >
                                <Eye size={12} />
                                স্লিপ চোখের প্রাকদর্শন ও PDF
                              </button>
                            </div>

                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-[#F5F3EF] border border-[#E5E5EA] text-xs text-[#22242A]">
                            বইটি সুনির্দিষ্ট হিসাব অনুযায়ী ধার করা দেখায় কিন্তু কোনো সঠিক ইস্যু ফাইল খুঁজে পাওয়া যায়নি।
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
