script_name('Gang Helper')
script_author('cto.new')
script_version('1.0.0')
script_description('Gang Helper с автоотыгровками для Arizona RP')

local imgui = require('mimgui')
local encoding = require('encoding')
local jsoncfg = require('jsoncfg')
local sampev = require('samp.events')

encoding.default = 'CP1251'
local u8 = encoding.UTF8

local config_path = 'config/gang_config.json'
local config = jsoncfg.load(config_path)

if not config then
    config = {
        enabled = true,
        delay_between_rp = 1500,
        auto_rp_enabled = true,
        log_actions = true,
        commands = {}
    }
    jsoncfg.save(config_path, config)
end

local window = imgui.new.bool(false)
local active_tab = imgui.new.int(0)

local gang_commands = {
    {cmd = 'capture', name = 'Начать войну за территорию', params = ''},
    {cmd = 'captstats', name = 'Статистика войн', params = ''},
    {cmd = 'putmoney', name = 'Положить деньги', params = '[сумма]'},
    {cmd = 'getmoney', name = 'Снять деньги', params = '[сумма]'},
    {cmd = 'setdbuy', name = 'Установить цену закупки', params = '[цена]'},
    {cmd = 'setdsell', name = 'Установить цену продажи', params = '[цена]'},
    {cmd = 'stuff', name = 'Набить татуировку', params = ''},
    {cmd = 'unstuff', name = 'Свести татуировку', params = ''},
    {cmd = 'dropmats', name = 'Выгрузить материалы', params = ''},
    {cmd = 'sellgangzone', name = 'Продать территорию', params = '[ID банды]'}
}

local input_buffers = {}
local rp_before_buffers = {}
local rp_after_buffers = {}

for _, cmd_data in ipairs(gang_commands) do
    input_buffers[cmd_data.cmd] = imgui.new.char[256]()
    rp_before_buffers[cmd_data.cmd] = {}
    rp_after_buffers[cmd_data.cmd] = {}
    
    if config.commands[cmd_data.cmd] then
        for i = 1, 5 do
            rp_before_buffers[cmd_data.cmd][i] = imgui.new.char[256]()
            rp_after_buffers[cmd_data.cmd][i] = imgui.new.char[256]()
            
            if config.commands[cmd_data.cmd].rp_before and config.commands[cmd_data.cmd].rp_before[i] then
                imgui.StrCopy(rp_before_buffers[cmd_data.cmd][i], u8(config.commands[cmd_data.cmd].rp_before[i]))
            end
            
            if config.commands[cmd_data.cmd].rp_after and config.commands[cmd_data.cmd].rp_after[i] then
                imgui.StrCopy(rp_after_buffers[cmd_data.cmd][i], u8(config.commands[cmd_data.cmd].rp_after[i]))
            end
        end
    else
        for i = 1, 5 do
            rp_before_buffers[cmd_data.cmd][i] = imgui.new.char[256]()
            rp_after_buffers[cmd_data.cmd][i] = imgui.new.char[256]()
        end
    end
end

local main_enabled = imgui.new.bool(config.enabled)
local auto_rp_enabled = imgui.new.bool(config.auto_rp_enabled)
local log_actions = imgui.new.bool(config.log_actions)
local delay_slider = imgui.new.int(config.delay_between_rp or 1500)

local pending_rp_queue = {}
local is_executing_rp = false

function log(message)
    if config.log_actions then
        print('[Gang Helper] ' .. message)
    end
end

function save_config()
    config.enabled = main_enabled[0]
    config.auto_rp_enabled = auto_rp_enabled[0]
    config.log_actions = log_actions[0]
    config.delay_between_rp = delay_slider[0]
    
    for _, cmd_data in ipairs(gang_commands) do
        local cmd = cmd_data.cmd
        
        if not config.commands[cmd] then
            config.commands[cmd] = {enabled = true, rp_before = {}, rp_after = {}}
        end
        
        config.commands[cmd].rp_before = {}
        config.commands[cmd].rp_after = {}
        
        for i = 1, 5 do
            local rp_before_text = u8:decode(ffi.string(rp_before_buffers[cmd][i]))
            local rp_after_text = u8:decode(ffi.string(rp_after_buffers[cmd][i]))
            
            if rp_before_text and rp_before_text ~= '' then
                table.insert(config.commands[cmd].rp_before, rp_before_text)
            end
            
            if rp_after_text and rp_after_text ~= '' then
                table.insert(config.commands[cmd].rp_after, rp_after_text)
            end
        end
    end
    
    jsoncfg.save(config_path, config)
    log('Конфигурация сохранена')
