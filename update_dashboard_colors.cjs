const fs = require('fs');
const path = require('path');

const publicComponents = [
  'HomePage.tsx',
  'PublicPortal.tsx',
  'PublicSalesPage.tsx',
  'PublicBookDetailsPage.tsx',
  'PublicShopItemDetailsPage.tsx',
  'PublicShopView.tsx',
  'Hero3DImage.tsx' // If it exists
];

const componentsDir = path.join(__dirname, 'src', 'components');

const mapColors = (content) => {
  return content
    .replace(/bg-\[\#F5F3EF\]/g, 'bg-dash-bg-main')
    .replace(/bg-white/g, 'bg-dash-bg-card')
    .replace(/bg-\[\#FFFFFF\]/g, 'bg-dash-bg-card')
    .replace(/bg-\[\#22242A\]/g, 'bg-dash-bg-training')
    .replace(/bg-\[\#CBBFA8\]/g, 'bg-dash-bg-workout')
    
    // Accents
    .replace(/bg-\[\#FACC15\]/g, 'bg-dash-accent-yellow')
    .replace(/text-\[\#FACC15\]/g, 'text-dash-accent-yellow')
    .replace(/border-\[\#FACC15\]/g, 'border-dash-accent-yellow')

    .replace(/bg-\[\#FF6B6B\]/g, 'bg-dash-accent-orange')
    .replace(/text-\[\#FF6B6B\]/g, 'text-dash-accent-orange')
    .replace(/border-\[\#FF6B6B\]/g, 'border-dash-accent-orange')
    
    // Texts
    .replace(/text-\[\#1A1A1A\]/g, 'text-dash-text-primary')
    .replace(/text-\[\#8A8A8A\]/g, 'text-dash-text-secondary')
    .replace(/text-\[\#22242A\]/g, 'text-dash-bg-training')

    // Borders
    .replace(/border-\[\#E0DCD3\]/g, 'border-dash-border-light')
    .replace(/border-\[\#22242A\]/g, 'border-dash-bg-training')
    .replace(/border-\[\#CBBFA8\]/g, 'border-dash-bg-workout');
};

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') && !publicComponents.includes(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const newContent = mapColors(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
};

processDir(componentsDir);

// App.tsx
const appFile = path.join(__dirname, 'src', 'App.tsx');
const appContent = fs.readFileSync(appFile, 'utf8');
// Only replace in MASTER AUTHENTICATED PANEL
const splitStr = '// MASTER AUTHENTICATED PANEL';
const parts = appContent.split(splitStr);
if (parts.length === 2) {
  const newPart = mapColors(parts[1]);
  fs.writeFileSync(appFile, parts[0] + splitStr + newPart, 'utf8');
  console.log('Updated App.tsx authenticated section');
}

console.log('Done mapping colors.');
