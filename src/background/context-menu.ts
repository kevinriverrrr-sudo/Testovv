import { Storage } from '../lib/storage';
import { API } from '../lib/api';

export class ContextMenuManager {
  async initialize(): Promise<void> {
    // Create context menu items
    chrome.contextMenus.create({
      id: 'add-secret-bookmark',
      title: 'Add to Secret Bookmarks',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'open-with-vpn-separator',
      type: 'separator',
      contexts: ['link']
    });

    // Get VPN profiles and create menu items
    const profiles = await Storage.getVPNProfiles();
    
    if (profiles.length > 0) {
      chrome.contextMenus.create({
        id: 'open-with-vpn',
        title: 'Open with VPN Profile',
        contexts: ['link']
      });

      for (const profile of profiles) {
        chrome.contextMenus.create({
          id: `vpn-profile-${profile.id}`,
          parentId: 'open-with-vpn',
          title: profile.name,
          contexts: ['link']
        });
      }
    }

    // Listen for context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  private async handleContextMenuClick(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab
  ): Promise<void> {
    if (info.menuItemId === 'add-secret-bookmark') {
      if (tab?.url && tab?.title) {
        chrome.runtime.sendMessage({
          type: 'ADD_SECRET_BOOKMARK',
          url: tab.url,
          title: tab.title
        });

        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Secret Bookmark Added',
          message: `${tab.title} added to secret bookmarks`,
          priority: 1
        });
      }
    } else if (info.menuItemId.toString().startsWith('vpn-profile-')) {
      const profileId = info.menuItemId.toString().replace('vpn-profile-', '');
      const profiles = await Storage.getVPNProfiles();
      const profile = profiles.find(p => p.id === profileId);

      if (profile && info.linkUrl) {
        // Connect to VPN profile
        chrome.runtime.sendMessage({
          type: 'CONNECT',
          serverId: profile.serverId,
          doubleHopServerId: profile.doubleHop
        });

        // Open link in new tab after connection
        setTimeout(() => {
          chrome.tabs.create({ url: info.linkUrl });
        }, 2000);

        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Opening with VPN',
          message: `Connecting to ${profile.name}...`,
          priority: 1
        });
      }
    }
  }

  async updateProfiles(): Promise<void> {
    // Remove old profile menu items
    const profiles = await Storage.getVPNProfiles();
    
    chrome.contextMenus.removeAll(() => {
      this.initialize();
    });
  }
}
