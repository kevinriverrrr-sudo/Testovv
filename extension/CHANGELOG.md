# Changelog

All notable changes to the Auto Register Form Filler extension will be documented in this file.

## [1.0.0] - 2024-11-12

### Added
- Initial release of Auto Register Form Filler extension
- Manifest V3 support for modern browsers (Chrome 88+, Edge 88+, Firefox 109+)
- Content script for automatic button injection on registration pages
- On-page "Auto Register" button with gradient styling and animations
- Random data generation for Name, Email, and Password fields
- Smart form field detection using multiple strategies (type, name, id, placeholder)
- Toast notification system for user feedback
- Background service worker for data generation and storage
- Popup interface as fallback trigger method
- Chrome storage integration for persisting last filled data
- Password visibility toggle in popup
- Responsive design for mobile and desktop
- Dark mode support with color scheme preferences
- Test page (test-page.html) for local development and testing
- Comprehensive README with installation and usage instructions
- Error handling with graceful fallbacks

### Features
- **Name Generation**: Random English names, 5-15 characters, capitalized
- **Email Generation**: Random emails with 8 popular domain providers
- **Password Generation**: Secure 8-12 character passwords with mixed case, numbers, and special characters
- **Multiple Triggers**: Both on-page button and popup menu
- **Data Persistence**: Last filled values saved to browser storage
- **Form Validation**: Triggers proper input/change events for validation
- **Multi-click Support**: Generate new values with repeated clicks
- **Visual Feedback**: Animated button with hover/active states
- **Toast Notifications**: Success and error messages with auto-dismiss

### Browser Support
- ✅ Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ Firefox 109+
- ✅ Opera 74+
- ✅ Brave (Chromium-based)

### Security
- Extension only runs on specified URLs (whitelist approach)
- No external API calls or data transmission
- All data generation happens locally in the browser
- Storage is limited to browser's local storage (not synced)

### Known Limitations
- Temporary installation in Firefox (requires signing for permanent installation)
- File URL access requires manual permission in Chrome (chrome://extensions/)
- Extension depends on standard form field attributes for detection

---

## Future Enhancements (Planned)

### v1.1.0
- [ ] Custom data templates (configurable name formats, domains, etc.)
- [ ] Export/Import last filled data
- [ ] Keyboard shortcuts for quick filling
- [ ] Option to exclude certain fields from auto-fill
- [ ] Multi-language name generation support

### v1.2.0
- [ ] Form detection improvements for non-standard forms
- [ ] Support for additional field types (phone, address, etc.)
- [ ] Visual field highlighting before filling
- [ ] Fill history with ability to reuse previous data
- [ ] Settings page for customization

### v2.0.0
- [ ] Support for multi-step registration forms
- [ ] Custom regex patterns for password generation
- [ ] Profile system (multiple saved configurations)
- [ ] Statistics dashboard (fills count, success rate, etc.)
- [ ] Cloud sync option for settings (optional)

---

## Version History

| Version | Release Date | Notes |
|---------|--------------|-------|
| 1.0.0   | 2024-11-12   | Initial release with core functionality |

---

## Feedback

Found a bug or have a feature request? Please open an issue or submit a pull request!
