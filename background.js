chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('XGPT Extension installed successfully!');
        
        chrome.storage.local.set({
            xgpt_api_key: 'AIzaSyCOecNn-dxdGUrN4sz5Y9AXk-sO4Hn6_Qc',
            xgpt_model: 'gemini-pro',
            xgpt_temperature: 0.7,
            xgpt_chat_history: []
        });
        
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
        });
    } else if (details.reason === 'update') {
        console.log('XGPT Extension updated to version', chrome.runtime.getManifest().version);
    }
});

chrome.action.onClicked.addListener((tab) => {
    console.log('Extension icon clicked on tab:', tab.id);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getApiKey') {
        chrome.storage.local.get(['xgpt_api_key'], (result) => {
            sendResponse({ apiKey: result.xgpt_api_key });
        });
        return true;
    }
    
    if (request.action === 'clearHistory') {
        chrome.storage.local.set({ xgpt_chat_history: [] }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
            if (key.startsWith('xgpt_')) {
                console.log(`Storage key "${key}" changed:`, {
                    oldValue,
                    newValue
                });
            }
        }
    }
});

self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('generativelanguage.googleapis.com')) {
        console.log('API request intercepted:', event.request.url);
    }
});
