import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import pool from "./src/db";

// Password Hasher Helper
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Default credentials
const DEFAULT_USERNAME = "okkhor";
const DEFAULT_PASSWORD_HASH = hashPassword("pathagar");
const SECURITY_PASSWORD = "PASSWD";

// Helper to format date with seconds in Bangladesh timezone (UTC+6): YYYY-MM-DD HH:mm:ss
function formatCurrentDateTime(): string {
  const bdNow = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const year = bdNow.getUTCFullYear();
  const month = String(bdNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bdNow.getUTCDate()).padStart(2, "0");
  const hours = String(bdNow.getUTCHours()).padStart(2, "0");
  const minutes = String(bdNow.getUTCMinutes()).padStart(2, "0");
  const seconds = String(bdNow.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Bangladesh Time (UTC+6) date string helper: YYYY-MM-DD
function getBangladeshDateString(date: Date = new Date()): string {
  const bdTime = new Date(date.getTime() + 6 * 60 * 60 * 1000);
  return bdTime.toISOString().split("T")[0];
}

// Helper to add/subtract days from a YYYY-MM-DD string cleanly without timezone drift
function addDaysToDateString(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().split("T")[0];
}


// Database Scheme Types
interface Book {
  id: string; // Unique UI identification
  code: string; // Unique Book Code
  name: string;
  author: string;
  publisher: string;
  imageUrl: string;
  status: "Available" | "Issued";
  group?: string; // e.g., নজরুল কর্নার, রবীন্দ্রনাথ কর্নার, উপন্যাস, গল্প ইত্যাদি
  pageCount?: number; // পৃষ্ঠা সংখ্যা
  price?: number; // মূল্য (৳)
}

interface Member {
  formNumber: string; // Unique key, sorted by form number
  name: string;
  mobile: string;
  address: string;
  dob?: string; // জন্ম তারিখ (YYYY-MM-DD or string)
  educationInstitution?: string; // শিক্ষা প্রতিষ্ঠান
  className?: string; // ক্লাস
  classRoll?: string; // ক্লাস রোল
  
  // Registration custom fields
  nameEnglish?: string;
  fatherName?: string;
  motherName?: string;
  currVillage?: string;
  currPostOffice?: string;
  currUpazila?: string;
  currDistrict?: string;
  permVillage?: string;
  permPostOffice?: string;
  permUpazila?: string;
  permDistrict?: string;
  bloodGroup?: string;
  nidBirthReg?: string;
  educationQualification?: string;
  profession?: string;
  nationality?: string;
  photo?: string; // ছবি (Base64 string)

  // Payment Verification fields (Option 1)
  paymentMethod?: string; // "বিকাশ" | "নগদ" | "রকেট" | "অফলাইন কাউন্টার"
  senderNumber?: string;  // যে নম্বর থেকে পাঠানো হয়েছে
  transactionId?: string; // ট্রানজেকশন আইডি (TrxID)
  paymentStatus?: "Pending" | "Paid" | "Unpaid"; // পেমেন্ট স্ট্যাটাস
}

interface IssueRecord {
  id: string;
  bookCode: string;
  bookName: string;
  author: string;
  publisher: string;
  memberName: string;
  formNumber: string;
  mobile: string;
  address: string;
  issueDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  status: "Issued" | "Returned";
  extensionHistory: Array<{
    date: string;
    action: "Extended" | "Reduced";
    payload: string; // days changed
  }>;
  comments: string[];
  returnedAt?: string;
}

interface WishlistItem {
  id: string;
  name: string;
  author: string;
  publisher: string;
  createdAt: string;
  memberFormNumber?: string; // কোন সদস্য উইশ করেছেন
  status?: "Waiting" | "Available"; // "Waiting" বা "Available"
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string; // Format: YYYY-MM-DD HH:mm:ss
  action: string;
  details: string;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string; // "টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"
  createdAt: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: string; // "Personal", "Agent", "Merchant", "Custom", etc.
  number: string;
}

interface Review {
  id: string;
  memberFormNumber: string;
  memberName: string;
  subject: string;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
}

interface Notice {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
}

interface DatabaseSchema {
  admin: {
    username: string;
    passwordHash: string;
  };
  books: Book[];
  members: Member[];
  issues: IssueRecord[];
  wishlist: WishlistItem[];
  notes: Note[];
  auditLogs: AuditLog[];
  smsTemplate?: string;
  smsGateway?: {
    provider: string;
    apiKey: string;
    senderId: string;
    customUrl: string;
  };
  logoBase64?: string;
  groups?: string[]; // Book groups/corners
  settingsPassword?: string; // Password to enter settings panel
  shopItems?: ShopItem[];
  shopCategories?: string[];
  shopHelpline?: {
    number: string;
    text: string;
  };
  paymentMethods?: PaymentMethod[];
  isCustomLoginFlowEnabled?: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  reviews?: Review[];
  notices?: Notice[];
}

// Database logic migrated to MySQL using pool from src/db.ts

// Write Audit Log Helper
function addLog(action: string, details: string) {
  pool.query("INSERT INTO audit_logs (timestamp, action, details) VALUES (?, ?, ?)", [formatCurrentDateTime(), action, details])
    .catch((err: any) => console.error("Audit log error:", err));
}

// Simple token storage in memory for authentication checks (local caching)
const ACTIVE_SESSIONS = new Set<string>();

// Stateless signed token helpers for Vercel/serverless environments
async function generateSignedToken(username: string): Promise<string> {
  const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
  let secret = "okkhor-fallback-secret";
  if (rows.length > 0) {
    let admin = rows[0].setting_value;
    if (typeof admin === "string") admin = JSON.parse(admin);
    if (admin.passwordHash) secret = admin.passwordHash;
  }
  
  const payload = {
    username,
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiry
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
  return `${payloadStr}.${signature}`;
}

async function verifySignedToken(token: string): Promise<string | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    
    const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    let secret = "okkhor-fallback-secret";
    if (rows.length > 0) {
      let admin = rows[0].setting_value;
      if (typeof admin === "string") admin = JSON.parse(admin);
      if (admin.passwordHash) secret = admin.passwordHash;
    }

    const expectedSignature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
    if (Date.now() > payload.expiry) {
      return null;
    }
    return payload.username;
  } catch (err) {
    return null;
  }
}

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // ----------- SITE TRAFFIC TRACKING MIDDLEWARE -----------
  // Must run BEFORE Vercel URL normalization so it sees the original request path.
  // Tracks actual page visits (non-API GET requests), not API calls.
  app.use(async (req, res, next) => {
    try {
      // Only track GET requests that are NOT API calls (i.e., actual page loads / SPA navigation)
      if (req.method === "GET" && !req.url.startsWith("/api/") && !req.url.startsWith("/uploads/") && !req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)$/i)) {
        const todayStr = getBangladeshDateString();
        await pool.query(
          `INSERT INTO site_traffic (date, view_count) VALUES (?, 1)
           ON DUPLICATE KEY UPDATE view_count = view_count + 1`,
          [todayStr]
        );
      }
    } catch (err) {
      // Silently ignore tracking errors — they should never block the request
    }
    next();
  });

