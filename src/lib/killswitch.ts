import { Storage } from './storage';

export class KillSwitch {
  private static isActive = false;

  static async enable(): Promise<void> {
    if (this.isActive) return;

    try {
      // Enable kill switch rules
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['killswitch_rules']
      });

      this.isActive = true;
      console.log('Kill switch enabled');
    } catch (error) {
      console.error('Failed to enable kill switch:', error);
    }
  }

  static async disable(): Promise<void> {
    if (!this.isActive) return;

    try {
      // Disable kill switch rules
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['killswitch_rules']
      });

      this.isActive = false;
      console.log('Kill switch disabled');
    } catch (error) {
      console.error('Failed to disable kill switch:', error);
    }
  }

  static async onConnectionLost(): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (profile?.preferences.killSwitch) {
      await this.enable();
      
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'VPN Disconnected',
        message: 'Kill switch activated. All traffic is blocked until VPN reconnects.',
        priority: 2
      });
    }
  }

  static async onConnectionRestored(): Promise<void> {
    await this.disable();
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'VPN Reconnected',
      message: 'Kill switch deactivated. Normal traffic resumed.',
      priority: 1
    });
  }

  static isEnabled(): boolean {
    return this.isActive;
  }
}
