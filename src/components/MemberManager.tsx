import React, { useState, useEffect } from "react";
import { UserPlus, Search, Phone, MapPin, ClipboardList, BookOpen, Clock, CheckCircle2, Eye, RefreshCw, AlertCircle, Trash2, AlertTriangle, Database, Check, Camera, Upload, Edit3, Users } from "lucide-react";
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

  // Editing single Member states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormNum, setEditFormNum] = useState("");
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [editClassName, setEditClassName] = useState("");
  const [editClassRoll, setEditClassRoll] = useState("");
  const [editNameEnglish, setEditNameEnglish] = useState("");
  const [editFatherName, setEditFatherName] = useState("");
  const [editMotherName, setEditMotherName] = useState("");
  const [editCurrVillage, setEditCurrVillage] = useState("");
  const [editCurrPostOffice, setEditCurrPostOffice] = useState("");
  const [editCurrUpazila, setEditCurrUpazila] = useState("");
  const [editCurrDistrict, setEditCurrDistrict] = useState("");
  const [editPermVillage, setEditPermVillage] = useState("");
  const [editPermPostOffice, setEditPermPostOffice] = useState("");
  const [editPermUpazila, setEditPermUpazila] = useState("");
  const [editPermDistrict, setEditPermDistrict] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editNidBirthReg, setEditNidBirthReg] = useState("");
  const [editEducationQualification, setEditEducationQualification] = useState("");
  const [editProfession, setEditProfession] = useState("");
  const [editNationality, setEditNationality] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [editPhotoLoading, setEditPhotoLoading] = useState(false);
  const [editErr, setEditErr] = useState("");

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

  const handleAddPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddPhotoLoading(true);
    try {
      const { compressImage } = await import("../lib/imageCompressor");
      const compressedDataUrl = await compressImage(file, 800);
      setAddPhoto(compressedDataUrl);
    } catch (err) {
      console.error("Photo compression error:", err);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    } finally {
      setAddPhotoLoading(false);
    }
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

  const handleEditPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditPhotoLoading(true);
    try {
      const { compressImage } = await import("../lib/imageCompressor");
      const compressedDataUrl = await compressImage(file, 800);
      setEditPhoto(compressedDataUrl);
    } catch (err) {
      console.error("Photo compression error:", err);
      alert("ছবি প্রসেস করতে সমস্যা হয়েছে।");
    } finally {
      setEditPhotoLoading(false);
    }
  };

  const openEditModal = (member: any) => {
    setEditFormNum(member.formNumber || "");
    setEditName(member.name || "");
    setEditMobile(member.mobile || "");
    setEditAddress(member.address || "");
    setEditDob(member.dob || "");
    setEditInstitution(member.educationInstitution || "");
    setEditClassName(member.className || "");
    setEditClassRoll(member.classRoll || "");
    setEditNameEnglish(member.nameEnglish || "");
    setEditFatherName(member.fatherName || "");
    setEditMotherName(member.motherName || "");
    setEditCurrVillage(member.currVillage || "");
    setEditCurrPostOffice(member.currPostOffice || "");
    setEditCurrUpazila(member.currUpazila || "");
    setEditCurrDistrict(member.currDistrict || "");
    setEditPermVillage(member.permVillage || "");
    setEditPermPostOffice(member.permPostOffice || "");
    setEditPermUpazila(member.permUpazila || "");
    setEditPermDistrict(member.permDistrict || "");
    setEditBloodGroup(member.bloodGroup || "");
    setEditNidBirthReg(member.nidBirthReg || "");
    setEditEducationQualification(member.educationQualification || "");
    setEditProfession(member.profession || "");
    setEditNationality(member.nationality || "");
    setEditPhoto(member.photo || "");
    setEditErr("");
    setIsEditOpen(true);
  };

  const handleEditMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErr("");
    if (!editName.trim()) {
      setEditErr("সদস্যের নাম (বাংলায়) আবশ্যক।");
      return;
    }
    if (!editMobile.trim()) {
      setEditErr("মোবাইল নাম্বার প্রদান করা আবশ্যক।");
      return;
    }

    try {
      const res = await apiClient.put(`/members/${editFormNum}`, {
        name: editName.trim(),
        mobile: editMobile.trim(),
        address: editAddress.trim(),
        dob: editDob.trim(),
        educationInstitution: editInstitution.trim(),
        className: editClassName.trim(),
        classRoll: editClassRoll.trim(),
        nameEnglish: editNameEnglish.trim(),
        fatherName: editFatherName.trim(),
        motherName: editMotherName.trim(),
        currVillage: editCurrVillage.trim(),
        currPostOffice: editCurrPostOffice.trim(),
        currUpazila: editCurrUpazila.trim(),
        currDistrict: editCurrDistrict.trim(),
        permVillage: editPermVillage.trim(),
        permPostOffice: editPermPostOffice.trim(),
        permUpazila: editPermUpazila.trim(),
        permDistrict: editPermDistrict.trim(),
        bloodGroup: editBloodGroup.trim(),
        nidBirthReg: editNidBirthReg.trim(),
        educationQualification: editEducationQualification.trim(),
        profession: editProfession.trim(),
        nationality: editNationality.trim(),
        photo: editPhoto
      });

      if (res && !res.error) {
        setIsEditOpen(false);
        fetchMembers();
        onRefreshStats();
        if (activeProfile && activeProfile.member && activeProfile.member.formNumber === editFormNum) {
          fetchProfile(editFormNum);
        }
      } else {
        setEditErr(res.error || "সদস্য তথ্য আপডেট করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setEditErr(err.message || "সার্ভার এরর: সদস্য তথ্য আপডেট করতে সমস্যা হয়েছে।");
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">সদস্য ব্যবস্থাপনা (Member Management)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/70">
              {members.length} জন সদস্য
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">পাঠক সদস্য তথ্য, আবেদন অনুমোদন এবং বিস্তারিত বই গ্রহণের ইতিহাস অডিট করুন</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setFormErr("");
              setIsAddOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <UserPlus size={16} />
            <span>নতুন সদস্য যোগ</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Search and Filtered Member List */}
        <div className="col-span-1 lg:col-span-5 glass-panel p-4 space-y-3.5 max-h-[80vh] flex flex-col">
          
          <div className="relative shrink-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা ফরম আইডি লিখে খুঁজুন..."
              className="w-full text-xs pl-10 pr-4 py-2.5 glass-input placeholder:text-slate-400"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0 text-[10px] sm:text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              সকল ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Pending")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer relative ${
                statusFilter === "Pending"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-amber-600"
              }`}
            >
              যাচাইাধীন ({members.filter(m => m.paymentStatus === "Pending").length})
              {members.some(m => m.paymentStatus === "Pending") && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Paid")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "Paid"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              সক্রিয় ({members.filter(m => (m.paymentStatus || "Paid") === "Paid").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Unpaid")}
              className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "Unpaid"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-500 hover:text-rose-600"
              }`}
            >
              বাতিল ({members.filter(m => m.paymentStatus === "Unpaid").length})
            </button>
          </div>

          {/* Member List Items */}
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {loading ? (
              <div className="space-y-2 py-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl skeleton-shimmer"></div>
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">কোনো সদস্য নিবন্ধিত পাওয়া যায়নি।</p>
            ) : (
              filteredList.map((m) => {
                const isActive = activeProfile && activeProfile.member.formNumber === m.formNumber;
                return (
                  <div
                    key={m.formNumber}
                    onClick={() => fetchProfile(m.formNumber)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all duration-150 relative ${
                      isActive 
                        ? "bg-indigo-50/70 border-indigo-300 shadow-xs ring-1 ring-indigo-400/30" 
                        : "bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {m.photo ? (
                          <img 
                            src={m.photo} 
                            alt={m.name} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {m.name ? m.name.charAt(0) : "স"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{m.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{m.mobile}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          #{m.formNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(m);
                          }}
                          className="p-1 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          (m.paymentStatus || "Paid") === "Paid" 
                            ? "badge-paid" 
                            : m.paymentStatus === "Pending" 
                            ? "badge-pending" 
                            : "badge-unpaid"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            (m.paymentStatus || "Paid") === "Paid" 
                              ? "bg-emerald-500" 
                              : m.paymentStatus === "Pending" 
                              ? "bg-amber-500 animate-pulse" 
                              : "bg-rose-500"
                          }`} />
                          {(m.paymentStatus || "Paid") === "Paid" ? "অনুমোদিত" : m.paymentStatus === "Pending" ? "যাচাইাধীন" : "বাতিল"}
                        </span>
                      </div>
                      {m.dob && (
                        <span className="text-slate-400 font-sans flex items-center gap-1">
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

        {/* Right column: Member Active Detailed Profile Summary */}
        <div className="col-span-1 lg:col-span-7 glass-panel p-6 min-h-[50vh] flex flex-col justify-between">
          
          {profileLoading ? (
            <div className="py-24 flex flex-col items-center justify-center flex-1 space-y-3">
              <RefreshCw className="animate-spin text-indigo-600" size={28} />
              <p className="text-xs text-slate-500 font-medium">সদস্য প্রোফাইল লোড হচ্ছে...</p>
            </div>
          ) : !activeProfile ? (
            <div className="py-28 text-center text-slate-400 text-xs flex-1 flex flex-col items-center justify-center gap-2">
              <Users size={36} className="text-slate-300" />
              <p className="text-slate-600 font-semibold">কোনো সদস্য নির্বাচিত হয়নি</p>
              <p className="text-slate-400 text-[11px] max-w-xs">
                বিস্তারিত প্রোফাইল ও লেনদেন হিস্ট্রি দেখতে বামের তালিকা থেকে যেকোনো সদস্যে ক্লিক করুন।
              </p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-5">
                {/* Member Profile Card Details Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-start gap-4">
                    {activeProfile.member.photo ? (
                      <div className="w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                        <img src={activeProfile.member.photo} alt={activeProfile.member.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                        {activeProfile.member.name ? activeProfile.member.name.charAt(0) : "ম"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        {activeProfile.member.name}
                        {activeProfile.member.nameEnglish && (
                          <span className="text-xs font-normal text-slate-500 font-mono">
                            ({activeProfile.member.nameEnglish})
                          </span>
                        )}
                      </h3>
                      
                      {activeProfile.member.currVillage ? (
                        <div className="text-[11px] text-slate-500 mt-1.5 space-y-0.5">
                          <p className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-indigo-600 shrink-0" />
                            <span><strong className="text-slate-700">বর্তমান:</strong> {activeProfile.member.currVillage}, ডাকঘর: {activeProfile.member.currPostOffice}, {activeProfile.member.currUpazila}, {activeProfile.member.currDistrict}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span><strong className="text-slate-700">স্থায়ী:</strong> {activeProfile.member.permVillage}, ডাকঘর: {activeProfile.member.permPostOffice}, {activeProfile.member.permUpazila}, {activeProfile.member.permDistrict}</span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <MapPin size={12} className="text-indigo-600 shrink-0" />
                          <span>ঠিকানা: {activeProfile.member.address}</span>
                        </p>
                      )}

                      {activeProfile.member.dob && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>📅 জন্ম তারিখ: {activeProfile.member.dob}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 inline-block">
                      ID: #{activeProfile.member.formNumber}
                    </span>
                    <p className="text-xs text-slate-700 mt-1.5 flex items-center sm:justify-end gap-1.5 font-mono font-semibold">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      {activeProfile.member.mobile}
                    </p>
                    {(activeProfile.member.educationInstitution || activeProfile.member.className || activeProfile.member.classRoll) && (
                      <div className="text-[11px] text-slate-600 mt-1.5 flex flex-col sm:items-end">
                        {activeProfile.member.educationInstitution && <span>🏫 {activeProfile.member.educationInstitution}</span>}
                        {(activeProfile.member.className || activeProfile.member.classRoll) && (
                          <span className="text-slate-500">
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
                  <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      📋 অতিরিক্ত তথ্য (Detailed Profile Info):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {activeProfile.member.fatherName && (
                        <div>
                          <span className="text-slate-400 text-[10px]">পিতার নাম:</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{activeProfile.member.fatherName}</p>
                        </div>
                      )}
                      {activeProfile.member.motherName && (
                        <div>
                          <span className="text-slate-400 text-[10px]">মাতার নাম:</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{activeProfile.member.motherName}</p>
                        </div>
                      )}
                      {activeProfile.member.nidBirthReg && (
                        <div>
                          <span className="text-slate-400 text-[10px]">NID / জন্ম নিবন্ধন:</span>
                          <p className="font-bold text-slate-800 mt-0.5 font-mono select-all bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                            {activeProfile.member.nidBirthReg}
                          </p>
                        </div>
                      )}
                      {activeProfile.member.bloodGroup && (
                        <div>
                          <span className="text-slate-400 text-[10px]">রক্তের গ্রুপ:</span>
                          <p className="font-bold text-rose-600 mt-0.5">{activeProfile.member.bloodGroup}</p>
                        </div>
                      )}
                      {activeProfile.member.profession && (
                        <div>
                          <span className="text-slate-400 text-[10px]">পেশা:</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{activeProfile.member.profession}</p>
                        </div>
                      )}
                      {activeProfile.member.educationQualification && (
                        <div>
                          <span className="text-slate-400 text-[10px]">শিক্ষাগত যোগ্যতা:</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{activeProfile.member.educationQualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment & Member Approval Information */}
                {(activeProfile.member.paymentMethod || activeProfile.member.paymentStatus) && (
                  <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        💳 মেম্বারশিপ নিবন্ধন ফি ও অনুমোদন বিবরণ:
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        (activeProfile.member.paymentStatus || "Paid") === "Paid"
                          ? "badge-paid"
                          : activeProfile.member.paymentStatus === "Pending"
                          ? "badge-pending"
                          : "badge-unpaid"
                      }`}>
                        {(activeProfile.member.paymentStatus || "Paid") === "Paid" ? "● অনুমোদিত ও সক্রিয় (Paid)" : activeProfile.member.paymentStatus === "Pending" ? "● যাচাইাধীন (Pending)" : "● অচল/বাতিল (Unpaid)"}
                      </span>
                    </div>
                    
                    {activeProfile.member.paymentMethod && (
                      <div className="grid grid-cols-3 gap-2.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-slate-400 text-[10px] font-medium">পেমেন্ট মাধ্যম:</span>
                          <p className="font-bold text-slate-800 mt-0.5">{activeProfile.member.paymentMethod}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-medium">প্রেরক মোবাইল:</span>
                          <p className="font-bold text-slate-800 mt-0.5 font-mono">{activeProfile.member.senderNumber || "N/A"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] font-medium">ট্রানজেকশন ID:</span>
                          <p className="font-bold text-slate-800 mt-0.5 font-mono select-all bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 inline-block" title="কপি করতে ডাবল ক্লিক করুন">
                            {activeProfile.member.transactionId || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Admin actions to update payment status / approve member */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-[10px] text-slate-500 flex flex-col leading-relaxed max-w-[280px]">
                        <span className="font-bold text-slate-800 text-xs">অ্যাডমিন অ্যাকশন (সদস্য অনুমোদন):</span>
                        {activeProfile.member.paymentStatus === "Pending" && (
                          <span>অনলাইন আবেদনটি যাচাই করে সদস্যপদ সক্রিয় করতে অনুমোদন বাটনে ক্লিক করুন।</span>
                        )}
                        {(activeProfile.member.paymentStatus || "Paid") === "Paid" && (
                          <span className="text-emerald-700 font-semibold">সদস্যটি বর্তমানে অনুমোদিত এবং সচল রয়েছে।</span>
                        )}
                        {activeProfile.member.paymentStatus === "Unpaid" && (
                          <span className="text-rose-600 font-semibold">সদস্যটি স্থগিত বা বাতিল অবস্থায় রয়েছে।</span>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                        {(activeProfile.member.paymentStatus || "Paid") !== "Paid" ? (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Paid")}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <CheckCircle2 size={13} />
                            সদস্য এপ্রুভ করুন
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Unpaid")}
                            className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                            স্থগিত/বাতিল করুন
                          </button>
                        )}

                        {activeProfile.member.paymentStatus === "Pending" && (
                          <button
                            type="button"
                            onClick={() => handleUpdatePaymentStatus(activeProfile.member.formNumber, "Unpaid")}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                          >
                            আবেদন বাতিল
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard metric summary counters */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">মোট বই লেনদেন সংখ্যা</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{activeProfile.rentCount} বার</p>
                  </div>
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">বর্তমানে নেওয়া বই (Issued)</p>
                    <p className="text-2xl font-extrabold text-indigo-600 mt-1 font-mono">{activeProfile.activeRents.length} টি</p>
                  </div>
                </div>

                {/* Active Borrows & History */}
                <div className="space-y-4 pt-1">
                  
                  {/* Presently Active Borrows */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2 uppercase">
                      <BookOpen size={14} className="text-indigo-600" />
                      বর্তমানে ধারকৃত বইসমূহ ({activeProfile.activeRents.length})
                    </h4>
                    {activeProfile.activeRents.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 bg-slate-50 rounded-xl px-4 border border-slate-100">
                        এই মুহূর্তে কোনো বই ইস্যু করা নাই।
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {activeProfile.activeRents.map((item: any) => (
                          <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-900 mb-0.5">{item.bookName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">কোড: {item.bookCode} | ইস্যু ডেট: {item.issueDate}</p>
                            </div>
                            <span className="text-[10px] text-rose-600 font-bold font-mono bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                              ফেরত দিন: {item.returnDate}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Previous books return list */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2 uppercase">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      ফেরত দেওয়া বইয়ের ইতিহাস ({activeProfile.returnedHistory.length})
                    </h4>
                    {activeProfile.returnedHistory.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 bg-slate-50 rounded-xl px-4 border border-slate-100">
                        ইতিপূর্বে বই ফেরত দেওয়ার কোনো ইতিহাস নেই।
                      </p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {activeProfile.returnedHistory.map((item: any) => (
                          <div key={item.id} className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <p className="font-semibold text-slate-800 mb-0.5">{item.bookName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">কোড: {item.bookCode} | ইস্যু: {item.issueDate}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-700 font-semibold font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md">
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
              <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openEditModal(activeProfile.member)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-indigo-300 px-4 py-2.5 rounded-xl text-slate-700 hover:text-indigo-600 cursor-pointer transition-colors w-full sm:w-auto justify-center shadow-xs"
                  >
                    ✏️ তথ্য সম্পাদনা
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 px-4 py-2.5 rounded-xl text-slate-500 cursor-pointer transition-colors w-full sm:w-auto justify-center shadow-xs"
                  >
                    <Trash2 size={13} />
                    সদস্য মুছুন
                  </button>
                </div>
                <button
                  onClick={() => onPreviewMemberSlip(activeProfile)}
                  className="flex items-center gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all w-full sm:w-auto justify-center shadow-sm active:scale-95"
                >
                  <Eye size={14} />
                  গ্রাহক স্লিপ ও আইডি কার্ড
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

      {/* MANUAL EDIT MEMBER MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-120 flex flex-col my-8 max-h-[85vh]">
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5EA] flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-[#22242A] flex items-center gap-2">
                ✏️ সদস্য তথ্য সম্পাদনা (ID: #{editFormNum})
              </h3>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="text-[#6B6B70] hover:text-[#22242A] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            {/* Scrollable Form Area */}
            <div className="p-6 overflow-y-auto space-y-6">
              {editErr && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-lg text-xs text-[#FF6B6B] flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{editErr}</span>
                </div>
              )}

              <form onSubmit={handleEditMemberSubmit} className="space-y-6">
                {/* PHOTO UPLOAD BLOCK */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E5E5EA] flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-[#F5F3EF] border border-[#E5E5EA] overflow-hidden flex items-center justify-center shrink-0 relative">
                    {editPhoto ? (
                      <img src={editPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[#6B6B70] flex flex-col items-center gap-1">
                        <Camera size={20} />
                        <span className="text-[8px] font-bold">ছবি দিন</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <span className="text-[11px] font-bold text-[#22242A] block">সদস্যের ছবি পরিবর্তন করুন</span>
                    <p className="text-[10px] text-[#6B6B70] leading-normal">
                      লাইব্রেরি কার্ড ও ড্যাশবোর্ডের জন্য পাসপোর্ট সাইজের ছবি আপলোড করুন।
                    </p>
                    <div className="flex justify-center sm:justify-start gap-2">
                      <label className="px-3 py-1.5 bg-[#F5F3EF] text-[#22242A] border border-[#E5E5EA] hover:bg-[#F5F3EF] rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors flex items-center gap-1">
                        <Upload size={12} />
                        {editPhotoLoading ? "প্রসেস হচ্ছে..." : (editPhoto ? "ছবি পরিবর্তন" : "ছবি বাছাই করুন")}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditPhotoChange}
                          className="hidden"
                          disabled={editPhotoLoading}
                        />
                      </label>
                      {editPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditPhoto("")}
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
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সদস্যের নাম (বাংলায়) *</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="যেমন: আরিফ উদ্দিন আহমেদ"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সদস্যের নাম (ইংরেজিতে)</label>
                      <input
                        type="text"
                        value={editNameEnglish}
                        onChange={(e) => setEditNameEnglish(e.target.value)}
                        placeholder="যেমন: Arif Uddin Ahmed"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">ফরম নম্বর (ID - অপরিবর্তনীয়)</label>
                      <input
                        type="text"
                        value={editFormNum}
                        disabled
                        className="w-full text-xs p-2.5 bg-[#F5F3EF] border border-[#E5E5EA] rounded-lg text-[#6B6B70] font-mono cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="text"
                        value={editMobile}
                        onChange={(e) => setEditMobile(e.target.value)}
                        placeholder="যেমনঃ 017xxxxxxxx"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">জন্ম তারিখ</label>
                      <input
                        type="date"
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">পিতার নাম</label>
                      <input
                        type="text"
                        value={editFatherName}
                        onChange={(e) => setEditFatherName(e.target.value)}
                        placeholder="পিতার নাম লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">মাতার নাম</label>
                      <input
                        type="text"
                        value={editMotherName}
                        onChange={(e) => setEditMotherName(e.target.value)}
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
                          value={editCurrVillage}
                          onChange={(e) => setEditCurrVillage(e.target.value)}
                          placeholder="গ্রাম/মহল্লা"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">ডাকঘর</label>
                        <input
                          type="text"
                          value={editCurrPostOffice}
                          onChange={(e) => setEditCurrPostOffice(e.target.value)}
                          placeholder="ডাকঘর"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">উপজেলা</label>
                        <input
                          type="text"
                          value={editCurrUpazila}
                          onChange={(e) => setEditCurrUpazila(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">জেলা</label>
                        <input
                          type="text"
                          value={editCurrDistrict}
                          onChange={(e) => setEditCurrDistrict(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div className="space-y-3 bg-white p-3 rounded-xl border border-[#E5E5EA]">
                    <span className="text-[10px] font-black text-[#22242A] block">স্থায়ী ঠিকানা</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">গ্রাম/মহল্লা</label>
                        <input
                          type="text"
                          value={editPermVillage}
                          onChange={(e) => setEditPermVillage(e.target.value)}
                          placeholder="গ্রামের নাম"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">ডাকঘর</label>
                        <input
                          type="text"
                          value={editPermPostOffice}
                          onChange={(e) => setEditPermPostOffice(e.target.value)}
                          placeholder="ডাকঘরের নাম"
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">উপজেলা</label>
                        <input
                          type="text"
                          value={editPermUpazila}
                          onChange={(e) => setEditPermUpazila(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#6B6B70] mb-1">জেলা</label>
                        <input
                          type="text"
                          value={editPermDistrict}
                          onChange={(e) => setEditPermDistrict(e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Single string address fallback */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-[#6B6B70]">অতিরিক্ত বিবরণ/ঠিকানা নোট (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
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
                        value={editBloodGroup}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
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
                        value={editNidBirthReg}
                        onChange={(e) => setEditNidBirthReg(e.target.value)}
                        placeholder="NID / Birth Certificate"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">জাতীয়তা</label>
                      <input
                        type="text"
                        value={editNationality}
                        onChange={(e) => setEditNationality(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">সর্বোচ্চ শিক্ষাগত যোগ্যতা</label>
                      <input
                        type="text"
                        value={editEducationQualification}
                        onChange={(e) => setEditEducationQualification(e.target.value)}
                        placeholder="যেমন: এস.এস.সি / এইচ.এস.সি / অনার্স"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">পেশা</label>
                      <input
                        type="text"
                        value={editProfession}
                        onChange={(e) => setEditProfession(e.target.value)}
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
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        placeholder="যেমন: বড়লেখা কলেজ"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">শ্রেণী</label>
                      <input
                        type="text"
                        value={editClassName}
                        onChange={(e) => setEditClassName(e.target.value)}
                        placeholder="শ্রেণী লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6B70] mb-1">শ্রেণী রোল</label>
                      <input
                        type="text"
                        value={editClassRoll}
                        onChange={(e) => setEditClassRoll(e.target.value)}
                        placeholder="রোল লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-[#E5E5EA] rounded-lg text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5EA]">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 bg-[#F5F3EF] border border-[#E5E5EA] text-[#6B6B70] rounded-lg hover:bg-white text-xs font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#22242A] text-white rounded-lg text-xs font-bold hover:bg-[#2d2f36] cursor-pointer"
                  >
                    পরিবর্তন সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && activeProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 sm:p-7 rounded-3xl w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">সদস্য মুছে ফেলার সতর্কতা</h3>
                <p className="text-xs text-slate-500">ID: #{activeProfile.member.formNumber}</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিতভাবে <strong className="text-slate-900">'{activeProfile.member.name}'</strong> সদস্যকে মুছে ফেলতে চান? উনার ব্যবহারের সব লেনদেন রেকর্ড সিস্টেম থেকে স্থায়ীভাবে অপসারিত হবে।
            </p>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm active:scale-95"
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
