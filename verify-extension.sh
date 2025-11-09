#!/bin/bash

echo "=========================================="
echo "Funpay Competitor Analyzer - Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check manifest.json
echo -n "Checking manifest.json... "
if [ -f "manifest.json" ]; then
    if python3 -m json.tool manifest.json > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Valid${NC}"
    else
        echo -e "${RED}✗ Invalid JSON${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check JavaScript files
echo ""
echo "Checking JavaScript files:"

JS_FILES=(
    "background/service-worker.js"
    "content/content-script.js"
    "popup/popup.js"
    "options/options.js"
)

for file in "${JS_FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
        else
            echo -e "${RED}✗ Syntax error${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Not found${NC}"
        exit 1
    fi
done

# Check HTML files
echo ""
echo "Checking HTML files:"

HTML_FILES=(
    "popup/popup.html"
    "options/options.html"
)

for file in "${HTML_FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Not found${NC}"
        exit 1
    fi
done

# Check CSS files
echo ""
echo "Checking CSS files:"

CSS_FILES=(
    "content/content-styles.css"
    "popup/popup.css"
    "options/options.css"
)

for file in "${CSS_FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Not found${NC}"
        exit 1
    fi
done

# Check icons
echo ""
echo "Checking icons:"

ICON_FILES=(
    "assets/icons/icon16.png"
    "assets/icons/icon48.png"
    "assets/icons/icon128.png"
)

for file in "${ICON_FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Not found (using placeholder)${NC}"
    fi
done

# Check documentation
echo ""
echo "Checking documentation:"

DOC_FILES=(
    "README.md"
    "INSTALL.md"
    "QUICKSTART.md"
    "TESTING.md"
    "CONTRIBUTING.md"
    "CHANGELOG.md"
)

for file in "${DOC_FILES[@]}"; do
    echo -n "  $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Not found${NC}"
    fi
done

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}✓ All checks passed!${NC}"
echo "=========================================="
echo ""
echo "Extension is ready to load!"
echo ""
echo "Next steps:"
echo "  1. Open chrome://extensions/ (or edge://extensions/)"
echo "  2. Enable 'Developer mode'"
echo "  3. Click 'Load unpacked'"
echo "  4. Select this directory"
echo ""
echo "For Firefox:"
echo "  1. Open about:debugging"
echo "  2. Click 'This Firefox' → 'Load Temporary Add-on'"
echo "  3. Select manifest.json from this directory"
echo ""
