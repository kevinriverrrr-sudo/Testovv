#!/bin/bash

# Package script for browser extension
# Creates a distributable ZIP file for Chrome Web Store, Firefox Add-ons, etc.

set -e

EXTENSION_NAME="autofill-registration-extension"
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
OUTPUT_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

echo "📦 Packaging Browser Extension"
echo "   Name: $EXTENSION_NAME"
echo "   Version: $VERSION"
echo ""

if [ -f "$OUTPUT_FILE" ]; then
    echo "🗑️  Removing existing package..."
    rm "$OUTPUT_FILE"
fi

echo "📋 Files to include:"
FILES=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "styles.css"
    "content.js"
    "background.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
    "README.md"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "   ❌ Missing: $file"
        exit 1
    fi
    echo "   ✓ $file"
done

echo ""
echo "🔨 Creating ZIP archive..."
zip -q "$OUTPUT_FILE" "${FILES[@]}"

if [ -f "$OUTPUT_FILE" ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Package created successfully!"
    echo "   File: $OUTPUT_FILE"
    echo "   Size: $SIZE"
    echo ""
    echo "📤 You can now upload this file to:"
    echo "   • Chrome Web Store: https://chrome.google.com/webstore/devconsole"
    echo "   • Firefox Add-ons: https://addons.mozilla.org/developers/"
    echo "   • Edge Add-ons: https://partner.microsoft.com/dashboard"
else
    echo "❌ Failed to create package"
    exit 1
fi
