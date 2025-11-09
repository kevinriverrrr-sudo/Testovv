# Документация AFK Menu для SA-MP MoonLoader

## Описание

AFK Menu - это продвинутый Lua скрипт для SA-MP, работающий на базе MoonLoader. Скрипт предоставляет полнофункциональную систему AFK (Away From Keyboard) с автоматическими ответами на личные сообщения и визуальным индикатором статуса.

## Архитектура скрипта

### Структура файла

```
afk_menu.lua
├── Метаданные скрипта (название, автор, версия)
├── Подключение библиотек
├── Конфигурация INI
├── ImGui переменные
├── Основная функция main()
├── Функции управления AFK
├── Обработчики событий SAMP
└── Отрисовка GUI меню
```

### Основные компоненты

#### 1. Система конфигурации

Скрипт использует `inicfg` для сохранения настроек в файл `afk_menu.ini`:

```lua
local ini = inicfg.load({
    settings = {
        afk_enabled = false,      -- Включен ли AFK режим
        afk_status = 0,           -- Текущий статус (0-2)
        afk_message = 'текст'     -- Сообщение автоответа
    }
}, configIni)
```

#### 2. Статусы AFK

Доступны три статуса:
- **0 - Away**: Игрок временно отсутствует
- **1 - Do Not Disturb**: Не беспокоить
- **2 - Online**: В сети (легкий AFK)

#### 3. Система автоответа

```lua
function sampev.onServerMessage(color, text)
    -- Определяет отправителя личного сообщения
    -- Отправляет автоматический ответ
    -- Запоминает игрока на 5 минут (защита от спама)
end
```

## Детальное описание функций

### activateAFK()

Активирует AFK режим:
1. Проверяет, что игрок заспавнен
2. Сохраняет текущую позицию игрока
3. Останавливает все движения (сбрасывает игровые клавиши)
4. Устанавливает флаг `isPlayerAfk = true`
5. Очищает список игроков, которым был отправлен автоответ
6. Выводит сообщение в чат

```lua
function activateAFK()
    if not sampIsLocalPlayerSpawned() then return end
    
    local result, ped = sampGetCharHandleBySampPlayerId(select(2, sampGetPlayerIdByCharHandle(PLAYER_PED)))
    if result then
        local x, y, z = getCharCoordinates(PLAYER_PED)
        lastPosition = {x = x, y = y, z = z}
        
        -- Остановка всех движений
        setGameKeyState(1, 0)
        setGameKeyState(2, 0)
        setGameKeyState(3, 0)
        setGameKeyState(4, 0)
        
        isPlayerAfk = true
        respondedPlayers = {}
    end
end
```

### deactivateAFK()

Деактивирует AFK режим:
1. Сбрасывает флаг AFK
2. Очищает список ответивших игроков
3. Выводит уведомление

### getAfkStatusText()

Возвращает отформатированный текст статуса для отображения на экране.

### Обработчик входящих сообщений

```lua
function sampev.onServerMessage(color, text)
```

Эта функция:
1. Проверяет, активен ли AFK режим
2. Ищет паттерны личных сообщений в тексте
3. Извлекает имя отправителя
4. Проверяет, не отвечали ли мы ему ранее
5. Отправляет автоответ через команду `/pm`
6. Запоминает отправителя на 5 минут

Поддерживаемые форматы PM:
```lua
"Игрок шепчет:"
"Личное сообщение от Игрок:"
"PM от Игрок:"
"[PM] от Игрок:"
```

### Обработчики сброса AFK

```lua
function sampev.onSendChat(message)
function sampev.onSendCommand(command)
```

Автоматически отключают AFK при:
- Отправке любого сообщения в чат
- Использовании команд (кроме `/afk`)

## GUI Меню (ImGui)

### Компоненты интерфейса

1. **Checkbox "Включить AFK режим"**
   - Переключает состояние AFK
   - Изменения сохраняются в `ini.settings.afk_enabled`

2. **RadioButtons для выбора статуса**
   - Away
   - Do Not Disturb
   - Online
   - Каждая опция имеет подсказку при наведении

3. **InputTextMultiline для AFK сообщения**
   - Многострочное поле ввода (256 символов)
   - Размер: 560x80 пикселей
   - Автоматическое сохранение при изменении

