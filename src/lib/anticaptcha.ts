import { API } from './api';

export class AntiCaptcha {
  private static captchaDetected = false;
  private static retryCount = 0;
  private static maxRetries = 3;

  static async detectCaptcha(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const cfRay = response.headers.get('cf-ray');
      const cfCaptcha = response.headers.get('cf-mitigated');
      
      // Detect Cloudflare captcha
      if (cfCaptcha || response.status === 403) {
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  static async handleCaptcha(tabId: number, url: string): Promise<boolean> {
    if (this.retryCount >= this.maxRetries) {
      this.retryCount = 0;
      return false;
    }

    this.retryCount++;
    this.captchaDetected = true;

    try {
      // Get a clean IP from server pool
      const connection = await chrome.storage.local.get('vpnConnection');
      const currentServer = connection.vpnConnection?.server;
      
      if (!currentServer) return false;

      const cleanIP = await API.getCleanIP(currentServer.id);
      
      if (cleanIP) {
        // Rotate to clean IP
        console.log(`Rotating to clean IP: ${cleanIP}`);
        
        // Reload the page after IP rotation
        await chrome.tabs.reload(tabId);
        
        // Show notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Captcha Detected',
          message: 'Automatically switching to a cleaner IP...',
          priority: 1
        });
        
        return true;
      }
    } catch (error) {
      console.error('Failed to handle captcha:', error);
    }

    return false;
  }

  static resetRetryCount(): void {
    this.retryCount = 0;
  }

  static isCaptchaDetected(): boolean {
    return this.captchaDetected;
  }
}
