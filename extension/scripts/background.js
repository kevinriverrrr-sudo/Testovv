chrome.runtime.onInstalled.addListener(() => {
  console.log('Auto Register Form Filler extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateData') {
    const data = {
      name: generateRandomName(),
      email: generateRandomEmail(),
      password: generateRandomPassword(),
      timestamp: new Date().toISOString()
    };
    
    chrome.storage.local.set({ lastGeneratedData: data }, () => {
      sendResponse({ success: true, data: data });
    });
    
    return true;
  }
  
  if (request.action === 'getLastData') {
    chrome.storage.local.get(['lastFilledData'], (result) => {
      sendResponse({ success: true, data: result.lastFilledData || null });
    });
    
    return true;
  }
});

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
