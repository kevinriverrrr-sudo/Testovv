# SA-MP AFK Menu - MoonLoader Script

A feature-rich Lua script for SA-MP (San Andreas Multiplayer) that provides an advanced AFK (Away From Keyboard) system with automatic responses and status indicators.

## Features

- 🎮 **Command-activated menu**: `/afk` or `/Afk` to open settings
- 📊 **Three AFK statuses**: Away, Do Not Disturb, Online
- 🤖 **Auto-response system**: Automatically replies to incoming private messages
- 📺 **On-screen indicator**: Visual AFK status display
- ⚙️ **Persistent settings**: Configuration saved to INI file
- 🛑 **Auto-stop player**: Player stops moving when AFK is activated
- 🚫 **Anti-spam protection**: One response per player per 5 minutes
- 🔄 **Smart deactivation**: Auto-disable AFK when sending messages/commands

## Requirements

### MoonLoader Libraries:

- **MoonLoader** - Main script loader
- **mimgui** - For GUI rendering
- **samp.events** - For event handling
- **inicfg** - For configuration management
- **encoding** - For text encoding (CP1251/UTF-8)

## Installation

1. Install MoonLoader in your GTA San Andreas directory
2. Download and install the `mimgui` library to `moonloader/lib/`
3. Copy `afk_menu.lua` to the `moonloader/` folder
4. Launch the game and join any SA-MP server
5. Type `/afk` to open the menu

## Usage

### Commands

- `/afk` or `/Afk` - Opens the AFK settings menu

### Menu Options

1. **Enable AFK Mode** - Checkbox to activate/deactivate AFK
2. **Status Selection** - Radio buttons to choose your status:
   - 🟡 Away - Temporarily away from keyboard
   - 🔴 Do Not Disturb - Busy, please don't disturb
   - 🟢 Online - Online but possibly away
3. **AFK Message** - Custom message sent as auto-response
4. **Save Settings** - Button to save configuration

### Automatic Features

- Player stops moving when AFK is activated
- Automatic responses to private messages
- On-screen status indicator shows "[AFK] Status"
- Settings automatically saved to `afk_menu.ini`
- AFK mode disabled when you send any message/command (except `/afk`)

## Files

- `afk_menu.lua` - Main script file
- `afk_menu.ini` - Configuration file (auto-generated)
- `README.md` - Documentation (Russian)
- `README_EN.md` - This file (English)
- `DOCUMENTATION_RU.md` - Detailed technical documentation (Russian)
- `INSTALL_RU.md` - Installation guide (Russian)
- `QUICKSTART_RU.md` - Quick start guide (Russian)
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT License

## Configuration File Format

```ini
[settings]
afk_enabled=false
afk_status=0
afk_message=I'm currently AFK, message me later!
```

### Status Values:
- `0` = Away
- `1` = Do Not Disturb
- `2` = Online

## Supported PM Formats

The script automatically detects private messages in these formats:
- `Player whispers:`
- `Private message from Player:`
- `PM from Player:`
- `[PM] from Player:`

### Custom PM Format

If your server uses a different format, you can add it in the `sampev.onServerMessage` function. See `DOCUMENTATION_RU.md` for details.

## Technical Details

- **Encoding**: CP1251 (default for SA-MP), UTF-8 for GUI
- **GUI Framework**: ImGui via mimgui
- **Event System**: samp.events
- **Configuration**: INI format via inicfg
- **Anti-spam**: 5-minute cooldown per player

## Development

### File Structure

```
afk_menu.lua
├── Script metadata
├── Library imports
├── INI configuration
├── ImGui variables
├── Main function
├── AFK control functions
├── SAMP event handlers
└── GUI rendering
```

### Key Functions

- `activateAFK()` - Activates AFK mode and stops player
- `deactivateAFK()` - Deactivates AFK mode
- `getAfkStatusText()` - Returns formatted status text
- `saveConfig()` - Saves settings to INI file
- `sampev.onServerMessage()` - Handles incoming messages and auto-responses
- `sampev.onSendChat()` - Auto-disables AFK on chat
- `sampev.onSendCommand()` - Auto-disables AFK on commands

## Version

**1.0.0** - Initial release

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check `moonloader.log` for error details
2. Ensure all required libraries are installed
3. Verify MoonLoader compatibility with your SA-MP version
4. Visit MoonLoader community forums at blast.hk

## Credits

- Script Author: MoonLoader Community
- ImGui: Dear ImGui
- MoonLoader: blast.hk

---

🇷🇺 **Русская документация**: См. `README.md`, `DOCUMENTATION_RU.md`, `INSTALL_RU.md`  
🇬🇧 **English Documentation**: This file
