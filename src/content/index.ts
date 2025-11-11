// Content script for VPN extension
// Handles page-level operations like captcha detection, WebRTC blocking, etc.

class ContentScript {
  constructor() {
    this.init();
  }

  private init(): void {
    this.blockWebRTCLeaks();
    this.overrideGeolocation();
    this.overrideTimezone();
    this.detectCaptcha();
    this.listenForMessages();
  }

  private blockWebRTCLeaks(): void {
    // Override RTCPeerConnection to prevent IP leaks
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        const originalRTCPeerConnection = window.RTCPeerConnection;
        window.RTCPeerConnection = function(...args) {
          const pc = new originalRTCPeerConnection(...args);
          
          // Block local IP candidates
          const originalAddIceCandidate = pc.addIceCandidate;
          pc.addIceCandidate = function(candidate) {
            if (candidate && candidate.candidate) {
              const candidateStr = candidate.candidate;
              // Block local and private IPs
              if (candidateStr.includes('.local') || 
                  candidateStr.match(/192\\.168/) ||
                  candidateStr.match(/10\\./) ||
                  candidateStr.match(/172\\.(1[6-9]|2[0-9]|3[0-1])/)) {
                console.log('Blocked WebRTC leak:', candidateStr);
                return Promise.resolve();
              }
            }
            return originalAddIceCandidate.apply(this, arguments);
          };
          
          return pc;
        };
      })();
    `;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  }

  private overrideGeolocation(): void {
    // Override geolocation API
    chrome.storage.local.get('vpnConnection', (result) => {
      if (result.vpnConnection?.connected) {
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            const originalGeolocation = navigator.geolocation;
            navigator.geolocation.getCurrentPosition = function(success, error) {
              // Return VPN server location
              success({
                coords: {
                  latitude: 40.7128,
                  longitude: -74.0060,
                  accuracy: 100
                },
                timestamp: Date.now()
              });
            };
          })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
      }
    });
  }

  private overrideTimezone(): void {
    // Override timezone based on VPN location
    chrome.storage.sync.get('userProfile', (result) => {
      if (result.userProfile?.passport?.timezone) {
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            const originalDateTimeFormat = Intl.DateTimeFormat;
            Intl.DateTimeFormat = function(...args) {
              if (args.length === 0 || !args[0]) {
                args[0] = '${result.userProfile.passport.timezone}';
              }
              return new originalDateTimeFormat(...args);
            };
          })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
      }
    });
  }

  private detectCaptcha(): void {
    // Look for common captcha elements
    const checkForCaptcha = () => {
      const captchaSelectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        '[class*="captcha"]',
        '[id*="captcha"]',
        '.cf-challenge-running'
      ];

      for (const selector of captchaSelectors) {
        if (document.querySelector(selector)) {
          console.log('Captcha detected:', selector);
          
          // Notify background script
          chrome.runtime.sendMessage({
            type: 'HANDLE_CAPTCHA',
            url: window.location.href
          });
          
          break;
        }
      }
    };

    // Check immediately and on DOM changes
    checkForCaptcha();
    
    const observer = new MutationObserver(checkForCaptcha);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private listenForMessages(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'CAPTCHA_DETECTED':
          this.showCaptchaNotification();
          break;
        
        case 'UPDATE_GEOLOCATION':
          this.overrideGeolocation();
          break;
      }
    });
  }

  private showCaptchaNotification(): void {
    // Show in-page notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <strong>🛡️ VPN Protection</strong><br>
      Captcha detected. Switching to cleaner IP...
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize content script
new ContentScript();
