#!/bin/bash

# Project Verification Script
# Checks that all essential files are present

echo "🔍 Verifying VPN Extension MVP Project..."
echo ""

errors=0

# Check essential files
echo "📁 Checking essential files..."

files=(
  "manifest.json"
  "package.json"
  "tsconfig.json"
  "webpack.config.js"
  "README.md"
  ".gitignore"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
    ((errors++))
  fi
done

echo ""
echo "📂 Checking directories..."

dirs=(
  "src/background"
  "src/popup"
  "src/options"
  "src/content"
  "src/lib"
  "server/routes"
  "public/icons"
  "public/rules"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir"
  else
    echo "❌ Missing: $dir"
    ((errors++))
  fi
done

echo ""
echo "🔧 Checking source files..."

src_files=(
  "src/background/index.ts"
  "src/popup/index.ts"
  "src/options/index.ts"
  "src/content/index.ts"
  "src/lib/types.ts"
  "src/lib/storage.ts"
  "src/lib/api.ts"
)

for file in "${src_files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
    ((errors++))
  fi
done

echo ""
echo "🖼️  Checking icons..."

icons=(
  "public/icons/icon16.png"
  "public/icons/icon48.png"
  "public/icons/icon128.png"
)

for icon in "${icons[@]}"; do
  if [ -f "$icon" ]; then
    echo "✅ $icon"
  else
    echo "❌ Missing: $icon"
    ((errors++))
  fi
done

echo ""
echo "📄 Checking documentation..."

docs=(
  "README.md"
  "QUICKSTART.md"
  "ARCHITECTURE.md"
  "CONTRIBUTING.md"
  "LICENSE"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✅ $doc"
  else
    echo "❌ Missing: $doc"
    ((errors++))
  fi
done

echo ""
echo "================================"

if [ $errors -eq 0 ]; then
  echo "✨ All checks passed! Project is complete."
  echo ""
  echo "Next steps:"
  echo "1. npm install"
  echo "2. npm run build"
  echo "3. Load extension in browser"
  echo ""
  exit 0
else
  echo "⚠️  Found $errors missing files/directories"
  echo "Please ensure all essential files are present."
  echo ""
  exit 1
fi
