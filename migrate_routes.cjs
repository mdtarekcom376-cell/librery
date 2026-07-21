const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Remove DB_FILE declaration
code = code.replace(/const DB_FILE = path\.join\(process\.cwd\(\),\s*"db\.json"\);\s*\n/g, '');

// 2. Migrate POST /api/settings/googlesheets/sync-all
const syncAllOld = `  // POST Google Sheets Manual Full Synchronization
  app.post("/api/settings/googlesheets/sync-all", authenticateAdmin, async (req, res) => {
    try {
      const db = readDb();
      const config = db.googleSheetsConfig;
      if (!config || !config.webAppUrl) {
        return res.status(400).json({ error: "কোনো গুগল শিট Web App URL সেট করা নেই। দয়া করে সেটিংস প্রথমে সেট করে সেভ করুন।" });
      }

      const webAppUrl = config.webAppUrl;
      const booksList = db.books || [];
      const membersList = db.members || [];
      const wishlistList = db.wishlist || [];

      const totalItems = booksList.length + membersList.length + wishlistList.length;

      // Run synchronization in safe background timeouts so the HTTP request completes instantly
      setTimeout(async () => {
        try {
          console.log(\`[Google Sheets Async Sync] Processing \${totalItems} items...\`);
          // Sync books
          for (const book of booksList) {
            await forcePostToGoogleSheets(webAppUrl, "বই", "যোগ করা হয়েছে", book);
            await new Promise(resolve => setTimeout(resolve, 310)); // Rate limiting gap
          }
          // Sync members
          for (const member of membersList) {
            await forcePostToGoogleSheets(webAppUrl, "সদস্য", "যোগ করা হয়েছে", member);
            await new Promise(resolve => setTimeout(resolve, 310));
          }
          // Sync wishlist items
          for (const item of wishlistList) {
            await forcePostToGoogleSheets(webAppUrl, "উইশলিস্ট", "যোগ করা হয়েছে", item);
            await new Promise(resolve => setTimeout(resolve, 310));
          }
          console.log(\`[Google Sheets Async Sync] Finished syncing all \${totalItems} items!\`);
        } catch (bgErr: any) {
          console.warn("[Google Sheets Async Sync] Error in background bulk sync:", bgErr?.message || bgErr);
        }
      }, 50);

      addLog("গুগল শিট ফুল সিঙ্ক", \`ইউজারের অনুরোধে ব্যাকগ্রাউন্ডে সর্বমোট \${totalItems}টি বই, সদস্য ও উইশলিস্ট ডাটা গুগোল শিটে প্রেরণের কাজ শুরু করা হয়েছে।\`);
      res.json({ success: true, message: \`মোট \${totalItems}টি ডাটা (বই: \${booksList.length}টি, সদস্য: \${membersList.length}টি, উইশলিস্ট: \${wishlistList.length}টি) ব্যাকগ্রাউন্ড প্রসেসের মাধ্যমে গুগল শিটে ট্রান্সফার করা শুরু হয়েছে। এটি সম্পন্ন হতে কিছু সময় নিতে পারে।\` });
    } catch (err: any) {
      console.error("POST /api/settings/googlesheets/sync-all failed:", err);
      res.status(500).json({ error: "সকল ডেটা সিঙ্ক ইনিশিয়েট করার সময় ইন্টারনাল সার্ভার এরর ঘটেছে।" });
    }
  });`;

