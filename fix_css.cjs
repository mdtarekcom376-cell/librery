const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  // Replace text-[#1A1A1A] with text-white if bg-[#22242A] is in the same className string.
  // We'll just replace text-[#1A1A1A] with text-white on lines that contain bg-[#22242A] or bg-[#0b0e17] or bg-slate-930
  const lines = newContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('bg-[#22242A]') || lines[i].includes('bg-[#0b0e17]') || lines[i].includes('bg-slate-930')) {
      lines[i] = lines[i].replace(/text-\[\#1A1A1A\]/g, 'text-white');
      lines[i] = lines[i].replace(/text-\[\#22242A\]/g, 'text-white');
    }
    
    // Fix submit buttons (like the one in IssueReturn with gradient)
    if (lines[i].includes('from-purple-600') && lines[i].includes('to-indigo-600')) {
       lines[i] = lines[i].replace(/text-\[\#1A1A1A\]/g, 'text-white');
    }
  }
  newContent = lines.join('\n');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Fixed', file);
  }
});

console.log(`Done. Changed ${changedFiles} files.`);
