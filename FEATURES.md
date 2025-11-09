# AFK Menu - Feature Showcase

## 🎮 User Features

### Simple Command Interface
```
/afk - Open/close the AFK menu
```
One command to rule them all. Simple, intuitive, easy to remember.

### Three Status Modes

#### 🟡 Away
Perfect for short breaks. Let others know you've stepped away temporarily.

#### 🔴 Do Not Disturb
For when you're busy and don't want interruptions. Strong signal to leave you alone.

#### 🟢 Online
Light AFK status. You're at your computer but might be doing something else.

### Intelligent Auto-Response System

**What it does:**
- Detects incoming private messages automatically
- Sends your custom message to the sender
- Remembers who it responded to (no spam)
- Waits 5 minutes before responding to the same person again

**Supported PM formats:**
```
Игрок шепчет: ...
Личное сообщение от Игрок: ...
PM от Игрок: ...
[PM] от Игрок: ...
```

### Visual Feedback

**On-Screen Indicator:**
```
[AFK] Away
```
Always visible in the top-left corner when AFK is active.

**Chat Notifications:**
```
[AFK Menu] AFK режим активирован. Статус: Away
[AFK Menu] AFK режим деактивирован
[AFK Menu] Настройки успешно сохранены!
```

### Smart Player Control

**When you activate AFK:**
- ✅ Your character stops moving immediately
- ✅ All movement keys are reset
- ✅ Position is saved for reference
- ✅ You won't accidentally move

### Automatic Deactivation

**AFK turns off automatically when you:**
- Send any chat message
- Use any command (except `/afk`)
- Start interacting with the game

This means you don't have to manually disable AFK when you return!

## 🎨 Interface Features

### Modern ImGui Window

**Window Properties:**
- Size: 600x400 pixels
- Position: Centered on first open
- Style: Clean, professional, easy to read
- Non-resizable: Consistent experience

### Interactive Elements

#### Checkbox
```
☑ Включить AFK режим
```
Click to toggle AFK on/off instantly.

#### Radio Buttons
```
⚫ Away
⚪ Do Not Disturb
⚪ Online
```
Visual status selection with hover tooltips.

#### Multi-line Text Input
```
┌────────────────────────────────────────┐
│ Я сейчас AFK, напишите позже!         │
│                                        │
│                                        │
└────────────────────────────────────────┘
```
256 characters available for your message.

#### Action Buttons
```
[Сохранить настройки]  [Закрыть]
```
Clear, labeled buttons for primary actions.

### Helpful Tooltips

Hover over the `[?]` icon next to each status:
```
Away           [?] ← "Вы временно отсутствуете"
Do Not Disturb [?] ← "Вы заняты и не хотите, чтобы вас беспокоили"
Online         [?] ← "Вы в сети, но возможно отошли ненадолго"
```

## ⚙️ Technical Features

### Persistent Configuration

**Automatic saving to:**
```
moonloader/config/afk_menu.ini
```

**What's saved:**
- AFK enabled/disabled state
- Current status selection (0-2)
- Your custom AFK message

**Format:**
```ini
[settings]
afk_enabled=false
afk_status=0
afk_message=Я сейчас AFK, напишите позже!
```

### Anti-Spam Protection

**How it works:**
1. Player sends you a PM
2. Script responds with your AFK message
3. Player's name is added to cooldown list
4. Player can't receive another auto-response for 5 minutes
5. After 5 minutes, cooldown expires automatically

**Benefits:**
- Won't spam players with multiple responses
- Professional behavior
- Reduces server chat load
- Respects player experience

### Thread-Safe Operation

**Lua threads used for:**
- Delayed PM sending (500ms delay)
- Cooldown timers (5 minutes)
- Non-blocking operations

**This means:**
- No game freezing
- Smooth performance
- Reliable timing

### Encoding Support

**CP1251 for SA-MP:**
```lua
encoding.default = 'CP1251'
```
Ensures Cyrillic text works correctly in SA-MP.

**UTF-8 for GUI:**
```lua
local u8 = encoding.UTF8
u8'Русский текст'
```
Beautiful, readable text in the menu.

### Event-Driven Architecture

**Monitored events:**
- `onServerMessage` - Incoming chat messages
- `onSendChat` - Outgoing chat messages
- `onSendCommand` - Commands you type
- `onInitGame` - Game initialization

