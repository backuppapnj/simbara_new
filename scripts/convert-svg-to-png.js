#!/usr/bin/env node

/**
 * SVG to PNG Converter for PWA Icons
 * Converts SVG icons to PNG format for better PWA support
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function convertSvgToPng() {
    console.log('🔄 Converting SVG icons to PNG...\n');

    for (const size of SIZES) {
        const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
        const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

        try {
            const svgBuffer = fs.readFileSync(svgPath);
            await sharp(svgBuffer)
                .resize(size, size)
                .png({ quality: 90, compressionLevel: 9 })
                .toFile(pngPath);
            console.log(`✓ Converted icon-${size}x${size}.svg → PNG`);
        } catch (error) {
            console.error(`✗ Error converting ${size}x${size}:`, error.message);
        }
    }

    // Convert maskable icon
    try {
        const maskableSvg = path.join(iconsDir, 'icon-maskable-512x512.svg');
        const maskablePng = path.join(iconsDir, 'icon-maskable-512x512.png');
        const svgBuffer = fs.readFileSync(maskableSvg);
        await sharp(svgBuffer)
            .resize(512, 512)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(maskablePng);
        console.log(`✓ Converted icon-maskable-512x512.svg → PNG`);
    } catch (error) {
        console.error(`✗ Error converting maskable icon:`, error.message);
    }

    console.log('\n✅ PNG conversion complete!');
}

convertSvgToPng().catch(console.error);
