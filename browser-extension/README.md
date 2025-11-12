# Auto-fill Registration Form Extension

A browser extension for Chrome, Firefox, and Edge that automatically fills the registration form on https://panel.rogen.wtf/auth/register with random data.

## Features

- **Auto-fill with Random Data**: Generates and fills random values for:
  - Name: Random English name (5-15 characters)
  - Email: Random email address with various domains
  - Password: Secure random password (12-20 characters with letters, numbers, and special characters)

- **User-Friendly Interface**: Simple popup with a single "Auto-fill" button
- **Value History**: Displays the last generated values in the popup
- **Persistent Storage**: Saves last filled values to localStorage
- **Error Handling**: Graceful error messages if form fields are not found
- **Re-fill Capability**: Generate new random values with each click

## Installation

### Chrome / Edge (Chromium-based browsers)

1. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

2. Enable "Developer mode" (toggle in the top right corner)

3. Click "Load unpacked"

4. Navigate to and select the `browser-extension` folder

5. The extension icon should now appear in your toolbar

### Firefox

1. Open Firefox and navigate to: `about:debugging#/runtime/this-firefox`

2. Click "Load Temporary Add-on"

3. Navigate to the `browser-extension` folder and select the `manifest.json` file

4. The extension will be loaded (note: temporary add-ons are removed when Firefox restarts)

**For permanent installation in Firefox:**
- Package the extension as a .xpi file and submit to Firefox Add-ons (AMO)
- Or use Firefox Developer Edition for persistent temporary extensions

## Usage

1. Navigate to https://panel.rogen.wtf/auth/register

2. Click the extension icon in your browser toolbar

3. Click the "Auto-fill" button in the popup

4. The form fields will be automatically filled with random data

5. Review the generated values in the "Last Generated Values" section

6. Click "Auto-fill" again to generate new random values if needed

7. Submit the form when ready

## Technical Details

### Manifest V3
This extension uses Manifest V3, the latest extension platform specification supported by modern browsers.

### Permissions
- `activeTab`: Access to the current active tab
- `storage`: Store last generated values
- `scripting`: Inject scripts to fill form fields
- `host_permissions`: Access to https://panel.rogen.wtf/*

### File Structure
```
browser-extension/
├── manifest.json          # Extension configuration (MV3)
├── popup.html            # Popup interface
├── popup.js              # Popup logic and form filling
├── styles.css            # Popup styling
├── content.js            # Content script for page interaction
├── background.js         # Background service worker
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Random Data Generation

### Name Generation
- Combines random first and last names from predefined lists
- Ensures length is between 5-15 characters
- Uses common English names

### Email Generation
- Random username (6-14 characters, lowercase alphanumeric)
- Random domain from popular providers:
  - gmail.com, yahoo.com, outlook.com, hotmail.com, proton.me
  - icloud.com, mail.com, zoho.com, aol.com, inbox.com

### Password Generation
- Length: 12-20 characters
- Contains at least one:
  - Lowercase letter
  - Uppercase letter
  - Number
  - Special character (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Characters are shuffled for randomness

## Error Handling

The extension includes robust error handling:
- Checks if user is on the correct page
- Verifies form fields exist before filling
- Displays user-friendly error messages
- Logs detailed errors to console for debugging

## Browser Compatibility

- ✅ Google Chrome (version 88+)
- ✅ Microsoft Edge (version 88+)
- ✅ Brave Browser
- ✅ Opera (version 74+)
- ✅ Mozilla Firefox (version 109+)

## Privacy

- No data is sent to external servers
- All data generation happens locally in your browser
- Last filled values are stored only in your browser's local storage
- No tracking or analytics

## Development

To modify the extension:

1. Edit the source files as needed
2. Reload the extension in your browser:
   - Chrome/Edge: Go to extensions page and click the reload icon
   - Firefox: Click "Reload" on the debugging page

## Troubleshooting

**Extension doesn't appear after installation:**
- Make sure Developer mode is enabled
- Check browser console for errors
- Verify all files are present in the folder

**Auto-fill button doesn't work:**
- Ensure you're on https://panel.rogen.wtf/auth/register
- Check browser console for error messages
- Try reloading the page and extension

**Form fields not filling:**
- The website structure may have changed
- Check that input fields have appropriate name/id attributes
- Review content.js and popup.js for field selectors

## License

This extension is provided as-is for educational and utility purposes.

## Support

For issues or feature requests, please check the console logs and verify:
1. You're on the correct URL
2. The form fields are visible and accessible
3. JavaScript is enabled in your browser
