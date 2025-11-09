# Contributing to AFK Menu

Thank you for your interest in contributing to the AFK Menu script for SA-MP!

## How to Contribute

### Reporting Bugs

If you find a bug, please report it by:

1. Checking if the bug has already been reported
2. Providing detailed information:
   - SA-MP version
   - MoonLoader version
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Error messages from `moonloader.log`

### Suggesting Features

Feature suggestions are welcome! Please provide:

1. Clear description of the feature
2. Use case (why it's needed)
3. Expected behavior
4. Potential implementation ideas (optional)

### Code Contributions

#### Before You Start

1. Check existing issues/features
2. Discuss major changes first
3. Follow the coding style guide below

#### Coding Style Guide

**General Rules:**
- Use snake_case for variables and functions
- Use camelCase for function names in some cases (already established pattern)
- Comments in Russian for consistency
- Meaningful variable names
- Keep functions small and focused

**Lua Conventions:**
```lua
-- Good
local my_variable = "value"
local function myFunction()
    -- код
end

-- Bad
local MyVariable = "value"
local function my_function()
    -- код
end
```

**ImGui Variables:**
```lua
local window_state = imgui.new.bool(false)
local slider_value = imgui.new.int(0)
local input_buffer = imgui.new.char[256]()
```

**Event Handlers:**
```lua
function sampev.onEventName(param1, param2)
    -- Обработка события
end
```

**Comments:**
```lua
-- Краткое описание функции
function myFunction()
    -- Комментарий к блоку кода
    local result = doSomething()
    
    -- Другой комментарий
    return result
end
```

#### Code Structure

**File Organization:**
```lua
-- 1. Script metadata
script_name("Name")
script_author("Author")
-- ...

-- 2. Library imports
local lib = require 'library'

-- 3. Configuration
local config = {...}

-- 4. Variables
local myVar = value

-- 5. Helper functions
local function helper()
end

-- 6. Main function
function main()
end

-- 7. Event handlers
function sampev.onEvent()
end

-- 8. GUI rendering
imgui.OnFrame(...)
```

#### Testing

Before submitting:

1. Test in actual SA-MP environment
2. Check for Lua syntax errors
3. Verify all features work
4. Test edge cases
5. Check memory leaks (long-running test)
6. Verify INI file operations

#### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

**Commit Message Format:**
```
Short description (50 chars or less)

Detailed explanation if needed:
- What changed
- Why it changed
- How it works

Fixes #issue_number (if applicable)
```

**Example:**
```
Add hotkey support for quick AFK toggle

- Implemented F9 hotkey to toggle AFK
- Added configuration option for custom hotkey
- Updated documentation

Fixes #42
```

## Development Setup

### Requirements

1. GTA San Andreas
2. SA-MP Client (0.3.7+)
3. MoonLoader (latest)
4. mimgui library
5. Text editor (VSCode, Sublime, etc.)

### Recommended Tools

**VSCode Extensions:**
- Lua Language Server
- Lua Debug
- GitLens

**Lua Formatter:**
- LuaFormatter or StyLua

### Local Testing

1. Place modified script in `moonloader/`
2. Launch GTA SA-MP
3. Check `moonloader.log` for errors
4. Test functionality in-game
5. Monitor performance

### Debug Mode

Add debug logging:
```lua
local DEBUG = true

local function debug_log(message)
    if DEBUG then
        sampAddChatMessage('[DEBUG] ' .. message, 0xFFFFFF)
    end
end
```

## Feature Request Guidelines

### Good Feature Requests

✅ **Good Example:**
```
Title: Add AFK duration timer

Description:
Display how long the player has been AFK in the on-screen indicator.

Use Case:
Players want to know how long they've been away to estimate if they'll
be kicked by server timeout.

Implementation Ideas:
- Add os.time() tracking when AFK activates
- Calculate difference in main loop
- Display as "[AFK] Away (5m 30s)"
```

❌ **Bad Example:**
```
Title: Make it better

Description:
Add more features

Use Case:
Because it needs more stuff
```

## Bug Report Guidelines

### Good Bug Reports

✅ **Good Example:**
```
Title: Auto-response not working on Server X

Description:
When receiving PM on server "ServerName", the auto-response does not send.

Environment:
- SA-MP: 0.3.7-R4
- MoonLoader: v.027
- Server: ServerName IP:7777

Steps to Reproduce:
1. Enable AFK mode
2. Have another player send PM
3. No auto-response sent

Expected:
Auto-response should be sent to player

Actual:
Nothing happens, no response sent

Logs:
[paste relevant lines from moonloader.log]

Additional Info:
Server uses custom PM format: "MSG from Player: text"
```

❌ **Bad Example:**
```
Title: Doesn't work

Description:
It's broken

Expected:
Should work

Actual:
Doesn't work
```

## Code Review Checklist

When reviewing code (or self-reviewing):

- [ ] Code follows style guide
- [ ] Comments in Russian
- [ ] No syntax errors
- [ ] No obvious bugs
- [ ] Functions are focused
- [ ] Variable names are clear
- [ ] Error handling present
- [ ] Memory leaks checked
- [ ] Performance considered
- [ ] Documentation updated
- [ ] Backwards compatible (if applicable)

## Documentation Standards

### Code Comments

**Function Documentation:**
```lua
-- Активирует AFK режим
-- Останавливает движение игрока и сохраняет позицию
function activateAFK()
    -- код
end
```

**Complex Logic:**
```lua
-- Проверяем различные форматы PM, так как разные сервера
-- используют разные форматы личных сообщений
local sender = text:match("^(%w+) шепчет:")
if not sender then
    sender = text:match("^Личное сообщение от (%w+):")
end
```

### Documentation Files

When adding features, update:
- `README.md` - Main documentation
- `DOCUMENTATION_RU.md` - Technical details
- `CHANGELOG.md` - Version history
- `FEATURES.md` - Feature showcase (if applicable)

## Version Numbering

Follow Semantic Versioning (SemVer):

- **MAJOR**: Breaking changes (2.0.0)
- **MINOR**: New features, backwards compatible (1.1.0)
- **PATCH**: Bug fixes (1.0.1)

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Look at existing code for examples
3. Ask in Issues section
4. Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Added to contributors list
- Mentioned in changelog
- Credited in code (for significant contributions)

## Thank You!

Your contributions make this project better for everyone!
