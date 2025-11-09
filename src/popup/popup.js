let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthentication();
  await loadStatistics();
  attachEventListeners();
});

async function checkAuthentication() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'authenticate' });
    isAuthenticated = response.authenticated;

    if (isAuthenticated) {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('main-section').style.display = 'block';
    } else {
      document.getElementById('auth-section').style.display = 'block';
      document.getElementById('main-section').style.display = 'none';
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
  }
}

async function loadStatistics() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStatistics' });
    
    if (response.statistics) {
      const stats = response.statistics;
      
      document.getElementById('total-products').textContent = stats.totalProducts || 0;
      document.getElementById('avg-price').textContent = stats.averagePrice 
        ? `${Math.floor(stats.averagePrice)}₽` 
        : '-';
      document.getElementById('competitors').textContent = stats.competitorsTracked || '-';
      
      if (stats.lastUpdate) {
        const date = new Date(stats.lastUpdate);
        document.getElementById('last-update').textContent = formatRelativeTime(date);
      }
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

function attachEventListeners() {
  document.getElementById('go-to-funpay')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://funpay.com' });
  });

  document.getElementById('open-dashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/dashboard/dashboard.html') });
  });

  document.getElementById('analyze-page')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url.includes('funpay.com')) {
      chrome.tabs.sendMessage(tab.id, { action: 'extractPageData' });
      showToast('Анализ запущен...');
    } else {
      showToast('Откройте страницу FunPay.com для анализа', 'warning');
    }
  });

  document.getElementById('update-prices')?.addEventListener('click', async () => {
    showToast('Обновление цен запущено...');
    
    try {
      await chrome.runtime.sendMessage({ action: 'triggerPriceUpdate' });
      showToast('Цены обновлены', 'success');
    } catch (error) {
      showToast('Ошибка обновления цен', 'error');
    }
  });

  document.getElementById('export-data')?.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'exportData' });
      
      if (response.data) {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], 
          { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `funpay-pro-export-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('Данные экспортированы', 'success');
      }
    } catch (error) {
      showToast('Ошибка экспорта', 'error');
    }
  });

  document.getElementById('settings')?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('notifications-toggle')?.addEventListener('click', async () => {
    const result = await chrome.storage.local.get(['notifications']);
    const enabled = !result.notifications;
    
    await chrome.storage.local.set({ notifications: enabled });
    showToast(enabled ? 'Уведомления включены' : 'Уведомления выключены', 'info');
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} дн. назад`;
  if (hours > 0) return `${hours} ч. назад`;
  if (minutes > 0) return `${minutes} мин. назад`;
  return 'только что';
}
