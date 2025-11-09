#!/bin/bash

# VK Video Downloader - Validation Script
# Checks if all required files are present and properly formatted

echo "🔍 Validating VK Video Downloader extension..."
echo ""

ERRORS=0
WARNINGS=0

# Check required files
echo "📋 Checking required files..."

REQUIRED_FILES=(
    "manifest.json"
    "content.js"
    "background.js"
    "styles.css"
    "icons/icon48.png"
    "icons/icon128.png"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check manifest.json format
echo "📄 Validating manifest.json..."
if [ -f "manifest.json" ]; then
    if python3 -m json.tool manifest.json > /dev/null 2>&1; then
        echo "  ✅ Valid JSON format"
        
        # Check manifest version
        MANIFEST_VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['manifest_version'])" 2>/dev/null)
        if [ "$MANIFEST_VERSION" = "3" ]; then
            echo "  ✅ Manifest V3 detected"
        else
            echo "  ⚠️  Manifest version: $MANIFEST_VERSION (expected 3)"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Check permissions
        PERMISSIONS=$(python3 -c "import json; print(','.join(json.load(open('manifest.json')).get('permissions', [])))" 2>/dev/null)
        if [[ "$PERMISSIONS" == *"downloads"* ]]; then
            echo "  ✅ 'downloads' permission found"
        else
            echo "  ⚠️  'downloads' permission missing"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "  ❌ Invalid JSON format"
        ERRORS=$((ERRORS + 1))
    fi
fi

echo ""

# Check JavaScript files
echo "📝 Checking JavaScript files..."

for jsfile in content.js background.js; do
    if [ -f "$jsfile" ]; then
        LINES=$(wc -l < "$jsfile")
        SIZE=$(du -h "$jsfile" | cut -f1)
        echo "  ✅ $jsfile - $LINES lines, $SIZE"
        
        # Basic syntax check (if node is available)
        if command -v node &> /dev/null; then
            if node --check "$jsfile" 2>/dev/null; then
                echo "     ✅ Syntax OK"
            else
                echo "     ⚠️  Potential syntax issues"
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    fi
done

echo ""

# Check CSS file
echo "🎨 Checking CSS file..."
if [ -f "styles.css" ]; then
    LINES=$(wc -l < "styles.css")
    SIZE=$(du -h "styles.css" | cut -f1)
    echo "  ✅ styles.css - $LINES lines, $SIZE"
fi

echo ""

# Check icons
echo "🖼️  Checking icons..."
for icon in icons/icon48.png icons/icon128.png; do
    if [ -f "$icon" ]; then
        SIZE=$(du -h "$icon" | cut -f1)
        if command -v identify &> /dev/null; then
            DIMENSIONS=$(identify "$icon" 2>/dev/null | awk '{print $3}')
            echo "  ✅ $icon - $SIZE, $DIMENSIONS"
        else
            echo "  ✅ $icon - $SIZE"
        fi
    fi
done

echo ""
echo "═══════════════════════════════════════"

# Summary
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Extension is ready."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Validation complete with $WARNINGS warning(s)."
    exit 0
else
    echo "❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)."
    exit 1
fi
