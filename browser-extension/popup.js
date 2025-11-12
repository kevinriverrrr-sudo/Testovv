document.addEventListener('DOMContentLoaded', () => {
    const autofillBtn = document.getElementById('autofillBtn');
    const notification = document.getElementById('notification');
    const lastNameEl = document.getElementById('lastName');
    const lastEmailEl = document.getElementById('lastEmail');
    const lastPasswordEl = document.getElementById('lastPassword');

    loadLastValues();

    autofillBtn.addEventListener('click', async () => {
        try {
            autofillBtn.disabled = true;
            autofillBtn.textContent = 'Processing...';

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('panel.rogen.wtf/auth/register')) {
                showNotification('Please navigate to panel.rogen.wtf/auth/register', 'error');
                return;
            }

            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: fillFormWithRandomData
            });

            if (result && result[0] && result[0].result) {
                const data = result[0].result;
                if (data.success) {
                    await saveLastValues(data);
                    updateLastValuesDisplay(data);
                    showNotification('Form filled successfully!', 'success');
                } else {
                    showNotification(data.error || 'Failed to fill form', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error: ' + error.message, 'error');
        } finally {
            autofillBtn.disabled = false;
            autofillBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                Auto-fill
            `;
        }
    });

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    }

    async function saveLastValues(data) {
        await chrome.storage.local.set({
            lastValues: {
                name: data.name,
                email: data.email,
                password: data.password,
                timestamp: new Date().toISOString()
            }
        });
    }

    async function loadLastValues() {
        const result = await chrome.storage.local.get('lastValues');
        if (result.lastValues) {
            updateLastValuesDisplay(result.lastValues);
        }
    }

    function updateLastValuesDisplay(data) {
        lastNameEl.textContent = data.name || '-';
        lastEmailEl.textContent = data.email || '-';
        lastPasswordEl.textContent = data.password || '-';
    }
});

function fillFormWithRandomData() {
    try {
        function generateRandomName() {
            const firstNames = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Jessica', 'Daniel', 'Ashley', 
                              'James', 'Emily', 'Robert', 'Lisa', 'William', 'Jennifer', 'Richard', 'Amanda'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 
                             'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee'];
            
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;
            
            const minLength = 5;
            const maxLength = 15;
            if (fullName.length < minLength || fullName.length > maxLength) {
                return firstName;
            }
            return fullName;
        }

        function generateRandomEmail() {
            const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'proton.me', 
                           'icloud.com', 'mail.com', 'zoho.com', 'aol.com', 'inbox.com'];
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let username = '';
            const length = Math.floor(Math.random() * 8) + 6;
            
            for (let i = 0; i < length; i++) {
                username += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            const domain = domains[Math.floor(Math.random() * domains.length)];
            return `${username}@${domain}`;
        }

        function generateRandomPassword() {
            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const allChars = lowercase + uppercase + numbers + special;
            
            const length = Math.floor(Math.random() * 8) + 12;
            let password = '';
            
            password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
            password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
            password += numbers.charAt(Math.floor(Math.random() * numbers.length));
            password += special.charAt(Math.floor(Math.random() * special.length));
            
            for (let i = password.length; i < length; i++) {
                password += allChars.charAt(Math.floor(Math.random() * allChars.length));
            }
            
            return password.split('').sort(() => Math.random() - 0.5).join('');
        }

        const nameField = document.querySelector('input[name="name"], input[id="name"], input[type="text"]');
        const emailField = document.querySelector('input[name="email"], input[id="email"], input[type="email"]');
        const passwordField = document.querySelector('input[name="password"], input[id="password"], input[type="password"]');

        if (!nameField || !emailField || !passwordField) {
            return {
                success: false,
                error: 'Could not find all form fields. Please ensure you are on the registration page.'
            };
        }

        const name = generateRandomName();
        const email = generateRandomEmail();
        const password = generateRandomPassword();

        const setNativeValue = (element, value) => {
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
            if (valueSetter) {
                valueSetter.call(element, value);
            } else {
                element.value = value;
            }
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setNativeValue(nameField, name);
        setNativeValue(emailField, email);
        setNativeValue(passwordField, password);

        return {
            success: true,
            name: name,
            email: email,
            password: password
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