const syncAllNew = `  // POST Google Sheets Manual Full Synchronization
  app.post("/api/settings/googlesheets/sync-all", authenticateAdmin, async (req, res) => {
    try {
      const [settingsRows]: any = await pool.query("SELECT data FROM settings LIMIT 1");
      let config = { webAppUrl: "" };
      if (settingsRows.length > 0) {
        const settings = typeof settingsRows[0].data === "string" ? JSON.parse(settingsRows[0].data) : settingsRows[0].data;
        if (settings.googleSheetsConfig) config = settings.googleSheetsConfig;
      }

      if (!config || !config.webAppUrl) {
        return res.status(400).json({ error: "কোনো গুগল শিট Web App URL সেট করা নেই। দয়া করে সেটিংস প্রথমে সেট করে সেভ করুন।" });
      }

      const webAppUrl = config.webAppUrl;
      const [booksList]: any = await pool.query("SELECT * FROM books");
      const [membersList]: any = await pool.query("SELECT * FROM members");
      const [wishlistList]: any = await pool.query("SELECT * FROM wishlist");

      const totalItems = booksList.length + membersList.length + wishlistList.length;

      // Run synchronization in safe background timeouts so the HTTP request completes instantly
      setTimeout(async () => {
        try {
          console.log(\`[Google Sheets Async Sync] Processing \${totalItems} items...\`);
          // Sync books
          for (const book of booksList) {
            await forcePostToGoogleSheets(webAppUrl, "বই", "যোগ করা হয়েছে", book);
            await new Promise(resolve => setTimeout(resolve, 310)); // Rate limiting gap
          }
          // Sync members
          for (const member of membersList) {
            await forcePostToGoogleSheets(webAppUrl, "সদস্য", "যোগ করা হয়েছে", member);
            await new Promise(resolve => setTimeout(resolve, 310));
          }
          // Sync wishlist items
          for (const item of wishlistList) {
            await forcePostToGoogleSheets(webAppUrl, "উইশলিস্ট", "যোগ করা হয়েছে", item);
            await new Promise(resolve => setTimeout(resolve, 310));
          }
          console.log(\`[Google Sheets Async Sync] Finished syncing all \${totalItems} items!\`);
        } catch (bgErr: any) {
          console.warn("[Google Sheets Async Sync] Error in background bulk sync:", bgErr?.message || bgErr);
        }
      }, 50);

      addLog("গুগল শিট ফুল সিঙ্ক", \`ইউজারের অনুরোধে ব্যাকগ্রাউন্ডে সর্বমোট \${totalItems}টি বই, সদস্য ও উইশলিস্ট ডাটা গুগোল শিটে প্রেরণের কাজ শুরু করা হয়েছে।\`);
      res.json({ success: true, message: \`মোট \${totalItems}টি ডাটা (বই: \${booksList.length}টি, সদস্য: \${membersList.length}টি, উইশলিস্ট: \${wishlistList.length}টি) ব্যাকগ্রাউন্ড প্রসেসের মাধ্যমে গুগল শিটে ট্রান্সফার করা শুরু হয়েছে। এটি সম্পন্ন হতে কিছু সময় নিতে পারে।\` });
    } catch (err: any) {
      console.error("POST /api/settings/googlesheets/sync-all failed:", err);
      res.status(500).json({ error: "সকল ডেটা সিঙ্ক ইনিশিয়েট করার সময় ইন্টারনাল সার্ভার এরর ঘটেছে।" });
    }
  });`;

if (code.includes(syncAllOld)) {
  code = code.replace(syncAllOld, syncAllNew);
  console.log("Successfully replaced sync-all");
} else {
  console.log("Failed to find sync-all");
}

// 3. Delete Legacy GET /api/sms/scheduled (Using regex to match the block properly)
const oldSmsScheduledRegex = /  \/\/ Returns currently scheduled warnings\n  app\.get\("\/api\/sms\/scheduled", authenticateAdmin, \(req, res\) => \{\n    const db = readDb\(\);[\s\S]*?res\.json\(alerts\);\n  \}\);\n/g;

if (code.match(oldSmsScheduledRegex)) {
  code = code.replace(oldSmsScheduledRegex, '');
  console.log("Successfully removed old GET /api/sms/scheduled");
} else {
  console.log("Failed to find old GET /api/sms/scheduled block to delete.");
}

// 4. Migrate POST /api/sms/trigger
const smsTriggerRegex = /  \/\/ Trigger simulated cron job to run check immediately\n  app\.post\("\/api\/sms\/trigger", authenticateAdmin, async \(req, res\) => \{\n    try \{\n      const db = readDb\(\);[\s\S]*?res\.status\(500\)\.json\(\{ error: "SMS শিডিউলার রান করার সময় ইন্টারনাল ত্রুটি হয়েছে।" \}\);\n    \}\n  \}\);/g;

