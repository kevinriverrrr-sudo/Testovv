# Changelog

All notable changes to the AFK Menu script will be documented in this file.

## [1.0.0] - 2024

### Added
- Initial release of AFK Menu script for SA-MP MoonLoader
- `/afk` command to open settings menu
- Three AFK status modes: Away, Do Not Disturb, Online
- Auto-response system for incoming private messages
- On-screen AFK status indicator
- ImGui-based settings menu with:
  - AFK mode toggle checkbox
  - Status selection radio buttons
  - Custom AFK message input (multi-line)
  - Save settings button
- INI configuration file for persistent settings
- Automatic player stop when AFK is activated
- Anti-spam protection (one response per player per 5 minutes)
- Automatic AFK deactivation when sending messages/commands
- Support for multiple PM format detection:
  - "Игрок шепчет:"
  - "Личное сообщение от Игрок:"
  - "PM от Игрок:"
  - "[PM] от Игрок:"
- CP1251 encoding support for Cyrillic text
- Tooltips for status options
- Version display in menu

### Features
- Player automatically stops moving when AFK is enabled
- Visual indicator shows current AFK status on screen
- Settings are automatically saved to `afk_menu.ini`
- Responsive ImGui interface (600x400px)
- Thread-safe message handling
- Position tracking when entering AFK mode

### Technical Details
- Uses `mimgui` for GUI rendering
- Uses `samp.events` for event handling
- Uses `inicfg` for configuration management
- Uses `encoding` for text encoding
- Render font created on game initialization
- Main loop runs at 0ms wait interval for responsiveness
