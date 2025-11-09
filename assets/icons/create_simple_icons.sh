#!/bin/bash

# Create simple placeholder PNG icons using ImageMagick if available, otherwise create minimal files
if command -v convert &> /dev/null; then
    convert -size 16x16 xc:none -fill "#667eea" -draw "roundrectangle 0,0 16,16 3,3" -fill white -draw "polyline 5,8 7,10 11,6" icon16.png
    convert -size 48x48 xc:none -fill "#667eea" -draw "roundrectangle 0,0 48,48 8,8" -fill white -draw "polyline 14,24 21,31 34,18" icon48.png
    convert -size 128x128 xc:none -fill "#667eea" -draw "roundrectangle 0,0 128,128 20,20" -fill white -draw "polyline 38,64 56,82 90,48" icon128.png
    echo "Icons created with ImageMagick"
else
    # Create minimal 1x1 transparent PNG files as placeholders
    echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon16.png
    echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon48.png
    echo -n "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon128.png
    echo "Placeholder icons created"
fi
