import { ConnectionManager } from './connection-manager';
import { ProfileManager } from './profile-manager';
import { MessageHandler } from './message-handler';
import { ContextMenuManager } from './context-menu';
import { Storage } from '../lib/storage';

class BackgroundService {
  private connectionManager: ConnectionManager;
  private profileManager: ProfileManager;
  private messageHandler: MessageHandler;
  private contextMenuManager: ContextMenuManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
    this.profileManager = new ProfileManager();
    this.messageHandler = new MessageHandler(this.connectionManager, this.profileManager);
    this.contextMenuManager = new ContextMenuManager();
  }

  async initialize(): Promise<void> {
    console.log('VPN Extension initialized');

    // Initialize managers
    await this.profileManager.initialize();
    await this.contextMenuManager.initialize();

    // Check if onboarding is complete
    const onboardingComplete = await Storage.isOnboardingComplete();
    
    if (onboardingComplete) {
      // Auto-connect if enabled
      const profile = await Storage.getUserProfile();
      if (profile?.preferences.autoConnect) {
        await this.connectionManager.autoConnect();
      }
    }

    // Set up listeners
    this.setupListeners();
  }

  private setupListeners(): void {
    // Listen for messages from popup/content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.messageHandler.handle(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Monitor network requests for captchas
    chrome.webRequest.onCompleted.addListener(
      (details) => this.handleWebRequest(details),
      { urls: ['<all_urls>'] },
      ['responseHeaders']
    );

    // Handle connection drops
    chrome.alarms.create('connectionCheck', { periodInMinutes: 1 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'connectionCheck') {
        this.connectionManager.checkConnection();
      }
    });

    // Handle installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        chrome.tabs.create({ url: 'options.html?onboarding=true' });
      }
    });

    // Update badge on connection changes
    chrome.storage.local.onChanged.addListener((changes) => {
      if (changes.vpnConnection) {
        this.updateBadge(changes.vpnConnection.newValue);
      }
    });
  }

  private async handleWebRequest(details: chrome.webRequest.WebResponseCacheDetails): Promise<void> {
    // Check for captcha indicators
    const headers = details.responseHeaders || [];
    const hasCaptcha = headers.some(h => 
      h.name.toLowerCase() === 'cf-mitigated' || 
      (h.name.toLowerCase() === 'server' && h.value?.includes('cloudflare'))
    );

    if (hasCaptcha && details.statusCode === 403) {
      // Notify content script
      if (details.tabId && details.tabId > 0) {
        chrome.tabs.sendMessage(details.tabId, {
          type: 'CAPTCHA_DETECTED',
          url: details.url
        }).catch(() => {
          // Tab might not have content script
        });
      }
    }
  }

  private updateBadge(connection: any): void {
    if (connection?.connected) {
      chrome.action.setBadgeBackgroundColor({ color: '#00ff00' });
      chrome.action.setBadgeText({ text: '●' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();
backgroundService.initialize();
