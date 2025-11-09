// Options page script
let api;

document.addEventListener('DOMContentLoaded', async () => {
  api = new FunpayAPI();
  await api.initialize();
  
  await loadSettings();
  await loadStatistics();
  setupEventListeners();
});

function setupEventListeners() {
  // API Key
  document.getElementById('save-api-key').addEventListener('click', saveApiKey);
  document.getElementById('generate-api-key').addEventListener('click', generateApiKey);

  // Analysis settings
  document.getElementById('save-analysis-settings').addEventListener('click', saveAnalysisSettings);

  // Notification settings
  document.getElementById('save-notification-settings').addEventListener('click', saveNotificationSettings);

  // Data management
  document.getElementById('clear-cache').addEventListener('click', clearCache);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('import-data').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });
  document.getElementById('import-file-input').addEventListener('change', importData);
  document.getElementById('reset-extension').addEventListener('click', resetExtension);
}

async function loadSettings() {
  const settings = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, {
    updateInterval: 30,
    defaultStrategy: 'competitive',
    autoAnalysis: true,
    showButton: true,
    enableNotifications: true,
    notifyPriceDrop: true,
    notifyPriceIncrease: false,
    priceChangeThreshold: 5
  });

  const apiKey = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.API_KEY, '');

  document.getElementById('api-key').value = apiKey;
  document.getElementById('update-interval').value = settings.updateInterval;
  document.getElementById('default-strategy').value = settings.defaultStrategy;
  document.getElementById('auto-analysis').checked = settings.autoAnalysis;
  document.getElementById('show-button').checked = settings.showButton;
  document.getElementById('enable-notifications').checked = settings.enableNotifications;
  document.getElementById('notify-price-drop').checked = settings.notifyPriceDrop;
  document.getElementById('notify-price-increase').checked = settings.notifyPriceIncrease;
  document.getElementById('price-change-threshold').value = settings.priceChangeThreshold;

  if (apiKey) {
    showApiKeyStatus('Ключ установлен', 'success');
  }
}

async function loadStatistics() {
  const stats = await Utils.getFromStorage('funpay_statistics', {
    totalAnalyses: 0,
    trackedProducts: 0,
    avgSavings: 0,
    lastUpdate: null
  });

  const tracked = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.PRICE_CACHE + '_tracked', []);
  stats.trackedProducts = tracked.length;

  document.getElementById('total-analyses').textContent = stats.totalAnalyses;
  document.getElementById('tracked-products').textContent = stats.trackedProducts;
  document.getElementById('avg-savings').textContent = stats.avgSavings.toFixed(1) + '%';
  document.getElementById('last-update').textContent = stats.lastUpdate 
    ? new Date(stats.lastUpdate).toLocaleTimeString('ru-RU')
    : 'Никогда';
}

async function saveApiKey() {
  const apiKey = document.getElementById('api-key').value.trim();

  if (!apiKey) {
    showApiKeyStatus('Введите API ключ', 'error');
    return;
  }

  try {
    const validation = await api.validateApiKey(apiKey);
    
    if (validation.valid) {
      await api.setApiKey(apiKey);
      showApiKeyStatus('API ключ успешно сохранен', 'success');
    } else {
      showApiKeyStatus('Неверный API ключ', 'error');
    }
  } catch (error) {
    showApiKeyStatus('Ошибка проверки: ' + error.message, 'error');
  }
}

async function generateApiKey() {
  const email = prompt('Введите ваш email для генерации API ключа:');
  if (!email) return;

  if (!validateEmail(email)) {
    showApiKeyStatus('Неверный формат email', 'error');
    return;
  }

  try {
    const result = await api.generateApiKey(email);
    document.getElementById('api-key').value = result.apiKey;
    showApiKeyStatus('API ключ сгенерирован и отправлен на ' + email, 'success');
  } catch (error) {
    showApiKeyStatus('Ошибка генерации: ' + error.message, 'error');
  }
}

async function saveAnalysisSettings() {
  const settings = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, {});

  settings.updateInterval = parseInt(document.getElementById('update-interval').value);
  settings.defaultStrategy = document.getElementById('default-strategy').value;
  settings.autoAnalysis = document.getElementById('auto-analysis').checked;
  settings.showButton = document.getElementById('show-button').checked;

  await Utils.saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  
  // Notify background script to update tracking interval
  chrome.runtime.sendMessage({ 
    action: 'startPriceTracking', 
    interval: settings.updateInterval * 1000 
  });

  showTemporaryMessage('Настройки анализа сохранены');
}

async function saveNotificationSettings() {
  const settings = await Utils.getFromStorage(CONFIG.STORAGE_KEYS.SETTINGS, {});

  settings.enableNotifications = document.getElementById('enable-notifications').checked;
  settings.notifyPriceDrop = document.getElementById('notify-price-drop').checked;
  settings.notifyPriceIncrease = document.getElementById('notify-price-increase').checked;
  settings.priceChangeThreshold = parseInt(document.getElementById('price-change-threshold').value);

  await Utils.saveToStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  showTemporaryMessage('Настройки уведомлений сохранены');
}

async function clearCache() {
  if (!confirm('Вы уверены, что хотите очистить кэш? Это удалит сохраненные данные анализа.')) {
    return;
  }

  await Utils.removeFromStorage(CONFIG.STORAGE_KEYS.PRICE_CACHE);
  
  // Clear all price history
  const storage = await chrome.storage.local.get(null);
  const keysToRemove = Object.keys(storage).filter(key => key.startsWith('price_history_'));
  
  for (const key of keysToRemove) {
    await chrome.storage.local.remove(key);
  }

  showTemporaryMessage('Кэш успешно очищен');
  await loadStatistics();
}

async function exportData() {
  const storage = await chrome.storage.local.get(null);
  const dataStr = JSON.stringify(storage, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `funpay-analyzer-backup-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  showTemporaryMessage('Данные экспортированы');
}

async function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (!confirm('Это заменит все текущие настройки. Продолжить?')) {
        return;
      }

      await chrome.storage.local.set(data);
      showTemporaryMessage('Данные импортированы');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      alert('Ошибка импорта данных: ' + error.message);
    }
  };
  
  reader.readAsText(file);
}

async function resetExtension() {
  if (!confirm('Это удалит все настройки и данные расширения. Вы уверены?')) {
    return;
  }

  if (!confirm('Это действие необратимо. Продолжить?')) {
    return;
  }

  await chrome.storage.local.clear();
  showTemporaryMessage('Все настройки сброшены');
  
  setTimeout(() => {
    window.location.reload();
  }, 1500);
}

function showApiKeyStatus(message, type) {
  const statusEl = document.getElementById('api-key-status');
  statusEl.textContent = message;
  statusEl.className = `alert ${type}`;
  statusEl.style.display = 'block';
}

function showTemporaryMessage(message) {
  const tempAlert = document.createElement('div');
  tempAlert.className = 'alert success';
  tempAlert.textContent = message;
  tempAlert.style.position = 'fixed';
  tempAlert.style.top = '20px';
  tempAlert.style.right = '20px';
  tempAlert.style.zIndex = '10000';
  tempAlert.style.animation = 'slideIn 0.3s ease';
  
  document.body.appendChild(tempAlert);
  
  setTimeout(() => {
    tempAlert.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      tempAlert.remove();
    }, 300);
  }, 3000);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Update statistics periodically
setInterval(loadStatistics, 5000);
