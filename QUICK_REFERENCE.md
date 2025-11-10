# 🚀 XGPT Extension - Quick Reference Card

## 📦 Installation (30 seconds)
1. Chrome → `chrome://extensions/` → Developer mode ON → Load unpacked
2. Firefox → `about:debugging` → This Firefox → Load Temporary Add-on

## ⌨️ Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line

## 🎯 Main Features
- 💬 AI Chat with history
- 🔑 Configurable API key
- 🎨 Beautiful dark UI
- 💾 Auto-save conversations
- ⚙️ Settings: API key, model, temperature

## 🔧 Quick Settings
1. Click ⚙️ icon
2. Paste API key (optional - default provided)
3. Select model (Gemini 1.5 Flash recommended)
4. Adjust temperature (0.0-1.0)
5. Save

## 📂 File Structure
```
manifest.json    - Extension config
popup.html       - UI structure  
popup.css        - Styling
popup.js         - Main logic
background.js    - Service worker
icons/           - Extension icons
```

## 🔑 Default API Key
```
AIzaSyCOecNn-dxdGUrN4sz5Y9AXk-sO4Hn6_Qc
```

## 🌐 API Endpoint
```
https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent
```

## 🔒 Permissions
- `storage` - Save history/settings
- `host_permissions` - Google AI API access

## 🎨 UI Elements
- Header: Logo, Clear history (🗑️), Settings (⚙️)
- Chat: Scrollable message area
- Status: Real-time feedback bar
- Input: Textarea + Send button

## 📊 Data Storage (Chrome Storage API)
```javascript
xgpt_chat_history  - Message array
xgpt_api_key       - User's API key
xgpt_model         - Selected model
xgpt_temperature   - Temperature value
```

## ⚠️ Error Handling
- Network errors → Check connection
- API errors → Verify API key
- Timeout (30s) → Retry message
- Invalid key → Update in settings

## 🐛 Troubleshooting
1. Extension won't load → Check all files present
2. No response → Check API key & internet
3. History lost → Check storage permissions
4. Icons missing → Verify icons/ folder

## 🧪 Testing
```bash
./test_extension.sh
```

## 📖 Full Documentation
- `README.md` - Complete guide
- `INSTALLATION.md` - Detailed setup
- `QUICKSTART.md` - 5-minute guide
- `CHANGELOG.md` - Version history

## 🔗 Important URLs
- Get API Key: https://makersuite.google.com/app/apikey
- Chrome Extensions: chrome://extensions/
- Firefox Debug: about:debugging

## ✨ Pro Tips
- Clear history before important chats
- Use lower temperature (0.3) for factual responses
- Use higher temperature (0.9) for creative content
- Character limit: 2000 per message
- History persists across sessions

## 📱 Browser Support
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Chromium 88+
- ✅ Firefox 109+

## 🎯 Quick Commands (in chat)
Just type naturally - the AI understands context!

Examples:
- "Explain quantum computing"
- "Write a Python function to sort array"
- "Translate 'hello' to Spanish"
- "What's the weather like?" (uses AI knowledge)

## 🔐 Privacy
- ✅ Local storage only
- ✅ No analytics
- ✅ No data collection
- ✅ API key stays local

## 📞 Support
- Check console: Right-click popup → Inspect
- Read logs: background.js service worker
- Report issues: Repository issues page

---

**Version**: 1.0.0 | **Manifest**: V3 | **Status**: Production Ready ✅
