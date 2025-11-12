const DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'protonmail.com',
  'mail.com',
  'icloud.com',
  'zoho.com'
];

function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomName() {
  const length = Math.floor(Math.random() * 11) + 5;
  const name = generateRandomString(length);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateRandomEmail() {
  const randomString = generateRandomString(Math.floor(Math.random() * 6) + 8);
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  return `${randomString}@${domain}`;
}

function generateRandomPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = lowercase + uppercase + numbers + special;
  
  let password = '';
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  const remainingLength = Math.floor(Math.random() * 5) + 8;
  for (let i = password.length; i < remainingLength; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function findFormFields() {
  const fields = {
    name: null,
    email: null,
    password: null
  };
  
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    const type = input.type ? input.type.toLowerCase() : '';
    const name = input.name ? input.name.toLowerCase() : '';
    const id = input.id ? input.id.toLowerCase() : '';
    const placeholder = input.placeholder ? input.placeholder.toLowerCase() : '';
    
    if (!fields.name && (name.includes('name') || id.includes('name') || placeholder.includes('name')) && type !== 'email' && type !== 'password') {
      fields.name = input;
    }
    
    if (!fields.email && (type === 'email' || name.includes('email') || id.includes('email') || placeholder.includes('email'))) {
      fields.email = input;
    }
    
    if (!fields.password && (type === 'password' || name.includes('password') || id.includes('password'))) {
      fields.password = input;
    }
  });
  
  return fields;
}

function fillForm() {
  const fields = findFormFields();
  
  if (!fields.name && !fields.email && !fields.password) {
    showNotification('Error: Could not find form fields', 'error');
    return null;
  }
  
  const data = {
    name: generateRandomName(),
    email: generateRandomEmail(),
    password: generateRandomPassword(),
    timestamp: new Date().toISOString()
  };
  
  if (fields.name) {
    fields.name.value = data.name;
    fields.name.dispatchEvent(new Event('input', { bubbles: true }));
    fields.name.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (fields.email) {
    fields.email.value = data.email;
    fields.email.dispatchEvent(new Event('input', { bubbles: true }));
    fields.email.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  if (fields.password) {
    fields.password.value = data.password;
    fields.password.dispatchEvent(new Event('input', { bubbles: true }));
    fields.password.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  chrome.storage.local.set({ lastFilledData: data }, () => {
    console.log('Data saved to storage');
  });
  
  showNotification('Form filled successfully!', 'success');
  
  return data;
}

function showNotification(message, type = 'success') {
  const existingNotification = document.getElementById('auto-register-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.id = 'auto-register-notification';
  notification.className = `auto-register-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

function injectButton() {
  if (document.getElementById('auto-register-button')) {
    return;
  }
  
  const fields = findFormFields();
  let targetElement = null;
  
  if (fields.name) {
    targetElement = fields.name.closest('form') || fields.name.parentElement;
  } else if (fields.email) {
    targetElement = fields.email.closest('form') || fields.email.parentElement;
  } else if (fields.password) {
    targetElement = fields.password.closest('form') || fields.password.parentElement;
  }
  
  if (!targetElement) {
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      targetElement = forms[0];
    } else {
      targetElement = document.body;
    }
  }
  
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'auto-register-button-container';
  buttonContainer.className = 'auto-register-button-container';
  
  const button = document.createElement('button');
  button.id = 'auto-register-button';
  button.className = 'auto-register-button';
  button.type = 'button';
  button.textContent = '✨ Auto Register';
  
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fillForm();
  });
  
  buttonContainer.appendChild(button);
  
  if (targetElement.tagName === 'FORM') {
    targetElement.insertBefore(buttonContainer, targetElement.firstChild);
  } else {
    targetElement.appendChild(buttonContainer);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectButton, 500);
  });
} else {
  setTimeout(injectButton, 500);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    const result = fillForm();
    sendResponse({ success: true, data: result });
  }
  return true;
});
