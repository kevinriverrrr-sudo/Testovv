// Background service worker
console.log('Funpay Price Analyzer: Background script initialized');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let priceUpdateInterval = null;

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Open options page on first install
    chrome.tabs.create({ url: 'options/options.html' });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startPriceTracking') {
    startPriceTracking(request.interval);
    sendResponse({ success: true });
  } else if (request.action === 'stopPriceTracking') {
    stopPriceTracking();
    sendResponse({ success: true });
  } else if (request.action === 'fetchPriceData') {
    fetchPriceData(request.productId).then(sendResponse);
    return true; // Async response
  }
});

// Start price tracking
function startPriceTracking(interval = 30000) {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
  }

  priceUpdateInterval = setInterval(async () => {
    await updateTrackedPrices();
  }, interval);

  console.log(`Price tracking started with interval: ${interval}ms`);
}

// Stop price tracking
function stopPriceTracking() {
  if (priceUpdateInterval) {
    clearInterval(priceUpdateInterval);
    priceUpdateInterval = null;
    console.log('Price tracking stopped');
  }
}

// Update tracked prices
async function updateTrackedPrices() {
  try {
    const result = await chrome.storage.local.get(['funpay_price_cache_tracked']);
    const tracked = result.funpay_price_cache_tracked || [];

    for (const product of tracked) {
      try {
        const priceData = await fetchPriceData(product.id);
        await checkPriceChanges(product, priceData);
      } catch (error) {
        console.error(`Error updating price for product ${product.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error updating tracked prices:', error);
  }
}

// Fetch price data from API
async function fetchPriceData(productId) {
  const result = await chrome.storage.local.get(['funpay_api_key']);
  const apiKey = result.funpay_api_key;

  if (!apiKey) {
    throw new Error('API key not found');
  }

  const response = await fetch(`${API_BASE_URL}/analysis/track/${productId}`, {
    headers: {
      'X-API-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch price data');
  }

  return await response.json();
}

// Check price changes and notify
async function checkPriceChanges(product, newData) {
  const cacheKey = `price_history_${product.id}`;
  const result = await chrome.storage.local.get([cacheKey]);
  const history = result[cacheKey] || [];

  if (history.length > 0) {
    const lastPrice = history[history.length - 1].price;
    const currentPrice = newData.currentPrice;

    if (lastPrice !== currentPrice) {
      const change = ((currentPrice - lastPrice) / lastPrice) * 100;
      await notifyPriceChange(product, lastPrice, currentPrice, change);
    }
  }

  // Update history
  history.push({
    price: newData.currentPrice,
    timestamp: Date.now()
  });

  // Keep only last 100 entries
  if (history.length > 100) {
    history.shift();
  }

  await chrome.storage.local.set({ [cacheKey]: history });
}

// Send price change notification
async function notifyPriceChange(product, oldPrice, newPrice, changePercent) {
  const result = await chrome.storage.local.get(['funpay_settings']);
  const settings = result.funpay_settings || { notifications: true };

  if (!settings.notifications) {
    return;
  }

  const direction = newPrice > oldPrice ? 'выросла' : 'снизилась';
  const icon = newPrice > oldPrice ? '📈' : '📉';

  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../assets/icons/icon128.png',
    title: `${icon} Изменение цены`,
    message: `${product.title}\nЦена ${direction} на ${Math.abs(changePercent).toFixed(1)}%\n${oldPrice}₽ → ${newPrice}₽`
  });
}

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('funpay.com')) {
    // Check if auto-analysis is enabled
    chrome.storage.local.get(['funpay_settings'], (result) => {
      const settings = result.funpay_settings || { autoAnalysis: false };
      
      if (settings.autoAnalysis) {
        // Trigger analysis after a short delay
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action: 'autoAnalyze' });
        }, 2000);
      }
    });
  }
});

// Context menu for quick actions
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzePage',
    title: 'Анализировать цены на этой странице',
    contexts: ['page'],
    documentUrlPatterns: ['https://funpay.com/*']
  });

  chrome.contextMenus.create({
    id: 'trackProduct',
    title: 'Добавить в отслеживание',
    contexts: ['page'],
    documentUrlPatterns: ['https://funpay.com/lots/offer/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzePage') {
    chrome.tabs.sendMessage(tab.id, { action: 'analyzeCompetitors' });
  } else if (info.menuItemId === 'trackProduct') {
    chrome.tabs.sendMessage(tab.id, { action: 'addToTracking' });
  }
});

// Badge management
async function updateBadge() {
  const result = await chrome.storage.local.get(['funpay_price_cache_tracked']);
  const tracked = result.funpay_price_cache_tracked || [];
  
  if (tracked.length > 0) {
    chrome.action.setBadgeText({ text: tracked.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4a90e2' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Update badge periodically
setInterval(updateBadge, 5000);
updateBadge();

// Initialize price tracking on startup
chrome.storage.local.get(['funpay_settings'], (result) => {
  const settings = result.funpay_settings || { updateInterval: 30 };
  startPriceTracking(settings.updateInterval * 1000);
});
