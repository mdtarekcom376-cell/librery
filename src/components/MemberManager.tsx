import React, { useState, useEffect } from "react";
import { UserPlus, Search, Phone, MapPin, ClipboardList, BookOpen, Clock, CheckCircle2, Eye, RefreshCw, AlertCircle, Trash2, AlertTriangle, Database, Check, Camera, Upload } from "lucide-react";
import { Member } from "../types";
import { apiClient } from "../api";

interface MemberManagerProps {
  onRefreshStats: () => void;
  onPreviewMemberSlip: (profileData: any) => void;
  onPreviewMembersList?: (members: Member[]) => void;
}

export default function MemberManager({ onRefreshStats, onPreviewMemberSlip, onPreviewMembersList }: MemberManagerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Pending" | "Paid" | "Unpaid">("all");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Adding single Member states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addForm, setAddForm] = useState("");
  const [addMobile, setAddMobile] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addDob, setAddDob] = useState("");
  const [addInstitution, setAddInstitution] = useState("");
  const [addClassName, setAddClassName] = useState("");
  const [addClassRoll, setAddClassRoll] = useState("");

  const [addNameEnglish, setAddNameEnglish] = useState("");
  const [addFatherName, setAddFatherName] = useState("");
  const [addMotherName, setAddMotherName] = useState("");
  const [addCurrVillage, setAddCurrVillage] = useState("");
  const [addCurrPostOffice, setAddCurrPostOffice] = useState("");
  const [addCurrUpazila, setAddCurrUpazila] = useState("বড়লেখা");
  const [addCurrDistrict, setAddCurrDistrict] = useState("মৌলভীবাজার");
  const [addPermVillage, setAddPermVillage] = useState("");
  const [addPermPostOffice, setAddPermPostOffice] = useState("");
  const [addPermUpazila, setAddPermUpazila] = useState("বড়লেখা");
  const [addPermDistrict, setAddPermDistrict] = useState("মৌলভীবাজার");
  const [addIsSameAddress, setAddIsSameAddress] = useState(false);
  const [addBloodGroup, setAddBloodGroup] = useState("");
  const [addNidBirthReg, setAddNidBirthReg] = useState("");
  const [addEducationQualification, setAddEducationQualification] = useState("");
  const [addProfession, setAddProfession] = useState("");
  const [addNationality, setAddNationality] = useState("বাংলাদেশী");
  const [addPhoto, setAddPhoto] = useState("");
  const [addPhotoLoading, setAddPhotoLoading] = useState(false);
  const [addForceRequired, setAddForceRequired] = useState(false); // Bottom option switch for validation

  const [formErr, setFormErr] = useState("");

  // Active highlighted member profile details
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load members on mount
  const fetchMembers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiClient.get("/members");
      setMembers(data);
      if (data.length > 0 && !activeProfile) {
        // Auto-select first member's profile for beautiful UX
        fetchProfile(data[0].formNumber);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "মেম্বার তালিকা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();


  }, []);


  const fetchProfile = async (formNum: string) => {
    setProfileLoading(true);
    try {
      const profile = await apiClient.get(`/members/${formNum}/profile`);
      setActiveProfile(profile);
    } catch (err: any) {
      if (err?.message && (err.message.includes("সেশন") || err.message.includes("মেয়াদ") || err.message.includes("অননুমোদিত"))) {
        console.log("সদস্য প্রোফাইল লোড করা যায়নি: সেশন নেই।");
      } else {
        console.warn("প্রোফাইল লোড সমস্যা:", err);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (formNum: string, newStatus: "Paid" | "Unpaid") => {
    try {
      const res = await apiClient.put(`/members/${formNum}/payment`, { paymentStatus: newStatus });
      if (res && res.success) {
        // Update active profile state dynamically
        setActiveProfile(prev => prev ? {
          ...prev,
          member: {
            ...prev.member,
            paymentStatus: newStatus
          }
        } : null);
        
        // Also update members list state so the local status stays in sync
        setMembers(prev => prev.map(m => m.formNumber === formNum ? { ...m, paymentStatus: newStatus } : m));
      }
    } catch (err: any) {
      setErrorMsg(err.message || "পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    }
  };

  const handleAddPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddPhotoLoading(true);
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
          setAddPhoto(compressed);
        } else {
          setAddPhoto(event.target?.result as string);
        }
        setAddPhotoLoading(false);
      };
      img.onerror = () => {
        setAddPhotoLoading(false);
      };
    };
    reader.onerror = () => {
      setAddPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const resetAddFormStates = () => {
    setAddName("");
    setAddForm("");
    setAddMobile("");
    setAddAddress("");
    setAddDob("");
    setAddInstitution("");
    setAddClassName("");
    setAddClassRoll("");
    setAddNameEnglish("");
    setAddFatherName("");
    setAddMotherName("");
    setAddCurrVillage("");
    setAddCurrPostOffice("");
    setAddCurrUpazila("বড়লেখা");
    setAddCurrDistrict("মৌলভীবাজার");
    setAddPermVillage("");
    setAddPermPostOffice("");
    setAddPermUpazila("বড়লেখা");
    setAddPermDistrict("মৌলভীবাজার");
    setAddIsSameAddress(false);
    setAddBloodGroup("");
    setAddNidBirthReg("");
    setAddEducationQualification("");
    setAddProfession("");
    setAddNationality("বাংলাদেশী");
    setAddPhoto("");
    setAddPhotoLoading(false);
    setAddForceRequired(false);
    setFormErr("");
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr("");

    if (addForceRequired) {
      if (!addName.trim()) {
        setFormErr("আবেদনকারীর নাম (বাংলায়) আবশ্যক।");
        return;
      }
      if (!addMobile.trim() || addMobile.trim().length < 11) {
        setFormErr("সঠিক ১১-ডিজিটের মোবাইল নম্বরটি লিখুন।");
        return;
      }
      if (!addDob) {
        setFormErr("জন্ম তারিখ প্রদান করা আবশ্যক।");
        return;
      }
    }

    try {
      await apiClient.post("/members", {
        name: addName.trim(),
        formNumber: addForm.trim(),
        mobile: addMobile.trim(),
        address: addAddress.trim(),
        dob: addDob.trim(),
        educationInstitution: addInstitution.trim(),
        className: addClassName.trim(),
        classRoll: addClassRoll.trim(),
        nameEnglish: addNameEnglish.trim(),
        fatherName: addFatherName.trim(),
        motherName: addMotherName.trim(),
        currVillage: addCurrVillage.trim(),
        currPostOffice: addCurrPostOffice.trim(),
        currUpazila: addCurrUpazila.trim(),
        currDistrict: addCurrDistrict.trim(),
        permVillage: addIsSameAddress ? addCurrVillage.trim() : addPermVillage.trim(),
        permPostOffice: addIsSameAddress ? addCurrPostOffice.trim() : addPermPostOffice.trim(),
        permUpazila: addIsSameAddress ? addCurrUpazila.trim() : addPermUpazila.trim(),
        permDistrict: addIsSameAddress ? addCurrDistrict.trim() : addPermDistrict.trim(),
        bloodGroup: addBloodGroup.trim(),
        nidBirthReg: addNidBirthReg.trim(),
        educationQualification: addEducationQualification.trim(),
        profession: addProfession.trim(),
        nationality: addNationality.trim(),
        photo: addPhoto,
        paymentStatus: "Paid"
      });
      
      resetAddFormStates();
      setIsAddOpen(false);
      
      // Reload
      fetchMembers();
      onRefreshStats();
    } catch (err: any) {
      setFormErr(err.message || "মেম্বার তৈরি ব্যর্থ হয়েছে।");
    }
  };

  // Searching matching members client-side and status filters
  const filteredList = members.filter(m => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      m.name.toLowerCase().includes(query) ||
      m.formNumber.toLowerCase().includes(query) ||
      m.mobile.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;

    const currentStatus = m.paymentStatus || "Paid";
    return currentStatus === statusFilter;
  });

  return (
    <div className="space-y-6">


      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#22242A] flex items-center gap-2">৪. সদস্য ব্যবস্থাপনা (Member Management)</h2>
          <p className="text-xs text-[#6B6B70]">লাইব্রেরিতে পাঠক সদস্য যোগ করুন এবং সদস্য আইডি অনুযায়ী বিস্তারিত ব্যবহারের ইতিহাস অডিট করুন</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">

          <button
            onClick={() => {
              setFormErr("");
              setIsAddOpen(true);
            }}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white rounded-lg text-xs font-bold shadow-lg shadow-none flex items-center justify-center gap-1.5 cursor-pointer transition-transform"
          >
            <UserPlus size={14} />
            ম্যানুয়াল নতুন সদস্য যোগ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Search and Sorted List */}
        <div className="col-span-1 lg:col-span-5  p-4 rounded-2xl border border-[#E5E5EA] space-y-4 max-h-[80vh] flex flex-col">
          
          <div className="relative shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা ফরম আইডি লিখে খুঁজুন..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] placeholder:text-slate-600 focus:outline-none focus:border-[#22242A]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#E5E5EA] shrink-0 text-[9px] sm:text-[10px]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-[#F5F3EF] text-white shadow-sm"
                  : "text-[#6B6B70] hover:text-[#22242A]"
              }`}
            >
              সকল ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Pending")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer relative ${
                statusFilter === "Pending"
                  ? "bg-[#F5F3EF] text-white shadow-sm"
                  : "text-[#6B6B70] hover:text-[#FACC15]"
              }`}
            >
              যাচাইাধীন ({members.filter(m => m.paymentStatus === "Pending").length})
              {members.some(m => m.paymentStatus === "Pending") && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#F5F3EF] rounded-full animate-ping"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Paid")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "Paid"
                  ? "bg-[#F5F3EF] text-white shadow-sm"
                  : "text-[#6B6B70] hover:text-[#22242A]"
              }`}
            >
              সক্রিয় ({members.filter(m => (m.paymentStatus || "Paid") === "Paid").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Unpaid")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "Unpaid"
                  ? "bg-[#F5F3EF] text-white shadow-sm"
                  : "text-[#6B6B70] hover:text-[#FF6B6B]"
              }`}
            >
              বাতিল ({members.filter(m => m.paymentStatus === "Unpaid").length})
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {loading ? (
              <p className="text-center text-xs text-[#6B6B70] py-6">তালিকা লোড হচ্ছে...</p>
            ) : filteredList.length === 0 ? (
              <p className="text-center text-xs text-[#6B6B70] py-6">কোনো সদস্য নিবন্ধিত পাওয়া যায়নি।</p>
            ) : (
              filteredList.map((m) => {
                const isActive = activeProfile && activeProfile.member.formNumber === m.formNumber;
                return (
                  <div
                    key={m.formNumber}
                    onClick={() => fetchProfile(m.formNumber)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${isActive ? "bg-[#F5F3EF] border-[#E5E5EA]" : "bg-[#F5F3EF] border-[#E5E5EA] hover:border-[#E5E5EA]"}`}
                  >
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-bold text-[#22242A] text-xs sm:text-sm">{m.name}</h4>
                      <span className="font-mono text-[10px] font-bold text-[#22242A] bg-[#F5F3EF] px-2 py-0.5 rounded shrink-0">
                        #{m.formNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#6B6B70] mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{m.mobile}</span>
                        {(m.paymentMethod || m.paymentStatus) && (
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (m.paymentStatus || "Paid") === "Paid" 
                              ? "bg-[#F5F3EF]" 
                              : m.paymentStatus === "Pending" 
                              ? "bg-[#F5F3EF] animate-pulse" 
                              : "bg-[#F5F3EF]"
                          }`} title={
                            (m.paymentStatus || "Paid") === "Paid" ? "পরিশোধিত" : m.paymentStatus === "Pending" ? "যাচাইাধীন/পেন্ডিং" : "অপরিশোধিত/বাতিল"
                          } />
                        )}
                      </div>
                      {m.dob && (
                        <span className="text-[#22242A] font-sans flex items-center gap-0.5">
                          📅 {m.dob}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: member active detailed profile summaries */}
        <div className="col-span-1 lg:col-span-7  p-5 rounded-2xl border border-[#E5E5EA] min-h-[40vh] flex flex-col justify-between">
          
          {profileLoading ? (
            <div className="py-24 flex flex-col items-center justify-center flex-1">
              <RefreshCw className="animate-spin text-[#22242A] mb-2" size={24} />
              <p className="text-xs text-[#6B6B70]">প্রোফাইল লোড হচ্ছে...</p>
            </div>
          ) : !activeProfile ? (
            <div className="py-24 text-center text-[#6B6B70] text-xs flex-1">
              বিস্তারিত ব্যবহারের রেকর্ড এবং ব্যবহারের চক্রসমূহ দেখতে বামে সদস্য তালিকায় ক্লিক করুন।
            </div>
          ) : (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Member Profile Card Details Header */}
                <div className="flex justify-between items-start border-b border-[#E5E5EA] pb-3 gap-2">
                  <div className="flex items-start gap-3">
                    {activeProfile.member.photo && (
                      <div className="w-16 h-16 rounded-xl border border-[#E5E5EA] overflow-hidden shrink-0 bg-[#F5F3EF]">
                        <img src={activeProfile.member.photo} alt={activeProfile.member.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-[#22242A] flex items-center gap-1.5 flex-wrap">
                        {activeProfile.member.name}
                        {activeProfile.member.nameEnglish && <span className="text-xs font-normal text-[#6B6B70] block font-mono mt-0.5">({activeProfile.member.nameEnglish})</span>}
                      </h3>
                      
                      {activeProfile.member.currVillage ? (
                        <div className="text-[10px] text-[#6B6B70] mt-1 space-y-0.5">
                          <p className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#22242A] shrink-0" />
                            <span className="text-[#6B6B70]">বর্তমান:</span> {activeProfile.member.currVillage}, ডাকঘর: {activeProfile.member.currPostOffice}, উপজেলা: {activeProfile.member.currUpazila}, জেলা: {activeProfile.member.currDistrict}
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#22242A] shrink-0" />
                            <span className="text-[#6B6B70]">স্থায়ী:</span> {activeProfile.member.permVillage}, ডাকঘর: {activeProfile.member.permPostOffice}, উপজেলা: {activeProfile.member.permUpazila}, জেলা: {activeProfile.member.permDistrict}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#6B6B70] mt-0.5 flex items-center gap-1">
                          <MapPin size={11} className="text-[#22242A] shrink-0" />
                          ঠিকানা: {activeProfile.member.address}
                        </p>
                      )}

                      {activeProfile.member.dob && (
                        <p className="text-[10px] text-[#6B6B70] mt-1 flex items-center gap-1">
                          📅 জন্ম তারিখ: {activeProfile.member.dob}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold font-mono text-[#22242A]">ID: #{activeProfile.member.formNumber}</p>
                    <p className="text-[10px] text-[#6B6B70] mt-0.5 flex items-center justify-end gap-1 font-mono">
                      <Phone size={10} className="text-[#22242A] shrink-0" />
                      {activeProfile.member.mobile}
                    </p>
                    {(activeProfile.member.educationInstitution || activeProfile.member.className || activeProfile.member.classRoll) && (
                      <div className="text-[10px] text-[#22242A] mt-1 flex flex-col items-end">
                        {activeProfile.member.educationInstitution && <span>🏫 {activeProfile.member.educationInstitution}</span>}
                        {(activeProfile.member.className || activeProfile.member.classRoll) && (
                          <span>
                            {activeProfile.member.className && `শ্রেণী: ${activeProfile.member.className}`}
                            {activeProfile.member.className && activeProfile.member.classRoll && " | "}
                            {activeProfile.member.classRoll && `রোল: ${activeProfile.member.classRoll}`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Detailed Registration Fields */}
                {(activeProfile.member.fatherName || 
                  activeProfile.member.motherName || 
                  activeProfile.member.nidBirthReg || 
                  activeProfile.member.bloodGroup || 
                  activeProfile.member.profession || 
                  activeProfile.member.educationQualification) && (
                  <div className="p-3 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-[#22242A] uppercase tracking-wider block">📋 অতিরিক্ত তথ্য (Detailed Profile Info):</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] bg-[#070b16]/60 p-2.5 rounded-lg border border-[#E5E5EA]">
                      {activeProfile.member.fatherName && (
                        <div>
                          <span className="text-[#6B6B70]">পিতার নাম:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.fatherName}</p>
                        </div>
                      )}
                      {activeProfile.member.motherName && (
                        <div>
                          <span className="text-[#6B6B70]">মাতার নাম:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.motherName}</p>
                        </div>
                      )}
                      {activeProfile.member.nidBirthReg && (
                        <div>
                          <span className="text-[#6B6B70]">NID / জন্ম নিবন্ধন:</span>
                          <p className="font-bold text-[#22242A] mt-0.5 font-mono select-all bg-white px-1 py-0.5 rounded border border-[#E5E5EA] inline-block">{activeProfile.member.nidBirthReg}</p>
                        </div>
                      )}
                      {activeProfile.member.bloodGroup && (
                        <div>
                          <span className="text-[#6B6B70]">রক্তের গ্রুপ:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.bloodGroup}</p>
                        </div>
                      )}
                      {activeProfile.member.profession && (
                        <div>
                          <span className="text-[#6B6B70]">পেশা:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.profession}</p>
                        </div>
                      )}
                      {activeProfile.member.educationQualification && (
                        <div>
                          <span className="text-[#6B6B70]">শিক্ষাগত যোগ্যতা:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.educationQualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment & Member Approval Information */}
                {(activeProfile.member.paymentMethod || activeProfile.member.paymentStatus) && (
                  <div className="p-3 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-[#6B6B70] uppercase tracking-wider">💳 মেম্বারশিপ নিবন্ধন ফি ও অনুমোদন বিবরণ:</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                        (activeProfile.member.paymentStatus || "Paid") === "Paid"
                          ? "bg-[#E5E5EA]/60 border-[#E5E5EA] text-[#22242A]"
                          : activeProfile.member.paymentStatus === "Pending"
                          ? "bg-[#F5F3EF] border-[#E5E5EA] text-[#FACC15] animate-pulse"
                          : "bg-[#F5F3EF] border-[#E5E5EA] text-[#FF6B6B]"
                      }`}>
                        {(activeProfile.member.paymentStatus || "Paid") === "Paid" ? "● অনুমোদিত ও সক্রিয় (Paid)" : activeProfile.member.paymentStatus === "Pending" ? "● যাচাইাধীন (Pending)" : "● অচল/বাতিল (Unpaid)"}
                      </span>
                    </div>
                    
                    {activeProfile.member.paymentMethod && (
                      <div className="grid grid-cols-3 gap-2.5 text-[10px] bg-white p-2 rounded-lg border border-[#E5E5EA]">
                        <div>
                          <span className="text-[#6B6B70] font-medium">পেমেন্ট মাধ্যম:</span>
                          <p className="font-bold text-[#22242A] mt-0.5">{activeProfile.member.paymentMethod}</p>
                        </div>
                        <div>
                          <span className="text-[#6B6B70] font-medium">প্রেরক মোবাইল:</span>
                          <p className="font-bold text-[#22242A] mt-0.5 font-mono">{activeProfile.member.senderNumber || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-[#6B6B70] font-medium">ট্রানজেকশন ID:</span>
                          <p className="font-bold text-[#22242A] mt-0.5 font-mono select-all bg-[#F5F3EF] px-1 py-0.5 rounded border border-[#E5E5EA] inline-block" title="কপি করতে ডাবল ক্লিক করুন">
                            {activeProfile.member.transactionId || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Admin actions to update payment status / approve member */}
                    <div className="pt-2.5 border-t border-[#E5E5EA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-[9px] text-[#6B6B70] flex flex-col leading-relaxed max-w-[280px]">
                        <span className="font-extrabold text-[#22242A] text-[10px]">অ্যাডমিন অ্যাকশন (সদস্য অনুমোদন):</span>
                        {activeProfile.member.paymentStatus === "Pending" && (
                          <span>অনলাইন সদস্য আবেদনটি যাচাই করে মেম্বারশিপ সক্রিয় করতে ডানপাশের অনুমোদন বাটনে ক্লিক করুন।</span>
                        )}
                        {(activeProfile.member.paymentStatus || "Paid") === "Paid" && (
                          <span className="text-[#22242A] font-semibold">সদস্যটি বর্তমানে অনুমোদিত এবং সচল রয়েছে। উনাকে সাময়িকভাবে অচল করতে চাইলে ডানপাশের বাটন চাপুন।</span>
                        )}
                        {activeProfile.member.paymentStatus === "Unpaid" && (
                          <span className="text-[#FF6B6B] font-semibold">সদস্যটি অচল বা বাতিল অবস্থায় আছে। সচল করতে ডানপাশের এপ্রুভ বাটনটি চাপুন।</span>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                        {(activeProfile.member.paymentStatus || "Paid") !== "Paid" ? (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Paid")}
                            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 bg-[#F5F3EF] hover:from-emerald-700 hover:bg-[#F5F3EF] text-[#22242A] rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-950/20"
                          >
                            <CheckCircle2 size={12} />
                            সদস্য এপ্রুভ করুন
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Unpaid")}
                            className="px-3 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#FF6B6B] hover:bg-[#F5F3EF] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            স্থগিত/বাতিল করুন
                          </button>
                        )}

                        {activeProfile.member.paymentStatus === "Pending" && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Unpaid")}
                            className="px-2 py-1.5 bg-white border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#6B6B70] hover:text-[#22242A] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                          >
                            আবেদন রিজেক্ট
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard metric summary counters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#E5E5EA] text-center">
                    <p className="text-[10px] text-[#6B6B70] uppercase tracking-widest font-bold">মোট বই লেনদেন সংখ্যা</p>
                    <p className="text-2xl font-extrabold text-[#22242A] mt-1 font-mono">{activeProfile.rentCount} বার</p>
                  </div>
                  <div className="p-3 bg-[#F5F3EF] rounded-xl border border-[#E5E5EA] text-center">
                    <p className="text-[10px] text-[#6B6B70] uppercase tracking-widest font-bold">বর্তমানে নেওয়া বই (Issued)</p>
                    <p className="text-2xl font-extrabold text-[#22242A] mt-1 font-mono">{activeProfile.activeRents.length} টি</p>
                  </div>
                </div>

                {/* Active Books and histories block */}
                <div className="space-y-3 pt-2">
                  
                  {/* Presently Active borrows */}
                  <div>
                    <h4 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5 mb-1.5 uppercase">
                      <BookOpen size={13} className="text-[#22242A]" />
                      বর্তমানে ধারকৃত বইসমূহ ({activeProfile.activeRents.length})
                    </h4>
                    {activeProfile.activeRents.length === 0 ? (
                      <p className="text-[11px] text-[#6B6B70] py-2 bg-[#F5F3EF] p-3 rounded">এই মুহূর্তে কোনো বই ইস্যু করা নাই।</p>
                    ) : (
                      <div className="space-y-2">
                        {activeProfile.activeRents.map((item: any) => (
                          <div key={item.id} className="p-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-[#22242A] mb-0.5">{item.bookName}</p>
                              <p className="text-[9px] text-[#22242A] font-mono italic">কোড: {item.bookCode} | ইস্যু ডেট: {item.issueDate}</p>
                            </div>
                            <span className="text-[10px] text-[#FF6B6B] font-bold font-mono bg-[#F5F3EF] border border-[#E5E5EA] px-2 py-0.5 rounded">
                              ফেরত দিন: {item.returnDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous books return lists */}
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5 mb-1.5 uppercase">
                      <CheckCircle2 size={13} className="text-[#22242A]" />
                      ফেরত দেওয়া বইয়ের ইতিহাস ({activeProfile.returnedHistory.length})
                    </h4>
                    {activeProfile.returnedHistory.length === 0 ? (
                      <p className="text-[11px] text-[#6B6B70] py-2 bg-[#F5F3EF] p-3 rounded">ইতিপূর্বে বই ফেরত দেওয়ার কোনো ইতিহাস নেই।</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {activeProfile.returnedHistory.map((item: any) => (
                          <div key={item.id} className="p-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-[#22242A] mb-0.5">{item.bookName}</p>
                              <p className="text-[9px] text-[#6B6B70] font-mono">কোড: {item.bookCode} | ইস্যু: {item.issueDate}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-[#22242A] font-semibold font-mono bg-[#E5E5EA]/60 border border-[#E5E5EA] px-1.5 py-0.5 rounded">
                                ফেরত এসেছে: {item.returnedAt || item.returnDate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* Slips preview triggers */}
              <div className="pt-4 border-t border-[#E5E5EA] flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white border border-[#E5E5EA] hover:border-[#E5E5EA] hover:text-[#FF6B6B] px-4 py-2.5 rounded-lg text-[#6B6B70] hover:bg-[#F5F3EF] cursor-pointer transition-colors w-full sm:w-auto justify-center"
                >
                  <Trash2 size={12} />
                  সদস্য মুছে ফেলুন
                </button>
                <button
                  onClick={() => onPreviewMemberSlip(activeProfile)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-[#0e1629] border border-[#E5E5EA] hover:border-[#22242A] px-4 py-2.5 rounded-lg text-[#22242A] hover:bg-[#F5F3EF] cursor-pointer transition-colors w-full sm:w-auto justify-center"
                >
                  <Eye size={12} />
                  গ্রাহক স্লিপ চোখের প্রাকদর্শন ও PDF
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MANUAL REGISTER NEW APP MEMBER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-120 flex flex-col my-8 max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5EA] flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-[#22242A] flex items-center gap-2">
                <UserPlus size={18} className="text-[#22242A]" />
                ম্যানুয়াল নতুন সদস্য রেজিস্ট্রি
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-[#6B6B70] hover:text-[#22242A] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Form Area */}
            <div className="p-6 overflow-y-auto space-y-6">
              {formErr && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{formErr}</span>
                </div>
              )}

              <form onSubmit={handleAddMemberSubmit} className="space-y-6">
                {/* PHOTO UPLOAD BLOCK */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E5EA] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#F5F3EF] border border-[#E5E5EA] overflow-hidden flex items-center justify-center shrink-0 relative">
                    {addPhoto ? (
                      <img src={addPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#6B6B70] flex flex-col items-center gap-1">
                        <Camera size={20} />
                        <span className="text-[8px] font-bold">ছবি দিন</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <span className="text-[11px] font-bold text-[#22242A] block">সদস্যের ছবি আপলোড করুন</span>
                    <p className="text-[10px] text-[#6B6B70] leading-normal">
                      লাইব্রেরি কার্ড ও ড্যাশবোর্ডের জন্য পাসপোর্ট সাইজের ছবি আপলোড করুন (ঐচ্ছিক)।
                    </p>
                    <div className="flex justify-center sm:justify-start gap-2">
                      <label className="px-3 py-1.5 bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] hover:bg-[#F5F3EF] rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors flex items-center gap-1">
                        <Upload size={12} />
                        {addPhotoLoading ? "প্রসেস হচ্ছে..." : (addPhoto ? "ছবি পরিবর্তন" : "ছবি বাছাই করুন")}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAddPhotoChange}
                          className="hidden"
                          disabled={addPhotoLoading}
                        />
                      </label>
                      {addPhoto && (
                        <button
                          type="button"
                          onClick={() => setAddPhoto("")}
                          className="px-2 py-1.5 bg-[#F5F3EF] text-[#FF6B6B] border border-[#E5E5EA] hover:bg-[#F5F3EF] rounded-lg text-[10px] font-extrabold transition-colors"
                        >
                          রিসেট
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1. Personal Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#22242A] border-b border-[#E5E5EA] pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                    ব্যক্তিগত তথ্য (Personal Information)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সদস্যের নাম (বাংলায়) {addForceRequired && "*"}</label>
                      <input
                        type="text"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="যেমন: আরিফ উদ্দিন আহমেদ"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                        required={addForceRequired}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সদস্যের নাম (ইংরেজিতে)</label>
                      <input
                        type="text"
                        value={addNameEnglish}
                        onChange={(e) => setAddNameEnglish(e.target.value)}
                        placeholder="যেমন: Arif Uddin Ahmed"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">ফরম নম্বর (ID)</label>
                      <input
                        type="text"
                        value={addForm}
                        onChange={(e) => setAddForm(e.target.value)}
                        placeholder="যেমনঃ 1024 (ফাঁকা থাকলে অটো হবে)"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">মোবাইল নম্বর {addForceRequired && "*"}</label>
                      <input
                        type="text"
                        value={addMobile}
                        onChange={(e) => setAddMobile(e.target.value)}
                        placeholder="যেমনঃ 017xxxxxxxx"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                        required={addForceRequired}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">জন্ম তারিখ {addForceRequired && "*"}</label>
                      <input
                        type="date"
                        value={addDob}
                        onChange={(e) => setAddDob(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                        required={addForceRequired}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">পিতার নাম</label>
                      <input
                        type="text"
                        value={addFatherName}
                        onChange={(e) => setAddFatherName(e.target.value)}
                        placeholder="পিতার নাম লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">মাতার নাম</label>
                      <input
                        type="text"
                        value={addMotherName}
                        onChange={(e) => setAddMotherName(e.target.value)}
                        placeholder="মাতার নাম লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Address Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#22242A] border-b border-[#E5E5EA] pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                    ঠিকানা (Address Details)
                  </h4>
                  
                  {/* Present Address */}
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-[#E5E5EA]">
                    <span className="text-[10px] font-black text-[#22242A] block">বর্তমান ঠিকানা</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">গ্রাম/মহল্লা</label>
                        <input
                          type="text"
                          value={addCurrVillage}
                          onChange={(e) => setAddCurrVillage(e.target.value)}
                          placeholder="যেমন: বড়লেখা"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">ডাকঘর</label>
                        <input
                          type="text"
                          value={addCurrPostOffice}
                          onChange={(e) => setAddCurrPostOffice(e.target.value)}
                          placeholder="যেমন: বড়লেখা"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">উপজেলা</label>
                        <input
                          type="text"
                          value={addCurrUpazila}
                          onChange={(e) => setAddCurrUpazila(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">জেলা</label>
                        <input
                          type="text"
                          value={addCurrDistrict}
                          onChange={(e) => setAddCurrDistrict(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Same as present address checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addIsSameAddress"
                      checked={addIsSameAddress}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAddIsSameAddress(checked);
                        if (checked) {
                          setAddPermVillage(addCurrVillage);
                          setAddPermPostOffice(addCurrPostOffice);
                          setAddPermUpazila(addCurrUpazila);
                          setAddPermDistrict(addCurrDistrict);
                        }
                      }}
                      className="rounded border-[#E5E5EA] text-[#22242A] focus:ring-[#E5E5EA] bg-white h-3.5 w-3.5 cursor-pointer"
                    />
                    <label htmlFor="addIsSameAddress" className="text-[10px] font-bold text-[#6B6B70] cursor-pointer select-none">
                      বর্তমান ঠিকানা ও স্থায়ী ঠিকানা একই
                    </label>
                  </div>

                  {/* Permanent Address */}
                  {!addIsSameAddress && (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-[#E5E5EA]">
                      <span className="text-[10px] font-black text-[#22242A] block">স্থায়ী ঠিকানা</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">গ্রাম/মহল্লা</label>
                          <input
                            type="text"
                            value={addPermVillage}
                            onChange={(e) => setAddPermVillage(e.target.value)}
                            placeholder="গ্রামের নাম"
                            className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">ডাকঘর</label>
                          <input
                            type="text"
                            value={addPermPostOffice}
                            onChange={(e) => setAddPermPostOffice(e.target.value)}
                            placeholder="ডাকঘরের নাম"
                            className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">উপজেলা</label>
                          <input
                            type="text"
                            value={addPermUpazila}
                            onChange={(e) => setAddPermUpazila(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">জেলা</label>
                          <input
                            type="text"
                            value={addPermDistrict}
                            onChange={(e) => setAddPermDistrict(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single string address fallback (optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#6B6B70]">অতিরিক্ত বিবরণ/ঠিকানা নোট (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={addAddress}
                      onChange={(e) => setAddAddress(e.target.value)}
                      placeholder="যেমন: বড়লেখা লাইব্রেরির পাশে"
                      className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                    />
                  </div>
                </div>

                {/* 3. Additional Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#22242A] border-b border-[#E5E5EA] pb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                    অন্যান্য তথ্য (Additional Information)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">রক্তের গ্রুপ</label>
                      <select
                        value={addBloodGroup}
                        onChange={(e) => setAddBloodGroup(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      >
                        <option value="">বাছাই করুন</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">NID অথবা জন্ম নিবন্ধন নং</label>
                      <input
                        type="text"
                        value={addNidBirthReg}
                        onChange={(e) => setAddNidBirthReg(e.target.value)}
                        placeholder="NID / Birth Certificate"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">জাতীয়তা</label>
                      <input
                        type="text"
                        value={addNationality}
                        onChange={(e) => setAddNationality(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সর্বোচ্চ শিক্ষাগত যোগ্যতা</label>
                      <input
                        type="text"
                        value={addEducationQualification}
                        onChange={(e) => setAddEducationQualification(e.target.value)}
                        placeholder="যেমন: এস.এস.সি / এইচ.এস.সি / অনার্স"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">পেশা</label>
                      <input
                        type="text"
                        value={addProfession}
                        onChange={(e) => setAddProfession(e.target.value)}
                        placeholder="যেমন: ছাত্র / শিক্ষক / ব্যবসায়ী"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">শিক্ষা প্রতিষ্ঠান</label>
                      <input
                        type="text"
                        value={addInstitution}
                        onChange={(e) => setAddInstitution(e.target.value)}
                        placeholder="যেমন: বড়লেখা কলেজ"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">শ্রেণী</label>
                      <input
                        type="text"
                        value={addClassName}
                        onChange={(e) => setAddClassName(e.target.value)}
                        placeholder="শ্রেণী লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">শ্রেণী রোল</label>
                      <input
                        type="text"
                        value={addClassRoll}
                        onChange={(e) => setAddClassRoll(e.target.value)}
                        placeholder="রোল লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* BOTTOM MANDATORY TOGGLE OPTION */}
                <div className="pt-4 border-t border-[#E5E5EA] flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[#E5E5EA]">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] font-bold text-[#22242A] block">তথ্যাদি দেওয়া বাধ্যতামূলক করুন</span>
                    <p className="text-[10px] text-[#6B6B70] leading-tight">
                      এটি অন করলে সদস্যের নাম, মোবাইল এবং জন্ম তারিখ দেওয়া বাধ্যতামূলক হবে। অফ থাকলে কোন টাই বাধ্যতামূলক না।
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setAddForceRequired(!addForceRequired)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        addForceRequired ? "bg-[#F5F3EF]" : "bg-white"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          addForceRequired ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5EA]">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 bg-[#F5F3EF] border border-[#E5E5EA] text-[#6B6B70] rounded-lg hover:bg-white text-xs font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#22242A] text-white rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer"
                  >
                    সদস্য যুক্ত করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && activeProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2">
              <AlertTriangle className="text-[#FF6B6B]" size={18} />
              সদস্য মুছে ফেলার সতর্কতা
            </h3>
            <p className="text-xs text-[#22242A] leading-relaxed">
              আপনি কি নিশ্চিতভাবে <span className="font-bold text-[#22242A]">'{activeProfile.member.name}'</span> (ID: #{activeProfile.member.formNumber}) সদস্যকে মুছে ফেলতে চান? উনার ব্যবহারের সব লেনদেন রেকর্ড ড্যাশবোর্ড থেকে মুছে যাবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-[#F5F3EF] border border-slate-705 text-[#22242A] rounded-lg hover:bg-white text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await apiClient.delete(`/members/${activeProfile.member.formNumber}`);
                    setActiveProfile(null);
                    setShowDeleteConfirm(false);
                    fetchMembers();
                    onRefreshStats();
                  } catch (err: any) {
                    alert(err.message || "মুছে ফেলা সফল হয়নি।");
                    setShowDeleteConfirm(false);
                  }
                }}
                className="px-5 py-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] rounded-lg text-xs font-bold cursor-pointer"
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
