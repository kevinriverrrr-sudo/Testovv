document.addEventListener('DOMContentLoaded', loadOptions);

document.getElementById('save-btn')?.addEventListener('click', saveOptions);
document.getElementById('reset-btn')?.addEventListener('click', resetOptions);

async function loadOptions() {
  const options = await chrome.storage.local.get([
    'autoUpdate',
    'updateInterval',
    'autoAdjustPrices',
    'priceStrategy',
    'notifications',
    'priceNotifications',
    'backendUrl',
  ]);

  document.getElementById('auto-update').checked = options.autoUpdate !== false;
  document.getElementById('update-interval').value = options.updateInterval || 15;
  document.getElementById('auto-adjust').checked = options.autoAdjustPrices || false;
  document.getElementById('price-strategy').value = options.priceStrategy || 'competitive';
  document.getElementById('notifications').checked = options.notifications !== false;
  document.getElementById('price-notifications').checked = options.priceNotifications !== false;
  document.getElementById('backend-url').value = options.backendUrl || 'http://localhost:3000/api';
}

async function saveOptions() {
  const options = {
    autoUpdate: document.getElementById('auto-update').checked,
    updateInterval: parseInt(document.getElementById('update-interval').value),
    autoAdjustPrices: document.getElementById('auto-adjust').checked,
    priceStrategy: document.getElementById('price-strategy').value,
    notifications: document.getElementById('notifications').checked,
    priceNotifications: document.getElementById('price-notifications').checked,
    backendUrl: document.getElementById('backend-url').value,
  };

  await chrome.storage.local.set(options);
  
  showStatus('Настройки сохранены', 'success');
  
  await chrome.runtime.sendMessage({ action: 'optionsUpdated', options });
}

async function resetOptions() {
  if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
    const defaults = {
      autoUpdate: true,
      updateInterval: 15,
      autoAdjustPrices: false,
      priceStrategy: 'competitive',
      notifications: true,
      priceNotifications: true,
      backendUrl: 'http://localhost:3000/api',
    };

    await chrome.storage.local.set(defaults);
    loadOptions();
    showStatus('Настройки сброшены', 'info');
  }
}

function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status status-${type} show`;
  
  setTimeout(() => {
    status.classList.remove('show');
  }, 3000);
}
