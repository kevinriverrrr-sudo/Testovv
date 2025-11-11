import { VPNServer, APIResponse, UserProfile, WireGuardConfig } from './types';
import { Storage } from './storage';

const API_BASE_URL = 'https://api.homenetvpn.com'; // Replace with actual API

export class API {
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await Storage.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  static async getServers(): Promise<VPNServer[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/servers`, {
        headers: await this.getHeaders()
      });
      const data: APIResponse<VPNServer[]> = await response.json();
      return data.success ? data.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch servers:', error);
      return this.getMockServers();
    }
  }

  static async getOptimalServer(): Promise<VPNServer | null> {
    const servers = await this.getServers();
    if (servers.length === 0) return null;
    
    // Sort by ping and load
    return servers.sort((a, b) => {
      const scoreA = a.ping + a.load * 10;
      const scoreB = b.ping + b.load * 10;
      return scoreA - scoreB;
    })[0];
  }

  static async generateWireGuardConfig(serverId: string): Promise<WireGuardConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/wireguard/config`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ serverId })
      });
      const data: APIResponse<WireGuardConfig> = await response.json();
      return data.success ? data.data || null : null;
    } catch (error) {
      console.error('Failed to generate WireGuard config:', error);
      return this.getMockWireGuardConfig();
    }
  }

  static async authenticate(email?: string, password?: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data: APIResponse<{ token: string }> = await response.json();
      if (data.success && data.data?.token) {
        await Storage.setAuthToken(data.data.token);
        return data.data.token;
      }
      return null;
    } catch (error) {
      console.error('Authentication failed:', error);
      // For MVP, generate mock token
      const mockToken = 'mock-token-' + Date.now();
      await Storage.setAuthToken(mockToken);
      return mockToken;
    }
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: await this.getHeaders()
      });
      const data: APIResponse<UserProfile> = await response.json();
      return data.success ? data.data || null : null;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return this.getMockUserProfile();
    }
  }

  static async reportStats(stats: { bytesIn: number; bytesOut: number }): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/stats`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(stats)
      });
    } catch (error) {
      console.error('Failed to report stats:', error);
    }
  }

  static async getCleanIP(serverId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/servers/${serverId}/clean-ip`, {
        headers: await this.getHeaders()
      });
      const data: APIResponse<{ ip: string }> = await response.json();
      return data.success ? data.data?.ip || null : null;
    } catch (error) {
      console.error('Failed to get clean IP:', error);
      return null;
    }
  }

  // Mock data for MVP development
  private static getMockServers(): VPNServer[] {
    return [
      {
        id: 'us-ny-01',
        name: 'New York #1',
        country: 'United States',
        countryCode: 'US',
        city: 'New York',
        ip: '104.28.15.123',
        port: 51820,
        ping: 15,
        load: 25,
        protocol: 'wireguard',
        features: ['streaming', 'p2p']
      },
      {
        id: 'de-fra-01',
        name: 'Frankfurt #1',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Frankfurt',
        ip: '185.34.12.45',
        port: 51820,
        ping: 28,
        load: 15,
        protocol: 'wireguard',
        features: ['streaming', 'low-latency']
      },
      {
        id: 'jp-tok-01',
        name: 'Tokyo #1',
        country: 'Japan',
        countryCode: 'JP',
        city: 'Tokyo',
        ip: '103.45.78.90',
        port: 51820,
        ping: 120,
        load: 40,
        protocol: 'wireguard',
        features: ['streaming', 'gaming']
      }
    ];
  }

  private static getMockWireGuardConfig(): WireGuardConfig {
    return {
      privateKey: 'cPfL8P1qX7H4nN5kZ9mQ2wR6tY8uI0oP3aS5dF7gH9j=',
      publicKey: 'nX7mZ9vB8cN3mK5lL2oP4qR6sT8uV0wY2zA4bC6dE8f=',
      address: '10.8.0.2/24',
      dns: ['1.1.1.1', '8.8.8.8'],
      serverPublicKey: 'hY7jK9pQ3wE5rT7yU9iO1pA3sD5fG7hJ9kL1zX3cV5b=',
      serverEndpoint: '104.28.15.123:51820',
      allowedIPs: ['0.0.0.0/0', '::/0']
    };
  }

  private static getMockUserProfile(): UserProfile {
    return {
      id: 'user-' + Date.now(),
      tier: 'free',
      dataLimit: 2 * 1024 * 1024 * 1024, // 2 GB
      dataUsed: 0,
      preferences: {
        theme: 'dark',
        autoConnect: false,
        killSwitch: true,
        splitTunneling: 'all-vpn',
        domains: [],
        smartDNS: true,
        antiCaptcha: true
      }
    };
  }
}