// Normalize request URL for serverless/Vercel environments where the '/api' prefix might be stripped in rewrites
if (process.env.VERCEL) {
  app.use((req, res, next) => {
    if (req.url && !req.url.startsWith("/api/") && req.url !== "/api") {
      const queryIndex = req.url.indexOf("?");
      const pathPart = queryIndex === -1 ? req.url : req.url.substring(0, queryIndex);
      const queryPart = queryIndex === -1 ? "" : req.url.substring(queryIndex);
      req.url = "/api" + (pathPart.startsWith("/") ? "" : "/") + pathPart + queryPart;
    }
    next();
  });
}

  // CORS-like permissions (since it's a single container we keep it internal)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });

  // Auth Middleware
  const authenticateAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "অননুমোদিত! অনুগ্রহ করে লগইন করুন।" });
    }
    const token = authHeader.substring(7);
    if (!ACTIVE_SESSIONS.has(token)) {
      // Stateless signed token fallback (essential for serverless Vercel multi-instances)
      const verifiedUser = await verifySignedToken(token);
      if (verifiedUser) {
        ACTIVE_SESSIONS.add(token); // Cache locally on this container instance
      } else {
        return res.status(401).json({ error: "সেশন মেয়াদ শেষ! আবার লগইন করুন।" });
      }
    }
    next();
  };

  // ---------------- AUTH API ROUTES ----------------

  // Login Endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "ইউজারনেম ও পাসওয়ার্ড আবশ্যক!" });
      }

      const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
      if (rows.length === 0) {
        return res.status(401).json({ error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" });
      }
      let admin = rows[0].setting_value;
      if (typeof admin === "string") admin = JSON.parse(admin);
      const inputHash = hashPassword(password);

      if (admin.username === username && admin.passwordHash === inputHash) {
        const token = await generateSignedToken(username);
        ACTIVE_SESSIONS.add(token);

        return res.json({ token, username: admin.username });
      } else {
        return res.status(401).json({ error: "ভুল ইউজারনেম অথবা পাসওয়ার্ড!" });
      }
    } catch (err: any) {
      console.error("Login endpoint failed:", err);
      return res.status(500).json({ error: `সার্ভার এরর (লগইন): ${err.message || err}` });
    }
  });

  // Check Auth State Endpoint (Used on pages mounts/refreshes)
  app.get("/api/auth/verify", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ authenticated: false });
    }
    const token = authHeader.substring(7);
    
    let isAuthenticated = ACTIVE_SESSIONS.has(token);
    let username = "";

    if (!isAuthenticated) {
      const verifiedUser = await verifySignedToken(token);
      if (verifiedUser) {
        ACTIVE_SESSIONS.add(token);
        isAuthenticated = true;
        username = verifiedUser;
      }
    } else {
      // Parse username from token directly
      username = await verifySignedToken(token) || "";
    }

    if (isAuthenticated) {
      if (!username) {
        const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
        if (rows.length > 0) username = rows[0].setting_value.username;
      }

      return res.json({ authenticated: true, username });
    }
    return res.json({ authenticated: false });
  });

  // Logout Endpoint
  app.post("/api/auth/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      ACTIVE_SESSIONS.delete(token);
    }
    res.json({ message: "সফলভাবে লগআউট হয়েছে।" });
  });

  // Change Admin Credentials
  app.post("/api/auth/change-credentials", authenticateAdmin, async (req, res) => {
    const { currentUsername, currentPassword, securityPassword, newUsername, newPassword } = req.body;

    if (!currentUsername || !currentPassword || !securityPassword || !newUsername || !newPassword) {
      return res.status(400).json({ error: "সব তথ্য পূরণ করা বাধ্যতামূলক!" });
    }

    if (securityPassword !== SECURITY_PASSWORD) {
      return res.status(400).json({ error: "ভুল সিকিউরিটি পাসওয়ার্ড!" });
    }

    const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    const admin = rows.length > 0 ? rows[0].setting_value : { username: "", passwordHash: "" };
    const currentHash = hashPassword(currentPassword);

    if (admin.username !== currentUsername || admin.passwordHash !== currentHash) {
      return res.status(400).json({ error: "বর্তমান ইউজারনেম বা পাসওয়ার্ড সঠিক নয়!" });
    }

    // Apply changes
    const newAdmin = { username: newUsername, passwordHash: hashPassword(newPassword) };
    await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(newAdmin)]);

    addLog("অ্যাডমিন পরিবর্তন", `ইউজারনেম বা পাসওয়ার্ড পরিবর্তন করা হয়েছে। নতুন ইউজারনেম: ${newUsername}`);

    res.json({ success: true, message: "অ্যাডমিন ক্রেডেনশিয়াল সফলভাবে পরিবর্তিত হয়েছে।" });
  });

  // POST Track Page View (Public - called from frontend on load/navigation)
  // This supplements the middleware tracking for SPA pages.
  app.post("/api/public/track-pageview", async (req, res) => {
    try {
      const todayStr = getBangladeshDateString();
      await pool.query(
        `INSERT INTO site_traffic (date, view_count) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE view_count = view_count + 1`,
        [todayStr]
      );
      res.json({ success: true });
    } catch (err) {
      // Silently ignore tracking errors
      res.json({ success: false });
    }
  });

  // GET Firebase Config (Public - so frontend can initialize Firebase)
  app.get("/api/public/firebase-config", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'firebaseConfig'");
      if (rows.length > 0 && rows[0].setting_value.apiKey) {
        return res.json(rows[0].setting_value);
      }
      
      // Fallback to firebase-applet-config.json
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, "utf-8");
        const defaultFirebase = JSON.parse(fileContent);
        return res.json(defaultFirebase);
      }

      // If no config found, return blank placeholders
      res.json({
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
      });
    } catch (err: any) {
      console.error("GET /api/public/firebase-config failed:", err);
      res.status(500).json({ error: "ফায়ারবেস কনফিগারেশন লোড করতে সমস্যা হয়েছে।" });
    }
  });

  // POST Firebase Config (Protected - to update custom Firebase configuration)
  app.post("/api/settings/firebase-config", authenticateAdmin, async (req, res) => {
    try {
      const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = req.body;
      
      if (!apiKey || !projectId) {
        return res.status(400).json({ error: "API Key এবং Project ID পূরণ করা আবশ্যক।" });
      }

      const firebaseConfig = {
        apiKey: (apiKey || "").trim(),
        authDomain: (authDomain || "").trim(),
        projectId: (projectId || "").trim(),
        storageBucket: (storageBucket || "").trim(),
        messagingSenderId: (messagingSenderId || "").trim(),
        appId: (appId || "").trim()
      };
      
      await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('firebaseConfig', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(firebaseConfig)]);

      addLog("ফায়ারবেস সেটিংস আপডেট", `ফায়ারবেস কনফিগারেশন সফলভাবে আপডেট করা হয়েছে (Project ID: ${projectId})।`);
      res.json({ success: true, message: "ফায়ারবেস কনফিগারেশন সফলভাবে সেভ করা হয়েছে।" });
    } catch (err: any) {
      console.error("POST /api/settings/firebase-config failed:", err);
      res.status(500).json({ error: "ফায়ারবেস সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে।" });
    }
  });

  // POST Firebase Login (Saves Firebase user session locally on the server)
  app.post("/api/auth/firebase-login", async (req, res) => {
    const { uid, email, username } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: "ফায়ারবেস ইউজার ডাটা পাওয়া যায়নি!" });
    }

    const usernameClean = username || email.split("@")[0];
    const token = await generateSignedToken(usernameClean);
    ACTIVE_SESSIONS.add(token);

    console.log("[Firebase Auth] Successful login for", email);
    
    return res.json({ token, username: usernameClean });
  });


  // Verify settings access password
  app.post("/api/settings/verify-password", authenticateAdmin, async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "পাসওয়ার্ড প্রদান করুন!" });
      }
      
      const [pwdRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'settingsPassword'");
      const storedPassword = pwdRows.length > 0 ? pwdRows[0].setting_value : "PASSWORD";
      
      const [adminRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
      const adminHash = adminRows.length > 0 ? adminRows[0].setting_value.passwordHash : "";
      
      const hashedEnteredPassword = hashPassword(password);
      
      if (password === storedPassword || hashedEnteredPassword === adminHash) {
        return res.json({ success: true });
      }
      return res.status(400).json({ error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
    } catch (err: any) {
      console.error("verify-password failed:", err);
      res.status(500).json({ error: "সার্ভার ত্রুটি।" });
    }
  });

  // Change settings access password
  app.post("/api/settings/change-password", authenticateAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "সব তথ্য পূরণ করা বাধ্যতামূলক!" });
      }
      
      const [pwdRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'settingsPassword'");
      const storedPassword = pwdRows.length > 0 ? pwdRows[0].setting_value : "PASSWORD";
      
      const [adminRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
      const adminHash = adminRows.length > 0 ? adminRows[0].setting_value.passwordHash : "";
      
      const hashedCurrentPassword = hashPassword(currentPassword);
      
      if (currentPassword !== storedPassword && hashedCurrentPassword !== adminHash) {
        return res.status(400).json({ error: "বর্তমান পাসওয়ার্ড সঠিক নয়!" });
      }
      
      await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('settingsPassword', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(newPassword)]);
      
      addLog("নিরাপত্তা সেটিংস", "সেটিংস প্রবেশের পাসওয়ার্ড পরিবর্তন করা হয়েছে।");
      res.json({ success: true, message: "সেটিংস পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।" });
    } catch (err: any) {
      console.error("change-password failed:", err);
      res.status(500).json({ error: "সার্ভার ত্রুটি।" });
    }
  });

  // GET logoBase64 (Public - for login page & header)
  app.get("/api/public/logo", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'logoBase64'");
      const logoBase64 = rows.length > 0 ? rows[0].setting_value : "";
      res.json({ logoBase64 });
    } catch (err: any) {
      console.error("GET /api/public/logo failed:", err);
      res.status(500).json({ error: "সার্ভার এরর। লোগো লোড করা যায়নি।" });
    }
  });

  // POST logoBase64 (Protected - for saving the custom logo)
  app.post("/api/settings/logo", authenticateAdmin, async (req, res) => {
    try {
      const { logoBase64 } = req.body;
      if (logoBase64 === undefined) {
        return res.status(400).json({ error: "লোগো ডাটা প্রদান করা বাধ্যতামূলক।" });
      }

      await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('logoBase64', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(logoBase64)]);

      addLog("লোগো পরিবর্তন", "পাঠাগারের মূল লোগো সফলভাবে পরিবর্তন করা হয়েছে।");
      res.json({ success: true, message: "লোগো সফলভাবে পরিবর্তন করা হয়েছে।" });
    } catch (err: any) {
      console.error("POST /api/settings/logo failed:", err);
      res.status(500).json({ error: "লোগো সংরক্ষণ করতে অভ্যন্তরীণ ত্রুটি হয়েছে।" });
    }
  });

  // GET SMS template
  app.get("/api/sms/template", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
      const defaultTemplate = "আসসালামু আলাইকুম, আপনার ({bookName}) বইটি জমাদেয়ার সময় অতিক্রম হয়েছে। অনুগ্রহ করে বইটি অক্ষর পাঠাগার এ জমা দিয়ে আসুন। আমাদের পাঠাগার প্রতিদিন বিকাল ৪ টা থেকে রাত ৮ টা পর্যন্ত খোলা থাকে। বা আপনার বই যদি পড়া শেষ পণ্ডিত না হয়ে থাকে তাহলে অনুগ্রহ করে এই নাম্বারে call /WhatsApp এ যোগাযোগ করেন: 01333474848";
      const currentTemplate = rows.length > 0 ? rows[0].setting_value : defaultTemplate;
      res.json({ template: currentTemplate });
    } catch (err: any) {
      console.error("GET /api/sms/template failed:", err);
      res.status(500).json({ error: "সার্ভার এরর। টেমপ্লেট লোড করা যায়নি।" });
    }
  });

  // POST SMS template
  app.post("/api/sms/template", authenticateAdmin, async (req, res) => {
    try {
      const template = req.body.template !== undefined ? req.body.template : req.body.smsTemplate;
      if (template === undefined || typeof template !== "string") {
        return res.status(400).json({ error: "সঠিক মেসেজ টেমপ্লেট টেক্সট প্রদান করুন।" });
      }
      
      await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('smsTemplate', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(template)]);
      
      addLog("টেমপ্লেট আপডেট", "SMS রিমাইন্ডার পাঠানোর টেক্সট টেমপ্লেট পরিবর্তন করা হয়েছে।");
      res.json({ success: true, message: "মেসেজ টেমপ্লেট সফলভাবে আপডেট করা হয়েছে।" });
    } catch (err: any) {
      console.error("POST /api/sms/template failed:", err);
      res.status(500).json({ error: "সার্ভারে সেভ করার সময় কোনো সমস্যা হয়েছে।" });
    }
  });

  // GET SMS Gateway Settings
  app.get("/api/sms/gateway", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
      const defaultGateway = {
        provider: "simulated",
        apiKey: "",
        senderId: "",
        customUrl: "https://api.example.com/sms/send?apiKey={apiKey}&to={to}&message={message}"
      };
      res.json(rows.length > 0 ? rows[0].setting_value : defaultGateway);
    } catch (err: any) {
      console.error("GET /api/sms/gateway failed:", err);
      res.status(500).json({ error: "সার্ভার এরর। গেটওয়ে সেটিংস লোড করা যায়নি।" });
    }
  });

  // POST SMS Gateway Settings
  app.post("/api/sms/gateway", authenticateAdmin, async (req, res) => {
    try {
      const { provider, apiKey, senderId, customUrl } = req.body;
      if (!provider) {
        return res.status(400).json({ error: "প্রোভাইডার সিলেক্ট করা আবশ্যক।" });
      }

      const gateway = {
        provider: provider || "simulated",
        apiKey: apiKey || "",
        senderId: senderId || "",
        customUrl: customUrl || ""
      };
      await pool.query("INSERT INTO settings (setting_key, setting_value) VALUES ('smsGateway', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(gateway)]);

      addLog("গেটওয়ে সেটিংস আপডেট", `SMS গেটওয়ে প্রোভাইডার হিসেবে '${provider}' সেট করা হয়েছে।`);
      res.json({ success: true, message: "SMS গেটওয়ে সেটিংস সফলভাবে আপডেট করা হয়েছে।" });
    } catch (err: any) {
      console.error("POST /api/sms/gateway failed:", err);
      res.status(500).json({ error: "সার্ভার এরর। গেটওয়ে সেটিংস আপডেট করা যায়নি।" });
    }
  });

  // ---------------- DASHBOARD DATA API ----------------

  app.get("/api/dashboard", authenticateAdmin, async (req, res) => {
    try {
      const todayStr = getBangladeshDateString();

      // Execute basic count queries concurrently
      const [booksTotal]: any = await pool.query("SELECT COUNT(*) AS count FROM books");
      const [booksAvail]: any = await pool.query("SELECT COUNT(*) AS count FROM books WHERE status = 'Available'");
      const [booksIssued]: any = await pool.query("SELECT COUNT(*) AS count FROM books WHERE status = 'Issued'");
      const [membersTotal]: any = await pool.query("SELECT COUNT(*) AS count FROM members");
      
      const [lateBooksRows]: any = await pool.query("SELECT COUNT(*) AS count FROM issues WHERE status = 'Issued' AND return_date < ?", [todayStr]);
      
      const [todaysTxRows]: any = await pool.query("SELECT COUNT(*) AS count FROM issues WHERE issue_date = ? OR DATE(returned_at) = ?", [todayStr, todayStr]);

      const totalBooks = booksTotal[0].count;
      const availableBooks = booksAvail[0].count;
      const issuedBooks = booksIssued[0].count;
      const totalMembers = membersTotal[0].count;
      const lateBooks = lateBooksRows[0].count;
      const todaysTransactions = todaysTxRows[0].count;

      // 1. Monthly Issue Data (last 6 months)
      const bnMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
      const issuesByMonthMap: Record<string, number> = {};
      const returnsByMonthMap: Record<string, number> = {};

      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mName = bnMonths[d.getMonth()];
        issuesByMonthMap[mName] = 0;
        returnsByMonthMap[mName] = 0;
      }

      // We fetch only the issue_date and returned_at for the last 6 months to minimize data transfer
      const [recentIssues]: any = await pool.query("SELECT issue_date, returned_at FROM issues WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) OR returned_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)");
      
      recentIssues.forEach((issue: any) => {
        try {
          if (issue.issue_date) {
            const issueD = new Date(issue.issue_date);
            const mName = bnMonths[issueD.getMonth()];
            if (mName in issuesByMonthMap) issuesByMonthMap[mName]++;
          }
          if (issue.returned_at) {
            const retD = new Date(issue.returned_at);
            const retMName = bnMonths[retD.getMonth()];
            if (retMName in returnsByMonthMap) returnsByMonthMap[retMName]++;
          }
        } catch (err) {}
      });

      const monthlyReport = Object.keys(issuesByMonthMap).map(mName => ({
        month: mName,
        issues: issuesByMonthMap[mName],
        returns: returnsByMonthMap[mName] || 0,
      }));

      // 2. Most Popular Books (with author, group, image)
      const [popularBooksRows]: any = await pool.query(`
        SELECT b.code, b.name, b.author, b.group_name, b.image_url, COUNT(i.id) AS issue_count
        FROM issues i
        JOIN books b ON i.book_id = b.id
        GROUP BY b.id, b.code, b.name, b.author, b.group_name, b.image_url
        ORDER BY issue_count DESC
        LIMIT 5
      `);
      const popularBooks = popularBooksRows.map((r: any) => ({
        code: r.code || '',
        name: r.name || '',
        author: r.author || '',
        group: r.group_name || '',
        imageUrl: r.image_url || '',
        count: Number(r.issue_count) || 0
      }));

      // 3. Most Active Members (with mobile)
      const [activeMembersRows]: any = await pool.query(`
        SELECT m.form_number, m.name, m.mobile, COUNT(i.id) AS issue_count
        FROM issues i
        JOIN members m ON i.member_id = m.id
        GROUP BY m.id, m.form_number, m.name, m.mobile
        ORDER BY issue_count DESC
        LIMIT 5
      `);
      const activeMembers = activeMembersRows.map((r: any) => ({
        formNumber: r.form_number || '',
        name: r.name || '',
        mobile: r.mobile || '',
        count: Number(r.issue_count) || 0
      }));
      // Late return reports list
      const [lateReportLoansRows]: any = await pool.query(`
        SELECT i.*, 
               b.code AS book_code, b.name AS book_name, b.author, b.publisher,
               m.name AS member_name, m.form_number, m.mobile, m.address
        FROM issues i
        JOIN books b ON i.book_id = b.id
        JOIN members m ON i.member_id = m.id
        WHERE i.status = 'Issued' AND i.return_date < ?
      `, [todayStr]);
      const lateReportLoans = lateReportLoansRows.map((r: any) => ({
        id: String(r.id),
        bookCode: r.book_code,
        bookName: r.book_name,
        author: r.author,
        publisher: r.publisher,
        memberName: r.member_name,
        formNumber: r.form_number,
        mobile: r.mobile,
        address: r.address,
        issueDate: r.issue_date,
        returnDate: r.return_date,
        status: r.status,
        extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : (r.extension_history || []),
        comments: typeof r.comments === "string" ? JSON.parse(r.comments) : (r.comments || []),
        returnedAt: r.returned_at
      }));

      console.log(`[Dashboard API] popularBooks: ${popularBooks.length} items, activeMembers: ${activeMembers.length} items`);
      if (popularBooks.length > 0) console.log("[Dashboard API] Sample book:", JSON.stringify(popularBooks[0]));
      if (activeMembers.length > 0) console.log("[Dashboard API] Sample member:", JSON.stringify(activeMembers[0]));

      res.json({
        stats: {
          totalBooks,
          availableBooks,
          issuedBooks,
          lateBooks,
          todaysTransactions,
          totalMembers,
        },
        charts: {
          monthlyReport,
          popularBooks,
          activeMembers,
          lateReportLoans,
        },
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ।" });
    }
  });

  // ---------------- VISITOR ANALYTICS API ----------------

  app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query(
        `SELECT date, view_count FROM site_traffic 
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         ORDER BY date ASC`
      );
      const data = rows.map((r: any) => ({
        date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString().split("T")[0],
        view_count: r.view_count
      }));
      res.json({ success: true, data });
    } catch (err: any) {
      console.error("GET /api/admin/analytics error:", err);
      res.status(500).json({ error: "অ্যানালিটিক্স ডেটা লোড করতে ব্যর্থ।" });
    }
  });

  // ---------------- BOOK MANAGEMENT API ----------------

  // Search and Suggest
  app.get("/api/books/suggest", authenticateAdmin, async (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();

    let query = "SELECT * FROM books";
    let params: any[] = [];
    if (q) {
      query += " WHERE LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?";
      const likeQ = `%${q}%`;
      params = [likeQ, likeQ, likeQ, likeQ];
    }
    
    try {
      const [rows]: any = await pool.query(query, params);
      
      const mapBookRow = (r: any) => ({
        id: String(r.id),
        code: r.code, name: r.name, author: r.author, publisher: r.publisher,
        imageUrl: r.image_url, status: r.status, group: r.group_name,
        pageCount: r.page_count ?? undefined, price: r.price != null ? Number(r.price) : undefined
      });
      const mapped = rows.map(mapBookRow);

      const bengaliToEnglish: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
      };
      const parseNumberFromCode = (code: string): number => {
        let engCode = code.replace(/[০-৯]/g, (m) => bengaliToEnglish[m] || m);
        const match = engCode.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
        return Infinity;
      };
      
      const sorted = [...mapped].sort((a, b) => {
        const numA = parseNumberFromCode(a.code);
        const numB = parseNumberFromCode(b.code);
        if (numA !== numB) {
          return numA - numB;
        }
        return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
      });

      res.json(q ? sorted : sorted.slice(0, 5));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Get books with query matching
  app.get("/api/books", authenticateAdmin, async (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();
    const status = (req.query.status || "").toString();

    let query = "SELECT * FROM books WHERE 1=1";
    let params: any[] = [];

    if (q) {
      query += " AND (LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?)";
      const likeQ = `%${q}%`;
      params.push(likeQ, likeQ, likeQ, likeQ);
    }

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    try {
      const [rows]: any = await pool.query(query, params);
      
      const mapBookRow = (r: any) => ({
        id: String(r.id),
        code: r.code, name: r.name, author: r.author, publisher: r.publisher,
        imageUrl: r.image_url, status: r.status, group: r.group_name,
        pageCount: r.page_count ?? undefined, price: r.price != null ? Number(r.price) : undefined
      });
      const mapped = rows.map(mapBookRow);

      const bengaliToEnglish: Record<string, string> = {
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
        '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
      };
      const parseNumberFromCode = (code: string): number => {
        let engCode = code.replace(/[০-৯]/g, (m) => bengaliToEnglish[m] || m);
        const match = engCode.match(/\d+/);
        if (match) {
          return parseInt(match[0], 10);
        }
        return Infinity;
      };

      const sorted = [...mapped].sort((a, b) => {
        const numA = parseNumberFromCode(a.code);
        const numB = parseNumberFromCode(b.code);
        if (numA !== numB) {
          return numA - numB;
        }
        return a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' });
      });

      res.json(sorted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Add individual book
  app.post("/api/books", authenticateAdmin, async (req, res) => {
    const { code, name, author, publisher, imageUrl, group, description, pageCount, price } = req.body;

    if (!code || !name || !author || !publisher) {
      return res.status(400).json({ error: "বই কোড, নাম, লেখক এবং প্রকাশনা আবশ্যক।" });
    }

    try {
      const uCode = code.toUpperCase();
      const [existing]: any = await pool.query("SELECT id FROM books WHERE code = ?", [uCode]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "এই বই কোডটি ইতিমধ্যেই ব্যবহৃত হয়েছে।" });
      }

      const img = imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
      const grp = group || "";
      const desc = description || "";
      const status = "Available";
      const pCount = pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null;
      const pPrice = price != null && !isNaN(Number(price)) ? Number(price) : null;
      
      const [result]: any = await pool.query(
        "INSERT INTO books (code, name, author, publisher, image_url, status, group_name, description, page_count, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [uCode, name, author, publisher, img, status, grp, desc, pCount, pPrice]
      );
      
      const [newBookRow]: any = await pool.query("SELECT * FROM books WHERE id = ?", [result.insertId]);
      const r = newBookRow[0];
      const newBook = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, description: r.description, pageCount: r.page_count ?? undefined, price: r.price != null ? Number(r.price) : undefined };

      addLog("বই যোগ", `নতুন বই '${name}' (কোড: ${code}${grp ? `, গ্রুপ: ${grp}` : ""}) সিস্টেমে যোগ করা হয়েছে।`);

      res.status(201).json(newBook);
    } catch (err: any) {
      console.error("Book create error:", err);
      res.status(500).json({ error: `বই যোগ করতে সমস্যা: ${err.sqlMessage || err.message || "সার্ভার এরর"}` });
    }
  });

  // Bulk Assign Group (Must be defined before /api/books/:id)
  app.put("/api/books/bulk-group", authenticateAdmin, async (req, res) => {
    const { bookIds, groupName } = req.body;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ error: "কোনো বই নির্বাচন করা হয়নি।" });
    }

    try {
      const placeholders = bookIds.map(() => '?').join(',');
      await pool.query(
        `UPDATE books SET group_name = ? WHERE id IN (${placeholders})`,
        [groupName || "", ...bookIds]
      );

      addLog("বই গ্রুপ আপডেট", `${bookIds.length} টি বইয়ের গ্রুপ '${groupName || 'খালি'}' আপডেট করা হয়েছে।`);

      res.json({ success: true, updatedCount: bookIds.length });
    } catch (err: any) {
      console.error("Bulk group assign error:", err);
      res.status(500).json({ error: `বইয়ের গ্রুপ আপডেট করতে সমস্যা: ${err.sqlMessage || err.message || "সার্ভার এরর"}` });
    }
  });

  // Edit book
  app.put("/api/books/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { code, name, author, publisher, imageUrl, status, group, pageCount, price } = req.body;

    if (!code || !name || !author || !publisher) {
      return res.status(400).json({ error: "বই কোড, নাম, লেখক এবং প্রকাশনা আবশ্যক।" });
    }

    try {
      const [bookRows]: any = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
      if (bookRows.length === 0) {
        return res.status(404).json({ error: "বইটি পাওয়া যায়নি।" });
      }

      const uCode = code.toUpperCase();
      const [existing]: any = await pool.query("SELECT id FROM books WHERE code = ? AND id != ?", [uCode, id]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "এই বই কোডটি অন্য বইয়ের জন্য ব্যবহৃত হয়েছে।" });
      }

      const oldBook = bookRows[0];
      const img = imageUrl || oldBook.image_url;
      const stat = status || oldBook.status;
      const grp = group !== undefined ? group : oldBook.group_name;
      const pCount = pageCount !== undefined ? (pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null) : oldBook.page_count;
      const pPrice = price !== undefined ? (price != null && !isNaN(Number(price)) ? Number(price) : null) : oldBook.price;

      await pool.query(
        "UPDATE books SET code = ?, name = ?, author = ?, publisher = ?, image_url = ?, status = ?, group_name = ?, page_count = ?, price = ? WHERE id = ?",
        [uCode, name, author, publisher, img, stat, grp, pCount, pPrice, id]
      );

      const [updatedBookRow]: any = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
      const r = updatedBookRow[0];
      const updatedBook = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, pageCount: r.page_count ?? undefined, price: r.price != null ? Number(r.price) : undefined };

      addLog("বই সম্পাদনা", `বই '${name}' (কোড: ${code}) এর সঠিক তথ্য আপডেট করা হয়েছে।`);

      res.json(updatedBook);
    } catch (err: any) {
      console.error("Book update error:", err);
      res.status(500).json({ error: `বই আপডেট করতে সমস্যা: ${err.sqlMessage || err.message || "সার্ভার এরর"}` });
    }
  });

  // Delete book
  app.delete("/api/books/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const [bookRows]: any = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
      if (bookRows.length === 0) {
        return res.status(404).json({ error: "বইটি পাওয়া যায়নি।" });
      }

      const r = bookRows[0];
      if (r.status === "Issued") {
        return res.status(400).json({ error: "বইটি বর্তমানে সমর্পিত/ইস্যু অবস্থায় রয়েছে। রিটার্ন না করা পর্যন্ত ডিলিট সম্ভব নয়।" });
      }

      await pool.query("DELETE FROM books WHERE id = ?", [id]);

      const book = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, pageCount: r.page_count ?? undefined, price: r.price != null ? Number(r.price) : undefined };

      addLog("বই মুছে ফেলা", `বই '${book.name}' (কোড: ${book.code}) সিস্টেম থেকে মুছে ফেলা হয়েছে।`);

      res.json({ message: "বইটি সফলভাবে সিস্টেম থেকে মুছে ফেলা হয়েছে।" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Bulk Import
  app.post("/api/books/bulk-import", authenticateAdmin, async (req, res) => {
    const { booksList } = req.body;

    if (!Array.isArray(booksList) || booksList.length === 0) {
      return res.status(400).json({ error: "বই তালিকা ত্রুটিযুক্ত।" });
    }

    let importedCount = 0;
    let duplicatesCount = 0;

    try {
      for (const bookItem of booksList) {
        const { code, name, author, publisher, group, imageUrl, pageCount, price } = bookItem;
        if (code && name && author) {
          const uCode = code.toUpperCase();
          const [existing]: any = await pool.query("SELECT id FROM books WHERE code = ?", [uCode]);
          if (existing.length === 0) {
            const img = imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
            const pub = publisher || "অজ্ঞাত প্রকাশনা";
            const grp = group || "";
            const pCount = pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null;
            const pPrice = price != null && !isNaN(Number(price)) ? Number(price) : null;
            await pool.query(
              "INSERT INTO books (code, name, author, publisher, image_url, status, group_name, page_count, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [uCode, name, author, pub, img, "Available", grp, pCount, pPrice]
            );
            importedCount++;
          } else {
            duplicatesCount++;
          }
        }
      }

      addLog("বই বাল্ক ইম্পোর্ট", `${importedCount} টি বই বাল্ক ইম্পোর্ট করা হয়েছে। ডুপ্লিকেট বাদ পড়েছে: ${duplicatesCount} টি।`);
      res.json({ success: true, importedCount, duplicatesCount });
    } catch (err: any) {
      console.error("Bulk import error:", err);
      res.status(500).json({ error: `বাল্ক ইম্পোর্ট সমস্যা: ${err.sqlMessage || err.message || "সার্ভার এরর"}` });
    }
  });

  // ---------------- BOOK SEARCH & DETAILS ----------------

  app.get("/api/books/search-smart", authenticateAdmin, async (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();

    if (!q) {
      return res.json([]);
    }

    try {
      const likeQ = `%${q}%`;
      const [booksRows]: any = await pool.query(
        "SELECT * FROM books WHERE LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?",
        [likeQ, likeQ, likeQ, likeQ]
      );

      // Map all matched books
      const mapBookRow = (bRow: any) => ({
        id: String(bRow.id), code: bRow.code, name: bRow.name, author: bRow.author, publisher: bRow.publisher,
        imageUrl: bRow.image_url, status: bRow.status, group: bRow.group_name,
        pageCount: bRow.page_count ?? undefined, price: bRow.price != null ? Number(bRow.price) : undefined
      });
      const books = booksRows.map(mapBookRow);

      // Batch-fetch all issues for matched books in a single query (eliminates N+1)
      const bookCodes = books.map((b: any) => b.code);
      let issuesByCode: Record<string, any[]> = {};
      if (bookCodes.length > 0) {
        const placeholders = bookCodes.map(() => "?").join(",");
        const [allIssueRows]: any = await pool.query(
          `SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE b.code IN (${placeholders}) ORDER BY i.id DESC`,
          bookCodes
        );

        const mapIssue = (r: any) => ({
          id: String(r.id), bookId: String(r.book_id), bookCode: r.book_code, bookName: r.book_name,
          memberId: String(r.member_id), formNumber: r.member_form_number, memberName: r.member_name, memberMobile: r.member_mobile,
          issueDate: r.issue_date, returnDate: r.return_date, actualReturnDate: r.returned_at || undefined,
          status: r.status, fineAmount: r.fine_amount || 0,
          extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : (r.extension_history || [])
        });

        // Group issues by book code
        for (const row of allIssueRows) {
          const mapped = mapIssue(row);
          if (!issuesByCode[row.book_code]) issuesByCode[row.book_code] = [];
          issuesByCode[row.book_code].push(mapped);
        }
      }

      // Assemble results
      const result = books.map((book: any) => {
        const history = issuesByCode[book.code] || [];
        const activeIssue = history.find((i: any) => i.status === "Issued") || null;
        return { book, activeIssue, history };
      });
      
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- MEMBER MANAGEMENT API ----------------

  app.get("/api/members/suggest", authenticateAdmin, async (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();

    try {
      const mapMemberRow = (r: any) => ({
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      });

      if (!q) {
        const [rows]: any = await pool.query("SELECT * FROM members ORDER BY CAST(form_number AS UNSIGNED) ASC LIMIT 5");
        return res.json(rows.map(mapMemberRow));
      }

      const likeQ = `%${q}%`;
      const [rows]: any = await pool.query("SELECT * FROM members WHERE LOWER(form_number) LIKE ? OR LOWER(name) LIKE ? OR LOWER(mobile) LIKE ? ORDER BY CAST(form_number AS UNSIGNED) ASC", [likeQ, likeQ, likeQ]);
      res.json(rows.map(mapMemberRow));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.get("/api/members", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM members ORDER BY CAST(form_number AS UNSIGNED) ASC");
      const mapMemberRow = (r: any) => ({
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      });
      res.json(rows.map(mapMemberRow));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Get single member profile reports
  app.get("/api/members/:formNumber/profile", authenticateAdmin, async (req, res) => {
    const { formNumber } = req.params;

    try {
      const [memberRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      if (memberRows.length === 0) {
        return res.status(404).json({ error: "সদস্য পাওয়া যায়নি।" });
      }

      const r = memberRows[0];
      const member = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };

      const [issueRows]: any = await pool.query("SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE m.form_number = ?", [formNumber]);
      
      const mapIssue = (r: any) => ({
        id: String(r.id), bookId: String(r.book_id), bookCode: r.book_code, bookName: r.book_name,
        memberId: String(r.member_id), formNumber: r.member_form_number, memberName: r.member_name, memberMobile: r.member_mobile,
        issueDate: r.issue_date, returnDate: r.return_date, actualReturnDate: r.returned_at || undefined,
        status: r.status, fineAmount: r.fine_amount || 0,
        extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : (r.extension_history || [])
      });

      const allRents = issueRows.map(mapIssue);
      const activeRents = allRents.filter((i: any) => i.status === "Issued");
      const returnedHistory = allRents.filter((i: any) => i.status === "Returned");

      res.json({
        member,
        activeRents,
        returnedHistory,
        rentCount: allRents.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.post("/api/members", authenticateAdmin, async (req, res) => {
    const { 
      name, formNumber, mobile, address, dob, educationInstitution, className, classRoll,
      nameEnglish, fatherName, motherName, currVillage, currPostOffice, currUpazila, currDistrict,
      permVillage, permPostOffice, permUpazila, permDistrict, bloodGroup, nidBirthReg,
      educationQualification, profession, nationality, photo, paymentStatus
    } = req.body;

    try {
      let finalFormNumber = formNumber ? formNumber.trim() : "";
      if (!finalFormNumber) {
        const [maxRow]: any = await pool.query("SELECT MAX(CAST(form_number AS UNSIGNED)) as maxForm FROM members");
        let maxForm = maxRow.length > 0 && maxRow[0].maxForm ? parseInt(maxRow[0].maxForm, 10) : 999;
        finalFormNumber = (maxForm + 1).toString();
      } else {
        const [existing]: any = await pool.query("SELECT id FROM members WHERE form_number = ?", [finalFormNumber]);
        if (existing.length > 0) {
          return res.status(400).json({ error: "এই ফরম নম্বরটি দিয়ে ইতিমধ্যেই মেম্বার রেজিস্টার্ড রয়েছে।" });
        }
      }

      let finalAddress = address || "";
      if (!finalAddress && (currVillage || currPostOffice || permVillage || permPostOffice)) {
        finalAddress = `বর্তমান: ${currVillage || ""}, ডাকঘর: ${currPostOffice || ""}, উপজেলা: ${currUpazila || ""}, জেলা: ${currDistrict || ""}. স্থায়ী: ${permVillage || ""}, ডাকঘর: ${permPostOffice || ""}, উপজেলা: ${permUpazila || ""}, জেলা: ${permDistrict || ""}`;
      }
      if (!finalAddress) {
        finalAddress = "অজানা ঠিকানা";
      }

      const p_name = name ? name.trim() : "নামহীন সদস্য";
      const p_nameEng = (nameEnglish || "").trim();
      const p_mobile = (mobile || "").trim();
      const p_dob = (dob || "").trim();
      const p_edu = (educationInstitution || "").trim();
      const p_className = (className || "").trim();
      const p_classRoll = (classRoll || "").trim();
      const p_father = (fatherName || "").trim();
      const p_mother = (motherName || "").trim();
      const p_cV = (currVillage || "").trim();
      const p_cPO = (currPostOffice || "").trim();
      const p_cU = (currUpazila || "").trim();
      const p_cD = (currDistrict || "").trim();
      const p_pV = (permVillage || "").trim();
      const p_pPO = (permPostOffice || "").trim();
      const p_pU = (permUpazila || "").trim();
      const p_pD = (permDistrict || "").trim();
      const p_blood = (bloodGroup || "").trim();
      const p_nid = (nidBirthReg || "").trim();
      const p_eduQ = (educationQualification || "").trim();
      const p_prof = (profession || "").trim();
      const p_nat = (nationality || "বাংলাদেশী").trim();
      const p_photo = photo || "";
      const p_pay = paymentStatus || "Paid";

      const [result]: any = await pool.query(
        `INSERT INTO members (
          form_number, name, name_english, mobile, address, dob, education_institution,
          class_name, class_roll, father_name, mother_name, curr_village, curr_post_office,
          curr_upazila, curr_district, perm_village, perm_post_office, perm_upazila,
          perm_district, blood_group, nid_birth_reg, education_qualification, profession,
          nationality, photo, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          finalFormNumber, p_name, p_nameEng, p_mobile, finalAddress, p_dob, p_edu,
          p_className, p_classRoll, p_father, p_mother, p_cV, p_cPO, p_cU, p_cD,
          p_pV, p_pPO, p_pU, p_pD, p_blood, p_nid, p_eduQ, p_prof, p_nat, p_photo, p_pay
        ]
      );

      const [newRow]: any = await pool.query("SELECT * FROM members WHERE id = ?", [result.insertId]);
      const r = newRow[0];
      const newMember = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };


      addLog("সদস্য যোগ", `নতুন সদস্য ${newMember.name} (ফরম নম্বর: ${finalFormNumber}) যোগ করা হয়েছে।`);

      res.status(201).json(newMember);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // PUT Edit member
  app.put("/api/members/:formNumber", authenticateAdmin, async (req, res) => {
    const { formNumber } = req.params;
    const {
      name, mobile, address, dob, educationInstitution, className, classRoll,
      nameEnglish, fatherName, motherName, currVillage, currPostOffice, currUpazila, currDistrict,
      permVillage, permPostOffice, permUpazila, permDistrict, bloodGroup, nidBirthReg,
      educationQualification, profession, nationality, photo, paymentStatus, paymentMethod, senderNumber, transactionId
    } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: "সদস্যর নাম এবং মোবাইল নাম্বার আবশ্যক।" });
    }

    try {
      const [rows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "সদস্য খুঁজে পাওয়া যায়নি।" });
      }

      const oldMember = rows[0];
      
      let finalAddress = address || oldMember.address;
      const activeVillage = currVillage !== undefined ? currVillage : oldMember.curr_village;
      const activePostOffice = currPostOffice !== undefined ? currPostOffice : oldMember.curr_post_office;
      const activeUpazila = currUpazila !== undefined ? currUpazila : oldMember.curr_upazila;
      const activeDistrict = currDistrict !== undefined ? currDistrict : oldMember.curr_district;
      const activePermVillage = permVillage !== undefined ? permVillage : oldMember.perm_village;
      const activePermPostOffice = permPostOffice !== undefined ? permPostOffice : oldMember.perm_post_office;
      const activePermUpazila = permUpazila !== undefined ? permUpazila : oldMember.perm_upazila;
      const activePermDistrict = permDistrict !== undefined ? permDistrict : oldMember.perm_district;

      if (!address && (activeVillage || activePostOffice || activePermVillage || activePermPostOffice)) {
        finalAddress = `বর্তমান: ${activeVillage || ""}, ডাকঘর: ${activePostOffice || ""}, উপজেলা: ${activeUpazila || ""}, জেলা: ${activeDistrict || ""}. স্থায়ী: ${activePermVillage || ""}, ডাকঘর: ${activePermPostOffice || ""}, উপজেলা: ${activePermUpazila || ""}, জেলা: ${activePermDistrict || ""}`;
      }

      const p_name = name.trim();
      const p_mobile = mobile.trim();
      const p_dob = dob !== undefined ? dob : oldMember.dob;
      const p_edu = educationInstitution !== undefined ? educationInstitution : oldMember.education_institution;
      const p_className = className !== undefined ? className : oldMember.class_name;
      const p_classRoll = classRoll !== undefined ? classRoll : oldMember.class_roll;
      const p_nameEng = nameEnglish !== undefined ? nameEnglish : oldMember.name_english;
      const p_father = fatherName !== undefined ? fatherName : oldMember.father_name;
      const p_mother = motherName !== undefined ? motherName : oldMember.mother_name;
      const p_blood = bloodGroup !== undefined ? bloodGroup : oldMember.blood_group;
      const p_nid = nidBirthReg !== undefined ? nidBirthReg : oldMember.nid_birth_reg;
      const p_eduQ = educationQualification !== undefined ? educationQualification : oldMember.education_qualification;
      const p_prof = profession !== undefined ? profession : oldMember.profession;
      const p_nat = nationality !== undefined ? nationality : oldMember.nationality;
      const p_photo = photo !== undefined ? photo : oldMember.photo;
      const p_payStatus = paymentStatus !== undefined ? paymentStatus : oldMember.payment_status;

      await pool.query(
        `UPDATE members SET 
          name = ?, name_english = ?, mobile = ?, address = ?, dob = ?, education_institution = ?,
          class_name = ?, class_roll = ?, father_name = ?, mother_name = ?, curr_village = ?, curr_post_office = ?,
          curr_upazila = ?, curr_district = ?, perm_village = ?, perm_post_office = ?, perm_upazila = ?,
          perm_district = ?, blood_group = ?, nid_birth_reg = ?, education_qualification = ?, profession = ?,
          nationality = ?, photo = ?, payment_status = ?
        WHERE form_number = ?`,
        [
          p_name, p_nameEng, p_mobile, finalAddress, p_dob, p_edu,
          p_className, p_classRoll, p_father, p_mother, activeVillage, activePostOffice,
          activeUpazila, activeDistrict, activePermVillage, activePermPostOffice, activePermUpazila,
          activePermDistrict, p_blood, p_nid, p_eduQ, p_prof,
          p_nat, p_photo, p_payStatus, formNumber
        ]
      );

      const [updatedRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      const r = updatedRows[0];
      const updatedMember = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };


      addLog("সদস্য সম্পাদনা", `সদস্য '${name}' (ফরম নম্বর: ${formNumber}) এর তথ্য আপডেট করা হয়েছে।`);

      res.json(updatedMember);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Update member payment status (Admin only)
  app.put("/api/members/:formNumber/payment", authenticateAdmin, async (req, res) => {
    const { formNumber } = req.params;
    const { paymentStatus } = req.body;

    if (!["Pending", "Paid", "Unpaid"].includes(paymentStatus)) {
      return res.status(400).json({ error: "ভ্যালিড পেমেন্ট স্ট্যাটাস প্রয়োজন।" });
    }

    try {
      const [rows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "সদস্য খুঁজে পাওয়া যায়নি।" });
      }

      await pool.query("UPDATE members SET payment_status = ? WHERE form_number = ?", [paymentStatus, formNumber]);
      const [updatedRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      const r = updatedRows[0];
      const member = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };

      addLog("পেমেন্ট আপডেট", `সদস্য '${member.name}' (ফরম নম্বর: ${formNumber}) এর পেমেন্ট স্ট্যাটাস '${paymentStatus}' এ আপডেট করা হয়েছে।`);
      res.json({ success: true, member });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "পেমেন্ট আপডেট করতে সার্ভার ত্রুটি হয়েছে।" });
    }
  });

  app.delete("/api/members/:formNumber", authenticateAdmin, async (req, res) => {
    const { formNumber } = req.params;
    
    try {
      const [rows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "সদস্য খুঁজে পাওয়া যায়নি।" });
      }

      const r = rows[0];
      const member = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };

      await pool.query("DELETE FROM members WHERE form_number = ?", [formNumber]);


      addLog("সদস্য ডিলিট", `সদস্য '${member.name}' (ফরম নম্বর: ${formNumber}) কে মুছে ফেলা হয়েছে।`);

      res.json({ success: true, message: "সদস্য সফলভাবে মুছে ফেলা হয়েছে।" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- BOOK ISSUE SYSTEM ----------------

  app.post("/api/issues", authenticateAdmin, async (req, res) => {
    const { name, formNumber, mobile, address, bookCode, bookName, author, publisher, returnOption, manualReturnDate } = req.body;

    if (!name || !formNumber || !mobile || !bookCode || !bookName) {
      return res.status(400).json({ error: "সদস্যর তথ্য এবং বইয়ের কোড বা নাম আবশ্যক।" });
    }

    try {
      // 1. Identify the book
      const [bookRows]: any = await pool.query("SELECT * FROM books WHERE code = ?", [bookCode.toUpperCase()]);
      if (bookRows.length === 0) {
        return res.status(404).json({ error: "এই কোডযুক্ত বইটি লাইব্রেরিতে নিবন্ধিত নেই।" });
      }

      const book = bookRows[0];
      if (book.status === "Issued") {
        return res.status(400).json({ error: "বইটি ইতিমধ্যে ইস্যু করা আছে। ফেরত দেওয়ার পরই আবার ইস্যু করা যাবে।" });
      }

      // 2. Member auto creation/update check
      const [memberRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
      let member;
      if (memberRows.length === 0) {
        const finalAddress = address || "অজানা ঠিকানা";
        const [mRes]: any = await pool.query(
          "INSERT INTO members (form_number, name, mobile, address, payment_status) VALUES (?, ?, ?, ?, ?)",
          [formNumber, name, mobile, finalAddress, "Paid"]
        );
        const [newM]: any = await pool.query("SELECT * FROM members WHERE id = ?", [mRes.insertId]);
        member = newM[0];
        addLog("সদস্য যোগ", `ইস্যু সময় তৈরি: নতুন সদস্য ${name} (ফরম: ${formNumber}) স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।`);
      } else {
        member = memberRows[0];
        const updatedAddress = address || member.address;
        await pool.query("UPDATE members SET name = ?, mobile = ?, address = ? WHERE form_number = ?", [name, mobile, updatedAddress, formNumber]);
        member.name = name;
        member.mobile = mobile;
        member.address = updatedAddress;
      }

      // 3. Compute Dates
      const issueDateStr = getBangladeshDateString();

      let computedReturnDateStr = "";
      if (returnOption === "manual") {
        computedReturnDateStr = manualReturnDate;
      } else {
        const days = parseInt(returnOption, 10) || 7;
        computedReturnDateStr = addDaysToDateString(issueDateStr, days);
      }

      if (!computedReturnDateStr) {
        return res.status(400).json({ error: "একটি সঠিক রিটার্ন তারিখ নির্বাচন করুন।" });
      }

      // Insert issue record
      const [iRes]: any = await pool.query(
        "INSERT INTO issues (book_id, member_id, issue_date, return_date, status) VALUES (?, ?, ?, ?, ?)",
        [book.id, member.id, issueDateStr, computedReturnDateStr, "Issued"]
      );

      // Update book status
      await pool.query("UPDATE books SET status = 'Issued' WHERE id = ?", [book.id]);

      // fetch full issue structure
      const [insertedIssue]: any = await pool.query(
        "SELECT i.*, b.name as book_name, b.code as book_code, b.author, b.publisher, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number, m.address as member_address FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.id = ?",
        [iRes.insertId]
      );
      
      const r = insertedIssue[0];
      const newIssue = {
        id: String(r.id), bookCode: r.book_code, bookName: r.book_name, author: r.author, publisher: r.publisher,
        memberName: r.member_name, formNumber: r.member_form_number, mobile: r.member_mobile, address: r.member_address,
        issueDate: r.issue_date, returnDate: r.return_date, status: r.status, extensionHistory: [], comments: []
      };

      addLog("বই ইস্যু", `বই '${book.name}' (কোড: ${book.code}) সদস্য ${member.name} (ফরম: ${member.form_number}) কে ইস্যু করা হয়েছে।`);


      res.status(201).json({ success: true, issue: newIssue });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Returns currently scheduled warnings
  app.get("/api/sms/scheduled", authenticateAdmin, async (req, res) => {
    const todayStr = (req.query.todayStr as string) || getBangladeshDateString();
    const bypassRules = req.query.bypassRules === "true";

    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
      let smsTemplate = "আসসালামু আলাইকুম, আপনার ({bookName}) বইটি জমাদেয়ার সময় অতিক্রম হয়েছে। অনুগ্রহ করে বইটি অক্ষর পাঠাগার এ জমা দিয়ে আসুন। আমাদের পাঠাগার প্রতিদিন বিকাল ৪ টা থেকে রাত ৮ টা পর্যন্ত খোলা থাকে। বা আপনার বই যদি পড়া শেষ না হয়ে থাকে তাহলে অনুগ্রহ করে এই নাম্বারে call /WhatsApp এ যোগাযোগ করেন: 01333474848";
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        smsTemplate = val || smsTemplate;
      }

      const [issueRows]: any = await pool.query(
        "SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.status = 'Issued'"
      );

      const alerts: Array<{
        id: string;
        bookName: string;
        memberName: string;
        returnDate: string;
        mobile: string;
        status: "Scheduled" | "Sent";
        alertText: string;
        triggerTime: string;
        bookCode?: string;
        issueId?: string;
      }> = [];

      issueRows.forEach((issue: any) => {
        const diffDays = getBangladeshDiffDays(todayStr, issue.return_date);

        const text = smsTemplate
          .replace(/{bookName}/g, issue.book_name)
          .replace(/{বইয়েরনাম}/g, issue.book_name)
          .replace(/{বইয়েরনাম}/g, issue.book_name)
          .replace(/{book}/g, issue.book_name)
          .replace(/{বই}/g, issue.book_name)
          .replace(/{memberName}/g, issue.member_name)
          .replace(/{সদস্যেরনাম}/g, issue.member_name)
          .replace(/{সদস্য}/g, issue.member_name)
          .replace(/{returnDate}/g, issue.return_date)
          .replace(/{ফেরততারিখ}/g, issue.return_date)
          .replace(/{তারিখ}/g, issue.return_date);

        if (bypassRules) {
          alerts.push({
            id: `sms-${issue.id}-bypass`,
            bookName: issue.book_name,
            memberName: issue.member_name,
            returnDate: issue.return_date,
            mobile: issue.mobile,
            status: "Sent",
            alertText: text,
            triggerTime: `তাৎক্ষণিক ওভাররাইড টেস্ট অ্যালার্ট (সব সক্রিয় সদস্যকে সচল ওয়ার্নিং)`,
            bookCode: issue.book_code,
            issueId: String(issue.id),
          });
        } else if (diffDays === 0) {
          // Due today — special reminder (not overdue yet)
          const dueTodayText = `আসসালামু আলাইকুম, আপনার (${issue.book_name}) বইটি আজকেই জমাদেয়ার শেষ দিন! অনুগ্রহ করে আজকের মধ্যে বইটি অক্ষর পাঠাগারে জমা দিন। পাঠাগার বিকাল ৪ টা থেকে রাত ৮ টা পর্যন্ত খোলা। যোগাযোগ: 01333474848`;
          alerts.push({
            id: `sms-${issue.id}-duetoday`,
            bookName: issue.book_name,
            memberName: issue.member_name,
            returnDate: issue.return_date,
            mobile: issue.mobile,
            status: "Sent",
            alertText: dueTodayText,
            triggerTime: `${issue.return_date} (আজ জমাদেয়ার শেষ দিন!)`,
            bookCode: issue.book_code,
            issueId: String(issue.id),
          });
        } else if (diffDays > 0) {
          const isTriggerDay = diffDays % 2 === 0;
          alerts.push({
            id: `sms-${issue.id}-${diffDays}`,
            bookName: issue.book_name,
            memberName: issue.member_name,
            returnDate: issue.return_date,
            mobile: issue.mobile,
            status: isTriggerDay ? "Sent" : "Scheduled",
            alertText: text,
            triggerTime: `${issue.return_date} দুপুর ২:০০ টা (আজ থেকে প্রতি ২ দিন অন্তর)`,
            bookCode: issue.book_code,
            issueId: String(issue.id),
          });
        } else {
          alerts.push({
            id: `sms-${issue.id}-future`,
            bookName: issue.book_name,
            memberName: issue.member_name,
            returnDate: issue.return_date,
            mobile: issue.mobile,
            status: "Scheduled",
            alertText: text,
            triggerTime: `${issue.return_date} দুপুর ২:০০ টা`,
            bookCode: issue.book_code,
            issueId: String(issue.id),
          });
        }
      });

      res.json(alerts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Return Book
  app.post("/api/issues/return", authenticateAdmin, async (req, res) => {
    const { bookCode, comments } = req.body;

    if (!bookCode) {
      return res.status(400).json({ error: "বই কোড আবশ্যক।" });
    }

    try {
      const [issueRows]: any = await pool.query(
        "SELECT i.*, b.id as b_id, b.name as book_name, b.code as book_code, m.name as member_name FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE b.code = ? AND i.status = 'Issued' ORDER BY i.id DESC LIMIT 1",
        [bookCode.toUpperCase()]
      );

      if (issueRows.length === 0) {
        return res.status(404).json({ error: "বইটির কোনো সক্রিয় ইস্যু অ্যাকাউন্ট পাওয়া যায়নি।" });
      }

      const issue = issueRows[0];
      const returnedAt = getBangladeshDateString();

      await pool.query("UPDATE books SET status = 'Available' WHERE id = ?", [issue.b_id]);
      await pool.query("UPDATE issues SET status = 'Returned', returned_at = ? WHERE id = ?", [returnedAt, issue.id]);

      let parsedComments = typeof issue.comments === 'string' ? JSON.parse(issue.comments) : (issue.comments || []);
      if (comments) {
        parsedComments.push(comments);
        await pool.query("UPDATE issues SET comments = ? WHERE id = ?", [JSON.stringify(parsedComments), issue.id]);
      }

      addLog("বই ফেরত", `বই '${issue.book_name}' (কোড: ${issue.book_code}) সদস্য ${issue.member_name} থেকে ফেরত গ্রহণ করা হয়েছে।`);
      
      const updatedIssue = {
        id: String(issue.id), bookCode: issue.book_code, bookName: issue.book_name, memberName: issue.member_name,
        issueDate: issue.issue_date, returnDate: issue.return_date, actualReturnDate: returnedAt, status: "Returned",
        comments: parsedComments
      };
      


      res.json({ success: true, message: "বইটি সফলভাবে ফেরত গ্রহণ করা হয়েছে।" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Get all active issues with detailed book and member info
  app.get("/api/issues/active-detailed", authenticateAdmin, async (req, res) => {
    try {
      const [issueRows]: any = await pool.query(`
        SELECT 
          i.*, 
          b.name as book_name, b.code as book_code, b.author, b.group_name, b.image_url,
          m.name as member_name, m.mobile, m.form_number 
        FROM issues i 
        JOIN books b ON i.book_id = b.id 
        JOIN members m ON i.member_id = m.id 
        WHERE i.status = 'Issued'
        ORDER BY i.return_date ASC
      `);

      // MySQL2 returns DATETIME columns as JS Date objects which serialize to UTC ISO strings.
      // We must convert them to YYYY-MM-DD strings in Bangladesh timezone (UTC+6) so that:
      // (a) dates display correctly in the UI, and
      // (b) the frontend overdue calculation uses the correct local date (not UTC offset date).
      const toDateStr = (val: any): string => {
        if (!val) return "";
        const d = val instanceof Date ? val : new Date(val);
        if (isNaN(d.getTime())) return String(val).split("T")[0];
        return getBangladeshDateString(d);
      };

      const activeIssues = issueRows.map((r: any) => ({
        id: String(r.id),
        bookCode: r.book_code,
        bookName: r.book_name,
        author: r.author,
        group: r.group_name || "",
        imageUrl: r.image_url || "",
        memberName: r.member_name,
        formNumber: r.form_number,
        mobile: r.mobile,
        issueDate: toDateStr(r.issue_date),
        returnDate: toDateStr(r.return_date),
        status: r.status,
        extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : (r.extension_history || [])
      }));

      res.json(activeIssues);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Time Extension or Reduction
  app.post("/api/issues/time-change", authenticateAdmin, async (req, res) => {
    const { issueId, action, days } = req.body;

    if (!issueId || !action || !days) {
      return res.status(400).json({ error: "প্রয়োজনীয় তথ্য অনুপস্থিত।" });
    }

    try {
      const [rows]: any = await pool.query(
        "SELECT i.*, b.name as book_name, b.code as book_code FROM issues i JOIN books b ON i.book_id = b.id WHERE i.id = ?",
        [issueId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "ইস্যু অ্যাকাউন্ট পাওয়া যায়নি।" });
      }

      const issue = rows[0];
      if (issue.status !== "Issued") {
        return res.status(400).json({ error: "শুধুমাত্র চলমান ইস্যু বইয়ের সময় বৃদ্ধি/হ্রাস সম্ভব।" });
      }

      const currentDate = new Date(issue.return_date);
      const offset = parseInt(days, 10);
      let parsedHistory = typeof issue.extension_history === "string" ? JSON.parse(issue.extension_history) : (issue.extension_history || []);

      const newReturnDate = addDaysToDateString(String(issue.return_date).split("T")[0], action === "Extend" ? offset : -offset);

      if (action === "Extend") {
        parsedHistory.push({
          date: getBangladeshDateString(),
          action: "Extended",
          payload: `${offset} দিন বাড়ানো হয়েছে`,
        });
        addLog("সময় বাড়ানো", `'${issue.book_name}' (কোড: ${issue.book_code}) বইয়ের সময়সীমা ${offset} দিন বৃদ্ধি করা হয়েছে। নতুন তারিখ: ${newReturnDate}`);
      } else {
        parsedHistory.push({
          date: getBangladeshDateString(),
          action: "Reduced",
          payload: `${offset} দিন কমানো হয়েছে`,
        });
        addLog("সময় কমানো", `'${issue.book_name}' (কোড: ${issue.book_code}) বইয়ের সময়সীমা ${offset} দিন কমানো হয়েছে। নতুন তারিখ: ${newReturnDate}`);
      }

      await pool.query("UPDATE issues SET return_date = ?, extension_history = ? WHERE id = ?", [newReturnDate, JSON.stringify(parsedHistory), issueId]);

      res.json({ success: true, newReturnDate: newReturnDate });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- WISHLIST API ----------------

  app.get("/api/wishlist", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM wishlist ORDER BY id DESC");
      res.json(rows.map((r: any) => ({
        id: String(r.id), name: r.name, author: r.author, publisher: r.publisher, createdAt: r.created_at, memberFormNumber: r.member_form_number || "", status: r.status || "pending"
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.post("/api/wishlist", authenticateAdmin, async (req, res) => {
    const { name, author, publisher, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: "বইয়ের নাম থাকতে হবে।" });
    }

    try {
      const p_author = author || "অজ্ঞাত";
      const p_publisher = publisher || "অজ্ঞাত";
      const p_status = status || "pending";
      const createdAt = formatCurrentDateTime();

      const [result]: any = await pool.query("INSERT INTO wishlist (name, author, publisher, created_at, status) VALUES (?, ?, ?, ?, ?)", [name, p_author, p_publisher, createdAt, p_status]);
      const newItem = {
        id: String(result.insertId), name, author: p_author, publisher: p_publisher, createdAt, status: p_status
      };


      addLog("বই যোগ", `উইশলিস্টে নতুন বই '${name}' যোগ করা হয়েছে।`);

      res.status(201).json(newItem);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.put("/api/wishlist/:id/fulfill", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const [rows]: any = await pool.query("SELECT * FROM wishlist WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "আইটেমটি পাওয়া যায়নি।" });
      }
      await pool.query("UPDATE wishlist SET status = 'fulfilled' WHERE id = ?", [id]);
      addLog("উইশলিস্ট আপডেট", `বই '${rows[0].name}' সংগৃহীত (fulfilled) হিসেবে চিহ্নিত করা হয়েছে।`);
      res.json({ success: true, status: "fulfilled" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.put("/api/wishlist/:id/status", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const [rows]: any = await pool.query("SELECT * FROM wishlist WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "আইটেমটি পাওয়া যায়নি।" });
      }
      const newStatus = status || "fulfilled";
      await pool.query("UPDATE wishlist SET status = ? WHERE id = ?", [newStatus, id]);
      addLog("উইশলিস্ট আপডেট", `বই '${rows[0].name}' এর স্ট্যাটাস '${newStatus}' করা হয়েছে।`);
      res.json({ success: true, status: newStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.delete("/api/wishlist/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const [rows]: any = await pool.query("SELECT * FROM wishlist WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "আইটেমটি পাওয়া যায়নি।" });
      }

      const item = { id: String(rows[0].id), name: rows[0].name, author: rows[0].author, publisher: rows[0].publisher, createdAt: rows[0].created_at };
      await pool.query("DELETE FROM wishlist WHERE id = ?", [id]);


      addLog("বই মুছে ফেলা", `উইশলিস্ট থেকে বই '${item.name}' মুছে ফেলা হয়েছে।`);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- NOTEPAD / NOTES SYSTEM ----------------

  app.get("/api/notes", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM notes ORDER BY id DESC");
      res.json(rows.map((r: any) => ({
        id: String(r.id), title: r.title, content: r.content, createdAt: r.created_at, updatedAt: r.updated_at
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.post("/api/notes", authenticateAdmin, async (req, res) => {
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: "নোটের শিরোনাম আবশ্যক।" });
    }

    try {
      const p_content = content || "";
      const dt = formatCurrentDateTime();

      const [result]: any = await pool.query("INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)", [title, p_content, dt, dt]);
      const newNote = {
        id: String(result.insertId), title, content: p_content, createdAt: dt, updatedAt: dt
      };

      addLog("নোট তৈরি", `নোটের শিরোনাম: '${title}' সফলভাবে তৈরি হয়েছে।`);

      res.status(201).json(newNote);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.put("/api/notes/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: "নোটের শিরোনাম আবশ্যক।" });
    }

    try {
      const [rows]: any = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "নোটটি খুঁজে পাওয়া যায়নি।" });
      }

      const p_content = content || "";
      const dt = formatCurrentDateTime();

      await pool.query("UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?", [title, p_content, dt, id]);
      
      const [updatedRows]: any = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
      const r = updatedRows[0];
      const updatedNote = {
        id: String(r.id), title: r.title, content: r.content, createdAt: r.created_at, updatedAt: r.updated_at
      };

      res.json(updatedNote);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.delete("/api/notes/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;

    try {
      const [rows]: any = await pool.query("SELECT * FROM notes WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "নোটটি খুঁজে পাওয়া যায়নি।" });
      }

      const note = rows[0];
      await pool.query("DELETE FROM notes WHERE id = ?", [id]);

      addLog("নোট মুছে ফেলা", `শিরোনাম: '${note.title}' নোটটি সম্পূর্ণ মুছে ফেলা হয়েছে।`);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- AUDIT HISTORY LOOPS ----------------

  app.get("/api/history", authenticateAdmin, async (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();
    const actionFilter = (req.query.action || "").toString();

    try {
      let query = "SELECT * FROM audit_logs";
      const params = [];

      if (q || actionFilter) {
        query += " WHERE 1=1";
        if (q) {
          query += " AND (LOWER(details) LIKE ? OR LOWER(action) LIKE ?)";
          params.push(`%${q}%`, `%${q}%`);
        }
        if (actionFilter) {
          query += " AND action = ?";
          params.push(actionFilter);
        }
      }

      query += " ORDER BY id DESC";

      const [rows]: any = await pool.query(query, params);
      res.json(rows.map((r: any) => ({
        id: String(r.id), action: r.action, details: r.details, timestamp: r.timestamp
      })));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  app.delete("/api/history/:id", authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM audit_logs WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // Delete batch/filtered history
  app.delete("/api/history", authenticateAdmin, async (req, res) => {
    try {
      await pool.query("TRUNCATE TABLE audit_logs");
      addLog("ইতিহাস মুছে ফেলা", `লগ হিস্ট্রি রিবুট করা হয়েছে।`);
      res.json({ success: true, message: "সমস্ত হিস্ট্রি লোগ সফলভাবে বাতিল করা হয়েছে।" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "সার্ভার এরর" });
    }
  });

  // ---------------- SIMULATED SMS SCHEDULER & LIST ----------------

  // Timezone-safe date difference calculation helper for Bangladesh UTC+6
  function getBangladeshDiffDays(todayStr: string, returnDateStr: string): number {
    try {
      const [tY, tM, tD] = todayStr.split("-").map(Number);
      const [rY, rM, rD] = returnDateStr.split("-").map(Number);
      
      const tDate = new Date(tY, tM - 1, tD, 12, 0, 0);
      const rDate = new Date(rY, rM - 1, rD, 12, 0, 0);
      
      const diffTime = tDate.getTime() - rDate.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return -1;
    }
  }


  // Trigger simulated cron job to run check immediately
  app.post("/api/sms/trigger", authenticateAdmin, async (req, res) => {
    try {
      const todayStr = (req.body.todayStr as string) || (req.query.todayStr as string) || getBangladeshDateString();
      const bypassRules = req.body.bypassRules === true || req.body.bypassRules === "true" || req.query.bypassRules === "true";
      
      const [gatewayRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
      const [templateRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
      let gateway = { provider: "simulated", apiKey: "", senderId: "", customUrl: "" };
      let smsTemplate = "আসসালামু আলাইকুম, আপনার ({bookName}) বইটি জমাদেয়ার সময় অতিক্রম হয়েছে। অনুগ্রহ করে বইটি অক্ষর পাঠাগার এ জমা দিয়ে আসুন। আমাদের পাঠাগার প্রতিদিন বিকাল ৪ টা থেকে রাত ৮ টা পর্যন্ত খোলা থাকে। বা আপনার বই যদি পড়া শেষ না হয়ে থাকে তাহলে অনুগ্রহ করে এই নাম্বারে call /WhatsApp এ যোগাযোগ করেন: 01333474848";

      if (gatewayRows.length > 0) {
        const val = typeof gatewayRows[0].setting_value === "string" ? JSON.parse(gatewayRows[0].setting_value) : gatewayRows[0].setting_value;
        if (val) gateway = val;
      }
      if (templateRows.length > 0) {
        const val = typeof templateRows[0].setting_value === "string" ? JSON.parse(templateRows[0].setting_value) : templateRows[0].setting_value;
        if (val) smsTemplate = val;
      }

      const [issues]: any = await pool.query("SELECT * FROM issues WHERE status = 'Issued'");

      // Find all live active alerts for today (corresponds to active overdue notifications that modulo hits)
      const activeAlerts: Array<{ mobile: string; text: string; memberName: string }> = [];

      issues.forEach((issue: any) => {
        // Return date from DB might be a Date object, convert to YYYY-MM-DD string cleanly
        const issueReturnDateStr = (issue.return_date instanceof Date) ? getBangladeshDateString(issue.return_date) : String(issue.return_date).split(" ")[0].split("T")[0];

        const diffDays = getBangladeshDiffDays(todayStr, issueReturnDateStr);

        if (bypassRules || (diffDays >= 0 && diffDays % 2 === 0)) {
          const rawTemplate = smsTemplate;
          const text = rawTemplate
            .replace(/{bookName}/g, issue.book_name)
            .replace(/{বইয়েরনাম}/g, issue.book_name)
            .replace(/{বইয়েরনাম}/g, issue.book_name)
            .replace(/{book}/g, issue.book_name)
            .replace(/{বই}/g, issue.book_name)
            .replace(/{memberName}/g, issue.member_name)
            .replace(/{সদস্যেরনাম}/g, issue.member_name)
            .replace(/{সদস্য}/g, issue.member_name)
            .replace(/{returnDate}/g, issueReturnDateStr)
            .replace(/{ফেরততারিখ}/g, issueReturnDateStr)
            .replace(/{তারিখ}/g, issueReturnDateStr);

          activeAlerts.push({
            mobile: issue.mobile,
            text,
            memberName: issue.member_name
          });
        }
      });

      let responseMsg = "পেন্ডিং সতর্কতা SMS শিডিউলসমূহ সফলভাবে সিঙ্ক করা হয়েছে। (সিমুলেশন মোড)";
      let logDetails = "অটোমেটেড SMS শিডিউল চেক করা হয়েছে এবং সক্রিয় ওভারডিউ সতর্কতা ফরোয়ার্ড করা হয়েছে।";

      // If simulated mode is active
      if (gateway.provider === "simulated") {
        let count = 0;
        for (const alert of activeAlerts) {
          count++;
          addLog("সিমুলেটেড SMS", `সদস্য ${alert.memberName} (${alert.mobile}) কে ফ্রি সিমুলেটেড ওভারডিউ SMS পাঠানো হয়েছে। বার্তা: "${alert.text.slice(0, 60)}..."`);
        }
        responseMsg = `সিমুলেশন মোড (Free) এর মাধ্যমে স্বয়ংক্রিয় শিডিউল সম্পন্ন। মোট ${count} টি রিমাইন্ডার সফলভাবে সিমুলেট করা হয়েছে!`;
        logDetails = `সিমুলেশন মোড (Free) সফলভাবে সম্পন্ন। মোট সিমুলেটেড রিমাইন্ডার: ${count}টি।`;
      }
      // If a real SMS Gateway is configured
      else if (gateway.provider && gateway.provider !== "simulated" && (gateway.apiKey || (gateway.provider === "custom" && gateway.customUrl))) {
        let successCount = 0;
        let failCount = 0;

        for (const alert of activeAlerts) {
          try {
            let url = "";

            // Normalize mobile number (remove non-digits)
            let rawMobile = alert.mobile.replace(/\D/g, "");
            let mobileWith88 = rawMobile.startsWith("88") ? rawMobile : "88" + rawMobile;
            let mobileWithout88 = rawMobile.startsWith("88") ? rawMobile.slice(2) : rawMobile;

            if (gateway.provider === "greenweb") {
              const encodedMsg = encodeURIComponent(alert.text);
              url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(gateway.apiKey)}&to=${encodeURIComponent(mobileWith88)}&message=${encodedMsg}`;
            } else if (gateway.provider === "bulksmsbd") {
              const encodedMsg = encodeURIComponent(alert.text);
              const senderParam = gateway.senderId ? `&senderid=${encodeURIComponent(gateway.senderId)}` : "";
              url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(gateway.apiKey)}&type=text&number=${encodeURIComponent(mobileWith88)}${senderParam}&message=${encodedMsg}`;
            } else if (gateway.provider === "custom") {
              let customUrlStr = gateway.customUrl || "";
              customUrlStr = customUrlStr
                .replace(/{apiKey}/g, encodeURIComponent(gateway.apiKey))
                .replace(/{token}/g, encodeURIComponent(gateway.apiKey))
                .replace(/{to}/g, encodeURIComponent(mobileWith88))
                .replace(/{mobile}/g, encodeURIComponent(mobileWith88))
                .replace(/{mobileNo}/g, encodeURIComponent(mobileWithout88))
                .replace(/{senderId}/g, encodeURIComponent(gateway.senderId))
                .replace(/{message}/g, encodeURIComponent(alert.text))
                .replace(/{msg}/g, encodeURIComponent(alert.text));
              
              url = customUrlStr;
            }

            if (url) {
              console.log(`Sending real SMS to ${alert.memberName} (${alert.mobile}) via ${gateway.provider}`);
              const apiRes = await fetch(url, { method: "GET" });
              const apiText = await apiRes.text();
              console.log(`Gateway response for ${alert.mobile}:`, apiText);
              
              // Log real SMS
              addLog("বাস্তব SMS", `সদস্য ${alert.memberName} (${alert.mobile}) কে ${gateway.provider} গেটওয়ে দিয়ে SMS পাঠানো হয়েছে। রেসপন্স: ${apiText}`);
              successCount++;
            }
          } catch (smsErr) {
            console.error(`Failed to send real SMS to ${alert.mobile}:`, smsErr);
            failCount++;
          }
        }

        responseMsg = `বাস্তব SMS গেটওয়ে (${gateway.provider}) এর মাধ্যমে সতর্কতা রান করা হয়েছে। সফল: ${successCount}টি, ব্যর্থ: ${failCount}টি।`;
        logDetails = `বাস্তব SMS গেটওয়ে (${gateway.provider}) মারফত SMS পাঠানো রান হয়েছে। মোট সফল: ${successCount}, ব্যর্থ: ${failCount}।`;
      }

      addLog("SMS সতর্কতা রান", logDetails);
      res.json({ success: true, message: responseMsg });
    } catch (err: any) {
      console.error("SMS trigger endpoint runtime error:", err);
      res.status(500).json({ error: "SMS শিডিউলার রান করার সময় ইন্টারনাল ত্রুটি হয়েছে।" });
    }
  });

  // POST send a single instant manual SMS message
  app.post("/api/sms/send-single", authenticateAdmin, async (req, res) => {
    try {
      const { mobile, message } = req.body;
      if (!mobile || !message) {
        return res.status(400).json({ error: "মোবাইল এবং বার্তা উভয়ই প্রদান করা আবশ্যক।" });
      }

      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
      let gateway = { provider: "simulated", apiKey: "", senderId: "", customUrl: "" };
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        gateway = val || gateway;
      }

      let rawMobile = mobile.replace(/\D/g, "");
      let mobileWith88 = rawMobile.startsWith("88") ? rawMobile : "88" + rawMobile;
      let mobileWithout88 = rawMobile.startsWith("88") ? rawMobile.slice(2) : rawMobile;

      let logDetails = `ম্যানুয়াল একক SMS প্রেরণের চেষ্টা পাঠানো হয়েছে রিসিপেন্ট নম্বর: ${mobile}`;
      let responseMsg = "সফলভাবে একক SMS পাঠানো হয়েছে (সিমুলেশন মোড - নোটিফিকেশন লগে সংরক্ষিত)";
      let success = true;
      let isSimulated = true;

      if (gateway.provider && gateway.provider !== "simulated" && (gateway.apiKey || (gateway.provider === "custom" && gateway.customUrl))) {
        isSimulated = false;
        let url = "";
        const encodedMsg = encodeURIComponent(message);

        if (gateway.provider === "greenweb") {
          url = `https://api.greenweb.com.bd/api.php?token=${encodeURIComponent(gateway.apiKey)}&to=${encodeURIComponent(mobileWith88)}&message=${encodedMsg}`;
        } else if (gateway.provider === "bulksmsbd") {
          const senderParam = gateway.senderId ? `&senderid=${encodeURIComponent(gateway.senderId)}` : "";
          url = `https://bulksmsbd.net/api/smsapi?api_key=${encodeURIComponent(gateway.apiKey)}&type=text&number=${encodeURIComponent(mobileWith88)}${senderParam}&message=${encodedMsg}`;
        } else if (gateway.provider === "custom") {
          let customUrlStr = gateway.customUrl || "";
          customUrlStr = customUrlStr
            .replace(/{apiKey}/g, encodeURIComponent(gateway.apiKey))
            .replace(/{token}/g, encodeURIComponent(gateway.apiKey))
            .replace(/{to}/g, encodeURIComponent(mobileWith88))
            .replace(/{mobile}/g, encodeURIComponent(mobileWith88))
            .replace(/{mobileNo}/g, encodeURIComponent(mobileWithout88))
            .replace(/{senderId}/g, encodeURIComponent(gateway.senderId))
            .replace(/{message}/g, encodedMsg)
            .replace(/{msg}/g, encodedMsg);
          url = customUrlStr;
        }

        if (url) {
          console.log(`Sending single SMS to ${mobile} via ${gateway.provider}: ${url}`);
          const apiRes = await fetch(url, { method: "GET" });
          const apiText = await apiRes.text();
          console.log(`Single SMS response for ${mobile}:`, apiText);
          
          if (apiText.toLowerCase().includes("error") || apiText.toLowerCase().includes("failed") || apiText.toLowerCase().includes("invalid")) {
            success = false;
            responseMsg = `গেটওয়ে থেকে এরর পাওয়া গেছে: ${apiText}`;
          } else {
            responseMsg = `সফলভাবে একক SMS পাঠানো হয়েছে! গেটওয়ে রেসপন্স: ${apiText}`;
          }
        }
      }

      const logAction = isSimulated ? "ম্যানুয়াল SMS (সিমুলেশন)" : "ম্যানুয়াল SMS (বাস্তব)";
      const logBody = isSimulated 
        ? `নম্বর ${mobile}-এ ফ্রি সিমুলেটেড SMS বার্তা পাঠানো হয়েছে। বার্তা: "${message}"` 
        : `নম্বর ${mobile}-এ বাস্তব SMS পাঠানো হয়েছে। বার্তা: "${message}"`;
      
      addLog(logAction, logBody);
      res.json({ success, message: responseMsg });
    } catch (err: any) {
      console.error("Single SMS send runtime error:", err);
      res.status(500).json({ error: `SMS পাঠাতে অভ্যন্তরীণ ত্রুটি হয়েছে: ${err.message || err}` });
    }
  });



  // ---------------- PUBLIC PORTAL & GROUPS & LEADERBOARDS API ----------------

  // 1. Member login
  app.post("/api/public/member-login", async (req, res) => {
    try {
      const { formNumber, dob, mobile } = req.body;
      if (!formNumber || !mobile) {
        return res.status(400).json({ error: "সদস্য ফরম নং এবং মোবাইল নম্বর দেওয়া আবশ্যক।" });
      }

      const [memberRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber.trim()]);
      if (memberRows.length === 0) {
        return res.status(404).json({ error: "এই ফরম নম্বরের কোনো সদস্য খুঁজে পাওয়া যায়নি।" });
      }

      const m = memberRows[0];
      const member = {
        id: String(m.id), formNumber: m.form_number, name: m.name, nameEnglish: m.name_english,
        mobile: m.mobile, address: m.address, dob: m.dob, educationInstitution: m.education_institution,
        className: m.class_name, classRoll: m.class_roll, fatherName: m.father_name, motherName: m.mother_name,
        currVillage: m.curr_village, currPostOffice: m.curr_post_office, currUpazila: m.curr_upazila, currDistrict: m.curr_district,
        permVillage: m.perm_village, permPostOffice: m.perm_post_office, permUpazila: m.perm_upazila, permDistrict: m.perm_district,
        bloodGroup: m.blood_group, nidBirthReg: m.nid_birth_reg, educationQualification: m.education_qualification,
        profession: m.profession, nationality: m.nationality, photo: m.photo, paymentStatus: m.payment_status
      };

      // Check mobile. Match last 10 digits to be extremely robust against country codes or formats
      const cleanMobile = mobile.replace(/\D/g, "");
      const cleanMemberMobile = member.mobile.replace(/\D/g, "");
      if (!cleanMemberMobile.includes(cleanMobile) && !cleanMobile.includes(cleanMemberMobile)) {
        return res.status(400).json({ error: "প্রদত্ত মোবাইল নম্বরটি এই সদস্যের তথ্যের সাথে মিলছে না।" });
      }

      // If DOB is already registered in the DB, verify it. Otherwise, save the user's provided DOB for them!
      if (member.dob && member.dob.trim()) {
        const normDobInDb = member.dob.trim().replace(/[-\/]/g, "");
        const normInputDob = (dob || "").trim().replace(/[-\/]/g, "");
        if (normDobInDb && normInputDob && normDobInDb !== normInputDob) {
          return res.status(400).json({ error: "প্রদত্ত জন্ম তারিখটি আমাদের রেকর্ডের সাথে মিলছে না।" });
        }
      } else if (dob && dob.trim()) {
        // Automatically save the DOB to their member profile
        member.dob = dob.trim();
        await pool.query("UPDATE members SET dob = ? WHERE id = ?", [member.dob, m.id]);
        addLog("জন্ম তারিখ আপডেট", `সদস্য ${member.name} (ফরম: ${member.formNumber}) এর জন্ম তারিখ প্রথম লগইনে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।`);
      }

      res.json({ success: true, member });
    } catch (err: any) {
      console.error("Member login failed:", err);
      res.status(500).json({ error: "লগইন করতে অভ্যন্তরীণ সার্ভার ত্রুটি হয়েছে।" });
    }
  });

  // 1c. Public member registration self-service
  app.post("/api/public/register", async (req, res) => {
    try {
      const {
        name, nameEnglish, fatherName, motherName, currVillage, currPostOffice, currUpazila, currDistrict,
        permVillage, permPostOffice, permUpazila, permDistrict, dob, mobile, bloodGroup, nidBirthReg,
        educationInstitution, className, classRoll, educationQualification, profession, nationality,
        paymentMethod, senderNumber, transactionId, photo
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "আবেদনকারীর পূর্ণ নাম (বাংলায়) প্রদান করা আবশ্যক।" });
      }
      if (!mobile || !mobile.trim()) {
        return res.status(400).json({ error: "মোবাইল নম্বর প্রদান করা আবশ্যক।" });
      }
      if (!dob || !dob.trim()) {
        return res.status(400).json({ error: "জন্ম তারিখ প্রদান করা আবশ্যক।" });
      }

      if (paymentMethod && paymentMethod !== "অফলাইন কাউন্টার") {
        if (!senderNumber || !senderNumber.trim()) {
          return res.status(400).json({ error: "মোবাইল ব্যাংকিংয়ের ক্ষেত্রে যে নম্বর থেকে টাকা পাঠিয়েছেন তা দেওয়া আবশ্যক।" });
        }
        if (!transactionId || !transactionId.trim()) {
          return res.status(400).json({ error: "মোবাইল ব্যাংকিংয়ের ক্ষেত্রে ট্রানজেকশন আইডি (TrxID) দেওয়া আবশ্যক।" });
        }
      }

      // Check if mobile is already registered
      const cleanMobile = mobile.replace(/\D/g, "");
      const [existingRows]: any = await pool.query("SELECT id FROM members WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mobile, ' ', ''), '-', ''), '+', ''), '(', ''), ')', '') LIKE ?", [`%${cleanMobile}%`]);
      if (existingRows.length > 0) {
        return res.status(400).json({ error: "এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যেই একাউন্ট রেজিস্টার্ড রয়েছে।" });
      }

      // Auto-generate unique Form Number. Find the highest numeric Form Number and add 1
      const [maxFormRows]: any = await pool.query("SELECT MAX(CAST(form_number AS UNSIGNED)) as max_form FROM members WHERE form_number REGEXP '^[0-9]+$'");
      let maxForm = 999;
      if (maxFormRows.length > 0 && maxFormRows[0].max_form !== null) {
        maxForm = Math.max(999, parseInt(maxFormRows[0].max_form, 10));
      }
      const nextFormNumber = (maxForm + 1).toString();

      // Compile current address and permanent address
      const addressStr = `বর্তমান: ${currVillage || ""}, ডাকঘর: ${currPostOffice || ""}, উপজেলা: ${currUpazila || ""}, জেলা: ${currDistrict || ""}. স্থায়ী: ${permVillage || ""}, ডাকঘর: ${permPostOffice || ""}, উপজেলা: ${permUpazila || ""}, জেলা: ${permDistrict || ""}`;

      const p_paymentStatus = paymentMethod === "অফলাইন কাউন্টার" ? "Unpaid" : "Pending";

      const insertValues = [
        nextFormNumber, name.trim(), (nameEnglish || "").trim(), mobile.trim(), addressStr, dob.trim(),
        (educationInstitution || "").trim(), (className || "").trim(), (classRoll || "").trim(),
        (fatherName || "").trim(), (motherName || "").trim(), (currVillage || "").trim(),
        (currPostOffice || "").trim(), (currUpazila || "").trim(), (currDistrict || "").trim(),
        (permVillage || "").trim(), (permPostOffice || "").trim(), (permUpazila || "").trim(),
        (permDistrict || "").trim(), (bloodGroup || "").trim(), (nidBirthReg || "").trim(),
        (educationQualification || "").trim(), (profession || "").trim(), (nationality || "বাংলাদেশী").trim(),
        (paymentMethod || "অফলাইন কাউন্টার").trim(), p_paymentStatus, photo || ""
      ];

      const [resInsert]: any = await pool.query(
        `INSERT INTO members (
          form_number, name, name_english, mobile, address, dob,
          education_institution, class_name, class_roll, father_name, mother_name,
          curr_village, curr_post_office, curr_upazila, curr_district,
          perm_village, perm_post_office, perm_upazila, perm_district,
          blood_group, nid_birth_reg, education_qualification, profession, nationality,
          payment_method, payment_status, photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        insertValues
      );

      const [newRow]: any = await pool.query("SELECT * FROM members WHERE id = ?", [resInsert.insertId]);
      const r = newRow[0];
      const newMember = {
        id: String(r.id), formNumber: r.form_number, name: r.name, nameEnglish: r.name_english,
        mobile: r.mobile, address: r.address, dob: r.dob, educationInstitution: r.education_institution,
        className: r.class_name, classRoll: r.class_roll, fatherName: r.father_name, motherName: r.mother_name,
        currVillage: r.curr_village, currPostOffice: r.curr_post_office, currUpazila: r.curr_upazila, currDistrict: r.curr_district,
        permVillage: r.perm_village, permPostOffice: r.perm_post_office, permUpazila: r.perm_upazila, permDistrict: r.perm_district,
        bloodGroup: r.blood_group, nidBirthReg: r.nid_birth_reg, educationQualification: r.education_qualification,
        profession: r.profession, nationality: r.nationality, photo: r.photo, paymentStatus: r.payment_status
      };



      addLog("সদস্য নিবন্ধন", `নতুন সদস্য নিজে অনলাইন নিবন্ধন ফরমের মাধ্যমে যুক্ত হয়েছেন: ${name.trim()} (ফরম নম্বর: ${nextFormNumber})`);

      res.status(201).json({ success: true, member: newMember });
    } catch (err: any) {
      console.error("Public self-registration failed:", err);
      res.status(500).json({ error: "নিবন্ধন সম্পন্ন করতে সার্ভার ত্রুটি হয়েছে।" });
    }
  });

  // 1b. Public Member Profile & History (No admin token required)
  app.get("/api/public/members/:formNumber/profile", async (req, res) => {
    try {
      const { formNumber } = req.params;
      
      const [memberRows]: any = await pool.query("SELECT * FROM members WHERE form_number = ?", [formNumber.trim()]);
      if (memberRows.length === 0) {
        return res.status(404).json({ error: "এই ফরম নম্বরের কোনো সদস্য খুঁজে পাওয়া যায়নি।" });
      }
      
      const m = memberRows[0];
      const member = {
        id: String(m.id), formNumber: m.form_number, name: m.name, nameEnglish: m.name_english,
        mobile: m.mobile, address: m.address, dob: m.dob, educationInstitution: m.education_institution,
        className: m.class_name, classRoll: m.class_roll, fatherName: m.father_name, motherName: m.mother_name,
        currVillage: m.curr_village, currPostOffice: m.curr_post_office, currUpazila: m.curr_upazila, currDistrict: m.curr_district,
        permVillage: m.perm_village, permPostOffice: m.perm_post_office, permUpazila: m.perm_upazila, permDistrict: m.perm_district,
        bloodGroup: m.blood_group, nidBirthReg: m.nid_birth_reg, educationQualification: m.education_qualification,
        profession: m.profession, nationality: m.nationality, photo: m.photo, paymentStatus: m.payment_status
      };

      const [issueRows]: any = await pool.query(
        "SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number, m.address as member_address FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.member_id = ?",
        [m.id]
      );
      
      const issues = issueRows.map((r: any) => ({
        id: String(r.id), bookCode: r.book_code, bookName: r.book_name, memberName: r.member_name, formNumber: r.member_form_number,
        mobile: r.member_mobile, address: r.member_address, issueDate: r.issue_date, returnDate: r.return_date,
        actualReturnDate: r.returned_at, status: r.status, extensionHistory: typeof r.extension_history === 'string' ? JSON.parse(r.extension_history) : (r.extension_history || []),
        comments: typeof r.comments === 'string' ? JSON.parse(r.comments) : (r.comments || [])
      }));

      const activeRents = issues.filter((i: any) => i.status === "Issued");
      const returnedHistory = issues.filter((i: any) => i.status === "Returned");
      
      res.json({
        success: true,
        member,
        activeRents,
        returnedHistory,
        rentCount: issues.length,
      });
    } catch (err: any) {
      console.error("Public profile fetch failed:", err);
      res.status(500).json({ error: "প্রোফাইল লোড করতে ব্যর্থ।" });
    }
  });

  // 2. Fetch all book groups
  app.get("/api/public/groups", async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
      let groups = ["নজরুল কর্নার", "রবীন্দ্রনাথ কর্নার", "উপন্যাস", "গল্প"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        groups = val || groups;
      }
      res.json({ success: true, groups });
    } catch (err: any) {
      res.status(500).json({ error: "গ্রুপ সমূহ লোড করতে ব্যর্থ।" });
    }
  });

  // 2b. Fetch active membership fee payment methods
  app.get("/api/public/payment-methods", async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'paymentMethods'");
      let paymentMethods = [];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        paymentMethods = val || [];
      }
      res.json({ success: true, paymentMethods });
    } catch (err: any) {
      res.status(500).json({ error: "পেমেন্ট মাধ্যমসমূহ লোড করতে ব্যর্থ।" });
    }
  });

  // 2c. Save membership fee payment methods (Admin only)
  app.post("/api/settings/payment-methods", authenticateAdmin, async (req, res) => {
    try {
      const { paymentMethods } = req.body;
      if (!Array.isArray(paymentMethods)) {
        return res.status(400).json({ error: "পেমেন্ট মেথড লিস্ট অবশ্যই একটি অ্যারে হতে হবে।" });
      }

      const formattedMethods = paymentMethods.map((pm: any, idx: number) => ({
        id: pm.id || `pm-${Date.now()}-${idx}`,
        name: (pm.name || "").trim(),
        type: (pm.type || "Personal").trim(),
        number: (pm.number || "").trim()
      })).filter((pm: any) => pm.name && pm.number);
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['paymentMethods', JSON.stringify(formattedMethods)]
      );

      addLog("পেমেন্ট সেটিং", "সদস্য মেম্বারশিপ ফি পেমেন্ট মেথড তালিকা আপডেট করা হয়েছে।");
      res.json({ success: true, paymentMethods: formattedMethods });
    } catch (err: any) {
      res.status(500).json({ error: "পেমেন্ট মেথড আপডেট করতে সার্ভার ত্রুটি হয়েছে।" });
    }
  });

  // 3. Add a new book group (Admin only)
  app.post("/api/settings/groups", authenticateAdmin, async (req, res) => {
    try {
      const { groupName } = req.body;
      if (!groupName || !groupName.trim()) {
        return res.status(400).json({ error: "গ্রুপের নাম প্রদান করা আবশ্যক।" });
      }

      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
      let currentGroups = ["নজরুল কর্নার", "রবীন্দ্রনাথ কর্নার", "উপন্যাস", "গল্প"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        currentGroups = val || currentGroups;
      }
      
      const trimmedName = groupName.trim();
      if (currentGroups.some((g: string) => g.toLowerCase() === trimmedName.toLowerCase())) {
        return res.status(400).json({ error: "এই গ্রুপটি ইতিমধ্যে বিদ্যমান রয়েছে।" });
      }

      currentGroups.push(trimmedName);
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['groups', JSON.stringify(currentGroups)]
      );

      addLog("গ্রুপ যোগ", `নতুন বইয়ের গ্রুপ '${trimmedName}' যোগ করা হয়েছে।`);
      res.json({ success: true, groups: currentGroups });
    } catch (err: any) {
      res.status(500).json({ error: "গ্রুপ তৈরি করতে সমস্যা হয়েছে।" });
    }
  });

  // 4. Delete a book group (Admin only)
  app.delete("/api/settings/groups/:groupName", authenticateAdmin, async (req, res) => {
    try {
      const { groupName } = req.params;
      
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
      let currentGroups = ["নজরুল কর্নার", "রবীন্দ্রনাথ কর্নার", "উপন্যাস", "গল্প"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        currentGroups = val || currentGroups;
      }
      
      currentGroups = currentGroups.filter((g: string) => g.toLowerCase() !== groupName.toLowerCase());
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['groups', JSON.stringify(currentGroups)]
      );

      addLog("গ্রুপ ডিলিট", `বইয়ের গ্রুপ '${groupName}' ডিলিট করা হয়েছে।`);
      res.json({ success: true, groups: currentGroups });
    } catch (err: any) {
      res.status(500).json({ error: "গ্রুপ ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  // 5. Fetch public stats
  app.get("/api/public/stats", async (req, res) => {
    try {
      const [bookRows]: any = await pool.query("SELECT status, COUNT(*) as count FROM books GROUP BY status");
      let totalBooks = 0;
      let issuedBooks = 0;
      let availableBooks = 0;
      bookRows.forEach((r: any) => {
        totalBooks += r.count;
        if (r.status === "Issued") issuedBooks += r.count;
        else if (r.status === "Available") availableBooks += r.count;
      });

      const [memberRows]: any = await pool.query("SELECT COUNT(*) as count FROM members");
      const activeMembers = memberRows[0]?.count || 0;

      const [cornerRows]: any = await pool.query("SELECT COUNT(DISTINCT group_name) as count FROM books WHERE group_name IS NOT NULL AND group_name != ''");
      const activeCorners = cornerRows[0]?.count || 0;

      // Calculate years running (e.g. from 2021 or 2022)
      const startYear = 2021;
      const currentYear = new Date().getFullYear();
      const yearsRunning = Math.max(1, currentYear - startYear);

      res.json({ success: true, totalBooks, issuedBooks, availableBooks, activeMembers, activeCorners, yearsRunning });
    } catch (err: any) {
      res.status(500).json({ error: "পরিসংখ্যান লোড করা যায়নি।" });
    }
  });

  // 6. Public Book List (Search & Filter)
  app.get("/api/public/books", async (req, res) => {
    try {
      const { q, status, group } = req.query;
      let query = "SELECT * FROM books WHERE 1=1";
      const params: any[] = [];
      
      if (q) {
        query += " AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?)";
        const likeQ = `%${q.toString().toLowerCase().trim()}%`;
        params.push(likeQ, likeQ, likeQ, likeQ);
      }
      
      if (status) {
        query += " AND status = ?";
        params.push(status);
      }
      
      if (group) {
        query += " AND LOWER(group_name) = ?";
        params.push(group.toString().toLowerCase().trim());
      }
      
      const [rows]: any = await pool.query(query, params);
      const books = rows.map((r: any) => ({
        id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher,
        imageUrl: r.image_url, status: r.status, group: r.group_name,
        description: r.description, pageCount: r.page_count, price: r.price
      }));

      res.json({ success: true, books });
    } catch (err: any) {
      res.status(500).json({ error: "বইয়ের তালিকা লোড করা যায়নি।" });
    }
  });

  // 6.2. Public Corners (Book Groups with counts + top books)
  app.get("/api/public/corners", async (req, res) => {
    try {
      // Get all distinct group_names with their book counts
      const [groupRows]: any = await pool.query(
        `SELECT group_name, COUNT(*) as book_count 
         FROM books 
         WHERE group_name IS NOT NULL AND group_name != '' 
         GROUP BY group_name 
         ORDER BY book_count DESC`
      );

      // For each corner, get the top 5 most-issued books
      const corners = [];
      for (const row of groupRows) {
        const [topBooks]: any = await pool.query(
          `SELECT b.id, b.code, b.name, b.author, b.image_url,
                  (SELECT COUNT(*) FROM issues i WHERE i.book_code = b.code) as issue_count
           FROM books b
           WHERE b.group_name = ?
           ORDER BY issue_count DESC, b.id DESC
           LIMIT 5`,
          [row.group_name]
        );

        corners.push({
          name: row.group_name,
          bookCount: row.book_count,
          topBooks: topBooks.map((b: any) => ({
            id: String(b.id),
            code: b.code,
            title: b.name,
            author: b.author,
            imageUrl: b.image_url,
            reads: b.issue_count || 0
          }))
        });
      }

      res.json({ success: true, corners });
    } catch (err: any) {
      console.error("GET /api/public/corners error:", err);
      res.status(500).json({ error: "কর্নার তালিকা লোড করা যায়নি।" });
    }
  });

  // 6.5. Public Contact Submission
  app.post("/api/public/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: "নাম, ইমেইল এবং বার্তা আবশ্যক।" });
      }
      
      const [resInsert]: any = await pool.query(
        "INSERT INTO contact_submissions (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [name.trim(), email.trim(), (phone || "").trim(), (subject || "").trim(), message.trim(), formatCurrentDateTime()]
      );

      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) {
        const htmlContent = `
          <h2>নতুন যোগাযোগ ফরম সাবমিশন</h2>
          <p><strong>নাম:</strong> ${name}</p>
          <p><strong>ইমেইল:</strong> ${email}</p>
          <p><strong>ফোন:</strong> ${phone || "প্রদান করা হয়নি"}</p>
          <p><strong>বিষয়:</strong> ${subject || "নেই"}</p>
          <p><strong>বার্তা:</strong><br/> ${message.replace(/\n/g, '<br/>')}</p>
        `;
        
        try {
          const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": apiKey,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "অক্ষর পাঠাগার", email: "hello@okkhorpathagar.com" },
              to: [{ email: "okkhorpathagar@gmail.com", name: "Admin" }],
              subject: "নতুন যোগাযোগ ফরম সাবমিশন - " + (subject || "No Subject"),
              htmlContent: htmlContent
            })
          });

          if (!emailRes.ok) {
            const errorData = await emailRes.json();
            console.warn("Brevo Email Notification warning:", errorData);
          }
        } catch (emailErr) {
          console.error("Failed to send Brevo email notification:", emailErr);
        }
      }

      res.status(201).json({ success: true, id: resInsert.insertId });
    } catch (err: any) {
      console.error("POST /api/public/contact error:", err);
      res.status(500).json({ error: "যোগাযোগের তথ্য জমা দিতে সমস্যা হয়েছে।" });
    }
  });

  // 7. Public wishlist post (for members)
  app.post("/api/public/wishlist", async (req, res) => {
    try {
      const { name, author, publisher, memberFormNumber } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "বইয়ের নাম আবশ্যক।" });
      }

      const [bookRows]: any = await pool.query("SELECT id FROM books WHERE LOWER(name) = ?", [name.trim().toLowerCase()]);
      const isAvailable = bookRows.length > 0;
      
      const [resInsert]: any = await pool.query(
        "INSERT INTO wishlist (name, author, publisher, member_form_number, created_at, status) VALUES (?, ?, ?, ?, ?, ?)",
        [name.trim(), (author || "").trim() || "অজ্ঞাত", (publisher || "").trim() || "অজ্ঞাত", memberFormNumber || "", formatCurrentDateTime(), isAvailable ? "Available" : "Waiting"]
      );

      const newItem = {
        id: String(resInsert.insertId),
        name: name.trim(),
        author: (author || "").trim() || "অজ্ঞাত",
        publisher: (publisher || "").trim() || "অজ্ঞাত",
        createdAt: formatCurrentDateTime(),
        memberFormNumber: memberFormNumber || "",
        status: isAvailable ? "Available" : "Waiting"
      };



      addLog("উইশলিস্ট যোগ", `সদস্য ${memberFormNumber || "গোপন"} উইশলিস্টে নতুন বই '${name}' যোগ করেছেন।`);

      res.status(201).json({ success: true, item: newItem });
    } catch (err: any) {
      res.status(500).json({ error: "উইশলিস্টে যুক্ত করতে সমস্যা হয়েছে।" });
    }
  });

  // 8. Public Wishlist fetch (with dynamic status resolution)
  app.get("/api/public/wishlist", async (req, res) => {
    try {
      const { memberFormNumber } = req.query;
      let query = "SELECT * FROM wishlist";
      const params: any[] = [];

      if (memberFormNumber) {
        query += " WHERE member_form_number = ?";
        params.push(memberFormNumber.toString());
      }
      query += " ORDER BY id DESC";

      const [rows]: any = await pool.query(query, params);
      
      const resolvedList = [];
      for (const item of rows) {
        const [bookRows]: any = await pool.query("SELECT id FROM books WHERE LOWER(name) = ?", [item.name.trim().toLowerCase()]);
        resolvedList.push({
          id: String(item.id),
          name: item.name,
          author: item.author,
          publisher: item.publisher,
          createdAt: item.created_at,
          memberFormNumber: item.member_form_number,
          status: bookRows.length > 0 ? "Available" : "Waiting"
        });
      }

      res.json({ success: true, wishlist: resolvedList });
    } catch (err: any) {
      res.status(500).json({ error: "উইশলিস্ট লোড করা যায়নি।" });
    }
  });

  // 9. Public Book Leaderboard
  app.get("/api/public/leaderboard/books", async (req, res) => {
    try {
      const [rows]: any = await pool.query(
        `SELECT b.id, b.code, b.name, b.author, b.image_url, b.group_name, COUNT(i.id) as count
         FROM issues i
         JOIN books b ON i.book_id = b.id
         GROUP BY b.id, b.code, b.name, b.author, b.image_url, b.group_name
         ORDER BY count DESC
         LIMIT 10`
      );

      const list = rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        author: r.author || "অজ্ঞাত",
        imageUrl: r.image_url || "",
        group: r.group_name || "",
        count: r.count,
        issueCount: r.count
      }));

      res.json({ success: true, leaderboard: list });
    } catch (err: any) {
      res.status(500).json({ error: "বই লিডারবোর্ড লোড করা যায়নি।" });
    }
  });

  // 10b. Admin Notifications — books due today
  app.get("/api/admin/notifications", authenticateAdmin, async (req, res) => {
    try {
      const todayStr = getBangladeshDateString();
      const [rows]: any = await pool.query(
        `SELECT i.id, i.return_date, b.name as book_name, b.code as book_code, m.name as member_name, m.form_number, m.mobile
         FROM issues i
         JOIN books b ON i.book_id = b.id
         JOIN members m ON i.member_id = m.id
         WHERE i.status = 'Issued' AND DATE(i.return_date) = ?`,
        [todayStr]
      );

      const dueTodayList = rows.map((r: any) => ({
        issueId: String(r.id),
        bookName: r.book_name,
        bookCode: r.book_code,
        memberName: r.member_name,
        formNumber: r.form_number,
        mobile: r.mobile,
        returnDate: r.return_date
      }));

      res.json({ success: true, count: dueTodayList.length, dueToday: dueTodayList });
    } catch (err: any) {
      console.error("GET /api/admin/notifications error:", err);
      res.status(500).json({ error: "নটিফিকেশন লোড করতে ব্যর্থ।" });
    }
  });

  // 10. Admin Member Leaderboard (Admin Only)
  app.get("/api/admin/leaderboard/members", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query(
        "SELECT form_number, member_name, mobile, COUNT(*) as count FROM issues GROUP BY form_number, member_name, mobile ORDER BY count DESC"
      );
      
      const list = rows.map((r: any) => ({
        formNumber: r.form_number,
        name: r.member_name,
        mobile: r.mobile,
        count: r.count
      }));
      
      res.json({ success: true, leaderboard: list });
    } catch (err: any) {
      res.status(500).json({ error: "সদস্য লিডারবোর্ড লোড করা যায়নি।" });
    }
  });

  // --- Sales Corner / Shop Corner APIs ---
  // 1. Get all shop items (Public)
  app.get("/api/public/shop/items", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM shop_items ORDER BY id DESC");
      const shopItems = rows.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        description: r.description,
        price: r.price,
        imageUrl: r.image_url,
        category: r.category,
        createdAt: r.created_at
      }));
      res.json({ success: true, shopItems });
    } catch (err: any) {
      res.status(500).json({ error: "বিক্রয় কর্নার সামগ্রী লোড করা যায়নি।" });
    }
  });

  // 1b. Get all shop categories/groups (Public)
  app.get("/api/public/shop/categories", async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
      let categories = ["টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        categories = val || categories;
      }
      res.json({ success: true, categories });
    } catch (err: any) {
      res.status(500).json({ error: "বিক্রয় ক্যাটাগরি লোড করতে ব্যর্থ।" });
    }
  });

  // 1d. Get shop helpline config (Public)
  app.get("/api/public/shop/helpline", async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'shopHelpline'");
      let helpline = {
        number: "০১৩৩৩৪৭৮৪৪৮",
        text: "বিক্রয় কর্নারের যেকোনো পণ্য সংগ্রহ করতে আমাদের হেল্পলাইন নাম্বারে যোগাযোগ করুন অথবা সরাসরি অক্ষর লাইব্রেরির কাউন্টারে ভিজিট করে সংগ্রহ করতে পারবেন।"
      };
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        helpline = val || helpline;
      }
      res.json({ success: true, helpline });
    } catch (err: any) {
      res.status(500).json({ error: "হেল্পলাইন তথ্য লোড করতে ব্যর্থ।" });
    }
  });

  // 1e. Save shop helpline config (Admin only)
  app.post("/api/settings/shop/helpline", authenticateAdmin, async (req, res) => {
    try {
      const { number, text } = req.body;
      if (!number || !number.trim() || !text || !text.trim()) {
        return res.status(400).json({ error: "হেল্পলাইন নাম্বার এবং ক্রয় করার নির্দেশিকা লিখুন।" });
      }

      const newHelpline = {
        number: number.trim(),
        text: text.trim()
      };
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['shopHelpline', JSON.stringify(newHelpline)]
      );

      addLog("হেল্পলাইন আপডেট", `বিক্রয় কর্নারের হেল্পলাইন কাস্টমাইজ করা হয়েছে। নাম্বার: ${number.trim()}`);
      res.json({ success: true, helpline: newHelpline });
    } catch (err: any) {
      res.status(500).json({ error: "হেল্পলাইন কাস্টমাইজেশন সেভ করতে ব্যর্থ।" });
    }
  });

  // 1c. Add a new shop category/group (Admin only)
  app.post("/api/settings/shop/categories", authenticateAdmin, async (req, res) => {
    try {
      const { categoryName } = req.body;
      if (!categoryName || !categoryName.trim()) {
        return res.status(400).json({ error: "ক্যাটাগরির নাম প্রদান করা আবশ্যক।" });
      }

      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
      let currentCategories = ["টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        currentCategories = val || currentCategories;
      }

      const trimmedName = categoryName.trim();
      if (currentCategories.some((c: string) => c.toLowerCase() === trimmedName.toLowerCase())) {
        return res.status(400).json({ error: "এই ক্যাটাগরি বা গ্রুপটি ইতিমধ্যে বিদ্যমান রয়েছে।" });
      }

      currentCategories.push(trimmedName);
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['shopCategories', JSON.stringify(currentCategories)]
      );

      addLog("ক্যাটাগরি যোগ", `নতুন বিক্রয় ক্যাটাগরি '${trimmedName}' যোগ করা হয়েছে।`);
      res.json({ success: true, categories: currentCategories });
    } catch (err: any) {
      res.status(500).json({ error: "ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে।" });
    }
  });

  // 1d. Delete a shop category/group (Admin only)
  app.delete("/api/settings/shop/categories/:categoryName", authenticateAdmin, async (req, res) => {
    try {
      const { categoryName } = req.params;
      
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
      let currentCategories = ["টি-শার্ট", "প্যাড", "বই", "মগ", "অন্যান্য"];
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        currentCategories = val || currentCategories;
      }

      currentCategories = currentCategories.filter((c: string) => c.toLowerCase() !== categoryName.toLowerCase());
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['shopCategories', JSON.stringify(currentCategories)]
      );

      addLog("ক্যাটাগরি ডিলিট", `বিক্রয় ক্যাটাগরি '${categoryName}' ডিলিট করা হয়েছে।`);
      res.json({ success: true, categories: currentCategories });
    } catch (err: any) {
      res.status(500).json({ error: "ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে।" });
    }
  });

  // 2. Add a new shop item (Admin only)
  app.post("/api/admin/shop/items", authenticateAdmin, async (req, res) => {
    try {
      const { name, description, price, category, imageUrl } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ error: "নাম, মূল্য এবং ক্যাটাগরি পূরণ করা আবশ্যক!" });
      }

      const [resInsert]: any = await pool.query(
        "INSERT INTO shop_items (name, description, price, image_url, category, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [name.trim(), (description || "").trim(), Number(price), imageUrl || "", category.trim(), formatCurrentDateTime()]
      );

      const newItem = {
        id: String(resInsert.insertId),
        name: name.trim(),
        description: (description || "").trim(),
        price: Number(price),
        category: category.trim(),
        imageUrl: imageUrl || "",
        createdAt: formatCurrentDateTime()
      };

      addLog("বিক্রয় কর্নার", `নতুন পণ্য '${newItem.name}' যোগ করা হয়েছে। মূল্য: ${newItem.price} টাকা`);
      res.json({ success: true, item: newItem });
    } catch (err: any) {
      res.status(500).json({ error: "নতুন পণ্য যোগ করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 3. Edit shop item (Admin only)
  app.put("/api/admin/shop/items/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category, imageUrl } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ error: "নাম, মূল্য এবং ক্যাটাগরি পূরণ করা আবশ্যক!" });
      }

      await pool.query(
        "UPDATE shop_items SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?",
        [name.trim(), (description || "").trim(), Number(price), category.trim(), imageUrl || "", id]
      );

      addLog("বিক্রয় কর্নার", `পণ্য '${name.trim()}' এর তথ্য পরিবর্তন করা হয়েছে।`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "পণ্যের তথ্য পরিবর্তন করতে ব্যর্থ হয়েছে।" });
    }
  });

  // 4. Delete shop item (Admin only)
  app.delete("/api/admin/shop/items/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query("SELECT name FROM shop_items WHERE id = ?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "পণ্যটি খুঁজে পাওয়া যায়নি।" });
      }

      await pool.query("DELETE FROM shop_items WHERE id = ?", [id]);
      addLog("বিক্রয় কর্নার", `'${rows[0].name}' পণ্যটি বিক্রয় তালিকা থেকে মুছে ফেলা হয়েছে।`);
      res.json({ success: true, message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।" });
    } catch (err: any) {
      res.status(500).json({ error: "পণ্যটি মুছতে ব্যর্থ হয়েছে।" });
    }
  });

  // Get custom login flow setting (Public)
  app.get("/api/public/settings/login-flow", async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'isCustomLoginFlowEnabled'");
      let isCustomLoginFlowEnabled = false;
      if (settingsRows.length > 0) {
        const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
        isCustomLoginFlowEnabled = !!val;
      }
      res.json({ success: true, isCustomLoginFlowEnabled });
    } catch (err: any) {
      res.status(500).json({ error: "লগইন ফ্লো সেটিংস লোড করতে ব্যর্থ।" });
    }
  });

  // Save custom login flow setting (Admin only)
  app.post("/api/settings/login-flow", authenticateAdmin, async (req, res) => {
    try {
      const { isEnabled } = req.body;
      
      const isCustomLoginFlowEnabled = !!isEnabled;
      
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        ['isCustomLoginFlowEnabled', JSON.stringify(isCustomLoginFlowEnabled)]
      );

      addLog("সেটিংস পরিবর্তন", `কাস্টম লগইন ফ্লো ${isEnabled ? "সক্রিয়" : "নিষ্ক্রিয়"} করা হয়েছে।`);
      res.json({ success: true, isCustomLoginFlowEnabled });
    } catch (err: any) {
      res.status(500).json({ error: "কাস্টম লগইন ফ্লো সেটিংস সংরক্ষণ করতে ব্যর্থ।" });
    }
  });

  // Bulk ZIP download endpoint returns JSON files ready for zip downloads
  app.get("/api/bulk-raw", authenticateAdmin, async (req, res) => {
    try {
      const [books]: any = await pool.query("SELECT * FROM books");
      const [members]: any = await pool.query("SELECT * FROM members");
      const [issues]: any = await pool.query("SELECT * FROM issues");
      const [auditLogs]: any = await pool.query("SELECT * FROM audit_logs");
      res.json({ books, members, issues, auditLogs });
    } catch (error) {
      res.status(500).json({ error: "ডাউনলোড তৈরি করতে সমস্যা হয়েছে।" });
    }
  });

  // =============================================
  // SYSTEM MAINTENANCE API
  // =============================================
  
  app.post("/api/settings/maintenance/clear-temp", authenticateAdmin, async (req, res) => {
    try {
      const tmpDir = path.join(__dirname, "uploads", "tmp");
      let count = 0;
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tmpDir, file));
          count++;
        }
      }
      res.json({ success: true, count, message: `${count}টি টেম্পোরারি ফাইল মুছে ফেলা হয়েছে।` });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "টেম্প ফাইল মুছতে ব্যর্থ।" });
    }
  });

  app.post("/api/settings/maintenance/clean-audit-logs", authenticateAdmin, async (req, res) => {
    try {
      const { action } = req.body;
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const formattedDate = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

      if (action === 'preview') {
        const [rows]: any = await pool.query("SELECT COUNT(*) as count FROM audit_logs WHERE timestamp < ?", [formattedDate]);
        const count = rows[0].count;
        res.json({ success: true, count });
      } else if (action === 'delete') {
        const [result]: any = await pool.query("DELETE FROM audit_logs WHERE timestamp < ?", [formattedDate]);
        const count = result.affectedRows || 0;
        addLog("সিস্টেম মেইনটেন্যান্স", `${count}টি পুরনো অডিট লগ মুছে ফেলা হয়েছে।`);
        res.json({ success: true, count, message: `${count}টি পুরনো লগ মুছে ফেলা হয়েছে।` });
      } else {
        res.status(400).json({ error: "অ্যাকশন নির্দিষ্ট করা হয়নি।" });
      }
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "অডিট লগ মুছতে ব্যর্থ।" });
    }
  });

  // =============================================
  // NEWSLETTER & BREVO INTEGRATION
  // =============================================

  // Public endpoint for popup subscription
  app.post("/api/public/newsletter-subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
        return res.status(400).json({ error: "সঠিক ইমেইল ঠিকানা প্রদান করুন।" });
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        console.warn("BREVO_API_KEY is not configured.");
        return res.json({ success: true, message: "সাবস্ক্রাইব করার জন্য ধন্যবাদ!" });
      }

      const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          listIds: [3],
          updateEnabled: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn("Brevo API warning:", errorData);
      }

      res.json({ success: true, message: "সাবস্ক্রাইব করার জন্য ধন্যবাদ!" });
    } catch (err: any) {
      console.error("Newsletter subscribe error:", err);
      res.json({ success: true, message: "সাবস্ক্রাইব করার জন্য ধন্যবাদ!" });
    }
  });

  // Admin endpoint to send newsletter
  app.post("/api/admin/newsletter-send", authenticateAdmin, async (req, res) => {
    try {
      const { subject, body } = req.body;
      if (!subject || !body) {
        return res.status(400).json({ error: "বিষয় এবং মেসেজ প্রদান করুন।" });
      }

      const apiKey = process.env.BREVO_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Brevo API Key কনফিগার করা নেই।" });
      }

      const campaignRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          name: "Newsletter " + new Date().toISOString().split("T")[0],
          subject: subject,
          sender: { name: "অক্ষর পাঠাগার", email: "hello@okkhorpathagar.com" },
          type: "classic",
          htmlContent: `<html><body>${body.replace(/\n/g, '<br/>')}</body></html>`,
          recipients: { listIds: [3] }
        })
      });

      if (!campaignRes.ok) {
        const errorData = await campaignRes.json();
        console.error("Brevo Create Campaign Error:", errorData);
        return res.status(500).json({ error: "ক্যাম্পেইন তৈরি করতে ব্যর্থ: " + (errorData.message || "Unknown error") });
      }

      const campaignData = await campaignRes.json();
      const campaignId = campaignData.id;

      const sendRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/action/send`, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json"
        }
      });

      if (!sendRes.ok) {
        const sendErrorData = await sendRes.json();
        console.error("Brevo Send Campaign Error:", sendErrorData);
        return res.status(500).json({ error: "ক্যাম্পেইন সেন্ড করতে ব্যর্থ: " + (sendErrorData.message || "Unknown error") });
      }

      addLog("নিউজলেটার", `একটি নতুন নিউজলেটার পাঠানো হয়েছে। বিষয়: ${subject}`);
      res.json({ success: true, message: "নিউজলেটার সফলভাবে পাঠানো হয়েছে!" });
    } catch (err: any) {
      console.error("Newsletter send error:", err);
      res.status(500).json({ error: "নিউজলেটার পাঠাতে সমস্যা হয়েছে।" });
    }
  });

  // =============================================
  // REVIEWS API (Member submission + Admin management)
  // =============================================

  // Member submits a review (requires member auth via form number in body)
  app.post("/api/reviews", async (req, res) => {
    try {
      const { memberFormNumber, memberName, subject, content, rating } = req.body;
      if (!memberFormNumber || !memberName || !subject || !content) {
        return res.status(400).json({ error: "সব তথ্য পূরণ করুন।" });
      }
      
      const [resInsert]: any = await pool.query(
        "INSERT INTO reviews (member_form_number, member_name, subject, content, rating, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [memberFormNumber, memberName, subject, content, Math.min(5, Math.max(1, rating || 5)), "pending", formatCurrentDateTime()]
      );

      const newReview = {
        id: String(resInsert.insertId),
        memberFormNumber,
        memberName,
        subject,
        content,
        rating: Math.min(5, Math.max(1, rating || 5)),
        status: "pending",
        createdAt: formatCurrentDateTime(),
      };
      
      addLog("রিভিউ জমা", `সদস্য ${memberName} (ফরম: ${memberFormNumber}) রিভিউ জমা দিয়েছেন: "${subject}"`);
      res.json({ success: true, review: newReview });
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ জমা দিতে ব্যর্থ।" });
    }
  });

  // Admin: Get all reviews
  app.get("/api/reviews", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM reviews ORDER BY id DESC");
      const reviews = rows.map((r: any) => ({
        id: String(r.id),
        memberFormNumber: r.member_form_number,
        memberName: r.member_name,
        subject: r.subject,
        content: r.content,
        rating: r.rating,
        status: r.status,
        createdAt: r.created_at,
        reviewedAt: r.reviewed_at
      }));
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ লোড করতে ব্যর্থ।" });
    }
  });

  // Admin: Approve a review
  app.put("/api/reviews/:id/approve", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "রিভিউ পাওয়া যায়নি।" });
      
      await pool.query("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?", ["approved", formatCurrentDateTime(), id]);
      
      addLog("রিভিউ অনুমোদন", `রিভিউ অনুমোদিত হয়েছে: "${rows[0].subject}" — ${rows[0].member_name}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ অনুমোদন করতে ব্যর্থ।" });
    }
  });

  // Admin: Reject a review
  app.put("/api/reviews/:id/reject", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "রিভিউ পাওয়া যায়নি।" });
      
      await pool.query("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?", ["rejected", formatCurrentDateTime(), id]);
      
      addLog("রিভিউ প্রত্যাখ্যান", `রিভিউ প্রত্যাখ্যাত হয়েছে: "${rows[0].subject}" — ${rows[0].member_name}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ প্রত্যাখ্যান করতে ব্যর্থ।" });
    }
  });

  // Admin: Delete a review
  app.delete("/api/reviews/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "রিভিউ পাওয়া যায়নি।" });
      
      await pool.query("DELETE FROM reviews WHERE id = ?", [id]);
      
      addLog("রিভিউ মুছে ফেলা", `রিভিউ মুছে ফেলা হয়েছে: "${rows[0].subject}" — ${rows[0].member_name}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ মুছতে ব্যর্থ।" });
    }
  });

  // Public: Get approved reviews only
  app.get("/api/public/reviews", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY id DESC");
      const approved = rows.map((r: any) => ({
        id: String(r.id),
        memberFormNumber: r.member_form_number,
        memberName: r.member_name,
        subject: r.subject,
        content: r.content,
        rating: r.rating,
        status: r.status,
        createdAt: r.created_at,
        reviewedAt: r.reviewed_at
      }));
      res.json(approved);
    } catch (err: any) {
      res.status(500).json({ error: "রিভিউ লোড করতে ব্যর্থ।" });
    }
  });

  // =============================================
  // NOTICES API (Admin posting, public viewing)
  // =============================================

  // Admin: Create a notice (immediately published)
  app.post("/api/notices", authenticateAdmin, async (req, res) => {
    try {
      const { subject, content, image } = req.body;
      if (!subject || !content) {
        return res.status(400).json({ error: "বিষয় এবং বিস্তারিত উভয়ই পূরণ করুন।" });
      }
      
      const [resInsert]: any = await pool.query(
        "INSERT INTO notices (subject, content, image, created_at) VALUES (?, ?, ?, ?)",
        [subject, content, image || null, formatCurrentDateTime()]
      );

      const newNotice = {
        id: String(resInsert.insertId),
        subject,
        content,
        image: image || null,
        createdAt: formatCurrentDateTime(),
      };
      
      addLog("নোটিশ প্রকাশ", `নতুন নোটিশ প্রকাশিত: "${subject}"`);
      res.json({ success: true, notice: newNotice });
    } catch (err: any) {
      res.status(500).json({ error: "নোটিশ প্রকাশ করতে ব্যর্থ।" });
    }
  });

  // Admin: Get all notices
  app.get("/api/notices", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM notices ORDER BY id DESC");
      const notices = rows.map((r: any) => ({
        id: String(r.id),
        subject: r.subject,
        content: r.content,
        image: r.image || null,
        createdAt: r.created_at
      }));
      res.json(notices);
    } catch (err: any) {
      res.status(500).json({ error: "নোটিশ লোড করতে ব্যর্থ।" });
    }
  });

  // Admin: Delete a notice
  app.delete("/api/notices/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const [rows]: any = await pool.query("SELECT subject FROM notices WHERE id = ?", [id]);
      if (rows.length === 0) return res.status(404).json({ error: "নোটিশ পাওয়া যায়নি।" });
      
      await pool.query("DELETE FROM notices WHERE id = ?", [id]);
      addLog("নোটিশ মুছে ফেলা", `নোটিশ মুছে ফেলা হয়েছে: "${rows[0].subject}"`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "নোটিশ মুছতে ব্যর্থ।" });
    }
  });

  app.get("/api/public/notices", async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM notices ORDER BY id DESC");
      const notices = rows.map((r: any) => ({
        id: String(r.id),
        subject: r.subject,
        content: r.content,
        image: r.image || null,
        createdAt: r.created_at
      }));
      res.json(notices);
    } catch (err: any) {
      res.status(500).json({ error: "নোটিশ লোড করতে ব্যর্থ।" });
    }
  });

  // =============================================
  // CONTACT SUBMISSIONS API (Write to us)
  // =============================================

  // Setup Multer Storage for Write to Us attachments
  const submissionsUploadDir = process.env.VERCEL
    ? path.join("/tmp", "uploads", "submissions")
    : path.join(process.cwd(), "uploads", "submissions");
  if (!fs.existsSync(submissionsUploadDir)) {
    fs.mkdirSync(submissionsUploadDir, { recursive: true });
  }

  const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, submissionsUploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `submission-${uniqueSuffix}${ext}`);
    }
  });
  const uploadSubmission = multer({ storage: submissionStorage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

  // Serve the uploads folder statically so admins can view attachments
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Public: Submit a new writing/complaint
  app.post("/api/submissions", (req, res, next) => {
    uploadSubmission.single("attachment")(req, res, function (err) {
      if (err) {
        console.error("Multer file upload error:", err);
        return res.status(500).json({ error: "ফাইল আপলোডে ত্রুটি হয়েছে। ফাইলের সাইজ চেক করুন।" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      if (!name || !email || !subject || !category || !message) {
        return res.status(400).json({ error: "অনুগ্রহ করে সকল আবশ্যকীয় তথ্য প্রদান করুন।" });
      }

      const attachmentPath = req.file ? `/uploads/submissions/${req.file.filename}` : null;

      const [resInsert]: any = await pool.query(
        "INSERT INTO contact_submissions (name, email, subject, category, message, attachment_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, subject, category, message, attachmentPath, "pending", formatCurrentDateTime()]
      );

      // Send email notification via Brevo
      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) {
        const attachmentNote = attachmentPath
          ? `<p><strong>সংযুক্তি:</strong> একটি ফাইল সংযুক্ত করা হয়েছে (${req.file?.originalname || 'fayl'})</p>`
          : '';
        const htmlContent = `
          <h2>নতুন "আমাদের লিখুন" সাবমিশন</h2>
          <p><strong>নাম:</strong> ${name}</p>
          <p><strong>ইমেইল:</strong> ${email}</p>
          <p><strong>বিষয়:</strong> ${subject}</p>
          <p><strong>বিভাগ:</strong> ${category}</p>
          <p><strong>বার্তা:</strong><br/> ${message.replace(/\n/g, '<br/>')}</p>
          ${attachmentNote}
        `;

        try {
          const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": apiKey,
              "content-type": "application/json"
            },
            body: JSON.stringify({
              sender: { name: "অক্ষর পাঠাগার", email: "hello@okkhorpathagar.com" },
              to: [{ email: "okkhorpathagar@gmail.com", name: "Admin" }],
              subject: "নতুন 'আমাদের লিখুন' সাবমিশন - " + subject,
              htmlContent: htmlContent
            })
          });

          if (!emailRes.ok) {
            const errorData = await emailRes.json();
            console.warn("Brevo Email Notification warning:", errorData);
          }
        } catch (emailErr) {
          console.error("Failed to send Brevo email notification:", emailErr);
        }
      }

      res.json({ success: true, submissionId: String(resInsert.insertId) });
    } catch (err: any) {
      console.error("Error submitting writing:", err);
      res.status(500).json({ error: "জমা দিতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।" });
    }
  });

  // Admin: Get all submissions
  app.get("/api/submissions", authenticateAdmin, async (req, res) => {
    try {
      const [rows]: any = await pool.query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
      const submissions = rows.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        email: r.email,
        subject: r.subject,
        category: r.category,
        message: r.message,
        attachmentPath: r.attachment_path,
        status: r.status,
        createdAt: r.created_at
      }));
      res.json(submissions);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      res.status(500).json({ error: "তথ্য লোড করতে ব্যর্থ।" });
    }
  });

  // Admin: Update submission status
  app.put("/api/submissions/:id/status", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // e.g., 'reviewed', 'approved', 'rejected'
      
      await pool.query("UPDATE contact_submissions SET status = ? WHERE id = ?", [status, id]);
      addLog("লেখা/অভিযোগ আপডেট", `আইডি ${id} এর স্ট্যাটাস '${status}' এ আপডেট করা হয়েছে।`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "স্ট্যাটাস আপডেট করতে ব্যর্থ।" });
    }
  });

  // Vite middleware setup and server listening
  async function initServerListening() {
    try {
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          member_form_number VARCHAR(255) NOT NULL,
          member_name VARCHAR(255) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          rating INT NOT NULL,
          status VARCHAR(50) NOT NULL,
          created_at DATETIME NOT NULL,
          reviewed_at DATETIME
        );
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          subject VARCHAR(255),
          category VARCHAR(100),
          message TEXT NOT NULL,
          attachment_path VARCHAR(500),
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          created_at DATETIME NOT NULL
        );
      `);

      // Auto-migrate: ensure contact_submissions has all required columns
      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'phone'");
        if (cols.length === 0) {
          await connection.query("ALTER TABLE contact_submissions ADD COLUMN phone VARCHAR(255) AFTER email");
          console.log("Migration: Added phone column to contact_submissions table.");
        }
      } catch (migErr) { console.warn("contact_submissions phone migration:", migErr); }

      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'category'");
        if (cols.length === 0) {
          await connection.query("ALTER TABLE contact_submissions ADD COLUMN category VARCHAR(100) AFTER subject");
          console.log("Migration: Added category column to contact_submissions table.");
        }
      } catch (migErr) { console.warn("contact_submissions category migration:", migErr); }

      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'attachment_path'");
        if (cols.length === 0) {
          await connection.query("ALTER TABLE contact_submissions ADD COLUMN attachment_path VARCHAR(500) AFTER message");
          console.log("Migration: Added attachment_path column to contact_submissions table.");
        }
      } catch (migErr) { console.warn("contact_submissions attachment_path migration:", migErr); }

      // Auto-migrate: ensure books table has page_count and price columns
      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM books LIKE 'page_count'");
        if (cols.length === 0) {
          await connection.query("ALTER TABLE books ADD COLUMN page_count INT DEFAULT NULL");
          console.log("Migration: Added page_count column to books table.");
        }
      } catch (migErr) { console.warn("page_count migration check:", migErr); }

      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM books LIKE 'price'");
        if (cols.length === 0) {
          await connection.query("ALTER TABLE books ADD COLUMN price DECIMAL(10,2) DEFAULT NULL");
          console.log("Migration: Added price column to books table.");
        }
      } catch (migErr) { console.warn("price migration check:", migErr); }

      // Auto-migrate: ensure site_traffic table exists
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS site_traffic (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            view_count INT NOT NULL DEFAULT 0
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
      } catch (migErr) { console.warn("site_traffic migration check:", migErr); }

      // Auto-migrate: ensure image_url is LONGTEXT (not TEXT)
      try {
        const [cols]: any = await connection.query("SHOW COLUMNS FROM books LIKE 'image_url'");
        if (cols.length > 0 && cols[0].Type && !cols[0].Type.toLowerCase().includes("longtext")) {
          await connection.query("ALTER TABLE books MODIFY COLUMN image_url LONGTEXT");
          console.log("Migration: Upgraded image_url column to LONGTEXT.");
        }
      } catch (migErr) { console.warn("image_url migration check:", migErr); }


      connection.release();
      console.log("Database initialized successfully.");
    } catch (e) {
      console.error("Database init error:", e);
    }

    if (process.env.NODE_ENV !== "production") {
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } catch (e) {
        console.warn("Vite not found or failed to load. Falling back to static files (Production mode). Please set NODE_ENV=production in your .env file.");
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
      }
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    if (!process.env.VERCEL) {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  }

  initServerListening().catch((error) => {
    console.error("Failed to start server", error);
  });

  export default app;
