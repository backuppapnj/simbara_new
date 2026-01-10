#!/usr/bin/env node

/**
 * PWA Icon Generator (Simple SVG version)
 * Generates professional SVG icons for the Asset Management System
 * Use online tools like https://cloudconvert.com/svg-to-png for PNG conversion
 */

const fs = require('fs');
const path = require('path');

// Colors from the spec
const COLORS = {
    primary: '#1e3a5f',    // Navy Blue
    secondary: '#2563eb',  // Bright Blue
    accent: '#f59e0b',     // Amber
    background: '#ffffff', // White
    text: '#ffffff'        // White text
};

// Icon sizes required for PWA
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG content for each size
function createIconSVG(size) {
    const scale = size / 512;
    const padding = Math.round(64 * scale);

    // Box dimensions
    const boxSize = size - (padding * 2);
    const boxX = padding;
    const boxY = padding + Math.round(20 * scale);

    // Building icon dimensions
    const buildingWidth = Math.round(boxSize * 0.5);
    const buildingHeight = Math.round(boxSize * 0.6);
    const buildingX = boxX + Math.round(boxSize * 0.25);
    const buildingY = boxY + Math.round(boxSize * 0.15);

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" fill="${COLORS.primary}" rx="${size * 0.15}"/>

  <!-- Stylized Building/Asset Icon -->
  <g transform="translate(${buildingX}, ${buildingY})">
    <!-- Main building shape -->
    <rect x="0" y="${Math.round(buildingHeight * 0.2)}" width="${buildingWidth}" height="${Math.round(buildingHeight * 0.8)}"
          fill="${COLORS.secondary}" rx="${Math.round(4 * scale)}"/>

    <!-- Roof -->
    <polygon points="${Math.round(-buildingWidth * 0.1)},${Math.round(buildingHeight * 0.2)}
                      ${Math.round(buildingWidth * 0.5)},${Math.round(-buildingHeight * 0.05)}
                      ${Math.round(buildingWidth * 1.1)},${Math.round(buildingHeight * 0.2)}"
             fill="${COLORS.accent}"/>

    <!-- Windows -->
    <rect x="${Math.round(buildingWidth * 0.15)}" y="${Math.round(buildingHeight * 0.35)}"
          width="${Math.round(buildingWidth * 0.2)}" height="${Math.round(buildingHeight * 0.15)}"
          fill="${COLORS.text}" rx="${Math.round(2 * scale)}"/>
    <rect x="${Math.round(buildingWidth * 0.65)}" y="${Math.round(buildingHeight * 0.35)}"
          width="${Math.round(buildingWidth * 0.2)}" height="${Math.round(buildingHeight * 0.15)}"
          fill="${COLORS.text}" rx="${Math.round(2 * scale)}"/>
    <rect x="${Math.round(buildingWidth * 0.15)}" y="${Math.round(buildingHeight * 0.6)}"
          width="${Math.round(buildingWidth * 0.2)}" height="${Math.round(buildingHeight * 0.15)}"
          fill="${COLORS.text}" rx="${Math.round(2 * scale)}"/>
    <rect x="${Math.round(buildingWidth * 0.65)}" y="${Math.round(buildingHeight * 0.6)}"
          width="${Math.round(buildingWidth * 0.2)}" height="${Math.round(buildingHeight * 0.15)}"
          fill="${COLORS.text}" rx="${Math.round(2 * scale)}"/>

    <!-- Door -->
    <rect x="${Math.round(buildingWidth * 0.35)}" y="${Math.round(buildingHeight * 0.5)}"
          width="${Math.round(buildingWidth * 0.3)}" height="${Math.round(buildingHeight * 0.5)}"
          fill="${COLORS.accent}" rx="${Math.round(2 * scale)}"/>
  </g>

  <!-- Bottom accent line -->
  <rect x="${padding}" y="${size - padding - Math.round(8 * scale)}"
        width="${boxSize}" height="${Math.round(6 * scale)}"
        fill="${COLORS.accent}" rx="${Math.round(3 * scale)}"/>
</svg>`;
}

// Create favicon SVG (simplified for smaller size)
function createFaviconSVG() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="${COLORS.primary}" rx="6"/>
  <rect x="8" y="12" width="16" height="16" fill="${COLORS.secondary}" rx="2"/>
  <polygon points="6,12 16,4 26,12" fill="${COLORS.accent}"/>
  <rect x="10" y="15" width="3" height="3" fill="${COLORS.text}" rx="1"/>
  <rect x="19" y="15" width="3" height="3" fill="${COLORS.text}" rx="1"/>
  <rect x="13" y="19" width="6" height="9" fill="${COLORS.accent}" rx="1"/>
</svg>`;
}

