importScripts('./analytics-engine.js');

let isInitialized = false;
let updateInterval = null;

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('FunPay Pro Extension installed:', details.reason);
  await initialize();
  
  chrome.alarms.create('updatePrices', { periodInMinutes: 15 });
  chrome.alarms.create('checkCompetitors', { periodInMinutes: 30 });
  chrome.alarms.create('analyzeMarket', { periodInMinutes: 60 });
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('FunPay Pro Extension started');
  await initialize();
});

async function initialize() {
  if (isInitialized) return;
  
  const settings = await chrome.storage.local.get([
    'autoUpdate',
    'updateInterval',
    'priceStrategy',
    'notifications',
  ]);

  if (!settings.autoUpdate) {
    await chrome.storage.local.set({
      autoUpdate: true,
      updateInterval: 15,
      priceStrategy: 'competitive',
      notifications: true,
      competitorTracking: true,
      autoAdjustPrices: false,
    });
  }

  isInitialized = true;
  console.log('Extension initialized with settings:', settings);
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  switch (alarm.name) {
    case 'updatePrices':
      await updateProductPrices();
      break;
    case 'checkCompetitors':
      await checkCompetitors();
      break;
    case 'analyzeMarket':
      await analyzeMarket();
      break;
  }
});

async function updateProductPrices() {
  try {
    const { autoAdjustPrices, priceStrategy } = await chrome.storage.local.get([
      'autoAdjustPrices',
      'priceStrategy',
    ]);

    if (!autoAdjustPrices) return;

    const response = await chrome.runtime.sendMessage({
      action: 'getProductsNeedingUpdate',
    });

    if (response && response.products) {
      for (const product of response.products) {
        const recommendation = await calculatePriceRecommendation(
          product,
          priceStrategy || 'competitive'
        );

        if (recommendation && recommendation.shouldUpdate) {
          await chrome.runtime.sendMessage({
            action: 'updatePrice',
            productId: product.id,
            newPrice: recommendation.price,
          });

          if (recommendation.notify) {
            await showNotification(
              'Цена обновлена',
              `${product.title}: ${product.price}₽ → ${recommendation.price}₽`
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to update prices:', error);
  }
}

async function checkCompetitors() {
  try {
    const { competitorTracking } = await chrome.storage.local.get(['competitorTracking']);
    if (!competitorTracking) return;

    const response = await chrome.runtime.sendMessage({
      action: 'getTrackedCompetitors',
    });

    if (response && response.competitors) {
      const changes = await detectPriceChanges(response.competitors);
      
      for (const change of changes) {
        await showNotification(
          'Конкурент изменил цену!',
          `${change.seller}: ${change.product} - ${change.oldPrice}₽ → ${change.newPrice}₽`,
          { priority: 2 }
        );

        await chrome.runtime.sendMessage({
          action: 'logPriceChange',
          change,
        });
      }
    }
  } catch (error) {
    console.error('Failed to check competitors:', error);
  }
}

async function analyzeMarket() {
  try {
    const trends = await getMarketTrends();
    
    await chrome.runtime.sendMessage({
      action: 'updateMarketTrends',
      trends,
    });

    const insights = await generateMarketInsights(trends);
    
    if (insights.alerts && insights.alerts.length > 0) {
      for (const alert of insights.alerts) {
        await showNotification(
          'Рыночная аналитика',
          alert.message,
          { priority: 1 }
        );
      }
    }
  } catch (error) {
    console.error('Failed to analyze market:', error);
  }
}

async function detectPriceChanges(competitors) {
  const changes = [];
  
  for (const competitor of competitors) {
    try {
      const response = await fetch(competitor.url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const currentPrice = extractPrice(doc);
      
      if (currentPrice && currentPrice !== competitor.lastPrice) {
        changes.push({
          seller: competitor.seller,
          product: competitor.product,
          oldPrice: competitor.lastPrice,
          newPrice: currentPrice,
          url: competitor.url,
          timestamp: Date.now(),
        });

        competitor.lastPrice = currentPrice;
      }
    } catch (error) {
      console.error(`Failed to check competitor ${competitor.seller}:`, error);
    }
  }
  
  return changes;
}

function extractPrice(doc) {
  const priceEl = doc.querySelector('.tc-price');
  if (!priceEl) return null;
  
  const priceText = priceEl.textContent.trim();
  const match = priceText.match(/[\d\s]+/);
  return match ? parseFloat(match[0].replace(/\s/g, '')) : null;
}

async function getMarketTrends() {
  try {
    const response = await fetch('http://localhost:3000/api/analysis/trends');
    if (!response.ok) throw new Error('Failed to fetch trends');
    return await response.json();
  } catch (error) {
    console.error('Failed to get market trends:', error);
    return { trends: [] };
  }
}

async function generateMarketInsights(trends) {
  const insights = { alerts: [] };
  
  if (trends.hotCategories && trends.hotCategories.length > 0) {
    insights.alerts.push({
      message: `Популярные категории: ${trends.hotCategories.slice(0, 3).join(', ')}`,
      type: 'trending',
    });
  }

  if (trends.priceDrops && trends.priceDrops.length > 0) {
    insights.alerts.push({
      message: `Значительное снижение цен в ${trends.priceDrops.length} категориях`,
      type: 'warning',
    });
  }

  return insights;
}

async function showNotification(title, message, options = {}) {
  const { notifications } = await chrome.storage.local.get(['notifications']);
  if (!notifications) return;

  await chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('src/icons/icon128.png'),
    title,
    message,
    priority: options.priority || 0,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  handleMessage(message, sender).then(sendResponse).catch(error => {
    console.error('Message handler error:', error);
    sendResponse({ error: error.message });
  });
  
  return true;
});

async function handleMessage(message, sender) {
  switch (message.action) {
    case 'authenticate':
      return await handleAuthenticate();
    
    case 'getCompetitors':
      return await handleGetCompetitors(message.category);
    
    case 'analyzePrices':
      return await handleAnalyzePrices(message.productId);
    
    case 'updatePrice':
      return await handleUpdatePrice(message.productId, message.newPrice);
    
    case 'bulkUpdatePrices':
      return await handleBulkUpdatePrices(message.updates);
    
    case 'exportData':
      return await handleExportData();
    
    case 'importData':
      return await handleImportData(message.data);
    
    case 'getStatistics':
      return await handleGetStatistics();
    
    default:
      return { error: 'Unknown action' };
  }
}

async function handleAuthenticate() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: 'funpay.com' });
    const isAuthenticated = cookies.some(c => c.name === 'golden_key' || c.name === 'csrf_token');
    
    return { authenticated: isAuthenticated, cookies: cookies.length };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

async function handleGetCompetitors(category) {
  try {
    const response = await fetch('http://localhost:3000/api/competitors/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, limit: 50 }),
    });

    const data = await response.json();
    return { competitors: data.competitors || [] };
  } catch (error) {
    return { competitors: [], error: error.message };
  }
}

async function handleAnalyzePrices(productId) {
  try {
    const analysis = await analyzePriceData(productId);
    return { analysis };
  } catch (error) {
    return { analysis: null, error: error.message };
  }
}

async function handleUpdatePrice(productId, newPrice) {
  try {
    await chrome.storage.local.set({
      [`price_${productId}`]: {
        price: newPrice,
        updated: Date.now(),
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleBulkUpdatePrices(updates) {
  const results = [];
  
  for (const update of updates) {
    const result = await handleUpdatePrice(update.productId, update.newPrice);
    results.push({ ...update, ...result });
  }
  
  return { results };
}

async function handleExportData() {
  try {
    const data = await chrome.storage.local.get(null);
    return { data };
  } catch (error) {
    return { data: null, error: error.message };
  }
}

async function handleImportData(data) {
  try {
    await chrome.storage.local.set(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleGetStatistics() {
  try {
    const stats = await calculateStatistics();
    return { statistics: stats };
  } catch (error) {
    return { statistics: null, error: error.message };
  }
}

async function calculateStatistics() {
  const data = await chrome.storage.local.get(null);
  
  const priceKeys = Object.keys(data).filter(k => k.startsWith('price_'));
  const products = priceKeys.length;
  
  const prices = priceKeys.map(k => data[k].price).filter(p => p > 0);
  const avgPrice = prices.length > 0 
    ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
    : 0;
  
  return {
    totalProducts: products,
    averagePrice: avgPrice,
    lastUpdate: Date.now(),
  };
}

console.log('FunPay Pro Service Worker loaded');
