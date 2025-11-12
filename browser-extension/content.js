(() => {
    console.log('Auto-fill Registration Extension loaded');

    window.addEventListener('message', (event) => {
        if (event.source !== window) return;
        
        if (event.data.type && event.data.type === 'AUTO_FILL_REGISTRATION') {
            console.log('Received auto-fill message');
        }
    });

    const observer = new MutationObserver((mutations) => {
        const nameField = document.querySelector('input[name="name"], input[id="name"]');
        const emailField = document.querySelector('input[name="email"], input[id="email"], input[type="email"]');
        const passwordField = document.querySelector('input[name="password"], input[id="password"], input[type="password"]');
        
        if (nameField && emailField && passwordField) {
            console.log('All form fields detected');
            observer.disconnect();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    } else {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
