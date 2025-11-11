import { ConnectionManager } from './connection-manager';
import { ProfileManager } from './profile-manager';
import { SplitTunneling } from '../lib/splittunnel';
import { AntiCaptcha } from '../lib/anticaptcha';

export class MessageHandler {
  constructor(
    private connectionManager: ConnectionManager,
    private profileManager: ProfileManager
  ) {}

  async handle(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (message.type) {
        case 'CONNECT':
          const connected = await this.connectionManager.connect(
            message.serverId,
            message.doubleHopServerId
          );
          sendResponse({ success: connected });
          break;

        case 'DISCONNECT':
          await this.connectionManager.disconnect();
          sendResponse({ success: true });
          break;

        case 'GET_CONNECTION':
          const connection = await this.connectionManager.getCurrentConnection();
          sendResponse({ connection });
          break;

        case 'GET_STATS':
          const stats = await this.connectionManager.getStats();
          sendResponse({ stats });
          break;

        case 'SWITCH_SERVER':
          const switched = await this.connectionManager.switchServer(message.serverId);
          sendResponse({ success: switched });
          break;

        case 'GET_PROFILE':
          const profile = await this.profileManager.getProfile();
          sendResponse({ profile });
          break;

        case 'UPDATE_PROFILE':
          await this.profileManager.updateProfile(message.updates);
          sendResponse({ success: true });
          break;

        case 'ADD_SECRET_BOOKMARK':
          await this.profileManager.addSecretBookmark(message.url, message.title);
          sendResponse({ success: true });
          break;

        case 'GET_SECRET_BOOKMARKS':
          const bookmarks = await this.profileManager.getSecretBookmarks();
          sendResponse({ bookmarks });
          break;

        case 'ADD_VPN_PROFILE':
          await this.profileManager.addVPNProfile(message.profile);
          sendResponse({ success: true });
          break;

        case 'GET_VPN_PROFILES':
          const profiles = await this.profileManager.getVPNProfiles();
          sendResponse({ profiles });
          break;

        case 'ADD_SPLIT_TUNNEL_DOMAIN':
          await SplitTunneling.addDomain(message.domain, message.mode);
          sendResponse({ success: true });
          break;

        case 'REMOVE_SPLIT_TUNNEL_DOMAIN':
          await SplitTunneling.removeDomain(message.domain);
          sendResponse({ success: true });
          break;

        case 'HANDLE_CAPTCHA':
          if (sender.tab?.id) {
            const handled = await AntiCaptcha.handleCaptcha(sender.tab.id, message.url);
            sendResponse({ success: handled });
          }
          break;

        case 'SET_PASSPORT':
          await this.profileManager.setPassport(message.passport);
          sendResponse({ success: true });
          break;

        case 'UPGRADE_TIER':
          const upgraded = await this.profileManager.upgradeTier(message.tier);
          sendResponse({ success: upgraded });
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({ error: String(error) });
    }
  }
}
