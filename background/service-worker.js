let trackedItems = [];
let priceCheckInterval = null;

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FunPay Helper installed:', details.reason);

  if (details.reason === 'install') {
    await initializeExtension();
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }

  setupAlarms();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, initializing FunPay Helper');
  setupAlarms();
  loadTrackedItems();
});

async function initializeExtension() {
  const defaultSettings = {
    darkTheme: true,
    showQuickStats: true,
    showSellerScore: true,
    autoResponderEnabled: true,
    priceTrackerEnabled: true,
    hideBanners: true,
    fixedFilters: true,
    isPremium: false,
    notifications: {
      enabled: true,
      sound: true,
      priority: 'normal'
    },
    templates: [
      {
        id: 1,
        name: 'Приветствие',
        text: 'Здравствуйте! Интересует ваше предложение.'
      },
      {
        id: 2,
        name: 'Вопрос о цене',
        text: 'Добрый день! Возможна ли скидка при покупке нескольких товаров?'
      },
      {
        id: 3,
        name: 'Подтверждение',
        text: 'Хорошо, беру. Когда сможете выполнить?'
      }
    ],
    blacklist: []
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await chrome.storage.sync.set({ [key]: value });
  }

  console.log('Extension initialized with default settings');
}

function setupAlarms() {
  chrome.alarms.create('priceCheck', {
    periodInMinutes: 5
  });

  chrome.alarms.create('statsUpdate', {
    periodInMinutes: 15
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'priceCheck') {
    checkTrackedPrices();
  } else if (alarm.name === 'statsUpdate') {
    updateStatistics();
  }
});

async function loadTrackedItems() {
  try {
    const db = new PriceHistoryDB();
    await db.init();
    trackedItems = await db.getTrackedItems();
    console.log(`Loaded ${trackedItems.length} tracked items`);
  } catch (error) {
    console.error('Failed to load tracked items:', error);
  }
}

async function checkTrackedPrices() {
  if (!trackedItems || trackedItems.length === 0) {
    await loadTrackedItems();
    return;
  }

  const settings = await chrome.storage.sync.get(['priceTrackerEnabled', 'isPremium', 'notifications']);
  
  if (!settings.priceTrackerEnabled) return;

  const maxTrackers = settings.isPremium ? 999 : 3;
  const itemsToCheck = trackedItems.slice(0, maxTrackers);

  for (const item of itemsToCheck) {
    if (!item.active) continue;

    try {
      await checkSingleItem(item, settings);
    } catch (error) {
      console.error(`Error checking item ${item.categoryId}:`, error);
    }
  }
}

async function checkSingleItem(item, settings) {
  const html = await fetch(`https://funpay.com/chips/${item.categoryId}/`).then(r => r.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const lots = [];
  const lotElements = doc.querySelectorAll('.tc-item, .offer-list-item');

  lotElements.forEach(element => {
    const priceElement = element.querySelector('.tc-price, .offer-price');
    const priceText = priceElement?.textContent;
    const price = parseFloat(priceText?.replace(/[^\d.,]/g, '').replace(',', '.'));

    if (price && price <= item.threshold) {
      lots.push({
        price,
        title: element.querySelector('.tc-title, .offer-title')?.textContent?.trim(),
        url: element.querySelector('a')?.href,
        seller: element.querySelector('.tc-seller, .seller-name')?.textContent?.trim()
      });
    }
  });

  if (lots.length > 0 && settings.notifications?.enabled) {
    sendPriceAlert(item, lots[0]);
  }
}

function sendPriceAlert(item, lot) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title: 'FunPay Helper: Найден выгодный лот!',
    message: `${lot.title}\nЦена: ${lot.price} ₽\nПродавец: ${lot.seller}`,
    priority: 2,
    requireInteraction: true,
    buttons: [
      { title: 'Открыть' },
      { title: 'Закрыть' }
    ]
  }, (notificationId) => {
    chrome.storage.local.set({
      [`notification_${notificationId}`]: {
        url: lot.url,
        lotData: lot
      }
    });
  });
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    const data = await chrome.storage.local.get(`notification_${notificationId}`);
    const notificationData = data[`notification_${notificationId}`];
    
    if (notificationData?.url) {
      chrome.tabs.create({ url: notificationData.url });
    }
  }
  
  chrome.notifications.clear(notificationId);
  chrome.storage.local.remove(`notification_${notificationId}`);
});

