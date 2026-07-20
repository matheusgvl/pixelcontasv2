const fs = require('fs');
const path = './src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Global replaces for dark mode
content = content.replace(/bg-surface/g, 'bg-black');
content = content.replace(/bg-white\/80/g, 'bg-black/80');
content = content.replace(/bg-white/g, 'bg-black');
content = content.replace(/bg-neutral-bgSecondary\/20/g, 'bg-white/5');
content = content.replace(/border-border/g, 'border-white/10');
content = content.replace(/border-black/g, 'border-white/10');
content = content.replace(/text-text-primary/g, 'text-white');
content = content.replace(/text-text-secondary/g, 'text-white/70');
content = content.replace(/bg-neutral-bg\/20/g, 'bg-white/5');
content = content.replace(/text-gray-400/g, 'text-gray-400');
content = content.replace(/text-gray-500/g, 'text-gray-500');
content = content.replace(/text-gray-600/g, 'text-gray-400');

// Specific fixes
content = content.replace(/<div className="flex flex-col w-full bg-black">/g, '<div className="flex flex-col w-full bg-black text-white">');
content = content.replace(/bg-black text-white z-40/g, 'bg-black text-white z-40');
content = content.replace(/bg-black text-white flex items-center justify-center/g, 'bg-white/10 text-white flex items-center justify-center');
content = content.replace(/bg-black text-white flex items-center justify-center font-bold font-title">1/g, 'bg-white/20 text-white flex items-center justify-center font-bold font-title">1');
content = content.replace(/bg-black text-white flex items-center justify-center font-bold font-title">2/g, 'bg-white/20 text-white flex items-center justify-center font-bold font-title">2');

fs.writeFileSync(path, content);
console.log("Updated LandingPage.tsx");
