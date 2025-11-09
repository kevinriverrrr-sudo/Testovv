const defaultSettings = {
  autoRefresh: false,
  refreshInterval: 5,
  competitorCount: 20,
  strategy: 'auto',
  priceAdjustment: 0,
  minPriceThreshold: 0,
  showNotifications: true,
  priceAlert: false,
  buttonPosition: 'top-right',
  theme: 'purple',
  saveHistory: true
};

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('price-adjustment').addEventListener('input', (e) => {
    document.getElementById('price-adjustment-value').textContent = `${e.target.value}%`;
  });
  
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
  document.getElementById('clear-data-btn').addEventListener('click', clearData);
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get(Object.keys(defaultSettings));
    
    const finalSettings = { ...defaultSettings, ...settings };
    
    document.getElementById('auto-refresh').checked = finalSettings.autoRefresh;
    document.getElementById('refresh-interval').value = finalSettings.refreshInterval;
    document.getElementById('competitor-count').value = finalSettings.competitorCount;
    document.getElementById('strategy').value = finalSettings.strategy;
    document.getElementById('price-adjustment').value = finalSettings.priceAdjustment;
    document.getElementById('price-adjustment-value').textContent = `${finalSettings.priceAdjustment}%`;
    document.getElementById('min-price-threshold').value = finalSettings.minPriceThreshold;
    document.getElementById('show-notifications').checked = finalSettings.showNotifications;
    document.getElementById('price-alert').checked = finalSettings.priceAlert;
    document.getElementById('button-position').value = finalSettings.buttonPosition;
    document.getElementById('theme').value = finalSettings.theme;
    document.getElementById('save-history').checked = finalSettings.saveHistory;
  } catch (error) {
    console.error('Load settings error:', error);
    showNotification('Ошибка загрузки настроек', 'error');
  }
}

async function saveSettings() {
  try {
    const settings = {
      autoRefresh: document.getElementById('auto-refresh').checked,
      refreshInterval: parseInt(document.getElementById('refresh-interval').value),
      competitorCount: parseInt(document.getElementById('competitor-count').value),
      strategy: document.getElementById('strategy').value,
      priceAdjustment: parseInt(document.getElementById('price-adjustment').value),
      minPriceThreshold: parseFloat(document.getElementById('min-price-threshold').value),
      showNotifications: document.getElementById('show-notifications').checked,
      priceAlert: document.getElementById('price-alert').checked,
      buttonPosition: document.getElementById('button-position').value,
      theme: document.getElementById('theme').value,
      saveHistory: document.getElementById('save-history').checked
    };
    
    await chrome.storage.local.set(settings);
    
    showNotification('Настройки сохранены успешно!', 'success');
  } catch (error) {
    console.error('Save settings error:', error);
    showNotification('Ошибка сохранения настроек', 'error');
  }
}

async function resetSettings() {
  if (!confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
    return;
  }
  
  try {
    await chrome.storage.local.set(defaultSettings);
    loadSettings();
    showNotification('Настройки сброшены к значениям по умолчанию', 'success');
  } catch (error) {
    console.error('Reset settings error:', error);
    showNotification('Ошибка сброса настроек', 'error');
  }
}

async function clearData() {
  if (!confirm('Вы уверены, что хотите удалить все данные расширения? Это действие нельзя отменить.')) {
    return;
  }
  
  try {
    const settingsToKeep = await chrome.storage.local.get(Object.keys(defaultSettings));
    
    await chrome.storage.local.clear();
    
    await chrome.storage.local.set(settingsToKeep);
    
    showNotification('Данные успешно удалены', 'success');
  } catch (error) {
    console.error('Clear data error:', error);
    showNotification('Ошибка удаления данных', 'error');
  }
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}
