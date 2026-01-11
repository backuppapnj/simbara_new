#!/bin/bash

# Setup script for E2E test fixtures
# This script generates test images for asset photo testing

set -e

FIXTURES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up E2E test fixtures..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Warning: ImageMagick not found. Install with: sudo apt-get install imagemagick"
    echo "Falling back to creating placeholder files..."

    # Create placeholder files that can be replaced later
    touch "$FIXTURES_DIR/test-image-valid.jpg"
    touch "$FIXTURES_DIR/test-image-large.jpg"
    echo "This is a test image file" > "$FIXTURES_DIR/test-image-invalid.txt"

    echo "Placeholder files created. Please replace .jpg files with actual images."
    echo "You can download sample images from: https://picsum.photos/"
else
    echo "ImageMagick found. Creating test images..."

    # Create a valid test image (800x600, ~100KB)
    convert -size 800x600 xc:blue \
        -pointsize 50 -fill white -gravity center \
        -annotate +0+0 "Test Image" \
        "$FIXTURES_DIR/test-image-valid.jpg"

    # Create a large test image (>5MB, 4000x3000)
    convert -size 4000x3000 xc:blue \
        -pointsize 200 -fill white -gravity center \
        -annotate +0+0 "Large Test Image" \
        -quality 100 \
        "$FIXTURES_DIR/test-image-large.jpg"

    # Create PNG test image
    convert -size 800x600 xc:green \
        -pointsize 50 -fill white -gravity center \
        -annotate +0+0 "PNG Test" \
        "$FIXTURES_DIR/test-image-valid.png"

    # Create invalid file
    echo "This is not an image file" > "$FIXTURES_DIR/test-image-invalid.txt"

    echo "Test images created successfully!"
fi

# List created files
echo ""
echo "Created fixtures:"
ls -lh "$FIXTURES_DIR" | grep -E "test-.*\.(jpg|png|txt)" || echo "No fixture files found"

echo ""
echo "Fixture setup complete!"
