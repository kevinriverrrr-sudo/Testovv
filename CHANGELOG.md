# Changelog

All notable changes to the XGPT Browser Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-11-10

### Added
- Initial release of XGPT Browser Extension
- Chrome/Chromium/Firefox Manifest V3 support
- Google Generative AI (Gemini Pro) integration
- Beautiful modern dark theme UI with animations
- Chat interface with message history
- User and AI message differentiation with avatars
- Real-time typing indicator during AI processing
- Character counter for input (2000 char limit)
- Settings modal with configuration options:
  - API key management
  - Model selection (Gemini Pro / Gemini Pro Vision)
  - Temperature control (0.0 - 1.0)
- Local storage for:
  - Chat history persistence
  - User settings
  - API key
- Clear history functionality
- Status bar with real-time feedback
- Comprehensive error handling:
  - Network errors
  - API errors
  - Timeout handling (30s)
  - Invalid API key detection
- Input validation and sanitization
- XSS protection through HTML escaping
- Keyboard shortcuts:
  - Enter to send message
  - Shift+Enter for new line
- Welcome screen for first-time users
- Smooth animations and transitions
- Responsive design
- Cross-browser compatibility
- Service worker background script
- Extension icons (16px, 48px, 128px)
- Comprehensive documentation:
  - README.md with feature overview
  - INSTALLATION.md with detailed setup guide
  - CHANGELOG.md for version tracking
- Pre-configured default API key for immediate use
- Auto-scroll to latest messages
- Message timestamps
- Loading states and visual feedback

### Technical Features
- Vanilla JavaScript (no dependencies)
- CSS3 with modern features
- Chrome Storage API integration
- Fetch API with timeout and abort controller
- Content Security Policy enforcement
- HTTPS-only API communication
- Proper async/await error handling
- Event-driven architecture
- Modular code structure

### Security
- API key stored locally only
- No external tracking or analytics
- No data collection
- Direct API communication only
- Input sanitization
- XSS protection
- HTTPS enforcement

### Performance
- Lightweight codebase
- Fast load times
- Efficient storage usage
- Optimized API calls
- Smooth 60fps animations

## [Unreleased]

### Planned Features
- Context-aware conversations (conversation history in API calls)
- Code syntax highlighting in responses
- Markdown rendering support
- Export chat history (TXT, JSON)
- Import/Export settings
- Multiple conversation threads
- Dark/Light theme toggle
- Custom theme colors
- Keyboard navigation
- Accessibility improvements (ARIA labels)
- Voice input support
- Text-to-speech for responses
- Image input support (for vision models)
- Rate limiting indicators
- Offline mode with queued messages
- Multi-language support
- Prompt templates/shortcuts
- Token usage tracking
- Cost estimation
- Search within chat history
- Pin important messages
- Copy message to clipboard button
- Regenerate response option
- Edit and resend messages
- System prompt customization
- Advanced model parameters
- Response streaming
- Custom API endpoint support
- Proxy configuration
- Browser action badge with unread count
- Context menu integration
- Keyboard shortcut customization
- Extension options page
- Statistics dashboard
- Privacy mode (disable history)
- Backup and restore functionality

---

## Version History

- **1.0.0** (2024-11-10) - Initial Release

---

**Note**: This extension is under active development. Feature requests and bug reports are welcome!
