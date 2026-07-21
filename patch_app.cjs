const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add analytics tab to admin nav (after shop, before settings)
const patched = content.replace(
  /(\{ id: "shop", label: "বিক্রয় কর্নার", icon: Store \}),(\s*\{ id: "settings")/,
  '$1,\n        { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },$2'
);

// 2. Add Analytics component rendering (after writings block, before settings block)
const patched2 = patched.replace(
  /(\{userRole === "admin" && activeTab === "writings" && \([\s\S]*?\)\})\s*(\{userRole === "admin" && activeTab === "settings")/,
  '$1\n\n            {userRole === "admin" && activeTab === "analytics" && (\n              <Analytics />\n            )}\n\n            $2'
);

fs.writeFileSync('src/App.tsx', patched2, 'utf8');
console.log('Done');