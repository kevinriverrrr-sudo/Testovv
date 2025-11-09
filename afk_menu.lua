script_name("AFK Menu")
script_author("MoonLoader")
script_description("Advanced AFK system with auto-response and status indicator")
script_version("1.0.0")

-- Подключение необходимых библиотек
local imgui = require 'mimgui'
local encoding = require 'encoding'
local sampev = require 'samp.events'
local inicfg = require 'inicfg'

encoding.default = 'CP1251'
local u8 = encoding.UTF8

-- Конфигурация INI файла
local configIni = 'afk_menu.ini'
local ini = inicfg.load({
    settings = {
        afk_enabled = false,
        afk_status = 0, -- 0 = Away, 1 = Do Not Disturb, 2 = Online
        afk_message = u8'Я сейчас AFK, напишите позже!'
    }
}, configIni)

-- Сохранение конфигурации
local function saveConfig()
    inicfg.save(ini, configIni)
end

-- ImGui переменные
local main_window_state = imgui.new.bool(false)
local afk_enabled = imgui.new.bool(ini.settings.afk_enabled)
local afk_status = imgui.new.int(ini.settings.afk_status)
local afk_message = imgui.new.char[256](ini.settings.afk_message)

-- Статусы AFK
local status_names = {
    [0] = u8'Away',
    [1] = u8'Do Not Disturb',
    [2] = u8'Online'
}

-- Переменные состояния
local isPlayerAfk = false
local lastPosition = {x = 0, y = 0, z = 0}
local respondedPlayers = {}

-- Главная функция скрипта
function main()
    if not isSampLoaded() or not isSampfuncsLoaded() then return end
    
    while not isSampAvailable() do wait(0) end
    
    sampRegisterChatCommand('afk', function()
        main_window_state[0] = not main_window_state[0]
    end)
    
    sampRegisterChatCommand('Afk', function()
        main_window_state[0] = not main_window_state[0]
    end)
    
    sampAddChatMessage('[AFK Menu] {FFFFFF}Скрипт загружен. Используйте {00FF00}/afk{FFFFFF} для открытия меню', 0x00FF00)
    
    while true do
        wait(0)
        
        -- Проверка состояния AFK
        if afk_enabled[0] and not isPlayerAfk then
            activateAFK()
        elseif not afk_enabled[0] and isPlayerAfk then
            deactivateAFK()
        end
        
        -- Отрисовка индикатора AFK на экране
        if isPlayerAfk then
            renderFontDrawText(renderFont, getAfkStatusText(), 10, 10, 0xFFFFFFFF)
        end
    end
end

-- Активация AFK режима
function activateAFK()
    if not sampIsLocalPlayerSpawned() then return end
    
    local result, ped = sampGetCharHandleBySampPlayerId(select(2, sampGetPlayerIdByCharHandle(PLAYER_PED)))
    if result then
        local x, y, z = getCharCoordinates(PLAYER_PED)
        lastPosition = {x = x, y = y, z = z}
        
        -- Остановка игрока
        setGameKeyState(1, 0)
        setGameKeyState(2, 0)
        setGameKeyState(3, 0)
        setGameKeyState(4, 0)
        
        isPlayerAfk = true
        respondedPlayers = {}
        
        sampAddChatMessage('[AFK Menu] {FFFFFF}AFK режим активирован. Статус: {FFFF00}' .. status_names[afk_status[0]], 0x00FF00)
    end
end

-- Деактивация AFK режима
function deactivateAFK()
    isPlayerAfk = false
    respondedPlayers = {}
    sampAddChatMessage('[AFK Menu] {FFFFFF}AFK режим деактивирован', 0x00FF00)
end

-- Получение текста статуса AFK
function getAfkStatusText()
    local status_colors = {
        [0] = 0xFFFFFF00, -- Yellow для Away
        [1] = 0xFFFF0000, -- Red для Do Not Disturb
        [2] = 0xFF00FF00  -- Green для Online
    }
    
    return string.format('[AFK] %s', status_names[afk_status[0]])
end

-- Обработка входящих сообщений
function sampev.onServerMessage(color, text)
    if not isPlayerAfk then return end
    if not afk_enabled[0] then return end
    
    -- Определение личного сообщения (PM)
    local sender = text:match("^(%w+) шепчет:")
    if not sender then
        sender = text:match("^Личное сообщение от (%w+):")
    end
    if not sender then
        sender = text:match("^PM от (%w+):")
    end
    if not sender then
        sender = text:match("^%[PM%] от (%w+):")
    end
    
    -- Если найден отправитель и мы еще не отвечали ему
    if sender and not respondedPlayers[sender] then
        lua_thread.create(function()
            wait(500)
            sampSendChat(string.format('/pm %s %s', sender, u8:decode(ini.settings.afk_message)))
            respondedPlayers[sender] = true
            
            -- Очистка списка через 5 минут
            lua_thread.create(function()
                wait(300000)
                respondedPlayers[sender] = nil
            end)
        end)
    end