end

function execute_rp_sequence(rp_list, callback)
    lua_thread.create(function()
        is_executing_rp = true
        
        for _, rp_text in ipairs(rp_list) do
            if rp_text and rp_text ~= '' then
                sampSendChat(rp_text)
                log('Отыгровка: ' .. rp_text)
                wait(config.delay_between_rp or 1500)
            end
        end
        
        if callback then
            callback()
        end
        
        is_executing_rp = false
    end)
end

function execute_command_with_rp(cmd, params)
    if not config.enabled or not config.auto_rp_enabled then
        sampSendChat('/' .. cmd .. (params and params ~= '' and ' ' .. params or ''))
        return
    end
    
    local cmd_config = config.commands[cmd]
    
    if not cmd_config or not cmd_config.enabled then
        sampSendChat('/' .. cmd .. (params and params ~= '' and ' ' .. params or ''))
        return
    end
    
    log('Выполнение команды: /' .. cmd .. (params and params ~= '' and ' ' .. params or ''))
    
    if cmd_config.rp_before and #cmd_config.rp_before > 0 then
        execute_rp_sequence(cmd_config.rp_before, function()
            sampSendChat('/' .. cmd .. (params and params ~= '' and ' ' .. params or ''))
            log('Команда выполнена: /' .. cmd)
            
            if cmd_config.rp_after and #cmd_config.rp_after > 0 then
                wait(config.delay_between_rp or 1500)
                execute_rp_sequence(cmd_config.rp_after)
            end
        end)
    else
        sampSendChat('/' .. cmd .. (params and params ~= '' and ' ' .. params or ''))
        
        if cmd_config.rp_after and #cmd_config.rp_after > 0 then
            wait(config.delay_between_rp or 1500)
            execute_rp_sequence(cmd_config.rp_after)
        end
    end
end

function sampev.onSendCommand(command)
    if not config.enabled or not config.auto_rp_enabled then
        return
    end
    
    local cmd, params = command:match('^/(%w+)%s*(.*)$')
    
    if not cmd then
        return
    end
    
    cmd = cmd:lower()
    
    for _, cmd_data in ipairs(gang_commands) do
        if cmd_data.cmd == cmd then
            execute_command_with_rp(cmd, params)
            return false
        end
    end
end

local function render_commands_tab()
    imgui.Text(u8'Быстрый доступ к командам банды')
    imgui.Separator()
    imgui.Spacing()
    
    for _, cmd_data in ipairs(gang_commands) do
        local cmd_enabled = config.commands[cmd_data.cmd] and config.commands[cmd_data.cmd].enabled or true
        
        if imgui.Button(u8(cmd_data.name) .. '##' .. cmd_data.cmd, imgui.ImVec2(300, 25)) then
            if cmd_data.params ~= '' then
                local params_input = ffi.string(input_buffers[cmd_data.cmd])
                execute_command_with_rp(cmd_data.cmd, params_input)
            else
                execute_command_with_rp(cmd_data.cmd, '')
            end
        end
        
        imgui.SameLine()
        
        if cmd_data.params ~= '' then
            imgui.PushItemWidth(200)
            imgui.InputText(u8'##input_' .. cmd_data.cmd, input_buffers[cmd_data.cmd], 256)
            imgui.PopItemWidth()
            imgui.SameLine()
            imgui.TextDisabled(u8(cmd_data.params))
        else
            imgui.TextDisabled(u8'/' .. cmd_data.cmd)
        end
        
        imgui.Spacing()
    end
end

