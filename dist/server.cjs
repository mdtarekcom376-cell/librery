var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_multer = __toESM(require("multer"), 1);

// src/db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
import_dotenv.default.config();
import_dotenv.default.config({ path: import_path.default.join(__dirname, "..", ".env") });
import_dotenv.default.config({ path: import_path.default.join(__dirname, ".env") });
if (import_fs.default.existsSync("/home/okkhorpa/librery/.env")) {
  import_dotenv.default.config({ path: "/home/okkhorpa/librery/.env" });
}
var dbHost = process.env.DB_HOST || "127.0.0.1";
var dbUser = process.env.DB_USER || "okkhorpa_tawha";
var dbPassword = process.env.DB_PASSWORD || "@admin.com";
var dbName = process.env.DB_NAME || "okkhorpa_okkhorpa_pathagar";
var dbPort = parseInt(process.env.DB_PORT || "3306", 10);
var pool = import_promise.default.createPool({
  host: dbHost === "localhost" ? "127.0.0.1" : dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 4,
  queueLimit: 0,
  connectTimeout: 1e4
});
pool.on("connection", (conn) => {
  conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci", (err) => {
    if (err) console.error("Failed to set charset on connection:", err?.message || err);
  });
});
var db_default = pool;

// server.ts
function hashPassword(password) {
  return import_crypto.default.createHash("sha256").update(password).digest("hex");
}
var DEFAULT_PASSWORD_HASH = hashPassword("pathagar");
var SECURITY_PASSWORD = "PASSWD";
function formatCurrentDateTime() {
  const bdNow = new Date(Date.now() + 6 * 60 * 60 * 1e3);
  const year = bdNow.getUTCFullYear();
  const month = String(bdNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(bdNow.getUTCDate()).padStart(2, "0");
  const hours = String(bdNow.getUTCHours()).padStart(2, "0");
  const minutes = String(bdNow.getUTCMinutes()).padStart(2, "0");
  const seconds = String(bdNow.getUTCSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function getBangladeshDateString(date = /* @__PURE__ */ new Date()) {
  const bdTime = new Date(date.getTime() + 6 * 60 * 60 * 1e3);
  return bdTime.toISOString().split("T")[0];
}
function addDaysToDateString(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().split("T")[0];
}
function addLog(action, details) {
  db_default.query("INSERT INTO audit_logs (timestamp, action, details) VALUES (?, ?, ?)", [formatCurrentDateTime(), action, details]).catch((err) => console.error("Audit log error:", err));
}
var ACTIVE_SESSIONS = /* @__PURE__ */ new Set();
async function generateSignedToken(username) {
  const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
  let secret = "okkhor-fallback-secret";
  if (rows.length > 0) {
    let admin = rows[0].setting_value;
    if (typeof admin === "string") admin = JSON.parse(admin);
    if (admin.passwordHash) secret = admin.passwordHash;
  }
  const payload = {
    username,
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1e3
    // 7 days expiry
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = import_crypto.default.createHmac("sha256", secret).update(payloadStr).digest("hex");
  return `${payloadStr}.${signature}`;
}
async function verifySignedToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    let secret = "okkhor-fallback-secret";
    if (rows.length > 0) {
      let admin = rows[0].setting_value;
      if (typeof admin === "string") admin = JSON.parse(admin);
      if (admin.passwordHash) secret = admin.passwordHash;
    }
    const expectedSignature = import_crypto.default.createHmac("sha256", secret).update(payloadStr).digest("hex");
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
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
  try {
    if (req.method === "GET" && !req.url.startsWith("/api/") && !req.url.startsWith("/uploads/") && !req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json)$/i)) {
      const todayStr = getBangladeshDateString();
      db_default.query(
        `INSERT INTO site_traffic (date, view_count) VALUES (?, 1)
           ON DUPLICATE KEY UPDATE view_count = view_count + 1`,
        [todayStr]
      ).catch(() => {
      });
    }
  } catch (err) {
  }
  next();
});
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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
var authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "\u0985\u09A8\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4! \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
  }
  const token = authHeader.substring(7);
  if (!ACTIVE_SESSIONS.has(token)) {
    const verifiedUser = await verifySignedToken(token);
    if (verifiedUser) {
      ACTIVE_SESSIONS.add(token);
    } else {
      return res.status(401).json({ error: "\u09B8\u09C7\u09B6\u09A8 \u09AE\u09C7\u09AF\u09BC\u09BE\u09A6 \u09B6\u09C7\u09B7! \u0986\u09AC\u09BE\u09B0 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
  }
  next();
};
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "\u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE \u0993 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u0986\u09AC\u09B6\u09CD\u09AF\u0995!" });
    }
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    if (rows.length === 0) {
      return res.status(401).json({ error: "\u09AD\u09C1\u09B2 \u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1!" });
    }
    let admin = rows[0].setting_value;
    if (typeof admin === "string") admin = JSON.parse(admin);
    const inputHash = hashPassword(password);
    if (admin.username === username && admin.passwordHash === inputHash) {
      const token = await generateSignedToken(username);
      ACTIVE_SESSIONS.add(token);
      return res.json({ token, username: admin.username });
    } else {
      return res.status(401).json({ error: "\u09AD\u09C1\u09B2 \u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE \u0985\u09A5\u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1!" });
    }
  } catch (err) {
    console.error("Login endpoint failed:", err);
    return res.status(500).json({ error: `\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0 (\u09B2\u0997\u0987\u09A8): ${err.message || err}` });
  }
});
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
    username = await verifySignedToken(token) || "";
  }
  if (isAuthenticated) {
    if (!username) {
      const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
      if (rows.length > 0) username = rows[0].setting_value.username;
    }
    return res.json({ authenticated: true, username });
  }
  return res.json({ authenticated: false });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    ACTIVE_SESSIONS.delete(token);
  }
  res.json({ message: "\u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B2\u0997\u0986\u0989\u099F \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" });
});
app.post("/api/auth/change-credentials", authenticateAdmin, async (req, res) => {
  const { currentUsername, currentPassword, securityPassword, newUsername, newPassword } = req.body;
  if (!currentUsername || !currentPassword || !securityPassword || !newUsername || !newPassword) {
    return res.status(400).json({ error: "\u09B8\u09AC \u09A4\u09A5\u09CD\u09AF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09BE \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995!" });
  }
  if (securityPassword !== SECURITY_PASSWORD) {
    return res.status(400).json({ error: "\u09AD\u09C1\u09B2 \u09B8\u09BF\u0995\u09BF\u0989\u09B0\u09BF\u099F\u09BF \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1!" });
  }
  const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
  const admin = rows.length > 0 ? rows[0].setting_value : { username: "", passwordHash: "" };
  const currentHash = hashPassword(currentPassword);
  if (admin.username !== currentUsername || admin.passwordHash !== currentHash) {
    return res.status(400).json({ error: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE \u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC!" });
  }
  const newAdmin = { username: newUsername, passwordHash: hashPassword(newPassword) };
  await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(newAdmin)]);
  addLog("\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", `\u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE \u09AC\u09BE \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 \u09A8\u09A4\u09C1\u09A8 \u0987\u0989\u099C\u09BE\u09B0\u09A8\u09C7\u09AE: ${newUsername}`);
  res.json({ success: true, message: "\u0985\u09CD\u09AF\u09BE\u09A1\u09AE\u09BF\u09A8 \u0995\u09CD\u09B0\u09C7\u09A1\u09C7\u09A8\u09B6\u09BF\u09AF\u09BC\u09BE\u09B2 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" });
});
app.post("/api/public/track-pageview", async (req, res) => {
  try {
    const todayStr = getBangladeshDateString();
    await db_default.query(
      `INSERT INTO site_traffic (date, view_count) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE view_count = view_count + 1`,
      [todayStr]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});
app.get("/api/public/firebase-config", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'firebaseConfig'");
    if (rows.length > 0 && rows[0].setting_value.apiKey) {
      return res.json(rows[0].setting_value);
    }
    const configPath = import_path2.default.join(process.cwd(), "firebase-applet-config.json");
    if (import_fs2.default.existsSync(configPath)) {
      const fileContent = import_fs2.default.readFileSync(configPath, "utf-8");
      const defaultFirebase = JSON.parse(fileContent);
      return res.json(defaultFirebase);
    }
    res.json({
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: ""
    });
  } catch (err) {
    console.error("GET /api/public/firebase-config failed:", err);
    res.status(500).json({ error: "\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/settings/firebase-config", authenticateAdmin, async (req, res) => {
  try {
    const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = req.body;
    if (!apiKey || !projectId) {
      return res.status(400).json({ error: "API Key \u098F\u09AC\u0982 Project ID \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const firebaseConfig = {
      apiKey: (apiKey || "").trim(),
      authDomain: (authDomain || "").trim(),
      projectId: (projectId || "").trim(),
      storageBucket: (storageBucket || "").trim(),
      messagingSenderId: (messagingSenderId || "").trim(),
      appId: (appId || "").trim()
    };
    await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('firebaseConfig', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(firebaseConfig)]);
    addLog("\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u0986\u09AA\u09A1\u09C7\u099F", `\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 (Project ID: ${projectId})\u0964`);
    res.json({ success: true, message: "\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0\u09C7\u09B6\u09A8 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error("POST /api/settings/firebase-config failed:", err);
    res.status(500).json({ error: "\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/auth/firebase-login", async (req, res) => {
  const { uid, email, username } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "\u09AB\u09BE\u09DF\u09BE\u09B0\u09AC\u09C7\u09B8 \u0987\u0989\u099C\u09BE\u09B0 \u09A1\u09BE\u099F\u09BE \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF!" });
  }
  const usernameClean = username || email.split("@")[0];
  const token = await generateSignedToken(usernameClean);
  ACTIVE_SESSIONS.add(token);
  console.log("[Firebase Auth] Successful login for", email);
  return res.json({ token, username: usernameClean });
});
app.post("/api/settings/verify-password", authenticateAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "\u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8!" });
    }
    const [pwdRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'settingsPassword'");
    const storedPassword = pwdRows.length > 0 ? pwdRows[0].setting_value : "PASSWORD";
    const [adminRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    const adminHash = adminRows.length > 0 ? adminRows[0].setting_value.passwordHash : "";
    const hashedEnteredPassword = hashPassword(password);
    if (password === storedPassword || hashedEnteredPassword === adminHash) {
      return res.json({ success: true });
    }
    return res.status(400).json({ error: "\u09AD\u09C1\u09B2 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1! \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
  } catch (err) {
    console.error("verify-password failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF\u0964" });
  }
});
app.post("/api/settings/change-password", authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "\u09B8\u09AC \u09A4\u09A5\u09CD\u09AF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09BE \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995!" });
    }
    const [pwdRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'settingsPassword'");
    const storedPassword = pwdRows.length > 0 ? pwdRows[0].setting_value : "PASSWORD";
    const [adminRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'admin'");
    const adminHash = adminRows.length > 0 ? adminRows[0].setting_value.passwordHash : "";
    const hashedCurrentPassword = hashPassword(currentPassword);
    if (currentPassword !== storedPassword && hashedCurrentPassword !== adminHash) {
      return res.status(400).json({ error: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09AA\u09BE\u09B8\u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A1 \u09B8\u09A0\u09BF\u0995 \u09A8\u09AF\u09BC!" });
    }
    await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('settingsPassword', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(newPassword)]);
    addLog("\u09A8\u09BF\u09B0\u09BE\u09AA\u09A4\u09CD\u09A4\u09BE \u09B8\u09C7\u099F\u09BF\u0982\u09B8", "\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6\u09C7\u09B0 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964");
    res.json({ success: true, message: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09AA\u09BE\u09B8\u0993\u09DF\u09BE\u09B0\u09CD\u09A1 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error("change-password failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF\u0964" });
  }
});
app.get("/api/public/logo", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'logoBase64'");
    const logoBase64 = rows.length > 0 ? rows[0].setting_value : "";
    res.json({ logoBase64 });
  } catch (err) {
    console.error("GET /api/public/logo failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0\u0964 \u09B2\u09CB\u0997\u09CB \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.post("/api/settings/logo", authenticateAdmin, async (req, res) => {
  try {
    const { logoBase64 } = req.body;
    if (logoBase64 === void 0) {
      return res.status(400).json({ error: "\u09B2\u09CB\u0997\u09CB \u09A1\u09BE\u099F\u09BE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09AC\u09BE\u09A7\u09CD\u09AF\u09A4\u09BE\u09AE\u09C2\u09B2\u0995\u0964" });
    }
    await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('logoBase64', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(logoBase64)]);
    addLog("\u09B2\u09CB\u0997\u09CB \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", "\u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u09C7\u09B0 \u09AE\u09C2\u09B2 \u09B2\u09CB\u0997\u09CB \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964");
    res.json({ success: true, message: "\u09B2\u09CB\u0997\u09CB \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    res.status(500).json({ error: "\u09B2\u09CB\u0997\u09CB \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09A4\u09C7 \u0985\u09AD\u09CD\u09AF\u09A8\u09CD\u09A4\u09B0\u09C0\u09A3 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/settings/member-id-start", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'memberIdStartNumber'");
    if (rows.length > 0 && rows[0].setting_value) {
      res.json({ startNumber: parseInt(rows[0].setting_value, 10) });
    } else {
      res.json({ startNumber: 1e3 });
    }
  } catch (err) {
    res.status(500).json({ error: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/member-id-start", authenticateAdmin, async (req, res) => {
  try {
    const { startNumber } = req.body;
    if (!startNumber || isNaN(parseInt(startNumber, 10))) {
      return res.status(400).json({ error: "\u09B8\u09A0\u09BF\u0995 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const num = parseInt(startNumber, 10);
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES ('memberIdStartNumber', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [num.toString(), num.toString()]
    );
    addLog("\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", `\u09AE\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0986\u0987\u09A1\u09BF \u09B6\u09C1\u09B0\u09C1\u09B0 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7: ${num}`);
    res.json({ success: true, message: "\u09AE\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u0986\u0987\u09A1\u09BF \u09B6\u09C1\u09B0\u09C1\u09B0 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09B8\u09C7\u09AD \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    res.status(500).json({ error: "\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B8\u09C7\u09AD \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/sms/template", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
    const defaultTemplate = "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AA\u09A8\u09BE\u09B0 ({bookName}) \u09AC\u0987\u099F\u09BF \u099C\u09AE\u09BE\u09A6\u09C7\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u0985\u09A4\u09BF\u0995\u09CD\u09B0\u09AE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AC\u0987\u099F\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u098F \u099C\u09AE\u09BE \u09A6\u09BF\u09DF\u09C7 \u0986\u09B8\u09C1\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09AC\u09BF\u0995\u09BE\u09B2 \u09EA \u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09B0\u09BE\u09A4 \u09EE \u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0996\u09CB\u09B2\u09BE \u09A5\u09BE\u0995\u09C7\u0964 \u09AC\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u0987 \u09AF\u09A6\u09BF \u09AA\u09DC\u09BE \u09B6\u09C7\u09B7 \u09AA\u09A3\u09CD\u09A1\u09BF\u09A4 \u09A8\u09BE \u09B9\u09DF\u09C7 \u09A5\u09BE\u0995\u09C7 \u09A4\u09BE\u09B9\u09B2\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0987 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 call /WhatsApp \u098F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7\u09A8: 01333474848";
    const currentTemplate = rows.length > 0 ? rows[0].setting_value : defaultTemplate;
    res.json({ template: currentTemplate });
  } catch (err) {
    console.error("GET /api/sms/template failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0\u0964 \u099F\u09C7\u09AE\u09AA\u09CD\u09B2\u09C7\u099F \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.post("/api/sms/template", authenticateAdmin, async (req, res) => {
  try {
    const template = req.body.template !== void 0 ? req.body.template : req.body.smsTemplate;
    if (template === void 0 || typeof template !== "string") {
      return res.status(400).json({ error: "\u09B8\u09A0\u09BF\u0995 \u09AE\u09C7\u09B8\u09C7\u099C \u099F\u09C7\u09AE\u09AA\u09CD\u09B2\u09C7\u099F \u099F\u09C7\u0995\u09CD\u09B8\u099F \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('smsTemplate', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(template)]);
    addLog("\u099F\u09C7\u09AE\u09AA\u09CD\u09B2\u09C7\u099F \u0986\u09AA\u09A1\u09C7\u099F", "SMS \u09B0\u09BF\u09AE\u09BE\u0987\u09A8\u09CD\u09A1\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB\u09B0 \u099F\u09C7\u0995\u09CD\u09B8\u099F \u099F\u09C7\u09AE\u09AA\u09CD\u09B2\u09C7\u099F \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964");
    res.json({ success: true, message: "\u09AE\u09C7\u09B8\u09C7\u099C \u099F\u09C7\u09AE\u09AA\u09CD\u09B2\u09C7\u099F \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error("POST /api/sms/template failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0\u09C7 \u09B8\u09C7\u09AD \u0995\u09B0\u09BE\u09B0 \u09B8\u09AE\u09DF \u0995\u09CB\u09A8\u09CB \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/sms/gateway", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
    const defaultGateway = {
      provider: "simulated",
      apiKey: "",
      senderId: "",
      customUrl: "https://api.example.com/sms/send?apiKey={apiKey}&to={to}&message={message}"
    };
    res.json(rows.length > 0 ? rows[0].setting_value : defaultGateway);
  } catch (err) {
    console.error("GET /api/sms/gateway failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0\u0964 \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.post("/api/sms/gateway", authenticateAdmin, async (req, res) => {
  try {
    const { provider, apiKey, senderId, customUrl } = req.body;
    if (!provider) {
      return res.status(400).json({ error: "\u09AA\u09CD\u09B0\u09CB\u09AD\u09BE\u0987\u09A1\u09BE\u09B0 \u09B8\u09BF\u09B2\u09C7\u0995\u09CD\u099F \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const gateway = {
      provider: provider || "simulated",
      apiKey: apiKey || "",
      senderId: senderId || "",
      customUrl: customUrl || ""
    };
    await db_default.query("INSERT INTO settings (setting_key, setting_value) VALUES ('smsGateway', ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [JSON.stringify(gateway)]);
    addLog("\u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u0986\u09AA\u09A1\u09C7\u099F", `SMS \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09AA\u09CD\u09B0\u09CB\u09AD\u09BE\u0987\u09A1\u09BE\u09B0 \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 '${provider}' \u09B8\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, message: "SMS \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error("POST /api/sms/gateway failed:", err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0\u0964 \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const todayStr = getBangladeshDateString();
    const [booksTotal] = await db_default.query("SELECT COUNT(*) AS count FROM books");
    const [booksAvail] = await db_default.query("SELECT COUNT(*) AS count FROM books WHERE status = 'Available'");
    const [booksIssued] = await db_default.query("SELECT COUNT(*) AS count FROM books WHERE status = 'Issued'");
    const [membersTotal] = await db_default.query("SELECT COUNT(*) AS count FROM members");
    const [lateBooksRows] = await db_default.query("SELECT COUNT(*) AS count FROM issues WHERE status = 'Issued' AND return_date < ?", [todayStr]);
    const [todaysTxRows] = await db_default.query("SELECT COUNT(*) AS count FROM issues WHERE issue_date = ? OR DATE(returned_at) = ?", [todayStr, todayStr]);
    const totalBooks = booksTotal[0].count;
    const availableBooks = booksAvail[0].count;
    const issuedBooks = booksIssued[0].count;
    const totalMembers = membersTotal[0].count;
    const lateBooks = lateBooksRows[0].count;
    const todaysTransactions = todaysTxRows[0].count;
    const bnMonths = ["\u099C\u09BE\u09A8\u09C1\u09DF\u09BE\u09B0\u09BF", "\u09AB\u09C7\u09AC\u09CD\u09B0\u09C1\u09DF\u09BE\u09B0\u09BF", "\u09AE\u09BE\u09B0\u09CD\u099A", "\u098F\u09AA\u09CD\u09B0\u09BF\u09B2", "\u09AE\u09C7", "\u099C\u09C1\u09A8", "\u099C\u09C1\u09B2\u09BE\u0987", "\u0986\u0997\u09B8\u09CD\u099F", "\u09B8\u09C7\u09AA\u09CD\u099F\u09C7\u09AE\u09CD\u09AC\u09B0", "\u0985\u0995\u09CD\u099F\u09CB\u09AC\u09B0", "\u09A8\u09AD\u09C7\u09AE\u09CD\u09AC\u09B0", "\u09A1\u09BF\u09B8\u09C7\u09AE\u09CD\u09AC\u09B0"];
    const issuesByMonthMap = {};
    const returnsByMonthMap = {};
    const now = /* @__PURE__ */ new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = bnMonths[d.getMonth()];
      issuesByMonthMap[mName] = 0;
      returnsByMonthMap[mName] = 0;
    }
    const [recentIssues] = await db_default.query("SELECT issue_date, returned_at FROM issues WHERE issue_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) OR returned_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)");
    recentIssues.forEach((issue) => {
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
      } catch (err) {
      }
    });
    const monthlyReport = Object.keys(issuesByMonthMap).map((mName) => ({
      month: mName,
      issues: issuesByMonthMap[mName],
      returns: returnsByMonthMap[mName] || 0
    }));
    const [popularBooksRows] = await db_default.query(`
        SELECT b.code, b.name, b.author, b.group_name, b.image_url, COUNT(i.id) AS issue_count
        FROM issues i
        JOIN books b ON i.book_id = b.id
        GROUP BY b.id, b.code, b.name, b.author, b.group_name, b.image_url
        ORDER BY issue_count DESC
        LIMIT 5
      `);
    const popularBooks = popularBooksRows.map((r) => ({
      code: r.code || "",
      name: r.name || "",
      author: r.author || "",
      group: r.group_name || "",
      imageUrl: r.image_url || "",
      count: Number(r.issue_count) || 0
    }));
    const [activeMembersRows] = await db_default.query(`
        SELECT m.form_number, m.name, m.mobile, COUNT(i.id) AS issue_count
        FROM issues i
        JOIN members m ON i.member_id = m.id
        GROUP BY m.id, m.form_number, m.name, m.mobile
        ORDER BY issue_count DESC
        LIMIT 5
      `);
    const activeMembers = activeMembersRows.map((r) => ({
      formNumber: r.form_number || "",
      name: r.name || "",
      mobile: r.mobile || "",
      count: Number(r.issue_count) || 0
    }));
    const [lateReportLoansRows] = await db_default.query(`
        SELECT i.*, 
               b.code AS book_code, b.name AS book_name, b.author, b.publisher,
               m.name AS member_name, m.form_number, m.mobile, m.address
        FROM issues i
        JOIN books b ON i.book_id = b.id
        JOIN members m ON i.member_id = m.id
        WHERE i.status = 'Issued' AND i.return_date < ?
      `, [todayStr]);
    const lateReportLoans = lateReportLoansRows.map((r) => ({
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
      extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : r.extension_history || [],
      comments: typeof r.comments === "string" ? JSON.parse(r.comments) : r.comments || [],
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
        totalMembers
      },
      charts: {
        monthlyReport,
        popularBooks,
        activeMembers,
        lateReportLoans
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1 \u09A1\u09C7\u099F\u09BE \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query(
      `SELECT date, view_count FROM site_traffic 
         WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         ORDER BY date ASC`
    );
    const data = rows.map((r) => ({
      date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString().split("T")[0],
      view_count: r.view_count
    }));
    res.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/admin/analytics error:", err);
    res.status(500).json({ error: "\u0985\u09CD\u09AF\u09BE\u09A8\u09BE\u09B2\u09BF\u099F\u09BF\u0995\u09CD\u09B8 \u09A1\u09C7\u099F\u09BE \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/books/suggest", authenticateAdmin, async (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  let query = "SELECT * FROM books";
  let params = [];
  if (q) {
    query += " WHERE LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?";
    const likeQ = `%${q}%`;
    params = [likeQ, likeQ, likeQ, likeQ];
  }
  try {
    const [rows] = await db_default.query(query, params);
    const mapBookRow = (r) => ({
      id: String(r.id),
      code: r.code,
      name: r.name,
      author: r.author,
      publisher: r.publisher,
      imageUrl: r.image_url,
      status: r.status,
      group: r.group_name,
      pageCount: r.page_count ?? void 0,
      price: r.price != null ? Number(r.price) : void 0
    });
    const mapped = rows.map(mapBookRow);
    const bengaliToEnglish = {
      "\u09E6": "0",
      "\u09E7": "1",
      "\u09E8": "2",
      "\u09E9": "3",
      "\u09EA": "4",
      "\u09EB": "5",
      "\u09EC": "6",
      "\u09ED": "7",
      "\u09EE": "8",
      "\u09EF": "9"
    };
    const parseNumberFromCode = (code) => {
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
      return a.code.localeCompare(b.code, void 0, { numeric: true, sensitivity: "base" });
    });
    res.json(q ? sorted : sorted.slice(0, 5));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/books", authenticateAdmin, async (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  const status = (req.query.status || "").toString();
  let query = "SELECT * FROM books WHERE 1=1";
  let params = [];
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
    const [rows] = await db_default.query(query, params);
    const mapBookRow = (r) => ({
      id: String(r.id),
      code: r.code,
      name: r.name,
      author: r.author,
      publisher: r.publisher,
      imageUrl: r.image_url,
      status: r.status,
      group: r.group_name,
      pageCount: r.page_count ?? void 0,
      price: r.price != null ? Number(r.price) : void 0
    });
    const mapped = rows.map(mapBookRow);
    const bengaliToEnglish = {
      "\u09E6": "0",
      "\u09E7": "1",
      "\u09E8": "2",
      "\u09E9": "3",
      "\u09EA": "4",
      "\u09EB": "5",
      "\u09EC": "6",
      "\u09ED": "7",
      "\u09EE": "8",
      "\u09EF": "9"
    };
    const parseNumberFromCode = (code) => {
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
      return a.code.localeCompare(b.code, void 0, { numeric: true, sensitivity: "base" });
    });
    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/books", authenticateAdmin, async (req, res) => {
  const { code, name, author, publisher, imageUrl, group, description, pageCount, price } = req.body;
  if (!code || !name || !author || !publisher) {
    return res.status(400).json({ error: "\u09AC\u0987 \u0995\u09CB\u09A1, \u09A8\u09BE\u09AE, \u09B2\u09C7\u0996\u0995 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09A8\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const uCode = code.toUpperCase();
    const [existing] = await db_default.query("SELECT id FROM books WHERE code = ?", [uCode]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "\u098F\u0987 \u09AC\u0987 \u0995\u09CB\u09A1\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    const img = imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
    const grp = group || "";
    const desc = description || "";
    const status = "Available";
    const pCount = pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null;
    const pPrice = price != null && !isNaN(Number(price)) ? Number(price) : null;
    const [result] = await db_default.query(
      "INSERT INTO books (code, name, author, publisher, image_url, status, group_name, description, page_count, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uCode, name, author, publisher, img, status, grp, desc, pCount, pPrice]
    );
    const [newBookRow] = await db_default.query("SELECT * FROM books WHERE id = ?", [result.insertId]);
    const r = newBookRow[0];
    const newBook = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, description: r.description, pageCount: r.page_count ?? void 0, price: r.price != null ? Number(r.price) : void 0 };
    addLog("\u09AC\u0987 \u09AF\u09CB\u0997", `\u09A8\u09A4\u09C1\u09A8 \u09AC\u0987 '${name}' (\u0995\u09CB\u09A1: ${code}${grp ? `, \u0997\u09CD\u09B0\u09C1\u09AA: ${grp}` : ""}) \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE\u09C7 \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.status(201).json(newBook);
  } catch (err) {
    console.error("Book create error:", err);
    res.status(500).json({ error: `\u09AC\u0987 \u09AF\u09CB\u0997 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE: ${err.sqlMessage || err.message || "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0"}` });
  }
});
app.put("/api/books/bulk-group", authenticateAdmin, async (req, res) => {
  const { bookIds, groupName } = req.body;
  if (!Array.isArray(bookIds) || bookIds.length === 0) {
    return res.status(400).json({ error: "\u0995\u09CB\u09A8\u09CB \u09AC\u0987 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF\u0964" });
  }
  try {
    const placeholders = bookIds.map(() => "?").join(",");
    await db_default.query(
      `UPDATE books SET group_name = ? WHERE id IN (${placeholders})`,
      [groupName || "", ...bookIds]
    );
    addLog("\u09AC\u0987 \u0997\u09CD\u09B0\u09C1\u09AA \u0986\u09AA\u09A1\u09C7\u099F", `${bookIds.length} \u099F\u09BF \u09AC\u0987\u09DF\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA '${groupName || "\u0996\u09BE\u09B2\u09BF"}' \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, updatedCount: bookIds.length });
  } catch (err) {
    console.error("Bulk group assign error:", err);
    res.status(500).json({ error: `\u09AC\u0987\u09DF\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE: ${err.sqlMessage || err.message || "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0"}` });
  }
});
app.put("/api/books/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { code, name, author, publisher, imageUrl, status, group, pageCount, price } = req.body;
  if (!code || !name || !author || !publisher) {
    return res.status(400).json({ error: "\u09AC\u0987 \u0995\u09CB\u09A1, \u09A8\u09BE\u09AE, \u09B2\u09C7\u0996\u0995 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09A8\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const [bookRows] = await db_default.query("SELECT * FROM books WHERE id = ?", [id]);
    if (bookRows.length === 0) {
      return res.status(404).json({ error: "\u09AC\u0987\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const uCode = code.toUpperCase();
    const [existing] = await db_default.query("SELECT id FROM books WHERE code = ? AND id != ?", [uCode, id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "\u098F\u0987 \u09AC\u0987 \u0995\u09CB\u09A1\u099F\u09BF \u0985\u09A8\u09CD\u09AF \u09AC\u0987\u09DF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AC\u09CD\u09AF\u09AC\u09B9\u09C3\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    const oldBook = bookRows[0];
    const img = imageUrl || oldBook.image_url;
    const stat = status || oldBook.status;
    const grp = group !== void 0 ? group : oldBook.group_name;
    const pCount = pageCount !== void 0 ? pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null : oldBook.page_count;
    const pPrice = price !== void 0 ? price != null && !isNaN(Number(price)) ? Number(price) : null : oldBook.price;
    await db_default.query(
      "UPDATE books SET code = ?, name = ?, author = ?, publisher = ?, image_url = ?, status = ?, group_name = ?, page_count = ?, price = ? WHERE id = ?",
      [uCode, name, author, publisher, img, stat, grp, pCount, pPrice, id]
    );
    const [updatedBookRow] = await db_default.query("SELECT * FROM books WHERE id = ?", [id]);
    const r = updatedBookRow[0];
    const updatedBook = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, pageCount: r.page_count ?? void 0, price: r.price != null ? Number(r.price) : void 0 };
    addLog("\u09AC\u0987 \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE", `\u09AC\u0987 '${name}' (\u0995\u09CB\u09A1: ${code}) \u098F\u09B0 \u09B8\u09A0\u09BF\u0995 \u09A4\u09A5\u09CD\u09AF \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json(updatedBook);
  } catch (err) {
    console.error("Book update error:", err);
    res.status(500).json({ error: `\u09AC\u0987 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE: ${err.sqlMessage || err.message || "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0"}` });
  }
});
app.delete("/api/books/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [bookRows] = await db_default.query("SELECT * FROM books WHERE id = ?", [id]);
    if (bookRows.length === 0) {
      return res.status(404).json({ error: "\u09AC\u0987\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const r = bookRows[0];
    if (r.status === "Issued") {
      return res.status(400).json({ error: "\u09AC\u0987\u099F\u09BF \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8\u09C7 \u09B8\u09AE\u09B0\u09CD\u09AA\u09BF\u09A4/\u0987\u09B8\u09CD\u09AF\u09C1 \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09DF \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u09A8\u09BE \u0995\u09B0\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u09A1\u09BF\u09B2\u09BF\u099F \u09B8\u09AE\u09CD\u09AD\u09AC \u09A8\u09DF\u0964" });
    }
    await db_default.query("DELETE FROM books WHERE id = ?", [id]);
    const book = { id: String(r.id), code: r.code, name: r.name, author: r.author, publisher: r.publisher, imageUrl: r.image_url, status: r.status, group: r.group_name, pageCount: r.page_count ?? void 0, price: r.price != null ? Number(r.price) : void 0 };
    addLog("\u09AC\u0987 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09AC\u0987 '${book.name}' (\u0995\u09CB\u09A1: ${book.code}) \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A5\u09C7\u0995\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ message: "\u09AC\u0987\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A5\u09C7\u0995\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/books/bulk-import", authenticateAdmin, async (req, res) => {
  const { booksList } = req.body;
  if (!Array.isArray(booksList) || booksList.length === 0) {
    return res.status(400).json({ error: "\u09AC\u0987 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09A4\u09CD\u09B0\u09C1\u099F\u09BF\u09AF\u09C1\u0995\u09CD\u09A4\u0964" });
  }
  let importedCount = 0;
  let duplicatesCount = 0;
  try {
    for (const bookItem of booksList) {
      const { code, name, author, publisher, group, imageUrl, pageCount, price } = bookItem;
      if (code && name && author) {
        const uCode = code.toUpperCase();
        const [existing] = await db_default.query("SELECT id FROM books WHERE code = ?", [uCode]);
        if (existing.length === 0) {
          const img = imageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400";
          const pub = publisher || "\u0985\u099C\u09CD\u099E\u09BE\u09A4 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09A8\u09BE";
          const grp = group || "";
          const pCount = pageCount != null && !isNaN(Number(pageCount)) ? Number(pageCount) : null;
          const pPrice = price != null && !isNaN(Number(price)) ? Number(price) : null;
          await db_default.query(
            "INSERT INTO books (code, name, author, publisher, image_url, status, group_name, page_count, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [uCode, name, author, pub, img, "Available", grp, pCount, pPrice]
          );
          importedCount++;
        } else {
          duplicatesCount++;
        }
      }
    }
    addLog("\u09AC\u0987 \u09AC\u09BE\u09B2\u09CD\u0995 \u0987\u09AE\u09CD\u09AA\u09CB\u09B0\u09CD\u099F", `${importedCount} \u099F\u09BF \u09AC\u0987 \u09AC\u09BE\u09B2\u09CD\u0995 \u0987\u09AE\u09CD\u09AA\u09CB\u09B0\u09CD\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A1\u09C1\u09AA\u09CD\u09B2\u09BF\u0995\u09C7\u099F \u09AC\u09BE\u09A6 \u09AA\u09DC\u09C7\u099B\u09C7: ${duplicatesCount} \u099F\u09BF\u0964`);
    res.json({ success: true, importedCount, duplicatesCount });
  } catch (err) {
    console.error("Bulk import error:", err);
    res.status(500).json({ error: `\u09AC\u09BE\u09B2\u09CD\u0995 \u0987\u09AE\u09CD\u09AA\u09CB\u09B0\u09CD\u099F \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE: ${err.sqlMessage || err.message || "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0"}` });
  }
});
app.get("/api/books/search-smart", authenticateAdmin, async (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  if (!q) {
    return res.json([]);
  }
  try {
    const likeQ = `%${q}%`;
    const [booksRows] = await db_default.query(
      "SELECT * FROM books WHERE LOWER(code) LIKE ? OR LOWER(name) LIKE ? OR LOWER(author) LIKE ? OR LOWER(publisher) LIKE ?",
      [likeQ, likeQ, likeQ, likeQ]
    );
    const mapBookRow = (bRow) => ({
      id: String(bRow.id),
      code: bRow.code,
      name: bRow.name,
      author: bRow.author,
      publisher: bRow.publisher,
      imageUrl: bRow.image_url,
      status: bRow.status,
      group: bRow.group_name,
      pageCount: bRow.page_count ?? void 0,
      price: bRow.price != null ? Number(bRow.price) : void 0
    });
    const books = booksRows.map(mapBookRow);
    const bookCodes = books.map((b) => b.code);
    let issuesByCode = {};
    if (bookCodes.length > 0) {
      const placeholders = bookCodes.map(() => "?").join(",");
      const [allIssueRows] = await db_default.query(
        `SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE b.code IN (${placeholders}) ORDER BY i.id DESC`,
        bookCodes
      );
      const mapIssue = (r) => ({
        id: String(r.id),
        bookId: String(r.book_id),
        bookCode: r.book_code,
        bookName: r.book_name,
        memberId: String(r.member_id),
        formNumber: r.member_form_number,
        memberName: r.member_name,
        memberMobile: r.member_mobile,
        issueDate: r.issue_date,
        returnDate: r.return_date,
        actualReturnDate: r.returned_at || void 0,
        status: r.status,
        fineAmount: r.fine_amount || 0,
        extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : r.extension_history || []
      });
      for (const row of allIssueRows) {
        const mapped = mapIssue(row);
        if (!issuesByCode[row.book_code]) issuesByCode[row.book_code] = [];
        issuesByCode[row.book_code].push(mapped);
      }
    }
    const result = books.map((book) => {
      const history = issuesByCode[book.code] || [];
      const activeIssue = history.find((i) => i.status === "Issued") || null;
      return { book, activeIssue, history };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/members/suggest", authenticateAdmin, async (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase();
  try {
    const mapMemberRow = (r) => ({
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    });
    if (!q) {
      const [rows2] = await db_default.query("SELECT * FROM members ORDER BY CAST(form_number AS UNSIGNED) ASC LIMIT 5");
      return res.json(rows2.map(mapMemberRow));
    }
    const likeQ = `%${q}%`;
    const [rows] = await db_default.query("SELECT * FROM members WHERE LOWER(form_number) LIKE ? OR LOWER(name) LIKE ? OR LOWER(mobile) LIKE ? ORDER BY CAST(form_number AS UNSIGNED) ASC", [likeQ, likeQ, likeQ]);
    res.json(rows.map(mapMemberRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/members", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM members ORDER BY CAST(form_number AS UNSIGNED) ASC");
    const mapMemberRow = (r) => ({
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    });
    res.json(rows.map(mapMemberRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/members/:formNumber/profile", authenticateAdmin, async (req, res) => {
  const { formNumber } = req.params;
  try {
    const [memberRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    if (memberRows.length === 0) {
      return res.status(404).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const r = memberRows[0];
    const member = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    const [issueRows] = await db_default.query("SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE m.form_number = ?", [formNumber]);
    const mapIssue = (r2) => ({
      id: String(r2.id),
      bookId: String(r2.book_id),
      bookCode: r2.book_code,
      bookName: r2.book_name,
      memberId: String(r2.member_id),
      formNumber: r2.member_form_number,
      memberName: r2.member_name,
      memberMobile: r2.member_mobile,
      issueDate: r2.issue_date,
      returnDate: r2.return_date,
      actualReturnDate: r2.returned_at || void 0,
      status: r2.status,
      fineAmount: r2.fine_amount || 0,
      extensionHistory: typeof r2.extension_history === "string" ? JSON.parse(r2.extension_history) : r2.extension_history || []
    });
    const allRents = issueRows.map(mapIssue);
    const activeRents = allRents.filter((i) => i.status === "Issued");
    const returnedHistory = allRents.filter((i) => i.status === "Returned");
    res.json({
      member,
      activeRents,
      returnedHistory,
      rentCount: allRents.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/members", authenticateAdmin, async (req, res) => {
  const {
    name,
    formNumber,
    mobile,
    address,
    dob,
    educationInstitution,
    className,
    classRoll,
    nameEnglish,
    fatherName,
    motherName,
    currVillage,
    currPostOffice,
    currUpazila,
    currDistrict,
    permVillage,
    permPostOffice,
    permUpazila,
    permDistrict,
    bloodGroup,
    nidBirthReg,
    educationQualification,
    profession,
    nationality,
    photo,
    paymentStatus
  } = req.body;
  try {
    let finalFormNumber = formNumber ? formNumber.trim() : "";
    if (!finalFormNumber) {
      const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'memberIdStartNumber'");
      let configuredStart = 1e3;
      if (settingsRows.length > 0 && settingsRows[0].setting_value) {
        configuredStart = parseInt(settingsRows[0].setting_value, 10) || 1e3;
      }
      const [existingRows] = await db_default.query("SELECT CAST(form_number AS UNSIGNED) as fn FROM members WHERE form_number REGEXP '^[0-9]+$' AND CAST(form_number AS UNSIGNED) >= ?", [configuredStart]);
      const existingSet = new Set(existingRows.map((r2) => parseInt(r2.fn, 10)));
      let nextFormNumber = configuredStart;
      while (existingSet.has(nextFormNumber)) {
        nextFormNumber++;
      }
      finalFormNumber = nextFormNumber.toString();
    } else {
      const [existing] = await db_default.query("SELECT id FROM members WHERE form_number = ?", [finalFormNumber]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "\u098F\u0987 \u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u09A6\u09BF\u09DF\u09C7 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u09AE\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0 \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u09B0\u09DF\u09C7\u099B\u09C7\u0964" });
      }
    }
    let finalAddress = address || "";
    if (!finalAddress && (currVillage || currPostOffice || permVillage || permPostOffice)) {
      finalAddress = `\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8: ${currVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${currPostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${currUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${currDistrict || ""}. \u09B8\u09CD\u09A5\u09BE\u09DF\u09C0: ${permVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${permPostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${permUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${permDistrict || ""}`;
    }
    if (!finalAddress) {
      finalAddress = "\u0985\u099C\u09BE\u09A8\u09BE \u09A0\u09BF\u0995\u09BE\u09A8\u09BE";
    }
    const p_name = name ? name.trim() : "\u09A8\u09BE\u09AE\u09B9\u09C0\u09A8 \u09B8\u09A6\u09B8\u09CD\u09AF";
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
    const p_nat = (nationality || "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C0").trim();
    const p_photo = photo || "";
    const p_pay = paymentStatus || "Paid";
    const [result] = await db_default.query(
      `INSERT INTO members (
          form_number, name, name_english, mobile, address, dob, education_institution,
          class_name, class_roll, father_name, mother_name, curr_village, curr_post_office,
          curr_upazila, curr_district, perm_village, perm_post_office, perm_upazila,
          perm_district, blood_group, nid_birth_reg, education_qualification, profession,
          nationality, photo, payment_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalFormNumber,
        p_name,
        p_nameEng,
        p_mobile,
        finalAddress,
        p_dob,
        p_edu,
        p_className,
        p_classRoll,
        p_father,
        p_mother,
        p_cV,
        p_cPO,
        p_cU,
        p_cD,
        p_pV,
        p_pPO,
        p_pU,
        p_pD,
        p_blood,
        p_nid,
        p_eduQ,
        p_prof,
        p_nat,
        p_photo,
        p_pay
      ]
    );
    const [newRow] = await db_default.query("SELECT * FROM members WHERE id = ?", [result.insertId]);
    const r = newRow[0];
    const newMember = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    addLog("\u09B8\u09A6\u09B8\u09CD\u09AF \u09AF\u09CB\u0997", `\u09A8\u09A4\u09C1\u09A8 \u09B8\u09A6\u09B8\u09CD\u09AF ${newMember.name} (\u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0: ${finalFormNumber}) \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.status(201).json(newMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.put("/api/members/:formNumber", authenticateAdmin, async (req, res) => {
  const { formNumber } = req.params;
  const {
    name,
    mobile,
    address,
    dob,
    educationInstitution,
    className,
    classRoll,
    nameEnglish,
    fatherName,
    motherName,
    currVillage,
    currPostOffice,
    currUpazila,
    currDistrict,
    permVillage,
    permPostOffice,
    permUpazila,
    permDistrict,
    bloodGroup,
    nidBirthReg,
    educationQualification,
    profession,
    nationality,
    photo,
    paymentStatus,
    paymentMethod,
    senderNumber,
    transactionId
  } = req.body;
  if (!name || !mobile) {
    return res.status(400).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF\u09B0 \u09A8\u09BE\u09AE \u098F\u09AC\u0982 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const [rows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const oldMember = rows[0];
    let finalAddress = address || oldMember.address;
    const activeVillage = currVillage !== void 0 ? currVillage : oldMember.curr_village;
    const activePostOffice = currPostOffice !== void 0 ? currPostOffice : oldMember.curr_post_office;
    const activeUpazila = currUpazila !== void 0 ? currUpazila : oldMember.curr_upazila;
    const activeDistrict = currDistrict !== void 0 ? currDistrict : oldMember.curr_district;
    const activePermVillage = permVillage !== void 0 ? permVillage : oldMember.perm_village;
    const activePermPostOffice = permPostOffice !== void 0 ? permPostOffice : oldMember.perm_post_office;
    const activePermUpazila = permUpazila !== void 0 ? permUpazila : oldMember.perm_upazila;
    const activePermDistrict = permDistrict !== void 0 ? permDistrict : oldMember.perm_district;
    if (!address && (activeVillage || activePostOffice || activePermVillage || activePermPostOffice)) {
      finalAddress = `\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8: ${activeVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${activePostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${activeUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${activeDistrict || ""}. \u09B8\u09CD\u09A5\u09BE\u09DF\u09C0: ${activePermVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${activePermPostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${activePermUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${activePermDistrict || ""}`;
    }
    const p_name = name.trim();
    const p_mobile = mobile.trim();
    const p_dob = dob !== void 0 ? dob : oldMember.dob;
    const p_edu = educationInstitution !== void 0 ? educationInstitution : oldMember.education_institution;
    const p_className = className !== void 0 ? className : oldMember.class_name;
    const p_classRoll = classRoll !== void 0 ? classRoll : oldMember.class_roll;
    const p_nameEng = nameEnglish !== void 0 ? nameEnglish : oldMember.name_english;
    const p_father = fatherName !== void 0 ? fatherName : oldMember.father_name;
    const p_mother = motherName !== void 0 ? motherName : oldMember.mother_name;
    const p_blood = bloodGroup !== void 0 ? bloodGroup : oldMember.blood_group;
    const p_nid = nidBirthReg !== void 0 ? nidBirthReg : oldMember.nid_birth_reg;
    const p_eduQ = educationQualification !== void 0 ? educationQualification : oldMember.education_qualification;
    const p_prof = profession !== void 0 ? profession : oldMember.profession;
    const p_nat = nationality !== void 0 ? nationality : oldMember.nationality;
    const p_photo = photo !== void 0 ? photo : oldMember.photo;
    const p_payStatus = paymentStatus !== void 0 ? paymentStatus : oldMember.payment_status;
    await db_default.query(
      `UPDATE members SET 
          name = ?, name_english = ?, mobile = ?, address = ?, dob = ?, education_institution = ?,
          class_name = ?, class_roll = ?, father_name = ?, mother_name = ?, curr_village = ?, curr_post_office = ?,
          curr_upazila = ?, curr_district = ?, perm_village = ?, perm_post_office = ?, perm_upazila = ?,
          perm_district = ?, blood_group = ?, nid_birth_reg = ?, education_qualification = ?, profession = ?,
          nationality = ?, photo = ?, payment_status = ?
        WHERE form_number = ?`,
      [
        p_name,
        p_nameEng,
        p_mobile,
        finalAddress,
        p_dob,
        p_edu,
        p_className,
        p_classRoll,
        p_father,
        p_mother,
        activeVillage,
        activePostOffice,
        activeUpazila,
        activeDistrict,
        activePermVillage,
        activePermPostOffice,
        activePermUpazila,
        activePermDistrict,
        p_blood,
        p_nid,
        p_eduQ,
        p_prof,
        p_nat,
        p_photo,
        p_payStatus,
        formNumber
      ]
    );
    const [updatedRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    const r = updatedRows[0];
    const updatedMember = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    addLog("\u09B8\u09A6\u09B8\u09CD\u09AF \u09B8\u09AE\u09CD\u09AA\u09BE\u09A6\u09A8\u09BE", `\u09B8\u09A6\u09B8\u09CD\u09AF '${name}' (\u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0: ${formNumber}) \u098F\u09B0 \u09A4\u09A5\u09CD\u09AF \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json(updatedMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.put("/api/members/:formNumber/payment", authenticateAdmin, async (req, res) => {
  const { formNumber } = req.params;
  const { paymentStatus } = req.body;
  if (!["Pending", "Paid", "Unpaid"].includes(paymentStatus)) {
    return res.status(400).json({ error: "\u09AD\u09CD\u09AF\u09BE\u09B2\u09BF\u09A1 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u0964" });
  }
  try {
    const [rows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    await db_default.query("UPDATE members SET payment_status = ? WHERE form_number = ?", [paymentStatus, formNumber]);
    const [updatedRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    const r = updatedRows[0];
    const member = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    addLog("\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0986\u09AA\u09A1\u09C7\u099F", `\u09B8\u09A6\u09B8\u09CD\u09AF '${member.name}' (\u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0: ${formNumber}) \u098F\u09B0 \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 '${paymentStatus}' \u098F \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.delete("/api/members/:formNumber", authenticateAdmin, async (req, res) => {
  const { formNumber } = req.params;
  try {
    const [rows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const r = rows[0];
    const member = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    await db_default.query("DELETE FROM members WHERE form_number = ?", [formNumber]);
    addLog("\u09B8\u09A6\u09B8\u09CD\u09AF \u09A1\u09BF\u09B2\u09BF\u099F", `\u09B8\u09A6\u09B8\u09CD\u09AF '${member.name}' (\u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0: ${formNumber}) \u0995\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, message: "\u09B8\u09A6\u09B8\u09CD\u09AF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/issues", authenticateAdmin, async (req, res) => {
  const { name, formNumber, mobile, address, bookCode, bookName, author, publisher, returnOption, manualReturnDate } = req.body;
  if (!name || !formNumber || !mobile || !bookCode || !bookName) {
    return res.status(400).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF\u09B0 \u09A4\u09A5\u09CD\u09AF \u098F\u09AC\u0982 \u09AC\u0987\u09DF\u09C7\u09B0 \u0995\u09CB\u09A1 \u09AC\u09BE \u09A8\u09BE\u09AE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const [bookRows] = await db_default.query("SELECT * FROM books WHERE code = ?", [bookCode.toUpperCase()]);
    if (bookRows.length === 0) {
      return res.status(404).json({ error: "\u098F\u0987 \u0995\u09CB\u09A1\u09AF\u09C1\u0995\u09CD\u09A4 \u09AC\u0987\u099F\u09BF \u09B2\u09BE\u0987\u09AC\u09CD\u09B0\u09C7\u09B0\u09BF\u09A4\u09C7 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09BF\u09A4 \u09A8\u09C7\u0987\u0964" });
    }
    const book = bookRows[0];
    if (book.status === "Issued") {
      return res.status(400).json({ error: "\u09AC\u0987\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u0987\u09B8\u09CD\u09AF\u09C1 \u0995\u09B0\u09BE \u0986\u099B\u09C7\u0964 \u09AB\u09C7\u09B0\u09A4 \u09A6\u09C7\u0993\u09DF\u09BE\u09B0 \u09AA\u09B0\u0987 \u0986\u09AC\u09BE\u09B0 \u0987\u09B8\u09CD\u09AF\u09C1 \u0995\u09B0\u09BE \u09AF\u09BE\u09AC\u09C7\u0964" });
    }
    const [memberRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber]);
    let member;
    if (memberRows.length === 0) {
      const finalAddress = address || "\u0985\u099C\u09BE\u09A8\u09BE \u09A0\u09BF\u0995\u09BE\u09A8\u09BE";
      const [mRes] = await db_default.query(
        "INSERT INTO members (form_number, name, mobile, address, payment_status) VALUES (?, ?, ?, ?, ?)",
        [formNumber, name, mobile, finalAddress, "Paid"]
      );
      const [newM] = await db_default.query("SELECT * FROM members WHERE id = ?", [mRes.insertId]);
      member = newM[0];
      addLog("\u09B8\u09A6\u09B8\u09CD\u09AF \u09AF\u09CB\u0997", `\u0987\u09B8\u09CD\u09AF\u09C1 \u09B8\u09AE\u09DF \u09A4\u09C8\u09B0\u09BF: \u09A8\u09A4\u09C1\u09A8 \u09B8\u09A6\u09B8\u09CD\u09AF ${name} (\u09AB\u09B0\u09AE: ${formNumber}) \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    } else {
      member = memberRows[0];
      const updatedAddress = address || member.address;
      await db_default.query("UPDATE members SET name = ?, mobile = ?, address = ? WHERE form_number = ?", [name, mobile, updatedAddress, formNumber]);
      member.name = name;
      member.mobile = mobile;
      member.address = updatedAddress;
    }
    const issueDateStr = getBangladeshDateString();
    let computedReturnDateStr = "";
    if (returnOption === "manual") {
      computedReturnDateStr = manualReturnDate;
    } else {
      const days = parseInt(returnOption, 10) || 7;
      computedReturnDateStr = addDaysToDateString(issueDateStr, days);
    }
    if (!computedReturnDateStr) {
      return res.status(400).json({ error: "\u098F\u0995\u099F\u09BF \u09B8\u09A0\u09BF\u0995 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u09A4\u09BE\u09B0\u09BF\u0996 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const [iRes] = await db_default.query(
      "INSERT INTO issues (book_id, member_id, issue_date, return_date, status) VALUES (?, ?, ?, ?, ?)",
      [book.id, member.id, issueDateStr, computedReturnDateStr, "Issued"]
    );
    await db_default.query("UPDATE books SET status = 'Issued' WHERE id = ?", [book.id]);
    const [insertedIssue] = await db_default.query(
      "SELECT i.*, b.name as book_name, b.code as book_code, b.author, b.publisher, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number, m.address as member_address FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.id = ?",
      [iRes.insertId]
    );
    const r = insertedIssue[0];
    const newIssue = {
      id: String(r.id),
      bookCode: r.book_code,
      bookName: r.book_name,
      author: r.author,
      publisher: r.publisher,
      memberName: r.member_name,
      formNumber: r.member_form_number,
      mobile: r.member_mobile,
      address: r.member_address,
      issueDate: r.issue_date,
      returnDate: r.return_date,
      status: r.status,
      extensionHistory: [],
      comments: []
    };
    addLog("\u09AC\u0987 \u0987\u09B8\u09CD\u09AF\u09C1", `\u09AC\u0987 '${book.name}' (\u0995\u09CB\u09A1: ${book.code}) \u09B8\u09A6\u09B8\u09CD\u09AF ${member.name} (\u09AB\u09B0\u09AE: ${member.form_number}) \u0995\u09C7 \u0987\u09B8\u09CD\u09AF\u09C1 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.status(201).json({ success: true, issue: newIssue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/sms/scheduled", authenticateAdmin, async (req, res) => {
  const todayStr = req.query.todayStr || getBangladeshDateString();
  const bypassRules = req.query.bypassRules === "true";
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
    let smsTemplate = "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AA\u09A8\u09BE\u09B0 ({bookName}) \u09AC\u0987\u099F\u09BF \u099C\u09AE\u09BE\u09A6\u09C7\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u0985\u09A4\u09BF\u0995\u09CD\u09B0\u09AE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AC\u0987\u099F\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u098F \u099C\u09AE\u09BE \u09A6\u09BF\u09DF\u09C7 \u0986\u09B8\u09C1\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09AC\u09BF\u0995\u09BE\u09B2 \u09EA \u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09B0\u09BE\u09A4 \u09EE \u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0996\u09CB\u09B2\u09BE \u09A5\u09BE\u0995\u09C7\u0964 \u09AC\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u0987 \u09AF\u09A6\u09BF \u09AA\u09DC\u09BE \u09B6\u09C7\u09B7 \u09A8\u09BE \u09B9\u09DF\u09C7 \u09A5\u09BE\u0995\u09C7 \u09A4\u09BE\u09B9\u09B2\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0987 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 call /WhatsApp \u098F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7\u09A8: 01333474848";
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      smsTemplate = val || smsTemplate;
    }
    const [issueRows] = await db_default.query(
      "SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.status = 'Issued'"
    );
    const alerts = [];
    issueRows.forEach((issue) => {
      const diffDays = getBangladeshDiffDays(todayStr, issue.return_date);
      const text = smsTemplate.replace(/{bookName}/g, issue.book_name).replace(/{বইয়েরনাম}/g, issue.book_name).replace(/{বইয়েরনাম}/g, issue.book_name).replace(/{book}/g, issue.book_name).replace(/{বই}/g, issue.book_name).replace(/{memberName}/g, issue.member_name).replace(/{সদস্যেরনাম}/g, issue.member_name).replace(/{সদস্য}/g, issue.member_name).replace(/{returnDate}/g, issue.return_date).replace(/{ফেরততারিখ}/g, issue.return_date).replace(/{তারিখ}/g, issue.return_date);
      if (bypassRules) {
        alerts.push({
          id: `sms-${issue.id}-bypass`,
          bookName: issue.book_name,
          memberName: issue.member_name,
          returnDate: issue.return_date,
          mobile: issue.mobile,
          status: "Sent",
          alertText: text,
          triggerTime: `\u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995 \u0993\u09AD\u09BE\u09B0\u09B0\u09BE\u0987\u09A1 \u099F\u09C7\u09B8\u09CD\u099F \u0985\u09CD\u09AF\u09BE\u09B2\u09BE\u09B0\u09CD\u099F (\u09B8\u09AC \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u09B8\u09A6\u09B8\u09CD\u09AF\u0995\u09C7 \u09B8\u099A\u09B2 \u0993\u09AF\u09BC\u09BE\u09B0\u09CD\u09A8\u09BF\u0982)`,
          bookCode: issue.book_code,
          issueId: String(issue.id)
        });
      } else if (diffDays === 0) {
        const dueTodayText = `\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AA\u09A8\u09BE\u09B0 (${issue.book_name}) \u09AC\u0987\u099F\u09BF \u0986\u099C\u0995\u09C7\u0987 \u099C\u09AE\u09BE\u09A6\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B6\u09C7\u09B7 \u09A6\u09BF\u09A8! \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u0986\u099C\u0995\u09C7\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09AC\u0987\u099F\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u09C7 \u099C\u09AE\u09BE \u09A6\u09BF\u09A8\u0964 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u09AC\u09BF\u0995\u09BE\u09B2 \u09EA \u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09B0\u09BE\u09A4 \u09EE \u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0996\u09CB\u09B2\u09BE\u0964 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997: 01333474848`;
        alerts.push({
          id: `sms-${issue.id}-duetoday`,
          bookName: issue.book_name,
          memberName: issue.member_name,
          returnDate: issue.return_date,
          mobile: issue.mobile,
          status: "Sent",
          alertText: dueTodayText,
          triggerTime: `${issue.return_date} (\u0986\u099C \u099C\u09AE\u09BE\u09A6\u09C7\u09AF\u09BC\u09BE\u09B0 \u09B6\u09C7\u09B7 \u09A6\u09BF\u09A8!)`,
          bookCode: issue.book_code,
          issueId: String(issue.id)
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
          triggerTime: `${issue.return_date} \u09A6\u09C1\u09AA\u09C1\u09B0 \u09E8:\u09E6\u09E6 \u099F\u09BE (\u0986\u099C \u09A5\u09C7\u0995\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF \u09E8 \u09A6\u09BF\u09A8 \u0985\u09A8\u09CD\u09A4\u09B0)`,
          bookCode: issue.book_code,
          issueId: String(issue.id)
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
          triggerTime: `${issue.return_date} \u09A6\u09C1\u09AA\u09C1\u09B0 \u09E8:\u09E6\u09E6 \u099F\u09BE`,
          bookCode: issue.book_code,
          issueId: String(issue.id)
        });
      }
    });
    res.json(alerts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/issues/return", authenticateAdmin, async (req, res) => {
  const { bookCode, comments } = req.body;
  if (!bookCode) {
    return res.status(400).json({ error: "\u09AC\u0987 \u0995\u09CB\u09A1 \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const [issueRows] = await db_default.query(
      "SELECT i.*, b.id as b_id, b.name as book_name, b.code as book_code, m.name as member_name FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE b.code = ? AND i.status = 'Issued' ORDER BY i.id DESC LIMIT 1",
      [bookCode.toUpperCase()]
    );
    if (issueRows.length === 0) {
      return res.status(404).json({ error: "\u09AC\u0987\u099F\u09BF\u09B0 \u0995\u09CB\u09A8\u09CB \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u0987\u09B8\u09CD\u09AF\u09C1 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const issue = issueRows[0];
    const returnedAt = getBangladeshDateString();
    await db_default.query("UPDATE books SET status = 'Available' WHERE id = ?", [issue.b_id]);
    await db_default.query("UPDATE issues SET status = 'Returned', returned_at = ? WHERE id = ?", [returnedAt, issue.id]);
    let parsedComments = typeof issue.comments === "string" ? JSON.parse(issue.comments) : issue.comments || [];
    if (comments) {
      parsedComments.push(comments);
      await db_default.query("UPDATE issues SET comments = ? WHERE id = ?", [JSON.stringify(parsedComments), issue.id]);
    }
    addLog("\u09AC\u0987 \u09AB\u09C7\u09B0\u09A4", `\u09AC\u0987 '${issue.book_name}' (\u0995\u09CB\u09A1: ${issue.book_code}) \u09B8\u09A6\u09B8\u09CD\u09AF ${issue.member_name} \u09A5\u09C7\u0995\u09C7 \u09AB\u09C7\u09B0\u09A4 \u0997\u09CD\u09B0\u09B9\u09A3 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    const updatedIssue = {
      id: String(issue.id),
      bookCode: issue.book_code,
      bookName: issue.book_name,
      memberName: issue.member_name,
      issueDate: issue.issue_date,
      returnDate: issue.return_date,
      actualReturnDate: returnedAt,
      status: "Returned",
      comments: parsedComments
    };
    res.json({ success: true, message: "\u09AC\u0987\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AB\u09C7\u09B0\u09A4 \u0997\u09CD\u09B0\u09B9\u09A3 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/issues/active-detailed", authenticateAdmin, async (req, res) => {
  try {
    const [issueRows] = await db_default.query(`
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
    const toDateStr = (val) => {
      if (!val) return "";
      const d = val instanceof Date ? val : new Date(val);
      if (isNaN(d.getTime())) return String(val).split("T")[0];
      return getBangladeshDateString(d);
    };
    const activeIssues = issueRows.map((r) => ({
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
      extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : r.extension_history || []
    }));
    res.json(activeIssues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/issues/time-change", authenticateAdmin, async (req, res) => {
  const { issueId, action, days } = req.body;
  if (!issueId || !action || !days) {
    return res.status(400).json({ error: "\u09AA\u09CD\u09B0\u09DF\u09CB\u099C\u09A8\u09C0\u09DF \u09A4\u09A5\u09CD\u09AF \u0985\u09A8\u09C1\u09AA\u09B8\u09CD\u09A5\u09BF\u09A4\u0964" });
  }
  try {
    const [rows] = await db_default.query(
      "SELECT i.*, b.name as book_name, b.code as book_code FROM issues i JOIN books b ON i.book_id = b.id WHERE i.id = ?",
      [issueId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u0987\u09B8\u09CD\u09AF\u09C1 \u0985\u09CD\u09AF\u09BE\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const issue = rows[0];
    if (issue.status !== "Issued") {
      return res.status(400).json({ error: "\u09B6\u09C1\u09A7\u09C1\u09AE\u09BE\u09A4\u09CD\u09B0 \u099A\u09B2\u09AE\u09BE\u09A8 \u0987\u09B8\u09CD\u09AF\u09C1 \u09AC\u0987\u09DF\u09C7\u09B0 \u09B8\u09AE\u09DF \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF/\u09B9\u09CD\u09B0\u09BE\u09B8 \u09B8\u09AE\u09CD\u09AD\u09AC\u0964" });
    }
    const currentDate = new Date(issue.return_date);
    const offset = parseInt(days, 10);
    let parsedHistory = typeof issue.extension_history === "string" ? JSON.parse(issue.extension_history) : issue.extension_history || [];
    const newReturnDate = addDaysToDateString(String(issue.return_date).split("T")[0], action === "Extend" ? offset : -offset);
    if (action === "Extend") {
      parsedHistory.push({
        date: getBangladeshDateString(),
        action: "Extended",
        payload: `${offset} \u09A6\u09BF\u09A8 \u09AC\u09BE\u09A1\u09BC\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7`
      });
      addLog("\u09B8\u09AE\u09DF \u09AC\u09BE\u09DC\u09BE\u09A8\u09CB", `'${issue.book_name}' (\u0995\u09CB\u09A1: ${issue.book_code}) \u09AC\u0987\u09DF\u09C7\u09B0 \u09B8\u09AE\u09DF\u09B8\u09C0\u09AE\u09BE ${offset} \u09A6\u09BF\u09A8 \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A8\u09A4\u09C1\u09A8 \u09A4\u09BE\u09B0\u09BF\u0996: ${newReturnDate}`);
    } else {
      parsedHistory.push({
        date: getBangladeshDateString(),
        action: "Reduced",
        payload: `${offset} \u09A6\u09BF\u09A8 \u0995\u09AE\u09BE\u09A8\u09CB \u09B9\u09AF\u09BC\u09C7\u099B\u09C7`
      });
      addLog("\u09B8\u09AE\u09DF \u0995\u09AE\u09BE\u09A8\u09CB", `'${issue.book_name}' (\u0995\u09CB\u09A1: ${issue.book_code}) \u09AC\u0987\u09DF\u09C7\u09B0 \u09B8\u09AE\u09DF\u09B8\u09C0\u09AE\u09BE ${offset} \u09A6\u09BF\u09A8 \u0995\u09AE\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A8\u09A4\u09C1\u09A8 \u09A4\u09BE\u09B0\u09BF\u0996: ${newReturnDate}`);
    }
    await db_default.query("UPDATE issues SET return_date = ?, extension_history = ? WHERE id = ?", [newReturnDate, JSON.stringify(parsedHistory), issueId]);
    res.json({ success: true, newReturnDate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/wishlist", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM wishlist ORDER BY id DESC");
    res.json(rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      author: r.author,
      publisher: r.publisher,
      createdAt: r.created_at,
      memberFormNumber: r.member_form_number || "",
      status: r.status || "pending"
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/wishlist", authenticateAdmin, async (req, res) => {
  const { name, author, publisher, status } = req.body;
  if (!name) {
    return res.status(400).json({ error: "\u09AC\u0987\u09DF\u09C7\u09B0 \u09A8\u09BE\u09AE \u09A5\u09BE\u0995\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964" });
  }
  try {
    const p_author = author || "\u0985\u099C\u09CD\u099E\u09BE\u09A4";
    const p_publisher = publisher || "\u0985\u099C\u09CD\u099E\u09BE\u09A4";
    const p_status = status || "pending";
    const createdAt = formatCurrentDateTime();
    const [result] = await db_default.query("INSERT INTO wishlist (name, author, publisher, created_at, status) VALUES (?, ?, ?, ?, ?)", [name, p_author, p_publisher, createdAt, p_status]);
    const newItem = {
      id: String(result.insertId),
      name,
      author: p_author,
      publisher: p_publisher,
      createdAt,
      status: p_status
    };
    addLog("\u09AC\u0987 \u09AF\u09CB\u0997", `\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AC\u0987 '${name}' \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.put("/api/wishlist/:id/fulfill", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db_default.query("SELECT * FROM wishlist WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u0986\u0987\u099F\u09C7\u09AE\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    await db_default.query("UPDATE wishlist SET status = 'fulfilled' WHERE id = ?", [id]);
    addLog("\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F \u0986\u09AA\u09A1\u09C7\u099F", `\u09AC\u0987 '${rows[0].name}' \u09B8\u0982\u0997\u09C3\u09B9\u09C0\u09A4 (fulfilled) \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, status: "fulfilled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.put("/api/wishlist/:id/status", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const [rows] = await db_default.query("SELECT * FROM wishlist WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u0986\u0987\u099F\u09C7\u09AE\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const newStatus = status || "fulfilled";
    await db_default.query("UPDATE wishlist SET status = ? WHERE id = ?", [newStatus, id]);
    addLog("\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F \u0986\u09AA\u09A1\u09C7\u099F", `\u09AC\u0987 '${rows[0].name}' \u098F\u09B0 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 '${newStatus}' \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.delete("/api/wishlist/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db_default.query("SELECT * FROM wishlist WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u0986\u0987\u099F\u09C7\u09AE\u099F\u09BF \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const item = { id: String(rows[0].id), name: rows[0].name, author: rows[0].author, publisher: rows[0].publisher, createdAt: rows[0].created_at };
    await db_default.query("DELETE FROM wishlist WHERE id = ?", [id]);
    addLog("\u09AC\u0987 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F \u09A5\u09C7\u0995\u09C7 \u09AC\u0987 '${item.name}' \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.get("/api/notes", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM notes ORDER BY id DESC");
    res.json(rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      content: r.content,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.post("/api/notes", authenticateAdmin, async (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "\u09A8\u09CB\u099F\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const p_content = content || "";
    const dt = formatCurrentDateTime();
    const [result] = await db_default.query("INSERT INTO notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)", [title, p_content, dt, dt]);
    const newNote = {
      id: String(result.insertId),
      title,
      content: p_content,
      createdAt: dt,
      updatedAt: dt
    };
    addLog("\u09A8\u09CB\u099F \u09A4\u09C8\u09B0\u09BF", `\u09A8\u09CB\u099F\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE: '${title}' \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09A4\u09C8\u09B0\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.put("/api/notes/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "\u09A8\u09CB\u099F\u09C7\u09B0 \u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
  }
  try {
    const [rows] = await db_default.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09A8\u09CB\u099F\u099F\u09BF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const p_content = content || "";
    const dt = formatCurrentDateTime();
    await db_default.query("UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?", [title, p_content, dt, id]);
    const [updatedRows] = await db_default.query("SELECT * FROM notes WHERE id = ?", [id]);
    const r = updatedRows[0];
    const updatedNote = {
      id: String(r.id),
      title: r.title,
      content: r.content,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.delete("/api/notes/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db_default.query("SELECT * FROM notes WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09A8\u09CB\u099F\u099F\u09BF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const note = rows[0];
    await db_default.query("DELETE FROM notes WHERE id = ?", [id]);
    addLog("\u09A8\u09CB\u099F \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE: '${note.title}' \u09A8\u09CB\u099F\u099F\u09BF \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
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
    const [rows] = await db_default.query(query, params);
    res.json(rows.map((r) => ({
      id: String(r.id),
      action: r.action,
      details: r.details,
      timestamp: r.timestamp
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.delete("/api/history/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db_default.query("DELETE FROM audit_logs WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
app.delete("/api/history", authenticateAdmin, async (req, res) => {
  try {
    await db_default.query("TRUNCATE TABLE audit_logs");
    addLog("\u0987\u09A4\u09BF\u09B9\u09BE\u09B8 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09B2\u0997 \u09B9\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09BF \u09B0\u09BF\u09AC\u09C1\u099F \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, message: "\u09B8\u09AE\u09B8\u09CD\u09A4 \u09B9\u09BF\u09B8\u09CD\u099F\u09CD\u09B0\u09BF \u09B2\u09CB\u0997 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AC\u09BE\u09A4\u09BF\u09B2 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u098F\u09B0\u09B0" });
  }
});
function getBangladeshDiffDays(todayStr, returnDateStr) {
  try {
    const [tY, tM, tD] = todayStr.split("-").map(Number);
    const [rY, rM, rD] = returnDateStr.split("-").map(Number);
    const tDate = new Date(tY, tM - 1, tD, 12, 0, 0);
    const rDate = new Date(rY, rM - 1, rD, 12, 0, 0);
    const diffTime = tDate.getTime() - rDate.getTime();
    return Math.floor(diffTime / (1e3 * 60 * 60 * 24));
  } catch (e) {
    return -1;
  }
}
app.post("/api/sms/trigger", authenticateAdmin, async (req, res) => {
  try {
    const todayStr = req.body.todayStr || req.query.todayStr || getBangladeshDateString();
    const bypassRules = req.body.bypassRules === true || req.body.bypassRules === "true" || req.query.bypassRules === "true";
    const [gatewayRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
    const [templateRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsTemplate'");
    let gateway = { provider: "simulated", apiKey: "", senderId: "", customUrl: "" };
    let smsTemplate = "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE, \u0986\u09AA\u09A8\u09BE\u09B0 ({bookName}) \u09AC\u0987\u099F\u09BF \u099C\u09AE\u09BE\u09A6\u09C7\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u0985\u09A4\u09BF\u0995\u09CD\u09B0\u09AE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09AC\u0987\u099F\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u098F \u099C\u09AE\u09BE \u09A6\u09BF\u09DF\u09C7 \u0986\u09B8\u09C1\u09A8\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u09AC\u09BF\u0995\u09BE\u09B2 \u09EA \u099F\u09BE \u09A5\u09C7\u0995\u09C7 \u09B0\u09BE\u09A4 \u09EE \u099F\u09BE \u09AA\u09B0\u09CD\u09AF\u09A8\u09CD\u09A4 \u0996\u09CB\u09B2\u09BE \u09A5\u09BE\u0995\u09C7\u0964 \u09AC\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u0987 \u09AF\u09A6\u09BF \u09AA\u09DC\u09BE \u09B6\u09C7\u09B7 \u09A8\u09BE \u09B9\u09DF\u09C7 \u09A5\u09BE\u0995\u09C7 \u09A4\u09BE\u09B9\u09B2\u09C7 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u0987 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 call /WhatsApp \u098F \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C7\u09A8: 01333474848";
    if (gatewayRows.length > 0) {
      const val = typeof gatewayRows[0].setting_value === "string" ? JSON.parse(gatewayRows[0].setting_value) : gatewayRows[0].setting_value;
      if (val) gateway = val;
    }
    if (templateRows.length > 0) {
      const val = typeof templateRows[0].setting_value === "string" ? JSON.parse(templateRows[0].setting_value) : templateRows[0].setting_value;
      if (val) smsTemplate = val;
    }
    const [issues] = await db_default.query("SELECT * FROM issues WHERE status = 'Issued'");
    const activeAlerts = [];
    issues.forEach((issue) => {
      const issueReturnDateStr = issue.return_date instanceof Date ? getBangladeshDateString(issue.return_date) : String(issue.return_date).split(" ")[0].split("T")[0];
      const diffDays = getBangladeshDiffDays(todayStr, issueReturnDateStr);
      if (bypassRules || diffDays >= 0 && diffDays % 2 === 0) {
        const rawTemplate = smsTemplate;
        const text = rawTemplate.replace(/{bookName}/g, issue.book_name).replace(/{বইয়েরনাম}/g, issue.book_name).replace(/{বইয়েরনাম}/g, issue.book_name).replace(/{book}/g, issue.book_name).replace(/{বই}/g, issue.book_name).replace(/{memberName}/g, issue.member_name).replace(/{সদস্যেরনাম}/g, issue.member_name).replace(/{সদস্য}/g, issue.member_name).replace(/{returnDate}/g, issueReturnDateStr).replace(/{ফেরততারিখ}/g, issueReturnDateStr).replace(/{তারিখ}/g, issueReturnDateStr);
        activeAlerts.push({
          mobile: issue.mobile,
          text,
          memberName: issue.member_name
        });
      }
    });
    let responseMsg = "\u09AA\u09C7\u09A8\u09CD\u09A1\u09BF\u0982 \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE SMS \u09B6\u09BF\u09A1\u09BF\u0989\u09B2\u09B8\u09AE\u09C2\u09B9 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BF\u0999\u09CD\u0995 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7\u0964 (\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u09B6\u09A8 \u09AE\u09CB\u09A1)";
    let logDetails = "\u0985\u099F\u09CB\u09AE\u09C7\u099F\u09C7\u09A1 SMS \u09B6\u09BF\u09A1\u09BF\u0989\u09B2 \u099A\u09C7\u0995 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7 \u098F\u09AC\u0982 \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u0993\u09AD\u09BE\u09B0\u09A1\u09BF\u0989 \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE \u09AB\u09B0\u09CB\u09DF\u09BE\u09B0\u09CD\u09A1 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964";
    if (gateway.provider === "simulated") {
      let count = 0;
      for (const alert of activeAlerts) {
        count++;
        addLog("\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u099F\u09C7\u09A1 SMS", `\u09B8\u09A6\u09B8\u09CD\u09AF ${alert.memberName} (${alert.mobile}) \u0995\u09C7 \u09AB\u09CD\u09B0\u09BF \u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u099F\u09C7\u09A1 \u0993\u09AD\u09BE\u09B0\u09A1\u09BF\u0989 SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE: "${alert.text.slice(0, 60)}..."`);
      }
      responseMsg = `\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u09B6\u09A8 \u09AE\u09CB\u09A1 (Free) \u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF \u09B6\u09BF\u09A1\u09BF\u0989\u09B2 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8\u0964 \u09AE\u09CB\u099F ${count} \u099F\u09BF \u09B0\u09BF\u09AE\u09BE\u0987\u09A8\u09CD\u09A1\u09BE\u09B0 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7!`;
      logDetails = `\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u09B6\u09A8 \u09AE\u09CB\u09A1 (Free) \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8\u0964 \u09AE\u09CB\u099F \u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u099F\u09C7\u09A1 \u09B0\u09BF\u09AE\u09BE\u0987\u09A8\u09CD\u09A1\u09BE\u09B0: ${count}\u099F\u09BF\u0964`;
    } else if (gateway.provider && gateway.provider !== "simulated" && (gateway.apiKey || gateway.provider === "custom" && gateway.customUrl)) {
      let successCount = 0;
      let failCount = 0;
      for (const alert of activeAlerts) {
        try {
          let url = "";
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
            customUrlStr = customUrlStr.replace(/{apiKey}/g, encodeURIComponent(gateway.apiKey)).replace(/{token}/g, encodeURIComponent(gateway.apiKey)).replace(/{to}/g, encodeURIComponent(mobileWith88)).replace(/{mobile}/g, encodeURIComponent(mobileWith88)).replace(/{mobileNo}/g, encodeURIComponent(mobileWithout88)).replace(/{senderId}/g, encodeURIComponent(gateway.senderId)).replace(/{message}/g, encodeURIComponent(alert.text)).replace(/{msg}/g, encodeURIComponent(alert.text));
            url = customUrlStr;
          }
          if (url) {
            console.log(`Sending real SMS to ${alert.memberName} (${alert.mobile}) via ${gateway.provider}`);
            const apiRes = await fetch(url, { method: "GET" });
            const apiText = await apiRes.text();
            console.log(`Gateway response for ${alert.mobile}:`, apiText);
            addLog("\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC SMS", `\u09B8\u09A6\u09B8\u09CD\u09AF ${alert.memberName} (${alert.mobile}) \u0995\u09C7 ${gateway.provider} \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 \u09A6\u09BF\u09DF\u09C7 SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09B0\u09C7\u09B8\u09AA\u09A8\u09CD\u09B8: ${apiText}`);
            successCount++;
          }
        } catch (smsErr) {
          console.error(`Failed to send real SMS to ${alert.mobile}:`, smsErr);
          failCount++;
        }
      }
      responseMsg = `\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC SMS \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 (${gateway.provider}) \u098F\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE \u09B0\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09B8\u09AB\u09B2: ${successCount}\u099F\u09BF, \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: ${failCount}\u099F\u09BF\u0964`;
      logDetails = `\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC SMS \u0997\u09C7\u099F\u0993\u09AF\u09BC\u09C7 (${gateway.provider}) \u09AE\u09BE\u09B0\u09AB\u09A4 SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B0\u09BE\u09A8 \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AE\u09CB\u099F \u09B8\u09AB\u09B2: ${successCount}, \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: ${failCount}\u0964`;
    }
    addLog("SMS \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE \u09B0\u09BE\u09A8", logDetails);
    res.json({ success: true, message: responseMsg });
  } catch (err) {
    console.error("SMS trigger endpoint runtime error:", err);
    res.status(500).json({ error: "SMS \u09B6\u09BF\u09A1\u09BF\u0989\u09B2\u09BE\u09B0 \u09B0\u09BE\u09A8 \u0995\u09B0\u09BE\u09B0 \u09B8\u09AE\u09DF \u0987\u09A8\u09CD\u099F\u09BE\u09B0\u09A8\u09BE\u09B2 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/sms/send-single", authenticateAdmin, async (req, res) => {
  try {
    const { mobile, message } = req.body;
    if (!mobile || !message) {
      return res.status(400).json({ error: "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u098F\u09AC\u0982 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u0989\u09AD\u09DF\u0987 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'smsGateway'");
    let gateway = { provider: "simulated", apiKey: "", senderId: "", customUrl: "" };
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      gateway = val || gateway;
    }
    let rawMobile = mobile.replace(/\D/g, "");
    let mobileWith88 = rawMobile.startsWith("88") ? rawMobile : "88" + rawMobile;
    let mobileWithout88 = rawMobile.startsWith("88") ? rawMobile.slice(2) : rawMobile;
    let logDetails = `\u09AE\u09CD\u09AF\u09BE\u09A8\u09C1\u09DF\u09BE\u09B2 \u098F\u0995\u0995 SMS \u09AA\u09CD\u09B0\u09C7\u09B0\u09A3\u09C7\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7 \u09B0\u09BF\u09B8\u09BF\u09AA\u09C7\u09A8\u09CD\u099F \u09A8\u09AE\u09CD\u09AC\u09B0: ${mobile}`;
    let responseMsg = "\u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u098F\u0995\u0995 SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7 (\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u09B6\u09A8 \u09AE\u09CB\u09A1 - \u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09B2\u0997\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4)";
    let success = true;
    let isSimulated = true;
    if (gateway.provider && gateway.provider !== "simulated" && (gateway.apiKey || gateway.provider === "custom" && gateway.customUrl)) {
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
        customUrlStr = customUrlStr.replace(/{apiKey}/g, encodeURIComponent(gateway.apiKey)).replace(/{token}/g, encodeURIComponent(gateway.apiKey)).replace(/{to}/g, encodeURIComponent(mobileWith88)).replace(/{mobile}/g, encodeURIComponent(mobileWith88)).replace(/{mobileNo}/g, encodeURIComponent(mobileWithout88)).replace(/{senderId}/g, encodeURIComponent(gateway.senderId)).replace(/{message}/g, encodedMsg).replace(/{msg}/g, encodedMsg);
        url = customUrlStr;
      }
      if (url) {
        console.log(`Sending single SMS to ${mobile} via ${gateway.provider}: ${url}`);
        const apiRes = await fetch(url, { method: "GET" });
        const apiText = await apiRes.text();
        console.log(`Single SMS response for ${mobile}:`, apiText);
        if (apiText.toLowerCase().includes("error") || apiText.toLowerCase().includes("failed") || apiText.toLowerCase().includes("invalid")) {
          success = false;
          responseMsg = `\u0997\u09C7\u099F\u0993\u09DF\u09C7 \u09A5\u09C7\u0995\u09C7 \u098F\u09B0\u09B0 \u09AA\u09BE\u0993\u09DF\u09BE \u0997\u09C7\u099B\u09C7: ${apiText}`;
        } else {
          responseMsg = `\u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u098F\u0995\u0995 SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7! \u0997\u09C7\u099F\u0993\u09DF\u09C7 \u09B0\u09C7\u09B8\u09AA\u09A8\u09CD\u09B8: ${apiText}`;
        }
      }
    }
    const logAction = isSimulated ? "\u09AE\u09CD\u09AF\u09BE\u09A8\u09C1\u09DF\u09BE\u09B2 SMS (\u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u09B6\u09A8)" : "\u09AE\u09CD\u09AF\u09BE\u09A8\u09C1\u09DF\u09BE\u09B2 SMS (\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC)";
    const logBody = isSimulated ? `\u09A8\u09AE\u09CD\u09AC\u09B0 ${mobile}-\u098F \u09AB\u09CD\u09B0\u09BF \u09B8\u09BF\u09AE\u09C1\u09B2\u09C7\u099F\u09C7\u09A1 SMS \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE: "${message}"` : `\u09A8\u09AE\u09CD\u09AC\u09B0 ${mobile}-\u098F \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC SMS \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE: "${message}"`;
    addLog(logAction, logBody);
    res.json({ success, message: responseMsg });
  } catch (err) {
    console.error("Single SMS send runtime error:", err);
    res.status(500).json({ error: `SMS \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u0985\u09AD\u09CD\u09AF\u09A8\u09CD\u09A4\u09B0\u09C0\u09A3 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7: ${err.message || err}` });
  }
});
app.post("/api/public/member-login", async (req, res) => {
  try {
    const { formNumber, dob, mobile } = req.body;
    if (!formNumber || !mobile) {
      return res.status(400).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u09AB\u09B0\u09AE \u09A8\u0982 \u098F\u09AC\u0982 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [memberRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber.trim()]);
    if (memberRows.length === 0) {
      return res.status(404).json({ error: "\u098F\u0987 \u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7\u09B0 \u0995\u09CB\u09A8\u09CB \u09B8\u09A6\u09B8\u09CD\u09AF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const m = memberRows[0];
    const member = {
      id: String(m.id),
      formNumber: m.form_number,
      name: m.name,
      nameEnglish: m.name_english,
      mobile: m.mobile,
      address: m.address,
      dob: m.dob,
      educationInstitution: m.education_institution,
      className: m.class_name,
      classRoll: m.class_roll,
      fatherName: m.father_name,
      motherName: m.mother_name,
      currVillage: m.curr_village,
      currPostOffice: m.curr_post_office,
      currUpazila: m.curr_upazila,
      currDistrict: m.curr_district,
      permVillage: m.perm_village,
      permPostOffice: m.perm_post_office,
      permUpazila: m.perm_upazila,
      permDistrict: m.perm_district,
      bloodGroup: m.blood_group,
      nidBirthReg: m.nid_birth_reg,
      educationQualification: m.education_qualification,
      profession: m.profession,
      nationality: m.nationality,
      photo: m.photo,
      paymentStatus: m.payment_status
    };
    const cleanMobile = mobile.replace(/\D/g, "");
    const cleanMemberMobile = member.mobile.replace(/\D/g, "");
    if (!cleanMemberMobile.includes(cleanMobile) && !cleanMobile.includes(cleanMemberMobile)) {
      return res.status(400).json({ error: "\u09AA\u09CD\u09B0\u09A6\u09A4\u09CD\u09A4 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u098F\u0987 \u09B8\u09A6\u09B8\u09CD\u09AF\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE\u0964" });
    }
    const isApproved = (member.paymentStatus || "Paid") === "Paid";
    if (!isApproved) {
      return res.status(403).json({ error: "\u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09A6\u09B8\u09CD\u09AF\u09AA\u09A6 \u098F\u0996\u09A8\u0993 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8\u09C7\u09B0 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE\u09AF\u09BC \u0986\u099B\u09C7 \u09AC\u09BE \u09B8\u09CD\u09A5\u0997\u09BF\u09A4 \u09B0\u09DF\u09C7\u099B\u09C7\u0964 \u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u098F\u09A1\u09AE\u09BF\u09A8\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    if (member.dob && member.dob.trim()) {
      const normDobInDb = member.dob.trim().replace(/[-\/]/g, "");
      const normInputDob = (dob || "").trim().replace(/[-\/]/g, "");
      if (normDobInDb && normInputDob && normDobInDb !== normInputDob) {
        return res.status(400).json({ error: "\u09AA\u09CD\u09B0\u09A6\u09A4\u09CD\u09A4 \u099C\u09A8\u09CD\u09AE \u09A4\u09BE\u09B0\u09BF\u0996\u099F\u09BF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B0\u09C7\u0995\u09B0\u09CD\u09A1\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AE\u09BF\u09B2\u099B\u09C7 \u09A8\u09BE\u0964" });
      }
    } else if (dob && dob.trim()) {
      member.dob = dob.trim();
      await db_default.query("UPDATE members SET dob = ? WHERE id = ?", [member.dob, m.id]);
      addLog("\u099C\u09A8\u09CD\u09AE \u09A4\u09BE\u09B0\u09BF\u0996 \u0986\u09AA\u09A1\u09C7\u099F", `\u09B8\u09A6\u09B8\u09CD\u09AF ${member.name} (\u09AB\u09B0\u09AE: ${member.formNumber}) \u098F\u09B0 \u099C\u09A8\u09CD\u09AE \u09A4\u09BE\u09B0\u09BF\u0996 \u09AA\u09CD\u09B0\u09A5\u09AE \u09B2\u0997\u0987\u09A8\u09C7 \u09B8\u09CD\u09AC\u09DF\u0982\u0995\u09CD\u09B0\u09BF\u09DF\u09AD\u09BE\u09AC\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    }
    res.json({ success: true, member });
  } catch (err) {
    console.error("Member login failed:", err);
    res.status(500).json({ error: "\u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09A4\u09C7 \u0985\u09AD\u09CD\u09AF\u09A8\u09CD\u09A4\u09B0\u09C0\u09A3 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/public/register", async (req, res) => {
  try {
    const {
      name,
      nameEnglish,
      fatherName,
      motherName,
      currVillage,
      currPostOffice,
      currUpazila,
      currDistrict,
      permVillage,
      permPostOffice,
      permUpazila,
      permDistrict,
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
      senderNumber,
      transactionId,
      photo
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "\u0986\u09AC\u09C7\u09A6\u09A8\u0995\u09BE\u09B0\u09C0\u09B0 \u09AA\u09C2\u09B0\u09CD\u09A3 \u09A8\u09BE\u09AE (\u09AC\u09BE\u0982\u09B2\u09BE\u09DF) \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ error: "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    if (!dob || !dob.trim()) {
      return res.status(400).json({ error: "\u099C\u09A8\u09CD\u09AE \u09A4\u09BE\u09B0\u09BF\u0996 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    if (paymentMethod && paymentMethod !== "\u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BE\u09B0") {
      if (!senderNumber || !senderNumber.trim()) {
        return res.status(400).json({ error: "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982\u09DF\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 \u09AF\u09C7 \u09A8\u09AE\u09CD\u09AC\u09B0 \u09A5\u09C7\u0995\u09C7 \u099F\u09BE\u0995\u09BE \u09AA\u09BE\u09A0\u09BF\u09DF\u09C7\u099B\u09C7\u09A8 \u09A4\u09BE \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
      }
      if (!transactionId || !transactionId.trim()) {
        return res.status(400).json({ error: "\u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09AC\u09CD\u09AF\u09BE\u0982\u0995\u09BF\u0982\u09DF\u09C7\u09B0 \u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0\u09C7 \u099F\u09CD\u09B0\u09BE\u09A8\u099C\u09C7\u0995\u09B6\u09A8 \u0986\u0987\u09A1\u09BF (TrxID) \u09A6\u09C7\u0993\u09DF\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
      }
    }
    const cleanMobile = mobile.replace(/\D/g, "");
    const [existingRows] = await db_default.query("SELECT id FROM members WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(mobile, ' ', ''), '-', ''), '+', ''), '(', ''), ')', '') LIKE ?", [`%${cleanMobile}%`]);
    if (existingRows.length > 0) {
      return res.status(400).json({ error: "\u098F\u0987 \u09AE\u09CB\u09AC\u09BE\u0987\u09B2 \u09A8\u09AE\u09CD\u09AC\u09B0\u099F\u09BF \u09A6\u09BF\u09DF\u09C7 \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7\u0987 \u098F\u0995\u09BE\u0989\u09A8\u09CD\u099F \u09B0\u09C7\u099C\u09BF\u09B8\u09CD\u099F\u09BE\u09B0\u09CD\u09A1 \u09B0\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'memberIdStartNumber'");
    let configuredStart = 1e3;
    if (settingsRows.length > 0 && settingsRows[0].setting_value) {
      configuredStart = parseInt(settingsRows[0].setting_value, 10) || 1e3;
    }
    const [existingFormRows] = await db_default.query("SELECT CAST(form_number AS UNSIGNED) as fn FROM members WHERE form_number REGEXP '^[0-9]+$' AND CAST(form_number AS UNSIGNED) >= ?", [configuredStart]);
    const existingSet = new Set(existingFormRows.map((r2) => parseInt(r2.fn, 10)));
    let nextFormNumber = configuredStart;
    while (existingSet.has(nextFormNumber)) {
      nextFormNumber++;
    }
    const nextFormNumberStr = nextFormNumber.toString();
    const addressStr = `\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8: ${currVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${currPostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${currUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${currDistrict || ""}. \u09B8\u09CD\u09A5\u09BE\u09DF\u09C0: ${permVillage || ""}, \u09A1\u09BE\u0995\u0998\u09B0: ${permPostOffice || ""}, \u0989\u09AA\u099C\u09C7\u09B2\u09BE: ${permUpazila || ""}, \u099C\u09C7\u09B2\u09BE: ${permDistrict || ""}`;
    const p_paymentStatus = paymentMethod === "\u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BE\u09B0" ? "Unpaid" : "Pending";
    const insertValues = [
      nextFormNumberStr,
      name.trim(),
      (nameEnglish || "").trim(),
      mobile.trim(),
      addressStr,
      dob.trim(),
      (educationInstitution || "").trim(),
      (className || "").trim(),
      (classRoll || "").trim(),
      (fatherName || "").trim(),
      (motherName || "").trim(),
      (currVillage || "").trim(),
      (currPostOffice || "").trim(),
      (currUpazila || "").trim(),
      (currDistrict || "").trim(),
      (permVillage || "").trim(),
      (permPostOffice || "").trim(),
      (permUpazila || "").trim(),
      (permDistrict || "").trim(),
      (bloodGroup || "").trim(),
      (nidBirthReg || "").trim(),
      (educationQualification || "").trim(),
      (profession || "").trim(),
      (nationality || "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C0").trim(),
      (paymentMethod || "\u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BE\u09B0").trim(),
      p_paymentStatus,
      photo || ""
    ];
    const [resInsert] = await db_default.query(
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
    const [newRow] = await db_default.query("SELECT * FROM members WHERE id = ?", [resInsert.insertId]);
    const r = newRow[0];
    const newMember = {
      id: String(r.id),
      formNumber: r.form_number,
      name: r.name,
      nameEnglish: r.name_english,
      mobile: r.mobile,
      address: r.address,
      dob: r.dob,
      educationInstitution: r.education_institution,
      className: r.class_name,
      classRoll: r.class_roll,
      fatherName: r.father_name,
      motherName: r.mother_name,
      currVillage: r.curr_village,
      currPostOffice: r.curr_post_office,
      currUpazila: r.curr_upazila,
      currDistrict: r.curr_district,
      permVillage: r.perm_village,
      permPostOffice: r.perm_post_office,
      permUpazila: r.perm_upazila,
      permDistrict: r.perm_district,
      bloodGroup: r.blood_group,
      nidBirthReg: r.nid_birth_reg,
      educationQualification: r.education_qualification,
      profession: r.profession,
      nationality: r.nationality,
      photo: r.photo,
      paymentStatus: r.payment_status
    };
    addLog("\u09B8\u09A6\u09B8\u09CD\u09AF \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8", `\u09A8\u09A4\u09C1\u09A8 \u09B8\u09A6\u09B8\u09CD\u09AF \u09A8\u09BF\u099C\u09C7 \u0985\u09A8\u09B2\u09BE\u0987\u09A8 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u09AB\u09B0\u09AE\u09C7\u09B0 \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u09A8: ${name.trim()} (\u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0: ${nextFormNumber})`);
    res.status(201).json({ success: true, member: newMember });
  } catch (err) {
    console.error("Public self-registration failed:", err);
    res.status(500).json({ error: "\u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u09B8\u09AE\u09CD\u09AA\u09A8\u09CD\u09A8 \u0995\u09B0\u09A4\u09C7 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/public/members/:formNumber/profile", async (req, res) => {
  try {
    const { formNumber } = req.params;
    const [memberRows] = await db_default.query("SELECT * FROM members WHERE form_number = ?", [formNumber.trim()]);
    if (memberRows.length === 0) {
      return res.status(404).json({ error: "\u098F\u0987 \u09AB\u09B0\u09AE \u09A8\u09AE\u09CD\u09AC\u09B0\u09C7\u09B0 \u0995\u09CB\u09A8\u09CB \u09B8\u09A6\u09B8\u09CD\u09AF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    const m = memberRows[0];
    const member = {
      id: String(m.id),
      formNumber: m.form_number,
      name: m.name,
      nameEnglish: m.name_english,
      mobile: m.mobile,
      address: m.address,
      dob: m.dob,
      educationInstitution: m.education_institution,
      className: m.class_name,
      classRoll: m.class_roll,
      fatherName: m.father_name,
      motherName: m.mother_name,
      currVillage: m.curr_village,
      currPostOffice: m.curr_post_office,
      currUpazila: m.curr_upazila,
      currDistrict: m.curr_district,
      permVillage: m.perm_village,
      permPostOffice: m.perm_post_office,
      permUpazila: m.perm_upazila,
      permDistrict: m.perm_district,
      bloodGroup: m.blood_group,
      nidBirthReg: m.nid_birth_reg,
      educationQualification: m.education_qualification,
      profession: m.profession,
      nationality: m.nationality,
      photo: m.photo,
      paymentStatus: m.payment_status
    };
    const [issueRows] = await db_default.query(
      "SELECT i.*, b.name as book_name, b.code as book_code, m.name as member_name, m.mobile as member_mobile, m.form_number as member_form_number, m.address as member_address FROM issues i JOIN books b ON i.book_id = b.id JOIN members m ON i.member_id = m.id WHERE i.member_id = ?",
      [m.id]
    );
    const issues = issueRows.map((r) => ({
      id: String(r.id),
      bookCode: r.book_code,
      bookName: r.book_name,
      memberName: r.member_name,
      formNumber: r.member_form_number,
      mobile: r.member_mobile,
      address: r.member_address,
      issueDate: r.issue_date,
      returnDate: r.return_date,
      actualReturnDate: r.returned_at,
      status: r.status,
      extensionHistory: typeof r.extension_history === "string" ? JSON.parse(r.extension_history) : r.extension_history || [],
      comments: typeof r.comments === "string" ? JSON.parse(r.comments) : r.comments || []
    }));
    const activeRents = issues.filter((i) => i.status === "Issued");
    const returnedHistory = issues.filter((i) => i.status === "Returned");
    res.json({
      success: true,
      member,
      activeRents,
      returnedHistory,
      rentCount: issues.length
    });
  } catch (err) {
    console.error("Public profile fetch failed:", err);
    res.status(500).json({ error: "\u09AA\u09CD\u09B0\u09CB\u09AB\u09BE\u0987\u09B2 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/public/groups", async (req, res) => {
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
    let groups = ["\u09A8\u099C\u09B0\u09C1\u09B2 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u0989\u09AA\u09A8\u09CD\u09AF\u09BE\u09B8", "\u0997\u09B2\u09CD\u09AA"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      groups = val || groups;
    }
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ error: "\u0997\u09CD\u09B0\u09C1\u09AA \u09B8\u09AE\u09C2\u09B9 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/public/payment-methods", async (req, res) => {
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'paymentMethods'");
    let paymentMethods = [];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      paymentMethods = val || [];
    }
    res.json({ success: true, paymentMethods });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AE\u09BE\u09A7\u09CD\u09AF\u09AE\u09B8\u09AE\u09C2\u09B9 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/payment-methods", authenticateAdmin, async (req, res) => {
  try {
    const { paymentMethods } = req.body;
    if (!Array.isArray(paymentMethods)) {
      return res.status(400).json({ error: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AE\u09C7\u09A5\u09A1 \u09B2\u09BF\u09B8\u09CD\u099F \u0985\u09AC\u09B6\u09CD\u09AF\u0987 \u098F\u0995\u099F\u09BF \u0985\u09CD\u09AF\u09BE\u09B0\u09C7 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964" });
    }
    const formattedMethods = paymentMethods.map((pm, idx) => ({
      id: pm.id || `pm-${Date.now()}-${idx}`,
      name: (pm.name || "").trim(),
      type: (pm.type || "Personal").trim(),
      number: (pm.number || "").trim()
    })).filter((pm) => pm.name && pm.number);
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["paymentMethods", JSON.stringify(formattedMethods)]
    );
    addLog("\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09B8\u09C7\u099F\u09BF\u0982", "\u09B8\u09A6\u09B8\u09CD\u09AF \u09AE\u09C7\u09AE\u09CD\u09AC\u09BE\u09B0\u09B6\u09BF\u09AA \u09AB\u09BF \u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AE\u09C7\u09A5\u09A1 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964");
    res.json({ success: true, paymentMethods: formattedMethods });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09C7\u09AE\u09C7\u09A8\u09CD\u099F \u09AE\u09C7\u09A5\u09A1 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/settings/groups", authenticateAdmin, async (req, res) => {
  try {
    const { groupName } = req.body;
    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ error: "\u0997\u09CD\u09B0\u09C1\u09AA\u09C7\u09B0 \u09A8\u09BE\u09AE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
    let currentGroups = ["\u09A8\u099C\u09B0\u09C1\u09B2 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u0989\u09AA\u09A8\u09CD\u09AF\u09BE\u09B8", "\u0997\u09B2\u09CD\u09AA"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      currentGroups = val || currentGroups;
    }
    const trimmedName = groupName.trim();
    if (currentGroups.some((g) => g.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({ error: "\u098F\u0987 \u0997\u09CD\u09B0\u09C1\u09AA\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09AC\u09BF\u09A6\u09CD\u09AF\u09AE\u09BE\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    currentGroups.push(trimmedName);
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["groups", JSON.stringify(currentGroups)]
    );
    addLog("\u0997\u09CD\u09B0\u09C1\u09AA \u09AF\u09CB\u0997", `\u09A8\u09A4\u09C1\u09A8 \u09AC\u0987\u09DF\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA '${trimmedName}' \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, groups: currentGroups });
  } catch (err) {
    res.status(500).json({ error: "\u0997\u09CD\u09B0\u09C1\u09AA \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.delete("/api/settings/groups/:groupName", authenticateAdmin, async (req, res) => {
  try {
    const { groupName } = req.params;
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'groups'");
    let currentGroups = ["\u09A8\u099C\u09B0\u09C1\u09B2 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u09B0\u09AC\u09C0\u09A8\u09CD\u09A6\u09CD\u09B0\u09A8\u09BE\u09A5 \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", "\u0989\u09AA\u09A8\u09CD\u09AF\u09BE\u09B8", "\u0997\u09B2\u09CD\u09AA"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      currentGroups = val || currentGroups;
    }
    currentGroups = currentGroups.filter((g) => g.toLowerCase() !== groupName.toLowerCase());
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["groups", JSON.stringify(currentGroups)]
    );
    addLog("\u0997\u09CD\u09B0\u09C1\u09AA \u09A1\u09BF\u09B2\u09BF\u099F", `\u09AC\u0987\u09DF\u09C7\u09B0 \u0997\u09CD\u09B0\u09C1\u09AA '${groupName}' \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, groups: currentGroups });
  } catch (err) {
    res.status(500).json({ error: "\u0997\u09CD\u09B0\u09C1\u09AA \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/public/stats", async (req, res) => {
  try {
    const [bookRows] = await db_default.query("SELECT status, COUNT(*) as count FROM books GROUP BY status");
    let totalBooks = 0;
    let issuedBooks = 0;
    let availableBooks = 0;
    bookRows.forEach((r) => {
      totalBooks += r.count;
      if (r.status === "Issued") issuedBooks += r.count;
      else if (r.status === "Available") availableBooks += r.count;
    });
    const [memberRows] = await db_default.query("SELECT COUNT(*) as count FROM members");
    const activeMembers = memberRows[0]?.count || 0;
    const [cornerRows] = await db_default.query("SELECT COUNT(DISTINCT group_name) as count FROM books WHERE group_name IS NOT NULL AND group_name != ''");
    const activeCorners = cornerRows[0]?.count || 0;
    const startYear = 2021;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const yearsRunning = Math.max(1, currentYear - startYear);
    res.json({ success: true, totalBooks, issuedBooks, availableBooks, activeMembers, activeCorners, yearsRunning });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09B0\u09BF\u09B8\u0982\u0996\u09CD\u09AF\u09BE\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/public/books", async (req, res) => {
  try {
    const { q, status, group } = req.query;
    let query = "SELECT * FROM books WHERE 1=1";
    const params = [];
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
    const [rows] = await db_default.query(query, params);
    const books = rows.map((r) => ({
      id: String(r.id),
      code: r.code,
      name: r.name,
      author: r.author,
      publisher: r.publisher,
      imageUrl: r.image_url,
      status: r.status,
      group: r.group_name,
      description: r.description,
      pageCount: r.page_count,
      price: r.price
    }));
    res.json({ success: true, books });
  } catch (err) {
    res.status(500).json({ error: "\u09AC\u0987\u09DF\u09C7\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/public/corners", async (req, res) => {
  try {
    const [groupRows] = await db_default.query(
      `SELECT group_name, COUNT(*) as book_count 
         FROM books 
         WHERE group_name IS NOT NULL AND group_name != '' 
         GROUP BY group_name 
         ORDER BY book_count DESC`
    );
    const corners = [];
    for (const row of groupRows) {
      const [topBooks] = await db_default.query(
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
        topBooks: topBooks.map((b) => ({
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
  } catch (err) {
    console.error("GET /api/public/corners error:", err);
    res.status(500).json({ error: "\u0995\u09B0\u09CD\u09A8\u09BE\u09B0 \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
  }
});
app.post("/api/public/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "\u09A8\u09BE\u09AE, \u0987\u09AE\u09C7\u0987\u09B2 \u098F\u09AC\u0982 \u09AC\u09BE\u09B0\u09CD\u09A4\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [resInsert] = await db_default.query(
      "INSERT INTO contact_submissions (name, email, phone, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [name.trim(), email.trim(), (phone || "").trim(), (subject || "").trim(), message.trim(), formatCurrentDateTime()]
    );
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      const htmlContent = `
          <h2>\u09A8\u09A4\u09C1\u09A8 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u09AB\u09B0\u09AE \u09B8\u09BE\u09AC\u09AE\u09BF\u09B6\u09A8</h2>
          <p><strong>\u09A8\u09BE\u09AE:</strong> ${name}</p>
          <p><strong>\u0987\u09AE\u09C7\u0987\u09B2:</strong> ${email}</p>
          <p><strong>\u09AB\u09CB\u09A8:</strong> ${phone || "\u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF"}</p>
          <p><strong>\u09AC\u09BF\u09B7\u09DF:</strong> ${subject || "\u09A8\u09C7\u0987"}</p>
          <p><strong>\u09AC\u09BE\u09B0\u09CD\u09A4\u09BE:</strong><br/> ${message.replace(/\n/g, "<br/>")}</p>
        `;
      try {
        const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            sender: { name: "\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0", email: "hello@okkhorpathagar.com" },
            to: [{ email: "okkhorpathagar@gmail.com", name: "Admin" }],
            subject: "\u09A8\u09A4\u09C1\u09A8 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u09AB\u09B0\u09AE \u09B8\u09BE\u09AC\u09AE\u09BF\u09B6\u09A8 - " + (subject || "No Subject"),
            htmlContent
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
  } catch (err) {
    console.error("POST /api/public/contact error:", err);
    res.status(500).json({ error: "\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF \u099C\u09AE\u09BE \u09A6\u09BF\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/public/wishlist", async (req, res) => {
  try {
    const { name, author, publisher, memberFormNumber } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "\u09AC\u0987\u09DF\u09C7\u09B0 \u09A8\u09BE\u09AE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [bookRows] = await db_default.query("SELECT id FROM books WHERE LOWER(name) = ?", [name.trim().toLowerCase()]);
    const isAvailable = bookRows.length > 0;
    const [resInsert] = await db_default.query(
      "INSERT INTO wishlist (name, author, publisher, member_form_number, created_at, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name.trim(), (author || "").trim() || "\u0985\u099C\u09CD\u099E\u09BE\u09A4", (publisher || "").trim() || "\u0985\u099C\u09CD\u099E\u09BE\u09A4", memberFormNumber || "", formatCurrentDateTime(), isAvailable ? "Available" : "Waiting"]
    );
    const newItem = {
      id: String(resInsert.insertId),
      name: name.trim(),
      author: (author || "").trim() || "\u0985\u099C\u09CD\u099E\u09BE\u09A4",
      publisher: (publisher || "").trim() || "\u0985\u099C\u09CD\u099E\u09BE\u09A4",
      createdAt: formatCurrentDateTime(),
      memberFormNumber: memberFormNumber || "",
      status: isAvailable ? "Available" : "Waiting"
    };
    addLog("\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F \u09AF\u09CB\u0997", `\u09B8\u09A6\u09B8\u09CD\u09AF ${memberFormNumber || "\u0997\u09CB\u09AA\u09A8"} \u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AC\u0987 '${name}' \u09AF\u09CB\u0997 \u0995\u09B0\u09C7\u099B\u09C7\u09A8\u0964`);
    res.status(201).json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ error: "\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F\u09C7 \u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/public/wishlist", async (req, res) => {
  try {
    const { memberFormNumber } = req.query;
    let query = "SELECT * FROM wishlist";
    const params = [];
    if (memberFormNumber) {
      query += " WHERE member_form_number = ?";
      params.push(memberFormNumber.toString());
    }
    query += " ORDER BY id DESC";
    const [rows] = await db_default.query(query, params);
    const resolvedList = [];
    for (const item of rows) {
      const [bookRows] = await db_default.query("SELECT id FROM books WHERE LOWER(name) = ?", [item.name.trim().toLowerCase()]);
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
  } catch (err) {
    res.status(500).json({ error: "\u0989\u0987\u09B6\u09B2\u09BF\u09B8\u09CD\u099F \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/public/leaderboard/books", async (req, res) => {
  try {
    const [rows] = await db_default.query(
      `SELECT b.id, b.code, b.name, b.author, b.image_url, b.group_name, COUNT(i.id) as count
         FROM issues i
         JOIN books b ON i.book_id = b.id
         GROUP BY b.id, b.code, b.name, b.author, b.image_url, b.group_name
         ORDER BY count DESC
         LIMIT 10`
    );
    const list = rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      author: r.author || "\u0985\u099C\u09CD\u099E\u09BE\u09A4",
      imageUrl: r.image_url || "",
      group: r.group_name || "",
      count: r.count,
      issueCount: r.count
    }));
    res.json({ success: true, leaderboard: list });
  } catch (err) {
    res.status(500).json({ error: "\u09AC\u0987 \u09B2\u09BF\u09A1\u09BE\u09B0\u09AC\u09CB\u09B0\u09CD\u09A1 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
  }
});
app.get("/api/admin/notifications", authenticateAdmin, async (req, res) => {
  try {
    const todayStr = getBangladeshDateString();
    const [rows] = await db_default.query(
      `SELECT i.id, i.return_date, b.name as book_name, b.code as book_code, m.name as member_name, m.form_number, m.mobile
         FROM issues i
         JOIN books b ON i.book_id = b.id
         JOIN members m ON i.member_id = m.id
         WHERE i.status = 'Issued' AND DATE(i.return_date) = ?`,
      [todayStr]
    );
    const dueTodayList = rows.map((r) => ({
      issueId: String(r.id),
      bookName: r.book_name,
      bookCode: r.book_code,
      memberName: r.member_name,
      formNumber: r.form_number,
      mobile: r.mobile,
      returnDate: r.return_date
    }));
    res.json({ success: true, count: dueTodayList.length, dueToday: dueTodayList });
  } catch (err) {
    console.error("GET /api/admin/notifications error:", err);
    res.status(500).json({ error: "\u09A8\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/admin/leaderboard/members", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query(
      "SELECT form_number, member_name, mobile, COUNT(*) as count FROM issues GROUP BY form_number, member_name, mobile ORDER BY count DESC"
    );
    const list = rows.map((r) => ({
      formNumber: r.form_number,
      name: r.member_name,
      mobile: r.mobile,
      count: r.count
    }));
    res.json({ success: true, leaderboard: list });
  } catch (err) {
    res.status(500).json({ error: "\u09B8\u09A6\u09B8\u09CD\u09AF \u09B2\u09BF\u09A1\u09BE\u09B0\u09AC\u09CB\u09B0\u09CD\u09A1 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/public/shop/items", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM shop_items ORDER BY id DESC");
    const shopItems = rows.map((r) => ({
      id: String(r.id),
      name: r.name,
      description: r.description,
      price: r.price,
      imageUrl: r.image_url,
      category: r.category,
      createdAt: r.created_at
    }));
    res.json({ success: true, shopItems });
  } catch (err) {
    res.status(500).json({ error: "\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0 \u09B8\u09BE\u09AE\u0997\u09CD\u09B0\u09C0 \u09B2\u09CB\u09A1 \u0995\u09B0\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
  }
});
app.get("/api/public/shop/categories", async (req, res) => {
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
    let categories = ["\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", "\u09AA\u09CD\u09AF\u09BE\u09A1", "\u09AC\u0987", "\u09AE\u0997", "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      categories = val || categories;
    }
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ error: "\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/public/shop/helpline", async (req, res) => {
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'shopHelpline'");
    let helpline = {
      number: "\u09E6\u09E7\u09E9\u09E9\u09E9\u09EA\u09ED\u09EE\u09EA\u09EA\u09EE",
      text: "\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0\u09C7\u09B0 \u09AF\u09C7\u0995\u09CB\u09A8\u09CB \u09AA\u09A3\u09CD\u09AF \u09B8\u0982\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09A4\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8 \u0985\u09A5\u09AC\u09BE \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0985\u0995\u09CD\u09B7\u09B0 \u09B2\u09BE\u0987\u09AC\u09CD\u09B0\u09C7\u09B0\u09BF\u09B0 \u0995\u09BE\u0989\u09A8\u09CD\u099F\u09BE\u09B0\u09C7 \u09AD\u09BF\u099C\u09BF\u099F \u0995\u09B0\u09C7 \u09B8\u0982\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964"
    };
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      helpline = val || helpline;
    }
    res.json({ success: true, helpline });
  } catch (err) {
    res.status(500).json({ error: "\u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u09A4\u09A5\u09CD\u09AF \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/shop/helpline", authenticateAdmin, async (req, res) => {
  try {
    const { number, text } = req.body;
    if (!number || !number.trim() || !text || !text.trim()) {
      return res.status(400).json({ error: "\u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0 \u098F\u09AC\u0982 \u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09BE\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09BF\u0995\u09BE \u09B2\u09BF\u0996\u09C1\u09A8\u0964" });
    }
    const newHelpline = {
      number: number.trim(),
      text: text.trim()
    };
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["shopHelpline", JSON.stringify(newHelpline)]
    );
    addLog("\u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u0986\u09AA\u09A1\u09C7\u099F", `\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0\u09C7\u09B0 \u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09A8\u09BE\u09AE\u09CD\u09AC\u09BE\u09B0: ${number.trim()}`);
    res.json({ success: true, helpline: newHelpline });
  } catch (err) {
    res.status(500).json({ error: "\u09B9\u09C7\u09B2\u09CD\u09AA\u09B2\u09BE\u0987\u09A8 \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u0987\u099C\u09C7\u09B6\u09A8 \u09B8\u09C7\u09AD \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/shop/categories", authenticateAdmin, async (req, res) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ error: "\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF\u09B0 \u09A8\u09BE\u09AE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u0964" });
    }
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
    let currentCategories = ["\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", "\u09AA\u09CD\u09AF\u09BE\u09A1", "\u09AC\u0987", "\u09AE\u0997", "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      currentCategories = val || currentCategories;
    }
    const trimmedName = categoryName.trim();
    if (currentCategories.some((c) => c.toLowerCase() === trimmedName.toLowerCase())) {
      return res.status(400).json({ error: "\u098F\u0987 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AC\u09BE \u0997\u09CD\u09B0\u09C1\u09AA\u099F\u09BF \u0987\u09A4\u09BF\u09AE\u09A7\u09CD\u09AF\u09C7 \u09AC\u09BF\u09A6\u09CD\u09AF\u09AE\u09BE\u09A8 \u09B0\u09DF\u09C7\u099B\u09C7\u0964" });
    }
    currentCategories.push(trimmedName);
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["shopCategories", JSON.stringify(currentCategories)]
    );
    addLog("\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AF\u09CB\u0997", `\u09A8\u09A4\u09C1\u09A8 \u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF '${trimmedName}' \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, categories: currentCategories });
  } catch (err) {
    res.status(500).json({ error: "\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.delete("/api/settings/shop/categories/:categoryName", authenticateAdmin, async (req, res) => {
  try {
    const { categoryName } = req.params;
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'shopCategories'");
    let currentCategories = ["\u099F\u09BF-\u09B6\u09BE\u09B0\u09CD\u099F", "\u09AA\u09CD\u09AF\u09BE\u09A1", "\u09AC\u0987", "\u09AE\u0997", "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF"];
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      currentCategories = val || currentCategories;
    }
    currentCategories = currentCategories.filter((c) => c.toLowerCase() !== categoryName.toLowerCase());
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["shopCategories", JSON.stringify(currentCategories)]
    );
    addLog("\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A1\u09BF\u09B2\u09BF\u099F", `\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF '${categoryName}' \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, categories: currentCategories });
  } catch (err) {
    res.status(500).json({ error: "\u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09A1\u09BF\u09B2\u09BF\u099F \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/admin/shop/items", authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: "\u09A8\u09BE\u09AE, \u09AE\u09C2\u09B2\u09CD\u09AF \u098F\u09AC\u0982 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995!" });
    }
    const [resInsert] = await db_default.query(
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
    addLog("\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", `\u09A8\u09A4\u09C1\u09A8 \u09AA\u09A3\u09CD\u09AF '${newItem.name}' \u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AE\u09C2\u09B2\u09CD\u09AF: ${newItem.price} \u099F\u09BE\u0995\u09BE`);
    res.json({ success: true, item: newItem });
  } catch (err) {
    res.status(500).json({ error: "\u09A8\u09A4\u09C1\u09A8 \u09AA\u09A3\u09CD\u09AF \u09AF\u09CB\u0997 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.put("/api/admin/shop/items/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: "\u09A8\u09BE\u09AE, \u09AE\u09C2\u09B2\u09CD\u09AF \u098F\u09AC\u0982 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09BE \u0986\u09AC\u09B6\u09CD\u09AF\u0995!" });
    }
    await db_default.query(
      "UPDATE shop_items SET name = ?, description = ?, price = ?, category = ?, image_url = ? WHERE id = ?",
      [name.trim(), (description || "").trim(), Number(price), category.trim(), imageUrl || "", id]
    );
    addLog("\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", `\u09AA\u09A3\u09CD\u09AF '${name.trim()}' \u098F\u09B0 \u09A4\u09A5\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09A3\u09CD\u09AF\u09C7\u09B0 \u09A4\u09A5\u09CD\u09AF \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.delete("/api/admin/shop/items/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT name FROM shop_items WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "\u09AA\u09A3\u09CD\u09AF\u099F\u09BF \u0996\u09C1\u0981\u099C\u09C7 \u09AA\u09BE\u0993\u09DF\u09BE \u09AF\u09BE\u09DF\u09A8\u09BF\u0964" });
    }
    await db_default.query("DELETE FROM shop_items WHERE id = ?", [id]);
    addLog("\u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u0995\u09B0\u09CD\u09A8\u09BE\u09B0", `'${rows[0].name}' \u09AA\u09A3\u09CD\u09AF\u099F\u09BF \u09AC\u09BF\u0995\u09CD\u09B0\u09DF \u09A4\u09BE\u09B2\u09BF\u0995\u09BE \u09A5\u09C7\u0995\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, message: "\u09AA\u09A3\u09CD\u09AF\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09A3\u09CD\u09AF\u099F\u09BF \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.get("/api/public/settings/login-flow", async (req, res) => {
  try {
    const [settingsRows] = await db_default.query("SELECT setting_value FROM settings WHERE setting_key = 'isCustomLoginFlowEnabled'");
    let isCustomLoginFlowEnabled = false;
    if (settingsRows.length > 0) {
      const val = typeof settingsRows[0].setting_value === "string" ? JSON.parse(settingsRows[0].setting_value) : settingsRows[0].setting_value;
      isCustomLoginFlowEnabled = !!val;
    }
    res.json({ success: true, isCustomLoginFlowEnabled });
  } catch (err) {
    res.status(500).json({ error: "\u09B2\u0997\u0987\u09A8 \u09AB\u09CD\u09B2\u09CB \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/login-flow", authenticateAdmin, async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const isCustomLoginFlowEnabled = !!isEnabled;
    await db_default.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      ["isCustomLoginFlowEnabled", JSON.stringify(isCustomLoginFlowEnabled)]
    );
    addLog("\u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8", `\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B2\u0997\u0987\u09A8 \u09AB\u09CD\u09B2\u09CB ${isEnabled ? "\u09B8\u0995\u09CD\u09B0\u09BF\u09DF" : "\u09A8\u09BF\u09B7\u09CD\u0995\u09CD\u09B0\u09BF\u09DF"} \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true, isCustomLoginFlowEnabled });
  } catch (err) {
    res.status(500).json({ error: "\u0995\u09BE\u09B8\u09CD\u099F\u09AE \u09B2\u0997\u0987\u09A8 \u09AB\u09CD\u09B2\u09CB \u09B8\u09C7\u099F\u09BF\u0982\u09B8 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/bulk-raw", authenticateAdmin, async (req, res) => {
  try {
    const [books] = await db_default.query("SELECT * FROM books");
    const [members] = await db_default.query("SELECT * FROM members");
    const [issues] = await db_default.query("SELECT * FROM issues");
    const [auditLogs] = await db_default.query("SELECT * FROM audit_logs");
    res.json({ books, members, issues, auditLogs });
  } catch (error) {
    res.status(500).json({ error: "\u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/settings/maintenance/clear-temp", authenticateAdmin, async (req, res) => {
  try {
    const tmpDir = import_path2.default.join(__dirname, "uploads", "tmp");
    let count = 0;
    if (import_fs2.default.existsSync(tmpDir)) {
      const files = import_fs2.default.readdirSync(tmpDir);
      for (const file of files) {
        import_fs2.default.unlinkSync(import_path2.default.join(tmpDir, file));
        count++;
      }
    }
    res.json({ success: true, count, message: `${count}\u099F\u09BF \u099F\u09C7\u09AE\u09CD\u09AA\u09CB\u09B0\u09BE\u09B0\u09BF \u09AB\u09BE\u0987\u09B2 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u099F\u09C7\u09AE\u09CD\u09AA \u09AB\u09BE\u0987\u09B2 \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/settings/maintenance/clean-audit-logs", authenticateAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const formattedDate = thirtyDaysAgo.toISOString().slice(0, 19).replace("T", " ");
    if (action === "preview") {
      const [rows] = await db_default.query("SELECT COUNT(*) as count FROM audit_logs WHERE timestamp < ?", [formattedDate]);
      const count = rows[0].count;
      res.json({ success: true, count });
    } else if (action === "delete") {
      const [result] = await db_default.query("DELETE FROM audit_logs WHERE timestamp < ?", [formattedDate]);
      const count = result.affectedRows || 0;
      addLog("\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09AE\u09C7\u0987\u09A8\u099F\u09C7\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09B8", `${count}\u099F\u09BF \u09AA\u09C1\u09B0\u09A8\u09CB \u0985\u09A1\u09BF\u099F \u09B2\u0997 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
      res.json({ success: true, count, message: `${count}\u099F\u09BF \u09AA\u09C1\u09B0\u09A8\u09CB \u09B2\u0997 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964` });
    } else {
      res.status(400).json({ error: "\u0985\u09CD\u09AF\u09BE\u0995\u09B6\u09A8 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BF\u09B7\u09CD\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09A8\u09BF\u0964" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "\u0985\u09A1\u09BF\u099F \u09B2\u0997 \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/public/newsletter-subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) {
      return res.status(400).json({ error: "\u09B8\u09A0\u09BF\u0995 \u0987\u09AE\u09C7\u0987\u09B2 \u09A0\u09BF\u0995\u09BE\u09A8\u09BE \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("BREVO_API_KEY is not configured.");
      return res.json({ success: true, message: "\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u0987\u09AC \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6!" });
    }
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        listIds: [3],
        updateEnabled: true
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.warn("Brevo API warning:", errorData);
    }
    res.json({ success: true, message: "\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u0987\u09AC \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6!" });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    res.json({ success: true, message: "\u09B8\u09BE\u09AC\u09B8\u09CD\u0995\u09CD\u09B0\u09BE\u0987\u09AC \u0995\u09B0\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6!" });
  }
});
app.post("/api/admin/newsletter-send", authenticateAdmin, async (req, res) => {
  try {
    const { subject, body } = req.body;
    if (!subject || !body) {
      return res.status(400).json({ error: "\u09AC\u09BF\u09B7\u09DF \u098F\u09AC\u0982 \u09AE\u09C7\u09B8\u09C7\u099C \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Brevo API Key \u0995\u09A8\u09AB\u09BF\u0997\u09BE\u09B0 \u0995\u09B0\u09BE \u09A8\u09C7\u0987\u0964" });
    }
    const campaignRes = await fetch("https://api.brevo.com/v3/emailCampaigns", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Newsletter " + (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        subject,
        sender: { name: "\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0", email: "hello@okkhorpathagar.com" },
        type: "classic",
        htmlContent: `<html><body>${body.replace(/\n/g, "<br/>")}</body></html>`,
        recipients: { listIds: [3] }
      })
    });
    if (!campaignRes.ok) {
      const errorData = await campaignRes.json();
      console.error("Brevo Create Campaign Error:", errorData);
      return res.status(500).json({ error: "\u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8 \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: " + (errorData.message || "Unknown error") });
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
      return res.status(500).json({ error: "\u0995\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09C7\u0987\u09A8 \u09B8\u09C7\u09A8\u09CD\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5: " + (sendErrorData.message || "Unknown error") });
    }
    addLog("\u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0", `\u098F\u0995\u099F\u09BF \u09A8\u09A4\u09C1\u09A8 \u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AC\u09BF\u09B7\u09DF: ${subject}`);
    res.json({ success: true, message: "\u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09AA\u09BE\u09A0\u09BE\u09A8\u09CB \u09B9\u09DF\u09C7\u099B\u09C7!" });
  } catch (err) {
    console.error("Newsletter send error:", err);
    res.status(500).json({ error: "\u09A8\u09BF\u0989\u099C\u09B2\u09C7\u099F\u09BE\u09B0 \u09AA\u09BE\u09A0\u09BE\u09A4\u09C7 \u09B8\u09AE\u09B8\u09CD\u09AF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964" });
  }
});
app.post("/api/reviews", async (req, res) => {
  try {
    const { memberFormNumber, memberName, subject, content, rating } = req.body;
    if (!memberFormNumber || !memberName || !subject || !content) {
      return res.status(400).json({ error: "\u09B8\u09AC \u09A4\u09A5\u09CD\u09AF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const [resInsert] = await db_default.query(
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
      createdAt: formatCurrentDateTime()
    };
    addLog("\u09B0\u09BF\u09AD\u09BF\u0989 \u099C\u09AE\u09BE", `\u09B8\u09A6\u09B8\u09CD\u09AF ${memberName} (\u09AB\u09B0\u09AE: ${memberFormNumber}) \u09B0\u09BF\u09AD\u09BF\u0989 \u099C\u09AE\u09BE \u09A6\u09BF\u09AF\u09BC\u09C7\u099B\u09C7\u09A8: "${subject}"`);
    res.json({ success: true, review: newReview });
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u099C\u09AE\u09BE \u09A6\u09BF\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/reviews", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM reviews ORDER BY id DESC");
    const reviews = rows.map((r) => ({
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
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.put("/api/reviews/:id/approve", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
    await db_default.query("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?", ["approved", formatCurrentDateTime(), id]);
    addLog("\u09B0\u09BF\u09AD\u09BF\u0989 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8", `\u09B0\u09BF\u09AD\u09BF\u0989 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7: "${rows[0].subject}" \u2014 ${rows[0].member_name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.put("/api/reviews/:id/reject", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
    await db_default.query("UPDATE reviews SET status = ?, reviewed_at = ? WHERE id = ?", ["rejected", formatCurrentDateTime(), id]);
    addLog("\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8", `\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7: "${rows[0].subject}" \u2014 ${rows[0].member_name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09BE\u0996\u09CD\u09AF\u09BE\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.delete("/api/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT subject, member_name FROM reviews WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
    await db_default.query("DELETE FROM reviews WHERE id = ?", [id]);
    addLog("\u09B0\u09BF\u09AD\u09BF\u0989 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09B0\u09BF\u09AD\u09BF\u0989 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7: "${rows[0].subject}" \u2014 ${rows[0].member_name}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/public/reviews", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY id DESC");
    const approved = rows.map((r) => ({
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
  } catch (err) {
    res.status(500).json({ error: "\u09B0\u09BF\u09AD\u09BF\u0989 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/notices", authenticateAdmin, async (req, res) => {
  try {
    const { subject, content, image } = req.body;
    if (!subject || !content) {
      return res.status(400).json({ error: "\u09AC\u09BF\u09B7\u09AF\u09BC \u098F\u09AC\u0982 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u0989\u09AD\u09AF\u09BC\u0987 \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const [resInsert] = await db_default.query(
      "INSERT INTO notices (subject, content, image, created_at) VALUES (?, ?, ?, ?)",
      [subject, content, image || null, formatCurrentDateTime()]
    );
    const newNotice = {
      id: String(resInsert.insertId),
      subject,
      content,
      image: image || null,
      createdAt: formatCurrentDateTime()
    };
    addLog("\u09A8\u09CB\u099F\u09BF\u09B6 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6", `\u09A8\u09A4\u09C1\u09A8 \u09A8\u09CB\u099F\u09BF\u09B6 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09BF\u09A4: "${subject}"`);
    res.json({ success: true, notice: newNotice });
  } catch (err) {
    res.status(500).json({ error: "\u09A8\u09CB\u099F\u09BF\u09B6 \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/notices", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM notices ORDER BY id DESC");
    const notices = rows.map((r) => ({
      id: String(r.id),
      subject: r.subject,
      content: r.content,
      image: r.image || null,
      createdAt: r.created_at
    }));
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "\u09A8\u09CB\u099F\u09BF\u09B6 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.delete("/api/notices/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT subject FROM notices WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "\u09A8\u09CB\u099F\u09BF\u09B6 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
    await db_default.query("DELETE FROM notices WHERE id = ?", [id]);
    addLog("\u09A8\u09CB\u099F\u09BF\u09B6 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09A8\u09CB\u099F\u09BF\u09B6 \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7: "${rows[0].subject}"`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09A8\u09CB\u099F\u09BF\u09B6 \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/public/notices", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM notices ORDER BY id DESC");
    const notices = rows.map((r) => ({
      id: String(r.id),
      subject: r.subject,
      content: r.content,
      image: r.image || null,
      createdAt: r.created_at
    }));
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "\u09A8\u09CB\u099F\u09BF\u09B6 \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.post("/api/blog_posts", authenticateAdmin, async (req, res) => {
  try {
    const { title, content, image, category, eventDate } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: "\u09B6\u09BF\u09B0\u09CB\u09A8\u09BE\u09AE, \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4 \u098F\u09AC\u0982 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u0997\u09B0\u09BF \u09AA\u09C2\u09B0\u09A3 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const [resInsert] = await db_default.query(
      "INSERT INTO blog_posts (title, content, image, category, event_date, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [title, content, image || null, category, eventDate || null, formatCurrentDateTime()]
    );
    const newPost = {
      id: String(resInsert.insertId),
      title,
      content,
      image: image || null,
      category,
      eventDate: eventDate || null,
      createdAt: formatCurrentDateTime()
    };
    addLog("\u09B8\u0982\u09AC\u09BE\u09A6/\u0987\u09AD\u09C7\u09A8\u09CD\u099F \u09AA\u09CD\u09B0\u0995\u09BE\u09B6", `\u09A8\u09A4\u09C1\u09A8 ${category} \u09AA\u09CD\u09B0\u0995\u09BE\u09B6\u09BF\u09A4: "${title}"`);
    res.json({ success: true, post: newPost });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09CD\u09B0\u0995\u09BE\u09B6 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/blog_posts", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM blog_posts ORDER BY id DESC");
    const posts = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      content: r.content,
      image: r.image || null,
      category: r.category,
      eventDate: r.event_date || null,
      createdAt: r.created_at
    }));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09CB\u09B8\u09CD\u099F \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.delete("/api/blog_posts/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db_default.query("SELECT title FROM blog_posts WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "\u09AA\u09CB\u09B8\u09CD\u099F \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964" });
    await db_default.query("DELETE FROM blog_posts WHERE id = ?", [id]);
    addLog("\u09B8\u0982\u09AC\u09BE\u09A6/\u0987\u09AD\u09C7\u09A8\u09CD\u099F \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE", `\u09AA\u09CB\u09B8\u09CD\u099F \u09AE\u09C1\u099B\u09C7 \u09AB\u09C7\u09B2\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7: "${rows[0].title}"`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09AA\u09CB\u09B8\u09CD\u099F \u09AE\u09C1\u099B\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
var DEFAULT_SERVER_BLOG_POSTS = [
  {
    id: "1",
    slug: "digital-age-book-reading-habits-guide",
    title: "\u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AF\u09C1\u0997\u09C7 \u09AC\u0987 \u09AA\u09DC\u09BE\u09B0 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC \u0993 \u09AA\u09BE\u09A0\u09BE\u09AD\u09CD\u09AF\u09BE\u09B8 \u0997\u09DC\u09C7 \u09A4\u09CB\u09B2\u09BE\u09B0 \u09EB\u099F\u09BF \u09B8\u09B9\u099C \u0989\u09AA\u09BE\u09DF",
    category: "blog",
    eventDate: null,
    createdAt: "2026-02-28T10:00:00Z",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    content: "\u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u09A4\u09A5\u09CD\u09AF\u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09AF\u09C1\u0997\u09C7 \u0986\u09AE\u09B0\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 \u0985\u099C\u09B8\u09CD\u09B0 \u09A4\u09A5\u09CD\u09AF, \u09B6\u09B0\u09CD\u099F \u09AD\u09BF\u09A1\u09BF\u0993 \u098F\u09AC\u0982 \u09B8\u09CB\u09B6\u09CD\u09AF\u09BE\u09B2 \u09AE\u09BF\u09A1\u09BF\u09DF\u09BE\u09B0 \u09A8\u09CB\u099F\u09BF\u09AB\u09BF\u0995\u09C7\u09B6\u09A8\u09C7\u09B0 \u09AC\u09A8\u09CD\u09AF\u09BE\u09DF \u09AD\u09C7\u09B8\u09C7 \u09AF\u09BE\u099A\u09CD\u099B\u09BF\u0964 \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u0997\u09AC\u09C7\u09B7\u0995\u09C7\u09B0\u09BE \u09AC\u09B2\u099B\u09C7\u09A8, \u09B8\u09CD\u0995\u09CD\u09B0\u09BF\u09A8\u09C7\u09B0 \u09A6\u09CD\u09B0\u09C1\u09A4\u0997\u09A4\u09BF\u09B0 \u0995\u09A8\u099F\u09C7\u09A8\u09CD\u099F \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995 \u0989\u09A4\u09CD\u09A4\u09C7\u099C\u09A8\u09BE \u09A6\u09BF\u09B2\u09C7\u0993 \u09A4\u09BE \u09A7\u09C0\u09B0\u09C7 \u09A7\u09C0\u09B0\u09C7 \u09AE\u09A8\u09CB\u09AF\u09CB\u0997\u09C7\u09B0 \u09AA\u09B0\u09BF\u09A7\u09BF \u0993 \u0997\u09AD\u09C0\u09B0 \u099A\u09BF\u09A8\u09CD\u09A4\u09BE\u09B6\u0995\u09CD\u09A4\u09BF\u0995\u09C7 \u09A8\u09B7\u09CD\u099F \u0995\u09B0\u09C7 \u09A6\u09BF\u099A\u09CD\u099B\u09C7\u0964 \u098F\u0987 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09A4\u09BE\u09DF \u09AE\u09C1\u09A6\u09CD\u09B0\u09BF\u09A4 \u09AC\u09BE \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AC\u0987 \u09AA\u09DC\u09BE\u09B0 \u0985\u09AD\u09CD\u09AF\u09BE\u09B8 \u098F\u0995\u099C\u09A8 \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AA\u09B0\u09AE \u0986\u09B6\u09CD\u09B0\u09DF\u09C7\u09B0 \u09AE\u09A4\u09CB\u0964"
  },
  {
    id: "2",
    slug: "five-years-of-akkhor-pathagar-journey-impact",
    title: "\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u09C7\u09B0 \u09EB \u09AC\u099B\u09B0: \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AC\u099E\u09CD\u099A\u09BF\u09A4 \u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u09AE\u09BE\u099D\u09C7 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0 \u0986\u09B2\u09CB \u099B\u09DC\u09BE\u09A8\u09CB\u09B0 \u0997\u09B2\u09CD\u09AA",
    category: "news",
    eventDate: null,
    createdAt: "2026-02-15T09:30:00Z",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    content: "\u09E8\u09E6\u09E8\u09E7 \u09B8\u09BE\u09B2\u09C7\u09B0 \u098F\u0995 \u09AC\u09BF\u0995\u09C7\u09B2\u09C7 \u09AC\u09B0\u0997\u09C1\u09A8\u09BE\u09B0 \u09AA\u09B6\u09CD\u099A\u09BF\u09AE \u0995\u09B2\u09C7\u099C \u09B0\u09CB\u09A1\u09C7\u09B0 \u098F\u0995\u099F\u09BF \u099B\u09CB\u099F \u09AD\u09BE\u09DC\u09BE \u0995\u0995\u09CD\u09B7\u09C7 \u09AE\u09BE\u09A4\u09CD\u09B0 \u0985\u09B0\u09CD\u09A7\u09B6\u09A4 \u09AC\u0987 \u0986\u09B0 \u0995\u09DF\u09C7\u0995\u099C\u09A8 \u09B8\u09CD\u09AC\u09AA\u09CD\u09A8\u09AC\u09BE\u099C \u09A4\u09B0\u09C1\u09A3\u09C7\u09B0 \u09B9\u09BE\u09A4 \u09A7\u09B0\u09C7 \u09AF\u09BE\u09A4\u09CD\u09B0\u09BE \u09B6\u09C1\u09B0\u09C1 \u09B9\u09DF\u09C7\u099B\u09BF\u09B2 '\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0'-\u098F\u09B0\u0964 \u09B2\u0995\u09CD\u09B7\u09CD\u09AF \u099B\u09BF\u09B2 \u0989\u09AA\u0995\u09C2\u09B2\u09C0\u09DF \u0985\u099E\u09CD\u099A\u09B2\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u0995\u09BE\u099B\u09C7 \u09AC\u0987 \u09AA\u09CC\u0981\u099B\u09C7 \u09A6\u09C7\u0993\u09DF\u09BE \u098F\u09AC\u0982 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE\u09AC\u099E\u09CD\u099A\u09BF\u09A4 \u09B6\u09BF\u09B6\u09C1\u09A6\u09C7\u09B0 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0 \u0986\u09B2\u09CB\u09DF \u0989\u09A6\u09CD\u09AD\u09BE\u09B8\u09BF\u09A4 \u0995\u09B0\u09BE\u0964"
  },
  {
    id: "3",
    slug: "top-10-bengali-classic-novels-must-read",
    title: "\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF\u09C7\u09B0 \u0995\u09BE\u09B2\u099C\u09DF\u09C0 \u09B8\u09C7\u09B0\u09BE \u09E7\u09E6\u099F\u09BF \u0989\u09AA\u09A8\u09CD\u09AF\u09BE\u09B8 \u09AF\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF \u09AC\u0987\u09AA\u09CD\u09B0\u09C7\u09AE\u09C0\u09B0 \u09AA\u09DC\u09BE \u0989\u099A\u09BF\u09A4",
    category: "blog",
    eventDate: null,
    createdAt: "2026-02-10T14:00:00Z",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    content: "\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u09AC\u09BF\u09B6\u09CD\u09AC\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF\u09C7\u09B0 \u09A6\u09B0\u09AC\u09BE\u09B0\u09C7 \u098F\u0995 \u0985\u09A8\u09A8\u09CD\u09AF \u09B8\u09AE\u09CD\u09AA\u09A6\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B2\u09C7\u0996\u0995\u09C7\u09B0\u09BE \u0997\u09CD\u09B0\u09BE\u09AE\u09C0\u09A3 \u09AC\u09BE\u0982\u09B2\u09BE\u09B0 \u09B8\u09AC\u09C1\u099C \u09AA\u09CD\u09B0\u0995\u09C3\u09A4\u09BF \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7 \u09AE\u09BE\u09A8\u09C1\u09B7\u09C7\u09B0 \u099C\u099F\u09BF\u09B2 \u09AE\u09A8\u09B8\u09CD\u09A4\u09A4\u09CD\u09A4\u09CD\u09AC \u0993 \u09B8\u09AE\u09BE\u099C \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09A4\u09BE\u0995\u09C7 \u0985\u09AA\u09B0\u09C2\u09AA \u09A6\u0995\u09CD\u09B7\u09A4\u09BE\u09DF \u09A4\u09C1\u09B2\u09C7 \u09A7\u09B0\u09C7\u099B\u09C7\u09A8\u0964 \u09AA\u09A5\u09C7\u09B0 \u09AA\u09BE\u0981\u099A\u09BE\u09B2\u09C0, \u09B6\u09C7\u09B7\u09C7\u09B0 \u0995\u09AC\u09BF\u09A4\u09BE \u09A5\u09C7\u0995\u09C7 \u098F\u0995\u09BE\u09A4\u09CD\u09A4\u09B0\u09C7\u09B0 \u09A6\u09BF\u09A8\u0997\u09C1\u09B2\u09BF\u2014\u09B8\u09C7\u09B0\u09BE \u09E7\u09E6\u099F\u09BF \u0985\u09AC\u09B6\u09CD\u09AF \u09AA\u09BE\u09A0\u09CD\u09AF \u09AC\u09BE\u0982\u09B2\u09BE \u0989\u09AA\u09A8\u09CD\u09AF\u09BE\u09B8\u09C7\u09B0 \u09B8\u0982\u0995\u09B2\u09A8\u0964"
  },
  {
    id: "4",
    slug: "role-of-library-in-youth-ethics-and-mental-health",
    title: "\u09A4\u09B0\u09C1\u09A3 \u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE\u09C7\u09B0 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u09AC\u09BF\u0995\u09BE\u09B6 \u0993 \u09A8\u09C8\u09A4\u09BF\u0995 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09DF \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u09C7\u09B0 \u0985\u09A8\u09A8\u09CD\u09AF \u09AD\u09C2\u09AE\u09BF\u0995\u09BE",
    category: "blog",
    eventDate: null,
    createdAt: "2026-01-25T11:15:00Z",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
    content: "\u0986\u099C\u0995\u09C7\u09B0 \u09A4\u09B0\u09C1\u09A3 \u09AA\u09CD\u09B0\u099C\u09A8\u09CD\u09AE \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u0997\u09A4 \u09A6\u09BF\u0995 \u09A6\u09BF\u09DF\u09C7 \u09AF\u09A4\u099F\u09BE \u0985\u0997\u09CD\u09B0\u09B8\u09B0, \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u0993 \u09A8\u09C8\u09A4\u09BF\u0995 \u09A6\u09BF\u0995 \u09A6\u09BF\u09DF\u09C7 \u09A4\u09A4\u099F\u09BE\u0987 \u099A\u09CD\u09AF\u09BE\u09B2\u09C7\u099E\u09CD\u099C\u09C7\u09B0 \u09AE\u09C1\u0996\u09CB\u09AE\u09C1\u0996\u09BF\u0964 \u09AD\u09BE\u09B0\u09CD\u099A\u09C1\u09DF\u09BE\u09B2 \u09A6\u09C1\u09A8\u09BF\u09DF\u09BE\u09B0 \u0986\u09B8\u0995\u09CD\u09A4\u09BF \u0993 \u09AE\u09BE\u09A8\u09B8\u09BF\u0995 \u0985\u09AC\u09B8\u09BE\u09A6 \u09A6\u09C2\u09B0 \u0995\u09B0\u09C7 \u09B8\u09C1\u09B8\u09CD\u09A5 \u09A8\u09C8\u09A4\u09BF\u0995 \u099C\u09C0\u09AC\u09A8 \u0997\u09A0\u09A8\u09C7 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u098F\u0995 \u09A8\u09BF\u09AD\u09C3\u09A4 \u09B6\u09BE\u09A8\u09CD\u09A4\u09BF\u09B0 \u0986\u09B6\u09CD\u09B0\u09DF\u0964"
  },
  {
    id: "5",
    slug: "interschool-book-reading-quiz-fest-2026",
    title: "\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u0986\u09A8\u09CD\u09A4\u0983\u09B8\u09CD\u0995\u09C1\u09B2 \u09AC\u0987\u09AA\u09DC\u09BE \u0993 \u0995\u09C1\u0987\u099C \u0989\u09CE\u09B8\u09AC \u09E8\u09E6\u09E8\u09EC \u2014 \u09A8\u09BF\u09AC\u09A8\u09CD\u09A7\u09A8 \u0993 \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0\u09BF\u09A4",
    category: "event",
    eventDate: "\u09E7\u09EB \u098F\u09AA\u09CD\u09B0\u09BF\u09B2, \u09E8\u09E6\u09E8\u09EC",
    createdAt: "2026-02-01T08:00:00Z",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    content: "\u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09A6\u09C7\u09B0 \u09AE\u09BE\u099D\u09C7 \u09AC\u0987 \u09AA\u09DC\u09BE\u09B0 \u0986\u09A8\u09A8\u09CD\u09A6 \u099B\u09DC\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A4\u09C7 \u098F\u09AC\u0982 \u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099C\u09CD\u099E\u09BE\u09A8 \u0993 \u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u099A\u09B0\u09CD\u099A\u09BE\u0995\u09C7 \u0989\u09CE\u09B8\u09BE\u09B9\u09BF\u09A4 \u0995\u09B0\u09A4\u09C7 \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u0986\u09DF\u09CB\u099C\u09A8 \u0995\u09B0\u09A4\u09C7 \u09AF\u09BE\u099A\u09CD\u099B\u09C7 \u09AC\u09B0\u09CD\u09A3\u09BE\u09A2\u09CD\u09AF '\u0986\u09A8\u09CD\u09A4\u0983\u09B8\u09CD\u0995\u09C1\u09B2 \u09AC\u0987\u09AA\u09DC\u09BE \u0993 \u0995\u09C1\u0987\u099C \u0989\u09CE\u09B8\u09AC \u09E8\u09E6\u09E8\u09EC'\u0964 \u09AC\u09B0\u0997\u09C1\u09A8\u09BE \u099C\u09C7\u09B2\u09BE\u09B0 \u09AC\u09BF\u09AD\u09BF\u09A8\u09CD\u09A8 \u09AC\u09BF\u09A6\u09CD\u09AF\u09BE\u09B2\u09DF\u09C7\u09B0 \u09B6\u09BF\u0995\u09CD\u09B7\u09BE\u09B0\u09CD\u09A5\u09C0\u09B0\u09BE \u098F\u0987 \u099C\u09CD\u099E\u09BE\u09A8\u09AF\u099C\u09CD\u099E\u09C7 \u0985\u0982\u09B6 \u09A8\u09BF\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u0964"
  },
  {
    id: "6",
    slug: "rare-manuscripts-digital-archiving-project",
    title: "\u09A6\u09C1\u09B7\u09CD\u09AA\u09CD\u09B0\u09BE\u09AA\u09CD\u09AF \u0993 \u0990\u09A4\u09BF\u09B9\u09BE\u09B8\u09BF\u0995 \u09AA\u09BE\u09A8\u09CD\u09A1\u09C1\u09B2\u09BF\u09AA\u09BF \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u0986\u09B0\u09CD\u0995\u09BE\u0987\u09AD\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3\u09C7 \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u09C7\u09B0 \u09A8\u09A4\u09C1\u09A8 \u0989\u09A6\u09CD\u09AF\u09CB\u0997",
    category: "news",
    eventDate: null,
    createdAt: "2026-01-15T12:00:00Z",
    image: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80",
    content: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0989\u09AA\u0995\u09C2\u09B2\u09C0\u09DF \u0985\u099E\u09CD\u099A\u09B2 \u09B6\u09C1\u09A7\u09C1 \u09AA\u09CD\u09B0\u09BE\u0995\u09C3\u09A4\u09BF\u0995 \u09B8\u09AE\u09CD\u09AA\u09A6\u09C7 \u09A8\u09DF, \u09B2\u09CB\u0995\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF, \u09AA\u09C1\u0981\u09A5\u09BF\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u098F\u09AC\u0982 \u0990\u09A4\u09BF\u09B9\u09BE\u09B8\u09BF\u0995 \u09A8\u09A5\u09BF\u09AA\u09A4\u09CD\u09B0\u09C7\u0993 \u0985\u09A4\u09CD\u09AF\u09A8\u09CD\u09A4 \u09B8\u09AE\u09C3\u09A6\u09CD\u09A7\u0964 \u09B6\u09A4\u09AC\u09B0\u09CD\u09B7\u09C0 \u09AA\u09C1\u0981\u09A5\u09BF, \u09B2\u09CB\u0995\u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF \u0993 \u09A6\u09C1\u09B0\u09CD\u09B2\u09AD \u0997\u09CD\u09B0\u09A8\u09CD\u09A5\u09B8\u09AE\u09C2\u09B9 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u09AA\u09CD\u09B0\u09AF\u09C1\u0995\u09CD\u09A4\u09BF\u09B0 \u09B8\u09B9\u09BE\u09DF\u09A4\u09BE\u09DF \u09A6\u09C0\u09B0\u09CD\u0998\u09AE\u09C7\u09DF\u09BE\u09A6\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09A3\u09C7\u09B0 \u09AF\u09C1\u0997\u09BE\u09A8\u09CD\u09A4\u0995\u09BE\u09B0\u09C0 \u09AA\u09CD\u09B0\u0995\u09B2\u09CD\u09AA \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7\u099B\u09C7 \u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0\u0964"
  },
  {
    id: "7",
    slug: "how-to-build-a-community-library-step-by-step",
    title: "\u0995\u09C0\u09AD\u09BE\u09AC\u09C7 \u098F\u0995\u099F\u09BF \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u099F\u09BF \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u0997\u09DC\u09C7 \u09A4\u09CB\u09B2\u09BE \u09AF\u09BE\u09DF: \u09B8\u09CD\u09AC\u09AA\u09CD\u09A8 \u09A5\u09C7\u0995\u09C7 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC\u09BE\u09DF\u09A8\u09C7\u09B0 \u09B0\u09C2\u09AA\u09B0\u09C7\u0996\u09BE",
    category: "blog",
    eventDate: null,
    createdAt: "2026-01-05T07:45:00Z",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80",
    content: "\u098F\u0995\u099F\u09BF \u098F\u09B2\u09BE\u0995\u09BE\u0995\u09C7 \u09AE\u09BE\u09A6\u0995\u09AE\u09C1\u0995\u09CD\u09A4, \u0985\u09AA\u09B0\u09BE\u09A7\u09AE\u09C1\u0995\u09CD\u09A4 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u0997\u09A4\u09BF\u09B6\u09C0\u09B2 \u0995\u09B0\u09A4\u09C7 \u099A\u09BE\u0987\u09B2\u09C7 \u09B8\u09C7\u0996\u09BE\u09A8\u09C7 \u098F\u0995\u099F\u09BF \u09B8\u0995\u09CD\u09B0\u09BF\u09DF \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0 \u0997\u09DC\u09C7 \u09A4\u09CB\u09B2\u09BE\u09B0 \u099A\u09C7\u09DF\u09C7 \u09B6\u0995\u09CD\u09A4\u09BF\u09B6\u09BE\u09B2\u09C0 \u09AC\u09BF\u0995\u09B2\u09CD\u09AA \u0986\u09B0 \u0995\u09BF\u099B\u09C1 \u09B9\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7 \u09A8\u09BE\u0964 \u09B8\u09CD\u09A5\u09BE\u09A8 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8, \u09AC\u0987 \u09B8\u0982\u0997\u09CD\u09B0\u09B9, \u09A4\u09B9\u09AC\u09BF\u09B2 \u0993 \u09A1\u09BF\u099C\u09BF\u099F\u09BE\u09B2 \u0995\u09CD\u09AF\u09BE\u099F\u09BE\u09B2\u0997\u09BF\u0982\u09DF\u09C7\u09B0 \u09AC\u09BE\u09B8\u09CD\u09A4\u09AC \u0985\u09AD\u09BF\u099C\u09CD\u099E\u09A4\u09BE\u09AD\u09BF\u09A4\u09CD\u09A4\u09BF\u0995 \u09B0\u09C2\u09AA\u09B0\u09C7\u0996\u09BE\u0964"
  }
];
app.get("/api/public/blog_posts", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM blog_posts ORDER BY id DESC");
    if (rows && rows.length > 0) {
      const posts = rows.map((r) => ({
        id: String(r.id),
        title: r.title,
        content: r.content,
        image: r.image || null,
        category: r.category,
        eventDate: r.event_date || null,
        createdAt: r.created_at
      }));
      return res.json(posts);
    }
    res.json(DEFAULT_SERVER_BLOG_POSTS);
  } catch (err) {
    console.warn("Serving fallback blog posts due to DB status:", err.message);
    res.json(DEFAULT_SERVER_BLOG_POSTS);
  }
});
var submissionsUploadDir = process.env.VERCEL ? import_path2.default.join("/tmp", "uploads", "submissions") : import_path2.default.join(process.cwd(), "uploads", "submissions");
if (!import_fs2.default.existsSync(submissionsUploadDir)) {
  import_fs2.default.mkdirSync(submissionsUploadDir, { recursive: true });
}
var submissionStorage = import_multer.default.diskStorage({
  destination: (req, file, cb) => cb(null, submissionsUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = import_path2.default.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
  }
});
var uploadSubmission = (0, import_multer.default)({ storage: submissionStorage, limits: { fileSize: 10 * 1024 * 1024 } });
app.use("/uploads", import_express.default.static(import_path2.default.join(process.cwd(), "uploads")));
app.post("/api/submissions", (req, res, next) => {
  uploadSubmission.single("attachment")(req, res, function(err) {
    if (err) {
      console.error("Multer file upload error:", err);
      return res.status(500).json({ error: "\u09AB\u09BE\u0987\u09B2 \u0986\u09AA\u09B2\u09CB\u09A1\u09C7 \u09A4\u09CD\u09B0\u09C1\u099F\u09BF \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AB\u09BE\u0987\u09B2\u09C7\u09B0 \u09B8\u09BE\u0987\u099C \u099A\u09C7\u0995 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;
    if (!name || !email || !subject || !category || !message) {
      return res.status(400).json({ error: "\u0985\u09A8\u09C1\u0997\u09CD\u09B0\u09B9 \u0995\u09B0\u09C7 \u09B8\u0995\u09B2 \u0986\u09AC\u09B6\u09CD\u09AF\u0995\u09C0\u09AF\u09BC \u09A4\u09A5\u09CD\u09AF \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" });
    }
    const attachmentPath = req.file ? `/uploads/submissions/${req.file.filename}` : null;
    const [resInsert] = await db_default.query(
      "INSERT INTO contact_submissions (name, email, subject, category, message, attachment_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, subject, category, message, attachmentPath, "pending", formatCurrentDateTime()]
    );
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      const attachmentNote = attachmentPath ? `<p><strong>\u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4\u09BF:</strong> \u098F\u0995\u099F\u09BF \u09AB\u09BE\u0987\u09B2 \u09B8\u0982\u09AF\u09C1\u0995\u09CD\u09A4 \u0995\u09B0\u09BE \u09B9\u09AF\u09BC\u09C7\u099B\u09C7 (${req.file?.originalname || "fayl"})</p>` : "";
      const htmlContent = `
          <h2>\u09A8\u09A4\u09C1\u09A8 "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8" \u09B8\u09BE\u09AC\u09AE\u09BF\u09B6\u09A8</h2>
          <p><strong>\u09A8\u09BE\u09AE:</strong> ${name}</p>
          <p><strong>\u0987\u09AE\u09C7\u0987\u09B2:</strong> ${email}</p>
          <p><strong>\u09AC\u09BF\u09B7\u09DF:</strong> ${subject}</p>
          <p><strong>\u09AC\u09BF\u09AD\u09BE\u0997:</strong> ${category}</p>
          <p><strong>\u09AC\u09BE\u09B0\u09CD\u09A4\u09BE:</strong><br/> ${message.replace(/\n/g, "<br/>")}</p>
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
            sender: { name: "\u0985\u0995\u09CD\u09B7\u09B0 \u09AA\u09BE\u09A0\u09BE\u0997\u09BE\u09B0", email: "hello@okkhorpathagar.com" },
            to: [{ email: "okkhorpathagar@gmail.com", name: "Admin" }],
            subject: "\u09A8\u09A4\u09C1\u09A8 '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B2\u09BF\u0996\u09C1\u09A8' \u09B8\u09BE\u09AC\u09AE\u09BF\u09B6\u09A8 - " + subject,
            htmlContent
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
  } catch (err) {
    console.error("Error submitting writing:", err);
    res.status(500).json({ error: "\u099C\u09AE\u09BE \u09A6\u09BF\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5 \u09B9\u09DF\u09C7\u099B\u09C7\u0964 \u09AA\u09C1\u09A8\u09B0\u09BE\u09DF \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964" });
  }
});
app.get("/api/submissions", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
    const submissions = rows.map((r) => ({
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
  } catch (err) {
    console.error("Error fetching submissions:", err);
    res.status(500).json({ error: "\u09A4\u09A5\u09CD\u09AF \u09B2\u09CB\u09A1 \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.put("/api/submissions/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db_default.query("UPDATE contact_submissions SET status = ? WHERE id = ?", [status, id]);
    addLog("\u09B2\u09C7\u0996\u09BE/\u0985\u09AD\u09BF\u09AF\u09CB\u0997 \u0986\u09AA\u09A1\u09C7\u099F", `\u0986\u0987\u09A1\u09BF ${id} \u098F\u09B0 \u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 '${status}' \u098F \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "\u09B8\u09CD\u099F\u09CD\u09AF\u09BE\u099F\u09BE\u09B8 \u0986\u09AA\u09A1\u09C7\u099F \u0995\u09B0\u09A4\u09C7 \u09AC\u09CD\u09AF\u09B0\u09CD\u09A5\u0964" });
  }
});
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await db_default.query("SELECT 1 as ok");
    res.json({
      status: "ok",
      database: "connected",
      time: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "degraded",
      database: "disconnected",
      error: err?.message || String(err),
      time: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
async function initDatabase() {
  try {
    const connection = await db_default.getConnection();
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
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'phone'");
      if (cols.length === 0) {
        await connection.query("ALTER TABLE contact_submissions ADD COLUMN phone VARCHAR(255) AFTER email");
        console.log("Migration: Added phone column to contact_submissions table.");
      }
    } catch (migErr) {
      console.warn("contact_submissions phone migration:", migErr);
    }
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'category'");
      if (cols.length === 0) {
        await connection.query("ALTER TABLE contact_submissions ADD COLUMN category VARCHAR(100) AFTER subject");
        console.log("Migration: Added category column to contact_submissions table.");
      }
    } catch (migErr) {
      console.warn("contact_submissions category migration:", migErr);
    }
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM contact_submissions LIKE 'attachment_path'");
      if (cols.length === 0) {
        await connection.query("ALTER TABLE contact_submissions ADD COLUMN attachment_path VARCHAR(500) AFTER message");
        console.log("Migration: Added attachment_path column to contact_submissions table.");
      }
    } catch (migErr) {
      console.warn("contact_submissions attachment_path migration:", migErr);
    }
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM books LIKE 'page_count'");
      if (cols.length === 0) {
        await connection.query("ALTER TABLE books ADD COLUMN page_count INT DEFAULT NULL");
        console.log("Migration: Added page_count column to books table.");
      }
    } catch (migErr) {
      console.warn("page_count migration check:", migErr);
    }
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM books LIKE 'price'");
      if (cols.length === 0) {
        await connection.query("ALTER TABLE books ADD COLUMN price DECIMAL(10,2) DEFAULT NULL");
        console.log("Migration: Added price column to books table.");
      }
    } catch (migErr) {
      console.warn("price migration check:", migErr);
    }
    try {
      await connection.query(`
          CREATE TABLE IF NOT EXISTS site_traffic (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            view_count INT NOT NULL DEFAULT 0
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
    } catch (migErr) {
      console.warn("site_traffic migration check:", migErr);
    }
    try {
      const [cols] = await connection.query("SHOW COLUMNS FROM books LIKE 'image_url'");
      if (cols.length > 0 && cols[0].Type && !cols[0].Type.toLowerCase().includes("longtext")) {
        await connection.query("ALTER TABLE books MODIFY COLUMN image_url LONGTEXT");
        console.log("Migration: Upgraded image_url column to LONGTEXT.");
      }
    } catch (migErr) {
      console.warn("image_url migration check:", migErr);
    }
    connection.release();
    console.log("Database initialized successfully.");
  } catch (e) {
    console.error("Database init error:", e);
  }
}
async function startServer() {
  const distPath = import_fs2.default.existsSync(import_path2.default.join(__dirname, "index.html")) ? __dirname : import_fs2.default.existsSync(import_path2.default.join(process.cwd(), "dist", "index.html")) ? import_path2.default.join(process.cwd(), "dist") : process.cwd();
  if (process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite not found or failed to load. Falling back to static files (Production mode).");
      app.use(import_express.default.static(distPath));
      app.get("*", (req, res) => res.sendFile(import_path2.default.join(distPath, "index.html")));
    }
  } else {
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3e3;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      initDatabase().catch((dbErr) => console.error("Database init failed:", dbErr));
    });
  } else {
    initDatabase().catch((dbErr) => console.error("Database init failed:", dbErr));
  }
}
startServer().catch((error) => {
  console.error("Failed to start server", error);
});
var server_default = app;
//# sourceMappingURL=server.cjs.map
