const fs = require('fs');

function toWhiteTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Text colors
  content = content.replace(/text-white\/70/g, 'text-text-secondary');
  content = content.replace(/text-white\/80/g, 'text-text-secondary');
  content = content.replace(/text-white\/50/g, 'text-text-secondary');
  content = content.replace(/text-white/g, 'text-text-primary');
  
  // Background colors
  content = content.replace(/bg-black\/80/g, 'bg-white/90');
  content = content.replace(/bg-black\/10/g, 'bg-black/5');
  content = content.replace(/bg-black/g, 'bg-white');
  content = content.replace(/bg-white\/5/g, 'bg-surface');
  content = content.replace(/bg-white\/10/g, 'bg-surface');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border');
  content = content.replace(/border-white/g, 'border-border');
  
  // Specific tweaks that might have been broken by simple replace
  // For plan cards: text-text-primary inside the black/white bg
  // We want the text to be visible on white bg.
  
  fs.writeFileSync(filePath, content, 'utf8');
}

toWhiteTheme('src/pages/LandingPage.tsx');
toWhiteTheme('src/components/shared/BusinessSegmentsSection.tsx');

console.log("Done");
