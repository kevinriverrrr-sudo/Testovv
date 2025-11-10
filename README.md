# XGPT Browser Extension

🤖 AI-powered chat assistant browser extension with Google Generative AI integration.

## 📋 Features

- **Chrome/Chromium/Firefox Compatible** - Manifest V3 support
- **Google Generative AI Integration** - Powered by Gemini Pro model
- **Beautiful UI/UX** - Modern dark theme with smooth animations
- **Chat History** - Automatically saves and restores conversation history
- **Customizable Settings** - Configure API key, model, and temperature
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Cross-browser Support** - Works on Chrome, Chromium, Edge, and Firefox

## 🚀 Installation

### Chrome/Chromium/Edge

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The XGPT icon should appear in your browser toolbar

### Firefox

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select the `manifest.json` file from the extension directory
5. The XGPT icon should appear in your browser toolbar

## 🔧 Configuration

### Default API Key

The extension comes with a pre-configured API key:
```
AIzaSyCOecNn-dxdGUrN4sz5Y9AXk-sO4Hn6_Qc
```

### Changing the API Key

1. Click the XGPT icon in your browser toolbar
2. Click the settings icon (⚙️) in the top right
3. Enter your Google Generative AI API key
4. Select your preferred model (Gemini Pro recommended)
5. Adjust temperature (0.0 - 1.0) for response creativity
6. Click "Save"

### Getting Your Own API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into the extension settings

## 📖 Usage

1. **Click the XGPT icon** in your browser toolbar to open the popup
2. **Type your question** in the input field at the bottom
3. **Press Enter** or click the "Send" button
4. **View the AI response** in the chat window
5. **Continue the conversation** - all history is automatically saved

### Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message

### Managing History

- Click the trash icon (🗑️) in the header to clear all chat history
- History is stored locally in your browser and never sent to external servers

## 🏗️ Project Structure

```
xgpt-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Main popup UI
├── popup.css             # Styles and theming
├── popup.js              # Main application logic
├── background.js         # Service worker for background tasks
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## 🛠️ Technical Details

### Technologies Used

- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No external dependencies
- **CSS3** - Modern styling with animations
- **Google Generative AI API** - Gemini Pro model
- **Chrome Storage API** - Local data persistence

### API Integration

The extension uses the Google Generative AI REST API:

**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

**Request Format:**
```json
{
  "contents": [{
    "parts": [{"text": "Your message here"}]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "topK": 40,
    "topP": 0.95,
    "maxOutputTokens": 2048
  }
}
```

### Data Storage

All data is stored locally using Chrome's Storage API:

- `xgpt_chat_history` - Conversation history
- `xgpt_api_key` - User's API key
- `xgpt_model` - Selected AI model
- `xgpt_temperature` - Temperature setting

### Security Features

- API key stored locally (never transmitted except to Google API)
- Content Security Policy enforced
- HTTPS-only API communication
- Input validation and sanitization
- XSS protection through proper HTML escaping

## 🎨 Customization

### Changing the Theme

Edit `popup.css` and modify the CSS custom properties:

```css
:root {
    --primary-color: #6366f1;
    --bg-color: #0f172a;
    --text-color: #f1f5f9;
    /* ... more variables */
}
```

### Adding New Features

1. **Popup functionality** - Edit `popup.js`
2. **Background tasks** - Edit `background.js`
3. **UI changes** - Edit `popup.html` and `popup.css`

## 🔒 Privacy

- **No data collection** - All data stays on your device
- **No external tracking** - No analytics or telemetry
- **Local storage only** - Chat history never leaves your browser
- **Direct API calls** - Communication only with Google's AI API

## ⚠️ Error Handling

The extension handles various error scenarios:

- **Invalid API key** - Prompts user to check settings
- **Network errors** - Shows connection error message
- **API timeouts** - 30-second timeout with user notification
- **Rate limiting** - Displays appropriate error message
- **Empty responses** - Handles gracefully with error message

## 🐛 Troubleshooting

### Extension doesn't load

- Ensure all files are present in the directory
- Check that icons exist in the `icons/` folder
- Verify manifest.json is valid JSON

### API requests fail

- Verify your API key is correct in settings
- Check your internet connection
- Ensure the API key has not exceeded quota
- Try using the default API key

### Chat history not saving

- Check browser's local storage permissions
- Clear browser cache and reload extension
- Verify no browser extensions are blocking storage

## 📝 Development

### Prerequisites

- Node.js (for any build tools, optional)
- Chrome/Chromium browser
- Text editor or IDE

### Testing

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the XGPT extension card
4. Test the changes in the popup

### Building for Production

The extension is production-ready as-is. For distribution:

1. Remove any debug code
2. Update version in `manifest.json`
3. Zip the entire directory (excluding .git)
4. Upload to Chrome Web Store or Firefox Add-ons

## 📄 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For issues or questions, please open an issue on the repository.

## 🎉 Acknowledgments

- Google Generative AI for the Gemini API
- Icons created with Python PIL
- Design inspired by modern chat interfaces

---

**Made with ❤️ for the AI community**
