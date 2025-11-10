#!/bin/bash

echo "🔍 Testing XGPT Browser Extension..."
echo ""

# Check required files
echo "📁 Checking required files..."
required_files=("manifest.json" "popup.html" "popup.css" "popup.js" "background.js")
missing=0

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file is missing"
        missing=$((missing + 1))
    fi
done

# Check icon files
echo ""
echo "🎨 Checking icon files..."
icon_files=("icons/icon16.png" "icons/icon48.png" "icons/icon128.png")

for file in "${icon_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file is missing"
        missing=$((missing + 1))
    fi
done

# Validate JSON
echo ""
echo "🔧 Validating manifest.json..."
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "  ✅ manifest.json is valid JSON"
else
    echo "  ❌ manifest.json has syntax errors"
    missing=$((missing + 1))
fi

# Validate JavaScript
echo ""
echo "🔧 Validating JavaScript files..."
if node -c popup.js 2>/dev/null; then
    echo "  ✅ popup.js syntax is valid"
else
    echo "  ❌ popup.js has syntax errors"
    missing=$((missing + 1))
fi

if node -c background.js 2>/dev/null; then
    echo "  ✅ background.js syntax is valid"
else
    echo "  ❌ background.js has syntax errors"
    missing=$((missing + 1))
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $missing -eq 0 ]; then
    echo "✅ All tests passed! Extension is ready to load."
    echo ""
    echo "📦 To install:"
    echo "  1. Open chrome://extensions/"
    echo "  2. Enable Developer mode"
    echo "  3. Click 'Load unpacked'"
    echo "  4. Select this directory"
    echo ""
    echo "🚀 Extension is ready for use!"
    exit 0
else
    echo "❌ $missing test(s) failed. Please fix the issues above."
    exit 1
fi
