#!/bin/bash

# VK Video Downloader - Package Script
# Creates a distributable ZIP file of the extension

set -e

echo "🎁 Packaging VK Video Downloader..."

# Extension name and version
EXTENSION_NAME="vk-video-downloader"
VERSION="1.0.0"
OUTPUT_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

# Files to include in the package
FILES=(
    "manifest.json"
    "content.js"
    "background.js"
    "styles.css"
    "popup.html"
    "popup.js"
    "icons/icon48.png"
    "icons/icon128.png"
    "README.md"
    "LICENSE"
)

# Remove old package if exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "📦 Removing old package..."
    rm "$OUTPUT_FILE"
fi

# Create ZIP package
echo "📦 Creating package: $OUTPUT_FILE"
zip -q "$OUTPUT_FILE" "${FILES[@]}"

# Get file size
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)

echo "✅ Package created successfully!"
echo "📊 Package size: $FILE_SIZE"
echo "📁 Location: $(pwd)/$OUTPUT_FILE"
echo ""
echo "🚀 Ready for distribution!"
echo ""
echo "To install:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the extension folder (or extract this ZIP first)"
