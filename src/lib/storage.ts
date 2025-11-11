import { UserProfile, VPNConnection, ConnectionStats, SecretBookmark, VPNProfile, WireGuardConfig } from './types';

export class Storage {
  // Session storage for sensitive data
  static async setWireGuardConfig(config: WireGuardConfig): Promise<void> {
    await chrome.storage.session.set({ wireGuardConfig: config });
  }

  static async getWireGuardConfig(): Promise<WireGuardConfig | null> {
    const result = await chrome.storage.session.get('wireGuardConfig');
    return result.wireGuardConfig || null;
  }

  static async clearWireGuardConfig(): Promise<void> {
    await chrome.storage.session.remove('wireGuardConfig');
  }

  // Sync storage for user preferences
  static async setUserProfile(profile: UserProfile): Promise<void> {
    await chrome.storage.sync.set({ userProfile: profile });
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    const result = await chrome.storage.sync.get('userProfile');
    return result.userProfile || null;
  }

  // Local storage for connection data
  static async setConnection(connection: VPNConnection): Promise<void> {
    await chrome.storage.local.set({ vpnConnection: connection });
  }

  static async getConnection(): Promise<VPNConnection | null> {
    const result = await chrome.storage.local.get('vpnConnection');
    return result.vpnConnection || null;
  }

  static async setStats(stats: ConnectionStats): Promise<void> {
    await chrome.storage.local.set({ connectionStats: stats });
  }

  static async getStats(): Promise<ConnectionStats | null> {
    const result = await chrome.storage.local.get('connectionStats');
    return result.connectionStats || null;
  }

  static async setSecretBookmarks(bookmarks: SecretBookmark[]): Promise<void> {
    await chrome.storage.local.set({ secretBookmarks: bookmarks });
  }

  static async getSecretBookmarks(): Promise<SecretBookmark[]> {
    const result = await chrome.storage.local.get('secretBookmarks');
    return result.secretBookmarks || [];
  }

  static async setVPNProfiles(profiles: VPNProfile[]): Promise<void> {
    await chrome.storage.sync.set({ vpnProfiles: profiles });
  }

  static async getVPNProfiles(): Promise<VPNProfile[]> {
    const result = await chrome.storage.sync.get('vpnProfiles');
    return result.vpnProfiles || [];
  }

  static async setOnboardingComplete(complete: boolean): Promise<void> {
    await chrome.storage.local.set({ onboardingComplete: complete });
  }

  static async isOnboardingComplete(): Promise<boolean> {
    const result = await chrome.storage.local.get('onboardingComplete');
    return result.onboardingComplete || false;
  }

  static async setAuthToken(token: string): Promise<void> {
    await chrome.storage.session.set({ authToken: token });
  }

  static async getAuthToken(): Promise<string | null> {
    const result = await chrome.storage.session.get('authToken');
    return result.authToken || null;
  }

  static async clear(): Promise<void> {
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
    await chrome.storage.sync.clear();
  }
}
