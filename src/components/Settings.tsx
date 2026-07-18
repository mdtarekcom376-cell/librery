import React, { useState, useEffect } from "react";
import { ShieldCheck, UserCheck, KeyRound, AlertTriangle, CheckCircle2, Lock, Sparkles, RefreshCw, Smartphone, Network, Database, Download, Image as ImageIcon, Palette, BookOpen, Users, History, Printer, FileText, ClipboardList, Store, PhoneCall, Plus, Trash2, Edit2, Save, Check, X, Mail, Send } from "lucide-react";
import { apiClient } from "../api";

interface SettingsProps {
  onPreviewBooksList?: (books: any[]) => void;
  onPreviewMembersList?: (members: any[]) => void;
  onPreviewBulkHistory?: (logs: any[]) => void;
}

export default function Settings({ onPreviewBooksList, onPreviewMembersList, onPreviewBulkHistory }: SettingsProps) {
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [settingsUnlockPassword, setSettingsUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");

  const [activeSection, setActiveSection] = useState("branding"); // "branding", "security", "sms", "pdf_reports"

  // Firebase configurations
  const [firebaseApiKey, setFirebaseApiKey] = useState("");
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState("");
  const [firebaseProjectId, setFirebaseProjectId] = useState("");
  const [firebaseStorageBucket, setFirebaseStorageBucket] = useState("");
  const [firebaseMessagingSenderId, setFirebaseMessagingSenderId] = useState("");
  const [firebaseAppId, setFirebaseAppId] = useState("");
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  const [firebaseSuccessMsg, setFirebaseSuccessMsg] = useState("");
  const [firebaseErrorMsg, setFirebaseErrorMsg] = useState("");


  const [pdfLoading, setPdfLoading] = useState("");
  const [pdfError, setPdfError] = useState("");

  const handleGenerateBooksPdf = async () => {
    setPdfError("");
    setPdfLoading("books");
    try {
      const res = await apiClient.get("/books");
      if (res && Array.isArray(res)) {
        if (onPreviewBooksList) {
          onPreviewBooksList(res);
        } else {
          throw new Error("PDF জেনারেটর সক্রিয় নেই।");
        }
      } else {
        throw new Error("বইয়ের তালিকা ডাউনলোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setPdfError(err.message || "বইয়ের PDF রিপোর্ট তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setPdfLoading("");
    }
  };

  const handleGenerateMembersPdf = async () => {
    setPdfError("");
    setPdfLoading("members");
    try {
      const res = await apiClient.get("/members");
      if (res && Array.isArray(res)) {
        if (onPreviewMembersList) {
          onPreviewMembersList(res);
        } else {
          throw new Error("PDF জেনারেটর সক্রিয় নেই।");
        }
      } else {
        throw new Error("সদস্য তালিকা ডাউনলোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setPdfError(err.message || "সদস্যদের PDF রিপোর্ট তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setPdfLoading("");
    }
  };

  const handleGenerateLogsPdf = async () => {
    setPdfError("");
    setPdfLoading("logs");
    try {
      const res = await apiClient.get("/history");
      if (res && Array.isArray(res)) {
        if (onPreviewBulkHistory) {
          onPreviewBulkHistory(res);
        } else {
          throw new Error("PDF জেনারেটর সক্রিয় নেই।");
        }
      } else {
        throw new Error("অডিট লগ তালিকা ডাউনলোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      setPdfError(err.message || "অডিট লগ PDF রিপোর্ট তৈরিতে সমস্যা হয়েছে।");
    } finally {
      setPdfLoading("");
    }
  };

  // System Maintenance
  const [maintLoading, setMaintLoading] = useState("");
  const [maintSuccess, setMaintSuccess] = useState("");
  const [maintError, setMaintError] = useState("");
  const [auditLogsPreview, setAuditLogsPreview] = useState<number | null>(null);

  const handleClearTempFiles = async () => {
    setMaintError("");
    setMaintSuccess("");
    setMaintLoading("temp");
    try {
      const res = await apiClient.post("/settings/maintenance/clear-temp", {});
      if (res && res.success) {
        setMaintSuccess(res.message || "টেম্পোরারি ফাইল সফলভাবে মুছে ফেলা হয়েছে।");
      }
    } catch (err: any) {
      setMaintError(err.message || "টেম্পোরারি ফাইল মুছতে ব্যর্থ।");
    } finally {
      setMaintLoading("");
    }
  };

  const handlePreviewAuditLogs = async () => {
    setMaintError("");
    setMaintSuccess("");
    setMaintLoading("audit_preview");
    try {
      const res = await apiClient.post("/settings/maintenance/clean-audit-logs", { action: 'preview' });
      if (res && res.success) {
        setAuditLogsPreview(res.count);
      }
    } catch (err: any) {
      setMaintError(err.message || "অডিট লগ প্রিভিউ করতে ব্যর্থ।");
    } finally {
      setMaintLoading("");
    }
  };

  const handleCleanAuditLogs = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত? এটি ৩০ দিনের পুরনো লগ স্থায়ীভাবে মুছে ফেলবে।")) return;
    setMaintError("");
    setMaintSuccess("");
    setMaintLoading("audit_clean");
    try {
      const res = await apiClient.post("/settings/maintenance/clean-audit-logs", { action: 'delete' });
      if (res && res.success) {
        setMaintSuccess(res.message || "পুরনো অডিট লগ সফলভাবে মুছে ফেলা হয়েছে।");
        setAuditLogsPreview(null);
      }
    } catch (err: any) {
      setMaintError(err.message || "অডিট লগ মুছতে ব্যর্থ।");
    } finally {
      setMaintLoading("");
    }
  };

  const handleClearFrontendCache = () => {
    setMaintError("");
    setMaintSuccess("");
    setMaintLoading("cache");
    try {
      let count = 0;
      // Clear non-auth keys if any exist, or just clear the known ones (which are auth-related).
      // Since all known keys are auth-related, we'll remove them.
      const keys = ["okkhor_pathagar_token", "okkhor_pathagar_role", "okkhor_pathagar_member"];
      keys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          count++;
        }
      });
      sessionStorage.clear();
      setMaintSuccess(`${count}টি ফ্রন্টএন্ড ক্যাশে কী মুছে ফেলা হয়েছে। (পুনরায় লগইন প্রয়োজন হতে পারে)`);
      // Reload after short delay if auth keys cleared
      if (count > 0) {
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: any) {
      setMaintError("ক্যাশে মুছতে সমস্যা হয়েছে।");
    } finally {
      setMaintLoading("");
    }
  };

  // Newsletter states
  const [nlSubject, setNlSubject] = useState("");
  const [nlBody, setNlBody] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlSuccess, setNlSuccess] = useState("");
  const [nlError, setNlError] = useState("");

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlSubject || !nlBody) {
      setNlError("বিষয় এবং মেসেজ পূরণ করুন।");
      return;
    }
    setNlLoading(true);
    setNlError("");
    setNlSuccess("");
    try {
      const res = await apiClient.post("/admin/newsletter-send", { subject: nlSubject, body: nlBody });
      if (res && res.success) {
        setNlSuccess(res.message || "নিউজলেটার সফলভাবে পাঠানো হয়েছে!");
        setNlSubject("");
        setNlBody("");
      } else {
        setNlError("নিউজলেটার পাঠাতে সমস্যা হয়েছে।");
      }
    } catch (err: any) {
      setNlError(err.message || "নিউজলেটার পাঠাতে ব্যর্থ।");
    } finally {
      setNlLoading(false);
    }
  };

  // Credentials states
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [securityPassword, setSecurityPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Settings password states
  const [currentSettingsPwd, setCurrentSettingsPwd] = useState("");
  const [newSettingsPwd, setNewSettingsPwd] = useState("");
  const [settingsPwdSuccessMsg, setSettingsPwdSuccessMsg] = useState("");
  const [settingsPwdErrorMsg, setSettingsPwdErrorMsg] = useState("");
  const [settingsPwdLoading, setSettingsPwdLoading] = useState(false);

  // Logo Customization state
  const [logoBase64, setLogoBase64] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState("");
  const [logoErrorMsg, setLogoErrorMsg] = useState("");

  // Custom login flow states
  const [isCustomLoginFlowEnabled, setIsCustomLoginFlowEnabled] = useState(false);
  const [loginFlowLoading, setLoginFlowLoading] = useState(false);
  const [loginFlowSuccessMsg, setLoginFlowSuccessMsg] = useState("");
  const [loginFlowErrorMsg, setLoginFlowErrorMsg] = useState("");

  // SMS Template configurations
  const [smsTemplate, setSmsTemplate] = useState("");
  const [smsTemplateLoading, setSmsTemplateLoading] = useState(false);
  const [smsSuccessMsg, setSmsSuccessMsg] = useState("");
  const [smsErrorMsg, setSmsErrorMsg] = useState("");

  // Live SMS Gateway Configurations
  const [smsProvider, setSmsProvider] = useState("simulated"); // 'simulated', 'greenweb', 'bulksmsbd', 'custom'
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsSenderId, setSmsSenderId] = useState("");
  const [smsCustomUrl, setSmsCustomUrl] = useState("");
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewaySuccessMsg, setGatewaySuccessMsg] = useState("");
  const [gatewayErrorMsg, setGatewayErrorMsg] = useState("");



  // Groups Management states
  const [groups, setGroups] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [groupSuccess, setGroupSuccess] = useState("");

  // Sales Corner Categories Management states
  const [shopCategories, setShopCategories] = useState<string[]>([]);
  const [newShopCategoryName, setNewShopCategoryName] = useState("");
  const [shopCategoryLoading, setShopCategoryLoading] = useState(false);
  const [shopCategoryError, setShopCategoryError] = useState("");
  const [shopCategorySuccess, setShopCategorySuccess] = useState("");

  // Active confirm state for safe deletion without window.confirm (iframe friendly)
  const [activeConfirmGroup, setActiveConfirmGroup] = useState<string | null>(null);
  const [activeConfirmCategory, setActiveConfirmCategory] = useState<string | null>(null);
  const [activeConfirmLogoReset, setActiveConfirmLogoReset] = useState(false);

  // Payment methods states
  interface PaymentMethodItem {
    id: string;
    name: string;
    type: string;
    number: string;
  }
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [newPaymentName, setNewPaymentName] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("Personal");
  const [newPaymentNumber, setNewPaymentNumber] = useState("");
  const [activeConfirmPaymentDelete, setActiveConfirmPaymentDelete] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      const res = await apiClient.get("/public/payment-methods");
      if (res && res.success) {
        setPaymentMethods(res.paymentMethods || []);
      }
    } catch (err: any) {
      console.warn("পেমেন্ট মাধ্যমসমূহ লোড করতে ব্যর্থ:", err);
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess("");
    if (!newPaymentName.trim()) {
      setPaymentError("পেমেন্ট মাধ্যমের নাম প্রদান করুন (যেমন: বিকাশ)");
      return;
    }
    if (!newPaymentNumber.trim()) {
      setPaymentError("মোবাইল নম্বর প্রদান করুন (যেমন: ০১৩৩৩৪৭৮৪৪৮)");
      return;
    }

    setPaymentLoading(true);
    try {
      const updatedList = [
        ...paymentMethods,
        {
          id: `pm-${Date.now()}`,
          name: newPaymentName.trim(),
          type: newPaymentType.trim(),
          number: newPaymentNumber.trim()
        }
      ];

      const res = await apiClient.post("/settings/payment-methods", { paymentMethods: updatedList });
      if (res && res.success) {
        setPaymentMethods(res.paymentMethods || []);
        setNewPaymentName("");
        setNewPaymentNumber("");
        setNewPaymentType("Personal");
        setPaymentSuccess("নতুন পেমেন্ট মাধ্যমটি সফলভাবে যোগ করা হয়েছে!");
      }
    } catch (err: any) {
      setPaymentError(err.message || "পেমেন্ট মাধ্যম যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (activeConfirmPaymentDelete !== id) {
      setActiveConfirmPaymentDelete(id);
      setTimeout(() => {
        setActiveConfirmPaymentDelete(prev => prev === id ? null : prev);
      }, 3000);
      return;
    }
    setActiveConfirmPaymentDelete(null);
    setPaymentError("");
    setPaymentSuccess("");
    setPaymentLoading(true);

    try {
      const updatedList = paymentMethods.filter(pm => pm.id !== id);
      const res = await apiClient.post("/settings/payment-methods", { paymentMethods: updatedList });
      if (res && res.success) {
        setPaymentMethods(res.paymentMethods || []);
        setPaymentSuccess("পেমেন্ট মাধ্যমটি ডিলিট করা হয়েছে।");
      }
    } catch (err: any) {
      setPaymentError(err.message || "পেমেন্ট মাধ্যম ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdatePaymentMethodField = (id: string, field: "name" | "type" | "number", value: string) => {
    setPaymentMethods(prev => prev.map(pm => pm.id === id ? { ...pm, [field]: value } : pm));
  };

  const handleSaveAllPaymentMethods = async () => {
    setPaymentError("");
    setPaymentSuccess("");
    
    // Validate
    for (const pm of paymentMethods) {
      if (!pm.name.trim()) {
        setPaymentError("সবগুলো পেমেন্ট মাধ্যমের নাম পূরণ করা আবশ্যক!");
        return;
      }
      if (!pm.number.trim()) {
        setPaymentError("সবগুলো পেমেন্ট মাধ্যমের নম্বর পূরণ করা আবশ্যক!");
        return;
      }
    }

    setPaymentLoading(true);
    try {
      const res = await apiClient.post("/settings/payment-methods", { paymentMethods });
      if (res && res.success) {
        setPaymentMethods(res.paymentMethods || []);
        setPaymentSuccess("সকল পেমেন্ট মাধ্যম ও নম্বর সফলভাবে আপডেট করা হয়েছে!");
      }
    } catch (err: any) {
      setPaymentError(err.message || "পেমেন্ট মাধ্যমগুলো সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchShopCategories = async () => {
    try {
      const res = await apiClient.get("/public/shop/categories");
      if (res && res.success) {
        setShopCategories(res.categories);
      }
    } catch (err) {
      console.warn("বিক্রয় ক্যাটাগরি সমূহ লোড করতে ব্যর্থ:", err);
    }
  };

  const handleAddShopCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setShopCategoryError("");
    setShopCategorySuccess("");
    if (!newShopCategoryName.trim()) return;

    setShopCategoryLoading(true);
    try {
      const res = await apiClient.post("/settings/shop/categories", { categoryName: newShopCategoryName.trim() });
      if (res && res.success) {
        setShopCategories(res.categories);
        setNewShopCategoryName("");
        setShopCategorySuccess("ক্যাটাগরি/গ্রুপটি সফলভাবে যোগ করা হয়েছে!");
      }
    } catch (err: any) {
      setShopCategoryError(err.message || "ক্যাটাগরি যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setShopCategoryLoading(false);
    }
  };

  const handleDeleteShopCategory = async (categoryName: string) => {
    if (activeConfirmCategory !== categoryName) {
      setActiveConfirmCategory(categoryName);
      setTimeout(() => {
        setActiveConfirmCategory(prev => prev === categoryName ? null : prev);
      }, 3000);
      return;
    }
    setActiveConfirmCategory(null);
    setShopCategoryError("");
    setShopCategorySuccess("");

    try {
      const res = await apiClient.delete(`/settings/shop/categories/${encodeURIComponent(categoryName)}`);
      if (res && res.success) {
        setShopCategories(res.categories);
        setShopCategorySuccess("ক্যাটাগরি/গ্রুপটি সফলভাবে ডিলিট করা হয়েছে।");
      }
    } catch (err: any) {
      setShopCategoryError(err.message || "ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  // Sales Corner Helpline states
  const [shopHelplineNumber, setShopHelplineNumber] = useState("");
  const [shopHelplineText, setShopHelplineText] = useState("");
  const [shopHelplineLoading, setShopHelplineLoading] = useState(false);
  const [shopHelplineError, setShopHelplineError] = useState("");
  const [shopHelplineSuccess, setShopHelplineSuccess] = useState("");

  const fetchShopHelpline = async () => {
    try {
      const res = await apiClient.get("/public/shop/helpline");
      if (res && res.success && res.helpline) {
        setShopHelplineNumber(res.helpline.number);
        setShopHelplineText(res.helpline.text);
      }
    } catch (err) {
      console.warn("হেল্পলাইন তথ্য লোড করতে ব্যর্থ:", err);
    }
  };

  const handleUpdateShopHelpline = async (e: React.FormEvent) => {
    e.preventDefault();
    setShopHelplineError("");
    setShopHelplineSuccess("");
    if (!shopHelplineNumber.trim() || !shopHelplineText.trim()) {
      setShopHelplineError("হেল্পলাইন নাম্বার এবং ক্রয় করার নির্দেশিকা ফাঁকা রাখা যাবে না!");
      return;
    }

    setShopHelplineLoading(true);
    try {
      const res = await apiClient.post("/settings/shop/helpline", {
        number: shopHelplineNumber.trim(),
        text: shopHelplineText.trim()
      });
      if (res && res.success) {
        setShopHelplineNumber(res.helpline.number);
        setShopHelplineText(res.helpline.text);
        setShopHelplineSuccess("হেল্পলাইন এবং ক্রয় নির্দেশিকা সফলভাবে আপডেট করা হয়েছে!");
        window.dispatchEvent(new Event("helpline-updated"));
      }
    } catch (err: any) {
      setShopHelplineError(err.message || "হেল্পলাইন আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setShopHelplineLoading(false);
    }
  };

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

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupError("");
    setGroupSuccess("");
    if (!newGroupName.trim()) return;

    setGroupLoading(true);
    try {
      const res = await apiClient.post("/settings/groups", { groupName: newGroupName.trim() });
      if (res && res.success) {
        setGroups(res.groups);
        setNewGroupName("");
        setGroupSuccess("গ্রুপটি সফলভাবে যোগ করা হয়েছে!");
      }
    } catch (err: any) {
      setGroupError(err.message || "গ্রুপ যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setGroupLoading(false);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (activeConfirmGroup !== groupName) {
      setActiveConfirmGroup(groupName);
      setTimeout(() => {
        setActiveConfirmGroup(prev => prev === groupName ? null : prev);
      }, 3000);
      return;
    }
    setActiveConfirmGroup(null);
    setGroupError("");
    setGroupSuccess("");

    try {
      const res = await apiClient.delete(`/settings/groups/${encodeURIComponent(groupName)}`);
      if (res && res.success) {
        setGroups(res.groups);
        setGroupSuccess("গ্রুপটি সফলভাবে ডিলিট করা হয়েছে।");
      }
    } catch (err: any) {
      setGroupError(err.message || "গ্রুপ ডিলিট করতে সমস্যা হয়েছে।");
    }
  };

  useEffect(() => {
    const fetchSmsTemplate = async () => {
      setSmsTemplateLoading(true);
      try {
        const res = await apiClient.get("/sms/template");
        setSmsTemplate(res.template || "");
      } catch (err: any) {
        if (err?.message && (err.message.includes("সেশন") || err.message.includes("মেয়াদ") || err.message.includes("অননুমোদিত"))) {
          console.log("SMS template load deferred: session expired or unauthorized.");
        } else {
          console.warn("SMS template load failed:", err);
        }
      } finally {
        setSmsTemplateLoading(false);
      }
    };

    const fetchSmsGateway = async () => {
      setGatewayLoading(true);
      try {
        const res = await apiClient.get("/sms/gateway");
        setSmsProvider(res.provider || "simulated");
        setSmsApiKey(res.apiKey || "");
        setSmsSenderId(res.senderId || "");
        setSmsCustomUrl(res.customUrl || "");
      } catch (err: any) {
        if (err?.message && (err.message.includes("সেশন") || err.message.includes("মেয়াদ") || err.message.includes("অননুমোদিত"))) {
          console.log("SMS gateway load deferred: session expired.");
        } else {
          console.warn("SMS gateway settings error:", err);
        }
      } finally {
        setGatewayLoading(false);
      }
    };



    const fetchLogo = async () => {
      try {
        const res = await apiClient.get("/public/logo");
        setLogoBase64(res.logoBase64 || "");
      } catch (err: any) {
        console.warn("Logo load deferred:", err);
      }
    };

    const fetchLoginFlowSetting = async () => {
      try {
        const res = await apiClient.get("/public/settings/login-flow");
        if (res && res.success) {
          setIsCustomLoginFlowEnabled(!!res.isCustomLoginFlowEnabled);
        }
      } catch (err) {
        console.warn("Login flow load deferred:", err);
      }
    };

    const fetchFirebaseConfig = async () => {
      try {
        const res = await apiClient.get("/public/firebase-config");
        setFirebaseApiKey(res.apiKey || "");
        setFirebaseAuthDomain(res.authDomain || "");
        setFirebaseProjectId(res.projectId || "");
        setFirebaseStorageBucket(res.storageBucket || "");
        setFirebaseMessagingSenderId(res.messagingSenderId || "");
        setFirebaseAppId(res.appId || "");
      } catch (err: any) {
        console.warn("Firebase config load deferred:", err);
      }
    };

    fetchSmsTemplate();
    fetchSmsGateway();

    fetchLogo();
    fetchLoginFlowSetting();
    fetchGroups();
    fetchShopCategories();
    fetchShopHelpline();
    fetchPaymentMethods();
    fetchFirebaseConfig();
  }, []);

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseSuccessMsg("");
    setFirebaseErrorMsg("");
    setFirebaseLoading(true);

    try {
      await apiClient.post("/settings/firebase-config", {
        apiKey: firebaseApiKey,
        authDomain: firebaseAuthDomain,
        projectId: firebaseProjectId,
        storageBucket: firebaseStorageBucket,
        messagingSenderId: firebaseMessagingSenderId,
        appId: firebaseAppId,
      });
      setFirebaseSuccessMsg("ফায়ারবেস কনফিগারেশন সফলভাবে সেভ করা হয়েছে!");
    } catch (err: any) {
      setFirebaseErrorMsg(err.message || "ফায়ারবেস কনফিগারেশন সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setFirebaseLoading(false);
    }
  };

  const handleToggleLoginFlow = async (checked: boolean) => {
    setLoginFlowErrorMsg("");
    setLoginFlowSuccessMsg("");
    setLoginFlowLoading(true);
    try {
      const res = await apiClient.post("/settings/login-flow", { isEnabled: checked });
      if (res && res.success) {
        setIsCustomLoginFlowEnabled(res.isCustomLoginFlowEnabled);
        setLoginFlowSuccessMsg(checked ? "কাস্টম লগইন ফ্লো সফলভাবে সক্রিয় করা হয়েছে!" : "কাস্টম লগইন ফ্লো সফলভাবে নিষ্ক্রিয় করা হয়েছে!");
        window.dispatchEvent(new Event("login-flow-changed"));
      }
    } catch (err: any) {
      setLoginFlowErrorMsg(err.message || "লগইন ফ্লো সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।");
    } finally {
      setLoginFlowLoading(false);
    }
  };

  const handleVerifySettingsPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError("");
    if (!settingsUnlockPassword) {
      setUnlockError("পাসওয়ার্ড প্রদান করুন!");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.post("/settings/verify-password", { password: settingsUnlockPassword });
      if (res && res.success) {
        setIsSettingsUnlocked(true);
      }
    } catch (err: any) {
      setUnlockError(err.message || "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSettingsPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsPwdErrorMsg("");
    setSettingsPwdSuccessMsg("");
    if (!currentSettingsPwd || !newSettingsPwd) {
      setSettingsPwdErrorMsg("সব তথ্য পূরণ করুন!");
      return;
    }
    setSettingsPwdLoading(true);
    try {
      const res = await apiClient.post("/settings/change-password", {
        currentPassword: currentSettingsPwd,
        newPassword: newSettingsPwd
      });
      if (res && res.success) {
        setSettingsPwdSuccessMsg("সেটিংস পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");
        setCurrentSettingsPwd("");
        setNewSettingsPwd("");
      }
    } catch (err: any) {
      setSettingsPwdErrorMsg(err.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
    } finally {
      setSettingsPwdLoading(false);
    }
  };

  const handleUpdateSmsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsErrorMsg("");
    setSmsSuccessMsg("");
    setSmsTemplateLoading(true);

    try {
      await apiClient.post("/sms/template", { template: smsTemplate });
      setSmsSuccessMsg("রিমাইন্ডার SMS টেমপ্লেট সফলভাবে আপডেট করা হয়েছে!");
    } catch (err: any) {
      setSmsErrorMsg(err.message || "টেমপ্লেট কাস্টমাইজেশন সেভ করা ব্যর্থ হয়েছে।");
    } finally {
      setSmsTemplateLoading(false);
    }
  };

  const handleUpdateSmsGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayErrorMsg("");
    setGatewaySuccessMsg("");
    setGatewayLoading(true);

    try {
      await apiClient.post("/sms/gateway", {
        provider: smsProvider,
        apiKey: smsApiKey,
        senderId: smsSenderId,
        customUrl: smsCustomUrl,
      });
      setGatewaySuccessMsg("SMS গেটওয়ে কনফিগারেশন সফলভাবে সেভ করা হয়েছে!");
    } catch (err: any) {
      setGatewayErrorMsg(err.message || "গেটওয়ে কনফিগারেশন সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setGatewayLoading(false);
    }
  };



  const handleLogoUploadInSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    setLogoErrorMsg("");
    setLogoSuccessMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let processedBase64 = event.target?.result as string;

        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const pixels = imgData.data;

          let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
          let found = false;

          for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
              const index = (y * img.width + x) * 4;
              const r = pixels[index];
              const g = pixels[index + 1];
              const b = pixels[index + 2];
              const a = pixels[index + 3];

              const isWhite = r > 245 && g > 245 && b > 245;
              const isTransparent = a < 20;

              if (!isWhite && !isTransparent) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
              }
            }
          }

          if (found) {
            const cropWidth = maxX - minX + 1;
            const cropHeight = maxY - minY + 1;
            
            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = cropWidth;
            cropCanvas.height = cropHeight;
            const cropCtx = cropCanvas.getContext("2d");
            
            if (cropCtx) {
              cropCtx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
              processedBase64 = cropCanvas.toDataURL();
            }
          }
        }

        try {
          await apiClient.post("/settings/logo", { logoBase64: processedBase64 });
          setLogoBase64(processedBase64);
          setLogoSuccessMsg("পাঠাগারের লোগোটি সফলভাবে পরিবর্তন ও ডেটাবেজে সংরক্ষণ করা হয়েছে!");
          window.dispatchEvent(new Event("logo-changed"));
        } catch (err: any) {
          setLogoErrorMsg(err.message || "লোগো সংরক্ষণ করা ব্যর্থ হয়েছে।");
        } finally {
          setLogoLoading(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = async () => {
    if (!activeConfirmLogoReset) {
      setActiveConfirmLogoReset(true);
      setTimeout(() => setActiveConfirmLogoReset(false), 3000);
      return;
    }
    setActiveConfirmLogoReset(false);
    setLogoLoading(true);
    setLogoErrorMsg("");
    setLogoSuccessMsg("");
    try {
      await apiClient.post("/settings/logo", { logoBase64: "" });
      setLogoBase64("");
      setLogoSuccessMsg("লোগোটি সফলভাবে ডিফল্ট অবস্থায় ফিরিয়ে নেওয়া হয়েছে।");
      window.dispatchEvent(new Event("logo-changed"));
    } catch (err: any) {
      setLogoErrorMsg(err.message || "লোগো রিসেট করতে সমস্যা হয়েছে।");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUsername || !currentPassword || !securityPassword || !newUsername || !newPassword) {
      setErrorMsg("অনুরোধটি সম্পন্ন করার জন্য ফর্মের সকল তথ্য পূরণ করুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/change-credentials", {
        currentUsername: currentUsername.trim(),
        currentPassword: currentPassword,
        securityPassword: securityPassword.trim(),
        newUsername: newUsername.trim(),
        newPassword: newPassword,
      });

      setSuccessMsg(res.message || "ক্রেডেনশিয়াল সফলভাবে সংশোধিত হয়েছে!");
      setCurrentUsername("");
      setCurrentPassword("");
      setSecurityPassword("");
      setNewUsername("");
      setNewPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "ক্রেডেনশিয়াল সংশোধন করা ব্যর্থ হয়েছে। সিকিউরিটি পাসওয়ার্ড বা পূর্বের ইউজার তথ্য রি-চেক করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (!isSettingsUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-12  p-8 rounded-2xl border border-[#E5E5EA] text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[#22242A]">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">🔒 সংরক্ষিত এলাকা (Protected Settings)</h2>
          <p className="text-xs text-[#6B6B70] leading-relaxed">
            নিরাপত্তার স্বার্থে সেটিংস প্যানেলে প্রবেশের জন্য পাসওয়ার্ড প্রদান করুন।
          </p>
        </div>

        {unlockError && (
          <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#FF6B6B]">
            {unlockError}
          </div>
        )}

        <form onSubmit={handleVerifySettingsPassword} className="space-y-4">
          <input
            type="password"
            value={settingsUnlockPassword}
            onChange={(e) => setSettingsUnlockPassword(e.target.value)}
            placeholder="পাসওয়ার্ড লিখুন"
            className="w-full text-center text-xs p-3.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A]"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-none flex items-center justify-center gap-1.5 transition-all"
          >
            {loading && <RefreshCw className="animate-spin" size={14} />}
            প্রবেশ করুন
          </button>
        </form>

        <p className="text-[10px] text-[#6B6B70] leading-normal">
          ডিফল্ট সেটিংস পাসওয়ার্ড: <span className="font-mono text-[#22242A] font-bold">PASSWORD</span> অথবা আপনার <span className="font-semibold text-[#22242A]">অ্যাডমিন পাসওয়ার্ড</span> ব্যবহার করুন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5EA] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#22242A] flex items-center gap-2">⚙️ সেটিংস ও কনফিগারেশন প্যানেল</h2>
          <p className="text-[11px] text-[#6B6B70] mt-0.5">আপনার পাঠাগারের মূল ব্র্যান্ডিং, সিকিউরিটি কী, এসএমএস গেটওয়ে এবং গুগল ড্রাইভে সিঙ্ক সেট করুন</p>
        </div>
        <button
          onClick={() => {
            setIsSettingsUnlocked(false);
          }}
          className="self-start sm:self-center px-3 py-1.5 bg-[#F5F3EF] hover:bg-white border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#6B6B70] hover:text-[#FF6B6B] text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
        >
          🔒 সেটিংস লক করুন
        </button>
      </div>

      {/* Modern Horizontal Tabs for Segmented View */}
      <div className="flex flex-wrap gap-2 p-1 bg-white border border-[#E5E5EA] rounded-xl">
        <button
          onClick={() => setActiveSection("branding")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "branding"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          🎨 ব্র্যান্ডিং ও গ্রুপ
        </button>
        <button
          onClick={() => setActiveSection("security")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "security"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          🔒 সিকিউরিটি ও পাসওয়ার্ড
        </button>

        <button
          onClick={() => setActiveSection("sms")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "sms"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          💬 SMS গেটওয়ে
        </button>
        <button
          onClick={() => setActiveSection("pdf_reports")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "pdf_reports"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          📄 PDF রিপোর্টস
        </button>
        <button
          onClick={() => setActiveSection("payment_methods")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "payment_methods"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          💳 পেমেন্ট মাধ্যম
        </button>
        <button
          onClick={() => setActiveSection("firebase")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "firebase"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          🔥 ফায়ারবেস সেটিংস
        </button>
        <button
          onClick={() => setActiveSection("system_maintenance")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "system_maintenance"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          🛠️ সিস্টেম মেইনটেন্যান্স
        </button>
        <button
          onClick={() => setActiveSection("newsletter")}
          className={`flex-1 min-w-[130px] px-3 py-2.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeSection === "newsletter"
              ? "bg-[#22242A] text-white shadow-md shadow-none"
              : "text-[#6B6B70] hover:bg-[#F5F3EF] hover:text-[#22242A]"
          }`}
        >
          ✉️ নিউজলেটার
        </button>
      </div>

      {/* Section Content */}
      <div className="transition-all duration-300">
        
        {/* TAB 1: BRANDING & GROUPS */}
        {activeSection === "branding" && (
          <div className="space-y-6">
            {/* Logo & Branding Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-6">
                <ImageIcon size={15} className="text-[#22242A]" />
                পাঠাগারের মূল লোগো ও ব্র্যান্ডিং কাস্টমাইজেশন
              </h3>

              {logoErrorMsg && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 mb-4">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{logoErrorMsg}</span>
                </div>
              )}

              {logoSuccessMsg && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-3 mb-4">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{logoSuccessMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-6 relative">
                {/* Logo Preview */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] text-[#6B6B70] font-bold uppercase tracking-wider">বর্তমান লোগো</span>
                  <div className="w-24 h-24 rounded-2xl bg-white border border-[#E5E5EA] shadow-lg flex items-center justify-center p-2 overflow-hidden">
                    {logoBase64 ? (
                      <img src={logoBase64} alt="Library Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-xs text-[#6B6B70] font-semibold text-center leading-normal">ডিফল্ট লোগো<br/>(অক্ষর)</div>
                    )}
                  </div>
                </div>

                {/* Logo Action Options */}
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-[#22242A] leading-relaxed">
                    আপনার পাঠাগারের জন্য একটি কাস্টম লোগো আপলোড করুন। ছবির চারপাশের অতিরিক্ত সাদা অংশ থাকলে সিস্টেম তা স্বয়ংক্রিয়ভাবে <strong>অটো-ক্রপ</strong> করে ডেটাবেজে সংরক্ষণ করবে।
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <label className="px-5 py-2.5 bg-gradient-to-r bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-1.5 transition-all">
                      {logoLoading ? (
                        <RefreshCw className="animate-spin" size={13} />
                      ) : (
                        <ImageIcon size={13} />
                      )}
                      নতুন লোগো আপলোড করুন
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUploadInSettings}
                        className="hidden"
                        disabled={logoLoading}
                      />
                    </label>

                    {logoBase64 && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        disabled={logoLoading}
                        className={`px-4 py-2.5 border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                          activeConfirmLogoReset 
                            ? "bg-[#F5F3EF] border-[#E5E5EA] text-[#FF6B6B] animate-pulse" 
                            : "bg-[#F5F3EF] hover:bg-white border border-[#E5E5EA] hover:border-[#E5E5EA] text-[#FF6B6B] hover:text-[#FF6B6B]"
                        }`}
                      >
                        {activeConfirmLogoReset ? "⚠️ নিশ্চিতভাবে রিসেট করবেন?" : "ডিফল্ট লোগোতে ফিরুন"}
                      </button>
                    )}
                  </div>
                  <p className="text-[9px] text-[#6B6B70]">
                    * প্রস্তাবিত সাইজ: ৫০০ x ৫০০ পিক্সেল। লোগো পরিবর্তন করলে তা লগইন স্ক্রিন ও অ্যাপ হেডার উভয় জায়গায় সাথে সাথে আপডেট হবে।
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Login Flow Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <UserCheck size={15} className="text-[#22242A]" />
                মেম্বারশিপ যাচাই ও লগইন ফ্লো কনফিগারেশন
              </h3>

              {loginFlowErrorMsg && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{loginFlowErrorMsg}</span>
                </div>
              )}

              {loginFlowSuccessMsg && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#22242A] flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{loginFlowSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4 relative">
                <div className="flex items-center justify-between p-3.5 bg-[#070b16]/60 rounded-xl border border-[#E5E5EA]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#22242A] block font-sans">কাস্টম সদস্যতা যাচাইকরণ স্ক্রিন</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomLoginFlowEnabled}
                      onChange={(e) => handleToggleLoginFlow(e.target.checked)}
                      disabled={loginFlowLoading}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-[#E5E5EA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F5F3EF] peer-checked:after:bg-white peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Book Group Management Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Palette size={15} className="text-[#22242A]" />
                বইয়ের গ্রুপ বা কর্নার কাস্টমাইজেশন
              </h3>

              {groupError && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{groupError}</span>
                </div>
              )}

              {groupSuccess && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#22242A] flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{groupSuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-xs text-[#22242A] leading-relaxed">
                  লাইব্রেরির বইগুলোকে বিভিন্ন ক্যাটাগরি বা গ্রুপে (যেমন: উপন্যাস, গল্প, নজরুল কর্নার ইত্যাদি) বিভক্ত করুন। সদস্যরা সার্চ বারের নিচে এই গ্রুপগুলো দেখতে পাবে এবং ক্লিক করে ফিল্টার করতে পারবে।
                </p>

                <form onSubmit={handleAddGroup} className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="নতুন গ্রুপের নাম (যেমন: কল্পবিজ্ঞান)"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A]"
                  />
                  <button
                    type="submit"
                    disabled={groupLoading}
                    className="px-4 py-2.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] disabled:opacity-50 text-[#22242A] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    {groupLoading ? <RefreshCw className="animate-spin" size={13} /> : "+"} গ্রুপ যোগ করুন
                  </button>
                </form>

                <div>
                  <h4 className="text-[10px] font-bold text-[#6B6B70] mb-2.5 uppercase tracking-wide">বিদ্যমান গ্রুপসমূহ:</h4>
                  {groups.length === 0 ? (
                    <p className="text-xs text-[#6B6B70] italic">কোনো কাস্টম গ্রুপ নেই।</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {groups.map((grp) => (
                        <div
                          key={grp}
                          className="px-3 py-1.5 bg-white border border-[#E5E5EA] rounded-xl text-xs text-[#22242A] flex items-center gap-2 hover:border-[#E5E5EA] transition-all group"
                        >
                          <span>{grp}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroup(grp)}
                            className={`transition-colors focus:outline-none cursor-pointer text-[10px] font-bold ${
                              activeConfirmGroup === grp 
                                ? "text-[#FF6B6B] hover:text-[#FF6B6B] bg-[#F5F3EF] px-1.5 py-0.5 rounded animate-pulse" 
                                : "text-[#6B6B70] hover:text-[#FF6B6B]"
                            }`}
                          >
                            {activeConfirmGroup === grp ? "✕ নিশ্চিত?" : "✕"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales Corner Category Management Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Store size={15} className="text-[#22242A]" />
                বিক্রয় কর্নার ক্যাটাগরি বা গ্রুপ কাস্টমাইজেশন
              </h3>

              {shopCategoryError && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{shopCategoryError}</span>
                </div>
              )}

              {shopCategorySuccess && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#22242A] flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{shopCategorySuccess}</span>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-xs text-[#22242A] leading-relaxed">
                  বিক্রয় কর্নারের উপহার সামগ্রী ও প্রোডাক্টসমূহকে বিভিন্ন ক্যাটাগরি বা গ্রুপে (যেমন: টি-শার্ট, ডায়েরি, মগ, প্যাড ইত্যাদি) বিভক্ত করুন। ব্যবহারকারীরা বিক্রয় কর্নারে এই গ্রুপগুলো দিয়ে ফিল্টার করতে পারবেন।
                </p>

                <form onSubmit={handleAddShopCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newShopCategoryName}
                    onChange={(e) => setNewShopCategoryName(e.target.value)}
                    placeholder="নতুন বিক্রয় ক্যাটাগরি বা গ্রুপ (যেমন: চাবির রিং)"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A]"
                  />
                  <button
                    type="submit"
                    disabled={shopCategoryLoading}
                    className="px-4 py-2.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] disabled:opacity-50 text-[#22242A] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    {shopCategoryLoading ? <RefreshCw className="animate-spin" size={13} /> : "+"} গ্রুপ যোগ করুন
                  </button>
                </form>

                <div>
                  <h4 className="text-[10px] font-bold text-[#6B6B70] mb-2.5 uppercase tracking-wide">বিদ্যমান গ্রুপসমূহ:</h4>
                  {shopCategories.length === 0 ? (
                    <p className="text-xs text-[#6B6B70] italic">কোনো কাস্টম বিক্রয় ক্যাটাগরি নেই।</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {shopCategories.map((cat) => (
                        <div
                          key={cat}
                          className="px-3 py-1.5 bg-white border border-[#E5E5EA] rounded-xl text-xs text-[#22242A] flex items-center gap-2 hover:border-[#E5E5EA] transition-all group"
                        >
                          <span>{cat}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteShopCategory(cat)}
                            className={`transition-colors focus:outline-none cursor-pointer text-[10px] font-bold ${
                              activeConfirmCategory === cat 
                                ? "text-[#FF6B6B] hover:text-[#FF6B6B] bg-[#F5F3EF] px-1.5 py-0.5 rounded animate-pulse" 
                                : "text-[#6B6B70] hover:text-[#FF6B6B]"
                            }`}
                          >
                            {activeConfirmCategory === cat ? "✕ নিশ্চিত?" : "✕"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales Corner Helpline & Purchase Guidelines Settings Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <PhoneCall size={15} className="text-[#22242A]" />
                বিক্রয় কর্নার হেল্পলাইন ও ক্রয় নির্দেশিকা কাস্টমাইজেশন
              </h3>

              {shopHelplineError && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{shopHelplineError}</span>
                </div>
              )}

              {shopHelplineSuccess && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-3 rounded-xl text-xs text-[#22242A] flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{shopHelplineSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateShopHelpline} className="space-y-4">
                <p className="text-xs text-[#22242A] leading-relaxed">
                  বিক্রয় কর্নারের ক্রয় করার নির্দেশিকা এবং পণ্য ক্রয় করতে যোগাযোগের হেল্পলাইন নাম্বারটি আপনার ইচ্ছেমতো পরিবর্তন বা এডিট করুন।
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-bold text-[#6B6B70] uppercase tracking-wide">হেল্পলাইন নাম্বার:</label>
                    <input
                      type="text"
                      value={shopHelplineNumber}
                      onChange={(e) => setShopHelplineNumber(e.target.value)}
                      placeholder="যেমন: ০১৩৩৩৪৭৮৪৪৮"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#6B6B70] uppercase tracking-wide">ক্রয় করার নির্দেশিকা বার্তা:</label>
                    <textarea
                      value={shopHelplineText}
                      onChange={(e) => setShopHelplineText(e.target.value)}
                      rows={2}
                      placeholder="ক্রয় করার বিবরণ বা নির্দেশিকা এখানে লিখুন..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={shopHelplineLoading}
                    className="px-4 py-2.5 bg-[#F5F3EF] hover:bg-[#F5F3EF] disabled:opacity-50 text-[#22242A] text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {shopHelplineLoading ? <RefreshCw className="animate-spin" size={13} /> : <CheckCircle2 size={13} />}
                    তথ্য পরিবর্তন করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORDS */}
        {activeSection === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Change Admin Credentials */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-6">
                <ShieldCheck size={15} className="text-[#22242A] animate-pulse" />
                অ্যাডমিন ক্রেডেনশিয়াল সংশোধন (Username/Password)
              </h3>

              {errorMsg && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 mb-4">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-3 mb-4 animate-pulse">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateCredentials} className="space-y-4 relative">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">বর্তমান ইউজারনেম (Username)</label>
                  <input
                    type="text"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value)}
                    placeholder="বর্তমান ইউজারনেম"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">বর্তমান পাসওয়ার্ড (Password)</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="বর্তমান পাসওয়ার্ড"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">সিকিউরিটি পিন/পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={securityPassword}
                    onChange={(e) => setSecurityPassword(e.target.value)}
                    placeholder="সিকিউরিটি পিন"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">নতুন ইউজারনেম</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="নতুন ইউজারনেম"
                      className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5">নতুন পাসওয়ার্ড</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs focus:outline-none focus:border-[#22242A] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 bg-[#22242A] hover:bg-[#2d2f36] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    আপডেট করুন
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        )}
        {/* TAB 4: SMS CONFIGURATION */}
        {activeSection === "sms" && (
          <div className="space-y-6">
            
            {/* Custom SMS Template configurations */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-6">
                <Sparkles size={15} className="text-[#22242A]" />
                বকেয়া বই ফেরতের শিডিউল রিমাইন্ডার SMS কাস্টমাইজেশন
              </h3>

              {smsErrorMsg && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 mb-4">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{smsErrorMsg}</span>
                </div>
              )}

              {smsSuccessMsg && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-3 mb-4 animate-pulse">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{smsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSmsTemplate} className="space-y-4 relative">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5 flex justify-between">
                    <span>মেসেজ টেক্সট কাস্টমাইজ করুন *</span>
                    <span className="text-[#22242A] font-mono text-[9px]">ডাইনামিক প্লেসহোল্ডার সমর্থন করে</span>
                  </label>

                  {smsTemplateLoading && !smsTemplate ? (
                    <div className="h-28 bg-white rounded-xl flex items-center justify-center border border-[#E5E5EA]">
                      <RefreshCw className="animate-spin text-[#22242A]" size={20} />
                    </div>
                  ) : (
                    <textarea
                      value={smsTemplate}
                      onChange={(e) => setSmsTemplate(e.target.value)}
                      placeholder="আসসালামু আলাইকুম, আপনার ({bookName}) বইটি..."
                      rows={5}
                      className="w-full text-xs p-3.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] leading-relaxed font-sans"
                      required
                    />
                  )}
                </div>

                {/* Quick Insert Placeholders Chips */}
                <div className="p-3 bg-white border border-[#E5E5EA] rounded-xl space-y-2">
                  <p className="text-[10px] text-[#6B6B70] font-semibold uppercase tracking-wider">দ্রুত সংযোগ ট্যাগ (পছন্দ অনুযায়ী ক্লিক করে শেষে যুক্ত করুন):</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSmsTemplate(prev => prev + " {bookName}")}
                      className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-[10px] rounded-lg font-mono font-bold transition-all cursor-pointer"
                    >
                      + {'{bookName}'} (বইয়ের নাম)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsTemplate(prev => prev + " {memberName}")}
                      className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-[10px] rounded-lg font-mono font-bold transition-all cursor-pointer"
                    >
                      + {'{memberName}'} (সদস্যের নাম)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSmsTemplate(prev => prev + " {returnDate}")}
                      className="px-2.5 py-1 bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] text-[10px] rounded-lg font-mono font-bold transition-all cursor-pointer"
                    >
                      + {'{returnDate}'} (ফেরতের শেষ তারিখ)
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E5EA] flex justify-end">
                  <button
                    type="submit"
                    disabled={smsTemplateLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-none flex items-center justify-center gap-1.5"
                  >
                    {smsTemplateLoading ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    রিমাইন্ডার টেমপ্লেট সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>

            {/* Live SMS Gateway Setup Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-6">
                <Smartphone size={15} className="text-[#22242A]" />
                রিয়েল SMS গেটওয়ে API কনফিগারেশন <span className="text-[10px] px-2 py-0.5 bg-[#F5F3EF] text-[#22242A] rounded border border-[#E5E5EA]">ভবিষ্যতের জন্য</span>
              </h3>

              {gatewayErrorMsg && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 mb-4">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{gatewayErrorMsg}</span>
                </div>
              )}

              {gatewaySuccessMsg && (
                <div className="bg-[#E5E5EA]/45 border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#22242A] flex items-center gap-3 mb-4 animate-pulse">
                  <CheckCircle2 size={14} className="text-[#22242A] shrink-0" />
                  <span>{gatewaySuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSmsGateway} className="space-y-4 relative">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1.5 flex justify-between">
                    <span>SMS সার্ভিস প্রোভাইডার সিলেক্ট করুন</span>
                    <span className="text-[#22242A] font-semibold text-[9px]">বর্তমানে অফলাইন/ফ্রি মোডে সক্রিয়</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "simulated", label: "সিমুলেশন মোড (Free)", desc: "ব্রাউজার ও লগ সতর্কতা" },
                      { id: "greenweb", label: "Greenweb SMS", desc: "Local GP/BL/etc API" },
                      { id: "bulksmsbd", label: "BulkSMSBD", desc: "Sms Gateway system" },
                      { id: "custom", label: "Custom API URL", desc: "অন্য যেকোনো API" },
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setSmsProvider(prov.id);
                          if (prov.id === "greenweb") {
                            setSmsCustomUrl("https://api.greenweb.com.bd/api.php?token={apiKey}&to={to}&message={message}");
                          } else if (prov.id === "bulksmsbd") {
                            setSmsCustomUrl("https://bulksmsbd.net/api/smsapi?api_key={apiKey}&type=text&number={to}&senderid={senderId}&message={message}");
                          } else if (prov.id === "simulated") {
                            setSmsCustomUrl("");
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          smsProvider === prov.id
                            ? "border-[#E5E5EA] bg-[#F5F3EF] text-white font-bold"
                            : "border-[#E5E5EA] bg-white text-[#6B6B70] hover:border-[#E5E5EA]"
                        }`}
                      >
                        <p className="text-xs font-bold">{prov.label}</p>
                        <p className="text-[9px] text-[#6B6B70] mt-0.5 leading-normal">{prov.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {smsProvider !== "simulated" && (
                  <div className="p-4 bg-white rounded-xl border border-[#E5E5EA] space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">API Key / Token *</label>
                        <input
                          type="password"
                          value={smsApiKey}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                          placeholder="প্রোভাইদারের দেওয়া API Key দিন"
                          className="w-full text-xs p-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A]"
                          required={smsProvider !== "simulated"}
                          autoComplete="off"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">Sender ID (ঐচ্ছিক)</label>
                        <input
                          type="text"
                          value={smsSenderId}
                          onChange={(e) => setSmsSenderId(e.target.value)}
                          placeholder="ম্যাস্কিং আইডি /অনুমোদিত Sender ID"
                          className="w-full text-xs p-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B6B70] mb-1">API গেটওয়ে URL লিঙ্ক</label>
                      <input
                        type="text"
                        value={smsCustomUrl}
                        onChange={(e) => setSmsCustomUrl(e.target.value)}
                        placeholder="https://api.sms-service.com/send?to={to}&msg={message}"
                        className="w-full text-xs p-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] font-mono"
                      />
                      
                      <p className="text-[9px] text-[#6B6B70] mt-1.5 leading-relaxed">
                        * ডাইনামিক ট্যাগসমূহ: <code className="text-[#22242A] font-bold">{'{apiKey}'}</code>, <code className="text-[#22242A] font-bold">{'{to}'}</code>, <code className="text-[#22242A] font-bold">{'{message}'}</code>, <code className="text-[#22242A] font-bold">{'{senderId}'}</code>। URL লোড করার সময়ে স্বয়ংক্রিয়ভাবে এগুলো প্রতিস্থাপিত হবে।
                      </p>
                    </div>
                  </div>
                )}

                {/* Static Info for reference */}
                <div className="p-3 bg-white border border-[#E5E5EA] rounded-xl space-y-1 text-[#6B6B70]">
                  <p className="text-[10px] font-semibold text-[#22242A]">💡 ফ্রি সিমুলেশন মোড কিভাবে কাজ করে?</p>
                  <p className="text-[9px] leading-relaxed">
                    কোনো এপিআই কী ছাড়াই ডিফল্ট অবস্থায় "সিমুলেশন মোড (Free)" সচল থাকবে। এর মাধ্যমে ব্রাউজার প্যানেলে সরাসরি সব মেম্বারের বকেয়া লিস্ট এবং ট্রাইগার শিডিউলে পূর্ণ মেসেজ দেখা যাবে ও ট্র্যাক করা যাবে কিন্তু কোনো রিয়াল মেসেজ ফি/টাকা কাটা যাবে না। পরে রিয়াল SMS পাঠাতে চাইলে শুধু উপর থেকে আপনার প্রোভাইডার সিলেক্ট করে এপিআই কি দিন।
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E5EA] flex justify-end">
                  <button
                    type="submit"
                    disabled={gatewayLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-none flex items-center justify-center gap-1.5"
                  >
                    {gatewayLoading ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <Smartphone size={14} />
                    )}
                    গেটওয়ে কনফিগারেশন সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 5: PDF REPORTS */}
        {activeSection === "pdf_reports" && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-xs font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <FileText size={15} className="text-[#22242A]" />
                সিস্টেমের সর্বমোট PDF প্রিন্ট ও রিপোর্ট জেনারেটর
              </h3>
              
              <p className="text-xs text-[#22242A] leading-relaxed mb-6">
                পাঠাগারের মূল ডাটাবেজ থেকে রিয়েল-টাইমে সমস্ত ক্যাটালগ এবং নিবন্ধিত সদস্যদের তালিকা সমৃদ্ধ PDF ফাইল জেনারেট করুন। যেকোনো রিপোর্ট দেখতে, প্রিন্ট স্লিপ পেতে বা সংরক্ষণ করতে নিচে থেকে কাঙ্ক্ষিত অপশনটি নির্বাচন করুন।
              </p>

              {pdfError && (
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-4 rounded-xl text-xs text-[#FF6B6B] flex items-center gap-3 mb-4">
                  <AlertTriangle size={14} className="text-[#FF6B6B] shrink-0" />
                  <span>{pdfError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Books */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F3EF] flex items-center justify-center text-[#22242A]">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="text-xs font-bold text-[#22242A]">বইয়ের ক্যাটালগ রিপোর্ট</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      লাইব্রেরির সর্বমোট নিবন্ধিত বইয়ের তালিকা, বইয়ের কোড, লেখক, প্রকাশনা ও বর্তমান স্ট্যাটাস সহ সম্পূর্ণ তালিকা সম্বলিত PDF।
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateBooksPdf}
                    disabled={pdfLoading !== ""}
                    className="w-full py-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] hover:text-[#22242A] border border-[#E5E5EA] text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {pdfLoading === "books" ? (
                      <RefreshCw className="animate-spin" size={12} />
                    ) : (
                      <Printer size={12} />
                    )}
                    PDF রিপোর্ট প্রিন্ট করুন
                  </button>
                </div>

                {/* Card 2: Members */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F3EF] flex items-center justify-center text-[#22242A]">
                      <Users size={20} />
                    </div>
                    <h4 className="text-xs font-bold text-[#22242A]">সদস্য তালিকা রিপোর্ট</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      লাইব্রেরির সকল নিবন্ধিত সদস্যদের ফরম নাম্বার, নাম, মোবাইল নাম্বার এবং আইডি কভার ইনফরমেশন সমৃদ্ধ PDF প্রিন্ট রিপোর্ট।
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateMembersPdf}
                    disabled={pdfLoading !== ""}
                    className="w-full py-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] hover:text-[#22242A] border border-[#E5E5EA] text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {pdfLoading === "members" ? (
                      <RefreshCw className="animate-spin" size={12} />
                    ) : (
                      <Printer size={12} />
                    )}
                    PDF রিপোর্ট প্রিন্ট করুন
                  </button>
                </div>

                {/* Card 3: Audit Trails */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F3EF] flex items-center justify-center text-[#22242A]">
                      <History size={20} />
                    </div>
                    <h4 className="text-xs font-bold text-[#22242A]">অডিট লগ ও হিস্ট্রি</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      লাইব্রেরির বই ইস্যু, ফেরত, ইউজার লগইন এবং অ্যাকটিভিটি হিস্ট্রি সহ প্রতিটি ঘটনার পুঙ্খানুপুঙ্খ বিবরণী সম্বলিত নিরাপত্তা অডিট PDF।
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateLogsPdf}
                    disabled={pdfLoading !== ""}
                    className="w-full py-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] hover:text-[#22242A] border border-[#E5E5EA] text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {pdfLoading === "logs" ? (
                      <RefreshCw className="animate-spin" size={12} />
                    ) : (
                      <Printer size={12} />
                    )}
                    PDF রিপোর্ট প্রিন্ট করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEMBERSHIP FEE PAYMENT METHODS */}
        {activeSection === "payment_methods" && (
          <div className="space-y-6">
            
            {/* Main edit settings card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Smartphone size={16} className="text-[#22242A]" />
                মেম্বারশিপ ফি পেমেন্ট গেটওয়ে এবং মোবাইল নম্বরসমূহ কনফিগারেশন
              </h3>

              <p className="text-xs text-[#22242A] leading-relaxed mb-6">
                অনলাইন সদস্য নিবন্ধন ফরমে পেমেন্ট এর জন্য প্রদর্শিত মোবাইল ব্যাংকিং নম্বর, মেথডের নাম এবং অ্যাকাউন্ট টাইপ পরিবর্তন, ডিলিট বা নতুন মেথড যুক্ত করুন। এখানে করা যেকোনো পরিবর্তন সরাসরি পাবলিক রেজিষ্ট্রেশন ফর্মে আপডেট হয়ে যাবে।
              </p>

              {paymentSuccess && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircle2 size={15} />
                  {paymentSuccess}
                </div>
              )}

              {paymentError && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#FF6B6B] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <AlertTriangle size={15} />
                  {paymentError}
                </div>
              )}

              {/* Editable Methods List */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-[#22242A] tracking-wider uppercase">বিদ্যমান পেমেন্ট মেথড ও নম্বরসমূহ:</h4>
                
                {paymentMethods.length === 0 ? (
                  <div className="p-8 text-center bg-[#F5F3EF] rounded-xl border border-dashed border-[#E5E5EA] text-[#6B6B70] text-xs">
                    কোনো পেমেন্ট মেথড তৈরি করা নেই। নিচে থেকে নতুন মেথড যুক্ত করুন।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((pm, idx) => (
                      <div key={pm.id} className="p-4 bg-white rounded-xl border border-[#E5E5EA] flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all hover:border-[#E5E5EA]">
                        {/* Index */}
                        <div className="flex items-center gap-2 md:justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#6B6B70] bg-[#F5F3EF] border border-[#E5E5EA] w-6 h-6 rounded-full flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="md:hidden text-xs font-extrabold text-[#6B6B70]">মেথড {idx + 1}</span>
                        </div>

                        {/* Name (e.g. bKash / বিকাশ) */}
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-[#6B6B70] block">১. পেমেন্ট নাম (বাংলা/ইংরেজি) *</span>
                          <input
                            type="text"
                            value={pm.name}
                            onChange={(e) => handleUpdatePaymentMethodField(pm.id, "name", e.target.value)}
                            placeholder="যেমন: বিকাশ"
                            className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-bold focus:outline-none focus:border-[#22242A]"
                          />
                        </div>

                        {/* Type (e.g. Personal / Merchant) */}
                        <div className="w-full md:w-36 shrink-0 space-y-1">
                          <span className="text-[10px] font-bold text-[#6B6B70] block">২. টাইপ/মেসেজ *</span>
                          <select
                            value={pm.type}
                            onChange={(e) => handleUpdatePaymentMethodField(pm.id, "type", e.target.value)}
                            className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-bold focus:outline-none focus:border-[#22242A] cursor-pointer"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Merchant">Merchant</option>
                            <option value="Agent">Agent</option>
                            <option value="Send Money">Send Money</option>
                            <option value="Cash In">Cash In</option>
                          </select>
                        </div>

                        {/* Number */}
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-[#6B6B70] block">৩. মোবাইল নম্বর *</span>
                          <input
                            type="text"
                            value={pm.number}
                            onChange={(e) => handleUpdatePaymentMethodField(pm.id, "number", e.target.value)}
                            placeholder="যেমন: ০১৩৩৩৪৭৮৪৪৮"
                            className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono font-bold focus:outline-none focus:border-[#22242A]"
                          />
                        </div>

                        {/* Delete Button */}
                        <div className="shrink-0 flex items-end self-end md:self-auto pt-2 md:pt-0">
                          <button
                            type="button"
                            onClick={() => handleDeletePaymentMethod(pm.id)}
                            className={`px-3.5 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              activeConfirmPaymentDelete === pm.id
                                ? "bg-[#F5F3EF] hover:bg-[#F5F3EF] text-white animate-pulse"
                                : "bg-[#F5F3EF] hover:bg-[#F5F3EF] border border-[#E5E5EA] text-[#6B6B70] hover:text-[#FF6B6B] hover:border-[#E5E5EA]"
                            }`}
                          >
                            <Trash2 size={13} />
                            {activeConfirmPaymentDelete === pm.id ? "নিশ্চিত?" : "ডিলিট"}
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Bulk Save Button */}
                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveAllPaymentMethods}
                        disabled={paymentLoading}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-none disabled:opacity-50"
                      >
                        {paymentLoading ? (
                          <RefreshCw className="animate-spin" size={13} />
                        ) : (
                          <Save size={13} />
                        )}
                        পেমেন্ট তথ্যের পরিবর্তনগুলো সংরক্ষণ করুন
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add New Method Sub-section */}
              <div className="mt-8 pt-6 border-t border-[#E5E5EA] space-y-4">
                <h4 className="text-xs font-black text-[#22242A] flex items-center gap-1.5">
                  <Plus size={14} className="text-[#22242A]" />
                  নতুন পেমেন্ট মাধ্যম যুক্ত করুন
                </h4>
                
                <form onSubmit={handleAddPaymentMethod} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-4 bg-[#F5F3EF] rounded-xl border border-[#E5E5EA]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">পেমেন্ট নাম (বাংলা/ইংরেজি) *</label>
                    <input
                      type="text"
                      required
                      value={newPaymentName}
                      onChange={(e) => setNewPaymentName(e.target.value)}
                      placeholder="যেমন: রকেট (Rocket)"
                      className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-bold focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">অ্যাকাউন্ট টাইপ *</label>
                    <select
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-bold focus:outline-none focus:border-[#22242A] cursor-pointer"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Agent">Agent</option>
                      <option value="Send Money">Send Money</option>
                      <option value="Cash In">Cash In</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">মোবাইল নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={newPaymentNumber}
                      onChange={(e) => setNewPaymentNumber(e.target.value)}
                      placeholder="যেমন: ০১৩৩৩৪৭৮৪৪৮"
                      className="w-full px-3 py-2 bg-[#F5F3EF] border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono font-bold focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full py-2 bg-[#F5F3EF] hover:bg-[#F5F3EF] text-[#22242A] text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-none disabled:opacity-50 transition-colors"
                    >
                      {paymentLoading ? (
                        <RefreshCw className="animate-spin" size={13} />
                      ) : (
                        <Plus size={13} />
                      )}
                      তালিকায় যোগ করুন
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 7: FIREBASE CONFIGURATIONS */}
        {activeSection === "firebase" && (
          <div className="space-y-6">
            
            {/* Main edit settings card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Database size={16} className="text-[#22242A]" />
                ফায়ারবেস অথেনটিকেশন ও ডাটাবেস সেটিংস কনফিগারেশন
              </h3>

              <p className="text-xs text-[#22242A] leading-relaxed mb-6">
                আপনার লাইব্রেরি অ্যাপের জন্য ব্যক্তিগত ফায়ারবেস (Firebase Project) সংযুক্ত করুন। ফায়ারবেস সংযুক্ত করার ফলে সিস্টেমের ইউজার লগইন এবং ক্রেডেনশিয়াল ফায়ারবেস ক্লাউডে সম্পূর্ণ সুরক্ষিতভাবে পরিচালিত হবে।
              </p>

              {firebaseSuccessMsg && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircle2 size={15} />
                  {firebaseSuccessMsg}
                </div>
              )}

              {firebaseErrorMsg && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#FF6B6B] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <AlertTriangle size={15} />
                  {firebaseErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">১. API Key *</label>
                    <input
                      type="text"
                      required
                      value={firebaseApiKey}
                      onChange={(e) => setFirebaseApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">২. Project ID *</label>
                    <input
                      type="text"
                      required
                      value={firebaseProjectId}
                      onChange={(e) => setFirebaseProjectId(e.target.value)}
                      placeholder="akkhor-pathagar-xxxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">৩. Auth Domain</label>
                    <input
                      type="text"
                      value={firebaseAuthDomain}
                      onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                      placeholder="akkhor-pathagar-xxxxx.firebaseapp.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">৪. Storage Bucket</label>
                    <input
                      type="text"
                      value={firebaseStorageBucket}
                      onChange={(e) => setFirebaseStorageBucket(e.target.value)}
                      placeholder="akkhor-pathagar-xxxxx.appspot.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">৫. Messaging Sender ID</label>
                    <input
                      type="text"
                      value={firebaseMessagingSenderId}
                      onChange={(e) => setFirebaseMessagingSenderId(e.target.value)}
                      placeholder="847509xxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B6B70]">৬. App ID</label>
                    <input
                      type="text"
                      value={firebaseAppId}
                      onChange={(e) => setFirebaseAppId(e.target.value)}
                      placeholder="1:847509xxxx:web:xxxxxx"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] text-xs font-mono focus:outline-none focus:border-[#22242A]"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={firebaseLoading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-extrabold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-none disabled:opacity-50"
                  >
                    {firebaseLoading ? (
                      <RefreshCw className="animate-spin" size={13} />
                    ) : (
                      <Save size={13} />
                    )}
                    ফায়ারবেস সেটিংস সংরক্ষণ করুন
                  </button>
                </div>
              </form>

              {/* Step-by-Step setup guide */}
              <div className="mt-8 p-4 bg-white border border-[#E5E5EA] rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-[#22242A]">🚀 ফায়ারবেস সংযোগ করার গাইড (Setup Guide)</h4>
                
                <div className="space-y-3 text-[10px] text-[#6B6B70] leading-relaxed font-sans">
                  <div>
                    <p className="font-bold text-[#22242A] mb-0.5">ধাপ ১: ফায়ারবেস প্রজেক্ট তৈরি করুন</p>
                    <p>আপনার গুগল অ্যাকাউন্ট থেকে <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-[#22242A] underline">Firebase Console</a>-এ যান। একটি নতুন প্রজেক্ট তৈরি করুন এবং **Authentication** অপশনে গিয়ে **Email/Password** সাইন-ইন মেথডটি সক্রিয় (Enable) করুন।</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#22242A] mb-0.5">ধাপ ২: প্রজেক্টের ওয়েব অ্যাপ (Web App) রেজিস্টার করুন</p>
                    <p>প্রজেক্টের হোমপেজ থেকে **Web (&lt;/&gt;)** আইকনে ক্লিক করে আপনার লাইব্রেরি প্রজেক্টের জন্য একটি অ্যাপ নাম দিয়ে রেজিস্টার করুন।</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#22242A] mb-0.5">ধাপ ৩: ফায়ারবেস কনফিগারেশন কোড কপি করুন</p>
                    <p>রেজিস্ট্রেশন সম্পূর্ণ হলে স্ক্রিনে একটি `firebaseConfig` অবজেক্ট দেখতে পাবেন। সেখান থেকে যথাক্রমে `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, এবং `appId` কপি করে উপরের ইনপুট ফিল্ডগুলোতে বসিয়ে সেভ করুন।</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 8: SYSTEM MAINTENANCE */}
        {activeSection === "system_maintenance" && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Database size={16} className="text-[#22242A]" />
                সিস্টেম মেইনটেন্যান্স
              </h3>

              <p className="text-xs text-[#22242A] leading-relaxed mb-6">
                নিচের অপশনগুলো ব্যবহার করে সিস্টেমের ডেটাবেস এবং ক্যাশে পরিষ্কার করতে পারবেন। এই কাজগুলো সম্পূর্ণ পৃথকভাবে করা হয় যাতে কোনো ভুল ডেটা মুছে না যায়।
              </p>

              {maintSuccess && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircle2 size={15} />
                  {maintSuccess}
                </div>
              )}

              {maintError && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#FF6B6B] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <AlertTriangle size={15} />
                  {maintError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 relative z-10">
                {/* Clear Temp Files */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5"><Trash2 size={14}/> টেম্পোরারি ফাইল মুছুন</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      uploads/tmp ফোল্ডারের সকল অপ্রয়োজনীয় ফাইল মুছে ফেলবে। এটি একটি নিরাপদ কাজ এবং এতে কোনো কনফার্মেশনের প্রয়োজন নেই।
                    </p>
                  </div>
                  <button
                    onClick={handleClearTempFiles}
                    disabled={maintLoading !== ""}
                    className="self-end px-5 py-2 bg-[#F5F3EF] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#22242A] text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {maintLoading === "temp" ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
                    ফাইল মুছুন
                  </button>
                </div>

                {/* Clean Audit Logs */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5 text-[#FF6B6B]"><History size={14}/> পুরনো অডিট লগ মুছুন</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      ৩০ দিনের পুরনো অডিট লগ মুছে ফেলবে। এটি একটি অপরিবর্তনীয় কাজ। প্রথমে প্রিভিউ দেখুন।
                    </p>
                    {auditLogsPreview !== null && (
                      <p className="text-[11px] font-bold text-[#22242A] mt-2">
                        প্রিভিউ: {auditLogsPreview} টি পুরনো অডিট লগ পাওয়া গেছে।
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handlePreviewAuditLogs}
                      disabled={maintLoading !== ""}
                      className="px-5 py-2 bg-[#F5F3EF] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#22242A] text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-45"
                    >
                      {maintLoading === "audit_preview" ? <RefreshCw className="animate-spin" size={12} /> : <Database size={12} />}
                      প্রিভিউ দেখুন
                    </button>
                    <button
                      onClick={handleCleanAuditLogs}
                      disabled={maintLoading !== "" || auditLogsPreview === null || auditLogsPreview === 0}
                      className="px-5 py-2 bg-[#F5F3EF] hover:bg-white border border-[#E5E5EA] text-[#FF6B6B] text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {maintLoading === "audit_clean" ? <RefreshCw className="animate-spin" size={12} /> : <Trash2 size={12} />}
                      লগ মুছে ফেলুন
                    </button>
                  </div>
                </div>

                {/* Clear Frontend Cache */}
                <div className="bg-white hover:bg-[#F5F3EF] p-5 rounded-xl border border-[#E5E5EA] flex flex-col justify-between space-y-4 transition-all">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#22242A] flex items-center gap-1.5"><Smartphone size={14}/> ফ্রন্টএন্ড ক্যাশে পরিষ্কার করুন</h4>
                    <p className="text-[11px] text-[#6B6B70] leading-normal">
                      আপনার ব্রাউজারে সংরক্ষিত অ্যাপের ক্যাশে (localStorage/sessionStorage) মুছে ফেলবে। এটি করার পর আপনাকে পুনরায় লগইন করতে হতে পারে।
                    </p>
                  </div>
                  <button
                    onClick={handleClearFrontendCache}
                    disabled={maintLoading !== ""}
                    className="self-end px-5 py-2 bg-[#F5F3EF] hover:bg-[#E5E5EA] border border-[#E5E5EA] text-[#22242A] text-[11px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {maintLoading === "cache" ? <RefreshCw className="animate-spin" size={12} /> : <RefreshCw size={12} />}
                    ক্যাশে পরিষ্কার করুন
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 9: NEWSLETTER */}
        {activeSection === "newsletter" && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#E5E5EA] relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-20 translate-y-20 p-24 bg-[#F5F3EF] rotate-45 rounded-full pointer-events-none"></div>

              <h3 className="text-sm font-bold text-[#22242A] flex items-center gap-2 border-b border-[#E5E5EA] pb-3 mb-4">
                <Mail size={16} className="text-[#22242A]" />
                নিউজলেটার প্রেরণ (Brevo)
              </h3>

              <p className="text-xs text-[#22242A] leading-relaxed mb-6">
                এখান থেকে আপনি সকল সাবস্ক্রাইবারদের (Brevo List #3) কাছে নিউজলেটার বা ইমেইল পাঠাতে পারবেন।
              </p>

              {nlSuccess && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#22242A] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <CheckCircle2 size={15} />
                  {nlSuccess}
                </div>
              )}

              {nlError && (
                <div className="p-3.5 mb-5 bg-[#F5F3EF] border border-[#E5E5EA] text-[#FF6B6B] rounded-xl flex items-center gap-2 text-xs font-medium animate-in fade-in duration-200">
                  <AlertTriangle size={15} />
                  {nlError}
                </div>
              )}

              <form onSubmit={handleSendNewsletter} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B70] uppercase tracking-wider mb-2">
                    ইমেইল বিষয় (Subject)
                  </label>
                  <input
                    type="text"
                    value={nlSubject}
                    onChange={(e) => setNlSubject(e.target.value)}
                    required
                    placeholder="যেমন: নতুন বইয়ের খবর"
                    className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-xs text-[#22242A] focus:outline-none focus:border-[#22242A] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#6B6B70] uppercase tracking-wider mb-2">
                    ইমেইল মেসেজ (Message)
                  </label>
                  <textarea
                    value={nlBody}
                    onChange={(e) => setNlBody(e.target.value)}
                    required
                    placeholder="আপনার মেসেজ এখানে লিখুন..."
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-xs text-[#22242A] focus:outline-none focus:border-[#22242A] transition-colors resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={nlLoading}
                    className="px-6 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                  >
                    {nlLoading ? (
                      <RefreshCw className="animate-spin" size={14} />
                    ) : (
                      <Send size={14} />
                    )}
                    নিউজলেটার পাঠান
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
