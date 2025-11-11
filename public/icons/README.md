# Icons

These are placeholder SVG icons. For production, convert them to PNG:

```bash
# Install imagemagick if needed
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Convert SVGs to PNGs
for size in 16 48 128; do
  convert icon$size.svg -background none icon$size.png
done
```

Or use an online converter: https://cloudconvert.com/svg-to-png
