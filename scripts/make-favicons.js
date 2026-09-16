const fs = require('fs');
const path = require('path');

// 1. Original exact polygon coordinates (matching user-provided image 335x251)
// BL Tip: (4, 226)
// Top Peak: (133, 85)
// Top Notch: (198, 120)
// TR Tip: (327, 49)
// Bot Peak: (197, 190)
// Bot Notch: (132, 155)

const origPts = [
  [4, 226],
  [133, 85],
  [198, 120],
  [327, 49],
  [197, 190],
  [132, 155]
];

// High-precision square 512x512 coordinates for crisp favicon across standard & Retina displays
// Target bolt to fill roughly 88% width with balanced margins
const targetW = 460;
const scale = targetW / (327 - 4);
const centerOrigX = (4 + 327) / 2; // 165.5
const centerOrigY = (49 + 226) / 2; // 137.5
const targetCenterX = 256;
const targetCenterY = 256;

const sqPts = origPts.map(([x, y]) => {
  const nx = targetCenterX + (x - centerOrigX) * scale;
  const ny = targetCenterY + (y - centerOrigY) * scale;
  return [Math.round(nx * 10) / 10, Math.round(ny * 10) / 10];
});

// SVG Favicon with dark background matching original #222c30
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#222c30" rx="0"/>
  <polygon points="${sqPts.map(p => p.join(',')).join(' ')}" fill="#4dbf9d"/>
</svg>
`;

// SVG Favicon with transparent background (alternative)
const svgTransparent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <polygon points="${sqPts.map(p => p.join(',')).join(' ')}" fill="#4dbf9d"/>
</svg>
`;

fs.writeFileSync(path.join(__dirname, '../favicon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../favicon-transparent.svg'), svgTransparent, 'utf8');

console.log('Successfully wrote favicon.svg and favicon-transparent.svg');
console.log('Square Points (512x512):', sqPts);