async function updateStatistics() {
  console.log('Updating statistics...');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addTrackedItem') {
    handleAddTrackedItem(request.data).then(sendResponse);
    return true;
  } else if (request.action === 'getTrackedItems') {
    handleGetTrackedItems().then(sendResponse);
    return true;
  } else if (request.action === 'removeTrackedItem') {
    handleRemoveTrackedItem(request.itemId).then(sendResponse);
    return true;
  } else if (request.action === 'calculateSellerScore') {
    handleCalculateSellerScore(request.sellerData).then(sendResponse);
    return true;
  } else if (request.action === 'exportChat') {
    handleExportChat(request.chatData).then(sendResponse);
    return true;
  }
});

async function handleAddTrackedItem(data) {
  try {
    const db = new PriceHistoryDB();
    await db.init();
    const id = await db.addTrackedItem(data.categoryId, data.threshold, data.filters);
    await loadTrackedItems();
    return { success: true, id };
  } catch (error) {
    console.error('Failed to add tracked item:', error);
    return { success: false, error: error.message };
  }
}

async function handleGetTrackedItems() {
  try {
    await loadTrackedItems();
    return { success: true, items: trackedItems };
  } catch (error) {
    console.error('Failed to get tracked items:', error);
    return { success: false, error: error.message };
  }
}

async function handleRemoveTrackedItem(itemId) {
  try {
    const db = new PriceHistoryDB();
    await db.init();
    await db.removeTrackedItem(itemId);
    await loadTrackedItems();
    return { success: true };
  } catch (error) {
    console.error('Failed to remove tracked item:', error);
    return { success: false, error: error.message };
  }
}

async function handleCalculateSellerScore(sellerData) {
  let score = 0;
  let color = 'red';
  let reasons = [];

  if (sellerData.accountAge >= 365) {
    score += 30;
    reasons.push('Аккаунт старше года');
  } else if (sellerData.accountAge >= 180) {
    score += 20;
    reasons.push('Аккаунт старше 6 месяцев');
  } else if (sellerData.accountAge >= 90) {
    score += 10;
    reasons.push('Аккаунт старше 3 месяцев');
  }

  if (sellerData.reviewStats?.percentage >= 95) {
    score += 35;
    reasons.push('Отличные отзывы (95%+)');
  } else if (sellerData.reviewStats?.percentage >= 85) {
    score += 25;
    reasons.push('Хорошие отзывы (85%+)');
  } else if (sellerData.reviewStats?.percentage >= 70) {
    score += 15;
    reasons.push('Приемлемые отзывы (70%+)');
  }

  if (sellerData.totalDeals >= 1000) {
    score += 25;
    reasons.push('Много успешных сделок (1000+)');
  } else if (sellerData.totalDeals >= 500) {
    score += 20;
    reasons.push('Много сделок (500+)');
  } else if (sellerData.totalDeals >= 100) {
    score += 10;
    reasons.push('Достаточно сделок (100+)');
  }

  if (sellerData.hasContacts?.telegram || sellerData.hasContacts?.discord) {
    score += 10;
    reasons.push('Есть контакты для связи');
  }

  if (score >= 70) {
    color = 'green';
  } else if (score >= 40) {
    color = 'yellow';
  }

  return {
    success: true,
    score,
    color,
    reasons,
    level: color === 'green' ? 'Надёжный' : color === 'yellow' ? 'Осторожно' : 'Риск'
  };
}

async function handleExportChat(chatData) {
  try {
    const pdfContent = generateChatPDF(chatData);
    
    return {
      success: true,
      pdf: pdfContent
    };
  } catch (error) {
    console.error('Failed to export chat:', error);
    return { success: false, error: error.message };
  }
}

function generateChatPDF(chatData) {
  const content = {
    title: 'FunPay Chat Export',
    date: new Date().toISOString(),
    chatWith: chatData.seller || 'Unknown',
    lotUrl: chatData.lotUrl || '',
    messages: chatData.messages || [],
    screenshots: chatData.screenshots || []
  };

  return JSON.stringify(content, null, 2);
}

class PriceHistoryDB {
  constructor() {
    this.dbName = 'FunPayHelperDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('priceHistory')) {
          const store = db.createObjectStore('priceHistory', { keyPath: 'id', autoIncrement: true });
          store.createIndex('categoryId', 'categoryId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('trackedItems')) {
          const trackedStore = db.createObjectStore('trackedItems', { keyPath: 'id', autoIncrement: true });
          trackedStore.createIndex('categoryId', 'categoryId', { unique: false });
        }
      };
    });
  }

  async addTrackedItem(categoryId, threshold, filters = {}) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readwrite');
      const store = transaction.objectStore('trackedItems');
      
      const item = {
        categoryId,
        threshold,
        filters,
        createdAt: Date.now(),
        active: true
      };

      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTrackedItems() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readonly');
      const store = transaction.objectStore('trackedItems');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeTrackedItem(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trackedItems'], 'readwrite');
      const store = transaction.objectStore('trackedItems');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

console.log('FunPay Helper background service worker loaded');
