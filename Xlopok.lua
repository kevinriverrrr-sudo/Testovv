script_name('Xlopok Bot')
script_author('Arizona RP Helper')
script_version('1.0.0')

require 'lib.moonloader'
local imgui = require 'mimgui'
local encoding = require 'encoding'
local inicfg = require 'inicfg'
local sampev = require 'lib.samp.events'

encoding.default = 'CP1251'
local u8 = encoding.UTF8

local directIni = 'Xlopok.ini'
local ini = inicfg.load({
    settings = {
        flax_enabled = true,
        cotton_enabled = true,
        collect_delay = 1000,
        search_radius = 50.0,
        auto_collect = false
    }
}, directIni)

inicfg.save(ini, directIni)

local main_window = imgui.new.bool(false)
local flax_enabled = imgui.new.bool(ini.settings.flax_enabled)
local cotton_enabled = imgui.new.bool(ini.settings.cotton_enabled)
local collect_delay = imgui.new.int(ini.settings.collect_delay)
local search_radius = imgui.new.float(ini.settings.search_radius)
local auto_collect = imgui.new.bool(ini.settings.auto_collect)

local collecting = false
local last_collect_time = 0
local status_text = u8'Ожидание...'

local flax_models = {1408}
local cotton_models = {1409}

local arizona_ips = {
    '80.66.82.136',
    '80.66.82.137',
    '80.66.82.138',
    '80.66.82.139',
    '80.66.82.140',
    '80.66.82.141',
    '80.66.82.142',
    '80.66.82.143',
    '80.66.82.144',
    '80.66.82.145',
    '80.66.82.146',
    '80.66.82.147',
    '80.66.82.148',
    '80.66.82.149',
    '80.66.82.150'
}

function main()
    if not isSampfuncsLoaded() or not isSampLoaded() then return end
    while not isSampAvailable() do wait(100) end
    
    if not isArizonaServer() then
        sampAddChatMessage('[Xlopok Bot] {FF0000}Скрипт работает только на серверах Arizona RP!', 0xFFFFFF)
        thisScript():unload()
        return
    end
    
    sampAddChatMessage('[Xlopok Bot] {00FF00}Успешно загружен! Используйте /Xlopok для открытия меню', 0xFFFFFF)
    sampRegisterChatCommand('Xlopok', function()
        main_window[0] = not main_window[0]
    end)
    
    while true do
        wait(0)
        
        if auto_collect[0] and os.clock() - last_collect_time >= collect_delay[0] / 1000 then
            collectResources()
            last_collect_time = os.clock()
        end
    end
end

function isArizonaServer()
    local ip, port = sampGetCurrentServerAddress()
    for _, arizona_ip in ipairs(arizona_ips) do
        if ip == arizona_ip then
            return true
        end
    end
    return false
end

function collectResources()
    if not auto_collect[0] then return end
    
    local x, y, z = getCharCoordinates(PLAYER_PED)
    local collected = false
    
    if flax_enabled[0] then
        for i = 0, 2000 do
            if doesObjectExist(i) then
                local model = getObjectModel(i)
                for _, flax_model in ipairs(flax_models) do
                    if model == flax_model then
                        local ox, oy, oz = getObjectCoordinates(i)
                        local distance = getDistanceBetweenCoords3d(x, y, z, ox, oy, oz)
                        if distance <= search_radius[0] then
                            status_text = u8'Собираю лён...'
                            taskGoStraightToCoord(PLAYER_PED, ox, oy, oz, 1, -1)
                            wait(500)
                            sampSendChat('/collect')
                            wait(collect_delay[0])
                            collected = true
                            notifySuccess(u8'Лён собран!')
                            break
                        end
                    end
                end
                if collected then break end
            end
        end
    end
    
    if cotton_enabled[0] and not collected then
        for i = 0, 2000 do
            if doesObjectExist(i) then
                local model = getObjectModel(i)
                for _, cotton_model in ipairs(cotton_models) do
                    if model == cotton_model then
                        local ox, oy, oz = getObjectCoordinates(i)
                        local distance = getDistanceBetweenCoords3d(x, y, z, ox, oy, oz)
                        if distance <= search_radius[0] then
                            status_text = u8'Собираю хлопок...'
                            taskGoStraightToCoord(PLAYER_PED, ox, oy, oz, 1, -1)
                            wait(500)
                            sampSendChat('/collect')
                            wait(collect_delay[0])
                            collected = true
                            notifySuccess(u8'Хлопок собран!')
                            break
                        end
                    end
                end
                if collected then break end
            end
        end
    end
    
    if not collected then
        status_text = u8'Ресурсы не найдены в радиусе'
    end
end