**Result:**
- Responsive to all game activities
- No polling/busy waiting
- Efficient CPU usage

## 🛡️ Safety Features

### Prevents Accidental Movement
```lua
setGameKeyState(1, 0)  -- Forward
setGameKeyState(2, 0)  -- Back
setGameKeyState(3, 0)  -- Left
setGameKeyState(4, 0)  -- Right
```
All movement keys disabled when AFK activates.

### State Validation
```lua
if not sampIsLocalPlayerSpawned() then return end
```
Won't activate if you're not spawned (prevents errors).

### Safe PM Format Detection
```lua
local sender = text:match("^(%w+) шепчет:")
if not sender then
    sender = text:match("^Личное сообщение от (%w+):")
end
-- ... more patterns
```
Multiple pattern matching prevents false positives.

## 📊 Performance Features

### Lightweight Script
- **File size**: ~9KB
- **Memory footprint**: Minimal
- **CPU usage**: Near zero when idle
- **No lag**: Optimized main loop

### Efficient Rendering
- On-screen text only renders when AFK is active
- GUI only processes when menu is open
- No unnecessary calculations

### Smart Resource Management
- Cooldown timers automatically cleaned up
- No memory leaks
- Proper garbage collection

## 🔧 Developer-Friendly Features

### Well-Commented Code
```lua
-- Активация AFK режима
-- Обработка входящих сообщений
-- Создание шрифта для отрисовки
```
Every major section clearly labeled.

### Modular Functions
```lua
activateAFK()
deactivateAFK()
getAfkStatusText()
saveConfig()
```
Easy to modify and extend.

### Extensible Architecture
Add new features easily:
- New status types
- Custom PM formats
- Additional commands
- Hotkey support

### Configuration Flexibility
```lua
local status_names = {
    [0] = u8'Away',
    [1] = u8'Do Not Disturb',
    [2] = u8'Online'
}
```
Easily customizable arrays and tables.

## 🌟 Quality of Life Features

### No Manual Setup
- Auto-generates INI file on first run
- Sensible defaults
- Works out of the box

### Forgiving Interface
- Can't break anything by clicking
- All changes are reversible
- Clear feedback on every action

### Multi-Language Ready
- Russian comments and strings
- Easy to translate
- UTF-8 support for any language

### Professional Behavior
- Doesn't spam chat
- Respects other players
- Clean, unobtrusive interface
- Server-friendly

## 📈 Statistics & Tracking

### What's Tracked
- Current AFK state
- Last player position
- List of responded players
- Cooldown timers

### What's NOT Tracked
- No personal data collection
- No statistics sent anywhere
- No telemetry
- Fully offline

## 🎯 Use Cases

### Perfect for:
- ✅ Taking bathroom breaks
- ✅ Getting food/drinks
- ✅ Phone calls
- ✅ Watching videos while in-game
- ✅ Waiting for friends
- ✅ Server events with downtime
- ✅ Role-play scenarios

### Not recommended for:
- ❌ AFK farming (against most server rules)
- ❌ Avoiding kick timers (may violate rules)
- ❌ Long-term AFK (consider logging out)

## 🏆 Comparison with Alternatives

### Why choose this script?

| Feature | This Script | Manual AFK | Other Scripts |
|---------|-------------|------------|---------------|
| Auto-response | ✅ | ❌ | Some |
| Status options | ✅ (3) | ❌ | Usually 1 |
| GUI menu | ✅ | ❌ | Rare |
| Anti-spam | ✅ | ❌ | Rare |
| Auto-disable | ✅ | ❌ | Rare |
| Persistent config | ✅ | ❌ | Some |
| On-screen indicator | ✅ | ❌ | Some |
| Professional look | ✅ | ❌ | Varies |

## 🔮 Future Possibilities

Potential enhancements:
- Hotkey activation
- AFK duration timer
- Response statistics
- Customizable colors
- Multiple saved messages
- Player whitelist/blacklist
- Sound notifications
- Discord webhook integration

---

**Ready to use?** See `QUICKSTART_RU.md`  
**Need help?** See `INSTALL_RU.md`  
**Want details?** See `DOCUMENTATION_RU.md`
