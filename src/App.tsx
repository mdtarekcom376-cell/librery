import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  SearchCode,
  ArrowUpDown,
  Users2,
  Heart,
  FileEdit,
  History,
  MailWarning,
  Sliders,
  LogOut,
  DownloadCloud,
  FileArchive,
  Image,
  Sparkles,
  RefreshCw,
  Lock,
  Menu,
  X,
  Search,
  ClipboardList,
  Store,
  UserCheck,
  HelpCircle,
  ArrowLeft,
  Star,
  Bell,
  MessageSquare,
  Home,
  BarChart3
} from "lucide-react";
// JSZip is dynamically imported where used (handleBulkZipDownload) to reduce initial bundle size

// Inner view components
import Dashboard from "./components/Dashboard";
import BookManager from "./components/BookManager";
import SmartSearch from "./components/SmartSearch";
import IssueReturn from "./components/IssueReturn";
import MemberManager from "./components/MemberManager";
import Wishlist from "./components/Wishlist";
import Notepad from "./components/Notepad";
import AuditLogView from "./components/AuditLogView";
import SmsAlerts from "./components/SmsAlerts";
import Settings from "./components/Settings";
import PreviewModal from "./components/PreviewModal";
import PublicPortal from "./components/PublicPortal";
import SalesCorner from "./components/SalesCorner";
import ReviewManager from "./components/ReviewManager";
import NoticeManager from "./components/NoticeManager";
import WritingsManager from "./components/WritingsManager";
import { RegistrationModal } from "./components/RegistrationModal";
import Analytics from "./components/Analytics";
import HomePage from "./components/HomePage";
import PublicSalesPage from "./components/PublicSalesPage";
import PublicBookDetailsPage from "./components/PublicBookDetailsPage";
import PublicShopItemDetailsPage from "./components/PublicShopItemDetailsPage";
import PublicNoticeDetailsPage from "./components/PublicNoticeDetailsPage";

