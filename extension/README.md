# Auto Register Form Filler Extension

A browser extension for automatically filling registration forms with randomly generated data.

## Features

- 🎯 **Smart Form Detection**: Automatically finds and identifies form fields on the registration page
- ✨ **On-Page Button**: Injects a stylish "Auto Register" button directly on the page
- 🎲 **Random Data Generation**: Generates realistic random data:
  - **Name**: Random English names (5-15 characters)
  - **Email**: Random emails with various domain providers
  - **Password**: Secure passwords (8+ chars with letters, numbers, and special characters)
- 💾 **Data Persistence**: Saves the last filled data in localStorage
- 🔄 **Re-fill Capability**: Click the button multiple times to generate new values
- 🎨 **Beautiful UI**: Styled to blend with modern website designs
- 🔔 **Toast Notifications**: Visual feedback on successful form filling
- 📱 **Responsive Design**: Works on desktop and mobile browsers
- 🛡️ **Error Handling**: Graceful error messages if fields are not found
- 🎛️ **Popup Fallback**: Alternative popup menu for manual triggering

## Installation

### Chrome/Edge (Manifest V3)

1. Download or clone this extension folder
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `extension` folder from this repository
6. The extension icon should appear in your toolbar

### Firefox

1. Download or clone this extension folder
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the `extension` folder and select the `manifest.json` file
6. The extension will be loaded temporarily (until Firefox is restarted)

**Note**: For permanent Firefox installation, you need to sign the extension through Mozilla's AMO or use Firefox Developer Edition with signing disabled.

## Usage

### Method 1: On-Page Button (Primary)

1. Navigate to `https://panel.rogen.wtf/auth/register`
2. The extension will automatically inject an "✨ Auto Register" button on the page
3. Click the button to fill all form fields with random data
4. Click again to regenerate with new values
5. Submit the form when ready

### Method 2: Popup Menu (Fallback)

1. Navigate to `https://panel.rogen.wtf/auth/register`
2. Click the extension icon in your browser toolbar
3. Click the "Auto-fill Form" button in the popup
4. The form will be filled with random data
5. View the last filled data in the popup (including password reveal option)

## How It Works

### Content Script
- Runs on `https://panel.rogen.wtf/auth/register`
- Injects the "Auto Register" button into the page
- Detects form fields by analyzing input types, names, IDs, and placeholders
- Fills detected fields with randomly generated data
- Triggers input/change events for proper form validation
- Saves data to Chrome storage

### Background Script
- Handles message passing between popup and content scripts
- Generates random data on demand
- Manages storage operations

### Popup Interface
- Provides alternative manual trigger for form filling
- Displays last filled data with password reveal toggle
- Shows helpful status messages and error handling

## Generated Data Format

### Name
- Length: 5-15 characters
- Format: Capitalized English letters
- Example: `Johnathan`, `Sarah`, `Michael`

### Email
- Format: `randomstring@domain.com`
- Random string length: 8-13 characters
- Supported domains:
  - gmail.com
  - yahoo.com
  - outlook.com
  - hotmail.com
  - protonmail.com
  - mail.com
  - icloud.com
  - zoho.com

### Password
- Length: 8-12 characters
- Contains:
  - Lowercase letters
  - Uppercase letters
  - Numbers (0-9)
  - Special characters (!@#$%^&*()_+-=[]{}|;:,.<>?)
- Example: `Xy7$pQm9!aB`

## Permissions

- **storage**: Save last filled data to local storage
- **activeTab**: Access the current tab to fill forms
- **scripting**: Inject content scripts and CSS
- **host_permissions**: Access to `https://panel.rogen.wtf/*`

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Firefox 109+ (Manifest V3 support)
- ✅ Opera 74+
- ✅ Brave (Chromium-based)

## Troubleshooting

### Button doesn't appear on the page
- Refresh the page after installing the extension
- Check that you're on the correct URL: `https://panel.rogen.wtf/auth/register`
- Use the popup menu as a fallback

### Form fields not filling
- The page structure might have changed
- Use browser DevTools console to check for errors
- Try the popup menu method instead

### Extension icon not showing
- Make sure the extension is enabled in `chrome://extensions/`
- Try restarting your browser

## Development

### File Structure
```
extension/
├── manifest.json           # Extension configuration (MV3)
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   ├── content.js         # Content script (page injection)
│   ├── content.css        # Injected button styles
│   └── background.js      # Background service worker
└── popup/
    ├── popup.html         # Popup UI
    ├── popup.css          # Popup styles
    └── popup.js           # Popup logic
```

### Making Changes

1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload the target page to see changes

## Security Note

This extension generates random data for testing purposes only. The generated passwords are cryptographically random but should not be used for real accounts. Always use a proper password manager for production credentials.

## License

This extension is provided as-is for testing and development purposes.

## Version History

### v1.0.0 (Current)
- Initial release
- On-page button injection
- Random data generation
- Popup fallback interface
- Storage persistence
- Toast notifications
- Multi-browser support (Chrome, Firefox, Edge)