4. **Кнопки**
   - "Сохранить настройки" - принудительное сохранение в INI
   - "Закрыть" - закрытие окна меню

### Стиль окна

```lua
imgui.SetNextWindowPos(imgui.ImVec2(500, 500), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
imgui.SetNextWindowSize(imgui.ImVec2(600, 400), imgui.Cond.FirstUseEver)
```

- Размер: 600x400 пикселей
- Позиция: центр экрана при первом открытии
- Флаг: `NoResize` - окно нельзя изменить в размере

## Визуальный индикатор

Отображается в левом верхнем углу экрана (координаты 10, 10):

```lua
if isPlayerAfk then
    renderFontDrawText(renderFont, getAfkStatusText(), 10, 10, 0xFFFFFFFF)
end
```

Формат: `[AFK] Статус`

## Команды

### /afk или /Afk

Открывает/закрывает меню настроек AFK.

```lua
sampRegisterChatCommand('afk', function()
    main_window_state[0] = not main_window_state[0]
end)
```

## Система защиты от спама

```lua
respondedPlayers = {}
```

Когда скрипт отвечает игроку:
1. Имя игрока добавляется в таблицу `respondedPlayers`
2. Запускается таймер на 5 минут (300000 мс)
3. После истечения времени имя удаляется из таблицы
4. Игрок может получить новый автоответ

```lua
lua_thread.create(function()
    wait(300000)
    respondedPlayers[sender] = nil
end)
```

## Кодировка

Скрипт использует CP1251 для совместимости с SA-MP:

```lua
encoding.default = 'CP1251'
local u8 = encoding.UTF8
```

Все русские строки в GUI оборачиваются в `u8''`.

## Жизненный цикл скрипта

1. **Инициализация**
   ```
   Загрузка библиотек → Загрузка INI → Ожидание SAMP
   ```

2. **Регистрация команд**
   ```
   /afk → Открытие меню
   ```

3. **Главный цикл**
   ```
   Проверка состояния AFK → Отрисовка индикатора → Обработка событий
   ```

4. **Обработка событий**
   ```
   Входящие PM → Автоответ → Обновление списка игроков
   ```

## Требования к серверу

Скрипт автоматически определяет формат личных сообщений вашего сервера. Если формат отличается от стандартных, необходимо добавить паттерн в функцию `sampev.onServerMessage`.

### Как добавить свой формат PM

```lua
-- Добавьте эту строку в функцию sampev.onServerMessage
local sender = text:match("^Ваш формат (%w+):")
if sender and not respondedPlayers[sender] then
    -- ... код автоответа
end
```

## Отладка

Для отладки можно добавить логирование:

```lua
sampAddChatMessage('[DEBUG] ' .. tostring(переменная), 0xFFFFFF)
```

## Возможные проблемы

### Проблема: Автоответ не работает

**Решение**: Проверьте формат личных сообщений на вашем сервере и добавьте соответствующий паттерн в код.

### Проблема: Меню не открывается

**Решение**: Убедитесь, что библиотека `mimgui` установлена корректно.

### Проблема: Настройки не сохраняются

**Решение**: Проверьте права доступа к папке MoonLoader и наличие библиотеки `inicfg`.

## Расширение функционала

### Добавление новых статусов

```lua
-- В секции статусов добавьте:
local status_names = {
    [0] = u8'Away',
    [1] = u8'Do Not Disturb',
    [2] = u8'Online',
    [3] = u8'Ваш новый статус'  -- Добавьте здесь
}

-- В меню добавьте RadioButton:
if imgui.RadioButton(u8'Ваш новый статус', afk_status, 3) then
    ini.settings.afk_status = afk_status[0]
end
```

### Добавление команды быстрой активации AFK

```lua
sampRegisterChatCommand('afkon', function()
    afk_enabled[0] = true
    ini.settings.afk_enabled = true
    saveConfig()
end)

sampRegisterChatCommand('afkoff', function()
    afk_enabled[0] = false
    ini.settings.afk_enabled = false
    saveConfig()
end)
```

## Лицензия

Свободное использование и модификация.

## Поддержка

При возникновении проблем или вопросов обращайтесь к сообществу MoonLoader.