local function render_roleplays_tab()
    imgui.Text(u8'Настройка отыгровок для команд')
    imgui.Separator()
    imgui.Spacing()
    
    imgui.BeginChild('##rp_child', imgui.ImVec2(0, -30), true)
    
    for _, cmd_data in ipairs(gang_commands) do
        if imgui.CollapsingHeader(u8(cmd_data.name) .. ' (/' .. cmd_data.cmd .. ')') then
            imgui.Spacing()
            
            imgui.Text(u8'Отыгровки перед командой:')
            for i = 1, 5 do
                imgui.PushItemWidth(-1)
                imgui.InputText(u8'##rp_before_' .. cmd_data.cmd .. '_' .. i, rp_before_buffers[cmd_data.cmd][i], 256)
                imgui.PopItemWidth()
            end
            
            imgui.Spacing()
            imgui.Text(u8'Отыгровки после команды:')
            for i = 1, 5 do
                imgui.PushItemWidth(-1)
                imgui.InputText(u8'##rp_after_' .. cmd_data.cmd .. '_' .. i, rp_after_buffers[cmd_data.cmd][i], 256)
                imgui.PopItemWidth()
            end
            
            imgui.Spacing()
            imgui.Separator()
            imgui.Spacing()
        end
    end
    
    imgui.EndChild()
    
    if imgui.Button(u8'Сохранить отыгровки', imgui.ImVec2(-1, 25)) then
        save_config()
        sampAddChatMessage('[Gang Helper] {FFFFFF}Отыгровки сохранены!', 0x00FF00)
    end
end

local function render_settings_tab()
    imgui.Text(u8'Общие настройки хелпера')
    imgui.Separator()
    imgui.Spacing()
    
    if imgui.Checkbox(u8'Включить хелпер', main_enabled) then
        save_config()
    end
    imgui.Spacing()
    
    if imgui.Checkbox(u8'Автоматические отыгровки', auto_rp_enabled) then
        save_config()
    end
    imgui.Spacing()
    
    if imgui.Checkbox(u8'Логирование действий', log_actions) then
        save_config()
    end
    imgui.Spacing()
    imgui.Separator()
    imgui.Spacing()
    
    imgui.Text(u8'Задержка между отыгровками (мс):')
    if imgui.SliderInt(u8'##delay_slider', delay_slider, 500, 5000) then
        save_config()
    end
    
    imgui.Spacing()
    imgui.TextWrapped(u8'Текущая задержка: ' .. delay_slider[0] .. u8' мс (' .. string.format('%.1f', delay_slider[0] / 1000) .. u8' сек)')
    
    imgui.Spacing()
    imgui.Separator()
    imgui.Spacing()
    
    imgui.TextWrapped(u8'Хелпер автоматически перехватывает банд-команды и добавляет к ним настроенные отыгровки. Вы можете настроить отыгровки для каждой команды во вкладке "Отыгровки".')
    
    imgui.Spacing()
    
    if imgui.Button(u8'Сбросить настройки', imgui.ImVec2(-1, 25)) then
        config = jsoncfg.load('config/gang_config.json')
        main_enabled[0] = config.enabled
        auto_rp_enabled[0] = config.auto_rp_enabled
        log_actions[0] = config.log_actions
        delay_slider[0] = config.delay_between_rp or 1500
        sampAddChatMessage('[Gang Helper] {FFFFFF}Настройки сброшены!', 0x00FF00)
    end
end

local frame = imgui.OnFrame(
    function() return window[0] end,
    function(self)
        local sw, sh = getScreenResolution()
        imgui.SetNextWindowPos(imgui.ImVec2(sw / 2, sh / 2), imgui.Cond.FirstUseEver, imgui.ImVec2(0.5, 0.5))
        imgui.SetNextWindowSize(imgui.ImVec2(700, 500), imgui.Cond.FirstUseEver)
        
        if imgui.Begin(u8'Gang Helper - Arizona RP', window, imgui.WindowFlags.NoCollapse) then
            if imgui.BeginTabBar('##tabs') then
                if imgui.BeginTabItem(u8'Команды банды') then
                    render_commands_tab()
                    imgui.EndTabItem()
                end
                
                if imgui.BeginTabItem(u8'Отыгровки') then
                    render_roleplays_tab()
                    imgui.EndTabItem()
                end
                
                if imgui.BeginTabItem(u8'Настройки') then
                    render_settings_tab()
                    imgui.EndTabItem()
                end
                
                imgui.EndTabBar()
            end
            
            imgui.End()
        end
    end
)

function main()
    if not isSampfuncsLoaded() or not isSampLoaded() then return end
    while not isSampAvailable() do wait(0) end
    
    sampRegisterChatCommand('gang', function()
        window[0] = not window[0]
    end)
    
    sampAddChatMessage('[Gang Helper] {FFFFFF}Загружен! Используйте {00FF00}/gang{FFFFFF} для открытия меню.', 0x00FF00)
    log('Gang Helper успешно загружен')
    
    wait(-1)
end
