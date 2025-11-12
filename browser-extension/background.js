chrome.runtime.onInstalled.addListener(() => {
    console.log('Auto-fill Registration Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes('panel.rogen.wtf/auth/register')) {
        chrome.tabs.sendMessage(tab.id, { action: 'autofill' });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'notify') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Auto-fill Registration',
            message: request.message
        });
    }
});
