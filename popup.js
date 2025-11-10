const API_KEY_DEFAULT = 'AIzaSyCOecNn-dxdGUrN4sz5Y9AXk-sO4Hn6_Qc';
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/models/';
const STORAGE_KEYS = {
    HISTORY: 'xgpt_chat_history',
    API_KEY: 'xgpt_api_key',
    MODEL: 'xgpt_model',
    TEMPERATURE: 'xgpt_temperature'
};

let currentApiKey = API_KEY_DEFAULT;
let currentModel = 'gemini-1.5-flash';
let currentTemperature = 0.7;
let chatHistory = [];
let isProcessing = false;

const elements = {
    chatContainer: document.getElementById('chatContainer'),
    welcomeMessage: document.getElementById('welcomeMessage'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearHistory: document.getElementById('clearHistory'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    saveSettings: document.getElementById('saveSettings'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    modelSelect: document.getElementById('modelSelect'),
    temperatureInput: document.getElementById('temperatureInput'),
    temperatureValue: document.getElementById('temperatureValue'),
    charCounter: document.getElementById('charCounter'),
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText')
};

async function loadSettings() {
    try {
        const result = await chrome.storage.local.get([
            STORAGE_KEYS.API_KEY,
            STORAGE_KEYS.MODEL,
            STORAGE_KEYS.TEMPERATURE,
            STORAGE_KEYS.HISTORY
        ]);

        currentApiKey = result[STORAGE_KEYS.API_KEY] || API_KEY_DEFAULT;
        currentModel = result[STORAGE_KEYS.MODEL] || 'gemini-1.5-flash';
        currentTemperature = result[STORAGE_KEYS.TEMPERATURE] || 0.7;
        chatHistory = result[STORAGE_KEYS.HISTORY] || [];

        elements.apiKeyInput.value = currentApiKey;
        elements.modelSelect.value = currentModel;
        elements.temperatureInput.value = currentTemperature * 100;
        elements.temperatureValue.textContent = currentTemperature;

        if (chatHistory.length > 0) {
            renderChatHistory();
        }

        updateStatus('Готов к работе', 'success');
    } catch (error) {
        console.error('Error loading settings:', error);
        updateStatus('Ошибка загрузки настроек', 'error');
    }
}

async function saveSettings() {
    try {
        const apiKey = elements.apiKeyInput.value.trim();
        const model = elements.modelSelect.value;
        const temperature = parseInt(elements.temperatureInput.value) / 100;

        if (!apiKey) {
            alert('Пожалуйста, введите API ключ');
            return;
        }

        await chrome.storage.local.set({
            [STORAGE_KEYS.API_KEY]: apiKey,
            [STORAGE_KEYS.MODEL]: model,
            [STORAGE_KEYS.TEMPERATURE]: temperature
        });

        currentApiKey = apiKey;
        currentModel = model;
        currentTemperature = temperature;

        closeModal();
        updateStatus('Настройки сохранены', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        updateStatus('Ошибка сохранения настроек', 'error');
    }
}

async function saveChatHistory() {
    try {
        await chrome.storage.local.set({
            [STORAGE_KEYS.HISTORY]: chatHistory
        });
    } catch (error) {
        console.error('Error saving chat history:', error);
    }
}

function renderChatHistory() {
    elements.welcomeMessage.style.display = 'none';
    
    const messagesHTML = chatHistory.map(msg => createMessageElement(msg)).join('');
    elements.chatContainer.innerHTML = messagesHTML;
    
    scrollToBottom();
}

function createMessageElement(message) {
    const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const avatar = message.role === 'user' ? '👤' : '🤖';
    const roleText = message.role === 'user' ? 'Вы' : 'XGPT';

    return `
        <div class="message ${message.role}">
            <div class="message-header">
                <div class="message-avatar">${avatar}</div>
                <span>${roleText}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addMessage(role, content) {
    const message = {
        role,
        content,
        timestamp: Date.now()
    };

    chatHistory.push(message);
    
    if (elements.welcomeMessage.style.display !== 'none') {
        elements.welcomeMessage.style.display = 'none';
    }

    const messageHTML = createMessageElement(message);
    elements.chatContainer.insertAdjacentHTML('beforeend', messageHTML);
    
    scrollToBottom();
    saveChatHistory();
}

function showTypingIndicator() {
    const indicator = `
        <div class="message ai typing-message">
            <div class="message-header">
                <div class="message-avatar">🤖</div>
                <span>XGPT</span>
            </div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    elements.chatContainer.insertAdjacentHTML('beforeend', indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const typingMessage = elements.chatContainer.querySelector('.typing-message');
    if (typingMessage) {
        typingMessage.remove();
    }
}

function scrollToBottom() {
    elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
}

async function sendMessage() {
    const userMessage = elements.userInput.value.trim();
    
    if (!userMessage || isProcessing) {
        return;
    }

    if (!currentApiKey) {
        updateStatus('Пожалуйста, настройте API ключ в настройках', 'error');
        openModal();
        return;
    }

    isProcessing = true;
    elements.sendBtn.disabled = true;
    elements.userInput.disabled = true;
    updateStatus('Отправка запроса...', '');

    addMessage('user', userMessage);
    elements.userInput.value = '';
    updateCharCounter();

    showTypingIndicator();

    try {
        console.log('Sending message to API...');
        const response = await callGeminiAPI(userMessage);
        console.log('Response received successfully');
        removeTypingIndicator();
        
        if (response && response.content) {
            addMessage('ai', response.content);
            updateStatus('Ответ получен', 'success');
        } else {
            throw new Error('Пустой ответ от API');
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('Error calling API:', error);
        
        let errorMessage = 'Произошла ошибка при обработке запроса';
        
        if (error.message.includes('API key')) {
            errorMessage = 'Ошибка API ключа. Проверьте настройки';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Превышено время ожидания ответа';
        }
        
        addMessage('ai', `❌ ${errorMessage}\n\nПодробности: ${error.message}`);
        updateStatus(errorMessage, 'error');
    } finally {
        isProcessing = false;
        elements.sendBtn.disabled = false;
        elements.userInput.disabled = false;
        elements.userInput.focus();
    }
}

async function callGeminiAPI(message) {
    console.log(`Calling Gemini API with model: ${currentModel}`);
    const url = `${API_ENDPOINT}${currentModel}:generateContent?key=${currentApiKey}`;
    console.log(`API URL: ${url.replace(/key=.*/, 'key=***')}`);
    
    const requestBody = {
        contents: [{
            parts: [{
                text: message
            }]
        }],
        generationConfig: {
            temperature: currentTemperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error Response:', errorData);
            
            let errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
            
            if (response.status === 404) {
                errorMessage = `Модель "${currentModel}" не найдена или недоступна. Пожалуйста, выберите другую модель в настройках.`;
            } else if (response.status === 400) {
                errorMessage = `Некорректный запрос к API: ${errorMessage}`;
            } else if (response.status === 403) {
                errorMessage = `API ключ недействителен или у вас нет доступа к модели "${currentModel}".`;
            } else if (response.status === 429) {
                errorMessage = `Превышен лимит запросов. Пожалуйста, попробуйте позже.`;
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API Response received:', data);
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response structure');
        }

        const textContent = data.candidates[0].content.parts
            .map(part => part.text)
            .join('');

        return {
            content: textContent,
            model: currentModel
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        throw error;
    }
}

async function clearChatHistory() {
    if (chatHistory.length === 0) {
        updateStatus('История уже пуста', '');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить всю историю чата?')) {
        chatHistory = [];
        await saveChatHistory();
        
        elements.chatContainer.innerHTML = '';
        elements.welcomeMessage.style.display = 'block';
        
        updateStatus('История очищена', 'success');
    }
}

function updateCharCounter() {
    const length = elements.userInput.value.length;
    elements.charCounter.textContent = `${length}/2000`;
    elements.sendBtn.disabled = length === 0 || isProcessing;
}

function updateStatus(message, type = '') {
    elements.statusText.textContent = message;
    elements.statusText.className = `status-text ${type}`;
    
    if (message && type) {
        setTimeout(() => {
            elements.statusText.textContent = '';
            elements.statusText.className = 'status-text';
        }, 5000);
    }
}

function openModal() {
    elements.settingsModal.classList.add('active');
}

function closeModal() {
    elements.settingsModal.classList.remove('active');
}

elements.sendBtn.addEventListener('click', sendMessage);

elements.userInput.addEventListener('input', updateCharCounter);

elements.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

elements.clearHistory.addEventListener('click', clearChatHistory);

elements.settingsBtn.addEventListener('click', openModal);

elements.closeSettings.addEventListener('click', closeModal);

elements.saveSettings.addEventListener('click', saveSettings);

elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
        closeModal();
    }
});

elements.temperatureInput.addEventListener('input', (e) => {
    const value = (parseInt(e.target.value) / 100).toFixed(1);
    elements.temperatureValue.textContent = value;
});

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    elements.userInput.focus();
});
