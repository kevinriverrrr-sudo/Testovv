# Browser Extension - Auto Register Form Filler

## Quick Start Guide

This project now includes a browser extension located in the `extension/` directory. The extension automatically fills registration forms on `https://panel.rogen.wtf/auth/register` with random data.

## Installation Steps

### For Chrome/Edge:

1. Open Chrome/Edge browser
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" button
5. Browse to and select the `extension/` folder from this repository
6. The extension is now installed! You'll see the icon in your toolbar

### For Firefox:

1. Open Firefox browser
2. Navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Browse to the `extension/` folder and select `manifest.json`
5. The extension is now loaded (temporary - until Firefox restart)

## How to Use

1. **Navigate** to https://panel.rogen.wtf/auth/register
2. **Look for** the "✨ Auto Register" button that appears on the page
3. **Click** the button to auto-fill the form with random data
4. **Click again** to regenerate new values
5. **Alternative**: Click the extension icon in toolbar for popup menu

## Features

- ✨ Injects button directly on the registration page
- 🎲 Generates random Name, Email, and Password
- 💾 Saves last filled data
- 🔄 Re-generate by clicking multiple times
- 🎨 Beautiful, non-intrusive UI
- 📱 Works on all modern browsers

## Documentation

For detailed documentation, see: `extension/README.md`

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── README.md             # Detailed documentation
├── icons/                # Extension icons
├── scripts/              # Content & background scripts
└── popup/               # Popup UI files
```

## Support

- Compatible with Chrome 88+, Edge 88+, Firefox 109+
- Manifest V3 compliant
- No external dependencies required

## Testing

1. Install the extension following steps above
2. Go to https://panel.rogen.wtf/auth/register
3. Verify button appears on page
4. Click button and verify form fills
5. Check browser console for any errors (should be none)

Enjoy automatic form filling! 🚀
