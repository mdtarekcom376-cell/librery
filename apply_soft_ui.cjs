const fs = require('fs');
const path = require('path');

function processClasses(classStr) {
  let classes = classStr.split(/\s+/).filter(Boolean);
  
  classes = classes.map(c => {
    // Backgrounds
    if (c === 'bg-[#05070f]' || c === 'bg-[#0a0e17]') return 'bg-[#F5F3EF]';
    if (c.startsWith('bg-slate-900') || c.startsWith('bg-slate-950') || c.startsWith('bg-[#05070f]/')) return 'bg-[#FFFFFF]';
    
    // Sidebar active item or dark pills
    if (c === 'bg-slate-800' || c === 'hover:bg-slate-800') return c.replace('bg-slate-800', 'bg-[#22242A]');
    if (c === 'bg-slate-800/80') return 'bg-[#22242A]/80';
    
    // Primary Buttons (usually had gradients or cyan)
    if (c === 'from-purple-600' || c === 'to-cyan-600' || c === 'from-purple-700' || c === 'to-cyan-750' || c === 'bg-gradient-to-r') return ''; // Remove gradient classes
    
    // If it was a button gradient container, we make it slate
    if (c.includes('shadow-purple') || c.includes('shadow-cyan')) return '';

    // Borders
    if (c.startsWith('border-white/') || c.startsWith('border-purple-') || c.startsWith('border-cyan-')) {
        return c.includes('focus:') ? 'focus:border-[#22242A]' : 'border-[#E0DCD3]';
    }

    // Text
    if (c === 'text-white' || c === 'text-slate-200' || c === 'text-slate-300') return 'text-[#1A1A1A]';
    if (c === 'text-slate-400' || c === 'text-slate-500') return 'text-[#8A8A8A]';
    
    // Accents
    if (c.includes('text-cyan-400') || c.includes('text-purple-400')) return 'text-[#FF6B6B]';
    if (c.includes('bg-cyan-500') || c.includes('bg-purple-500') || c.includes('bg-red-500')) return 'bg-[#FF6B6B]';

    return c;
  });

  // Second pass: if it has bg-[#22242A] (dark slate), the text must be white
  const hasDarkBg = classes.some(c => c.includes('bg-[#22242A]'));
  if (hasDarkBg) {
    classes = classes.map(c => {
      if (c === 'text-[#1A1A1A]') return 'text-white';
      if (c === 'text-[#8A8A8A]') return 'text-slate-300';
      return c;
    });
  }

  return [...new Set(classes.filter(Boolean))].join(' ');
}

function processContent(content) {
  // Regex to find className="...", className={'...'}, and className={`...`}
  return content.replace(/className=(["'])(.*?)\1|className=\{`(.*?)`\}|className=\{["'](.*?)["']\}/g, (match, quote, p2, p3, p4) => {
    if (p2 !== undefined) {
      return `className=${quote}${processClasses(p2)}${quote}`;
    } else if (p3 !== undefined) {
      return `className={\`${processClasses(p3)}\`}`;
    } else if (p4 !== undefined) {
      return `className={"${processClasses(p4)}"}`;
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
    } else if (file.endsWith('.tsx')) {
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

// Process App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = processContent(appContent);

// One special case for primary buttons in App.tsx: ensure buttons that lost their gradient get bg-[#22242A] text-white
appContent = appContent.replace(/className="(.*?hover:from-purple-700.*?)"/g, 'className="w-full py-3 bg-[#22242A] hover:bg-[#2f3138] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"');

fs.writeFileSync(appFile, appContent, 'utf8');
console.log('Updated App.tsx');

console.log('Done mapping Soft UI classes.');
