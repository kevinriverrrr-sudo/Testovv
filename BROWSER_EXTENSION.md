# Browser Extension: Auto-fill Registration Form

This repository now includes a browser extension located in the `browser-extension/` directory, separate from the main Android text editor application.

## Overview

The browser extension automatically fills registration forms on https://panel.rogen.wtf/auth/register with randomly generated data.

## Quick Start

### Installation

**Chrome/Edge:**
1. Navigate to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The extension is now installed!

**Firefox:**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `browser-extension/manifest.json`
4. The extension is now loaded!

### Usage

1. Visit https://panel.rogen.wtf/auth/register
2. Click the extension icon in your browser toolbar
3. Click the "Auto-fill" button
4. Form fields will be filled with random data
5. Review the values and submit when ready

## Features

### Random Data Generation

- **Name**: Random English first and last name combinations (5-15 characters)
- **Email**: Random email with various popular domains (gmail, yahoo, outlook, etc.)
- **Password**: Secure password (12-20 characters) with:
  - Uppercase letters
  - Lowercase letters
  - Numbers
  - Special characters

### User Experience

- Simple one-button interface
- Display of last generated values
- Success/error notifications
- Persistent storage of last values
- Re-fill capability for new values

### Technical Implementation

- **Manifest V3**: Modern extension platform
- **Content Scripts**: For page interaction
- **Service Worker**: Background processing
- **Local Storage**: Value persistence
- **Error Handling**: Graceful degradation

## Project Structure

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html            # User interface
├── popup.js              # Main logic
├── styles.css            # Styling
├── content.js            # Page interaction
├── background.js         # Background service
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # Detailed documentation
```

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Firefox 109+
- ✅ Brave
- ✅ Opera 74+

## Security & Privacy

- All data generation is local (client-side)
- No external network requests
- No tracking or analytics
- Data stored only in browser local storage

## Development

To modify the extension:

1. Edit the source files in `browser-extension/`
2. Reload the extension in your browser
3. Test on the target page

## Testing

To test the extension:

1. Install the extension following the instructions above
2. Navigate to https://panel.rogen.wtf/auth/register
3. Click the extension icon and then "Auto-fill"
4. Verify all three fields (Name, Email, Password) are filled
5. Click "Auto-fill" again to verify new values are generated
6. Check the "Last Generated Values" section in the popup

## Acceptance Criteria Status

- ✅ Extension successfully installs in Chrome/Firefox/Edge
- ✅ "Auto-fill" button fills all three fields with random data
- ✅ Form validates and is ready to submit
- ✅ Repeated clicks generate new values
- ✅ Extension works stably without console errors
- ✅ Manifest V3 implementation
- ✅ Popup menu with activation button
- ✅ Graceful error handling
- ✅ localStorage for value persistence
- ✅ Success notifications
- ✅ Extension icon in toolbar

## Troubleshooting

**Fields not filling?**
- Ensure you're on https://panel.rogen.wtf/auth/register
- Check browser console for errors
- Reload the page

**Extension not appearing?**
- Enable Developer mode
- Check all files are present
- Try reinstalling

For detailed troubleshooting, see `browser-extension/README.md`.

## Related Documentation

- [Detailed Extension README](browser-extension/README.md) - Complete documentation
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## Notes

This browser extension is independent of the main Android text editor application. It can be distributed and used separately.
