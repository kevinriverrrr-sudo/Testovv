let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
  setupEventListeners();
});

function initializePopup() {
  checkAuthenticationStatus();
  loadStats();
}

function setupEventListeners() {
  document.getElementById('check-auth-btn').addEventListener('click', handleCheckAuth);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('open-funpay-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://funpay.com' });
  });
  document.getElementById('refresh-data-btn').addEventListener('click', handleRefreshData);
  document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('help-link').addEventListener('click', (e) => {
    e.preventDefault();
    showHelp();
  });
}

async function checkAuthenticationStatus() {
  try {
    const response = await sendMessage({ action: 'checkAuth' });
    
    if (response && response.isAuthenticated) {
      updateUIAuthenticated();
    } else {
      updateUIUnauthenticated();
    }
  } catch (error) {
    console.error('Check auth error:', error);
    updateUIUnauthenticated();
  }
}

async function handleCheckAuth() {
  const btn = document.getElementById('check-auth-btn');
  const originalHTML = btn.innerHTML;
  
  btn.disabled = true;
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    Проверка...
  `;
  
  try {
    const response = await sendMessage({ action: 'checkAuth' });
    
    if (response && response.isAuthenticated) {
      updateUIAuthenticated();
      showNotification('Авторизация успешна!', 'success');
    } else {
      updateUIUnauthenticated();
      showNotification('Не удалось обнаружить авторизацию. Войдите на Funpay.com', 'warning');
    }
  } catch (error) {
    console.error('Check auth error:', error);
    showNotification('Ошибка проверки авторизации', 'error');
    updateUIUnauthenticated();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function handleLogout() {
  const btn = document.getElementById('logout-btn');
  const originalHTML = btn.innerHTML;
  
  btn.disabled = true;
  
  try {
    await sendMessage({ action: 'logout' });
    updateUIUnauthenticated();
    showNotification('Вы вышли из системы', 'info');
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Ошибка при выходе', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function handleRefreshData() {
  const btn = document.getElementById('refresh-data-btn');
  btn.disabled = true;
  
  try {
    await checkAuthenticationStatus();
    await loadStats();
    showNotification('Данные обновлены', 'success');
  } catch (error) {
    console.error('Refresh error:', error);
    showNotification('Ошибка обновления', 'error');
  } finally {
    btn.disabled = false;
  }
}

function updateUIAuthenticated() {
  isAuthenticated = true;
  
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('auth-status-text');
  const authContent = document.getElementById('auth-content');
  const authenticatedContent = document.getElementById('authenticated-content');
  
  statusIndicator.className = 'status-indicator authenticated';
  statusText.textContent = 'Авторизован';
  authContent.style.display = 'none';
  authenticatedContent.style.display = 'block';
  
  loadStats();
}

function updateUIUnauthenticated() {
  isAuthenticated = false;
  
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('auth-status-text');
  const authContent = document.getElementById('auth-content');
  const authenticatedContent = document.getElementById('authenticated-content');
  
  statusIndicator.className = 'status-indicator unauthenticated';
  statusText.textContent = 'Не авторизован';
  authContent.style.display = 'block';
  authenticatedContent.style.display = 'none';
}

async function loadStats() {
  try {
    const data = await chrome.storage.local.get(['analysisCount', 'lastAnalysis']);
    
    const analysisCount = data.analysisCount || 0;
    const lastAnalysis = data.lastAnalysis || null;
    
    document.getElementById('analysis-count').textContent = analysisCount;
    
    if (lastAnalysis) {
      const date = new Date(lastAnalysis);
      const formattedDate = formatRelativeTime(date);
      document.getElementById('last-analysis').textContent = formattedDate;
      document.getElementById('stats-section').style.display = 'block';
    }
  } catch (error) {
    console.error('Load stats error:', error);
  }
}

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  
  return date.toLocaleDateString('ru-RU');
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

function showNotification(message, type = 'info') {
  console.log(`[${type.toUpperCase()}] ${message}`);
}

function showHelp() {
  const helpWindow = window.open('', 'Help', 'width=600,height=400');
  helpWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Помощь - Funpay Analyzer</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 20px;
          line-height: 1.6;
          color: #333;
        }
        h1 { color: #667eea; }
        h2 { color: #495057; margin-top: 20px; }
        ul { margin-left: 20px; }
        code {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <h1>📚 Помощь - Funpay Analyzer</h1>
      
      <h2>Как использовать расширение:</h2>
      <ul>
        <li>Откройте любую страницу товара на Funpay.com</li>
        <li>Нажмите кнопку "Анализ цен" в правом верхнем углу</li>
        <li>Просмотрите рекомендации и статистику конкурентов</li>
        <li>Скопируйте рекомендуемую цену одним кликом</li>
      </ul>
      
      <h2>Функции:</h2>
      <ul>
        <li><strong>Анализ конкурентов:</strong> автоматический сбор данных о ценах</li>
        <li><strong>Рекомендации цен:</strong> умные алгоритмы для оптимальной цены</li>
        <li><strong>Статистика:</strong> минимум, максимум, среднее, медиана</li>
        <li><strong>Стратегии:</strong> агрессивная, конкурентная, сбалансированная, премиум</li>
      </ul>
      
      <h2>Поддержка:</h2>
      <p>По вопросам и предложениям обращайтесь к разработчикам расширения.</p>
    </body>
    </html>
  `);
}
