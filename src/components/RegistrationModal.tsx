import React, { useState, useEffect } from "react";
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Heart, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  Copy, 
  Loader2,
  AlertCircle,
  Camera,
  Upload
} from "lucide-react";
import { apiClient } from "../api";

const getPaymentStyle = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("বিকাশ") || n.includes("bkash")) {
    return { 
      color: "border-pink-500/30 text-pink-400 bg-pink-950/10 hover:bg-pink-950/20", 
      activeColor: "border-pink-500 bg-pink-950/45 text-pink-300 ring-1 ring-pink-500/30" 
    };
  }
  if (n.includes("নগদ") || n.includes("nagad")) {
    return { 
      color: "border-orange-500/30 text-orange-400 bg-orange-950/10 hover:bg-orange-950/20", 
      activeColor: "border-orange-500 bg-orange-950/45 text-orange-300 ring-1 ring-orange-500/30" 
    };
  }
  if (n.includes("রকেট") || n.includes("rocket")) {
    return { 
      color: "border-purple-500/30 text-purple-400 bg-purple-950/10 hover:bg-purple-950/20", 
      activeColor: "border-purple-500 bg-purple-950/45 text-purple-300 ring-1 ring-purple-500/30" 
    };
  }
  return { 
    color: "border-cyan-500/20 text-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20", 
    activeColor: "border-cyan-400 bg-cyan-950/45 text-cyan-300 ring-1 ring-cyan-400/30" 
  };
};

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectLogin: (member: any) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ 
  isOpen, 
  onClose,
  onDirectLogin
}) => {
  // Form values
  const [name, setName] = useState("");
  const [nameEnglish, setNameEnglish] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  
  // Current Address
  const [currVillage, setCurrVillage] = useState("");
  const [currPostOffice, setCurrPostOffice] = useState("");
  const [currUpazila, setCurrUpazila] = useState("বড়লেখা");
  const [currDistrict, setCurrDistrict] = useState("মৌলভীবাজার");

  // Permanent Address
  const [permVillage, setPermVillage] = useState("");
  const [permPostOffice, setPermPostOffice] = useState("");
  const [permUpazila, setPermUpazila] = useState("বড়লেখা");
  const [permDistrict, setPermDistrict] = useState("মৌলভীবাজার");

  const [dob, setDob] = useState("");
  const [mobile, setMobile] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nidBirthReg, setNidBirthReg] = useState("");
  const [educationInstitution, setEducationInstitution] = useState("");
  const [className, setClassName] = useState("");
  const [classRoll, setClassRoll] = useState("");
  const [educationQualification, setEducationQualification] = useState("");
  const [profession, setProfession] = useState("");
  const [nationality, setNationality] = useState("বাংলাদেশী");
  const [photo, setPhoto] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);

  // Payment states (Option 1)
  const [paymentMethod, setPaymentMethod] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [dbPaymentMethods, setDbPaymentMethods] = useState<{ id: string; name: string; type: string; number: string; }[]>([]);

  useEffect(() => {
    const fetchDbPaymentMethods = async () => {
      try {
        const res = await apiClient.get("/public/payment-methods");
        if (res && res.success) {
          setDbPaymentMethods(res.paymentMethods || []);
        }
      } catch (err) {
        console.warn("Failed to fetch payment methods in registration:", err);
      }
    };
    if (isOpen) {
      fetchDbPaymentMethods();
    }
  }, [isOpen]);

  const [isSameAddress, setIsSameAddress] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredMember, setRegisteredMember] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);
    if (checked) {
      setPermVillage(currVillage);
      setPermPostOffice(currPostOffice);
      setPermUpazila(currUpazila);
      setPermDistrict(currDistrict);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.7);
          setPhoto(compressed);
        } else {
          setPhoto(event.target?.result as string);
        }
        setPhotoLoading(false);
      };
      img.onerror = () => {
        setPhotoLoading(false);
      };
    };
    reader.onerror = () => {
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("আবেদনকারীর নাম (বাংলায়) আবশ্যক।");
      setLoading(false);
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 11) {
      setError("সঠিক ১১-ডিজিটের মোবাইল নম্বরটি লিখুন।");
      setLoading(false);
      return;
    }
    if (!dob) {
      setError("জন্ম তারিখ প্রদান করা আবশ্যক।");
      setLoading(false);
      return;
    }
    if (!paymentMethod) {
      setError("১০০ টাকা মেম্বারশিপ ফি এর পেমেন্ট মাধ্যম সিলেক্ট করুন।");
      setLoading(false);
      return;
    }
    if (paymentMethod !== "অফলাইন কাউন্টার" && !senderNumber.trim()) {
      setError("টাকা পাঠানোর জন্য ব্যবহৃত মোবাইল নম্বরটি লিখুন।");
      setLoading(false);
      return;
    }
    if (paymentMethod !== "অফলাইন কাউন্টার" && !transactionId.trim()) {
      setError("টাকা পাঠানোর ট্রানজেকশন আইডি (TrxID) লিখুন।");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        nameEnglish,
        fatherName,
        motherName,
        currVillage,
        currPostOffice,
        currUpazila,
        currDistrict,
        permVillage: isSameAddress ? currVillage : permVillage,
        permPostOffice: isSameAddress ? currPostOffice : permPostOffice,
        permUpazila: isSameAddress ? currUpazila : permUpazila,
        permDistrict: isSameAddress ? currDistrict : permDistrict,
        dob,
        mobile,
        bloodGroup,
        nidBirthReg,
        educationInstitution,
        className,
        classRoll,
        educationQualification,
        profession,
        nationality,
        paymentMethod,
        senderNumber: paymentMethod === "অফলাইন কাউন্টার" ? "" : senderNumber,
        transactionId: paymentMethod === "অফলাইন কাউন্টার" ? "" : transactionId,
        photo
      };

      const res = await apiClient.post("/public/register", payload);
      if (res && res.success && res.member) {
        setRegisteredMember(res.member);
      } else {
        setError(res.error || "নিবন্ধন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      setError(err.message || "সার্ভার সংযোগে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFormNo = () => {
    if (registeredMember) {
      navigator.clipboard.writeText(registeredMember.formNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#070b13] border border-cyan-500/20 rounded-2xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">অক্ষর পাঠাগার - সদস্য অনলাইন নিবন্ধন ফর্ম</h3>
              <p className="text-[10px] text-slate-400">সকল তথ্য নির্ভুলভাবে বাংলায় পূরণ করার জন্য অনুরোধ করা হলো</p>
            </div>
          </div>
          {!registeredMember && (
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 font-sans">
          {error && (
            <div className="bg-red-950/40 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-300 flex items-center gap-2.5">
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {registeredMember ? (
            /* SUCCESS PANEL */
            <div className="text-center py-8 px-4 space-y-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white">নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  অভিনন্দন <span className="font-bold text-cyan-300">{registeredMember.name}</span>! অক্ষর পাঠাগারের সদস্য হিসেবে আপনার অনলাইন আবেদনটি ডাটাবেজে যুক্ত করা হয়েছে।
                </p>
              </div>

              {/* Unique ID Display */}
              <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-inner">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">আপনার মেম্বার ফরম নম্বর (লগইন আইডি)</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider font-mono">
                    {registeredMember.formNumber}
                  </span>
                  <button
                    onClick={handleCopyFormNo}
                    className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="কপি করুন"
                  >
                    {copied ? <span className="text-[10px] font-bold text-emerald-400">কপিড!</span> : <Copy size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-red-400 font-bold leading-relaxed">
                  ⚠️ লগইন করতে এবং লাইব্রেরিতে যাতায়াত করতে এই ফরম নম্বরটি অবশ্যই মনে রাখবেন বা স্ক্রিনশট দিয়ে রাখুন।
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onDirectLogin(registeredMember)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  সরাসরি সদস্য প্যানেলে প্রবেশ করুন
                </button>
              </div>
            </div>
          ) : (
            /* FORM PANEL */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: Personal Info */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-cyan-400 border-b border-cyan-500/10 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <User size={13} /> ব্যক্তিগত তথ্য (Personal Information)
                </h4>

                {/* PHOTO UPLOAD BLOCK */}
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {photo ? (
                      <img src={photo} alt="Member preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center gap-1">
                        <Camera size={20} />
                        <span className="text-[8px] font-bold">ছবি দিন</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <span className="text-[10px] font-bold text-slate-300 block">সদস্যের ছবি আপলোড করুন</span>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      লাইব্রেরি কার্ড ও সনদের জন্য আপনার পাসপোর্ট সাইজের ছবি দিন (ঐচ্ছিক)।
                    </p>
                    <div className="flex justify-center sm:justify-start gap-2">
                      <label className="px-3 py-1.5 bg-cyan-950 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-900/40 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors flex items-center gap-1">
                        <Upload size={12} />
                        {photoLoading ? "প্রসেস হচ্ছে..." : (photo ? "ছবি পরিবর্তন" : "ছবি বাছাই করুন")}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          disabled={photoLoading}
                        />
                      </label>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto("")}
                          className="px-2 py-1.5 bg-red-950/40 text-red-400 border border-red-500/15 hover:bg-red-900/30 rounded-lg text-[10px] font-extrabold transition-colors"
                        >
                          রিসেট
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">১. আবেদনকারীর পূর্ণ নাম (বাংলায়) *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: আরিফ উদ্দিন আহমেদ"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">২. আবেদনকারীর নাম (ইংরেজিতে)</label>
                    <input
                      type="text"
                      value={nameEnglish}
                      onChange={(e) => setNameEnglish(e.target.value)}
                      placeholder="e.g. Arif Uddin Ahmed"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">৩. পিতার নাম</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="পিতার পূর্ণ নাম"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">৪. মাতার নাম</label>
                    <input
                      type="text"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      placeholder="মাতার পূর্ণ নাম"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Address Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-cyan-400 border-b border-cyan-500/10 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={13} /> ঠিকানা (Address Details)
                </h4>

                {/* CURRENT ADDRESS */}
                <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-white/5">
                  <span className="text-[10px] font-black text-cyan-300">৫. বর্তমান ঠিকানা:</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">গ্রাম/মহল্লা:</label>
                      <input
                        type="text"
                        value={currVillage}
                        onChange={(e) => setCurrVillage(e.target.value)}
                        placeholder="যেমন: উত্তর বাঘ"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">ডাকঘর:</label>
                      <input
                        type="text"
                        value={currPostOffice}
                        onChange={(e) => setCurrPostOffice(e.target.value)}
                        placeholder="যেমন: বড়লেখা"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">উপজেলা:</label>
                      <input
                        type="text"
                        value={currUpazila}
                        onChange={(e) => setCurrUpazila(e.target.value)}
                        placeholder="যেমন: বড়লেখা"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">জেলা:</label>
                      <input
                        type="text"
                        value={currDistrict}
                        onChange={(e) => setCurrDistrict(e.target.value)}
                        placeholder="যেমন: মৌলভীবাজার"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                {/* SAME AS CHECKBOX */}
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={isSameAddress}
                    onChange={handleSameAddressChange}
                    className="w-4 h-4 bg-slate-950 rounded border-white/10 text-cyan-600 focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="sameAddress" className="text-[10px] text-slate-300 font-semibold cursor-pointer">
                    বর্তমান ঠিকানা ও স্থায়ী ঠিকানা একই
                  </label>
                </div>

                {/* PERMANENT ADDRESS */}
                {!isSameAddress && (
                  <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-white/5 animate-in slide-in-from-top-2 duration-155">
                    <span className="text-[10px] font-black text-cyan-300">৬. স্থায়ী ঠিকানা:</span>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">গ্রাম/মহল্লা:</label>
                        <input
                          type="text"
                          value={permVillage}
                          onChange={(e) => setPermVillage(e.target.value)}
                          placeholder="স্থায়ী গ্রাম"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">ডাকঘর:</label>
                        <input
                          type="text"
                          value={permPostOffice}
                          onChange={(e) => setPermPostOffice(e.target.value)}
                          placeholder="স্থায়ী ডাকঘর"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">উপজেলা:</label>
                        <input
                          type="text"
                          value={permUpazila}
                          onChange={(e) => setPermUpazila(e.target.value)}
                          placeholder="স্থায়ী উপজেলা"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400">জেলা:</label>
                        <input
                          type="text"
                          value={permDistrict}
                          onChange={(e) => setPermDistrict(e.target.value)}
                          placeholder="স্থায়ী জেলা"
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Identifiers & Birth */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-cyan-400 border-b border-cyan-500/10 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={13} /> জন্ম, মোবাইল ও পরিচয়পত্র (Identifiers)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">৭. জন্ম তারিখ *</label>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">৮. মোবাইল নম্বর *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="যেমন: ০১৭৭৫০৬৫৫০৯"
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">৯. রক্তের গ্রুপ</label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 cursor-pointer"
                    >
                      <option value="">বাছাই করুন</option>
                      <option value="A+">A+ (এ পজিটিভ)</option>
                      <option value="A-">A- (এ নেগেটিভ)</option>
                      <option value="B+">B+ (বি পজিটিভ)</option>
                      <option value="B-">B- (বি নেগেটিভ)</option>
                      <option value="AB+">AB+ (এবি পজিটিভ)</option>
                      <option value="AB-">AB- (এবি নেগেটিভ)</option>
                      <option value="O+">O+ (ও পজিটিভ)</option>
                      <option value="O-">O- (ও নেগেটিভ)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">১০. জাতীয় পরিচয়পত্র নং / জন্ম নিবন্ধন নং</label>
                    <input
                      type="text"
                      value={nidBirthReg}
                      onChange={(e) => setNidBirthReg(e.target.value)}
                      placeholder="NID বা জন্ম নিবন্ধন নম্বর"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Education & Profession */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black text-cyan-400 border-b border-cyan-500/10 pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap size={13} /> শিক্ষাগত যোগ্যতা ও পেশা (Qualifications)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">১১. শিক্ষাগত যোগ্যতা</label>
                    <input
                      type="text"
                      value={educationQualification}
                      onChange={(e) => setEducationQualification(e.target.value)}
                      placeholder="যেমন: এস.এস.সি / এইচ.এস.সি / স্নাতক"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">১২. পেশা</label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="যেমন: শিক্ষার্থী, শিক্ষক, চাকরিজীবি, ব্যবসায়ী"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-slate-400">শিক্ষার্থী হলে প্রতিষ্ঠান ও শ্রেণী বিবরণ (ঐচ্ছিক):</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-1.5 space-y-1">
                      <label className="text-[8px] font-bold text-slate-400">শিক্ষা প্রতিষ্ঠান নাম:</label>
                      <input
                        type="text"
                        value={educationInstitution}
                        onChange={(e) => setEducationInstitution(e.target.value)}
                        placeholder="যেমন: বড়লেখা সরকারি কলেজ"
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-[11px] focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="col-span-0.75 space-y-1">
                      <label className="text-[8px] font-bold text-slate-400">শ্রেণী:</label>
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="যেমন: দ্বাদশ"
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-[11px] focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="col-span-0.75 space-y-1">
                      <label className="text-[8px] font-bold text-slate-400">রোল:</label>
                      <input
                        type="text"
                        value={classRoll}
                        onChange={(e) => setClassRoll(e.target.value)}
                        placeholder="যেমন: ১৫"
                        className="w-full px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-[11px] focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">১৩. জাতীয়তা</label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="যেমন: বাংলাদেশী"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400/80"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Payment Details */}
              <div className="space-y-3.5 p-4 bg-slate-950/70 border border-cyan-500/10 rounded-2xl">
                <h4 className="text-xs font-black text-cyan-400 pb-1.5 uppercase tracking-wide flex items-center gap-1.5 border-b border-white/5">
                  💵 সদস্য ফি পেমেন্ট বিবরণ (Membership Fee)
                </h4>
                
                <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl space-y-1">
                  <p className="text-xs text-white font-bold">
                    পাঠাগারের সদস্য হতে হলে <span className="text-cyan-400 text-sm font-black">১০০ টাকা</span> সদস্য ফি পরিশোধ করা আবশ্যক।
                  </p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    নিচের যেকোনো মোবাইল ব্যাংকিং নাম্বারে ১০০ টাকা <span className="font-bold text-cyan-300">Send Money</span> বা <span className="font-bold text-cyan-300">Cash In</span> করুন এবং নিচের ফরমটি পূরণ করুন:
                  </p>
                  
                  {dbPaymentMethods.length === 0 ? (
                    <p className="text-[10px] text-amber-400 animate-pulse pt-1">পেমেন্ট মাধ্যমসমূহ লোড হচ্ছে...</p>
                  ) : (
                    <div className="pt-2 flex flex-wrap gap-3 text-[10px]">
                      {dbPaymentMethods.map((pm) => {
                        const isBkash = pm.name.toLowerCase().includes("বিকাশ") || pm.name.toLowerCase().includes("bkash");
                        const isNagad = pm.name.toLowerCase().includes("নগদ") || pm.name.toLowerCase().includes("nagad");
                        const isRocket = pm.name.toLowerCase().includes("রকেট") || pm.name.toLowerCase().includes("rocket");
                        const bgBorderClass = isBkash
                          ? "bg-pink-950/60 border-pink-500/20 text-pink-300"
                          : isNagad
                          ? "bg-orange-950/60 border-orange-500/20 text-orange-300"
                          : isRocket
                          ? "bg-purple-950/60 border-purple-500/20 text-purple-300"
                          : "bg-cyan-950/60 border-cyan-500/20 text-cyan-300";
                        return (
                          <span key={pm.id} className={`px-2.5 py-1 border font-bold rounded-lg font-sans ${bgBorderClass}`}>
                            {pm.name} ({pm.type}): <span className="font-mono text-white select-all">{pm.number}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-300">১৪. পেমেন্ট মাধ্যম (Payment Method) *</label>
                    {dbPaymentMethods.length === 0 ? (
                      <p className="text-[10px] text-slate-500">কোনো পেমেন্ট মাধ্যম পাওয়া যায়নি।</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {dbPaymentMethods.map((item) => {
                          const isSelected = paymentMethod === item.name;
                          const style = getPaymentStyle(item.name);
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(item.name);
                              }}
                              className={`px-3 py-2 text-center rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                                isSelected ? style.activeColor : style.color
                              }`}
                            >
                              {item.name} ({item.type})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {paymentMethod && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400">যে নম্বর থেকে টাকা পাঠিয়েছেন *</label>
                        <input
                          type="tel"
                          required
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="যেমন: ০১৭১২৩৪৫৬৭৮"
                          className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400">ট্রানজেকশন আইডি (TrxID) *</label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="যেমন: BK4291849X"
                          className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400 font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaration Statement */}
              <div className="p-3.5 bg-[#0a1420] border border-cyan-500/20 rounded-xl space-y-2">
                <span className="text-[11px] font-black text-cyan-400 flex items-center gap-1">
                  ✍️ অঙ্গীকার নামা ও সম্মতিপত্র
                </span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  আমি অঙ্গীকার করছি যে, উপরে উল্লিখিত সকল তথ্যাদি সত্য। আমি পাঠাগার এর সদস্য হতে ইচ্ছুক। সদস্য হলে আমি পাঠাগারের গঠনতন্ত্র ও সকল নিয়ম কানুন মেনে চলব।
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-900 border border-white/10 hover:bg-slate-850 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-cyan-950/20"
                >
                  {loading && <Loader2 className="animate-spin" size={13} />}
                  নিবন্ধন জমা দিন
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