const newSmsTrigger = `  // Trigger simulated cron job to run check immediately
  app.post("/api/sms/trigger", authenticateAdmin, async (req, res) => {
    try {
      const todayStr = (req.body.todayStr as string) || (req.query.todayStr as string) || new Date().toISOString().split("T")[0];
      const bypassRules = req.body.bypassRules === true || req.body.bypassRules === "true" || req.query.bypassRules === "true";
      
      const [settingsRows]: any = await pool.query("SELECT data FROM settings LIMIT 1");
      let gateway = { provider: "simulated", apiKey: "", senderId: "", customUrl: "" };
      let smsTemplate = "আসসালামু আলাইকুম, আপনার ({bookName}) বইটি জমাদেয়ার সময় অতিক্রম হয়েছে। অনুগ্রহ করে বইটি অক্ষর পাঠাগার এ জমা দিয়ে আসুন। আমাদের পাঠাগার প্রতিদিন বিকাল ৪ টা থেকে রাত ৮ টা পর্যন্ত খোলা থাকে। বা আপনার বই যদি পড়া শেষ না হয়ে থাকে তাহলে অনুগ্রহ করে এই নাম্বারে call /WhatsApp এ যোগাযোগ করেন: 01333474848";

      if (settingsRows.length > 0) {
        const settings = typeof settingsRows[0].data === "string" ? JSON.parse(settingsRows[0].data) : settingsRows[0].data;
        if (settings.smsGateway) gateway = settings.smsGateway;
        if (settings.smsTemplate) smsTemplate = settings.smsTemplate;
      }

      const [issues]: any = await pool.query("SELECT * FROM issues WHERE status = 'Issued'");

      // Find all live active alerts for today (corresponds to active overdue notifications that modulo hits)
      const activeAlerts: Array<{ mobile: string; text: string; memberName: string }> = [];

      issues.forEach((issue: any) => {
        // Return date from DB might be a Date object, convert to YYYY-MM-DD string
        const issueReturnDateStr = (issue.return_date instanceof Date) ? issue.return_date.toISOString().split("T")[0] : String(issue.return_date).split(" ")[0];

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
          addLog("সিমুলেটেড SMS", \`সদস্য \${alert.memberName} (\${alert.mobile}) কে ফ্রি সিমুলেটেড ওভারডিউ SMS পাঠানো হয়েছে। বার্তা: "\${alert.text.slice(0, 60)}..."\`);
        }
        responseMsg = \`সিমুলেশন মোড (Free) এর মাধ্যমে স্বয়ংক্রিয় শিডিউল সম্পন্ন। মোট \${count} টি রিমাইন্ডার সফলভাবে সিমুলেট করা হয়েছে!\`;
        logDetails = \`সিমুলেশন মোড (Free) সফলভাবে সম্পন্ন। মোট সিমুলেটেড রিমাইন্ডার: \${count}টি।\`;
      }
      // If a real SMS Gateway is configured
      else if (gateway.provider && gateway.provider !== "simulated" && (gateway.apiKey || (gateway.provider === "custom" && gateway.customUrl))) {
        let successCount = 0;
        let failCount = 0;

        for (const alert of activeAlerts) {
          try {
            let url = "";

            // Normalize mobile number (remove non-digits)
            let rawMobile = alert.mobile.replace(/\\D/g, "");
            let mobileWith88 = rawMobile.startsWith("88") ? rawMobile : "88" + rawMobile;
            let mobileWithout88 = rawMobile.startsWith("88") ? rawMobile.slice(2) : rawMobile;

            if (gateway.provider === "greenweb") {
              const encodedMsg = encodeURIComponent(alert.text);
              url = \`https://api.greenweb.com.bd/api.php?token=\${encodeURIComponent(gateway.apiKey)}&to=\${encodeURIComponent(mobileWith88)}&message=\${encodedMsg}\`;
            } else if (gateway.provider === "bulksmsbd") {
              const encodedMsg = encodeURIComponent(alert.text);
              const senderParam = gateway.senderId ? \`&senderid=\${encodeURIComponent(gateway.senderId)}\` : "";
              url = \`https://bulksmsbd.net/api/smsapi?api_key=\${encodeURIComponent(gateway.apiKey)}&type=text&number=\${encodeURIComponent(mobileWith88)}\${senderParam}&message=\${encodedMsg}\`;
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
              console.log(\`Sending real SMS to \${alert.memberName} (\${alert.mobile}) via \${gateway.provider}\`);
              const apiRes = await fetch(url, { method: "GET" });
              const apiText = await apiRes.text();
              console.log(\`Gateway response for \${alert.mobile}:\`, apiText);
              
              // Log real SMS
              addLog("বাস্তব SMS", \`সদস্য \${alert.memberName} (\${alert.mobile}) কে \${gateway.provider} গেটওয়ে দিয়ে SMS পাঠানো হয়েছে। রেসপন্স: \${apiText}\`);
              successCount++;
            }
          } catch (smsErr) {
            console.error(\`Failed to send real SMS to \${alert.mobile}:\`, smsErr);
            failCount++;
          }
        }

        responseMsg = \`বাস্তব SMS গেটওয়ে (\${gateway.provider}) এর মাধ্যমে সতর্কতা রান করা হয়েছে। সফল: \${successCount}টি, ব্যর্থ: \${failCount}টি।\`;
        logDetails = \`বাস্তব SMS গেটওয়ে (\${gateway.provider}) মারফত SMS পাঠানো রান হয়েছে। মোট সফল: \${successCount}, ব্যর্থ: \${failCount}।\`;
      }

      addLog("SMS সতর্কতা রান", logDetails);
      res.json({ success: true, message: responseMsg });
    } catch (err: any) {
      console.error("SMS trigger endpoint runtime error:", err);
      res.status(500).json({ error: "SMS শিডিউলার রান করার সময় ইন্টারনাল ত্রুটি হয়েছে।" });
    }
  });`;

if (code.match(smsTriggerRegex)) {
  code = code.replace(smsTriggerRegex, newSmsTrigger);
  console.log("Successfully replaced POST /api/sms/trigger");
} else {
  console.log("Failed to find POST /api/sms/trigger block");
}

fs.writeFileSync('server.ts', code);