import { apiClient } from "./api";
import { Book, WishlistItem, Note, AuditLog, ShopItem } from "./types";
import akkhorLogo from "./assets/images/akkhor_logo_1781456142605.jpg";
import { initFirebase, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./lib/firebase";
import { useScrollRestoration } from "./hooks/useScrollRestoration";

export default function App() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "member" | "guest" | null>(() => {
    return (localStorage.getItem("okkhor_pathagar_role") as any) || null;
  });
  const isAuthenticated = !!userRole;
  const [activeTab, setActiveTab] = useState(() => {
    const role = localStorage.getItem("okkhor_pathagar_role");
    if (role === "member") return "stats";
    if (role === "guest") return "stats";
    return "dashboard";
  });

  // Automatically restore scroll position on navigation or tab changes
  useScrollRestoration(activeTab);

  const [username, setUsername] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Member Login Inputs State
  const [memberFormNo, setMemberFormNo] = useState("");
  const [memberDob, setMemberDob] = useState("");
  const [memberMobile, setMemberMobile] = useState("");
  const [loggedInMember, setLoggedInMember] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem("okkhor_pathagar_member") || "null");
    } catch {
      return null;
    }
  });



  // Auth form states
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dynamic lists states
  const [books, setBooks] = useState<Book[]>([]);
  const [activeIssues, setActiveIssues] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [triggerLogs, setTriggerLogs] = useState(0); // Trigger reload in Audit History

  // Logo upload simulator states
  const [logoUrl, setLogoUrl] = useState<string>(""); 
  const [logoBase64, setLogoBase64] = useState<string>(akkhorLogo);
  const [isLogoLoading, setIsLogoLoading] = useState(false);

  // Custom login flow states
  const [isCustomLoginFlowEnabled, setIsCustomLoginFlowEnabled] = useState(false);
  const [memberQuestionStep, setMemberQuestionStep] = useState<"ask" | "member_form" | "non_member_options">("ask");

  // Fetch login flow config from server
  const loadLoginFlowSetting = async () => {
    try {
      const res = await apiClient.get("/public/settings/login-flow");
      if (res && res.success) {
        setIsCustomLoginFlowEnabled(!!res.isCustomLoginFlowEnabled);
      }
    } catch (err) {
      console.warn("লগইন ফ্লো সেটিংস লোড করতে ব্যর্থ:", err);
    }
  };

  // Fetch logo from server on boot
  const loadLogo = async () => {
    try {
      const res = await apiClient.get("/public/logo");
      if (res && res.logoBase64) {
        setLogoBase64(res.logoBase64);
      } else {
        setLogoBase64(akkhorLogo);
      }
    } catch (err) {
      console.warn("লোগো লোড করতে সমস্যা হয়েছে:", err);
    }
  };

  const updateLogo = async (logoData: string) => {
    setLogoBase64(logoData);
    try {
      await apiClient.post("/settings/logo", { logoBase64: logoData });
      window.dispatchEvent(new Event("logo-changed"));
    } catch (err) {
      console.error("লোগো সার্ভারে সংরক্ষণ করতে ব্যর্থ:", err);
    }
  };

  // Shared Preview Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDataType, setPreviewDataType] = useState<any>("general");
  const [previewData, setPreviewData] = useState<any | null>(null);

  // --- 1. SESSION VERIFICATION & BOOT ---
  const checkSession = async () => {
    setAuthChecking(true);
    try {
      const role = localStorage.getItem("okkhor_pathagar_role");
      if (role === "admin") {
        const token = localStorage.getItem("okkhor_pathagar_token");
        if (token) {
          const res = await apiClient.get("/auth/verify");
          if (res.authenticated) {
            setUserRole("admin");
            setUsername(res.username);
            loadCoreData();
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } else if (role === "member") {
        const storedMember = localStorage.getItem("okkhor_pathagar_member");
        if (storedMember) {
          setUserRole("member");
          setLoggedInMember(JSON.parse(storedMember));
        } else {
          handleLogout();
        }
      } else if (role === "guest") {
        setUserRole("guest");
      } else {
        setUserRole(null);
      }
    } catch (err) {
      handleLogout();
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    // Track page view for analytics (fire-and-forget)
    fetch("/api/public/track-pageview", { method: "POST", headers: { "Content-Type": "application/json" } }).catch(() => {});

    checkSession();
    loadLogo();
    loadLoginFlowSetting();

    // Listen to session expiry events
    const handleAuthExpired = () => {
      handleLogout();
    };

    const handleDataImported = () => {
      loadCoreData();
      setTriggerLogs(prev => prev + 1);
    };

    const handleLogoChanged = () => {
      loadLogo();
    };

    const handleLoginFlowChanged = () => {
      loadLoginFlowSetting();
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    window.addEventListener("data-imported", handleDataImported);
    window.addEventListener("logo-changed", handleLogoChanged);
    window.addEventListener("login-flow-changed", handleLoginFlowChanged);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
      window.removeEventListener("data-imported", handleDataImported);
      window.removeEventListener("logo-changed", handleLogoChanged);
      window.removeEventListener("login-flow-changed", handleLoginFlowChanged);
    };
  }, []);

  // --- 2. DYNAMIC SYSTEM LOAD LOOPS ---
  const loadCoreData = async () => {
    try {
      // 1. Fetch books list
      const booksList = await apiClient.get("/books");
      setBooks(booksList);

      // 2. Fetch dashboard specs
      const dbStats = await apiClient.get("/dashboard");
      setDashboardData(dbStats);

      // 3. Filter active issued items for timing change dropdown picker
      const currentRole = userRole || localStorage.getItem("okkhor_pathagar_role");
      if (currentRole === "admin") {
        if (dbStats.charts?.lateReportLoans) {
          const issuesList = await apiClient.get("/history");
          const activeLoans = issuesList.filter((i: any) => i.action === "বই ইস্যু" || i.action === "সময় বাড়ানো" || i.action === "সময় কমানো");
          // Get actual active issues from server-side active items
          const allStats = await apiClient.get("/dashboard");
          // Filter active transactions
          const activeRents = allStats.charts.lateReportLoans; // placeholder or calculations
        }
        
        const smsScheduled = await apiClient.get("/sms/scheduled");
        // Map currently active borrows from warnings list
        const activeBorns = smsScheduled.map((item: any) => ({
          id: item.issueId || item.id.replace("sms-", "").split("-")[0],
          bookCode: item.bookCode || "BOK-103",
          bookName: item.bookName,
          memberName: item.memberName,
          returnDate: item.returnDate,
        }));
        // Filter out duplicates if any
        const uniqueBorns = activeBorns.filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i);
        setActiveIssues(uniqueBorns);

        // Fetch due-today notification count
        try {
          const notifRes = await apiClient.get("/admin/notifications");
          if (notifRes && notifRes.success) {
            setDueTodayCount(notifRes.count || 0);
          }
        } catch (e) {
          // Silent fail for notification count
        }
      }

    } catch (err: any) {
      if (err?.message && (err.message.includes("সেশন") || err.message.includes("মেয়াদ") || err.message.includes("অননুমোদিত"))) {
        console.log("ডাটা সিঙ্কিং বিলম্বে করা হবে: সেশন নেই বা শেষ হয়েছে।");
      } else {
        console.warn("ডাটা সিঙ্কিং এরর হয়েছে", err);
      }
    }
  };

  const handleRefreshStats = () => {
    loadCoreData();
    setTriggerLogs(prev => prev + 1);
  };

  // --- 3. LOG IN SUBMISSIONS ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    if (!loginUser || !loginPass) {
      setLoginErr("ইউজারনেম ও পাসওয়ার্ড দুটোই সরবরাহ করুন!");
      return;
    }

    setLoginLoading(true);
    let firebaseLogged = false;

    try {
      // 1. Try Firebase Auth
      const usernameClean = loginUser.trim();
      const email = `${usernameClean}@akkhorpathagar.com`;
      
      try {
        const { auth } = await initFirebase();
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, loginPass);
        } catch (signInErr: any) {
          // If user not found, try register (self-healing out-of-the-box user creation)
          if (signInErr.code === "auth/user-not-found" || signInErr.code === "auth/invalid-credential" || signInErr.code === "auth/invalid-email") {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, email, loginPass);
            } catch (signUpErr: any) {
              if (signUpErr.code === "auth/email-already-in-use") {
                throw new Error("ভুল পাসওয়ার্ড!");
              } else {
                throw signUpErr;
              }
            }
          } else {
            throw signInErr;
          }
        }

        if (userCredential && userCredential.user) {
          // Firebase auth succeeded, send session to server
          const firebaseRes = await apiClient.post("/auth/firebase-login", {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            username: usernameClean,
          });

          localStorage.setItem("okkhor_pathagar_token", firebaseRes.token);
          localStorage.setItem("okkhor_pathagar_role", "admin");
          setUserRole("admin");
          setUsername(firebaseRes.username);
          loadCoreData();
          setLoginUser("");
          setLoginPass("");
          firebaseLogged = true;
        }
      } catch (fbErr: any) {
        console.warn("ফায়ারবেস লগইন করতে ব্যর্থ হয়েছে, লোকাল লগইন ব্যবহার করা হচ্ছে:", fbErr.message || fbErr);
        // Throw specific errors so user is notified of wrong passwords
        if (fbErr.message === "ভুল পাসওয়ার্ড!") {
          throw fbErr;
        }
      }

      // 2. Local Fallback if Firebase config is incomplete/error
      if (!firebaseLogged) {
        const res = await apiClient.post("/auth/login", {
          username: loginUser.trim(),
          password: loginPass,
        });

        localStorage.setItem("okkhor_pathagar_token", res.token);
        localStorage.setItem("okkhor_pathagar_role", "admin");
        setUserRole("admin");
        setUsername(res.username);
        loadCoreData();
        setLoginUser("");
        setLoginPass("");
      }
    } catch (err: any) {
      setLoginErr(err.message || "লগইন ব্যর্থ হয়েছে! সঠিক ক্রেডেনশিয়ালস দিন।");
    } finally {
      setLoginLoading(false);
    }
  };

  // --- 4. SIGN OUT ACTION ---
  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (err) {}
    localStorage.removeItem("okkhor_pathagar_token");
    localStorage.removeItem("okkhor_pathagar_role");
    localStorage.removeItem("okkhor_pathagar_member");
    setUserRole(null);
    setLoggedInMember(null);
    setUsername("");
    setLoginUser("");
    setLoginPass("");
    setActiveTab("dashboard");
  };

  // --- 4b. MEMBER AND GUEST AUTHENTICATION ACTIONS ---
  const handleMemberLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    if (!memberFormNo || !memberMobile) {
      setLoginErr("সবগুলো তথ্য (ফরম নং এবং মোবাইল নং) সঠিকভাবে দিন!");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await apiClient.post("/public/member-login", {
        formNumber: memberFormNo.trim(),
        dob: (memberDob || "").trim(),
        mobile: memberMobile.trim()
      });
      if (res && res.success) {
        localStorage.setItem("okkhor_pathagar_role", "member");
        localStorage.setItem("okkhor_pathagar_member", JSON.stringify(res.member));
        setUserRole("member");
        setLoggedInMember(res.member);
        // Clear inputs
        setMemberFormNo("");
        setMemberDob("");
        setMemberMobile("");
        setActiveTab("stats"); // Set active tab to stats
      } else {
        setLoginErr(res.error || "লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।");
      }
    } catch (err: any) {
      setLoginErr(err.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGuestEntry = () => {
    localStorage.setItem("okkhor_pathagar_role", "guest");
    setUserRole("guest");
    setActiveTab("stats"); // Guests default to stats page
  };

  const handleDirectMemberLogin = (member: any) => {
    localStorage.setItem("okkhor_pathagar_role", "member");
    localStorage.setItem("okkhor_pathagar_member", JSON.stringify(member));
    setUserRole("member");
    setLoggedInMember(member);
    setActiveTab("stats");
    setIsRegisterOpen(false);
  };

  // --- 5. LOGO UPLODER IMAGE SIMULATOR ---
  // Background Auto Crop, margins white space removal simulator
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Create an offline Canvas viewport to auto-crop whitespace and margins
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          updateLogo(event.target?.result as string);
          setIsLogoLoading(false);
          return;
        }

        // Draw image first
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const pixels = imgData.data;

        // Find bounding box coordinates of non-white non-alpha pixels
        let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
        let found = false;

        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];

            // If pixel is not transparent, and not pure white (with some tolerance)
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

        // Clip margins and crop bounding box
        if (found) {
          const cropWidth = maxX - minX + 1;
          const cropHeight = maxY - minY + 1;
          
          const cropCanvas = document.createElement("canvas");
          cropCanvas.width = cropWidth;
          cropCanvas.height = cropHeight;
          const cropCtx = cropCanvas.getContext("2d");
          
          if (cropCtx) {
            cropCtx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            updateLogo(cropCanvas.toDataURL());
          } else {
            updateLogo(event.target?.result as string);
          }
        } else {
          updateLogo(event.target?.result as string);
        }
        setIsLogoLoading(false);
      };
    };
    reader.readAsDataURL(file);
  };

  // --- 6. ZIP ARCHIVE EXPORT (BULK DOWNLOAD) ---
  const handleBulkZipDownload = async () => {
    try {
      // Fetch full backup collections from backend
      const rawData = await apiClient.get("/bulk-raw");
      
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      // Convert Books to Tab separated Spreadsheet CSV
      const booksHeaders = ["ID", "BookCode", "BookName", "Author", "Publisher", "Status"];
      const booksRows = rawData.books.map((b: any) => [b.id, b.code, b.name, b.author, b.publisher, b.status]);
      const booksCSV = "\ufeff" + [booksHeaders.join("\t"), ...booksRows.map((r: any) => r.join("\t"))].join("\n");
      zip.file("1_Akkhor_Books_Database.xls", booksCSV); // Saves as .xls so excel opens perfectly UTF-8

      // Convert Members to Spreadsheet CSV
      const membersHeaders = ["FormNumber", "MemberName", "Mobile", "Address"];
      const membersRows = rawData.members.map((m: any) => [m.formNumber, m.name, m.mobile, m.address]);
      const membersCSV = "\ufeff" + [membersHeaders.join("\t"), ...membersRows.map((r: any) => r.join("\t"))].join("\n");
      zip.file("2_Akkhor_Members_List.xls", membersCSV);

      // Convert Transactions to Spreadsheet CSV
      const issueHeaders = ["ID", "BookCode", "BookName", "MemberName", "Mobile", "Address", "IssueDate", "ReturnDate", "Status"];
      const issueRows = rawData.issues.map((i: any) => [i.id, i.bookCode, i.bookName, i.memberName, i.mobile, i.address, i.issueDate, i.returnDate, i.status]);
      const issueCSV = "\ufeff" + [issueHeaders.join("\t"), ...issueRows.map((r: any) => r.join("\t"))].join("\n");
      zip.file("3_Akkhor_Transactions_Registry.xls", issueCSV);

      // Convert History logs to CSV
      const logsHeaders = ["ID", "Timestamp", "Action", "Details"];
      const logsRows = rawData.auditLogs.map((l: any) => [l.id, l.timestamp, l.action, l.details]);
      const logsCSV = "\ufeff" + [logsHeaders.join("\t"), ...logsRows.map((r: any) => r.join("\t"))].join("\n");
      zip.file("4_Akkhor_Audit_Trail_History.xls", logsCSV);

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `Okkhor_Pathagar_Bulk_Database_Backup_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("ব্যাকআপ জিপ ফাইল ডাউনলোড করা সম্ভব হয়নি।");
    }
  };

  // --- 7. SHARED ACTION PREVIEW POPUP DISPATCHERS ---
  const dispatchBookPreview = (book: Book) => {
    setPreviewTitle(`বইপত্র স্লিপ - ${book.name}`);
    setPreviewDataType("book");
    setPreviewData(book);
    setIsPreviewOpen(true);
  };

  const dispatchMemberPreview = (profileData: any) => {
    setPreviewTitle(`সদস্য বিবরণ স্লিপ - ${profileData.member.name}`);
    setPreviewDataType("member");
    setPreviewData(profileData);
    setIsPreviewOpen(true);
  };

  const dispatchTransactionPreview = (issueRecord: any) => {
    setPreviewTitle(`ধারকৃত বই স্লিপ - ${issueRecord.id}`);
    setPreviewDataType("transaction");
    setPreviewData(issueRecord);
    setIsPreviewOpen(true);
  };

  const dispatchWishlistPreview = (wishItem: WishlistItem) => {
    setPreviewTitle(`ইচ্ছাতালিকা স্লিপ - ${wishItem.name}`);
    setPreviewDataType("wishlist");
    setPreviewData(wishItem);
    setIsPreviewOpen(true);
  };

  const dispatchNotePreview = (note: Note) => {
    setPreviewTitle(`নোটপ্যাড স্লিপ - ${note.title}`);
    setPreviewDataType("note");
    setPreviewData(note);
    setIsPreviewOpen(true);
  };

  const dispatchSingleLogPreview = (log: AuditLog) => {
    setPreviewTitle(`একক পরিবর্তন অডিট স্লিপ - #${log.id}`);
    setPreviewDataType("general");
    setPreviewData({
      "লেনদেন আইডি/লগ আইডি": log.id,
      "পরিবর্তনের অ্যাকশন": log.action,
      "তারিখ ও সময় (সেকেন্ড সহ)": log.timestamp,
      "অ্যাকশন সম্পর্কিত সবিশেষ তথ্য": log.details,
    });
    setIsPreviewOpen(true);
  };

  const dispatchBulkHistoryPreview = (filteredLogs: AuditLog[]) => {
    setPreviewTitle("অডিট ট্রেইল পরিবর্তন প্রতিবেদন");
    setPreviewDataType("history_list");
    setPreviewData(filteredLogs);
    setIsPreviewOpen(true);
  };

  const dispatchBooksListPreview = (booksList: Book[]) => {
    setPreviewTitle("লাইব্রেরির সর্বমোট বই ক্যাটালগ");
    setPreviewDataType("books_list");
    setPreviewData(booksList);
    setIsPreviewOpen(true);
  };

  const dispatchMembersListPreview = (membersList: any[]) => {
    setPreviewTitle("নিবন্ধিত লাইব্রেরি সদস্য তালিকা");
    setPreviewDataType("members_list");
    setPreviewData(membersList);
    setIsPreviewOpen(true);
  };

  // --- 8. SUBMISSIONS PROXIES TO REFRESH LOCAL STATES ---
  const handleAddBookProxy = async (bookData: Partial<Book>) => {
    const res = await apiClient.post("/books", bookData);
    handleRefreshStats();
    return res;
  };

  const handleEditBookProxy = async (id: string, bookData: Partial<Book>) => {
    const res = await apiClient.put(`/books/${id}`, bookData);
    handleRefreshStats();
    return res;
  };

  const handleDeleteBookProxy = async (id: string) => {
    const res = await apiClient.delete(`/books/${id}`);
    handleRefreshStats();
    return res;
  };

  const handleBulkImportProxy = async (booksList: any[]) => {
    const res = await apiClient.post("/books/bulk-import", { booksList });
    handleRefreshStats();
    return res;
  };

  const handleIssueBookProxy = async (payload: any) => {
    const res = await apiClient.post("/issues", payload);
    handleRefreshStats();
    return res;
  };

  const handleReturnBookProxy = async (payload: any) => {
    const res = await apiClient.post("/issues/return", payload);
    handleRefreshStats();
    return res;
  };

  const handleChangeTimeProxy = async (payload: any) => {
    const res = await apiClient.post("/issues/time-change", payload);
    handleRefreshStats();
    return res;
  };

  const handleInstantSmsCheck = async () => {
    try {
      const res = await apiClient.post("/sms/trigger", {});
      alert(res.message || "তাত্ক্ষণিক SMS শিডিউলার স্লট সম্পূর্ণ চেক করা হয়েছে!");
      handleRefreshStats();
    } catch (err: any) {
      alert("সময় চেক করতে সমস্যা হয়েছে: " + err.message);
    }
  };

  const handleNavigateHome = () => {
    navigate("/");
  };

  // Dynamic Nav tab buttons mapping
  const navTabs = (() => {
    if (userRole === "admin") {
      return [
        { id: "home", label: "হোম", icon: Home },
        { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
        { id: "books", label: "বই ক্যাটালগ", icon: BookMarked },
        { id: "search-smart", label: "স্মার্ট অনুসন্ধান", icon: SearchCode },
        { id: "issue", label: "ইস্যু ও রিটার্ন", icon: ArrowUpDown },
        { id: "members", label: "সদস্য তালিকা", icon: Users2 },
        { id: "wishlist", label: "উইশলিস্ট", icon: Heart },
        { id: "notes", label: "নোট ও প্যাড", icon: FileEdit },
        { id: "history", label: "অডিট লগ ইতিহাস", icon: History },
        { id: "sms", label: "রিমাইন্ডার ও এসএমএস", icon: MailWarning },
        { id: "reviews", label: "রিভিউ ম্যানেজমেন্ট", icon: Star },
        { id: "notices", label: "নোটিশ বোর্ড", icon: Bell },
        { id: "writings", label: "লেখা ও অভিযোগ", icon: MessageSquare },
        { id: "shop", label: "বিক্রয় কর্নার", icon: Store },
        { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
        { id: "settings", label: "সেটিংস", icon: Sliders }
      ];
    } else if (userRole === "member") {
      return [
        { id: "stats", label: "লাইব্রেরি পরিসংখ্যান", icon: LayoutDashboard },
        { id: "books", label: "বইয়ের তালিকা ও খোঁজ", icon: BookMarked },
        { id: "leaderboard", label: "বইয়ের লিডারবোর্ড", icon: Sparkles },
        { id: "my-tracker", label: "আমার বই ট্র্যাকার", icon: ClipboardList },
        { id: "wishlist", label: "আমার উইশলিস্ট", icon: Heart },
        { id: "add-review", label: "রিভিউ দিন", icon: MessageSquare },
        { id: "shop", label: "বিক্রয় কর্নার", icon: Store }
      ];
    } else {
      // Guest
      return [
        { id: "stats", label: "লাইব্রেরি পরিসংখ্যান", icon: LayoutDashboard },
        { id: "books", label: "বইয়ের তালিকা ও খোঁজ", icon: BookMarked },
        { id: "leaderboard", label: "বইয়ের লিডারবোর্ড", icon: Sparkles },
        { id: "shop", label: "বিক্রয় কর্নার", icon: Store }
      ];
    }
  })();

  // LOGIN SCREEN
  const [loginTab, setLoginTab] = useState<"admin" | "member">("member");

  // Home page vs login form toggle for unauthenticated users
  // When true, shows the marketing landing page. When false, shows the login form.
  const [showHomePage, setShowHomePage] = useState(true);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [showSalesPage, setShowSalesPage] = useState(false);
  const [selectedPublicBook, setSelectedPublicBook] = useState<any | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<any | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  const publicHomeRender = (
    <>
      <HomePage
        onLogin={() => {
          if (isAuthenticated) {
            navigate("/dashboard");
          } else {
            setLoginTab("admin");
            navigate("/login");
          }
        }}
        onMemberLogin={() => setIsRegisterOpen(true)}
        onLibraryMemberLogin={() => {
          if (isAuthenticated) {
            navigate("/dashboard");
          } else {
            setLoginTab("member");
            navigate("/login");
          }
        }}
        onGuestEntry={() => {
          if (!isAuthenticated) handleGuestEntry();
          navigate("/dashboard");
        }}
        logoBase64={logoBase64}
        onSalesCorner={() => {
          navigate("/shop");
        }}
        onBookSelect={(book) => {
          setSelectedPublicBook(book);
          navigate("/book/view");
        }}
        onNoticeSelect={(notice) => {
          setSelectedNotice(notice);
          navigate("/notice/view");
        }}
      />
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onDirectLogin={handleDirectMemberLogin}
      />
    </>
  );

  const loginRender = (
      <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden bg-[#F5F3EF]">
        
        {/* Back to home page button */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 sm:left-auto sm:translate-x-0 sm:right-32">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[10px] sm:text-xs font-bold text-[#22242A] border border-[#E5E5EA] hover:border-[#22242A]/30 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer transition-colors"
            title="হোম পেজে ফিরে যান"
            id="back-to-home-btn"
          >
            <ArrowLeft size={12} className="text-[#22242A]" />
            <span>হোম পেজ</span>
          </button>
        </div>

        {/* Absolute Admin/Member toggle widget at top left for Login page */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => {
              setLoginTab(loginTab === "member" ? "admin" : "member");
              setLoginErr("");
              setMemberQuestionStep("ask");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-[10px] sm:text-xs font-bold text-[#22242A] border border-[#E5E5EA] hover:border-[#22242A]/30 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer transition-colors"
            title={loginTab === "member" ? "অ্যাডমিন পোর্টালে যান" : "সদস্য পোর্টালে যান"}
            id="login-role-selector-btn"
          >
            {loginTab === "member" ? (
              <>
                <Lock size={12} className="text-[#FACC15]" />
                <span>অ্যাডমিন পোর্টাল</span>
              </>
            ) : (
              <>
                <Users2 size={12} className="text-[#FACC15]" />
                <span>সদস্য প্রবেশ</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative z-10 text-center space-y-6">
          
          {/* Logo brand */}
          <div className="flex flex-col items-center gap-1.5 pt-2">
            {logoBase64 ? (
              <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E5EA] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-center p-1">
                <img src={logoBase64} alt="Library Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#22242A] shadow-[0_4px_16px_rgba(34,36,42,0.15)] flex items-center justify-center text-[#FACC15] text-3xl font-black">
                অ
              </div>
            )}
            <h1 className="text-2xl font-bold text-[#22242A] mt-3 font-sans">
              অক্ষর পাঠাগার
            </h1>
            <p className="text-xs text-[#6B6B70]">স্মার্ট লাইব্রেরি সিস্টেম</p>
            <div className="mt-2 px-3 py-1 bg-[#F5F3EF] border border-[#E5E5EA] rounded-full text-[10px] font-bold text-[#22242A] inline-block font-sans">
              {loginTab === "member" ? "👤 সদস্য প্রবেশদ্বার" : "🔑 অ্যাডমিন প্রবেশদ্বার"}
            </div>
          </div>

          {/* Validation report alert */}
          {loginErr && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-[#FF6B6B] flex items-center justify-center gap-2">
              <span>{loginErr}</span>
            </div>
          )}

          {/* Render Member Login Form or Custom Login Flow */}
          {loginTab === "member" && (
            <>
              {isCustomLoginFlowEnabled ? (
                <>
                  {/* Step 1: Ask "Are you a member?" */}
                  {memberQuestionStep === "ask" && (
                    <div className="space-y-6 py-4">
                      <p className="text-sm font-semibold text-[#22242A]">
                        আপনি কী আমাদের পাঠাগারের সদস্য?
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setMemberQuestionStep("member_form")}
                          className="py-4 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] hover:border-[#22242A]/20 text-[#22242A] font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <UserCheck size={20} className="text-[#FACC15]" />
                          <span>হ্যাঁ, আমি সদস্য</span>
                        </button>
                        <button
                          onClick={() => setMemberQuestionStep("non_member_options")}
                          className="py-4 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] hover:border-[#22242A]/20 text-[#22242A] font-bold rounded-2xl text-xs sm:text-sm transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <HelpCircle size={20} className="text-[#6B6B70]" />
                          <span>না, সদস্য নই</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Member Login Form */}
                  {memberQuestionStep === "member_form" && (
                    <div className="space-y-4">
                      <form onSubmit={handleMemberLoginSubmit} className="space-y-4 text-left">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">সদস্য ফরম নং (Member Form No)</label>
                          <input
                            type="text"
                            value={memberFormNo}
                            onChange={(e) => setMemberFormNo(e.target.value)}
                            placeholder="যেমনঃ MEM-101"
                            className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">জন্ম তারিখ (Date of Birth)</label>
                          <input
                            type="date"
                            value={memberDob}
                            onChange={(e) => setMemberDob(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">মোবাইল নম্বর (Mobile Number)</label>
                          <input
                            type="tel"
                            value={memberMobile}
                            onChange={(e) => setMemberMobile(e.target.value)}
                            placeholder="যেমনঃ 01712345678"
                            className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_4px_12px_rgba(34,36,42,0.15)] transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {loginLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={15} />}
                          সদস্য প্যানেলে প্রবেশ করুন
                        </button>
                      </form>

                      <button
                        onClick={() => setMemberQuestionStep("ask")}
                        className="w-full py-2 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] rounded-xl text-[11px] font-bold text-[#6B6B70] hover:text-[#22242A] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={12} />
                        <span>পিছনে যান</span>
                      </button>
                    </div>
                  )}

                  {/* Step 3: Non-Member Options */}
                  {memberQuestionStep === "non_member_options" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsRegisterOpen(true)}
                          className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(34,36,42,0.15)]"
                        >
                          আমি এখানকার সদস্য নই (অনলাইন রেজিষ্ট্রেশন ফর্ম)
                        </button>
                        
                        <button
                          onClick={handleGuestEntry}
                          className="w-full py-3 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] text-[#22242A] font-black rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          লাইব্রেরি পরিদর্শন (সরাসরি সাধারণ প্রবেশ)
                        </button>
                        
                        <p className="text-[10px] text-[#6B6B70] text-center leading-relaxed">
                          * আপনি সদস্য না হয়ে প্রবেশ করলেও লাইব্রেরির সকল বইয়ের তালিকা, পরিসংখ্যান ও লিডারবোর্ড দেখতে পারবেন (বই উইশলিস্ট এবং অডিট ট্র্যাকিং ছাড়া)।
                        </p>
                      </div>

                      <button
                        onClick={() => setMemberQuestionStep("ask")}
                        className="w-full py-2 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] rounded-xl text-[11px] font-bold text-[#6B6B70] hover:text-[#22242A] transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={12} />
                        <span>পিছনে যান</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Standard Flow */}
                  <form onSubmit={handleMemberLoginSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">সদস্য ফরম নং (Member Form No)</label>
                      <input
                        type="text"
                        value={memberFormNo}
                        onChange={(e) => setMemberFormNo(e.target.value)}
                        placeholder="যেমনঃ MEM-101"
                        className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">জন্ম তারিখ (Date of Birth)</label>
                      <input
                        type="date"
                        value={memberDob}
                        onChange={(e) => setMemberDob(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">মোবাইল নম্বর (Mobile Number)</label>
                      <input
                        type="tel"
                        value={memberMobile}
                        onChange={(e) => setMemberMobile(e.target.value)}
                        placeholder="যেমনঃ 01712345678"
                        className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_4px_12px_rgba(34,36,42,0.15)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loginLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={15} />}
                      সদস্য প্যানেলে প্রবেশ করুন
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          {/* Render Admin Login Form */}
          {loginTab === "admin" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">ইউজারনেম (Username)</label>
                <input
                  type="text"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="okkhor"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#6B6B70] mb-1.5 ml-1">পাসওয়ার্ড (Password)</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-[#22242A] focus:outline-none focus:border-[#22242A] focus:ring-2 focus:ring-[#FACC15]/20 text-xs sm:text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white font-bold rounded-xl text-xs sm:text-sm shadow-[0_4px_12px_rgba(34,36,42,0.15)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loginLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={15} />}
                লগইন করুন
              </button>
            </form>
          )}

          {/* Public / Non-Member Guest & Register access block */}
          {loginTab === "member" && !isCustomLoginFlowEnabled && (
            <div className="pt-4 border-t border-[#E5E5EA] space-y-3">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="w-full py-3 bg-[#22242A] hover:bg-[#2d2f36] text-white font-extrabold rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(34,36,42,0.15)]"
              >
                আমি এখানকার সদস্য নই (অনলাইন রেজিষ্ট্রেশন ফর্ম)
              </button>
              
              <button
                onClick={handleGuestEntry}
                className="w-full py-3 bg-[#F5F3EF] hover:bg-[#EEECEA] border border-[#E5E5EA] text-[#22242A] font-black rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                লাইব্রেরি পরিদর্শন (সরাসরি সাধারণ প্রবেশ)
              </button>
              
              <p className="text-[10px] text-[#6B6B70] text-center leading-relaxed">
                * আপনি সদস্য না হয়ে প্রবেশ করলেও লাইব্রেরির সকল বইয়ের তালিকা, পরিসংখ্যান ও লিডারবোর্ড দেখতে পারবেন (বই উইশলিস্ট এবং অডিট ট্র্যাকিং ছাড়া)।
              </p>
            </div>
          )}

        </div>

        <RegistrationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onDirectLogin={handleDirectMemberLogin}
        />
      </div>
  );

  const adminRender = (
    <div className="min-h-screen flex flex-col bg-[#F5F3EF] overflow-hidden theme-royal-ivory">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#F5F3EF] px-3 py-2.5 md:px-6 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Brand logotypes and logo uploader */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#6B6B70] hover:text-[#22242A] hover:bg-white rounded-lg cursor-pointer shrink-0 z-50"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Glowing dynamic circular logo banner with uploader helper */}
          <div className={`relative shrink-0 ${userRole === 'admin' ? 'group cursor-pointer' : ''}`} title={userRole === 'admin' ? "নতুন লোগো পরিবর্তন করুন (Auto Background Crop)" : undefined}>
            {userRole === "admin" ? (
              <>
                <label htmlFor="logo-uploader-input" className="cursor-pointer block relative">
                  {isLogoLoading ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E5E5EA] flex items-center justify-center">
                      <RefreshCw size={12} className="animate-spin text-[#FACC15]" />
                    </div>
                  ) : logoBase64 ? (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E5E5EA] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center p-0.5">
                      <img src={logoBase64} alt="Library Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#22242A] shadow flex items-center justify-center text-[#FACC15] text-base sm:text-xl font-bold">
                      অ
                    </div>
                  )}
                  {/* Overlaid edit camera icon */}
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-[#22242A] text-[8px] text-[#FACC15] rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    +
                  </div>
                </label>
                <input
                  type="file"
                  id="logo-uploader-input"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </>
            ) : (
              <div className="block relative">
                {logoBase64 ? (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#E5E5EA] overflow-hidden flex items-center justify-center p-0.5">
                    <img src={logoBase64} alt="Library Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#22242A] shadow flex items-center justify-center text-[#FACC15] text-base sm:text-xl font-bold">
                    অ
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm md:text-lg font-bold tracking-tight text-[#22242A] flex items-center gap-1 font-sans truncate">
              অক্ষর পাঠাগার
            </h1>
            <p className="hidden sm:block text-[9px] text-[#6B6B70] font-sans tracking-wide truncate">স্মার্ট লাইব্রেরি সিস্টেম</p>
          </div>

        </div>
        
        {/* User context profile and actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Search bar (decorative) */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-[#E5E5EA] rounded-full px-4 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] min-w-[200px]">
            <Search size={14} className="text-[#6B6B70] shrink-0" />
            <span className="text-xs text-[#6B6B70]">অনুসন্ধান করুন...</span>
          </div>

          {/* Unified ZIP backup download indicator */}
          <button
            onClick={handleBulkZipDownload}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#22242A] text-[10px] sm:text-xs font-bold text-white rounded-full shadow-[0_2px_8px_rgba(34,36,42,0.15)] cursor-pointer transition-colors hover:bg-[#2d2f36] shrink-0"
            title="সব ডেটাবেজ এক্সপোর্ট করুন (ZIP ব্যাকআপ)"
            id="bulk-backup-btn"
          >
            <FileArchive size={14} className="text-[#FACC15]" />
            ZIP ব্যাকআপ
          </button>

          {/* Notification bell for due-today books */}
          {userRole === "admin" && (
            <button
              onClick={() => setActiveTab("sms")}
              className="relative p-1.5 hover:bg-orange-50 text-[#6B6B70] hover:text-orange-500 border border-[#E5E5EA] rounded-full cursor-pointer transition-colors shrink-0"
              title="আজকের জমাদেয়ার বই"
            >
              <Bell size={14} />
              {dueTodayCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {dueTodayCount}
                </span>
              )}
            </button>
          )}

          {/* User profile identifier badge */}
          <div className="hidden md:flex bg-white border border-[#E5E5EA] p-1 px-3 rounded-full items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold text-[#22242A]">
              {userRole === "admin" && `অ্যাডমিন (${username})`}
              {userRole === "member" && `সদস্যঃ ${loggedInMember?.name || "সদস্য"}`}
              {userRole === "guest" && "অতিথি পাঠক"}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-red-50 text-[#6B6B70] hover:text-[#FF6B6B] border border-[#E5E5EA] rounded-full cursor-pointer transition-colors shrink-0"
            title="নিরাপদে একাউন্ট লগআউট করুন"
          >
            <LogOut size={14} />
          </button>
        </div>

      </header>

      {/* 2. Main Sidebar & Canvas Container Layout */}
      <div className="flex flex-1 relative min-h-[calc(100vh-65px)]">
        
        {/* Desk Nav Sidebar — Floating Icon-Only Pill */}
        <aside className="hidden md:flex flex-col items-center justify-between w-16 bg-white rounded-[28px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] m-4 mr-0 p-2 shrink-0 sticky top-[73px] self-start" style={{ maxHeight: 'calc(100vh - 73px - 32px)' }}>
          <div className="space-y-1 pt-1">
            {navTabs.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              if (item.id === "home") {
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate("/")}
                    title={item.label}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-[#22242A] text-[#FACC15] shadow-md" : "text-[#6B6B70] hover:text-[#22242A] hover:bg-[#F5F3EF]"}`}
                  >
                    <Icon size={18} />
                  </button>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-[#22242A] text-[#FACC15] shadow-md" : "text-[#6B6B70] hover:text-[#22242A] hover:bg-[#F5F3EF]"}`}
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>

          {/* Bottom avatar + logout */}
          <div className="space-y-2 pb-1 border-t border-[#E5E5EA] pt-2">
            <div className="w-8 h-8 rounded-full bg-[#F5F3EF] flex items-center justify-center text-[10px] font-bold text-[#22242A] mx-auto" title={username || loggedInMember?.name || "User"}>
              {(username || loggedInMember?.name || "U").charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              title="লগআউট"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6B6B70] hover:text-[#FF6B6B] hover:bg-red-50 cursor-pointer transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>

        {/* Mobile floating responsive drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm pr-16">
            <div className="w-full max-w-xs h-full bg-white border-r border-[#E5E5EA] p-5 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.06)]">
              
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-[#E5E5EA]">
                  <p className="font-bold text-[#22242A] text-xs uppercase tracking-wider">মেনু নেভিগেশন</p>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-[#6B6B70] p-1">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-1">
                  {navTabs.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    if (item.id === "home") {
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            navigate("/");
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? "bg-[#22242A] text-[#FACC15] font-bold shadow-md" : "text-[#6B6B70] hover:text-[#22242A] hover:bg-[#F5F3EF]"}`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-3 cursor-pointer transition-colors ${isSelected ? "bg-[#22242A] text-[#FACC15] font-bold shadow-md" : "text-[#6B6B70] hover:text-[#22242A] hover:bg-[#F5F3EF]"}`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-[#E5E5EA]">
                {/* Mobile User Profile Badge */}
                <div className="bg-[#F5F3EF] border border-[#E5E5EA] p-2 px-3 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <p className="text-xs font-bold text-[#22242A] truncate">
                    {userRole === "admin" && `অ্যাডমিন: ${username}`}
                    {userRole === "member" && `সদস্যঃ ${loggedInMember?.name || "সদস্য"}`}
                    {userRole === "guest" && "অতিথি পাঠক (Guest)"}
                  </p>
                </div>

                {/* Mobile Backup Link */}
                <button
                  onClick={() => {
                    handleBulkZipDownload();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#22242A] hover:bg-[#2d2f36] text-white text-xs font-bold rounded-xl shadow-[0_2px_8px_rgba(34,36,42,0.15)]"
                >
                  <FileArchive size={14} className="text-[#FACC15]" />
                  ZIP ক্যাটালগ ব্যাকআপ
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 3. Main Pages Container Canvas */}
        <main id="main-scroll-container" className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto max-h-[calc(100vh-65px)]">
          <div>
            
            {userRole !== "admin" && userRole && (
              <PublicPortal
                userRole={userRole as any}
                memberInfo={loggedInMember}
                activeTab={activeTab}
                onNavigate={setActiveTab}
              />
            )}

            {userRole === "admin" && activeTab === "dashboard" && (
              <Dashboard
                data={dashboardData}
                onRefresh={handleRefreshStats}
                onNavigate={(tab) => setActiveTab(tab)}
                onPostSmsCheck={handleInstantSmsCheck}
              />
            )}

            {userRole === "admin" && activeTab === "books" && (
              <BookManager
                books={books}
                onAddBook={handleAddBookProxy}
                onEditBook={handleEditBookProxy}
                onDeleteBook={handleDeleteBookProxy}
                onBulkImport={handleBulkImportProxy}
                onPreview={dispatchBookPreview}
                onPreviewBooksList={dispatchBooksListPreview}
              />
            )}

            {userRole === "admin" && activeTab === "search-smart" && (
              <SmartSearch onPreviewTransaction={dispatchTransactionPreview} />
            )}

            {userRole === "admin" && activeTab === "issue" && (
              <IssueReturn
                onIssueBook={handleIssueBookProxy}
                onReturnBook={handleReturnBookProxy}
                onChangeTime={handleChangeTimeProxy}
                activeIssues={activeIssues}
                onRefreshAll={handleRefreshStats}
              />
            )}

            {userRole === "admin" && activeTab === "members" && (
              <MemberManager
                onRefreshStats={handleRefreshStats}
                onPreviewMemberSlip={dispatchMemberPreview}
                onPreviewMembersList={dispatchMembersListPreview}
              />
            )}

            {userRole === "admin" && activeTab === "wishlist" && (
              <Wishlist
                onPreviewWishlist={dispatchWishlistPreview}
                onRefreshStats={handleRefreshStats}
              />
            )}

            {userRole === "admin" && activeTab === "notes" && (
              <Notepad onPreviewNote={dispatchNotePreview} />
            )}

            {userRole === "admin" && activeTab === "history" && (
              <AuditLogView
                onPreviewSingleLog={dispatchSingleLogPreview}
                onPreviewBulkHistory={dispatchBulkHistoryPreview}
                logsTrigger={triggerLogs}
              />
            )}

            {userRole === "admin" && activeTab === "sms" && (
              <SmsAlerts onRefreshStats={handleRefreshStats} />
            )}

            {userRole === "admin" && activeTab === "shop" && (
              <SalesCorner
                isAdmin={true}
                onRefreshStats={handleRefreshStats}
              />
            )}

            {userRole === "admin" && activeTab === "reviews" && (
              <ReviewManager onRefreshStats={handleRefreshStats} />
            )}

            { userRole === "admin" && activeTab === "notices" && (
              <NoticeManager onRefreshStats={handleRefreshStats} />
            )}

            {userRole === "admin" && activeTab === "writings" && (
              <WritingsManager onRefreshStats={handleRefreshStats} />
            )}

            {userRole === "admin" && activeTab === "analytics" && (
              <Analytics />
            )}

            {userRole === "admin" && activeTab === "settings" && (
              <Settings
                onPreviewBooksList={dispatchBooksListPreview}
                onPreviewMembersList={dispatchMembersListPreview}
                onPreviewBulkHistory={dispatchBulkHistoryPreview}
              />
            )}

            {userRole === "admin" && activeTab === "reviews" && (
              <ReviewManager onRefreshStats={handleRefreshStats} />
            )}

            {userRole === "admin" && activeTab === "notices" && (
              <NoticeManager onRefreshStats={handleRefreshStats} />
            )}

          </div>
        </main>

      </div>

      {/* 4. SHARED EYE PREVIEW TEMPLATE MODAL */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewTitle}
        dataType={previewDataType}
        data={previewData}
      />

      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onDirectLogin={handleDirectMemberLogin}
      />

    </div>
  );

  return (
    <Routes>
      <Route path="/" element={publicHomeRender} />
      
      <Route path="/shop" element={
        selectedShopItem ? (
          <PublicShopItemDetailsPage
            item={selectedShopItem}
            onBack={() => { setSelectedShopItem(null); navigate("/shop"); }}
            logoBase64={logoBase64}
          />
        ) : (
          <PublicSalesPage
            onBack={() => navigate("/")}
            onItemSelect={(item) => setSelectedShopItem(item)}
            logoBase64={logoBase64}
          />
        )
      } />
      
      <Route path="/book/view" element={
        selectedPublicBook ? (
          <PublicBookDetailsPage
            book={selectedPublicBook}
            onBack={() => { setSelectedPublicBook(null); navigate("/"); }}
            logoBase64={logoBase64}
          />
        ) : (
          <Navigate to="/" replace />
        )
      } />

      <Route path="/notice/view" element={
        selectedNotice ? (
          <PublicNoticeDetailsPage
            notice={selectedNotice}
            onBack={() => { setSelectedNotice(null); navigate("/"); }}
            logoBase64={logoBase64}
          />
        ) : (
          <Navigate to="/" replace />
        )
      } />

      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : loginRender
      } />

      <Route path="/dashboard/*" element={
        isAuthenticated ? adminRender : <Navigate to="/login" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

