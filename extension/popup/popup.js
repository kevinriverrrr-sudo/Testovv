let passwordVisible = false;
let lastPasswordValue = '';

document.addEventListener('DOMContentLoaded', () => {
  loadLastData();
  
  document.getElementById('fillFormBtn').addEventListener('click', fillForm);
  document.getElementById('togglePassword').addEventListener('click', togglePasswordVisibility);
});

function loadLastData() {
  chrome.storage.local.get(['lastFilledData'], (result) => {
    if (result.lastFilledData) {
      displayLastData(result.lastFilledData);
    }
  });
}

function displayLastData(data) {
  const section = document.getElementById('lastDataSection');
  section.classList.remove('hidden');
  
  document.getElementById('lastName').textContent = data.name || 'N/A';
  document.getElementById('lastEmail').textContent = data.email || 'N/A';
  
  lastPasswordValue = data.password || '';
  document.getElementById('lastPassword').textContent = '••••••••';
  
  if (data.timestamp) {
    const date = new Date(data.timestamp);
    document.getElementById('lastTime').textContent = date.toLocaleString();
  }
}

function togglePasswordVisibility() {
  passwordVisible = !passwordVisible;
  const passwordElement = document.getElementById('lastPassword');
  const toggleButton = document.getElementById('togglePassword');
  
  if (passwordVisible) {
    passwordElement.textContent = lastPasswordValue;
    passwordElement.classList.remove('password-hidden');
    toggleButton.textContent = '🙈';
  } else {
    passwordElement.textContent = '••••••••';
    passwordElement.classList.add('password-hidden');
    toggleButton.textContent = '👁️';
  }
}

async function fillForm() {
  const button = document.getElementById('fillFormBtn');
  const statusDiv = document.getElementById('status');
  
  button.disabled = true;
  button.querySelector('.button-text').textContent = 'Filling...';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('panel.rogen.wtf/auth/register')) {
      showStatus('Please navigate to panel.rogen.wtf/auth/register first', 'error');
      button.disabled = false;
      button.querySelector('.button-text').textContent = 'Auto-fill Form';
      return;
    }
    
    chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
        button.disabled = false;
        button.querySelector('.button-text').textContent = 'Auto-fill Form';
        return;
      }
      
      if (response && response.success) {
        showStatus('Form filled successfully!', 'success');
        if (response.data) {
          displayLastData(response.data);
        }
      } else {
        showStatus('Failed to fill form', 'error');
      }
      
      button.disabled = false;
      button.querySelector('.button-text').textContent = 'Auto-fill Form';
    });
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
    button.disabled = false;
    button.querySelector('.button-text').textContent = 'Auto-fill Form';
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
  
  if (type === 'error') {
    statusDiv.classList.add('shake');
    setTimeout(() => {
      statusDiv.classList.remove('shake');
    }, 300);
  }
  
  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 4000);
}
