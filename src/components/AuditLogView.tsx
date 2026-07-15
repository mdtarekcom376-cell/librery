import React, { useState, useEffect } from "react";
import { Search, Eye, Trash2, Calendar, ClipboardList, Info, Trash, RefreshCw, Printer, AlertCircle } from "lucide-react";
import { AuditLog } from "../types";
import { apiClient } from "../api";

interface AuditLogViewProps {
  onPreviewSingleLog: (log: AuditLog) => void;
  onPreviewBulkHistory: (filteredLogs: AuditLog[]) => void;
  logsTrigger: number; // Trigger reload when other components write actions
}

export default function AuditLogView({ onPreviewSingleLog, onPreviewBulkHistory, logsTrigger }: AuditLogViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [logToDelete, setLogToDelete] = useState<{ id: string; date: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Build endpoints query
      let queryUrl = "/history";
      const params = [];
      if (searchVal.trim()) params.push(`q=${encodeURIComponent(searchVal.trim())}`);
      if (actionFilter) params.push(`action=${encodeURIComponent(actionFilter)}`);
      
      if (params.length > 0) {
        queryUrl += `?${params.join("&")}`;
      }

      const list = await apiClient.get(queryUrl);
      setLogs(list);
    } catch (err: any) {
      setErrorMsg(err.message || "ইতিহাস ডাটাবেজ সমার্থকরণ সম্ভব হয়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchVal, actionFilter, logsTrigger]);

  const handleDeleteLog = async (id: string) => {
    try {
      await apiClient.delete(`/history/${id}`);
      fetchLogs();
    } catch (err: any) {
      alert(err.message || "মুছে ফেলা সম্ভব হয়নি।");
    }
  };

  const handleClearAll = async () => {
    try {
      await apiClient.delete("/history");
      fetchLogs();
    } catch (err: any) {
      alert(err.message || "মুছে ফেলা অসম্ভব হয়েছে।");
    }
  };

  // Action options array matching the logs we trigger in database seeds and transactions
  const actionOptions = [
    { value: "", label: "সকল প্রকার পরিবর্তন" },
    { value: "বই যোগ", label: "বই যোগ" },
    { value: "বই সম্পাদনা", label: "বই সম্পাদনা" },
    { value: "বই মুছে ফেলা", label: "বই মুছে ফেলা" },
    { value: "বই ইস্যু", label: "বই ইস্যু" },
    { value: "বই ফেরত", label: "বই ফেরত" },
    { value: "সদস্য যোগ", label: "সদস্য যোগ" },
    { value: "সদস্য পরিবর্তন", label: "সদস্য পরিবর্তন" },
    { value: "সময় বাড়ানো", label: "সময় বৃদ্ধি" },
    { value: "সময় কমানো", label: "সময় হ্রাস" },
    { value: "নোট তৈরি", label: "নোট তৈরি" },
    { value: "নোট মুছে ফেলা", label: "নোট মুছে ফেলা" },
    { value: "ইতিহাস মুছে ফেলা", label: "ইতিহাস রিবুট" },
    { value: "SMS সতর্কতা রান", label: "SMS সিঙ্ক এলার্ট" },
    { value: "অ্যাডমিন পরিবর্তন", label: "অ্যাডমিন ক্রেডেনশিয়াল" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">৭. ইতিহাস ও অডিট ট্রেইল (Audit Logs)</h2>
          <p className="text-xs text-[#8E8E93]">লাইব্রেরি ম্যানেজমেন্ট সিস্টেমের প্রতিটি ঘটনার রিয়েল-টাইম লগ সংরক্ষণ ও নিরাপত্তা নিরীক্ষণ</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={logs.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA] hover:bg-[#F5F3EF] text-xs font-bold rounded-lg cursor-pointer disabled:opacity-40"
            title="সমস্ত অডিট ট্রেইল ইতিহাস মুছে ফেলুন"
          >
            <Trash size={14} />
            অডিট ট্রেইল রিবুট
          </button>
        </div>
      </div>

      {/* Query Search / Query Categorizer Filter bars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F5F3EF] p-4 rounded-xl border border-[#E5E5EA]">
        <div className="relative col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="বিবরণী বা অ্যাকশন লিখে সার্চ করুন..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
          />
        </div>
        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full text-xs px-3 py-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
          >
            {actionOptions.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#0f172a] text-xs">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Database log rows viewport */}
      {loading ? (
        <div className="py-24 text-center">
          <RefreshCw className="animate-spin text-[#22242A] mx-auto mb-2" size={24} />
          <p className="text-xs text-[#8E8E93]">ইতিহাস কন্টেনার লোড হচ্ছে...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className=" p-12 text-center rounded-2xl">
          <p className="text-[#8E8E93] text-sm">কোনো ইতিহাস ডাটা রেকর্ড পাওয়া যায়নি। উপরের অবজেক্ট পরিবর্তন ট্রিগার চেক করুন।</p>
        </div>
      ) : (
        <div className=" p-4 rounded-2xl border border-[#E5E5EA] overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs text-[#22242A] border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5EA] text-[#8E8E93] text-[10px] uppercase font-bold">
                  <th className="py-2 px-3">তারিখ ও সময় (সেকেন্ড সহ)</th>
                  <th className="py-2 px-3">অ্যাকশন ট্রিগার</th>
                  <th className="py-2 px-3">বিস্তারিত পরিবর্তন বিবরণী</th>
                  <th className="py-2 px-3 text-right">ম্যানেজমেন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F3EF] transition-all duration-100 group">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#22242A]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#8E8E93]" />
                        {log.timestamp}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[9px] bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#22242A] max-w-sm truncate text-xs" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => onPreviewSingleLog(log)}
                          className="p-1.5 hover:bg-white rounded text-[#22242A] cursor-pointer"
                          title="👁 এই একটি রেকর্ডের অডিট স্লিপ ও PDF প্রিন্ট"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => setLogToDelete({ id: log.id, date: log.timestamp })}
                          className="p-1.5 hover:bg-[#F5F3EF] rounded text-[#FF6B6B] hover:text-[#FF6B6B] cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: SINGLE LOG DELETE */}
      {logToDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-[#22242A] mb-2 flex items-center gap-2">
              <Trash2 className="text-[#FF6B6B] shrink-0" size={16} />
              অডিট লগ মুছে ফেলার নিশ্চিতকরণ
            </h3>
            
            <p className="text-xs text-[#22242A] mt-2">
              আপনি কি নিশ্চিতভাবেই <strong className="text-[#22242A]">{logToDelete.date}</strong> তারিখের এই পরিবর্তন লগটি সম্পূর্ণ মুছে ফেলতে চান?
            </p>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setLogToDelete(null)}
                className="px-3 py-1.5 bg-[#F5F3EF] border text-[#8E8E93] rounded-lg hover:bg-white text-[11px] font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = logToDelete.id;
                  setLogToDelete(null);
                  await handleDeleteLog(id);
                }}
                className="px-4 py-1.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-lg text-[11px] font-bold cursor-pointer"
              >
                হ্যাঁ, মুছুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET AUDIT HISTORY */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-[#FF6B6B] mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              ⚠️ অত্যন্ত স্পর্শকাতর সতর্কবার্তা!
            </h3>
            
            <p className="text-xs text-[#22242A] mt-2">
              আপনি কি নিশ্চিতভাবেই সমস্ত অডিট ইতিহাস ও লগসমূহ চিরতরে মুছে দিতে চান? এটি সম্পাদন করার পর আগের কোনো অডিট রেকর্ড আর পুনরুদ্ধার করা যাবে না।
            </p>

            <div className="flex justify-end gap-2.5 pt-4 mt-4 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 bg-[#F5F3EF] border text-[#8E8E93] rounded-lg hover:bg-white text-[11px] font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowClearConfirm(false);
                  await handleClearAll();
                }}
                className="px-4 py-1.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-lg text-[11px] font-bold cursor-pointer"
              >
                হ্যাঁ, সমস্ত অডিট রিবুট করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
