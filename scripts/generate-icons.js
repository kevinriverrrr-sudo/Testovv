// Simple script to generate placeholder SVG icons
// In production, you would use proper icon assets

const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG for each size
sizes.forEach(size => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Shield background -->
  <path d="M ${size/2} ${size*0.1} L ${size*0.9} ${size*0.3} L ${size*0.9} ${size*0.6} Q ${size*0.9} ${size*0.75} ${size/2} ${size*0.9} Q ${size*0.1} ${size*0.75} ${size*0.1} ${size*0.6} L ${size*0.1} ${size*0.3} Z" 
        fill="url(#grad)" 
        stroke="#ffffff" 
        stroke-width="${size/32}"/>
  
  <!-- Checkmark -->
  <path d="M ${size*0.35} ${size*0.5} L ${size*0.45} ${size*0.6} L ${size*0.65} ${size*0.4}" 
        stroke="#ffffff" 
        stroke-width="${size/16}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svg);
  console.log(`Generated icon${size}.svg`);
});

// Also create PNG versions note
fs.writeFileSync(
  path.join(iconsDir, 'README.md'),
  `# Icons

These are placeholder SVG icons. For production, convert them to PNG:

\`\`\`bash
# Install imagemagick if needed
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Convert SVGs to PNGs
for size in 16 48 128; do
  convert icon$size.svg -background none icon$size.png
done
\`\`\`

Or use an online converter: https://cloudconvert.com/svg-to-png
`
);

console.log('\nIcons generated successfully!');
console.log('Note: For Chrome Web Store, convert SVG to PNG using imagemagick or online tools.');
