import { UserProfile, SecretBookmark, VPNProfile } from '../lib/types';
import { API } from '../lib/api';
import { Storage } from '../lib/storage';

export class ProfileManager {
  async initialize(): Promise<void> {
    // Check if user profile exists
    let profile = await Storage.getUserProfile();
    
    if (!profile) {
      // Authenticate (for MVP, this creates a session)
      await API.authenticate();
      
      // Fetch or create profile
      profile = await API.getUserProfile();
      
      if (profile) {
        await Storage.setUserProfile(profile);
      }
    }

    // Initialize stats if not exists
    const stats = await Storage.getStats();
    if (!stats) {
      await Storage.setStats({
        totalData: 0,
        trackersBlocked: 0,
        captchasSolved: 0,
        connectionTime: 0,
        serverSwitches: 0
      });
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    return await Storage.getUserProfile();
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    const updatedProfile = { ...profile, ...updates };
    await Storage.setUserProfile(updatedProfile);
  }

  async setPassport(passport: UserProfile['passport']): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    profile.passport = passport;
    await Storage.setUserProfile(profile);
  }

  async addSecretBookmark(url: string, title: string): Promise<void> {
    const bookmarks = await Storage.getSecretBookmarks();
    
    const bookmark: SecretBookmark = {
      id: `bookmark-${Date.now()}`,
      url,
      title,
      createdAt: Date.now()
    };

    bookmarks.push(bookmark);
    await Storage.setSecretBookmarks(bookmarks);
  }

  async removeSecretBookmark(id: string): Promise<void> {
    const bookmarks = await Storage.getSecretBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    await Storage.setSecretBookmarks(filtered);
  }

  async getSecretBookmarks(): Promise<SecretBookmark[]> {
    return await Storage.getSecretBookmarks();
  }

  async addVPNProfile(profile: VPNProfile): Promise<void> {
    const profiles = await Storage.getVPNProfiles();
    profiles.push(profile);
    await Storage.setVPNProfiles(profiles);
  }

  async removeVPNProfile(id: string): Promise<void> {
    const profiles = await Storage.getVPNProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    await Storage.setVPNProfiles(filtered);
  }

  async getVPNProfiles(): Promise<VPNProfile[]> {
    return await Storage.getVPNProfiles();
  }

  async upgradeTier(tier: 'premium' | 'lifetime'): Promise<boolean> {
    const profile = await Storage.getUserProfile();
    if (!profile) return false;

    profile.tier = tier;
    if (tier === 'premium' || tier === 'lifetime') {
      profile.dataLimit = -1; // Unlimited
    }

    await Storage.setUserProfile(profile);
    return true;
  }

  async checkDataLimit(): Promise<boolean> {
    const profile = await Storage.getUserProfile();
    if (!profile) return false;

    if (profile.dataLimit === -1) return true; // Unlimited

    return profile.dataUsed < profile.dataLimit;
  }

  async updateDataUsage(bytes: number): Promise<void> {
    const profile = await Storage.getUserProfile();
    if (!profile) return;

    profile.dataUsed += bytes;
    await Storage.setUserProfile(profile);
  }
}