// Generate all icons
function generateIcons() {
    const iconsDir = path.join(__dirname, '..', 'public', 'icons');

    // Ensure directory exists
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }

    console.log('🎨 Generating PWA Icons (SVG format)...\n');

    // Generate each size
    SIZES.forEach(size => {
        const svg = createIconSVG(size);
        const svgFilename = `icon-${size}x${size}.svg`;
        const svgPath = path.join(iconsDir, svgFilename);
        fs.writeFileSync(svgPath, svg);
        console.log(`✓ Generated ${svgFilename}`);
    });

    // Generate favicon
    const faviconSVG = createFaviconSVG();
    const faviconPath = path.join(iconsDir, 'favicon.svg');
    fs.writeFileSync(faviconPath, faviconSVG);
    console.log(`✓ Generated favicon.svg\n`);

    // Copy favicon to public root
    fs.copyFileSync(faviconPath, path.join(__dirname, '..', 'public', 'favicon.svg'));
    console.log(`✓ Copied favicon.svg to public/\n`);

    console.log(`✨ Icons generated successfully in ${iconsDir}`);
    console.log(`\n📝 Note: SVG icons are ready for use.`);
    console.log(`   For PNG conversion (recommended for full PWA support), use:`);
    console.log(`   - Online: https://cloudconvert.com/svg-to-png`);
    console.log(`   - CLI: npm install -g svgo && svgo public/icons/icon-*.svg`);
}

// Generate a maskable icon (for adaptive icons)
function generateMaskableIcon() {
    const size = 512;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="icon-mask">
      <rect width="${size}" height="${size}" fill="white" rx="${size * 0.15}"/>
    </mask>
  </defs>

  <!-- Safe zone for maskable icons (40% padding recommended) -->
  <g mask="url(#icon-mask)">
    <rect width="${size}" height="${size}" fill="${COLORS.primary}"/>

    <!-- Centered icon content within safe zone -->
    <g transform="translate(${size * 0.25}, ${size * 0.25})">
      <rect x="0" y="60" width="${size * 0.5}" height="${size * 0.5}"
            fill="${COLORS.secondary}" rx="8"/>
      <polygon points="-20,60 ${size * 0.25},-10 ${size * 0.5 + 20},60" fill="${COLORS.accent}"/>
      <rect x="40" y="100" width="40" height="40" fill="${COLORS.text}" rx="4"/>
      <rect x="140" y="100" width="40" height="40" fill="${COLORS.text}" rx="4"/>
      <rect x="40" y="170" width="40" height="40" fill="${COLORS.text}" rx="4"/>
      <rect x="140" y="170" width="40" height="40" fill="${COLORS.text}" rx="4"/>
      <rect x="90" y="150" width="60" height="90" fill="${COLORS.accent}" rx="4"/>
    </g>
  </g>
</svg>`;

    const iconsDir = path.join(__dirname, '..', 'public', 'icons');
    const maskablePath = path.join(iconsDir, 'icon-maskable-512x512.svg');
    fs.writeFileSync(maskablePath, svg);
    console.log(`✓ Generated icon-maskable-512x512.svg`);
}

// Run generation
generateIcons();
generateMaskableIcon();

console.log('\n✅ PWA Icon generation complete!');
console.log('📁 Icons saved to: /public/icons/');
