import { DomainRule, SplitTunnelMode } from './types';
import { Storage } from './storage';

export class SplitTunneling {
  static async updateRules(domains: DomainRule[], mode: SplitTunnelMode): Promise<void> {
    try {
      // Remove existing split tunnel rules
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const ruleIdsToRemove = existingRules
        .filter(rule => rule.id >= 10000 && rule.id < 20000)
        .map(rule => rule.id);

      if (ruleIdsToRemove.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIdsToRemove
        });
      }

      // Add new rules based on mode and domains
      const newRules: chrome.declarativeNetRequest.Rule[] = [];
      let ruleId = 10000;

      if (mode === 'custom') {
        for (const domainRule of domains) {
          newRules.push({
            id: ruleId++,
            priority: 1,
            action: {
              type: domainRule.mode === 'direct' 
                ? 'allow' 
                : 'allowAllRequests'
            } as chrome.declarativeNetRequest.RuleAction,
            condition: {
              urlFilter: `*://*.${domainRule.domain}/*`,
              resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest'] as chrome.declarativeNetRequest.ResourceType[]
            }
          });
        }
      }

      if (newRules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: newRules
        });
      }

      console.log(`Split tunneling updated: ${newRules.length} rules for mode ${mode}`);
    } catch (error) {
      console.error('Failed to update split tunnel rules:', error);
    }
  }

  static async addDomain(domain: string, mode: 'vpn' | 'direct'): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    const domains = profile.preferences.domains || [];
    
    // Remove existing rule for this domain
    const filtered = domains.filter(d => d.domain !== domain);
    
    // Add new rule
    filtered.push({ domain, mode });
    
    profile.preferences.domains = filtered;
    await Storage.setUserProfile(profile);
    
    await this.updateRules(filtered, profile.preferences.splitTunneling);
  }

  static async removeDomain(domain: string): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    const domains = profile.preferences.domains || [];
    const filtered = domains.filter(d => d.domain !== domain);
    
    profile.preferences.domains = filtered;
    await Storage.setUserProfile(profile);
    
    await this.updateRules(filtered, profile.preferences.splitTunneling);
  }

  static async shouldUseDirect(url: string): Promise<boolean> {
    try {
      const profile = await Storage.getUserProfile();
      if (!profile) return false;

      const { splitTunneling, domains } = profile.preferences;
      
      if (splitTunneling === 'all-direct') return true;
      if (splitTunneling === 'all-vpn') return false;

      // Check if URL matches any domain rule
      const hostname = new URL(url).hostname;
      
      for (const rule of domains) {
        if (hostname.includes(rule.domain)) {
          return rule.mode === 'direct';
        }
      }

      // Default based on mode
      return splitTunneling === 'all-direct';
    } catch (error) {
      console.error('Error checking split tunnel:', error);
      return false;
    }
  }

  static async getCommonBankingDomains(): Promise<string[]> {
    return [
      'chase.com',
      'bankofamerica.com',
      'wellsfargo.com',
      'citibank.com',
      'capitalone.com',
      'paypal.com',
      'venmo.com',
      'sberbank.ru',
      'tinkoff.ru',
      'alfabank.ru'
    ];
  }

  static async addBankingDomainsToBypass(): Promise<void> {
    const domains = await this.getCommonBankingDomains();
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    for (const domain of domains) {
      await this.addDomain(domain, 'direct');
    }
  }
}