function notifySuccess(text)
    sampAddChatMessage('[Xlopok Bot] {00FF00}' .. text, 0xFFFFFF)
end

function notifyError(text)
    sampAddChatMessage('[Xlopok Bot] {FF0000}' .. text, 0xFFFFFF)
end

function saveSettings()
    ini.settings.flax_enabled = flax_enabled[0]
    ini.settings.cotton_enabled = cotton_enabled[0]
    ini.settings.collect_delay = collect_delay[0]
    ini.settings.search_radius = search_radius[0]
    ini.settings.auto_collect = auto_collect[0]
    inicfg.save(ini, directIni)
    notifySuccess(u8'Настройки сохранены!')
end

imgui.OnFrame(function() return main_window[0] end, function(player)
    local resX, resY = getScreenResolution()
    imgui.SetNextWindowPos(imgui.ImVec2(resX / 2, resY / 2), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
    imgui.SetNextWindowSize(imgui.ImVec2(500, 400), imgui.Cond.FirstUseEver)
    
    imgui.Begin(u8'Xlopok Bot - Меню управления', main_window, imgui.WindowFlags.NoResize)
    
    imgui.TextColored(imgui.ImVec4(0.2, 0.8, 0.2, 1.0), u8'═══════════════════════════════════════════')
    imgui.TextColored(imgui.ImVec4(1.0, 1.0, 0.0, 1.0), u8'Бот сбора льна и хлопка для Arizona RP')
    imgui.TextColored(imgui.ImVec4(0.2, 0.8, 0.2, 1.0), u8'═══════════════════════════════════════════')
    imgui.Spacing()
    
    imgui.TextColored(imgui.ImVec4(0.8, 0.8, 0.8, 1.0), u8'Статус: ')
    imgui.SameLine()
    if auto_collect[0] then
        imgui.TextColored(imgui.ImVec4(0.0, 1.0, 0.0, 1.0), u8'Активен')
    else
        imgui.TextColored(imgui.ImVec4(1.0, 0.0, 0.0, 1.0), u8'Неактивен')
    end
    imgui.Spacing()
    
    imgui.Text(u8'Последнее действие: ' .. status_text)
    imgui.Spacing()
    imgui.Separator()
    imgui.Spacing()
    
    if imgui.Checkbox(u8'Автоматический сбор', auto_collect) then
        if auto_collect[0] then
            notifySuccess(u8'Автоматический сбор включен')
            status_text = u8'Начинаю работу...'
        else
            notifySuccess(u8'Автоматический сбор выключен')
            status_text = u8'Ожидание...'
        end
    end
    imgui.Spacing()
    
    imgui.TextColored(imgui.ImVec4(0.5, 0.8, 1.0, 1.0), u8'Настройки сбора:')
    imgui.Separator()
    imgui.Spacing()
    
    if imgui.Checkbox(u8'Собирать лён', flax_enabled) then
        if flax_enabled[0] then
            notifySuccess(u8'Сбор льна включен')
        else
            notifySuccess(u8'Сбор льна выключен')
        end
    end
    
    if imgui.Checkbox(u8'Собирать хлопок', cotton_enabled) then
        if cotton_enabled[0] then
            notifySuccess(u8'Сбор хлопка включен')
        else
            notifySuccess(u8'Сбор хлопка выключен')
        end
    end
    
    imgui.Spacing()
    imgui.TextColored(imgui.ImVec4(0.5, 0.8, 1.0, 1.0), u8'Параметры:')
    imgui.Separator()
    imgui.Spacing()
    
    imgui.PushItemWidth(200)
    if imgui.SliderInt(u8'Задержка сбора (мс)', collect_delay, 500, 5000) then
    end
    
    if imgui.SliderFloat(u8'Радиус поиска (м)', search_radius, 10.0, 100.0, '%.1f') then
    end
    imgui.PopItemWidth()
    
    imgui.Spacing()
    imgui.Separator()
    imgui.Spacing()
    
    if imgui.Button(u8'Сохранить настройки', imgui.ImVec2(200, 30)) then
        saveSettings()
    end
    
    imgui.SameLine()
    
    if imgui.Button(u8'Закрыть меню', imgui.ImVec2(200, 30)) then
        main_window[0] = false
    end
    
    imgui.Spacing()
    imgui.Separator()
    imgui.Spacing()
    
    imgui.TextColored(imgui.ImVec4(0.7, 0.7, 0.7, 0.8), u8'Версия: 1.0.0 | Arizona RP Helper')
    
    imgui.End()
end)

function sampev.onServerMessage(color, text)
    if text:find('успешно собрали') or text:find('Вы собрали') then
        status_text = u8'Ресурс успешно собран!'
    end
end
