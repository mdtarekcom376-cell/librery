const fs = require('fs');
const path = require('path');

const publicComponents = [
  'HomePage.tsx',
  'PublicPortal.tsx',
  'PublicSalesPage.tsx',
  'PublicBookDetailsPage.tsx',
  'PublicShopItemDetailsPage.tsx',
  'PublicShopView.tsx',
  'Hero3DImage.tsx'
];

function processClasses(classStr) {
  let classes = classStr.split(/\s+/).filter(Boolean);
  
  // 1. Map Backgrounds
  classes = classes.map(c => {
    if (c.startsWith('bg-[#05070f]')) return 'bg-[#E8E2D8]';
    if (c.startsWith('bg-slate-900') || c.startsWith('bg-slate-950')) return 'bg-[#FFFFFF]';
    if (c === 'bg-slate-800' || c === 'hover:bg-slate-800') return c.replace('bg-slate-800', 'bg-[#1B1F2B]');
    if (c.includes('cyan-600') || c.includes('purple-600')) return c.replace(/cyan-600|purple-600/g, '[#EF6C4D]');
    if (c.includes('cyan-700') || c.includes('purple-700')) return c.replace(/cyan-700|purple-700/g, '[#EF6C4D]');
    if (c.includes('cyan-500') || c.includes('purple-500')) return c.replace(/cyan-500|purple-500/g, '[#EF6C4D]');
    if (c.includes('cyan-400') || c.includes('purple-400')) return c.replace(/cyan-400|purple-400/g, '[#EF6C4D]');
    return c;
  });

  // 2. Map Borders
  classes = classes.map(c => {
    if (c.startsWith('border-white/10') || c.startsWith('border-slate-800') || c.startsWith('border-slate-700')) return 'border-[#E0DCD3]';
    return c;
  });

  // 3. Map Text
  classes = classes.map(c => {
    if (c === 'text-slate-300' || c === 'text-slate-400' || c === 'text-slate-500') return 'text-[#8A8A8A]';
    return c;
  });

  // 4. Enforce Contrast Rules
  const hasDarkBg = classes.some(c => 
    c.includes('bg-[#1B1F2B]') || 
    c.includes('bg-[#EF6C4D]') || 
    c.includes('bg-[#111214]') || 
    c.includes('bg-red-600') || 
    c.includes('bg-emerald-600')
  );

  if (hasDarkBg) {
    // If it's a dark background container, text MUST be white or light gray
    classes = classes.map(c => {
      if (c === 'text-white' || c === 'text-slate-200' || c === 'text-[#1A1A1A]') return 'text-white';
      if (c === 'text-[#8A8A8A]') return 'text-[#E0DCD3]';
      return c;
    });
  } else {
    // Light backgrounds (E8E2D8, FFFFFF, or default)
    // Replace text-white with #1A1A1A
    classes = classes.map(c => {
      if (c === 'text-white' || c === 'text-slate-200' || c === 'text-slate-100') return 'text-[#1A1A1A]';
      return c;
    });
  }

  // Deduplicate and return
  return [...new Set(classes)].join(' ');
}

function processContent(content) {
  // Regex to find className="..." or className={`...`}
  // It handles simple cases well enough for this refactoring
  return content.replace(/className=(["'])(.*?)\1|className=\{`(.*?)`\}/g, (match, quote, p2, p3) => {
    if (p2 !== undefined) {
      return `className=${quote}${processClasses(p2)}${quote}`;
    } else if (p3 !== undefined) {
      // For template literals, we need to carefully process the non-variable parts
      // This is trickier, but let's just process the whole string and hope variables don't match our tailwind classes
      return `className={\`${processClasses(p3)}\`}`;
    }
    return match;
  });
}

const componentsDir = path.join(__dirname, 'src', 'components');

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') && !publicComponents.includes(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = processContent(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
};

processDir(componentsDir);

// Process App.tsx (Authenticated section only)
const appFile = path.join(__dirname, 'src', 'App.tsx');
const appContent = fs.readFileSync(appFile, 'utf8');
const splitStr = '// MASTER AUTHENTICATED PANEL';
const parts = appContent.split(splitStr);
if (parts.length === 2) {
  const newPart = processContent(parts[1]);
  fs.writeFileSync(appFile, parts[0] + splitStr + newPart, 'utf8');
  console.log('Updated App.tsx authenticated section');
}

console.log('Done mapping colors with strict contrast rules.');