end

-- Обработка входящих команд чата
function sampev.onSendChat(message)
    -- Сбросить AFK при отправке сообщения
    if isPlayerAfk and not message:find('^/pm') then
        afk_enabled[0] = false
        ini.settings.afk_enabled = false
        saveConfig()
    end
end

-- Обработка нажатий клавиш
function sampev.onSendCommand(command)
    -- Сбросить AFK при отправке команды (кроме /afk)
    if isPlayerAfk and not command:lower():find('^/afk') then
        afk_enabled[0] = false
        ini.settings.afk_enabled = false
        saveConfig()
    end
end

-- Отрисовка ImGui меню
imgui.OnFrame(
    function() return main_window_state[0] end,
    function(player)
        imgui.SetNextWindowPos(imgui.ImVec2(500, 500), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
        imgui.SetNextWindowSize(imgui.ImVec2(600, 400), imgui.Cond.FirstUseEver)
        
        imgui.Begin(u8'AFK Menu - Настройки', main_window_state, imgui.WindowFlags.NoResize)
        
        -- Заголовок
        imgui.TextColored(imgui.ImVec4(0.0, 1.0, 0.0, 1.0), u8'Настройки AFK системы')
        imgui.Separator()
        imgui.Spacing()
        
        -- Включение/выключение AFK
        if imgui.Checkbox(u8'Включить AFK режим', afk_enabled) then
            ini.settings.afk_enabled = afk_enabled[0]
        end
        
        imgui.Spacing()
        imgui.Separator()
        imgui.Spacing()
        
        -- Выбор статуса
        imgui.Text(u8'Статус AFK:')
        imgui.Spacing()
        
        if imgui.RadioButton(u8'Away (Отошел)', afk_status, 0) then
            ini.settings.afk_status = afk_status[0]
        end
        imgui.SameLine()
        imgui.TextDisabled(u8'[?]')
        if imgui.IsItemHovered() then
            imgui.SetTooltip(u8'Вы временно отсутствуете')
        end
        
        if imgui.RadioButton(u8'Do Not Disturb (Не беспокоить)', afk_status, 1) then
            ini.settings.afk_status = afk_status[0]
        end
        imgui.SameLine()
        imgui.TextDisabled(u8'[?]')
        if imgui.IsItemHovered() then
            imgui.SetTooltip(u8'Вы заняты и не хотите, чтобы вас беспокоили')
        end
        
        if imgui.RadioButton(u8'Online (В сети)', afk_status, 2) then
            ini.settings.afk_status = afk_status[0]
        end
        imgui.SameLine()
        imgui.TextDisabled(u8'[?]')
        if imgui.IsItemHovered() then
            imgui.SetTooltip(u8'Вы в сети, но возможно отошли ненадолго')
        end
        
        imgui.Spacing()
        imgui.Separator()
        imgui.Spacing()
        
        -- Сообщение AFK
        imgui.Text(u8'AFK сообщение:')
        imgui.PushItemWidth(560)
        if imgui.InputTextMultiline(u8'##afk_message', afk_message, 256, imgui.ImVec2(560, 80)) then
            ini.settings.afk_message = u8(ffi.string(afk_message))
        end
        imgui.PopItemWidth()
        
        imgui.Spacing()
        imgui.TextWrapped(u8'Это сообщение будет автоматически отправлено игрокам, которые напишут вам в личку.')
        
        imgui.Spacing()
        imgui.Separator()
        imgui.Spacing()
        
        -- Кнопки управления
        if imgui.Button(u8'Сохранить настройки', imgui.ImVec2(280, 30)) then
            saveConfig()
            sampAddChatMessage('[AFK Menu] {FFFFFF}Настройки успешно сохранены!', 0x00FF00)
        end
        
        imgui.SameLine()
        
        if imgui.Button(u8'Закрыть', imgui.ImVec2(280, 30)) then
            main_window_state[0] = false
        end
        
        imgui.Spacing()
        imgui.Separator()
        imgui.Spacing()
        
        -- Информация
        imgui.TextColored(imgui.ImVec4(0.5, 0.5, 0.5, 1.0), u8'Версия: 1.0.0 | Автор: MoonLoader')
        
        imgui.End()
    end
)

-- Создание шрифта для отрисовки
local renderFont = nil

function sampev.onInitGame()
    renderFont = renderCreateFont('Arial', 12, 5)
end
