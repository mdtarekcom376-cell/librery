import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Calendar, 
  Phone, 
  Smartphone, 
  AlertTriangle, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  User, 
  SendHorizontal, 
  HelpCircle,
  Clock,
  Play,
  Square,
  Sparkles,
  ShieldAlert,
  ListFilter
} from "lucide-react";
import { apiClient } from "../api";
import { SMSAlert } from "../types";

interface SmsAlertsProps {
  onRefreshStats: () => void;
}

export default function SmsAlerts({ onRefreshStats }: SmsAlertsProps) {
  const [alerts, setAlerts] = useState<SMSAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Notification messages
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Instant Manual SMS States
  const [manualMobile, setManualMobile] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [sendSingleLoading, setSendSingleLoading] = useState(false);
  const [singleSuccessMsg, setSingleSuccessMsg] = useState("");
  const [singleErrorMsg, setSingleErrorMsg] = useState("");

  // Member search states for autofill
  const [searchMemberQuery, setSearchMemberQuery] = useState("");
  const [memberSuggestions, setMemberSuggestions] = useState<any[]>([]);
  const [showMemberSug, setShowMemberSug] = useState(false);

  // --- SPECIAL OVERRIDE & INSTANT SIMULATOR STATES ---
  const [simulatedDate, setSimulatedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [bypassRules, setBypassRules] = useState(false);
  const [testInterval, setTestInterval] = useState<number | null>(null); // null, 60 (1 Min), 120 (2 Mins), 300 (5 Mins)
  const [countdown, setCountdown] = useState<number>(0);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);

  // Logger helper
  const addLiveLog = (text: string) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    setLiveLogs(prev => [`[${timeStr}] ${text}`, ...prev.slice(0, 14)]);
  };

  const openWhatsApp = (mobile: string, msg: string) => {
    let cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
      cleanMobile = "88" + cleanMobile;
    }
    const encoded = encodeURIComponent(msg);
    const url = `https://api.whatsapp.com/send?phone=${cleanMobile}&text=${encoded}`;
    window.open(url, "_blank");
    addLiveLog(`ফ্রি WhatsApp রিমাইন্ডার উইন্ডো ওপেন হয়েছে নম্বর: ${cleanMobile}`);
  };

  const openSmsApp = (mobile: string, msg: string) => {
    let cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length === 11 && cleanMobile.startsWith("0")) {
      cleanMobile = "88" + cleanMobile;
    }
    const encoded = encodeURIComponent(msg);
    const url = `sms:${cleanMobile}?body=${encoded}`;
    window.open(url, "_self");
    addLiveLog(`ফ্রি অফলাইন ডিভাইস SMS রিমাইন্ডার ওপেন হয়েছে নম্বর: ${cleanMobile}`);
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const list = await apiClient.get(`/sms/scheduled?todayStr=${simulatedDate}&bypassRules=${bypassRules}`);
      setAlerts(list);
    } catch (err: any) {
      setErrorMsg(err.message || "SMS শিডিউলার স্লট লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when simulation parameters change
  useEffect(() => {
    fetchAlerts();
  }, [simulatedDate, bypassRules]);

  // Search members from autofill effect
  useEffect(() => {
    if (!searchMemberQuery) {
      setMemberSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const matches = await apiClient.get(`/members/suggest?q=${encodeURIComponent(searchMemberQuery)}`);
        setMemberSuggestions(matches);
      } catch (err) {}
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchMemberQuery]);

  const handleSelectMember = (mem: any) => {
    setManualMobile(mem.mobile);
    setSearchMemberQuery(mem.name);
    setShowMemberSug(false);
    setManualMessage(`আসসালামু আলাইকুম ${mem.name}, অক্ষর পাঠাগার থেকে কাস্টম রিমাইন্ডার মেসেজ পাঠানো হলো।`);
    addLiveLog(`সদস্য ${mem.name} সিলেক্ট করা হয়েছে। মোবাইল: ${mem.mobile}`);
  };

  // Manual Trigger Run
  const handleManualSync = async () => {
    setSyncLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    addLiveLog(`শিডিউল রান ট্রিগার করা হচ্ছে... (তারিখ: ${simulatedDate}, বাইপাস রুল: ${bypassRules ? "হ্যাঁ" : "না"})`);
    
    try {
      const res = await apiClient.post(`/sms/trigger?todayStr=${simulatedDate}&bypassRules=${bypassRules}`, {});
      setSuccessMsg(res.message || "শিডিউল সফলভাবে রান হয়েছে। ওভারডিউ সতর্কতা SMS গ্রাহক মোবাইলে প্রস্তুত!");
      fetchAlerts();
      onRefreshStats();
      addLiveLog(`ফলাফল: ${res.message || "SMS সফলভাবে প্রস্তুত / পাঠানো হয়েছে"}`);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || "শিডিউল সিঙ্ক ব্যর্থ হয়েছে।");
      addLiveLog(`ব্যর্থতা: ${err.message || "সার্ভার এরর"}`);
    } finally {
      setSyncLoading(false);
    }
  };

  // Auto test interval hook (every 1 or 2 minutes as requested!)
  useEffect(() => {
    if (!testInterval) {
      setCountdown(0);
      return;
    }

    setCountdown(testInterval);
    addLiveLog(`অটো-লুপ সক্রিয় করা হয়েছে। প্রতি ${testInterval / 60} মিনিট অন্তর অটো-চেক রান হবে।`);

    const intervalId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Trigger the check right now in background
          (async () => {
            addLiveLog(`স্বয়ংক্রিয় ব্যাকগ্রাউন্ড চেক চালু হয়েছে...`);
            try {
              const res = await apiClient.post(`/sms/trigger?todayStr=${simulatedDate}&bypassRules=${bypassRules}`, {});
              addLiveLog(`অটো-লুপ সফল: ${res.message}`);
              fetchAlerts();
              onRefreshStats();
            } catch (err: any) {
              addLiveLog(`অটো-লুপ ব্যর্থ: ${err.message || "সংযোগ ত্রুটি"}`);
            }
          })();
          return testInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [testInterval, simulatedDate, bypassRules]);

  const handleSendSingleSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSingleErrorMsg("");
    setSingleSuccessMsg("");

    if (!manualMobile || !manualMessage) {
      setSingleErrorMsg("মোবাইল নম্বর এবং বার্তা বিবরণ দেওয়া আবশ্যক।");
      return;
    }

    setSendSingleLoading(true);
    addLiveLog(`একক SMS পাঠানো হচ্ছে নম্বর: ${manualMobile}`);
    try {
      const res = await apiClient.post("/sms/send-single", {
        mobile: manualMobile.trim(),
        message: manualMessage.trim()
      });
      if (res.success) {
        setSingleSuccessMsg(res.message || "SMS সফলভাবে পাঠানো হয়েছে!");
        addLiveLog(`একক SMS সফল: ${res.message}`);
        setManualMobile("");
        setSearchMemberQuery("");
        setManualMessage("");
        setTimeout(() => setSingleSuccessMsg(""), 6000);
      } else {
        setSingleErrorMsg(res.message || "SMS পাঠানো ব্যর্থ হয়েছে।");
        addLiveLog(`একক SMS ব্যর্থ: ${res.message}`);
      }
    } catch (err: any) {
      setSingleErrorMsg(err.message || "SMS পাঠাতে গিয়ে সার্ভার এরর হয়েছে।");
      addLiveLog(`একক SMS ত্রুটি: ${err.message}`);
    } finally {
      setSendSingleLoading(false);
    }
  };

  // Quick reset for date simulation to current standard date
  const resetSimulatedDate = () => {
    const today = new Date().toISOString().split("T")[0];
    setSimulatedDate(today);
    addLiveLog(`সিমুলেশন তারিখ আজকের দিনে (${today}) রিসেট করা হয়েছে।`);
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">
            <Smartphone className="text-[#22242A]" size={24} />
            ৮. অটোমেটেড SMS কন্ট্রোল প্যানেল
          </h2>
          <p className="text-xs text-[#8E8E93]">মেয়াদোত্তীর্ণ বই জমা নেওয়ার জন্য শিডিউলড SMS অ্যালার্ট, ২ মিনিটের লাইভ লুপ ও টেস্ট টুলস</p>
        </div>
        
        <button
          onClick={handleManualSync}
          disabled={syncLoading}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white rounded-xl text-xs font-bold shadow-lg shadow-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55 active:scale-[0.98]"
        >
          {syncLoading ? (
            <RefreshCw className="animate-spin" size={14} />
          ) : (
            <Send size={14} />
          )}
          ম্যানুয়াল ক্রন শিডিউল রান করুন
        </button>
      </div>

      {/* SPECIAL INTERACTIVE TEST LOOP & DATE OVERRIDE CONSOLE */}
      <div className="p-5 rounded-2xl bg-[#090d16] border border-[#E5E5EA] shadow-xl space-y-4">
        
        {/* Banner with Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E5EA] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#F5F3EF] text-[#22242A] animate-pulse">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#22242A]">তাত্ক্ষণিক ১২০ সেকেন্ড টেস্ট ও সময় সিমুলেটর প্যানেল</h3>
              <p className="text-[10px] text-[#22242A] font-medium">১ বা ২ মিনিট পর পর স্বয়ংক্রিয়ভাবে রিমাইন্ডার টেস্ট ও গেটওয়ে চেক করার গেজেট</p>
            </div>
          </div>
          
          {testInterval ? (
            <span className="px-2.5 py-1 rounded-full bg-[#E5E5EA] text-[#22242A] border border-[#E5E5EA] text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
              <Clock className="animate-spin" size={12} />
              ক্রন সক্রিয়: {countdown} সে. বাকি
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-white text-[#8E8E93] border border-[#E5E5EA] text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
              <Clock size={12} />
              অটো-লুপ বন্ধ আছে
            </span>
          )}
        </div>

        {/* Input parameters panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Simulated Date Override */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#22242A] uppercase tracking-wide flex items-center gap-1">
              <Calendar size={12} className="text-[#22242A]" />
              আজকের তারিখ সিমুলেশন
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={simulatedDate}
                onChange={(e) => {
                  setSimulatedDate(e.target.value);
                  addLiveLog(`সিমুলেটেড আজকের তারিখ করা হয়েছে: ${e.target.value}`);
                }}
                className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] outline-none focus:border-[#22242A]"
              />
              <button
                type="button"
                onClick={resetSimulatedDate}
                className="px-2.5 py-2 bg-white border border-[#E5E5EA] text-[10px] text-[#8E8E93] hover:text-[#22242A] rounded-xl active:scale-95"
                title="আজকের তারিখ রিসেট"
              >
                রিসেট
              </button>
            </div>
          </div>

          {/* Overdue Rules Override */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#22242A] uppercase tracking-wide flex items-center gap-1">
              <ShieldAlert size={12} className="text-[#22242A]" />
              মেয়াদোত্তীর্ণ রুল ওভাররাইড (Bypass)
            </label>
            <button
              type="button"
              onClick={() => {
                setBypassRules(!bypassRules);
                addLiveLog(`নিয়মাবলী বাইপাস করা হয়েছে: ${!bypassRules ? "সক্রিয় (সবাইকে রিমাইন্ডার)" : "নিষ্ক্রিয় (শুধুমাত্র নিয়ম অনুযায়ী)"}`);
              }}
              className={`w-full text-xs p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                bypassRules 
                  ? "bg-[#F5F3EF] border-[#E5E5EA] text-[#22242A] shadow-md shadow-pink-500/5 animate-pulse" 
                  : "bg-white border-[#E5E5EA] text-[#8E8E93]"
              }`}
            >
              <ListFilter size={13} />
              {bypassRules ? "সক্রিয়: সবাইকে SMS পাঠান" : "নিষ্ক্রিয়: শুধু ওভারডিউ"}
            </button>
          </div>

          {/* Setup Automated Live Repeat Interval */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-[#22242A] uppercase tracking-wide flex items-center gap-1">
              <RefreshCw size={12} className="text-[#22242A]" />
              অটো-লুপ পিরিওডিক রান (Interval)
            </label>
            <select
              value={testInterval || ""}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                setTestInterval(val);
                if (!val) {
                  addLiveLog("১/২ মিনিটের স্বয়ংক্রিয় লাইভ টেস্ট লুপ নিষ্ক্রিয় করা হয়েছে।");
                }
              }}
              className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] outline-none focus:border-[#22242A] cursor-pointer text-[#22242A]"
            >
              <option value="">অটো-লুপ বন্ধ (Manual)</option>
              <option value="60">প্রতি ১ মিনিট পর পর (৬০ সেকেন্ড)</option>
              <option value="120">প্রতি ২ মিনিট পর পর (১২০ সেকেন্ড - টেস্ট)</option>
              <option value="300">প্রতি ৫ মিনিট পর পর (৩০০ সেকেন্ড)</option>
            </select>
          </div>

          {/* Quick Simulated Dispatch action button */}
          <div>
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncLoading}
              className="w-full py-2.5 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-[#00f0ff] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Play size={13} />
              এখনই টেস্ট SMS পাঠান
            </button>
          </div>

        </div>

        {/* Live debug logs output box */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-[#8E8E93] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#F5F3EF] rounded-full animate-ping"></span>
              লাইভ টেস্ট ও অ্যাকশন লগ (Sandbox Logs)
            </span>
            <button
              onClick={() => {
                setLiveLogs([]);
                addLiveLog("লগ ক্লিয়ার করা হয়েছে।");
              }}
              className="text-[9px] text-[#00f0ff] hover:underline"
            >
              ক্লিয়ার লগস
            </button>
          </div>
          <div className="bg-[#04060b] p-3 rounded-xl border border-[#E5E5EA] max-h-36 overflow-y-auto font-mono text-[9px] text-[#22242A] space-y-1 text-left">
            {liveLogs.length === 0 ? (
              <p className="text-[#8E8E93] italic">সিমুলেশন বা টেস্ট রান করলে এখানে তাৎক্ষণিক লগ রিপোর্ট দেখা যাবে।</p>
            ) : (
              liveLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-[#22242A] shrink-0 font-bold">&gt;&gt;</span>
                  <span className="leading-normal">{log}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Schedule Check list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rules card banner */}
          <div className="p-4 rounded-2xl bg-[#F5F3EF] border border-[#E5E5EA] flex items-start gap-3 text-[#22242A] text-xs sm:text-sm">
            <Smartphone size={20} className="text-[#22242A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#22242A]">স্বয়ংক্রিয় SMS সতর্কীকরণের নিয়মাবলী:</p>
              <ul className="list-disc pl-4 space-y-1 text-[#8E8E93] text-xs">
                <li>বই ফেরত দেওয়ার নির্ধারিত দিন (Return Date) <b>দুপুর ২:০০ টায়</b> স্বয়ংক্রিয়ভাবে প্রথম SMS সচল হবে।</li>
                <li>যদি বই ফেরত না আসে, তবে প্রতি <b>২ দিন পর পর দুপুর ২:০০ টায়</b> এই সতর্কতা পাঠাগারে জমা নেওয়া পর্যন্ত চলতে থাকবে।</li>
                <li>সময় বাড়ানো (Extend Time) হলে পূর্ববর্তী লুপটি বাতিল হয়ে নতুন Return Date হিসেবে অ্যালার্টটি রিক্যালকুলেট হবে।</li>
                <li>আমাদের পাঠাগার হেল্পলাইন কন্টাক্ট নম্বর: <strong className="text-[#22242A]">01333474848</strong></li>
              </ul>
            </div>
          </div>

          {/* Output notifications */}
          {successMsg && (
            <div className="bg-[#E5E5EA]/40 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-2 animate-in slide-in-from-top-2 duration-150">
              <CheckCircle2 size={15} className="text-[#22242A]" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2">
              <AlertTriangle size={15} className="text-[#FF6B6B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* List content table panel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-[#22242A] uppercase tracking-wider">
                শিডিউল অ্যালার্ট উইন্ডো ({alerts.length}টি লাইভ পাওয়া গেছে)
              </h3>
              <p className="text-[10px] text-[#8E8E93]">
                তারিখ সিলেক্ট করে তালিকা পরিবর্তন করুন
              </p>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#8E8E93]">অ্যালার্টসমূহ লোড করা হচ্ছে...</div>
            ) : alerts.length === 0 ? (
              <div className=" p-10 text-center rounded-2xl">
                <p className="text-[#8E8E93] text-sm">বর্তমানে কোনো বই সচল বা মেয়াদোত্তীর্ণ ঋণ অবস্থায় নাই। সচল ইস্যু করার প্যানেল চেক করুন অথবা date simulation পরিবর্তন করুন বা Rule Bypass অন করুন।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className=" p-4 rounded-2xl border border-[#E5E5EA] flex flex-col justify-between hover:border-[#E5E5EA] transition-all duration-150 bg-white"
                  >
                    <div className="space-y-3">
                      
                      {/* Book & borrower row */}
                      <div className="flex justify-between items-start gap-1">
                        <div className="min-w-0">
                          <h4 className="font-bold text-[#22242A] text-xs sm:text-sm truncate">{al.bookName}</h4>
                          <p className="text-[10px] text-[#8E8E93]">গ্রাহক: {al.memberName}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${al.status === "Sent" ? "bg-[#E5E5EA] text-[#22242A]" : "bg-[#F5F3EF] text-[#22242A]"}`}>
                          {al.status === "Sent" ? "Dispatched / Sent" : "Scheduled"}
                        </span>
                      </div>

                      {/* Receiver and schedule info */}
                      <div className="grid grid-cols-2 gap-y-1 text-[10px] text-[#8E8E93] border-t border-b border-[#E5E5EA] py-2">
                        <div>রিসিভার নম্বর: <span className="font-mono text-[#22242A] font-semibold">{al.mobile}</span></div>
                        <div>রিটার্ন শেষ দিন: <span className="font-mono text-[#22242A] font-bold">{al.returnDate}</span></div>
                        <div className="col-span-2 mt-1">
                          শিডিউল সূত্র: <span className="text-[#22242A] font-semibold">{al.triggerTime}</span>
                        </div>
                      </div>

                      {/* SMS content body */}
                      <div className="bg-[#F5F3EF] p-3 rounded-lg text-[#22242A] font-sans text-xs relative max-h-24 overflow-y-auto">
                        <p className="text-[9px] text-[#8E8E93] uppercase font-bold mb-1 flex items-center gap-1">
                          <MessageSquare size={10} />
                          মো바일 SMS বার্তা বিবরণী
                        </p>
                        <p className="text-[10px] leading-relaxed">{al.alertText}</p>
                      </div>

                      {/* FREE UNLIMITED DISPATCH CHANNELS */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5EA]">
                        <button
                          type="button"
                          onClick={() => openWhatsApp(al.mobile, al.alertText)}
                          className="py-1.5 px-2 bg-[#E5E5EA]/40 hover:bg-[#F5F3EF] border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#22242A] rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <svg className="w-3 h-3 text-[#22242A]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.1 1.4 4.8 1.4 5.4 0 9.8-4.4 9.8-9.8 0-2.6-1-5-2.9-6.8a9.6 9.6 0 00-6.9-2.9c-5.4 0-9.8 4.4-9.8 9.8 0 1.9.5 3.7 1.5 5.3l-.9 3.5 3.5-.9zM17.5 14.9c-.3-.2-1.7-1-2-1.1-.3-.1-.5-.2-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1l-2.6-1.1c-2-1.8-3.3-3.9-3.7-4.6-.4-.7-.1-1 .2-1.3l.6-.7c.2-.2.3-.4.4-.6.1-.2 0-.4-.1-.5-.1-.2-.7-1.8-1-2.5-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4s-1.3 1.3-1.3 3.1c0 1.8 1.3 3.5 1.5 3.7.2.2 2.5 3.8 6 5.3.8.3 1.5.6 2 .7.9.3 1.7.2 2.3.1.7-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
                          </svg>
                          WhatsApp (ফ্রি)
                        </button>
                        <button
                          type="button"
                          onClick={() => openSmsApp(al.mobile, al.alertText)}
                          className="py-1.5 px-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#22242A] rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <Smartphone size={10} className="text-[#22242A]" />
                          মোবাইল SMS (ফ্রি)
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Direct Manual SMS Form */}
        <div className=" p-5 rounded-2xl border border-[#E5E5EA] space-y-4">
          <div className="border-b border-[#E5E5EA] pb-2">
            <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5 uppercase tracking-wider">
              <SendHorizontal className="text-[#22242A]" size={15} />
              ম্যানুয়াল কাস্টম SMS পাঠান
            </h3>
            <p className="text-[10px] text-[#8E8E93] mt-1 leading-snug">
              সদস্যকে সরাসরি যেকোনো কাস্টম মেসেজ বা টেস্ট SMS পাঠাতে এই প্যানেলটি ব্যবহার করুন।
            </p>
          </div>

          {singleSuccessMsg && (
            <div className="p-3 bg-[#E5E5EA]/40 border border-[#E5E5EA] rounded-xl text-[10px] text-[#22242A] flex items-start gap-2 animate-in fade-in duration-120">
              <CheckCircle2 size={13} className="text-[#22242A] shrink-0 mt-0.5" />
              <span>{singleSuccessMsg}</span>
            </div>
          )}

          {singleErrorMsg && (
            <div className="p-3 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[10px] text-[#FF6B6B] flex items-start gap-2 animate-in fade-in duration-120">
              <AlertTriangle size={13} className="text-[#FF6B6B] shrink-0 mt-0.5" />
              <span>{singleErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSendSingleSMS} className="space-y-4 text-xs font-sans">
            {/* Auto-suggest Search Box */}
            <div className="relative">
              <label className="block text-[9px] uppercase font-bold text-[#8E8E93] mb-1">সদস্য খুঁজুন (ঐচ্ছিক অটোফিলের জন্য)</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchMemberQuery}
                  onChange={(e) => {
                    setSearchMemberQuery(e.target.value);
                    setShowMemberSug(true);
                  }}
                  onFocus={() => setShowMemberSug(true)}
                  placeholder="নাম লিখে খুঁজুন..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] placeholder:text-slate-600 focus:outline-none focus:border-[#22242A]"
                />
                <User size={13} className="absolute right-3 top-3 text-slate-600" />
              </div>

              {showMemberSug && memberSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5EA] rounded-lg max-h-40 overflow-y-auto shadow-2xl z-20 divide-y divide-purple-500/5">
                  {memberSuggestions.map(mem => (
                    <div
                      key={mem.formNumber}
                      onClick={() => handleSelectMember(mem)}
                      className="p-2 hover:bg-[#F5F3EF] text-[11px] text-[#22242A] cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-[#22242A]">{mem.name}</p>
                        <p className="text-[9px] text-[#8E8E93] font-mono">মোবাইল: {mem.mobile}</p>
                      </div>
                      <span className="text-[9px] bg-[#F5F3EF] px-1.5 py-0.5 rounded text-[#22242A] font-bold shrink-0">
                        #{mem.formNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Mobile Number */}
            <div>
              <label className="block text-[9px] uppercase font-bold text-[#8E8E93] mb-1">মোবাইল নম্বর *</label>
              <input
                type="text"
                value={manualMobile}
                onChange={(e) => setManualMobile(e.target.value)}
                placeholder="যেমন: 01712xxxxxx"
                className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono font-semibold"
                required
              />
            </div>

            {/* Custom Message */}
            <div>
              <label className="block text-[9px] uppercase font-bold text-[#8E8E93] mb-1">বার্তার বিবরণী (Message Body) *</label>
              <textarea
                value={manualMessage}
                onChange={(e) => setManualMessage(e.target.value)}
                placeholder="আপনার বার্তাটি বাংলায় লিখুন..."
                rows={4}
                className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] leading-relaxed font-sans"
                required
              />
            </div>

            {/* Guide message */}
            <div className="p-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[9px] text-[#8E8E93] space-y-1">
              <span className="font-bold text-[#22242A] flex items-center gap-1">
                <HelpCircle size={10} />
                ফ্রি বনাম গেটওয়ে অপশন গাইড:
              </span>
              <p className="leading-relaxed">
                বাংলাদেশী টেলিকমে SMS পাঠানোর জন্য খরচ চার্জ করা হয়ে থাকে। তাই আপনি যদি গেটওয়ে API কিনতে না চান, তবে নিচের <strong>"ফ্রি WhatsApp"</strong> বা <strong>"ফ্রি মোবাইল SMS"</strong> বাটন দুটি ব্যবহার করে সম্পুর্ণ ফ্রিতে ডিভাইস দিয়ে সাথে সাথে রিয়েল মেসেজ পাঠাতে পারবেন! আর গেটওয়ে এপিআই থাকলে নিচে <strong>"অফিশিয়াল SMS"</strong> বাটন দিয়ে পাঠাতে পারেন।
              </p>
            </div>

            {/* Direct Free Dispatch Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openWhatsApp(manualMobile, manualMessage)}
                disabled={!manualMobile || !manualMessage}
                className="py-2.5 bg-[#E5E5EA] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-[10px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                title="আপনার ব্রাউজার বা মোবাইল থেকে সরাসরি সম্পূর্ণ ফ্রি আনলিমিটেড হোয়াটসঅ্যাপ বার্তা পাঠান।"
              >
                <svg className="w-3.5 h-3.5 text-[#22242A]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.1 1.4 4.8 1.4 5.4 0 9.8-4.4 9.8-9.8 0-2.6-1-5-2.9-6.8a9.6 9.6 0 00-6.9-2.9c-5.4 0-9.8 4.4-9.8 9.8 0 1.9.5 3.7 1.5 5.3l-.9 3.5 3.5-.9zM17.5 14.9c-.3-.2-1.7-1-2-1.1-.3-.1-.5-.2-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1l-2.6-1.1c-2-1.8-3.3-3.9-3.7-4.6-.4-.7-.1-1 .2-1.3l.6-.7c.2-.2.3-.4.4-.6.1-.2 0-.4-.1-.5-.1-.2-.7-1.8-1-2.5-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4s-1.3 1.3-1.3 3.1c0 1.8 1.3 3.5 1.5 3.7.2.2 2.5 3.8 6 5.3.8.3 1.5.6 2 .7.9.3 1.7.2 2.3.1.7-.1 1.7-.7 1.9-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
                </svg>
                WhatsApp (ফ্রি)
              </button>

              <button
                type="button"
                onClick={() => openSmsApp(manualMobile, manualMessage)}
                disabled={!manualMobile || !manualMessage}
                className="py-2.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-[10px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                title="আপনার মোবাইল ফোনের সিম ব্যবহার করে ফ্রি রিমাইন্ডার মেসেজ ওপেন করুন।"
              >
                <Smartphone size={13} className="text-[#22242A]" />
                মোবাইল SMS (ফ্রি)
              </button>
            </div>

            {/* Official Gateway Submit btn */}
            <button
              type="submit"
              disabled={sendSingleLoading}
              className="w-full py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-55 cursor-pointer active:scale-[0.98] text-[11px]"
            >
              {sendSingleLoading ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              গেটওয়ে API দিয়ে অফিশিয়াল SMS পাঠান
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
